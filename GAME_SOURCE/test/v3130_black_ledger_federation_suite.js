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

  test('1. Constitutional hard locks, 40 scripts, Project Status & all 6 Patch Reports present', () => {
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
    assert.ok(/v3\.(13|14|15)\./.test(idxHtml), 'index.html must reflect v3.13.x');

    const ps = fs.readFileSync(path.join(ROOT, 'project_status_and_ai_onboarding.md'), 'utf8');
    assert.ok(/JS2 v3\.(13|14|15)\./.test(ps), 'project_status_and_ai_onboarding.md must be updated to JS2 v3.13.x');
    for (const pr of [
      'TWO_SPECS_BUGFIX_AUDIT_JS2_V3_9_9.md',
      'CHRONICLE_REPORTING_OVERHAUL_JS2_V3_10_0.md',
      'BIOGRAPHY_ERA_TIMELINE_JS2_V3_11_0.md',
      'EMERGENT_LONGEVITY_ERA_SURVIVAL_JS2_V3_12_0.md',
      'WORLD_SYMMETRY_LONGEVITY_JS2_V3_12_1.md',
      'SEVEN_HALL_BLACK_LEDGER_JS2_V3_13_0.md'
    ]) {
      assert.ok(fs.existsSync(path.join(ROOT, 'PATCH_REPORTS', pr)), 'Missing patch report: ' + pr);
    }
  });

  const W = ctx.SIM.create({ seed: 31301, sectName: 'สำนักเมฆาหยก', mode: 'balanced' });
  for (let i = 0; i < 4; i++) ctx.SIM.tick(W, 60);

  test('2. Unforced calm world has only canon ปกดำ-๐๖ & Zero Thin-Air 7-Hall Representatives', () => {
    const st = ctx.EXPED.BLACK_LEDGER.ensure(W);
    assert.strictEqual(ctx.EXPED.BLACK_LEDGER.HALLS.length, 7, 'Must define all 7 Book 95 halls');
    assert.strictEqual(st.activeWarrants.length, 1, 'Calm world must not fabricate fake warrants');
    assert.strictEqual(st.activeWarrants[0].caseCodeTh, 'ปกดำ-๐๖');
    assert.strictEqual(st.activeWarrants[0].bountyNet, Math.round(850 * 0.88), 'Exact 12% court upkeep deduction');
    assert.ok(st.representatives.length >= 5, 'Must seat real representatives from world entities');
    assert.strictEqual(st.chair.nameTh, 'ซ่งเยี่ยนชิง', 'Epoch 101 Chair must start as Song Yanqing');
    const nonChair = st.representatives.filter(r => !r.isChair);
    assert.ok(nonChair.every(r => r.sourceType === 'POLITICAL_PERSON' || r.sourceType === 'EXTERNAL_SECT_ELDER'), 'All non-chair reps must come from real world entities');
  });

  test('3. Symmetric Home-Sect Warrant: Defiance triggers 6% caravan tariff sanction & innerVoiceTh', () => {
    const master = W.byId[W.sect.masterId];
    const culprit = W.npcs.find(n => n && !n.dead && n.id !== master.id);
    // Make master fierce/defiant and low stones so sect defies warrant
    master.h.personality.courage = 92;
    master.h.personality.caution = 15;
    master.h.personality.integrity = 25;
    W.sect.stones = 100;
    const wRec = ctx.EXPED.BLACK_LEDGER.reportTransgression(W, culprit, 'FORBIDDEN_ART', 'ทดสอบร่ายวิชาต้องห้าม');
    assert.ok(wRec && wRec.stance === 'DEFY_HARBOR', 'Defiant master should choose DEFY_HARBOR');
    assert.strictEqual(ctx.EXPED.BLACK_LEDGER.getSanctionTariffAdd(W, 'HOME_SECT'), 0.06, 'Defiance must trigger +6% sanction tariff');
    const rngBefore = W.rng.s;
    const mind = ctx.COG.explain(W, culprit);
    assert.strictEqual(W.rng.s, rngBefore, 'COG.explain must remain Zero-RNG');
    assert.ok(mind.innerVoiceTh && mind.innerVoiceTh.includes('หมายจับป้ายเหล็กดำ'), 'innerVoiceTh must reflect active warrant');
  });

  test('4. Symmetric External-Sect Warrant & Conflict-of-Interest Scandal', () => {
    const extSect = W.world.sects.find(s => s && !s.collapsed && s.livingRoster && s.livingRoster.leader);
    assert.ok(extSect, 'Need living external sect');
    const st = ctx.EXPED.BLACK_LEDGER.ensure(W);
    const credBefore = st.credibility;
    // Simulate conflict of interest: Chair shares origin sect with low integrity
    st.chair = Object.assign({}, st.chair, { originSectId: ctx.EXPED.BLACK_LEDGER.getSectKey(W, false, extSect), integrity: 35 });
    const wExt = ctx.EXPED.BLACK_LEDGER.reportExternalSectCrime(W, extSect, extSect.livingRoster.leader, 'FORBIDDEN_ART', 'ทดสอบคดีสำนักต่างถิ่น');
    assert.ok(wExt && wExt.stalledByConflict === true, 'Low-integrity chair from same sect must trigger conflict-of-interest scandal');
    assert.ok(st.credibility < credBefore, 'Conflict-of-interest scandal must reduce Federation credibility');
  });

  test('5. Zero-RNG getReadOnlySummary & UI integration markers', () => {
    const rngBefore = W.rng.s;
    const sum = ctx.EXPED.BLACK_LEDGER.getReadOnlySummary(W);
    assert.strictEqual(W.rng.s, rngBefore, 'getReadOnlySummary must consume 0 W.rng');
    assert.ok(sum && sum.dominantFaction && sum.activeWarrants.length >= 1);
    const uiSrc = fs.readFileSync(path.join(GS, 'js', 'ui.js'), 'utf8');
    const cssSrc = fs.readFileSync(path.join(GS, 'css', 'style.css'), 'utf8');
    assert.ok(uiSrc.includes('fed-black-ledger-card') && uiSrc.includes('fed-badge-wanted'), 'UI Black Ledger components missing');
    assert.ok(cssSrc.includes('.fed-black-ledger-card') && cssSrc.includes('.fed-warrant-row'), 'CSS Black Ledger styles missing');
  });

  console.log(`\nALL ${results.length}/${results.length} v3.13.0 SEVEN-HALL FEDERATION & BLACK LEDGER TESTS PASSED!`);
}

run();
