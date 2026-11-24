#!/usr/bin/env node
'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ctx = require('./load.js');

const ROOT = path.resolve(__dirname, '..', '..');
const GS = path.resolve(__dirname, '..');

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function run() {
  const results = [];
  function test(name, fn) {
    fn();
    results.push({ name, ok: true });
    console.log('PASS:', name);
  }

  test('1. Constitutional hard locks & exact 40 script tags (v3.11.0)', () => {
    assert.strictEqual(
      sha256(path.join(ROOT, 'AGENTS.md')),
      'f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4'
    );
    assert.strictEqual(
      sha256(path.join(GS, 'js', 'human_core.js')),
      'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542'
    );
    assert.strictEqual(ctx.HC.FINGERPRINT, '155:2f9c9dd7');
    const idxHtml = fs.readFileSync(path.join(GS, 'index.html'), 'utf8');
    const scriptMatches = idxHtml.match(/<script\b[^>]*>/gi) || [];
    assert.strictEqual(scriptMatches.length, 40, 'Must preserve exact 40 script tags');
    assert.ok(/v3\.(11|12|13|14|15)\./.test(idxHtml), 'index.html title must reflect v3.11.0');
  });

  const W = ctx.SIM.create({ seed: 31101, sectName: 'สำนักเมฆาหยก', mode: 'balanced' });
  for (let i = 0; i < 6; i++) ctx.SIM.tick(W, 60);

  test('2. Zero-RNG SIM.PROSE.buildNpcBiography & Observer Experiment aftermath pairing', () => {
    const npc = W.npcs.find(x => x && !x.dead);
    assert.ok(npc, 'Need living NPC');

    // Simulate observer gifting an item + editing traits, then an autonomous milestone after
    ctx.SIM.PROSE.recordLifeChapter(W, npc, 'ได้รับวาสนาฟ้าประทาน「กระบี่เมฆาหยก」×1 ไว้ในครอบครอง', 'DIVINE_GIFT');
    W.day = (W.day || 1) + 1;
    ctx.SIM.PROSE.recordLifeChapter(W, npc, 'ทะลวงขอบเขตขั้นใหม่ด้วยปราณกระบี่อันคมกล้า', 'breakthrough');
    ctx.SIM.PROSE.recordLifeChapter(W, npc, 'ชะตาฟ้าดลใจให้จิตใจและคุณสมบัติภายในแปรเปลี่ยน', 'TRAIT_SHIFT');

    const rngBefore = W.rng.s;
    const bio = ctx.SIM.PROSE.buildNpcBiography(W, npc);
    assert.strictEqual(W.rng.s, rngBefore, 'buildNpcBiography must consume 0 W.rng');
    assert.ok(bio && bio.summaryTh && bio.timeline.length >= 3, 'Biography must contain summary & timeline');
    assert.ok(bio.observerExperiments.length >= 2, 'Must detect DIVINE_GIFT & TRAIT_SHIFT experiments');
    const giftExp = bio.observerExperiments.find(e => e.kind === 'DIVINE_GIFT');
    assert.ok(giftExp && giftExp.aftermath.length >= 1, 'DIVINE_GIFT experiment must pair subsequent autonomous aftermath');
  });

  test('3. Sect Master succession records eraGenerations & Zero-RNG EXPED.buildSectEraTimeline', () => {
    const heir = W.npcs.find(x => x && !x.dead && x.id !== W.sect.masterId);
    assert.ok(heir, 'Need successor candidate');
    ctx.SECT.PATRIARCH_REGALIA.transferToNewMaster(W, heir);
    assert.ok(Array.isArray(W.sect.eraGenerations) && W.sect.eraGenerations.length >= 1, 'eraGenerations must be recorded');

    const rngBefore = W.rng.s;
    const tl = ctx.EXPED.buildSectEraTimeline(W);
    assert.strictEqual(W.rng.s, rngBefore, 'buildSectEraTimeline must consume 0 W.rng');
    assert.ok(tl && tl.generations.length >= 1, 'Era timeline must have at least 1 generation');
    assert.strictEqual(tl.generations[0].masterId, heir.id, 'Latest generation master must match transferred master');
  });

  test('4. UI & CSS integration (tracked filter, biography, observer watch, era timeline)', () => {
    const uiSrc = fs.readFileSync(path.join(GS, 'js', 'ui.js'), 'utf8');
    const cssSrc = fs.readFileSync(path.join(GS, 'css', 'style.css'), 'utf8');
    assert.ok(uiSrc.includes("tracked: '⭐ เฉพาะศิษย์ที่ติดตาม'"), 'Tracked subfilter missing');
    assert.ok(uiSrc.includes('buildNpcBiography'), 'rNpc biography integration missing');
    assert.ok(uiSrc.includes('bio-exp-box'), 'Observer experiment aftermath UI missing');
    assert.ok(uiSrc.includes('buildSectEraTimeline') && uiSrc.includes('data-sect-era-timeline'), 'Era timeline UI missing');
    assert.ok(uiSrc.includes('DIVINE_GIFT') && uiSrc.includes('TRAIT_SHIFT'), 'Observer gift/trait-shift hooks missing');
    assert.ok(cssSrc.includes('.bio-summary-card') && cssSrc.includes('.era-gen-card'), 'v3.11.0 CSS classes missing');
  });

  console.log(`\nALL ${results.length}/${results.length} v3.11.0 BIOGRAPHY & ERA TIMELINE TESTS PASSED!`);
}

run();
