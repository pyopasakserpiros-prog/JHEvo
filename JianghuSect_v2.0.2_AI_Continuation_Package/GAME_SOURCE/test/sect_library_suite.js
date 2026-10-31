'use strict';
const assert = require('assert');
const G = require('./load');
G.document = { getElementById() { return { querySelectorAll() { return []; }, style: {}, classList: { add() {}, remove() {}, toggle() {} } }; } };
require('../js/ui.js');
const { SIM, SECT, CULT, CPE, MARTIAL, UI } = G;

console.log('Testing Priority B: Dedicated Sect Library Tab & Study Pipeline...');

{
  const W = SIM.create('sect-library-test');
  const S = W.sect;
  const n = W.npcs[1]; // living member
  n.cp = 500; // give plenty of CP

  // Ensure member is cultivator
  if (!n.cult) {
    SECT.EDITOR.applyCharacterEdit(W, n.id, { cult: { path: 'XIAN', stage: 4, sub: 'NONE' } });
  } else {
    n.cult.path = 'XIAN';
    n.cult.stage = 4;
    n.cult.sub = 'NONE';
    n.cult.learning = null;
  }

  // 1. Spawn a technique manual into sect library
  const testTech = G.JD.TECH.techniques.find(t => (t.path === 'XIAN' || t.path === 'ANY') && !t.sub && (t.reqTier || t.tier) <= 4 && !t.innateOnly && !n.cult.techs.includes(t.id));
  assert(testTech, 'Must find a general XIAN/ANY technique');
  const testTechId = testTech.id;
  assert(SECT.EDITOR.spawnItem(W, { kind: 'TECH_MANUAL', id: testTechId, dest: 'sect', qty: 1 }).ok);
  assert(S.library.includes(testTechId), 'Spawned manual must be in W.sect.library');

  // 2. Spawn a subpath manual into sect subLibrary
  const testSubObj = CULT.subList.find(x => x.path === 'XIAN');
  const testSubId = testSubObj.sub.id;
  assert(SECT.EDITOR.spawnItem(W, { kind: 'SUB_MANUAL', id: testSubId, dest: 'sect', qty: 1 }).ok);
  assert(S.subLibrary.includes(testSubId), 'Spawned sub manual must be in W.sect.subLibrary');

  // 3. Render Library UI
  UI.G = { W, R: { selected: n.id }, opts: {}, acc: 0, speed: 1 };
  UI.libNpcId = n.id;
  const libHtml = UI.rSectLibrary(W);
  assert(typeof libHtml === 'string' && libHtml.length > 100, 'Library HTML should render');
  assert(libHtml.includes(testTechId) || libHtml.includes(CULT.tech(testTechId).nameTh), 'Main manual must be visible in library UI');
  assert(libHtml.includes(testSubObj.sub.nameTh), 'Sub manual must be visible in library UI');

  // 4. Study main technique
  const cpBefore = n.cp;
  const tDef = CULT.tech(testTechId);
  const fee = (CPE && CPE.techPrice) ? CPE.techPrice(W, tDef) : 30;
  const studyRes = MARTIAL.startStudy(W, n, testTechId);
  assert(studyRes.ok, 'Eligible member must be able to start studying main technique');
  assert.strictEqual(n.cp, cpBefore - fee, 'Study fee must be deducted from member CP');
  assert(n.cult.learning && n.cult.learning.id === testTechId, 'Member must now have learning state');

  // 5. Duplicate study attempt while learning
  const dupStudy = MARTIAL.startStudy(W, n, testTechId);
  assert.strictEqual(dupStudy.ok, false, 'Duplicate study while learning must be rejected');

  // 6. Complete learning
  n.cult.techs.push(testTechId);
  n.cult.learning = null;

  // 7. Study subpath manual
  const cpBeforeSub = n.cp;
  const subFee = MARTIAL.studyFee(W, "S:" + testSubId);
  const subStudyRes = MARTIAL.studySubpath(W, n, testSubId);
  assert(subStudyRes.ok, 'Eligible member must be able to study subpath manual');
  assert.strictEqual(n.cp, cpBeforeSub - subFee, 'Subpath study fee must be deducted');
  assert.strictEqual(n.cult.sub, testSubId, 'Member must now have the studied subpath');

  console.log('  PASS: Spawning, UI discovery, CP fee deduction, main study, and subpath study verified');
}

console.log('ALL SECT LIBRARY TESTS PASSED.');
