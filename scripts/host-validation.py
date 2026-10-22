#!/usr/bin/env python3
"""Shared local validation reservation v1 (POSIX, Python stdlib only).

Vendored contract: Woodhouse owns this public-safe implementation. All projects
use the same per-user host directory. Kernel locks, never heartbeat age or PID
alone, establish ownership. Keep diagnostics local; admission remains project-owned.
"""
import argparse
import fcntl
import json
import os
import re
from pathlib import Path
import signal
import subprocess
import sys
import time
import uuid
from contextlib import contextmanager


def processes():
    text = subprocess.check_output(["ps", "-axo", "pid,ppid,lstart,stat,uid,comm"], text=True, timeout=5)
    result = {}
    for line in text.splitlines()[1:]:
        fields = line.split(None, 9)
        if len(fields) < 10:
            raise RuntimeError("Cannot establish process ownership")
        if "Z" not in fields[7]:
            result[int(fields[0])] = {"pid": int(fields[0]), "parent": int(fields[1]), "start": " ".join(fields[2:7]), "uid": int(fields[8]), "executable": fields[9]}
    return result


def same(record, live):
    return live.get(record["pid"], {}).get("start") == record["start"]


def locked(file):
    try:
        fcntl.flock(file, fcntl.LOCK_EX | fcntl.LOCK_NB)
        return False
    except BlockingIOError:
        return True


def write_json(path, value):
    temporary = path.with_name(path.name + "." + uuid.uuid4().hex)
    temporary.write_text(json.dumps(value) + "\n")
    temporary.replace(path)


@contextmanager
def queue_mutex(root):
    with (root / "queue.lock").open("a+") as mutex:
        fcntl.flock(mutex, fcntl.LOCK_EX)
        yield


def process_markers(record):
    """Extract only the non-secret job marker. Never retain/log raw environments.

    Cooperating jobs preserve this marker in child environments. This is job
    lifetime identification, not a sandbox against hostile same-user programs.
    """
    try:
        if sys.platform.startswith("linux"):
            entries = Path(f"/proc/{record['pid']}/environ").read_bytes().split(b"\0")
            value = next((entry.split(b"=", 1)[1] for entry in entries
                          if entry.startswith(b"LOFTWAH_VALIDATION_LINEAGE=")), b"")
        else:
            result = subprocess.run(["ps", "eww", "-p", str(record["pid"]), "-o", "command="],
                                    stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, timeout=5)
            if result.returncode:
                if not same(record, processes()):
                    return set()
                raise RuntimeError("Cannot read live validation ownership marker")
            # ps output is used only in memory; arguments/other environment
            # variables must never appear in diagnostics or receipts.
            match = re.search(rb"(?:^|\s)LOFTWAH_VALIDATION_LINEAGE=([a-f0-9:]+)(?:\s|$)", result.stdout)
            value = match[1] if match else b""
        return set(value.decode().split(":")) if value else set()
    except (FileNotFoundError, ProcessLookupError):
        return set()
    except (PermissionError, subprocess.TimeoutExpired):
        if not same(record, processes()):
            return set()
        raise RuntimeError("Cannot verify live process ownership marker") from None


def marked_processes(live, baseline, generation, cache):
    marked = {}
    for pid, record in live.items():
        if record["uid"] != os.getuid() or same(record, baseline):
            continue
        identity = (pid, record["start"])
        if identity not in cache:
            cache[identity] = generation in process_markers(record)
        if cache[identity]:
            marked[pid] = record
    return marked


def private_root(directory):
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    if directory.is_symlink() or directory.stat().st_uid != os.getuid() or directory.stat().st_mode & 0o077:
        raise RuntimeError("Reservation state must be a private, owned directory")
    return directory


def recover(root):
    """Clear a quarantine only when ownership and cleanup are proved.

    A free capacity lock means no supervisor is running. The recorded children
    and the inherited lineage marker then have to agree that nothing survives;
    either one still live is ownership, not staleness.
    """
    root = private_root(root)
    with queue_mutex(root):
        lease = (root / "capacity.lock").open("a+")
        try:
            if locked(lease):
                print("RECOVERY REFUSED: a live reservation holds the slot", flush=True)
                return 75
            journal = root / "holder.json"
            if not journal.exists():
                print("RECOVERY NOT NEEDED: no reservation journal", flush=True)
                return 0
            metadata = json.loads(journal.read_text())
            generation = metadata.get("generation", "")
            if len(generation) != 32 or any(c not in "0123456789abcdef" for c in generation):
                raise RuntimeError("Invalid reservation journal; recover by inspection")
            if metadata.get("state") == "released":
                print("RECOVERY NOT NEEDED: the journal is already released", flush=True)
                return 0
            children = metadata.get("children", [])
            if not isinstance(children, list) or any(
                    not isinstance(r, dict) or not isinstance(r.get("pid"), int) or not isinstance(r.get("start"), str)
                    for r in children):
                raise RuntimeError("Invalid reservation journal; recover by inspection")
            live = processes()
            remaining = [r for r in children if same(r, live)]
            marked = marked_processes(live, {}, generation, {})
            if remaining or marked:
                print(f"RECOVERY REFUSED: {len(remaining)} recorded and {len(marked)} marked processes "
                      f"still belong to generation {generation[:8]}", flush=True)
                return 75
            write_json(root / ("complete-" + generation + ".json"),
                       {"version": 1, "generation": generation, "cleanup": "complete"})
            metadata.update(state="released", recovered=time.time())
            write_json(journal, metadata)
            print(f"RECOVERY COMPLETE: generation {generation[:8]} has no live owned work", flush=True)
            return 0
        finally:
            lease.close()


def run():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project")
    parser.add_argument("--operation")
    parser.add_argument("--recover", action="store_true",
                        help="clear a quarantine after proving no owned work survives")
    parser.add_argument("--wait-seconds", type=float, default=3600)
    parser.add_argument("--state-dir", type=Path, default=Path.home() / ".local/state/loftwah/validation-v1")
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    if args.recover:
        return recover(args.state_dir)
    command = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not args.project or not args.operation or not command or not 0 <= args.wait_seconds <= 86400:
        parser.error("supply --project, --operation, a command after -- and a bounded wait (0..86400 seconds)")
    os.umask(0o077)
    root = private_root(args.state_dir)
    cancelled = False

    def cancel(_signal, _frame):
        nonlocal cancelled
        cancelled = True

    signal.signal(signal.SIGINT, cancel)
    signal.signal(signal.SIGTERM, cancel)
    ticket = None
    lease = None
    child = None
    acquired = False
    permitted = False
    owned = {}
    admission_processes = {}
    marker_cache = {}
    result_code = 75
    started = time.monotonic()
    generation = uuid.uuid4().hex
    metadata = {"generation": generation, "version": 1, "project": args.project, "operation": args.operation,
                "ownershipPolicy": "inherited-lineage/2", "owner": processes()[os.getpid()], "cwd": str(Path.cwd()),
                "source": subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip(),
                "created": time.time(), "heartbeat": time.time(), "children": []}

    def completed(record):
        identifier = record.get("generation", "")
        if len(identifier) != 32 or any(c not in "0123456789abcdef" for c in identifier):
            raise RuntimeError("Invalid reservation generation")
        completion = root / ("complete-" + identifier + ".json")
        if not completion.exists():
            return False
        value = json.loads(completion.read_text())
        return value == {"version": 1, "generation": identifier, "cleanup": "complete"}

    def observe():
        live = processes()
        if child:
            owned.update(marked_processes(live, admission_processes, generation, marker_cache))
        seeds = {pid for pid, record in owned.items() if same(record, live)}
        if child and child.poll() is None and child.pid in live:
            seeds.add(child.pid)
            owned.setdefault(child.pid, live[child.pid])
        changed = True
        while changed:
            changed = False
            for pid, record in live.items():
                if pid not in seeds and record["parent"] in seeds:
                    seeds.add(pid)
                    owned[pid] = record
                    changed = True
        remaining = {pid: record for pid, record in owned.items() if same(record, live)}
        owned.clear(); owned.update(remaining)
        return remaining

    def outcome(state):
        value = {"version": 1, "generation": generation, "policy": "inherited-lineage/2",
                 "head": metadata["source"], "state": state, "exitCode": result_code,
                 "cleanup": state == "released", "project": args.project, "operation": args.operation}
        write_json(root / ("outcome-" + generation + ".json"), value)
        registration = root / ("register-" + generation + ".json")
        if registration.exists():
            registered = json.loads(registration.read_text())
            destination = Path(registered["evidenceDirectory"])
            if registered.get("version") != 1 or registered.get("generation") != generation or not destination.is_absolute() or not destination.is_dir() or destination.is_symlink():
                raise RuntimeError("Invalid validation evidence registration")
            write_json(destination / "reservation.json", value)

    def journal(state):
        metadata.update(heartbeat=time.time(), children=list(owned.values()), state=state)
        write_json(root / "holder.json", metadata)

    try:
        with queue_mutex(root):
            counter = root / "sequence"
            sequence = int(counter.read_text()) + 1 if counter.exists() else 1
            counter.write_text(str(sequence))
            path = root / (f"ticket-{sequence:020d}-" + uuid.uuid4().hex)
            ticket = path.open("x+")
            fcntl.flock(ticket, fcntl.LOCK_EX)
            ticket.write(json.dumps(metadata)); ticket.flush()
        last_reason = None
        while True:
            if cancelled:
                return 130
            if time.monotonic() - started > args.wait_seconds:
                print("CAPACITY WAIT EXPIRED; no workload started", flush=True)
                return 75
            with queue_mutex(root):
                first = None
                for candidate in sorted(root.glob("ticket-*")):
                    if candidate == path:
                        first = candidate
                        break
                    with candidate.open("r+") as other:
                        if locked(other):
                            first = candidate
                            break
                        candidate.unlink()  # Kernel proves every inherited owner FD is gone.
                if first and first != path:
                    holder = json.loads(first.read_text())
                    reason = f"{holder['project']} / {holder['operation']} owns earlier reservation"
                else:
                    reason = "earlier reservation"
                if first == path:
                    lease = (root / "capacity.lock").open("a+")
                    if not locked(lease):
                        old_path = root / "holder.json"
                        old = json.loads(old_path.read_text()) if old_path.exists() else None
                        if old is not None and (old.get("version") != 1 or old.get("state") not in
                            ("starting", "running", "released", "uncertain") or
                            not isinstance(old.get("children"), list) or
                            any(not isinstance(r.get("pid"), int) or not isinstance(r.get("start"), str) for r in old["children"])):
                            raise RuntimeError("Invalid reservation journal; capacity quarantined")
                        live = processes()
                        # A crashed supervisor's recorded detached children still reserve
                        # capacity. Never kill them or steal based on an expired heartbeat.
                        remaining = [r for r in (old or {}).get("children", []) if same(r, live)]
                        old_marked = {}
                        if old and old["state"] == "running":
                            baseline = json.loads((root / ("baseline-" + old["generation"] + ".json")).read_text())
                            if not isinstance(baseline, list) or any(not isinstance(r.get("pid"), int) or not isinstance(r.get("start"), str) for r in baseline):
                                raise RuntimeError("Invalid crash-recovery process baseline")
                            if old.get("ownershipPolicy") != "inherited-lineage/2":
                                raise RuntimeError("Older interrupted reservation needs verified recovery")
                            old_marked = marked_processes(live, {r["pid"]: r for r in baseline}, old["generation"], {})
                        if old and (old["state"] == "uncertain" or remaining or old_marked or (old["state"] != "starting" and not completed(old))):
                            reason = (f"previous cleanup unresolved (generation {old['generation'][:8]}: "
                                      f"{len(remaining)} recorded children live, {len(old_marked)} lineage processes live, "
                                      f"completion {'present' if completed(old) else 'missing'}); "
                                      "prove no owned work survives, then run --recover")
                        else:
                            acquired = True
                            break
                    lease.close(); lease = None
                if last_reason != reason:
                    print(f"CAPACITY WAIT {args.project}: {reason}", flush=True)
                    last_reason = reason
            time.sleep(0.2)
        if cancelled:
            return 130
        journal("starting")
        if cancelled:
            return 130
        # Both locks survive supervisor death while the direct workload lives.
        # Reentrant bypasses are intentionally unsupported: nest commands inside
        # this one reservation instead of trusting an environment variable.
        gate_read, gate_write = os.pipe()
        try:
            if cancelled:
                return 130
            admission_processes = processes()
            write_json(root / ("baseline-" + generation + ".json"), list(admission_processes.values()))
            child = subprocess.Popen([sys.executable, __file__, "--gated-child", str(gate_read), *command],
                                     pass_fds=(ticket.fileno(), lease.fileno(), gate_read),
                                     env={**os.environ, "LOFTWAH_VALIDATION_COMPLETION": str(root / ("complete-" + generation + ".json")),
                                          "LOFTWAH_VALIDATION_GENERATION": generation,
                                          "LOFTWAH_VALIDATION_LINEAGE": ":".join(filter(None, [os.environ.get("LOFTWAH_VALIDATION_LINEAGE", ""), generation]))})
            observe(); journal("running")
            if cancelled:
                return 130
            os.write(gate_write, b"1")
            permitted = True
        finally:
            os.close(gate_read); os.close(gate_write)
        print(f"CAPACITY ACQUIRED {args.project} / {args.operation}; waited {time.monotonic()-started:.2f}s", flush=True)
        while child.poll() is None and not cancelled:
            observe(); journal("running")
            time.sleep(0.2)
        result_code = 130 if cancelled else child.poll()
        return result_code
    finally:
        if acquired:
            try:
                remaining = observe()
                deadline = time.monotonic() + 12
                signalled = set()
                while remaining:
                    for pid, record in remaining.items():
                        # Refresh identity immediately before each signal; never use
                        # names, stale PIDs, or an unrelated process group.
                        if same(record, processes()):
                            if generation not in process_markers(record):
                                if not same(record, processes()):
                                    continue
                                raise RuntimeError("Owned process lost its inherited marker; cleanup quarantined")
                            which = signal.SIGKILL if time.monotonic() >= deadline else signal.SIGTERM
                            identity_signal = (pid, record["start"], which)
                            if identity_signal not in signalled:
                                try:
                                    os.kill(pid, which)
                                    signalled.add(identity_signal)
                                except ProcessLookupError:
                                    pass
                    if time.monotonic() > deadline + 5:
                        raise RuntimeError("Owned descendants did not exit; capacity quarantined")
                    time.sleep(0.1)
                    remaining = observe()
                if child:
                    child.wait(timeout=5)
                if permitted and not completed(metadata):
                    journal("uncertain")
                    raise RuntimeError("No workload cleanup acknowledgement; capacity quarantined")
                journal("released" if permitted else "starting")
                outcome("released" if permitted else "cancelled-before-start")
                print(f"CAPACITY RELEASED {args.project}; owned cleanup complete; elapsed {time.monotonic()-started:.2f}s", flush=True)
            except BaseException:
                journal("uncertain")
                outcome("failed")
                raise
        if acquired and completed(metadata):
            # Keep the active generation's completion for crash recovery. Older
            # generations can only be retired while holding the capacity lock.
            for pattern in ("complete-*.json", "baseline-*.json", "outcome-*.json", "register-*.json"):
                for previous in root.glob(pattern):
                    if generation not in previous.name:
                        previous.unlink()
        if ticket:
            # No deletion of the shared lock inode. Only this exact queue ticket.
            with queue_mutex(root):
                path.unlink(missing_ok=True)
            ticket.close()
        if lease:
            lease.close()


if __name__ == "__main__":
    if sys.argv[1:2] == ["--gated-child"]:
        gate = int(sys.argv[2])
        permit = os.read(gate, 1)
        os.close(gate)
        if permit != b"1":
            sys.exit(75)
        os.execvp(sys.argv[3], sys.argv[3:])
    sys.exit(run())
