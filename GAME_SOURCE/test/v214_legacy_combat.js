'use strict';
const assert = require('node:assert/strict');
const { SIM, CULT, HC, STATS, COMBAT, SK } = require('./load');

function cast(path, stage, overrides = {}, withBuff = false) {
  const W = SIM.create('v214_summon_' + path + '_' + stage), a = W.npcs[0], target = W.npcs[1];
  a.cult.path = path; a.cult.stage = stage; a.cult.sub = 'NONE'; a.cult.track = null;
  a.cult.techs = ['ART_C117_INNATE_NETHER_GHOST_KING'];
  a.buffs = []; a.sx = []; a.equip = {};
  HC.bump(a); a.h.state.hp = CULT.hpMax(a); a.h.state.qi = CULT.qiMax(a);
  const f = COMBAT.startFight(W, [a.id], [target.id], 'spar', { serious: false });
  if (withBuff) STATS.applyNamedBuff(a, 'fervorMight', 60, W.t);
  const p = SK.profile(CULT.tech('ART_C117_INNATE_NETHER_GHOST_KING'));
  p.summon = Object.assign({ dur: 20, hpPct: .4, statPct: .5, nameSuffix: 'ภูตทดสอบ' }, overrides);
  const caster = STATS.get(a);
  COMBAT.useSkill(W, f, a, target, p, {});
  const summon = W.foes.find(u => u.isSummon);
  assert(summon, path + ': actual cast creates summon');
  return { W, a, target, f, summon, caster, stats: STATS.get(summon) };
}

if (!process.argv.includes('--pills-only')) {
  // The cast must inherit real power rather than computeFoe's mortal fallback.
  for (const [path, def] of Object.entries(CULT.PATHS)) {
    const low = cast(path, 1), high = cast(path, def.maxStage);
    assert(high.stats.atk > low.stats.atk * 3, path + ': summon grows with caster');
    for (const key of ['atk', 'matk', 'def', 'mdef', 'acc', 'eva']) {
      assert(Math.abs(high.stats[key] - high.caster[key] / 2) <= 1, path + ': half-strength ' + key);
    }
    assert(Object.values(high.stats).every(Number.isFinite));
  }
  const fixture = cast('DEMON', 9), before = fixture.stats;
  const saved = SIM.deserialize(SIM.serialize(fixture.W));
  const restored = saved.foeById[fixture.summon.id];
  assert(restored && restored.isSummon);
  assert.deepEqual(STATS.get(restored), before, 'cast snapshot survives save/load');
  assert.deepEqual(STATS.explain(restored).v, before, 'summon explanation matches saved combat stats');
  assert(saved.fights.some(f => f.A.includes(restored.id) || f.B.includes(restored.id)));
  // A later caster buff cannot multiply an already summoned snapshot again.
  STATS.applyNamedBuff(fixture.a, 'fervorMight', 60, fixture.W.t);
  assert.deepEqual(STATS.get(fixture.summon), before);
  const buffed = cast('HEART_SOUL', 9, {}, true);
  assert(Math.abs(buffed.stats.atk - buffed.caster.atk / 2) <= 1, 'caster buff is included exactly once');
  assert(Math.abs(buffed.stats.matk - buffed.caster.matk / 2) <= 1);
  const bounded = cast('GOD', 4, { statPct: 100 });
  assert(bounded.stats.atk <= bounded.caster.atk, 'summon cannot exceed caster via malformed ratio');
  const invalid = cast('BODY', 5, { statPct: NaN });
  assert(Object.values(invalid.stats).every(Number.isFinite), 'invalid ratio has finite default');
}

// Equal maximum realms must have equal access to real T6 combat consumables.
for (const [path, def] of Object.entries(CULT.PATHS)) {
  const W = SIM.create('v214_pill_' + path), n = W.npcs[0];
  n.cult.path = path; n.cult.stage = def.maxStage; n.cult.sub = 'NONE';
  n.buffs = []; n.inv.pills = { 'P:ECO2_REC_PILL_BUFF_ATK_6': 1 };
  HC.bump(n); STATS.preFight(W, n, false);
  assert(!n.inv.pills['P:ECO2_REC_PILL_BUFF_ATK_6'], path + ': maximum realm may use T6 combat pill');
  assert(n.buffs.length > 0);
}
{
  const W = SIM.create('v214_low_realm_pill'), n = W.npcs[0];
  n.cult.path = 'GOD'; n.cult.stage = 1; n.cult.sub = 'NONE';
  n.buffs = []; n.inv.pills = { 'P:ECO2_REC_PILL_BUFF_ATK_6': 1 };
  HC.bump(n); STATS.preFight(W, n, false);
  assert.equal(n.inv.pills['P:ECO2_REC_PILL_BUFF_ATK_6'], 1, 'low realm still cannot use T6 pill');
  assert.equal(n.buffs.length, 0);
}
console.log('PASS v214 legacy combat: summon scaling/save and equal-realm combat pills');
