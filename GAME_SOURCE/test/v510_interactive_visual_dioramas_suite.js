/* test/v510_interactive_visual_dioramas_suite.js — Dedicated 5-Phase Verification Suite for Patch v5.1.0 (Era 5 Phase 2: Interactive Visual Dioramas, Sect Cutscene Moments & Martial Arena Camera) */
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
    return { style: {}, classList: { add() {}, remove() {} }, appendChild() {}, remove() {}, querySelectorAll() { return []; } };
  },
  getElementById() {
    return {
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
  body: { appendChild() {} }
};
if (typeof g.OffscreenCanvas === 'undefined') {
  g.OffscreenCanvas = function (w, h) { return makeMockCanvas(w, h); };
}

require(path.join(ROOT, 'js/render.js'));
require(path.join(ROOT, 'js/ui.js'));

(function runV510InteractiveVisualDioramasSuite() {
  console.log('--- Running Patch v5.1.0 (Interactive Visual Dioramas, Sect Ceremonies & Martial Arena Camera) Suite ---');

  // 0. Verify human_core.js SHA-256 & Patch Version
  const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
  const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  assert.strictEqual(
    hcSha,
    'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542',
    'human_core.js SHA-256 must remain 100% byte-identical'
  );
  assert.strictEqual(g.HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
  assert.strictEqual(g.SIM.PATCH_VERSION, '5.8.0', 'SIM.PATCH_VERSION must be 5.1.0');
  assert.strictEqual(
    g.SIM.SAVE_SCHEMA_VERSION,
    '5.8.0-forbidden-arts-passive-awakening-and-blood-altar',
    'SIM.SAVE_SCHEMA_VERSION must be 5.2.0-subtabs-and-world-visuals'
  );

  const R = g.Render;
  const W = g.SIM.create('v510-diorama-seed', { masterIdx: 0 });
  const mainCv = makeMockCanvas(1280, 800);
  const renderer = R.create(mainCv);
  renderer.setWorld(W);
  renderer.resize();

  // =========================================================================
  // Phase 1: Pillar 1 — On-Map Sect Ceremony, Spirit Banquet & Companion Wedding Spectacles
  // =========================================================================
  assert(R.CEREMONY_PRESETS && Object.keys(R.CEREMONY_PRESETS).length >= 5, 'R.CEREMONY_PRESETS must define AUTO, BANQUET, COMPANION_WEDDING, ANCESTRAL_RITE, TOURNAMENT_ARENA');

  for (const mode of ['BANQUET', 'COMPANION_WEDDING', 'ANCESTRAL_RITE']) {
    renderer.opts.ceremonyPreview = mode;
    const cerCv = makeMockCanvas(400, 400);
    const okCer = renderer.drawSectCeremonySpectacles(cerCv.getContext('2d'), 20, 0.85);
    assert.strictEqual(okCer, true, `drawSectCeremonySpectacles must render for ceremony mode ${mode}`);
    assert(cerCv._ops.length > 15, `Ceremony mode ${mode} must emit carpet, centerpiece altar/tables, and fireworks`);
  }

  // Test automatic trigger when W.sect.festival is active
  renderer.opts.ceremonyPreview = 'AUTO';
  W.sect.festival = { kind: 'banquet', until: W.t + 180 };
  assert.strictEqual(renderer.resolveActiveCeremonyMode(), 'BANQUET', 'Active W.sect.festival must auto-resolve to BANQUET');
  delete W.sect.festival;

  // =========================================================================
  // Phase 2: Pillar 2 — Martial Tournament Arena Ring, Corner War Banners & Duel Spotlight
  // =========================================================================
  renderer.opts.ceremonyPreview = 'TOURNAMENT_ARENA';
  const arenaCv = makeMockCanvas(400, 400);
  const okArena = renderer.drawMartialArenaSpectacles(arenaCv.getContext('2d'));
  assert.strictEqual(okArena, true, 'drawMartialArenaSpectacles must render when TOURNAMENT_ARENA is active');
  assert(arenaCv._ops.length > 20, 'Martial arena must emit octagonal barrier ring, shockwave, 4 war banners, and sword seal');

  renderer.opts.ceremonyPreview = 'AUTO';
  W.sect.tournament = { state: 'run', start: W.t, alive: [W.npcs[0].id] };
  assert.strictEqual(renderer.drawMartialArenaSpectacles(makeMockCanvas(400, 400).getContext('2d')), true, 'Active W.sect.tournament must auto-render Martial Arena spectacles');
  delete W.sect.tournament;

  // =========================================================================
  // Phase 3: Pillar 3 — Interactive Character Visual Diorama & Relic Showcase (`Render.diorama`)
  // =========================================================================
  assert.strictEqual(typeof R.diorama, 'function', 'Render.diorama must be a function');
  const npc0 = W.npcs[0];
  npc0.cult = npc0.cult || { stage: 8, path: 'SWORD', techs: [] };
  npc0.cult.stage = 8;
  npc0.equip = {
    WEAPON: { id: 'wpn_immortal', type: 'SWORD', slot: 'WEAPON', tier: 7, stars: 3, legendary: true, weaponSoul: true },
    ARMOR: { id: 'arm_immortal', type: 'ARMOR', slot: 'ARMOR', tier: 6, stars: 3, visualKey: 'vis_celestial_crane_robe' },
    ACCESSORY: { id: 'acc_immortal', type: 'ACCESSORY', slot: 'ACCESSORY', tier: 6, stars: 3, visualKey: 'vis_bodhi_starlight_beads' }
  };
  npc0.pets = [{ id: 'pet_diorama', speciesId: 'CELESTIAL_CRANE', tier: 6, awakenedSymbol: 'VERMILION_BIRD' }];

  for (const pose of ['cultivate', 'fight', 'breakthrough']) {
    const dioCv = makeMockCanvas(220, 136);
    const actBefore = npc0.act;
    const okDio = R.diorama(dioCv, npc0, { width: 220, height: 136, pose });
    assert.strictEqual(okDio, true, `Render.diorama must render pose ${pose}`);
    assert.strictEqual(npc0.act, actBefore, 'Render.diorama must never mutate npc.act');
    assert(dioCv._ops.length > 40, `Render.diorama (${pose}) must emit backdrop, pedestal, full-body Era 5 sprite, pet, and realm badge`);
  }

  // =========================================================================
  // Phase 4: Pillar 4 & 5 — Sacred Facility Spectacles & Cinema Director Camera Controls
  // =========================================================================
  const sacCv = makeMockCanvas(400, 400);
  const okSac = renderer.drawSacredSiteSpectacles(sacCv.getContext('2d'), 12, 0);
  assert.strictEqual(okSac, true, 'drawSacredSiteSpectacles must render orbiting scripture glyphs & meditation lotus rings');

  g.UI.G = { W, R: renderer, opts: Object.assign({}, renderer.opts), speed: 1 };
  g.UI.toast = function () {};
  g.UI.render = function () {};
  g.UI.updateHud = function () {};
  g.UI.close = function () {};

  g.UI.doAction('cycle-ceremony-preview', 'COMPANION_WEDDING');
  assert.strictEqual(renderer.opts.ceremonyPreview, 'COMPANION_WEDDING', 'cycle-ceremony-preview must update ceremonyPreview');

  g.UI.doAction('focus-martial-arena');
  const tg = W.map.byId.training_ground;
  assert.strictEqual(renderer.opts.ceremonyPreview, 'TOURNAMENT_ARENA', 'focus-martial-arena must enable TOURNAMENT_ARENA preview');
  assert(Math.abs(renderer.cam.x - (tg.x + tg.w / 2) * 16) < 64, 'focus-martial-arena must center camera on training_ground');

  g.UI.doAction('set-diorama-pose', 'breakthrough');
  assert.strictEqual(g.UI.dioramaPose, 'breakthrough', 'set-diorama-pose must update UI.dioramaPose');

  // Verify UI.rNpc embeds the diorama canvas
  g.UI.npcId = npc0.id;
  g.UI.tab = 'ov';
  const npcHtml = g.UI.rNpc();
  assert(npcHtml.includes('class="diorama"'), 'UI.rNpc overview tab must include the interactive Era 5 Visual Diorama canvas');

  // =========================================================================
  // Phase 5: Strict Simulation Purity & Determinism Verification
  // =========================================================================
  const WA = g.SIM.create('v510-det-seed-888', { masterIdx: 0 });
  for (let i = 0; i < 60; i++) g.SIM.tick(WA);
  const serA = g.SIM.serialize(WA);
  const rngA = WA.rng.getState ? WA.rng.getState() : WA.rng.s;

  const WB = g.SIM.create('v510-det-seed-888', { masterIdx: 0 });
  const detCv = makeMockCanvas(1280, 800);
  const detR = R.create(detCv);
  detR.setWorld(WB);
  detR.resize();
  const dioDetCv = makeMockCanvas(220, 136);
  const cerModes = ['AUTO', 'BANQUET', 'COMPANION_WEDDING', 'ANCESTRAL_RITE', 'TOURNAMENT_ARENA'];

  for (let i = 0; i < 60; i++) {
    g.SIM.tick(WB);
    detR.opts.ceremonyPreview = cerModes[i % cerModes.length];
    detR.draw(1000 + i * 16);
    R.diorama(dioDetCv, WB.npcs[i % WB.npcs.length], { pose: i % 2 === 0 ? 'fight' : 'cultivate' });
  }
  const serB = g.SIM.serialize(WB);
  const rngB = WB.rng.getState ? WB.rng.getState() : WB.rng.s;
  assert.deepStrictEqual(rngB, rngA, 'v5.1.0 ceremony, arena, and diorama rendering must never consume W.rng');
  assert.strictEqual(serB, serA, 'v5.1.0 ceremony, arena, and diorama rendering must never mutate SIM.serialize(W)');

  console.log('ALL 5 PHASES OF v510_interactive_visual_dioramas_suite PASSED!');
  process.exit(0);
})();
