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
 helper.x=b.x;helper.y=b.y; b.power=Math.max(CULT.power(n), CULT.power(helper));
 f.ctx.landContributions={[n.id]:100,[helper.id]:100};received.length=0;
 WILD.awardLandQi(W,f,b);assert.strictEqual(received.length,2);
 assert(Math.abs(received.reduce((a,x)=>a+x.amount,0)-60)<1e-8);
}
CULT.gain=old;
for(const [x,y,gx,gy] of [[180,122,180,20],[180,122,30,123],[180,122,330,123],[180,122,180,235]])assert(MAP.findPath(W.map,x,y,gx,gy));
assert.strictEqual(WILD.MAX_ACTIVE_BEASTS,60);
console.log('PASS land qi budget, weak prey reduction, no spectator rewards, four gates');

WILD.init(W); W.wildlife.beasts=[];
for(let i=1;i<=40;i++){W.t+=15;WILD.tick(W);}
const active=W.wildlife.beasts.filter(b=>!b.dead&&!b.gone);
assert(active.length>=WILD.ORDINARY_TARGET);assert(active.length<=WILD.MAX_ACTIVE_BEASTS);
console.log('PASS refill reaches 48 ordinary beasts while preserving cap 60');

{
  const { COG, ECO, HC } = require('./load.js');
  const W = SIM.create('valley-realm-weights');
  const [senior, junior] = W.npcs;
  Object.assign(senior.cult, { path: 'BODY', stage: 4, track: null });
  Object.assign(junior.cult, { path: 'XIAN', stage: 1, track: null });
  HC.bump(senior);
  HC.bump(junior);
  const low = { tier: 1, power: 300, drops: [], x: senior.x, y: senior.y, name: 'อสูรทดสอบ' };
  const peer = { ...low, tier: 7 };
  assert(CULT.equivalentStage(senior) > senior.cult.stage);
  assert(COG.huntValue(W, senior, peer) > COG.huntValue(W, senior, low));

  const recipe = Object.values(ECO.recipeById).find(r => r.inputs?.some(i => ECO.matById[i.matId]));
  const material = recipe.inputs.find(i => ECO.matById[i.matId]).matId;
  low.drops = [material];
  W.sect.stock[material] = 0;
  senior.inv.mats[material] = 0;
  senior.cognition ||= {};
  senior.cognition.goal = { id: 'craft', targetId: recipe.id };
  assert(WILD.needsHuntMaterial(W, senior, low));
  assert(COG.huntValue(W, senior, low) > COG.huntValue(W, senior, peer));

  low.power = CULT.power(junior);
  Object.assign(junior, { x: low.x, y: low.y });
  const f = { t0: W.t - 20, ctx: { baseCultRate: 60, hunterId: senior.id,
    landContributions: { [senior.id]: 50, [junior.id]: 50 } } };
  const gains = {};
  const gain = CULT.gain;
  try {
    CULT.gain = (who, quantity) => { gains[who.id] = quantity; };
    WILD.awardLandQi(W, f, low);
  } finally {
    CULT.gain = gain;
  }
  assert.equal(gains[junior.id], 12);
  assert(gains[senior.id] < 3, 'Only the senior share is reduced, even while hunting a required material');
  console.log('PASS equivalent-stage target preference, material exception and individual qi shares');
}
