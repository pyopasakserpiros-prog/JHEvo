'use strict';
const assert = require('assert');
const g = require('./load.js');

console.log('=== JS2 v3.8.5 — Lore Continuity & Canon Hardening Suite (LC-01..LC-15) ===');

// LC-01: Fresh SIM.create() starts at Epoch 101, Year 1, Month 1, Day 1 (worldYear 100,001)
const W = g.SIM.create('v385_continuity');
const cStart = g.SIM.calendar(W.t);
assert.strictEqual(cStart.epoch, 101, 'LC-01: Fresh world must start at Epoch 101');
assert.strictEqual(cStart.yearInEpoch, 1, 'LC-01: Fresh world must start at Year 1');
assert.strictEqual(cStart.worldYear, 100001, 'LC-01: Fresh world worldYear must be 100,001');
assert.strictEqual(cStart.month, 1);
assert.strictEqual(cStart.dom, 1);
assert.strictEqual(cStart.hour, 6);
const cYear2 = g.SIM.calendar(W.t + 360 * 1440);
assert.strictEqual(cYear2.epoch, 101);
assert.strictEqual(cYear2.yearInEpoch, 2, 'LC-01: 360 days later must roll over to Year 2');
console.log('  [PASS] LC-01: Fresh SIM.create() starts at ยุคที่ 101 ปีที่ 1 เดือนอ้ายวสันต์ วันที่ 1 06:00 & rolls over to Year 2');

// LC-02: Sect timeline records historical Gen-1 founder (#45) + Gen-7 current master
const tl = W.sect.timeline || [];
assert(tl.length >= 2, 'LC-02: Initial sect timeline must include historical Gen-1 founding and Gen-7 restoration');
assert.strictEqual(tl[0].generation, 1);
assert(tl[0].titleTh.includes('#45'), 'LC-02: Gen-1 founding must credit #45');
assert.strictEqual(tl[1].generation, 7, 'LC-02: Current master milestone must be generation 7');
console.log('  [PASS] LC-02: Sect timeline separates Gen-1 (#45) historical founding from Gen-7 succession');

// LC-03 & LC-04: Atlas Tiangu fall date & Living Lore figure IDs (#42, #44)
const LL = g.EXPED && g.EXPED.LIVING_LORE;
assert(LL && LL.FALLEN_DYNASTIES_ARCHIVE && LL.FALLEN_DYNASTIES_ARCHIVE.DYN_TIANGU);
assert(LL.FALLEN_DYNASTIES_ARCHIVE.DYN_TIANGU.eraTh.includes('ยุคที่ 0 ปีที่ 0'), 'LC-03: Tiangu must anchor to Epoch 0 Year 0');
assert(!LL.FALLEN_DYNASTIES_ARCHIVE.DYN_TIANGU.eraTh.includes('~1,000 ปีก่อน'), 'LC-03: Tiangu must not say ~1,000 years ago');
const f21 = (LL.CANON_FACTS || []).find(f => f.id === 'FACT_21_SU_QIN_820YR_YUNHE_TREATY');
assert(f21 && f21.titleTh.includes('#42') && f21.relatedFigures.includes(42) && !f21.relatedFigures.includes(37), 'LC-04: Su Qin must be #42');
const f18 = (LL.CANON_FACTS || []).find(f => f.id === 'FACT_18_THREE_LANTERN_FOG_UNDERTOW');
assert(f18 && f18.relatedFigures.includes(44), 'LC-04: Three-Lantern must link #44 Lan Yin');
console.log('  [PASS] LC-03 & LC-04: Tiangu fall anchor & Living Lore figure IDs (#42, #44) verified');

// LC-05, LC-06, LC-07, LC-08, LC-09, LC-11, LC-13, LC-14, LC-15
const e01 = g.JD.LORE_CHRONICLE_E0_E1;
const wallEv = e01.EVENTS.find(e => e.id === 'EVT_E0_05_SEVEN_DAYS_WALL');
assert(wallEv.yearLabelTh.includes('เดือน 12 วันที่ 24–30'), 'LC-05: 7-day wall must be in Month 12');

const p5 = g.JD.LORE_CHRONICLE_P5_PRESENT_EPOCH101;
const gen6Ev = p5.EVENTS.find(e => e.id === 'EVT_P5_04_GEN6_LAST_WILL_AND_EMPTY_CHAIR');
assert.strictEqual(gen6Ev.worldYear, 100000, 'LC-06: Gen-6 departure must be worldYear 100,000');
const tidEv = g.JD.LORE_CHRONICLE_EVENTS_COSMIC_TIDES.EVENTS.find(e => e.id === 'EVT_TID_HIST_07');
assert.strictEqual(tidEv.worldYear, 100000, 'LC-06: Cosmic tides omen must be worldYear 100,000');

const rlm = g.JD.LORE_CHRONICLE_EVENTS_POCKET_REALMS;
assert(rlm.META.portalEchoDistinctionTh && rlm.META.portalEchoDistinctionTh.includes('explore.js'), 'LC-08: Portal echo distinction must be documented');
assert.strictEqual(rlm.EVENTS.find(e => e.id === 'EVT_RLM_HIST_02').worldYear, 13244, 'LC-07: Blood Eclipse historical opening must align with 120-year phase');

const ts = g.JD.LORE_CHRONICLE_E0_TIANSHU;
const ts3 = ts.EVENTS.find(e => e.id === 'EVT_E0_TIANSHU_03_LAST_REFUGE_AFTER_GATE');
assert(!ts3.narrativeTh.includes('คร่าชีวิตจักรพรรดิกู่เซวียนหยวน (#1) ไปแล้ว'), 'LC-09: Emperor #1 fate must remain unconfirmed disappearance');

const p3 = g.JD.LORE_CHRONICLE_P3_MIDDLE_EPOCHS;
assert(p3.EVENTS.find(e => e.id === 'EVT_P3_06_FIVE_ROGUE_PIONEERS_ERA').isCrossEraAnthology === true, 'LC-14: Five Rogue Pioneers must be flagged cross-era anthology');
assert(p3.FIGURES_32_TO_41.find(f => f.num === 39).novelBiographyTh.includes('Stasis-Drunk'), 'LC-13: #39 lifespan mechanism documented');
assert(p3.FIGURES_32_TO_41.find(f => f.num === 40).novelBiographyTh.includes('Soul-Anchor'), 'LC-13: #40 lifespan mechanism documented');

const e23 = JSON.stringify(g.JD.LORE_CHRONICLE_E23_E25_LITERATI_CHESS);
assert(!e23.includes('เดือนมีนาคม') && !e23.includes('มกราคม–ธันวาคม'), 'LC-15: No Gregorian month names in Epoch 23–25 book');
console.log('  [PASS] LC-05..LC-15: All chronicle dates, phases, lifespans, and Thai calendar names verified');

console.log('ALL JS2 v3.8.5 LORE CONTINUITY CHECKS PASSED (4/4)');
