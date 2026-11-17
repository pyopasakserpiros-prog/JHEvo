'use strict';
const assert = require('assert');
const G = require('./load');
const {SIM,CULT,COMBAT,STATS} = G;
const W = SIM.create('life-repair-regressions');
const ET = CULT.EXPERIENCE_TRAITS, AM = COMBAT.ACTION_MASTERY_TRAITS;
let failures=0;
function check(name,fn){try{fn();console.log('PASS',name);}catch(e){failures++;console.error('FAIL',name,e.message);}}
check('experience modifier is applied once',()=>{const n=W.npcs[0];ET.recordExperienceEvent(W,n,'DEFEND_GATE_RAID','raid-1');ET.recordExperienceEvent(W,n,'DEFEND_GATE_RAID','raid-2');STATS.dirty(n);const parts=STATS.explain(n).parts.def.filter(x=>/ประสบการณ์/.test(x[0]));assert.equal(parts.reduce((s,x)=>s+x[2],0),0.1);});
check('active mastery affects derived stats',()=>{const n=W.npcs[1];STATS.dirty(n);const before=STATS.explain(n).v.acc;AM.recordAction(W,n,'longRangeHits',30);STATS.dirty(n);assert.equal(STATS.explain(n).v.acc-before,8);});
check('inactive guard mastery has no passive defence',()=>{const n=W.npcs[2];AM.recordAction(W,n,'coverCount',25);AM.recordAction(W,n,'parryCount',20);AM.recordAction(W,n,'clutchHealCount',12);AM.recordAction(W,n,'formationTicks',40);n.combatHistory.activeMasteryIds=['TRAIT_PARRY_COUNTER','TRAIT_COMBAT_MEDIC','TRAIT_FORMATION_STRATEGIST'];STATS.dirty(n);assert.equal(STATS.explain(n).parts.def.filter(x=>/ทวนพิทักษ์/.test(x[0])).length,0);});
check('recovery is a single terminal transition',()=>{const n=W.npcs[0];ET.resolveTraitRecovery(W,n,'EXP_TRAIT_GATE_WALL_VETERAN');n.h.state.stress=40;ET.resolveTraitRecovery(W,n,'EXP_TRAIT_GATE_WALL_VETERAN');assert.equal(n.h.state.stress,40);});
check('old receipt cannot count again after 512 events',()=>{const n=W.npcs[1];ET.recordExperienceEvent(W,n,'DEFEND_GATE_RAID','old');for(let i=0;i<513;i++)ET.recordExperienceEvent(W,n,'other','k'+i);const before=n.experienceEventLog.counts.DEFEND_GATE_RAID;ET.recordExperienceEvent(W,n,'DEFEND_GATE_RAID','old');assert.equal(n.experienceEventLog.counts.DEFEND_GATE_RAID,before);});
check('all acquired definitions obey the actual core modifier contract',()=>{
  for(const spec of G.JD.LIFE_TRAITS_REGISTRY.GROUP_E){
    if(spec.status==='MERGED')continue;
    const def=G.HC.traitDef(spec.id);assert(Array.isArray(def.modifiers));
    assert(G.HC.traitMods(spec.id,1).every(m=>['ADD','MULT'].includes(m.op)&&Number.isFinite(m.value)));
  }
});
check('fresh NPC generation excludes acquired traits before stat evaluation',()=>{
  for(let i=0;i<50;i++){const n=W.makeNpc({ageYears:20,rank:1,stage:2});assert(!(n.h.traits||[]).some(t=>t.id.startsWith('TR_AC_')));STATS.explain(n);}
});
check('completed mining produces experience through its real yield path',()=>{
  const n=W.npcs[1];for(let i=0;i<6;i++){W.workSteps=(W.workSteps||0)+1;W.t++;G.ECO.mineYield(W,n,5);}
  assert(ET.hasTrait(n,'EXP_TRAIT_DEEP_MINE_TUNNELER'));
});
check('real landed ranged attacks unlock mastery without a grant call',()=>{
  const w=SIM.create('ranged-real-hits'),a=w.npcs[0],b=w.npcs[1];
  for(const n of [a,b]){n.cult.path='XIAN';n.cult.stage=2;STATS.dirty(n);}
  a.x=180;a.y=123;b.x=185;b.y=123;
  const f=COMBAT.startFight(w,[a.id],[b.id],'duel',{serious:true,gather:false});
  for(let i=0;i<26;i++){w.workSteps=(w.workSteps||0)+1;w.t++;b.yield=false;b.fled=false;b.dead=false;b.h.state.hp=G.CULT.hpMax(b);COMBAT.strike(w,f,a,b,{forced:true,M:0.01,noCounter:true,noReflect:true,noProc:true,noIntercept:true});}
  assert(AM.hasTrait(a,'TRAIT_LONG_RANGE_DEADEYE'));
});
check('mercy acts at the real damage/death decision',()=>{
  const w=SIM.create('nonlethal-real-hit'),a=w.npcs[0];
  const b={id:'human-opponent',name:'ผู้ทดสอบ',foe:true,kind:'human',tier:2,hp:100,hpMax:100,power:100,x:185,y:123,act:{id:'idle',ctx:{}},sx:[],buffs:[]};
  w.foes.push(b);w.foeById[b.id]=b;
  AM.recordAction(w,a,'mercifulSubdues',8);assert(AM.isActiveTrait(a,'TRAIT_NONLETHAL_SUBDUER'));
  const f=COMBAT.startFight(w,[a.id],[b.id],'duel',{serious:true,gather:false});
  COMBAT.applyDamage(w,f,a,b,G.CULT.hpMax(b)*100,'test');
  assert(!b.dead);assert(COMBAT.hp(b)>=1);assert(b.yield);
});
check('life counters and work-step phase survive a current-version save',()=>{
  const w=SIM.create('save-life-phase'),n=w.npcs[0];
  w.workSteps=101;w.timePhase=2;ET.emit(w,n,'DEFEND_GATE_RAID');
  const back=SIM.deserialize(SIM.serialize(w));assert.equal(back.workSteps,101);assert.equal(back.timePhase,2);
  const res=ET.emit(back,back.byId[n.id],'DEFEND_GATE_RAID');assert(res.deduplicated);
});
check('life preferences do not mutate RNG or NPC state during scoring',()=>{
  const n=W.npcs[0],before=JSON.stringify(n),rng=W.rng.getState();ET.activityBias(W,n,'leisure',{add(){}});assert.equal(JSON.stringify(n),before);assert.deepEqual(W.rng.getState(),rng);
});
process.exitCode=failures?1:0;
// Each accepted mastery catalog entry must reach the real stat pipeline once.
check('every active mastery applies its declared modifiers to the stat pipeline',()=>{
  const w=SIM.create('all-mastery-effects'),n=w.npcs[0];
  for(const spec of Object.values(AM.TRAIT_DEFS)){
    n.combatHistory={unlockedTraits:[spec.id],activeMasteryIds:[spec.id]};n.actionMasteryTraits=[spec.id];STATS.dirty(n);
    const parts=STATS.explain(n).parts;
    for(const [k,v] of Object.entries(spec.p||{}))assert(parts[k].some(p=>p[0].includes(spec.nameTh)&&p[1]==='p'&&Math.abs(p[2]-v)<1e-9),spec.id+':'+k);
    for(const [k,v] of Object.entries(spec.f||{}))assert(parts[k].some(p=>p[0].includes(spec.nameTh)&&Math.abs(p[2]-(k==='move'?v/100:v))<1e-9),spec.id+':'+k);
  }
});
check('world-construction evidence does not block later work-step events',()=>{
 const w=SIM.create('initial-clock'),n=w.npcs[0];assert.equal(w.workSteps,0);ET.emit(w,n,'DEFEND_GATE_RAID');w.workSteps=1;w.timePhase=2;ET.emit(w,n,'DEFEND_GATE_RAID');assert(ET.hasTrait(n,'EXP_TRAIT_GATE_WALL_VETERAN'));
});
process.exitCode=failures?1:0;
check('real paid discourse replaces an unreachable fictional chess activity',()=>{
 const w=SIM.create('debate-life'),n=w.npcs[0];w.sect.stones=10000;n.h.skills.SCRIPTURE=80;
 for(let i=0;i<2;i++){w.day+=16;const r=G.SECT.GRAND_DAO_DEBATE.holdDebate(w,{speakerId:n.id,difficulty:1,quiet:true});assert(r.ok&&r.victory);}
 assert(n.h.traits.some(t=>t.id==='TR_AC_MASTER_CHESS_ILLUMINATED'));
});
check('advanced real stele study can yield the adapted ancient guidance trait',()=>{
 const w=SIM.create('stele-life'),n=w.npcs[0];n.h.skills.SCRIPTURE=80;
 for(let i=0;i<12;i++){w.t++;w.workSteps++;G.EXPLORE.visit(w,n,'stele');}
 assert(n.h.traits.some(t=>t.id==='TR_AC_ANCIENT_RING_MENTORED'));
});
process.exitCode=failures?1:0;
