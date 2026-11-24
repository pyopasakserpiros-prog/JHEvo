'use strict';
const assert = require('node:assert/strict');
const { SIM, EXPED } = require('./load');
require('../js/ui.js');
const { UI } = globalThis;
const FSE = EXPED.FALLEN_STAR_EPIC;
const W = SIM.create(3170);
const st = FSE.ensure(W);
const day = SIM.CALENDAR.START_DAY_OFFSET + 9 * 360;
function step(world, d) {
  world.day = d;
  world.t = d * 1440;
  FSE.tickDaily(world, SIM.calendar(world.t));
  for (let slot = 1; slot < 48; slot++) {
    world.t = d * 1440 + slot * 30;
    FSE.tickCampaign(world);
  }
}
W.day = day;
W.t = day * 1440;
FSE.tickDaily(W, SIM.calendar(W.t));
assert.equal(st.chuWangxuan.awakenedDay, day, 'Year 10 date retained');
const absent = W.npcs[0];
absent.away = true;
absent.expId = 'unrelated-expedition';
W.day = day + 120;
W.t = W.day * 1440;
FSE.tickDaily(W, SIM.calendar(W.t));
assert(st.war?.campaign, 'start a stateful campaign on real calendar');
assert(Object.keys(st.war.campaign.fronts).length >= 4, 'simultaneous fronts');
assert(!Object.values(st.war.campaign.units).some(u => u.memberId === absent.id), 'unrelated expedition does not join');
for (let d = day + 121; d < day + 144; d++) step(W, d);
assert(st.war.campaign.events.some(e => e.kind === 'ARRIVED'), 'parties traverse the world');
assert(Object.values(st.war.campaign.fronts).some(f => f.actions?.length), 'named encounter actions feed the observer');
assert.equal(st.path59Unlocked, false, 'early skirmishes do not unlock Path #59');
const copy = SIM.deserialize(SIM.serialize(W));
assert.deepEqual(JSON.parse(JSON.stringify(copy.world.fallenStarEpic.war.campaign)), JSON.parse(JSON.stringify(st.war.campaign)), 'campaign survives save/load');
const before = SIM.serialize(W);
const html = UI.renderFallenStarCampaign(W, 'FERRY');
assert.equal(UI.isPlayerActionAllowed('open-fse-watch', null, 'world'), true);
assert.equal(UI.isPlayerActionAllowed('fse-watch-front', 'FERRY', 'fallen-star'), true);
assert(html.includes('fse-watch-scene') && html.includes('data-do="atlas-event"'), 'observer can see the front and locate it');
assert.equal(SIM.serialize(W), before, 'watching cannot change the simulation');
for (let d = day + 144; d < day + 530 && !st.outcome; d++) step(W, d);
assert(st.outcome && st.path59Unlocked, 'campaign eventually resolves from world state');
for (let d = st.outcomeDay + 1; d <= st.outcomeDay + 95; d++) step(W, d);
assert(!W.npcs.some(n => n.fseDeployment), 'home deployment is released after return travel');
assert(absent.away && absent.expId === 'unrelated-expedition', 'unrelated assignment preserved');
console.log('PASS Year 10 live campaign, travel, watch, persistence and consequences');

// A deployment may become invalid between two calendar mornings. The tactical clock must recheck.
const field = SIM.create('midday-readiness');
const fs = FSE.ensure(field);
field.day = day + 120;
field.t = field.day * 1440;
FSE.tickDaily(field, SIM.calendar(field.t));
const camp = fs.war.campaign;
const boss = camp.units.CHU;
Object.assign(boss, { frontId: 'MOUND', status: 'PRESENT', x: 49, y: 49 });
const soldier = field.npcs.find(n => !n.dead && !n.exiled);
const fighter = { id: 'readiness:' + soldier.id, memberId: soldier.id, sectId: 'HOME', source: 'HOME', side: 'ALLIANCE', name: 'ผู้ทดสอบ',
  origin: 'NODE_HOME_SECT', hp: 82, qi: 5, stage: 5, x: 42, y: 49, ready: 0, status: 'PRESENT', objective: 'DEFEND', frontId: 'MOUND' };
camp.units[fighter.id] = fighter;
soldier.fseDeployment = fighter.id;
soldier.away = true;
const aidBefore = camp.fronts.MOUND.aid;
FSE.tickCampaign(field);
assert(camp.fronts.MOUND.aid < aidBefore && fighter.qi > 5, 'delivered supplies actually replenish a named fighter');
field.t += 30;
soldier.expId = 'rescued-by-another-party';
const hpBefore = soldier.h.state.hp;
FSE.tickCampaign(field);
assert.equal(soldier.h.state.hp, hpBefore, 'another assignment cannot be targeted mid-day');
assert.equal(soldier.expId, 'rescued-by-another-party');
assert.equal(soldier.away, true);
assert.equal(soldier.fseDeployment, undefined);
console.log('PASS Field supply consumption and mid-day deployment ownership');

// Exercise the ordinary simulation clock, including a tactical pulse away from midnight.
const live = SIM.create('campaign-game-clock');
const daily = FSE.ensure(live);
live.day = day + 120;
live.t = live.day * 1440;
FSE.tickDaily(live, SIM.calendar(live.t));
const slotBefore = daily.war.campaign.lastSlot;
const goal = live.t + 30;
let guard = 0;
while (live.t < goal && guard++ < 200) SIM.tick(live);
assert(live.t >= goal && daily.war.campaign.lastSlot > slotBefore, 'standard SIM.tick drives field combat');
console.log('PASS ordinary simulation clock advances the tactical pulse');
