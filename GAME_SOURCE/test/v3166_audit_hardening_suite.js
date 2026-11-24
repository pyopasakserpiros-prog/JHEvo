'use strict';
const fs = require('fs');
const path = require('path');
const g = require('./load.js');
const { SIM, CULT, EXPED, STATS, SK, MARTIAL, ECO, EXT, JD } = g;

function assert(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
}

console.log('=== JS2 v3.16.4-v3.16.6 Comprehensive 10-Team Audit Hardening Suite ===');

// 1. Path #59 full cross-system integration (Team 6)
const W = SIM.create({ seed: 31661, name: 'AuditHardeningSect' });
W.day = 360;
const npc = W.npcs.find(n => n && !n.dead && n.cult);
npc.cult.path = 'FALLEN_STAR_DEFIANCE';
npc.cult.sub = 'FALLEN_STAR_PRESSURE';
npc.cult.stage = 1;
const th1 = CULT.threshold(npc);
assert(Number.isFinite(th1) && th1 > 0, 'CULT.threshold(FALLEN_STAR_DEFIANCE) must be finite');
const gauge = CULT.ensurePathGauge(npc);
assert(gauge && gauge.id === 'STAR_DEFIANCE_GAUGE', 'CULT.ensurePathGauge must return STAR_DEFIANCE_GAUGE');
assert(CULT.LEGENDARY_DAO.gradeOf('FALLEN_STAR_DEFIANCE') === 'TRANSCENDENT', 'LD_PROVENANCE must classify Path #59 as TRANSCENDENT');
for (const b of ['astralShield', 'bloodFury', 'pacify']) {
  assert(!!STATS.BUFF_CATALOG[b], 'Missing ST.BUFF_CATALOG.' + b);
  assert(!!SK.STATUS[b], 'Missing SK.STATUS.' + b);
}
console.log('[PASS] 1. Path #59 cross-system wiring verified (THRESH, PATH_GAUGES, LD_PROVENANCE, 3 signature buffs)');

// 2. Strict Pre-Year-10 Leak Seal across all 6 vectors (Team 7)
let wlLeaks = 0;
for (let i = 0; i < 200; i++) {
  const wl = EXPED.generateWanderingLegend(W, { seed: 7000 + i });
  if (wl && ((wl.cult && wl.cult.path === 'FALLEN_STAR_DEFIANCE') || (wl.techs || []).some(t => String(t).startsWith('TECH_V3163_')))) wlLeaks++;
}
assert(wlLeaks === 0, 'WanderingLegend leaked Path #59/techs pre-Y10: ' + wlLeaks);
const preDisc = MARTIAL.discoverableTechniques({ W });
assert(preDisc.filter(t => String(t.id).startsWith('TECH_V3163_')).length === 0, 'Knowledge discoverableTechniques leaked TECH_V3163_* pre-Y10');
const uiSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ui.js'), 'utf8');
assert(uiSrc.includes("if (inp.id === 'editCultPath' || inp.id === 'editRootCount') return;"), 'Edit Hub #editCultPath guard missing in ui.js');
console.log('[PASS] 2. Pre-Year-10 leak seal (0/200 wandering legends, 0 knowledge techs) & Edit Hub #editCultPath fix verified');

// 3. Post-Year-10 organic choosePath pick rate (Team 6)
const W2 = SIM.create({ seed: 31662, name: 'PostY10Sect' });
EXPED.FALLEN_STAR_EPIC.ensure(W2).path59Unlocked = true;
const dummy = W2.npcs.find(n => n && !n.dead);
let picked59 = 0;
for (let i = 0; i < 400; i++) {
  const ch = CULT.choosePath(dummy, W2.rng, null, W2);
  if (ch && ch.path === 'FALLEN_STAR_DEFIANCE') picked59++;
}
assert(picked59 >= 1 && picked59 < 250, 'Post-Y10 organic Path #59 pick rate out of healthy bounds: ' + picked59 + '/400');
console.log('[PASS] 3. Post-Year-10 organic Path #59 pick rate verified: ' + picked59 + '/400');

// 4. Year-10 natural war balance (multi-clash, non-instant kill) & Both Outcomes reachable (Team 4 & 5)
const DAY_TICKS = SIM.DAY || 1440;
let minClashes = 999;
for (const sd of [101, 202, 303]) {
  const Wn = SIM.create({ seed: sd, name: 'BalSect' + sd });
  const FSE = EXPED.FALLEN_STAR_EPIC;
  EXPED.LIVING_SECTS.ensureWorldState(Wn);
  const st = FSE.ensure(Wn);
  for (let d = 360; d <= 4000; d += 10) {
    Wn.day = d; Wn.t = d * DAY_TICKS;
    FSE.tickDaily(Wn, SIM.calendar(Wn.t));
    if (st.outcome) break;
  }
  assert(st.outcome === 'VICTORY' || st.outcome === 'DEFEAT_PEAR_SMOKE', 'Seed ' + sd + ' did not resolve');
  assert(st.war && st.war.clashesResolved >= 2, 'Seed ' + sd + ' resolved in 1-clash instant kill!');
  minClashes = Math.min(minClashes, st.war.clashesResolved);
}
// Verify divided/high-suspicion continent naturally reaches DEFEAT_PEAR_SMOKE
const Wdiv = SIM.create({ seed: 404, name: 'DividedSect' });
EXPED.LIVING_SECTS.ensureWorldState(Wdiv);
const stDiv = EXPED.FALLEN_STAR_EPIC.ensure(Wdiv);
stDiv.repairedVaults = 9;
stDiv.sectSuspicion = 95;
for (let d = 3600; d <= 4000; d += 10) {
  Wdiv.day = d; Wdiv.t = d * DAY_TICKS;
  EXPED.FALLEN_STAR_EPIC.tickDaily(Wdiv, SIM.calendar(Wdiv.t));
  if (stDiv.outcome) break;
}
assert(stDiv.outcome === 'DEFEAT_PEAR_SMOKE', 'High-suspicion/9-vaults continent should naturally reach DEFEAT_PEAR_SMOKE, got ' + stDiv.outcome);
console.log('[PASS] 4. Natural Year-10 war balance verified (minClashes=' + minClashes + ', divided continent -> ' + stDiv.outcome + ')');

// 5. Dynamic Star-Ash Mound loot & Relic drop (Team 8)
const Wrel = SIM.create({ seed: 31665, name: 'RelicSect' });
const stRel = EXPED.FALLEN_STAR_EPIC.ensure(Wrel);
stRel.path59Unlocked = true;
stRel.outcome = 'DEFEAT_PEAR_SMOKE';
stRel.starAshMoundState = 'WHITE_PEAR_GROVE';
const realm = EXPED.spawnSecretRealm(Wrel, 'REALM_STAR_ASH_MOUND', { quiet: true });
assert(realm.rewardMatIds.length === 1 && realm.rewardMatIds[0] === 'MAT_V3163_PEAR_ASH_DEW', 'White Pear Grove should only drop MAT_V3163_PEAR_ASH_DEW');
realm.entrants = realm.entrants.filter(e => e.entrantType === 'PLAYER_SECT');
const gearBefore = (Wrel.sect.gear || []).length;
EXPED.resolveSecretRealmRace(Wrel, realm.id, { quiet: true });
assert((Wrel.sect.gear || []).length === gearBefore + 1, 'Relic must drop into W.sect.gear');
console.log('[PASS] 5. Dynamic Star-Ash Mound loot & Relic drop verified (' + realm.awardedRelicId + ')');

// 6. Save/Load Y10 Q1 no duplicate Y10_AWAKEN + ORE category check + Book #106 Canon date (Team 2, 9, 10)
const Ws = SIM.create({ seed: 31666, name: 'SaveSect' });
Ws.day = 3600; Ws.t = 3600 * DAY_TICKS;
EXPED.FALLEN_STAR_EPIC.tickDaily(Ws, SIM.calendar(Ws.t));
const Wsb = SIM.deserialize(SIM.serialize(Ws));
assert(Wsb.world.fallenStarEpic.y10AwakenedLogged === true, 'y10AwakenedLogged must survive SIM.serialize');
const rBefore = Wsb.world.fallenStarEpic.rumorLog.length;
Wsb.day = 3601; Wsb.t = 3601 * DAY_TICKS;
EXPED.FALLEN_STAR_EPIC.tickDaily(Wsb, SIM.calendar(Wsb.t));
assert(Wsb.world.fallenStarEpic.rumorLog.length === rBefore, 'Y10_AWAKEN must not fire twice after reload');
Wsb.world.fallenStarEpic.oreSpikeUntilDay = 3650;
assert(EXPED.FALLEN_STAR_EPIC.getOrePriceMultiplier(Wsb, 'MAT_HERB_JADE_LOTUS_2') === 1, 'Non-ORE herb must not get ore spike');
const b106Src = fs.readFileSync(path.join(__dirname, '..', 'data', 'lore_chronicle_b106_fallen_star_pear_blossom.js'), 'utf8');
assert(b106Src.includes('เดือนสิบเอ็ดน้ำค้างแข็ง วันที่ 1–5') && !b106Src.includes('โลกใบนัน'), 'Book #106 canon date & typo fix missing');
console.log('[PASS] 6. Save/Load Y10 Q1, exact ORE category check & Book #106 Canon alignment verified');

console.log('ALL 6/6 CHECKS PASSED — JS2 v3.16.4-v3.16.6 Audit Hardening verified!');
