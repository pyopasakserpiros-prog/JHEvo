'use strict';
const assert = require('assert');
const g = require('./load');

function run() {
  const { SIM, CULT, ECO, SECT, EXPED, AI, COMBAT, COG } = g;
  const W = SIM.create('v3151-audit-bugfix');
  let passed = 0;

  // Test 1: AUD-P0-01 MERIDIANS.openMeridian 4/8 & 8/8 without ReferenceError
  {
    const n = W.npcs.find(x => x && !x.dead);
    const order = CULT.MERIDIANS.ORDER;
    for (let i = 0; i < 8; i++) {
      const res = CULT.MERIDIANS.openMeridian(n, order[i], { W });
      assert.strictEqual(res.ok, true, 'openMeridian should succeed for meridian ' + i);
    }
    assert.strictEqual(n.meridians.allEightOpened, true, 'all 8 meridians opened cleanly without ReferenceError');
    passed++;
  }

  // Test 2: AUD-P0-03 & P1-11 & P1-12 buildNpcBiography real stageName, subPath, VALUE_TH, and Year 1 calendar
  {
    const master = W.byId[W.sect.masterId];
    const bio = SIM.PROSE.buildNpcBiography(W, master.id);
    assert.ok(bio, 'biography built');
    assert.notStrictEqual(bio.realmTh, 'ปุถุชน', 'master realmTh must not be hardcoded ปุถุชน');
    assert.strictEqual(bio.realmTh, CULT.stageName(master), 'realmTh matches CULT.stageName(n)');
    assert.ok(bio.topValues.every(v => !/^[a-zA-Z]+$/.test(v.labelTh)), 'topValues must be Thai, no raw camelCase English');
    SIM.PROSE.recordLifeChapter(W, master, 'ทดสอบเหตุการณ์ปีแรก', 'milestone');
    const bio2 = SIM.PROSE.buildNpcBiography(W, master.id);
    const ev = bio2.timeline.find(e => e.text === 'ทดสอบเหตุการณ์ปีแรก');
    assert.ok(ev && ev.year === 1 && ev.month === 1, 'Day 360 must resolve to Year 1 Month 1, got Y' + (ev && ev.year));
    passed++;
  }

  // Test 3: AUD-P0-04 & P1-14 Patriarch Regalia succession idempotency & Gen 7 seeding
  {
    const W2 = SIM.create('v3151-succession-test');
    const oldMaster = W2.byId[W2.sect.masterId];
    const prevGen = W2.sect.masterGeneration;
    oldMaster.dead = true;
    if (SECT.resolvePlayerSuccessionCrisis) SECT.resolvePlayerSuccessionCrisis(W2, 'ทดสอบสืบทอด');
    else SECT.succession(W2, 'ทดสอบสืบทอด');
    assert.strictEqual(W2.sect.masterGeneration, prevGen + 1, 'masterGeneration must increment by exactly +1, not +2');
    assert.strictEqual(W2.sect.eraGenerations.length, 2, 'eraGenerations must preserve founding Gen 7 + new Gen 8');
    assert.strictEqual(W2.sect.eraGenerations[0].gen, prevGen, 'first eraGen is founding generation');
    const tl = EXPED.buildSectEraTimeline(W2);
    assert.strictEqual(tl.currentYear, 1, 'Era Timeline currentYear on Day 360 must be 1');
    passed++;
  }

  // Test 4: AUD-P0-05, P0-06, P0-07, P0-09 Longevity n.pets, n.inv.pills, stasis AI freeze, leylineAnchored expedition block
  {
    const n = W.npcs.find(x => x && !x.dead && x.id !== W.sect.masterId);
    n.pets = [{ id: 'PET_TEST_1', nameTh: 'จิ้งจอกหยก', tier: 4, bondXp: 300, dead: false }];
    const okBeast = CULT.LONGEVITY.applyBeastSymbiosis(W, n);
    assert.strictEqual(okBeast, true, 'applyBeastSymbiosis works with real n.pets array');
    assert.ok(n.ext.longevity.beastBonusYears >= 20, 'beastBonusYears granted');
    const lifeWithBeast = CULT.lifespan(n);
    n.pets[0].dead = true;
    const lifeWithoutBeast = CULT.lifespan(n);
    assert.ok(lifeWithBeast > lifeWithoutBeast, 'CULT.lifespan respects n.pets alive status');

    // Leyline anchor blocks expedition
    n.cult = n.cult || { stage: 6 }; n.cult.stage = 6;
    assert.strictEqual(CULT.LONGEVITY.applyLeylineAnchor(W, n), true, "applyLeylineAnchor succeeds for stage 6");
    assert.strictEqual(EXPED.isAvailableForExpedition(W, n), false, 'leylineAnchored NPC blocked from expeditions');

    // Stasis freezes AI.step and blocks appoint
    CULT.LONGEVITY.enterStasis(W, n, 'ทดสอบจำศีล');
    const prevX = n.x, prevY = n.y;
    AI.step(W, n);
    assert.strictEqual(n.x, prevX, 'stasis NPC does not move');
    assert.strictEqual(n.y, prevY, 'stasis NPC does not move');
    assert.strictEqual(SECT.appoint(W, 'alchemy', n), false, 'stasis NPC cannot be appointed to office');
    passed++;
  }

  // Test 5: AUD-P0-08 & P1-18 External sect stasis 0.1x aging & real sect nameTh
  {
    const W3 = SIM.create('v3151-ext-longevity');
    EXPED.LIVING_SECTS.ensureWorldState(W3);
    const s = (W3.world.allSects || W3.world.sects).find(x => x && x.livingRoster && x.livingRoster.leader);
    const ldr = s.livingRoster.leader;
    ldr.longevity = { stasis: true, stasisTicks: 0, leylineAnchored: false, beastSymbiosis: false, pillsTaken: 0 };
    const ageBefore = ldr.ageYears;
    W3.day = 420;
    EXPED.LIVING_SECTS.tickMonthly(W3, { force: true });
    assert.ok((ldr.ageYears - ageBefore) <= 0.02, 'external sect stasis member ages at 0.1x (~0.01/mo), got delta ' + (ldr.ageYears - ageBefore));
    passed++;
  }

  // Test 6: AUD-P0-10, P1-05, P1-20, P1-21 Black Ledger jail, motive 0-100 normalization, dead warrant pruning
  {
    const W4 = SIM.create('v3151-black-ledger');
    const bl = EXPED.BLACK_LEDGER.ensure(W4);
    assert.ok(bl.representatives.length === 7, '7 representatives seeded');
    const hasNonGuild = bl.representatives.some(r => r.factionId !== 'GUILD_BROKER');
    assert.strictEqual(hasNonGuild, true, '0-1 motive normalization prevents GUILD_BROKER monopoly');

    // Check bwPressure 0-10 scale
    W4.world.livingInstitutions = W4.world.livingInstitutions || { bloodlessWar: { localPressure: 8 } };
    W4.world.livingInstitutions.bloodlessWar.localPressure = 8;
    const beforeHawk = bl.factionPower.HAWK_ENFORCER || 0;
    EXPED.BLACK_LEDGER._recomputePolitics(W4, bl);
    assert.ok((bl.factionPower.HAWK_ENFORCER || 0) >= beforeHawk, 'bwPressure 0-10 scale evaluated');

    // Home sect extradition sets n.jail so they never starve
    const culprit = W4.npcs.find(x => x && !x.dead && x.id !== W4.sect.masterId);
    const wRec = EXPED.BLACK_LEDGER.reportTransgression(W4, culprit, 'FORBIDDEN_ART', 'ทดสอบ');
    assert.ok(wRec, 'warrant issued');
    if (wRec.stance === 'COMPLY_EXTRADITE') {
      assert.ok(culprit.jail > W4.t, 'extradited NPC gets n.jail for prison feeding');
    } else {
      // Test dead pruning
      culprit.dead = true;
      W4.day = (W4.day || 360) + 1;
      EXPED.BLACK_LEDGER.tickDaily(W4);
      assert.strictEqual(bl.activeWarrants.some(w => w.id === wRec.id), false, 'dead NPC warrant pruned in tickDaily');
    }
    passed++;
  }

  // Test 7: AUD-P1-01, P1-04, P1-22, P1-24 Digest 360d, M32 polities, Festival ALCHEMY/FORGING case-insensitivity & Day-1 M01
  {
    const d360 = EXPED.computePeriodDigest(W, { windowDays: 360 });
    assert.strictEqual(d360.windowDays, 360, '360-day digest window not clamped to 90');
    assert.ok(d360.metricsWorld && typeof d360.metricsWorld.M32_politiesGoldenVsTurmoil === 'string', 'M32 present');

    // Day-1 M01 active immediately after SIM.create
    const W5 = SIM.create('v3151-fest-day1');
    assert.strictEqual(W5.world.annualFestivals && W5.world.annualFestivals.activeId, 'ANTH_CUST_FEST_M01_FIRST_DEW_BLADE_CLEANSING', 'Day 0 (M1 D1) activates M01 festival cleanly');

    // Uppercase ALCHEMY / FORGING craftKind works in getActiveModifiers
    const W6 = SIM.create('v3151-fest-craft');
    // Month 2 Day 12 (FEST_M02_HUNDRED_FLOWERS_TEA: alchemyBonus = 0.06)
    W6.t = (360 + 30 + 11) * 1440;
    W6.day = 360 + 30 + 11;
    const modAlch = EXPED.ANNUAL_FESTIVALS.getActiveModifiers(W6, 'ALCHEMY');
    assert.ok(modAlch.craftQualityBonus >= 0.06, 'Uppercase ALCHEMY receives festival alchemyBonus, got ' + modAlch.craftQualityBonus);
    // Month 4 Day 9 (FEST_M04_CRAFTSMAN_KILN: forge +0.04)
    W6.t = (360 + 90 + 8) * 1440;
    W6.day = 360 + 90 + 8;
    const modForge = EXPED.ANNUAL_FESTIVALS.getActiveModifiers(W6, 'FORGING');
    assert.ok(modForge.craftQualityBonus >= 0.08, 'Uppercase FORGING receives festival forge bonus, got ' + modForge.craftQualityBonus);
    passed++;
  }

  // Test 8: AUD-P1-17 Diminishing returns on e.lifespanAdd & AUD-P2-14 cognition.js no double quotes
  {
    const n = W.npcs.find(x => x && !x.dead);
    n.ext = n.ext || {};
    n.ext.longevityPillsTaken = 4; // maxed out tolerance
    const lifeBefore = CULT.lifespan(n);
    ECO.applyPillEffect && ECO.applyPillEffect(W, n, { lifespanAdd: 60 }, 1.0);
    assert.strictEqual(CULT.lifespan(n), lifeBefore, 'e.lifespanAdd respects 4-pill diminishing tolerance cap');

    const mind = COG.explain(W, W.byId[W.sect.masterId]);
    if (mind && mind.innerVoiceTh) {
      assert.strictEqual(mind.innerVoiceTh.startsWith('“'), false, 'innerVoiceTh must not pre-wrap quotes (UI wraps them)');
    }
    passed++;
  }

  console.log('ALL ' + passed + '/8 v3.15.1 AUDIT BUGFIX REGRESSION TESTS PASSED!');
}

run();
