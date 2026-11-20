// Procedural audio: no external recordings or network requests.
export class Audio {
  constructor(volume=.35){this.volume=volume;this.ctx=null;this.elapsed=0;this.note=0;}
  unlock(){if(!this.ctx)this.ctx=new AudioContext();this.ctx.resume();}
  tone(freq,duration=.15,type='sine',gain=.12){if(!this.ctx||!this.volume)return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain*this.volume,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(this.ctx.destination);o.start(t);o.stop(t+duration);}
  cue(name){const f={mote_picked:880,lantern_lit:660,pulse:220,player_hit:90,jump:440,dash:330,won:1046,lost:130,shade_spawned:110,countdown:523,wind_warning:180,charm_picked:1320,drifter_steal:160}[name];if(f){this.tone(f,.25);if(['lantern_lit','won'].includes(name))this.tone(f*1.5,.6,'sine',.08);}}
  update(dt,active){if(!active){this.elapsed=0;return;}this.elapsed+=dt;if(this.elapsed>1.2){this.elapsed=0;this.tone([220,261.63,329.63,293.66,196,261.63,293.66,164.81][this.note++%8],1.5,'sine',.06);}}
}
