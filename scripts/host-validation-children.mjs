import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execute = promisify(execFile);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Cooperative validation child ownership. The shared supervisor also refuses
 * newly orphaned, unattributable processes; polling alone is not containment. */
export class ValidationChildren {
  constructor(pid) {
    this.pid = pid;
    this.owned = new Map();
    this.stopped = false;
    this.failure = undefined;
  }
  async observe() {
    const { stdout } = await execute("ps", ["-axo", "pid,ppid,lstart"], {
      timeout: 5000,
      maxBuffer: 4 * 1024 * 1024
    });
    const current = new Map();
    for (const row of stdout.split("\n").slice(1)) {
      const match = row.match(/^\s*(\d+)\s+(\d+)\s+(.+?)\s*$/);
      if (match)
        current.set(Number(match[1]), {
          pid: Number(match[1]),
          parent: Number(match[2]),
          start: match[3]
        });
    }
    if (!current.size) throw new Error("Cannot read validation process identities");
    if (!this.owned.size && current.has(this.pid)) this.owned.set(this.pid, current.get(this.pid));
    const known = new Set(
      [...this.owned.values()]
        .filter((item) => current.get(item.pid)?.start === item.start)
        .map((item) => item.pid)
    );
    let changed = true;
    while (changed) {
      changed = false;
      for (const item of current.values()) {
        if (!known.has(item.pid) && known.has(item.parent)) {
          known.add(item.pid);
          this.owned.set(item.pid, item);
          changed = true;
        }
      }
    }
    return [...this.owned.values()].filter((item) => current.get(item.pid)?.start === item.start);
  }
  async start() {
    await this.observe();
    this.tracking = (async () => {
      while (!this.stopped) {
        await pause(200);
        if (!this.stopped) await this.observe();
      }
    })().catch((error) => {
      this.failure = error;
    });
  }
  async cleanup() {
    this.stopped = true;
    await this.tracking;
    const deadline = Date.now() + 12000;
    let live = await this.observe();
    while (live.length) {
      for (const item of live) {
        // Re-observe before signalling an exact owned identity, never a group.
        if (
          (await this.observe()).some(
            (other) => other.pid === item.pid && other.start === item.start
          )
        ) {
          try {
            process.kill(item.pid, Date.now() >= deadline ? "SIGKILL" : "SIGTERM");
          } catch (error) {
            if (error.code !== "ESRCH") throw error;
          }
        }
      }
      if (Date.now() > deadline + 5000) throw new Error("Validation children survived cleanup");
      await pause(100);
      live = await this.observe();
    }
    if (this.failure) throw this.failure;
  }
}
