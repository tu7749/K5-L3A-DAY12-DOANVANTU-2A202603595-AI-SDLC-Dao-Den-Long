import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';import {performance} from 'node:perf_hooks';import os from 'node:os';
const dir='docs/proof/phase-2';mkdirSync(dir,{recursive:true});
const quiet={random_motes:false,random_shades:false,random_drifters:false};
const cases=[
 ['dash',1,{...quiet},[{tick:0,dash:true}],12],
 ['pause',1,{...quiet,player:{dash_cd_ticks:60}},[{tick:0,pause:true},{tick:2,pause:false},{tick:60,pause:true}],70],
 ['charm',2,{...quiet,player:{pos:[35,0,0]}},[{tick:1,move:[0,1]},{tick:10,dash:true},{tick:11,dash:false},{tick:24,dash:true}],40],
 ['drifter-steal-drop',2,{...quiet,player:{carried:10},drifters:[{id:'D1',pos:[0,.8,0]}]},[{tick:1,pulse:true}],125],
 ['wind',3,{...quiet,player:{invuln_ticks:30000}},[],2100],
 ['pad-night2',2,{...quiet,player:{pos:[20,0,18]}},[],95],
 ['pad-night3',3,{...quiet,player:{pos:[0,3,13]}},[],75],
 ['spawn',2,{player:{invuln_ticks:30000}},[],1201]
];
const report=[];for(const [name,night,scenario,frames,ticks]of cases){writeFileSync(`${dir}/${name}.scenario.json`,JSON.stringify(scenario,null,2));writeFileSync(`${dir}/${name}.inputs.json`,JSON.stringify({frames},null,2));const args=['src/headless.mjs','--night',String(night),'--seed','42','--scenario',`${dir}/${name}.scenario.json`,'--inputs',`${dir}/${name}.inputs.json`,'--ticks',String(ticks),'--out',`${dir}/${name}.jsonl`,'--snapshot-every',name==='wind'?'60':'10'];let r=spawnSync(process.execPath,args,{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);const first=readFileSync(`${dir}/${name}.jsonl`,'utf8');r=spawnSync(process.execPath,args,{encoding:'utf8'});if(r.status!==0||readFileSync(`${dir}/${name}.jsonl`,'utf8')!==first)throw Error('Non-deterministic '+name);report.push({name,night,ticks,byte_identical:true,end:JSON.parse(first.trim().split('\n').at(-1))});}
const perfScenario={player:{invuln_ticks:30000}};writeFileSync(`${dir}/benchmark.scenario.json`,JSON.stringify(perfScenario));const start=performance.now();const r=spawnSync(process.execPath,['src/headless.mjs','--night','3','--seed','42','--scenario',`${dir}/benchmark.scenario.json`,'--ticks','21600','--snapshot-every','10','--out',`${dir}/benchmark.jsonl`],{encoding:'utf8'});const elapsed=(performance.now()-start)/1000;if(r.status!==0)throw Error(r.stderr);const end=JSON.parse(readFileSync(`${dir}/benchmark.jsonl`,'utf8').trim().split('\n').at(-1));if(end.ticks!==21600||elapsed>30)throw Error('Performance requirement failed');
writeFileSync(`${dir}/report.json`,JSON.stringify({system:{platform:os.platform(),arch:os.arch(),cpu:os.cpus()[0].model,node:process.version},scenarios:report,headless:{ticks:end.ticks,elapsed_s:elapsed,limit_s:30,passed:true}},null,2)+'\n');console.log(JSON.stringify({scenarios:report.length,headless_s:elapsed,headless_ticks:end.ticks}));
