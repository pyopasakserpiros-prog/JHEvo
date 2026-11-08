/* ===== PATCH v5.5.0 REGRESSION SUITE: MANTRA & INNER KUNGFU RESONANCE, DYNAMIC WEATHER & GRAND FORMATION WARFARE ===== */
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

const { SIM, CULT, SECT, COMBAT, AI, Render, UI, HC, JD } = G;

console.log('--- Running Patch v5.5.0 Mantra Resonance, Dynamic Weather & Grand Formation Warfare Suite ---');

// 0. Verify human_core.js SHA-256 & Patch Version
const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
assert.strictEqual(
  hcSha,
  'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542',
  'human_core.js SHA-256 must remain 100% byte-identical'
);
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
assert.strictEqual(SIM.PATCH_VERSION, '2.4.0', 'SIM.PATCH_VERSION must be 5.5.0');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '2.4.0-tactical-composable-grand-dao', 'SIM.SAVE_SCHEMA_VERSION must match v5.5.0');
assert(SIM.SUPPORTED_PATCHES.includes('5.8.0'), 'SIM.SUPPORTED_PATCHES must include 5.5.0');

// 1. Verify CULT.MANTRA_SYSTEM 7 Archetypes, 3 Stances & Full Catalog Enrichment
assert(CULT.MANTRA_SYSTEM && CULT.MANTRA_SYSTEM.ARCHETYPES, 'CULT.MANTRA_SYSTEM.ARCHETYPES must exist');
const expectedArchs = [
  'PRIMORDIAL_YANG_FURNACE',
  'ABYSSAL_FROST_MIRROR',
  'SWORD_QI_MERIDIAN',
  'EVERGREEN_LONGEVITY_SPRING',
  'ASTRAL_VOID_BREATHING',
  'DEVOURING_NETHER_VORTEX',
  'VAJRA_IMMORTAL_BODY_BELL'
];
expectedArchs.forEach(aId => {
  const spec = CULT.MANTRA_SYSTEM.ARCHETYPES[aId];
  assert(spec && spec.nameTh && spec.prosTh && spec.consTh, `Mantra archetype ${aId} must have Thai metadata`);
});

// Verify all 122 mantras in JD.TECH.mantras are enriched with mantraArchetype and mantraSpec
assert.strictEqual(JD.TECH.mantras.length, 122, 'JD.TECH.mantras count must remain 122');
JD.TECH.mantras.forEach(m => {
  assert(m.mantraArchetype && m.mantraSpec, `Mantra ${m.id} must have mantraArchetype and mantraSpec`);
});
assert.strictEqual(CULT.tech('MANTRA_JADE_SPRING').mantraArchetype, 'EVERGREEN_LONGEVITY_SPRING');
assert.strictEqual(CULT.tech('MANTRA_THUNDER_BLADE_QI').mantraArchetype, 'SWORD_QI_MERIDIAN');
assert.strictEqual(CULT.tech('MANTRA_MOONLIGHT_ILLUSION_QI').mantraArchetype, 'ABYSSAL_FROST_MIRROR');
assert.strictEqual(CULT.tech('ART190_XIAN_006').mantraArchetype, 'PRIMORDIAL_YANG_FURNACE');
assert.strictEqual(CULT.tech('ART190_XIAN_010').mantraArchetype, 'VAJRA_IMMORTAL_BODY_BELL');

// 2. Verify Stance Switching (SERENE_PURIFICATION, HARMONIOUS_CIRCULATION, OVERDRIVE_COMBUSTION) & Weather Resonance
const W = SIM.create('v550-mantra-formation-seed', { masterIdx: 0 });
W.weather = { kind: 'clear', t: 100 };
const master = W.byId[W.sect.masterId];
const elder = W.npcs.find(n => n.id !== master.id && !n.dead && n.cult);

master.cult.path = 'XIAN';
master.cult.mantra = 'MANTRA_AZURE_CLOUD'; // ASTRAL_VOID_BREATHING
const resSerene = CULT.MANTRA_SYSTEM.setMantraStance(W, master, 'SERENE_PURIFICATION');
const rateSerene = CULT.rate(master, 1);

const resHarm = CULT.MANTRA_SYSTEM.setMantraStance(W, master, 'HARMONIOUS_CIRCULATION');
const rateHarm = CULT.rate(master, 1);

const resOver = CULT.MANTRA_SYSTEM.setMantraStance(W, master, 'OVERDRIVE_COMBUSTION');
const rateOver = CULT.rate(master, 1);

assert(rateHarm > rateSerene, `HARMONIOUS_CIRCULATION rate (${rateHarm}) must exceed SERENE_PURIFICATION (${rateSerene})`);
assert(rateOver > rateHarm, `OVERDRIVE_COMBUSTION rate (${rateOver}) must exceed HARMONIOUS_CIRCULATION (${rateHarm})`);

// Test Weather Resonance (spirit_aurora boosts ASTRAL_VOID_BREATHING by +30%)
SECT.FORMATION_WARFARE.triggerWeatherPhenomenon(W, 'rain');
const rateInRain = CULT.rate(master, 1);
SECT.FORMATION_WARFARE.triggerWeatherPhenomenon(W, 'spirit_aurora');
const rateInAurora = CULT.rate(master, 1);
assert(rateInAurora > rateInRain, `ASTRAL_VOID_BREATHING must cultivate faster under spirit_aurora (${rateInAurora}) than rain (${rateInRain})`);

// 3. Verify Autonomous Walking Cultivation & Sword-Qi Meridian + Sword Flight Synergy
const progBeforeWalk = master.cult.prog;
master.h.state.qi = Math.floor(CULT.qiMax(master) * 0.5);
AI.goTo(W, master, master.x + 8, master.y + 4);
AI.stepMove(W, master);
assert(master.cult.prog > progBeforeWalk, 'ASTRAL_VOID_BREATHING must grant autonomous cultivation progress while walking');
assert(master.mantraState.totalAutonomousGain > 0, 'totalAutonomousGain must be recorded in mantraState');

// Verify SWORD_QI_MERIDIAN synergy with SWORD_FLIGHT (-30% Qi cost, +15% speed)
elder.cult.path = 'XIAN';
elder.cult.sub = 'SWORD_FLIGHT';
elder.cult.stage = 4;
elder.cult.mantra = 'MANTRA_BASIC_BREATH';
elder.equip = elder.equip || {};
elder.equip.WEAPON = { id: 'EQ_SWORD_V550', nameTh: 'กระบี่ไท่ไป๋', slot: 'WEAPON', tier: 3 };
CULT.QINGGONG.ensureState(elder).preferredMode = 'SWORD_FLIGHT';
CULT.MANTRA_SYSTEM.setMantraStance(W, elder, 'HARMONIOUS_CIRCULATION');
const sfBase = CULT.QINGGONG.resolveNpcMode(W, elder);

elder.cult.mantra = 'MANTRA_THUNDER_BLADE_QI'; // SWORD_QI_MERIDIAN
elder._qgUnlockCache = null;
const sfSwordMantra = CULT.QINGGONG.resolveNpcMode(W, elder);
assert(sfSwordMantra.speedMult > sfBase.speedMult, 'SWORD_QI_MERIDIAN mantra must boost SWORD_FLIGHT speed');
assert(sfSwordMantra.qiCostPerTick < sfBase.qiCostPerTick, 'SWORD_QI_MERIDIAN mantra must reduce SWORD_FLIGHT Qi drain by 30%');

// 4. Verify Group Meditation Resonance Circle & Stance Toxicity/Heart-Demon Effects
master.cult.mantra = 'MANTRA_JADE_SPRING'; // EVERGREEN_LONGEVITY_SPRING
CULT.MANTRA_SYSTEM.setMantraStance(W, master, 'SERENE_PURIFICATION');
master.cult.toxic = 20;
master.h.state.heartDemon = 25;
elder.x = master.x + 2;
elder.y = master.y + 1;
elder.h.state.hp = Math.floor(CULT.hpMax(elder) * 0.5);
const elderHpBefore = elder.h.state.hp;
W.t = 1000; // divisible by 10 for aura pulse
CULT.MANTRA_SYSTEM.stepMeditationResonance(W, master);
assert(master.cult.toxic < 20, 'SERENE_PURIFICATION must cleanse Qi toxicity during meditation');
assert(master.h.state.heartDemon < 25, 'SERENE_PURIFICATION must calm Heart Demon during meditation');
assert(elder.h.state.hp > elderHpBefore, 'EVERGREEN_LONGEVITY_SPRING meditation aura must heal nearby sect mates within 6 tiles');

// 5. Verify Mantra Combat Dharma Manifestations & Grand Formation Warfare in C.applyDamage
const f = { id: 999, kind: 'raid', serious: true, t0: W.t, units: [master.id, elder.id] };
// Test VAJRA_IMMORTAL_BODY_BELL damage reduction & reflection
master.cult.mantra = 'ART190_XIAN_010'; // VAJRA_IMMORTAL_BODY_BELL
CULT.MANTRA_SYSTEM.setMantraStance(W, master, 'HARMONIOUS_CIRCULATION');
master.h.state.hp = CULT.hpMax(master);
const foe = { id: 'foe_test_v550', foe: true, name: 'มารทดสอบ', hp: 500, hpMax: 500, tier: 3, x: master.x + 1, y: master.y };
W.foes = [foe];
W.foeById = { [foe.id]: foe };

COMBAT.applyDamage(W, f, foe, master, 100, 'โจมตีทดสอบ');
assert(master.lastMantraCombatProc && master.lastMantraCombatProc.kind === 'VAJRA_BELL_REFLECT', 'VAJRA_IMMORTAL_BODY_BELL must proc VAJRA_BELL_REFLECT when hit');
assert(foe.hp < 500, 'VAJRA_IMMORTAL_BODY_BELL must reflect melee damage back to attacker');

// Test DEVOURING_NETHER_VORTEX lifesteal & Qi siphon on attack
elder.cult.path = 'DEMON';
elder.cult.mantra = 'MANTRA_MYRIAD_VENOM_QI';
JD.TECH.mantras.find(m => m.id === 'MANTRA_MYRIAD_VENOM_QI').mantraArchetype = 'DEVOURING_NETHER_VORTEX';
JD.TECH.mantras.find(m => m.id === 'MANTRA_MYRIAD_VENOM_QI').mantraSpec = CULT.MANTRA_SYSTEM.ARCHETYPES.DEVOURING_NETHER_VORTEX;
CULT.MANTRA_SYSTEM.setMantraStance(W, elder, 'OVERDRIVE_COMBUSTION');
elder.h.state.hp = Math.floor(CULT.hpMax(elder) * 0.5);
elder.h.state.qi = Math.floor(CULT.qiMax(elder) * 0.3);
const hpBeforeSiphon = elder.h.state.hp;
const qiBeforeSiphon = elder.h.state.qi;
COMBAT.applyDamage(W, f, elder, foe, 100, 'โจมตีสูบปราณ');
assert(elder.h.state.hp > hpBeforeSiphon, 'DEVOURING_NETHER_VORTEX must siphon HP on attack');
assert(elder.h.state.qi > qiBeforeSiphon, 'DEVOURING_NETHER_VORTEX must siphon Qi on attack');

// Clean up test foe before serialization/render
W.foes = [];
W.foeById = {};

// 6. Verify Grand Sect Formation Warfare Stances & Read-Only Rendering
const fwRes = SECT.FORMATION_WARFARE.setFormationStance(W, 'SWORD_NET_SLAUGHTER');
assert(fwRes.ok && W.sect.formationWarfare.activeStance === 'SWORD_NET_SLAUGHTER', 'setFormationStance must switch sect formation stance');

const mockCanvas = makeMockCanvas(960, 600);
const renderer = Render.create(mockCanvas);
renderer.setWorld(W);
renderer.resize();
master.act = { id: 'cultivate', stage: 'do', left: 50, total: 100, ctx: {} };

const snapBeforeDraw = SIM.serialize(W);
const rngBeforeDraw = JSON.stringify(W.rng.getState());
renderer.draw(2000);
const snapAfterDraw = SIM.serialize(W);
const rngAfterDraw = JSON.stringify(W.rng.getState());
assert.strictEqual(snapAfterDraw, snapBeforeDraw, 'Render.draw with active Mantra Dharma Aura & Formation Beams must be 100% read-only on SIM.serialize(W)');
assert.strictEqual(rngAfterDraw, rngBeforeDraw, 'Render.draw must never mutate W.rng');

// Verify Character Diorama with pose === 'mantra'
const dioCanvas = makeMockCanvas(220, 136);
const dioOk = Render.diorama(dioCanvas, master, { pose: 'mantra', timeSec: 2.5 });
assert.strictEqual(dioOk, true, 'Render.diorama must support pose === mantra');

// Verify UI rendering includes Mantra Resonance card and Formation Warfare controls
UI.G = { W, R: renderer, speed: 1 };
UI.npcId = master.id;
UI.tab = 'ov';
UI.npcSubTab = 'CORE';
const npcHtml = UI.rNpc();
assert(npcHtml.includes('คัมภีร์ปราณบ่มเพาะและเอกลักษณ์การเดินลมปราณ'), 'UI.rNpc must render Mantra Resonance card');

UI.sheet = 'sect';
UI.tab = 'visuals';
const sectHtml = UI.rSect();
assert(sectHtml.includes('มหาค่ายกลพิทักษ์สำนัก 3 รูปแบบ'), 'UI.rSect must render Grand Formation Warfare controls');

// Verify Save/Load round-trip preserves mantraState & formationWarfare
const savedJson = SIM.serialize(W);
const loadedW = SIM.deserialize(savedJson);
assert.strictEqual(loadedW.sect.formationWarfare.activeStance, 'SWORD_NET_SLAUGHTER', 'SIM.deserialize must preserve formationWarfare.activeStance');
assert.strictEqual(loadedW.byId[elder.id].mantraState.stance, 'OVERDRIVE_COMBUSTION', 'SIM.deserialize must preserve NPC mantraState.stance');

console.log('--- Patch v5.5.0 Mantra Resonance, Dynamic Weather & Grand Formation Warfare Suite: ALL PASSED ---');
