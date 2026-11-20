import {readFileSync,writeFileSync} from 'node:fs';
import {Game} from './game.js';
const contract=JSON.parse(readFileSync(new URL('../game.contract.json',import.meta.url)));
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const integer=x=>Number.isInteger(x)&&x>=0;
const vector=(v,n)=>Array.isArray(v)&&v.length===n&&v.every(finite);
function requireValid(condition,message){if(!condition)throw new Error(message);}
export function validateScenario(s){
  requireValid(object(s),'scenario must be an object');
  for(const k of ['random_motes','random_shades'])if(k in s)requireValid(typeof s[k]==='boolean',k+' must be boolean');
  if('time_left_s' in s)requireValid(finite(s.time_left_s)&&s.time_left_s>=0,'invalid time_left_s');
  if('player' in s){requireValid(object(s.player),'invalid player');const p=s.player;if('pos'in p)requireValid(vector(p.pos,3),'invalid player.pos');for(const k of ['carried','flames'])if(k in p)requireValid(integer(p[k]),'invalid player.'+k);requireValid((p.carried??0)<=contract.tuning.carry_capacity,'carried exceeds capacity');}
  if('motes'in s)requireValid(Array.isArray(s.motes)&&s.motes.every(p=>vector(p,3)),'invalid motes');
  if('shades'in s){requireValid(Array.isArray(s.shades),'invalid shades');for(const v of s.shades)requireValid(object(v)&&vector(v.pos,3)&&(!('id'in v)||typeof v.id==='string'),'invalid shade');const ids=s.shades.map((s,i)=>s.id??`S${i+1}`);requireValid(new Set(ids).size===ids.length,'duplicate shade id');}
  if('lanterns'in s){requireValid(Array.isArray(s.lanterns),'invalid lanterns');const seen=new Set();for(const l of s.lanterns){requireValid(object(l)&&/^L[1-5]$/.test(l.id)&&!seen.has(l.id),'invalid or duplicate lantern id');seen.add(l.id);if('pos'in l)requireValid(vector(l.pos,3),'invalid lantern.pos');if('lit'in l)requireValid(typeof l.lit==='boolean','invalid lit');if('deposited'in l)requireValid(integer(l.deposited)&&l.deposited<=contract.tuning.lantern_cost,'invalid deposited');}}
  return s;
}
export function validateInputs(x){requireValid(object(x)&&Array.isArray(x.frames),'inputs.frames must be an array');let last=-1;for(const f of x.frames){requireValid(object(f)&&integer(f.tick)&&f.tick>last,'frame ticks must strictly increase');last=f.tick;if('move'in f)requireValid(vector(f.move,2)&&f.move.every(v=>Math.abs(v)<=1),'invalid move');if('cam_yaw_deg'in f)requireValid(finite(f.cam_yaw_deg),'invalid yaw');for(const k of ['jump','interact','pulse','dash'])if(k in f)requireValid(typeof f[k]==='boolean','invalid button');}return x;}
if(process.argv[1]===new URL(import.meta.url).pathname){
  let args={},scenario={},frames=[];
  try{for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i];requireValid(['--seed','--night','--scenario','--inputs','--ticks','--out','--snapshot-every'].includes(k)&&process.argv[i+1]!==undefined&&!Object.hasOwn(args,k),'invalid arguments');args[k]=process.argv[i+1];}
    for(const k of ['--seed','--night','--ticks','--out'])requireValid(k in args,'missing '+k);
    requireValid(/^-?\d+$/.test(args['--seed'])&&Number.isSafeInteger(Number(args['--seed'])),'invalid seed');requireValid(args['--night']==='1','only night 1 is available');
    requireValid(/^\d+$/.test(args['--ticks'])&&Number.isSafeInteger(Number(args['--ticks'])),'invalid ticks');
    requireValid(!args['--snapshot-every']||/^[1-9]\d*$/.test(args['--snapshot-every']),'invalid snapshot interval');
    if(args['--scenario'])scenario=validateScenario(JSON.parse(readFileSync(args['--scenario'],'utf8')));
    if(args['--inputs'])frames=validateInputs(JSON.parse(readFileSync(args['--inputs'],'utf8'))).frames;
  }catch(e){console.error(e.message);process.exit(2);}
  try{const game=new Game(contract.tuning,Number(args['--seed']),scenario),lines=[game.snapshot()],input={move:[0,0],cam_yaw_deg:0,jump:false,interact:false,pulse:false};let index=0;const every=Number(args['--snapshot-every']??10);
    for(let k=0;k<Number(args['--ticks'])&&game.state==='playing';k++){if(frames[index]?.tick===k)Object.assign(input,frames[index++]);lines.push(...game.step(input));if(game.tick%every===0)lines.push(game.snapshot());}
    lines.push({type:'end',ticks:game.tick,state:game.state,score:game.score});writeFileSync(args['--out'],lines.map(x=>JSON.stringify(x)).join('\n')+'\n');
  }catch(e){console.error(e.message);process.exit(1);}
}
