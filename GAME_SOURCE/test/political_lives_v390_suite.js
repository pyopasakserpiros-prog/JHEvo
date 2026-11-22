#!/usr/bin/env node
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const g = require('./load.js');
const { SIM, EXPED, HC, ECO } = g;

console.log('=== JS2 v3.9.0 — Political Lives & External Institutions Verification Suite ===');

// [1/7] Hard Locks, Version & Zero-W.rng Consumption
{
  assert.strictEqual(SIM.PATCH_VERSION, '3.9.6', 'PATCH_VERSION must be 3.9.0');
  assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '3.9.6-deep-gameplay-integration');
  assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'Human Core fingerprint must remain locked');
  const root = path.resolve(__dirname, '../..');
  const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  assert.strictEqual(sha(path.join(root, 'AGENTS.md')), 'f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4');
  assert.strictEqual(sha(path.join(root, 'GAME_SOURCE/js/human_core.js')), 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542');

  const W = SIM.create('V390_RNG_LOCK', { masterIdx: 0 });
  const rngBefore = JSON.stringify(W.rng.getState());
  W.day = 30;
  EXPED.POLITICAL_LIVES.tickDaily(W);
  EXPED.POLITICAL_LIVES.tickMonthly(W);
  const rngAfter = JSON.stringify(W.rng.getState());
  assert.strictEqual(rngAfter, rngBefore, 'POLITICAL_LIVES ticks must consume ZERO W.rng');
  console.log('  [PASS] 1/7: Hard Locks, v3.9.0 version & zero W.rng consumption verified');
}

// [2/7] 1-District Shortage & Shared Contract Lifecycle (Reservation, Single-Settle, Interruption & Epistemic Trust)
{
  const W = SIM.create('V390_CONTRACTS', { masterIdx: 0 });
  const PL = EXPED.POLITICAL_LIVES;
  const pl = PL.ensure(W);
  const hall = pl.tradeHalls.HALL_SHUANGJIANG;
  const dist = pl.cityDistricts.CITY_YX_WUYACASTLE;
  dist.shortageCommodity = 'grain';
  dist.shortageLevel = 70;
  const initGrainDist = dist.grain;
  const initHallGrain = hall.stock.grain;

  // Offer -> Accept -> Reserve
  const ctr = PL.offerContract(W, {
    kind: 'GRAIN_PROCUREMENT',
    requesterType: 'DYNASTY',
    requesterId: 'POL_YUNXIAO',
    providerType: 'TRADE_HALL',
    providerId: 'HALL_SHUANGJIANG',
    commodity: 'grain',
    quantity: 40,
    paymentStones: 160,
    originCityId: hall.hqCityId,
    destCityId: dist.cityId,
    witnessIds: ['CLAN_YUNHE_LIN']
  });
  assert.strictEqual(ctr.state, 'offered');
  const resEval = PL.evaluateContractOffer(W, ctr.id, 'accept');
  assert.strictEqual(resEval.ok, true);
  assert.strictEqual(ctr.state, 'reserved');
  assert.strictEqual(hall.stock.grain, initHallGrain - 40, 'Available stock must decrease on reserve');
  assert.strictEqual(hall.reservedStock.grain, 40, 'Reserved stock must lock 40 units');

  // Dispatch -> Settle once (and verify idempotency against double settlement)
  const disp = PL.dispatchContractDelivery(W, ctr.id);
  assert.strictEqual(disp.ok, true);
  assert.strictEqual(ctr.state, 'in_transit');
  const set1 = PL.settleDelivery(W, disp.delivery.id, { forceSuccess: true });
  assert.strictEqual(set1.ok, true);
  assert.strictEqual(ctr.state, 'settled');
  assert.strictEqual(dist.grain, initGrainDist + 40, 'Destination city must receive 40 grain');
  assert.ok(dist.shortageLevel < 70, 'Destination shortageLevel must drop after delivery');
  assert.strictEqual(hall.reservedStock.grain, 0, 'Reserved stock must clear after settlement');

  const set2 = PL.settleDelivery(W, disp.delivery.id, { forceSuccess: true });
  assert.strictEqual(set2.ok, false);
  assert.strictEqual(set2.reason, 'ALREADY_SETTLED', 'Duplicate settlement must be rejected');

  // Interrupted delivery -> refunds reserved cash & drops trust ONLY for witnesses/counterparties
  const uninvolvedTrustBefore = pl.tradeHalls.HALL_SOUTHERN_LOTUS.trustByActorId['POL_YUNXIAO'];
  const ctr2 = PL.offerContract(W, {
    kind: 'MEDICINE_RELIEF',
    requesterType: 'DYNASTY',
    requesterId: 'POL_YUNXIAO',
    providerType: 'TRADE_HALL',
    providerId: 'HALL_SHUANGJIANG',
    commodity: 'medicine',
    quantity: 20,
    paymentStones: 100,
    originCityId: hall.hqCityId,
    destCityId: dist.cityId,
    witnessIds: ['CLAN_YUNHE_LIN']
  });
  const dynCashBefore = pl.dynasties.POL_YUNXIAO.householdTreasury;
  PL.evaluateContractOffer(W, ctr2.id, 'accept');
  assert.strictEqual(pl.dynasties.POL_YUNXIAO.householdTreasury, dynCashBefore - 100);
  const d2 = PL.dispatchContractDelivery(W, ctr2.id);
  const intRes = PL.settleDelivery(W, d2.delivery.id, { forceInterrupt: true });
  assert.strictEqual(intRes.outcome, 'defaulted');
  assert.strictEqual(pl.dynasties.POL_YUNXIAO.householdTreasury, dynCashBefore, 'Interrupted delivery must refund reserved cash');
  assert.strictEqual(pl.tradeHalls.HALL_SOUTHERN_LOTUS.trustByActorId['POL_YUNXIAO'], uninvolvedTrustBefore, 'Uninvolved hall must not learn of failure automatically');
  console.log('  [PASS] 2/7: 1-District shortage & shared contract lifecycle (reserve/settle/idempotency/interruption) verified');
}

// [3/7] Continuous Person Lifecycle (External -> Full Human Core -> Departure -> Re-entry, Zero Duplication)
{
  const W = SIM.create('V390_PERSON_LIFE', { masterIdx: 0 });
  const PL = EXPED.POLITICAL_LIVES;
  const pl = PL.ensure(W);
  const pid = 'PL_P_HEIR_POL_DONGHUANG';
  const p = pl.persons[pid];
  assert.ok(p && p.tier === 'EXTERNAL');

  const adm = PL.admitExternalPersonToHomeSect(W, pid);
  assert.strictEqual(adm.ok, true);
  assert.strictEqual(HC.validate(adm.npc).length, 0, 'Admitted external person must pass HC.validate');
  assert.strictEqual(p.ownerType, 'HOME_SECT');
  assert.strictEqual(W.byId[adm.npc.id], adm.npc);

  // Duplicate admission must fail
  const dupAdm = PL.admitExternalPersonToHomeSect(W, pid);
  assert.strictEqual(dupAdm.ok, false);
  assert.strictEqual(dupAdm.reason, 'ALREADY_IN_HOME_SECT');

  // Grow cultivation inside Home Sect, then depart cleanly
  if (adm.npc.cult) adm.npc.cult.stage = 7;
  const npcId = adm.npc.id;
  const dep = PL.departHomeSectToExternal(W, npcId, 'กลับไปปฏิบัติภารกิจราชสำนัก', 'DYNASTY', 'POL_DONGHUANG', 'CITY_DH_JIUKU_CAPITAL');
  assert.strictEqual(dep.ok, true);
  assert.strictEqual(W.byId[npcId], undefined, 'Departed NPC must be cleanly removed from W.byId');
  assert.strictEqual(p.ownerType, 'DYNASTY');
  assert.strictEqual(p.cultStage, 7, 'Personal growth must persist on external person');
  assert.ok(p.formerRoles.includes('ศิษย์สำนักหยุนเหอ'));

  // Re-enter without rerolling identity or losing growth
  const re = PL.reenterHomeSect(W, pid);
  assert.strictEqual(re.ok, true);
  assert.strictEqual(re.npc.id, npcId, 'Re-entry must preserve stable NPC ID');
  assert.strictEqual(re.npc.cult.stage, 7, 'Re-entry must preserve cultivation growth');
  assert.strictEqual(re.npc.h.name.family, p.name.family);
  console.log('  [PASS] 3/7: Continuous person admission, Human Core parity, departure & re-entry verified');
}

// [4/7] Optional Clan Visibility, Secret Disclosure & Encounter-Time Social Modifier
{
  const W = SIM.create('V390_CLAN_VIS', { masterIdx: 0 });
  const PL = EXPED.POLITICAL_LIVES;
  const pl = PL.ensure(W);
  const secretHead = pl.persons.PL_P_CLANHEAD_CLAN_DONGFANG;
  assert.strictEqual(secretHead.clanVisibility, 'SECRET');
  assert.strictEqual(PL.getVisibleClanLabel(W, secretHead), null, 'SECRET clan must be hidden from public overview');

  // Shared surname alone without clanId = 0 modifier
  const fakeA = { id: 'T_A', h: { name: { family: 'ตงฟาง' }, mind: {}, life: {} }, ext: { politicalLife: { clanId: null, clanVisibility: 'NONE' } } };
  const fakeB = { id: 'T_B', h: { name: { family: 'ตงฟาง' }, mind: {}, life: {} }, ext: { politicalLife: { clanId: null, clanVisibility: 'NONE' } } };
  assert.strictEqual(PL.evaluateClanEncounterModifier(W, fakeA, fakeB, +1), 0, 'Shared surname alone must confer zero modifier');

  // Reveal secret -> now visible & grants bounded familiarity
  PL.revealPersonSecret(W, secretHead.id, 'CLAN', ['OBS_1'], 'เปิดเผยป้ายตระกูล', true);
  const visLabel = PL.getVisibleClanLabel(W, secretHead);
  assert.ok(visLabel && visLabel.clanId === 'CLAN_DONGFANG', 'Revealed clan must be visible');

  const clanMate = { id: 'OBS_1', h: { name: { family: 'ตงฟาง' }, mind: {}, life: {} }, ext: { politicalLife: { clanId: 'CLAN_DONGFANG', branchId: secretHead.branchId, clanVisibility: 'PUBLIC' } } };
  const mod = PL.evaluateClanEncounterModifier(W, clanMate, secretHead, +1);
  assert.strictEqual(mod, 3, 'Recognized same-clan encounter should grant modest +3 familiarity');
  console.log('  [PASS] 4/7: Optional clan visibility, secret disclosure & encounter-time modifier verified');
}

// [5/7] Peaceful Succession, Versioned Authority & Displaced-Heir Asylum -> Return -> Aftermath
{
  const W = SIM.create('V390_SUCCESSION', { masterIdx: 0 });
  const PL = EXPED.POLITICAL_LIVES;
  const pl = PL.ensure(W);

  // Peaceful succession on Dong Huang
  const d1 = PL.openSuccessionDispute(W, 'POL_DONGHUANG', 'ผลัดรัชกาลตามปกติ');
  assert.strictEqual(d1.ok, true);
  const r1 = PL.resolveSuccessionDispute(W, d1.dispute.id, { forceOutcome: 'PEACEFUL_ACCESSION' });
  assert.strictEqual(r1.ok, true);
  assert.strictEqual(r1.outcome, 'PEACEFUL_ACCESSION');
  assert.strictEqual(pl.dynasties.POL_DONGHUANG.officeVersion, 2);

  // Stale officeVersion check
  const staleDisp = PL.openSuccessionDispute(W, 'POL_DONGHUANG', 'ฎีกาล่าช้า');
  pl.dynasties.POL_DONGHUANG.officeVersion = 99;
  const staleRes = PL.resolveSuccessionDispute(W, staleDisp.dispute.id);
  assert.strictEqual(staleRes.ok, false);
  assert.strictEqual(staleRes.reason, 'STALE_OFFICE_VERSION', 'Delayed action must not overwrite newer officeVersion');

  // Displaced-heir reference arc on Youming: EXILE_FLIGHT -> travels -> Home Sect asylum -> departs -> returns & wins throne
  const dYm = PL.openSuccessionDispute(W, 'POL_YOUMING', 'ศึกชิงอำนาจสุสานหมอก');
  const rYm = PL.resolveSuccessionDispute(W, dYm.dispute.id, { forceOutcome: 'EXILE_FLIGHT' });
  assert.strictEqual(rYm.outcome, 'EXILE_FLIGHT');
  const heir = pl.persons[rYm.displacedHeirId];
  assert.strictEqual(heir.ownerType, 'TRAVELING');
  assert.strictEqual(heir.clanVisibility, 'SECRET');

  // Advance day to arrival -> tickDaily admits exiled heir to Home Sect
  W.day = heir.travel.etaDay + 1;
  PL.tickDaily(W);
  assert.strictEqual(heir.ownerType, 'HOME_SECT', 'Exiled heir should arrive and be admitted to Home Sect');
  assert.ok(heir.homeSectNpcId && W.byId[heir.homeSectNpcId]);

  // Later: heir departs with political aid contract and wins contested return
  PL.departHomeSectToExternal(W, heir.homeSectNpcId, 'กลับไปทวงบัลลังก์โยวหมิง', 'TRAVELING', 'POL_YOUMING', 'CITY_YM_HUNDENG_CAPITAL');
  const dRet = PL.openSuccessionDispute(W, 'POL_YOUMING', 'รัชทายาทเดิมหวนคืนทวงสิทธิ์', { claimantIds: [heir.id, pl.dynasties.POL_YOUMING.rulerPersonId] });
  const rRet = PL.resolveSuccessionDispute(W, dRet.dispute.id, { forceOutcome: 'CONTESTED_VICTORY', winnerId: heir.id });
  assert.strictEqual(rRet.ok, true);
  assert.strictEqual(rRet.winnerId, heir.id);
  assert.ok(pl.dynasties.POL_YOUMING.policyFavors.HOME_SECT, 'New ruler who was former disciple must evaluate institutional favor/standing for old sect');
  console.log('  [PASS] 5/7: Peaceful succession, stale-version guard & displaced-heir asylum/return aftermath verified');
}

// [6/7] Read-Only UI Verification (Zero W.rng & Zero W Mutation)
{
  require('../js/render.js');
  require('../js/ui.js');
  const UI = g.UI;
  const W = SIM.create('V390_UI_RO', { masterIdx: 0 });
  const PL = EXPED.POLITICAL_LIVES;
  // Admit a PUBLIC clan member so UI.rNpc has a visible clan to render
  const adm = PL.admitExternalPersonToHomeSect(W, 'PL_P_HEIR_POL_DONGHUANG');
  g.G = { W };
  UI.G = { W }; UI.W = W;
  UI.npcId = adm.npc.id;
  UI.npcTab = 'ov';
  UI.worldTab = 'polities';

  const rngBefore = JSON.stringify(W.rng.getState());
  const npcHtml = UI.rNpc();
  const polHtml = UI.rPolities(W);
  const worldHtml = UI.rWorld();
  const rngAfter = JSON.stringify(W.rng.getState());
  assert.strictEqual(rngAfter, rngBefore, 'UI renderers must consume ZERO W.rng');
  assert.ok(npcHtml.includes('ตระกูล') || npcHtml.includes('ตระกูลซือหม่า'), 'UI.rNpc should display visible clan info');
  assert.ok(polHtml.includes('ราชวงศ์') && polHtml.includes('สืบ'), 'UI.rPolities should display dynasty & succession info');
  assert.ok(typeof worldHtml === 'string' && worldHtml.length > 200);
  console.log('  [PASS] 6/7: Read-only UI (UI.rNpc, UI.rPolities, UI.rWorld) zero-RNG & Thai rendering verified');
}

// [7/7] Save/Reload Round-Trip & 360-Day Acceleration Stress Benchmark
{
  const W = SIM.create('V390_SAVE_PERF', { masterIdx: 0 });
  const PL = EXPED.POLITICAL_LIVES;
  const t0 = Date.now();
  for (let d = 1; d <= 360; d++) {
    W.day = d;
    PL.tickDaily(W);
    if (d % 30 === 0) PL.tickMonthly(W);
  }
  const elapsedMs = Date.now() - t0;
  assert.ok(elapsedMs < 1500, '360-day Political Lives ticks must stay fast (<1500ms, got ' + elapsedMs + 'ms)');

  const saved = SIM.serialize(W);
  const W2 = SIM.deserialize(saved);
  assert.ok(W2.world.politicalLives, 'Deserialized world must preserve politicalLives');
  assert.strictEqual(Object.keys(W2.world.politicalLives.dynasties).length, 9);
  assert.strictEqual(Object.keys(W2.world.politicalLives.clans).length, 9);
  assert.strictEqual(Object.keys(W2.world.politicalLives.tradeHalls).length, 5);
  assert.strictEqual(W2.world.politicalLives.lastMonthTick, W.world.politicalLives.lastMonthTick);
  console.log(`  [PASS] 7/7: Save/reload round-trip & 360-day acceleration benchmark (${elapsedMs}ms) verified`);
}


// [8/11] Autonomous Exiled Heir Return vs Renunciation (Human Core + Shelter Obligation Fulfilled)
{
  const W = SIM.create("V390_DRAMA_HEIR", { masterIdx: 0 });
  const PL = EXPED.POLITICAL_LIVES;
  const pl = PL.ensure(W);
  const pid = "PL_P_HEIR_POL_YUNXIAO";
  const adm = PL.admitExternalPersonToHomeSect(W, pid, { asylumPolityId: "POL_YUNXIAO" });
  assert.strictEqual(adm.ok, true);
  // Path A: Renounce and stay lifelong disciple
  const ren = PL.evaluateExiledHeirReturn(W, pid, { forceDecision: "RENOUNCE_AND_STAY" });
  assert.strictEqual(ren.ok, true);
  assert.strictEqual(ren.decision, "RENOUNCE_AND_STAY");
  assert.strictEqual(pl.persons[pid].claims[0].renounced, true);

  // Path B: Another exiled heir chooses CONTEST_RETURN -> records shelter obligation & departs with aid contract
  const pid2 = "PL_P_HEIR_POL_YOUMING";
  PL.admitExternalPersonToHomeSect(W, pid2, { asylumPolityId: "POL_YOUMING" });
  const ret = PL.evaluateExiledHeirReturn(W, pid2, { forceDecision: "CONTEST_RETURN" });
  assert.strictEqual(ret.ok, true);
  assert.strictEqual(ret.decision, "CONTEST_RETURN");
  assert.ok(pl.persons[pid2].obligations.some(ob => ob.kind === "SHELTERED_IN_EXILE" && ob.creditorId === "HOME_SECT"));
  assert.ok(ret.aidContractId, "Returning claimant should secure real material backing contract");
  console.log("  [PASS] 8/11: Autonomous exiled-heir renunciation & contested return with shelter obligation verified");
}

// [9/11] Junior Clan Branch Schism & Independent Rival Workshop
{
  const W = SIM.create("V390_SCHISM", { masterIdx: 0 });
  const PL = EXPED.POLITICAL_LIVES;
  const pl = PL.ensure(W);
  const res = PL.evaluateClanBranchDynamics(W, "CLAN_LONGMEN_SHEN");
  assert.strictEqual(res.ok, true, "Junior branch with low relationToMain (<35) and >=500 treasury should split off");
  assert.ok(pl.clans[res.newClanId], "New independent branch clan must exist");
  assert.ok(pl.clans.CLAN_LONGMEN_SHEN.rivalClanIds.includes(res.newClanId));
  console.log("  [PASS] 9/11: Junior clan branch schism into independent rival house verified");
}

// [10/11] Former Disciple Appointed as External Regional Regulator
{
  const W = SIM.create("V390_ALUMNI_REG", { masterIdx: 0 });
  const PL = EXPED.POLITICAL_LIVES;
  const pl = PL.ensure(W);
  const adm = PL.admitExternalPersonToHomeSect(W, "PL_P_HEIR_POL_CHIYAN");
  if (adm.npc.cult) adm.npc.cult.stage = 6;
  PL.departHomeSectToExternal(W, adm.npc.id, "ออกพเนจรและรับราชการภูมิภาค", "TRAVELING", "POL_YUNHE", "CITY_YH_SHUANGJIANG");
  const app = PL.evaluateAlumniAppointments(W);
  assert.strictEqual(app.ok, true);
  assert.ok(app.appointed.includes("PL_P_HEIR_POL_CHIYAN"), "Qualified former disciple should be appointed regional regulator");
  assert.strictEqual(pl.persons.PL_P_HEIR_POL_CHIYAN.ownerType, "COURT");
  console.log("  [PASS] 10/11: Former sect disciple appointed as external regional regulator verified");
}

// [11/11] Crisis-Driven Rival Clan Temporary Truce Mediation
{
  const W = SIM.create("V390_TRUCE", { masterIdx: 0 });
  const PL = EXPED.POLITICAL_LIVES;
  const pl = PL.ensure(W);
  pl.cityDistricts.CITY_YH_SHUANGJIANG.shortageCommodity = "medicine";
  pl.cityDistricts.CITY_YH_SHUANGJIANG.shortageLevel = 80;
  const truce = PL.evaluateCrisisMediation(W, "CITY_YH_SHUANGJIANG");
  assert.strictEqual(truce.ok, true, "Rival clans should co-sign relief during severe shortage");
  assert.ok(truce.delivered >= 15);
  assert.ok(pl.cityDistricts.CITY_YH_SHUANGJIANG.shortageLevel < 80);
  console.log("  [PASS] 11/11: Crisis-driven rival clan temporary truce & relief delivery verified");
}

console.log('ALL JS2 v3.9.0 POLITICAL LIVES & EXTERNAL INSTITUTIONS CHECKS PASSED (11/11)');
