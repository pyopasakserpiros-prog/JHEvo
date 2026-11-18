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

  const brewRecipe = ECO.recipeById.REC140_ALC_QI_DEW_1;
  assert.strictEqual(ECO.brewWithTranscendentWildcard(W, master, brewRecipe, ['MAT_TR_ALC_01']).ok, false);
  for (const input of brewRecipe.inputs) ECO.add(W, input.matId, input.count);
  for (const id of ['MAT_TR_ALC_01', 'MAT_TR_ALC_03']) ECO.add(W, ECO.resolveTranscendentMat(id).id, 1);

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
  assert.strictEqual(ECO.count(W, ECO.resolveTranscendentMat('MAT_TR_SOV_01').id), 0, 'Aborting without a reservation must not mint inputs');
  const forgeRecipe = ECO.recipeById.REC_TR_PURE_WPN_GENESIS;
  for (const input of forgeRecipe.inputs) ECO.add(W, input.matId, input.count);

  const forgeRes = ECO.forgeWithTranscendentWildcard(W, master, 'REC_TR_PURE_WPN_GENESIS', ['MAT_TR_SOV_01', 'MAT_TR_SOV_04', 'MAT_TR_SOV_06', 'MAT_TR_SOV_08', 'MAT_TR_SOV_10']);
  assert.strictEqual(forgeRes.ok, true);
  assert.strictEqual(forgeRes.gear.forgeTribulationTempered, true);
  assert.strictEqual(forgeRes.gear.setId, 'RES_TR_MORTAL_FORGED_GENESIS');
  const multOnce = forgeRes.gear.combatMult;
  ECO.applyTranscendentMaterialInfusions(forgeRes.gear, ['MAT_TR_SOV_01', 'MAT_TR_SOV_04', 'MAT_TR_SOV_06', 'MAT_TR_SOV_08', 'MAT_TR_SOV_10']);
  assert.strictEqual(forgeRes.gear.combatMult, multOnce, 'Re-applying infusions must compute from _basePreTranscendent without infinite compounding');
  console.log('  ✓ [5/7] Strict Domain-Separated Alchemy & Equipment Wildcards, Pure Elixirs & Genesis Set Verified');
}

// 6. All 360 Carbon Scriptures & Codices (170 Low + 144 Expansion + 46 Sovereign + 3-Verse Flow + 4th Verse + Dao-Scars + Cut-In)
{
  assert.strictEqual(JD.TECH.lowTierArts.length, 170, 'Must have 170 Low-Tier manuals');
  assert.strictEqual(JD.TECH.midHighNonCombatArts.length, 144, 'Must have 144 Expansion Non-Combat manuals');
  assert.strictEqual(JD.TECH.transcendentCodices.length, 46, 'Must have 46 Sovereign Transcendent Codices');

  const W = SIM.create('carbon-sovereign-tech-test');
  const master = W.byId[W.sect.masterId];
  const f = { id: 'f_sov', A: [master.id], B: [W.npcs[1].id], t0: W.t, arena: { x: 180, y: 140 }, daoScars: [] };

  master.cult.stage = 7;
  assert.strictEqual(CULT.checkSovereignCombatAwakening(W, master, 'GATE_APEX_NEMESIS_DUEL', { techId:'TCMB_SOV_01' }).ok, false);
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
  console.log('  ✓ [6/7] 360 Scriptures/Codices, 4-Verse Flow, Dao-Scars, Clash Cut-In & +2 Star Keystones Verified');
}

// 7. Live Transcendent visual routing, SVG art and save/load roundtrip
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

  const catalog = JD.TECH.transcendentCodices;
  assert.strictEqual(catalog.length, 46);
  for (const t of catalog) {
    assert.ok(Render.transcendentCastSpec(t, t.id).path);
    assert.ok(UI.renderAtlasIconHtml({ id: 'T:' + t.id, kind: 'TECH_MANUAL' }, 40).includes('data-art-grade="Transcendent"'));
  }
  const forms = Object.keys(JD.CORE.PATRIARCH_REGALIA_SPECS.forms);
  const silhouettes = new Set(forms.map(currentForm => Render.transcendentArt({ ...W.sect.patriarchRegalia, currentForm }).path));
  assert.strictEqual(silhouettes.size, 24);
  assert.ok(UI.renderAtlasIconHtml({ id: 'P:TEST@TR:MAT_TR_ALC_01' }).includes('data-art-form="vial"'));

  assert.strictEqual(SIM.serialize(W), beforeSer, 'SVG generators must have 0 state mutation');
  assert.strictEqual(JSON.stringify(W.rng.getState()), beforeRng, 'SVG generators must consume 0 W.rng');

  const loaded = SIM.deserialize(beforeSer);
  assert.strictEqual(loaded.sect.masterGeneration, 7);
  assert.strictEqual(loaded.sect.patriarchPreHistory.length, 6);
  assert.strictEqual(loaded.sect.patriarchRegalia.id, 'REGALIA_ORIGIN_FORMLESS_STONE');
  const a = W.byId[W.sect.masterId], target = W.npcs.find(n => n.id !== a.id);
  const tech = JD.TECH.sovereignCombatArts[0];
  const fight = { A:[a.id], B:[target.id], serious:false, state:'fight' };
  a.equip.WEAPON = { ...ECO.itemById.WPN_TRANSCENDENT_MYRIAD_ARSENAL_COFFIN };
  COMBAT.useSkill(W, fight, a, target, { ...tech.moveDefs[0], tech:tech.id, icon:'✦', wind:5, tier:8 }, {});
  assert.strictEqual(a.castFx.techId, tech.id);
  assert.strictEqual(a.castFx.sovereignVerse, 1);
  const renderer = Object.assign({
    W, cam:{ x:a.x * Render.TILE_SIZE, y:a.y * Render.TILE_SIZE, z:1 },
    vw:412, vh:860, alpha:1, castActive:new Map(), castSeen:new Map(), castClock:0, castLastTime:null
  }, Render.methods);
  renderer.updateCastEffects(100);
  const active = [...renderer.castActive.values()];
  assert.ok(active.some(fx => fx.transcendent && fx.transcendent.name === tech.nameTh && fx.verse === 1));
  assert.ok(active.some(fx => fx.transcendentKind === 'arsenal'));
  assert.ok(COMBAT.transcendentVisualProcs(a).has('arsenal'));
  assert.equal(COMBAT.transcendentVisualProcs(SIM.deserialize(SIM.serialize(W)).byId[a.id]), undefined);
  console.log('  ✓ [7/7] Live cast and artifact routing, 46 Codex icons, 24 Regalia forms, purity & save/load verified');
}

// Award through the same resolveSanctum -> handover route used by autonomous expeditions.
{
  const { EXPLORE: EX, AI, MARTIAL, STATS } = G;
  const W = SIM.create('sovereign-archive-integration');
  const leader = W.byId[W.sect.masterId], foe = W.npcs.find(n => n !== leader);
  leader.cult.stage = 8;
  leader.cult.path = 'XIAN';
  W.day = 435;
  W.t = W.day * 1440;
  const realm = EX.SANCTUMS.SANCTUM_ASTRAL_DIVINE;
  const fan = 'WPN_TRANSCENDENT_MOURNING_WEATHER_FAN';
  const mantra = 'TMNT_SOV_06_LANTERN_BREATH';
  const nativeWeighted = W.rng.weighted.bind(W.rng), nativePick = W.rng.pick.bind(W.rng), nativeChance = W.rng.chance.bind(W.rng);
  let wantKind = 'gear', wantId = fan;
  W.rng.chance = chance => chance === .30 || nativeChance(chance);
  W.rng.weighted = (values, weigher) => values.find(x => x?.pool && x.kind === wantKind) || nativeWeighted(values, weigher);
  W.rng.pick = values => values.find(x => x?.id === wantId) ?? nativePick(values);
  const resolve = extra => EX.resolveSanctum(W,{ id:W.day, journal:[], sanctumId:realm.id, forceClear:true, ...extra },[leader]);
  assert.equal(resolve({ forceFailFloor:2 }).sovereignArchive, null, 'a retreat cannot open the archive');
  const found = resolve();
  assert.equal(found.sovereignArchive.id, fan);
  assert.equal(W.sect.gear.filter(x => x.id === fan).length, 1);
  const gear = W.sect.gear.find(x => x.id === fan);
  assert.equal(gear.transcendent, true);
  assert.equal(gear.gearType, 'FAN');
  assert.equal(SECT.TRANSCENDENT_PANTHEON.claimWorldTranscendentArtifact(W, null, fan).ok, false);
  assert.equal(resolve().sovereignArchive, null, 'same site cannot pay twice during cooldown');
  W.day += 8;
  wantKind = 'manual'; wantId = mantra;
  assert.equal(resolve().sovereignArchive.id, mantra);
  // An expedition NPC may keep a copy. The trade/donation AI transfers it to the library on return.
  assert.ok(W.sect.library.includes(mantra) || leader.inv.techs.includes(mantra));
  if (!W.sect.library.includes(mantra)) W.sect.library.push(mantra);
  assert.equal(AI.nextTechToStudy(W, leader)?.id, mantra);
  leader.cult.learning = { id:mantra, got:100, need:100 };
  AI.ACTS.study.tick(leader, W);
  assert.ok(leader.cult.unlockedMantras.includes(mantra));
  CULT.evaluateAutonomousPostures(W, leader);
  assert.equal(leader.cult.mantra, mantra);
  assert.equal(SK.list(leader).filter(x => x.tech === mantra).length, 1);
  SK.gainMastery(W, leader, mantra, 70);
  assert.equal(SK.list(leader).filter(x => x.tech === mantra).length, 2);

  const recipe = JD.CORE.pureTranscendentRecipes.find(r => EX.sovereignSanctumSource(r) === realm.id);
  W.day += 8; wantKind = 'recipe'; wantId = recipe.id;
  assert.equal(resolve().sovereignArchive.id, recipe.id);
  W.sect.recipeTier = 7;
  assert.ok(ECO.recipesFor(W, [recipe.craft]).includes(recipe));
  const material = JD.CORE.transcendentMaterials.find(m => EX.sovereignSanctumSource(m) === realm.id);
  W.day += 8; wantKind = 'material'; wantId = material.id;
  assert.equal(resolve().sovereignArchive.id, material.id);
  assert.equal(ECO.count(W, material.id), 1);

  leader.equip.WEAPON = gear;
  STATS.now = W.t;
  const fight = { id:'archive-combat', A:[leader.id], B:[foe.id], state:'fight' };
  foe.act = { id:'fight', ctx:{ channeling:{ ticksLeft:4, skillId:'test' } } };
  COMBAT.runPassiveProcs(W, fight, leader, foe, 'onHit', 5);
  assert.equal(foe.act.ctx.channeling, undefined);
  assert.ok(STATS.has(foe,'silence', W.t));
  foe.act.ctx.channeling = { ticksLeft:4, skillId:'test' };
  COMBAT.runPassiveProcs(W, fight, leader, foe, 'onHit', 5);
  assert.ok(foe.act.ctx.channeling, 'fan cooldown prevents repeated interrupts');

  const robe = ECO.itemById.ARM_TRANSCENDENT_PILGRIM_HORIZON_MAIL;
  leader.equip.ARMOR = ECO.mintGear(W, robe, 1.3);
  COMBAT.runPassiveProcs(W, fight, leader, foe, 'onDodge', 0);
  assert.ok(STATS.has(leader, 'shield', W.t));
  const loaded = SIM.deserialize(SIM.serialize(W));
  assert.equal(SECT.TRANSCENDENT_PANTHEON.isClaimed(loaded, fan), true);

  const newCodices = JD.TECH.transcendentCodices.filter(t => !!t.sanctum);
  assert.equal(newCodices.length, 8);
  assert.equal(new Set(newCodices.map(t => t.cat)).size, 8);
  for (const t of newCodices) {
    assert.ok(EX.SANCTUMS[t.sanctum]);
    if (t.cat === 'PASSIVE') {
      assert.equal(t.passiveForms.length, 2);
      leader.cult.techs.push(t.id);
      leader.passiveLoadout = [t.id];
      MARTIAL.invalidateMartialCaches(leader);
      assert.ok(MARTIAL.passiveStats(leader).procs.some(x => x.techId === t.id));
    } else {
      assert.equal(SK.allMoves(t).length, 2);
      assert.notEqual(SK.allMoves(t)[0].arch, SK.allMoves(t)[1].arch);
    }
  }
  console.log('PASS autonomous archive path, failed run, cooldown, stock and discovery, new gear procs, study and save replay');
}

// Every companion comes from its own actual archive, then uses daily nursery and pet state.
{
  const specs = JD.CORE.sovereignCompanions;
  assert.equal(specs.length, 4);
  assert.deepEqual(specs.filter(s => !s.eggDays).map(s => s.symbol), ['WHITE_TIGER']);
  for (const spec of specs) {
    const W = SIM.create('nursery-' + spec.id);
    const owner = W.byId[W.sect.masterId];
    owner.cult.stage = 8;
    W.day = 445; W.t = W.day * 1440;
    const original = W.rng.weighted.bind(W.rng), chance = W.rng.chance.bind(W.rng);
    W.rng.chance = n => n === .30 || chance(n);
    W.rng.weighted = (items, weight) => items.find(x => x?.kind === 'companion') || original(items, weight);
    const ex = { id:'nursery', journal:[], sanctumId:spec.sanctum, forceClear:true };
    const out = G.EXPLORE.resolveSanctum(W, ex, [owner]);
    assert.equal(out.sovereignArchive.id, spec.id);
    const record = W.sect.sovereignNursery[spec.id];
    assert.equal(record.status, spec.eggDays ? 'egg' : 'juvenile');
    assert.equal(CULT.recoverSovereignCompanion(W, spec, [owner]), false);
    assert.equal(CULT.bindPet(W, owner, spec.id, { force:true }).ok, false);
    assert.ok(!CULT.activePets(owner).some(p => p.speciesId === spec.id));
    const day = () => { W.day++; W.t += 1440; CULT.tickSovereignNursery(W); };
    if (spec.eggDays) {
      W.sect.stock.grain = 0;
      day();
      assert.equal(record.caredDays, 0, 'egg incubation pauses during food shortage');
      ECO.add(W, 'grain', spec.eggDays + 25);
      day();
      CULT.tickSovereignNursery(W);
      assert.equal(record.caredDays, 1, 'one increment at most per day');
      for (let i = 1; i < spec.eggDays; i++) day();
    } else day();
    assert.equal(record.status, 'bonded');
    const keeper = W.npcs.find(n => n.pets?.some(p => p.uid === record.uid));
    const pet = keeper.pets.find(p => p.uid === record.uid);
    assert.equal(pet.growthStage, 1);
    assert.equal(pet.fourSymbol, undefined, 'juveniles do not inherit final battle aura early');
    assert.equal(CULT.evolvePet(W, keeper, pet.uid, { free:true, awakenSovereign:true }).ok, false);
    keeper.cult.stage = 8;
    pet.bond = 92;
    pet.hunger = 40;
    day();
    assert.equal(pet.careDays, 0);
    pet.hunger = 100;
    for (const [end, stage] of [[20,2],[65,3],[140,4]]) {
      for (let steps = 0; steps < 145 && pet.careDays < end; steps++) day();
      assert.equal(pet.growthStage, stage);
    }
    assert.equal(pet.fourSymbol, spec.symbol);
    const loaded = SIM.deserialize(SIM.serialize(W));
    assert.equal(loaded.sect.sovereignNursery[spec.id].uid, pet.uid);
    assert.equal(loaded.byId[keeper.id].pets.find(p => p.uid === pet.uid).growthStage, 4);
    const variants = [1,2,3,4].map(stage => Render.sovereignCompanionSvg(spec.id, stage));
    assert.equal(new Set(variants).size, 4);
    assert.ok(variants.every(svg => svg.startsWith('<svg')));
  }
  console.log('PASS four rare companions, three eggs, one rescued cub, food and bonding gates, all growth stages and save replay');
}


// New lineages offer three earned grades with conditional support instead of globally stronger copies.
{
  const { EXPLORE:EX, STATS:ST } = G;
  const families = new Set(JD.CORE.lineageCompanions.map(sp => sp.familyId));
  assert.equal(families.size, 4);
  assert.equal(JD.CORE.lineageCompanions.length, 12);
  const castImages = new Set();
  for (const family of families) {
    const variants = JD.CORE.lineageCompanions.filter(spec => spec.familyId === family);
    assert.deepEqual(variants.map(v => v.gradeRank), [1,2,3]);
    const W = SIM.create('lineages-' + family);
    const a = W.byId[W.sect.masterId], [enemy, ally] = W.npcs.filter(n => n.id !== a.id);
    a.cult.stage = 8;
    W.day = 450;
    W.t = W.day * 1440;
    ST.now = W.t;
    const oldChance = W.rng.chance.bind(W.rng);
    W.rng.chance = chance => [.34,.17,.075].includes(chance) || (chance !== .30 && oldChance(chance));
    const sanctumId = variants[0].sanctum;
    const run = inputs => EX.resolveSanctum(W, { id:W.day, journal:[], sanctumId, forceClear:true, ...inputs }, [a]);
    const days = number => { for(let d=0; d<number; d++){ W.day++; W.t += 1440; CULT.tickSovereignNursery(W); } };
    assert.equal(run({ maxFloor:1 }).lineageEncounter, null, 'requires meaningful sanctum progress');

    for (const spec of variants) {
      const out = run(spec.gradeRank === 1 ? { maxFloor:2 } : {});
      assert.equal(out.lineageEncounter.id, spec.id);
      assert.equal(out.lineageEncounter.grade, spec.grade);
      assert.equal(CULT.recoverLineageCompanion(W, spec, [a]), false);
      assert.equal(run().lineageEncounter, null, 'discovery cannot repeat or bypass a pending nursery record');
      ECO.add(W,'grain',spec.eggDays + 30);
      days(Math.max(1,spec.eggDays));
      const animal = W.npcs.flatMap(n=>n.pets || []).find(p=>p.speciesId === spec.id);
      assert.ok(animal);
      assert.equal(animal.growthStage, 1);
      assert.equal(animal.grade, spec.grade);
      assert.equal(CULT.evolvePet(W, W.byId[animal.ownerId], animal.uid, { free:true }).ok, false);
      if (family === 'KUNPENG' || family === 'QILIN') {
        const keeper = W.byId[animal.ownerId];
        const active = keeper.pets.map(p => p.active);
        keeper.pets.forEach(p => { p.active = p === animal; });
        const trip = () => G.EXPED.createParty(W, [keeper], { useQinggong:false });
        assert.equal(trip().durationMultiplier, 1);
        Object.assign(animal, { growthStage:3, hunger:90, fatigue:0 });
        assert.equal(trip().durationMultiplier, family === 'KUNPENG' ? [.83,.75,.69][spec.gradeRank - 1] : 1);
        animal.growthStage = 1;
        keeper.pets.forEach((p, index) => { p.active = active[index]; });
      }
      castImages.add(Render.sovereignCompanionSvg(spec.id, 4));
      days(12);
    }

    const spec = variants[2];
    const pet = W.npcs.flatMap(n=>n.pets || []).find(p=>p.speciesId === spec.id);
    const owner = W.byId[pet.ownerId];
    assert.ok(owner && owner !== enemy && owner !== ally);
    owner.pets.forEach(p => { p.active = p === pet; });
    Object.assign(pet, { growthStage:4, level:9, tier:7, hunger:90, fatigue:0, bond:94 });
    owner.x=20; owner.y=20;
    ally.x=20; ally.y=21; enemy.x=21; enemy.y=20;
    ST.now = W.t;
    const fight = { id:family, state:'fight', A:[owner.id,ally.id], B:[enemy.id] };

    if (family === 'KUNPENG') {
      assert.equal(COMBAT.applyLineageCompanion(W, fight, owner, enemy, 'onHit'), null);
      enemy.x=24;
      assert.ok(COMBAT.applyLineageCompanion(W, fight, owner, enemy, 'onHit'));
      assert.ok(ST.has(enemy,'slow',W.t));
      assert.ok(COMBAT.lineageAssistPower(spec, 4, enemy, W.t) > COMBAT.lineageAssistPower(spec, 1, enemy, W.t));
    } else if (family === 'FOX') {
      enemy.sx=[];
      assert.equal(COMBAT.applyLineageCompanion(W, fight, owner, enemy, 'onHit'), null);
      ST.addStatus(enemy,'chill',10,null,W.t);
      assert.ok(COMBAT.applyLineageCompanion(W, fight, owner, enemy, 'onHit'));
      assert.ok(ST.has(enemy,'blind',W.t) && ST.has(enemy,'weaken',W.t));
    } else if (family === 'QILIN') {
      COMBAT.setHp(owner,COMBAT.hpMax(owner));
      COMBAT.setHp(ally, Math.round(COMBAT.hpMax(ally) * .40));
      const result=COMBAT.applyLineageCompanion(W, fight, owner, enemy, 'onStruck');
      assert.equal(result?.recipientId, ally.id);
      assert.ok(ST.has(ally,'shield',W.t));
    } else {
      ST.addStatus(ally,'blind',12,null,W.t);
      ST.addStatus(ally,'slow',12,null,W.t);
      assert.equal(COMBAT.applyLineageCompanion(W, fight, owner, enemy, 'onStruck')?.recipientId, ally.id);
      assert.ok(!ST.has(ally,'blind',W.t) && !ST.has(ally,'slow',W.t));
    }
    assert.equal(pet.fatigue,spec.fatigue);
    assert.equal(COMBAT.applyLineageCompanion(W, fight, owner, enemy, ['KUNPENG','FOX'].includes(family)?'onHit':'onStruck'), null);
    const proc = COMBAT.transcendentVisualProcs(owner).get('lineage_' + family);
    assert.equal(Render.transcendentProcSpec(proc).presentationRank,3);
    assert.ok(variants[0].fatigue < spec.fatigue && variants[0].cooldown < spec.cooldown);
    const loaded = SIM.deserialize(SIM.serialize(W));
    assert.equal(loaded.sect.sovereignNursery[spec.id].uid,pet.uid);
    assert.equal(loaded.byId[owner.id].pets.find(p=>p.uid===pet.uid).growthStage,4);
  }
  assert.equal(castImages.size,12);
  console.log('PASS four companion lineages, three earned grades, all four specialties, cooldowns, art and save replay');
}

console.log('✅ ALL CARBON COMPENDIA MASTER SUITE CHECKS PASSED!');
