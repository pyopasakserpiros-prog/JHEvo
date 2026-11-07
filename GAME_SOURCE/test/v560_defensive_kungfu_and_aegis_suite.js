/* ===== PATCH v5.6.0 REGRESSION SUITE: DEFENSIVE KUNGFU & PROTECTIVE AEGIS OVERHAUL ===== */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const G = require('./load.js');

const ROOT = path.resolve(__dirname, '..');

function makeMockCanvas(w, h) {
  const ctx = {
    canvas: null,
    save() {}, restore() {}, translate() {}, scale() {}, rotate() {}, setTransform() {},
    beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, quadraticCurveTo() {}, bezierCurveTo() {},
    arc() {}, arcTo() {}, ellipse() {}, rect() {}, fillRect() {}, strokeRect() {}, clearRect() {},
    fill() {}, stroke() {}, clip() {}, setLineDash() {}, fillText() {}, strokeText() {},
    measureText: () => ({ width: 24 }),
    drawImage() {},
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} })
  };
  const cv = {
    width: w || 960,
    height: h || 600,
    style: {},
    dataset: {},
    getContext: () => ctx,
    addEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: w || 960, height: h || 600 })
  };
  ctx.canvas = cv;
  return cv;
}

G.window = G;
G.devicePixelRatio = 2;
G.document = {
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
if (typeof G.OffscreenCanvas === 'undefined') {
  G.OffscreenCanvas = function (w, h) { return makeMockCanvas(w, h); };
}

require(path.join(ROOT, 'js/render.js'));
require(path.join(ROOT, 'js/ui.js'));

const { SIM, CULT, COMBAT, AI, Render, UI, HC, JD } = G;

console.log('--- Running Patch v5.6.0 Defensive Kungfu & Protective Aegis Overhaul Suite ---');

// 0. Verify human_core.js SHA-256 & Patch Version
const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
assert.strictEqual(
  hcSha,
  'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542',
  'human_core.js SHA-256 must remain 100% byte-identical'
);
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
assert.strictEqual(SIM.PATCH_VERSION, '5.6.0', 'SIM.PATCH_VERSION must be 5.6.0');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '5.6.0-defensive-kungfu-and-aegis-barriers', 'SIM.SAVE_SCHEMA_VERSION must match v5.6.0');
assert(SIM.SUPPORTED_PATCHES.includes('5.6.0'), 'SIM.SUPPORTED_PATCHES must include 5.6.0');

// 1. Verify CULT.DEFENSIVE_ARTS 6 Archetypes, 3 Postures, 6 Signature Manuals & Catalog Enrichment
assert(CULT.DEFENSIVE_ARTS && CULT.DEFENSIVE_ARTS.ARCHETYPES, 'CULT.DEFENSIVE_ARTS.ARCHETYPES must exist');
const expectedArchs = [
  'IRON_VAJRA_CARAPACE',
  'ELEMENTAL_THORN_ARMOR',
  'SWORD_CURTAIN_WARD',
  'TAIJI_SOFT_REDIRECTION',
  'MIRAGE_CICADA_SHELL',
  'CELESTIAL_AEGIS_DOME'
];
expectedArchs.forEach(aId => {
  const spec = CULT.DEFENSIVE_ARTS.ARCHETYPES[aId];
  assert(spec && spec.nameTh && spec.prosTh && spec.consTh, `Defensive archetype ${aId} must have Thai metadata`);
});

// Verify 6 Signature Defensive Manuals are registered in CULT.tech without changing 655 martial techniques count
assert.strictEqual(JD.MARTIAL.techniques.length, 655, 'JD.MARTIAL.techniques count must remain 655');
const sigDefIds = [
  'DEF_IRON_SHIRT_VAJRA_T1',
  'DEF_MYRIAD_SWORD_CURTAIN_T3',
  'DEF_TAIJI_STAR_SHIFT_T3',
  'DEF_FIVE_ELEMENT_THORN_T4',
  'DEF_GOLDEN_CICADA_MOLT_T5',
  'DEF_IMMORTAL_HEAVEN_AEGIS_T6'
];
sigDefIds.forEach(id => {
  const t = CULT.tech(id);
  assert(t && t.defensiveArchetype && t.defensiveSpec, `Signature defensive manual ${id} must be registered`);
});

// Verify all 58 DEFENSIVE_TECHNIQUE entries in JD.TECH.techniques have defensiveArchetype
const allDefTechs = JD.TECH.techniques.filter(t => t.cat === 'DEFENSIVE_TECHNIQUE');
assert.strictEqual(allDefTechs.length, 58, 'All 58 DEFENSIVE_TECHNIQUE entries in JD.TECH.techniques must remain intact');
allDefTechs.forEach(t => {
  assert(t.defensiveArchetype && t.defensiveSpec, `Defensive technique ${t.id} must have defensiveArchetype`);
});
assert.strictEqual(CULT.tech('MP_SWORD_FLOWING_PARRY_T2').defensiveArchetype, 'TAIJI_SOFT_REDIRECTION');
assert.strictEqual(CULT.tech('MP_BLADE_PARRY_STANCE_T3').defensiveArchetype, 'SWORD_CURTAIN_WARD');
assert.strictEqual(CULT.tech('INNATE_SOUL_VESSEL_LINK').defensiveArchetype, 'MIRAGE_CICADA_SHELL');
assert.strictEqual(CULT.tech('INNATE_QIMEN_TALISMAN_WARD').defensiveArchetype, 'CELESTIAL_AEGIS_DOME');

// 2. Verify 3 Guard Postures & Tradeoffs (PASSIVE_AURA_GUARD, COUNTER_PARRY_STANCE, FORTRESS_BASTION_LOCK)
const W = SIM.create('v560-defensive-aegis-seed', { masterIdx: 0 });
W.weather = { kind: 'clear', t: 100 };
const master = W.byId[W.sect.masterId];
const elder = W.npcs.find(n => n.id !== master.id && !n.dead && n.cult);
const disc = W.npcs.find(n => n.id !== master.id && n.id !== elder.id && !n.dead && n.cult);

elder.cult.path = 'XIAN';
elder.cult.stage = 4;
if (!elder.cult.techs.includes('DEF_TAIJI_STAR_SHIFT_T3')) elder.cult.techs.push('DEF_TAIJI_STAR_SHIFT_T3');
elder.h.state.qi = CULT.qiMax(elder);
elder.h.state.stress = 10;

const pPassive = CULT.DEFENSIVE_ARTS.setDefensivePosture(W, elder, 'PASSIVE_AURA_GUARD', 'TAIJI_SOFT_REDIRECTION');
const wsPassive = AI.walkSpeed(W, elder);
const pCounter = CULT.DEFENSIVE_ARTS.setDefensivePosture(W, elder, 'COUNTER_PARRY_STANCE', 'TAIJI_SOFT_REDIRECTION');
const pFortress = CULT.DEFENSIVE_ARTS.setDefensivePosture(W, elder, 'FORTRESS_BASTION_LOCK', 'TAIJI_SOFT_REDIRECTION');
const wsFortress = AI.walkSpeed(W, elder);

assert(pCounter.effRedirectPct > pPassive.effRedirectPct, 'COUNTER_PARRY_STANCE must have higher Taiji redirection than PASSIVE_AURA_GUARD');
assert(pFortress.effDmgRedPct > pCounter.effDmgRedPct, 'FORTRESS_BASTION_LOCK must have highest damage reduction');
assert(wsFortress < wsPassive, 'FORTRESS_BASTION_LOCK must apply -12% movement speed tradeoff');

// 3. Verify Combat Mechanics: Taiji Soft Redirection + Qi Recovery, Mirage Cicada Molt Cheat-Death & Celestial Aegis Ally Interception
const f = { id: 560, kind: 'raid', serious: true, t0: W.t, units: [master.id, elder.id, disc.id] };
const foe = { id: 'foe_v560', foe: true, name: 'ขุนพลมาร', hp: 800, hpMax: 800, tier: 4, x: elder.x + 1, y: elder.y };
W.foes = [foe];
W.foeById = { [foe.id]: foe };

// A. Taiji Soft Redirection test
CULT.DEFENSIVE_ARTS.setDefensivePosture(W, elder, 'COUNTER_PARRY_STANCE', 'TAIJI_SOFT_REDIRECTION');
elder.h.state.hp = CULT.hpMax(elder);
elder.h.state.qi = Math.floor(CULT.qiMax(elder) * 0.5);
const qiBeforeTaiji = elder.h.state.qi;
COMBAT.applyDamage(W, f, foe, elder, 100, 'โจมตีทดสอบไท่เก๊ก');
assert(elder.lastDefensiveArtProc && elder.lastDefensiveArtProc.kind === 'TAIJI_REDIRECT', 'TAIJI_SOFT_REDIRECTION must proc TAIJI_REDIRECT');
assert(foe.hp < 800, 'TAIJI_SOFT_REDIRECTION must redirect damage back to attacker');
assert(elder.h.state.qi > qiBeforeTaiji, 'TAIJI_SOFT_REDIRECTION must convert deflected impact into net Qi recovery');

// B. Mirage Cicada Shell emergency molt test (when HP would drop <= 25%)
disc.cult.stage = 4;
if (!disc.cult.techs.includes('DEF_GOLDEN_CICADA_MOLT_T5')) disc.cult.techs.push('DEF_GOLDEN_CICADA_MOLT_T5');
CULT.DEFENSIVE_ARTS.setDefensivePosture(W, disc, 'COUNTER_PARRY_STANCE', 'MIRAGE_CICADA_SHELL');
const discMaxHp = CULT.hpMax(disc);
disc.h.state.hp = Math.floor(discMaxHp * 0.30);
disc.h.state.qi = CULT.qiMax(disc);
COMBAT.applyDamage(W, f, foe, disc, Math.floor(discMaxHp * 0.20), 'โจมตีปางตาย');
assert(disc.lastDefensiveArtProc && disc.lastDefensiveArtProc.kind === 'CICADA_MOLT_SAVE', 'MIRAGE_CICADA_SHELL must proc CICADA_MOLT_SAVE when HP drops below 25%');
assert(disc.h.state.hp > Math.floor(discMaxHp * 0.30), 'CICADA_MOLT_SAVE must negate the blow and heal the cultivator');

// C. Celestial Aegis Dome Ally Damage Interception test
master.cult.stage = 6;
if (!master.cult.techs.includes('DEF_IMMORTAL_HEAVEN_AEGIS_T6')) master.cult.techs.push('DEF_IMMORTAL_HEAVEN_AEGIS_T6');
CULT.DEFENSIVE_ARTS.setDefensivePosture(W, master, 'FORTRESS_BASTION_LOCK', 'CELESTIAL_AEGIS_DOME');
master.h.state.hp = CULT.hpMax(master);
master.h.state.qi = CULT.qiMax(master);
master.x = elder.x + 2;
master.y = elder.y + 1;
const masterHpBeforeIntercept = master.h.state.hp;
COMBAT.applyDamage(W, f, foe, elder, 120, 'โจมตีสหาย');
assert(master.defensiveArtState.totalAllyIntercepts >= 1, 'CELESTIAL_AEGIS_DOME must intercept damage for nearby allies within 5.5 tiles');
assert(master.h.state.hp < masterHpBeforeIntercept, 'Guardian must absorb a reduced portion of the intercepted damage');

W.foes = [];
W.foeById = {};

// 4. Verify Read-Only Canvas Rendering, Diorama 'defensive' Pose, UI & Save/Load Round-Trip
const mockCanvas = makeMockCanvas(960, 600);
const renderer = Render.create(mockCanvas);
renderer.setWorld(W);
renderer.resize();

const snapBeforeDraw = SIM.serialize(W);
const rngBeforeDraw = JSON.stringify(W.rng.getState());
renderer.draw(2500);
const snapAfterDraw = SIM.serialize(W);
const rngAfterDraw = JSON.stringify(W.rng.getState());
assert.strictEqual(snapAfterDraw, snapBeforeDraw, 'Render.draw with active Defensive Aegis visuals must be 100% read-only on SIM.serialize(W)');
assert.strictEqual(rngAfterDraw, rngBeforeDraw, 'Render.draw must never mutate W.rng');

// Verify Character Diorama with pose === 'defensive'
const dioCanvas = makeMockCanvas(220, 136);
const dioOk = Render.diorama(dioCanvas, master, { pose: 'defensive', timeSec: 3.0 });
assert.strictEqual(dioOk, true, 'Render.diorama must support pose === defensive');

// Verify UI rendering includes Defensive Kungfu & Aegis card
UI.G = { W, R: renderer, speed: 1 };
UI.npcId = master.id;
UI.tab = 'ov';
UI.npcSubTab = 'CORE';
const npcHtml = UI.rNpc();
assert(npcHtml.includes('วิชาคุ้มกายและปราณเกราะพิทักษ์'), 'UI.rNpc must render Defensive Kungfu & Aegis card');

// Verify Save/Load round-trip preserves defensiveArtState
const savedJson = SIM.serialize(W);
const loadedW = SIM.deserialize(savedJson);
assert.strictEqual(loadedW.byId[master.id].defensiveArtState.posture, 'FORTRESS_BASTION_LOCK', 'SIM.deserialize must preserve defensiveArtState.posture');

console.log('--- Patch v5.6.0 Defensive Kungfu & Protective Aegis Overhaul Suite: ALL PASSED ---');
