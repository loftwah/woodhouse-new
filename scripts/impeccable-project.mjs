#!/usr/bin/env node
/** Project-local setup/check for Woodhouse #160. No deployment or design-success claim. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const SKILL_VERSION = '4.8.2';
export const CLI_VERSION = '4.8.2'; // Reviewed upstream; refresh deliberately, never floating latest.
export const START = '<!-- woodhouse-impeccable-required:start -->';
export const END = '<!-- woodhouse-impeccable-required:end -->';
export const ROUTING = `${START}
## Required Impeccable design workflow

Meaningful UI/design work MUST use the actual current Impeccable skill without waiting for MP to name it. This includes web/admin/mobile interfaces, game menus/HUDs, typography, interaction, responsive layout, accessibility and visual assets. Backend-only work does not need a design campaign.

1. Resolve the skill actually loaded by this agent/harness, including project/global/plugin precedence. Read its SKILL.md and relevant playbook. A copied name, installed directory, detector pass or another project's receipt is not proof of use. Install/update missing or stale copies through the supported Impeccable installer/plugin route; do not fabricate a replacement skill. Preserve customisations and backups outside skill discovery. Inspect supported hooks and demonstrate they fire; record unsupported hooks or trust approval honestly.
2. Run the resolved skill launcher's context command once in this project's cwd, targeting the changed surface. Read PRODUCT.md, DESIGN.md, applicable surface briefs and this project's accepted visual references. Reconcile old context with current code and recorded MP intent; do not make MP repeat answers already recorded. Keep each product's identity. If the launcher fails, disclose it, read context directly and continue the upstream fallback without pretending the command ran.
3. Use the relevant playbook: shape/new-work for new surfaces; critique for design quality; audit for accessibility/responsiveness/implementation; then appropriate polish, adapt, harden, typeset, layout, clarify, optimise or other targeted refinement. Read the upstream craft floor before UI edits. Slash commands are agent workflows, not invented shell subcommands.
4. Inspect the rendered product and actual interactions at representative phone/desktop sizes. Include meaningful keyboard/focus, contrast, overflow, loading/empty/error and reduced-motion checks. Games additionally need gameplay/HUD/touch/state checks; a DOM detector cannot certify a canvas. Preserve explicit art/safety holds; do not redesign unrelated surfaces or manufacture edits for evidence.
5. Record the actual skill/version/path and harness, target/source, context and playbooks used, findings, resulting changes or justified no-change, rendered/interaction evidence and remaining limits in the existing project issue/PR/evidence. Reinspect the result. Fresh-session discovery must work without MP mentioning Impeccable.
6. Deliver code through this repository's authorised main and production path and verify changed live behaviour. Tooling-only integration, installation, discovery, design use, remediation and production verification are SEPARATE states. Never close portfolio coverage from one project's result or describe missing evidence as passed.

Installation/setup diagnostics and the portfolio coverage owner: https://github.com/loftwah/woodhouse-new/issues/160 . Current upstream: https://github.com/pbakaus/impeccable and https://impeccable.style/docs/ . Check published skill, CLI and engine versions separately; pin a supported combination, not whichever number looks highest.
${END}`;
const DIRS = ['.agents', '.claude', '.codex', '.cursor', '.dsh', '.opencode', '.github', '.gemini'];
const read = p => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;

export function stableVersion(v) {
  if (!/^\d+\.\d+\.\d+$/.test(v)) throw new Error('Use an explicitly reviewed stable CLI version, not latest or a prerelease.');
  return v;
}
export function routed(source) {
  const a = source.indexOf(START), b = source.indexOf(END);
  if ((a < 0) !== (b < 0) || (a >= 0 && (b < a || source.indexOf(START, a + START.length) >= 0 || source.indexOf(END, b + END.length) >= 0)))
    throw new Error('Malformed/duplicate routing markers; preserve the file and reconcile manually.');
  if (a < 0) return source.replace(/\s*$/, '') + '\n\n' + ROUTING + '\n';
  return source.slice(0, a) + ROUTING + source.slice(b + END.length);
}
function git(root, args) {
  const p = spawnSync('git', ['-C', root, ...args], {encoding:'utf8', timeout:15000, maxBuffer:1024*1024});
  if (p.status !== 0) throw new Error('Selected path is not a usable Git checkout, or Git inspection failed.');
  return p.stdout.trim();
}
export function inspect(root, reviewedSkillVersion = SKILL_VERSION) {
  root = fs.realpathSync(root);
  const top = fs.realpathSync(git(root, ['rev-parse','--show-toplevel']));
  if (top !== root) throw new Error('Select the actual repository root, not an arbitrary subdirectory.');
  const source = git(root, ['rev-parse','HEAD']);
  const copies = [];
  for (const dir of DIRS) {
    const base = path.join(root, dir, 'skills', 'impeccable');
    const file = path.join(base, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const text = read(file);
    const version = /^\s*version:\s*["']?([\w.-]+)/m.exec(text)?.[1] ?? 'unknown';
    const resolved = fs.realpathSync(base);
    copies.push({path:path.relative(root, base), version, external: !resolved.startsWith(root + path.sep),
      launcher:fs.existsSync(path.join(base,'scripts','impeccable')) || fs.existsSync(path.join(base,'scripts','impeccable.cmd'))});
  }
  const versions = [...new Set(copies.map(c=>c.version))];
  const versionReviewed = versions.length === 1 && versions[0] === reviewedSkillVersion;
  const context = Object.fromEntries(['PRODUCT.md','DESIGN.md'].map(f=>[f,Boolean(read(path.join(root,f))?.trim())]));
  const agents = read(path.join(root, 'AGENTS.md')) ?? '';
  const routing = agents.includes(ROUTING);
  return {project:path.basename(root),source,workingTreeClean:git(root,['status','--porcelain']).length===0,
    localCopies:copies,versionsAgree:versions.length===1,reviewedSkillVersion,versionReviewed,context,routing,
    setupState: copies.length && copies.every(c=>c.launcher) && versionReviewed && Object.values(context).every(Boolean) && routing
      ? 'LOCAL_FILES_READY_NOT_RUNTIME_VERIFIED' : 'SETUP_REQUIRED',
    effectiveHarnessSkill:'UNVERIFIED',hookExecution:'UNVERIFIED',designUse:'UNVERIFIED',production:'UNVERIFIED',
    limits:['Global/plugin resolution is inspected by the executing harness, not inferred from local files.',
      'File checks do not prove a CLI ran, a hook fired, design judgement was applied or production was verified.']};
}
function localBackup(root) {
  const gd = path.resolve(root, git(root,['rev-parse','--git-dir']));
  const base = path.join(gd,'impeccable-setup-backups');
  fs.mkdirSync(base,{recursive:true,mode:0o700});
  const out = fs.mkdtempSync(path.join(base,'before-'));
  for (const name of [...DIRS, '.impeccable','.gitignore','AGENTS.md']) {
    const from = path.join(root,name);
    if (!fs.existsSync(from)) continue;
    // Copy links themselves, not external/private targets. Never remove the original.
    fs.cpSync(from,path.join(out,name),{recursive:true,dereference:false,preserveTimestamps:true});
  }
  return out;
}
export function writeRouting(root) {
  const file = path.join(root,'AGENTS.md');
  if (fs.existsSync(file) && !fs.lstatSync(file).isFile()) throw new Error('Refuse a symlink/non-regular AGENTS.md.');
  const old = read(file);
  const next = routed(old ?? '# Agent instructions\n');
  if (next === old) return false;
  if (read(file) !== old) throw new Error('AGENTS.md changed during inspection; retry after reconciling.');
  const tmp = path.join(root, `.impeccable-agents-${process.pid}-${Date.now()}.tmp`);
  try {
    fs.writeFileSync(tmp,next,{flag:'wx',mode:fs.existsSync(file) ? fs.statSync(file).mode & 0o777 : 0o644});
    if (read(file) !== old) throw new Error('AGENTS.md changed before write; original preserved.');
    fs.renameSync(tmp,file);
  } finally { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); }
  return true;
}
function run(command,args,root) {
  const result=spawnSync(command,args,{cwd:root,stdio:'inherit',timeout:180000,env:process.env,shell:false});
  if (result.error || result.status!==0) throw new Error(`${command} failed or timed out; inspect its output. No successful setup is claimed.`);
}
export function installerArgs(version,providers) {
  stableVersion(version);
  if (providers && !/^[a-z][a-z0-9-]*(,[a-z][a-z0-9-]*)*$/.test(providers)) throw new Error('Invalid provider selection.');
  return ['--yes',`impeccable@${version}`,'install','-y','--scope=project',...(providers?[`--providers=${providers}`]:[])];
}
export function parseArgs(argv) {
  const opts={setup:false,wire:false,check:false,version:CLI_VERSION,skillVersion:SKILL_VERSION,providers:null,projects:[]};
  for(let i=0;i<argv.length;i++) {
    const a=argv[i];
    if(a==='--setup') opts.setup=true;
    else if(a==='--wire') opts.wire=true;
    else if(a==='--check') opts.check=true;
    else if(a==='--cli-version' || a==='--skill-version' || a==='--providers') {
      const val=argv[++i]; if(!val || val.startsWith('--')) throw new Error(`${a} requires a value.`);
      opts[a==='--cli-version'?'version':a==='--skill-version'?'skillVersion':'providers']=val;
    } else if(a.startsWith('--')) throw new Error(`Unknown option: ${a}`);
    else opts.projects.push(a);
  }
  if(!opts.projects.length) throw new Error('Supply explicit repository root paths. No filesystem-wide scan or implicit host change.');
  if(opts.check && (opts.setup || opts.wire)) throw new Error('--check is read-only; do not combine it with setup/wire.');
  stableVersion(opts.skillVersion); stableVersion(opts.version); installerArgs(opts.version,opts.providers);
  return opts;
}
export function main(argv) {
  const opts=parseArgs(argv), seen=new Set(), results=[];
  for(const selected of opts.projects) {
    try {
      const root=fs.realpathSync(selected);
      if(seen.has(root)) continue; seen.add(root);
      const before=inspect(root,opts.skillVersion);
      if(opts.setup || opts.wire) {
        // Explicit setup changes skills/hooks only within this project; no forced overwrites,
        // global install, engine overrides, credentials, providers or production writes.
        const backup=localBackup(root);
        console.error(`${path.basename(root)}: existing configuration backed up under its Git metadata.`);
        if(opts.setup) {
          for(const c of before.localCopies) if(c.external) throw new Error('External/symlinked skill requires its installation owner; refusing to overwrite it.');
          run(process.platform==='win32'?'npx.cmd':'npx',installerArgs(opts.version,opts.providers),root);
        }
        writeRouting(root);
        if(opts.setup) {
          const copies=inspect(root).localCopies.filter(c=>c.launcher && !c.external);
          if(!copies.length) throw new Error('Installer returned but no supported project-local launcher was found.');
          const launcher=path.join(root,copies[0].path,'scripts',process.platform==='win32'?'impeccable.cmd':'impeccable');
          run(launcher,['doctor','--json'],root);
          // Run context once in the REAL fresh agent session, not here and a second time there.
        }
        void backup;
      }
      const after=inspect(root,opts.skillVersion);
      results.push(after);
      if(after.setupState!=='LOCAL_FILES_READY_NOT_RUNTIME_VERIFIED') process.exitCode=1;
    } catch(error) {
      results.push({project:path.basename(selected),setupState:'BLOCKED',reason:error.message,
        effectiveHarnessSkill:'UNVERIFIED',hookExecution:'UNVERIFIED',designUse:'UNVERIFIED',production:'UNVERIFIED'});
      process.exitCode=1;
    }
  }
  console.log(JSON.stringify({schema:'woodhouse.impeccable-setup/1',cliVersionRequested:opts.version,skillVersionReviewed:opts.skillVersion,
    mode:opts.setup?'setup':opts.wire?'wire-only':'read-only',projects:results,
    next:'Reload the actual agent; prove skill discovery, context/playbook use, rendered critique, repairs and reinspection per project. Setup is not completion.'},null,2));
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=1;}
}
