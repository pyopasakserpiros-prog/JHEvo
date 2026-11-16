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
