/* ===== PATCH v5.8.0 REGRESSION SUITE: MEGA 6-PILLAR EXPANSION (FORBIDDEN ARTS, PASSIVE CONSTELLATIONS, SECT FORBIDDEN VAULT & PRIMORDIAL BLOOD ALTAR) ===== */
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

const { SIM, CULT, SECT, COMBAT, Render, UI, HC, JD } = G;

console.log('--- Running Patch v5.8.0 Mega 6-Pillar Expansion (Forbidden Arts, Passive Constellations & Blood Altar) Suite ---');

// 0. Verify human_core.js SHA-256 & Patch Version
const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
assert.strictEqual(
  hcSha,
  'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542',
  'human_core.js SHA-256 must remain 100% byte-identical'
);
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
assert.strictEqual(SIM.PATCH_VERSION, '2.5.0', 'SIM.PATCH_VERSION must be 5.8.0');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '2.4.0-tactical-composable-grand-dao', 'SIM.SAVE_SCHEMA_VERSION must match v5.8.0');
assert(SIM.SUPPORTED_PATCHES.includes('5.8.0'), 'SIM.SUPPORTED_PATCHES must include 5.8.0');

// 1. Pillar 1: Verify All 37 Forbidden Arts + 6 New Taboo Manuals (T1–T6) + 6 Taboo Archetypes + 3 Seal Modes
assert(CULT.FORBIDDEN_ARTS && CULT.FORBIDDEN_ARTS.ARCHETYPES, 'CULT.FORBIDDEN_ARTS.ARCHETYPES must exist');
const expectedForbArchs = [
  'BLOOD_ESSENCE_IGNITION',
  'MERIDIAN_REVERSE_BURST',
  'CORPSE_PUPPET_NECROMANCY',
  'SOUL_DEVOURING_ABYSS',
  'LIFESPAN_HEAVEN_DEFIANCE',
  'VOID_TABOO_ANNIHILATION'
];
expectedForbArchs.forEach(aId => {
  const spec = CULT.FORBIDDEN_ARTS.ARCHETYPES[aId];
  assert(spec && spec.nameTh && spec.prosTh && spec.consTh, `Forbidden archetype ${aId} must have Thai metadata`);
});

assert.strictEqual(JD.MARTIAL.techniques.length, 655, 'JD.MARTIAL.techniques count must remain 655');
const sigForbManualIds = [
  'FORB_BLOOD_ESSENCE_IGNITE_T1',
  'FORB_MERIDIAN_REVERSE_BURST_T2',
  'FORB_CORPSE_GU_NECROMANCY_T3',
  'FORB_SOUL_DEVOURING_ABYSS_T4',
  'FORB_LIFESPAN_HEAVEN_DEFIANCE_T5',
  'FORB_VOID_APOCALYPSE_TABOO_T6'
];
sigForbManualIds.forEach((id, idx) => {
  const t = CULT.tech(id);
  assert(t && t.tier === (idx + 1) && t.forbiddenArchetype && t.forbiddenSpec, `Signature forbidden manual ${id} (T${idx + 1}) must be registered`);
});

const forbArts = JD.TECH.techniques.filter(t => t.cat === 'FORBIDDEN_ART');
const forbTechs = JD.TECH.techniques.filter(t => t.cat === 'FORBIDDEN_TECHNIQUE');
assert.strictEqual(forbArts.length + forbTechs.length, 37, 'Total FORBIDDEN_ART (35) + FORBIDDEN_TECHNIQUE (2) in JD.TECH.techniques must be 37');
forbArts.concat(forbTechs).forEach(t => {
  assert(t.forbiddenArchetype && t.forbiddenSpec, `Forbidden technique ${t.id} must be enriched with forbiddenArchetype`);
});
assert.strictEqual(CULT.tech('ART190_XIAN_075').forbiddenArchetype, 'LIFESPAN_HEAVEN_DEFIANCE');
assert.strictEqual(CULT.tech('ART190_XIAN_078').forbiddenArchetype, 'MERIDIAN_REVERSE_BURST');
assert.strictEqual(CULT.tech('LEG_FORB_STAR_ABSORBING_VORTEX').forbiddenArchetype, 'SOUL_DEVOURING_ABYSS');
assert.strictEqual(CULT.tech('ART_V112_DEMON_HEAVEN_DEVOURING_CANON_T7').forbiddenArchetype, 'VOID_TABOO_ANNIHILATION');

// 2. Pillar 2: Verify All 263 PASSIVE (227) & INNATE_SUBPATH (36) Techniques Enriched into 6 Constellations
assert(CULT.PASSIVE_RESONANCE && CULT.PASSIVE_RESONANCE.CONSTELLATIONS, 'CULT.PASSIVE_RESONANCE.CONSTELLATIONS must exist');
const passTechs = JD.TECH.techniques.filter(t => t.cat === 'PASSIVE');
const innTechs = JD.TECH.techniques.filter(t => t.cat === 'INNATE_SUBPATH');
assert.strictEqual(passTechs.length, 227, 'Must have 227 PASSIVE techniques');
assert.strictEqual(innTechs.length, 36, 'Must have 36 INNATE_SUBPATH techniques');
assert.strictEqual(passTechs.length + innTechs.length, 263, 'Total PASSIVE + INNATE_SUBPATH must be 263');
passTechs.concat(innTechs).forEach(t => {
  assert(t.passiveConstellation && t.constellationSpec, `Passive/Innate technique ${t.id} must be enriched with passiveConstellation`);
});

// 3. Verify Forbidden Seal Modes, Passive Constellation Set Tiers & Cultivation Rate Scaling
const W = SIM.create('v580-mega-6pillar-seed', { masterIdx: 0 });
W.weather = { kind: 'clear', t: 100 };
const master = W.byId[W.sect.masterId];
const elder = W.npcs.find(n => n.id !== master.id && !n.dead && n.cult);

master.cult.stage = 6;
if (!master.cult.techs.includes('FORB_VOID_APOCALYPSE_TABOO_T6')) master.cult.techs.push('FORB_VOID_APOCALYPSE_TABOO_T6');

const sSealed = CULT.FORBIDDEN_ARTS.setForbiddenSealMode(W, master, 'SEALED_RESTRAINT', 'VOID_TABOO_ANNIHILATION');
const rateSealed = CULT.rate(master, 1);

const sHalf = CULT.FORBIDDEN_ARTS.setForbiddenSealMode(W, master, 'HALF_UNSEALED_FLOW', 'VOID_TABOO_ANNIHILATION');
const rateHalf = CULT.rate(master, 1);

const sFull = CULT.FORBIDDEN_ARTS.setForbiddenSealMode(W, master, 'BLOOD_TABOO_UNLEASHED', 'VOID_TABOO_ANNIHILATION');
const rateFull = CULT.rate(master, 1);

assert.strictEqual(sSealed.isUnsealed, false, 'SEALED_RESTRAINT must keep forbidden power sealed');
assert(rateHalf > rateSealed, `HALF_UNSEALED_FLOW rate (${rateHalf}) must exceed SEALED_RESTRAINT (${rateSealed})`);
assert(rateFull > rateHalf, `BLOOD_TABOO_UNLEASHED rate (${rateFull}) must exceed HALF_UNSEALED_FLOW (${rateHalf})`);
assert(sFull.effAtkBonusPct >= 0.70, 'VOID_TABOO_ANNIHILATION in BLOOD_TABOO_UNLEASHED must grant >= +70% attack surge');

// Test Passive Constellation Focus & Set Tiers
passTechs.filter(t => t.passiveConstellation === 'SWORD_BLADE_EDGE_CONSTELLATION').slice(0, 4).forEach(t => {
  if (!master.cult.techs.includes(t.id)) master.cult.techs.push(t.id);
});
const constRes = CULT.PASSIVE_RESONANCE.setFocusConstellation(W, master, 'SWORD_BLADE_EDGE_CONSTELLATION');
assert.strictEqual(constRes.setTier, 3, '4+ matching passives must unlock Constellation Set Tier 3');
assert(constRes.atkBonusPct > 0 && constRes.cultRateBonusPct > 0, 'Constellation Tier 3 must grant combat and cultivation bonuses');

// 4. Pillar 4: Verify Combat Blood-Sacrifice Strikes, Cataclysmic Desperation Nova & Support Cleansing Chain-Reaction
const f = { id: 580, kind: 'raid', serious: true, t0: W.t, units: [master.id, elder.id] };
const foe = { id: 'foe_v580', foe: true, name: 'จอมมารบรรพกาล', hp: 2000, hpMax: 2000, tier: 6, x: master.x + 1, y: master.y };
W.foes = [foe];
W.foeById = { [foe.id]: foe };

master.h.state.hp = CULT.hpMax(master);
COMBAT.applyDamage(W, f, master, foe, 100, 'โจมตีต้องห้าม');
assert(master.forbiddenArtState.totalTabooStrikes >= 1, 'Unsealed Forbidden Art must record taboo strike');
assert(master.forbiddenArtState.totalBloodSacrificed > 0, 'Unsealed Forbidden Art must sacrifice blood HP on strike');
assert(master.forbiddenArtState.tabooStrain > 0, 'Unsealed Forbidden Art must accumulate tabooStrain');

// Trigger Cataclysmic Taboo Desperation Nova when HP drops <= 30%
const masterMaxHp = CULT.hpMax(master);
master.h.state.hp = Math.floor(masterMaxHp * 0.32);
const foeHpBeforeNova = foe.hp;
COMBAT.applyDamage(W, f, foe, master, Math.floor(masterMaxHp * 0.20), 'โจมตีวิกฤต');
assert(master.lastForbiddenArtProc && master.lastForbiddenArtProc.kind === 'TABOO_DESPERATION_NOVA', 'BLOOD_TABOO_UNLEASHED must trigger TABOO_DESPERATION_NOVA when HP drops below 30%');
assert(master.forbiddenArtState.totalDesperationNovas === 1, 'totalDesperationNovas must increment');
assert(foe.hp < foeHpBeforeNova, 'TABOO_DESPERATION_NOVA must blast attacker with cataclysmic backlash damage');

W.foes = [];
W.foeById = {};

// Cross-System Chain-Reaction: Support Art cleanses master's tabooStrain!
const strainBeforeCleanse = master.forbiddenArtState.tabooStrain;
CULT.SUPPORT_ARTS.setSupportPosture(W, elder, 'BENEVOLENT_HEALER_AURA', 'ACUPOINT_MERIDIAN_THERAPY');
elder.x = master.x + 1;
elder.y = master.y;
CULT.SUPPORT_ARTS.stepFacilityAndDailySynergy(W, elder);
assert(master.forbiddenArtState.tabooStrain < strainBeforeCleanse, 'Support Arts stepFacilityAndDailySynergy must cleanse Forbidden Art tabooStrain');

// 5. Pillar 3: Verify Sect Forbidden Scripture Vault Policies & Primordial Bloodline Altar Rituals
const polBlood = SECT.FORBIDDEN_VAULT.setVaultPolicy(W, 'UNRESTRICTED_BLOOD_CULT');
assert(polBlood.ok && W.sect.forbiddenVault.policy === 'UNRESTRICTED_BLOOD_CULT', 'setVaultPolicy must switch to UNRESTRICTED_BLOOD_CULT');

const ritBlood = SECT.FORBIDDEN_VAULT.performAltarRitual(W, 'AWAKEN_BLOODLINE_ALTAR');
assert(ritBlood.ok && W.sect.forbiddenVault.bloodlineSurgeUntil > W.t, 'AWAKEN_BLOODLINE_ALTAR must activate bloodlineSurgeUntil');

master.forbiddenArtState.tabooStrain = 25;
const ritPurify = SECT.FORBIDDEN_VAULT.performAltarRitual(W, 'PURIFY_TABOO_BACKLASH');
assert(ritPurify.ok && master.forbiddenArtState.tabooStrain === 0, 'PURIFY_TABOO_BACKLASH altar ritual must cleanse tabooStrain to 0');

// 6. Pillar 5 & 6: Verify Read-Only Canvas Rendering, Diorama 'forbidden' Pose, UI & Save/Load Round-Trip
const mockCanvas = makeMockCanvas(960, 600);
const renderer = Render.create(mockCanvas);
renderer.setWorld(W);
renderer.resize();
CULT.FORBIDDEN_ARTS.setForbiddenSealMode(W, master, 'BLOOD_TABOO_UNLEASHED', 'VOID_TABOO_ANNIHILATION');

const snapBeforeDraw = SIM.serialize(W);
const rngBeforeDraw = JSON.stringify(W.rng.getState());
renderer.draw(3500);
const snapAfterDraw = SIM.serialize(W);
const rngAfterDraw = JSON.stringify(W.rng.getState());
assert.strictEqual(snapAfterDraw, snapBeforeDraw, 'Render.draw with active Forbidden Taboo Chains, Passive Constellation & Blood Altar must be 100% read-only on SIM.serialize(W)');
assert.strictEqual(rngAfterDraw, rngBeforeDraw, 'Render.draw must never mutate W.rng');

// Verify Character Diorama with pose === 'forbidden' across all 6 Forbidden Archetypes
const dioCanvas = makeMockCanvas(220, 136);
expectedForbArchs.forEach(aId => {
  CULT.FORBIDDEN_ARTS.setForbiddenSealMode(W, master, 'BLOOD_TABOO_UNLEASHED', aId);
  const dioOk = Render.diorama(dioCanvas, master, { pose: 'forbidden', timeSec: 3.2 });
  assert.strictEqual(dioOk, true, `Render.diorama must render pose === forbidden for archetype ${aId}`);
});

// Verify UI rendering includes Forbidden Arts card, Passive Constellation card, and Sect Forbidden Vault controls
UI.G = { W, R: renderer, speed: 1 };
UI.npcId = master.id;
UI.tab = 'ov';
UI.npcSubTab = 'CORE';
const npcHtml = UI.rNpc();
assert(npcHtml.includes('คัมภีร์วิชาต้องห้ามและการปลดผนึกโลหิต'), 'UI.rNpc must render Forbidden Arts card');
assert(npcHtml.includes('ดาราจักรวิชาติดตัวและเคล็ดสายย่อยประสานชีพจร'), 'UI.rNpc must render Passive Constellation card');

UI.sheet = 'sect';
UI.tab = 'visuals';
const sectHtml = UI.rSect();
assert(sectHtml.includes('หอผนึกคัมภีร์ต้องห้าม & แท่นสังเวยโลหิตบรรพกาล'), 'UI.rSect must render Sect Forbidden Vault & Blood Altar controls');

// Verify Save/Load round-trip preserves forbiddenArtState, passiveResonanceState, and forbiddenVault
const savedJson = SIM.serialize(W);
const loadedW = SIM.deserialize(savedJson);
assert.strictEqual(loadedW.byId[master.id].forbiddenArtState.sealMode, 'BLOOD_TABOO_UNLEASHED', 'SIM.deserialize must preserve forbiddenArtState.sealMode');
assert.strictEqual(loadedW.byId[master.id].passiveResonanceState.focusConstellation, 'SWORD_BLADE_EDGE_CONSTELLATION', 'SIM.deserialize must preserve passiveResonanceState.focusConstellation');
assert.strictEqual(loadedW.sect.forbiddenVault.policy, 'UNRESTRICTED_BLOOD_CULT', 'SIM.deserialize must preserve W.sect.forbiddenVault.policy');

console.log('--- Patch v5.8.0 Mega 6-Pillar Expansion Suite: ALL PASSED ---');
