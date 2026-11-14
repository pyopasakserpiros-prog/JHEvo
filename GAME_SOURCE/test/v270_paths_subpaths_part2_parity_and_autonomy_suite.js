'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const G = require('./load');
const { SIM, SECT, CULT, ECO, HC, CPE, AI, EXT, COMBAT, MAP, STATS: ST, MARTIAL: M, JD } = G;

console.log('=== v270_paths_subpaths_part2_parity_and_autonomy_suite ===');

// 1. 43/43 PATH_DESCRIPTORS Parity, hpMult, & ST._applyMantraPathMods
{
  const paths = Object.keys(CULT.PATHS || {});
  assert.strictEqual(paths.length, 43, 'CULT.PATHS must contain all 43 Major Paths');

  for (const pk of paths) {
    const d = CULT.getPathDescriptor(pk);
    assert(d, 'PATH_DESCRIPTOR exists for ' + pk);
    assert(typeof d.resourceModel === 'string' && d.resourceModel.length > 0, pk + ' has resourceModel');
    assert(typeof d.archetypeRole === 'string' && d.archetypeRole.length > 0, pk + ' has archetypeRole');
    assert(Array.isArray(d.stations) && d.stations.length >= 3, pk + ' has >= 3 fallback stations');
    assert(d.scaling && d.scaling.combatOffenseBaseMult >= 1.09, pk + ' offense mult >= 1.09');
    assert(d.scaling && d.scaling.combatDefenseTakenMult <= 0.93, pk + ' defense taken mult <= 0.93');
    assert(d.scaling && d.scaling.mantraPerTier && d.scaling.mantraPerTier.p, pk + ' has mantraPerTier');
    assert(d.cult && d.cult.s1 && d.cult.mind, pk + ' has cultivate descriptor s1 & mind');
  }

  const W = SIM.create('desc-parity-scale');
  const probe = W.npcs[0];
  probe.cult.path = 'GOD';
  probe.cult.sub = CULT.PATHS.GOD.subPaths[0].id;
  probe.cult.stage = 5;
  const godHp5 = CULT.hpMult(probe);
  probe.cult.path = 'BODY';
  probe.cult.sub = CULT.PATHS.BODY.subPaths[0].id;
  const bodyHp5 = CULT.hpMult(probe);
  probe.cult.path = 'XIAN';
  probe.cult.sub = CULT.PATHS.XIAN.subPaths[0].id;
  const xianHp5 = CULT.hpMult(probe);
  assert(godHp5 > bodyHp5 && bodyHp5 > xianHp5, 'hpGrowthPerNormStage distinguishes GOD > BODY > XIAN at stage 5');

  // Verify ST._applyMantraPathMods reads PATH_DESCRIPTORS mantraPerTier cleanly
  const accMods = [];
  const recMod = (k, lab, mode, val) => accMods.push({ k, mode, val });
  ST._applyMantraPathMods({ path: 'FORTUNE_GAMBLER', stage: 3 }, { id: 'M_TEST', nameTh: 'Test Mantra', tier: 3 }, recMod);
  assert(accMods.some(m => m.k === 'crit' && m.mode === 'f' && m.val > 3), 'FORTUNE_GAMBLER mantraPerTier applies crit flat tier scaling');
  const shadowMods = [];
  ST._applyMantraPathMods({ path: 'SHADOW_SAMURAI', stage: 4 }, { id: 'M_SHD', nameTh: 'Iai', tier: 4 }, (k, _l, mode, val) => shadowMods.push({ k, mode, val }));
  assert(shadowMods.some(m => m.k === 'atk' && m.val > 0.15) && shadowMods.some(m => m.k === 'pen' && m.val >= 5), 'SHADOW_SAMURAI mantraPerTier scales atk and armor pen');
}

// 2. Wave 3-4 Combat Parity (No Reverse-Nerf) + MECH_PUPPET Integ Dead-Band Fix + Combat Mode Autonomy
{
  const W = SIM.create('combat-parity-mech', { archetype: 'sword' });
  const origNext = W.rng.next;
  W.rng.next = () => 0.5;
  try {
    const mkUnit = (id, pathId, stage) => {
      const u = SIM.addNpc(W, { stage: stage || 3, rank: 2, ageYears: 24 });
      u.h.id = id;
      u.cult = pathId ? {
        path: pathId,
        sub: CULT.PATHS[pathId].subPaths[0].id,
        stage: stage || 3,
        prog: 0,
        mantra: null,
        unlockedMantras: [],
        techs: []
      } : null;
      if (u.cult && pathId === 'MECH_PUPPET') CULT.ensureMechState(u);
      // Equalize raw combat stats so we strictly isolate path combat multipliers
      u._statOverride = { atk: 200, matk: 200, def: 100, mdef: 100, crit: 0, critDmg: 150, pen: 0, acc: 150, eva: 10, hpMax: 2000 };
      u.h.state.hp = 2000;
      u.h.state.qi = 500;
      return u;
    };

    const dummyDef = mkUnit('dummy-def', null, 1);
    dummyDef.foe = false;
    const dummyAtt = mkUnit('dummy-att', null, 1);
    const fBase = COMBAT.startFight(W, [dummyAtt.id], [dummyDef.id], 'duel', { serious: true });
    // Force fixed derived get & hpMax so raw A0/D/hpMax match across pathless vs path checks
    const origGet = ST.get;
    const origHpMax = CULT.hpMax;
    ST.get = u => (u && u._statOverride) ? Object.assign({}, u._statOverride) : origGet(u);
    CULT.hpMax = u => (u && u._statOverride && u._statOverride.hpMax) ? u._statOverride.hpMax : origHpMax(u);
    try {
      dummyDef.h.state.hp = 2000;
      const baseStrike = COMBAT.strike(W, fBase, dummyAtt, dummyDef, { M: 1.0, type: 'p', forced: true, noCrit: true, noCounter: true, noReflect: true, noProc: true });
      const baseDmg = baseStrike.dmg;
      assert(baseDmg > 0, 'Baseline strike inflicts positive damage');

      const formerNerfedPaths = ['ASTRO_DIVINATION', 'DRAGON_VEIN_GEOMANCY', 'LORE_ARCHIVIST', 'MERCANTILE_DAO', 'ARRAY_TALISMAN', 'STRATEGY_GOVERNANCE', 'CRAFT_CREATION'];
      for (const pk of formerNerfedPaths) {
        const attacker = mkUnit('atk-' + pk, pk, 3);
        const fAtk = COMBAT.startFight(W, [attacker.id], [dummyDef.id], 'duel', { serious: true });
        dummyDef.h.state.hp = 2000;
        const resA = COMBAT.strike(W, fAtk, attacker, dummyDef, { M: 1.0, type: 'p', forced: true, noCrit: true, noCounter: true, noReflect: true, noProc: true });
        assert(resA.dmg >= baseDmg * 1.08, `${pk} offense >= 1.08x baseline (got ${(resA.dmg / baseDmg).toFixed(3)})`);

        const defender = attacker;
        defender.h.state.hp = 2000;
        const fDef = COMBAT.startFight(W, [dummyAtt.id], [defender.id], 'duel', { serious: true });
        const resD = COMBAT.strike(W, fDef, dummyAtt, defender, { M: 1.0, type: 'p', forced: true, noCrit: true, noCounter: true, noReflect: true, noProc: true });
        assert(resD.dmg <= baseDmg * 0.94, `${pk} defense taken <= 0.94x baseline (got ${(resD.dmg / baseDmg).toFixed(3)})`);
      }
    } finally {
      ST.get = origGet;
      CULT.hpMax = origHpMax;
    }

    // MECH_PUPPET integ=30 dead-band fix & combat mode autonomy
    const mech = W.npcs.find(u => u && u.cult && u.cult.path === 'MECH_PUPPET') || mkUnit('mech-1', 'MECH_PUPPET', 3);
    const ms = CULT.ensureMechState(mech);
    ms.mode = 'SIEGE';
    ms.integrity = 30;
    const mods30 = [];
    ST._applyMechKarmaFaithMods(mech, (k, lab, mode, val) => mods30.push({ k, mode, val, lab }));
    assert(mods30.some(m => m.k === 'atk' && Math.abs(m.val - 0.04) < 0.002), 'MECH_PUPPET integrity 30 yields +0.04 (0.5x scaled) positive atk modifier instead of dead-band 0');
    ms.integrity = 20;
    const mods20 = [];
    ST._applyMechKarmaFaithMods(mech, (k, lab, mode, val) => mods20.push({ k, mode, val }));
    assert(mods20.some(m => m.k === 'def' && m.val < 0), 'MECH_PUPPET integrity < 25 receives structural penalty');

    mech.h.state.hp = Math.round(CULT.hpMax(mech) * 0.25);
    CULT.evaluateAutonomousPostures(W, mech, { trigger: 'combat', inCombat: true, fight: { id: 99, serious: true, A: [mech.id], B: [dummyDef.id], t0: W.t - 10 } });
    assert.strictEqual(mech.mechState.mode, 'BASTION', 'MECH_PUPPET autonomously switches to BASTION at critical HP in combat');
  } finally {
    W.rng.next = origNext;
  }
}

// 3. Era-5 Autonomy, Ascetic Vow Seal Lock, Multi-Mantra Auto-Upgrade, & UI Read-Only Purity
{
  const W = SIM.create('era5-autonomy');
  M.ensure(W);
  const disc = W.npcs[1];
  disc.cult.path = 'DEMON';
  disc.cult.sub = CULT.PATHS.DEMON.subPaths[0].id;
  disc.cult.stage = 4;
  disc.h.state.hp = CULT.hpMax(disc);
  disc.h.state.qi = CULT.qiMax(disc);
  CULT.evaluateAutonomousPostures(W, disc, { trigger: 'awaken' });
  assert(disc.mantraState && disc.mantraState.whyTh, 'Autonomous posture engine sets mantraState.whyTh on awaken');
  assert(disc.defensiveArtState && disc.defensiveArtState.whyTh, 'Autonomous posture engine sets defensiveArtState.whyTh');
  assert(disc.supportState && disc.supportState.whyTh, 'Autonomous posture engine sets supportState.whyTh');

  // Ascetic Vow MUST keep Forbidden Arts sealed even in desperate combat and Unrestricted Blood Cult vault policy
  disc.voluntaryVows = { VOW_ASCETIC_PRECEPT: { active: true } };
  disc.h.state.hp = Math.round(CULT.hpMax(disc) * 0.22);
  SECT.FORBIDDEN_VAULT.setVaultPolicy(W, 'UNRESTRICTED_BLOOD_CULT', { autonomous: true });
  CULT.evaluateAutonomousPostures(W, disc, { trigger: 'combat', inCombat: true, fight: { id: 88, serious: true, A: [disc.id], B: ['f1'], t0: W.t - 15 } });
  assert.strictEqual(disc.forbiddenArtState.sealMode, 'SEALED_RESTRAINT', 'VOW_ASCETIC_PRECEPT prevents forbidden unsealing under all policies');

  // Non-vow aggressive demon at low HP in serious combat unseals autonomously
  const killer = W.npcs[2];
  killer.cult.path = 'DEMON';
  killer.cult.sub = CULT.PATHS.DEMON.subPaths[0].id;
  killer.cult.stage = 4;
  killer.voluntaryVows = {};
  killer.h.personality.courage = 80;
  killer.h.state.hp = Math.round(CULT.hpMax(killer) * 0.25);
  CULT.evaluateAutonomousPostures(W, killer, { trigger: 'combat', inCombat: true, fight: { id: 89, serious: true, A: [killer.id], B: ['f1'], t0: W.t - 15 } });
  assert(killer.forbiddenArtState.sealMode === 'BLOOD_TABOO_UNLEASHED' || killer.forbiddenArtState.sealMode === 'HALF_UNSEALED_FLOW', 'Desperate non-vow combatant unseals forbidden art autonomously');

  // Autonomous mantra upgrade outside combat
  const scholar = W.npcs[3] || SIM.addNpc(W, { stage: 5, rank: 1 });
  scholar.cult.path = 'XIAN';
  scholar.cult.sub = 'SWORD_IMMORTAL';
  scholar.cult.stage = 5;
  const xianMantras = JD.TECH.mantras.filter(t => t && (t.path === 'XIAN' || !t.path) && M.canActivateMantra(scholar, t.id)).sort((a, b) => (a.tier || 1) - (b.tier || 1));
  if (xianMantras.length >= 2) {
    const lowM = xianMantras[0], highM = xianMantras[xianMantras.length - 1];
    scholar.cult.mantra = lowM.id;
    scholar.cult.unlockedMantras = [lowM.id, highM.id];
    CULT.evaluateAutonomousPostures(W, scholar, { trigger: 'cultivate' });
    assert.strictEqual(scholar.cult.mantra, highM.id, 'Autonomous posture engine upgrades disciple mantra outside combat when compatible higher tier unlocked');
  }

  // Sect Vault & Emergency Support Autonomy in SIM.hourly (orthodox majority + righteous master)
  if (W.npcs[0] && W.npcs[0].cult) W.npcs[0].cult.path = 'XIAN';
  killer.cult.path = 'XIAN';
  W.npcs[0].role = 'master';
  W.npcs[0].h.personality.integrity = 85;
  W.t = 24;
  SIM.hourly(W);
  assert.strictEqual(SECT.FORBIDDEN_VAULT.ensure(W).policy, 'STRICT_ORTHODOX_BAN', 'Righteous Sect Master autonomously sets STRICT_ORTHODOX_BAN policy');

  // UI Source Purity check (no Era-5 or switch-mantra interactive buttons left, and canActivateMantra boolean checked properly)
  const uiSrc = fs.readFileSync(path.join(__dirname, '../js/ui.js'), 'utf8');
  const forbiddenUiButtons = [
    'set-npc-mantra-stance', 'demo-mantra-resonance',
    'set-npc-defensive-posture', 'demo-defensive-aegis',
    'set-npc-support-posture', 'demo-support-art-aura', 'trigger-sect-emergency-support',
    'set-npc-forbidden-seal', 'demo-forbidden-taboo', 'set-npc-passive-constellation',
    'set-sect-forbidden-policy', 'perform-forbidden-altar-ritual', 'switch-mantra'
  ];
  for (const act of forbiddenUiButtons) {
    assert(!new RegExp(`<button[^>]*data-do="${act}"`).test(uiSrc), `UI must NOT contain interactive button for ${act}`);
  }
  assert(!/canActivateMantra\([^)]+\)\.ok/.test(uiSrc), 'UI must not read .ok on boolean MARTIAL.canActivateMantra');
}

// 4. monthlyAutonomousTick Guardrails + Treasury Gate + devourResourceForBody Organic Whitelist
{
  const W = SIM.create('monthly-devour-guards');
  M.ensure(W);
  W.sect.stones = 1000;
  // Exclude NPCs that are away / sealed / jailed; low-rank FORTUNE_GAMBLER must NOT drain W.sect.stones
  const gambler = W.npcs[1];
  gambler.rank = 1;
  gambler.post = null;
  gambler.id = 'gambler-low';
  W.byId[gambler.id] = gambler;
  gambler.cult.path = 'FORTUNE_GAMBLER';
  gambler.cult.sub = CULT.PATHS.FORTUNE_GAMBLER.subPaths[0].id;
  gambler.inv = gambler.inv || { stones: 0, mats: {}, pills: {}, gear: [], manuals: [], subManuals: [], crystals: {}, recipes: [] };
  gambler.inv.stones = 200;

  const jailedVoid = W.npcs[2];
  jailedVoid.cult.path = 'VOID_HERETIC_PACT';
  jailedVoid.cult.sub = CULT.PATHS.VOID_HERETIC_PACT.subPaths[0].id;
  jailedVoid.jail = W.t + 500;
  const gBefore = jailedVoid.pathGauge ? jailedVoid.pathGauge.value : 0;

  // Test devourResourceForBody before monthly tick too
  const devourer = W.npcs[3] || SIM.addNpc(W, { stage: 2, rank: 1 });
  W.sect.stock = { grain: 50, meal: 20, 'P:BASIC_HP': 5, MANUAL_PATH_XIAN: 1, ITEM_REPAIR_STONE_T1: 3 };
  const devReject = CULT.GRAND_DAO_MECHANICS.devourResourceForBody(W, devourer);
  assert.strictEqual(devReject.ok, false, 'devourResourceForBody refuses non-organic food/pills/manuals/repair stones');
  assert.strictEqual(W.sect.stock.grain, 50, 'Sect grain untouched');
  assert.strictEqual(W.sect.stock.meal, 20, 'Sect meal untouched');
  assert.strictEqual(W.sect.stock['P:BASIC_HP'], 5, 'Sect pills untouched');
  const devGrainExplicit = CULT.GRAND_DAO_MECHANICS.devourResourceForBody(W, devourer, 'grain');
  assert.strictEqual(devGrainExplicit.ok, false, 'Explicit grain devouring rejected');

  devourer.inv.mats = { MAT_BP_BEAST_HEART: 1 };
  const devPersonal = CULT.GRAND_DAO_MECHANICS.devourResourceForBody(W, devourer);
  assert.strictEqual(devPersonal.ok, true, 'devourResourceForBody consumes personal beast drop cleanly');
  assert.strictEqual(devPersonal.consumedItemId, 'MAT_BP_BEAST_HEART');
  assert(!devourer.inv.mats.MAT_BP_BEAST_HEART, 'Personal beast drop decremented and cleaned up');

  // Make sure only gambler & baseline exist (no unauthorized treasury spender on sect stones)
  W.npcs.forEach(u => {
    if (u && u.id !== gambler.id && u.id !== jailedVoid.id && u.cult && !['XIAN', 'BODY'].includes(u.cult.path)) {
      u.cult.path = 'XIAN';
      u.cult.sub = 'SWORD_IMMORTAL';
    }
  });
  CULT.GRAND_DAO_MECHANICS.monthlyAutonomousTick(W);
  assert.strictEqual(W.sect.stones, 1000, 'Unauthorized FORTUNE_GAMBLER must never drain W.sect.stones');
  assert.strictEqual(jailedVoid.pathGauge ? jailedVoid.pathGauge.value : 0, gBefore, 'Jailed NPC excluded from monthlyAutonomousTick');
}

// 5. Peak Sanctuary Awakened Stations + SHADOW_SAMURAI Zero-Qi/Xiaoli + A.cultivate.tick
{
  const W = SIM.create('peak-samurai-tick');
  M.ensure(W);
  assert(W.map && Array.isArray(W.map.peakBuildings) && W.map.peakBuildings.length >= 1, 'Map generates Peak Sanctuary buildings');
  const pb = W.map.peakBuildings[0];
  const disc = W.npcs[1];
  disc.peakId = pb.peakId;
  disc.isIndependentFromPeak = false;
  disc.cult.path = 'XIAN';
  disc.cult.sub = 'SWORD_IMMORTAL';

  // Unawakened Peak must NOT return stations
  assert.strictEqual(AI.freeStation(W, disc, 'meditate', 'PEAK_SELF'), null, 'Unawakened Peak Sanctuary stays sealed');

  // Awaken Peak Sanctuary
  W.sect.peaks = W.sect.peaks || { byId: {} };
  W.sect.peaks.byId[pb.peakId] = Object.assign(W.sect.peaks.byId[pb.peakId] || {}, { founded: true, level: 2 });
  MAP.syncPeakSanctuaries(W);
  assert(MAP.isPeakBuildingActive(W, pb), 'Peak Sanctuary reports active once founded');
  const peakMed = AI.freeStation(W, disc, 'meditate', 'PEAK_SELF');
  const peakPrac = AI.freeStation(W, disc, 'dummy', 'PEAK_SELF');
  const peakEat = AI.freeStation(W, disc, 'eat', 'PEAK_SELF');
  const peakBed = AI.freeStation(W, disc, 'bed', 'PEAK_SELF');
  assert(peakMed && peakPrac && peakEat && peakBed, 'Awakened Peak Sanctuary provides meditate/practice/eat/bed stations');
  const rCult = CULT.resolvePathStations(W, disc, 'cultivate');
  assert(rCult && rCult.fromPeak === pb.id && rCult.st, 'resolvePathStations prioritizes awakened Peak Sanctuary');
  const rBt = AI.ACTS.breakthrough.where(W, disc);
  assert(rBt && rBt.st && rBt.st.bkey === pb.id, 'A.breakthrough.where prioritizes awakened Peak Sanctuary');

  // SHADOW_SAMURAI ZERO_QI_IAI invariants
  const sam = W.npcs[2];
  sam.cult.path = 'SHADOW_SAMURAI';
  sam.cult.sub = CULT.PATHS.SHADOW_SAMURAI.subPaths[0].id;
  sam.cult.stage = 3;
  sam.h.state.qi = 0;
  sam.inv.pills = { 'P:BASIC_QI': 3 };
  sam.inv.stones = 500;
  assert(CULT.isZeroQiSamurai(sam), 'SHADOW_SAMURAI detected as zero-Qi path');
  const fought = CPE.fightUse(W, sam, { pillAt: 0 });
  assert.strictEqual(fought, false, 'SHADOW_SAMURAI does not waste qiRestore pills in combat');
  assert.strictEqual(sam.inv.pills['P:BASIC_QI'], 3, 'SHADOW_SAMURAI qiRestore pills untouched');

  if (EXT && EXT.activeVisitors) {
    W.external = W.external || {};
    W.external.visitors = [{ id: 'vis1', nameTh: 'Trader', arriveDay: W.day, leaveDay: W.day + 5, stones: 500, stock: { 'P:BASIC_QI': 5 } }];
    sam.inv.pills = {};
    const q = EXT.memberQuote(W, sam, 'vis1');
    assert(!q || q.itemId !== 'P:BASIC_QI', 'SHADOW_SAMURAI does not seek qiRestore pills from external traders');
  }

  // Xiaoli Heart Dagger proc uses IAI_FOCUS (pathGauge) on SHADOW_SAMURAI (minStage 5 required by gearUsable)
  sam.cult.stage = 5;
  sam.equip = sam.equip || {};
  sam.equip.WEAPON = Object.assign({ id: 'LEG_WPN_XIAOLI_HEART_DAGGER', nameTh: 'Xiaoli Dagger', tier: 7, q: 1 }, (ECO && ECO.itemById && ECO.itemById['LEG_WPN_XIAOLI_HEART_DAGGER']) || (JD.ITEMS && Array.isArray(JD.ITEMS.equipment) && JD.ITEMS.equipment.find(x => x.id === 'LEG_WPN_XIAOLI_HEART_DAGGER')) || {});
  sam.pathGauge = { type: 'IAI_FOCUS', value: 25, max: 100, ready: false };
  sam.wpnProcCds = {};
  const target = W.npcs[3] || SIM.addNpc(W, { stage: 2, rank: 1 });
  target.h.state.hp = 5000;
  const fxFight = COMBAT.startFight(W, [sam.id], [target.id], 'duel', { serious: true });
  COMBAT.strike(W, fxFight, sam, target, { M: 1.0, type: 'p', noProc: false });
  assert(sam.pathGauge.value < 25 || (sam.lastWeaponProc && sam.lastWeaponProc.effectId === 'EFX_LEG_XIAOLI_TRUE_STRIKE'), 'Xiaoli Heart Dagger proc draws IAI_FOCUS cleanly for SHADOW_SAMURAI at 0 qi');

  // A.cultivate.tick descriptor training & gauge refill
  sam.act = { id: 'cultivate', stage: 'do', left: 30, total: 30 };
  const gauge0 = sam.pathGauge.value;
  W.t = 25;
  AI.ACTS.cultivate.tick(sam, W);
  assert(sam.pathGauge.value > gauge0, 'A.cultivate.tick replenishes descriptor gaugePerTick (IAI_FOCUS)');
  assert(Number.isFinite(sam.cult.prog), 'A.cultivate.tick leaves cultivation progress finite');
}

console.log('PASS v270_paths_subpaths_part2_parity_and_autonomy_suite (all 5 test groups)');
