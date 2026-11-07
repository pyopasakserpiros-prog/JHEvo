'use strict';
const assert = require('assert');
const path = require('path');
const G = require('./load.js');

G.document = {
  createElement() {
    return {
      className: '',
      textContent: '',
      dataset: {},
      style: {},
      remove() {}
    };
  },
  getElementById() {
    return {
      querySelector() { return null; },
      querySelectorAll() { return []; },
      appendChild() {},
      removeChild() {},
      children: [],
      style: {},
      classList: { add() {}, remove() {}, toggle() {} }
    };
  },
  querySelector() { return null; },
  querySelectorAll() { return []; }
};
global.document = G.document;

require('../js/ui.js');
const { SIM, UI, HC, CULT } = G;

console.log('--- Testing Tracked NPC Feature ---');

// 1. SIM.create initialization
const W = SIM.create('test-seed-tracking', { masterIdx: 0 });
assert(Array.isArray(W.sect.trackedNpcIds), 'W.sect.trackedNpcIds should be initialized as an Array');
assert.strictEqual(W.sect.trackedNpcIds.length, 0, 'trackedNpcIds should start empty');

// 2. UI helpers & toggling
assert(W.npcs.length > 0, 'NPCs should exist');
const testNpc = W.npcs[0];
assert.strictEqual(UI.isTrackedNpc(W, testNpc.id), false, 'Initially not tracked');

const res1 = UI.toggleTrackNpc(W, testNpc.id);
assert.strictEqual(res1, true, 'toggleTrackNpc should return true when added');
assert.strictEqual(UI.isTrackedNpc(W, testNpc.id), true, 'Should be tracked after toggle');
assert.deepStrictEqual(W.sect.trackedNpcIds, [testNpc.id], 'trackedNpcIds should contain testNpc.id');

// 3. Save / Load persistence
const serialized = SIM.serialize(W);
const loadedW = SIM.deserialize(serialized);
assert(Array.isArray(loadedW.sect.trackedNpcIds), 'loadedW.sect.trackedNpcIds should be an array');
assert.deepStrictEqual(loadedW.sect.trackedNpcIds, [testNpc.id], 'loadedW should preserve trackedNpcIds');
assert.strictEqual(UI.isTrackedNpc(loadedW, testNpc.id), true, 'UI.isTrackedNpc should be true on loadedW');

// 4. Test toggle off
const res2 = UI.toggleTrackNpc(W, testNpc.id);
assert.strictEqual(res2, false, 'toggleTrackNpc should return false when removed');
assert.strictEqual(UI.isTrackedNpc(W, testNpc.id), false, 'Should be false after untracking');
assert.strictEqual(W.sect.trackedNpcIds.length, 0, 'trackedNpcIds should be empty');

// Re-track for UI tests
UI.toggleTrackNpc(W, testNpc.id);
UI.G = { W, R: { cam: { z: 1 } }, opts: {}, speed: 1 };

// 5. Test UI.rPeople
UI.tab = 'tracked';
const peopleHtml = UI.rPeople();
assert(peopleHtml.includes(HC.fullName(testNpc)), 'rPeople should include tracked NPC name');
assert(peopleHtml.includes('⭐ ติดตาม'), 'rPeople should include tracked badge');

// 6. Test UI.rMenu tab === 'tracked'
UI.tab = 'tracked';
const menuHtml = UI.rMenu();
assert(menuHtml.includes('ตัวละครที่กำลังติดตาม'), 'rMenu should show tracked disciples title');
assert(menuHtml.includes(HC.fullName(testNpc)), 'rMenu should display the tracked disciple');
assert(menuHtml.includes('untrack-npc'), 'rMenu should offer untrack button');
assert(menuHtml.includes('goto-npc'), 'rMenu should offer camera follow button');

// 7. Test UI.rLog with tracked filter
W.log('breakthrough', testNpc.h.name.given + ' ทะลวงขั้นลมปราณสำเร็จ!', [testNpc.id]);
if (W.npcs.length > 1) {
  const otherNpc = W.npcs[1];
  W.log('relation', otherNpc.h.name.given + ' สนทนากับสหาย', [otherNpc.id]);
}

UI.logFilters = new Set(['tracked']);
UI.tab = 'tracked';
const logHtml = UI.rLog();
assert(logHtml.includes('บันทึกเฉพาะตัวละครที่ติดตาม'), 'rLog should show tracked banner');
assert(logHtml.includes('ทะลวงขั้นลมปราณสำเร็จ'), 'rLog should include the event of the tracked disciple');
if (W.npcs.length > 1) {
  const otherNpc = W.npcs[1];
  assert(!logHtml.includes(otherNpc.h.name.given + ' สนทนากับสหาย'), 'rLog should filter out non-tracked events');
}

// 8. Test UI.rNpc
UI.npcId = testNpc.id;
UI.tab = 'ov';
const npcHtml = UI.rNpc();
assert(npcHtml.includes('⭐ เลิกติดตาม'), 'rNpc should show unfollow button for tracked NPC');
assert(npcHtml.includes('⭐ กำลังติดตาม'), 'rNpc should show tracked chip for tracked NPC');

console.log('✅ ALL TRACKED NPC TESTS PASSED SUCCESSFULLY!');
