export class Campaign {
  constructor(){this.reset();}
  reset(){this.night=1;this.scores=[];this.screen='menu';}
  get total(){return this.scores.reduce((a,b)=>a+b,0);}
  begin(){this.night=1;this.scores=[];this.screen='intro';}
  play(){this.screen='playing';}
  result(game){if(game.state==='won')this.scores[this.night-1]=game.score;this.screen='result';this.won=game.state==='won';}
  next(){if(!this.won){this.screen='intro';return;}if(this.night===3){this.screen='dawn';return;}this.night++;this.screen='intro';}
}
