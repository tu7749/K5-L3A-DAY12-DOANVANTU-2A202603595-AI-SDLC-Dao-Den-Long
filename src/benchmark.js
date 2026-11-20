import {Game} from './game.js';
export function frameStatistics(dts){
 if(!Array.isArray(dts)||!dts.length||dts.some(x=>!Number.isFinite(x)||x<=0))throw Error('Không có frame timing hợp lệ.');
 const sorted=[...dts].sort((a,b)=>a-b),n=dts.length,k=Math.max(1,Math.ceil(n*.01));
 return {avg_fps:1000*n/dts.reduce((a,b)=>a+b,0),p1_low_fps:1000/(sorted.slice(-k).reduce((a,b)=>a+b,0)/k),frame_ms_p95:sorted[Math.ceil(n*.95)-1],frames:n};
}
export function createBenchmarkGame(tuning,seed=42){
 let state=seed>>>0;const random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;},offset=random()*Math.PI*2;
 const shades=Array.from({length:200},(_,i)=>{const a=offset+i*Math.PI*(3-Math.sqrt(5)),r=39*Math.sqrt((i+.5)/200);return {id:`S${i+1}`,pos:[Math.cos(a)*r,.8,Math.sin(a)*r],state:'wander'};});
 const motes=Array.from({length:100},(_,i)=>{const a=random()*Math.PI*2,r=39*Math.sqrt((i+.5)/100);return [Math.cos(a)*r,0,Math.sin(a)*r];});
 return new Game(tuning,seed,{random_motes:false,random_shades:false,random_drifters:false,motes,shades,lanterns:[{id:'L1',lit:true,fuel:100},{id:'L2',lit:true,fuel:100},{id:'L3',lit:true,fuel:100}]},1,{benchmark:true});
}
