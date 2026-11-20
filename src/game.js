export const DT = 1 / 60;
export const distance = (a,b) => Math.hypot(a[0]-b[0], a[2]-b[2]);
export class Game {
  constructor(tuning, seed=1, scenario={}) {
    this.t=tuning; this.seed=seed>>>0; this.tick=0; this.state='playing'; this.score=0;
    this.time=scenario.time_left_s ?? tuning.night1_duration_s;
    this.player={pos:[0,0,0],carried:0,flames:tuning.flames,...scenario.player};
    this.player.pos=[...this.player.pos]; this.vy=0; this.invuln=0; this.cooldown=0;
    this.previous={}; this.events=[];
    this.lanterns=Array.from({length:5},(_,i)=>{const a=i*Math.PI*2/5; return {id:`L${i+1}`,pos:[Math.sin(a)*23,0,Math.cos(a)*23],lit:false,deposited:0};});
    for(const override of scenario.lanterns??[]) Object.assign(this.lanterns.find(l=>l.id===override.id),override);
    this.motes=(scenario.motes??(scenario.random_motes===false?[]:Array.from({length:65},()=>this.randomPos(29)))).map((pos,i)=>({id:`M${i+1}`,pos:[...pos]}));
    this.shades=(scenario.shades??(scenario.random_shades===false?[]:Array.from({length:3},()=>({pos:this.randomPos(30)})))).map((s,i)=>({id:s.id??`S${i+1}`,pos:[...s.pos],state:'chase',stun:0}));
    this.randomShades=scenario.random_shades!==false; this.randomMotes=scenario.random_motes!==false;
    this.nextShade=this.shades.length+1; this.nextMote=this.motes.length+1;
  }
  random(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0; return this.seed/4294967296;}
  randomPos(radius){const a=this.random()*Math.PI*2,r=Math.sqrt(this.random())*radius;return [Math.cos(a)*r,0,Math.sin(a)*r];}
  emit(name,data){this.events.push({type:'event',tick:this.tick,name,data});}
  safe(pos){return this.lanterns.some(l=>l.lit&&distance(l.pos,pos)<=this.t.safe_radius);}
  finish(state,reason){this.state=state;if(state==='won')this.score+=Math.floor(this.time)*this.t.score.per_second_left+this.player.flames*this.t.score.per_flame_left;this.emit('game_over',{result:state,reason});}
  step(input={}) {
    if(this.state!=='playing')return [];
    this.events=[];this.tick++;const t=this.t,p=this.player;
    const edge=k=>!!input[k]&&!this.previous[k];
    this.invuln=Math.max(0,this.invuln-DT);this.cooldown=Math.max(0,this.cooldown-DT);
    let [x,z]=input.move??[0,0];const n=Math.max(1,Math.hypot(x,z)),a=(input.cam_yaw_deg??0)*Math.PI/180;
    x/=n;z/=n;p.pos[0]+=(x*Math.cos(a)+z*Math.sin(a))*t.player_speed*DT;p.pos[2]+=(-x*Math.sin(a)+z*Math.cos(a))*t.player_speed*DT;
    const r=Math.hypot(p.pos[0],p.pos[2]);if(r>34){p.pos[0]*=34/r;p.pos[2]*=34/r;}
    if(edge('jump')&&p.pos[1]<=0)this.vy=7;
    this.vy-=18*DT;p.pos[1]=Math.max(0,p.pos[1]+this.vy*DT);if(p.pos[1]===0)this.vy=0;
    this.motes=this.motes.filter(m=>{if(p.carried<t.carry_capacity&&distance(m.pos,p.pos)<=t.pickup_radius){p.carried++;this.score+=t.score.per_mote;this.emit('mote_picked',{carried:p.carried});return false;}return true;});
    if(edge('interact')){const l=this.lanterns.filter(l=>!l.lit&&distance(l.pos,p.pos)<=t.interact_radius).sort((a,b)=>distance(a.pos,p.pos)-distance(b.pos,p.pos))[0];if(l){const amount=Math.min(p.carried,t.lantern_cost-l.deposited);if(amount>0){p.carried-=amount;l.deposited+=amount;this.emit('deposit',{lantern_id:l.id,amount,deposited:l.deposited});if(l.deposited>=t.lantern_cost){l.lit=true;this.score+=t.score.per_lantern;this.emit('lantern_lit',{lantern_id:l.id});}}}}
    if(edge('pulse')&&this.cooldown<=1e-9&&p.carried>=t.pulse_cost){p.carried-=t.pulse_cost;this.cooldown=t.pulse_cooldown_s;const ids=[];for(const s of this.shades){if(distance(s.pos,p.pos)<=t.pulse_radius){s.stun=t.pulse_stun_s;s.state='stunned';ids.push(s.id);let dx=s.pos[0]-p.pos[0],dz=s.pos[2]-p.pos[2],d=Math.hypot(dx,dz);if(!d){dx=1;d=1;}const dest=[s.pos[0]+dx/d*t.pulse_push_m,s.pos[1],s.pos[2]+dz/d*t.pulse_push_m];if(!this.safe(dest))s.pos=dest;this.score+=t.score.per_stun;}}this.emit('pulse',{stunned_ids:ids});}
    for(const s of this.shades){if(s.stun>1e-9){s.stun=Math.max(0,s.stun-DT);s.state=s.stun>1e-9?'stunned':'chase';continue;}s.state='chase';const d=distance(s.pos,p.pos);if(d>0){const step=Math.min(d,t.shade_speed*DT),dest=[s.pos[0]+(p.pos[0]-s.pos[0])/d*step,s.pos[1],s.pos[2]+(p.pos[2]-s.pos[2])/d*step];if(!this.safe(dest))s.pos=dest;}
      if(!this.safe(p.pos)&&distance(s.pos,p.pos)<=t.shade_hit_radius&&this.invuln<=1e-9){const dropped=Math.ceil(p.carried*t.hit_drop_ratio);p.carried-=dropped;p.flames=Math.max(0,p.flames-1);this.invuln=t.invuln_s;for(let i=0;i<dropped;i++)this.motes.push({id:`M${this.nextMote++}`,pos:[p.pos[0]+2.5*Math.cos(i*2.4),0,p.pos[2]+2.5*Math.sin(i*2.4)]});this.emit('player_hit',{by:'shade',flames:p.flames,dropped});}}
    this.time=Math.max(0,this.time-DT);
    if(p.flames<=0)this.finish('lost','no_flames');else if(this.lanterns.every(l=>l.lit))this.finish('won','all_lit');else if(this.time<=1e-9)this.finish('lost','dawn');
    if(this.state==='playing'&&this.tick%600===0&&this.randomShades){const s={id:`S${this.nextShade++}`,pos:this.randomPos(32),state:'chase',stun:0};this.shades.push(s);this.emit('shade_spawned',{id:s.id});}
    if(this.state==='playing'&&this.tick%180===0&&this.randomMotes&&this.motes.length<65)this.motes.push({id:`M${this.nextMote++}`,pos:this.randomPos(29)});
    this.previous={...input};return this.events;
  }
  snapshot(){const round=v=>Math.round(v*1000)/1000,pos=p=>p.map(round);return {type:'snapshot',tick:this.tick,sim_tick:this.tick,state:this.state,time_left_s:round(this.time),score:this.score,player:{...this.player,pos:pos(this.player.pos)},lanterns:this.lanterns.map(l=>({...l,pos:pos(l.pos)})),shades:this.shades.map(s=>({id:s.id,pos:pos(s.pos),state:s.state})),motes_active:this.motes.length,motes:this.motes.map(m=>({...m,pos:pos(m.pos)}))};}
}
