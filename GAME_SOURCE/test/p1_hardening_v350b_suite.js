'use strict';
const assert = require('assert');
const load = require('./load.js');
const g = typeof load === 'function' ? load() : (load.loadGame ? load.loadGame() : load);

const { SIM, CULT, COMBAT: C, SK, STATS: ST, ECO, MARTIAL: M, AI, EXPED, SECT, BN, EXT, UI } = g;

console.log('=== JS2 v3.5.0b Phase B — P1 Live-Loop Wiring & Hardening Suite ===');

const W = SIM.create('v350b-p1-seed');
while (W.npcs.length < 6) SIM.addNpc(W, { ageYears: 20, rank: 2, stage: 3 });
assert.strictEqual(SIM.PATCH_VERSION, '3.5.0c', 'PATCH_VERSION must be 3.5.0b');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '3.5.0c-release-polish', 'SAVE_SCHEMA_VERSION must be 3.5.0b-p1-hardening');

// ---------------------------------------------------------------------------
// G1-05: Vows consolidation (no triple-dip, pill breach triggers, VOLUNTARY_VOWS stats work)
// ---------------------------------------------------------------------------
{
  const n = W.npcs[1];
  n.voluntaryVow = { id: 'VOW_NO_PILL', nameTh: 'สัจจะงดโอสถในศึก', active: true, swornDay: 1, breaches: 0, backlashUntilDay: 0 };
  assert.strictEqual(CULT.isAbstainingFromPills(n), true, 'G1-05: isAbstainingFromPills must recognize VOW_NO_PILL');

  // Pill use in fight triggers MARTIAL_VOWS.recordBreach
  n.act = { id: 'fight' };
  const pillKey = Object.keys(ECO.recipeById).map(r => ECO.recipeById[r].outType === 'PILL' ? (ECO.recipeById[r].outItemId || 'P:' + r) : null).find(k => k && ECO.pillInfo(k));
  assert(pillKey, 'Need a valid pill key');
  ECO.add(W, pillKey, 1);
  ECO.usePill(W, n, pillKey);
  assert.strictEqual(n.voluntaryVow.active, false, 'G1-05: Using pill in fight must breach VOW_NO_PILL');
  assert(n.voluntaryVow.breaches >= 1, 'G1-05: breaches counter must increment');
  n.act = { id: 'idle' };

  // VOLUNTARY_VOWS combat stats in stats.js
  n.voluntaryVow = null;
  n.voluntaryVows = { VOW_NO_MEDICINE: { id: 'VOW_NO_MEDICINE', active: true, broken: false } };
  ST.dirty(n);
  const stWithVow = ST.get(n);
  n.voluntaryVows = {};
  ST.dirty(n);
  const stNoVow = ST.get(n);
  assert(stWithVow.atk !== stNoVow.atk || stWithVow.def !== stNoVow.def || stWithVow.matk !== stNoVow.matk, 'G1-05: CULT.VOLUNTARY_VOWS.getStatBonuses must affect ST.get');
  console.log('PASS [G1-05] Vows consolidation, pill breach trigger & VOLUNTARY_VOWS stats');
}

// ---------------------------------------------------------------------------
// G1-06: SIX_PATH_MASTERY fixes (LORE_ARCHIVIST Day 1 rank, numeric season, Arena/Wager wiring)
// ---------------------------------------------------------------------------
{
  const nLore = W.npcs[2];
  nLore.cult.path = 'LORE_ARCHIVIST';
  W.sect.library = [];
  if (W.world && W.world.livingLore && W.world.livingLore.facts) {
    Object.values(W.world.livingLore.facts).forEach(f => { f.discovered = false; });
  }
  const mLore = CULT.SIX_PATH_MASTERY.syncDaily(W, nLore);
  assert.strictEqual(mLore.loreIndexRank, 1, 'G1-06: LORE_ARCHIVIST must start at rank 1 when 0 facts discovered (got ' + mLore.loreIndexRank + ')');

  const nHusb = W.npcs[3];
  nHusb.cult.path = 'SPIRIT_HUSBANDRY';
  W.season = 0; // spring (numeric)
  const springStacks = CULT.SIX_PATH_MASTERY.syncDaily(W, nHusb).bloomStacks;
  W.season = 3; // winter (numeric)
  const winterStacks = CULT.SIX_PATH_MASTERY.syncDaily(W, nHusb).bloomStacks;
  assert(springStacks >= 3, 'G1-06: numeric season 0 (spring) must give >= 3 bloomStacks');
  assert(winterStacks <= springStacks, 'G1-06: numeric season 3 (winter) must give fewer/equal bloomStacks');

  // Wire recordArenaVictory & resolveStakeWager via C.recordLifeConclude
  const nArena = W.npcs[4];
  nArena.cult.path = 'ARENA_GLORY';
  const nGamb = W.npcs[5];
  nGamb.cult.path = 'FORTUNE_GAMBLER';
  CULT.SIX_PATH_MASTERY.syncDaily(W, nArena);
  CULT.SIX_PATH_MASTERY.syncDaily(W, nGamb);
  const fDuel = { id: 501, kind: 'duel', serious: true, A: [nArena.id], B: [nGamb.id], winner: 'A', lifeDamage: { [nArena.id]: 120, [nGamb.id]: 50 } };
  C.recordLifeConclude(W, fDuel);
  assert(nArena.sixPathMastery.arenaStreak >= 1, 'G1-06: C.recordLifeConclude must call recordArenaVictory on duel win');
  assert((nGamb.sixPathMastery.stakeWins + nGamb.sixPathMastery.stakeLosses) >= 1, 'G1-06: C.recordLifeConclude must call resolveStakeWager for FORTUNE_GAMBLER');
  console.log('PASS [G1-06] SIX_PATH_MASTERY Day-1 rank, numeric season, Arena & Wager wiring');
}

// ---------------------------------------------------------------------------
// G2-P1-1: C.evaluateRowTacticalBonus wired into C.applyDamage
// ---------------------------------------------------------------------------
{
  const Wr = SIM.create('v350b-row-seed');
  const frontA = Wr.npcs[0], backA = Wr.npcs[1], foeB = Wr.npcs[2];
  const f = { id: 88, kind: 'spar', serious: false, A: [frontA.id, backA.id], B: [foeB.id], rows: { A: { [frontA.id]: 'FRONT_ROW', [backA.id]: 'BACK_ROW' }, B: { [foeB.id]: 'FRONT_ROW' } } };
  const bBack = C.evaluateRowTacticalBonus(Wr, f, backA);
  const bFront = C.evaluateRowTacticalBonus(Wr, f, frontA);
  assert.strictEqual(bBack.posture, 'UNOBSTRUCTED_FOCUS');
  assert.strictEqual(bFront.posture, 'PHALANX_GUARD');
  const hp0 = C.hp(frontA);
  C.applyDamage(Wr, f, foeB, frontA, 100, 'ทดสอบแถวหน้า');
  const taken = hp0 - C.hp(frontA);
  assert(taken <= 92, 'G2-P1-1: FRONT_ROW phalanx guard must mitigate incoming damage (' + taken + ')');
  console.log('PASS [G2-P1-1] C.evaluateRowTacticalBonus active in C.applyDamage');
}

// ---------------------------------------------------------------------------
// G2-P1-2 & G2-P1-3 & G2-P1-6: Sovereign keywords, PairedSetId, Non-lethal spar protection
// ---------------------------------------------------------------------------
{
  const n = W.npcs[1];
  const sovKey = Object.keys(C.SOVEREIGN_KEYWORDS_CATALOG)[0];
  n.combatKeywords = [sovKey];
  n._kwCache = null;
  const kwProf = C.keywordsOf(n);
  assert(kwProf.activeKeywords.includes(sovKey), 'G2-P1-2: C.keywordsOf must consume C.SOVEREIGN_KEYWORDS_CATALOG');

  // ECO.evaluatePairedItems checks pairedSetId
  const np = W.npcs[2];
  np.cult.stage = 6;
  np.equip = {
    WEAPON: { id: 'EQ_PAIR_W', slot: 'WEAPON', tier: 4, dur: 100, maxDur: 100, pairedSetId: 'PAIR_TEST_01' },
    ACCESSORY: { id: 'EQ_PAIR_X', slot: 'ACCESSORY', tier: 4, dur: 100, maxDur: 100, pairedSetId: 'PAIR_TEST_01' }
  };
  const pairRes = ECO.evaluatePairedItems(np);
  assert.strictEqual(pairRes.isNamedPair, true, 'G2-P1-3: ECO.evaluatePairedItems must recognize pairedSetId');
  assert.strictEqual(pairRes.bonusMult, 1.16, 'G2-P1-3: pairedSetId must yield 1.16x bonusMult');

  // Non-lethal spar must NOT burn nirvanaGrace
  const Ws = SIM.create('v350b-spar-seed');
  const a = Ws.npcs[0], d = Ws.npcs[1];
  ST.applyNamedBuff(d, 'nirvanaGrace', 60, Ws.t);
  const fSpar = { id: 91, kind: 'spar', serious: false, A: [a.id], B: [d.id] };
  C.setHp(d, Math.round(C.hpMax(d) * 0.2));
  C.applyDamage(Ws, fSpar, a, d, Math.round(C.hpMax(d) * 0.15), 'ประลองฝึกซ้อม');
  assert.strictEqual(ST.hasBuff(d, 'nirvanaGrace', Ws.t), true, 'G2-P1-6: Non-lethal spar must NOT consume nirvanaGrace');
  console.log('PASS [G2-P1-2/3/6] Sovereign keywords, pairedSetId & non-lethal spar cheat-death protection');
}

// ---------------------------------------------------------------------------
// G2-P1-4 & G2-P1-5: ST.get heartDemon cache invalidation & GS_CACHE dormant fix
// ---------------------------------------------------------------------------
{
  const n = W.npcs[3];
  n.h.state.heartDemon = 0;
  const st0 = ST.get(n);
  n.h.state.heartDemon = 85;
  const st85 = ST.get(n);
  assert(st85.atk !== st0.atk || st85.def !== st0.def || st85.cast !== st0.cast, 'G2-P1-4: ST.get must invalidate when heartDemon changes');

  const upkTpl = Object.values(ECO.itemById).find(x => x && x.id && x.id.startsWith('EQ_V320_') && x.upkeepMatId);
  assert(upkTpl, 'Need an upkeep EQ_V320 item');
  const it = Object.assign({}, upkTpl, { uid: 'test_dormant_gs', dur: 100, maxDur: 100, dormant: false });
  n.cult.stage = 7;
  const scActive = M.gearSuitability(n, it, 0).rawPower;
  it.dormant = true;
  const scDormant = M.gearSuitability(n, it, 0).rawPower;
  assert(scDormant < scActive, 'G2-P1-5: GS_CACHE must invalidate when dormant toggles (' + scActive + ' -> ' + scDormant + ')');
  console.log('PASS [G2-P1-4/5] ST.get heartDemon & GS_CACHE dormant invalidation');
}

// ---------------------------------------------------------------------------
// G3-P1-5/6/7/8: Charges decrement, FREE_TRADE_TREATY, EQ_V320 market, closed-loop stipends
// ---------------------------------------------------------------------------
{
  // G3-P1-6: FREE_TRADE_TREATY reads W.world.politics.treaties
  const Wp = SIM.create('v350b-market-seed');
  Wp.world.politics = { treaties: [] };
  const pNoTreaty = EXT.quotePrice(Wp, 'grain', 'sect-buy', 40);
  Wp.world.politics.treaties = [{ type: 'FREE_TRADE_TREATY', active: true }];
  const pWithTreaty = EXT.quotePrice(Wp, 'grain', 'sect-buy', 40);
  assert(pWithTreaty <= pNoTreaty, 'G3-P1-6: FREE_TRADE_TREATY in W.world.politics.treaties must reduce sect-buy price');

  // G3-P1-8: payOfficeStipends forceFull never conjures stones
  Wp.sect.stones = 15;
  const stRes = SECT.payOfficeStipends(Wp, { forceFull: true });
  assert(stRes.totalPaid <= 15, 'G3-P1-8: payOfficeStipends(forceFull) must never exceed W.sect.stones (' + stRes.totalPaid + ' > 15)');
  console.log('PASS [G3-P1-6/8] FREE_TRADE_TREATY & closed-loop office stipends');
}

// ---------------------------------------------------------------------------
// G4-F02, G4-F03, G4-F05: TRANSIENT castFx, UI v3.3/v3.4 hooks
// ---------------------------------------------------------------------------
{
  assert(SIM.TRANSIENT_CACHE_KEYS.has('castFx'), 'G4-F05: castFx must be in SIM.TRANSIENT_CACHE_KEYS');
  const Wu = SIM.create('v350b-ui-seed');
  Wu.npcs[0].castFx = { seq: 1, t: Wu.t, signatureVfx: 'sig_meteor_sword_rain' };
  const snap = JSON.parse(SIM.serialize(Wu));
  assert.strictEqual(snap.npcs[0].castFx, undefined, 'G4-F05: castFx must not persist into serialized saves');

  const uiSrc = require('fs').readFileSync(require('path').join(__dirname, '../js/ui.js'), 'utf8');
  assert(uiSrc.includes('npc-tactical-sixpath-card') && uiSrc.includes('UI.formatTacticalSixPathSummary(W, n)'), 'G4-F03: UI.rNpc must wire UI.formatTacticalSixPathSummary');
  assert(uiSrc.includes('world-external-events-card') && uiSrc.includes('UI.formatExternalWorldEventsSummary(W)'), 'G4-F03: UI.rWorld must wire UI.formatExternalWorldEventsSummary');
  assert(!uiSrc.includes('สำนักเมฆาหยก v1.10'), 'G4-F03: stale v1.10 About string must be removed');
  console.log('PASS [G4-F03/F05] Transient castFx & UI.rNpc/rWorld v3.3/v3.4 cards');
}

console.log('✅ ALL JS2 v3.5.0b PHASE B P1 HARDENING CHECKS PASSED!');
