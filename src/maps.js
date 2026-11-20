const ring=(r,n,y=0,cx=0,start=0)=>Array.from({length:n},(_,i)=>{const a=(start+i*360/n)*Math.PI/180;return [cx+r*Math.cos(a),y,r*Math.sin(a)];});
export function makeMap(night){
  if(night===1)return {name:'Đảo Bến',radius:40,centers:[[0,0,0]],lanterns:[[0,0,25],[23.8,0,7.7],[14.7,0,-20.2],[-14.7,0,-20.2],[-23.8,0,7.7]],motePoints:[...ring(12,8),...ring(33,16)],shadePoints:ring(37,12,0,0,15),pads:[],charms:[],shadeInterval:480,shadeMax:6};
  if(night===2)return {name:'Đảo Cau',radius:28,centers:[[0,0,0],[70,0,0]],lanterns:[[0,0,20],[17,0,-10],[-17,0,-10],[70,0,20],[87,0,-10],[53,0,-10]],motePoints:[...ring(10,4),...ring(22,8),...ring(10,4,0,70),...ring(22,8,0,70)],shadePoints:[...ring(26,8,0,0,22.5),...ring(26,8,0,70,22.5)],pads:[{pos:[20,0,18],target:[70,0,0],vy:14,speed:24},{pos:[50,0,-18],target:[0,0,0],vy:14,speed:24}],charms:[[35,0,0]],shadeInterval:420,shadeMax:8};
  return {name:'Đảo Chuông',radius:45,centers:[[0,0,0]],lanterns:[[0,6,6],[18,3,10],[-18,3,10],[35,0,-10],[-35,0,-10],[20,0,-35],[-20,0,-35]],motePoints:[...ring(34,18),...Array.from({length:8},(_,i)=>{const a=(20+i*20)*Math.PI/180;return [18*Math.cos(a),3,18*Math.sin(a)];}),...ring(5,4,6,0,45)],shadePoints:ring(43,16),pads:[{pos:[0,3,13],target:[0,3,-50],vy:12,speed:8}],charms:[[30,0,25],[-30,0,25]],shadeInterval:360,shadeMax:10};
}
export function surfaces(night,x,z){
  const r=Math.hypot(x,z);if(night===1)return r<=40?[0]:[];
  if(night===2)return r<=28||Math.hypot(x-70,z)<=28||(x>=26&&x<=44&&Math.abs(z)<=2)?[0]:[];
  const heights=r<=45?[0]:[];
  if(z>0&&r>=12&&r<=24)heights.push(3);
  if(r<=8)heights.push(6);
  for(const deg of [30,150]){const a=deg*Math.PI/180,u=x*Math.cos(a)+z*Math.sin(a),v=-x*Math.sin(a)+z*Math.cos(a);if(u>=24&&u<=30&&Math.abs(v)<=1.5)heights.push((30-u)/2);}
  return heights.sort((a,b)=>a-b);
}
export function floorBelow(night,pos){return surfaces(night,pos[0],pos[2]).filter(y=>y<=pos[1]+.001).at(-1)??-Infinity;}
// Reject crossing a vertical ledge while allowing ascending a ramp or passing beneath a deck.
export function wall(night,from,to){
  if(night!==3)return false;
  if(Math.hypot(to[0],to[2])<2&&to[1]>=6-.001&&to[1]<14)return true;
  const old=surfaces(night,from[0],from[2]),next=surfaces(night,to[0],to[2]);
  return next.some(h=>h>from[1]+.12&&h<=from[1]+3.01&&!old.some(y=>Math.abs(y-h)<.01));
}
