const assert = require('node:assert/strict');
const G = require('./load');
const { WILD, SIM, COMBAT, AI, HC, CULT, MAP } = G;
WILD.ORDINARY_TARGET = 1;
function prepare(n, stage, pos) {
  n.cult ||= {path:'XIAN',sub:'NONE',stage:1,prog:0,mantra:null,techs:[],toxic:0,since:1};
  n.cult.path='XIAN'; n.cult.stage=stage; n.cult.track=null;
  n.rank=4; n.hidden=false; n.inj=[];
  n.h.personality.courage=83; n.h.personality.caution=36;
  n.h.interests.combat=76;
  HC.bump(n);
  Object.assign(n,pos);
  Object.assign(n.h.state, {hp:CULT.hpMax(n),qi:CULT.qiMax(n),satiety:95,energy:95,rest:95});
  n.act={id:'idle',stage:'do',left:99,ctx:{},why:[]};
}
for (const [grade, speciesId, min, stage, population] of [
  ['T7','BEAST_ABYSSAL_DRAGON',4,8,12],
  ['LEGENDARY','ECO2_BEAST_MYTHIC_4',12,8,28],
  ['TRANSCENDENT','BEAST_ABYSSAL_DRAGON',51,9,76]
]) {
  let W=SIM.create('valley-assemblies-'+grade);
  let b=WILD.spawn(W,'legend',null,{speciesId,...(grade==='T7'?{}:{raidGrade:grade})});
  assert(b && !b.aggressive && WILD.raidProfile(b).minimum===min);
  const shore=MAP.nearestFree(W.map,b.x-12,b.y);
  assert(shore && Number.isFinite(shore.x));
  const pos={x:shore.x+.5,y:shore.y+.5};
  while (W.npcs.length<population) assert(SIM.addNpc(W,{rank:4}));
  const blocked=W.npcs.at(-1);
  for (const n of W.npcs) prepare(n,n===blocked?1:stage,pos);
  const outsiderHp=blocked.h.state.hp;
  blocked.x=b.x;blocked.y=b.y;
  blocked.act.id='breakthrough';
  assert(!WILD.startFight(W,W.npcs[0],b));
  W.t=Math.ceil(W.t/5)*5;
  WILD.tick(W);
  assert.equal(W.fights.length,0);
  assert(b.raidAssembly && b.raidAssembly.members.length>0);
  for(let i=0;i<240&&!b.fighting;i++){
    W.t++;
    for(const n of W.npcs){
      if(n.act.id==='wildHunt'&&n.act.stage==='move'&&AI.stepMove(W,n)) AI.arrive(W,n);
    }
    WILD.tick(W);
  }
  assert(b.fighting, JSON.stringify(b.raidAssembly));
  let f=W.fights.find(f=>f.id===b.fighting);
  assert(f.A.length>=min && f.A.length <= Math.floor(population*.75));
  assert(!f.A.includes(blocked.id) && blocked.act.id==='breakthrough');
  assert(!b.raidAssembly && f.A.every(id=>W.byId[id].act.ctx.fid===f.id));
  console.log(grade,'team', f.A.length, 'remaining',population-f.A.length, 'HP',b.hpMax,'t',W.t);
  const saved=SIM.deserialize(SIM.serialize(W));
  assert(saved && saved.wildlife.beasts.find(x=>x.id===b.id)===saved.foeById[b.id]);
  assert(saved.fights.find(x=>x.id===f.id).A.length===f.A.length);
  W=saved; b=W.foeById[b.id]; f=W.fights.find(x=>x.id===f.id);
  const pulseTarget=W.byId[f.A[0]];
  Object.assign(pulseTarget,{x:b.x+.75,y:b.y});
  const beforePulse=COMBAT.hp(pulseTarget);
  W.t=f.ctx.nextRaidPulse;
  WILD.tick(W);
  assert(b.raidPulse);
  W.t=b.raidPulse.at;
  WILD.tick(W);
  assert(b.raidPulseFlash && COMBAT.hp(pulseTarget)<beforePulse);
  assert.equal(COMBAT.hp(W.byId[blocked.id]), outsiderHp);
  // Exercise the real foe and party actions in a live round after load.
  W.t++;
  for(const id of f.A) COMBAT.fightStep(W,W.byId[id]);
  COMBAT.foeStep(W,b);
  COMBAT.tick(W);
  assert(!f.over);
}
for(const [id,tier] of [['ECO2_BEAST_AQUATIC_1',1],['ECO2_BEAST_MYTHIC_6',7]]){
  const W=SIM.create('water-'+tier);const b=WILD.spawn(W,'river','river_t'+tier,{speciesId:id});
  const n=W.npcs[0];
  assert(b&&b.bank&&!b.aggressive&&!b.legendary);
  assert(MAP.blocked(W.map,b.x,b.y)&&!MAP.blocked(W.map,b.bank.x,b.bank.y));
  prepare(n,tier===1?1:8,{x:b.bank.x+.5,y:b.bank.y+.5});
  assert(WILD.startFight(W,n,b));
  const old=b.hp;
  let hitsFromWater = 0;
  const apply = COMBAT.applyDamage;
  COMBAT.applyDamage = (world, fight, attacker, defender, ...args) => {
    const before = defender ? COMBAT.hp(defender) : 0;
    const result = apply(world, fight, attacker, defender, ...args);
    if (attacker === b && defender === n && COMBAT.hp(n) < before) hitsFromWater++;
    return result;
  };
  const oldPos=[b.x,b.y];
  const f=W.fights.at(-1);
  for(let i=0;i<38&&!f.over;i++){W.t++;COMBAT.fightStep(W,n);COMBAT.foeStep(W,b);WILD.clampCombat(W);COMBAT.tick(W);}
  COMBAT.applyDamage = apply;
  console.log('water',id,'hp',old,b.hp,'retaliations',hitsFromWater);
  assert(b.hp<old && hitsFromWater > 0);
  assert.deepEqual([b.x,b.y],oldPos);
}

{
  const W = SIM.create('lonely-transcendent');
  const b = WILD.spawn(W, 'legend', null, {
    speciesId: 'ECO2_BEAST_MYTHIC_2', raidGrade: 'TRANSCENDENT', legendary: true
  });
  assert(b);
  const n = W.npcs[0];
  prepare(n, 9, { x: b.x, y: b.y });
  const before = { hp: COMBAT.hp(n), beastHp: b.hp, stones: W.sect.stones,
    alert: W.threat.alert, x: b.x, y: b.y };
  W.t = Math.ceil(W.t / 15) * 15;
  for (let i = 0; i < 6; i++, W.t += 15) WILD.tick(W);
  assert.equal(W.fights.length, 0);
  assert(!b.raidAssembly && !b.raidPulse && !b.fighting);
  assert.deepEqual({ hp: COMBAT.hp(n), beastHp: b.hp, stones: W.sect.stones,
    alert: W.threat.alert, x: b.x, y: b.y }, before);
  assert(!CULT.attemptTameBeast(W, n, b, { force: true }).ok);
}

{
  const W = SIM.create('boss-rewards-from-native-drops');
  const options = { speciesId: 'BEAST_MIST_WOLF' };
  const n = W.npcs[0];
  const ordinary = WILD.spawn(W, 'meadow', 'meadow_wolves', options);
  const boss = WILD.spawn(W, 'meadow', 'meadow_wolves', { ...options, huntType: 'miniboss' });
  assert(ordinary && boss && boss.hpMax > ordinary.hpMax && !boss.aggressive);
  assert(!WILD.startFight(W, n, boss));
  const best = boss.drops.reduce((a, b) => G.ECO.matById[a].value >= G.ECO.matById[b].value ? a : b);
  W.foeById[boss.id] = boss;
  W.wildlife.kills = 1;
  boss.dead = true;
  n.inv.mats = {};
  W.rng.chance = p => p === .72;
  const f = { A: [n.id], ctx: { beastId: boss.id, hunterId: n.id, valleyRaid: 'MINIBOSS' } };
  WILD.finish(W, f, 'A');
  WILD.finish(W, f, 'A');
  assert.deepEqual(n.inv.mats, { [best]: 1 }, 'Best native material is awarded once for the whole fight');
  assert(!W.wildlife.rareReadyAt, 'Minibosses do not occupy the rare boss cooldown');

  const normalT7 = WILD.spawn(W, 'legend', 'legend_celestial', {
    speciesId: 'BEAST_ABYSSAL_DRAGON', huntType: 'normal'
  });
  const bossT7 = WILD.spawn(W, 'legend', 'legend_celestial', { speciesId: 'BEAST_ABYSSAL_DRAGON' });
  assert(normalT7 && bossT7 && !normalT7.legendary && !normalT7.aggressive);
  assert(!WILD.raidProfile(normalT7) && WILD.raidProfile(bossT7)?.grade === 'T7');
  assert(WILD.landCombatProfile(normalT7).partySize === 3);
}

console.log('PASS passive bosses, shared rewards, ordinary apex tier and three real raid rosters');

{
  const previousTarget = WILD.ORDINARY_TARGET;
  WILD.ORDINARY_TARGET = 0;
  try {
    for (const [roll, grade] of [[.02, 'TRANSCENDENT'], [.12, 'LEGENDARY'], [.95, 'T7']]) {
      const W = SIM.create('natural-rare-roll-' + grade);
      W.t = Math.ceil(W.t / 60) * 60;
      W.rng.chance = p => p === .008;
      W.rng.next = () => roll;
      WILD.tick(W);
      assert(W.wildlife.beasts.some(b => b.raidGrade === grade), 'The live rarity roll can produce ' + grade);
      W.t += 60;
      WILD.tick(W);
      assert.equal(W.wildlife.beasts.filter(b => b.legendary).length, 1);
    }
  } finally {
    WILD.ORDINARY_TARGET = previousTarget;
  }
}
{
  const { ECO } = G;
  const W = SIM.create('valley-first-tier-flow');
  const b = WILD.spawn(W, 'meadow', 'meadow_wolves');
  const n = W.npcs[0];
  Object.assign(n.cult, { path: 'XIAN', sub: 'NONE', stage: 1, track: null, techs: ['ART190_XIAN_001'], mantra: null });
  Object.assign(n, { x: b.x + 1, y: b.y });
  HC.bump(n);
  n.h.state.hp = CULT.hpMax(n);
  n.h.state.qi = CULT.qiMax(n);
  ECO.addPersonalPill(n, 'P:BASIC_HP', 1, 1);
  ECO.addPersonalPill(n, 'P:BASIC_QI', 1, 1);
  assert(WILD.startFight(W,n,b));
  const f = W.fights.at(-1);
  const seen = { casts: 0, cooldownNormals: 0, hpPills: 0, qiPills: 0 };
  const strike = COMBAT.strike;
  const skill = COMBAT.useSkill;
  COMBAT.strike = (world, fight, actor, target, opts) => {
    if (actor === n && opts?.M === 1 && Object.keys(opts).length === 1 && Object.values(n.act.ctx.cds || {}).some(at => at > W.t)) seen.cooldownNormals++;
    return strike(world,fight,actor,target,opts);
  };
  COMBAT.useSkill = (...args) => { if(args[2] === n) seen.casts++; return skill(...args); };
  let elapsed = 0;
  for (;elapsed<200&&!f.over;elapsed++) {
    // Controlled low resource states confirm the existing potion decisions in an actual T1 fight.
    if (elapsed===1) n.h.state.hp = CULT.hpMax(n)*.42;
    if (elapsed===14) n.h.state.qi = CULT.qiMax(n)*.10;
    W.t++;
    COMBAT.fightStep(W,n);
    COMBAT.foeStep(W,b);
    COMBAT.tick(W);
  }
  seen.hpPills = n.inv.pills['P:BASIC_HP'] ? 0 : 1;
  seen.qiPills = n.inv.pills['P:BASIC_QI'] ? 0 : 1;
  console.log({ ...seen, elapsed, winner: f.winner });
  assert(seen.casts && seen.cooldownNormals && seen.hpPills && seen.qiPills);
}
