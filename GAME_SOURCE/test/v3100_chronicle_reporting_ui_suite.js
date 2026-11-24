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

  // 1. Constitutional Hard Locks & 40-script invariant
  test('1. Constitutional hard locks (AGENTS.md, human_core.js, 40 script tags)', () => {
    assert.strictEqual(
      sha256(path.join(ROOT, 'AGENTS.md')),
      'f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4',
      'AGENTS.md SHA-256 must remain immutable'
    );
    assert.strictEqual(
      sha256(path.join(GS, 'js', 'human_core.js')),
      'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542',
      'human_core.js SHA-256 must remain immutable'
    );
    const idxHtml = fs.readFileSync(path.join(GS, 'index.html'), 'utf8');
    const scriptMatches = idxHtml.match(/<script\b[^>]*>/gi) || [];
    assert.strictEqual(scriptMatches.length, 40, 'index.html must preserve exact 40 script tags');
    assert.ok(/v3\.(10|11|12|13|14|15)\./.test(idxHtml), 'index.html title should reflect v3.10.0');
  });

  // 2. Option 2 Render & HUD Polish
  test('2. Option 2 render.js & ui.js polish (ImageData minimap, 4 weather types, gear fallback)', () => {
    const renderSrc = fs.readFileSync(path.join(GS, 'js', 'render.js'), 'utf8');
    const uiSrc = fs.readFileSync(path.join(GS, 'js', 'ui.js'), 'utf8');
    assert.ok(renderSrc.includes('createImageData'), 'getMini should use ImageData write');
    for (const wt of ['storm', 'thunder_tempest', 'spirit_aurora', 'crimson_sun']) {
      assert.ok(renderSrc.includes(wt), 'render.js drawWeather missing ' + wt);
      assert.ok(uiSrc.includes(wt), 'ui.js HUD icons missing ' + wt);
    }
    assert.ok(renderSrc.includes('EQ_V320_LORE_'), 'resolveLegendaryGearVisual fallback missing');
  });

  // ctx already loaded
  assert.strictEqual(ctx.HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT mismatch');
  const W = ctx.SIM.create({ seed: 31001, sectName: 'สำนักเมฆาหยก', mode: 'balanced' });

  // Advance a few days so systems initialize cleanly
  for (let i = 0; i < 6; i++) ctx.SIM.tick(W, 60);

  // 3. Chronicle 12 formats + v3.10.0 routing
  test('3. Exact 12 CHRONICLE_REPORT_FORMATS & v3.10.0 format routing', () => {
    const fmts = Object.keys(ctx.EXPED.CHRONICLE_REPORT_FORMATS);
    assert.strictEqual(fmts.length, 12, 'Must preserve exact 12 CHRONICLE_REPORT_FORMATS');
    const e1 = ctx.EXPED.recordChronicle(W, { category: 'COURT_POLITICS', titleTh: 'มติราชสำนัก', storyTh: 'ราชสำนักออกประกาศ', quiet: true });
    assert.strictEqual(e1.reportFormat, 'IMPERIAL_COUNCIL_DECREE');
    const e2 = ctx.EXPED.recordChronicle(W, { category: 'SECRET_REALM', titleTh: 'แดนลับเศษเสี้ยวมิติ', storyTh: 'สำรวจแดนลับ', quiet: true });
    assert.strictEqual(e2.reportFormat, 'SECRET_REALM_LOGBOOK');
    const e3 = ctx.EXPED.recordChronicle(W, { category: 'MARKET_TAX_ECONOMY', titleTh: 'ด่านภาษีสองฝั่ง', storyTh: 'ปรับอัตราภาษี', quiet: true });
    assert.strictEqual(e3.reportFormat, 'CONTINENTAL_ASSEMBLY_GAZETTE');
    const e4 = ctx.EXPED.recordChronicle(W, { category: 'WITNESS_EPOCH', titleTh: 'บันทึกอาผิง', storyTh: 'อาผิงคัดชื่อเพิ่ม', quiet: true });
    assert.strictEqual(e4.reportFormat, 'HEAVENLY_DAO_OMEN_SCROLL');
  });

  // 4. Periodic Digest: 28 metrics28 + 6 memorials + sibling metricsWorld (M29-M38) + 90d/360d windows
  test('4. Periodic Digest preserves 28 metrics28 & 6 memorials while adding metricsWorld (90d/360d)', () => {
    for (const wd of [1, 7, 30, 90, 360]) {
      const dig = ctx.EXPED.computePeriodDigest(W, wd);
      assert.strictEqual(Object.keys(dig.metrics28).length, 28, 'metrics28 must have exact 28 keys for wd=' + wd);
      assert.strictEqual(dig.memorialSections.length, 6, 'memorialSections must have exact 6 sections');
      assert.ok(dig.metricsWorld, 'metricsWorld must exist');
      assert.ok('M29_bloodlessWarPressure' in dig.metricsWorld, 'M29_bloodlessWarPressure missing');
      assert.ok('M30_curseHeatHerbMult' in dig.metricsWorld, 'M30_curseHeatHerbMult missing');
      assert.ok('M34_sectUniqueCrownsHeld' in dig.metricsWorld, 'M34_sectUniqueCrownsHeld missing');
      assert.ok('M35_tianguKeysGranted' in dig.metricsWorld, 'M35_tianguKeysGranted missing');
      assert.ok('M37_immortalTombsCompleted' in dig.metricsWorld, 'M37_immortalTombsCompleted missing');
    }
  });

  // 5. Zero-RNG & Zero-Mutation check on SIM.PROSE.psychLens and COG.explain().innerVoiceTh
  test('5. Zero-RNG deterministic SIM.PROSE.psychLens & COG.explain().innerVoiceTh', () => {
    const npc = W.npcs.find(x => x && !x.dead);
    assert.ok(npc, 'Need living NPC');
    const rngBefore = W.rng.s;
    const lens1 = ctx.SIM.PROSE.psychLens(W, npc);
    const lens2 = ctx.SIM.PROSE.psychLens(W, npc);
    assert.deepStrictEqual(lens1, lens2, 'psychLens must be deterministic');
    assert.strictEqual(W.rng.s, rngBefore, 'psychLens must not consume W.rng');

    const mind = ctx.COG.explain(W, npc);
    assert.ok(typeof mind.innerVoiceTh === 'string' && mind.innerVoiceTh.length > 8, 'innerVoiceTh must be non-empty Thai prose');
    assert.strictEqual(W.rng.s, rngBefore, 'COG.explain must not consume W.rng');
  });

  // 6. Combat Chronicle Payload includes domain clash, dao scars, overdrive backlash
  test('6. Combat Chronicle Payload includes lastDomainClash, daoScars & overdriveBacklashIds', () => {
    const n1 = W.npcs[0], n2 = W.npcs[1];
    n2.meridians = Object.assign({}, n2.meridians, { overdriveUsedInFight: true });
    const payload = ctx.COMBAT.buildFightChroniclePayload(W, {
      id: 'F_TEST_3100',
      kind: 'duel',
      A: [n1.id],
      B: [n2.id],
      winner: 'A',
      t0: Math.max(0, W.t - 12),
      lastDomainClash: { nameTh: 'อาณาเขตกระบี่เมฆา' },
      daoScars: [{ nameTh: 'รอยแผลเต๋ากระบี่' }]
    });
    n2.meridians.overdriveUsedInFight = false;
    assert.ok(payload && payload.summaryLineTh, 'summaryLineTh must exist');
    assert.ok(payload.summaryLineTh.includes('อาณาเขตกระบี่เมฆา'), 'Missing lastDomainClash in summaryLineTh');
    assert.ok(payload.summaryLineTh.includes('รอยจารึกเต๋า 1 แห่ง'), 'Missing daoScars in summaryLineTh');
    assert.ok(payload.summaryLineTh.includes('ฝืนเร่งชีพจรพิสดาร'), 'Missing overdrive backlash in summaryLineTh');
  });

  // 7. Legacy Tablet epitaphTh & lifeSummaryTh
  test('7. Legacy Tablet inscription generates epitaphTh and lifeSummaryTh', () => {
    const n = W.npcs[0];
    const tab = ctx.SECT.inscribeLegacyTablet(W, n, 'สิ้นอายุขัยอย่างสงบ');
    assert.ok(tab, 'Tablet must be created');
    assert.ok(typeof tab.epitaphTh === 'string' && tab.epitaphTh.length > 5, 'epitaphTh missing');
    assert.ok(typeof tab.lifeSummaryTh === 'string' && tab.lifeSummaryTh.length > 5, 'lifeSummaryTh missing');
  });

  // 8. UI Thai enum helpers, CSS 12 formats & Witness 13 Shards
  test('8. UI Reporting Overhaul (ENUM_TH, 12 chron-fmt CSS, 13 Rift-Shards, wide-log)', () => {
    const uiSrc = fs.readFileSync(path.join(GS, 'js', 'ui.js'), 'utf8');
    const cssSrc = fs.readFileSync(path.join(GS, 'css', 'style.css'), 'utf8');
    assert.ok(uiSrc.includes('UI.ENUM_TH'), 'UI.ENUM_TH missing');
    assert.ok(uiSrc.includes('wide-log'), 'wide-log class toggle missing');
    assert.ok(uiSrc.includes('รายฤดู (90 วัน)') && uiSrc.includes('รายปี (360 วัน)'), '90d/360d digest buttons missing');
    assert.ok(uiSrc.includes('digest.metricsWorld'), 'metricsWorld UI strip missing');
    assert.ok(uiSrc.includes('W.sect.digestHistory'), 'digestHistory drawer missing');
    assert.ok(uiSrc.includes('EXPED.presentChronicleEntry'), 'rWorld CHRONICLES must use presentChronicleEntry');
    assert.ok(uiSrc.includes('mind.innerVoiceTh'), 'rNpc innerVoiceTh rendering missing');
    assert.ok(uiSrc.includes('t.epitaphTh'), 'ancestorProfile epitaphTh rendering missing');
    assert.ok(uiSrc.includes('13 แห่ง (v3.10.0)') && uiSrc.includes('daoZhiArchiveOpen'), 'Witness card 13 shards update missing');

    assert.ok(cssSrc.includes('#sheet.wide-log'), 'CSS #sheet.wide-log missing');
    for (const fmtId of [
      'war_pavilion_record', 'tavern_ballad', 'ancestral_inscription',
      'imperial_council_decree', 'discipline_edict', 'periodic_sect_digest',
      'pigeon_dispatch', 'lineage_companion_scroll', 'secret_realm_logbook',
      'continental_assembly_gazette', 'heavenly_dao_omen_scroll', 'peak_hall_scroll'
    ]) {
      assert.ok(cssSrc.includes('.chron-fmt-' + fmtId), 'CSS missing .chron-fmt-' + fmtId);
    }
  });

  console.log(`\nALL ${results.length}/${results.length} v3.10.0 CHRONICLE & REPORTING UI TESTS PASSED!`);
}

run();
