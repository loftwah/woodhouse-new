import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {START,END,ROUTING,routed,parseArgs,installerArgs,stableVersion,inspect,writeRouting} from './impeccable-project.mjs';
function repo(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'impeccable-test-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for(const args of [['init','-q'],['-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','-qm','fixture']]) {
  const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});assert.equal(r.status,0,r.stderr);
 }
 return root;
}
function skill(root,version='4.8.2'){
 const dir=path.join(root,'.agents/skills/impeccable');fs.mkdirSync(path.join(dir,'scripts'),{recursive:true});
 fs.writeFileSync(path.join(dir,'SKILL.md'),`---\nname: impeccable\nmetadata:\n  version: ${version}\n---\nFixture only; never executed.\n`);
 fs.writeFileSync(path.join(dir,'scripts/impeccable'),'fixture, not an executable tool');
}
test('routing preserves existing instructions and is idempotent',()=>{
 const old='# Agent instructions\n\nPreserve the accepted art and security rules.\n';
 const changed=routed(old);assert.ok(changed.startsWith(old.trimEnd()));assert.ok(changed.includes(ROUTING));assert.equal(routed(changed),changed);
});
test('routing updates only its owned block',()=>{
 const text=`before\n${START}\nold block\n${END}\nafter\n`;
 assert.equal(routed(text),`before\n${ROUTING}\nafter\n`);
});
test('broken or duplicate markers refuse without overwriting',()=>{
 for(const v of [START,END,END+START,START+START+END,START+END+END]) assert.throws(()=>routed(v));
});
test('only explicit stable versions accepted',()=>{
 assert.equal(stableVersion('4.8.2'),'4.8.2');for(const x of ['latest','4','4.8.2-beta','4.8.2;echo'])assert.throws(()=>stableVersion(x));
});
test('installer is project-scoped with no force/global/extra agent setup',()=>{
 assert.deepEqual(installerArgs('4.8.2','codex,claude'),['--yes','impeccable@4.8.2','install','-y','--scope=project','--providers=codex,claude']);
 assert.throws(()=>installerArgs('4.8.2','codex;echo bad'));
});
test('unknown flags and missing paths are not silently accepted',()=>{
 for(const a of [[],['--force','.'],['--providers'],['--cli-version','latest','.'],['--check','--setup','.']])assert.throws(()=>parseArgs(a));
 assert.deepEqual(parseArgs(['--setup','--providers','codex','/work/a','/work/b']).projects,['/work/a','/work/b']);
});
test('absent skill is SETUP_REQUIRED and never a false success',t=>{
 const r=inspect(repo(t));assert.equal(r.setupState,'SETUP_REQUIRED');assert.equal(r.designUse,'UNVERIFIED');
});
test('installation files never prove active skill, hook, use or deployment',t=>{
 const root=repo(t);skill(root);
 for(const f of ['PRODUCT.md','DESIGN.md'])fs.writeFileSync(path.join(root,f),'Existing product-specific context.');
 writeRouting(root);const r=inspect(root);assert.equal(r.setupState,'LOCAL_FILES_READY_NOT_RUNTIME_VERIFIED');
 for(const k of ['effectiveHarnessSkill','hookExecution','designUse','production'])assert.equal(r[k],'UNVERIFIED');
});
test('older or unreviewed different versions remain setup-required',t=>{
 const root=repo(t);skill(root,'4.0.4');for(const f of ['PRODUCT.md','DESIGN.md'])fs.writeFileSync(path.join(root,f),'Context');writeRouting(root);
 assert.equal(inspect(root).versionReviewed,false);assert.equal(inspect(root).setupState,'SETUP_REQUIRED');
});
test('symlinked instruction file is not replaced',t=>{
 const root=repo(t);const target=path.join(root,'kept.md');fs.writeFileSync(target,'Preserve');fs.symlinkSync(target,path.join(root,'AGENTS.md'));
 assert.throws(()=>writeRouting(root));assert.equal(fs.readFileSync(target,'utf8'),'Preserve');
});
test('wire preserves existing text, is repeatable and does not install',t=>{
 const root=repo(t);fs.writeFileSync(path.join(root,'AGENTS.md'),'# Existing\n\nAccepted constraints.\n');
 assert.equal(writeRouting(root),true);assert.equal(writeRouting(root),false);assert.ok(fs.readFileSync(path.join(root,'AGENTS.md'),'utf8').includes('Accepted constraints.'));assert.equal(inspect(root).localCopies.length,0);
});
test('subdirectory cannot silently alter another project root',t=>{
 const root=repo(t);const sub=path.join(root,'sub');fs.mkdirSync(sub);assert.throws(()=>inspect(sub),/actual repository root/);
});
