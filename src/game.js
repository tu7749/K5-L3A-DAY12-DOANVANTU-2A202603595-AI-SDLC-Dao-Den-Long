import {makeMap,surfaces,floorBelow,wall} from './maps.js';
export const DT=1/60;
export const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const direction=(from,to)=>{const d=distance(from,to);return d?[ (to[0]-from[0])/d,(to[2]-from[2])/d]:[1,0];};
const compare=(a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true});
export class Game{
  constructor(tuning,seed=1,scenario={},night=1,options={}){
    this.benchmark=options.benchmark===true;this.assistance=!this.benchmark&&options.assistance===true;this.t=tuning;this.night=night;this.map=makeMap(night);this.seed=seed>>>0;this.tick=0;this.sim_tick=0;this.state='playing';this.score=0;this.previous={};this.events=[];
    this.timeTicks=(scenario.time_left_s??tuning[`night${night}_duration_s`])*60;
    const p=scenario.player??{};
    this.player={pos:[...(p.pos??[0,0,0])],vel:[0,0,0],carried:p.carried??0,flames:p.flames??3,grounded:false};
    this.player.grounded=surfaces(night,...[this.player.pos[0],this.player.pos[2]]).some(y=>Math.abs(y-this.player.pos[1])<1e-6);
    this.invuln=p.invuln_ticks??0;this.dashCD=p.dash_cd_ticks??0;this.pulseCD=p.pulse_cd_ticks??0;this.charm=p.charm_ticks??0;
    this.dashTicks=0;this.dashDir=[0,1];this.facing=[0,1];this.launch=null;this.respawn=0;this.padLock=false;
    this.successfulLights=p.successful_lights??0;
    this.lanterns=this.map.lanterns.map((pos,i)=>{
      const initial=(scenario.lanterns??[]).find(l=>l.id===`L${i+1}`)??{};
      const lit=initial.lit??false;
      return {id:`L${i+1}`,pos:[...(initial.pos??pos)],lit,deposited:initial.deposited??0,fuelUnits:lit?Math.round((initial.fuel??100)*60):0,ever_lit:initial.ever_lit??lit,relit_count:0};
    });
    this.nextMote=1;this.nextShade=1;this.nextDrifter=1;
    this.motes=[];
    this.spawnPoints=[...this.map.motePoints];
    if(this.assistance)for(const center of this.map.centers)for(const radius of [8,18,26])for(let i=0;i<16;i++){
      const a=i*Math.PI/8,x=center[0]+radius*Math.cos(a),z=center[2]+radius*Math.sin(a),y=floorBelow(night,[x,20,z]);
      if(Number.isFinite(y)&&!this.spawnPoints.some(p=>distance(p,[x,y,z])<.01&&Math.abs(p[1]-y)<.01))this.spawnPoints.push([x,y,z]);
    }
    this.randomMotes=scenario.random_motes!==false;this.randomShades=scenario.random_shades!==false;this.randomDrifters=scenario.random_drifters!==false;
    if(scenario.motes)this.motes=scenario.motes.map(m=>this.mote(Array.isArray(m)?m:m.pos,m.kind??'random',m.ttl_s==null?null:Math.round(m.ttl_s*60)));
    else if(this.randomMotes)for(let i=0;i<(this.assistance?40:20);i++)this.spawnMote();
    this.shades=(scenario.shades??[]).map(s=>this.shade(s));
    this.drifters=(scenario.drifters??[]).map(d=>({id:d.id??`D${this.nextDrifter++}`,pos:[...d.pos],state:d.state??'idle',stolen:d.stolen??0,left:d.state_ticks_left??(d.state==='flee'?240:0),dir:[1,0]}));
    this.charms=(scenario.charms??this.map.charms.map((pos,i)=>({id:`C${i+1}`,pos}))).map(c=>({id:c.id,pos:[...(c.pos??this.map.charms[Number(c.id.slice(1))-1]??[0,0,0])],available:c.available??true,left:c.respawn_ticks??Math.round((c.respawn_s??0)*60)}));
    this.windEnabled=scenario.wind_enabled!==false&&night===3;this.wind={active:false,dir_deg:0};
    this.safeEject=new Set();this.startEvent=false;
  }
  get capacity(){return Math.min(this.t.capacity_max,10+2*this.successfulLights);}
  get time(){return Math.max(0,this.timeTicks/60);}
  random(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;}
  choose(list){return list.length?list[Math.floor(this.random()*list.length)]:null;}
  mote(pos,kind='random',ttl=null){return {id:`M${this.nextMote++}`,pos:[...pos],kind,ttl,born:this.sim_tick};}
  spawnMote(){if(this.motes.length>=(this.assistance?60:30))return;const free=this.spawnPoints.filter(p=>!this.motes.some(m=>distance(p,m.pos)<.01&&Math.abs(p[1]-m.pos[1])<.01));const p=this.choose(free);if(p)this.motes.push(this.mote(p));}
  shade(s){return {id:s.id??`S${this.nextShade++}`,pos:[...s.pos],state:s.state??'chase',left:s.state_ticks_left??0,pushLeft:0,pushDir:[1,0],recoilDir:[1,0],eject:0,target_lantern_id:s.target_lantern_id??null};}
  unique(prefix,list){let k=prefix==='S'?'nextShade':'nextDrifter';while(list.some(e=>e.id===`${prefix}${this[k]}`))this[k]++;return `${prefix}${this[k]++}`;}
  emit(name,data={}){this.events.push({type:'event',tick:this.tick,name,data});}
  safe(pos){return this.lanterns.some(l=>l.lit&&l.fuelUnits>=1800&&distance(l.pos,pos)<=6);}
  drop(n,pos,ring=true){for(let i=0;i<n;i++){const a=this.random()*Math.PI*2,r=ring?1.5+this.random():0;const p=[pos[0]+Math.cos(a)*r,pos[1],pos[2]+Math.sin(a)*r];const y=floorBelow(this.night,p);if(Number.isFinite(y))p[1]=y;this.motes.push(this.mote(p,'dropped',480));}}
  finish(state,reason){this.state=state;if(state==='won')this.score+=this.lanterns.filter(l=>l.lit).reduce((sum,l)=>sum+50+Math.floor(l.fuelUnits/60),0)+50*this.player.flames;this.emit('game_over',{result:state,reason});}
  nearestLantern(){return this.lanterns.filter(l=>(!l.lit||l.fuelUnits<6000)&&distance(l.pos,this.player.pos)<=2).sort((a,b)=>distance(a.pos,this.player.pos)-distance(b.pos,this.player.pos)||compare(a,b))[0];}
  updateFuel(){
    const drains=[];
    for(const l of this.lanterns)if(l.lit){
      const shades=this.shades.filter(s=>s.state==='drain'&&s.target_lantern_id===l.id);
      l.fuelUnits=Math.max(0,l.fuelUnits-1-5*shades.length);
      for(const s of shades)drains.push({lantern_id:l.id,shade_id:s.id,fuel:Math.round(l.fuelUnits/6)/10});
      if(l.fuelUnits===0){l.lit=false;l.deposited=0;l.ever_lit=true;this.emit('lantern_out',{lantern_id:l.id});}
    }
    if(this.sim_tick%60===0)for(const data of drains)this.emit('fuel_drain',data);
  }
  interactLantern(){
    const l=this.nearestLantern(),p=this.player;if(!l)return;
    if(l.lit){const amount=Math.min(p.carried,Math.ceil((6000-l.fuelUnits)/600));if(!amount)return;p.carried-=amount;l.fuelUnits=Math.min(6000,l.fuelUnits+amount*600);this.score+=5*amount;this.emit('refuel',{lantern_id:l.id,amount,fuel:Math.round(l.fuelUnits/6)/10});return;}
    const relight=l.ever_lit,cost=relight?5:10,amount=Math.min(p.carried,cost-l.deposited);if(amount<=0)return;
    p.carried-=amount;l.deposited+=amount;this.score+=amount*5;this.emit('deposit',{lantern_id:l.id,amount,deposited:l.deposited});
    if(l.deposited===cost){l.lit=true;l.fuelUnits=6000;l.ever_lit=true;if(relight)l.relit_count++;this.successfulLights++;this.score+=relight?40:100;this.emit('lantern_lit',{lantern_id:l.id,relight});}
  }
  updateShade(s){
    if(this.safeEject.has(s.id)){if(s.state==='drain'){s.state='wander';s.target_lantern_id=null;}return;}
    if(s.state==='stunned'){
      if(s.left>0){if(s.pushLeft>0){this.moveShade(s,s.pushDir,4/15);s.pushLeft--;}return;}
      s.state='wander';s.target_lantern_id=null;return;
    }
    if(s.state==='recoil'&&s.left>0){this.moveShade(s,s.recoilDir,2/60);return;}
    if(s.state==='spawning'&&s.left>0)return;
    const d=distance(s.pos,this.player.pos);
    if(s.state==='drain'){
      const l=this.lanterns.find(l=>l.id===s.target_lantern_id);
      if(!l?.lit||l.fuelUnits>=1800||distance(s.pos,l.pos)>2){s.state='wander';s.target_lantern_id=null;return;}
      if(d<=6&&!this.respawn){s.state='chase';s.target_lantern_id=null;}else return;
    }else s.state=this.benchmark?'wander':s.state==='chase'?(d>18?'wander':'chase'):(d<=12?'chase':'wander');
    if(this.respawn)s.state='wander';
    let target=this.player.pos;
    if(s.state==='wander'){
      const nearest=list=>list.sort((a,b)=>distance(a.pos,s.pos)-distance(b.pos,s.pos)||compare(a,b))[0];
      const l=nearest(this.lanterns.filter(l=>l.lit&&l.fuelUnits<1800))??nearest(this.lanterns.filter(l=>!l.lit));
      s.target_lantern_id=l?.id??null;target=l?.pos??this.map.shadePoints[(Number(s.id.replace(/\D/g,''))||0)%this.map.shadePoints.length];
      if(l?.lit&&distance(s.pos,l.pos)<=2){s.state='drain';return;}
    }else s.target_lantern_id=null;
    this.moveShade(s,direction(s.pos,target),Math.min(distance(s.pos,target),(this.night===3?4.5:4)*DT));
    if(s.state==='wander'&&s.target_lantern_id){const l=this.lanterns.find(l=>l.id===s.target_lantern_id);if(l?.lit&&l.fuelUnits<1800&&distance(s.pos,l.pos)<=2)s.state='drain';}
  }
  movePlayer(input,edge){
    const p=this.player;if(this.respawn){this.respawn--;p.vel=[0,0,0];if(!this.respawn){p.pos=[0,0,0];p.grounded=true;this.invuln=90;this.launch=null;}return;}
    let [x,z]=input.move??[0,0];const n=Math.max(1,Math.hypot(x,z)),a=(input.cam_yaw_deg??0)*Math.PI/180;[x,z]=[(x*Math.cos(a)+z*Math.sin(a))/n,(-x*Math.sin(a)+z*Math.cos(a))/n];
    if(Math.hypot(x,z)>.001)this.facing=[x,z];
    if(edge('jump')&&p.grounded){p.vel[1]=7;p.grounded=false;this.emit('jump');}
    if(edge('dash')&&!this.dashTicks&&(this.charm||!this.dashCD)){this.dashTicks=12;this.dashCD=this.charm?0:90;this.dashDir=[...this.facing];this.emit('dash');}
    const old=[...p.pos],dash=this.dashTicks>0;const speed=this.assistance?(this.charm?10.8:9):(this.charm?7.2:6);
    let vx=dash?this.dashDir[0]*14:this.launch?.[0]??x*speed,vz=dash?this.dashDir[1]*14:this.launch?.[1]??z*speed;
    if(this.wind.active){const a=this.wind.dir_deg*Math.PI/180;vx+=Math.cos(a)*2;vz+=Math.sin(a)*2;}
    p.vel[0]=vx;p.vel[2]=vz;p.pos[0]+=vx*DT;p.pos[2]+=vz*DT;
    if(wall(this.night,old,p.pos)){p.pos[0]=old[0];p.pos[2]=old[2];p.vel[0]=p.vel[2]=0;}
    const heights=surfaces(this.night,p.pos[0],p.pos[2]);const support=heights.find(y=>Math.abs(y-old[1])<=.12);
    if(p.grounded&&support!==undefined){p.pos[1]=support;p.vel[1]=0;}
    else {p.grounded=false;if(!dash){p.vel[1]-=20*DT;p.pos[1]+=p.vel[1]*DT;const land=heights.filter(y=>y<=old[1]+.001&&y>=p.pos[1]-.001).at(-1);if(land!==undefined&&p.vel[1]<=0){p.pos[1]=land;p.vel[1]=0;p.grounded=true;this.launch=null;}}}
    if(dash)this.dashTicks--;
    const pad=this.map.pads.find(v=>distance(v.pos,p.pos)<=1&&Math.abs(v.pos[1]-p.pos[1])<.1&&p.grounded);
    if(pad&&!this.padLock){const d=direction(p.pos,pad.target);this.launch=d.map(v=>v*pad.speed);p.vel[1]=pad.vy;p.grounded=false;this.padLock=true;this.emit('jump');}else if(!pad)this.padLock=false;
    if(p.pos[1]<-10){const lost=p.carried;p.carried=0;p.flames=Math.max(0,p.flames-1);this.respawn=60;this.dashTicks=0;this.launch=null;p.vel=[0,0,0];this.emit('player_hit',{by:'fall',flames:p.flames,dropped:0,lost});}
  }
  moveShade(s,dir,amount,allowSafe=false){const steps=Math.max(1,Math.ceil(amount/.1));for(let i=0;i<steps;i++){const dest=[s.pos[0]+dir[0]*amount/steps,s.pos[1],s.pos[2]+dir[1]*amount/steps];const y=floorBelow(this.night,[dest[0],s.pos[1]+.12,dest[2]]);if(!Number.isFinite(y)||wall(this.night,s.pos,dest)||(!allowSafe&&this.safe(dest)))break;dest[1]=y+.8;s.pos=dest;}}
  stepBenchmark(){
    this.tick++;this.sim_tick++;this.events=[];this.safeEject.clear();
    for(const s of this.shades){const l=this.lanterns.find(l=>l.lit&&distance(l.pos,s.pos)<6-1e-8);if(l){if(!s.eject)s.eject=30;this.safeEject.add(s.id);this.moveShade(s,direction(l.pos,s.pos),(6-distance(l.pos,s.pos))/s.eject,true);s.eject--;}else s.eject=0;this.updateShade(s);}
    return this.events;
  }
  step(input={}){
    if(this.benchmark)return this.stepBenchmark();
    if(!['playing','paused'].includes(this.state))return [];
    this.events=[];this.tick++;const previous=this.previous,edge=k=>!!input[k]&&!previous[k];
    if(edge('pause')){this.state=this.state==='paused'?'playing':'paused';this.emit(this.state==='paused'?'paused':'resumed');}
    this.previous={...input};if(this.state==='paused')return this.events;
    this.sim_tick++;if(!this.startEvent){this.startEvent=true;this.emit('night_start',{night:this.night});}
    this.timeTicks=Math.max(0,this.timeTicks-1);this.updateFuel();for(const key of ['invuln','dashCD','pulseCD','charm'])this[key]=Math.max(0,this[key]-1);
    for(const s of this.shades)if(s.left>0)s.left--;
    for(const d of this.drifters)if(d.state==='flee')d.left--;
    this.drifters=this.drifters.filter(d=>d.state!=='removed'&&!(d.state==='flee'&&d.left<=0));
    this.motes=this.motes.filter(m=>m.ttl===null||--m.ttl>0);
    for(const c of this.charms)if(!c.available&&c.left>0){c.left--;if(!c.left)c.available=true;}
    if(this.windEnabled){if(this.sim_tick%1800===1680){this.wind.dir_deg=this.random()*360;this.emit('wind_warning',{dir_deg:this.wind.dir_deg});}this.wind.active=this.sim_tick>=1800&&this.sim_tick%1800<300;}
    const waiting=this.respawn>0;this.movePlayer(input,edge);const p=this.player;
    if(!this.respawn&&!waiting){
      this.motes=this.motes.filter(m=>{if(m.born<this.sim_tick&&p.carried<this.capacity&&distance(m.pos,p.pos)<=1&&Math.abs(m.pos[1]-p.pos[1])<=1.5){p.carried++;this.emit('mote_picked',{carried:p.carried});return false;}return true;});
      for(const c of this.charms)if(c.available&&distance(c.pos,p.pos)<=1&&Math.abs(c.pos[1]-p.pos[1])<=1.5){c.available=false;c.left=2700;this.charm=600;this.dashCD=0;this.emit('charm_picked',{charm_id:c.id,charm_ticks:600});}
      if(edge('interact'))this.interactLantern();
    }
    this.safeEject.clear();for(const s of this.shades){const l=this.lanterns.find(l=>l.lit&&l.fuelUnits>=1800&&distance(l.pos,s.pos)<6-1e-8);if(l){if(!s.eject)s.eject=30;this.safeEject.add(s.id);const dir=direction(l.pos,s.pos),remaining=6-distance(l.pos,s.pos);this.moveShade(s,dir,remaining/s.eject,true);s.eject--;}else s.eject=0;}
    if(!this.respawn&&!waiting&&edge('pulse')&&!this.pulseCD&&p.carried>=3){p.carried-=3;this.pulseCD=180;const center=[p.pos[0],p.pos[1]+.8,p.pos[2]],hit=e=>Math.hypot(...e.pos.map((v,i)=>v-center[i]))<=5;const ids=[];
      for(const s of this.shades)if(hit(s)){const points=s.state==='drain'?15:5;s.state='stunned';s.left=120;s.pushLeft=15;s.pushDir=direction(p.pos,s.pos);ids.push(s.id);this.score+=points;}
      for(const d of this.drifters)if(hit(d)){if(d.state==='chase'){d.state='flee';d.left=240;d.dir=direction(p.pos,d.pos);}else if(d.state==='flee'&&d.stolen){const amount=d.stolen;this.drop(amount,d.pos,false);d.stolen=0;d.left=120;this.emit('drifter_drop',{drifter_id:d.id,amount});}}
      this.emit('pulse',{stunned_ids:ids});
    }
    for(const s of this.shades)this.updateShade(s);
    for(const d of this.drifters){if(d.state!=='flee')d.state=p.carried>=5&&distance(d.pos,p.pos)<=15&&!this.respawn?'chase':'idle';const dir=d.state==='flee'?d.dir:d.state==='chase'?direction(d.pos,p.pos):[Math.cos(this.sim_tick/120),Math.sin(this.sim_tick/120)];const speed=d.state==='idle'?2:7;d.pos[0]+=dir[0]*speed*DT;d.pos[2]+=dir[1]*speed*DT;}
    if(!this.respawn&&!waiting){for(const d of [...this.drifters].sort(compare))if(d.state==='chase'&&distance(d.pos,p.pos)<=1.2){const amount=Math.min(3,p.carried);p.carried-=amount;d.stolen=amount;d.state='flee';d.left=240;d.dir=direction(p.pos,d.pos);this.emit('drifter_steal',{drifter_id:d.id,amount,carried:p.carried});}
      for(const s of [...this.shades].sort(compare))if(!this.invuln&&s.state==='chase'&&!this.safeEject.has(s.id)&&!this.safe(p.pos)&&distance(s.pos,p.pos)<=1&&Math.abs(s.pos[1]-p.pos[1])<=1.5){const dropped=Math.floor(p.carried/2);p.carried-=dropped;p.flames=Math.max(0,p.flames-1);this.drop(dropped,p.pos);this.invuln=90;s.state='recoil';s.left=60;s.recoilDir=direction(p.pos,s.pos);this.moveShade(s,s.recoilDir,2/60);this.emit('player_hit',{by:'shade',flames:p.flames,dropped});break;}
    }
    if(this.randomMotes&&this.sim_tick%(this.assistance?120:240)===0)this.spawnMote();
    if(this.randomShades&&(this.sim_tick===300||(this.sim_tick>300&&(this.sim_tick-300)%this.map.shadeInterval===0))){const count=this.sim_tick===300?2:1;for(let i=0;i<count&&this.shades.length<this.map.shadeMax;i++){const points=this.map.shadePoints.filter(pos=>distance(pos,p.pos)>=15&&!this.safe(pos)&&!this.shades.some(s=>distance(s.pos,pos)<1));const pos=this.choose(points);if(pos){const s=this.shade({id:this.unique('S',this.shades),pos:[pos[0],pos[1]+.8,pos[2]],state:'spawning',state_ticks_left:30});this.shades.push(s);this.emit('shade_spawned',{id:s.id});}}}
    if(this.night>1&&this.randomDrifters&&this.sim_tick%1200===0&&this.drifters.length<2){const pos=this.choose(this.map.shadePoints);this.drifters.push({id:this.unique('D',this.drifters),pos:[pos[0],pos[1]+.8,pos[2]],state:'idle',stolen:0,left:0,dir:[1,0]});}
    if(p.flames<=0)this.finish('lost','no_flames');else if(this.assistance&&this.lanterns.every(l=>l.lit))this.finish('won','all_lit');else if(this.timeTicks<=0){if(this.lanterns.filter(l=>l.lit).length>=Math.ceil(this.t.win_ratio*this.lanterns.length))this.finish('won','dawn_survived');else this.finish('lost','dawn');}return this.events;
  }
  snapshot(){const round=v=>Math.round(v*1000)/1000,pos=p=>p.map(round);return {type:'snapshot',tick:this.tick,sim_tick:this.sim_tick,night:this.night,state:this.state,time_left_s:round(this.time),score:this.score,wind:{...this.wind,dir_deg:round(this.wind.dir_deg)},player:{pos:pos(this.player.pos),vel:pos(this.player.vel),grounded:this.player.grounded,flames:this.player.flames,carried:this.player.carried,capacity:this.capacity,invuln:this.invuln>0,dash_cd_s:round(this.dashCD/60),pulse_cd_s:round(this.pulseCD/60),charm_s:round(this.charm/60)},lanterns:this.lanterns.map(l=>({id:l.id,pos:pos(l.pos),lit:l.lit,deposited:l.deposited,fuel:l.lit?Math.round(l.fuelUnits/6)/10:0,ever_lit:l.ever_lit,relit_count:l.relit_count})),shades:this.shades.map(s=>({id:s.id,pos:pos(s.pos),state:s.state,target_lantern_id:s.target_lantern_id})),motes_active:this.motes.length,motes:this.motes.map(m=>({id:m.id,pos:pos(m.pos),kind:m.kind,ttl_s:m.ttl===null?null:round(m.ttl/60)})),drifters:this.drifters.map(d=>({id:d.id,pos:pos(d.pos),state:d.state,stolen:d.stolen})),charms:this.charms.map(c=>({id:c.id,available:c.available,respawn_s:round(c.left/60)}))};}
}
