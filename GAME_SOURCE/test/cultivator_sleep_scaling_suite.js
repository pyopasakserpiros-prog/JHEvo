/* cultivator_sleep_scaling_suite.js — ทดสอบระดับเทียบเคียงและการลดความถี่ในการนอนของผู้ฝึกตน */
'use strict';
const assert = require('assert');
const g = require('./load');
const U = g.U;
const HC = g.HC;
const CULT = g.CULT;
const SECT = g.SECT;
const ECO = g.ECO;
const AI = g.AI;

HC.nowDay = 1;

console.log('=== RUNNING CULTIVATOR SLEEP SCALING SUITE ===');

function makeTestNpc(opts) {
  opts = opts || {};
  const rng = new U.RNG(opts.seed || 12345);
  const npc = HC.generate(rng, { id: opts.id || 'test_npc_1' });
  npc.rank = opts.rank || 1;
  npc.bed = 0;
  npc.cool = {};
  npc.n = 0;
  npc.h.state.rest = opts.rest != null ? opts.rest : 100;
  npc.h.state.energy = opts.energy != null ? opts.energy : 100;
  npc.h.state.satiety = opts.satiety != null ? opts.satiety : 100;
  npc.h.state.hp = CULT.hpMax(npc);
  npc.act = { id: opts.actId || 'idle', stage: 'do', left: 60, total: 60, ctx: {}, why: [] };
  if (opts.cult) {
    npc.cult = {
      path: opts.cult.path,
      sub: opts.cult.sub || (CULT.PATHS[opts.cult.path].subPaths[0].id),
      stage: opts.cult.stage || 1,
      prog: 0,
      techs: [],
      toxic: 0,
      attempts: 0
    };
    if (opts.cult.track) npc.cult.track = opts.cult.track;
  } else {
    npc.cult = null;
  }
  return npc;
}

function makeMockWorld(hour) {
  const t = Math.round((hour || 12) * 60);
  return {
    t,
    day: 1,
    rng: new U.RNG(999),
    sect: { library: [], stock: {}, meals: 10 },
    map: {
      byId: { meditation_hall: { level: 1 }, training_ground: { level: 1 } },
      stations: [{ occ: null, type: 'bed', kind: 'sleep' }]
    },
    fame: () => {},
    log: () => {}
  };
}

// ---------------------------------------------------------------------------
// TEST 1: Equivalent Realm / Stage Calculation (ระดับเทียบเคียง)
// ---------------------------------------------------------------------------
console.log('Test 1: Equivalent stage calculation across all paths');
{
  const mortal = makeTestNpc({ cult: null });
  assert.equal(CULT.equivalentStage(mortal), 0, 'Mortal equivalent stage must be 0');

  // Xian path (9 stages: 1..9)
  const xian1 = makeTestNpc({ cult: { path: 'XIAN', stage: 1 } });
  const xian4 = makeTestNpc({ cult: { path: 'XIAN', stage: 4 } });
  const xian9 = makeTestNpc({ cult: { path: 'XIAN', stage: 9 } });
  assert.equal(CULT.equivalentStage(xian1), 1, 'Xian stage 1 equivalent must be 1');
  assert.equal(CULT.equivalentStage(xian4), 4, 'Xian stage 4 (Golden Core) equivalent must be 4');
  assert.equal(CULT.equivalentStage(xian9), 9, 'Xian stage 9 (Celestial Immortal) equivalent must be 9');

  // Body path (5 stages: maps to [1, 2.5, 4.5, 6.8, 9])
  const body1 = makeTestNpc({ cult: { path: 'BODY', stage: 1 } });
  const body2 = makeTestNpc({ cult: { path: 'BODY', stage: 2 } });
  const body3 = makeTestNpc({ cult: { path: 'BODY', stage: 3 } });
  const body4 = makeTestNpc({ cult: { path: 'BODY', stage: 4 } });
  const body5 = makeTestNpc({ cult: { path: 'BODY', stage: 5 } });
  assert.equal(CULT.equivalentStage(body1), 1, 'Body stage 1 equivalent must be 1');
  assert.equal(CULT.equivalentStage(body2), 2.5, 'Body stage 2 equivalent must be 2.5');
  assert.equal(CULT.equivalentStage(body3), 4.5, 'Body stage 3 (Golden Body) equivalent must be 4.5');
  assert.equal(CULT.equivalentStage(body4), 6.8, 'Body stage 4 (Vajra Body) equivalent must be 6.8');
  assert.equal(CULT.equivalentStage(body5), 9, 'Body stage 5 (Ancient Body Immortal) equivalent must be 9');

  // Crucial check: Body stage 3 (4.5) is on par with Xian stage 4 (4.0) or higher!
  assert(CULT.equivalentStage(body3) >= CULT.equivalentStage(xian4), 'Body Stage 3 equivalent realm must equal or exceed Xian Stage 4');
  assert.equal(CULT.equivalentStage(body5), CULT.equivalentStage(xian9), 'Body Stage 5 and Xian Stage 9 are both peak equivalent stage 9');

  // God path (4 stages: maps to [1, 3.2, 6.2, 9])
  const god1 = makeTestNpc({ cult: { path: 'GOD', stage: 1 } });
  const god2 = makeTestNpc({ cult: { path: 'GOD', stage: 2 } });
  const god3 = makeTestNpc({ cult: { path: 'GOD', stage: 3 } });
  const god4 = makeTestNpc({ cult: { path: 'GOD', stage: 4 } });
  assert.equal(CULT.equivalentStage(god1), 1, 'God stage 1 equivalent must be 1');
  assert.equal(CULT.equivalentStage(god2), 3.2, 'God stage 2 equivalent must be 3.2');
  assert.equal(CULT.equivalentStage(god3), 6.2, 'God stage 3 equivalent must be 6.2');
  assert.equal(CULT.equivalentStage(god4), 9, 'God stage 4 equivalent must be 9');

  // Demon & Heart/Soul paths (9 stages: 1..9)
  const demon4 = makeTestNpc({ cult: { path: 'DEMON', stage: 4 } });
  const heart4 = makeTestNpc({ cult: { path: 'HEART_SOUL', stage: 4 } });
  assert.equal(CULT.equivalentStage(demon4), 4, 'Demon stage 4 equivalent must be 4');
  assert.equal(CULT.equivalentStage(heart4), 4, 'Heart Soul stage 4 equivalent must be 4');
  console.log('PASS: Equivalent stage mapping validates correctly across all 5 paths');
}

// ---------------------------------------------------------------------------
// TEST 2: Passive Rest Drain Scaling (ยิ่งระดับสูง ยิ่งผลาญพลังพักผ่อนช้าลง)
// ---------------------------------------------------------------------------
console.log('Test 2: Passive rest drain decreases as equivalent realm increases');
{
  const W = makeMockWorld(12);

  const mortal = makeTestNpc({ cult: null, actId: 'idle', rest: 100 });
  const xian1 = makeTestNpc({ cult: { path: 'XIAN', stage: 1 }, actId: 'idle', rest: 100 });
  const xian4 = makeTestNpc({ cult: { path: 'XIAN', stage: 4 }, actId: 'idle', rest: 100 });
  const body3 = makeTestNpc({ cult: { path: 'BODY', stage: 3 }, actId: 'idle', rest: 100 }); // equiv 4.5
  const xian8 = makeTestNpc({ cult: { path: 'XIAN', stage: 8 }, actId: 'idle', rest: 100 });

  // Simulate 120 minutes (2 hours) of idle awake time
  for (let m = 0; m < 120; m++) {
    AI.needs(W, mortal);
    AI.needs(W, xian1);
    AI.needs(W, xian4);
    AI.needs(W, body3);
    AI.needs(W, xian8);
  }

  const drainMortal = 100 - mortal.h.state.rest;
  const drainXian1 = 100 - xian1.h.state.rest;
  const drainXian4 = 100 - xian4.h.state.rest;
  const drainBody3 = 100 - body3.h.state.rest;
  const drainXian8 = 100 - xian8.h.state.rest;

  console.log('  Drain over 2 hours awake:', {
    Mortal: drainMortal.toFixed(2),
    Xian1: drainXian1.toFixed(2),
    Xian4: drainXian4.toFixed(2),
    Body3_equiv4_5: drainBody3.toFixed(2),
    Xian8: drainXian8.toFixed(2)
  });

  assert(drainMortal > drainXian1, 'Mortal must drain rest faster than Stage 1 cultivator');
  assert(drainXian1 > drainXian4, 'Stage 1 cultivator must drain rest faster than Stage 4 cultivator');
  assert(drainXian4 > drainXian8, 'Stage 4 cultivator must drain rest faster than Stage 8 cultivator');

  // Parity check: Body Stage 3 (equiv 4.5) should drain rest as slow as or slower than Xian Stage 4 (equiv 4.0)
  assert(drainBody3 <= drainXian4, 'Body Stage 3 (equiv 4.5) rest drain must be <= Xian Stage 4 (equiv 4.0)');
  console.log('PASS: Passive rest drain scales smoothly with equivalent stage');
}

// ---------------------------------------------------------------------------
// TEST 3: Cultivation Meditation Restores Rest (บำเพ็ญภาวนาคือการพักผ่อนของเซียน)
// ---------------------------------------------------------------------------
console.log('Test 3: High cultivators sustain or recover rest during meditation');
{
  const W = makeMockWorld(14);
  const xian4 = makeTestNpc({ cult: { path: 'XIAN', stage: 4 }, actId: 'cultivate', rest: 60 });
  const startRest = xian4.h.state.rest;

  // Simulate 60 minutes of cultivation
  for (let m = 0; m < 60; m++) {
    AI.needs(W, xian4);
    AI.step(W, xian4);
  }

  const endRest = xian4.h.state.rest;
  console.log('  Rest before cultivate:', startRest, 'Rest after 1h cultivate:', endRest.toFixed(2));
  assert(endRest > startRest, 'Cultivating must replenish rest for high realm cultivator, not drain it');
  console.log('PASS: Meditation recovers rest for cultivators');
}

// ---------------------------------------------------------------------------
// TEST 4: Sleep Score and Nighttime Wakefulness (ไม่ง่วงตอนกลางคืนเหมือนปุถุชน)
// ---------------------------------------------------------------------------
console.log('Test 4: Sleep desire scoring at night and alertness');
{
  const W_night = makeMockWorld(22.5); // 22:30 at night

  function getSleepScore(n) {
    const S = { u: 0, why: [], add(l, v) { this.u += v; this.why.push([l, v]); } };
    AI.ACTS.sleep.score(n, W_night, S);
    return S;
  }

  const mortal = makeTestNpc({ cult: null, rest: 75 });
  const xian4 = makeTestNpc({ cult: { path: 'XIAN', stage: 4 }, rest: 75 });
  const body3 = makeTestNpc({ cult: { path: 'BODY', stage: 3 }, rest: 75 }); // equiv 4.5
  const xian9 = makeTestNpc({ cult: { path: 'XIAN', stage: 9 }, rest: 75 });

  const scoreMortal = getSleepScore(mortal).u;
  const scoreXian4 = getSleepScore(xian4).u;
  const scoreBody3 = getSleepScore(body3).u;
  const scoreXian9 = getSleepScore(xian9).u;

  console.log('  Sleep desire at 22:30 with 75% rest:', {
    Mortal: scoreMortal.toFixed(2),
    Xian4: scoreXian4.toFixed(2),
    Body3_equiv4_5: scoreBody3.toFixed(2),
    Xian9: scoreXian9.toFixed(2)
  });

  // Mortal at night with 75% rest wants to sleep (score > 0)
  assert(scoreMortal > 0, 'Mortal at night should want to sleep');

  // Cultivators with 75% rest are completely alert, score is deeply negative (do not want to sleep)
  assert(scoreXian4 < 0, 'Xian Stage 4 with 75% rest must NOT want to sleep at night');
  assert(scoreBody3 < 0, 'Body Stage 3 with 75% rest must NOT want to sleep at night');
  assert(scoreXian9 < scoreXian4, 'Peak cultivator (Xian 9) must have even lower sleep urge than Stage 4');

  // Cultivators with high rest (>= 85) are blocked from taking sleep action
  const xian4_rested = makeTestNpc({ cult: { path: 'XIAN', stage: 4 }, rest: 90 });
  assert.equal(AI.ACTS.sleep.can(xian4_rested, W_night), false, 'Rested Stage 4 cultivator cannot take sleep action');

  console.log('PASS: High cultivators do not get sleepy at night when rest is adequate');
}

// ---------------------------------------------------------------------------
// TEST 5: Sleep Wakeup Behavior (ตื่นทันทีเมื่อพักผ่อนเต็ม ไม่นอนแช่จนเช้า)
// ---------------------------------------------------------------------------
console.log('Test 5: Cultivators wake up immediately when refreshed without waiting for dawn');
{
  const W_midnight = makeMockWorld(1.0); // 01:00 AM in the middle of the night
  const xian4_sleeping = makeTestNpc({ cult: { path: 'XIAN', stage: 4 }, actId: 'sleep', rest: 97 });
  const mortal_sleeping = makeTestNpc({ cult: null, actId: 'sleep', rest: 97 });

  const resXian = AI.ACTS.sleep.tick(xian4_sleeping, W_midnight, { out: false });
  const resMortal = AI.ACTS.sleep.tick(mortal_sleeping, W_midnight, { out: false });

  assert.equal(resXian, 'done', 'Cultivator who reaches full rest wakes up immediately at night');
  assert.notEqual(resMortal, 'done', 'Mortal stays in bed waiting for dawn (05:30 AM)');
  console.log('PASS: Cultivators awaken immediately when refreshed');
}

console.log('=== ALL CULTIVATOR SLEEP SCALING TESTS PASSED ===');
