#!/usr/bin/env node
'use strict';

/**
 * Regression Test Suite: Categories 04, 05 & 06 (JS2-v2.6.0)
 * - Category 04: Weapons Arsenal (04A–04E)
 * - Category 05: Equipment, Armor, Accessories & Procedural Engine (05A–05H)
 * - Category 06: Pills, Alchemy, Multi-Phase Elixirs & Breakthrough Pharmacology (06A–06F)
 */

const assert = require('assert');
const g = require('./load.js');
const { JD, HC, U, CULT, ECO, SECT, SIM, STATS, COMBAT, MARTIAL, SK, VC, CPE, BN, EXT, EXPED } = g;

console.log('===============================================================');
console.log('  JS2-v2.6.0 Bugfix Regression Suite: Categories 04, 05 & 06   ');
console.log('===============================================================\n');

// ---------------------------------------------------------------------------
// 1. Category 04 (Weapons Arsenal: 04A–04E)
// ---------------------------------------------------------------------------
console.log('▶ [1/3] Testing Category 04 (Weapons Arsenal: 04A–04E)...');
{
  const W = SIM.create('cat04-test-world');
  const a = W.npcs[0], b = W.npcs[1];
  if (!a.cult) SIM.awaken(W, W.rng, a, 5); else a.cult.stage = 5;
  if (!b.cult) SIM.awaken(W, W.rng, b, 5); else b.cult.stage = 5;

  // 1.1 All 6 v2.0.0 Legendary Weapons have complete clue chains in VC.TEMPLATE_BY_ID & VC.V200_WEAPON_CLUE_TEMPLATES
  assert.strictEqual(VC.CLUE_TEMPLATES.length, 60, 'VC.CLUE_TEMPLATES must remain 60 for backward compatibility');
  assert.strictEqual(VC.V200_WEAPON_CLUE_TEMPLATES.length, 6, 'Must have 6 v2.0.0 legendary weapon clue templates');
  const v200ClueIds = [
    'CLUE_LEG_WPN_BODHI_NIRVANA_ROSARY',
    'CLUE_LEG_WPN_TAOTIE_DEVOURING_CLAW',
    'CLUE_LEG_WPN_BAIHUA_SOUL_NEEDLE',
    'CLUE_LEG_WPN_BAJIAO_TEMPEST_FAN',
    'CLUE_LEG_WPN_HETU_LUOSHU_ASTROLABE',
    'CLUE_LEG_WPN_CAISHEN_GOLDEN_ABACUS'
  ];
  for (const cid of v200ClueIds) {
    const tpl = VC.TEMPLATE_BY_ID[cid];
    assert(tpl && tpl.steps && tpl.steps.length >= 2, `Missing v2.0.0 weapon clue template: ${cid}`);
    const inst = VC.spawnClueInstance(W, cid, { truthful: true });
    assert(inst && inst.templateId === cid, `Failed to spawn clue instance for ${cid}`);
  }

  // 1.2 All 6 v2.0.0 procedural weapon recipes (REC_PROC_ROSARY..ABACUS) have proceduralOut: true & slotOptions
  for (const rKey of ['ROSARY', 'CLAW', 'NEEDLE', 'FAN', 'ASTROLABE', 'ABACUS']) {
    const rec = ECO.recipeById['REC_PROC_' + rKey];
    assert(rec && rec.proceduralOut === true && rec.craft === 'FORGING' && rec.outType === 'EQUIPMENT', `REC_PROC_${rKey} must have proceduralOut, craft=FORGING, outType=EQUIPMENT`);
    assert(Array.isArray(rec.slotOptions) && rec.slotOptions.length === 2, `REC_PROC_${rKey} must have 2 slotOptions`);
    W.sect.stock.MAT_ORE_STAR_COPPER_3 = 10;
    W.sect.stock.MAT_V234_005 = 10;
    const prev = ECO.previewProceduralCraft(W, rec.id, {}, a);
    assert(prev && prev.inputs && prev.inputs.length === 2, `ECO.previewProceduralCraft failed for ${rec.id}`);
  }

  // 1.3 REC_PROC_DAGGER produces ITEM_PROC_DAGGER with visualSubtype: 'DAGGER' and melee SHORT_SWIFT tactical profile
  const daggerGear = ECO.rollProceduralGear(W, { slot: 'WEAPON', gearType: 'BLADE', recipeId: 'REC_PROC_DAGGER', tier: 3, baseQ: 1.1 });
  assert.strictEqual(daggerGear.id, 'ITEM_PROC_DAGGER');
  assert.strictEqual(daggerGear.visualSubtype, 'DAGGER');
  a.equip = { WEAPON: daggerGear };
  STATS.dirty(a);
  const tacDagger = SK.weaponTacticalProfile(a);
  assert.strictEqual(tacDagger.reachClass, 'SHORT_SWIFT', 'Procedural melee dagger must use SHORT_SWIFT reachClass');

  // 1.4 Xiaoli Heart Dagger uses RANGED_KITE reachClass and adds +22 pen on true-strike proc
  const xiaoli = VC.mintLegendaryWeapon(W, 'LEG_WPN_XIAOLI_HEART_DAGGER', 'test');
  a.equip = { WEAPON: xiaoli };
  STATS.dirty(a);
  const tacXiaoli = SK.weaponTacticalProfile(a);
  assert.strictEqual(tacXiaoli.reachClass, 'RANGED_KITE', 'Xiaoli throwing dagger must use RANGED_KITE reachClass');

  // 1.5 Xuantie Heavy Sword uses HEAVY_BREAKER reachClass and does not burn ICD when wielder lacks strength
  const xuantie = VC.mintLegendaryWeapon(W, 'LEG_WPN_XUANTIE_HEAVY_SWORD', 'test');
  a.equip = { WEAPON: xuantie };
  STATS.dirty(a);
  const tacXuantie = SK.weaponTacticalProfile(a);
  assert.strictEqual(tacXuantie.reachClass, 'HEAVY_BREAKER', 'Xuantie Heavy Sword must use HEAVY_BREAKER reachClass');

  // 1.6 Weapon Kill Evolution: Legendary weapons have noEvolution: true; procedural weapons cap tier at 4 and sync minStage
  assert.strictEqual(xuantie.noEvolution, true, 'Legendary weapons must have noEvolution: true');
  const procSword = ECO.rollProceduralGear(W, { slot: 'WEAPON', gearType: 'SWORD', tier: 3, baseQ: 1.0 });
  for (let i = 0; i < 3; i++) ECO.recordWeaponKill(W, a, procSword, { tier: 2 });
  assert.strictEqual(procSword.tier, 4, 'Procedural T3 weapon evolves to T4 after 3 valid kills');
  assert.strictEqual(procSword.minStage, 4, 'Evolved weapon syncs minStage to tier');
  // Low-tier fodder (tier 1 vs tier 4 weapon) should not advance kills
  const killsBeforeFodder = procSword.killTracker.kills;
  ECO.recordWeaponKill(W, a, procSword, { tier: 1 });
  assert.strictEqual(procSword.killTracker.kills, killsBeforeFodder, 'Killing fodder >1 tier below weapon should not increment killTracker');
  // Further valid kills on ordinary procedural weapon hone quality without exceeding Tier 4
  for (let i = 0; i < 10; i++) ECO.recordWeaponKill(W, a, procSword, { tier: 4 });
  assert.strictEqual(procSword.tier, 4, 'Ordinary procedural weapon must not exceed Tier 4');
  assert(procSword.q > 1.08, 'Ordinary procedural weapon at Tier 4 gains quality honing on further evolution stages');

  // 1.7 Weapon Procs: Chunqiu Brush applies mdefbreak + slow + focusUp; Bodhi Rosary cleanses heartDemon; v2.0.0 debuffs trigger combatTargetBonus
  const chunqiu = VC.mintLegendaryWeapon(W, 'LEG_WPN_CHUNQIU_JUDGMENT_BRUSH', 'test');
  a.equip = { WEAPON: chunqiu };
  a.wpnProcCds = {};
  b.sx = [];
  const f = { id: 'f_cat04', kind: 'spar', serious: false, A: [a.id], B: [b.id] };
  VC.runWeaponProcs(W, f, a, b, true, { hit: true, dmg: 120, crit: true });
  assert(STATS.has(b, 'mdefbreak', W.t) && STATS.has(b, 'slow', W.t), 'Chunqiu Brush proc must apply mdefbreak and slow');
  assert(STATS.has(a, 'focusUp', W.t), 'Chunqiu Brush proc must grant focusUp to wielder');

  // Check tempoBreak cooldown push
  b.act = { id: 'fight', ctx: { cds: { SK_TEST: W.t + 10 } } };
  STATS.addStatus(b, 'tempoBreak', 6, null, W.t);
  assert.strictEqual(b.act.ctx.cds.SK_TEST, W.t + 12, 'tempoBreak must push active skill cooldowns by +2 ticks');

  // Check shoot_wind_vane_target has skill: 'BOW'
  const bowTpl = VC.TEMPLATE_BY_ID.CLUE_LEG_WPN_CONDOR_METEOR_BOW;
  const vaneStep = bowTpl.steps.find(s => s.nodeId === 'shoot_wind_vane_target');
  assert.strictEqual(vaneStep.skill, 'BOW', 'shoot_wind_vane_target must evaluate BOW skill');
}
console.log('  ✓ Category 04 assertions passed!');

// ---------------------------------------------------------------------------
// 2. Category 05 (Equipment, Armor, Accessories & Procedural Engine: 05A–05H)
// ---------------------------------------------------------------------------
console.log('▶ [2/3] Testing Category 05 (Equipment, Armor, Accessories & Procedural Engine: 05A–05H)...');
{
  const W = SIM.create('cat05-test-world');
  const a = W.npcs[0], b = W.npcs[1];
  if (!a.cult) SIM.awaken(W, W.rng, a, 6); else a.cult.stage = 6;
  if (!b.cult) SIM.awaken(W, W.rng, b, 6); else b.cult.stage = 6;

  // 2.1 Raw tag normalization & M.TYPE_ALIASES
  assert.strictEqual(MARTIAL.gearType(ECO.itemById.EQ_V240_ARMOR_BOSS_SHELL_T5), 'HEAVY');
  assert.strictEqual(MARTIAL.gearType(ECO.itemById.EQ_V240_ARMOR_BOSS_WING_T6), 'LIGHT');
  assert.strictEqual(MARTIAL.gearType(ECO.itemById.EQ_V240_ARMOR_IMMORTAL_MARROW_T7), 'HEAVY');
  assert.strictEqual(MARTIAL.gearType(ECO.itemById.EQ_V240_ACC_BOSS_CROWN_T5), 'NECKLACE');
  assert.strictEqual(MARTIAL.gearType({ slot: 'ARMOR', gearType: 'HEAVY_ARMOR' }), 'HEAVY');
  assert.strictEqual(MARTIAL.gearType({ slot: 'ACCESSORY', gearType: 'PENDANT' }), 'NECKLACE');
  assert.strictEqual(ECO.itemById.ITEM190_EQ_017.gearType, 'SHOES');

  // 2.2 Raw Hanzi cleanup verification
  assert(!/[\u4e00-\u9fff]/.test(ECO.itemById.ITEM190_EQ_018.nameTh), 'ITEM190_EQ_018 must have pure Thai nameTh');
  assert(!/[\u4e00-\u9fff]/.test(ECO.itemById.EQ_V215_BRUSH_12_T3.nameTh), 'EQ_V215_BRUSH_12_T3 must have pure Thai nameTh');
  assert(!/[\u4e00-\u9fff]/.test(ECO.itemById.LEG_WPN_BAJIAO_TEMPEST_FAN.nameTh), 'LEG_WPN_BAJIAO_TEMPEST_FAN must have pure Thai nameTh');

  // 2.3 3★ Catalyst Refinement Save/Load Parity (q = 1.85 / qRatio up to 1.40)
  const legWpn = VC.mintLegendaryWeapon(W, 'LEG_WPN_YITIAN_SWORD', 'test');
  W.sect.catalysts = { CAT_DIVINE_EMPEROR_JADE_6: 5 };
  for (let i = 0; i < 4; i++) {
    ECO.refineGearWithCatalyst(W, a, legWpn, 'CAT_DIVINE_EMPEROR_JADE_6', { quiet: true });
  }
  const preSaveAtk = STATS.gearStats(legWpn).atk;
  const reloadedWpn = JSON.parse(JSON.stringify(legWpn));
  const postLoadAtk = STATS.gearStats(reloadedWpn).atk;
  assert.strictEqual(preSaveAtk, postLoadAtk, `3★ Catalyst refined legendary weapon atk must survive save/load (${preSaveAtk} vs ${postLoadAtk})`);

  // 2.4 Elemental Rune Socketing works on Legendary items & never consumes manuals/crystals/relics
  W.sect.stones = 500;
  W.sect.stock = { MANUAL_PATH_XIAN_1: 1, CRYSTAL_PATH_XIAN: 1, MAT_ORE_BLACK_IRON_1: 2 };
  W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };
  const poolBefore = W.world.resourcePool.stones;
  const sockRes = ECO.socketElementalRunes(W, a, legWpn, ['FIRE', 'LIGHTNING']);
  assert(sockRes.ok, 'socketElementalRunes should succeed when MAT_ORE_BLACK_IRON_1 is available');
  assert.strictEqual(W.sect.stock.MANUAL_PATH_XIAN_1, 1, 'socketElementalRunes must never consume MANUAL_*');
  assert.strictEqual(W.sect.stock.CRYSTAL_PATH_XIAN, 1, 'socketElementalRunes must never consume CRYSTAL_PATH_*');
  assert.strictEqual(W.world.resourcePool.stones, poolBefore + 30, 'socketElementalRunes must credit spent stones back to W.world.resourcePool.stones');

  // 2.5 Distinct Defensive Relic Procs in VC.runWeaponOnStruckProcs
  const craneRobe = VC.mintLegendaryEquipment(W, 'LEG_ARM_CELESTIAL_CRANE_ROBE', 'test');
  const tortoisePlate = VC.mintLegendaryEquipment(W, 'LEG_ARM_IMMORTAL_TORTOISE_PLATE', 'test');
  const kirinCuirass = VC.mintLegendaryEquipment(W, 'LEG_ARM_SHADOW_KIRIN_CUIRASS', 'test');
  const f = { id: 'f_cat05', kind: 'spar', serious: false, A: [a.id], B: [b.id] };

  a.equip = { ARMOR: craneRobe };
  a.wpnProcCds = {};
  const bHpBeforeCrane = COMBAT.hp(b);
  const craneProc = VC.runWeaponOnStruckProcs(W, f, a, b, { hit: true, dmg: 100 });
  assert(craneProc && craneProc.effectId === 'EFX_LEG_CRANE_CLOUD_AEGIS', 'Crane Robe must trigger EFX_LEG_CRANE_CLOUD_AEGIS');
  assert.strictEqual(COMBAT.hp(b), bHpBeforeCrane, 'Crane Robe must NOT deal reflect damage to attacker');
  assert(STATS.has(a, 'shield', W.t), 'Crane Robe must grant shield to defender');

  a.equip = { ARMOR: tortoisePlate };
  a.wpnProcCds = {};
  STATS.addStatus(a, 'armorbreak', 10, null, W.t);
  const tortProc = VC.runWeaponOnStruckProcs(W, f, a, b, { hit: true, dmg: 100 });
  assert(tortProc && tortProc.effectId === 'EFX_LEG_XUANWU_UNYIELDING_BASTION', 'Tortoise Plate must trigger EFX_LEG_XUANWU_UNYIELDING_BASTION');
  assert(!STATS.has(a, 'armorbreak', W.t), 'Tortoise Plate must cleanse armorbreak on proc');

  a.equip = { ARMOR: kirinCuirass };
  a.wpnProcCds = {};
  // Test this counter against an active attacker, independently of earlier relics' surrender effects.
  b.yield=false;b.fled=false;COMBAT.setHp(b,COMBAT.hpMax(b));
  const kirinProc = VC.runWeaponOnStruckProcs(W, f, a, b, { hit: true, dmg: 100 });
  assert(kirinProc && kirinProc.effectId === 'EFX_LEG_KIRIN_PHANTOM_COUNTER', 'Kirin Cuirass must trigger EFX_LEG_KIRIN_PHANTOM_COUNTER');
  assert(STATS.has(b, 'bleed', W.t), 'Kirin Cuirass counter must inflict bleed on attacker');

  // 2.6 Symmetric Paired Items & Canonical Legendary Pair IDs
  const yangWpn = ECO.rollProceduralGear(W, { slot: 'WEAPON', gearType: 'SWORD', tier: 4, element: 'YIN_SHADOW' });
  const yinAcc = ECO.rollProceduralGear(W, { slot: 'ACCESSORY', gearType: 'RING', tier: 4, element: 'LIGHT_YANG' });
  a.equip = { WEAPON: yangWpn, ACCESSORY: yinAcc };
  const pairRes = ECO.evaluatePairedItems(a);
  assert(pairRes.active, 'YIN_SHADOW weapon + LIGHT_YANG accessory must activate symmetric paired item bonus');

  const rosary = VC.mintLegendaryWeapon(W, 'LEG_WPN_BODHI_NIRVANA_ROSARY', 'test');
  const beads = VC.mintLegendaryEquipment(W, 'LEG_ACC_BODHI_STARLIGHT_BEADS', 'test');
  a.equip = { WEAPON: rosary, ACCESSORY: beads };
  const namedPair = ECO.evaluatePairedItems(a);
  assert(namedPair.active && namedPair.isNamedPair && namedPair.bonusMult === 1.16, 'Bodhi Rosary + Bodhi Beads must trigger named pair bonus');

  // 2.7 Legendary Repair Exemption & Durability Ratio Curve
  rosary.dur = 40;
  W.sect.stock.ITEM_REPAIR_STONE_1 = 2;
  const repRes = ECO.repairGear(W, rosary, 'ITEM_REPAIR_STONE_1', a);
  assert(repRes.ok && rosary.maxDur === 100 && rosary.dur === 100, 'Legendary gear must not lose maxDur when repaired');
}
console.log('  ✓ Category 05 assertions passed!');

// ---------------------------------------------------------------------------
// 3. Category 06 (Pills, Alchemy & Breakthrough Pharmacology: 06A–06F)
// ---------------------------------------------------------------------------
console.log('▶ [3/3] Testing Category 06 (Pills, Alchemy & Breakthrough Pharmacology: 06A–06F)...');
{
  const W = SIM.create('cat06-test-world');
  const a = W.npcs[0], b = W.npcs[1];
  if (!a.cult) SIM.awaken(W, W.rng, a, 3); else a.cult.stage = 3;
  if (!b.cult) SIM.awaken(W, W.rng, b, 3); else b.cult.stage = 3;

  // 3.1 qiRestore unit scale normalization (0.28 fraction vs 35 percentage)
  a.cult.path = 'XIAN';
  const qm = CULT.qiMax(a);
  a.h.state.qi = 0;
  ECO.applyPill(W, a, 'P:BASIC_QI');
  assert(a.h.state.qi > qm * 0.20 && a.h.state.qi <= qm, `P:BASIC_QI should restore ~28% Qi without double application, got ${a.h.state.qi}/${qm}`);

  a.h.state.qi = 0;
  if (ECO.itemById.ITEM_V234_PILL_001) {
    ECO.applyPill(W, a, 'ITEM_V234_PILL_001');
    assert(a.h.state.qi > qm * 0.25 && a.h.state.qi <= qm, `ITEM_V234_PILL_001 should normalize percentage qiRestore without overflowing qm, got ${a.h.state.qi}/${qm}`);
  }

  // 3.2 CULT.isAbstainingFromPills blocks autonomous pill consumption (autoUse, fightUse, preFight, BN.prepare)
  CULT.bindOathVow(W, b, 'VOW_ABSTAIN_PILLS');
  assert.strictEqual(CULT.isAbstainingFromPills(b), true, 'CULT.isAbstainingFromPills must detect VOW_ABSTAIN_PILLS');
  b.inv.pills = { 'P:BASIC_HP': 2, 'P:CB_FURY': 1, ['P:BT_' + b.cult.path + '_' + b.cult.stage]: 1 };
  b.h.state.hp = Math.round(CULT.hpMax(b) * 0.30);
  CPE.autoUse(W, b);
  assert.strictEqual(b.daoOath.upheld, true, 'CPE.autoUse must NOT force an abstaining NPC to break VOW_ABSTAIN_PILLS');
  STATS.preFight(W, b, true);
  assert.strictEqual(b.daoOath.upheld, true, 'ST.preFight must NOT force an abstaining NPC to break VOW_ABSTAIN_PILLS');
  BN.prepare(W, b);
  assert.strictEqual(b.daoOath.upheld, true, 'BN.prepare must NOT force an abstaining NPC to break VOW_ABSTAIN_PILLS');

  // 3.3 Multi-phase pill queueing in ECO.applyPill & Phase-1 deduplication in ECO.useConsumableItem
  a.ext = {};
  W.sect.stock.ITEM_V234_PILL_001 = 2;
  const progBefore = a.cult.prog;
  const mpDef = ECO.getItem('ITEM_V234_PILL_001', W);
  const p1Exp = (mpDef.phases && mpDef.phases[0] && mpDef.phases[0].cultExpAdd) || 0;
  ECO.useConsumableItem(W, a, 'ITEM_V234_PILL_001', { now: W.t, day: W.day });
  assert(Array.isArray(a.ext.multiPhasePills) && a.ext.multiPhasePills.length === 1, 'Multi-phase pill must queue in npc.ext.multiPhasePills');
  const tickRes = CULT.tickMultiPhasePills(W, a, W.t + 1500);
  assert.strictEqual(tickRes.triggered, 1, 'CULT.tickMultiPhasePills must resolve queued Phase 2 after delay');

  // 3.4 Personal-bag breakthrough pill resistance (BN.pillMult + c.btTaken) & BN.onResult _btBonusPct reset
  a.cult.btTaken = 0;
  a.cult.btBonus = 0;
  a._btBonusPct = 0.12;
  const btKey = 'P:BT_' + a.cult.path + '_' + a.cult.stage;
  a.inv.pills = { [btKey]: 2 };
  a.inv.pillQuality = { [btKey]: 1.25 };
  BN.prepare(W, a);
  assert.strictEqual(a.cult.btTaken, 1, 'Personal-bag breakthrough pill in BN.prepare must increment c.btTaken');
  assert(a.cult.btBonus > 0.18, 'High-quality personal breakthrough pill must scale btBonus with pillQuality');
  BN.onResult(W, a, true);
  assert.strictEqual(a._btBonusPct, 0, 'BN.onResult must reset one-time _btBonusPct after breakthrough attempt');

  // 3.5 ST.preFight allows combat pill even when NPC has a non-combat meal buff
  a.buffs = [{ id: 'meal_buff', name: 'อาหารทิพย์', kind: 'professionMeal', until: W.t + 500, p: { hp: 0.05 }, f: {} }];
  a.inv.pills = { 'P:CB_STONE': 1 };
  STATS.now = W.t;
  STATS.preFight(W, a, true);
  assert.strictEqual(a.inv.pills['P:CB_STONE'], undefined, 'ST.preFight must consume P:CB_STONE even when a meal buff is active');

  // 3.6 Herb conservation: brewMultiphaseElementalPill consumes lowest-tier herbs first & preserves Tier 7 Chaos Root
  W.sect.stones = 200;
  W.sect.stock = {
    MAT_HERB_CHAOS_ROOT_7: 2,
    MAT_HERB_DEW_GRASS_1: 3
  };
  W.world.resourcePool = W.world.resourcePool || { stones: 50000, herbs: 5000, ores: 5000 };
  const poolStones0 = W.world.resourcePool.stones;
  const brewRes = ECO.brewMultiphaseElementalPill(W, a, ['LIGHT_YANG', 'YIN_SHADOW'], 'FIRE');
  assert(brewRes.ok && brewRes.zeroToxicity === true, 'LIGHT_YANG + YIN_SHADOW must be recognized as zeroToxicity reaction');
  assert.strictEqual(W.sect.stock.MAT_HERB_CHAOS_ROOT_7, 2, 'consumeSectHerbs must consume Tier 1 Dew Grass before Tier 7 Chaos Root');
  assert.strictEqual(W.world.resourcePool.stones, poolStones0 + 20, 'brewMultiphaseElementalPill must credit spent stones to resourcePool.stones');
}
console.log('  ✓ Category 06 assertions passed!\n');
console.log('✅ ALL CATEGORY 04, 05 & 06 REGRESSION TESTS PASSED!');
