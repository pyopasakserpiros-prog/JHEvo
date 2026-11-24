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

  test('1. Constitutional hard locks, exact 40 script tags, Project Status & all 5 Patch Reports present', () => {
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
    assert.ok(/v3\.(12|13|14|15)\./.test(idxHtml), 'index.html title must reflect v3.12.x');

    const ps = fs.readFileSync(path.join(ROOT, 'project_status_and_ai_onboarding.md'), 'utf8');
    assert.ok(/JS2 v3\.(12|13|14|15)\./.test(ps), 'project_status_and_ai_onboarding.md must be updated to JS2 v3.12.x');
    for (const pr of [
      'TWO_SPECS_BUGFIX_AUDIT_JS2_V3_9_9.md',
      'CHRONICLE_REPORTING_OVERHAUL_JS2_V3_10_0.md',
      'BIOGRAPHY_ERA_TIMELINE_JS2_V3_11_0.md',
      'EMERGENT_LONGEVITY_ERA_SURVIVAL_JS2_V3_12_0.md',
      'WORLD_SYMMETRY_LONGEVITY_JS2_V3_12_1.md'
    ]) {
      assert.ok(fs.existsSync(path.join(ROOT, 'PATCH_REPORTS', pr)), 'Missing patch report: ' + pr);
    }
  });

  const W = ctx.SIM.create({ seed: 31201, sectName: 'สำนักเมฆาหยก', mode: 'balanced' });
  for (let i = 0; i < 4; i++) ctx.SIM.tick(W, 60);

  test('2. Peaceful elders accept mortality organically (unforced, never scripted)', () => {
    const calm = W.npcs[1];
    calm.h.personality.ambition = 25;
    calm.h.personality.caution = 30;
    calm.h.personality.composure = 80;
    calm.h.personality.integrity = 80;
    calm.h.values.sectDuty = 40;
    if (calm.h.mind) calm.h.mind.grudges = [];
    assert.strictEqual(ctx.CULT.LONGEVITY.isPeacefulAccepter(calm), true, 'Calm elder should accept mortality naturally');
    assert.strictEqual((W.world.awakenedAncients || []).length, 0, 'Dormant ancients must not be forced in calm world');
  });

  test('3. Leyline Anchor adds lifespan AND enforces exploration block trade-off', () => {
    const elder = W.npcs[0];
    elder.cult.stage = 6;
    const beforeLife = ctx.CULT.lifespan(elder);
    assert.strictEqual(ctx.CULT.LONGEVITY.applyLeylineAnchor(W, elder), true);
    const afterLife = ctx.CULT.lifespan(elder);
    assert.ok(afterLife >= beforeLife + 35, 'Leyline anchor must add +35..60 years');
    const res = ctx.EXPLORE.dispatchExploration(W, 'LOC_NAMELESS_SWORD_TOMB', [elder.id], { ignoreCooldown: true });
    assert.strictEqual(res.ok, false, 'Leyline-anchored elder must be blocked from leaving sect bounds');
  });

  test('4. Beast Symbiosis adds lifespan AND inflicts backlash when pet is lost', () => {
    const n = W.npcs[2];
    n.pet = { id: 'PET_TEST', nameTh: 'เต่าศิลาหมื่นปี', tier: 4, bondXp: 300, dead: false };
    const beforeLife = ctx.CULT.lifespan(n);
    assert.strictEqual(ctx.CULT.LONGEVITY.applyBeastSymbiosis(W, n), true);
    assert.ok(ctx.CULT.lifespan(n) >= beforeLife + 20, 'Beast symbiosis must add lifespan');
    const hpBefore = n.h.state.hp;
    n.pet.dead = true;
    ctx.CULT.LONGEVITY.evaluateDaily(W);
    assert.strictEqual(n.ext.longevity.beastSymbiosis, false, 'Symbiosis must sever on pet loss');
    assert.ok(n.h.state.hp < hpBefore, 'Pet loss must inflict physical backlash');
  });

  test('5. Stasis Hibernation slows aging, pauses old-age death & wakes on crisis/observer intervention', () => {
    const n = W.npcs.find(x => x && !x.dead && !(x.ext && x.ext.longevity && x.ext.longevity.stasis));
    assert.strictEqual(ctx.CULT.LONGEVITY.enterStasis(W, n, 'ทดสอบจำศีล'), true);
    assert.strictEqual(n.ext.longevity.stasis, true);
    const rngBefore = W.rng.s;
    const mind = ctx.COG.explain(W, n);
    assert.strictEqual(W.rng.s, rngBefore, 'COG.explain must remain Zero-RNG');
    assert.ok(mind.innerVoiceTh.includes('จำศีล'), 'innerVoiceTh must reflect stasis');
    ctx.CULT.LONGEVITY.evaluateDaily(W);
    assert.ok(n.ext.longevity.stasisDaysSaved >= 0.9, 'Stasis must accumulate saved days');
    assert.strictEqual(ctx.CULT.LONGEVITY.wakeFromStasis(W, n, 'สำนักมีภัย'), true);
    assert.strictEqual(n.ext.longevity.stasis, false);
  });

  test('6. Emergent Dormant Ancient awakening works cleanly when disturbed', () => {
    const anc = ctx.CULT.LONGEVITY.maybeAwakenDormantAncient(W, 'ทดสอบการเปิดสุสานเซียน', { force: true });
    assert.ok(anc && anc.nameTh && anc.remainingYears > 0, 'Awakened ancient must have finite remainingYears');
    assert.strictEqual(W.world.awakenedAncients.length, 1);
  });

  test('7. World Symmetry: External sect leaders & elders follow identical unforced longevity rules', () => {
    const extSect = { nameTh: 'สำนักกระบี่อุดร', treasury: 80, inCrisis: false };
    const peacefulExt = { nameTh: 'เฒ่าสงบ', stage: 6, ageYears: 195, lifespanMax: 210, ambition: 35, integrity: 75 };
    assert.strictEqual(ctx.CULT.LONGEVITY.evaluateExternalMember(W, peacefulExt, extSect, () => 0.01), null, 'Peaceful external elder must accept mortality naturally');

    const drivenExt = { nameTh: 'เจ้าสำนักผู้ทะเยอทะยาน', stage: 6, ageYears: 195, lifespanMax: 210, ambition: 82, integrity: 40 };
    const mode = ctx.CULT.LONGEVITY.evaluateExternalMember(W, drivenExt, extSect, k => (k === 'stasis' ? 0.01 : 0.99));
    assert.strictEqual(mode, 'STASIS', 'Driven external leader can organically enter stasis');
    assert.strictEqual(drivenExt.longevity.stasis, true);
    extSect.inCrisis = true;
    ctx.CULT.LONGEVITY.evaluateExternalMember(W, drivenExt, extSect, () => 0.99);
    assert.strictEqual(drivenExt.longevity.stasis, false, 'External leader wakes automatically when their sect enters crisis');
  });

  test('8. World Symmetry: External political/clan cultivators evaluate longevity symmetrically', () => {
    const extPerson = { id: 'EXT_P1', alive: true, cultStage: 6, ageYears: 180 };
    const res = ctx.CULT.LONGEVITY.evaluateExternalPerson(W, extPerson, k => (k === 'pill' ? 0.01 : 0.99));
    assert.strictEqual(res, 'ALCHEMY', 'High-stage external cultivator can organically use diminishing-returns longevity elixir');
    assert.ok(extPerson.longevity.bonusYears > 0 && extPerson.longevity.pillsTaken === 1);
  });

  console.log(`\nALL ${results.length}/${results.length} v3.12.1 WORLD-SYMMETRIC LONGEVITY TESTS PASSED!`);
}

run();
