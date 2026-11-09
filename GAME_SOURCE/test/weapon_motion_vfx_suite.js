'use strict';
const assert = require('assert');
const g = require('./load');
require('../js/render');
const R = g.Render, types = Object.keys(R.WEAPON_MOTION_VFX);
function recorder() {
  const ops = []; let depth = 0;
  const ctx = new Proxy({ globalAlpha: 1 }, {
    get(o, k) {
      if (k in o) return o[k];
      if (k === 'save') return () => { depth++; ops.push(['save']); };
      if (k === 'restore') return () => { depth--; ops.push(['restore']); };
      return (...args) => ops.push([k, ...args]);
    }, set(o, k, v) { o[k] = v; ops.push(['set', k, v]); return true; }
  });
  return { ctx, ops, depth: () => depth };
}
function renderer(quality) {
  return Object.assign({ opts: { quality }, resolveQuality() { return this.opts.quality; } }, R.methods);
}

assert.deepStrictEqual(types.slice().sort(), [
  'ABACUS','ASTROLABE','BLADE','BOW','BRUSH','CLAW','DAGGER','FAN','FIST','FOCUS',
  'NEEDLE','ROSARY','SPEAR','STAFF','SWORD','WHIP','ZITHER'
].sort());
for (const quality of ['high', 'low']) for (const reduced of [false, true]) {
  const r = renderer(quality), frames = new Set();
  for (const weaponType of types) {
    const c = recorder();
    assert.strictEqual(r.drawWeaponMotionVfx(c.ctx, { weaponType, tier: 4, angle: 0.38 }, 0.46, 24, reduced), true);
    assert.strictEqual(c.depth(), 0, weaponType + ' must balance Canvas save/restore');
    frames.add(JSON.stringify(c.ops));
  }
  assert.strictEqual(frames.size, types.length, 'all 17 weapon families need distinct geometry in ' + quality + ', reduced=' + reduced);
}
assert.strictEqual(renderer('high').drawWeaponMotionVfx(recorder().ctx, { weaponType: 'UNKNOWN' }, 0.4, 20, false), false);

// Verify the real combat producer snapshots required weapon form and attacker origin.
const { W, a, d, f } = (() => {
  const W = g.SIM.create('weapon-motion-cast-snapshot');
  const a = { id: 'motionCaster', name: 'caster', foe: true, tier: 3, power: 500, hp: 80, hpMax: 100, speed: 1,
    x: 120, y: 70, sx: [], act: { id: 'fight', ctx: {} },
    skl: [{ id: 'motionSkill', nameTh: 'พัดแหวกเมฆ', arch: 'strike', weaponTypes: ['FAN'], tier: 4, icon: '✦',
      type: 'm', cd: 30, wind: 2, M: 12, hits: 1, moves: [] }] };
  const d = { ...a, id: 'motionTarget', x: 122, y: 71, sx: [], skl: [] };
  W.foes = [a, d]; W.foeById = { [a.id]: a, [d.id]: d };
  g.STATS.now = W.t;
  return { W, a, d, f: { id: 17, serious: true, A: [a.id], B: [d.id] } };
})();
const r = Object.assign({ W, opts: { quality: 'high' }, cam: { x: 120 * 16, y: 70 * 16, z: 1 },
  vw: 1000, vh: 700, castSeen: new Map(), castActive: new Map(), castClock: 0, castLastTime: null,
  chunks: new Map(), buildingSprites: new Map(), apCache: new Map(),
  npcPos: n => ({ x: n.x, y: n.y }) }, R.methods);
r.setWorld(W); W.speed = 1;
g.COMBAT.attack(W, f, a, d);
assert(a.castFx, 'active martial art creates cast event');
assert.strictEqual(a.castFx.weaponType, 'FAN', 'cast snapshots the technique weapon family');
assert.strictEqual(a.castFx.originX, a.x, 'cast snapshots attacker x for directional motion');
assert.strictEqual(a.castFx.originY, a.y, 'cast snapshots attacker y for directional motion');
assert.strictEqual(a.castFx.tier, 4, 'cast snapshots skill tier for visual scale');

// Renderer takes the snapshot, keeps a useful travel direction, and remains read-only.
const before = g.SIM.serialize(W), rng = JSON.stringify(W.rng.getState());
r.updateCastEffects(100);
const fx = r.castActive.get('foe:' + a.id);
assert(fx, 'renderer ingests current combat cast');
assert.strictEqual(fx.weaponType, 'FAN');
assert.strictEqual(fx.tier, 4);
assert(fx.angle > 0 && fx.angle < Math.PI / 2, 'cast direction points from caster toward target');
assert.deepStrictEqual(fx.targetPoints, [{ x: d.x * 16, y: d.y * 16, team: false }], 'hostile recipient is retained as an enemy impact point');
const c = recorder(); r.drawCastEffects(c.ctx);
assert.strictEqual(c.depth(), 0);
assert(c.ops.some(o => o[0] === 'arc' || o[0] === 'fill'), 'weapon motif is drawn');
assert.strictEqual(g.SIM.serialize(W), before, 'visual rendering never mutates serialized game state');
assert.strictEqual(JSON.stringify(W.rng.getState()), rng, 'visual rendering never consumes simulation RNG');
const markCtx = recorder();
assert.strictEqual(r.drawCastTargetMarks(markCtx.ctx, { x: 100, y: 100, targetPoints: [
  { x: 100, y: 100, team: true }, { x: 190, y: 120, team: true }, { x: 240, y: 130, team: false }
] }, 0.4, false), true, 'multi-recipient casts draw distinct recipient marks');
assert(markCtx.ops.some(op => op[0] === 'translate' && op[1] === 190 && op[2] === 116), 'ally marker uses the actual ally position');
assert(markCtx.ops.some(op => op[0] === 'translate' && op[1] === 240 && op[2] === 126), 'enemy marker uses the actual enemy position');
assert.strictEqual(markCtx.depth(), 0, 'recipient markers balance Canvas save/restore');
 a.sx = [{ k: 'aegisWard', startedAt: W.t, until: W.t + 12 }]; const savedCastSnapshot = g.SIM.serialize(W);
const buffCtx = recorder();
assert.strictEqual(r.drawAppliedBuffAura(buffCtx.ctx, a, 0), 'guard', 'active protective buff creates an owner-bound guard aura');
assert.strictEqual(buffCtx.depth(), 0);
assert.strictEqual(g.SIM.serialize(W), savedCastSnapshot, 'persistent buff aura reads status without purging or mutating simulation data');
a.sx = [{ k: 'vitalRegen', startedAt: W.t, until: W.t + 12 }];
assert.strictEqual(r.drawAppliedBuffAura(recorder().ctx, a, 0), 'life', 'healing buffs use a life-themed aura');
a.sx = [{ k: 'vitalRegen', startedAt: W.t, until: W.t }];
assert.strictEqual(r.drawAppliedBuffAura(recorder().ctx, a, 0), false, 'expired buffs no longer show an aura');

// Explicit authored legendary motifs stay exclusive to the legendary renderer.
let motionCalls = 0, legendCalls = 0;
const spy = Object.assign({}, r, {
  drawWeaponMotionVfx() { motionCalls++; }, drawLegendaryArtVfx() { legendCalls++; }
});
spy.castActive = new Map([['legend', { techId: 'TECH_SAMPLE', legendary: true, weaponType: 'SWORD', start: 0, life: 1500, x: 0, y: 0 }]]);
spy.castClock = 750; spy.drawCastEffects(recorder().ctx);
assert.strictEqual(legendCalls, 1); assert.strictEqual(motionCalls, 0, 'legendary visual keeps its dedicated authored identity');
console.log('PASS weapon motion VFX: 17 families × quality/motion modes, real combat metadata, direction, purity and legendary priority');
