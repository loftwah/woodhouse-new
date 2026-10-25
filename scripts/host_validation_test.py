"""Real independent-process tests for the shared POSIX reservation contract."""
import json
from pathlib import Path
import os
import signal
import subprocess
import sys
import tempfile
import time
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/host-validation.py"


class Reservation(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.state = self.root / "state"
        self.jobs = []
        self.logs = []

    def tearDown(self):
        for job in self.jobs:
            if job.poll() is None:
                job.send_signal(signal.SIGTERM)
                job.wait(timeout=20)
        for log in self.logs:
            log.close()
        self.tmp.cleanup()

    def launch(self, name, code, wait=10, cwd=None, cooperative=True):
        log = (self.root / (name + ".log")).open("w+")
        self.logs.append(log)
        if cooperative:
            code = ("import os,json,signal; from pathlib import Path; "
                    "signal.signal(signal.SIGTERM,lambda *_: (_ for _ in ()).throw(SystemExit(130))); "
                    "signal.signal(signal.SIGINT,lambda *_: (_ for _ in ()).throw(SystemExit(130)))\n"
                    "try:\n    exec(" + repr(code) + ")\nfinally:\n"
                    "    Path(os.environ['LOFTWAH_VALIDATION_COMPLETION']).write_text(json.dumps({'version':1,'generation':os.environ['LOFTWAH_VALIDATION_GENERATION'],'cleanup':'complete'}))")
        job = subprocess.Popen([sys.executable, str(SCRIPT), "--project", name, "--operation", "regression",
                                "--state-dir", str(self.state), "--wait-seconds", str(wait), "--",
                                sys.executable, "-c", code], stdout=log, stderr=log, cwd=cwd)
        self.jobs.append(job)
        return job

    def until(self, condition):
        deadline = time.monotonic() + 10
        while not condition():
            if time.monotonic() > deadline:
                self.fail("Timed out: " + "\n".join(p.read_text() for p in self.root.glob("*.log")))
            time.sleep(.03)

    def until_pid(self, path):
        """Wait for a pid that a child process has finished writing.

        `open(path, "w")` creates the file before it writes to it, so waiting on
        `path.exists()` can win the race against the write and read an empty
        string. That is invisible on an idle machine and reliably wrong on a busy
        one — which is exactly when the shared validation slot is in use.
        """
        def written():
            try:
                return int(path.read_text().strip()) > 0
            except (OSError, ValueError):
                return False
        self.until(written)
        return int(path.read_text().strip())

    def hold(self, name):
        marker = self.root / name
        job = self.launch(name, f"from pathlib import Path; import time; Path({str(marker)!r}).touch(); time.sleep(30)")
        self.until(marker.exists)
        return job

    def test_race_excludes_and_fifo_handover_from_independent_working_directories(self):
        # An exclusive file makes simultaneous execution a failing workload,
        # independent of the lease implementation's own claimed verdict.
        event = self.root / "events"
        sentinel = self.root / "exclusive"
        code = (f"import os,time; fd=os.open({str(sentinel)!r}, os.O_CREAT|os.O_EXCL|os.O_WRONLY); "
                f"open({str(event)!r},'a').write(os.getcwd()+'\\n'); time.sleep(.3); os.close(fd); os.unlink({str(sentinel)!r})")
        a = self.launch("a", code)
        self.until(lambda: sentinel.exists())
        directories = []
        for name in ["b", "c", "d"]:
            directory = self.root / name; directory.mkdir(); directories.append(directory)
            # A separate git worktree identity is not needed for mutual exclusion:
            # these are independent cwd/OS processes, using the same host inode.
            subprocess.run(["git", "init", "-q", str(directory)], check=True)
            subprocess.run(["git", "-C", str(directory), "-c", "user.name=Validation Fixture", "-c", "user.email=validation@example.invalid", "commit", "--no-gpg-sign", "--allow-empty", "-qm", "fixture"], check=True)
            self.launch(name, code, cwd=directory)
            self.until(lambda: len(list(self.state.glob("ticket-*"))) >= len(directories) + 1 or a.poll() is not None)
        for job in self.jobs:
            self.assertEqual(job.wait(timeout=15), 0)
        self.assertEqual(event.read_text().splitlines()[1:], [str(p.resolve()) for p in directories])

    def test_registered_evidence_distinguishes_inner_success_from_outer_cleanup(self):
        for name, cooperative, expected in [("clean", True, "released"), ("missing-ack", False, "failed")]:
            evidence = self.root / name; evidence.mkdir()
            code = ("import os,json; from pathlib import Path; "
                    "generation=os.environ['LOFTWAH_VALIDATION_GENERATION']; "
                    "registration=Path(os.environ['LOFTWAH_VALIDATION_COMPLETION']).with_name('register-'+generation+'.json'); "
                    f"registration.write_text(json.dumps(dict(version=1,generation=generation,evidenceDirectory={str(evidence)!r}))); "
                    f"Path({str(evidence / 'inner-passed')!r}).touch()")
            job = self.launch(name, code, cooperative=cooperative)
            self.assertEqual(job.wait(timeout=8) == 0, cooperative)
            result = json.loads((evidence / "reservation.json").read_text())
            self.assertEqual(result["state"], expected)
            self.assertEqual(result["cleanup"], cooperative)
            self.assertEqual(result["generation"], json.loads((self.state / "holder.json").read_text())["generation"])
            self.assertTrue((evidence / "inner-passed").exists())

    def test_cancelled_waiter_never_starts_and_next_waiter_hands_over(self):
        holder = self.hold("holder")
        marker = self.root / "should-not-start"
        waiter = self.launch("cancelled", f"open({str(marker)!r},'w').close()")
        self.until(lambda: len(list(self.state.glob("ticket-*"))) == 2)
        waiter.terminate(); self.assertEqual(waiter.wait(timeout=5), 130)
        self.assertFalse(marker.exists())
        holder.terminate(); self.assertEqual(holder.wait(timeout=20), 130)
        self.assertEqual(self.launch("next", "pass").wait(timeout=5), 0)

    def test_wait_expiration_cannot_start_work(self):
        self.hold("holder")
        self.assertEqual(self.launch("timeout", "raise RuntimeError('must not run')", wait=.1).wait(timeout=5), 75)

    def test_killed_waiter_is_reclaimed_by_kernel_lock_not_pid(self):
        holder = self.hold("holder")
        waiter = self.launch("dead", "raise RuntimeError('must not run')")
        self.until(lambda: len(list(self.state.glob("ticket-*"))) == 2)
        waiter.kill(); waiter.wait()
        holder.terminate(); holder.wait(timeout=20)
        self.assertEqual(self.launch("next", "pass").wait(timeout=5), 0)

    def test_supervisor_sigkill_does_not_release_live_workload(self):
        holder = self.hold("crashed")
        self.until(lambda: json.loads((self.state / "holder.json").read_text())["state"] == "running")
        metadata = json.loads((self.state / "holder.json").read_text())
        holder.kill(); holder.wait()
        self.assertEqual(self.launch("blocked", "raise RuntimeError('overlap')", wait=.2).wait(timeout=5), 75)
        # Test owns this exact child identity; cleanup does not touch other jobs.
        os.kill(metadata["children"][0]["pid"], signal.SIGTERM)
        self.assertEqual(self.launch("recovered", "pass").wait(timeout=8), 0)

    def test_detached_descendants_are_cleaned_before_handover(self):
        marker = self.root / "child"
        code = ("import subprocess,time; "
                f"p=subprocess.Popen(['{sys.executable}','-c','import time; time.sleep(30)'],start_new_session=True); "
                f"open({str(marker)!r},'w').write(str(p.pid)); time.sleep(.7); p.terminate(); p.wait()")
        job = self.launch("detached", code)
        pid = self.until_pid(marker)
        self.assertEqual(job.wait(timeout=20), 0)
        self.until(lambda: subprocess.run(["ps", "-p", str(pid)], stdout=subprocess.DEVNULL).returncode != 0)
        self.assertEqual(self.launch("next", "pass").wait(timeout=5), 0)

    def test_pid_reuse_and_unresolved_cleanup_do_not_steal_capacity(self):
        self.assertEqual(self.launch("initial", "pass").wait(timeout=5), 0)
        metadata = json.loads((self.state / "holder.json").read_text())
        metadata["children"] = [{"pid": os.getpid(), "start": "old incarnation"}]
        (self.state / "holder.json").write_text(json.dumps(metadata))
        self.assertEqual(self.launch("reuse", "pass").wait(timeout=5), 0)
        metadata = json.loads((self.state / "holder.json").read_text())
        metadata["state"] = "uncertain"
        (self.state / ("complete-" + metadata["generation"] + ".json")).unlink()
        (self.state / "holder.json").write_text(json.dumps(metadata))
        self.assertEqual(self.launch("quarantined", "raise RuntimeError('unsafe')", wait=.1).wait(timeout=5), 75)

    def test_short_detached_descendant_is_cleaned_even_after_early_acknowledgement(self):
        marker = self.root / "escaped"
        code = ("import subprocess,time; time.sleep(.05); "
                f"p=subprocess.Popen(['{sys.executable}','-c','import time; time.sleep(30)'],start_new_session=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); "
                f"open({str(marker)!r},'w').write(str(p.pid))")
        job = self.launch("escape", code)
        pid = self.until_pid(marker)
        try:
            self.assertEqual(job.wait(timeout=20), 0)
            # The inherited marker finds a detached child regardless of its
            # current parent (including Linux subreaper adoption).
            self.until(lambda: not self.alive(pid))
            self.assertEqual(self.launch("next", "pass").wait(timeout=5), 0)
        finally:
            try:
                os.kill(pid, signal.SIGTERM)
            except ProcessLookupError:
                pass

    def test_cancellation_during_starting_handshake_never_permits_work(self):
        marker = self.root / "forbidden"
        hook = ("import importlib.util,os,signal; "
                f"spec=importlib.util.spec_from_file_location('reservation',{str(SCRIPT)!r}); "
                "module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module); "
                "original=module.write_json\n"
                "def cancel_at_start(path,value):\n"
                "    original(path,value)\n"
                "    if value.get('state')=='starting': os.kill(os.getpid(),signal.SIGTERM)\n"
                "module.write_json=cancel_at_start\n"
                "raise SystemExit(module.run())")
        result = subprocess.run([sys.executable,"-c",hook,"--project","gated","--operation","cancel",
                                 "--state-dir",str(self.state),"--",sys.executable,"-c",
                                 f"open({str(marker)!r},'w').close()"],capture_output=True,text=True,timeout=10)
        self.assertEqual(result.returncode,130,result.stderr)
        self.assertFalse(marker.exists())
        self.assertEqual(self.launch("next","pass").wait(timeout=5),0)

    def test_crashed_supervisor_rechecks_persisted_baseline_after_early_ack(self):
        ready, release, escaped = [self.root / name for name in ["ready", "release", "escaped"]]
        code = ("import subprocess,time; from pathlib import Path; "
                f"Path({str(ready)!r}).touch()\n"
                f"while not Path({str(release)!r}).exists(): time.sleep(.01)\n"
                f"p=subprocess.Popen(['{sys.executable}','-c','import time; time.sleep(30)'],start_new_session=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)\n"
                f"Path({str(escaped)!r}).write_text(str(p.pid))")
        holder = self.launch("crash-early-ack", code)
        self.until(ready.exists)
        holder.kill(); holder.wait()
        release.touch()
        pid = self.until_pid(escaped)
        try:
            self.assertEqual(self.launch("must-wait", "raise RuntimeError('overlap')", wait=.3).wait(timeout=5),75)
        finally:
            try: os.kill(pid,signal.SIGTERM)
            except ProcessLookupError: pass

    def test_real_cleanup_failure_quarantines_instead_of_acknowledging(self):
        marker = self.root / "cleanup-child"
        hook = ("import importlib.util,os; "
                f"spec=importlib.util.spec_from_file_location('reservation',{str(SCRIPT)!r}); "
                "module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)\n"
                "def denied(*args): raise PermissionError('injected exact-child signal failure')\n"
                "module.os.kill=denied\n"
                "raise SystemExit(module.run())")
        log = (self.root / "cleanup.log").open("w+"); self.logs.append(log)
        job = subprocess.Popen([sys.executable,"-c",hook,"--project","cleanup","--operation","failure",
                                "--state-dir",str(self.state),"--",sys.executable,"-c",
                                f"from pathlib import Path; import time; Path({str(marker)!r}).touch(); time.sleep(30)"],stdout=log,stderr=log)
        self.jobs.append(job)
        self.until(marker.exists)
        metadata = json.loads((self.state / "holder.json").read_text())
        child = metadata["children"][0]
        try:
            job.terminate()
            self.assertNotEqual(job.wait(timeout=10),0)
            self.assertEqual(json.loads((self.state / "holder.json").read_text())["state"],"uncertain")
            os.kill(child["pid"],signal.SIGTERM)
            self.assertEqual(self.launch("after-failed-cleanup","raise RuntimeError('unsafe')",wait=.2).wait(timeout=5),75)
        finally:
            try: os.kill(child["pid"],signal.SIGTERM)
            except ProcessLookupError: pass

    def alive(self, pid):
        result = subprocess.run(["ps", "-p", str(pid), "-o", "stat="], capture_output=True, text=True)
        return result.returncode == 0 and "Z" not in result.stdout

    def test_new_unrelated_orphan_keeps_running_during_handover(self):
        holder = self.hold("holder")
        # Born after admission, same uid/executable, but outside this job's
        # inherited lineage. It must neither block release nor receive a signal.
        code = ("import subprocess; "
                f"p=subprocess.Popen(['{sys.executable}','-c','import time; time.sleep(30)'],start_new_session=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); print(p.pid)")
        pid = int(subprocess.check_output([sys.executable,"-c",code],text=True).strip())
        try:
            holder.terminate(); self.assertEqual(holder.wait(timeout=20),130)
            self.assertTrue(self.alive(pid))
            self.assertEqual(self.launch("next","pass").wait(timeout=5),0)
            self.assertTrue(self.alive(pid))
        finally:
            try: os.kill(pid,signal.SIGTERM)
            except ProcessLookupError: pass

    def test_corrupt_journal_is_not_stale_ownership(self):
        self.state.mkdir(mode=0o700)
        (self.state / "holder.json").write_text('{"version":99,"state":"released"}')
        self.assertNotEqual(self.launch("corrupt", "raise RuntimeError('unsafe')").wait(timeout=5), 0)

    def recover(self):
        return subprocess.run([sys.executable, str(SCRIPT), "--recover", "--state-dir", str(self.state)],
                              capture_output=True, text=True, timeout=30)

    def journal(self, generation, state, children):
        self.state.mkdir(mode=0o700, exist_ok=True)
        (self.state / "holder.json").write_text(json.dumps(
            {"version": 1, "generation": generation, "state": state, "children": children}))

    def test_recovery_needs_proof_that_no_owned_work_survives(self):
        generation = "c" * 32
        live = subprocess.check_output(["ps", "-p", str(os.getpid()), "-o", "lstart="], text=True).strip()
        self.journal(generation, "uncertain", [{"pid": os.getpid(), "start": live}])
        refused = self.recover()
        self.assertEqual(refused.returncode, 75, refused.stdout)
        self.assertIn("RECOVERY REFUSED", refused.stdout)
        self.assertEqual(json.loads((self.state / "holder.json").read_text())["state"], "uncertain")
        # A reused PID with a different start identity is not the recorded child.
        self.journal(generation, "uncertain", [{"pid": os.getpid(), "start": "old incarnation"}])
        self.assertEqual(self.recover().returncode, 0)
        self.assertEqual(json.loads((self.state / ("complete-" + generation + ".json")).read_text()),
                         {"version": 1, "generation": generation, "cleanup": "complete"})
        self.assertEqual(json.loads((self.state / "holder.json").read_text())["state"], "released")
        self.assertEqual(self.launch("after-recovery", "pass").wait(timeout=8), 0)

    def test_recovery_never_takes_capacity_from_a_live_reservation(self):
        holder = self.hold("holder")
        refused = self.recover()
        self.assertEqual(refused.returncode, 75, refused.stdout)
        self.assertIn("live reservation", refused.stdout)
        holder.terminate()
        self.assertEqual(holder.wait(timeout=20), 130)

    def test_recovery_restores_a_released_journal_missing_its_completion(self):
        generation = "e" * 32
        self.journal(generation, "released", [])
        self.assertEqual(self.recover().returncode, 0)
        self.assertEqual(json.loads((self.state / ("complete-" + generation + ".json")).read_text()),
                         {"version": 1, "generation": generation, "cleanup": "complete"})
        self.assertEqual(self.launch("after-repair", "pass").wait(timeout=8), 0)

    def test_recovery_refuses_journals_it_cannot_trust(self):
        self.state.mkdir(mode=0o700, exist_ok=True)
        (self.state / "holder.json").write_text("{not json")
        refused = self.recover()
        self.assertNotEqual(refused.returncode, 0)
        self.assertIn("recover by inspection", refused.stderr)
        self.journal("f" * 32, "running", [])
        metadata = json.loads((self.state / "holder.json").read_text())
        metadata["version"] = 99
        (self.state / "holder.json").write_text(json.dumps(metadata))
        refused = self.recover()
        self.assertNotEqual(refused.returncode, 0)
        self.assertIn("recover by inspection", refused.stderr)

    def test_quarantine_diagnostic_names_the_blocking_state(self):
        generation = "d" * 32
        self.journal(generation, "uncertain", [])
        self.assertEqual(self.launch("blocked", "raise RuntimeError('unsafe')", wait=.2).wait(timeout=5), 75)
        text = Path(self.logs[-1].name).read_text()
        self.assertIn("previous cleanup unresolved", text)
        self.assertIn(generation[:8], text)
        self.assertIn("--recover", text)


if __name__ == "__main__":
    unittest.main()
