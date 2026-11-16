'use strict';
const assert=require('assert');
const {SIM,WILD,CULT,MAP}=require('./load.js');
const W=SIM.create('land-hunt-rewards');
const n=W.npcs.find(n=>n.cult&&!n.dead); n.x=50;n.y=145;
const b={name:'test',x:50,y:145,power:CULT.power(n)};
const f={t0:W.t-30,ctx:{hunterId:n.id,baseCultRate:60,expectedTravel:20,landContributions:{[n.id]:100}}};
const old=CULT.gain, received=[];CULT.gain=(who,amount,w,tag)=>received.push({id:who.id,amount,tag});
WILD.awardLandQi(W,f,b);
assert.strictEqual(received.length,1);assert(Math.abs(received[0].amount-60)<1e-8);
received.length=0;b.power/=100;WILD.awardLandQi(W,f,b);assert(received[0].amount<=1.21);
received.length=0;f.ctx.landContributions={};WILD.awardLandQi(W,f,b);assert.strictEqual(received.length,0);
const helper=W.npcs.find(x=>x.id!==n.id&&x.cult&&!x.dead);
if(helper){
 helper.x=b.x;helper.y=b.y; b.power=CULT.power(n);
 f.ctx.landContributions={[n.id]:100,[helper.id]:100};received.length=0;
 WILD.awardLandQi(W,f,b);assert.strictEqual(received.length,2);
 assert(Math.abs(received.reduce((a,x)=>a+x.amount,0)-60)<1e-8);
}
CULT.gain=old;
for(const [x,y,gx,gy] of [[118,80,118,10],[118,80,20,80],[118,80,220,80],[118,80,118,145]])assert(MAP.findPath(W.map,x,y,gx,gy));
assert.strictEqual(WILD.MAX_ACTIVE_BEASTS,60);
console.log('PASS land qi budget, weak prey reduction, no spectator rewards, four gates');

WILD.init(W); W.wildlife.beasts=[];
for(let i=1;i<=40;i++){W.t+=15;WILD.tick(W);}
const active=W.wildlife.beasts.filter(b=>!b.dead&&!b.gone);
assert(active.length>=WILD.ORDINARY_TARGET);assert(active.length<=WILD.MAX_ACTIVE_BEASTS);
console.log('PASS refill reaches 48 ordinary beasts while preserving cap 60');
