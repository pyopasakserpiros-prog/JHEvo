/* test/v520_subtabs_and_world_visuals_suite.js — Dedicated 5-Phase Verification Suite for Patch v5.2.0 (Era 5 Phase 3: Sub-Category Navigation Overhaul, Grand World Atlas Visuals, Portal FX & Relic Showcase) */
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
  querySelectorAll() { return []; },
  body: { appendChild() {} }
};
if (typeof g.OffscreenCanvas === 'undefined') {
  g.OffscreenCanvas = function (w, h) { return makeMockCanvas(w, h); };
}

require(path.join(ROOT, 'js/render.js'));
require(path.join(ROOT, 'js/ui.js'));

(function runV520SubtabsAndWorldVisualsSuite() {
  console.log('--- Running Patch v5.2.0 (Sub-Category Navigation Overhaul, World Atlas Convoys, Portal FX & Relic Showcase) Suite ---');

  // 0. Verify human_core.js SHA-256 & Patch Version
  const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
  const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  assert.strictEqual(
    hcSha,
    'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542',
    'human_core.js SHA-256 must remain 100% byte-identical'
  );
  assert.strictEqual(g.HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
  assert.strictEqual(g.SIM.PATCH_VERSION, '2.4.0', 'SIM.PATCH_VERSION must be 5.2.0');
  assert.strictEqual(
    g.SIM.SAVE_SCHEMA_VERSION, '2.4.0-tactical-composable-grand-dao',
    'SIM.SAVE_SCHEMA_VERSION must be 5.2.0-subtabs-and-world-visuals'
  );

  const R = g.Render;
  const UI = g.UI;
  const W = g.SIM.create('v520-subtab-seed', { masterIdx: 0 });
  const mainCv = makeMockCanvas(1280, 800);
  const renderer = R.create(mainCv);
  renderer.setWorld(W);
  renderer.resize();

  UI.G = { W, R: renderer, opts: Object.assign({}, renderer.opts), speed: 0 };
  UI.toast = function () {};
  UI.updateHud = function () {};

  // =========================================================================
  // Phase 1: Pillar 1 — Sub-Category Navigation Overhaul across Sect, NPC, and World
  // =========================================================================
  // 1A. Sect Overview Sub-Tabs (`CORE`, `COUNCIL`, `PEAKS_ARRAY`, `LINEAGE`, `DAO`, `VISUALS`, `ALL`)
  UI.open('sect', 'over');
  for (const st of ['CORE', 'COUNCIL', 'PEAKS_ARRAY', 'LINEAGE', 'DAO', 'VISUALS', 'ALL']) {
    UI.doAction('set-sect-subtab', st);
    assert.strictEqual(UI.sectSubTab, st, `set-sect-subtab must switch UI.sectSubTab to ${st}`);
    const sHtml = UI.rSect(W);
    assert(sHtml.includes('class="card subtab-bar"'), 'UI.rSect(over) must render the Sub-Tab Bar');
    assert(sHtml.includes(`data-subcat="${st === 'ALL' ? 'CORE' : st}"`), `UI.rSect(over) must contain subcat pane ${st}`);
  }
  // Top-level Sect shortcut tabs (`council`, `lineage`, `dao`, `visuals`)
  for (const topTab of ['council', 'lineage', 'dao', 'visuals']) {
    UI.tab = topTab;
    const tHtml = UI.rSect(W);
    assert(tHtml.includes('class="card subtab-bar"'), `Top-level Sect tab ${topTab} must render cleanly`);
  }

  // 1B. Sect Posts Sub-Tabs (`OFFICES`, `POLITICS`, `PRISON`, `ALL`)
  UI.tab = 'posts';
  for (const pst of ['OFFICES', 'POLITICS', 'PRISON', 'ALL']) {
    UI.doAction('set-sect-posts-subtab', pst);
    assert.strictEqual(UI.sectPostsSubTab, pst, `set-sect-posts-subtab must switch UI.sectPostsSubTab to ${pst}`);
    const pHtml = UI.rSect(W);
    assert(pHtml.includes('data-do="set-sect-posts-subtab"'), 'UI.rSect(posts) must render the Posts Sub-Tab Bar');
  }

  // 1C. Character Sheet (`UI.rNpc`) Sub-Tabs (`CORE`, `MIND`, `COMBAT`, `LINEAGE`, `PETS`, `ALL`) + Top-Level Shortcuts (`meridian`, `pets`, `lineage`)
  const npc0 = W.npcs[0];
  UI.openNpc(npc0.id, 'ov');
  for (const nst of ['CORE', 'MIND', 'COMBAT', 'LINEAGE', 'PETS', 'ALL']) {
    UI.doAction('set-npc-subtab', nst);
    assert.strictEqual(UI.npcSubTab, nst, `set-npc-subtab must switch UI.npcSubTab to ${nst}`);
    const nHtml = UI.rNpc();
    assert(nHtml.includes('data-do="set-npc-subtab"'), 'UI.rNpc(ov) must render the Character Sub-Tab Bar');
    assert(nHtml.includes(`data-subcat="${nst === 'ALL' ? 'CORE' : nst}"`), `UI.rNpc(ov) must contain subcat pane ${nst}`);
  }
  for (const topNpcTab of ['meridian', 'pets', 'lineage']) {
    UI.openNpc(npc0.id, topNpcTab);
    const tnHtml = UI.rNpc();
    assert(tnHtml.includes('data-do="set-npc-subtab"'), `Top-level NPC shortcut tab ${topNpcTab} must render cleanly`);
  }

  // 1D. World Sheet (`UI.rWorld`) Sub-Tabs across `exp`, `sects`, `disc`, `content`
  UI.open('world', 'exp');
  for (const est of ['TRAVEL', 'RUMORS', 'ALL']) {
    UI.doAction('set-exp-subtab', est);
    assert.strictEqual(UI.worldExpSubTab, est, `set-exp-subtab must switch UI.worldExpSubTab to ${est}`);
    const eHtml = UI.rWorld();
    assert(eHtml.includes('data-do="set-exp-subtab"'), 'UI.rWorld(exp) must render the Expedition Sub-Tab Bar');
  }

  UI.open('world', 'sects');
  for (const wst of ['NEIGHBORS', 'FACTIONS', 'COMMERCE', 'LEGENDS', 'REALMS', 'CHRONICLES', 'ALL']) {
    UI.doAction('set-world-subtab', wst);
    assert.strictEqual(UI.worldSectsSubTab, wst, `set-world-subtab must switch UI.worldSectsSubTab to ${wst}`);
    const wHtml = UI.rWorld();
    assert(wHtml.includes('data-do="set-world-subtab"'), 'UI.rWorld(sects) must render the Sects Sub-Tab Bar at the top');
  }

  UI.open('world', 'disc');
  for (const dst of ['PORTALS', 'SPOTS', 'CODEX', 'ALL']) {
    UI.doAction('set-disc-subtab', dst);
    assert.strictEqual(UI.worldDiscSubTab, dst, `set-disc-subtab must switch UI.worldDiscSubTab to ${dst}`);
    const dHtml = UI.rWorld();
    assert(dHtml.includes('data-do="set-disc-subtab"'), 'UI.rWorld(disc) must render the Discovery Sub-Tab Bar');
  }

  UI.open('world', 'content');
  for (const cst of ['REGIONS', 'RECIPES', 'ALL']) {
    UI.doAction('set-content-subtab', cst);
    assert.strictEqual(UI.worldContentSubTab, cst, `set-content-subtab must switch UI.worldContentSubTab to ${cst}`);
    const cHtml = UI.rWorld();
    assert(cHtml.includes('data-do="set-content-subtab"'), 'UI.rWorld(content) must render the Content Sub-Tab Bar');
  }

  // =========================================================================
  // Phase 2: Pillar 2 — Grand World Atlas Visual Upgrade & Animated Supply Convoys
  // =========================================================================
  if (g.SECT && g.SECT.OUTPOSTS_LOGISTICS) {
    g.SECT.OUTPOSTS_LOGISTICS.establishOutpost(W, 'MINE_CELESTIAL_STONE', 'CAMP_REST', { force: true });
  }
  const atlasHtml = UI.rWorldMap(W);
  assert(atlasHtml.includes('data-arg="outposts"'), 'World Atlas must expose the Outposts & Convoys layer toggle');
  assert(atlasHtml.includes('atlas-convoy'), 'World Atlas must render animated supply convoy markers (🐪) for active outposts');

  // =========================================================================
  // Phase 3: Pillar 3 — Secret Realm Portal Vortex, Ancient Cave & Stele Spectacles
  // =========================================================================
  if (W.explore && W.explore.gate) W.explore.gate.open = true;
  const portalCv = makeMockCanvas(400, 400);
  const okPortal = renderer.drawSecretRealmPortalSpectacles(portalCv.getContext('2d'), 12, 0);
  assert.strictEqual(okPortal, true, 'drawSecretRealmPortalSpectacles must render portal pillar, stele glyphs & cave orbs');
  assert(portalCv._ops.length > 20, 'Portal spectacles must emit canvas drawing operations');

  // =========================================================================
  // Phase 4: Pillar 4 — Interactive Relic & Equipment Visual Showcase (`Render.relicShowcase`)
  // =========================================================================
  assert.strictEqual(typeof R.relicShowcase, 'function', 'Render.relicShowcase must be a function');
  for (const slot of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
    const relCv = makeMockCanvas(180, 82);
    const okRel = R.relicShowcase(
      relCv,
      { tier: 7, slot, element: 'LIGHTNING', legendary: true, stars: 3 },
      { width: 180, height: 82 }
    );
    assert.strictEqual(okRel, true, `Render.relicShowcase must render for slot ${slot}`);
    assert(relCv._ops.length > 15, `Relic showcase (${slot}) must emit pedestal, halo, silhouette, and star nodes`);
  }

  // Verify Relic Showcase canvas appears in Personal Bag detail panel when an equipment item is selected
  npc0.equip = npc0.equip || {};
  npc0.equip.WEAPON = { id: 'wpn_test_relic', nameTh: 'กระบี่ดาราสวรรค์', type: 'SWORD', slot: 'WEAPON', tier: 6, legendary: true };
  UI.setInvViewMode('grid');
  UI.openNpc(npc0.id, 'bag');
  UI.bagSelKey = 'EQ:WEAPON:wpn_test_relic';
  const bagHtml = UI.rNpc();
  assert(bagHtml.includes('class="relic-showcase"'), 'Selecting equipped weapon in Personal Bag must render the Relic Showcase canvas');
  UI.bagSelKey = null;

  // =========================================================================
  // Phase 5: Strict Simulation Purity & Determinism Verification
  // =========================================================================
  const WA = g.SIM.create('v520-det-seed-777', { masterIdx: 0 });
  for (let i = 0; i < 60; i++) g.SIM.tick(WA);
  const serA = g.SIM.serialize(WA);
  const rngA = WA.rng.getState ? WA.rng.getState() : WA.rng.s;

  const WB = g.SIM.create('v520-det-seed-777', { masterIdx: 0 });
  const detCv = makeMockCanvas(1280, 800);
  const detR = R.create(detCv);
  detR.setWorld(WB);
  detR.resize();
  const relDetCv = makeMockCanvas(180, 82);

  for (let i = 0; i < 60; i++) {
    g.SIM.tick(WB);
    detR.draw(1000 + i * 16);
    R.relicShowcase(relDetCv, { tier: (i % 7) + 1, slot: 'WEAPON', element: 'FIRE', legendary: i % 3 === 0 });
  }
  const serB = g.SIM.serialize(WB);
  const rngB = WB.rng.getState ? WB.rng.getState() : WB.rng.s;
  assert.deepStrictEqual(rngB, rngA, 'v5.2.0 portal FX and relic showcase rendering must never consume W.rng');
  assert.strictEqual(serB, serA, 'v5.2.0 portal FX and relic showcase rendering must never mutate SIM.serialize(W)');

  console.log('ALL 5 PHASES OF v520_subtabs_and_world_visuals_suite PASSED!');
  process.exit(0);
})();
