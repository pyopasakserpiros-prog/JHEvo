/* ===== PATCH v5.4.0 REGRESSION SUITE: QINGGONG & AERIAL LOCOMOTION OVERHAUL ===== */
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

const { SIM, CULT, AI, EXPED, Render, UI, MAP, HC } = G;

console.log('--- Running Patch v5.4.0 Qinggong Locomotion, Sword Flight & Celestial Levitation Suite ---');

// 0. Verify human_core.js SHA-256 & Patch Version
const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
assert.strictEqual(
  hcSha,
  'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542',
  'human_core.js SHA-256 must remain 100% byte-identical'
);
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
assert.ok(['2.5.0', '2.6.0'].includes(SIM.PATCH_VERSION), 'SIM.PATCH_VERSION must be 5.4.0');
assert.ok(['2.4.0-tactical-composable-grand-dao', '2.6.0-living-chronicle-and-reporting'].includes(SIM.SAVE_SCHEMA_VERSION), 'SIM.SAVE_SCHEMA_VERSION must match v5.4.0');
assert(SIM.SUPPORTED_PATCHES.includes('5.8.0'), 'SIM.SUPPORTED_PATCHES must include 5.4.0');

// 2. Verify CULT.QINGGONG Modes & 6 Signature Manuals + Existing Movement Art Mapping
assert(CULT.QINGGONG && CULT.QINGGONG.MODES, 'CULT.QINGGONG.MODES must exist');
const expectedModes = [
  'MORTAL_WALK',
  'SWIFT_STRIDE',
  'WATER_LOTUS_DRIFT',
  'LEAP_BOUND',
  'SHADOW_BLINK',
  'SWORD_FLIGHT',
  'CELESTIAL_LEVITATION'
];
expectedModes.forEach(mId => {
  const m = CULT.QINGGONG.MODES[mId];
  assert(m && m.nameTh && m.prosTh && m.consTh, `Qinggong mode ${mId} must have Thai metadata`);
});

// Verify 6 new signature manuals are registered in CULT.tech and JD.TECH.techniques without breaking 655 martial techniques
assert.strictEqual(G.JD.MARTIAL.techniques.length, 655, 'JD.MARTIAL.techniques count must remain 655');
const sigManualIds = [
  'QG_SWIFT_GALE_STRIDE_T1',
  'QG_CLOUD_DRAGON_LEAP_T2',
  'QG_JADE_LOTUS_WATER_DRIFT_T3',
  'QG_PHANTOM_STAR_BLINK_T4',
  'QG_IMPERIAL_SWORD_FLIGHT_T5',
  'QG_IMMORTAL_VOID_LEVITATION_T7'
];
sigManualIds.forEach(id => {
  const t = CULT.tech(id);
  assert(t && t.qinggongMode && t.qinggongSpec, `Signature manual ${id} must be registered with qinggongSpec`);
});

// Verify existing canonical lightness arts map to authentic Qinggong modes
assert.strictEqual(CULT.tech('ART190_XIAN_045').qinggongMode, 'SWORD_FLIGHT', 'ART190_XIAN_045 must map to SWORD_FLIGHT');
assert.strictEqual(CULT.tech('LEG_LIGHT_LINGBO_STEP').qinggongMode, 'WATER_LOTUS_DRIFT', 'LEG_LIGHT_LINGBO_STEP must map to WATER_LOTUS_DRIFT');
assert.strictEqual(CULT.tech('LEG_LIGHT_MOON_BAT_SHADOW').qinggongMode, 'SHADOW_BLINK', 'LEG_LIGHT_MOON_BAT_SHADOW must map to SHADOW_BLINK');
assert.strictEqual(CULT.tech('LEG_LIGHT_KUNPENG_ASTRAL_WINGS').qinggongMode, 'CELESTIAL_LEVITATION', 'LEG_LIGHT_KUNPENG_ASTRAL_WINGS must map to CELESTIAL_LEVITATION');

// 3. Verify Sword Flight vs Celestial Levitation Tradeoffs & Qi Consumption
const W = SIM.create('v540-qinggong-test-seed', { masterIdx: 0 });
W.weather = { kind: 'clear', t: 100 };
const master = W.byId[W.sect.masterId];
const elder = W.npcs.find(n => n.id !== master.id && !n.dead && n.cult);

// Configure elder at Stage 4 with Sword Flight vs Master at Stage 7 with Celestial Levitation
elder.cult.path = 'XIAN';
elder.cult.sub = 'SWORD_FLIGHT';
elder.cult.stage = 4;
if (!elder.cult.techs.includes('QG_IMPERIAL_SWORD_FLIGHT_T5')) elder.cult.techs.push('QG_IMPERIAL_SWORD_FLIGHT_T5');
elder.equip = elder.equip || {};
elder.equip.WEAPON = { id: 'EQ_TEST_SWORD', nameTh: 'กระบี่ชิงเฟิง', slot: 'WEAPON', tier: 3 };
elder._qgUnlockCache = null;
const elderSt = CULT.QINGGONG.ensureState(elder);
elderSt.preferredMode = 'SWORD_FLIGHT';
elder.h.state.qi = CULT.qiMax(elder);
elder.h.state.energy = 80;

const sfResolved = CULT.QINGGONG.resolveNpcMode(W, elder);
assert.strictEqual(sfResolved.modeId, 'SWORD_FLIGHT', 'Stage 4 Sword cultivator should resolve SWORD_FLIGHT');
assert(sfResolved.airborne === true, 'SWORD_FLIGHT must be airborne');
assert(sfResolved.speedMult >= 2.38, 'Equipped SWORD_FLIGHT should have full speed multiplier >= 2.38');
assert.strictEqual(sfResolved.qiCostPerTick, 0.75, 'SWORD_FLIGHT base Qi cost per tick is 0.75');

// Test Sword Flight Tradeoff 1: Without weapon, non-sword cultivator loses speed
elder.cult.path = 'BODY';
elder.cult.sub = 'LIGHTNESS_SHADOW';
elder.equip.WEAPON = null;
elder._qgUnlockCache = null;
const sfNoWeapon = CULT.QINGGONG.resolveNpcMode(W, elder);
assert.strictEqual(sfNoWeapon.weaponPenaltyActive, true, 'SWORD_FLIGHT without weapon on non-sword path must activate weaponPenaltyActive');
assert(sfNoWeapon.speedMult < sfResolved.speedMult, 'Weaponless SWORD_FLIGHT speed must be penalized');

// Restore weapon & test Sword Flight Tradeoff 2: Rain/Storm turbulence penalty and extra Qi drain
elder.equip.WEAPON = { id: 'EQ_TEST_SWORD', nameTh: 'กระบี่ชิงเฟิง', slot: 'WEAPON', tier: 3 };
elder._qgUnlockCache = null;
W.weather = { kind: 'rain', t: 100 };
const sfInRain = CULT.QINGGONG.resolveNpcMode(W, elder);
assert.strictEqual(sfInRain.stormPenaltyActive, true, 'SWORD_FLIGHT must suffer stormPenaltyActive in rain');
assert.strictEqual(sfInRain.qiCostPerTick, 1.00, 'SWORD_FLIGHT Qi drain increases from 0.75 to 1.00 in rain');
assert(sfInRain.speedMult < sfResolved.speedMult, 'SWORD_FLIGHT speed decreases in rain turbulence');

// Configure Master at Stage 7 with Celestial Levitation (เหาะเหินเดินอากาศเซียนอมตะ)
master.cult.stage = 7;
master.equip = master.equip || {};
master.equip.WEAPON = null; // Even without any weapon!
master._qgUnlockCache = null;
const masterSt = CULT.QINGGONG.ensureState(master);
masterSt.preferredMode = 'CELESTIAL_LEVITATION';
master.h.state.qi = CULT.qiMax(master);

const clInRain = CULT.QINGGONG.resolveNpcMode(W, master);
assert.strictEqual(clInRain.modeId, 'CELESTIAL_LEVITATION', 'Stage 7 Master must resolve CELESTIAL_LEVITATION');
assert.strictEqual(clInRain.weaponPenaltyActive, false, 'CELESTIAL_LEVITATION never requires a weapon');
assert.strictEqual(clInRain.stormPenaltyActive, false, 'CELESTIAL_LEVITATION ignores rain/storm penalties');
assert(clInRain.speedMult >= 2.90 && clInRain.speedMult > sfResolved.speedMult, 'CELESTIAL_LEVITATION must be faster than SWORD_FLIGHT');
assert(clInRain.qiCostPerTick < sfResolved.qiCostPerTick, 'CELESTIAL_LEVITATION must consume less Qi than SWORD_FLIGHT (0.35 vs 0.75)');
W.weather = { kind: 'clear', t: 100 };

// 4. Verify Real Sect Map Locomotion: Aerial Direct Pathing, Qi Drain & Low-Qi Forced Landing Fallback
const startQi = elder.h.state.qi;
const startEnergy = elder.h.state.energy;
const okGo = AI.goTo(W, elder, elder.x + 15, elder.y + 8);
assert.strictEqual(okGo, true, 'AI.goTo must succeed for airborne SWORD_FLIGHT');
assert.strictEqual(elder.aerialFlightActive, true, 'AI.goTo must set aerialFlightActive = true when airborne over >= 3.5 tiles');

AI.stepMove(W, elder);
assert(elder.h.state.qi < startQi, 'Moving with SWORD_FLIGHT must deduct real Qi');
assert(elder.h.state.energy < startEnergy, 'Moving with SWORD_FLIGHT must deduct slight focus energy');
assert(elder.qinggongState.totalTilesFlown > 0, 'totalTilesFlown must increase during aerial flight');

// Drain elder Qi below 20% threshold -> must force landing (exhaustedFallback) and replan ground path!
elder.h.state.qi = Math.floor(CULT.qiMax(elder) * 0.05);
const lowQiMode = CULT.QINGGONG.resolveNpcMode(W, elder);
assert.strictEqual(lowQiMode.exhaustedFallback, true, 'Dropping below 20% Qi must trigger exhaustedFallback');
assert.strictEqual(lowQiMode.modeId, 'MORTAL_WALK', 'Exhausted cultivator at 5% Qi must fall back to MORTAL_WALK');
AI.stepMove(W, elder);
assert.strictEqual(elder.aerialFlightActive, false, 'Exhausted flyer must safely land and clear aerialFlightActive');

// Recover Qi above 35% -> must resume SWORD_FLIGHT automatically
elder.h.state.qi = CULT.qiMax(elder);
CULT.QINGGONG.stepQinggongMove(W, elder, 0.5);
const recoveredMode = CULT.QINGGONG.resolveNpcMode(W, elder);
assert.strictEqual(recoveredMode.exhaustedFallback, false, 'Recovering Qi above 35% must clear exhaustedFallback');
assert.strictEqual(recoveredMode.modeId, 'SWORD_FLIGHT', 'Recovered cultivator must resume SWORD_FLIGHT');

// 5. Verify Bounding Leap (LEAP_BOUND) & Shadow Blink (SHADOW_BLINK) Multi-Waypoint Vaulting
const jumper = W.npcs.find(n => n.id !== master.id && n.id !== elder.id && !n.dead && n.cult);
jumper.cult.stage = 3;
if (!jumper.cult.techs.includes('QG_CLOUD_DRAGON_LEAP_T2')) jumper.cult.techs.push('QG_CLOUD_DRAGON_LEAP_T2');
jumper._qgUnlockCache = null;
const jSt = CULT.QINGGONG.ensureState(jumper);
jSt.preferredMode = 'LEAP_BOUND';
jumper.h.state.qi = CULT.qiMax(jumper);
AI.goTo(W, jumper, jumper.x + 10, jumper.y);
if (jumper.path && jumper.path.length >= 4) {
  W.t += 5;
  AI.stepMove(W, jumper);
  assert(jSt.totalLeaps >= 1, 'LEAP_BOUND must execute parabolic multi-waypoint leaps');
}

jSt.preferredMode = 'SHADOW_BLINK';
if (!jumper.cult.techs.includes('QG_PHANTOM_STAR_BLINK_T4')) jumper.cult.techs.push('QG_PHANTOM_STAR_BLINK_T4');
jumper._qgUnlockCache = null;
AI.goTo(W, jumper, jumper.x - 10, jumper.y);
if (jumper.path && jumper.path.length >= 4) {
  W.t += 5;
  AI.stepMove(W, jumper);
  assert(jSt.totalBlinks >= 1, 'SHADOW_BLINK must execute shadow-step blinks across waypoints');
}

// 6. Verify World Map Expedition Integration (EXPED.createParty & EXPED.estimateTravelTime)
const mortalFollower = jumper;
mortalFollower.away = false;
mortalFollower.travel = null;
mortalFollower.expId = null;
mortalFollower.cult.stage = 1;
mortalFollower.cult.techs = [];
mortalFollower.qinggongState = { preferredMode: 'MORTAL_WALK' };
mortalFollower._qgUnlockCache = null;

master.away = false;
master.travel = null;
master.expId = null;

const baseTrip = EXPED.createParty(W, [mortalFollower], { baseDays: 10, useQinggong: false });
const immortalTrip = EXPED.createParty(W, [master], { baseDays: 10, useQinggong: true });
assert(immortalTrip.ok && immortalTrip.qinggongActive, 'Stage 7 Celestial Levitation master must activate qinggongActive on expeditions');
assert(immortalTrip.days < baseTrip.days, `Celestial Levitation must reduce World Map expedition days (${immortalTrip.days} < ${baseTrip.days})`);
assert(immortalTrip.carryCapacity > baseTrip.carryCapacity, 'Celestial Levitation must increase expedition carry capacity');
assert(immortalTrip.hazardReduction > 0, 'Celestial Levitation must reduce expedition travel hazards');

// Water Lotus Drift water-route bonus verification
const waterWalker = elder;
waterWalker.cult.techs.push('QG_JADE_LOTUS_WATER_DRIFT_T3');
waterWalker._qgUnlockCache = null;
waterWalker.qinggongState.preferredMode = 'WATER_LOTUS_DRIFT';
const landEval = CULT.QINGGONG.evaluatePartyExpeditionBonus(W, [waterWalker], { terrain: 'mountain', nameTh: 'ภูผาหิน' });
const waterEval = CULT.QINGGONG.evaluatePartyExpeditionBonus(W, [waterWalker], { terrain: 'water', nameTh: 'ทะเลสาบมังกรหลับ' });
assert(waterEval.durationMultiplier < landEval.durationMultiplier, 'WATER_LOTUS_DRIFT must travel faster on water routes than dry mountain routes');

// 7. Verify Read-Only Canvas Rendering & Save/Load Round-Trip
const mockCanvas = makeMockCanvas(960, 600);
const renderer = Render.create(mockCanvas);
renderer.setWorld(W);
renderer.resize();
AI.goTo(W, master, master.x + 12, master.y + 6);
AI.goTo(W, elder, elder.x - 10, elder.y + 5);

const snapBeforeDraw = SIM.serialize(W);
const rngBeforeDraw = JSON.stringify(W.rng.getState());
renderer.draw(1500);
const snapAfterDraw = SIM.serialize(W);
const rngAfterDraw = JSON.stringify(W.rng.getState());
assert.strictEqual(snapAfterDraw, snapBeforeDraw, 'Render.draw with active Qinggong & Flight must be 100% read-only on SIM.serialize(W)');
assert.strictEqual(rngAfterDraw, rngBeforeDraw, 'Render.draw must never mutate W.rng');

// Verify Character Diorama with poseMode === 'qinggong'
const dioCanvas = makeMockCanvas(220, 136);
const dioOk = Render.characterDiorama(dioCanvas, master, { pose: 'qinggong', timeSec: 2.0 });
assert.strictEqual(dioOk, true, 'Render.characterDiorama must support pose === qinggong');

// Verify UI rendering includes Qinggong & Flight card
UI.G = { W, R: renderer, speed: 1 };
UI.npcId = master.id;
UI.tab = 'ov';
UI.npcSubTab = 'CORE';
const npcHtml = UI.rNpc();
assert(npcHtml.includes('วิชาตัวเบาและการเคลื่อนที่ในสำนัก/ยุทธภพ'), 'UI.rNpc must render the Qinggong & Flight card');
assert(npcHtml.includes('เปรียบเทียบ「ขี่กระบี่บิน'), 'UI.rNpc must render the Sword Flight vs Celestial Levitation comparison');

// Verify Save/Load round-trip preserves qinggongState
const savedJson = SIM.serialize(W);
const loadedW = SIM.deserialize(savedJson);
const loadedMaster = loadedW.byId[master.id];
assert(loadedMaster.qinggongState && loadedMaster.qinggongState.preferredMode === 'CELESTIAL_LEVITATION', 'SIM.deserialize must preserve qinggongState.preferredMode');

console.log('--- Patch v5.4.0 Qinggong Locomotion, Sword Flight & Celestial Levitation Suite: ALL PASSED ---');
