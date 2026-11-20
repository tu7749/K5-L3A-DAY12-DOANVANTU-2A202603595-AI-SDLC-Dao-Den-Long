import {readFileSync,writeFileSync} from 'node:fs';import {performance} from 'node:perf_hooks';import {Game} from '../src/game.js';
const {tuning}=JSON.parse(readFileSync(new URL('../game.contract.json',import.meta.url)));const args=process.argv.slice(2),options={};
try{for(let i=0;i<args.length;i+=2){if(!['--seed','--nights','--out'].includes(args[i])||!args[i+1]||options[args[i]])throw Error('Sai tham số soak');options[args[i]]=args[i+1];}if(!options['--out']||!/^\d+$/.test(options['--nights']??'10')||(!Number.isSafeInteger(Number(options['--nights']??10))||Number(options['--nights']??10)<1)||!Number.isSafeInteger(Number(options['--seed']??7)))throw Error('Sai tham số soak');}catch(e){console.error(e.message);process.exit(2);}
const nights=Number(options['--nights']??10),seed=Number(options['--seed']??7),start=performance.now(),results=[];let crashes=0,game=new Game(tuning,seed,{},1);global.gc?.();const memStart=process.memoryUsage().rss/1048576;
for(let i=0;i<nights;i++){
 let state=(seed+i)>>>0;const rng=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};let move=[0,0];
 try{const max=tuning[`night${i%3+1}_duration_s`]*60;for(let k=0;k<max&&game.state==='playing';k++){if(k%30===0){const a=rng()*Math.PI*2;move=[Math.cos(a),Math.sin(a)];}game.step({move,jump:rng()<.05,dash:rng()<.03,pulse:rng()<.02,interact:rng()<.1});if(k%300===299)global.gc?.();}results.push(game.state);}catch(e){crashes++;results.push('crashed');console.error(`Đêm ${i+1}: ${e.message}`);}
 game=null;global.gc?.();game=new Game(tuning,seed+i+1,{},(i+1)%3+1);global.gc?.();
}
const result={nights,crashes,results,mem_start_mb:memStart,mem_end_mb:process.memoryUsage().rss/1048576,duration_s:(performance.now()-start)/1000};writeFileSync(options['--out'],JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(crashes||result.mem_end_mb>1.2*memStart)process.exitCode=1;
