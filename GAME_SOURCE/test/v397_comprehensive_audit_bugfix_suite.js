'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const g = require('./load.js');

// Load UI and Render with minimal DOM stub for Stage 3 checks
if (!g.document) {
  const els = {};
  const mkEl = id => ({
    id, innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {}, querySelectorAll: () => [],
    getContext: () => ({ fillRect() {}, clearRect() {}, drawImage() {}, beginPath() {}, arc() {}, fill() {}, stroke() {}, save() {}, restore() {}, measureText: () => ({ width: 10 }) })
  });
  g.document = {
    getElementById: id => els[id] || (els[id] = mkEl(id)),
    querySelectorAll: () => [],
    createElement: () => mkEl('dyn')
  };
  g.window = g;
  g.performance = g.performance || { now: () => Date.now() };
  require('../js/render.js');
  require('../js/ui.js');
}

// 0. Constitutional Locks
const root = path.resolve(__dirname, '../..');
const agentsSha = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'AGENTS.md'))).digest('hex');
const hcSha = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'GAME_SOURCE/js/human_core.js'))).digest('hex');
assert.strictEqual(agentsSha, 'f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4', 'AGENTS.md SHA-256 lock');
assert.strictEqual(hcSha, 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js SHA-256 lock');
assert.strictEqual(g.HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT lock');

// 1. Phase 1 Foundation Checks
assert.strictEqual(g.ELEM.normalizeTag('SOUL').ok, true, 'SOUL element tag normalized');
assert.strictEqual(g.ELEM.normalizeTag('POISON_CORROSION').ok, true, 'POISON_CORROSION element tag normalized');
assert.strictEqual(g.ELEM.normalizeTag('DARK_YIN').ok, true, 'DARK_YIN element tag normalized');
for (const p of Object.values(g.CULT.PATHS)) {
  assert.strictEqual(g.ELEM.getProfile(p).valid, true, 'Valid elementProfile for path ' + p.id);
}
assert.strictEqual(Object.keys(g.CULT.PATHS).length, 58, '58 Major Paths preserved');

// Check MANTRA_V234_* has cat and finite power (BUG-P1-03)
const v234Mantras = g.JD.TECH.mantras.filter(m => m && /^MANTRA_V234_/.test(m.id));
assert(v234Mantras.length >= 20, 'MANTRA_V234_* present');
for (const m of v234Mantras) {
  assert.strictEqual(m.cat, 'MANTRA', m.id + ' has cat=MANTRA');
  assert(Number.isFinite(m.power) && m.power > 0, m.id + ' has finite power');
}

// Check ECO.isPill & ECO.pillInfo with @TR: wildcard pills (BUG-P01)
const basePillKey = 'P:REC140_ALC_JADE_MARROW_2';
const wildPillKey = basePillKey + '@TR:MAT_TR_ALC_01';
assert.strictEqual(g.ECO.isPill(wildPillKey), true, 'ECO.isPill recognizes @TR: composite pills');
assert(g.ECO.pillInfo(wildPillKey) && g.ECO.pillInfo(wildPillKey).tier >= 1, 'ECO.pillInfo resolves @TR: composite pills');

// Check SK.moveProfile support.kind never leaks debuffs (BUG-T01)
for (const t of g.JD.TECH.techniques.slice(0, 400)) {
  if (!t || !Array.isArray(t.moveDefs)) continue;
  const prof = g.SK.profile(t);
  if (prof && Array.isArray(prof.moves)) {
    for (const mv of prof.moves) {
      if (mv.support && mv.support.kind && g.STATS.BUFF_CATALOG[mv.support.kind]) {
        assert.notStrictEqual(g.STATS.BUFF_CATALOG[mv.support.kind].kind, 'debuff', 'support.kind must not be a debuff');
      }
    }
  }
}

// Check World & Save/Load Integrity + Parity
const W = g.SIM.create('v397_audit_seed', { masterIdx: 0 });
assert(Array.isArray(W.world.allSects) && W.world.allSects.length >= 19, 'All 19 canonical sects present');
assert.strictEqual(W.world.sects[0], W.world.allSects.find(s => s.id === W.world.sects[0].id), 'world.sects aliases world.allSects');
assert.strictEqual(W.world.jianghuSects, W.world.allSects, 'world.jianghuSects aliases world.allSects');

// Check BEST_MANTRA non-null for Stage 1 across all 58 paths (BUG-P1-01)
const npc0 = W.npcs[0];
for (const pathId of Object.keys(g.CULT.PATHS)) {
  const m = g.CULT.bestMantra(pathId, 1, npc0);
  assert(m && m.id, 'Stage 1 mantra must resolve for path ' + pathId);
}

// Check Save/Load STATS.get parity (BUG-E02)
const beforeStats = g.STATS.get(npc0);
const saved = g.SIM.serialize(W);
const W2 = g.SIM.deserialize(saved);
assert.strictEqual(W2.world.sects[0], W2.world.allSects.find(s => s.id === W2.world.sects[0].id), 'Deserialized world.sects aliases world.allSects');
assert.strictEqual(W2.world.jianghuSects, W2.world.allSects, 'Deserialized world.jianghuSects aliases world.allSects');
const afterStats = g.STATS.get(W2.byId[npc0.id]);
assert.strictEqual(Math.round(beforeStats.atk), Math.round(afterStats.atk), 'Save/load STATS.get atk parity');
assert.strictEqual(Math.round(beforeStats.hp), Math.round(afterStats.hp), 'Save/load STATS.get hp parity');

// Check C.runLegendaryDaoProc dynamic ST (BUG-P0-01)
const transActor = W2.npcs[1];
transActor.cult = { path: 'TRANS_TEMPO_SOVEREIGN', sub: 'NONE', stage: 6, prog: 0, techs: [], toxic: 0, _tempoBank: 2 };
transActor._tempoBank = 2;
const dummyTarget = Object.assign({}, W2.npcs[2], { id: 'dummy_tgt', dead: false, h: { state: { hp: 500, qi: 100 } }, hpMax: 500 });
g.COMBAT.runLegendaryDaoProc(W2, transActor, dummyTarget, [transActor], [dummyTarget], 'hit', 100);
assert(g.STATS.getActiveBuffs(transActor, W2.t).some(b => b.id === 'temporalHaste'), 'TRANS_TEMPO_SOVEREIGN applies temporalHaste via dynamic ST');

// Check COG evaluators are strictly Zero-RNG (BUG-H*)
const rngBefore = JSON.stringify(W2.rng.getState());
g.COG.evaluateAspirations(W2, transActor);
g.COG.forecast(W2, transActor, 'reserves');
g.COG.evaluateBuildImprovisation(W2, transActor);
g.COG.explain(W2, transActor);
assert.strictEqual(JSON.stringify(W2.rng.getState()), rngBefore, 'COG evaluators must not consume W.rng');

// Check UI.playerActionKind allows all 8 set-lore-* actions (BUG-R24)
g.UI.G = { W: W2, R: { invalidate() {}, focus() {}, zoomAt() {}, selected: null, cam: { x: 0, y: 0, z: 1 } }, speed: 1, acc: 0, opts: {} };
for (const act of ['set-lore-era', 'set-lore-emp-group', 'set-lore-fig-group', 'set-lore-chaos-sub', 'set-lore-chaos-era', 'set-lore-surv-filter', 'set-lore-chronicle-book', 'set-lore-chronicle-cat']) {
  assert.strictEqual(g.UI.playerActionKind(act), 'observe', act + ' must be an allowed observe action');
  assert.notStrictEqual(g.UI.doAction(act, 'ALL'), false, act + ' should not be blocked');
}

// Check UI.rWorld chronicle filter isolation (BUG-R25)
g.UI.doAction('chronicle-filter', 'people');
g.UI.doAction('set-chronicle-filter', 'BATTLE');
assert.strictEqual(g.UI.chronicleFilter, 'people', 'sect chronicleFilter isolated');
assert.strictEqual(g.UI.worldSectsChronicleFilter, 'BATTLE', 'worldSectsChronicleFilter isolated');

// Check Beast Taming Non-Lethal Subdue (BUG-B01 / BUG-B26)
const bSpec = g.WILD.spawn(W2, 'west_grove') || g.WILD.spawn(W2, 'east_crag');
assert(bSpec, 'Wild beast spawned for tame check');
const tamer = W2.npcs[2];
tamer.pets = [];
const tameRes = g.CULT.attemptTameBeast(W2, tamer, bSpec, { force: true, quiet: true });
assert.strictEqual(tameRes.ok, true, 'Forced tame succeeds');
assert.strictEqual(tamer.pets.length, 1, 'Pet added on tame');

console.log('✅ v397_comprehensive_audit_bugfix_suite: ALL CHECKS PASSED!');
