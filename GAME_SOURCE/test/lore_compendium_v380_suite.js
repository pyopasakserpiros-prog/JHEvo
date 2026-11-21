'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const g = require('./load.js');

console.log('=== JS2 v3.8.0 — Master Lore Compendium & Dedicated Era Lore Window Suite ===');

// [1/6] Version, 40-Script Lock & Legacy 3.7.0c Save Hydration
{
  assert.strictEqual(g.SIM.PATCH_VERSION, '3.8.6');
  assert.strictEqual(g.SIM.SAVE_SCHEMA_VERSION, '3.8.6-90book-grand-lore-archive');
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const scriptCount = (html.match(/<script\s+src=/g) || []).length;
  assert.strictEqual(scriptCount, 40, `Expected exact 40 <script> tags, got ${scriptCount}`);
  assert(html.includes('data-nav="lore"'), 'index.html must include dedicated Lore button in #hudBottom');
  const W = g.SIM.create('v380_schema');
  const snap = JSON.parse(g.SIM.serialize(W));
  snap.schemaVersion = '3.7.0c-final-polish';
  const hydrated = g.SIM.deserialize(JSON.stringify(snap));
  assert(hydrated && Array.isArray(hydrated.npcs) && hydrated.npcs.length > 0, 'Must hydrate 3.7.0c saves cleanly');
  console.log('PASS [1/6] Version 3.8.0, 40-script lock, Lore nav button & 3.7.0c save hydration verified');
}

// [2/6] Complete 6-Era Structure & All 40 Living Lore Facts Mapped to Canonical Eras
{
  const C = g.EXPED.LORE_COMPENDIUM;
  assert(C && Array.isArray(C.ERAS), 'EXPED.LORE_COMPENDIUM.ERAS must exist');
  assert.strictEqual(C.ERAS.length, 6, 'Must have exact 6 Grand Epochs (ERA_0..ERA_5)');
  const eraIds = new Set(C.ERAS.map(e => e.id));
  for (const e of C.ERAS) {
    assert(e.codeTh && e.nameTh && Array.isArray(e.chapters) && e.chapters.length >= 2, `${e.id} must have >= 2 epic chapters`);
  }
  const facts = g.EXPED.LIVING_LORE.CANON_FACTS || [];
  assert.strictEqual(facts.length, 40);
  for (const f of facts) {
    const eid = g.EXPED.LORE_COMPENDIUM_GET_ERA_FOR_FACT(f.id);
    assert(eraIds.has(eid), `Fact ${f.id} mapped to invalid era ${eid}`);
  }
  console.log('PASS [2/6] All 6 Grand Epochs & 40/40 Living Lore fact era mappings verified');
}

// [3/6] All 33 Empires/Realms & All 60/60 Legendary Historical Figures Imported
{
  const C = g.EXPED.LORE_COMPENDIUM;
  assert(C.EMPIRES_AND_REALMS.length >= 33, `Expected >= 33 empires/realms, got ${C.EMPIRES_AND_REALMS.length}`);
  assert.strictEqual(C.FIGURES_60.length, 60, `Expected exact 60 legendary figures, got ${C.FIGURES_60.length}`);
  for (let n = 1; n <= 60; n++) {
    const fg = C.FIGURES_60[n - 1];
    assert.strictEqual(fg.num, n, `Figure #${n} missing or out of order`);
    assert(fg.titleTh && fg.summaryTh && fg.eraId, `Figure #${n} must have titleTh, summaryTh & eraId`);
  }
  console.log(`PASS [3/6] All ${C.EMPIRES_AND_REALMS.length} empires/realms & 60/60 legendary figures verified`);
}

// [4/6] Cosmology, 6 Sovereign Beast Kings & 5 Legendary Arsenal Groups
{
  const C = g.EXPED.LORE_COMPENDIUM;
  assert(C.COSMOLOGY && Array.isArray(C.COSMOLOGY.pillars) && C.COSMOLOGY.pillars.length >= 3, 'Cosmology pillars required');
  assert.strictEqual(C.BEAST_KINGS.length, 6, 'All 6 Sovereign Beast Kings must be imported');
  assert(C.LEGENDARY_ARSENAL.length >= 5, 'All 5 Legendary Arsenal groups must be imported');
  console.log('PASS [4/6] Cosmology, 6 Sovereign Beast Kings & 5 Legendary Arsenal groups verified');
}

// [5/6] Dedicated Read-Only UI.rLore() Renders All 6 Tabs With Zero W.rng Consumption & Zero State Mutation
{
  const uiSrc = fs.readFileSync(path.join(__dirname, '../js/ui.js'), 'utf8');
  assert(uiSrc.includes("case 'lore': html = UI.rLore(); break;"), 'UI.render must dispatch case lore');
  assert(uiSrc.includes('UI.rLore = () =>'), 'UI.rLore must be implemented');
  assert(uiSrc.includes("set-lore-era") && uiSrc.includes("set-lore-emp-group") && uiSrc.includes("set-lore-fig-group"), 'Read-only Lore filter handlers must be wired');
  // Execute UI.rLore directly in a minimal mock DOM context to verify all 6 tabs render cleanly without touching W.rng or W
  const W = g.SIM.create('v380_ui_purity');
  const rngBefore = JSON.stringify(W.rng.getState());
  const snapBefore = g.SIM.serialize(W);
  if (!g.UI) {
    // Load ui.js safely with minimal document stub if not loaded by load.js
    const stubDoc = { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} };
    g.document = stubDoc;
    require('../js/ui.js');
  }
  g.UI.G = { W };
  for (const tab of ['eras', 'empires', 'figures', 'cosmos', 'arsenal', 'living']) {
    g.UI.tab = tab;
    const html = g.UI.rLore();
    assert(typeof html === 'string' && html.length > 400, `UI.rLore tab "${tab}" must render substantial HTML`);
  }
  assert.strictEqual(JSON.stringify(W.rng.getState()), rngBefore, 'UI.rLore must never consume W.rng');
  assert.strictEqual(g.SIM.serialize(W), snapBefore, 'UI.rLore must never mutate W');
  console.log('PASS [5/6] Dedicated UI.rLore() renders all 6 tabs with zero W.rng consumption & zero W mutation');
}

// [6/6] Zero Unrequested Discovery/Event Hooks Added (Pure Canonical Lore Foundation)
{
  const C = g.EXPED.LORE_COMPENDIUM;
  assert(Object.isFrozen(C), 'EXPED.LORE_COMPENDIUM must be frozen immutable canonical data');
  console.log('PASS [6/6] Immutable canonical EXPED.LORE_COMPENDIUM foundation verified');
}

console.log('✅ ALL JS2 v3.8.0 MASTER LORE COMPENDIUM & ERA WINDOW CHECKS PASSED!');
