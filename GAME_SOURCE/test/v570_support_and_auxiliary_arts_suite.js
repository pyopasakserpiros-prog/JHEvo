/* ===== PATCH v5.7.0 REGRESSION SUITE: SUPPORT & AUXILIARY ARTS OVERHAUL (5 PILLARS) ===== */
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

const { SIM, CULT, COMBAT, EXPED, Render, UI, HC, JD } = G;

console.log('--- Running Patch v5.7.0 Support & Auxiliary Arts Overhaul (5 Pillars) Suite ---');

// 0. Verify human_core.js SHA-256 & Patch Version
const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
assert.strictEqual(
  hcSha,
  'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542',
  'human_core.js SHA-256 must remain 100% byte-identical'
);
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
assert.strictEqual(SIM.PATCH_VERSION, '2.4.0', 'SIM.PATCH_VERSION must be 5.7.0');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '2.4.0-tactical-composable-grand-dao', 'SIM.SAVE_SCHEMA_VERSION must match v5.7.0');
assert(SIM.SUPPORTED_PATCHES.includes('5.8.0'), 'SIM.SUPPORTED_PATCHES must include 5.7.0');

// 1. Pillar 1: Verify 6 Support Archetypes, 6 New Manuals (T1–T6) & All 97 Enriched Support/Auxiliary Techniques
assert(CULT.SUPPORT_ARTS && CULT.SUPPORT_ARTS.ARCHETYPES, 'CULT.SUPPORT_ARTS.ARCHETYPES must exist');
const expectedArchs = [
  'CELESTIAL_ZITHER_MELODY',
  'ALCHEMICAL_INCENSE_MIST',
  'ACUPOINT_MERIDIAN_THERAPY',
  'QIMEN_BATTLE_BANNER',
  'DIVINATION_STAR_GUIDANCE',
  'BODHI_CHANT_SANCTUARY'
];
expectedArchs.forEach(aId => {
  const spec = CULT.SUPPORT_ARTS.ARCHETYPES[aId];
  assert(spec && spec.nameTh && spec.prosTh && spec.consTh && spec.facilityId, `Support archetype ${aId} must have Thai metadata and facilityId`);
});

assert.strictEqual(JD.MARTIAL.techniques.length, 655, 'JD.MARTIAL.techniques count must remain 655');
const sigManualIds = [
  'SUP_JADE_FLUTE_SERENITY_T1',
  'SUP_ALCHEMICAL_SPIRIT_MIST_T2',
  'SUP_GOLDEN_NEEDLE_MERIDIAN_T3',
  'SUP_QIMEN_COMMAND_BANNER_T4',
  'SUP_ASTRAL_FATE_COMPASS_T5',
  'SUP_BODHI_SOVEREIGN_CHANT_T6'
];
sigManualIds.forEach((id, idx) => {
  const t = CULT.tech(id);
  assert(t && t.tier === (idx + 1) && t.supportArchetype && t.supportSpec, `Signature support manual ${id} (T${idx + 1}) must be registered`);
});

const supTechs = JD.TECH.techniques.filter(t => t.cat === 'SUPPORT_TECHNIQUE');
const auxTechs = JD.TECH.techniques.filter(t => t.cat === 'AUXILIARY_ART');
assert.strictEqual(supTechs.length, 44, 'Must have 44 SUPPORT_TECHNIQUE entries');
assert.strictEqual(auxTechs.length, 53, 'Must have 53 AUXILIARY_ART entries');
assert.strictEqual(supTechs.length + auxTechs.length, 97, 'Total SUPPORT_TECHNIQUE + AUXILIARY_ART must be 97');
supTechs.concat(auxTechs).forEach(t => {
  assert(t.supportArchetype && t.supportSpec, `Technique ${t.id} (${t.cat}) must be enriched with supportArchetype`);
});
assert.strictEqual(CULT.tech('INNATE_CELESTIAL_ZITHER_CHORD').supportArchetype, 'CELESTIAL_ZITHER_MELODY');
assert.strictEqual(CULT.tech('INNATE_GOLDEN_NEEDLE_PULSE').supportArchetype, 'ACUPOINT_MERIDIAN_THERAPY');
assert.strictEqual(CULT.tech('INNATE_WAR_BANNER_HYMN').supportArchetype, 'QIMEN_BATTLE_BANNER');
assert.strictEqual(CULT.tech('INNATE_ELIXIR_DAO_CAULDRON').supportArchetype, 'ALCHEMICAL_INCENSE_MIST');
assert.strictEqual(CULT.tech('LEG_AUX_QIANKUN_SHIFT').supportArchetype, 'DIVINATION_STAR_GUIDANCE');
assert.strictEqual(CULT.tech('ART_KARMA_SAMSARA_008').supportArchetype, 'BODHI_CHANT_SANCTUARY');

// 2. Pillar 2: Verify 3 Switchable Tactical Support Postures (n.supportState.posture)
const W = SIM.create('v570-support-auxiliary-seed', { masterIdx: 0 });
W.weather = { kind: 'clear', t: 100 };
const master = W.byId[W.sect.masterId];
const elder = W.npcs.find(n => n.id !== master.id && !n.dead && n.cult);
const disc = W.npcs.find(n => n.id !== master.id && n.id !== elder.id && !n.dead && n.cult);

master.cult.stage = 5;
if (!master.cult.techs.includes('SUP_JADE_FLUTE_SERENITY_T1')) master.cult.techs.push('SUP_JADE_FLUTE_SERENITY_T1');
if (!master.cult.techs.includes('SUP_GOLDEN_NEEDLE_MERIDIAN_T3')) master.cult.techs.push('SUP_GOLDEN_NEEDLE_MERIDIAN_T3');
if (!master.cult.techs.includes('SUP_QIMEN_COMMAND_BANNER_T4')) master.cult.techs.push('SUP_QIMEN_COMMAND_BANNER_T4');

const pHealer = CULT.SUPPORT_ARTS.setSupportPosture(W, master, 'BENEVOLENT_HEALER_AURA', 'ACUPOINT_MERIDIAN_THERAPY');
const pCommand = CULT.SUPPORT_ARTS.setSupportPosture(W, master, 'TACTICAL_ARRAY_COMMAND', 'QIMEN_BATTLE_BANNER');
const pHarmony = CULT.SUPPORT_ARTS.setSupportPosture(W, master, 'SOUL_MELODY_HARMONY', 'CELESTIAL_ZITHER_MELODY');

assert(pHealer.effHealPct > pCommand.effHealPct, 'BENEVOLENT_HEALER_AURA must maximize healing output');
assert(pCommand.effAtkBonusPct > pHealer.effAtkBonusPct, 'TACTICAL_ARRAY_COMMAND must maximize battlefield attack command buff');
assert(pHarmony.effHeartDemonCleanse > pCommand.effHeartDemonCleanse, 'SOUL_MELODY_HARMONY must maximize Heart Demon suppression');

// 3. Pillar 4: Verify Systemic Chain-Reaction (Zither/Acupoint cleanses Heart Demon & Toxicity -> Higher Breakthrough Chance!)
elder.x = master.x + 2;
elder.y = master.y + 1;
elder.h.state.heartDemon = 45;
elder.h.state.stress = 60;
elder.h.state.hp = Math.floor(CULT.hpMax(elder) * 0.5);
elder.cult.toxic = 40;
elder.inj = [{ part: 'แขน', sev: 1, why: 'บาดเจ็บฝึกยุทธ์', until: 150, t: W.t }];
elder._btBonusPct = 0;

const btChanceBeforeSupport = CULT.breakthroughChance(elder, 0.3);

// Master performs Zither Melody & Acupoint Therapy synergy
CULT.SUPPORT_ARTS.setSupportPosture(W, master, 'SOUL_MELODY_HARMONY', 'CELESTIAL_ZITHER_MELODY');
const synRes1 = CULT.SUPPORT_ARTS.stepFacilityAndDailySynergy(W, master);
assert(synRes1.ok && synRes1.affected >= 2, 'stepFacilityAndDailySynergy must affect nearby sect members');
assert(elder.h.state.heartDemon < 45, 'Zither Melody must reduce nearby disciple Heart Demon');
assert(elder._btBonusPct > 0, 'Zither Melody must grant _btBonusPct breakthrough stability blessing');

CULT.SUPPORT_ARTS.setSupportPosture(W, master, 'BENEVOLENT_HEALER_AURA', 'ACUPOINT_MERIDIAN_THERAPY');
CULT.SUPPORT_ARTS.stepFacilityAndDailySynergy(W, master);
assert(elder.cult.toxic < 40, 'Acupoint Therapy must cleanse pill Qi toxicity');
assert.strictEqual(elder.inj.length, 0, 'Acupoint Therapy must accelerate and complete recovery of minor injuries');

const btChanceAfterSupport = CULT.breakthroughChance(elder, 0.3);
assert(btChanceAfterSupport > btChanceBeforeSupport, `Systemic chain-reaction: Support aura must increase breakthrough success probability (${btChanceAfterSupport} > ${btChanceBeforeSupport})`);

// Verify Combat & Expedition Integration
const f = { id: 570, kind: 'raid', serious: true, t0: W.t, units: [master.id, elder.id] };
const foe = { id: 'foe_v570', foe: true, name: 'มารทดสอบ', hp: 600, hpMax: 600, tier: 3, x: elder.x + 1, y: elder.y };
W.foes = [foe];
W.foeById = { [foe.id]: foe };

CULT.SUPPORT_ARTS.setSupportPosture(W, master, 'TACTICAL_ARRAY_COMMAND', 'QIMEN_BATTLE_BANNER');
COMBAT.applyDamage(W, f, elder, foe, 100, 'โจมตีมีธงรบหนุน');
assert(master.supportState.totalCommandBuffs >= 1, 'Qimen Banner support aura must buff ally attacks in combat');

elder.h.state.hp = Math.floor(CULT.hpMax(elder) * 0.5);
const hpBeforeHit = elder.h.state.hp;
COMBAT.applyDamage(W, f, foe, elder, 20, 'ศัตรูตีสหาย');
assert(master.supportState.totalAlliesHealed > 0, 'Support aura must mitigate damage and heal ally in combat');

W.foes = [];
W.foeById = {};

// Verify Expedition Hazard Reduction from DIVINATION_STAR_GUIDANCE
disc.away = false; disc.travel = null; disc.expId = null;
disc.cult.stage = 3;
if (!disc.cult.techs.includes('SUP_ASTRAL_FATE_COMPASS_T5')) disc.cult.techs.push('SUP_ASTRAL_FATE_COMPASS_T5');
const tripNoSup = EXPED.createParty(W, [disc], { baseDays: 6, useQinggong: false });
CULT.SUPPORT_ARTS.setSupportPosture(W, disc, 'TACTICAL_ARRAY_COMMAND', 'DIVINATION_STAR_GUIDANCE');
const tripWithSup = EXPED.createParty(W, [disc], { baseDays: 6, useQinggong: false });
assert(tripWithSup.hazardReduction > tripNoSup.hazardReduction, 'DIVINATION_STAR_GUIDANCE must reduce World Map expedition hazard chance');

// Verify Emergency Sect Support Command
elder.h.state.heartDemon = 30;
const emRes = CULT.SUPPORT_ARTS.triggerSectEmergencySupport(W, 'ZITHER_PURGE_HEART_DEMON');
assert(emRes.ok && elder.h.state.heartDemon < 30, 'triggerSectEmergencySupport must cleanse Heart Demon across the sect');

// 4. Pillar 3 & 5: Verify Read-Only Canvas Rendering, Diorama 'support' Pose, UI & Save/Load Round-Trip
const mockCanvas = makeMockCanvas(960, 600);
const renderer = Render.create(mockCanvas);
renderer.setWorld(W);
renderer.resize();
master.act = { id: 'support', stage: 'do', left: 30, total: 60, ctx: {} };

const snapBeforeDraw = SIM.serialize(W);
const rngBeforeDraw = JSON.stringify(W.rng.getState());
renderer.draw(3000);
const snapAfterDraw = SIM.serialize(W);
const rngAfterDraw = JSON.stringify(W.rng.getState());
assert.strictEqual(snapAfterDraw, snapBeforeDraw, 'Render.draw with active Support Art visuals must be 100% read-only on SIM.serialize(W)');
assert.strictEqual(rngAfterDraw, rngBeforeDraw, 'Render.draw must never mutate W.rng');

// Verify Character Diorama with pose === 'support' across all 6 archetypes
const dioCanvas = makeMockCanvas(220, 136);
expectedArchs.forEach(aId => {
  CULT.SUPPORT_ARTS.setSupportPosture(W, master, 'SOUL_MELODY_HARMONY', aId);
  const dioOk = Render.diorama(dioCanvas, master, { pose: 'support', timeSec: 2.8 });
  assert.strictEqual(dioOk, true, `Render.diorama must render pose === support for archetype ${aId}`);
});

// Verify UI rendering includes Support & Auxiliary Arts card and Emergency Sect Support buttons
UI.G = { W, R: renderer, speed: 1 };
UI.npcId = master.id;
UI.tab = 'ov';
UI.npcSubTab = 'CORE';
const npcHtml = UI.rNpc();
assert(npcHtml.includes('วิชาสายสนับสนุนและวิชาเสริม'), 'UI.rNpc must render Support & Auxiliary Arts card');

UI.sheet = 'sect';
UI.tab = 'visuals';
const sectHtml = UI.rSect();
assert(sectHtml.includes('คำสั่งฉุกเฉินวิชาสายสนับสนุน'), 'UI.rSect must render Emergency Sect Support controls');

// Verify Save/Load round-trip preserves supportState
const savedJson = SIM.serialize(W);
const loadedW = SIM.deserialize(savedJson);
assert.strictEqual(loadedW.byId[master.id].supportState.posture, 'SOUL_MELODY_HARMONY', 'SIM.deserialize must preserve supportState.posture');

console.log('--- Patch v5.7.0 Support & Auxiliary Arts Overhaul (5 Pillars) Suite: ALL PASSED ---');
