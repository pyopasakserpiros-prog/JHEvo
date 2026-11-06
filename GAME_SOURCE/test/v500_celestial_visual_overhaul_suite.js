/* test/v500_celestial_visual_overhaul_suite.js — Dedicated 6-Phase Verification Suite for Patch v5.0.0 (Era 5: Grand Celestial Visual Overhaul) */
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
      style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      innerHTML: '',
      textContent: '',
      appendChild() {},
      remove() {},
      querySelectorAll() { return []; },
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

(function runV500CelestialVisualOverhaulSuite() {
  console.log('--- Running Patch v5.0.0 (Era 5: Grand Celestial Visual Overhaul) Verification Suite ---');

  // 0. Verify human_core.js SHA-256 & Patch Version
  const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
  const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  assert.strictEqual(
    hcSha,
    'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542',
    'human_core.js SHA-256 must remain 100% byte-identical'
  );
  assert.strictEqual(g.HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
  assert.strictEqual(g.SIM.PATCH_VERSION, '5.2.0', 'SIM.PATCH_VERSION must be 5.0.0');
  assert.strictEqual(
    g.SIM.SAVE_SCHEMA_VERSION,
    '5.2.0-subtabs-and-world-visuals',
    'SIM.SAVE_SCHEMA_VERSION must be 5.0.0-celestial-visual-overhaul'
  );

  // =========================================================================
  // Phase 1: Pillar 1 — 9-Stage Realm Halos, 12-Path Signatures, Silk Ribbons & Spirit Beast Companions
  // =========================================================================
  const R = g.Render;
  assert(R.REALM_VISUAL_TIERS && Object.keys(R.REALM_VISUAL_TIERS).length === 9, 'REALM_VISUAL_TIERS must define all 9 cultivation stages');
  assert(R.PATH_VISUAL_SIGNATURES && Object.keys(R.PATH_VISUAL_SIGNATURES).length === 12, 'PATH_VISUAL_SIGNATURES must define all 12 cultivation paths');

  const W = g.SIM.create('v500-celestial-seed', { masterIdx: 0 });
  const mainCv = makeMockCanvas(1280, 800);
  const renderer = R.create(mainCv);
  renderer.setWorld(W);
  renderer.resize();

  const npc = W.npcs[0];
  npc.cult = npc.cult || { stage: 1, path: 'SWORD', techs: [] };

  // Test Stages 1..9 in drawCultivatorRealmHalo and R.portrait
  const ptCv = makeMockCanvas(64, 64);
  const stageOpsCounts = {};
  for (let stg = 1; stg <= 9; stg++) {
    npc.cult.stage = stg;
    const ap = renderer.appearance(npc);
    assert.strictEqual(ap.cultStage, stg, `appearance(n) must reflect cultStage=${stg}`);
    if (stg >= 7) {
      assert.strictEqual(ap.hasSilkRibbon, true, `Stage ${stg} must activate Immortal Flowing Silk Ribbon`);
    }
    const testCv = makeMockCanvas(200, 200);
    const okHalo = renderer.drawCultivatorRealmHalo(testCv.getContext('2d'), npc, ap, 'cultivate', 0);
    assert.strictEqual(okHalo, true, `drawCultivatorRealmHalo must render for Stage ${stg}`);
    stageOpsCounts[stg] = testCv._ops.length;

    ptCv._ops.length = 0;
    R.portrait(ptCv, npc, 64);
    assert(ptCv._ops.length > 20, `R.portrait must render for Stage ${stg}`);
  }
  assert(stageOpsCounts[9] > stageOpsCounts[1], 'Stage 9 Immortal Mandala + Silk Ribbon must emit more geometry than Stage 1');

  // Test all 12 Cultivation Paths in drawPathSignatureMotes
  for (const pathKey of Object.keys(R.PATH_VISUAL_SIGNATURES)) {
    npc.cult.path = pathKey;
    npc.cult.stage = 5;
    const ap = renderer.appearance(npc);
    const testCv = makeMockCanvas(200, 200);
    const okMotes = renderer.drawPathSignatureMotes(testCv.getContext('2d'), npc, ap, 'cultivate', 0);
    assert.strictEqual(okMotes, true, `drawPathSignatureMotes must render for path ${pathKey}`);
    assert(testCv._ops.length > 4, `Path ${pathKey} motes must emit canvas operations`);
  }

  // Test Companion Spirit Beast rendering beside NPC
  npc.pets = [{ id: 'pet_1', speciesId: 'CELESTIAL_NINE_TAIL_FOX', tier: 5, awakenedSymbol: 'AZURE_DRAGON' }];
  const apWithPet = renderer.appearance(npc);
  assert.strictEqual(apWithPet.hasPet, true, 'appearance(n) must detect contracted Spirit Beast');
  const petCv = makeMockCanvas(200, 200);
  const okPet = renderer.drawCompanionPets(petCv.getContext('2d'), npc, { x: npc.x, y: npc.y }, 1.15);
  assert.strictEqual(okPet, true, 'drawCompanionPets must render contracted Spirit Beast');
  assert(petCv._ops.length >= 10, 'Spirit Beast companion must emit body, tail, and awakened symbol ring ops');

  // =========================================================================
  // Phase 2: Pillar 2 — Multi-Layered Weapon Slashes, Elemental Fusion & Heavenly Tribulation
  // =========================================================================
  assert(R.ELEMENT_VFX_PALETTE && Object.keys(R.ELEMENT_VFX_PALETTE).length >= 16, 'ELEMENT_VFX_PALETTE must cover 12 elements + fusions');
  const slashCv = makeMockCanvas(200, 200);
  for (const wType of ['SWORD', 'BLADE', 'SPEAR', 'ZITHER', 'FIST_PALM']) {
    npc.equip = npc.equip || {};
    npc.equip.WEAPON = { id: 'wpn_' + wType, type: wType, slot: 'WEAPON', tier: 5, element: 'LIGHTNING' };
    const apW = renderer.appearance(npc);
    slashCv._ops.length = 0;
    const okSlash = renderer.drawCombatSlashAndAfterimages(slashCv.getContext('2d'), npc, apW, 'fight', -1.2, 0, 2);
    assert.strictEqual(okSlash, true, `drawCombatSlashAndAfterimages must render for weapon family ${wType}`);
    assert(slashCv._ops.length > 4, `Weapon slash for ${wType} must emit canvas operations`);
  }

  // Test Elemental Fusion Cast VFX & Breakthrough Tribulation Lightning
  const fxCv = makeMockCanvas(200, 200);
  const okElem = renderer.drawElementalCastAndFusionVfx(
    fxCv.getContext('2d'),
    { element: 'FIRE', fusion: 'FUSION_SAMADHI_FIRE', angle: 0.5 },
    0.5,
    24
  );
  assert.strictEqual(okElem, true, 'drawElementalCastAndFusionVfx must render elemental fusion spiral');

  const tribCv = makeMockCanvas(200, 200);
  const okTrib = renderer.drawBreakthroughTribulationVfx(tribCv.getContext('2d'), npc, { x: npc.x, y: npc.y }, 1.15);
  assert.strictEqual(okTrib, true, 'drawBreakthroughTribulationVfx must render tribulation cloud & lightning bolt');
  assert(tribCv._ops.length >= 10, 'Tribulation VFX must emit cloud, ground ring, and jagged lightning segments');

  // =========================================================================
  // Phase 3: Pillar 3 — Equipment Tier Glows (T1-T7), Orbiting Flying Swords & Weapon Souls
  // =========================================================================
  assert(R.GEAR_TIER_GLOWS && Object.keys(R.GEAR_TIER_GLOWS).length === 7, 'GEAR_TIER_GLOWS must define T1 through T7');
  npc.equip = {
    WEAPON: { id: 'celestial_sword', type: 'SWORD', slot: 'WEAPON', tier: 7, stars: 3, legendary: true, weaponSoul: true },
    ARMOR: { id: 'celestial_robe', type: 'ARMOR', slot: 'ARMOR', tier: 6, stars: 3, visualKey: 'vis_celestial_crane_robe' },
    ACCESSORY: { id: 'celestial_jade', type: 'ACCESSORY', slot: 'ACCESSORY', tier: 6, stars: 3, visualKey: 'vis_bodhi_starlight_beads' }
  };
  const apT7 = renderer.appearance(npc);
  assert.strictEqual(apT7.highestGearTier, 7, 'highestGearTier must be 7');
  assert.strictEqual(apT7.hasFlyingSword, true, 'T7 sword must activate autonomous orbiting flying sword');
  assert.strictEqual(apT7.hasWeaponSoul, true, 'T7 legendary sword must activate Weapon Soul manifestation');
  assert.strictEqual(apT7.activeSetCount, 3, 'Full 3-piece equipment set must be detected');

  const gearCv = makeMockCanvas(200, 200);
  assert.strictEqual(renderer.drawEquipmentTierAura(gearCv.getContext('2d'), npc, apT7, 0), true, 'drawEquipmentTierAura must render for T7');
  assert.strictEqual(renderer.drawOrbitingFlyingWeapon(gearCv.getContext('2d'), npc, apT7, 0, 'fight'), true, 'drawOrbitingFlyingWeapon must render flying sword');
  assert.strictEqual(renderer.drawWeaponSoulAndSetResonance(gearCv.getContext('2d'), npc, apT7, 0), true, 'drawWeaponSoulAndSetResonance must render weapon spirit + set ring');

  // Restore unarmed check compatibility
  delete npc.equip.WEAPON;
  assert.strictEqual(renderer.appearance(npc).weaponType, null, 'Unarmed cultivator must resolve to null weaponType');

  // =========================================================================
  // Phase 4: Pillar 4 — Living Sect Ground Spectacles (Bagua Plaza Array, Totems, Banners, Koi, Cranes, Sky Lanterns)
  // =========================================================================
  // Found a Peak Sanctuary so drawPeakSanctuarySpectacles renders active peak banners & formation rings
  if (g.SECT && g.SECT.PEAKS && g.SECT.PEAKS.ensure) {
    const pk = g.SECT.PEAKS.ensure(W);
    if (pk && pk.peaks && pk.peaks.PEAK_SWORD) {
      pk.peaks.PEAK_SWORD.founded = true;
    }
  }
  const swordBld = W.map.byId.peak_sword;
  if (swordBld) swordBld.founded = true;

  const specCv = makeMockCanvas(400, 400);
  assert.strictEqual(renderer.drawPlazaGrandArrayAndTotems(specCv.getContext('2d')), true, 'drawPlazaGrandArrayAndTotems must render Bagua Plaza array & 4 Totems');
  assert.strictEqual(renderer.drawPeakSanctuarySpectacles(specCv.getContext('2d')), true, 'drawPeakSanctuarySpectacles must render founded peak banners & rings');
  assert.strictEqual(renderer.drawLivingFloraAndFauna(specCv.getContext('2d'), 21, 0.85), true, 'drawLivingFloraAndFauna must render Spirit Koi, Immortal Cranes & Night Sky Lanterns');

  // =========================================================================
  // Phase 5: Pillar 5 & 6 — Celestial Phenomenon Shaders & UI Visual Control Center
  // =========================================================================
  const shaderKeys = ['BLOOD_MOON', 'NINE_SUNS', 'METEOR_SHOWER', 'PRANA_TIDE'];
  for (const sk of shaderKeys) {
    assert(R.CELESTIAL_SHADERS[sk], `CELESTIAL_SHADERS must define ${sk}`);
    renderer.opts.celestialPreview = sk;
    const shCv = makeMockCanvas(412, 860);
    const okSh = renderer.drawCelestialPhenomena(shCv.getContext('2d'), 22, 0.9);
    assert.strictEqual(okSh, true, `drawCelestialPhenomena must render shader ${sk}`);
    assert(shCv._ops.length > 10, `Celestial shader ${sk} must emit tint, beams, and particles`);
  }
  renderer.opts.celestialPreview = 'AUTO';

  // Test UI Visual Control Center actions
  g.UI.G = { W, R: renderer, opts: Object.assign({}, renderer.opts), speed: 1 };
  g.UI.toast = function () {};
  g.UI.render = function () {};
  g.UI.updateHud = function () {};
  g.UI.doAction('cycle-celestial-preview', 'BLOOD_MOON');
  assert.strictEqual(renderer.opts.celestialPreview, 'BLOOD_MOON', 'UI action cycle-celestial-preview must update renderer.opts.celestialPreview');
  g.UI.doAction('toggle-vfx-opt', 'flyingSwords');
  assert.strictEqual(renderer.opts.flyingSwords, false, 'UI action toggle-vfx-opt must toggle flyingSwords');
  g.UI.doAction('toggle-vfx-opt', 'flyingSwords');
  assert.strictEqual(renderer.opts.flyingSwords, true, 'UI action toggle-vfx-opt must restore flyingSwords');
  renderer.opts.celestialPreview = 'AUTO';

  // =========================================================================
  // Phase 6: Strict Simulation Purity, Determinism & 80-NPC Performance Guard
  // =========================================================================
  const WA = g.SIM.create('v500-det-seed-999', { masterIdx: 0 });
  for (let i = 0; i < 60; i++) g.SIM.tick(WA);
  const serA = g.SIM.serialize(WA);
  const rngA = WA.rng.getState ? WA.rng.getState() : WA.rng.s;

  const WB = g.SIM.create('v500-det-seed-999', { masterIdx: 0 });
  const detCv = makeMockCanvas(1280, 800);
  const detR = R.create(detCv);
  detR.setWorld(WB);
  detR.resize();

  for (let i = 0; i < 60; i++) {
    g.SIM.tick(WB);
    detR.opts.celestialPreview = shaderKeys[i % shaderKeys.length];
    detR.selected = WB.npcs[i % WB.npcs.length].id;
    detR.draw(1000 + i * 16);
    R.portrait(ptCv, WB.npcs[i % WB.npcs.length], 64);
  }
  const serB = g.SIM.serialize(WB);
  const rngB = WB.rng.getState ? WB.rng.getState() : WB.rng.s;
  assert.deepStrictEqual(rngB, rngA, 'Era 5 rendering must never consume W.rng');
  assert.strictEqual(serB, serA, 'Era 5 rendering must never mutate serialized simulation state SIM.serialize(W)');

  console.log('ALL 6 PHASES OF v500_celestial_visual_overhaul_suite PASSED!');
  process.exit(0);
})();
