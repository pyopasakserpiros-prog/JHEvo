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

{
 const {SECT,CULT,UI,JD}=require('./load.js');
 // 1. N03: partial spawnedMats rollback + normal failure rollback via ECO.reserveInputs
 {
  const W=SIM.create('n03-rollback'), npc=W.npcs[0];
  const r=(JD.ITEMS.recipes||[]).find(x=>x&&Array.isArray(x.inputs)&&x.inputs.length>=2&&x.inputs[0].matId!==x.inputs[1].matId&&x.inputs.every(p=>p&&p.matId&&p.count>0));
  assert(r,'Must find multi-input recipe for N03 check');
  const id0=r.inputs[0].matId,q0=r.inputs[0].count;
  W.sect.stock={};W.sect.spawnedMats={};
  ECO.add(W,id0,q0);ECO.add(W,id0,1,{playerSpawned:true});
  assert.strictEqual(ECO.reserveInputs(W,r,{},npc),false,'reserveInputs must fail when second input is missing');
  assert.strictEqual(ECO.count(W,id0),q0+1,'N03: stock of first input must stay intact');
  assert.strictEqual(W.sect.spawnedMats[id0],1,'N03: spawnedMats must stay intact');
  // Partial take failure on duplicate-matId synthetic recipe triggers rollbackTaken() with spawnedUsed>0
  const dupR={id:'TEST_N03_DUP',tier:1,inputs:[{matId:id0,count:2},{matId:id0,count:2}]};
  W.sect.stock={};W.sect.spawnedMats={};
  ECO.add(W,id0,1);ECO.add(W,id0,2,{playerSpawned:true}); // total=3 (1 normal + 2 spawned): each line <=3, total 4 > 3
  assert.strictEqual(ECO.reserveInputs(W,dupR,{},npc),false,'reserveInputs must roll back partial take when cumulative matId stock is short');
  assert.strictEqual(ECO.count(W,id0),3,'N03: rollbackTaken must restore exact stock 3');
  assert.strictEqual(W.sect.spawnedMats[id0],2,'N03: rollbackTaken must restore exact spawnedMats=2 without loss or inflation');
  assert.strictEqual(ECO.reserveInputs(W,r,{},{}),false,'reserveInputs must reject crafter without id');
  console.log('PASS N03 partial spawnedMats rollback via ECO.reserveInputs');
 }

 // 2. N01: transferStones (peak:, rival:, fractional worldPool) & pooled payouts
 {
  const W=SIM.create('n01-pool');EXPED.ensureWorldTopology(W);
  W.sect.stones=500;
  const peakId=Object.keys(W.sect.peaks.byId)[0];
  const pkBefore=W.sect.peaks.byId[peakId].treasuryStones||0;
  const tp=ECO.transferStones(W,{from:'sect',to:'peak:'+peakId,amount:50});
  assert(tp.ok&&tp.moved===50&&W.sect.peaks.byId[peakId].treasuryStones===pkBefore+50,'transferStones must resolve peak: via byId');

  const rv=W.world.allSects[0];rv.treasury=40;
  const sBefore=W.sect.stones;
  const tr=ECO.transferStones(W,{from:'rival:'+rv.id,to:'sect',amount:15});
  assert(tr.ok&&tr.moved===15&&rv.treasury===25&&W.sect.stones===sBefore+15,'transferStones must resolve rival: via allSects');

  W.world.resourcePool.stones=0.5;
  assert.strictEqual(ECO.transferStones(W,{from:'worldPool',to:'sect',amount:1}).moved,0,'0.5 pool cannot yield 1 stone');
  assert.strictEqual(ECO.earn(W,0.5,'frac',{fromPool:true}),false,'ECO.earn fromPool must reject <1 fractional amount');
  assert.strictEqual(ECO.earnFromPool(W,1,'frac'),0,'ECO.earnFromPool must return 0 on <1 fractional pool');
  assert.strictEqual(W.world.resourcePool.stones,0.5,'0.5 pool must remain untouched');

  rv.treasury=0;W.world.resourcePool.stones=0;
  const unauth=EXPED.applySiegeResolution(W,rv,'PILLAGE',{quiet:true});
  assert(!unauth.ok&&unauth.reason==='requires-siege-victory','Direct applySiegeResolution without victory token must remain blocked');
  const pSiege1=W.npcs.find(n=>EXPED.isAvailableForExpedition(W,n));
  const sBeforePillage=W.sect.stones;
  const pilRes=EXPED.launchSectSiege(W,[pSiege1],rv.id,{immediate:true,forceWin:true,postResolution:'PILLAGE'});
  assert(pilRes.ok&&pilRes.won&&pilRes.resolution&&pilRes.resolution.stonesLoot===0,'PILLAGE with 0 pool and 0 rival treasury yields 0 stones');
  assert.strictEqual(W.sect.stones,sBeforePillage,'Sect stones unchanged when pool and rival treasury are empty');

  const rv2=W.world.allSects[1];rv2.treasury=30;W.world.resourcePool.stones=100;
  const pSiege2=W.npcs.find(n=>n.id!==pSiege1.id&&EXPED.isAvailableForExpedition(W,n))||pSiege1;
  const sBeforeTrade=W.sect.stones;
  const ftRes=EXPED.launchSectSiege(W,[pSiege2],rv2.id,{immediate:true,forceWin:true,postResolution:'FREE_TRADE'});
  assert(ftRes.ok&&ftRes.won&&ftRes.resolution&&ftRes.resolution.stones===130,'FREE_TRADE must drain rival treasury first then pool up to 130');
  assert.strictEqual(rv2.treasury,0);assert.strictEqual(W.world.resourcePool.stones,0);
  assert.strictEqual(W.sect.stones,sBeforeTrade+130);
  console.log('PASS N01 transferStones, fractional guard and pooled resolution');
 }

 // 3. Autonomy fixes: VOW_ASCETIC_PRECEPT, sect.power unit threshold, queued coalition chronicle, natural vassal distress
 {
  const W=SIM.create('autonomy-guards');EXPED.ensureWorldTopology(W);
  W.sect.stones=50000;ECO.add(W,'meal',60);
  const leader=W.byId[W.sect.masterId];
  leader.cult.stage=6;leader.cult.path='DEMON';
  leader.voluntaryVows={VOW_ASCETIC_PRECEPT:{active:true}};
  const vowedOpps=SECT.AUTONOMY.opportunities(W,leader);
  assert(!vowedOpps.some(o=>o.id.startsWith('covenant:')||o.id.startsWith('infernal:')),'VOW_ASCETIC_PRECEPT must block autonomous demonic covenant/infernal');

  const enemy=W.world.allSects[0];enemy.power=2.0;enemy.attitude=-90;enemy.isVassal=false;
  W.world.allSects.slice(1).forEach(s=>{s.attitude=0;s.treaty='NONE';s.eternalSwornAlly=false;});
  // Test sect.power unit fix directly on leader with no allies (old unit bug: 200 >= 2.0*1.15; fixed: 200 < 640*1.15)
  const origPowerFn=CULT.power;
  CULT.power=()=>200;
  try {
   assert(!SECT.AUTONOMY.opportunities(W,leader).some(o=>o.id.startsWith('siege:')),'Weak leader must not propose solo siege due to sect.power unit mismatch');
  } finally { CULT.power=origPowerFn; }

  const ally=W.world.allSects[1];ally.attitude=85;ally.treaty='ALLIANCE';
  const partyNpc=W.npcs.find(x=>!x.dead&&!x.away&&x.id!==leader.id);
  const chronLenBefore=(W.chronicle&&W.chronicle.length)||0;
  const coal=EXPED.launchCoalitionOffensive(W,[partyNpc],enemy.id,null,{immediate:false,quiet:true});
  assert(coal.ok&&coal.queued,'Coalition should queue march');
  assert(coal.chronicle&&coal.chronicle.titleTh.includes('ระดมทัพ')&&coal.chronicle.consequenceTh.includes('กำลังเดินทาง'),'Queued coalition must not record premature victory');
  const rejected=EXPED.launchCoalitionOffensive(W,[partyNpc],enemy.id,null,{immediate:false,quiet:true});
  assert.strictEqual(rejected.ok,false,'Duplicate coalition must fail');
  assert.strictEqual((W.chronicle&&W.chronicle.length)||0,chronLenBefore+1,'Rejected coalition must not record battle chronicle');

  enemy.isVassal=true;enemy.treaty='VASSAL_TREATY';enemy.lastDistressDay=null;
  W.world.vassalDistressCalls=[];
  const origNext=W.rng.next;
  try {
   W.day=36;W.rng.next=()=>0.99;
   EXPED.daily(W);
   assert.strictEqual(W.world.vassalDistressCalls.length,0,'Vassal distress must not be forced when RNG does not roll it');
   W.rng.next=()=>0.01;
   EXPED.daily(W);
   assert.strictEqual(W.world.vassalDistressCalls.length,1,'Vassal distress must be naturally reachable when conditions and roll align');
   const call=W.world.vassalDistressCalls[0];
   W.day=call.expiresDay+1;
   EXPED.daily(W);
   assert(call.resolved&&call.outcome==='EXPIRED','Overdue vassal distress call must expire naturally');
  } finally { W.rng.next=origNext; }
  console.log('PASS autonomy vow, siege unit scale, coalition chronicle and natural distress');
 }

 // 4. Observer UI world atlas cleanliness
 {
  require('../js/ui.js');
  const { UI: LoadedUI } = require('./load.js');
  const W=SIM.create('ui-observer-atlas');EXPED.ensureWorldTopology(W);
  LoadedUI.G={W};LoadedUI.tab='exp';
  const mapHtml=LoadedUI.rWorldMap(W);
  for(const banned of ['atlasSiegeChoice','atlas-depart','set-vassal-policy','respond-vassal-distress','collect-vassal-tribute','harvest-resource-nodes','explore-micro-location','interact-wandering-figure','recruit-wandering-figure','assign-node-garrison']) {
   assert(!mapHtml.includes(banned),'Observer UI.rWorldMap must omit player command control: '+banned);
  }
  assert(mapHtml.includes('atlas-filter'),'Observer UI.rWorldMap must keep read-only filters');
  const expHtml=LoadedUI.rWorld(W);
  assert(!expHtml.includes('สั่งการทัพ'),'World expeditions banner must use observer-mode wording');
  console.log('PASS observer UI world atlas purity');
 }
}
