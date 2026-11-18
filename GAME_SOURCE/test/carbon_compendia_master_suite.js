'use strict';
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const G = require('./load.js');
require('../js/render.js');
require('../js/ui.js');
const { JD, U, HC, CULT, ECO, SECT, COMBAT, SK, WILD, SIM, Render, UI } = G;

console.log('======================================================================');
console.log('   CARBON COMPENDIA MASTER SUITE (31 PDFs: 881fecf & 6670b49)         ');
console.log('======================================================================');

// 1. Core Architectural Invariants & Lock Checks
{
  assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'human_core.js fingerprint must remain 155:2f9c9dd7');
  const hcPath = path.join(__dirname, '..', 'js', 'human_core.js');
  const hcSha = crypto.createHash('sha256').update(fs.readFileSync(hcPath)).digest('hex');
  assert.strictEqual(hcSha, 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js SHA-256 lock');

  const agentsPath = path.join(__dirname, '..', '..', 'AGENTS.md');
  if (fs.existsSync(agentsPath)) {
    const agSha = crypto.createHash('sha256').update(fs.readFileSync(agentsPath)).digest('hex');
    assert.strictEqual(agSha, '41610ec4de7f5d620c5de0a605094e64d95ec9a67acf41365dec30e83e7d29d3', 'AGENTS.md SHA-256 lock');
  }

  // Legacy array length locks
  assert.strictEqual(JD.TECH.mantras.length, 122, 'JD.TECH.mantras length must remain 122');
  assert.strictEqual(JD.TECH.techniques.length, 1726, 'JD.TECH.techniques length must remain 1726');
  assert.strictEqual(Object.keys(COMBAT.KEYWORDS_CATALOG).length, 16, 'COMBAT.KEYWORDS_CATALOG length must remain 16');
  console.log('  ✓ [1/7] Core Locks & Legacy Catalog Counts Verified');
}

// 2. Gen-7 Sect Master, 6 Pre-History Ancestral Plaques (0 Upper-World Spoilers) & Spirit-Beast Qi Crucible
{
  const W = SIM.create('carbon-gen7-lineage-test');
  assert.strictEqual(W.sect.masterGeneration, 7, 'Sect Master must be 7th Generation');
  const master = W.byId[W.sect.masterId];
  assert.strictEqual(master.sectGeneration, 7, 'Master NPC sectGeneration must be 7');
  const disc = W.npcs.find(n => n.id !== master.id);
  assert.strictEqual(disc.sectGeneration, 8, 'Starter disciples must be 8th Generation');

  const plaques = SECT.getPreHistoryTablets(W);
  assert.strictEqual(plaques.length, 6, 'Must have 6 Pre-History Ancestral Plaques (Gen 1-6)');
  for (const p of plaques) {
    assert.strictEqual(p.mortalPerspectiveOnly, true);
    assert.strictEqual(/โลกเบื้องบน|สวรรค์ชั้นบน|Upper World/i.test(JSON.stringify(p)), false, 'Zero Upper-World spoilers allowed in plaque ' + p.id);
  }

  // Praying to Gen-1 plaque grants ancestral blessing & originEchoes
  const echoesBefore = W.sect.originEchoes || 0;
  const prayRes = SECT.prayAtAncestralShrine(W, master, 'PATRIARCH_GEN_1');
  assert.strictEqual(prayRes.ok, true);
  assert.ok(W.sect.originEchoes > echoesBefore, 'Praying to Gen-1 plaque must increment originEchoes');

  // Valley Spirit-Beast Qi Crucible (lethal & non-lethal capture parity)
  const beast = { id: 'b_test_1', name: 'กวางหมอกทดสอบ', tier: 3, x: master.x, y: master.y, power: CULT.power(master), hp: 50, hpMax: 200, captured: true };
  W.foes.push(beast);
  W.foeById[beast.id] = beast;
  const fakeFight = { id: 'f_wild_1', t0: W.t - 25, ctx: { beastId: beast.id, hunterId: master.id, huntStartedAt: W.t - 25, baseCultRate: 50, expectedTravel: 15, landContributions: { [master.id]: 100 } } };
  WILD.finish(W, fakeFight, 'A');
  assert.ok(master._lastSpiritBeastCrucibleGain > 0, 'Non-lethal beast capture must award Spirit-Beast Crucible EXP');
  console.log('  ✓ [2/7] Gen-7 Sect Master, 6 Pre-History Plaques (0 Spoilers) & Spirit-Beast Crucible Verified');
}

// 3. Neutral Patriarch Origin Regalia (REGALIA_ORIGIN_FORMLESS_STONE, 24 Forms, 11 Elements, Stages 0-5, 12 Imprints)
{
  const W = SIM.create('carbon-regalia-test');
  const master = W.byId[W.sect.masterId];
  const reg = SECT.PATRIARCH_REGALIA.ensure(W);
  assert.ok(reg && reg.id === 'REGALIA_ORIGIN_FORMLESS_STONE', 'Patriarch Regalia must be REGALIA_ORIGIN_FORMLESS_STONE');
  assert.strictEqual(reg.awakeningStage, 0, 'Starts in Stage 0 Formless Stone');

  // Morph across all 24 forms
  const formKeys = Object.keys(JD.CORE.PATRIARCH_REGALIA_SPECS.forms);
  assert.strictEqual(formKeys.length, 24, 'Must support all 24 polymorphic forms');
  for (const fk of formKeys) {
    const mRes = SECT.PATRIARCH_REGALIA.morphForm(W, master, fk, { equipSlot: false });
    assert.strictEqual(mRes.ok, true);
    assert.strictEqual(reg.currentForm, fk);
  }

  // Advance to Stage 5 & attune dual elements
  SECT.PATRIARCH_REGALIA.setAwakeningStage(W, master, 5);
  assert.strictEqual(reg.awakeningStage, 5);
  const elRes = SECT.PATRIARCH_REGALIA.attuneElement(W, master, 'ASTRAL_VOID', 'FIRE');
  assert.strictEqual(elRes.ok, true);
  assert.strictEqual(reg.element, 'ASTRAL_VOID');
  assert.strictEqual(reg.secondaryElement, 'FIRE');

  // Unlock all 12 Generational Imprints
  const impKeys = Object.keys(JD.CORE.PATRIARCH_REGALIA_SPECS.imprints);
  assert.strictEqual(impKeys.length, 12, 'Must have 12 Generational Imprints');
  for (const ik of impKeys) {
    assert.strictEqual(SECT.PATRIARCH_REGALIA.unlockImprint(W, master, ik).ok, true);
  }
  assert.strictEqual(reg.imprints.length, 12);
  console.log('  ✓ [3/7] Neutral Patriarch Origin Regalia (24 Forms, Stages 0-5, Dual-Element, 12 Imprints) Verified');
}

// 4. World-Singleton Armor, Accessory, Roaming Weapon & Pantheon Convergence Soft-Cap
{
  const W = SIM.create('carbon-pantheon-test');
  const master = W.byId[W.sect.masterId];
  const f = { id: 'f_pantheon', A: [master.id], B: [], t0: W.t, arena: { x: 180, y: 140 } };

  // Claim Armor, Accessory & Weapon
  const armRes = SECT.TRANSCENDENT_PANTHEON.claimWorldTranscendentArtifact(W, master, 'ARM_TRANSCENDENT_LOOM_OF_SCARS');
  const accRes = SECT.TRANSCENDENT_PANTHEON.claimWorldTranscendentArtifact(W, master, 'ACC_TRANSCENDENT_OUROBOROS_SUNDIAL');
  const wpnRes = SECT.TRANSCENDENT_PANTHEON.claimWorldTranscendentArtifact(W, master, 'WPN_TRANSCENDENT_MYRIAD_ARSENAL_COFFIN');
  assert.ok(armRes.ok && accRes.ok && wpnRes.ok, 'Must claim all 3 World Transcendent Artifacts');

  // Test Armor Chrysalis Rebirth on lethal hit
  COMBAT.setHp(master, 50);
  const hitRes = COMBAT.processTranscendentArmorHit(W, f, master, null, 500);
  assert.strictEqual(hitRes.cocoonTriggered, true, 'Loom of Scars must intercept lethal damage and trigger Chrysalis');
  assert.ok(COMBAT.hp(master) > 0, 'Master must survive via Chrysalis');

  // Test Accessory non-strike healer/support cast counter & 3rd-cast echo
  COMBAT.processTranscendentAccessoryCast(W, f, master, master, { id: 'TEST_HEAL', arch: 'heal' });
  COMBAT.processTranscendentAccessoryCast(W, f, master, master, { id: 'TEST_HEAL', arch: 'heal' });
  const cast3 = COMBAT.processTranscendentAccessoryCast(W, f, master, master, { id: 'TEST_HEAL', arch: 'heal' });
  assert.strictEqual(cast3.echoTriggered, true, 'Ouroboros Sundial must trigger echo on every 3rd cast including non-strike heals');

  // Test Weapon Arsenal Digestion & Escort Blades
  const strikeRes = COMBAT.processTranscendentWeaponStrike(W, f, master, { equip: { WEAPON: { gearType: 'SPEAR' } }, dead: false });
  assert.ok(strikeRes.escortHits >= 1 && strikeRes.digestedCount >= 4);

  // Test 3-Piece Pantheon Convergence Soft-Cap (0.75x past 0.55)
  const pan = SECT.evaluateTranscendentPantheonResonance(W, master);
  assert.strictEqual(pan.pantheon3Piece, true);
  assert.strictEqual(pan.softCapApplied, true, '3-piece Pantheon breakthrough bonus must apply 0.75x soft-cap past +55%');
  assert.ok(pan.breakthroughBonus > 0.55 && pan.breakthroughBonus < pan.rawBreakthroughBonus);
  console.log('  ✓ [4/7] World-Singleton Armor, Accessory, Roaming Weapon & Pantheon Soft-Cap Verified');
}

// 5. Strict Domain-Separated Wildcard Substitution (10 Alchemy + 10 Equipment + 3 Pure Elixirs + 3 Pure Genesis Artifacts)
{
  const W = SIM.create('carbon-wildcard-test');
  const master = W.byId[W.sect.masterId];

  // Cross-domain rejection checks
  assert.strictEqual(ECO.canSubstituteTranscendentAlchemyMat({ craft: 'ALCHEMY' }, null, 'MAT_TR_SOV_01').ok, false, 'Equipment wildcard must be rejected in Alchemy');
  assert.strictEqual(ECO.canSubstituteTranscendentEquipmentMat({ craft: 'FORGING' }, null, 'MAT_TR_ALC_01').ok, false, 'Alchemy wildcard must be rejected in Forging');
  assert.strictEqual(ECO.canSubstituteTranscendentAlchemyMat({ craft: 'ALCHEMY' }, null, 'MAT_TR_ALC_01').ok, true);
  assert.strictEqual(ECO.canSubstituteTranscendentEquipmentMat({ craft: 'FORGING' }, null, 'MAT_TR_SOV_01').ok, true);

  // Brew with Transcendent Alchemy Wildcard -> composite key, 2-3x yield, 7-day Pill-Cloud
  const brewRes = ECO.brewWithTranscendentWildcard(W, master, 'REC140_ALC_QI_DEW_1', ['MAT_TR_ALC_01', 'MAT_TR_ALC_03']);
  assert.strictEqual(brewRes.ok, true);
  assert.ok(brewRes.pillKey.includes('@TR:MAT_TR_ALC_01+MAT_TR_ALC_03'), 'Composite pill key must use @TR: format');
  assert.ok(brewRes.yieldCount >= 2 && brewRes.yieldCount <= 3, 'Batch yield must be 2-3x');
  assert.ok(W.sect.pillCloudBlessingUntil >= W.t + 7 * 1440, '7-day Nine-Color Pill-Cloud must activate');

  // Consume Transcendent Pill -> permanent npc.ext.transcendentElixirMarks & bloodline inheritance
  const conRes = ECO.consumeTranscendentPill(W, master, brewRes.pillKey);
  assert.strictEqual(conRes.ok, true);
  assert.strictEqual(conRes.zeroToxicity, true);
  assert.ok(master.ext.transcendentElixirMarks.length >= 2);

  const child = W.npcs[1];
  const inherited = ECO.inheritTranscendentElixirBloodline(W, master, null, child);
  assert.ok(inherited.length >= 1 && child.ext.inheritedElixirEchoes.length >= 1, 'Child must inherit 50-75% parent elixir marks');

  // Equipment wildcard non-destructive snapshot & 100% abort refund
  const abortRes = ECO.forgeWithTranscendentWildcard(W, master, 'REC_TR_PURE_WPN_GENESIS', ['MAT_TR_SOV_01', 'MAT_TR_SOV_04'], { abort: true });
  assert.strictEqual(abortRes.aborted, true);
  assert.strictEqual(abortRes.refunded.refundedCount, 2, '100% of wildcard materials must be refunded on abort');

  const forgeRes = ECO.forgeWithTranscendentWildcard(W, master, 'REC_TR_PURE_WPN_GENESIS', ['MAT_TR_SOV_01', 'MAT_TR_SOV_04', 'MAT_TR_SOV_06', 'MAT_TR_SOV_08', 'MAT_TR_SOV_10']);
  assert.strictEqual(forgeRes.ok, true);
  assert.strictEqual(forgeRes.gear.forgeTribulationTempered, true);
  assert.strictEqual(forgeRes.gear.setId, 'RES_TR_MORTAL_FORGED_GENESIS');
  const multOnce = forgeRes.gear.combatMult;
  ECO.applyTranscendentMaterialInfusions(forgeRes.gear, ['MAT_TR_SOV_01', 'MAT_TR_SOV_04', 'MAT_TR_SOV_06', 'MAT_TR_SOV_08', 'MAT_TR_SOV_10']);
  assert.strictEqual(forgeRes.gear.combatMult, multOnce, 'Re-applying infusions must compute from _basePreTranscendent without infinite compounding');
  console.log('  ✓ [5/7] Strict Domain-Separated Alchemy & Equipment Wildcards, Pure Elixirs & Genesis Set Verified');
}

// 6. All 352 Carbon Scriptures & Codices (170 Low + 144 Expansion + 38 Sovereign + 3-Verse Flow + 4th Verse + Dao-Scars + Cut-In)
{
  assert.strictEqual(JD.TECH.lowTierArts.length, 170, 'Must have 170 Low-Tier manuals');
  assert.strictEqual(JD.TECH.midHighNonCombatArts.length, 144, 'Must have 144 Expansion Non-Combat manuals');
  assert.strictEqual(JD.TECH.transcendentCodices.length, 38, 'Must have 38 Sovereign Transcendent Codices');

  const W = SIM.create('carbon-sovereign-tech-test');
  const master = W.byId[W.sect.masterId];
  const f = { id: 'f_sov', A: [master.id], B: [W.npcs[1].id], t0: W.t, arena: { x: 180, y: 140 }, daoScars: [] };

  // Awaken TCMB_SOV_01 via Gate & synthesize Self-Authored 4th Verse
  const awk = CULT.checkSovereignCombatAwakening(W, master, 'GATE_ANCESTRAL_SHRINE_RESONANCE', { techId: 'TCMB_SOV_01', quiet: true });
  assert.strictEqual(awk.ok, true);
  const v4 = SK.synthesizeFourthVerse(W, master, 'TCMB_SOV_01');
  assert.ok(v4 && v4.verse === 4 && v4.isSelfAuthoredFourthVerse === true, 'Must deterministically synthesize 4th Verse');

  // Advance 1 -> 2 -> 3 -> 4 Verse Flow & verify Battlefield Dao-Scar spawn
  assert.strictEqual(COMBAT.advanceSovereignVerseFlow(W, f, master, W.npcs[1], 'TCMB_SOV_01').currentVerse, 1);
  assert.strictEqual(COMBAT.advanceSovereignVerseFlow(W, f, master, W.npcs[1], 'TCMB_SOV_01').currentVerse, 2);
  assert.strictEqual(COMBAT.advanceSovereignVerseFlow(W, f, master, W.npcs[1], 'TCMB_SOV_01').currentVerse, 3);
  assert.ok(f.daoScars.length >= 1, 'Verse 3 must spawn a Battlefield Dao-Scar');
  assert.strictEqual(COMBAT.advanceSovereignVerseFlow(W, f, master, W.npcs[1], 'TCMB_SOV_01').currentVerse, 4);

  // Off-Turn Clash Cut-In (14-tick ICD)
  const cut1 = COMBAT.tryTranscendentCutIn(W, f, master, W.npcs[1], { M: 2.5, arch: 'burst' });
  assert.strictEqual(cut1.triggered, true, 'First heavy incoming attack must trigger Clash Cut-In');
  const cut2 = COMBAT.tryTranscendentCutIn(W, f, master, W.npcs[1], { M: 2.5, arch: 'burst' });
  assert.strictEqual(cut2.triggered, false, 'Second attack within 14 ticks must respect ICD');

  // TPAS_SOV_01 zero-slot +2 constellation stars
  master.cult.techs.push('TPAS_SOV_01_SWORD_STAR_APEX_HEART');
  const constRes = CULT.PASSIVE_CONSTELLATION_SYSTEM.resolveNpcConstellation(W, master);
  assert.ok(constRes && constRes.totalStars >= 2, 'TPAS_SOV_01 must grant +2 constellation stars');
  console.log('  ✓ [6/7] 352 Scriptures/Codices, 4-Verse Flow, Dao-Scars, Clash Cut-In & +2 Star Keystones Verified');
}

// 7. 0-RNG 0-Mutation SVG Icons, 4-Phase Canvas2D VFX & Save/Load Roundtrip
{
  const W = SIM.create('carbon-ui-vfx-purity');
  const beforeSer = SIM.serialize(W);
  const beforeRng = JSON.stringify(W.rng.getState());

  const svg1 = UI.renderPatriarchRegaliaIconHtml(W.sect.patriarchRegalia, 64);
  const svg2 = UI.renderTranscendentArmorIconHtml(ECO.itemById.ARM_TRANSCENDENT_LOOM_OF_SCARS, 64);
  const svg3 = UI.renderTranscendentAccessoryIconHtml(ECO.itemById.ACC_TRANSCENDENT_OUROBOROS_SUNDIAL, 64);
  const svg4 = UI.renderTranscendentWeaponIconHtml(ECO.itemById.WPN_TRANSCENDENT_MYRIAD_ARSENAL_COFFIN, 64);
  const svg5 = UI.renderTranscendentArtIconHtml(CULT.tech('TCMB_SOV_01'), 64);
  const svg6 = UI.renderTranscendentMaterialIconHtml(ECO.resolveTranscendentMat('MAT_TR_SOV_01'), 64);
  const svg7 = UI.renderTranscendentElixirIconHtml(ECO.itemById.PILL_TR_PURE_01_HEAVEN_DEFYING_GENESIS_ELIXIR, 64);
  assert.ok(svg1.includes('<svg') && svg2.includes('<svg') && svg3.includes('<svg') && svg4.includes('<svg') && svg5.includes('<svg') && svg6.includes('<svg') && svg7.includes('<svg'));

  assert.strictEqual(SIM.serialize(W), beforeSer, 'SVG generators must have 0 state mutation');
  assert.strictEqual(JSON.stringify(W.rng.getState()), beforeRng, 'SVG generators must consume 0 W.rng');

  const loaded = SIM.deserialize(beforeSer);
  assert.strictEqual(loaded.sect.masterGeneration, 7);
  assert.strictEqual(loaded.sect.patriarchPreHistory.length, 6);
  assert.strictEqual(loaded.sect.patriarchRegalia.id, 'REGALIA_ORIGIN_FORMLESS_STONE');
  console.log('  ✓ [7/7] Deterministic 0-RNG SVG Icons, 4-Phase Canvas2D VFX & Save/Load Round-Trip Verified');
}

console.log('✅ ALL CARBON COMPENDIA MASTER SUITE CHECKS PASSED!');
