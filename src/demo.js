import {floorBelow} from './maps.js';
export const DEMO_PRESETS={
  lantern:{label:'Phase 1 · Nhặt và thắp đèn',night:1,scenario:{random_motes:false,random_shades:false,random_drifters:false,player:{pos:[0,0,23.5],carried:10},motes:[[1,0,22],[-1,0,22],[2,0,24]]}},
  dash:{label:'Phase 2 · Bục nhảy và Bùa Gió',night:2,scenario:{random_shades:false,random_drifters:false,player:{pos:[18,0,18],carried:5,charm_ticks:600}}},
  drifter:{label:'Phase 2 · Gió Lạc cướp đom đóm',night:2,scenario:{random_shades:false,random_drifters:false,player:{pos:[0,0,0],carried:10,invuln_ticks:600},drifters:[{id:'D1',pos:[4,.8,0],state:'chase'}]}},
  oil:{label:'Phase 3 · Đèn yếu và hút dầu',night:1,scenario:{random_motes:false,random_shades:false,random_drifters:false,player:{pos:[0,0,17],carried:10,invuln_ticks:600},lanterns:[{id:'L1',lit:true,fuel:25}],shades:[{id:'S1',pos:[0,.8,25],state:'drain',target_lantern_id:'L1'}]}},
  tower:{label:'Đêm 3 · Tháp chuông',night:3,scenario:{random_shades:false,random_drifters:false,player:{pos:[0,6,6],carried:10,charm_ticks:600}}},
  dawn:{label:'Phase 3–4 · Kết quả Bình Minh',night:3,scenario:{random_motes:false,random_shades:false,random_drifters:false,wind_enabled:false,time_left_s:3,player:{pos:[0,6,6],flames:3},lanterns:Array.from({length:5},(_,i)=>({id:`L${i+1}`,lit:true,fuel:80}))}}
};
export function demoPreset(name){const preset=DEMO_PRESETS[name];if(!preset)throw Error('Cảnh demo không tồn tại.');return structuredClone(preset);}
export function demoAction(game,action,state){
 const p=game.player;
 switch(action){
 case 'fill':p.carried=game.capacity;break;
 case 'heal':p.flames=3;game.invuln=180;if(game.respawn||p.pos[1]<-5){game.respawn=0;p.pos=[0,0,0];p.vel=[0,0,0];p.grounded=true;game.launch=null;}break;
 case 'time':game.timeTicks+=60*60;if(state.freezeTime)state.frozenTicks=game.timeTicks;break;
 case 'fuel':for(const l of game.lanterns)if(l.lit)l.fuelUnits=6000;break;
 case 'allLights':for(const l of game.lanterns){if(!l.lit){const relight=l.ever_lit;l.deposited=relight?5:10;l.lit=true;l.ever_lit=true;if(relight)l.relit_count++;game.successfulLights++;}l.fuelUnits=6000;}break;
 case 'teleport':{const l=game.lanterns[(state.lanternIndex??0)%game.lanterns.length];state.lanternIndex=((state.lanternIndex??0)+1)%game.lanterns.length;p.pos=[l.pos[0]+1.5,l.pos[1],l.pos[2]];const y=floorBelow(game.night,p.pos);if(Number.isFinite(y))p.pos[1]=y;p.vel=[0,0,0];p.grounded=true;game.launch=null;game.respawn=0;game.dashTicks=0;break;}
 case 'shade':game.shades.push(game.shade({id:game.unique('S',game.shades),pos:[p.pos[0]+3,p.pos[1]+.8,p.pos[2]],state:'chase'}));break;
 case 'motes':for(let i=0;i<12;i++){const a=i*Math.PI/6,pos=[p.pos[0]+Math.cos(a)*2.5,p.pos[1],p.pos[2]+Math.sin(a)*2.5],y=floorBelow(game.night,pos);if(Number.isFinite(y)){pos[1]=y;game.motes.push(game.mote(pos));}}break;
 default:throw Error('Công cụ demo không hợp lệ.');
 }
}
export function beforeDemoStep(game,state){if(state.invincible){game.player.flames=3;game.invuln=600;}if(state.infiniteMotes)game.player.carried=game.capacity;if(state.noCooldown){game.dashCD=0;game.pulseCD=0;}if(state.freezeTime)game.timeTicks=Math.max(1,state.frozenTicks)+1;}
