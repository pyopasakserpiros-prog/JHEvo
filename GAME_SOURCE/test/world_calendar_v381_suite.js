'use strict';
const assert = require('assert');
const g = require('./load.js');

console.log('=== JS2 v3.8.1 — Formal World Calendar & 1,000-Year Epoch System Suite ===');

// [1/5] Version, Schema & Backward-Compatible 3.8.0 Save Hydration
{
  assert.strictEqual(g.SIM.PATCH_VERSION, '3.8.3');
  assert.strictEqual(g.SIM.SAVE_SCHEMA_VERSION, '3.8.3-grand-lore-chronicles-11books');
  const W = g.SIM.create('v381_cal');
  const snap = JSON.parse(g.SIM.serialize(W));
  snap.schemaVersion = '3.8.0-master-lore-compendium';
  const hydrated = g.SIM.deserialize(JSON.stringify(snap));
  assert(hydrated && Array.isArray(hydrated.npcs) && hydrated.npcs.length > 0, 'Must hydrate 3.8.0 saves cleanly');
  console.log('PASS [1/5] Version 3.8.1 & legacy 3.8.0 save hydration verified');
}

// [2/5] Formal SIM.CALENDAR Constants & Day-0 = ยุคที่ 101 ปีที่ 1 (worldYear 100,001)
{
  const CAL = g.SIM.CALENDAR;
  assert(CAL && Object.isFrozen(CAL), 'SIM.CALENDAR must exist and be frozen');
  assert.strictEqual(CAL.YEARS_PER_EPOCH, 1000);
  assert.strictEqual(CAL.START_EPOCH, 101);
  assert.strictEqual(CAL.START_YEAR_IN_EPOCH, 1);
  assert.strictEqual(CAL.START_WORLD_YEAR, 100001);
  assert.strictEqual(CAL.DAYS_PER_MONTH, 30);
  assert.strictEqual(CAL.MONTHS_PER_YEAR, 12);
  assert.strictEqual(CAL.DAYS_PER_YEAR, 360);
  assert.strictEqual(CAL.MONTH_NAMES_TH.length, 12);
  const c0 = g.SIM.calendar(0);
  assert.strictEqual(c0.year, 1, 'Sect year at t=0 must remain 1 for backward compatibility');
  assert.strictEqual(c0.sectYear, 1);
  assert.strictEqual(c0.worldYear, 100001);
  assert.strictEqual(c0.epoch, 101, 'Start epoch must be 101');
  assert.strictEqual(c0.yearInEpoch, 1, 'Start yearInEpoch must be 1');
  assert.strictEqual(c0.month, 1);
  assert.strictEqual(c0.dom, 1);
  assert.strictEqual(c0.monthNameTh, 'เดือนอ้ายวสันต์');
  const cNextYear = g.SIM.calendar(360 * 1440);
  assert.strictEqual(cNextYear.epoch, 101);
  assert.strictEqual(cNextYear.yearInEpoch, 2);
  // Check epoch rollover: 1000 years later -> Epoch 102 Year 1
  const cRollover = g.SIM.calendar(1000 * 360 * 1440);
  assert.strictEqual(cRollover.epoch, 102);
  assert.strictEqual(cRollover.yearInEpoch, 1);
  assert(g.SIM.dateText(0).includes('ยุคที่ 101 ปีที่ 1'), 'SIM.dateText must format compact epoch + year');
  console.log('PASS [2/5] SIM.CALENDAR 1,000-year Epoch system (Start = ยุคที่ 101 ปีที่ 1) & rollover verified');
}

// [3/5] Historical Year Conversion Helpers Match Every Existing Lore Milestone
{
  assert.strictEqual(g.SIM.formatWorldYear(100001), 'ยุคที่ 101 ปีที่ 1');
  assert.strictEqual(g.SIM.formatWorldYear(100001, true), 'ยุค 101 ปี 1');
  assert.strictEqual(g.SIM.formatWorldYear(99721), 'ยุคที่ 100 ปีที่ 721');
  assert.strictEqual(g.SIM.worldYearFromEpoch(100, 721), 99721);
  assert(g.SIM.formatWorldYear(0).includes('ยุคที่ 0 ปีที่ 0'), 'Year 0 must represent Shattered Gate');
  assert(g.SIM.formatWorldYear(-500).includes('มหายุคก่อนประวัติศาสตร์'), 'Negative years must format as Prehistory');
  // Verify alignment with existing game lore milestones relative to ยุคที่ 101 ปีที่ 1 (100,001)
  assert.strictEqual(g.SIM.formatWorldYear(g.SIM.worldYearFromYearsAgo(820)), 'ยุคที่ 100 ปีที่ 181', 'Yunhe Treaty 820y ago -> ยุคที่ 100 ปีที่ 181');
  assert.strictEqual(g.SIM.formatWorldYear(g.SIM.worldYearFromYearsAgo(750)), 'ยุคที่ 100 ปีที่ 251', 'Seven Banners 750y ago -> ยุคที่ 100 ปีที่ 251');
  assert.strictEqual(g.SIM.formatWorldYear(g.SIM.worldYearFromYearsAgo(420)), 'ยุคที่ 100 ปีที่ 581', 'Yanling 420y ago -> ยุคที่ 100 ปีที่ 581');
  assert.strictEqual(g.SIM.formatWorldYear(g.SIM.worldYearFromYearsAgo(310)), 'ยุคที่ 100 ปีที่ 691', 'Huangsha 310y ago -> ยุคที่ 100 ปีที่ 691');
  assert.strictEqual(g.SIM.formatWorldYear(g.SIM.worldYearFromYearsAgo(240)), 'ยุคที่ 100 ปีที่ 761', 'Canglan 240y ago -> ยุคที่ 100 ปีที่ 761');
  assert.strictEqual(g.SIM.formatWorldYear(g.SIM.worldYearFromYearsAgo(180)), 'ยุคที่ 100 ปีที่ 821', 'Nanzhu 180y ago -> ยุคที่ 100 ปีที่ 821');
  assert.strictEqual(g.SIM.formatWorldYear(g.SIM.worldYearFromYearsAgo(110)), 'ยุคที่ 100 ปีที่ 891', 'Zhenyang 110y ago -> ยุคที่ 100 ปีที่ 891');
  assert.strictEqual(g.SIM.formatWorldYear(g.SIM.worldYearFromYearsAgo(90)), 'ยุคที่ 100 ปีที่ 911', 'Qinglan 90y ago -> ยุคที่ 100 ปีที่ 911');
  console.log('PASS [3/5] Historical epoch helpers align 100% with all canonical lore milestones');
}

// [4/5] All 6 Grand Epochs in EXPED.LORE_COMPENDIUM Carry Canonical Prehistory & Epoch Ranges
{
  const C = g.EXPED.LORE_COMPENDIUM;
  assert.strictEqual(C.START_WORLD_YEAR, 100001);
  assert.strictEqual(C.START_EPOCH, 101);
  assert.strictEqual(C.YEARS_PER_EPOCH, 1000);
  const byId = Object.fromEntries(C.ERAS.map(e => [e.id, e]));
  assert.strictEqual(byId.ERA_0_ANTEDILUVIAN.isPrehistory, true);
  assert.strictEqual(byId.ERA_1_TIANGU_WAR.isPrehistory, true);
  assert.strictEqual(byId.ERA_1_TIANGU_WAR.endYear, 0);
  assert.strictEqual(byId.ERA_2_POST_TIANGU_CHAOS.startYear, 1);
  assert.strictEqual(byId.ERA_5_PRESENT_CONVERGENCE.startYear, 100001);
  console.log('PASS [4/5] All 6 Grand Epochs carry canonical Prehistory & 1,000-year Epoch spans');
}

// [5/5] UI.rLore() Displays Official 1,000-Year Epoch Calendar Standard
{
  const W = g.SIM.create('v381_lore_ui');
  if (!g.UI) {
    g.document = { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} };
    require('../js/ui.js');
  }
  g.UI.G = { W };
  g.UI.tab = 'eras';
  const html = g.UI.rLore();
  assert(html.includes('1 ยุค = 1,000 ปี') && html.includes('ยุคที่ 101 ปีที่ 1') && html.includes('มหายุคก่อนประวัติศาสตร์'), 'UI.rLore must display official 1,000-year Epoch calendar standard');
  console.log('PASS [5/5] UI.rLore displays official 1,000-year Epoch & Prehistory standard cleanly');
}

console.log('✅ ALL JS2 v3.8.1 WORLD CALENDAR & 1,000-YEAR EPOCH CHECKS PASSED!');
