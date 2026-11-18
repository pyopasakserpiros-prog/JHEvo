'use strict';
const assert = require('assert');
const G = require('./load.js');
const {SIM,WILD,JD,SK,COMBAT,ECO} = G;
const W = SIM.create('wildlife-variety-identity');
const catalogBefore = JSON.stringify(JD.BEASTS);
const unique = new Set();
const signatures = new Set();
let entries = 0;
for (const [zoneId,zone] of Object.entries(WILD.zones)) {
 for (const pool of zone.pools) for (const id of pool.speciesIds) {
  WILD.init(W);W.wildlife.beasts=[];
  const sp=WILD.speciesDefinition(id);
  const b=WILD.spawn(W,zoneId,pool.id,{speciesId:id});
  assert(b, `Unspawnable pool entry ${zoneId}/${pool.id}/${id}`);
  unique.add(id);entries++;
  for(const [key,value] of Object.entries(sp)) {
   if (['id','family','archetype'].includes(key)) continue;
   assert.deepStrictEqual(b[key],value, `${id} loses source field ${key}`);
  }
  assert.strictEqual(b.hpMax,Math.round((sp.cp*1.3+30)*4));
  assert(b.elementProfile && b.element === b.elementProfile.primary);
  assert(b.skl.length>0 && b.skl.every(p=>SK.ARCH[p.arch]&&Number.isFinite(p.M)&&p.element===b.element));
  assert(b.drops.every(id=>ECO.matById[id]),`${id} has unusable drop IDs`);
  if(sp.specialAbility) assert(b.skl.some(p=>p.id===sp.specialAbility.id),`${id} loses named ability`);
  signatures.add(b.skl.map(p=>p.arch+':'+(p.ctrl||'')).join(','));
  if(sp.visual){b.visual.body='mutated';assert.notStrictEqual(WILD.speciesDefinition(id).visual.body,'mutated');}
 }
}
const expected=JD.BEASTS.species.concat(JD.BEASTS.kings).filter(s=>WILD.isLandSpecies(WILD.speciesDefinition(s.id))).map(s=>s.id);
assert.deepStrictEqual([...unique].sort(),expected.sort(),'Every eligible land species must have a reachable pool');
assert(signatures.size>=10,'Beasts must have varied working combat roles');
assert.strictEqual(JSON.stringify(JD.BEASTS),catalogBefore,'Spawning must not mutate source catalogs');
for(const z of Object.values(WILD.zones)) for(const p of z.pools)for(const id of p.speciesIds){
 const sp=WILD.speciesDefinition(id);assert(WILD.isLandSpecies(sp));
 if(p.catalogExpansion)assert(!(sp.archetype==='AQUATIC'||sp.family==='AQUATIC'));
}
// Reduced drop probabilities must allow a real no-material outcome.
W.wildlife.beasts=[];
const noDrop=WILD.spawn(W,'meadow','meadow_ecology_t1',{speciesId:'ECO2_BEAST_CANINE_1'});
const hunter=W.npcs[0];hunter.inv.mats={};noDrop.dead=true;W.foeById[noDrop.id]=noDrop;
const oldChance=W.rng.chance;W.rng.chance=()=>false;
try { WILD.finish(W,{ctx:{beastId:noDrop.id,hunterId:hunter.id}},'A'); }
finally { W.rng.chance=oldChance; }
assert.deepStrictEqual(hunter.inv.mats,{});
// Demonstrate real skill execution and named abilities in the combat engine.
let casts=0;
for(const name of ['BEAST_MIST_WOLF','ECO2_BEAST_AVIAN_4','ECO2_BEAST_SERPENT_3','BEAST_V240_ABYSSAL_IRON_BEAR','BEAST_V240_CELESTIAL_JADE_QILIN_STAG']){
 const zEntry=Object.entries(WILD.zones).find(([_,z])=>z.pools.some(p=>p.speciesIds.includes(name)));
 assert(zEntry, name);
 const [zone,z]=zEntry,pool=z.pools.find(p=>p.speciesIds.includes(name));
 W.wildlife.beasts=[];const a=WILD.spawn(W,zone,pool.id,{speciesId:name});
 a.x=120;a.y=145;a.hp=a.hpMax*0.35;a.act={id:'fight',ctx:{}};a.sx=[];
 a.skl=[a.specialAbility?a.skl.find(p=>p.id===a.specialAbility.id):a.skl[1]||a.skl[0]];
 const d={id:'identity_target',name:'เป้าทดสอบ',foe:true,kind:'beast',tier:a.tier,power:a.power,hp:a.hpMax,hpMax:a.hpMax,x:121,y:145,skl:[],sx:[],act:{id:'fight',ctx:{}}};
 W.foes=[a,d];W.foeById={[a.id]:a,[d.id]:d};
 const f={id:++W.fightSeq,kind:'wild',serious:true,A:[a.id],B:[d.id],ctx:{}};
 COMBAT.attack(W,f,a,d);
 assert(a.castFx,`${name} must execute its skill through combat, not just retain a label`);
 casts++;
}
// Capture metadata must be enforced, with real personal offerings when required.
const tameNpc=W.npcs[0], oldRead=G.MARTIAL.skillRead;
G.MARTIAL.skillRead=()=>0;
try {
 assert(!WILD.captureEligibility(tameNpc,{tameable:false}).allowed);
 assert(WILD.captureEligibility(tameNpc,{captureRule:'WEAKEN_BELOW_25_PCT_OR_BEAST_TAMING_65',hp:20,hpMax:100}).allowed);
 assert(!WILD.captureEligibility(tameNpc,{captureRule:'ANCESTRAL_PACT_OR_BEAST_TAMING_85'}).allowed);
 const herb=Object.values(ECO.matById).find(m=>m.category==='HERB'&&m.tier>=4);
 tameNpc.inv.mats={[herb.id]:1};
 assert.strictEqual(WILD.captureEligibility(tameNpc,{captureRule:'OFFER_SPIRIT_HERB_OR_BEAST_TAMING_70',tier:6}).offeringMatId,herb.id);
 G.MARTIAL.skillRead=()=>85;
 assert(WILD.captureEligibility(tameNpc,{captureRule:'ANCESTRAL_PACT_OR_BEAST_TAMING_85'}).allowed);
} finally {G.MARTIAL.skillRead=oldRead;}
const saved=SIM.deserialize(SIM.serialize(W));
assert.deepStrictEqual(saved.wildlife.beasts.map(b=>({id:b.speciesId,ability:b.specialAbility,element:b.elementProfile,skills:b.skl})), W.wildlife.beasts.map(b=>({id:b.speciesId,ability:b.specialAbility,element:b.elementProfile,skills:b.skl})));
console.log(`PASS ${entries} pool entries, ${unique.size} species, ${signatures.size} skill sets, ${casts} real casts, source identity and catalog isolation`);

// Regional companions bind from real wild encounters through the NPC's hunt action.
{
 const {AI,CULT,EXPED} = G;
 const specs = JD.CORE.regionalCompanions;
 assert.deepStrictEqual(specs.map(s=>s.tier),[6,6,5,5,4,4,3,3,2,2,2,2,2,1,1,1,1,1]);
 assert.strictEqual(new Set(specs.map(s=>s.id)).size,18);
 const encounter = (spec, onRoll=true) => {
  const world = SIM.create('regional-bond-' + spec.id);
  const npc = world.byId[world.sect.masterId];
  npc.cult.path='XIAN'; npc.cult.stage=spec.tier;
  npc.h.interests.beasts=100;
  npc.h.personality.empathy=100;
  npc.h.skills.BEAST_TAMING=80;
  npc.h.state.energy=90;
  WILD.init(world);
  const zone = Object.values(WILD.zones).find(z=>z.pools.some(p=>p.speciesIds.includes(spec.sourceId)));
  assert(zone, 'wild source must have a reachable encounter');
  const pool = zone.pools.find(p=>p.speciesIds.includes(spec.sourceId));
  const beast = WILD.spawn(world,zone.id,pool.id,{speciesId:spec.sourceId});
  assert(beast && beast.drops.length, 'existing live source and material loop');
  npc.x=beast.x; npc.y=beast.y;
  npc.act={id:'wildHunt',stage:'do',ctx:{}};
  ECO.add(world,'grain',200);
  world.rng.chance=()=>onRoll;
  return {world,npc,beast,attempt:()=>AI.ACTS.wildHunt.start(npc,world,{beastId:beast.id})};
 };
 for (const spec of specs) {
  const {world,npc,beast,attempt}=encounter(spec);
  const grain=ECO.count(world,'grain'), kills=world.wildlife.kills||0;
  assert(attempt(), spec.id);
  const pet=npc.pets.find(p=>p.speciesId===spec.id);
  assert(pet, spec.id + ' binds through AI.ACTS.wildHunt');
  assert.strictEqual(pet.tier,spec.tier);
  assert.strictEqual(pet.element,beast.element);
  assert.strictEqual(pet.role,spec.role);
  assert.strictEqual(pet.provenance,'regional_bond');
  assert.strictEqual(pet.originZone,beast.zone);
  if (spec.tier <= 2) {
   assert(Object.values(WILD.zones).some(z=>!z.legendary && z.pools.some(p=>!p.legendary && p.speciesIds.includes(spec.sourceId))));
   assert(WILD.zones.meadow.pools.some(p=>!p.legendary && p.speciesIds.includes(spec.sourceId)));
  }
  assert.strictEqual(pet.growthStage,1);
  assert(pet.active && beast.captured && beast.gone && !beast.dead);
  assert.strictEqual(ECO.count(world,'grain'),grain-(spec.tier>=4?2:1));
  assert.strictEqual(world.wildlife.kills||0,kills,'bonding does not settle a kill or give its rewards');
  assert.strictEqual(attempt(),false);
  assert.strictEqual(npc.pets.filter(p=>p.speciesId===spec.id).length,1);
  const stats=CULT.petStatBonuses(npc);
  assert(stats && Object.values(stats.p||{}).concat(Object.values(stats.f||{})).some(v=>v!==0));
  const trip=()=>EXPED.createParty(world,[npc],{useQinggong:false});
  assert.strictEqual(trip().hasMount,false);
  pet.growthStage=2;
  const mounted=trip();
  assert.strictEqual(mounted.durationMultiplier,({HAWK:.86,GOAT:.92})[spec.key]||1);
  assert.strictEqual(mounted.capacityMultiplier,({HAWK:1.4,GOAT:1.15})[spec.key]||1);
  const loaded=SIM.deserialize(SIM.serialize(world));
  assert.strictEqual(loaded.byId[npc.id].pets[0].uid,pet.uid);
  assert.strictEqual(loaded.byId[npc.id].pets[0].originZone,beast.zone);
  assert.strictEqual(loaded.byId[npc.id].regionalBondReadyAt,npc.regionalBondReadyAt);
 }
 const noticed=encounter(specs[0]);
 noticed.beast.aggressive=true;
 noticed.npc.act.ctx.beastId=noticed.beast.id;
 noticed.world.t=Math.ceil(noticed.world.t/15)*15+15;
 WILD.tick(noticed.world);
 assert(noticed.beast.captured && !noticed.beast.fighting, 'a planned NPC approach survives an aggressive encounter');
 const lowSkill=encounter(specs[0]);
 lowSkill.npc.h.skills.BEAST_TAMING=0;
 lowSkill.attempt();
 assert(!lowSkill.beast.regionalBondTried && !(lowSkill.npc.pets||[]).length,'high forms require actual skill');
 const lowStage=encounter(specs[0]);
 lowStage.npc.cult.stage=1;
 lowStage.attempt();
 assert(!lowStage.beast.regionalBondTried && !(lowStage.npc.pets||[]).length,'high forms require actual cultivation');
 const shortReprieve=encounter(specs.at(-2),false);
 shortReprieve.beast.aggressive=false;
 const before=ECO.count(shortReprieve.world,'grain');
 assert(shortReprieve.attempt());
 assert(!shortReprieve.beast.gone && shortReprieve.beast.regionalBondTried && !(shortReprieve.npc.pets||[]).length);
 assert.strictEqual(ECO.count(shortReprieve.world,'grain'),before-1,'failed offer costs bait but leaves a live wild animal');
 const scarce=encounter(specs.at(-1));
 ECO.take(scarce.world,'grain',ECO.count(scarce.world,'grain'));
 scarce.attempt();
 assert(!scarce.beast.regionalBondTried && !(scarce.npc.pets||[]).length,'protect the food reserve');
 const route=encounter(specs.find(s=>s.key==='GOAT'));
 assert(route.attempt());
 const goat=route.npc.pets[0];
 goat.level=4;
 CULT.ensurePets(route.npc);
 const ex=EXPED.depart(route.world,[route.npc],'gather');
 assert(ex && ex.mount[0].uid===goat.uid);
 assert.strictEqual(EXPED.travelMount(route.npc),goat);
 assert(EXPED.travelStep(route.world,route.npc));
 assert(route.npc.path && !route.npc.aerialFlightActive);
 const savedRoute=SIM.deserialize(SIM.serialize(route.world));
 assert.strictEqual(EXPED.travelMount(savedRoute.byId[route.npc.id]).uid,goat.uid);
 goat.fatigue=90;
 assert.strictEqual(EXPED.travelMount(route.npc),null);
 goat.fatigue=0;
 route.npc.act={id:'fight'};
 assert.strictEqual(EXPED.travelMount(route.npc),null);
 route.npc.act={id:'idle',ctx:{}};
 route.npc.away=true;
 route.npc.travel=null;
 EXPED.resolve(route.world,ex,[route.npc]);
 assert.strictEqual(route.npc.travel.to,'home');
 assert.strictEqual(EXPED.travelMount(route.npc),goat);
 console.log('PASS regional companions T6 to T1, autonomous bonding, difficulty, failure, conservation, role effects, mount and save');
}
