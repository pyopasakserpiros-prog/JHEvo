'use strict';
const assert = require('assert');
const G = require('./load.js');
const { SIM, HC, SECT, MARTIAL: M, CULT, ECO, STATS: ST, COMBAT } = G;

console.log('=== Running Unified Weapon Skills & Sect Archetypes Suite ===');

// 1. Verify Human Core Lock is intact
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'Human Core Fingerprint must remain locked');
console.log('  PASS 1: human_core.js byte-for-byte lock verified (155:2f9c9dd7)');

// 2. Unification of BOW, STAFF, FOCUS in h.skills & Centralized API
{
  const W = SIM.create('unify-skills-test', { masterIdx: 0, archetype: 'sword' });
  const n = W.npcs[0];
  assert(n.h && n.h.skills, 'Character must have h.skills');

  // Verify all 7 weapon skills exist in h.skills
  const weaponSkills = ['SWORD', 'BLADE', 'SPEAR', 'FIST_PALM', 'BOW', 'STAFF', 'FOCUS'];
  for (const sk of weaponSkills) {
    assert(sk in n.h.skills, 'Skill ' + sk + ' must be in h.skills');
    assert(typeof n.h.skills[sk] === 'number' && Number.isFinite(n.h.skills[sk]), 'Skill ' + sk + ' must be a valid number');
  }

  // Central read / set / add API tests
  for (const sk of ['BOW', 'STAFF', 'FOCUS']) {
    M.skillSet(n, sk, 35);
    assert.strictEqual(n.h.skills[sk], 35, sk + ' set must update h.skills directly');
    assert.strictEqual(M.skillRead(n, sk), 35, 'M.skillRead must return 35 for ' + sk);

    M.skillAdd(n, sk, 15);
    assert.strictEqual(n.h.skills[sk], 50, sk + ' add must update h.skills directly');
    assert.strictEqual(M.skillRead(n, sk), 50, 'M.skillRead must return 50 for ' + sk);

    // Practice updates h.skills directly and never martialSkills
    const beforeVal = M.skillRead(n, sk);
    const gain = M.skillPractice(n, sk, 2, 1.2);
    assert(gain > 0, 'Practice must yield gain for ' + sk);
    assert.strictEqual(M.skillRead(n, sk), beforeVal + gain, 'M.skillRead must reflect gain');
    assert.strictEqual(n.h.skills[sk], beforeVal + gain, 'h.skills[' + sk + '] must store gain');
    assert(!n.martialSkills || !(sk in n.martialSkills), 'martialSkills must not be populated for ' + sk);
  }
  console.log('  PASS 2: Centralized skill read/set/add/practice API for BOW, STAFF, FOCUS in h.skills verified');
}

// 3. Combat & Stats Integration for Unified Weapon Proficiencies
{
  const W = SIM.create('combat-skills-test', { masterIdx: 0, archetype: 'sword' });
  const n = W.npcs[0];

  const testCases = [
    { type: 'BOW', wpnId: 'MP_BOW_1', skillKey: 'BOW' },
    { type: 'STAFF', wpnId: 'MP_STAFF_1', skillKey: 'STAFF' },
    { type: 'FOCUS', wpnId: 'MP_FOCUS_1', skillKey: 'FOCUS' }
  ];

  for (const tc of testCases) {
    const item = ECO.itemById[tc.wpnId];
    assert(item, 'Weapon item ' + tc.wpnId + ' must exist');
    n.equip.WEAPON = ECO.mintGear(item, 1.0);

    assert.strictEqual(M.equippedType(n), tc.type, 'Equipped type must match ' + tc.type);

    M.skillSet(n, tc.skillKey, 10);
    ST.dirty(n);
    const lowAtk = ST.get(n).atk;

    M.skillSet(n, tc.skillKey, 90);
    ST.dirty(n);
    const highAtk = ST.get(n).atk;

    assert(highAtk > lowAtk, 'Higher ' + tc.skillKey + ' proficiency must increase combat attack');

    // Verify M.skillEffects computes skSig including bow/staff/focus without NaN
    const eff = M.skillEffects(n);
    assert(eff && eff.p && Number.isFinite(eff.p.matk) && Number.isFinite(eff.p.acc), 'Skill effects must be valid');
  }
  console.log('  PASS 3: Weapon skills affect combat power, accuracy and stats through h.skills verified');
}

// 4. All 8 Sect Archetypes Alignment (Master, Disciples & Candidate Consistency)
{
  const archetypes = ['sword', 'blade', 'spear', 'fist', 'alchemy', 'bow', 'staff', 'focus'];
  const testSeed = 'align-test-seed-404';

  for (const archKey of archetypes) {
    const archDef = SECT.ARCHETYPES[archKey];
    const wInfo = SECT.ARCHETYPE_WEAPON[archKey];
    assert(archDef && wInfo, 'Archetype definition and weapon mapping must exist for ' + archKey);

    const cands = SIM.candidates(testSeed, archKey);
    assert.strictEqual(cands.length, 3, 'Must present 3 candidates');

    for (let cIdx = 0; cIdx < 3; cIdx++) {
      const cand = cands[cIdx].npc;
      const W = SIM.create(testSeed, { masterIdx: cIdx, archetype: archKey });
      const master = W.byId[W.sect.masterId];

      // Exact identity between start screen candidate and game master
      assert.strictEqual(cand.id, master.id, 'Candidate and Master ID must match (' + archKey + ' #' + cIdx + ')');
      assert.strictEqual(HC.fullName(cand), HC.fullName(master), 'Candidate and Master full name must match');
      assert.strictEqual(cand.cult.path, master.cult.path, 'Candidate and Master path must match');
      assert.strictEqual(cand.cult.sub, master.cult.sub, 'Candidate and Master subpath must match');
      assert.strictEqual(cand.cult.stage, master.cult.stage, 'Candidate and Master stage must match');
      assert.strictEqual(cand.cult.mantra, master.cult.mantra, 'Candidate and Master mantra must match');
      assert.deepStrictEqual(cand.cult.techs, master.cult.techs, 'Candidate and Master techniques must match');
      assert.strictEqual(cand.equip.WEAPON?.id, master.equip.WEAPON?.id, 'Candidate and Master weapon must match');

      // Master proficiency in archetype weapon
      assert(master.h.skills[wInfo.skill] >= 60, 'Master ' + wInfo.skill + ' skill must be >= 60 (got ' + master.h.skills[wInfo.skill] + ')');
      assert.strictEqual(master.equip.WEAPON?.gearType, wInfo.family === 'GAUNTLET' ? 'FIST' : wInfo.family, 'Master must equip ' + wInfo.family);

      // Verify disciples
      const d1 = W.npcs[1], d2 = W.npcs[2];
      assert(archDef.subs.includes(d1.cult.sub), 'Disciple 1 subpath must belong to archetype ' + archKey);
      assert(archDef.subs.includes(d2.cult.sub), 'Disciple 2 subpath must belong to archetype ' + archKey);
      assert(d1.h.skills[wInfo.skill] >= 30, 'Disciple 1 ' + wInfo.skill + ' skill must be >= 30');
      assert(d2.h.skills[wInfo.skill] >= 30, 'Disciple 2 ' + wInfo.skill + ' skill must be >= 30');
      assert(d1.equip.WEAPON && d2.equip.WEAPON, 'Disciples must be equipped with starting weapons');

      // Verify technique rule compliance for all founding members
      [master, d1, d2].forEach((member, mIdx) => {
        for (const tId of member.cult.techs) {
          const t = CULT.tech(tId);
          assert(t, 'Technique ' + tId + ' must exist');
          assert(t.path === 'ANY' || t.path === member.cult.path, 'Tech path ' + t.path + ' must be compatible with ' + member.cult.path);
          assert((t.reqTier || t.tier) <= member.cult.stage, 'Tech tier ' + t.tier + ' must be <= member stage ' + member.cult.stage);
          const subOk = CULT.isSubCompatible ? CULT.isSubCompatible(t, member.cult.sub, false) : (!t.sub || t.sub === member.cult.sub);
          assert(subOk, 'Tech ' + tId + ' must be subpath-compatible with ' + member.cult.sub);
          if (t.innateOnly) assert.strictEqual(t.sub, member.cult.sub, 'Innate-only tech must match sub');
        }
      });
    }
  }
  console.log('  PASS 4: All 8 archetypes candidate consistency, starting master/disciple gear, skills and rule-compliant techniques verified');
}

// 5. Post-Founding Natural Growth & Subpath Acquisition (Requirement 5)
{
  const W = SIM.create('post-founding-suite', { archetype: 'bow' });
  assert.strictEqual(W._founding, false, 'W._founding must be false after initialization');

  // Spawn 25 recruits: they must awaken naturally according to standard rules, not forced to bow
  const paths = new Set();
  for (let i = 0; i < 25; i++) {
    const npc = SIM.addNpc(W, { rank: 1, stage: 1 });
    if (npc.cult) {
      paths.add(npc.cult.path);
    }
  }
  assert(paths.size >= 3, 'Post-founding recruits must diversify across multiple cultivation paths (got ' + paths.size + ')');

  // Members can naturally learn other subpaths via crystal/manual without archetype limitation
  const recruit = SIM.addNpc(W, { rank: 1, stage: 2 });
  recruit.cult.path = 'BODY';
  recruit.cult.sub = 'NONE';
  const crystalKey = 'S:STAFF_GUARD';
  recruit.inv.crystals = { [crystalKey]: 1 };
  assert(M.eligible(recruit, crystalKey).ok, 'Recruit must be eligible to learn subpath crystal');
  const res = M.useCrystal(W, recruit, crystalKey);
  assert(res && res.ok, 'useCrystal must succeed');
  assert.strictEqual(recruit.cult.sub, 'STAFF_GUARD', 'Recruit must acquire STAFF_GUARD naturally');
  console.log('  PASS 5: Post-founding recruits diversify naturally without archetype lock (' + Array.from(paths).join(', ') + ') and acquire subpaths via crystals');
}

// 6. Save & Load Serialization Roundtrip
{
  const W = SIM.create('save-load-weapon-skills', { masterIdx: 0, archetype: 'bow' });
  const master = W.byId[W.sect.masterId];
  M.skillSet(master, 'BOW', 78);
  M.skillSet(master, 'STAFF', 45);
  M.skillSet(master, 'FOCUS', 55);

  const serialized = SIM.serialize(W);
  assert(typeof serialized === 'string' && serialized.length > 500, 'Serialized save must be non-empty JSON string');

  const deserialized = SIM.deserialize(serialized);
  const loadedMaster = deserialized.byId[master.id];

  assert(loadedMaster, 'Loaded master must exist');
  assert.strictEqual(loadedMaster.h.skills.BOW, 78, 'h.skills.BOW must survive save/load roundtrip');
  assert.strictEqual(loadedMaster.h.skills.STAFF, 45, 'h.skills.STAFF must survive save/load roundtrip');
  assert.strictEqual(loadedMaster.h.skills.FOCUS, 55, 'h.skills.FOCUS must survive save/load roundtrip');
  assert.strictEqual(M.skillRead(loadedMaster, 'BOW'), 78, 'M.skillRead(loadedMaster, BOW) must return 78');

  // HC validation on all loaded npcs
  let hcErrors = 0;
  deserialized.npcs.forEach(n => { hcErrors += HC.validate(n).length; });
  assert.strictEqual(hcErrors, 0, 'HC.validate must have 0 errors for all loaded NPCs');
  console.log('  PASS 6: Save & load roundtrip with unified skills and HC validation verified');
}

console.log('=== All Unified Weapon Skills & Sect Archetypes Tests Passed! (PASS) ===');
