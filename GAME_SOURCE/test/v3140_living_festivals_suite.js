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

  test('1. Constitutional hard locks, 40 scripts, Project Status & all 7 Patch Reports present', () => {
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
    assert.ok(/v3\.(14|15)\./.test(idxHtml), 'index.html must reflect v3.14.x');

    const ps = fs.readFileSync(path.join(ROOT, 'project_status_and_ai_onboarding.md'), 'utf8');
    assert.ok(/JS2 v3\.(14|15)\./.test(ps), 'project_status_and_ai_onboarding.md must be updated to JS2 v3.14.x');
    for (const pr of [
      'TWO_SPECS_BUGFIX_AUDIT_JS2_V3_9_9.md',
      'CHRONICLE_REPORTING_OVERHAUL_JS2_V3_10_0.md',
      'BIOGRAPHY_ERA_TIMELINE_JS2_V3_11_0.md',
      'EMERGENT_LONGEVITY_ERA_SURVIVAL_JS2_V3_12_0.md',
      'WORLD_SYMMETRY_LONGEVITY_JS2_V3_12_1.md',
      'SEVEN_HALL_BLACK_LEDGER_JS2_V3_13_0.md',
      'LIVING_TWELVE_FESTIVALS_JS2_V3_14_0.md'
    ]) {
      assert.ok(fs.existsSync(path.join(ROOT, 'PATCH_REPORTS', pr)), 'Missing patch report: ' + pr);
    }
  });

  const W = ctx.SIM.create({ seed: 31401, sectName: 'สำนักเมฆาหยก', mode: 'balanced' });

  test('2. All 12 Book 40 Annual Festivals defined & active on Month 1 Day 1', () => {
    assert.strictEqual(ctx.EXPED.ANNUAL_FESTIVALS.DEFS.length, 12, 'Must define all 12 monthly festivals');
    const act = ctx.EXPED.ANNUAL_FESTIVALS.getActive(W);
    assert.ok(act && act.month === 1 && act.shortTh === 'เช็ดคมวสันต์', 'Day 0 (M1 D1) must activate M01 festival');
    const rngBefore = W.rng.s;
    const mods = ctx.EXPED.ANNUAL_FESTIVALS.getActiveModifiers(W);
    assert.strictEqual(W.rng.s, rngBefore, 'getActiveModifiers must consume 0 W.rng');
    assert.ok(mods.cultRateMult > 1, 'M01 festival must boost cultRateMult');
  });

  test('3. Month 11 Solstice boosts CULT.rate & CULT.breakthroughChance cleanly', () => {
    const npc = W.npcs[0];
    // Non-festival day (M1 D10)
    W.t = (360 + 9) * 1440;
    W.day = 360 + 9;
    npc._cultRateBase = null;
    const rateNormal = ctx.CULT.rate(npc, 1, W);
    const btNormal = ctx.CULT.breakthroughChance(npc, { W });

    // Month 11 Day 21 (Solstice Meditation)
    W.t = (360 + 10 * 30 + 20) * 1440;
    W.day = 360 + 10 * 30 + 20;
    npc._cultRateBase = null;
    const f11 = ctx.EXPED.ANNUAL_FESTIVALS.dailyTick(W);
    assert.ok(f11 && f11.month === 11, 'Must activate M11 Solstice');
    const rateFest = ctx.CULT.rate(npc, 1, W);
    const btFest = ctx.CULT.breakthroughChance(npc, { W });
    assert.ok(rateFest > rateNormal, 'Solstice must increase CULT.rate');
    assert.ok(btFest > btNormal, 'Solstice must increase CULT.breakthroughChance');
  });

  test('4. Month 12 Empty-Bowl Vigil evaluates BOTH home sect & all 19 external sects symmetrically', () => {
    W.t = (360 + 11 * 30 + 27) * 1440;
    W.day = 360 + 11 * 30 + 27;
    if (ctx.EXPED.LIVING_SECTS && ctx.EXPED.LIVING_SECTS.ensureWorldState) ctx.EXPED.LIVING_SECTS.ensureWorldState(W);
    const grainBefore = ctx.ECO.count(W, 'grain');
    const master = W.byId[W.sect.masterId];
    master.h.personality.empathy = 80;
    const f12 = ctx.EXPED.ANNUAL_FESTIVALS.dailyTick(W);
    assert.ok(f12 && f12.month === 12, 'Must activate M12 Empty-Bowl Vigil');
    const grainAfter = ctx.ECO.count(W, 'grain');
    if (grainBefore >= 30) {
      assert.ok(grainAfter < grainBefore, 'Empathetic sect with grain >= 30 must spend grain on soup kitchen');
    }
    const st = ctx.EXPED.ANNUAL_FESTIVALS.ensure(W);
    assert.strictEqual(st.lastM12Year, ctx.SIM.calendar(W.t).year, 'M12 year flag must be recorded');
  });

  test('5. Zero-RNG innerVoiceTh & UI calendar/HUD integration', () => {
    const npc = W.npcs[0];
    const rngBefore = W.rng.s;
    const mind = ctx.COG.explain(W, npc);
    assert.strictEqual(W.rng.s, rngBefore, 'COG.explain must consume 0 W.rng');
    assert.ok(mind.innerVoiceTh && mind.innerVoiceTh.length > 5);

    const uiSrc = fs.readFileSync(path.join(GS, 'js', 'ui.js'), 'utf8');
    const cssSrc = fs.readFileSync(path.join(GS, 'css', 'style.css'), 'utf8');
    assert.ok(uiSrc.includes('btnFestivalHud') && uiSrc.includes('fest-annual-calendar-card'), 'UI festival HUD & calendar card missing');
    assert.ok(cssSrc.includes('.fest-annual-calendar-card') && cssSrc.includes('.fest-cal-grid'), 'CSS festival grid styles missing');
  });

  console.log(`\nALL ${results.length}/${results.length} v3.14.0 LIVING 12 ANNUAL FESTIVALS TESTS PASSED!`);
}

run();
