'use strict';
const assert = require('assert');
const G = require('./load');
const { SIM, SECT, CULT, ECO, HC, CPE, AI, STATS: ST, MARTIAL: M, FISHING, JD } = G;

console.log('=== v270_paths_subpaths_part1_autonomy_suite ===');

// 1. Founder & Candidate Subpath Selection reflects genuine npc.h affinity (not clone index 0)
{
  const seeds = ['alpha-c', 'beta-c', 'gamma-c', 'delta-c'];
  const pickedSubs = new Set();
  for (const sd of seeds) {
    const cands = SIM.candidates(sd, 'sword');
    assert.strictEqual(cands.length, 3, 'Each seed yields 3 founder candidates');
    for (const c of cands) {
      assert.strictEqual(c.npc.cult.path, 'XIAN', 'Sword archetype candidates keep primary path XIAN');
      assert(SECT.ARCHETYPES.sword.subs.includes(c.npc.cult.sub), 'Candidate sub stays inside archetype pool');
      pickedSubs.add(c.npc.cult.sub);
    }
  }
  assert(pickedSubs.size >= 2, 'Diverse founder candidates must produce at least 2 distinct sword-sect subpaths across seeds/candidates');
}

// 2. Dynamic 1..5 Subpath Tiers & 1..4 Fishing Loot Tiers cover all 286 subpaths
{
  const subTiers = new Set();
  const lootTiers = new Set();
  for (const { path, sub } of CULT.subList) {
    const k = M.knowledge(M.subKey(sub.id));
    assert(k && k.kind === 'sub', 'Knowledge metadata exists for ' + sub.id);
    const maxAllowed = Math.max(1, (CULT.PATHS[path].maxStage || 9) - 1);
    assert(k.tier >= 1 && k.tier <= 5 && k.tier <= maxAllowed, `Subpath tier valid for ${path}/${sub.id}: got ${k.tier}`);
    subTiers.add(k.tier);
    const lt = FISHING.SUBPATH_LOOT_TIER[sub.id];
    assert(lt >= 1 && lt <= 4, `Fishing loot tier 1..4 populated for all 286 subpaths (${sub.id} => ${lt})`);
    lootTiers.add(lt);
  }
  assert(subTiers.size >= 4, 'Subpaths span at least 4 distinct knowledge tiers across 1..5');
  assert.strictEqual(lootTiers.size, 4, 'All 4 fishing subpath loot tiers (1..4) populated across 286 subpaths');

  // Verify discovery rank weighting biases low-rank chests away from Tier 5 subManuals when available
  const D = SIM.create('sub-tier-roll-test');
  M.ensure(D);
  let lowRankMax = 0, highRankHasHigh = false;
  for (let i = 0; i < 40; i++) {
    D.day = 400 + i;
    const dropLow = M.rollHierarchicalDiscovery(D, { sourceRank: 'UNRANKED', forceKind: 'subManual', hardMaxTier: 2, ignoreDailyCap: true });
    if (dropLow) lowRankMax = Math.max(lowRankMax, dropLow.tier);
    const dropHigh = M.rollHierarchicalDiscovery(D, { sourceRank: 'MYTHIC', forceKind: 'subCrystal', tierRoll: 0.99, ignoreDailyCap: true });
    if (dropHigh && dropHigh.tier >= 3) highRankHasHigh = true;
  }
  assert(lowRankMax <= 2, 'hardMaxTier caps low-tier subManual discovery');
  assert(highRankHasHigh, 'Mythic discovery rolls high-tier subpath crystals');
}

// 3. Defective/Weak-root Mortal Holdout self-awakens via BODY tempering route
{
  const W = SIM.create('weak-root-mortal', { archetype: 'sword' });
  const mortal = SIM.addNpc(W, { stage: 0, rank: 0, ageYears: 19, rootGrade: 'DEFECTIVE' });
  mortal.cult = null;
  mortal.h.root.aggregateScore = 0.9;
  mortal.h.personality.discipline = 70;
  mortal.h.physiology.strength = 68;
  HC.bump(mortal);
  const mc = CULT.MORTAL_INITIATION.ensureMortalState(mortal, W);
  mc.studySessions = 4;
  const pick = CULT.MORTAL_INITIATION.chooseMortalStudyPath(W, mortal, { forceRechoose: true });
  assert.strictEqual(pick.path, 'BODY', 'Defective-root mortal shifts autonomously toward BODY tempering');
  for (let i = 0; i < 35 && !mortal.cult; i++) {
    CULT.MORTAL_INITIATION.stepGatherQi(W, mortal, 1.0, 1.3);
  }
  assert(mortal.cult && mortal.cult.path === 'BODY', 'Defective-root mortal successfully awakens into BODY');
}

// 4. PATH_LIBRARY autonomy: vault registration, elder inscription, crystal bestowal/shop, cross-path lock
{
  const W = SIM.create('path-lib-autonomy', { archetype: 'sword' });
  const master = W.byId[W.sect.masterId];
  master.rank = 6;
  SECT.PATH_LIBRARY.ensure(W);
  assert(!SECT.PATH_LIBRARY.isPathUnlocked(W, 'BUDDHA_DHARMA'), 'BUDDHA_DHARMA starts locked');

  // 4a. Elder on BUDDHA_DHARMA studying autonomously inscribes primer manual
  const elder = W.npcs[1];
  elder.rank = 4;
  elder.cult.path = 'BUDDHA_DHARMA';
  elder.cult.sub = CULT.PATHS.BUDDHA_DHARMA.subPaths[0].id;
  elder.cult.stage = 3;
  elder.h.intellect.comprehension = 70;
  AI.ACTS.study.done(elder, W);
  assert(SECT.PATH_LIBRARY.isPathUnlocked(W, 'BUDDHA_DHARMA'), 'Elder study completion inscribes missing path primer into PATH_LIBRARY');
  assert(W.sect.subLibrary.includes(CULT.PATHS.BUDDHA_DHARMA.subPaths[0].id), 'Unlocking path registers starter subpath into subLibrary');

  // 4b. Vault MANUAL_PATH_* gets auto-registered on SECT.daily(W)
  assert(!SECT.PATH_LIBRARY.isPathUnlocked(W, 'CHRONO_EPOCH'), 'CHRONO_EPOCH starts locked');
  ECO.add(W, 'MANUAL_PATH_CHRONO_EPOCH', 1);
  // 4c. CRYSTAL_PATH_* gets autonomously bestowed to fitting mortal on SECT.daily(W)
  const mortal2 = SIM.addNpc(W, { stage: 0, rank: 0, ageYears: 18 });
  mortal2.cult = null;
  CULT.MORTAL_INITIATION.ensureMortalState(mortal2, W);
  ECO.add(W, 'CRYSTAL_PATH_VOID_SPACE', 1);
  W.day += 1;
  SECT.daily(W);
  assert(SECT.PATH_LIBRARY.isPathUnlocked(W, 'CHRONO_EPOCH'), 'Vault MANUAL_PATH_CHRONO_EPOCH auto-registered on SECT.daily');
  assert(mortal2.cult && mortal2.cult.path === 'VOID_SPACE', 'Sect autonomously bestows CRYSTAL_PATH_VOID_SPACE to mortal on SECT.daily');
  assert.strictEqual(ECO.count(W, 'CRYSTAL_PATH_VOID_SPACE'), 0, 'Consumed CRYSTAL_PATH_VOID_SPACE from sect stock');

  // 4d. High-CP mortal can also buy CRYSTAL_PATH_* via CPE.shopItems / CPE.buy
  const mortal3 = SIM.addNpc(W, { stage: 0, rank: 0, ageYears: 19 });
  mortal3.cult = null;
  mortal3.cp = 500;
  ECO.add(W, 'CRYSTAL_PATH_KARMA_SAMSARA', 1);
  const shopRow = CPE.shopItems(W).find(x => x.kind === 'path_crystal' && x.key === 'CRYSTAL_PATH_KARMA_SAMSARA');
  assert(shopRow && shopRow.price > 0, 'CRYSTAL_PATH_* exposed in CPE.shopItems');
  assert(CPE.buy(W, mortal3, shopRow), 'Mortal can purchase CRYSTAL_PATH_* via CPE.buy');
  assert(mortal3.cult && mortal3.cult.path === 'KARMA_SAMSARA', 'Purchased CRYSTAL_PATH_* awakens mortal cleanly');

  // 4e. Locked-path personalManual retraining is blocked unless unlocked or using crystal
  const disc = W.npcs[2];
  disc.cult.path = 'XIAN';
  disc.cult.sub = 'SWORD_IMMORTAL';
  disc.cult.stage = 6;
  disc.cp = 2000;
  const lockedSub = CULT.PATHS.GRAVITY_DAO.subPaths[0].id;
  disc.inv.subManuals.push(lockedSub);
  const lockedQuote = M.retrainingQuote(W, disc, M.subKey(lockedSub), { source: 'personalManual' });
  assert.strictEqual(lockedQuote.ok, false, 'Locked Grand Dao subpath personalManual blocked by PATH_LIBRARY');
  disc.inv.crystals[M.subKey(lockedSub)] = 1;
  const crystalQuote = M.retrainingQuote(W, disc, M.subKey(lockedSub), { source: 'crystal' });
  assert.strictEqual(crystalQuote.ok, true, 'Single-use subpath crystal bypasses library path lock');
}

// 5. Retraining safety: Elder intra-path lifespan reserve + cross-path residual cleanup & track init
{
  const W = SIM.create('retrain-safety');
  M.ensure(W);
  const n = W.npcs[0];
  n.cult.path = 'XIAN';
  n.cult.sub = 'SWORD_IMMORTAL';
  n.cult.stage = 8;
  CULT.refreshLifespan(n);
  // Age the elder up to Stage 8 range (well past Stage 4 base lifespanMax ~150)
  const stage4Life = CULT.PATHS.XIAN.stages[3].lifespanMax;
  n.h.birthDay = W.day - (stage4Life + 25) * 360;
  HC.bump(n);
  n.cp = 5000;
  n.inv.crystals['S:STAR_ARCHER'] = 1;
  const evalRes = M.evaluateRetraining(W, n, 'S:STAR_ARCHER');
  assert(!evalRes.reasons.includes('อายุขัยขั้นใหม่เสี่ยงเกินไป'), 'Intra-path elder retraining projects lifespan reserve accurately');
  const ret = M.retrain(W, n, 'S:STAR_ARCHER', { source: 'crystal' });
  assert.strictEqual(ret.ok, true, 'Old Stage 8 elder can retrain intra-path');
  assert(CULT.lifespan(n) > HC.ageYears(n) + 10, 'Elder does not fall into instant old-age death trap after intra-path retrain');

  // Cross-path cleanup & expansion track initialization
  W.day = n.retrainUntil + 1;
  n.cult.path = 'MECH_PUPPET';
  n.cult.sub = 'HEAVENLY_GOLEM';
  n.cult.stage = 3;
  CULT.ensureMechState(n);
  n.divineWaning = true;
  n.demonicRealmsGauge = { INFERNAL_SIN: 60, ASURA_WRATH: 40 };
  n.grandDaoState = { path: 'MECH_PUPPET', gravityFieldMode: 'CRUSH' };
  const expSub = 'SIX_PATHS_WHEEL';
  n.inv.crystals[M.subKey(expSub)] = 1;
  const ret2 = M.retrain(W, n, M.subKey(expSub), { source: 'crystal' });
  assert.strictEqual(ret2.ok, true, 'Cross-path retrain to KARMA_SAMSARA/SIX_PATHS_WHEEL succeeds');
  assert.strictEqual(n.mechState, null, 'Residual mechState cleared on cross-path retrain');
  assert.strictEqual(n.divineWaning, false, 'Residual divineWaning cleared on cross-path retrain');
  assert.strictEqual(n.demonicRealmsGauge, null, 'Residual demonicRealmsGauge cleared on cross-path retrain');
  assert(n.karmaState && n.cult.track && n.cult.track.subPath === expSub, 'Target KARMA_SAMSARA karmaState and expansion track initialized');
}

console.log('PASS v270_paths_subpaths_part1_autonomy_suite (all 5 test groups)');
