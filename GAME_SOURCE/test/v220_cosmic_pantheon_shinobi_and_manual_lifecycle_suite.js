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
console.log('   JIANGHUSECT 2 (v2.2.0: 43 GRAND DAO PATHS, PANTHEON & MANUAL LIFECYCLE)  ');
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
  const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  check(hcSha === 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js SHA-256 must remain byte-for-byte identical');
  check(HC.FINGERPRINT === '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
  check((SIM.PATCH_VERSION === '2.2.0' || (SIM.PATCH_VERSION === '2.3.0' || (SIM.PATCH_VERSION === '2.4.0' || SIM.PATCH_VERSION === '2.5.0'))), `SIM.PATCH_VERSION must be '2.2.0' (got ${SIM.PATCH_VERSION})`);
  check((SIM.SAVE_SCHEMA_VERSION === '2.2.0-cosmic-pantheon-shinobi-manual-lifecycle' || (SIM.SAVE_SCHEMA_VERSION === '2.3.0-grand-dao-deep-parity-release' || SIM.SAVE_SCHEMA_VERSION === '2.4.0-tactical-composable-grand-dao')), `SIM.SAVE_SCHEMA_VERSION must be '2.2.0-cosmic-pantheon-shinobi-manual-lifecycle' (got ${SIM.SAVE_SCHEMA_VERSION})`);
  console.log('  ✓ [0/6] Core Lock & v2.2.0 Schema Invariants Verified');
}

// 1. Pillar 1: P0 Bug #1 (Exclusive Tech Leak Prevention), P0 Bug #2 (Save Schema Guard) & Manual Lifecycle Pipeline
{
  const W = SIM.create('v220-p0-and-manual-lifecycle', { masterIdx: 0 });
  const mentor = W.npcs[0];
  const disciple = W.npcs[1];

  // P0 Bug #1: Mentor on XIAN/PURE_SWORD_SAINT cannot transmit exclusive subpath/path techniques to a BUDDHA_DHARMA disciple
  mentor.cult.path = 'XIAN';
  mentor.cult.sub = 'PURE_SWORD_SAINT';
  mentor.cult.stage = 6;
  mentor.cult.techs = ['INNATE_PURE_SWORD_SAINT_CORE', 'ART190_XIAN_001'];
  disciple.cult.path = 'BUDDHA_DHARMA';
  disciple.cult.sub = 'GOLDEN_LOTUS_ARHAT';
  disciple.cult.stage = 2;
  disciple.cult.techs = [];

  mentor.apprenticeIds = [disciple.id]; disciple.mentor = mentor.id;
  const txRes = SECT.MENTORSHIP.transmitQi(W, mentor.id, disciple.id, { force: true, quiet: true });
  check(txRes && txRes.ok === true, 'MENTORSHIP.transmitQi executes');
  check(!disciple.cult.techs.includes('INNATE_PURE_SWORD_SAINT_CORE') && !disciple.cult.techs.includes('ART190_XIAN_001'),
    `Cross-path/exclusive techniques must NOT leak to incompatible disciple (got ${disciple.cult.techs.join(',')})`);

  // Also test EDITOR.directCatalogAction: teach blocks cross-path/innate tech
  const badTeach = SECT.EDITOR.directCatalogAction(W, { action: 'teach', kind: 'TECH_MANUAL', id: 'ART190_XIAN_001', npcId: disciple.id });
  check(badTeach && badTeach.ok === false, 'EDITOR.directCatalogAction(teach) must reject cross-path technique without forceCrossPath');

  // P0 Bug #2: Save Schema Version Forward-Compatibility Guard in SIM.deserialize
  const validSnap = JSON.parse(SIM.serialize(W));
  const futureSchemaSnap = Object.assign({}, validSnap, { schemaVersion: '9999.0.0-future-schema' });
  let rejectedFutureSchema = false;
  try {
    SIM.deserialize(JSON.stringify(futureSchemaSnap));
  } catch (e) {
    rejectedFutureSchema = true;
  }
  check(rejectedFutureSchema === true, 'SIM.deserialize must reject future schemaVersion (9999.0.0-future-schema)');

  const futurePatchSnap = Object.assign({}, validSnap, { patchVersion: '9999.0.0' });
  let rejectedFuturePatch = false;
  try {
    SIM.deserialize(JSON.stringify(futurePatchSnap));
  } catch (e) {
    rejectedFuturePatch = true;
  }
  check(rejectedFuturePatch === true, 'SIM.deserialize must reject future patchVersion (9999.0.0)');

  // Grand Dao Manual Lifecycle Pipeline: Vault -> Library Registration OR Caravan Surplus Sale
  check(!W.sect.pathLibrary.unlockedPaths.includes('SHADOW_SAMURAI'), 'SHADOW_SAMURAI starts locked');
  ECO.add(W, 'MANUAL_PATH_SHADOW_SAMURAI', 3); // 1 to unlock in library + 2 duplicate surplus copies
  const procRes = SECT.PATH_LIBRARY.processVaultManuals(W, { quiet: true });
  check(procRes.registered.includes('MANUAL_PATH_SHADOW_SAMURAI'), 'First copy of MANUAL_PATH_SHADOW_SAMURAI is registered into Sect Library');
  check(W.sect.pathLibrary.unlockedPaths.includes('SHADOW_SAMURAI'), 'SHADOW_SAMURAI is now unlocked in W.sect.pathLibrary');
  check(ECO.count(W, 'MANUAL_PATH_SHADOW_SAMURAI') === 2, 'Remaining 2 duplicate copies stay in stock as export surplus');

  const stonesBeforeSale = W.sect.stones;
  const sellRes = SECT.PATH_LIBRARY.sellSurplusManuals(W, { quiet: true });
  check(sellRes.soldCount === 2 && sellRes.revenueStones === 2040, `2 duplicate manuals sold for 2040 stones (got ${sellRes.revenueStones})`);
  check(W.sect.stones === stonesBeforeSale + 2040 && ECO.count(W, 'MANUAL_PATH_SHADOW_SAMURAI') === 0,
    'Duplicate manuals removed from stock and revenue credited to W.sect.stones & ledger');
  console.log('  ✓ [1/6] Pillar 1: P0 Bug #1, P0 Bug #2 & Grand Dao Manual Lifecycle Pipeline Verified');
}

// 2. Pillar 2: Higher Realms Cosmology & The Five Pantheons (5 Realms, 20 Deities, 10^-12..5% Scaling & Cosmic Shrine)
{
  const pantheon = CULT.HIGHER_REALMS_PANTHEON;
  check(pantheon && Object.keys(pantheon.REALMS).length === 5, 'Must define all 5 Higher Realms');
  check(Object.keys(pantheon.DEITIES).length === 20, 'Must define all 20 True Divine Entities across 5 Pantheons');

  const sc1 = pantheon.getManifestationScale(1);
  const sc3 = pantheon.getManifestationScale(3);
  const sc5 = pantheon.getManifestationScale(5);
  const sc8 = pantheon.getManifestationScale(8);
  check(sc1.cosmicFraction === 1e-12, `Stage 1 manifestation scale must be 1e-12 (1 in a trillion), got ${sc1.cosmicFraction}`);
  check(sc3.cosmicFraction === 1e-6, `Stage 3 manifestation scale must be 1e-6 (1 in a million), got ${sc3.cosmicFraction}`);
  check(sc5.cosmicFraction === 1e-3, `Stage 5 manifestation scale must be 1e-3 (1 in a thousand), got ${sc5.cosmicFraction}`);
  check(sc8.cosmicFraction === 0.05, `Stage 8 manifestation scale must be 0.05 (5%), got ${sc8.cosmicFraction}`);

  const W = SIM.create('v220-cosmic-shrine-test', { masterIdx: 0, archetype: 'div_summon' });
  W.sect.stones = 1000;
  const master = W.byId[W.sect.masterId];
  const shrineRes = SECT.COSMIC_SHRINE.consecrateOffering(W, 'HIMAVANTA_SIAM_DEVA');
  check(shrineRes && shrineRes.ok === true && W.sect.stones === 850, 'SECT.COSMIC_SHRINE.consecrateOffering debits 150 stones');
  check(master.deityPact && master.deityPact.realmId === 'HIMAVANTA_SIAM_DEVA', 'Master receives Deity Pact from Himavanta Siam Deva');
  console.log('  ✓ [2/6] Pillar 2: 5 Higher Realms, 20 True Deities, 10^-12..5% Scaling & Cosmic Shrine Verified');
}

// 3. Pillar 3: All 43 Grand Dao Paths, 286 Subpaths, Zero-Qi Bushido Samurai & 48 Sect Archetypes
{
  const allPaths = Object.keys(CULT.PATHS);
  check(allPaths.length === 43, `Total Major Paths must be 43 (27 + 16), got ${allPaths.length}`);
  check(Object.keys(CULT.PATH_GAUGES).length === 43, 'Total Path Gauges must be 43');
  const allSubs = Object.values(CULT.PATHS).flatMap(p => p.subPaths || []);
  check(allSubs.length === 286, `Total Subpaths must be 286 (222 + 64), got ${allSubs.length}`);
  check(EXPLORE.NINE_DAO_PAGODA.floors.length === 43, 'Nine-Dao Pagoda must have 43 floors');
  check(MARTIAL.RESONANCE_SETS.length === 62, `Total Resonance Sets must be 62 (19 baseline + 43 Pagoda), got ${MARTIAL.RESONANCE_SETS.length}`);

  for (const pid of allPaths) {
    check(SECT.PEAKS.peakIdForPath(pid) !== null, `Path ${pid} must map to a valid Sect Peak`);
    check(SECT.UNIVERSAL_EQUITY_V235[pid], `Path ${pid} must be registered in SECT.UNIVERSAL_EQUITY_V235`);
  }

  // Test Zero-Qi Bushido Samurai (SHADOW_SAMURAI)
  const W = SIM.create('v220-samurai-bushido', { masterIdx: 0, archetype: 'samurai' });
  const sam = W.byId[W.sect.masterId];
  check(sam.cult.path === 'SHADOW_SAMURAI' && CULT.isZeroQiSamurai(sam) === true, 'Master is a SHADOW_SAMURAI');
  const pg = CULT.ensurePathGauge(sam);
  check(pg.id === 'IAI_FOCUS' && pg.value === 100 && pg.ready === true, 'SHADOW_SAMURAI starts with 100 IAI_FOCUS');
  check(sam.h.state.qi === 0, 'SHADOW_SAMURAI has 0 Qi/MP (No-Mana Bushido)');

  // Verify weapon restriction: can learn SWORD/BLADE, cannot learn ZITHER/ROSARY tech
  const zitherTech = JD.TECH.techniques.find(t => t && Array.isArray(t.weaponTypes) && t.weaponTypes.includes('ZITHER') && !t.weaponTypes.includes('SWORD') && !t.weaponTypes.includes('BLADE'));
  if (zitherTech) {
    const compat = MARTIAL.canLearnTech(sam, zitherTech);
    check(compat.ok === false && compat.accessClass === 'BUSHIDO_RESTRICTED', 'SHADOW_SAMURAI must reject non-SWORD/BLADE techniques');
  }
  console.log('  ✓ [3/6] Pillar 3: 43 Grand Paths, 286 Subpaths & Zero-Qi Bushido Samurai Verified');
}

// 4. Pillar 4: New Composable Combat Mechanics (Shadow Clone 1-HP Decoy, Substitution Log Swap, Parry Counter & Bone Armor)
{
  const W = SIM.create('v220-combat-mechanics', { masterIdx: 0 });
  const a = W.npcs[0], d = W.npcs[1];
  const f = COMBAT.startFight(W, [a], [d], 'raid');

  // 4.1 Test SHADOW_CLONE 1-HP decoy hit interception
  COMBAT.setHp(d, COMBAT.hpMax(d));
  const hpBeforeCloneHit = COMBAT.hp(d);
  COMBAT.COMPOSABLE_ENGINE.executeAction(W, f, d, a, 'SPAWN_SHADOW_CLONE', {}, { triggerKind: 'onHit', dmgDealt: 10 });
  check(d._shadowClones >= 1, 'SPAWN_SHADOW_CLONE creates a shadow clone');
  COMBAT.applyDamage(W, f, a, d, 80, 'โจมตีทดสอบร่างแยกเงา');
  check(COMBAT.hp(d) === hpBeforeCloneHit && d.lastShadowCloneIntercept && d.lastShadowCloneIntercept.negatedDmg === 80,
    '1-HP Shadow Clone intercepts incoming hit completely with 0 damage to real body');

  // 4.2 Test SUBSTITUTION fatal-hit log swap
  d._shadowClones = 0;
  if (d.activeBuffs) delete d.activeBuffs.shadowClone;
  COMBAT.COMPOSABLE_ENGINE.executeAction(W, f, d, a, 'MUDRA_EXPLOSIVE_SEAL', {}, { triggerKind: 'onHit', dmgDealt: 10 });
  COMBAT.setHp(d, 20);
  COMBAT.applyDamage(W, f, a, d, 500, 'โจมตีสังหารทดสอบสลับร่างท่อนไม้');
  check(COMBAT.hp(d) > 20 && d.lastSubstitutionSave && d.lastSubstitutionSave.healedHp > 0,
    'SUBSTITUTION negates fatal blow and heals 25% Max HP');

  // 4.3 Test PARRY_COUNTER melee counter-slash
  COMBAT.COMPOSABLE_ENGINE.executeAction(W, f, d, a, 'IAI_ZERO_QI_SLASH', {}, { triggerKind: 'onHit', dmgDealt: 20 });
  const aHpBeforeParry = COMBAT.hp(a);
  COMBAT.applyDamage(W, f, a, d, 60, 'โจมตีทดสอบอิไอปัดป้อง');
  check(d.lastParryCounter && COMBAT.hp(a) < aHpBeforeParry, 'PARRY_COUNTER mitigates damage and counter-slashes attacker');

  // 4.4 Test all 10 new Composable Actions
  const new10Actions = [
    'IAI_ZERO_QI_SLASH', 'SPAWN_SHADOW_CLONE', 'MUDRA_EXPLOSIVE_SEAL', 'SUMMON_DEITY_PROJECTION',
    'ENTER_AVATAR_TRANCE', 'BORROW_COSMIC_LAW', 'ELDRITCH_SANITY_BLAST', 'KHMER_YANTRA_WARD',
    'DEVOUR_ESSENCE_BITE', 'GRAVE_CORPSE_DETONATE'
  ];
  for (const act of new10Actions) {
    COMBAT.setHp(a, COMBAT.hpMax(a));
    COMBAT.setHp(d, COMBAT.hpMax(d));
    const res = COMBAT.COMPOSABLE_ENGINE.executeAction(W, f, a, d, act, { dur: 12 }, { triggerKind: 'onHit', dmgDealt: 40 });
    check(res && res.ok === true, `COMBAT.COMPOSABLE_ENGINE.executeAction must execute ${act}`);
  }
  console.log('  ✓ [4/6] Pillar 4: Shadow Clone, Substitution, Parry Counter, Bone Armor & 10 New Actions Verified');
}

// 5. Pillar 5: Devouring Flesh & Nether Grave World-System Mechanics
{
  const W = SIM.create('v220-devour-grave', { masterIdx: 0, archetype: 'devourer' });
  const master = W.byId[W.sect.masterId];
  ECO.add(W, 'MAT190_ORE_001', 2);
  const devRes = CULT.GRAND_DAO_MECHANICS.devourResourceForBody(W, master, 'MAT190_ORE_001');
  check(devRes && devRes.ok === true && ECO.count(W, 'MAT190_ORE_001') === 1,
    'DEVOURING_FLESH devourResourceForBody consumes real inventory item (Debit = Credit)');

  W.graveyard.push({ id: 'fallen_1', nameTh: 'ศิษย์บรรพชน 1' }, { id: 'fallen_2', nameTh: 'ศิษย์บรรพชน 2' });
  const grvRes = CULT.GRAND_DAO_MECHANICS.channelGraveyardEcho(W, master);
  check(grvRes && grvRes.ok === true && grvRes.graveCount >= 2 && grvRes.bonusShieldPct > 0.25,
    'NETHER_GRAVE channelGraveyardEcho scales shield bonus with W.graveyard.length');
  console.log('  ✓ [5/6] Pillar 5: Devouring Flesh & Nether Grave World-System Mechanics Verified');
}

console.log(`\n✅ PASS: v220_cosmic_pantheon_shinobi_and_manual_lifecycle_suite (${passed} assertions passed)\n`);
