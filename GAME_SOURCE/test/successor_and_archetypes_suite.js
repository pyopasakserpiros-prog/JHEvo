'use strict';
const assert = require('assert');
const G = require('./load.js');
const { SECT, SIM, CULT, HC, CPE } = G;

console.log('--- TEST SUITE: SUCCESSOR DISCIPLE & SECT ARCHETYPES ---');

// 1. Verify disciples office definition and state
assert(SECT.POSTS.disciples, 'disciples must be an active post in SECT.POSTS');
assert.strictEqual(SECT.POSTS.disciples.nameTh, 'ศิษย์สืบทอด');
assert(!SECT.PLANNED_POSTS.disciples, 'disciples must not remain in SECT.PLANNED_POSTS');
assert(Object.keys(SECT.PLANNED_POSTS).length >= 4, 'PLANNED_POSTS must retain at least 4 future posts');

// 2. Test Successor Election
{
  const W = SIM.create('elect-succ-1', { masterIdx: 0, archetype: 'sword' });
  const master = W.byId[W.sect.masterId];
  // Add some disciples
  const d1 = SIM.addNpc(W, { rank: 2, stage: 2, merit: 60 });
  const d2 = SIM.addNpc(W, { rank: 1, stage: 1, merit: 20 });
  // Add an elder without office and an elder with office
  const elderFloat = SIM.addNpc(W, { rank: 4, stage: 3, merit: 100 });
  const elderMartial = SIM.addNpc(W, { rank: 4, stage: 3, merit: 150 });
  SECT.appoint(W, 'martial', elderMartial);

  assert(!SECT.holder(W, 'disciples'), 'Successor office initially vacant');

  const electRes = SECT.electSuccessor(W);
  assert(electRes.ok, 'Election must succeed');
  assert(electRes.winner, 'Election must declare a winner');
  assert.strictEqual(electRes.winner.post, 'disciples', 'Winner must hold disciples post');
  assert(electRes.winner.rank >= 3, 'Winner must be elevated to at least rank 3 (Core/Successor)');
  assert.strictEqual(W.sect.successorId, electRes.winner.id, 'W.sect.successorId must match winner id');
  assert(W.sect.successorElection, 'W.sect.successorElection record must exist');
  console.log('PASS 1: Successor election with weighted voting and elevation to rank >= 3');
}

// 3. Test Succession upon Master Death with Active Successor
{
  const W = SIM.create('succ-death-1', { masterIdx: 0, archetype: 'sword' });
  const master = W.byId[W.sect.masterId];
  const succ = SIM.addNpc(W, { rank: 2, stage: 2 });
  SECT.appoint(W, 'disciples', succ);
  assert.strictEqual(SECT.holder(W, 'disciples').id, succ.id);

  // Master passes away
  master.dead = true;
  master.h.state.hp = 0;

  // Succession is triggered
  const newMaster = SECT.succession(W, 'เจ้าสำนักละสังขาร');
  assert(newMaster, 'New master must ascend');
  assert.strictEqual(newMaster.id, succ.id, 'Successor must directly ascend to Sect Master');
  assert.strictEqual(newMaster.rank, 6, 'New master must be rank 6');
  assert.strictEqual(W.sect.masterId, succ.id, 'W.sect.masterId must be updated to successor');
  assert.strictEqual(SECT.holder(W, 'disciples'), null, 'Successor post becomes vacant for next election');
  console.log('PASS 2: Successor immediately inherits Sect Master title upon master death');
}

// 4. Test Succession when NO Successor exists (Cascades to rank >= 1, never leaves sect headless)
{
  const W = SIM.create('succ-death-no-succ', { masterIdx: 0, archetype: 'sword' });
  const master = W.byId[W.sect.masterId];
  // Remove all other high ranks; keep only 2 outer disciples (rank 1)
  W.npcs.forEach(n => {
    if (n.id !== master.id) {
      n.rank = 1;
      n.post = null;
    }
  });

  master.dead = true;
  const newMaster = SECT.succession(W, 'เจ้าสำนักเสียชีวิตฉับพลันไร้ผู้สืบทอด');
  assert(newMaster, 'Sect must elect from surviving disciples, cascading down');
  assert.strictEqual(newMaster.rank, 6, 'Cascaded disciple must be promoted to rank 6 Sect Master');
  assert.strictEqual(W.sect.masterId, newMaster.id, 'W.sect.masterId must be the newly elected member');
  assert(!newMaster.dead, 'New master must be alive');
  console.log('PASS 3: Headless recovery cascades down to surviving disciples');
}

// 5. Test Auto-healing of existing dead master in daily ticks
{
  const W = SIM.create('succ-heal-daily', { masterIdx: 0, archetype: 'sword' });
  const master = W.byId[W.sect.masterId];
  master.dead = true;

  // Run daily update
  SIM.dailyUpdate(W);
  const curMaster = W.byId[W.sect.masterId];
  assert(curMaster && !curMaster.dead, 'Daily update must self-heal dead master vacancy');
  assert.strictEqual(curMaster.rank, 6);
  console.log('PASS 4: Daily update self-heals existing dead master saves');
}

// 6. Test 8 Sect Archetypes
const archetypes = ['sword', 'blade', 'spear', 'fist', 'alchemy', 'bow', 'staff', 'focus'];
for (const archId of archetypes) {
  const W = SIM.create('arch-test-' + archId, { masterIdx: 0, archetype: archId });
  const S = W.sect;
  const archDef = SECT.ARCHETYPES[archId];

  assert.strictEqual(S.archetype, archId, 'Sect archetype must match ' + archId);
  assert(S.library.length >= 10 && S.library.length < (globalThis.JD.TECH.techniques.length + globalThis.JD.TECH.mantras.length) * .15, 'Library must remain a curated minority of the registered catalog');
  assert.equal(new Set(S.library).size, S.library.length, 'Starting library has no duplicated unlocks');
  S.library.forEach(id => assert(CULT.tech(id), 'Starting library references a real technique'));
  
  // Verify all archetype signature techniques are in library
  for (const tid of archDef.techs) {
    assert(S.library.includes(tid), 'Sect library must contain signature tech ' + tid);
  }

  // Verify crystals in sect
  for (const [k, qty] of Object.entries(archDef.crystals)) {
    assert(S.crystals[k] >= qty, 'Sect crystals must have ' + k);
  }

  // Verify unlocked subs
  for (const s of archDef.subs) {
    assert(S.unlockedSubs.includes(s), 'Unlocked subs must include ' + s);
  }

  // Verify CP economy integrates properly: T1 is free, T2+ requires fee
  const c = CPE.S(W);
  assert(c.freeLib && c.freeLib.length > 0, 'freeLib must contain foundational T1 techniques');
  for (const fid of c.freeLib) {
    const t = CULT.tech(fid);
    assert(t.tier <= 1, 'Free library techniques must be tier 1');
  }

  console.log('PASS 5: Archetype ' + archId + ' (' + archDef.nameTh + ') verified with ' + S.library.length + ' techniques and proper subpaths');
}

console.log('--- ALL SUCCESSOR & ARCHETYPE TESTS PASSED SUCCESSFULLY! ---');
