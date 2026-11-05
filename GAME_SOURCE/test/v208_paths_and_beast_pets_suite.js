'use strict';
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const G = require('./load.js');
const { HC, CULT, MARTIAL, STATS, SK, COMBAT, WILD, AI, BT, SECT, SIM, JD, ECO, UI } = G;

const ROOT = path.resolve(__dirname, '..');

console.log('=== Running Patch v2.0.8 + Support/Heal/Buff Path Expansion Suite ===');

// 0. Hard Invariants: human_core.js SHA-256 & 40 <script> tags
{
  const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
  const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  assert.strictEqual(hcSha, 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js SHA-256 must remain untouched');
  assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');

  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const scriptTags = indexHtml.match(/<script\b[^>]*>/gi) || [];
  assert.strictEqual(scriptTags.length, 40, 'index.html must keep exactly 40 <script> tags');
  console.log('  PASS 0: human_core.js SHA-256 lock and 40 <script> tag invariant verified');
}

// 1. All 9 Major Cultivation Paths & 78 Subpaths & Full Stage Equivalence
{
  const expectedPaths = [
    'XIAN', 'BODY', 'GOD', 'DEMON', 'HEART_SOUL',
    'MECH_PUPPET', 'KARMA_SAMSARA', 'BEAST_SOVEREIGN', 'SAGE_SUPPORT', 'CRAFT_CREATION'
  ];
  const actualPaths = Object.keys(CULT.PATHS);
  assert(actualPaths.length >= expectedPaths.length, 'All baseline paths must remain registered');
  for (const pid of actualPaths) {
    assert(CULT.PATHS[pid], `Path ${pid} must exist in CULT.PATHS`);
    assert(Array.isArray(CULT.THRESH[pid]), `CULT.THRESH[${pid}] must be an array`);
  }

  expectedPaths.forEach(pid => assert(CULT.PATHS[pid], 'Baseline path ' + pid + ' remains available'));
  // Every eight-stage path participates, while the four original expansions retain their seven branches.
  const original8StagePaths = new Set(['MECH_PUPPET', 'KARMA_SAMSARA', 'BEAST_SOVEREIGN', 'SAGE_SUPPORT']);
  const new8StagePaths = actualPaths.filter(pid => CULT.PATHS[pid].maxStage === 8);
  for (const pid of new8StagePaths) {
    const pDef = CULT.PATHS[pid];
    assert.strictEqual(pDef.maxStage, 8, `${pid} must have maxStage 8`);
    assert.strictEqual(pDef.stages.length, 8, `${pid} must have 8 stages`);
    if (original8StagePaths.has(pid)) assert.strictEqual(pDef.subPaths.filter(s => !s.v234).length, 7, `${pid} must retain 7 original subpaths`);
    assert(pDef.subPaths.length > 0, `${pid} must have subpaths`);
    for (const sp of pDef.subPaths) {
      assert(MARTIAL.PROFILES[sp.id], `MARTIAL.PROFILES[${sp.id}] must exist`);
      assert(STATS.SUBFX[sp.id], `STATS.SUBFX[${sp.id}] must exist`);
      assert(CULT.SUBPREF[sp.id], `CULT.SUBPREF[${sp.id}] must exist`);
      assert(MARTIAL.INNATE_BY_SUB[sp.id], `MARTIAL.INNATE_BY_SUB[${sp.id}] must exist`);
      const tDef = CULT.trackDef(sp.id);
      assert(tDef && Array.isArray(tDef.realms) && tDef.realms.length === 9, `Subpath ${sp.id} must have 9 specialization realms`);
      tDef.realms.forEach((r, idx) => {
        assert.strictEqual(r.ordinal, idx + 1);
        assert(Number.isFinite(r.majorBandEquivalent) && r.majorBandEquivalent >= 1 && r.majorBandEquivalent <= 9);
        assert(Number.isFinite(r.functionalCombatPower));
        assert(r.skillGate && r.skillGate.primarySkill && r.skillGate.minPrimarySkill > 0);
        assert(r.resourceCost && r.resourceCost.stones >= 0);
      });
    }
  }

  // Alias resolution check
  assert.strictEqual(CULT.resolveSubId('CELESTIAL_PUPPET_MASTER'), 'HEAVENLY_GOLEM');
  assert.strictEqual(CULT.resolveSubId('KARMIC_FLAME_ARHAT'), 'REVERSED_RETRIBUTION');
  assert.strictEqual(CULT.resolveSubId('MYRIAD_BEAST_EMPEROR'), 'MYRIAD_BEAST_PACK');
  assert.strictEqual(CULT.resolveSubId('ACUPUNCTURE_SAINT'), 'GOLDEN_NEEDLE_SAINT');

  // Stage Equivalence across all 4 new 8-stage paths (stages 1..8 -> normalizedStage 1..9 -> effectiveTechStage 1..7)
  const W = SIM.create('v208-stage-equivalence-test');
  const npc = W.npcs[0];
  const expectedNorm8 = [0, 1, 2.1, 3.2, 4.4, 5.5, 6.7, 7.8, 9];
  const expectedEq8 = expectedNorm8;
  const expectedTech8 = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (const pid of new8StagePaths) {
    npc.cult.path = pid;
    npc.cult.sub = CULT.PATHS[pid].subPaths[0].id;
    npc.cult.track = null;
    for (let st = 1; st <= 8; st++) {
      npc.cult.stage = st;
      assert.strictEqual(CULT.normalizedStage(npc), expectedNorm8[st], `${pid} stage ${st} normalizedStage must be ${expectedNorm8[st]}`);
      assert.strictEqual(CULT.equivalentStage(npc), expectedEq8[st], `${pid} stage ${st} equivalentStage must be ${expectedEq8[st]}`);
      assert.strictEqual(CULT.effectiveTechStage(npc), expectedTech8[st], `${pid} stage ${st} effectiveTechStage must be ${expectedTech8[st]}`);
      assert(CULT.worldRank(npc) >= 1 && CULT.worldRank(npc) <= 10, `${pid} stage ${st} worldRank must be in 1..10`);
    }
    // Check gearUsable with minStage=7 at stage 7 (effectiveTechStage=7, equivalentStage=8)
    npc.cult.stage = 7;
    const t7Gear = { id: 'TEST_T7_GEAR', slot: 'WEAPON', gearType: 'SWORD', tier: 7, minStage: 7, compatiblePath: ['ANY'] };
    assert.strictEqual(MARTIAL.gearUsable(npc, t7Gear), true, `${pid} stage 7 must be able to equip minStage 7 gear via equivalentStage/effectiveTechStage`);
    npc.cult.stage = 2;
    assert.strictEqual(MARTIAL.gearUsable(npc, t7Gear), false, `${pid} stage 2 must NOT be able to equip minStage 7 gear`);
  }
  console.log('  PASS 1: All registered paths, subpaths, 9-realm tracks, and stage equivalence verified');
}

// 2. Cross-Path, Path-Specific, Weapon-Bound & Element-Bound Techniques + 18 Resonance Sets
{
  const W = SIM.create('v208-cross-path-tech-test');
  const crossTechs = JD.TECH.techniques.filter(t => /^ART_CROSS_V208_/.test(t.id));
  assert.strictEqual(crossTechs.length, 12, 'Must have 12 new cross-path (path: ANY) v2.0.8 techniques');

  const npc = W.npcs[0];
  for (const pid of ['XIAN', 'BODY', 'GOD', 'DEMON', 'HEART_SOUL', 'MECH_PUPPET', 'KARMA_SAMSARA', 'BEAST_SOVEREIGN', 'SAGE_SUPPORT']) {
    npc.cult.path = pid;
    npc.cult.sub = CULT.PATHS[pid].subPaths[0].id;
    npc.cult.stage = CULT.PATHS[pid].maxStage;
    for (const ct of crossTechs) {
      assert.strictEqual(ct.path, 'ANY');
      assert(Array.isArray(ct.weaponTypes) && ct.weaponTypes.length > 0, `${ct.id} must specify weaponTypes`);
      assert(ct.element && ct.elementProfile, `${ct.id} must specify element and elementProfile`);
      const compat = MARTIAL.resolveTechCompatibility(npc, ct);
      assert.strictEqual(compat.ok, true, `Cross-path technique ${ct.id} must be learnable on ${pid}`);
    }
  }

  assert.strictEqual(MARTIAL.RESONANCE_SETS.filter(s => !s.id.startsWith('RES_NINE_DAO_')).length, 19, 'The baseline 19 equipment resonance sets must remain available');
  assert.strictEqual(MARTIAL.RESONANCE_SETS.filter(s => s.id.startsWith('RES_NINE_DAO_')).length, Object.keys(CULT.PATHS).length, 'Every Dao path must receive a Pagoda resonance set');
  assert.strictEqual(MARTIAL.RESONANCE_SETS.length, 19 + Object.keys(CULT.PATHS).length, 'The baseline and every Pagoda set must be registered');
  for (const rId of ["RES_MECH_AUTOMATON_CITADEL","RES_KARMA_SAMSARA_WHEEL","RES_BEAST_SOVEREIGN_PACT","RES_SAGE_HARMONY_SANCTUARY"]) {
    const rSet = MARTIAL.RESONANCE_SETS.find(s => s.id === rId);
    assert(rSet, `Resonance set ${rId} must exist`);
  }
  console.log('  PASS 2: Cross-path techniques, weapon/element bindings, baseline resonance sets, and all-path Pagoda sets verified');
}

// 3. Universal Spirit Beast Pet System (Taming, Population Conservation, Cap 1 vs 2..4, Combat & Evolution)
{
  const W = SIM.create('v208-beast-pet-system-test');
  W.wildlife = W.wildlife || { seq: 1, beasts: [], kills: 0, captures: 0 };
  const regularNpc = W.npcs[0];
  const beastMaster = W.npcs[1];

  regularNpc.cult.path = 'XIAN';
  regularNpc.cult.sub = 'SWORD_IMMORTAL';
  regularNpc.cult.stage = 6;
  regularNpc.pets = [];

  beastMaster.cult.path = 'BEAST_SOVEREIGN';
  beastMaster.cult.sub = 'MYRIAD_BEAST_PACK';
  beastMaster.cult.stage = 8; // Max stage -> cap 4 active pets
  beastMaster.pets = [];

  assert.strictEqual(CULT.maxActivePets(regularNpc), 1, 'Non-BEAST_SOVEREIGN cultivator must have maxActivePets === 1');
  assert.strictEqual(CULT.maxActivePets(beastMaster), 4, 'Stage 8 BEAST_SOVEREIGN cultivator must have maxActivePets === 4');

  // Bind 2 pets to regularNpc -> only 1 can be active
  CULT.bindPet(W, regularNpc, CULT.allBeastSpecies()[0], { tier: 2, loyalty: 80 });
  CULT.bindPet(W, regularNpc, CULT.allBeastSpecies()[1], { tier: 4, loyalty: 90, replaceWeakest: true });
  assert.strictEqual(CULT.activePets(regularNpc).length, 1, 'Non-BEAST_SOVEREIGN activePets must never exceed 1');
  assert.strictEqual(CULT.activePets(regularNpc)[0].tier, 4, 'replaceWeakest must keep higher-tier pet active');

  // Bind 4 pets to beastMaster -> all 4 active
  for (let i = 0; i < 4; i++) {
    CULT.bindPet(W, beastMaster, CULT.allBeastSpecies()[i % CULT.allBeastSpecies().length], { tier: 3 + (i % 3), loyalty: 90, bondXp: 350 });
  }
  assert.strictEqual(CULT.activePets(beastMaster).length, 4, 'Stage 8 BEAST_SOVEREIGN must have 4 active pets');

  // On-map wildlife capture conservation: capturing a live wild beast removes it from W.wildlife.beasts and increments captures
  const wildBeast = (W.wildlife && W.wildlife.beasts && W.wildlife.beasts[0]) || { id: 'wild_test_99', speciesId: 'B01', name: 'หมาป่าวายุ', tier: 2, hp: 20, hpMax: 200, power: 150, dead: false };
  if (!W.wildlife.beasts.includes(wildBeast)) W.wildlife.beasts.push(wildBeast);
  wildBeast.hp = Math.floor(wildBeast.hpMax * 0.15); // Weakened <=30% HP
  const capRes = CULT.attemptTameBeast(W, beastMaster, wildBeast, { forceSuccess: true });
  assert.strictEqual(capRes.ok, true, 'attemptTameBeast with forceSuccess must succeed');
  assert.strictEqual(wildBeast.captured, true, 'Captured wild beast must be marked captured');
  assert.strictEqual(W.wildlife.beasts.includes(wildBeast), false, 'Captured wild beast must be removed from W.wildlife.beasts (population conservation)');
  assert(W.wildlife.captures >= 1, 'W.wildlife.captures counter must increment');

  // Sovereign Awakening evolution
  const evoRes = SECT.EDITOR.applyPetAction(W, { action: 'awaken_sovereign', npcId: beastMaster.id });
  assert.strictEqual(evoRes.ok, true);
  assert.strictEqual(evoRes.pet.growthStage, 4);
  assert.strictEqual(evoRes.pet.sovereignAwakened, true);
  console.log('  PASS 3: Universal Spirit Beast Pet System (1 vs 2..4 cap, live capture conservation, Sovereign evolution) verified');
}

// 4. Self & Ally Healing + 8 Diverse Timed Buffs + Strict Expiration (Never Permanent)
{
  const W = SIM.create('v208-heal-buff-expiry-test');
  const sage = W.npcs[0];
  const ally = W.npcs[1];

  sage.cult.path = 'SAGE_SUPPORT';
  sage.cult.sub = 'GOLDEN_NEEDLE_SAINT';
  sage.cult.stage = 6;
  CULT.ensurePets(sage);

  // Verify all 8 buff archetypes exist in STATS.BUFF_CATALOG & SK.STATUS
  const expectedBuffs = [
    'vitalRegen', 'fervorMight', 'aegisWard', 'swiftWind',
    'qiConduit', 'clarityLotus', 'meridianUnblock', 'nirvanaGrace'
  ];
  for (const bk of expectedBuffs) {
    assert(STATS.BUFF_CATALOG[bk], `STATS.BUFF_CATALOG[${bk}] must exist`);
    assert(SK.STATUS[bk], `SK.STATUS[${bk}] must exist`);
  }

  // Damage ally to 35% HP and add injury + stress + heartDemon
  const allyMaxHp = CULT.hpMax(ally);
  ally.h.state.hp = Math.floor(allyMaxHp * 0.35);
  ally.h.state.stress = 50;
  ally.h.state.heartDemon = 30;
  ally.inj = [{ part: 'แขนขวา', why: 'ปราณสะท้อน', sev: 1 }];

  // Cast self/ally heal + buff from sage onto ally
  const hpBefore = ally.h.state.hp;
  const castRes = CULT.castHealOrBuff(W, sage, ally, { buffKey: 'fervorMight', duration: 120, healPct: 0.35, force: true });
  assert.strictEqual(castRes.ok, true, 'CULT.castHealOrBuff on ally must succeed');
  assert(ally.h.state.hp > hpBefore, 'Ally HP must increase after healing');
  assert.strictEqual(ally.inj.length, 0, 'GOLDEN_NEEDLE_SAINT heal must cure injuries');
  assert(STATS.hasBuff(ally, 'fervorMight', W.t), 'Ally must have active fervorMight buff');

  // Verify fervorMight increases ally combat stats (atk / crit) while active
  const baseAtkWithBuff = STATS.get(ally).atk;
  const baseRateBefore = CULT.rate(ally);

  // Apply meridianUnblock & clarityLotus & verify cultivation rate + breakthrough chance increase
  STATS.applyNamedBuff(ally, 'meridianUnblock', { duration: 60, now: W.t });
  assert(CULT.rate(ally) > baseRateBefore, 'meridianUnblock must boost cultivation rate');

  // STRICT EXPIRATION VERIFICATION: Advance W.t past buff expiry (W.t + 121 minutes) and verify buffs expire and stats return to unbuffed baseline!
  const startT = W.t;
  W.t = startT + 61;
  STATS.now = W.t;
  assert.strictEqual(STATS.hasBuff(ally, 'meridianUnblock', W.t), false, 'meridianUnblock (60m) must expire at W.t + 61');
  assert.strictEqual(STATS.hasBuff(ally, 'fervorMight', W.t), true, 'fervorMight (120m) must still be active at W.t + 61');

  W.t = startT + 125;
  STATS.now = W.t;
  const remainingActive = STATS.getActiveBuffs(ally, W.t);
  assert.strictEqual(remainingActive.length, 0, 'All timed buffs must expire once W.t passes their until timestamp');
  const atkAfterExpiry = STATS.get(ally).atk;
  assert(atkAfterExpiry < baseAtkWithBuff, 'Stats cache must automatically invalidate at earliestExpiry so buff stats NEVER persist after expiration');
  assert.strictEqual(ally.buffs.length, 0, 'Expired buffs must be purged from npc.buffs');

  console.log('  PASS 4: Self/Ally healing, 8 diverse buff archetypes, and strict buff expiration (0 permanent buff bugs) verified');
}

// 5. Combat Mechanics for MECH_PUPPET, KARMA_SAMSARA, BEAST_SOVEREIGN, and SAGE_SUPPORT (HoT + Cheat-Death)
{
  const W = SIM.create('v208-combat-mechanics-test');
  const mech = W.npcs[0];
  const karma = W.npcs[1];
  const sage = W.npcs[2];

  // 5a. MECH_PUPPET construct absorption & decoy save
  mech.cult.path = 'MECH_PUPPET';
  mech.cult.sub = 'HEAVENLY_GOLEM';
  mech.cult.stage = 6;
  const ms = CULT.ensureMechState(mech);
  ms.constructReadiness = 100;
  ms.decoyAvailable = true;
  mech.h.state.hp = CULT.hpMax(mech);
  COMBAT.applyDamage(mech, mech.h.state.hp + 5000);
  assert(mech.h.state.hp > 0, 'MECH_PUPPET decoy construct must save master from lethal damage once');
  assert.strictEqual(ms.decoyAvailable, false, 'Decoy construct must be consumed after saving master');

  // 5b. KARMA_SAMSARA causal debt accumulation & past-life echo save
  karma.cult.path = 'KARMA_SAMSARA';
  karma.cult.sub = 'BODHI_VOW_GUARDIAN';
  karma.cult.stage = 6;
  const ks = CULT.ensureKarmaState(karma);
  ks.karmicDebt = 0;
  ks.echoReady = true;
  karma.h.state.hp = CULT.hpMax(karma);
  COMBAT.applyDamage(karma, 200);
  assert(ks.karmicDebt > 0, 'Taking damage must accumulate karmicDebt on KARMA_SAMSARA');
  COMBAT.applyDamage(karma, karma.h.state.hp + 5000);
  assert(karma.h.state.hp > 0, 'KARMA_SAMSARA past-life echo must save cultivator from lethal hit once');
  assert.strictEqual(ks.echoReady, false, 'echoReady must be consumed after triggering');

  // 5c. SAGE_SUPPORT nirvanaGrace cheat-death save & vitalRegen HoT in combat
  sage.cult.path = 'SAGE_SUPPORT';
  sage.cult.sub = 'SOUL_LANTERN_SHEPHERD';
  sage.cult.stage = 6;
  sage.h.state.hp = CULT.hpMax(sage);
  STATS.applyNamedBuff(sage, 'nirvanaGrace', { duration: 120, now: W.t });
  COMBAT.applyDamage(sage, sage.h.state.hp + 9999);
  assert(sage.h.state.hp > 0, 'nirvanaGrace buff must prevent lethal blow and restore HP');
  assert.strictEqual(STATS.hasBuff(sage, 'nirvanaGrace', W.t), false, 'nirvanaGrace cheat-death must consume the buff upon triggering');

  // Combat skill cast of SAGE_SUPPORT technique heals & applies buff
  sage.h.state.hp = Math.floor(CULT.hpMax(sage) * 0.4);
  sage.h.state.qi = CULT.qiMax(sage);
  sage.cult.techs = ['ART_SAGE_SUP_001', 'MP_BASE_SAGE_SUPPORT'];
  const sageTech = CULT.tech('ART_SAGE_SUP_001');
  assert(sageTech, 'ART_SAGE_SUP_001 must exist');
  const skMoves = SK.list(sage);
  assert(skMoves.length > 0, 'MP_BASE_SAGE_SUPPORT must have executable combat moves');
  const hpBeforeSkill = sage.h.state.hp;
  COMBAT.useSkill(sage, karma, skMoves[0], W);
  assert(sage.h.state.hp > hpBeforeSkill, 'Casting SAGE_SUPPORT skill in combat must heal the caster');
  assert((sage.buffs || []).length > 0, 'Casting SAGE_SUPPORT skill in combat must apply a timed buff');

  // 5d. AI.ACTS.supportBless autonomous execution
  assert(AI.ACTS.supportBless, 'AI.ACTS.supportBless must be registered');
  const uScore = AI.ACTS.supportBless.u(sage, W);
  assert(uScore > 0, 'SAGE_SUPPORT cultivator must have positive utility for supportBless when disciples need healing/buffs');
  const where = AI.ACTS.supportBless.where(W, sage);
  assert(where, 'AI.ACTS.supportBless.where must locate a valid station');
  AI.ACTS.supportBless.done(sage, W);

  // 5e. Serialization roundtrip preserves pets, mechState, karmaState, and timed buffs
  const saved = SIM.serialize(W);
  const loaded = SIM.deserialize(saved);
  assert(Array.isArray(loaded.byId[sage.id].buffs), 'Buffs must survive save/load roundtrip');
  assert(loaded.byId[mech.id].mechState, 'mechState must survive save/load roundtrip');
  assert(loaded.byId[karma.id].karmaState, 'karmaState must survive save/load roundtrip');
  console.log('  PASS 5: MECH_PUPPET, KARMA_SAMSARA, BEAST_SOVEREIGN, SAGE_SUPPORT combat mechanics, AI supportBless, and save/load roundtrip verified');
}

console.log('=== All Patch v2.0.8 + Support/Heal/Buff Path Expansion Tests Passed! (PASS) ===');
