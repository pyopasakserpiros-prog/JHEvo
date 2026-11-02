'use strict';
const assert = require('node:assert/strict');
const { SIM, SECT, CULT, ECO } = require('./load.js');

console.log('=== Running v2.0.11 Tribulation, Ascension & Design Audit Suite ===');

// Every path reaches the same ascension threshold at its own path-specific cap.
{
  const W = SIM.create('v211_all_path_eligibility');
  const candidate = W.byId[W.sect.masterId];
  for (const path of Object.keys(CULT.PATHS)) {
    candidate.cult.path = path;
    candidate.cult.stage = CULT.maxStage(candidate);
    candidate.cult.ascensionCooldownUntilDay = 0;
    assert.equal(CULT.equivalentStage(candidate), 9, path + ' maximum must map to equivalent stage 9');
    assert.equal(SECT.canBeginCelestialTribulation(W, candidate).ok, true, path + ' should qualify at its own maximum');
  }
}

// Start reserves a viable team and resources; active preparation survives save/load.
{
  const W = SIM.create('v211_tribulation_preparation');
  const candidate = W.byId[W.sect.masterId];
  candidate.cult.path = 'XIAN';
  candidate.cult.stage = CULT.maxStage(candidate);
  const helpers = W.npcs.filter(n => n && n !== candidate && !n.dead && n.cult);
  assert(helpers.length >= 2, 'fixture must have two helpers');
  helpers[0].cult.path = 'BODY';
  helpers[1].cult.path = 'SAGE_SUPPORT';
  W.sect.successorId = helpers[0].id;
  ECO.add(W, 'P:REC190_PILL_004', 1);
  const started = SECT.beginCelestialTribulation(W, candidate.id);
  assert(started && started.ok, 'eligible candidate should start preparation');
  assert(started.attempt.supportRoles && Object.values(started.attempt.supportRoles).includes('guardian') && Object.values(started.attempt.supportRoles).includes('healer'), 'support team should include defensive and healing roles where available');
  assert.equal(W.sect.stones, 500, 'start should pay the stated 500-stone cost');
  assert.equal(ECO.count(W, 'P:REC190_PILL_004'), 0, 'available restorative pill should be used once');
  assert(started.attempt.supportIds.length >= 2 && started.attempt.supportIds.length <= 3, 'candidate should have two or three automatic helpers');
  assert(started.attempt.chance >= 0.45 && started.attempt.chance <= 0.90, 'trial probability should remain bounded');
  assert([candidate, ...started.attempt.supportIds.map(id => W.byId[id])].every(n => n.away), 'all ritual participants should be secluded during preparation');

  const loaded = SIM.deserialize(SIM.serialize(W));
  assert.equal(loaded.sect.celestialTribulation.active.id, started.attempt.id, 'active attempt should survive save/load');
  assert.deepEqual(loaded.sect.celestialTribulation.active.supportIds, started.attempt.supportIds);
  assert(started.attempt.resolveDay - started.attempt.startedDay === 3, 'preparation should last three days');

  const runWorld = loaded;
  const runCandidate = runWorld.byId[candidate.id];
  const deathsBefore = runWorld.deaths;
  runWorld.rng.next = () => 0;
  runWorld.day = started.attempt.resolveDay;
  runWorld.t = runWorld.day * 1440;
  SECT.daily(runWorld);
  const result = runWorld.sect.celestialTribulation.history[0];
  assert(result && result.ascended, 'low roll should complete the ascension on the daily simulation path');
  assert(!runWorld.npcs.includes(runCandidate), 'ascended cultivator should leave the active sect');
  assert(runWorld.gone.includes(candidate.id), 'ascended cultivator should be retired, not killed');
  assert.equal(runWorld.deaths, deathsBefore, 'ascension must not increase death count');
  assert.notEqual(runWorld.sect.masterId, candidate.id, 'master succession should complete before retirement');
  assert(runWorld.byId[runWorld.sect.masterId] && !runWorld.byId[runWorld.sect.masterId].dead, 'succession should leave a living sect master');
  assert.equal(runWorld.sect.ascendedLegacyCount, 1);
  assert.equal(SECT.ascensionCultivationMultiplier(runWorld), 1.01);
  assert(runWorld.sect.legacyTablets.some(t => t.npcId === candidate.id && t.ascended), 'ascended will should be inscribed at the shrine');
  assert.equal(runWorld.sect.celestialTribulation.active, null, 'resolved event should clear active state');
  const beneficiary = runWorld.npcs.find(n => n && !n.dead && n.cult);
  const baselineWorld = SIM.create('v211_heritage_baseline');
  const baseline = baselineWorld.npcs.find(n => n && n.cult);
  beneficiary.cult.prog = baseline.cult.prog = 0;
  CULT.gain(beneficiary, 100, runWorld, 'v211_heritage_test');
  CULT.gain(baseline, 100, baselineWorld, 'v211_heritage_test');
  assert(Math.abs(beneficiary.cult.prog / baseline.cult.prog - 1.01) < 0.001, 'ascended heritage should grant a bounded one-percent sect cultivation bonus');

  runWorld.sect.ascendedLegacyCount = 100;
  assert.equal(SECT.ascensionCultivationMultiplier(runWorld), 1.05, 'permanent legacy bonus must cap at five percent');
}

// A failed trial is recoverable, releases the team, and prevents immediate retries.
{
  const W = SIM.create('v211_tribulation_failure');
  const candidate = W.byId[W.sect.masterId];
  candidate.cult.path = 'BODY';
  candidate.cult.stage = CULT.maxStage(candidate);
  candidate.h.state.hp = CULT.hpMax(candidate);
  ECO.add(W, 'P:REC190_PILL_004', 1);
  const start = SECT.beginCelestialTribulation(W, candidate.id, { useMedicine: false });
  assert(start && start.ok);
  assert.equal(start.attempt.medicineId, null, 'player should be able to preserve a restorative pill');
  assert.equal(ECO.count(W, 'P:REC190_PILL_004'), 1);
  const deathsBefore = W.deaths;
  W.rng.next = () => 0.999;
  W.day = start.attempt.resolveDay;
  W.t = W.day * 1440;
  SECT.daily(W);
  const result = W.sect.celestialTribulation.history[0];
  assert(result && result.status === 'failed' && !result.ascended, 'high roll should resolve as a failed trial');
  assert(W.npcs.includes(candidate) && !candidate.dead, 'failure must leave the candidate alive in the sect');
  assert.equal(W.deaths, deathsBefore, 'failure must not count as a death');
  assert(candidate.inj && candidate.inj.length, 'failure should have a recoverable cost');
  assert.equal(candidate.ascensionCooldownUntilDay, W.day + 90, 'failure should impose a 90-day retry cooldown');
  assert(W.npcs.filter(n => n !== candidate).every(n => !n.away), 'surviving helpers should be released');
  assert.equal(SECT.canBeginCelestialTribulation(W, candidate).reason, 'cooldown');
}

// New state hydrates safely for a pre-v2.0.11 save.
{
  const W = SIM.create('v211_legacy_hydration');
  delete W.sect.celestialTribulation;
  delete W.sect.ascendedLegacyCount;
  const loaded = SIM.deserialize(SIM.serialize(W));
  assert.equal(loaded.sect.celestialTribulation, undefined, 'loading a legacy save should not mutate its serialized state before the feature is used');
  const state = SECT.ensureCelestialTribulation(loaded);
  assert.equal(state.active, null);
  assert.deepEqual(state.history, []);
  assert.equal(loaded.sect.ascendedLegacyCount, 0);
}

console.log('PASS v211_tribulation_ascension_suite');
