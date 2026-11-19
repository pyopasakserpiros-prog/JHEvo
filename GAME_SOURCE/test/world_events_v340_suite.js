'use strict';
const assert = require('assert');
const G = require('./load.js');
const { SIM, ECO, HC, CULT, EXPED } = G;

console.log('=== Running JS2 v3.4.0 External World Events & Living Lore Cross-Links Suite ===');

// 1. Version, Schema & Catalog Integrity
assert.strictEqual(SIM.PATCH_VERSION, '3.8.2', 'PATCH_VERSION must be 3.4.0');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '3.8.2-chaos-era-lore-archive', 'SAVE_SCHEMA_VERSION must be 3.4.0-world-events');
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'human_core.js fingerprint must remain locked');

const EWE = EXPED.EXTERNAL_WORLD_EVENTS;
assert(EWE && EWE.VERSION === '3.4.0-world-events', 'EXPED.EXTERNAL_WORLD_EVENTS must be registered');
assert.strictEqual(Object.keys(EWE.CATEGORIES).length, 10, 'Must define all 10 external world event categories');
assert.strictEqual(EWE.CATALOG.length, 40, 'Must define all 40 external world events');

const seenIds = new Set();
const seenNos = new Set();
for (const ev of EWE.CATALOG) {
  assert(!seenIds.has(ev.id), `Duplicate event id: ${ev.id}`);
  assert(!seenNos.has(ev.no), `Duplicate event no: ${ev.no}`);
  seenIds.add(ev.id);
  seenNos.add(ev.no);
  assert(EWE.CATEGORIES[ev.category], `Invalid category on ${ev.id}`);
  assert(ev.nameTh && ev.loreFigureTh, `Missing nameTh/loreFigureTh on ${ev.id}`);
  assert(Array.isArray(ev.outcomes) && ev.outcomes.length === 4, `Event ${ev.id} must have 4 outcomes`);
  assert(ECO.matById[ev.rewardMatId], `Event ${ev.id} references unregistered rewardMatId: ${ev.rewardMatId}`);
}
console.log('  PASS: All 40 external world events across 10 categories verified with valid ECO.matById rewards');

// 2. Deterministic Spawning & Autonomous NPC Resolution (Personality + Path + STORY-SYNC-10)
const W = SIM.create('v340-world-events-seed', { masterIdx: 0 });
const rngBefore = JSON.stringify(W.rng);
const spawned = EWE.spawnDeterministicEvent(W, { force: true, eventId: 'EXT_EVT_01_BLACK_CAVALRY', quiet: true });
assert(spawned && spawned.id === 'EXT_EVT_01_BLACK_CAVALRY', 'Event 1 must spawn cleanly');
assert.strictEqual(JSON.stringify(W.rng), rngBefore, 'Deterministic spawning must consume zero W.rng');

// Contrasting NPCs choose contrasting autonomous outcomes
const righteous = W.npcs[0];
righteous.cult = { path: 'BUDDHA_DHARMA', stage: 5, sub: 'BUDDHA_ZEN', techs: [] };
righteous.h.values.morality = 88;
righteous.h.personality.ambition = 20;
HC.bump(righteous);
const outR = EWE.chooseAutonomousOutcome(W, righteous, EWE.BY_ID['EXT_EVT_03_ENEMY_SKY_ARK']);
assert.strictEqual(outR.key, 'RIGHTEOUS', 'Righteous Buddha cultivator must choose RIGHTEOUS outcome');

const darkAmb = W.npcs[1];
darkAmb.cult = { path: 'DEMON', stage: 5, sub: 'DEMON_BLOOD_BLADE', techs: [] };
darkAmb.h.values.morality = 20;
darkAmb.h.personality.ambition = 85;
HC.bump(darkAmb);
const outD = EWE.chooseAutonomousOutcome(W, darkAmb, EWE.BY_ID['EXT_EVT_02_CURSED_GOLD_VAULT']);
assert.strictEqual(outD.key, 'AMBITIOUS', 'Ambitious Demon cultivator must choose AMBITIOUS outcome');

// STORY-SYNC-10 check on Event 25: DIVINE_CHANNELER chooses AMBITIOUS strike, while mortal GOD does not
const divChan = W.npcs[2];
divChan.cult = { path: 'DIVINE_CHANNELER', stage: 5, sub: 'DEFAULT', techs: [] };
const out25Div = EWE.chooseAutonomousOutcome(W, divChan, EWE.BY_ID['EXT_EVT_25_FALLEN_UPPER_ENVOY']);
assert.strictEqual(out25Div.key, 'AMBITIOUS', 'STORY-SYNC-10: DIVINE_CHANNELER must trigger celestial mandate strike on Event 25');

// Resolve Event 1 and verify idempotency, Living Lore cross-link, and material award
const beforeMat = ECO.count(W, 'MAT_ORE_METEOR_IRON_5');
const res1 = EWE.resolveEventAutonomously(W, righteous, 'EXT_EVT_01_BLACK_CAVALRY', { quiet: true });
assert.strictEqual(res1.ok, true, 'First resolution must succeed');
assert(ECO.count(W, 'MAT_ORE_METEOR_IRON_5') > beforeMat, 'Material reward must be added to sect stock');
assert(res1.entry.loreFactId && W.world.livingLore.discoveredFacts[res1.entry.loreFactId], 'Resolution must cross-link into v3.1.0 Living Lore discoveredFacts');
const dupRes = EWE.resolveEventAutonomously(W, righteous, 'EXT_EVT_01_BLACK_CAVALRY', { quiet: true });
assert.strictEqual(dupRes.ok, false, 'Duplicate resolution within cooldown must be blocked');
console.log('  PASS: Autonomous outcome choice, STORY-SYNC-10, Living Lore cross-link, and idempotency verified');

// 3. Zero-Mutation / Zero-RNG Peek Summary & Save/Load Round-Trip
const snapBeforePeek = SIM.serialize(W);
const sum = EWE.peekSummary(W);
assert.strictEqual(sum.resolvedCount, 1);
assert(sum.recentTh.includes('สุสานทหารม้าเกราะดำ'), 'peekSummary must reflect latest resolution');
assert.strictEqual(SIM.serialize(W), snapBeforePeek, 'peekSummary must not mutate world state');

const loadedW = SIM.deserialize(snapBeforePeek);
assert.strictEqual(EWE.peekSummary(loadedW).resolvedCount, 1, 'Save/load must preserve externalWorldEvents');

// Verify backward compatibility with v3.3.0 save
const v330Save = JSON.parse(snapBeforePeek);
v330Save.schemaVersion = '3.3.0-tactical-sixpaths';
v330Save.patchVersion = '3.3.0';
const loadedV330 = SIM.deserialize(JSON.stringify(v330Save));
assert(loadedV330 && loadedV330.npcs.length > 0, 'Must cleanly load v3.3.0 saves');

console.log('  PASS: Zero-mutation peekSummary, save/load round-trip, and v3.3.0 compatibility verified');
console.log('=== ALL JS2 v3.4.0 EXTERNAL WORLD EVENTS TESTS PASSED! ===');
