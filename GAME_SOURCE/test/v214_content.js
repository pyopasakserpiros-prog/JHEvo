'use strict';
const assert = require('assert');
const { JD, CULT, MARTIAL, STATS, HC, SIM, SK } = require('./load');
const D = JD.MARTIAL;
const W = SIM.create('v214-content');
const newSubs = D.subPaths.filter(s => s.v214);
const oldCraft = ['PILL_FURNACE_IMMORTAL', 'POISON_VENOM_CAULDRON', 'HEAVENLY_ANVIL_SMITH', 'SPIRIT_SWORD_ARTIFICER', 'RUNE_ARRAY_ENGRAVER', 'DIVINE_FLAME_SMELTER'];
assert.strictEqual(newSubs.length, 12);
assert.strictEqual(JD.CULT.paths.CRAFT_CREATION.subPaths.length, 9);
for (const id of oldCraft) assert(JD.CULT.paths.CRAFT_CREATION.subPaths.some(s => s.id === id), 'retain broad craft: ' + id);
for (const [path, count] of [['ARRAY_TALISMAN', 4], ['STRATEGY_GOVERNANCE', 5]]) {
  const def = JD.CULT.paths[path];
  assert.strictEqual(def.stages.length, 8);
  assert.strictEqual(def.maxStage, 8);
  assert.strictEqual(def.subPaths.length, count);
  assert.deepStrictEqual(def.stages.map(s => s.stage), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert(D.pathProfiles[path]);
  assert(MARTIAL.PATHS[path], 'runtime identity registered: ' + path);
  assert(CULT.tech('MP_BASE_' + path), 'bootstrap resolves: ' + path);
  assert.strictEqual(CULT.mantraPool(path).filter(t => t.v214 || /^MANTRA_V214_/.test(t.id)).length, 3);
  const n = JSON.parse(JSON.stringify(W.npcs[0]));
  n.cult = { path, sub: def.subPaths[0].id, stage: 8, prog: 0, techs: [], toxic: 0 };
  assert.strictEqual(CULT.equivalentStage(n), 9, 'stage equivalence reaches nine: ' + path);
}
const ids = JD.TECH.techniques.concat(JD.TECH.mantras).map(t => t.id);
for (const sub of newSubs) {
  const n = JSON.parse(JSON.stringify(W.npcs[0]));
  n.cult = { path: sub.path, sub: sub.id, stage: 4, prog: 0, techs: [], toxic: 0 };
  assert(/[ก-๙]/.test(sub.nameTh) && /[ก-๙]/.test(sub.weaknessTh), 'Thai identity and tradeoff: ' + sub.id);
  assert(Object.values(D.subStats[sub.id].p || {}).concat(Object.values(D.subStats[sub.id].f || {})).some(v => v < 0), 'effective combat tradeoff: ' + sub.id);
  for (const key of [sub.primarySkill].concat(sub.secondarySkills)) assert(Object.hasOwn(n.h.skills, key), 'real existing skill: ' + key);
  for (const key of Object.keys(D.subPreferences[sub.id].aff)) assert(Object.hasOwn(n.h.affinities, key), 'real HC affinity: ' + key);
  for (const key of Object.keys(D.subPreferences[sub.id].p)) {
    const [group, attr] = key.split('.');
    assert(n.h[group] && Object.hasOwn(n.h[group], attr), 'real HC preference field: ' + key);
  }
  const track = CULT.trackDef(sub.id);
  assert(track && track.realms.length === 9, 'independent track registered: ' + sub.id);
  assert.deepStrictEqual(track.realms.map(r => r.ordinal), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.strictEqual(track.targetMajorStages, 8);
  assert(MARTIAL.PROFILES[sub.id], 'runtime profile registered: ' + sub.id);
  for (const tier of [1, 4]) {
    const id = 'ART_V214_' + sub.id + '_T' + tier;
    const t = CULT.tech(id);
    assert(t && D.techniques.includes(t), 'indexed learnable art: ' + id);
    assert.strictEqual(ids.filter(x => x === id).length, 1, 'unique id: ' + id);
    assert(CULT.learnable(n, [id], { strictPrimarySub: true }).includes(id), 'can study intended art: ' + id);
    assert.strictEqual(CULT.tech(t.moveDefs[0].id), t, 'move resolves to parent: ' + id);
    const profile = SK.moveProfile(t, t.moveDefs[0]);
    assert(profile && profile.arch === t.moveDefs[0].arch, 'runtime move handler: ' + id);
    assert(t.moveDefs[0].M > 0 || t.moveDefs[0].heal || t.moveDefs[0].shield || t.moveDefs[0].grantBuff || t.moveDefs[0].qiRestorePct, 'active mechanic: ' + id);
  }
  assert.deepStrictEqual(MARTIAL.activeInnateTechs(n), ['INNATE_V214_' + sub.id], 'innate activates: ' + sub.id);
  assert(CULT.tech('PASS_V214_' + sub.id).passive.life[sub.primarySkill] > 0, 'productive passive: ' + sub.id);
  CULT.ensureTrack(n, 1);
  HC.bump(n);
  const stats = STATS.get(n);
  for (const key of STATS.KEYS) assert(Number.isFinite(stats[key]), 'finite runtime stat ' + sub.id + '/' + key);
}
assert.deepStrictEqual(JD.CULT.paths.STRATEGY_GOVERNANCE.subPaths.map(s => s.governanceRole), ['command', 'steward', 'diplomacy', 'logistics', 'teaching']);
assert.strictEqual(D.professionSpecializations.SPIRIT_FEAST_HEALER.role, 'RECOVERY_FOOD');
assert.strictEqual(D.professionSpecializations.JADE_MEAL_PREPARER.role, 'CULTIVATION_FOOD');
assert.strictEqual(D.professionSpecializations.CELESTIAL_ARMOR_ARTISAN.role, 'ARMOR');
console.log('PASS v2.0.14 content: 2 paths, 12 differentiated subpaths, real runtime identities/skills/tracks/arts/innates and retained broad craft.');
