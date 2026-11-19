'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const g = require('./load.js');

console.log('=== JS2 v3.8.2 — Novel-Grade Era 0–1 Chaos Lore Archive Suite ===');

// [1/5] Version, Standalone File Existence, 40-Script Lock & 3.8.1 Save Hydration
{
  assert.strictEqual(g.SIM.PATCH_VERSION, '3.8.3');
  assert.strictEqual(g.SIM.SAVE_SCHEMA_VERSION, '3.8.3-grand-lore-chronicles-11books');
  assert(fs.existsSync(path.join(__dirname, '../data/lore_chronicle_e0_e1.js')), 'Standalone lore_chronicle_e0_e1.js must exist');
  assert(fs.existsSync(path.join(__dirname, '../tools/sync_lore_bundle.js')), 'tools/sync_lore_bundle.js must exist');
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.strictEqual((html.match(/<script\s+src=/g) || []).length, 40, 'Exact 40 <script> tags must be preserved');
  const W = g.SIM.create('v382_hyd');
  const snap = JSON.parse(g.SIM.serialize(W));
  snap.schemaVersion = '3.8.1-world-calendar-epoch';
  const hydrated = g.SIM.deserialize(JSON.stringify(snap));
  assert(hydrated && Array.isArray(hydrated.npcs) && hydrated.npcs.length > 0);
  console.log('PASS [1/5] Version 3.8.2, standalone lore JS, 40-script lock & 3.8.1 save hydration verified');
}

// [2/5] 18 Novel-Grade Era 0–1 Historical Events With Chronological Order & Reusable Hooks
{
  const CH = g.EXPED.getLoreChronicleE0E1();
  assert(CH && Object.isFrozen(CH), 'JD.LORE_CHRONICLE_E0_E1 must be loaded and frozen');
  assert.strictEqual(CH.EVENTS.length, 18, `Expected 18 Era 0-1 events, got ${CH.EVENTS.length}`);
  const e0 = CH.EVENTS.filter(e => e.eraGroup === 'ERA_0');
  const e1 = CH.EVENTS.filter(e => e.eraGroup === 'ERA_1');
  assert.strictEqual(e0.length, 6, 'Expected 6 Era 0 events');
  assert.strictEqual(e1.length, 12, 'Expected 12 Era 1 chaos events');
  for (const ev of CH.EVENTS) {
    assert(ev.titleTh && ev.narrativeTh && ev.narrativeTh.length >= 160, `${ev.id} must have novel-grade narrativeTh`);
    assert(ev.aftermathTh && Array.isArray(ev.reusableHooks) && ev.reusableHooks.length >= 2, `${ev.id} must have aftermathTh & >= 2 reusableHooks`);
  }
  console.log('PASS [2/5] All 18 novel-grade Era 0–1 events (6 Era 0 + 12 Era 1) with reusableHooks verified');
}

// [3/5] 18 Era 0–1 Figures With Survival Status (Living/Stasis/Soul-Relic/Undead/Missing)
{
  const CH = g.EXPED.getLoreChronicleE0E1();
  assert.strictEqual(CH.FIGURES_E0_E1.length, 18, `Expected 18 Era 0-1 figures, got ${CH.FIGURES_E0_E1.length}`);
  const validSt = new Set(Object.keys(CH.SURVIVAL_STATUS));
  const counts = {};
  for (const fg of CH.FIGURES_E0_E1) {
    assert(validSt.has(fg.survivalStatus), `Invalid survivalStatus on ${fg.id}`);
    assert(fg.biographyTh && fg.biographyTh.length >= 100, `${fg.id} must have detailed biographyTh`);
    assert(fg.survivalMethodTh && fg.possibleLocationTh, `${fg.id} must have survivalMethodTh & possibleLocationTh`);
    counts[fg.survivalStatus] = (counts[fg.survivalStatus] || 0) + 1;
  }
  assert(counts.ALIVE_HIDDEN >= 4 && counts.ALIVE_STASIS >= 3, 'Must include multiple living/hidden & stasis survivors');
  console.log('PASS [3/5] All 18 Era 0–1 figures & survival statuses verified:', JSON.stringify(counts));
}

// [4/5] 6 Fallen Ancient Sects of Era 0–1
{
  const CH = g.EXPED.getLoreChronicleE0E1();
  assert.strictEqual(CH.FALLEN_SECTS_E0_E1.length, 6, 'Expected 6 fallen ancient sects');
  for (const fs of CH.FALLEN_SECTS_E0_E1) {
    assert(fs.nameTh && fs.foundedTh && fs.fallenTh && fs.summaryTh && Array.isArray(fs.pathsTh) && fs.pathsTh.length >= 1);
  }
  console.log('PASS [4/5] All 6 fallen ancient sects of Era 0–1 verified');
}

// [5/5] UI.rLore() Tab 'chaos_e0_e1' Renders All 3 Sub-Tabs With Zero W.rng & Zero Mutation
{
  const W = g.SIM.create('v382_ui_purity');
  const rngBefore = JSON.stringify(W.rng.getState());
  const snapBefore = g.SIM.serialize(W);
  if (!g.UI) {
    g.document = { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} };
    require('../js/ui.js');
  }
  g.UI.G = { W };
  g.UI.tab = 'chaos_e0_e1';
  for (const sub of ['EVENTS', 'SURVIVORS', 'SECTS']) {
    g.UI.loreChaosSub = sub;
    const html = g.UI.rLore();
    assert(typeof html === 'string' && html.length > 800, `chaos_e0_e1 sub-tab ${sub} must render rich HTML`);
  }
  assert.strictEqual(JSON.stringify(W.rng.getState()), rngBefore, 'UI.rLore must never consume W.rng');
  assert.strictEqual(g.SIM.serialize(W), snapBefore, 'UI.rLore must never mutate W');
  console.log('PASS [5/5] UI.rLore() chaos_e0_e1 sub-tabs render cleanly with zero W.rng & zero mutation');
}

console.log('✅ ALL JS2 v3.8.2 NOVEL-GRADE ERA 0–1 CHAOS LORE CHECKS PASSED!');
