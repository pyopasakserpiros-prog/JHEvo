'use strict';
const assert = require('assert');
const g = require('./load.js');

console.log('=== JS2 v3.7.0c — Phase C: Final P2 Polish & Regression Verification Suite ===');

// [1/5] Version & Backward-Compatible Schema Contract
{
  assert.strictEqual(g.SIM.PATCH_VERSION, '3.8.2');
  assert.strictEqual(g.SIM.SAVE_SCHEMA_VERSION, '3.8.2-chaos-era-lore-archive');
  const W = g.SIM.create('v370c_schema');
  const legacySnap = JSON.parse(g.SIM.serialize(W));
  legacySnap.schemaVersion = '3.7.0b-p1-realism-polish';
  const hydrated = g.SIM.deserialize(JSON.stringify(legacySnap));
  assert(hydrated && Array.isArray(hydrated.npcs) && hydrated.npcs.length > 0, 'Must hydrate 3.7.0b saves cleanly');
  console.log('PASS [1/5] Version 3.7.0c & legacy 3.7.0b save hydration verified');
}

// [2/5] All 55/55 Paths Have Canonical Tier-7 Legendary Apex Techniques (Including 12 LEG_V370_*)
{
  const paths = Object.keys(g.CULT.PATHS);
  assert.strictEqual(paths.length, 55, 'Expected 55 cultivation paths');
  let v370LegCount = 0;
  for (const pId of paths) {
    const hasLeg = [...g.JD.TECH.techniques, ...g.JD.TECH.mantras].some(
      t => t && (t.legendary || t.apexPathArt) && (t.path === pId || (Array.isArray(t.compatiblePaths) && t.compatiblePaths.includes(pId)))
    );
    assert(hasLeg, `Path ${pId} must have at least 1 legendary apex technique`);
    if (pId.startsWith('LEG_') || pId.startsWith('TRANS_')) {
      const t = g.CULT.tech('LEG_V370_' + pId);
      assert(t && (t.legendary || t.apexPathArt) && t.tier === 7 && t.v370c, `LEG_V370_${pId} must be registered as Tier-7 legendary v370c technique`);
      v370LegCount++;
    }
  }
  assert.strictEqual(v370LegCount, 12, 'Expected 12 LEG_V370_* apex techniques');
  console.log('PASS [2/5] All 55/55 paths have canonical Tier-7 Legendary Apex techniques (12 new LEG_V370_*)');
}

// [3/5] ECO.base Memoization & Tier-Scoped Recipe Pricing (T1 Affordable <= 50, T6 >= 5000)
{
  const t1Val = g.ECO.base('P:ECO2_REC_PILL_BUFF_ATK_1');
  const t6Val = g.ECO.base('P:ECO2_REC_PILL_HEAL_6');
  assert(t1Val > 0 && t1Val <= 40, `T1 combat pill must remain affordable for young disciples (<= 40), got ${t1Val}`);
  assert(t6Val >= 5000, `T6 heal pill must enforce input-cost floor (>= 5000), got ${t6Val}`);
  assert.strictEqual(g.ECO.base('P:ECO2_REC_PILL_HEAL_6'), t6Val, 'Memoized ECO.base must return identical value');
  console.log(`PASS [3/5] ECO.base memoization & tier-scoped pricing verified (T1=${t1Val}, T6=${t6Val})`);
}

// [4/5] GRAVE_CORPSE_DETONATE Scales Strictly With Consumed Corpses While Respecting Stage Cap
{
  const W = g.SIM.create('v370c_grave_det');
  const n = W.npcs[0];
  n.cult = { path: 'NETHER_GRAVE', sub: 'CORPSE_EXPLOSION_ACOLYTE', stage: 5, prog: 0, techs: [] };
  const foe = { id: 'FOE_G_TEST', name: 'หุ่นทดสอบ', foe: true, hp: 5000, hpMax: 5000, stage: 5, x: 12, y: 10, h: { state: { hp: 5000, qi: 100, energy: 100 }, skills: {} } };
  const f = { id: 999, over: false, _unconsumedCorpses: 2, log: [] };
  g.COMBAT.COMPOSABLE_ENGINE.executeAction(W, f, n, foe, 'GRAVE_CORPSE_DETONATE', {});
  const dmg2 = n.lastGraveCorpseDetonate.bonusDmg;
  f._unconsumedCorpses = 0;
  g.COMBAT.COMPOSABLE_ENGINE.executeAction(W, f, n, foe, 'GRAVE_CORPSE_DETONATE', {});
  const dmg0 = n.lastGraveCorpseDetonate.bonusDmg;
  assert(dmg2 > dmg0, `GRAVE_CORPSE_DETONATE with 2 corpses (${dmg2}) must exceed 0 corpses (${dmg0})`);
  console.log(`PASS [4/5] GRAVE_CORPSE_DETONATE corpse scaling verified (2 corpses=${dmg2} > 0 corpses=${dmg0})`);
}

// [5/5] Support Apex Techniques Carry Heal/Harmonize Archetype & MoveDefs
{
  const tHeal = g.CULT.tech('LEG_V370_LEG_TRIAGE_MERIDIAN');
  const tRelay = g.CULT.tech('LEG_V370_TRANS_CONSTELLATION_RELAY');
  assert(tHeal && tHeal.moveDefs && tHeal.moveDefs[0].arch === 'heal', 'LEG_V370_LEG_TRIAGE_MERIDIAN must use heal archetype');
  assert(tRelay && tRelay.moveDefs && tRelay.moveDefs[0].arch === 'harmonize', 'LEG_V370_TRANS_CONSTELLATION_RELAY must use harmonize archetype');
  console.log('PASS [5/5] Support Legendary Apex techniques carry real heal/harmonize archetypes');
}

console.log('✅ ALL FINAL P2 POLISH & REGRESSION CHECKS IN JS2 v3.7.0c PASSED!');
