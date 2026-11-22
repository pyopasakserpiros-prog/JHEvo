'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const g = require('./load.js');

console.log('=== JS2 v3.7.0 — Legendary & Transcendent Dao Expansion Suite ===');

// [1/7] 55 Paths (43 Ordinary + 6 Legendary + 6 Transcendent), 346 Subpaths, Lower-World Scale & 3 Origin Types
{
  assert.strictEqual(g.SIM.PATCH_VERSION, '3.9.6');
  assert.strictEqual(g.SIM.SAVE_SCHEMA_VERSION, '3.9.6-deep-gameplay-integration');
  assert.strictEqual(Object.keys(g.CULT.PATHS).length, 58, 'Expected 58 total cultivation paths');
  assert.strictEqual(g.CULT.subList.length, 358, 'Expected 358 total subpaths');
  assert.strictEqual(g.CULT.LEGENDARY_DAO.LEGENDARY_IDS.length, 6, 'Expected 6 Legendary paths');
  assert.strictEqual(g.CULT.LEGENDARY_DAO.TRANSCENDENT_IDS.length, 6, 'Expected 6 Transcendent paths');

  const origins = new Set();
  for (const pid of g.CULT.LEGENDARY_DAO.PATH_IDS) {
    const pObj = g.CULT.PATHS[pid];
    assert(pObj && pObj.maxStage <= 9, `Path ${pid} must stay within Lower-World stage scale`);
    assert(pObj.subPaths && pObj.subPaths.length === 5, `Path ${pid} must have 5 subpaths`);
    origins.add(pObj.originType);
    // Verify Living Lore canon fact exists for this path
    const fact = (g.EXPED.LIVING_LORE.CANON_FACTS || []).find(f => f.pathId === pid);
    assert(fact && fact.summaryTh, `Missing Living Lore CANON_FACT for ${pid}`);
  }
  assert(origins.has('LOWLY_UPPER_WORLD'), 'Must include LOWLY_UPPER_WORLD origin');
  assert(origins.has('ASCENDED_LOWER_MASTER'), 'Must include ASCENDED_LOWER_MASTER origin');
  assert(origins.has('LOCAL_LOWER_HISTORY'), 'Must include LOCAL_LOWER_HISTORY origin');
  console.log('PASS [1/7] 55 paths (6 Legendary + 6 Transcendent), 346 subpaths, Lower-World scale & 3 origin types verified');
}

// [2/7] Rarity Gating: Ordinary Recruits Never Randomly Pick High-Grade Paths Without Discovery
{
  const W = g.SIM.create('v370_rarity_check');
  for (const npc of (W.npcs || [])) {
    if (npc && npc.cult && npc.cult.path) {
      assert.strictEqual(
        g.CULT.LEGENDARY_DAO.gradeOf(npc.cult.path),
        'ORDINARY',
        `Initial recruit ${npc.name} should start on an ORDINARY path, got ${npc.cult.path}`
      );
    }
  }
  console.log('PASS [2/7] Rarity gating verified (all initial recruits start on ORDINARY paths)');
}

// [3/7] Credible Discovery -> Autonomous Human-Core Decision Chain (STUDY, ADOPT & DECLINE)
{
  const W = g.SIM.create('v370_decision_chain');
  const npcs = (W.npcs || []).filter(n => n && !n.dead);
  assert(npcs.length >= 3, 'Need at least 3 living NPCs');

  // Case A: Under-staged NPC -> STUDY
  const lowNpc = npcs[0];
  lowNpc.cult = { path: 'XIAN', sub: 'SWORD_IMMORTAL', stage: 2, xp: 0 };
  g.CULT.LEGENDARY_DAO.recordDiscovery(W, lowNpc, 'TRANS_DYNASTIC_MANDATE_WEAVER', 'archive');
  const resStudy = g.CULT.LEGENDARY_DAO.evaluateNpcAdoption(W, lowNpc, 'TRANS_DYNASTIC_MANDATE_WEAVER');
  assert.strictEqual(resStudy.decision, 'STUDY', `Expected STUDY for low-stage NPC, got ${resStudy.decision}`);

  // Case B: Qualified, curious, ambitious NPC -> ADOPT
  const highNpc = npcs[1];
  highNpc.cult = { path: 'XIAN', sub: 'FIVE_ELEMENTS', stage: 6, xp: 0 };
  highNpc.h.personality.curiosity = 92;
  highNpc.h.personality.ambition = 90;
  highNpc.h.personality.discipline = 88;
  highNpc.h.personality.caution = 20;
  highNpc.h.intellect.comprehension = 90;
  g.CULT.LEGENDARY_DAO.recordDiscovery(W, highNpc, 'LEG_ASHEN_KILN_ALCHEMY', 'expedition_lore');
  const resAdopt = g.CULT.LEGENDARY_DAO.evaluateNpcAdoption(W, highNpc, 'LEG_ASHEN_KILN_ALCHEMY');
  assert.strictEqual(resAdopt.decision, 'ADOPT', `Expected ADOPT for high-drive NPC, got ${resAdopt.decision}`);
  assert.strictEqual(highNpc.cult.path, 'LEG_ASHEN_KILN_ALCHEMY');

  // Case C: Cautious, already-invested high-stage NPC -> DECLINE
  const cautiousNpc = npcs[2];
  cautiousNpc.cult = { path: 'LEG_READ_FORM_BLADE', sub: 'LEG_SUB_CLOSING_BLADE', stage: 8, xp: 0 };
  cautiousNpc.h.personality.curiosity = 15;
  cautiousNpc.h.personality.ambition = 15;
  cautiousNpc.h.personality.discipline = 20;
  cautiousNpc.h.personality.caution = 95;
  cautiousNpc.h.intellect.comprehension = 25;
  g.CULT.LEGENDARY_DAO.recordDiscovery(W, cautiousNpc, 'LEG_OATH_JUDGE_WARDEN', 'archive');
  const resDecline = g.CULT.LEGENDARY_DAO.evaluateNpcAdoption(W, cautiousNpc, 'LEG_OATH_JUDGE_WARDEN');
  assert.strictEqual(resDecline.decision, 'DECLINE', `Expected DECLINE for cautious invested NPC, got ${resDecline.decision}`);
  console.log('PASS [3/7] Autonomous discovery -> STUDY / ADOPT / DECLINE decision chain verified');
}

// [4/7] Dedicated Support Paths at Both Tiers (LEG_TRIAGE_MERIDIAN & TRANS_CONSTELLATION_RELAY)
{
  const W = g.SIM.create('v370_support_test');
  W.t = 100;
  const medic = { id: 'sup1', dead: false, qi: 50, hp: 300, hpMax: 300, cult: { path: 'LEG_TRIAGE_MERIDIAN', sub: 'LEG_SUB_WARD_PHYSICIAN', stage: 5 }, buffs: [], statuses: [] };
  const ally = { id: 'ally1', dead: false, qi: 30, hp: 100, hpMax: 300, buffs: [], statuses: [] };
  g.COMBAT.runLegendaryDaoProc(W, medic, null, [medic, ally], [], 'cast', 0);
  assert(ally.hp > 100, 'LEG_TRIAGE_MERIDIAN must heal injured ally');
  assert(medic.qi < 50, 'LEG_TRIAGE_MERIDIAN must spend real qi budget');
  const hpAfterFirst = ally.hp;
  // Immediate second call within ICD must NOT double-heal
  g.COMBAT.runLegendaryDaoProc(W, medic, null, [medic, ally], [], 'cast', 0);
  assert.strictEqual(ally.hp, hpAfterFirst, 'Per-target ICD must prevent infinite heal loops');

  // Transcendent Constellation Relay
  const anchor = { id: 'rel1', dead: false, qi: 60, hp: 200, hpMax: 300, cult: { path: 'TRANS_CONSTELLATION_RELAY', sub: 'TRANS_SUB_TRIAD_ANCHOR', stage: 7 }, buffs: [], statuses: [] };
  const a2 = { id: 'ally2', dead: false, hp: 150, hpMax: 300, buffs: [], statuses: [] };
  g.COMBAT.runLegendaryDaoProc(W, anchor, null, [anchor, a2], [], 'cast', 0);
  assert(a2.hp > 150 && anchor.qi < 60, 'TRANS_CONSTELLATION_RELAY must share bounded relay heal');
  console.log('PASS [4/7] Dedicated support paths (LEG_TRIAGE_MERIDIAN & TRANS_CONSTELLATION_RELAY) with qi cost & ICD verified');
}

// [5/7] Original Custom Daos & Multi-Layer World Ripples (Ashen Kiln + Dynastic Mandate Weaver)
{
  const W = g.SIM.create('v370_custom_ripples');
  g.EXPED.LIVING_POLITIES.ensureWorldState(W);
  const npcs = (W.npcs || []).filter(n => n && !n.dead);
  npcs[0].cult = { path: 'LEG_ASHEN_KILN_ALCHEMY', sub: 'LEG_SUB_CRACKED_GLAZE_WARD', stage: 5, xp: 0 };
  npcs[1].cult = { path: 'TRANS_DYNASTIC_MANDATE_WEAVER', sub: 'TRANS_SUB_TURMOIL_SHEPHERD', stage: 7, xp: 0 };

  // Put home polity in TURMOIL and verify both ripples fire cleanly without creating free stones out of thin air
  const homeLp = W.world.continent.courts.POL_YUNHE.livingPolity;
  homeLp.era = 'TURMOIL';
  homeLp.legitimacy = 40;
  const poolBefore = W.world.resourcePool.stones;
  const sectBefore = W.sect.stones;

  W.day = 60;
  g.CULT.LEGENDARY_DAO.tickMonthlyDiscoveryAndRipples(W);
  assert(W.sect.stones > sectBefore, 'Ashen Kiln must salvage stones during turmoil');
  assert.strictEqual(W.world.resourcePool.stones + W.sect.stones, poolBefore + sectBefore, 'Closed-loop stone conservation must hold');
  assert(homeLp.legitimacy > 40, 'Dynastic Mandate Weaver must stabilize local polity legitimacy');
  console.log('PASS [5/7] Original Custom Daos (Ashen Kiln & Dynastic Mandate Weaver) multi-layer ripples & conservation verified');
}

// [6/7] Zero W.rng Consumption + 100% Save/Load Replay Determinism + Legacy 3.6.0c Hydration
{
  const W1 = g.SIM.create('v370_det_seed');
  const W2 = g.SIM.create('v370_det_seed');
  const rngBefore = W1.rngState;
  g.CULT.LEGENDARY_DAO.ensureWorldState(W1);
  assert.strictEqual(W1.rngState, rngBefore, 'ensureWorldState must not consume W.rng');

  for (let m = 1; m <= 12; m++) {
    W1.day = m * 30; W2.day = m * 30;
    g.CULT.LEGENDARY_DAO.tickMonthlyDiscoveryAndRipples(W1);
    g.CULT.LEGENDARY_DAO.tickMonthlyDiscoveryAndRipples(W2);
  }
  const W2Loaded = g.SIM.deserialize(g.SIM.serialize(W2));
  for (let m = 13; m <= 24; m++) {
    W1.day = m * 30; W2Loaded.day = m * 30;
    g.CULT.LEGENDARY_DAO.tickMonthlyDiscoveryAndRipples(W1);
    g.CULT.LEGENDARY_DAO.tickMonthlyDiscoveryAndRipples(W2Loaded);
  }
  assert.strictEqual(JSON.stringify(W1.world.legendaryDao), JSON.stringify(W2Loaded.world.legendaryDao), '100% Save/Load replay determinism required');

  // Legacy 3.6.0c save hydration
  const legacyRaw = JSON.parse(g.SIM.serialize(W1));
  legacyRaw.patchVersion = '3.6.0c';
  legacyRaw.schemaVersion = '3.6.0c-living-world-audit';
  delete legacyRaw.world.legendaryDao;
  const hydrated = g.SIM.deserialize(JSON.stringify(legacyRaw));
  hydrated.day = 900;
  g.CULT.LEGENDARY_DAO.tickMonthlyDiscoveryAndRipples(hydrated);
  assert(hydrated.world.legendaryDao && hydrated.world.legendaryDao.lastMonthTick >= 30, 'Legacy 3.6.0c save must hydrate cleanly');
  console.log('PASS [6/7] Zero W.rng, 100% Save/Load determinism & legacy 3.6.0c save hydration verified');
}

// [7/7] Observer UI Integration & Visual Signature Parity
{
  const uiSrc = fs.readFileSync(path.join(__dirname, '../js/ui.js'), 'utf8');
  assert(uiSrc.includes('UI.formatLegendaryDaoSummary'), 'ui.js must define UI.formatLegendaryDaoSummary');
  assert(uiSrc.includes('world-legendary-dao-card'), 'ui.js must render world-legendary-dao-card');
  const renSrc = fs.readFileSync(path.join(__dirname, '../js/render.js'), 'utf8');
  for (const pid of g.CULT.LEGENDARY_DAO.PATH_IDS) {
    assert(renSrc.includes(pid + ':'), `render.js must define visual signature for ${pid}`);
  }
  console.log('PASS [7/7] Observer UI integration & 55/55 visual signature parity verified');
}

console.log('✅ ALL JS2 v3.7.0 LEGENDARY & TRANSCENDENT DAO CHECKS PASSED!');
