'use strict';
const assert = require('assert'), g = require('./load');
require('../js/render');
const { SK, JD, SIM, COMBAT, STATS, Render: R, CULT } = g;

function rec() {
  let depth = 0;
  const ops = [];
  const ctx = new Proxy({ globalAlpha: 1 }, {
    get(o, k) {
      if (k in o) return o[k];
      return (...args) => {
        if (k === 'save') depth++;
        if (k === 'restore') depth--;
        assert(depth >= 0, 'Canvas restore underflow');
        for (const a of args) if (typeof a === 'number') assert(Number.isFinite(a), k);
        ops.push([k, ...args]);
      };
    },
    set(o, k, v) { o[k] = v; ops.push([k, v]); return true; }
  });
  return { ctx, ops, balance: () => assert.equal(depth, 0) };
}

function view(W) {
  return Object.assign({
    W, opts: { quality: 'high' }, t: 0.5, cam: { x: 1920, y: 1120, z: 1 },
    vw: 1000, vh: 700, castClock: 0, castLastTime: null, castActive: new Map(), castSeen: new Map(), npcPos: n => n
  }, R.methods);
}

function actors(W, p) {
  const a = { id: 'caster', name: 'caster', foe: true, tier: 5, power: 500, hp: 20, hpMax: 100, speed: 1, x: 120, y: 70, sx: [], act: { id: 'fight', ctx: {} }, skl: [p] };
  const d = { ...a, id: 'enemy', hp: 100, x: 121, sx: [], skl: [] };
  const ally = { ...a, id: 'ally', hp: 2, x: 118, sx: [], skl: [] };
  W.foes = [a, d, ally];
  W.foeById = { caster: a, enemy: d, ally };
  return { a, d, ally, f: { id: 5, serious: true, A: [a.id, ally.id], B: [d.id] } };
}

const ids = Object.keys(SK.TECH_TO_T5_VFX);
const families = Object.keys(SK.T5_VFX_FAMILIES);
const passives = Object.keys(SK.PASSIVE_TO_T5_VFX);

assert(families.length >= 60, 'T5 must have at least 60 shared VFX families');
assert.equal(families.length, 68);
assert.equal(ids.length, 158);
assert.equal(passives.length, 94);
assert.deepEqual(new Set(Object.values(SK.TECH_TO_T5_VFX)), new Set(families), 'every T5 family is actively used');
assert.equal(SK.NONLEGENDARY_VFX_BUDGET[5].planned, false);
assert(SK.NONLEGENDARY_VFX_BUDGET[5].rMax < SK.NONLEGENDARY_VFX_BUDGET[6].rMin, 'T5 remains strictly below T6 radius');
assert(SK.NONLEGENDARY_VFX_BUDGET[5].life < SK.NONLEGENDARY_VFX_BUDGET[6].life, 'T5 remains strictly shorter than T6 lifetime');

for (const id of ids) {
  const t = CULT.tech(id);
  assert.equal(t.tier, 5);
  assert(!t.legendary);
  assert(SK.profile(t), id + ' is a real active T5 skill');
  assert.equal(SK.resolveT5Vfx(t), SK.TECH_TO_T5_VFX[id]);

  const W = SIM.create('t5-' + id), r = view(W);
  const p = t.moveDefs?.length ? SK.moveProfile(t, t.moveDefs[0]) : SK.profile(t);
  const { a, d, f } = actors(W, p);
  STATS.now = W.t;
  COMBAT.useSkill(W, f, a, d, p);
  assert(a.castFx, id + ' produced cast');
  r.updateCastEffects(100);
  const fx = r.castActive.get('foe:caster');
  assert.equal(fx.t5Vfx, SK.TECH_TO_T5_VFX[id], id);
  assert.equal(fx.life, 1050);
  assert.equal(fx.x, a.castFx.x * 16);
  assert.equal(fx.y, a.castFx.y * 16);

  const before = SIM.serialize(W), rng = JSON.stringify(W.rng.getState()), c = rec();
  r.drawCastEffects(c.ctx);
  c.balance();
  assert.equal(SIM.serialize(W), before);
  assert.equal(JSON.stringify(W.rng.getState()), rng);

  assert.equal(SK.resolveT5Vfx(t, { fxKind: 'custom' }), null);
  assert.equal(SK.resolveT5Vfx(t, { signatureVfx: 'sig_meteor_sword_rain' }), null);
  a.castFx = { ...a.castFx, seq: a.castFx.seq + 1, signatureVfx: 'sig_luoshen_water_goddess' };
  r.updateCastEffects(110);
  assert.equal(r.castActive.get('foe:caster').t5Vfx, null, 'explicit event artwork override wins');
  a.castFx = { ...a.castFx, seq: a.castFx.seq + 1, legendary: true };
  r.updateCastEffects(115);
  assert.equal(r.castActive.get('foe:caster').t5Vfx, null, 'authoritative Legendary wins');
}

const W = SIM.create('t5-draw'), r = view(W);
for (const quality of ['high', 'low']) {
  for (const reduced of [false, true]) {
    r.opts.quality = quality;
    const shapes = new Set();
    for (const family of families) {
      const members = ids.filter(id => SK.TECH_TO_T5_VFX[id] === family);
      const fx = { techId: members[0], t5Vfx: family, arch: 'strike', angle: 0.2 };
      const c = rec();
      assert(r.drawT5SkillVfx(c.ctx, fx, 0.5, reduced));
      c.balance();
      shapes.add(JSON.stringify(c.ops));
      for (const id of members.slice(1)) {
        const d = rec();
        r.drawT5SkillVfx(d.ctx, { ...fx, techId: id }, 0.5, reduced);
        d.balance();
        assert.deepEqual(c.ops, d.ops, 'T5 group identity is shared, not seeded by tech ID');
      }
      if (reduced) {
        const d = rec();
        r.drawT5SkillVfx(d.ctx, fx, 0.9, true);
        assert.deepEqual(c.ops, d.ops, 'Reduced Motion freezes T5 shape/release');
      }
    }
    assert.equal(shapes.size, 68, quality + ' ' + reduced);
  }
}

const gear = JD.ITEMS.items.filter(it => it.tier === 5 && it.out === 'EQUIPMENT' && !it.legendary);
assert(gear.length > 50);
const n = W.npcs[0];
n.cult.stage = 9;
n.cult.path = 'XIAN';
for (const item of gear) {
  n.equip = { test: { ...item, minStage: 1, compatiblePath: ['ANY'], compatiblePaths: ['ANY'] } };
  const c = rec();
  assert(r.drawT5EquipmentAura(c.ctx, n, {}, 0), item.id + ' usable T5 gear');
  c.balance();
}

console.log('PASS T5 VFX: 68 shared shapes, 158 active skill routes, 91 passive routes, T5 equipment auras, purity & Reduced Motion');
