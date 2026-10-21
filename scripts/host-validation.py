#!/usr/bin/env python3
"""Shared local validation reservation v1 (POSIX, Python stdlib only).

Vendored contract: Woodhouse owns this public-safe implementation. All projects
use the same per-user host directory. Kernel locks, never heartbeat age or PID
alone, establish ownership. Keep diagnostics local; admission remains project-owned.
"""
import argparse
import ctypes
import fcntl
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import time
import uuid
from contextlib import contextmanager


def processes():
    text = subprocess.check_output(["ps", "-axo", "pid,ppid,lstart,stat,comm"], text=True, timeout=5)
    result = {}
    for line in text.splitlines()[1:]:
        fields = line.split(None, 8)
        if len(fields) < 9:
            raise RuntimeError("Cannot establish process ownership")
        if "Z" not in fields[7]:
            result[int(fields[0])] = {"pid": int(fields[0]), "parent": int(fields[1]), "start": " ".join(fields[2:7]), "executable": fields[8]}
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


def unattributed(live, baseline):
    unknown = []
    for record in live.values():
        if record["parent"] != 1 or same(record, baseline):
            continue
        executable = record["executable"]
        if sys.platform == "darwin" and not executable.startswith("/"):
            # ps sometimes returns only a daemon basename. Resolve through
            # libproc instead of exempting an executable by its name.
            library = ctypes.CDLL("/usr/lib/libproc.dylib")
            buffer = ctypes.create_string_buffer(4096)
            if library.proc_pidpath(record["pid"], buffer, len(buffer)) <= 0:
                # Exit during sampling is harmless; a still-live unresolved
                # identity remains unknown and cannot bypass quarantine.
                if not same(record, processes()):
                    continue
            else:
                executable = buffer.value.decode()
        if not executable.startswith(("/System/Library/", "/usr/libexec/")):
            unknown.append({**record, "executable": executable})
    return unknown


def run():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True)
    parser.add_argument("--operation", required=True)
    parser.add_argument("--wait-seconds", type=float, default=3600)
    parser.add_argument("--state-dir", type=Path, default=Path.home() / ".local/state/loftwah/validation-v1")
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    command = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not command or not 0 <= args.wait_seconds <= 86400:
        parser.error("supply a command after -- and a bounded wait (0..86400 seconds)")
    os.umask(0o077)
    root = args.state_dir
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    if root.is_symlink() or root.stat().st_uid != os.getuid() or root.stat().st_mode & 0o077:
        raise RuntimeError("Reservation state must be a private, owned directory")
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
    started = time.monotonic()
    generation = uuid.uuid4().hex
    metadata = {"generation": generation, "version": 1, "project": args.project, "operation": args.operation,
                "owner": processes()[os.getpid()], "cwd": str(Path.cwd()),
                "source": subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip(),
                "created": time.time(), "heartbeat": time.time(), "children": []}

    def completed(record):
        identifier = record.get("generation", "")
        if len(identifier) != 32 or any(c not in "0123456789abcdef" for c in identifier):
            raise RuntimeError("Invalid reservation generation")
        completion = root / ("complete-" + identifier + ".json")
        if not completion.exists():
            return False
        return json.loads(completion.read_text()) == {"version": 1, "generation": identifier, "cleanup": "complete"}

    def observe():
        live = processes()
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
                        old_unknown = []
                        if old and old["state"] == "running":
                            baseline = json.loads((root / ("baseline-" + old["generation"] + ".json")).read_text())
                            if not isinstance(baseline, list) or any(not isinstance(r.get("pid"), int) or not isinstance(r.get("start"), str) for r in baseline):
                                raise RuntimeError("Invalid crash-recovery process baseline")
                            old_unknown = unattributed(live, {r["pid"]: r for r in baseline})
                        if old and (old["state"] == "uncertain" or remaining or old_unknown or (old["state"] != "starting" and not completed(old))):
                            reason = "previous cleanup unresolved"
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
                                          "LOFTWAH_VALIDATION_GENERATION": generation})
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
        code = child.poll()
        return 130 if cancelled else code
    finally:
        if acquired:
            try:
                remaining = observe()
                deadline = time.monotonic() + 12
                while remaining:
                    for pid, record in remaining.items():
                        # Refresh identity immediately before each signal; never use
                        # names, stale PIDs, or an unrelated process group.
                        if same(record, processes()):
                            try:
                                os.kill(pid, signal.SIGKILL if time.monotonic() >= deadline else signal.SIGTERM)
                            except ProcessLookupError:
                                pass
                    if time.monotonic() > deadline + 5:
                        raise RuntimeError("Owned descendants did not exit; capacity quarantined")
                    time.sleep(0.1)
                    remaining = observe()
                if child:
                    child.wait(timeout=5)
                if permitted:
                    # An unknown new orphan can be a descendant that detached
                    # between ancestry samples. Never infer its ownership or kill
                    # it. Refuse handover even if a command acknowledged early.
                    unknown = unattributed(processes(), admission_processes)
                    if unknown:
                        metadata["unattributed"] = unknown
                        raise RuntimeError("New unattributed orphan process during workload; capacity quarantined")
                if permitted and not completed(metadata):
                    journal("uncertain")
                    raise RuntimeError("No workload cleanup acknowledgement; capacity quarantined")
                journal("released" if permitted else "starting")
                print(f"CAPACITY RELEASED {args.project}; owned cleanup complete; elapsed {time.monotonic()-started:.2f}s", flush=True)
            except BaseException:
                journal("uncertain")
                raise
        if acquired and completed(metadata):
            # Keep the active generation's completion for crash recovery. Older
            # generations can only be retired while holding the capacity lock.
            for pattern in ("complete-*.json", "baseline-*.json"):
                for previous in root.glob(pattern):
                    if previous.name not in ("complete-" + generation + ".json", "baseline-" + generation + ".json"):
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
