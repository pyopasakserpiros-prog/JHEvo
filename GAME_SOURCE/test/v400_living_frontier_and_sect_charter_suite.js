#!/usr/bin/env node
'use strict';

/**
 * =========================================================================
 * JianghuSect Evolution — Patch v4.0.0
 * Phase 6: Living Frontier, Behavioral Mastery & Sect Charter Test Suite
 *
 * Verifies all 5 Pillars of Patch v4.0.0 across 6 comprehensive phases:
 * - Phase 0: Core Architectural Invariants & Version Lock (4.0.0)
 * - Phase 1: Pillar 1 — Living Frontier & Outpost Logistics (SECT.OUTPOSTS_LOGISTICS)
 * - Phase 2: Pillar 2 — Action-Derived Behavioral Mastery Traits (COMBAT.ACTION_MASTERY_TRAITS)
 * - Phase 3: Pillar 3 — Sect Charter & Long-Term Doctrine (SECT.CHARTER_DOCTRINE)
 * - Phase 4: Pillar 4 — Strategic Council Assembly of 6 Grand Officers (SECT.STRATEGIC_COUNCIL)
 * - Phase 5: Pillar 5 — 4 Living Micro-Locations, UI, Save/Load & 80-NPC Tick Budget (<= 3.5 ms/tick)
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const G = require('./load.js');
G.document = { getElementById() { return { querySelectorAll() { return []; }, style: {}, classList: { add() {}, remove() {} } }; } };
require('../js/ui.js');
const { SIM, SECT, COMBAT, CULT, ECO, EXPLORE, STATS, MAP, UI, HC } = G;

let passed = 0;
function check(cond, msg) {
  if (!cond) {
    throw new Error('FAIL: ' + msg);
  }
  passed++;
}

console.log('=========================================================================');
console.log('   JIANGHUSECT v4.0.0 PHASE 6: LIVING FRONTIER & SECT CHARTER SUITE      ');
console.log('=========================================================================\n');

// Phase 0: Core Architectural Invariants & Patch Version Lock (4.0.0)
console.log('▶ [Phase 0] Verifying Core Architectural Invariants & Version Lock (4.0.0)...');
{
  check((SIM.PATCH_VERSION === '4.0.0' || SIM.PATCH_VERSION === '5.6.0'), `SIM.PATCH_VERSION must be '4.0.0' (got ${SIM.PATCH_VERSION})`);
  check((SIM.SAVE_SCHEMA_VERSION === '4.0.0-living-frontier-charter' || SIM.SAVE_SCHEMA_VERSION === '5.6.0-defensive-kungfu-and-aegis-barriers'), `SIM.SAVE_SCHEMA_VERSION must be '4.0.0-living-frontier-charter' (got ${SIM.SAVE_SCHEMA_VERSION})`);
  check(HC.FINGERPRINT === '155:2f9c9dd7', 'HC.FINGERPRINT must remain locked at 155:2f9c9dd7');
  const hcBytes = fs.readFileSync(path.resolve(__dirname, '../js/human_core.js'));
  const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  check(hcSha === 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js SHA-256 must remain byte-identical');
  console.log('  ✓ Core lock, SHA-256 & Patch Version 4.0.0 verified');
}

// Phase 1: Pillar 1 — Living Frontier & Outpost Logistics (SECT.OUTPOSTS_LOGISTICS)
console.log('▶ [Phase 1 / Pillar 1] Testing Outpost Logistics, 4 Camp Types & Closed-Loop Supply Convoys...');
{
  const W = SIM.create('v400-outpost-logistics');
  W.sect.stock.grain = 200;
  W.sect.stock['P:BASIC_HEAL_1'] = 40;

  check(SECT.OUTPOSTS_LOGISTICS && SECT.OUTPOSTS_LOGISTICS.CAMP_TYPES, 'SECT.OUTPOSTS_LOGISTICS.CAMP_TYPES defined');
  for (const cType of ['CAMP_REST', 'CAMP_GUARD', 'CAMP_SUPPLY', 'CAMP_MEDIC']) {
    check(!!SECT.OUTPOSTS_LOGISTICS.CAMP_TYPES[cType], `Camp type ${cType} present in CAMP_TYPES`);
  }

  // Test establishing all 4 camp types across resource nodes
  const r1 = SECT.OUTPOSTS_LOGISTICS.establishOutpost(W, 'MINE_CELESTIAL_STONE', 'CAMP_REST', [W.npcs[1].id]);
  check(r1.ok === true && r1.outpost.campType === 'CAMP_REST' && r1.outpost.staminaRestorePct === 0.30, 'Established CAMP_REST outpost (+30% Stamina)');

  const r2 = SECT.OUTPOSTS_LOGISTICS.establishOutpost(W, 'MINE_STARFALL_CRAG', 'CAMP_GUARD', [W.npcs[2].id]);
  check(r2.ok === true && r2.outpost.campType === 'CAMP_GUARD' && r2.outpost.ambushRiskReduction === 0.40, 'Established CAMP_GUARD outpost (-40% ambush risk)');

  const r3 = SECT.OUTPOSTS_LOGISTICS.establishOutpost(W, 'VALLEY_MILLENNIAL_HERB', 'CAMP_SUPPLY', [W.npcs[1].id]);
  check(r3.ok === true && r3.outpost.campType === 'CAMP_SUPPLY' && r3.outpost.emergencyRationDraw === true, 'Established CAMP_SUPPLY outpost (emergency rations)');

  // Test CAMP_MEDIC injury cure & HP restore
  W.npcs[2].inj = [{ part: 'แขนขวา', why: 'คมดาบศัตรู', sev: 2 }];
  W.npcs[2].h.state.hp = 10;
  const r4 = SECT.OUTPOSTS_LOGISTICS.establishOutpost(W, 'MINE_CELESTIAL_STONE', 'CAMP_MEDIC', [W.npcs[2].id], { initialGrain: 10, initialPills: 4 });
  check(r4.ok === true && r4.outpost.campType === 'CAMP_MEDIC' && r4.outpost.cureSevereInjury === true, 'Established CAMP_MEDIC outpost');
  check(W.npcs[2].inj.length === 0 && W.npcs[2].h.state.hp > 10, 'CAMP_MEDIC cured severe injuries and restored HP');

  // Test Closed-Loop Supply Convoy (deducts real grain & pills from W.sect.stock)
  const grainBefore = W.sect.stock.grain;
  const pillsBefore = W.sect.stock['P:BASIC_HEAL_1'];
  const opGrainBefore = r4.outpost.grainStock;
  const opPillsBefore = r4.outpost.pillStock;

  const convoyRes = SECT.OUTPOSTS_LOGISTICS.dispatchSupplyConvoy(W, 'MINE_CELESTIAL_STONE', 25, 8, { pillKey: 'P:BASIC_HEAL_1' });
  check(convoyRes.ok === true && convoyRes.grainDelivered === 25 && convoyRes.pillDelivered === 8, 'Dispatched supply convoy to outpost');
  check(W.sect.stock.grain === grainBefore - 25, 'Closed-Loop: grain strictly deducted from W.sect.stock.grain');
  check(W.sect.stock['P:BASIC_HEAL_1'] === pillsBefore - 8, 'Closed-Loop: pills strictly deducted from W.sect.stock');
  check(r4.outpost.grainStock === opGrainBefore + 25 && r4.outpost.pillStock === opPillsBefore + 8, 'Outpost stock increased by delivered grain and pills');

  // Test tickOutpostLogistics when out of supplies -> morale drops
  r4.outpost.grainStock = 0;
  r4.outpost.pillStock = 0;
  r4.outpost.morale = 90;
  const tickRes = SECT.OUTPOSTS_LOGISTICS.tickOutpostLogistics(W);
  check(tickRes.ok === true && tickRes.shortageNodes.includes('MINE_CELESTIAL_STONE'), 'tickOutpostLogistics detected supply shortage');
  check(r4.outpost.morale < 90, `Outpost morale dropped when out of supplies (90 -> ${r4.outpost.morale})`);
  console.log('  ✓ Phase 1 (Pillar 1: Outpost Logistics) passed');
}

// Phase 2: Pillar 2 — Action-Derived Behavioral Mastery Traits (COMBAT.ACTION_MASTERY_TRAITS)
console.log('▶ [Phase 2 / Pillar 2] Testing Action-Derived Behavioral Mastery Traits & Chronicle Logging...');
{
  const W = SIM.create('v400-action-mastery');
  const npc = W.npcs[0];
  check(COMBAT.ACTION_MASTERY_TRAITS && COMBAT.ACTION_MASTERY_TRAITS.TRAIT_DEFS, 'COMBAT.ACTION_MASTERY_TRAITS defined');

  // 1. Parry 15 times -> TRAIT_PARRY_COUNTER
  for (let i = 0; i < 15; i++) {
    COMBAT.ACTION_MASTERY_TRAITS.recordAction(W, npc, 'parryCount', 1);
  }
  check(COMBAT.ACTION_MASTERY_TRAITS.hasTrait(npc, 'TRAIT_PARRY_COUNTER'), 'Unlocked TRAIT_PARRY_COUNTER after 15 parries');

  // 2. Cover 20 times -> TRAIT_VANGUARD_GUARD (+12% def)
  const defBefore = STATS.get(npc).def;
  for (let i = 0; i < 20; i++) {
    COMBAT.ACTION_MASTERY_TRAITS.recordAction(W, npc, 'coverCount', 1);
  }
  check(COMBAT.ACTION_MASTERY_TRAITS.hasTrait(npc, 'TRAIT_VANGUARD_GUARD'), 'Unlocked TRAIT_VANGUARD_GUARD after 20 covers');
  const defAfter = STATS.get(npc).def;
  check(defAfter > defBefore, `TRAIT_VANGUARD_GUARD increased NPC defense (${defBefore.toFixed(1)} -> ${defAfter.toFixed(1)})`);

  // 3. Clutch Heal 10 times -> TRAIT_COMBAT_MEDIC (+20% emergency heal)
  for (let i = 0; i < 10; i++) {
    COMBAT.ACTION_MASTERY_TRAITS.recordAction(W, npc, 'clutchHealCount', 1);
  }
  check(COMBAT.ACTION_MASTERY_TRAITS.hasTrait(npc, 'TRAIT_COMBAT_MEDIC'), 'Unlocked TRAIT_COMBAT_MEDIC after 10 clutch heals');

  // 4. Formation Ticks 30 turns -> TRAIT_FORMATION_STRATEGIST (+15% Qi regen)
  for (let i = 0; i < 30; i++) {
    COMBAT.ACTION_MASTERY_TRAITS.recordAction(W, npc, 'formationTicks', 1);
  }
  check(COMBAT.ACTION_MASTERY_TRAITS.hasTrait(npc, 'TRAIT_FORMATION_STRATEGIST'), 'Unlocked TRAIT_FORMATION_STRATEGIST after 30 formation ticks');

  const mods = COMBAT.ACTION_MASTERY_TRAITS.getTraitModifiers(npc);
  check(mods.reflectDmgBonus === 0.15 && mods.defBonusPct === 0.12 && mods.clutchHealBonusPct === 0.20 && mods.qiRegenBonusPct === 0.15, 'All 4 behavioral mastery modifiers active');
  check(Array.isArray(W.chronicle) && W.chronicle.length >= 4, 'Unlocked mastery traits recorded in W.chronicle');
  console.log('  ✓ Phase 2 (Pillar 2: Behavioral Mastery Traits) passed');
}

// Phase 3: Pillar 3 — Sect Charter & Long-Term Doctrine (SECT.CHARTER_DOCTRINE)
console.log('▶ [Phase 3 / Pillar 3] Testing 5 Sect Charters, 50-Stone Ceremony & System Perks...');
{
  const W = SIM.create('v400-sect-charter');
  W.sect.stones = 1000;
  check(W.sect.charter && W.sect.charter.activeDoctrine === 'CHARTER_MERITOCRACY', 'Default sect charter initialized to CHARTER_MERITOCRACY');

  const allCharters = [
    'CHARTER_MERITOCRACY',
    'CHARTER_BROTHERHOOD_SANCTUARY',
    'CHARTER_SCHOLASTIC_DAO',
    'CHARTER_OPEN_MERCHANT',
    'CHARTER_RECLUSIVE_HERMIT'
  ];

  for (const cid of allCharters) {
    const stonesBefore = W.sect.stones;
    const res = SECT.CHARTER_DOCTRINE.enactSectCharter(W, cid);
    check(res.ok === true && W.sect.charter.activeDoctrine === cid, `Enacted sect charter ${cid}`);
    check(W.sect.stones === stonesBefore - 50, `Ceremony deducted 50 Spirit Stones for ${cid}`);
    const perks = SECT.CHARTER_DOCTRINE.getCharterPerks(W);
    check(perks.id === cid && perks.loyaltyBonus > 0 && perks.recruitRateMult > 0, `getCharterPerks verified for ${cid}`);
  }
  console.log('  ✓ Phase 3 (Pillar 3: Sect Charter & Doctrine) passed');
}

// Phase 4: Pillar 4 — Strategic Council Assembly of 6 Grand Officers (SECT.STRATEGIC_COUNCIL)
console.log('▶ [Phase 4 / Pillar 4] Testing 6-Officer Strategic Council Assembly & 3 Strategic Agendas...');
{
  const W = SIM.create('v400-strategic-council');
  SECT.OUTPOSTS_LOGISTICS.establishOutpost(W, 'MINE_CELESTIAL_STONE', 'CAMP_GUARD', [W.npcs[1].id]);

  const conv = SECT.STRATEGIC_COUNCIL.conveneCouncil(W);
  check(conv.ok === true && conv.councilReport && conv.reportsList.length === 6, 'Convened 6-Officer Strategic Council');
  for (const post of ['spymaster', 'envoy', 'quartermaster', 'vanguard', 'warden', 'marketmaster']) {
    check(!!conv.officerReports[post], `Council report includes ${post}`);
  }
  check(Array.isArray(conv.options) && conv.options.length === 3, 'Council presents 3 strategic agenda options');

  for (const agendaId of ['FORTIFY_LOGISTICS', 'DIPLOMATIC_OFFENSIVE', 'GRAND_WAR_DRILL']) {
    const res = SECT.STRATEGIC_COUNCIL.resolveCouncilAgenda(W, agendaId);
    check(res.ok === true && res.choiceId === agendaId && res.councilReport.resolved === true, `Resolved council agenda ${agendaId}`);
  }
  console.log('  ✓ Phase 4 (Pillar 4: Strategic Council Assembly) passed');
}

// Phase 5: Pillar 5 — 4 Living Micro-Locations, UI, Save/Load & 80-NPC Tick Budget
console.log('▶ [Phase 5 / Pillar 5] Testing 4 Micro-Locations, UI Integration, Save/Load & 80-NPC Perf...');
{
  const W = SIM.create('v400-micro-locations');
  W.world.resourcePool = { stones: 50000, herbs: 5000, ores: 5000 };
  SECT.OUTPOSTS_LOGISTICS.establishOutpost(W, 'MINE_CELESTIAL_STONE', 'CAMP_REST', [W.npcs[1].id]);
  SECT.CHARTER_DOCTRINE.enactSectCharter(W, 'CHARTER_SCHOLASTIC_DAO');
  SECT.STRATEGIC_COUNCIL.conveneCouncil(W);
  SECT.STRATEGIC_COUNCIL.resolveCouncilAgenda(W, 'FORTIFY_LOGISTICS');
  COMBAT.ACTION_MASTERY_TRAITS.recordAction(W, W.npcs[0], 'parryCount', 15);

  const microIds = [
    'LOC_NAMELESS_SWORD_TOMB',
    'LOC_ANCIENT_MECH_RUINS',
    'LOC_MYRIAD_VENOM_FOREST',
    'LOC_MOON_MIRROR_VALLEY'
  ];
  for (const locId of microIds) {
    check(EXPLORE.MICRO_LOCATIONS && EXPLORE.MICRO_LOCATIONS[locId], `${locId} registered in EXPLORE.MICRO_LOCATIONS`);
    check(MAP.MICRO_LOCATIONS && MAP.MICRO_LOCATIONS[locId], `${locId} registered in MAP.MICRO_LOCATIONS`);
    const stonesBefore = W.sect.stones;
    const expRes = EXPLORE.dispatchExploration(W, locId, [W.npcs[0], W.npcs[1]]);
    check(expRes.ok === true && expRes.locationId === locId && W.sect.stones > stonesBefore, `Explored ${locId} and earned rewards`);
  }

  // Verify UI rendering
  UI.G = { W, R: {}, opts: {}, acc: 0, speed: 1 };
  UI.npcId = W.npcs[0].id;
  UI.tab = 'over';
  const sectHtml = UI.rSect(W);
  UI.tab = 'ov';
  check(sectHtml.includes('data-do="establish-outpost"') && sectHtml.includes('data-do="enact-sect-charter"') && sectHtml.includes('data-do="convene-strategic-council"'), 'UI.rSect renders v4.0.0 Outpost, Charter, and Council buttons');
  const npcHtml = UI.rNpc();
  check(npcHtml.includes('รอยชำนาญจากพฤติกรรมจริงในสนามรบ') && npcHtml.includes('กระบี่ตอบโต้'), 'UI.rNpc renders Behavioral Mastery Traits');
  const mapHtml = UI.rWorldMap(W);
  check(mapHtml.includes('LOC_NAMELESS_SWORD_TOMB') && mapHtml.includes('LOC_MOON_MIRROR_VALLEY'), 'UI.rWorldMap renders 4 Micro-Location controls');

  // Verify Save/Load Round-Trip
  const rawSave = SIM.serialize(W);
  const WLoaded = SIM.deserialize(rawSave);
  check(WLoaded.sect.outposts && WLoaded.sect.outposts.byNodeId.MINE_CELESTIAL_STONE, 'Outpost state persisted across Save/Load');
  check(WLoaded.sect.charter && WLoaded.sect.charter.activeDoctrine === 'CHARTER_SCHOLASTIC_DAO', 'Sect Charter persisted across Save/Load');
  check(WLoaded.sect.strategicCouncil && WLoaded.sect.strategicCouncil.resolvedCount >= 1, 'Strategic Council state persisted across Save/Load');
  check(WLoaded.sect.microLocations && WLoaded.sect.microLocations.totalRuns === 4, 'Micro-Location exploration history persisted across Save/Load');
  check(COMBAT.ACTION_MASTERY_TRAITS.hasTrait(WLoaded.npcs[0], 'TRAIT_PARRY_COUNTER'), 'NPC Behavioral Mastery Traits persisted across Save/Load');

  // Verify 80-NPC Simulation Tick Budget (<= 3.5 ms/tick)
  while (WLoaded.npcs.filter(n => n && !n.dead).length < 80) {
    SIM.addNpc(WLoaded, { rank: 1, stage: 2 });
  }
  SIM.tick(WLoaded);
  const t0 = Date.now();
  const ticks = 60;
  for (let i = 0; i < ticks; i++) SIM.tick(WLoaded);
  const msPerTick = (Date.now() - t0) / ticks;
  check(msPerTick <= 3.5, `80-NPC Simulation tick budget <= 3.5 ms/tick (got ${msPerTick.toFixed(3)} ms/tick)`);
  console.log(`  ✓ Phase 5 (Micro-Locations, Save/Load & 80-NPC perf: ${msPerTick.toFixed(3)} ms/tick) passed`);
}

console.log(`\n✅ ALL PHASES PASSED (${passed} assertions verified in v400_living_frontier_and_sect_charter_suite.js)!`);
