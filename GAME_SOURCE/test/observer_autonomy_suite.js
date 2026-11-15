'use strict';
const assert=require('assert');
const g=require('./load.js');
const {SIM,SECT,HC,CULT,AI,ECO,EXPED}=g;
function fixture(seed='autonomy-rules') {
 const W=SIM.create(seed),n=W.npcs[0];W.day=500;W.sect.stones=15000;W.sect.stock.meal=100;
 n.cult.stage=7;n.h.state.energy=90;n.h.personality.integrity=90;n.h.personality.empathy=90;n.h.personality.courage=90;n.h.personality.generosity=90;n.h.values.knowledgeCraft=90;n.h.interests.exploring=90;n.h.values.freedom=90;
 HC.bump(n);return {W,n};
}
function choose(W,n,prefix) {
 const options=SECT.AUTONOMY.opportunities(W,n),option=options.find(o=>o.id.startsWith(prefix));
 assert(option,'Reachable opportunity '+prefix);assert(option.score>0);
 const weighted=W.rng.weighted;
 W.rng.weighted=function(xs,w){return xs.some(o=>o.id==='wait')?xs.find(o=>o.id===option.id):weighted.call(this,xs,w);};
 let result;try{result=SECT.AUTONOMY.consider(W,n);}finally{W.rng.weighted=weighted;}
 assert(result.ok,'Executable opportunity '+prefix+': '+JSON.stringify(result));return result;
}
{
 const {W,n}=fixture();const rng=W.rng.getState();SECT.AUTONOMY.opportunities(W,n);assert.deepStrictEqual(W.rng.getState(),rng,'Eligibility uses no random draws');
 const weighted=W.rng.weighted;W.rng.weighted=xs=>xs.find(o=>o.id==='wait');
 assert.strictEqual(SECT.AUTONOMY.consider(W,n).reason,'wait');W.rng.weighted=weighted;
 assert(!n.autonomousOpportunities,'Waiting creates no completed event');
 n.away=true;assert.strictEqual(SECT.AUTONOMY.opportunities(W,n).length,0);n.away=false;
 n.act={id:'fight'};assert.strictEqual(SECT.AUTONOMY.opportunities(W,n).length,0);n.act={id:'idle'};
 n.jail=W.t+100;assert.strictEqual(SECT.AUTONOMY.opportunities(W,n).length,0);n.jail=0;
 console.log('PASS eligibility, purity, unavailable actors and genuine wait option');
}
{
 const {W,n}=fixture('autonomy-oath');choose(W,n,'oath:');assert(n.daoOath?.upheld);
 assert(!SECT.AUTONOMY.opportunities(W,n).some(o=>o.id.startsWith('oath:')));
 const loaded=SIM.deserialize(SIM.serialize(W));assert.deepStrictEqual(loaded.byId[n.id].autonomousOpportunities,n.autonomousOpportunities);
 console.log('PASS voluntary oath, no repeat and save/load cooldown');
}
{
 const {W,n}=fixture('autonomy-core');n.cult.path='BODY';W.sect.stock.MAT_BP_BOAR_CORE_2=3;
 choose(W,n,'core:MAT_BP_BOAR_CORE_2');assert.strictEqual(W.sect.stock.MAT_BP_BOAR_CORE_2,2);assert(n.ingestedBeastCores.some(c=>c.id==='MAT_BP_BOAR_CORE_2'));
 assert(!SECT.AUTONOMY.opportunities(W,n).some(o=>o.id==='core:MAT_BP_BOAR_CORE_2'));
 console.log('PASS core ingestion consumes real stock, leaves reserve and prevents duplicate core');
}
{
 const {W,n}=fixture('autonomy-marrow');n.dormantBloodline={id:'IMMORTAL_SOLAR_BLOODLINE'};delete n.ancientBloodline;
 choose(W,n,'marrow');assert(n.ancientBloodline.awakened);assert(!SECT.AUTONOMY.opportunities(W,n).some(o=>o.id==='marrow'));
 const total=W.sect.stones+W.world.resourcePool.stones;choose(W,n,'totem:');assert.strictEqual(W.sect.stones+W.world.resourcePool.stones,total);assert.strictEqual(W.sect.totemPillars.erectedByNpcId,n.id);
 console.log('PASS dormant bloodline and paid NPC totem construction');
}
{
 const {W,n}=fixture('autonomy-seal');n.stats.sparStreak=10;n.stats.crafted=10;n.stats.soloBossWins=1;n.cult.toxic=0;
 for(const id of ['seal:ten','seal:pure','seal:boss'])choose(W,n,id);
 assert.strictEqual(new Set(n.daoSeals.map(s=>s.id)).size,3);
 console.log('PASS earned Dao seal opportunities');
}
{
 const {W,n}=fixture('autonomy-micro');choose(W,n,'micro:');assert(W.sect.microLocations.totalRuns>0);
 const before=W.world.expeds.length;for(const node of Object.values(W.world.resourceNodes)){node.garrison.defensePower=1;node.ownerSectId='NONE';}
 choose(W,n,'claim:');assert(W.world.expeds.length>before);assert(n.away&&n.expId);assert(W.world.expeds.at(-1).supplies>0);
 console.log('PASS autonomous micro-location choice and actual timed resource expedition');
}
{
 const {W,n}=fixture('autonomy-bounty');SECT.BOUNTY_BOARD.refreshBounties(W);const result=choose(W,n,'bounty:');assert.strictEqual(result.result.bounty.status,'CLAIMED');
 const disciple=W.npcs[1];disciple.cult.stage=5;disciple.h.values.knowledgeCraft=90;HC.bump(disciple);
 W.world.allSects[0].attitude=50;choose(W,disciple,'exchange:');assert(disciple.exchangeRecord);
 console.log('PASS bounty board and exchange-study decisions');
}
{
 const {W,n}=fixture('autonomy-recruit');const figure=EXPED.generateWanderingFigure(W,'SWORD_SEEKER');figure.affinity=70;W.world.wanderingFigures=[figure];const pop=W.npcs.length;
 choose(W,n,'recruit:');assert.strictEqual(W.npcs.length,pop+1);
 const total=W.sect.stones+W.world.resourcePool.stones;choose(W,n,'craft-exchange:');assert.strictEqual(W.sect.stones+W.world.resourcePool.stones,total);
 console.log('PASS recruitment and funded foreign craft trade');
}
{
 const {W,n}=fixture('autonomy-politics');W.sect.internalPolitics.undercurrent=50;
 choose(W,n,'appease');assert(W.sect.internalPolitics.undercurrent<50);
 SECT.proposeCliqueNomination(W,'martial',{quiet:true});choose(W,n,'nomination:');assert(W.sect.internalPolitics.nominations.some(x=>x.status==='RESOLVED'));
 choose(W,n,'anchor:');assert(W.sect.leylineGrid.anchors.some(a=>a.guardNpcId));
 choose(W,n,'seclusion-policy');assert.strictEqual(W.sect.automationPolicy.autoTriggerClosedDoorOnBottleneck,n.h.values.martialPeak>=60&&W.sect.stones>1500);
 console.log('PASS political nominations, reconciliation, anchor assignment and NPC policy');
}
{
 const {W,n}=fixture('autonomy-action');assert(AI.ACTS.opportunity.can(n,W));
 const weighted=W.rng.weighted;let seen=false;
 W.rng.weighted=function(xs,w){if(xs.some(c=>c.id==='opportunity'&&Number.isFinite(c.u))){const o=xs.find(c=>c.id==='opportunity');assert(w(o)>0);seen=true;}return weighted.call(this,xs,w);};
 AI.decide(W,n);W.rng.weighted=weighted;assert(seen,'Ordinary AI chooser includes the opportunity action with nonzero probability');
 console.log('PASS real AI chooser integration without forcing its selected action');
}
console.log('PASS observer autonomy capability suite');
{
 const {W,n}=fixture('autonomy-bonds');W.sect.stones=1000;
 const jh=SECT.JIANGHU.ensure(W);jh.karmaBonds.friend={id:'friend',npcId:n.id,kind:'SWORN_ALLY',figureNameTh:'สหาย',stage:3};
 const total=W.sect.stones+W.world.resourcePool.stones;choose(W,n,'ally-aid:');assert.strictEqual(W.sect.stones+W.world.resourcePool.stones,total);
 jh.karmaBonds.rival={id:'rival',npcId:n.id,kind:'NEMESIS',figureNameTh:'คู่อาฆาต',stage:2,power:1,grudge:60};choose(W,n,'nemesis:');
 console.log('PASS organic ally aid and nemesis opportunities');
}
{
 const {W,n}=fixture('autonomy-institutions');SECT.CARAVAN_AUCTION.openMidnightBlackMarket(W,{quiet:true});choose(W,n,'black-market:');
 W.sect.posts.martial=W.npcs[1].id;choose(W,n,'stipend');assert(W.npcs[1].lastOfficeBonusPaid>0);
 const pk=SECT.PEAKS.ensure(W),peak=Object.values(pk.byId)[0];peak.founded=true;peak.masterId=n.id;n.peakId=peak.id;peak.policy.allocationRule='INVALID';choose(W,n,'peak-policy');assert.notStrictEqual(peak.policy.allocationRule,'INVALID');
 peak.masterId=W.npcs[1].id;n.sat=10;choose(W,n,'leave-peak');assert(n.isIndependentFromPeak);
 console.log('PASS market, office reward, peak policy and voluntary independence');
}
{
 const {W,n}=fixture('autonomy-schism');W.sect.activeSchismCrisis={status:'ACTIVE',leaderId:W.npcs[1].id,leaderNameTh:'ผู้นำก๊ก',demandedStones:100,followerIds:[]};
 choose(W,n,'schism');assert.strictEqual(W.sect.activeSchismCrisis.status,'RESOLVED_NEGOTIATED');
 console.log('PASS actual schism resolution under an available leader');
}
{
 const {W,n}=fixture('autonomy-siege');n.h.personality.aggression=80;HC.bump(n);W.world.allSects[0].attitude=-90;W.world.allSects[0].power=1;
 choose(W,n,'siege:');assert(W.world.expeds.some(e=>e.kind==='sect_siege'&&!e.done));assert(n.away);
 console.log('PASS hostile siege decision queues a timed journey, not instant conquest');
}
{
 const {W,n}=fixture('autonomy-peak-succession');const pk=SECT.PEAKS.ensure(W),peak=Object.values(pk.byId)[0];peak.founded=true;peak.masterId=null;peak.deputyId=null;W.npcs[1].cult.path=peak.paths[0];W.npcs[1].rank=4;
 choose(W,n,'peak-leader:');assert(peak.masterId||peak.deputyId);
 console.log('PASS NPC peak appointments after a vacancy');
}
{
 const W=SIM.create('trace');
 for(let t=0;t<30000;t++)SIM.tick(W);
 const realized=W.npcs.flatMap(n=>Object.keys(n.autonomousOpportunities||{}).filter(id=>!id.startsWith('@')));
 assert(realized.length>0,'A seeded normal simulation realizes an opportunity without UI calls or forced RNG');
 const loaded=SIM.deserialize(SIM.serialize(W));
 for(let t=0;t<120;t++)SIM.tick(loaded);
 assert(loaded.npcs.length>0);
 console.log('PASS 30,000 normal simulation ticks, realized NPC choices and resumed save: '+realized.join(', '));
}
{
 const {COMBAT}=g;const {W,n}=fixture('autonomy-earned-records'),other=W.npcs[1];
 COMBAT.sparEnd(W,n,other,{rounds:5,sc:{a:100,b:10}});assert.strictEqual(n.stats.sparStreak,1);
 COMBAT.sparEnd(W,n,other,{rounds:5,sc:{a:10,b:100}});assert.strictEqual(n.stats.sparStreak,0);
 EXPED.spawnRaid(W,'beast');const boss=W.foes[0];boss.boss=true;
 COMBAT.slay(W,{id:'solo-proof',A:[n.id],B:[boss.id],serious:true,kind:'raid',ctx:{}},n,boss);
 assert.strictEqual(n.stats.soloBossWins,1,'An actual boss kill records the prerequisite');
 n.pets=[{active:true,fatigue:0}];
 COMBAT.slay(W,{id:'pet-proof',A:[n.id],B:[boss.id],serious:true,kind:'raid',ctx:{}},n,{...boss,id:'boss-pet-proof',dead:false,_slaying:false});
 assert.strictEqual(n.stats.soloBossWins,1,'Active pet assistance disqualifies solo record');
 n.pets=[];
 COMBAT.slay(W,{id:'side-b-proof',A:[boss.id],B:[n.id],serious:true,kind:'raid',ctx:{}},n,{...boss,id:'boss-b-proof',dead:false,_slaying:false});
 assert.strictEqual(n.stats.soloBossWins,2,'Solo NPC on either side can earn the record');

 console.log('PASS real spar results and combat death recording for Dao seals');
}
{
 const {W,n}=fixture('autonomy-recipe-reachability');n.cult.stage=9;n.h.skills.FORGING=100;W.sect.recipeTier=7;W.map.byId.forge.level=SECT.FACILITY_SPECS.forge.maxLevel;
 W.rng.next=()=>0;W.rng.gauss=()=>0;W.rng.chance=()=>false;
 const ids=['05','06','10','11','13','16','22','24'].map(x=>'REC_V222_EQ_'+x);
 for(const id of ids){const r=ECO.recipeById[id];if(r.discoverable)W.sect.knownRecipes.push(id);
  for(const inp of r.inputs)W.sect.stock[inp.matId]=100;
  assert(ECO.craftEligible(W,n,r,'forge'),'Recipe reachable with a naturally attainable max-level forge: '+id);
  const ctx={rid:id};assert(ECO.reserveInputs(W,r,ctx,n));assert(ECO.finishCraft(W,n,r,ctx).ok);
  assert(W.sect.gear.some(it=>it.id===r.outItemId),'Recipe produces its actual authored equipment');
 }
 for(const it of Object.values(ECO.itemById).filter(it=>it.phases?.length>=2))assert(Object.values(ECO.recipeById).some(r=>r.outItemId===it.id),'Multiphase pill must have a recipe: '+it.id);
 console.log('PASS eight formerly impossible forge recipes actually crafted and all 48 multiphase pills have production recipes');
}

{
 const {W,n}=fixture('autonomy-tomb');n.h.skills.FORGING=100;n.h.skills.SCRIPTURE=100;HC.bump(n);
 choose(W,n,'tomb-discovery:');const site=W.sect.immortalTombs.activeSites[0];
 for(let i=1;i<=3;i++){W.day+=31;choose(W,n,'tomb:'+site.siteId);assert.strictEqual(site.currentLayer,i);}
 assert(site.completed);assert(W.sect.immortalTombs.unlockedLegacies.length);
 console.log('PASS NPC tomb discovery and three real excavation layers');
}
{
 const {W,n}=fixture('autonomy-crisis');const weighted=W.rng.weighted;
 W.rng.weighted=xs=>xs.find(o=>o.id==='crisis');assert(EXPED.considerNaturalEndgameEvents(W).ok);W.rng.weighted=weighted;
 const arc=W.world.worldCrisisState.activeArc;assert.strictEqual(arc.chapter,0);
 for(let i=1;i<=3;i++){W.day+=31;choose(W,n,'crisis:');assert.strictEqual(arc.chapter,i);}
 assert(arc.completed);assert(W.sect.endgameMandate);
 console.log('PASS natural crisis opportunity and three optional leader responses');
}
{
 const {W,n}=fixture('autonomy-demon');n.cult.path='DEMON';HC.bump(n);
 const total=W.sect.stones+W.world.resourcePool.stones;choose(W,n,'covenant:');assert(n.demonPact);
 assert.strictEqual(W.sect.stones+W.world.resourcePool.stones,total);
 choose(W,n,'infernal:');assert(W.sect.infernalShrine.bloodTributes>0);
 assert.strictEqual(W.sect.stones+W.world.resourcePool.stones,total);
 console.log('PASS willing NPC covenant and paid infernal offering with conserved funds');
}
{
 const {W,n}=fixture('autonomy-coalition');n.h.personality.aggression=80;HC.bump(n);
 W.world.allSects[0].attitude=-90;W.world.allSects[0].power=1;W.world.allSects[1].attitude=90;
 choose(W,n,'coalition:');const ex=W.world.expeds.find(e=>e.kind==='sect_siege'&&!e.done);assert(ex);assert(n.away);
 console.log('PASS coalition choice queues actual travel with eligible allies');
}
{
 const {W,n}=fixture('autonomy-beacon'),enemy=W.world.allSects[0];enemy.attitude=-90;enemy.power=1e8;W.world.allSects[1].attitude=90;
 const weighted=W.rng.weighted;W.rng.weighted=xs=>xs.find(o=>o.id==='siege:'+enemy.id);
 assert(EXPED.considerNaturalEndgameEvents(W).ok);W.rng.weighted=weighted;
 assert.strictEqual(W.world.activeEnemySiege.status,'BESIEGING');choose(W,n,'beacon');
 assert(W.world.activeEnemySiege.beaconLit);assert(W.world.activeEnemySiege.reinforcements.length>0);
 console.log('PASS hostile world siege opportunity and actual allied beacon response');
}

{
 const {W,n}=fixture('autonomy-siege-natural-conclusion');const enemy=W.world.allSects[0];enemy.power=1e8;
 EXPED.startEnemyGrandSiege(W,enemy.id);W.day+=20;const total=W.sect.stones+W.world.resourcePool.stones;
 const result=EXPED.considerNaturalEndgameEvents(W);assert(result.ok);assert.strictEqual(result.won,false);assert.strictEqual(result.spoilsStones,0);
 assert.strictEqual(W.world.activeEnemySiege.status,'BREACHED');assert(!W.world.activeEnemySiege.beaconLit);
 assert.strictEqual(W.sect.stones+W.world.resourcePool.stones,total);
 assert(!JSON.stringify(result.chronicle).includes('แตกพ่ายยับเยิน'));
 const next=EXPED.startEnemyGrandSiege(W,enemy.id,{enemyPower:1});W.day+=20;
 const before=W.sect.stones+W.world.resourcePool.stones;const win=EXPED.considerNaturalEndgameEvents(W);assert(win.won);assert.strictEqual(next.enemySiege.status,'REPELLED');
 assert.strictEqual(W.sect.stones+W.world.resourcePool.stones,before);
 console.log('PASS siege resolves naturally without allies or NPC intervention; accurate loss and conserved victory spoils');
}
