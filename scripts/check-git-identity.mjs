#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

// Match against the authenticated account, never against an invented lane name.
export function matchesAccount(email, account, verifiedEmails = []) {
  if (!email || !account?.id || !account?.login) return false;
  const candidate = email.toLowerCase();
  const numericNoreply = `${account.id}+${account.login}@users.noreply.github.com`.toLowerCase();
  return (
    candidate === numericNoreply ||
    verifiedEmails.some(
      (entry) => entry.verified === true && entry.email?.toLowerCase() === candidate
    )
  );
}

export function emailFromGitIdent(ident) {
  return ident.match(/ <([^<>]+)> \d+ [+-]\d{4}$/)?.[1] ?? null;
}

function run() {
  try {
    const account = JSON.parse(
      execFileSync("gh", ["api", "user"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
      })
    );
    let emails = [];
    try {
      emails = JSON.parse(
        execFileSync("gh", ["api", "user/emails"], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"]
        })
      );
    } catch {
      // A token without user:email scope can still check the numeric noreply.
    }
    const roles = ["AUTHOR", "COMMITTER"];
    const failed = roles.filter((role) => {
      const ident = execFileSync("git", ["var", `GIT_${role}_IDENT`], {
        encoding: "utf8"
      }).trim();
      return !matchesAccount(emailFromGitIdent(ident), account, emails);
    });
    if (failed.length) {
      console.error(
        `Could not verify Git ${failed.join(" and ").toLowerCase()} against the authenticated GitHub account. See docs/AGENT_INDEX.md#git-identity-and-provenance.`
      );
      process.exitCode = 1;
      return;
    }
    console.log(
      "Git author and committer match the authenticated GitHub account. Confirm this identity is approved for the task."
    );
  } catch {
    console.error(
      "Could not inspect Git identity or the authenticated GitHub account. See docs/AGENT_INDEX.md#git-identity-and-provenance."
    );
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
