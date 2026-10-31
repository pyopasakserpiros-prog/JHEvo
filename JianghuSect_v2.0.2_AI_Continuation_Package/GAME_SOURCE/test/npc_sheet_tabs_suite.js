'use strict';
const assert = require('assert');
const G = require('./load.js');
G.document = {
  getElementById() { return { querySelector() { return null; }, querySelectorAll() { return []; }, style: {}, classList: { add() {}, remove() {}, toggle() {} } }; },
  querySelector() { return null; },
  querySelectorAll() { return []; }
};
require('../js/ui.js');
const { SIM, UI, CULT, HC, MARTIAL } = G;

function createWorld(seed) {
  return SIM.create(seed || 'npc-tabs-test', { masterIdx: 0 });
}

console.log('--- TEST 1: NPC Sheet tab configuration ---');
{
  const W = createWorld('tab-config-1');
  UI.G = { W, R: { selected: null } };
  const n = W.npcs[0];
  UI.openNpc(n.id);
  assert.strictEqual(UI.sheet, 'npc');
  assert.strictEqual(UI.npcId, n.id);
  assert.strictEqual(UI.tab, 'ov');

  // Verify tab list contains bag, tech, and sub
  const tabKeys = UI.tabs.map(t => t[0]);
  assert(tabKeys.includes('bag'), 'Must have bag tab');
  assert(tabKeys.includes('tech'), 'Must have tech tab');
  assert(tabKeys.includes('sub'), 'Must have sub tab');
  assert(tabKeys.includes('ov'), 'Must have ov tab');
}

console.log('--- TEST 2: Overview tab (ov) is concise without huge dumps ---');
{
  const W = createWorld('tab-ov-concise');
  UI.G = { W, R: { selected: null } };
  const n = W.npcs[0];
  UI.openNpc(n.id, 'ov');
  const html = UI.rNpc();
  assert(typeof html === 'string' && html.length > 0);
  assert(html.includes('เปิดถุงสัมภาระ'), 'Contains quick link button to bag');
  assert(html.includes('วิชา/วรยุทธ์'), 'Contains quick link button to tech');
  assert(html.includes('สายย่อย/ทะลวงด่าน'), 'Contains quick link button to sub');
  assert(html.includes('รากวิญญาณกำเนิด'), 'Contains root summary');
}

console.log('--- TEST 3: Bag tab (bag) renders personal bag ---');
{
  const W = createWorld('tab-bag-render');
  UI.G = { W, R: { selected: null } };
  const n = W.npcs[0];
  UI.openNpc(n.id, 'bag');
  const html = UI.rNpc();
  assert(typeof html === 'string' && html.length > 0);
  assert(html.includes('inv-grid') || html.includes('bagSearch'), 'Contains personal bag container');
}

console.log('--- TEST 4: Tech tab (tech) renders mantra, moves, passives, study ---');
{
  const W = createWorld('tab-tech-render');
  UI.G = { W, R: { selected: null } };
  const n = W.npcs[0];
  // Ensure n has cult
  assert(n.cult, 'NPC should be a cultivator');
  UI.openNpc(n.id, 'tech');
  const html = UI.rNpc();
  assert(typeof html === 'string' && html.length > 0);
  assert(html.includes('คัมภีร์ลมปราณหลัก'), 'Contains mantra section');
  assert(html.includes('ช่องวิชาติดตัว'), 'Contains passive slots section');
  assert(html.includes('วิชาต่อสู้และกระบวนท่า'), 'Contains active moves section');
}

console.log('--- TEST 5: Sub tab (sub) renders specialization, track, gates, retraining ---');
{
  const W = createWorld('tab-sub-render');
  UI.G = { W, R: { selected: null } };
  const n = W.npcs[0];
  UI.openNpc(n.id, 'sub');
  const html = UI.rNpc();
  assert(typeof html === 'string' && html.length > 0);
  assert(html.includes('ข้อมูลสายย่อยเฉพาะทาง'), 'Contains subpath section');
  assert(html.includes('การปรับวิถีและต้นทุนฝึกใหม่'), 'Contains retraining section');
}

console.log('--- TEST 6: Mortal handling in tech and sub tabs ---');
{
  const W = createWorld('tab-mortal-safety');
  UI.G = { W, R: { selected: null } };
  const mortal = W.npcs.find(x => !x.cult) || { id: 'mortal_1', h: { name: { given: 'ชาวบ้าน', sur: 'จาง' }, origin: { cls: 'ชาวนา', region: 'จงหยวน' }, state: { hp: 100 }, sex: 'M', root: { grade: 'MORTAL' } }, rank: 0 };
  W.byId[mortal.id] = mortal;
  UI.openNpc(mortal.id, 'tech');
  const techHtml = UI.rNpc();
  assert(techHtml.includes('ปุถุชน'), 'Mortal tech tab handles gracefully without throwing');

  UI.openNpc(mortal.id, 'sub');
  const subHtml = UI.rNpc();
  assert(subHtml.includes('ปุถุชน'), 'Mortal sub tab handles gracefully without throwing');
}

console.log('ALL NPC SHEET TABS TESTS PASSED');
