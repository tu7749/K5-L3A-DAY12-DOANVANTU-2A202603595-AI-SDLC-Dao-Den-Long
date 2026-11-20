import {readFileSync,writeFileSync} from 'node:fs';
import {Game} from './game.js';
const contract=JSON.parse(readFileSync(new URL('../game.contract.json',import.meta.url)));
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const integer=x=>Number.isInteger(x)&&x>=0;
const vector=(v,n)=>Array.isArray(v)&&v.length===n&&v.every(finite);
function requireValid(condition,message){if(!condition)throw new Error(message);}
export function validateScenario(s,night=1){
  requireValid(object(s),'scenario must be an object');
  for(const k of ['random_motes','random_shades','random_drifters','wind_enabled'])if(k in s)requireValid(typeof s[k]==='boolean',k+' must be boolean');
  if('time_left_s' in s)requireValid(finite(s.time_left_s)&&s.time_left_s>=0,'invalid time_left_s');
  if('player' in s){requireValid(object(s.player),'invalid player');const p=s.player;if('pos'in p)requireValid(vector(p.pos,3),'invalid player.pos');for(const k of ['carried','flames','invuln_ticks','dash_cd_ticks','pulse_cd_ticks','charm_ticks','successful_lights'])if(k in p)requireValid(integer(p[k]),'invalid player.'+k);requireValid((p.carried??0)<=Math.min(contract.tuning.capacity_max,10+2*(p.successful_lights??0)),'carried exceeds capacity');}
  if('motes'in s)requireValid(Array.isArray(s.motes)&&s.motes.every(p=>vector(p,3)||(object(p)&&vector(p.pos,3)&&['random','dropped'].includes(p.kind??'random')&&(!('ttl_s'in p)||p.ttl_s===null||(finite(p.ttl_s)&&p.ttl_s>=0)))),'invalid motes');
  if('shades'in s){requireValid(Array.isArray(s.shades),'invalid shades');for(const v of s.shades)requireValid(object(v)&&vector(v.pos,3)&&(!('id'in v)||typeof v.id==='string'),'invalid shade');const ids=s.shades.map((s,i)=>s.id??`S${i+1}`);requireValid(new Set(ids).size===ids.length,'duplicate shade id');}
  if('lanterns'in s){requireValid(Array.isArray(s.lanterns),'invalid lanterns');const seen=new Set();for(const l of s.lanterns){requireValid(object(l)&&new RegExp('^L[1-'+(night+4)+']$').test(l.id)&&!seen.has(l.id),'invalid or duplicate lantern id');seen.add(l.id);if('pos'in l)requireValid(vector(l.pos,3),'invalid lantern.pos');if('lit'in l)requireValid(typeof l.lit==='boolean','invalid lit');if('deposited'in l)requireValid(integer(l.deposited)&&l.deposited<=(l.ever_lit&&!l.lit?5:10),'invalid deposited');if('fuel'in l)requireValid(finite(l.fuel)&&l.fuel>=0&&l.fuel<=100,'invalid fuel');if('ever_lit'in l)requireValid(typeof l.ever_lit==='boolean','invalid ever_lit');}}
  for(const k of ['drifters','charms'])if(k in s){requireValid(Array.isArray(s[k]),'invalid '+k);const ids=new Set();for(const e of s[k]){requireValid(object(e)&&(!('id'in e)||typeof e.id==='string'),'invalid '+k+' entry');if(k==='charms')requireValid(typeof e.id==='string'&&/^C[1-2]$/.test(e.id),'invalid charm id');if(e.id){requireValid(!ids.has(e.id),'duplicate '+k+' id');ids.add(e.id);}if(k==='drifters'||'pos'in e)requireValid(vector(e.pos,3),'invalid '+k+' pos');for(const f of ['state_ticks_left','stolen','respawn_ticks'])if(f in e)requireValid(integer(e[f]),'invalid '+f);if('available'in e)requireValid(typeof e.available==='boolean','invalid available');if('respawn_s'in e)requireValid(finite(e.respawn_s)&&e.respawn_s>=0,'invalid respawn_s');if(k==='drifters'&&'state'in e)requireValid(['idle','chase','flee','removed'].includes(e.state),'invalid drifter state');}}
  for(const e of s.shades??[]){if('target_lantern_id'in e)requireValid(e.target_lantern_id===null||new RegExp('^L[1-'+(night+4)+']$').test(e.target_lantern_id),'invalid target_lantern_id');if('state'in e)requireValid(['spawning','wander','chase','recoil','stunned','drain'].includes(e.state),'invalid shade state');if('state_ticks_left'in e)requireValid(integer(e.state_ticks_left),'invalid state_ticks_left');}
  return s;
}
export function validateInputs(x){requireValid(object(x)&&Array.isArray(x.frames),'inputs.frames must be an array');let last=-1;for(const f of x.frames){requireValid(object(f)&&integer(f.tick)&&f.tick>last,'frame ticks must strictly increase');last=f.tick;if('move'in f)requireValid(vector(f.move,2)&&f.move.every(v=>Math.abs(v)<=1),'invalid move');if('cam_yaw_deg'in f)requireValid(finite(f.cam_yaw_deg),'invalid yaw');for(const k of ['jump','interact','pulse','dash','pause'])if(k in f)requireValid(typeof f[k]==='boolean','invalid button');}return x;}
if(process.argv[1]===new URL(import.meta.url).pathname){
  let args={},scenario={},frames=[];
  try{for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i];requireValid(['--seed','--night','--scenario','--inputs','--ticks','--out','--snapshot-every'].includes(k)&&process.argv[i+1]!==undefined&&!Object.hasOwn(args,k),'invalid arguments');args[k]=process.argv[i+1];}
    for(const k of ['--seed','--night','--ticks','--out'])requireValid(k in args,'missing '+k);
    requireValid(/^-?\d+$/.test(args['--seed'])&&Number.isSafeInteger(Number(args['--seed'])),'invalid seed');requireValid(['1','2','3'].includes(args['--night']),'night must be 1, 2 or 3');
    requireValid(/^\d+$/.test(args['--ticks'])&&Number.isSafeInteger(Number(args['--ticks'])),'invalid ticks');
    requireValid(!args['--snapshot-every']||/^[1-9]\d*$/.test(args['--snapshot-every']),'invalid snapshot interval');
    if(args['--scenario'])scenario=validateScenario(JSON.parse(readFileSync(args['--scenario'],'utf8')),Number(args['--night']));
    if(args['--inputs'])frames=validateInputs(JSON.parse(readFileSync(args['--inputs'],'utf8'))).frames;
  }catch(e){console.error(e.message);process.exit(2);}
  try{const game=new Game(contract.tuning,Number(args['--seed']),scenario,Number(args['--night'])),lines=[game.snapshot()],input={move:[0,0],cam_yaw_deg:0,jump:false,interact:false,pulse:false};let index=0;const every=Number(args['--snapshot-every']??10);
    for(let k=0;k<Number(args['--ticks'])&&['playing','paused'].includes(game.state);k++){if(frames[index]?.tick===k)Object.assign(input,frames[index++]);lines.push(...game.step(input).filter(e=>!['jump','wind_warning'].includes(e.name)));if(game.tick%every===0)lines.push(game.snapshot());}
    lines.push({type:'end',ticks:game.tick,state:game.state,score:game.score});writeFileSync(args['--out'],lines.map(x=>JSON.stringify(x)).join('\n')+'\n');
  }catch(e){console.error(e.message);process.exit(1);}
}
