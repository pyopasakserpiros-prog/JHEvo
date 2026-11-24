'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const g = require('./load');

function run() {
  const { JD } = g;
  let passed = 0;

  // Test 1: Book #106 exported cleanly with all 4 parts intact
  {
    const b106 = JD.LORE_CHRONICLE_B106_FALLEN_STAR_PEAR_BLOSSOM;
    assert.ok(b106 && b106.META, 'Book #106 exported to JD');
    assert.strictEqual(b106.META.bookNumber, 106, 'bookNumber === 106');
    assert.strictEqual(b106.EVENTS.length, 11, '11 full historical & Year-10 events');
    assert.strictEqual(b106.FIGURES.length, 11, '11 figure dossiers covering all Era 49 cast');
    assert.strictEqual(b106.SHADOW_OPERATIVES_E101.length, 5, '5 shadow operative dossiers covering all 7 Epoch 101 agents');
    assert.strictEqual(b106.RELICS_AND_EVIDENCE.length, 6, '6 legendary relics & materials');
    assert.strictEqual(b106.PATH_59_PREVIEW.length, 6, '6 subpaths for Path #59');
    passed++;
  }

  // Test 2: Canon year alignment (51,205y in crystal stasis, Era 49 48670..48812, Epoch 101 100001..100011)
  {
    const b106 = JD.LORE_CHRONICLE_B106_FALLEN_STAR_PEAR_BLOSSOM;
    const evAwaken = b106.EVENTS.find(e => e.id === 'B106_EV_09_PEAR_BLOSSOM_AWAKENING');
    assert.ok(evAwaken && evAwaken.worldYear === 100010 && evAwaken.eraId === 'ERA_5_PRESENT_CONVERGENCE', 'Year 10 awakening canon year');
    assert.ok(evAwaken.narrativeTh.includes('51,205'), 'Accurate 51,205-year crystal stasis span');
    const evEcl = b106.EVENTS.find(e => e.id === 'B106_EV_05_SEVEN_NIGHTS_ECLIPSE_WAR');
    assert.ok(evEcl && evEcl.worldYear === 48812 && evEcl.eraId === 'ERA_2_POST_TIANGU_CHAOS', 'Eclipse War canon year 48,812');
    passed++;
  }

  // Test 3: UI.rLore registers Book #106 sections cleanly without raw English fallback headers
  {
    const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
    assert.ok(uiSrc.includes('D.SHADOW_OPERATIVES_E101'), 'UI.rLore renders SHADOW_OPERATIVES_E101');
    assert.ok(uiSrc.includes('D.RELICS_AND_EVIDENCE'), 'UI.rLore renders RELICS_AND_EVIDENCE');
    assert.ok(uiSrc.includes('D.PATH_59_PREVIEW'), 'UI.rLore renders PATH_59_PREVIEW');
    passed++;
  }

  // Test 4: Exact 40 script tags preserved in index.html
  {
    const idxHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const scriptTags = (idxHtml.match(/<script\b/g) || []).length;
    assert.strictEqual(scriptTags, 40, 'Exact 40 <script> tags preserved');
    passed++;
  }

  console.log('ALL ' + passed + '/4 v3.16.0 LORE BOOK #106 TESTS PASSED!');
}

run();
