#!/usr/bin/env node
'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ctx = require('./load.js');

const ROOT = path.resolve(__dirname, '..', '..');
const GS = path.resolve(__dirname, '..');

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function run() {
  const results = [];
  function test(name, fn) {
    fn();
    results.push({ name, ok: true });
    console.log('PASS:', name);
  }

  test('1. Constitutional hard locks, 40 scripts, Book #105 exported & all 8 Patch Reports present', () => {
    assert.strictEqual(
      sha256(path.join(ROOT, 'AGENTS.md')),
      'f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4'
    );
    assert.strictEqual(
      sha256(path.join(GS, 'js', 'human_core.js')),
      'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542'
    );
    assert.strictEqual(ctx.HC.FINGERPRINT, '155:2f9c9dd7');
    const idxHtml = fs.readFileSync(path.join(GS, 'index.html'), 'utf8');
    assert.strictEqual((idxHtml.match(/<script\b[^>]*>/gi) || []).length, 40);
    assert.ok(/v3\.15\./.test(idxHtml), 'index.html must reflect v3.15.x');

    assert.ok(ctx.JD.LORE_CHRONICLE_B105_GRAND_FESTIVALS, 'Book #105 must be synced into JD');
    assert.strictEqual(ctx.JD.LORE_CHRONICLE_B105_GRAND_FESTIVALS.META.bookNumber, 105);
    assert.strictEqual(ctx.JD.LORE_CHRONICLE_B105_GRAND_FESTIVALS.GRAND_FESTIVALS.length, 6);

    const ps = fs.readFileSync(path.join(ROOT, 'project_status_and_ai_onboarding.md'), 'utf8');
    assert.ok(/JS2 v3\.15\./.test(ps), 'project_status_and_ai_onboarding.md must be updated to JS2 v3.15.x');
    for (const pr of [
      'TWO_SPECS_BUGFIX_AUDIT_JS2_V3_9_9.md',
      'CHRONICLE_REPORTING_OVERHAUL_JS2_V3_10_0.md',
      'BIOGRAPHY_ERA_TIMELINE_JS2_V3_11_0.md',
      'EMERGENT_LONGEVITY_ERA_SURVIVAL_JS2_V3_12_0.md',
      'WORLD_SYMMETRY_LONGEVITY_JS2_V3_12_1.md',
      'SEVEN_HALL_BLACK_LEDGER_JS2_V3_13_0.md',
      'LIVING_TWELVE_FESTIVALS_JS2_V3_14_0.md',
      'GRAND_PERIODIC_FESTIVALS_B105_JS2_V3_15_0.md'
    ]) {
      assert.ok(fs.existsSync(path.join(ROOT, 'PATCH_REPORTS', pr)), 'Missing patch report: ' + pr);
    }
  });

  const W = ctx.SIM.create({ seed: 31501, sectName: 'สำนักเมฆาหยก', mode: 'balanced' });

  test('2. All 6 Grand Periodic Festivals (10y, 50y, 100y, 120y, 1000y, 10000y) converge in Years 2–5', () => {
    assert.strictEqual(ctx.EXPED.GRAND_FESTIVALS.DEFS.length, 6);
    const rngBefore = W.rng.s;
    const up = ctx.EXPED.GRAND_FESTIVALS.getUpcomingList(W);
    assert.strictEqual(W.rng.s, rngBefore, 'getUpcomingList must consume 0 W.rng');
    assert.strictEqual(up.length, 6);
    assert.ok(up.every(x => x.nextYear >= 2 && x.nextYear <= 5), 'All 6 cycles must converge in Years 2-5');
  });

  test('3. Year 2 M8 D12 Millennial Stele Conclave stacks modifiers & feeds Seven-Hall auction tax', () => {
    const blBefore = ctx.EXPED.BLACK_LEDGER.ensure(W).treasuryStones;
    // Year 2 (offset 360 + 360), Month 8 (7*30), Day 12 (+11)
    const dY2M8D12 = 360 + 360 + 7 * 30 + 11;
    W.t = dY2M8D12 * 1440;
    W.day = dY2M8D12;
    const gf = ctx.EXPED.GRAND_FESTIVALS.dailyTick(W);
    assert.ok(gf && gf.id === 'GF_1000Y_MILLENNIAL_STELE_CONCLAVE', 'Must activate Millennial Stele Conclave');
    const mods = ctx.EXPED.ANNUAL_FESTIVALS.getActiveModifiers(W);
    assert.ok(mods.cultRateMult >= 1.12 && mods.btBonus >= 0.05, 'Millennial modifiers must apply');
    assert.strictEqual(ctx.EXPED.BLACK_LEDGER.ensure(W).treasuryStones, blBefore + 250, 'Seven Halls must receive +250 auction tax');
  });

  test('4. Year 5 M1 D1 Ten-Epoch Resonance Bell activates & Zero-RNG UI/innerVoiceTh work', () => {
    const dY5M1D1 = 360 + 4 * 360;
    W.t = dY5M1D1 * 1440;
    W.day = dY5M1D1;
    const gf5 = ctx.EXPED.GRAND_FESTIVALS.dailyTick(W);
    assert.ok(gf5 && gf5.id === 'GF_10000Y_TEN_EPOCH_BELL', 'Must activate Ten-Epoch Bell');
    const npc = W.npcs[0];
    const rngBefore = W.rng.s;
    const mind = ctx.COG.explain(W, npc);
    assert.strictEqual(W.rng.s, rngBefore, 'COG.explain must remain Zero-RNG');
    assert.ok(mind.innerVoiceTh.includes('ระฆังหมื่นปี'), 'innerVoiceTh must reflect Ten-Epoch Bell');

    const uiSrc = fs.readFileSync(path.join(GS, 'js', 'ui.js'), 'utf8');
    const cssSrc = fs.readFileSync(path.join(GS, 'css', 'style.css'), 'utf8');
    assert.ok(uiSrc.includes('GRAND_FESTIVALS') && cssSrc.includes('.fest-grand-banner'), 'UI & CSS Grand Festival components missing');
  });

  console.log(`\nALL ${results.length}/${results.length} v3.15.0 BOOK #105 & GRAND FESTIVALS TESTS PASSED!`);
}

run();
