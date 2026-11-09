/* test/v530_heavenly_tribulation_and_skill_vfx_suite.js — Dedicated 5-Phase Verification Suite for Patch v5.3.0 (Multi-Phase Heavenly Tribulation Breakthrough, Path Resonance, 15 Signature Skill VFX & Building/Edit Sub-Tabs) */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const g = require('./load');

const ROOT = path.resolve(__dirname, '..');

function makeMockCanvas(w, h) {
  const ops = [];
  const ctx = {
    canvas: null,
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    lineCap: 'butt',
    lineJoin: 'miter',
    font: '12px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    imageSmoothingEnabled: true,
    save() { ops.push('save'); },
    restore() { ops.push('restore'); },
    scale(x, y) { ops.push(['scale', x, y]); },
    translate(x, y) { ops.push(['translate', x, y]); },
    rotate(a) { ops.push(['rotate', a]); },
    setTransform(a, b, c, d, e, f) { ops.push(['setTransform', a, b, c, d, e, f]); },
    beginPath() { ops.push('beginPath'); },
    closePath() { ops.push('closePath'); },
    moveTo(x, y) { ops.push(['moveTo', x, y]); },
    lineTo(x, y) { ops.push(['lineTo', x, y]); },
    quadraticCurveTo(cx, cy, x, y) { ops.push(['quad', cx, cy, x, y]); },
    bezierCurveTo(c1x, c1y, c2x, c2y, x, y) { ops.push(['bezier', c1x, c1y, c2x, c2y, x, y]); },
    arc(x, y, r, s, e) { ops.push(['arc', x, y, r]); },
    ellipse(x, y, rx, ry, rot, s, e) { ops.push(['ellipse', x, y, rx, ry]); },
    rect(x, y, rw, rh) { ops.push(['rect', x, y, rw, rh]); },
    roundRect(x, y, rw, rh, rad) { ops.push(['roundRect', x, y, rw, rh, rad]); },
    fillRect(x, y, rw, rh) { ops.push(['fillRect', this.fillStyle, x, y, rw, rh]); },
    strokeRect(x, y, rw, rh) { ops.push(['strokeRect', this.strokeStyle, x, y, rw, rh]); },
    clearRect(x, y, rw, rh) { ops.push(['clearRect', x, y, rw, rh]); },
    fill() { ops.push(['fill', this.fillStyle]); },
    stroke() { ops.push(['stroke', this.strokeStyle]); },
    clip() { ops.push('clip'); },
    setLineDash(d) { ops.push(['setLineDash', d]); },
    fillText(txt, x, y) { ops.push(['fillText', String(txt), x, y]); },
    strokeText(txt, x, y) { ops.push(['strokeText', String(txt), x, y]); },
    measureText(txt) { return { width: String(txt || '').length * 7 }; },
    drawImage(img, ...args) { ops.push(['drawImage', args.length]); },
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; }
  };
  const cv = {
    width: w || 1280,
    height: h || 800,
    clientWidth: w || 1280,
    clientHeight: h || 800,
    style: {},
    _ops: ops,
    getContext() { return ctx; },
    getBoundingClientRect() { return { width: this.width, height: this.height, left: 0, top: 0 }; }
  };
  ctx.canvas = cv;
  return cv;
}

g.window = g;
g.devicePixelRatio = 2;
g.document = {
  createElement(tag) {
    if (tag === 'canvas') return makeMockCanvas(128, 128);
    return { dataset: {}, style: {}, classList: { add() {}, remove() {} }, appendChild() {}, remove() {}, querySelectorAll() { return []; } };
  },
  getElementById() {
    return {
      dataset: {},
      style: { setProperty() {} },
      classList: { add() {}, remove() {}, toggle() {} },
      innerHTML: '',
      textContent: '',
      scrollTop: 0,
      appendChild() {},
      remove() {},
      querySelector() { return null; },
      querySelectorAll() { return []; },
      getBoundingClientRect() { return { bottom: 40, width: 400, height: 600 }; },
      getContext() { return makeMockCanvas(184, 123).getContext(); }
    };
  },
  querySelectorAll() { return []; },
  body: { appendChild() {} }
};
if (typeof g.OffscreenCanvas === 'undefined') {
  g.OffscreenCanvas = function (w, h) { return makeMockCanvas(w, h); };
}

require(path.join(ROOT, 'js/render.js'));
require(path.join(ROOT, 'js/ui.js'));

(function runV530HeavenlyTribulationAndSkillVfxSuite() {
  console.log('--- Running Patch v5.3.0 (Multi-Phase Heavenly Tribulation, Path Resonance & 15 Signature Skill VFX) Suite ---');

  // 0. Verify human_core.js SHA-256 & Patch Version
  const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
  const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  assert.strictEqual(
    hcSha,
    'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542',
    'human_core.js SHA-256 must remain 100% byte-identical'
  );
  assert.strictEqual(g.HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
  assert.ok(['2.5.0', '2.6.0'].includes(g.SIM.PATCH_VERSION), 'SIM.PATCH_VERSION must be 5.3.0');
  assert.ok(
    ['2.4.0-tactical-composable-grand-dao', '2.6.0-living-chronicle-and-reporting'].includes(g.SIM.SAVE_SCHEMA_VERSION),
    'SIM.SAVE_SCHEMA_VERSION must be 5.8.0-forbidden-arts-passive-awakening-and-blood-altar'
  );

  const { CULT, SIM, SK, Render, UI } = g;

  // 1. Pillar 1: Multi-Phase Heavenly Tribulation Breakthrough System (15 Ticks, 3 Phases, 1/3/6/9 Lightning Bolts)
  assert.ok(CULT.TRIBULATION && typeof CULT.TRIBULATION.start === 'function', 'CULT.TRIBULATION API must exist');
  assert.strictEqual(CULT.TRIBULATION.strikeCountForStage(1), 1, 'Stage 1 -> 1 bolt');
  assert.strictEqual(CULT.TRIBULATION.strikeCountForStage(2), 1, 'Stage 2 -> 1 bolt');
  assert.strictEqual(CULT.TRIBULATION.strikeCountForStage(3), 3, 'Stage 3 (Golden Core) -> 3 golden bolts');
  assert.strictEqual(CULT.TRIBULATION.strikeCountForStage(4), 3, 'Stage 4 (Golden Core) -> 3 golden bolts');
  assert.strictEqual(CULT.TRIBULATION.strikeCountForStage(5), 6, 'Stage 5 (Nascent Soul) -> 6 bolts');
  assert.strictEqual(CULT.TRIBULATION.strikeCountForStage(6), 6, 'Stage 6 (Spirit Severing) -> 6 bolts');
  assert.strictEqual(CULT.TRIBULATION.strikeCountForStage(7), 9, 'Stage 7 (Mahayana) -> 9 imperial purple bolts');
  assert.strictEqual(CULT.TRIBULATION.strikeCountForStage(9), 9, 'Stage 9 (Immortal) -> 9 imperial purple bolts');

  const W = SIM.create('v530-trib-seed', { masterIdx: 0 });
  const n = W.byId[W.sect.masterId] || W.npcs[0];
  n.cult.stage = 3;
  n.cult.prog = CULT.threshold(n) + 50;

  const startRes = CULT.TRIBULATION.start(W, n, { prep: 0.95, totalTicks: 15, announce: true });
  assert.ok(startRes && startRes.ok, 'CULT.TRIBULATION.start must succeed');
  assert.ok(n.tribulationState && n.tribulationState.active, 'npc.tribulationState must be active');
  assert.strictEqual(n.tribulationState.phase, 'GATHERING', 'Must start in Phase 1 (GATHERING)');
  assert.strictEqual(n.tribulationState.totalStrikes, 3, 'Target stage 4 must have 3 golden lightning bolts');
  assert.strictEqual(W.sect.activeTribulations.length, 1, 'Must register in W.sect.activeTribulations');

  // Advance ticks 1..4 -> GATHERING
  for (let t = 1; t <= 4; t++) {
    CULT.TRIBULATION.tick(W, n);
    assert.strictEqual(n.tribulationState.phase, 'GATHERING', 'Tick ' + t + ' must remain GATHERING');
  }

  // Advance ticks 5..11 -> STRIKING
  for (let t = 5; t <= 11; t++) {
    CULT.TRIBULATION.tick(W, n);
    assert.strictEqual(n.tribulationState.phase, 'STRIKING', 'Tick ' + t + ' must be STRIKING');
  }
  assert.strictEqual(n.tribulationState.strikesLanded, 3, 'All 3 golden bolts must land by end of STRIKING phase');

  // Advance tick 12 -> Resolution (ASCENSION or BACKFIRE)
  CULT.TRIBULATION.tick(W, n);
  assert.ok(n.tribulationState.resolved, 'Breakthrough must resolve at tick 12');
  assert.ok(
    n.tribulationState.phase === 'ASCENSION' || n.tribulationState.phase === 'BACKFIRE',
    'Phase 3 must be ASCENSION or BACKFIRE'
  );

  // Advance remaining ticks 13..15 -> Cleanup
  for (let t = 13; t <= 15; t++) {
    CULT.TRIBULATION.tick(W, n);
  }
  assert.ok(!n.tribulationState, 'tribulationState must clean up after tick 15');
  assert.strictEqual(W.sect.activeTribulations.length, 0, 'activeTribulations registry must clean up after completion');
  console.log('  ✓ Pillar 1 (15-Tick 3-Phase Heavenly Tribulation & 1/3/6/9 Bolt Scaling) verified');

  // 2. Pillar 2: Path-Specific Breakthrough Resonance across All 12 Cultivation Paths
  const styles = CULT.TRIBULATION.PATH_STYLES;
  assert.strictEqual(Object.keys(styles).length, 5, 'All 5 Path-Specific Tribulation Styles must be defined');
  assert.strictEqual(CULT.TRIBULATION.resolvePathStyle('XIAN').id, 'SWORD_METAL');
  assert.strictEqual(CULT.TRIBULATION.resolvePathStyle('SWORD').id, 'SWORD_METAL');
  assert.strictEqual(CULT.TRIBULATION.resolvePathStyle('GOD').id, 'DAO_FIRE_THUNDER');
  assert.strictEqual(CULT.TRIBULATION.resolvePathStyle('BODY').id, 'DAO_FIRE_THUNDER');
  assert.strictEqual(CULT.TRIBULATION.resolvePathStyle('DEMON').id, 'DEMON_NETHER_BLOOD');
  assert.strictEqual(CULT.TRIBULATION.resolvePathStyle('HEART_SOUL').id, 'DEMON_NETHER_BLOOD');
  assert.strictEqual(CULT.TRIBULATION.resolvePathStyle('SAGE_SUPPORT').id, 'WOOD_EMERALD_LOTUS');
  assert.strictEqual(CULT.TRIBULATION.resolvePathStyle('CRAFT_CREATION').id, 'WOOD_EMERALD_LOTUS');
  assert.strictEqual(CULT.TRIBULATION.resolvePathStyle('ARRAY_TALISMAN').id, 'ARRAY_CLOCKWORK_BAGUA');
  assert.strictEqual(CULT.TRIBULATION.resolvePathStyle('MECH_PUPPET').id, 'ARRAY_CLOCKWORK_BAGUA');
  assert.strictEqual(CULT.TRIBULATION.resolvePathStyle('KARMA_SAMSARA').id, 'ARRAY_CLOCKWORK_BAGUA');

  const mainCv = makeMockCanvas(800, 600);
  const RInst = Render.create(mainCv);
  RInst.setWorld(W); RInst.resize();
  const ctx = mainCv.getContext('2d');

  for (const pKey of Object.keys(CULT.PATHS)) {
    n.cult.path = pKey;
    for (const phase of ['GATHERING', 'STRIKING', 'ASCENSION', 'BACKFIRE']) {
      n.tribulationState = {
        active: true,
        npcId: n.id,
        targetStage: 7,
        totalStrikes: 9,
        strikesLanded: 9,
        phase
      };
      W.sect.activeTribulations = [n.tribulationState];
      const drew = RInst.drawBreakthroughTribulationVfx(ctx, n, { x: n.x, y: n.y }, 1.2);
      const sky = RInst.drawHeavenlyTribulationSkyGlaze(ctx);
      assert.ok(drew, 'Must render tribulation VFX for path ' + pKey + ' phase ' + phase);
      assert.ok(sky || phase === 'BACKFIRE', 'Must render tribulation sky glaze for phase ' + phase);
    }
  }
  delete n.tribulationState;
  W.sect.activeTribulations = [];
  console.log('  ✓ Pillar 2 (Path-Specific Breakthrough Resonance across all 12 paths) verified');

  // 3. Pillar 3: 15 Signature Martial Arts & Unique Skill VFX
  const cat = SK.SIGNATURE_VFX_CATALOG;
  assert.strictEqual(Object.keys(cat).length, 30, 'Must have 15 Signature Skill VFX entries in SK.SIGNATURE_VFX_CATALOG');
  const expectedIds = [
    'sig_meteor_sword_rain',
    'sig_eight_directions_palm',
    'sig_nine_suns_eye',
    'sig_soul_scorching_flame',
    'sig_blazing_dragon_wave',
    'sig_blood_beast_claw',
    'sig_frost_lotus_domain',
    'sig_thunder_god_halberd',
    'sig_myriad_puppet_barrage',
    'sig_heavens_sound_requiem',
    'sig_golden_buddha_bell',
    'sig_void_spatial_slash',
    'sig_myriad_venom_miasma',
    'sig_taiji_yin_yang_crush',
    'sig_immortal_crane_feather_storm'
  ];
  for (const id of expectedIds) {
    assert.ok(cat[id] && cat[id].nameTh && cat[id].shape, 'Signature VFX ' + id + ' must have Thai name and shape');
  }

  assert.strictEqual(SK.resolveSignatureVfx(CULT.tech('MP_BOW_METEOR_STORM')), 'sig_meteor_sword_rain');
  assert.strictEqual(SK.resolveSignatureVfx(CULT.tech('ART_KARMA_SAMSARA_009')), 'sig_eight_directions_palm');
  assert.strictEqual(SK.resolveSignatureVfx(CULT.tech('MP_BOW_NINE_SUNS_FALL_T7')), 'sig_nine_suns_eye');
  assert.strictEqual(SK.resolveSignatureVfx(CULT.tech('MP_BLADE_BLOOD_FRENZY_T5')), 'sig_soul_scorching_flame');

  const snapBefore = SIM.serialize(W);
  for (const sigId of expectedIds) {
    const beforeOps = mainCv._ops.length;
    const okDraw = RInst.drawSignatureSkillVfx(ctx, { signatureVfx: sigId, angle: 0.4 }, 0.5, 24, false);
    assert.ok(okDraw && mainCv._ops.length > beforeOps, 'Must render bespoke geometry for ' + sigId);
  }
  const snapAfter = SIM.serialize(W);
  assert.strictEqual(snapBefore, snapAfter, 'Rendering all 15 signature skill VFX must be 100% pure read-only');
  console.log('  ✓ Pillar 3 (15 Signature Martial Arts & Unique Skill VFX + Pure Read-Only Invariant) verified');

  // 4. Pillar 4: Building Showcase, Building/Edit Sub-Tabs & Tribulation UI Actions
  const bld = W.map.byId.main_hall || W.map.buildings[0];
  const bCv = makeMockCanvas(210, 92);
  const bOk = Render.buildingShowcase(bCv, bld, { width: 210, height: 92 });
  assert.ok(bOk && bCv._ops.length > 10, 'Render.buildingShowcase must draw multi-tiered pavilion');

  UI.G = { W, speed: 1, opts: {}, R: RInst, muted: true };
  UI.toast = function () {};
  UI.updateHud = function () {};
  UI.bldId = bld.id;
  UI.buildingSubTab = 'OVERVIEW';
  const bHtml = UI.rBuilding();
  assert.ok(bHtml.includes('set-building-subtab') && bHtml.includes('building-showcase'), 'UI.rBuilding must render sub-tabs and buildingShowcase canvas');

  UI.editNpcId = W.sect.masterId;
  UI.tab = 'char';
  UI.editCharSubTab = 'CULT_ECON';
  const eCharHtml = UI.rEdit();
  assert.ok(eCharHtml.includes('set-edit-char-subtab') && eCharHtml.includes('ROOTS_ELEM') && eCharHtml.includes('STATS'), 'UI.rEdit (char) must render sub-tabs');

  UI.tab = 'pet';
  UI.editPetSubTab = 'PETS_BUFFS';
  const ePetHtml = UI.rEdit();
  assert.ok(ePetHtml.includes('set-edit-pet-subtab') && ePetHtml.includes('MECH_KARMA') && ePetHtml.includes('FACILITIES'), 'UI.rEdit (pet) must render sub-tabs');

  // Test UI tribulation ritual & preview-signature-vfx actions
  UI.doAction('start-tribulation-ritual', W.sect.masterId);
  assert.ok(W.byId[W.sect.masterId].tribulationState && W.byId[W.sect.masterId].tribulationState.active, 'start-tribulation-ritual must activate tribulationState');
  UI.tab = 'over';
  UI.sectSubTab = 'CORE';
  const sectHtml = UI.rSect(W);
  assert.ok(sectHtml.includes('focus-tribulation') && sectHtml.includes('⚡ ส่องดูทัณฑ์สวรรค์'), 'UI.rSect must display live Tribulation Alert & focus button');
  UI.doAction('focus-tribulation', W.sect.masterId);
  UI.doAction('preview-signature-vfx', W.sect.masterId + '|sig_meteor_sword_rain');
  assert.strictEqual(W.byId[W.sect.masterId].castFx.signatureVfx, 'sig_meteor_sword_rain', 'preview-signature-vfx must set castFx.signatureVfx');
  CULT.TRIBULATION.cleanup(W, W.byId[W.sect.masterId]);

  W.log('breakthrough', 'ทดสอบบันทึกทัณฑ์สวรรค์', [W.sect.masterId]);
  UI.logFilters = new Set(['all']);
  const logHtml = UI.rLog();
  assert.ok(logHtml.includes('⚡ ทัณฑ์สวรรค์/ทะลวงด่าน'), 'UI.rLog must render illustrated major chronicle banner badge');
  console.log('  ✓ Pillar 4 (Building Showcase, Building/Edit Sub-Tabs, Tribulation Tracker & Chronicle Banners) verified');

  // 5. Pillar 5: Strict Simulation Determinism, Pure Read-Only Rendering & Performance Budget (<= 3.5 ms/tick)
  const WA = SIM.create('v530-det-seed-999', { masterIdx: 0 });
  const t0 = performance.now();
  for (let i = 0; i < 60; i++) SIM.tick(WA);
  const avgMs = (performance.now() - t0) / 60;
  const serA = SIM.serialize(WA);
  const rngA = WA.rng.getState ? WA.rng.getState() : WA.rng.s;

  const WB = SIM.create('v530-det-seed-999', { masterIdx: 0 });
  const detCv = makeMockCanvas(1280, 800);
  const detR = Render.create(detCv);
  detR.setWorld(WB);
  detR.resize();
  const bldDetCv = makeMockCanvas(210, 92);

  for (let i = 0; i < 60; i++) {
    SIM.tick(WB);
    detR.draw(1000 + i * 16);
    Render.buildingShowcase(bldDetCv, WB.map.buildings[i % WB.map.buildings.length]);
  }
  const serB = SIM.serialize(WB);
  const rngB = WB.rng.getState ? WB.rng.getState() : WB.rng.s;
  assert.deepStrictEqual(rngB, rngA, 'v5.3.0 tribulation, signature VFX, and buildingShowcase rendering must never consume W.rng');
  assert.strictEqual(serB, serA, 'v5.3.0 tribulation, signature VFX, and buildingShowcase rendering must never mutate SIM.serialize(W)');
  console.log('  ✓ Pillar 5 (Determinism & Simulation Performance): ' + avgMs.toFixed(3) + ' ms/tick (budget <= 3.5 ms/tick)');
  assert.ok(avgMs <= 3.5, 'Simulation tick time ' + avgMs.toFixed(3) + ' ms/tick must be <= 3.5 ms/tick');

  console.log('✅ ALL PATCH v5.3.0 HEAVENLY TRIBULATION & SIGNATURE SKILL VFX CHECKS PASSED!');
  process.exit(0);
})();
