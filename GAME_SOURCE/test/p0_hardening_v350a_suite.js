'use strict';
const assert = require('assert');
const load = require('./load.js');
const g = typeof load === 'function' ? load() : (load.loadGame ? load.loadGame() : load);

const { SIM, CULT, COMBAT: C, SK, STATS: ST, ECO, MARTIAL: M, AI, EXPED, WILD, BN } = g;

console.log('=== JS2 v3.5.0a Phase A — 13 P0 Hardening Regression Suite ===');

// Create clean test world
const W = SIM.create('v350a-p0-seed');
assert.strictEqual(SIM.PATCH_VERSION, '3.9.6', 'PATCH_VERSION must be 3.5.0a');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '3.9.6-deep-gameplay-integration', 'SAVE_SCHEMA_VERSION must be 3.5.0a-p0-hardening');

// ---------------------------------------------------------------------------
// G1-01: retraining.js null-guards (n.inv / n.inv.crystals / n.inv.techs)
// ---------------------------------------------------------------------------
{
  const n = W.npcs[1];
  const savedInv = n.inv;
  n.cult.stage = 3;
  n.inv = { subManuals: ['SWORD_SOVEREIGN'] }; // missing crystals & techs
  W.sect.subLibrary = Array.from(new Set([...(W.sect.subLibrary || []), 'SWORD_SOVEREIGN']));
  let threw = false;
  try {
    M.evaluateRetraining(W, n, M.subKey('SWORD_SOVEREIGN'));
    M.retrain(W, n, M.subKey('SWORD_SOVEREIGN'), { source: 'crystal' });
  } catch (e) {
    threw = true;
    console.error('G1-01 unexpected error:', e);
  }
  n.inv = savedInv;
  assert.strictEqual(threw, false, 'G1-01: retraining must not throw when n.inv.crystals or n.inv.techs is missing');
  console.log('PASS [G1-01] retraining.js null-guards');
}

// ---------------------------------------------------------------------------
// G1-02: bottleneck.js chains origStart -> CULT.TRIBULATION.start() runs
// ---------------------------------------------------------------------------
{
  const n = W.npcs[1];
  n.cult.stage = 3;
  n.cult.prog = CULT.threshold(n) + 100;
  n.tribulationState = null;
  BN.ensure && BN.ensure(W, n);
  const ok = AI.ACTS.breakthrough.start(n, W, {});
  assert.strictEqual(ok, true, 'G1-02: breakthrough.start should return true');
  assert(n.tribulationState && n.tribulationState.active, 'G1-02: CULT.TRIBULATION.start() must activate tribulationState');
  CULT.TRIBULATION.cleanup(W, n);
  console.log('PASS [G1-02] bottleneck.js chains origStart & activates tribulationState');
}

// ---------------------------------------------------------------------------
// G1-03: AI.kill guards null n.inv so fallen/legacy/cleanup always finish
// ---------------------------------------------------------------------------
{
  const Wk = SIM.create('v350a-kill-seed');
  const victim = Wk.npcs[Wk.npcs.length - 1];
  victim.inv = null;
  victim.equip = null;
  const beforeFallen = (Wk.sect.fallen || []).length;
  AI.kill(Wk, victim, 'ทดสอบเกราะกัน null');
  assert.strictEqual(victim.dead, true, 'G1-03: victim must be marked dead');
  assert.strictEqual((Wk.sect.fallen || []).length, beforeFallen + 1, 'G1-03: W.sect.fallen must record victim even if n.inv is null');
  console.log('PASS [G1-03] AI.kill safely completes with null n.inv');
}

// ---------------------------------------------------------------------------
// G1-04: CULT.breakthrough maxStage guard prevents stages.length overflow
// ---------------------------------------------------------------------------
{
  const n = W.npcs[0];
  const maxStage = CULT.PATHS[n.cult.path].stages.length;
  n.cult.stage = maxStage;
  const res = CULT.breakthrough(W, n, {});
  assert.strictEqual(res.ok, false, 'G1-04: breakthrough at maxStage must return ok:false');
  assert.strictEqual(res.maxStageReached, true, 'G1-04: must flag maxStageReached');
  assert.strictEqual(n.cult.stage, maxStage, 'G1-04: stage must not overflow maxStage');
  assert(Number.isFinite(CULT.lifespan(n)), 'G1-04: CULT.lifespan must stay valid');
  console.log('PASS [G1-04] CULT.breakthrough maxStage guard');
}

// ---------------------------------------------------------------------------
// G2-P0-1: C.keywordsOf parses { kw, params } and C.EQUIPMENT_KEYWORDS_CATALOG
// ---------------------------------------------------------------------------
{
  const n = W.npcs[2];
  const tpl = ECO.itemById['EQ_V320_CURSED_BLADE_T3'];
  assert(tpl, 'EQ_V320_CURSED_BLADE_T3 must exist');
  const inst = Object.assign({}, tpl, { uid: 'test_kw_blade', dur: 100, maxDur: 100 });
  n.cult.stage = 5;
  n.equip = Object.assign({}, n.equip, { WEAPON: inst });
  n._kwCache = null;
  const prof = C.keywordsOf(n);
  assert(prof.activeKeywords.includes('KW_SEALED_PACT'), 'G2-P0-1: C.keywordsOf must recognize KW_SEALED_PACT ({ kw, params })');

  const accTpl = ECO.itemById['EQ_V320_TAL_CHG_T5_CHARGE'] || Object.values(ECO.itemById).find(x => x && x.id && x.id.startsWith('EQ_V320_') && Array.isArray(x.combatKeywords) && x.combatKeywords.some(k => k.kw === 'KW_ACCURACY'));
  assert(accTpl, 'Need an EQ_V320 item with KW_ACCURACY');
  const accInst = Object.assign({}, accTpl, { uid: 'test_kw_acc', dur: 100, maxDur: 100 });
  const beforeAcc = C.keywordsOf(n).accAdd;
  n.equip[accInst.slot] = accInst;
  n._kwCache = null;
  const afterProf = C.keywordsOf(n);
  assert(afterProf.activeKeywords.includes('KW_ACCURACY') || afterProf.chargeRelease, 'G2-P0-1: EQ_V320 combatKeywords must activate in C.keywordsOf');
  if (accInst.combatKeywords.some(k => k.kw === 'KW_ACCURACY')) {
    assert(afterProf.accAdd > beforeAcc, 'G2-P0-1: KW_ACCURACY params.add must increase accAdd');
  }
  console.log('PASS [G2-P0-1] C.keywordsOf normalizes v3.2.0 { kw, params } & equipment keywords');
}

// ---------------------------------------------------------------------------
// G2-P0-2: Offensive EFX_V320_* procs fire on onHit + drawbackHpDrainPct + bossHit deed
// ---------------------------------------------------------------------------
{
  const Wc = SIM.create('v350a-efx-seed');
  const actor = Wc.npcs[0];
  const target = Wc.npcs[1];
  actor.cult.stage = 6;
  target.cult.stage = 6;
  const pactWpn = Object.assign({}, ECO.itemById['EQ_V320_CURSED_BLADE_T3'], { uid: 'test_pact', dur: 100, maxDur: 100 });
  const deedItem = Object.values(ECO.itemById).find(x => x && x.id && x.id.startsWith('EQ_V320_') && Array.isArray(x.effects) && x.effects.some(e => e.effectId === 'EFX_V320_DEED_AWAKEN'));
  assert(deedItem, 'Need an EQ_V320_DEED_AWAKEN item');
  const deedInst = Object.assign({}, deedItem, { uid: 'test_deed', dur: 100, maxDur: 100, deedLedger: true });
  actor.equip = { WEAPON: pactWpn, ACCESSORY: deedInst.slot === 'ACCESSORY' ? deedInst : null, ARMOR: deedInst.slot === 'ARMOR' ? deedInst : null };
  if (deedInst.slot === 'WEAPON') actor.equip.ACCESSORY = Object.assign({}, deedInst, { slot: 'ACCESSORY' });

  const hpBefore = C.hp(actor);
  const f = { id: 99, serious: false, A: [actor.id], B: [target.id] };
  C.runItemEffectProcs(Wc, f, actor, target, 'onHit', 100);
  assert(C.hp(actor) < hpBefore, 'G2-P0-2: EFX_V320_PACT_OVERDRIVE must apply drawbackHpDrainPct on onHit');
  const anyDeeds = Object.values(actor.equip).some(it => it && it.deeds && it.deeds.bossHits >= 1);
  assert(anyDeeds, 'G2-P0-2: EFX_V320_DEED_AWAKEN must record bossHit deed on onHit');

  // Test CHARGE_RELEASE STRIKE on onHit
  const strikeItem = Object.values(ECO.itemById).find(x => x && x.id && x.id.startsWith('EQ_V320_') && Array.isArray(x.effects) && x.effects.some(e => e.effectId === 'EFX_V320_CHARGE_RELEASE' && e.params && e.params.mode === 'STRIKE'));
  assert(strikeItem, 'Need an EFX_V320_CHARGE_RELEASE STRIKE item');
  const strikeInst = Object.assign({}, strikeItem, { uid: 'test_chg_strike', dur: 100, maxDur: 100, chargeCells: 0 });
  actor.equip = { [strikeInst.slot]: strikeInst };
  actor._itemEfxCds = {};
  const maxCells = strikeInst.effects.find(e => e.effectId === 'EFX_V320_CHARGE_RELEASE').params.maxCells || 3;
  const tHpBefore = C.hp(target);
  for (let i = 0; i < maxCells; i++) {
    Wc.t += 20;
    C.runItemEffectProcs(Wc, f, actor, target, 'onHit', 80);
  }
  assert(C.hp(target) < tHpBefore, 'G2-P0-2: EFX_V320_CHARGE_RELEASE STRIKE must discharge damage on onHit');
  console.log('PASS [G2-P0-2] Offensive EFX_V320_* handlers reachable on onHit + drawback + deed');
}

// ---------------------------------------------------------------------------
// G2-P0-3: SK.list(n) unlocks Archetype Signature Skills (T4 / T6)
// ---------------------------------------------------------------------------
{
  const n = W.npcs[2];
  n.cult.stage = 8;
  CULT.evaluateSubpathArchetypeMastery(n, null, 6);
  const skills = SK.list(n);
  const sigs = skills.filter(s => s && s.isArchetypeSignature);
  assert(sigs.length >= 2, 'G2-P0-3: SK.list(n) must include T4 and T6 Archetype Signature Skills at tier 6, got ' + sigs.length);
  console.log('PASS [G2-P0-3] SK.list(n) exposes Archetype Signature Skills (' + sigs.map(s => s.id).join(', ') + ')');
}

// ---------------------------------------------------------------------------
// G2-P0-4: ST.gearStats dynamically invalidates on Patina/Deeds/Lineage/Dormant
// ---------------------------------------------------------------------------
{
  const patinaTpl = Object.values(ECO.itemById).find(x => x && x.id && x.id.startsWith('EQ_V320_') && Array.isArray(x.effects) && x.effects.some(e => e.effectId === 'EFX_V320_PATINA_AEGIS'));
  assert(patinaTpl, 'Need a Patina Aegis item');
  const it = Object.assign({}, patinaTpl, { uid: 'test_patina', dur: 100, maxDur: 100, deeds: { stage: 1 }, lineage: [], dormant: false });
  const sFresh = ST.gearStats(it);
  it.dur = 55; // enters patina sweet spot 0.30..0.78
  const sPatina = ST.gearStats(it);
  assert(sPatina.def > sFresh.def, 'G2-P0-4: Patina wear must increase def without manual cache clear (' + sFresh.def + ' -> ' + sPatina.def + ')');

  it.deeds = { kills: 10, parries: 0, bossHits: 0, stage: 3 };
  const sDeed = ST.gearStats(it);
  assert(sDeed.def > sPatina.def, 'G2-P0-4: Deed stage 3 must increase def (' + sPatina.def + ' -> ' + sDeed.def + ')');

  it.lineage = [{ nameTh: 'บรรพชน', bonusStat: 'atk', bonusVal: 25 }];
  const sLin = ST.gearStats(it);
  assert((sLin.atk || 0) >= (sDeed.atk || 0) + 25, 'G2-P0-4: Lineage bonus must update immediately');

  it.dormant = true;
  const sDorm = ST.gearStats(it);
  assert(sDorm.def < sLin.def, 'G2-P0-4: Dormant must reduce stats by 25% immediately (' + sLin.def + ' -> ' + sDorm.def + ')');
  console.log('PASS [G2-P0-4] ST.gearStats live cache invalidation (Patina/Deeds/Lineage/Dormant)');
}

// ---------------------------------------------------------------------------
// G2-P0-5: Proc damage routes through C.applyDamage -> respects WILD.landHitLimit & landContributions
// ---------------------------------------------------------------------------
{
  const Wb = SIM.create('v350a-boss-seed');
  const hero = Wb.npcs[0];
  hero.cult.stage = 9;
  const boss = { id: 'foe_dragon', foe: true, wild: true, landInfluence: true, tier: 7, raidGrade: 'apex', huntType: 'raid', specId: 'BEAST_ABYSSAL_DRAGON', hp: 500000, hpMax: 500000, x: 10, y: 10, sx: [] };
  if (!boss.hpMax) boss.hpMax = 500000;
  boss.hp = boss.hpMax;
  boss.landProfile = WILD.landCombatProfile(boss);
  const hitCap = boss.landProfile ? WILD.landHitLimit(boss, boss.landProfile) : 5000;
  const f = { id: 777, kind: 'wild', serious: true, A: [hero.id], B: [boss.id], ctx: {} };
  Wb.byId[boss.id] = boss;
  Wb.foeById[boss.id] = boss;

  const hpBefore = C.hp(boss);
  // Simulate huge proc damage (e.g. Transcendent cut-in / Dao scar / Secondary resource)
  C.applyProcDamage(Wb, f, hero, boss, 125000, 'ทดสอบดาเมจทะลุเพดาน');
  const dealt = hpBefore - C.hp(boss);
  assert(dealt <= hitCap, 'G2-P0-5: Proc damage must not exceed WILD.landHitLimit (' + dealt + ' > ' + hitCap + ')');
  if (boss.landProfile) {
    assert((f.ctx.landContributions && f.ctx.landContributions[hero.id]) > 0, 'G2-P0-5: Proc damage must credit f.ctx.landContributions');
  }
  console.log('PASS [G2-P0-5] Proc damage capped at WILD.landHitLimit (' + dealt + ' <= ' + hitCap + ') & credits landContributions');
}

// ---------------------------------------------------------------------------
// G3-P0-1, G3-P0-2, G3-P0-3: External World Events causality, closed-loop stones & canonical Living Lore
// ---------------------------------------------------------------------------
{
  const We = SIM.create('v350a-ewe-seed');
  const EWE = EXPED.EXTERNAL_WORLD_EVENTS;
  // G3-P0-3: Verify all 40 relicLinkId exist in ECO.itemById
  for (const ev of EWE.CATALOG) {
    if (ev.relicLinkId) {
      assert(ECO.itemById[ev.relicLinkId], 'G3-P0-3: relicLinkId missing in ECO.itemById for ' + ev.id + ': ' + ev.relicLinkId);
    }
  }
  // G3-P0-2: Verify closed-loop resourcePool.stones transfer (no conjuring from empty pool)
  We.world.resourcePool.stones = 20;
  const sectBefore = We.sect.stones;
  const rPool = EWE.resolveEventAutonomously(We, We.npcs[0], 'EXT_EVT_01_BLACK_CAVALRY', { quiet: true });
  assert(rPool.ok, 'Event resolution must succeed');
  assert(rPool.entry.stonesPaid <= 20, 'G3-P0-2: stonesPaid must be bounded by W.world.resourcePool.stones (' + rPool.entry.stonesPaid + ')');
  assert.strictEqual(We.world.resourcePool.stones, 20 - rPool.entry.stonesPaid, 'G3-P0-2: resourcePool.stones must decrease by exact stonesPaid');
  assert.strictEqual(We.sect.stones, sectBefore + rPool.entry.stonesPaid, 'G3-P0-2: W.sect.stones must increase by exact stonesPaid');

  // G3-P0-3: Verify canonical livingLore.facts[id].discovered is set
  const lfId = rPool.entry.loreFactId;
  assert(We.world.livingLore.facts && We.world.livingLore.facts[lfId] && We.world.livingLore.facts[lfId].discovered === true,
    'G3-P0-3: canonical livingLore.facts[' + lfId + '].discovered must be true');
  assert(We.world.livingLore.discoveredFacts && We.world.livingLore.discoveredFacts[lfId],
    'G3-P0-3: backward-compatible discoveredFacts index must remain populated');

  // G3-P0-1: Verify tickDaily skips away/busy master and rotates actors
  We.world.resourcePool.stones = 50000;
  We.npcs.forEach(n => { if (n.cult) n.cult.stage = 3; n.act = { id: 'idle' }; if (n.h && n.h.state) n.h.state.energy = 80; });
  We.npcs[0].away = true; // master is away!
  We.day = 10;
  const spawnedEvt = EWE.spawnDeterministicEvent(We, { force: true, quiet: true });
  We.day = 14;
  const logsBefore = We.logs.length;
  EWE.tickDaily(We);
  const lastHist = We.world.externalWorldEvents.history[We.world.externalWorldEvents.history.length - 1];
  assert(lastHist && spawnedEvt && lastHist.id === spawnedEvt.id, 'G3-P0-1: tickDaily must resolve ready event');
  assert.notStrictEqual(lastHist.actorId, We.npcs[0].id, 'G3-P0-1: tickDaily must NOT pick away NPC');
  assert(We.logs.length > logsBefore, 'G3-P0-1: tickDaily must emit visible chronicle/world log');
  console.log('PASS [G3-P0-1/2/3] External World Events causality, closed-loop stones & canonical Living Lore');
}

// ---------------------------------------------------------------------------
// G4-F01: SIM.dailyUpdate fires CULT.EPITHETS.onDailyTick
// ---------------------------------------------------------------------------
{
  const Wep = SIM.create('v350a-epithet-seed');
  let epDailyCalls = 0;
  const origOnDaily = CULT.EPITHETS.onDailyTick;
  CULT.EPITHETS.onDailyTick = function (w) {
    epDailyCalls++;
    return origOnDaily.call(this, w);
  };
  try {
    SIM.dailyUpdate(Wep, false);
  } finally {
    CULT.EPITHETS.onDailyTick = origOnDaily;
  }
  assert(epDailyCalls >= 1, 'G4-F01: SIM.dailyUpdate must invoke CULT.EPITHETS.onDailyTick (got ' + epDailyCalls + ')');
  console.log('PASS [G4-F01] SIM.dailyUpdate invokes CULT.EPITHETS.onDailyTick (' + epDailyCalls + ' call)');
}

console.log('✅ ALL 13 P0 HARDENING REGRESSION CHECKS PASSED!');
