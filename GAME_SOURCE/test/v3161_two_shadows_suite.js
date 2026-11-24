'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const g = require('./load');

const ROOT = path.resolve(__dirname, '..');

function run() {
  console.log('=== JS2 v3.16.1 Two-Shadow Simulation (Years 1-9) Suite ===');

  // 1. Seed & Zero-RNG Read-Only Summary Check
  assert(g.EXPED && g.EXPED.FALLEN_STAR_EPIC, 'EXPED.FALLEN_STAR_EPIC must exist');
  const FSE = g.EXPED.FALLEN_STAR_EPIC;
  assert.strictEqual(FSE.OPERATIVE_DEFS.length, 7, 'Must define all 7 Epoch 101 operatives');
  assert.strictEqual(FSE.OPERATIVE_DEFS.filter(o => o.trueFaction === 'ECLIPSE_ASH').length, 5, '5 Eclipse Ash Order operatives');
  assert.strictEqual(FSE.OPERATIVE_DEFS.filter(o => o.trueFaction === 'PEAR_TWIG').length, 2, '2 Dried Pear Twig Keepers');

  const W = g.SIM.create('v3161_two_shadows_seed');
  if (g.EXPED.LIVING_SECTS && g.EXPED.LIVING_SECTS.ensureWorldState) {
    g.EXPED.LIVING_SECTS.ensureWorldState(W);
  }
  const st0 = FSE.ensure(W);
  assert(st0, 'ensure(W) must initialize W.world.fallenStarEpic');
  assert.strictEqual(st0.operatives.length, 7, 'All 7 operatives seeded on Day 1');
  assert.strictEqual(st0.phase, 'Y1_3_BRONZE_COIN', 'Initial phase must be Y1_3_BRONZE_COIN');

  const rngBefore = W.rng && W.rng.s;
  const sum0 = FSE.getReadOnlySummary(W);
  const rngAfter = W.rng && W.rng.s;
  assert.strictEqual(rngAfter, rngBefore, 'getReadOnlySummary must consume ZERO W.rng');
  assert(sum0 && sum0.operatives.length === 7, 'Read-only summary lists 7 operatives');
  assert(sum0.operatives.every(o => o.factionLabelTh === 'ไม่ทราบสังกัด'), 'Operative true factions must stay hidden initially');
  console.log('[PASS] 1. 7 operatives seeded deterministically, hidden initially, Zero-RNG read-only summary');

  // 2. ECO.price star-ore spike multiplier (1.12x)
  const testItem = 'ore';
  st0.oreSpikeUntilDay = 0;
  const basePrice = g.ECO.price(W, testItem);
  st0.oreSpikeUntilDay = (W.day || 360) + 10;
  const spikePrice = g.ECO.price(W, testItem);
  assert.strictEqual(FSE.getOrePriceMultiplier(W, testItem), 1.12, 'getOrePriceMultiplier must return 1.12 during spike');
  assert(spikePrice > basePrice, 'ECO.price must increase during star-ore spike');
  st0.oreSpikeUntilDay = 0;
  console.log('[PASS] 2. ECO.price star-ore spike hook verified (' + basePrice + ' -> ' + Number(spikePrice.toFixed(2)) + ')');

  // 3. 9-Year Live Headless Simulation (Years 1 -> 10 Day 1 = 9 * 360 = 3,240 days)
  const startDay = W.day || 360;
  const totalDays = 9 * 360 + 2;
  for (let d = 0; d < totalDays; d++) {
    W.t = (startDay + d) * 1440;
    W.day = startDay + d;
    const cal = g.SIM.calendar(W.t);
    FSE.tickDaily(W, cal, { silent: false });
  }

  const stEnd = W.world.fallenStarEpic;
  assert(stEnd.repairedVaults + stEnd.interceptedVaults > 0, 'Han Gu vault repairs/interceptions must occur over 9 years');
  assert(stEnd.repairedVaults + stEnd.interceptedVaults <= stEnd.maxVaults, 'Total vault events must stay <= 9');
  assert(stEnd.falseFlagsStaged > 0, 'Sikong Yan false flags must occur in Years 4-9');
  assert.strictEqual(stEnd.y5BellSpiked, true, 'Year 5 Bell resonance spikes must trigger');
  assert.strictEqual(stEnd.y7GearsHeard, true, 'Year 7 underground gears omen must trigger');
  assert.strictEqual(stEnd.y9SteleShattered, true, 'Year 9 shattered steles omen must trigger');
  assert.strictEqual(stEnd.crystalCrackPct, 100, 'Crystal crack must reach 100% by Year 10');
  assert.strictEqual(stEnd.year10Ready, true, 'year10Ready must flip true on Year 10 Day 1');
  assert(stEnd.phase === 'Y10_READY' || String(stEnd.phase || '').startsWith('Y10_'), 'Phase must enter Year 10 on Year 10 Day 1');
  const totalStained = stEnd.darkStarStainedHomeIds.length + stEnd.darkStarStainedExternalIds.length;
  assert(totalStained > 0, 'Moonshadow Black Market Dark-Star Manuals must stain at least 1 NPC across home/external sects');
  assert(stEnd.darkStarStainedExternalIds.length > 0, 'World Symmetry: external sect NPCs must also be eligible & stained');
  assert(stEnd.discoveredClues.length >= 3, 'At least 3 clues discovered over 9 years');

  const sumEnd = FSE.getReadOnlySummary(W);
  assert(sumEnd.operatives.some(o => o.factionLabelTh === 'ภาคีเถ้าสุริยคราส'), 'True factions reveal when Y10_READY / >=3 clues');
  assert(sumEnd.operatives.some(o => o.factionLabelTh === 'ผู้วางกิ่งสาลี่แห้ง'), 'Pear Twig faction reveals when Y10_READY / >=3 clues');
  console.log('[PASS] 3. 9-Year live sim verified: vaults=' + stEnd.repairedVaults + ' repaired / ' + stEnd.interceptedVaults + ' sealed, falseFlags=' + stEnd.falseFlagsStaged + ' (' + stEnd.falseFlagsExposed + ' exposed), stained=' + totalStained + ' (home=' + stEnd.darkStarStainedHomeIds.length + ', ext=' + stEnd.darkStarStainedExternalIds.length + '), clues=' + stEnd.discoveredClues.length);

  // 4. COG.explain inner-voice hint & Save/Load Round-Trip Parity
  const homeNpc = (W.npcs || []).find(n => n && !n.dead);
  assert(homeNpc, 'At least 1 living home NPC must exist');
  homeNpc.ext = homeNpc.ext || {};
  homeNpc.ext.darkStarStain = true;
  const rngCogBefore = W.rng && W.rng.s;
  const explainObj = g.COG.explain(W, homeNpc);
  const rngCogAfter = W.rng && W.rng.s;
  assert.strictEqual(rngCogAfter, rngCogBefore, 'COG.explain must be Zero-RNG');
  assert(JSON.stringify(explainObj || {}).includes('ปราณดารามืด'), 'COG.explain must surface subtle darkStarStain inner-voice hint');

  const saved = g.SIM.serialize(W);
  const W2 = g.SIM.deserialize(saved);
  assert(W2 && W2.world && W2.world.fallenStarEpic, 'Save/Load must preserve W.world.fallenStarEpic');
  assert.strictEqual(W2.world.fallenStarEpic.repairedVaults, stEnd.repairedVaults, 'repairedVaults parity');
  assert.strictEqual(W2.world.fallenStarEpic.interceptedVaults, stEnd.interceptedVaults, 'interceptedVaults parity');
  assert.strictEqual(W2.world.fallenStarEpic.sectSuspicion, stEnd.sectSuspicion, 'sectSuspicion parity');
  assert.strictEqual(W2.world.fallenStarEpic.crystalCrackPct, 100, 'crystalCrackPct parity');
  assert.strictEqual(W2.world.fallenStarEpic.year10Ready, true, 'year10Ready parity');
  console.log('[PASS] 4. COG.explain Zero-RNG inner-voice hint & Save/Load round-trip parity verified');

  // 5. UI Markers & Exact 40 <script> Tags Lock Check
  const uiSrc = fs.readFileSync(path.join(ROOT, 'js', 'ui.js'), 'utf8');
  assert(uiSrc.includes('fse-two-shadows-card'), 'UI.rWorld must include fse-two-shadows-card');
  assert(uiSrc.includes('darkStarStain'), 'UI.rNpc must surface darkStarStain chip');
  assert(uiSrc.includes('pearTwigClues'), 'UI.rNpc must surface pearTwigClues chip');

  const idxHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const scriptCount = (idxHtml.match(/<script\b[^>]*src=/g) || []).length;
  assert.strictEqual(scriptCount, 40, 'index.html must preserve exact 40 <script> tags');
  console.log('[PASS] 5. UI markers & exact 40 <script> tags verified');

  console.log('ALL 5/5 CHECKS PASSED — JS2 v3.16.1 Two-Shadow Simulation verified!');
}

run();
