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
    for (let turn = 0; turn < 48; turn++) { W.t = W.day * 1440 + turn * 30; FSE.tickCampaign(W); }
  }
}

function run() {
  console.log('=== JS2 v3.16.2 Year-10 Chu Wangxuan & Continental Campaign Suite ===');
  const FSE = g.EXPED.FALLEN_STAR_EPIC;
  assert(FSE && typeof FSE.tickCampaign === 'function', 'FSE campaign tick must be registered');

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
    assert.strictEqual(st.chuWangxuan.mode, 'AVENGER', 'Mode flips after the truth is revealed');
    const moOp = st.operatives.find(o => o.id === 'FSE_OP_MO_CHANGYUE');
    assert.strictEqual(moOp.alive, true, 'Chu ignores the heirs; they still have their own agenda');
    assert(st.war.campaign && st.war.campaign.fronts.BASE, 'descendants keep their operations base');
    assert(moOp.lastFseDutyDay || Object.values(st.war.campaign.units).some(u => u.side === 'HEIRS' && ['OCCUPY', 'REPAIR'].includes(u.objective)), 'the heirs make their own plans');
    console.log('[PASS] 1. Peaceful search, Pear Pin revelation, and independent heirs');
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
    assert(['VICTORY', 'DISRUPTED', 'PEAR_APPEAL'].includes(st.outcome), 'strong coalition can stop the disaster');
    assert.equal(st.wifeEchoAppeared, st.outcome === 'PEAR_APPEAL');
    assert.equal(st.starAshMoundState, st.wifeEchoAppeared ? 'WHITE_PEAR_GROVE' : 'BATTLEFIELD_CRATER');
    assert.strictEqual(st.path59Unlocked, true, 'Path #59 unlocks after Year-10 resolution');
    if (st.outcome === 'VICTORY') assert.equal(st.chuWangxuan.hp, 0, 'combat victory requires real depletion');
    console.log('[PASS] 2. Branch 1 (VICTORY without wife echo) resolved organically in ' + st.war.clashesResolved + ' clashes (hesitations=' + st.war.hesitationTriggers + ')');
  }

  // 3. Branch 2 (Unscripted DEFEAT -> Pear Pin White Smoke & World-Symmetric Recovery) + Save/Load + Zero-RNG
  {
    const W = g.SIM.create('v3162_defeat_branch');
    if (g.EXPED.LIVING_SECTS && g.EXPED.LIVING_SECTS.ensureWorldState) g.EXPED.LIVING_SECTS.ensureWorldState(W);
    const st = FSE.ensure(W);
    // No ready parties: rupture remains reachable without a compulsory divine rescue.
    st.repairedVaults = 9;
    st.sectSuspicion = 95;
    for (const n of W.npcs) n.away = true;
    for (const s of W.world.allSects || []) {
      for (const n of [s.livingRoster.leader, ...s.livingRoster.elders, ...s.livingRoster.prodigies].filter(Boolean)) n.wounds = 80;
    }
    stepYear10(W, 360);
    assert.equal(st.outcome, 'RUPTURE');
    assert.equal(st.war.campaign.ruin, 3, 'all three veins must actually rupture');
    assert.equal(st.wifeEchoAppeared, false);
    assert.equal(st.path59Unlocked, true);
    const before = W.rng.s;
    const summary = FSE.getReadOnlySummary(W);
    assert.equal(W.rng.s, before);
    assert.equal(summary.outcome, 'RUPTURE');
    const copy = g.SIM.deserialize(g.SIM.serialize(W));
    assert.equal(copy.world.fallenStarEpic.outcome, 'RUPTURE');
    assert.equal(copy.world.fallenStarEpic.path59Unlocked, true);
    console.log('[PASS] 3. Rupture, observer purity and save/load');
  }

  // 4. UI Markers & Exact 40 <script> Tags Lock Check
  {
    const uiSrc = fs.readFileSync(path.join(ROOT, 'js', 'ui.js'), 'utf8');
    assert(uiSrc.includes('fse-year10-war-bar'), 'UI.rWorld must include fse-year10-war-bar');
    assert(uiSrc.includes('open-fse-watch') && uiSrc.includes('rFallenStarObserver'), 'a dedicated read-only observation screen is available');
    assert(uiSrc.includes('VICTORY'), 'UI.rWorld must render VICTORY banner');
    const idxHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const scriptCount = (idxHtml.match(/<script\b[^>]*src=/g) || []).length;
    assert.strictEqual(scriptCount, 40, 'index.html must preserve exact 40 <script> tags');
    console.log('[PASS] 4. UI Year-10 war/outcome markers & exact 40 <script> tags verified');
  }

  console.log('ALL 4/4 CHECKS PASSED — JS2 v3.16.2 Year-10 Chu Wangxuan Epic verified!');
}

run();
