'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const g = require('./load');

const ROOT = path.resolve(__dirname, '..');

function stepYear10(W, daysCount) {
  const FSE = g.EXPED.FALLEN_STAR_EPIC;
  const startOff = (g.SIM.CALENDAR && g.SIM.CALENDAR.START_DAY_OFFSET) || 360;
  const y10StartDay = startOff + 9 * 360; // Year 10 Month 1 Day 1
  for (let d = 0; d < daysCount; d++) {
    W.day = y10StartDay + d;
    W.t = W.day * 1440;
    const cal = g.SIM.calendar(W.t);
    FSE.tickDaily(W, cal, { silent: false });
  }
}

function run() {
  console.log('=== JS2 v3.16.2 Year-10 Chu Wangxuan & Two Unscripted Outcomes Suite ===');
  const FSE = g.EXPED.FALLEN_STAR_EPIC;
  assert(FSE && String(FSE.VERSION || '').startsWith('3.16.'), 'FSE version must be 3.16.x');

  // 1. Q1 Peaceful Pilgrim -> Q2 Revelation, Lacquered Pear Pin & Crushing Mo Changyue
  {
    const W = g.SIM.create('v3162_q1_q2_check');
    if (g.EXPED.LIVING_SECTS && g.EXPED.LIVING_SECTS.ensureWorldState) g.EXPED.LIVING_SECTS.ensureWorldState(W);
    const st = FSE.ensure(W);
    st.repairedVaults = 4;
    st.sectSuspicion = 25;

    // Step through Q1 (Days 0..89 = Months 1..3)
    stepYear10(W, 85);
    assert(st.chuWangxuan, 'Chu Wangxuan real entity must spawn on Year 10 M1');
    assert.strictEqual(st.chuWangxuan.id, 'FSE_BOSS_CHU_WANGXUAN');
    assert.strictEqual(st.chuWangxuan.stage, 9.5);
    assert.strictEqual(st.chuWangxuan.mode, 'PEACEFUL_PILGRIM', 'Q1 mode must be PEACEFUL_PILGRIM');
    assert.strictEqual(st.chuWangxuan.inventory.lacqueredPearPin, false, 'Pear Pin not dug up yet in Q1');
    assert.strictEqual(st.chuWangxuan.inventory.freshPearTwig, true, 'Fresh pear twig bought in Q1 M2');

    // Continue through Q2 (up to Day 160 = Month 6)
    const startOff = (g.SIM.CALENDAR && g.SIM.CALENDAR.START_DAY_OFFSET) || 360;
    const y10StartDay = startOff + 9 * 360;
    for (let d = 85; d < 160; d++) {
      W.day = y10StartDay + d;
      W.t = W.day * 1440;
      FSE.tickDaily(W, g.SIM.calendar(W.t), { silent: false });
    }
    assert.strictEqual(st.chuWangxuan.inventory.lacqueredPearPin, true, 'Lacquered Pear Pin dug up on M4 D14');
    assert.strictEqual(st.chuWangxuan.mode, 'AVENGER_WARLORD', 'Mode flips to AVENGER_WARLORD after revelation');
    const moOp = st.operatives.find(o => o.id === 'FSE_OP_MO_CHANGYUE');
    const skOp = st.operatives.find(o => o.id === 'FSE_OP_SIKONG_YAN');
    assert.strictEqual(moOp.alive, false, 'Mo Changyue must be crushed in Q2 M5');
    assert.strictEqual(skOp.alive, false, 'Sikong Yan must be crushed in Q2 M5');
    assert(st.war && st.war.tier1Max === 4 * 420, 'Tier 1 puppet army scales directly from repairedVaults (4 * 420)');
    console.log('[PASS] 1. Q1 Peaceful Pilgrim -> Q2 Pear Pin excavation, Mo Changyue crushed, 3-Tier Army formed');
  }

  // 2. Branch 1 (Unscripted VICTORY without Wife Echo)
  {
    const W = g.SIM.create('v3162_victory_branch');
    if (g.EXPED.LIVING_SECTS && g.EXPED.LIVING_SECTS.ensureWorldState) g.EXPED.LIVING_SECTS.ensureWorldState(W);
    const st = FSE.ensure(W);
    // Strong united continent: 1 vault repaired, low suspicion, high-stage cultivators & healers
    st.repairedVaults = 1;
    st.interceptedVaults = 8;
    st.sectSuspicion = 5;
    (W.npcs || []).forEach(n => {
      if (n && !n.dead && n.cult) n.cult.stage = Math.max(n.cult.stage || 1, 7);
    });
    const extSects = (W.world.allSects && W.world.allSects.length) ? W.world.allSects : (W.world.sects || []);
    extSects.forEach(s => {
      if (s && s.livingRoster && s.livingRoster.leader) {
        s.livingRoster.leader.stage = Math.max(s.livingRoster.leader.stage || 4, 8);
        (s.livingRoster.elders || []).forEach(e => { e.stage = Math.max(e.stage || 3, 7); });
      }
    });

    stepYear10(W, 360);
    assert.strictEqual(st.outcome, 'VICTORY', 'Strong united continent must organically achieve VICTORY');
    assert.strictEqual(st.wifeEchoAppeared, false, 'VICTORY branch MUST NOT summon wife echo');
    assert.strictEqual(st.starAshMoundState, 'BATTLEFIELD_CRATER', 'VICTORY leaves BATTLEFIELD_CRATER');
    assert.strictEqual(st.path59Unlocked, true, 'Path #59 unlocks after Year-10 resolution');
    assert.strictEqual(st.chuWangxuan.hp, 0, 'Chu Wangxuan HP reaches 0');
    console.log('[PASS] 2. Branch 1 (VICTORY without wife echo) resolved organically in ' + st.war.clashesResolved + ' clashes (hesitations=' + st.war.hesitationTriggers + ')');
  }

  // 3. Branch 2 (Unscripted DEFEAT -> Pear Pin White Smoke & World-Symmetric Recovery) + Save/Load + Zero-RNG
  {
    const W = g.SIM.create('v3162_defeat_branch');
    if (g.EXPED.LIVING_SECTS && g.EXPED.LIVING_SECTS.ensureWorldState) g.EXPED.LIVING_SECTS.ensureWorldState(W);
    const st = FSE.ensure(W);
    // Fractured, under-prepared continent: 9/9 vaults repaired, 90% suspicion, weak cultivators
    st.repairedVaults = 9;
    st.interceptedVaults = 0;
    st.sectSuspicion = 90;
    (W.npcs || []).forEach(n => {
      if (n && !n.dead && n.cult) {
        n.cult.stage = 1;
        n.ext = n.ext || {};
        n.ext.darkStarStain = true;
      }
    });
    const extSects = (W.world.allSects && W.world.allSects.length) ? W.world.allSects : (W.world.sects || []);
    extSects.forEach(s => {
      if (s && s.livingRoster && s.livingRoster.leader) {
        s.livingRoster.leader.stage = 1;
        s.livingRoster.leader.darkStarStain = true;
        (s.livingRoster.elders || []).forEach(e => { e.stage = 1; e.darkStarStain = true; });
        (s.livingRoster.prodigies || []).forEach(p => { p.stage = 1; });
      }
    });

    stepYear10(W, 360);
    assert.strictEqual(st.outcome, 'DEFEAT_PEAR_SMOKE', 'Fractured weak continent must organically fall into DEFEAT_PEAR_SMOKE');
    assert.strictEqual(st.wifeEchoAppeared, true, 'DEFEAT branch must awaken Wen Jingxu white-smoke echo via Pear Pin');
    assert.strictEqual(st.starAshMoundState, 'WHITE_PEAR_GROVE', 'DEFEAT blooms WHITE_PEAR_GROVE');
    assert.strictEqual(st.path59Unlocked, true, 'Path #59 unlocks after Defeat resolution too');

    // Strict World-Symmetric Non-Extinction Survival Floor verification
    const homeAlive = (W.npcs || []).filter(n => n && !n.dead);
    assert(homeAlive.length > 0, 'Home sect core disciples survive non-extinction floor');
    assert(W.sect.stones >= 120, 'Home sect stone floor preserved (>= 120)');
    const extSurviving = extSects.filter(s => s && s.livingRoster && !s.livingRoster.collapsed);
    assert(extSurviving.length > 0, 'External sects also survive non-extinction floor symmetrically');
    assert(extSurviving.every(s => s.livingRoster.treasury >= 20 && s.livingRoster.morale >= 22), 'External sect survival floor enforced symmetrically');

    // Zero-RNG getReadOnlySummary & Save/Load parity
    const rngBefore = W.rng && W.rng.s;
    const sum = FSE.getReadOnlySummary(W);
    const rngAfter = W.rng && W.rng.s;
    assert.strictEqual(rngAfter, rngBefore, 'getReadOnlySummary must be Zero-RNG');
    assert.strictEqual(sum.outcome, 'DEFEAT_PEAR_SMOKE');
    assert.strictEqual(sum.wifeEchoAppeared, true);
    assert.strictEqual(sum.path59Unlocked, true);

    const saved = g.SIM.serialize(W);
    const W2 = g.SIM.deserialize(saved);
    assert.strictEqual(W2.world.fallenStarEpic.outcome, 'DEFEAT_PEAR_SMOKE', 'Save/Load outcome parity');
    assert.strictEqual(W2.world.fallenStarEpic.starAshMoundState, 'WHITE_PEAR_GROVE', 'Save/Load mound parity');
    assert.strictEqual(W2.world.fallenStarEpic.path59Unlocked, true, 'Save/Load path59Unlocked parity');
    console.log('[PASS] 3. Branch 2 (DEFEAT -> Pear Pin White Smoke & World-Symmetric Recovery) + Zero-RNG + Save/Load verified');
  }

  // 4. UI Markers & Exact 40 <script> Tags Lock Check
  {
    const uiSrc = fs.readFileSync(path.join(ROOT, 'js', 'ui.js'), 'utf8');
    assert(uiSrc.includes('fse-year10-war-bar'), 'UI.rWorld must include fse-year10-war-bar');
    assert(uiSrc.includes('DEFEAT_PEAR_SMOKE'), 'UI.rWorld must render DEFEAT_PEAR_SMOKE banner');
    assert(uiSrc.includes('VICTORY'), 'UI.rWorld must render VICTORY banner');
    const idxHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const scriptCount = (idxHtml.match(/<script\b[^>]*src=/g) || []).length;
    assert.strictEqual(scriptCount, 40, 'index.html must preserve exact 40 <script> tags');
    console.log('[PASS] 4. UI Year-10 war/outcome markers & exact 40 <script> tags verified');
  }

  console.log('ALL 4/4 CHECKS PASSED — JS2 v3.16.2 Year-10 Chu Wangxuan Epic verified!');
}

run();
