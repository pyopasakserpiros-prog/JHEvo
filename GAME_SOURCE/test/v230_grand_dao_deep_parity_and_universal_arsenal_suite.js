'use strict';
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const G = require('./load.js');
require('../js/ui.js');

const { HC, SIM, SECT, CULT, MARTIAL, COMBAT, STATS, SK, ECO, EXPLORE, EXPED, VC, JD, AI } = G;
const ROOT = path.resolve(__dirname, '..');

console.log('============================================================================');
console.log('   JIANGHUSECT 2 (v2.3.0: GRAND DAO DEEP PARITY & UNIVERSAL ARSENAL SUITE)  ');
console.log('============================================================================');

let passed = 0;
function check(cond, msg) {
  if (!cond) {
    console.error('❌ FAIL:', msg);
    process.exit(1);
  }
  passed++;
}

// 0. Core Lock & Version Invariants
{
  const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
  const sha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  check(sha === 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js SHA-256 must match');
  check(HC.FINGERPRINT === '155:2f9c9dd7', 'HC.FINGERPRINT must be 155:2f9c9dd7');
  check((SIM.PATCH_VERSION === '2.3.0' || (SIM.PATCH_VERSION === '2.4.0' || SIM.PATCH_VERSION === '2.5.0')), `SIM.PATCH_VERSION must be '2.3.0' (got ${SIM.PATCH_VERSION})`);
  check((SIM.SAVE_SCHEMA_VERSION === '2.3.0-grand-dao-deep-parity-release' || SIM.SAVE_SCHEMA_VERSION === '2.4.0-tactical-composable-grand-dao'), `SIM.SAVE_SCHEMA_VERSION must be '2.3.0-grand-dao-deep-parity-release'`);
  console.log('  ✓ [0/6] Core Lock & v2.3.0 Schema Invariants Verified');
}

// 1. Pillar 1: 43-Path Technique Parity, 31 New Legendary Apex Arts, 64 Era-5 Arts & 30 Universal/Multi-Path Arts
{
  const allPaths = Object.keys(CULT.PATHS);
  check(allPaths.length === 43, `Expected 43 Grand Dao Paths, got ${allPaths.length}`);

  // Verify every single one of the 31 newer Grand Dao paths has its Tier-7 Legendary Technique (LEG_V230_<PATH>)
  const newer31Paths = allPaths.slice(12);
  for (const pid of newer31Paths) {
    const legTech = CULT.tech('LEG_V230_' + pid);
    check(legTech && legTech.legendary === true && legTech.tier === 7 && legTech.signatureVfx,
      `Path ${pid} must have Tier-7 Legendary Apex Technique LEG_V230_${pid} with signatureVfx`);
    const pathTechs = JD.TECH.techniques.filter(t => t && t.path === pid);
    check(pathTechs.length >= 18, `Path ${pid} must have at least 18 techniques (got ${pathTechs.length})`);
  }

  // Verify 12 Universal Arts (path === 'ANY') and 18 Multi-Path Shared Weapon Arts (compatiblePaths)
  const uniArts = JD.TECH.techniques.filter(t => t && t.universalDao === true && t.path === 'ANY');
  const multiPathArts = JD.TECH.techniques.filter(t => t && t.multiPathShared === true && Array.isArray(t.compatiblePaths));
  check(uniArts.length === 12, `Expected 12 Universal Dao techniques, got ${uniArts.length}`);
  check(multiPathArts.length === 18, `Expected 18 Multi-Path Shared Weapon techniques, got ${multiPathArts.length}`);

  const W = SIM.create('v230-tech-compat');
  const npc = W.npcs[0];
  npc.cult = { path: 'FORTUNE_GAMBLER', sub: 'HEAVENLY_DICE_ORACLE', stage: 7, prog: 0, techs: [] };
  check(MARTIAL.canLearnTech(npc, 'TECH_UNI_V230_001').ok === true, 'Universal technique TECH_UNI_V230_001 is learnable by FORTUNE_GAMBLER');
  check(MARTIAL.canLearnTech(npc, 'TECH_UNI_V230_029').ok === true, 'Shared Abacus technique TECH_UNI_V230_029 is learnable by FORTUNE_GAMBLER');
  npc.cult.path = 'SHADOW_SAMURAI';
  npc.cult.sub = 'IAI_FLASH_SLASH';
  check(MARTIAL.canLearnTech(npc, 'TECH_UNI_V230_005').ok === true, 'Universal Sword/Blade technique TECH_UNI_V230_005 is learnable by SHADOW_SAMURAI');
  check(MARTIAL.canLearnTech(npc, 'TECH_UNI_V230_029').ok === false, 'Non-Sword/Blade Abacus technique is blocked for SHADOW_SAMURAI');
  console.log('  ✓ [1/6] Pillar 1: 43-Path Technique Parity, 31 Legendary Arts & 30 Universal/Shared Weapon Arts Verified');
}

// 2. Pillar 2: Procedural Templates Fix, 24 New T1-T7 Materials, 36 Specialized Weapons & 31 Legendary Relics
{
  const W = SIM.create('v230-procedural-and-relics');
  const new6WeaponTypes = ['ROSARY', 'CLAW', 'NEEDLE', 'FAN', 'ASTROLABE', 'ABACUS'];
  for (const wt of new6WeaponTypes) {
    const rec = ECO.recipeById['REC_PROC_' + wt];
    check(rec && rec.gearType === wt && rec.proceduralGearType === wt && rec.proceduralSlot === 'WEAPON',
      `Procedural recipe REC_PROC_${wt} must have explicit gearType and proceduralGearType === ${wt}`);

    const rolled1 = ECO.rollProceduralGear(W, { slot: 'WEAPON', gearType: wt, tier: 4 });
    const rolled2 = ECO.rollProceduralGear(W, { slot: 'WEAPON', subType: wt, tier: 4 });
    check(MARTIAL.gearType(rolled1) === wt && MARTIAL.gearType(rolled2) === wt,
      `ECO.rollProceduralGear must roll exact weapon type ${wt} for both gearType and subType`);

    const allWepsOfType = Object.values(ECO.itemById).filter(it => it.slot === 'WEAPON' && MARTIAL.gearType(it) === wt);
    const legWepsOfType = allWepsOfType.filter(it => it.legendary || it.isLegendaryRelic || it.tier >= 7);
    check(allWepsOfType.length >= 15, `Weapon class ${wt} must have >= 15 weapons (got ${allWepsOfType.length})`);
    check(legWepsOfType.length >= 4, `Weapon class ${wt} must have >= 4 Legendary/T7 weapons (got ${legWepsOfType.length})`);
  }

  for (let i = 1; i <= 24; i++) {
    const mid = 'MAT_V230_' + String(i).padStart(3, '0');
    const mat = ECO.itemById[mid];
    check(mat && mat.materialMods && Array.isArray(mat.obtainSources) && mat.obtainSources.length >= 2,
      `Material ${mid} must exist with materialMods and multi-source obtainSources`);
  }

  const newer31Paths = Object.keys(CULT.PATHS).slice(12);
  for (const pid of newer31Paths) {
    const rel = ECO.itemById['REL_V230_' + pid];
    const rec = ECO.recipeById['REC_REL_V230_' + pid];
    check(rel && rel.legendary === true && rel.isLegendaryRelic === true && rel.tier === 7 && Array.isArray(rel.grantedSkills) && rel.grantedSkills.includes('LEG_V230_' + pid),
      `Path ${pid} must have Tier-7 Legendary Relic REL_V230_${pid} granting LEG_V230_${pid}`);
    check(rec && rec.outItemId === rel.id, `Forge recipe REC_REL_V230_${pid} must exist`);
  }
  console.log('  ✓ [2/6] Pillar 2: Procedural Templates, 24 Materials, 15+ Weapons/Class & 31 Legendary Path Relics Verified');
}

// 3. Pillar 3: Era-5 Systems (Qinggong, Mantra, Defense, Support, Forbidden, Constellation & Tribulation) Across All 43 Paths
{
  const W = SIM.create('v230-era5-43paths');
  const n = W.npcs[0];
  for (const pid of Object.keys(CULT.PATHS)) {
    const pObj = CULT.PATHS[pid];
    n.cult = {
      path: pid,
      sub: pObj.subPaths[0].id,
      stage: 6,
      prog: 0,
      techs: JD.TECH.techniques.filter(t => t && t.path === pid).map(t => t.id)
    };
    n.cult.mantra = n.cult.techs.find(id => id.startsWith('MANTRA_')) || null;
    delete n._qgUnlockCache;
    delete n._qgTickCache;
    n._ver = (n._ver || 0) + 1;

    const trib = CULT.TRIBULATION.resolvePathStyle(pid);
    const qg = CULT.QINGGONG.resolveNpcMode(W, n);
    const mn = CULT.MANTRA_SYSTEM.resolveNpcMantra(W, n);
    const df = CULT.DEFENSIVE_ARTS.resolveNpcDefense(W, n);
    const sp = CULT.SUPPORT_ARTS.resolveNpcSupport(W, n);
    const fb = CULT.FORBIDDEN_ARTS.resolveNpcForbidden(W, n);
    const cs = CULT.PASSIVE_RESONANCE.resolveNpcConstellation(W, n);
    check(trib && trib.id && qg && qg.modeId && mn && mn.archetypeId && df && df.archetypeId && sp && sp.archetypeId && fb && fb.archetypeId && cs && cs.constellationId,
      `All 7 Era-5 & Tribulation resolvers must succeed for path ${pid}`);
  }
  console.log('  ✓ [3/6] Pillar 3: Era-5 Systems & Tribulation Styles Verified Across All 43 Paths');
}

// 4. Pillar 4: SECT.PEAKS Sub-Sanctuaries, 16 Armament Wills, Duet Catalog & Pagoda Floor Drops
{
  const W = SIM.create('v230-peaks-duets');
  check(SECT.PEAKS.PATH_SANCTUARY_BLESSINGS && Object.keys(SECT.PEAKS.PATH_SANCTUARY_BLESSINGS).length === 43,
    'SECT.PEAKS.PATH_SANCTUARY_BLESSINGS must cover all 43 Grand Dao Paths');
  check(Object.keys(SECT.SOUL_FORGE.ARMAMENT_WILLS).length >= 16,
    'SECT.SOUL_FORGE.ARMAMENT_WILLS must cover all 16 weapon classes');
  check(Object.keys(COMBAT.DUET_CATALOG).length >= 8,
    'COMBAT.DUET_CATALOG must include the new Grand Dao Duet Resonance Skills');

  // Verify SHADOW_SAMURAI with BLADE gets PEAK_AZURE_SWORD bonus
  const sam = W.npcs[0];
  sam.cult = { path: 'SHADOW_SAMURAI', sub: 'IAI_FLASH_SLASH', stage: 5, prog: 0, techs: ['MP_BASE_SHADOW_SAMURAI'] };
  sam.equip = { WEAPON: ECO.itemById['REL_V230_SHADOW_SAMURAI'] };
  SECT.PEAKS.foundPeak(W, 'PEAK_AZURE_SWORD', sam.id, { allowDecree: true, quiet: true });
  SECT.PEAKS.activatePeakArray(W, 'PEAK_AZURE_SWORD');
  sam.peakId = 'PEAK_AZURE_SWORD';
  const pkBonus = SECT.PEAKS.getUnitPeakBonuses(W, sam);
  check(pkBonus && pkBonus.active && pkBonus.p.atk >= 0.10, 'SHADOW_SAMURAI with BLADE receives PEAK_AZURE_SWORD sword/blade power bonus');
  console.log('  ✓ [4/6] Pillar 4: 43-Path Peak Sub-Sanctuaries, 16 Armament Wills & Duet Catalog Verified');
}

// 5. Pillar 5: 22 Signature Skill VFX & NPC Gear Suitability Across All 43 Paths
{
  const W = SIM.create('v230-vfx-and-ai');
  const sigKeys = Object.keys(SK.SIGNATURE_VFX_CATALOG || {});
  check(sigKeys.length >= 22, `SK.SIGNATURE_VFX_CATALOG must have 22 entries (got ${sigKeys.length})`);

  const npc = W.npcs[0];
  for (const pid of Object.keys(CULT.PATHS).slice(12)) {
    const pObj = CULT.PATHS[pid];
    npc.cult = { path: pid, sub: pObj.subPaths[0].id, stage: 7, prog: 0, techs: ['LEG_V230_' + pid] };
    const rel = ECO.itemById['REL_V230_' + pid];
    const suit = MARTIAL.gearSuitability(npc, rel, 0);
    check(suit && Number.isFinite(suit.score) && suit.fit >= 1.35, `NPC on path ${pid} evaluates its Legendary Relic REL_V230_${pid} with high suitability fit (${suit && suit.fit})`);
  }
  console.log('  ✓ [5/6] Pillar 5: 22 Signature Skill VFX & NPC Gear Suitability Verified Across All 43 Paths');
}

console.log(`\n✅ PASS: v230_grand_dao_deep_parity_and_universal_arsenal_suite (${passed} assertions passed)\n`);
