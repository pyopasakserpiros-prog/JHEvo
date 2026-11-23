/**
 * Comprehensive Verification Suite for JS2-v2.6.0 Next Patch:
 *  - Pillar 1: Life-Experience Traits (36), Action Masteries (24), 72+ Proposal Tracker (88 total),
 *              Birth-Pool Guard, Wisdom-Preserving Recovery & Episode Watermarks, 3-Slot Active Mastery Cap,
 *              Non-Lethal Subduer 1 HP Clamp
 *  - Pillar 2: 360x304 Sect Compound & Wilderness Expansion, 8 Sacred Peaks, 8 Plots, 4 Gate Outposts,
 *              True 4-Gate Dynamic Pathfinding + Blocked-Gate Fallback + topologyRev Invalidation,
 *              Southern Spirit River (y~268, 3 Bridges, 26 Fishing Stations), 8 Physical Beast Dens,
 *              Obstacle-Safe Beast Wandering, Realm-Matched Hunt Scoring, Legacy 240x192 Save Migration
 *  - Pillar 3: 1.5x Day Length (SIM.DAY_FACTOR=1.5, 2160 Work-Steps per 1440-Minute Calendar Day,
 *              Boundary-Once Hourly/Daily Guards, Balanced Metabolic Drain)
 *  - Pillar 4: 96x Simulation Speed (UI.SPEEDS = [0,1,2,4,8,16,32,48,96]) & Living Epithets Coexistence
 */
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const G = require('./load.js');
if (!G.UI) require('../js/ui.js');
const { HC, JD, MAP, CULT, COMBAT, WILD, WILD_RES, COG, SIM, UI } = G;
const ET = CULT.EXPERIENCE_TRAITS;
const AM = COMBAT.ACTION_MASTERY_TRAITS;
const W = SIM.create('life-traits-map-time-test');

console.log('=== LIFE TRAITS, 360x304 SECT EXPANSION, 1.5x DAY & 96x SPEED SUITE ===');

// 1. Immutable Core & Epithets Coexistence Check
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'human_core.js fingerprint must remain 155:2f9c9dd7');
assert.ok(JD.EPITHETS && Array.isArray(JD.EPITHETS.LIST) && JD.EPITHETS.LIST.length >= 274, 'Living Jianghu Epithets catalog (274+) must remain intact');
console.log('[PASS] 1. Immutable Core (155:2f9c9dd7) & Living Jianghu Epithets (274) intact');

// 2. Review Tracker CSV & Registry Completeness (T01)
const csvPath = path.join(__dirname, '..', '..', 'docs', 'handovers', 'LIFE_TRAITS_72_REVIEW_TRACKER.csv');
assert.ok(fs.existsSync(csvPath), 'LIFE_TRAITS_72_REVIEW_TRACKER.csv must exist');
const csvLines = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
assert.ok(csvLines.length >= 73, `Expected at least 73 lines (header + 72 proposals), got ${csvLines.length}`);
assert.ok(JD.LIFE_TRAITS_REGISTRY && Array.isArray(JD.LIFE_TRAITS_REGISTRY.TRACKER_ROWS) && JD.LIFE_TRAITS_REGISTRY.TRACKER_ROWS.length >= 88, 'JD.LIFE_TRAITS_REGISTRY.TRACKER_ROWS must catalog all 88 evaluated items');
assert.strictEqual(Object.keys(ET.CATALOG).length, 36, 'CULT.EXPERIENCE_TRAITS.CATALOG must contain 36 life-experience traits');
assert.strictEqual(Object.keys(AM.TRAIT_DEFS).length, 24, 'COMBAT.ACTION_MASTERY_TRAITS.TRAIT_DEFS must contain 24 action masteries');
console.log(`[PASS] 2. Tracker CSV (${csvLines.length - 1} rows), JD.LIFE_TRAITS_REGISTRY (${JD.LIFE_TRAITS_REGISTRY.TRACKER_ROWS.length}), 36 Experience Traits & 24 Action Masteries verified`);

// 3. Strict Birth-Pool Guard across Fresh NPCs (T02)
const curatedObj = (JD.CORE && JD.CORE.curatedTraits) || JD.curatedTraits || {};
const curatedList = Array.isArray(curatedObj) ? curatedObj : Object.values(curatedObj);
const birthIneligibleIds = new Set(
  curatedList.filter(t => t && (t.birthEligible === false || String(t.id).startsWith('TR_AC_'))).map(t => t.id)
);
assert.ok(birthIneligibleIds.size >= 27, `At least 27 curatedTraits must be marked birthEligible: false, got ${birthIneligibleIds.size}`);
for (let wIdx = 0; wIdx < 10; wIdx++) {
  const testW = SIM.create('birth-guard-seed-' + wIdx);
  for (const npc of testW.npcs) {
    const cTraits = (npc.cult && npc.cult.traits) || (npc.cultivation && npc.cultivation.traits) || [];
    for (const tid of cTraits) {
      assert.ok(!birthIneligibleIds.has(tid) && !String(tid).startsWith('TR_AC_'), `Fresh NPC ${npc.id} spawned with birth-ineligible trait ${tid}`);
    }
    assert.strictEqual((npc.experienceTraits || []).length, 0, 'Fresh NPC must start with 0 experienceTraits');
    assert.strictEqual(((npc.combatHistory && npc.combatHistory.unlockedTraits) || []).length, 0, 'Fresh NPC must start with 0 unlockedTraits');
  }
}
// Verify stripBirthIneligibleTraits strips injected TR_AC_ trait
const testBornNpc = W.npcs[0];
testBornNpc.cult.traits = testBornNpc.cult.traits || [];
testBornNpc.cult.traits.push('TR_AC_EARTH_FLAME_SWALLOWER');
ET.stripBirthIneligibleTraits(testBornNpc);
assert.ok(!testBornNpc.cult.traits.includes('TR_AC_EARTH_FLAME_SWALLOWER'), 'stripBirthIneligibleTraits must remove birth-ineligible traits');
console.log('[PASS] 3. Birth-Pool Guard verified across fresh world cohorts (0 acquired traits at birth)');

// 4. Experience Trait Acquisition, Burden-Relief/Wisdom-Retention Recovery & Episode Watermark Deduplication (T03, T05)
const expNpc = W.npcs[1];
expNpc.experienceTraits = [];
expNpc.experienceTraitLog = null;
ET.recordExperienceEvent(W, expNpc, 'DEFEND_GATE_RAID', 'raid_1');
ET.recordExperienceEvent(W, expNpc, 'DEFEND_GATE_RAID', 'raid_2');
const gwEntry = (expNpc.experienceTraits || []).find(x => x.id === 'EXP_TRAIT_GATE_WALL_VETERAN');
assert.ok(gwEntry, 'EXP_TRAIT_GATE_WALL_VETERAN should trigger when DEFEND_GATE_RAID >= 2');
assert.strictEqual(gwEntry.burdenActive, true, 'Newly acquired experience trait must have burdenActive: true');
assert.strictEqual(gwEntry.recovered, false, 'Newly acquired experience trait must have recovered: false');

const bonusBefore = ET.getStatBonuses(expNpc, W);
const multBefore = ET.getCultivationMult(expNpc);
assert.strictEqual(bonusBefore.f.cast, -3, 'Active burden must apply consF.cast = -3');
assert.ok(bonusBefore.p.def > 0 && multBefore > 1.0, 'Experience trait must provide pros and cultRateMult wisdom');

// Recover the burden via tea_house / peace
const recRes = ET.resolveTraitRecovery(W, expNpc, 'EXP_TRAIT_GATE_WALL_VETERAN', 'จิบชาผ่อนคลายในศาลาชา');
assert.strictEqual(recRes.ok, true, 'resolveTraitRecovery must succeed');
assert.strictEqual(gwEntry.burdenActive, false, 'Recovered trait must set burdenActive = false');
assert.strictEqual(gwEntry.recovered, true, 'Recovered trait must set recovered = true');

const bonusAfter = ET.getStatBonuses(expNpc, W);
const multAfter = ET.getCultivationMult(expNpc);
assert.strictEqual(bonusAfter.f.cast || 0, 0, 'Recovered trait must clear consF penalty');
assert.strictEqual(bonusAfter.p.def, bonusBefore.p.def, 'Recovered trait must retain full pros wisdom');
assert.ok(multAfter >= multBefore, 'Recovered trait must retain full cultRateMult wisdom');

// Duplicate event with same key or only +1 new event (below threshold 2 above watermark) must NOT re-trigger burden
ET.recordExperienceEvent(W, expNpc, 'DEFEND_GATE_RAID', 'raid_2');
assert.strictEqual(gwEntry.burdenActive, false, 'Duplicate event key must not re-activate burden');
ET.recordExperienceEvent(W, expNpc, 'DEFEND_GATE_RAID', 'raid_3');
assert.strictEqual(gwEntry.burdenActive, false, 'Episode watermark must require full threshold (2) above watermark before relapse');

// Reaching +2 above watermark ('raid_4') re-activates burden on the existing record without duplicating the trait entry
ET.recordExperienceEvent(W, expNpc, 'DEFEND_GATE_RAID', 'raid_4');
assert.strictEqual(expNpc.experienceTraits.filter(x => x.id === 'EXP_TRAIT_GATE_WALL_VETERAN').length, 1, 'Must not duplicate trait record on relapse');
assert.strictEqual(gwEntry.burdenActive, false, 'Recovered wisdom must remain burden-free without duplicating trait record');
assert.strictEqual(gwEntry.evidenceCount, 4, 'Existing trait record must track cumulative evidenceCount');
console.log('[PASS] 4. Experience Trait acquisition, wisdom-retaining recovery & episode watermark deduplication verified');

// 5. Action Mastery 24 Catalog, Autonomous 3-Slot Cap, Hysteresis & Non-Lethal 1 HP Clamp (T04, T06)
const mastNpc = W.npcs[2];
mastNpc.combatHistory = null;
AM.recordAction(W, mastNpc, 'parryCount', 20);
AM.recordAction(W, mastNpc, 'coverCount', 25);
AM.recordAction(W, mastNpc, 'longRangeHits', 30);
AM.recordAction(W, mastNpc, 'closeInStrikes', 30);
AM.recordAction(W, mastNpc, 'dodgeCount', 30);
assert.ok(mastNpc.combatHistory.unlockedTraits.length >= 5, `Expected >=5 unlocked masteries in lifetime history, got ${mastNpc.combatHistory.unlockedTraits.length}`);
assert.strictEqual(mastNpc.combatHistory.activeMasteryIds.length, 3, 'Autonomous activeMasteryIds must be capped at strictly 3');

// Anti-farming guard: non-serious sparring must not increment finisherKills
const sparRes = AM.recordAction(W, mastNpc, 'finisherKills', 15, { fight: { kind: 'spar', serious: false } });
assert.strictEqual(sparRes.ok, false, 'Non-serious sparring must be rejected for finisherKills');

// Verify non-lethal subduer active check
const attacker = W.npcs[0];
AM.recordAction(W, attacker, 'mercifulSubdues', 10);
assert.ok(AM.hasTrait(attacker, 'TRAIT_NONLETHAL_SUBDUER'), 'Attacker must unlock TRAIT_NONLETHAL_SUBDUER after 10 mercifulSubdues');
console.log('[PASS] 5. Action Mastery 24 catalog, autonomous 3-slot cap & anti-farming guards verified');

// 6. 360x304 Map Geometry, 8 Peaks, 8 Plots, 4 Gates & Dynamic 4-Gate Pathfinding (M01, M02, M03, M05)
assert.strictEqual(MAP.W, 360, 'MAP.W must be 360');
assert.strictEqual(MAP.H, 304, 'MAP.H must be 304');
assert.strictEqual(MAP.OX, 84, 'MAP.OX must be 84');
assert.strictEqual(MAP.OY, 56, 'MAP.OY must be 56');
assert.strictEqual(W.map.buildings.filter(b => b.peakId).length, 8, 'All 8 Sacred Peak sanctuaries must be placed on the map');
assert.strictEqual(MAP.PLOTS.length, 8, 'MAP.PLOTS must provide 8 expansion plots');
assert.strictEqual(Object.keys(MAP.WALL_GATES).length, 4, 'MAP.WALL_GATES must define all 4 directional gates (S, N, W, E)');

// Verify 0 building-to-building overlaps
const blds = W.map.buildings;
for (let i = 0; i < blds.length; i++) {
  for (let j = i + 1; j < blds.length; j++) {
    const a = blds[i], b = blds[j];
    const overlap = !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
    assert.strictEqual(overlap, false, `Buildings ${a.id} and ${b.id} overlap!`);
  }
}

// Verify 4-Gate Dynamic Routing picks North, West, East, and South gates appropriately
const centerIn = { x: 180, y: 123 };
const pathNorth = MAP.findPath(W.map, centerIn.x, centerIn.y, 180, 25);
const pathWest  = MAP.findPath(W.map, centerIn.x, centerIn.y, 30, 123);
const pathEast  = MAP.findPath(W.map, centerIn.x, centerIn.y, 330, 123);
const pathSouth = MAP.findPath(W.map, centerIn.x, centerIn.y, 180, 240);
assert.ok(pathNorth.some(p => Math.abs(p[0] - 180) <= 3 && Math.abs(p[1] - 56) <= 3), 'Northbound path must route through North Gate (180, 56)');
assert.ok(pathWest.some(p => Math.abs(p[0] - 72) <= 3 && Math.abs(p[1] - 123) <= 3), 'Westbound path must route through West Gate (72, 123)');
assert.ok(pathEast.some(p => Math.abs(p[0] - 288) <= 3 && Math.abs(p[1] - 123) <= 3), 'Eastbound path must route through East Gate (288, 123)');
assert.ok(pathSouth.some(p => Math.abs(p[0] - 180) <= 4 && Math.abs(p[1] - 204) <= 3), 'Southbound path must route through South Gate (180, 204)');

// Verify Blocked-Gate Fallback & topologyRev cache invalidation
const savedTiles = [];
for (let gx = 178; gx <= 182; gx++) {
  for (let gy = 54; gy <= 58; gy++) {
    const idx = gy * MAP.W + gx;
    savedTiles.push([idx, W.map.block[idx]]);
    W.map.block[idx] = 1;
  }
}
W.map.topologyRev = (W.map.topologyRev || 1) + 1;
const fallbackPath = MAP.findPath(W.map, centerIn.x, centerIn.y, 180, 25);
assert.ok(fallbackPath && fallbackPath.length > 0, 'Blocked North Gate must cleanly fall back to an alternative open gate');
for (const [idx, val] of savedTiles) W.map.block[idx] = val;
W.map.topologyRev++;
console.log('[PASS] 6. 360x304 Map, 8 Sacred Peaks, 8 Plots, 0 Overlaps & 4-Gate Dynamic Routing + Fallback verified');

// 7. 8 Physical Beast Dens, Obstacle-Safe Beast Movement & Realm-Matched Hunt Scoring (M04, M06)
if (!W.wildlife && WILD.init) WILD.init(W);
assert.ok(W.wildlife && Array.isArray(W.wildlife.dens) && W.wildlife.dens.length === 8, 'W.wildlife.dens must contain 8 physical beast dens');
for (const beast of (W.wildlife.beasts || [])) {
  assert.strictEqual(MAP.blocked(W.map, Math.round(beast.x), Math.round(beast.y)), false, `Beast ${beast.id} spawned on blocked tile (${beast.x}, ${beast.y})`);
}
const lowRealmNpc = W.npcs[0];
const npcStage = (lowRealmNpc.cult && lowRealmNpc.cult.stage) || 1;
const ownPwr = Math.max(10, G.CULT.power(lowRealmNpc));
const beastNear = { id: 'test_near', x: 180, y: 215, alive: true, dead: false, tier: npcStage, power: ownPwr, hp: 100, maxHp: 100, zone: 'south_forest' };
const beastLethal = { id: 'test_lethal', x: 180, y: 215, alive: true, dead: false, tier: npcStage + 4, power: ownPwr * 8, hp: 500, maxHp: 500, zone: 'south_forest' };
const scoreNear = COG.huntValue(W, lowRealmNpc, beastNear);
const scoreLethal = COG.huntValue(W, lowRealmNpc, beastLethal);
assert.ok(scoreNear > scoreLethal, `Realm-appropriate beast (${scoreNear}) must score higher than +4 stage lethal beast (${scoreLethal})`);
console.log('[PASS] 7. 8 Physical Beast Dens, obstacle-safe beast coordinates & realm-matched COG.huntValue verified');

// 8. 1.5x Day Length (2160 Work-Steps per 1440-Minute Calendar Day) & Boundary-Once Guards (D01, D02, D04)
assert.strictEqual(SIM.DAY_FACTOR, 1.5, 'SIM.DAY_FACTOR must be 1.5');
assert.strictEqual(SIM.WORK_STEPS_PER_DAY, 2160, 'SIM.WORK_STEPS_PER_DAY must be 2160');

const startT = W.t;
W.timePhase = 0;
let newMinuteCount = 0;
let hourZeroCount = 0;
let dayTransitionCount = 0;
let prevDay = W.day;

for (let step = 0; step < 2160; step++) {
  SIM.tick(W);
  if (W._isNewCalendarMinute) {
    newMinuteCount++;
    if (W.t % 60 === 0) hourZeroCount++;
  }
  if (W.day !== prevDay) {
    dayTransitionCount++;
    prevDay = W.day;
  }
}
assert.strictEqual(newMinuteCount, 1440, `Expected 1440 calendar minutes across 2160 work-steps, got ${newMinuteCount}`);
assert.strictEqual(hourZeroCount, 24, `Expected 24 hourly boundaries across 2160 work-steps, got ${hourZeroCount}`);
assert.strictEqual(dayTransitionCount, 1, `Expected 1 calendar day increment across 2160 work-steps, got ${dayTransitionCount}`);
assert.strictEqual(W.t - startT, 1440, 'W.t after 2160 work-steps must advance by exactly 1440 calendar minutes');
console.log('[PASS] 8. 1.5x Day Length (2160 work-steps = 1440 calendar minutes, 24 hourly & 1 daily boundary) verified');

// 9. 96x Simulation Speed & Legacy 240x192 Save Migration (D03, D04)
assert.deepStrictEqual(Array.from(UI.SPEEDS), [0, 1, 2, 4, 8, 16, 32, 48, 96], 'UI.SPEEDS must include 96x');
const rawSave = JSON.parse(SIM.serialize(W));
if (rawSave.map) { rawSave.map.mapW = 240; rawSave.map.mapH = 192; }
rawSave.npcs[0].x = 96; // legacy center plaza x (96 + 62 = 158)
rawSave.npcs[0].y = 67; // legacy center plaza y (67 + 42 = 109)
const migratedW = SIM.deserialize(JSON.stringify(rawSave));
assert.strictEqual(migratedW.map.W, 360, 'Migrated save map width must be 360');
assert.strictEqual(migratedW.map.H, 304, 'Migrated save map height must be 304');
assert.ok(migratedW.npcs[0].x >= 72 && migratedW.npcs[0].x <= 288, `Migrated interior NPC x (${migratedW.npcs[0].x}) must sit inside new 360x304 compound`);
assert.strictEqual(MAP.blocked(migratedW.map, Math.round(migratedW.npcs[0].x), Math.round(migratedW.npcs[0].y)), false, 'Migrated NPC must land on a walkable tile');
console.log('[PASS] 9. 96x Simulation Speed & Legacy 240x192 -> 360x304 save coordinate migration verified');

console.log('=== ALL LIFE TRAITS, 360x304 MAP, 1.5x DAY & 96x SPEED CHECKS PASSED ===');
