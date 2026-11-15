'use strict';
const assert = require('assert');
const {SIM,ECO,AI} = require('./load.js');
for (const kind of ['mats','pills','auto','product']) {
 const W=SIM.create('review-'+kind), n=W.npcs[1];
 const id=kind==='pills'||kind==='product'?'P:BASIC_HP':'MAT_HERB_DEW_GRASS_1';
 W.sect.stock={};W.sect.spawnedMats={};W.sect.spawnedPills={};
 if(kind==='product') {
  n.inv.craftedPills=[{id:'review-product',key:id,qty:2,q:1.2,playerSpawned:true}];
  assert(ECO.donatePersonalProduct(W,n,'review-product').ok);
  assert.strictEqual(W.sect.spawnedPills[id],2);
 } else {
  const bucket=kind==='pills'?'pills':'mats',tag=kind==='pills'?'spawnedPills':'spawnedMats';
  n.inv[bucket]={[id]:10}; n.inv[tag]={[id]:3};
  if(kind==='auto') AI.ACTS.donate.done(n,W);
  else assert(ECO.donatePersonalProduct(W,n,id,5).ok);
  const donated=ECO.count(W,id);
  assert(donated>0);
  assert.strictEqual((W.sect[tag][id]||0)+(n.inv[tag]&&n.inv[tag][id]||0),3,kind+' must preserve provenance');
  assert((W.sect[tag][id]||0)<=donated);
 }
 const loaded=SIM.deserialize(SIM.serialize(W));
 for(const tag of ['spawnedMats','spawnedPills']) assert.deepStrictEqual(loaded.sect[tag]||{},W.sect[tag]||{});
 console.log('PASS provenance and save/load '+kind);
}
const {EXPED}=require('./load.js');
for(const poolSize of [0,0.5,1,20]){
 const W=SIM.create('review-node-'+poolSize);EXPED.ensureWorldTopology(W);
 const nodes=Object.values(W.world.resourceNodes);nodes.forEach((rn,i)=>rn.ownerSectId=i===0?'PLAYER':'NONE');
 W.world.resourcePool.stones=poolSize;
 const before=W.sect.stones;
 const result=EXPED.harvestResourceNodes(W,{force:true,includeMats:false});
 assert(result.totalStones<=poolSize,'Node cannot mint stones from empty or fractional reserves');
 assert.strictEqual(W.sect.stones-before+W.world.resourcePool.stones,poolSize);
 console.log('PASS resource pool '+poolSize);
}

// Counsel must resolve the persistent knot, not just reduce the scalar gauge.
{
 const {SECT}=require('./load.js');
 const W=SIM.create('post13-counsel'),a=W.npcs[0],b=W.npcs[1];
 SECT.HEART_DEMON.ensureNpc(b);
 b.heartDemons=[{id:'review-knot',nameTh:'ทดสอบ',resolved:false}];
 b.h.state.heartDemon=70;
 AI.pairEnd(W,a,b,{type:'counsel',rounds:1});
 assert.strictEqual(b.heartDemons[0].resolved,true);
 assert.strictEqual(b.heartDemons[0].resolvedByNpcId,a.id);
 assert(b.daoScars.some(s=>s.fromKnotId==='review-knot'));
 const count=b.daoScars.length;
 AI.pairEnd(W,a,b,{type:'counsel',rounds:1});
 assert.strictEqual(b.daoScars.length,count,'Repeated counseling cannot duplicate a resolved knot scar');
 console.log('PASS persistent counsel knot and replay');
}
