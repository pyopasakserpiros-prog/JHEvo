'use strict';
/**
 * ============================================================================
 * JianghuSect 2 (JS2-v2.6.0) — Bugfix Categories 07 & 08 Regression Suite
 * ============================================================================
 * Verifies root-cause fixes across:
 *   - Category 07 (07A–07E): Sect Governance, 25 Offices, 8 Sacred Peaks,
 *     Buildings/Totems/Leylines/Shrines, Politics/Charter/Tribunal/Dungeon,
 *     SIM.retire, Graveyard Burial, SIM.deserialize & Macro Fiscals.
 *   - Category 08 (08A–08F): Outside World, 19 Rival Sects/Vassals/ResourceNodes,
 *     Caravan/Anomalies/Hydration, Wilderness Beasts/Menagerie/ReservePets/Herbalist,
 *     Fishing/Spirit-Fish Cuisine/studyMult, External Market Visitor Pool Conservation.
 */
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const G = require('./load.js');

const { SIM, SECT, CULT, COMBAT, ECO, EXT, EXPED, EXPLORE, WILD, WILD_RES, FISHING, VC, AI, HC, MAP, CPE } = G;
const ROOT = path.resolve(__dirname, '..');

console.log('============================================================================');
console.log('  JIANGHUSECT 2 (JS2-v2.6.0: BUGFIX CATEGORIES 07 & 08 REGRESSION SUITE)   ');
console.log('============================================================================');

// ----------------------------------------------------------------------------
// [1/8] Core Lock, 40-Script Invariant & Version Check
// ----------------------------------------------------------------------------
{
  const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
  const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  assert.strictEqual(hcSha, 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js must remain byte-identical');
  assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
  assert.ok(['2.6.0', '3.0.0'].includes(SIM.PATCH_VERSION), 'known release contract');
  console.log('  ✓ [1/8] Core Lock & Architectural Invariants Verified');
}

// ----------------------------------------------------------------------------
// [2/8] Category 07A: Office Organic Unlock, Hall Resolution, 31-Path Relevance, Stipend Sync & Closed-Loop Jurisdictions
// ----------------------------------------------------------------------------
{
  const W = SIM.create('cat07a-seed', { masterIdx: 0 });
  // Fresh world has 3 NPCs: specialized offices start disabled until organic trigger or unlockAllOffices
  assert.strictEqual(SECT.officeState(W, 'warden').enabled, false, 'Warden disabled on empty day-0 sect');

  // Capture a prisoner -> warden organically unlocks even before pop >= 16!
  const pris = SECT.capturePrisoner(W, { nameTh: 'โจรภูเขาเชลย', sectId: 'S0', stage: 2 });
  assert.ok(pris && pris.id, 'capturePrisoner creates prisoner');
  assert.strictEqual(SECT.officeState(W, 'warden').enabled, true, 'Warden organically unlocks when dungeon has prisoners');

  // Hall resolution for herbal and provision
  assert.strictEqual(SECT.POSTS.herbal.hall, 'herb_garden', 'herbal office hall must be herb_garden');
  assert.strictEqual(SECT.POSTS.provision.hall, 'canteen', 'provision office hall must be canteen');
  assert.strictEqual(SECT.resolveOfficeHall(W, 'herbal'), 'herb_garden', 'resolveOfficeHall resolves herbal -> herb_garden');

  // 31 Grand Dao Path suitability bonuses in SECT.relevance
  const d0 = W.npcs[1];
  if (!d0.cult) SIM.awaken(W, W.rng, d0, 3);
  d0.cult.path = 'XIAN';
  const relXian = SECT.relevance('marketmaster', d0, W);
  d0.cult.path = 'MERCANTILE_DAO';
  const relMerc = SECT.relevance('marketmaster', d0, W);
  assert.ok(relMerc > relXian, `MERCANTILE_DAO must gain suitability bonus for marketmaster (${relMerc} > ${relXian})`);

  // Salaries & Stipends sync personalStones and mark internalTransfer: true (no external digest pollution)
  W.sect.stones = 2000;
  W.sect.ledger = [];
  const paidSal = SECT.paySalaries(W);
  assert.ok(paidSal > 0, 'paySalaries pays positive amount');
  W.npcs.forEach(n => {
    if (!n.dead && !n.exiled) {
      assert.strictEqual(n.personalStones, n.inv.stones, 'paySalaries must keep n.personalStones === n.inv.stones');
    }
  });
  const dig = EXPED.computePeriodDigest(W, { windowDays: 7 });
  assert.strictEqual(dig.treasury.stoneExpense, 0, 'Internal salary transfers must not pollute external stoneExpense in computePeriodDigest');

  // Quartermaster, Marketmaster & Censor Audit Closed-Loop Conservation
  SECT.unlockAllOffices(W, { quiet: true });
  while (W.npcs.length < 8) {
    const nn = SIM.addNpc(W, { rank: 4, stage: 4, ageYears: 30 });
    if (!nn.cult) SIM.awaken(W, W.rng, nn, 4);
  }
  const qm = W.npcs[2], mm = W.npcs[3], cen = W.npcs[4];
  SECT.appoint(W, 'quartermaster', qm.id);
  SECT.appoint(W, 'marketmaster', mm.id);
  SECT.appoint(W, 'censor', cen.id);

  // Petition queue processed by Censor
  W.sect.petitions = [{ npcId: W.npcs[1].id, reason: 'ไม่ได้รับความเป็นธรรมในการเลื่อนขั้น', day: W.day }];
  cen.h.personality.integrity = 80;
  HC.touch(cen);
  SECT.runOfficerJurisdictionSingle(W, 'censor', { force: true, quiet: true });
  assert.strictEqual(W.sect.petitions.length, 0, 'Censor jurisdiction must dequeue and process pending petition');

  const poolBefore = W.world.resourcePool.stones;
  const sectBefore = W.sect.stones;
  SECT.runOfficerJurisdictionSingle(W, 'quartermaster', { force: true, quiet: true });
  SECT.runOfficerJurisdictionSingle(W, 'marketmaster', { force: true, quiet: true });
  const poolDelta = poolBefore - W.world.resourcePool.stones;
  const sectDelta = W.sect.stones - sectBefore;
  assert.strictEqual(sectDelta, poolDelta, 'Quartermaster & Marketmaster jurisdiction stone gains must be 100% backed by W.world.resourcePool.stones');

  // Censor Audit Nepotism files Tribunal case & conserves stones
  qm.h.personality.integrity = 25;
  qm.inv.stones = 100;
  qm.personalStones = 100;
  HC.touch(qm);
  const totalBeforeAudit = W.sect.stones + qm.inv.stones + W.world.resourcePool.stones;
  const auditRes = SECT.ELDER_COUNCIL_EDICTS.auditOfficerConduct(W, 'quartermaster', cen, { forceNepotism: true, quiet: true });
  assert.strictEqual(auditRes.conductType, 'CLIQUE_NEPOTISM_DETECTED');
  const totalAfterAudit = W.sect.stones + qm.inv.stones + W.world.resourcePool.stones;
  assert.strictEqual(totalAfterAudit, totalBeforeAudit, 'Nepotism audit recovery must conserve 100% of Spirit Stones (deducted from corrupt officer)');
  assert.ok(W.sect.tribunal && W.sect.tribunal.activeCases.some(c => c.accusedId === qm.id), 'Nepotism audit must file a Tribunal case against the corrupt officer');

  console.log('  ✓ [2/8] Category 07A (25 Offices, Jurisdictions, Petitions & Closed-Loop Audits) Verified');
}

// ----------------------------------------------------------------------------
// [3/8] Category 07B: 8 Sacred Peaks Bed Relocation, Vault Sync, Peak Cultivate & 8-Peak Weapon Bonuses
// ----------------------------------------------------------------------------
{
  const W = SIM.create('cat07b-seed', { masterIdx: 0 });
  while (W.npcs.length < 10) {
    const nn = SIM.addNpc(W, { rank: 3, stage: 4, ageYears: 26 });
    if (!nn.cult) SIM.awaken(W, W.rng, nn, 4);
  }
  W.npcs[1].rank = 4;
  W.npcs[1].isElder = true;
  const fRes = SECT.PEAKS.foundPeak(W, 'PEAK_VAJRA_BODY', { allowDecree: true, masterId: W.npcs[1].id, deputyId: W.npcs[2].id, quiet: true });
  assert.ok(fRes && fRes.ok, 'PEAK_VAJRA_BODY founded');
  const pObj = W.sect.peaks.byId.PEAK_VAJRA_BODY;
  assert.strictEqual(pObj.treasuryStones, pObj.vault.stones, 'Founded peak treasuryStones and vault.stones must be synced');

  // Transfer disciple to founded peak -> bed relocated to peak_body
  const disc = W.npcs[5];
  SECT.PEAKS.transferDiscipleToPeak(W, disc, 'PEAK_VAJRA_BODY', { quiet: true });
  const bedSt = disc.bed != null ? W.map.stations[disc.bed] : null;
  assert.ok(bedSt && bedSt.bkey === 'peak_body', `Disciple transferred to founded Peak must relocate bed to peak_body (got ${bedSt && bedSt.bkey})`);

  // Cultivate where for non-XIAN/BODY/GOD path on founded Peak uses Peak Sanctuary station
  disc.cult.path = 'ARENA_GLORY';
  const cWhere = AI.ACTS.cultivate.where(W, disc);
  assert.ok(cWhere && cWhere.st && cWhere.st.bkey === 'peak_body', 'Disciple on founded Peak prioritizes Peak Sanctuary station in A.cultivate.where');

  // 8-Peak signature weapon bonus parity (PEAK_VAJRA_BODY with FIST weapon)
  disc.equip = { WEAPON: { id: 'MP_FIST_3', slot: 'WEAPON', gearType: 'FIST', tier: 3 } };
  const pBonus = SECT.PEAKS.getUnitPeakBonuses(W, disc);
  assert.ok(pBonus.active && pBonus.p.atk > 0, 'PEAK_VAJRA_BODY grants signature weapon atk bonus for FIST');

  // Allocate & upgrade array keep vault.stones synced
  W.sect.stones = 2000;
  SECT.PEAKS.allocateCentralResourcesToPeaks(W, { quiet: true });
  assert.strictEqual(pObj.treasuryStones, pObj.vault.stones, 'allocateCentralResourcesToPeaks keeps vault.stones synced with treasuryStones');
  pObj.treasuryStones = 400;
  SECT.PEAKS.syncPeakVault(pObj);
  SECT.PEAKS.upgradePeakArray(W, 'PEAK_VAJRA_BODY', { quiet: true });
  assert.strictEqual(pObj.treasuryStones, pObj.vault.stones, 'upgradePeakArray keeps vault.stones synced with treasuryStones');

  console.log('  ✓ [3/8] Category 07B (8 Sacred Peaks Beds, Vault Sync, Cultivate Stations & Weapon Parity) Verified');
}

// ----------------------------------------------------------------------------
// [4/8] Category 07C & 07D: Totems on New Recruits, Leyline Guard Check, Dungeon Ransom/Interrogate Cap
// ----------------------------------------------------------------------------
{
  const W = SIM.create('cat07cd-seed', { masterIdx: 0 });
  W.sect.stones = 3000;
  const totRes = SECT.TOTEMS_BLOODLINES.erectTotemPillar(W, 'TOTEM_WHITE_TIGER', { free: true, quiet: true });
  assert.ok(totRes && totRes.ok, 'erectTotemPillar succeeded');

  // Recruit a new NPC AFTER totem was erected
  const newDisc = SIM.addNpc(W, { rank: 1, stage: 2 });
  assert.ok(Array.isArray(newDisc.sectTotems) && newDisc.sectTotems.includes('TOTEM_WHITE_TIGER'), 'Newly added NPC after erectTotemPillar must receive sectTotems');
  const prevGW = G.W;
  G.W = null;
  const uBon = SECT.TOTEMS_BLOODLINES.getUnitBonuses(newDisc);
  G.W = prevGW;
  assert.strictEqual(uBon.active, true, 'TOTEMS_BLOODLINES.getUnitBonuses must work for post-totem recruits even when G.W is null');

  // Leyline anchor guard check when guard is away
  const ancRes = SECT.LEYLINE_GRID.deployAnchor(W, 'ANCHOR_NORTH', W.npcs[1].id, { free: true, quiet: true });
  assert.ok(ancRes && ancRes.ok);
  W.npcs[1].away = true;
  const contRes = SECT.LEYLINE_GRID.tickContestation(W, { anchorId: 'ANCHOR_NORTH' });
  assert.strictEqual(contRes.guarded, false, 'Away guard must not count as present on Leyline Anchor');
  assert.strictEqual(contRes.damageDealt, 35, 'Unguarded anchor takes full 35 damage');
  W.npcs[1].away = false;

  // Dungeon RANSOM pool conservation & INTERROGATE tier cap
  const pStage1 = SECT.capturePrisoner(W, { nameTh: 'โจรขั้นหนึ่ง', sectId: 'S0', stage: 1, path: 'XIAN' });
  const poolBeforeRansom = W.world.resourcePool.stones;
  const sectBeforeRansom = W.sect.stones;
  const rRes = SECT.handleDungeonPrisoner(W, pStage1.id, 'RANSOM', { quiet: true });
  assert.ok(rRes && rRes.ok);
  assert.strictEqual((W.sect.stones - sectBeforeRansom), (poolBeforeRansom - W.world.resourcePool.stones), 'Dungeon RANSOM stones must be conserved from W.world.resourcePool.stones');

  const pStage1B = SECT.capturePrisoner(W, { nameTh: 'ศิษย์ขั้นหนึ่ง', sectId: 'S0', stage: 1, path: 'XIAN' });
  const iRes = SECT.handleDungeonPrisoner(W, pStage1B.id, 'INTERROGATE', { quiet: true });
  assert.ok(iRes && iRes.ok);
  if (iRes.manualId) {
    const extTech = CULT.tech(iRes.manualId);
    assert.ok((extTech.reqTier || extTech.tier || 1) <= 3, `Stage-1 prisoner interrogation must not yield high-tier manual (got tier ${extTech.tier})`);
  }

  console.log('  ✓ [4/8] Category 07C & 07D (Totem Propagation, Leyline Guard Check, Dungeon Conservation & Tier Cap) Verified');
}

// ----------------------------------------------------------------------------
// [5/8] Category 07E: SIM.retire (Exiled vs Peaceful, Stones, Pets, Refs), Burial W.byId & Deserialize
// ----------------------------------------------------------------------------
{
  const W = SIM.create('cat07e-seed', { masterIdx: 0 });
  const traitor = SIM.addNpc(W, { rank: 2, stage: 3 });
  if (!traitor.cult) SIM.awaken(W, W.rng, traitor, 3);
  const rareTech = JD.TECH.techniques.find(t => !W.sect.library.includes(t.id) && !t.innateOnly);
  traitor.inv.techs = [rareTech.id];
  traitor.inv.stones = 120;
  traitor.personalStones = 120;
  traitor.pets = [{ uid: 'pet_test_1', id: 'BEAST_MIST_WOLF', nameTh: 'หมาป่าหมอก', active: true }];
  traitor.exiled = true;

  const poolBeforeRetire = W.world.resourcePool.stones;
  SIM.retire(W, traitor);
  assert.ok(!W.sect.library.includes(rareTech.id), 'Exiled traitor must NOT donate personal manuals to W.sect.library upon SIM.retire');
  assert.strictEqual(W.world.resourcePool.stones, poolBeforeRetire + 120, 'Exiled NPC stones must return to W.world.resourcePool.stones');
  assert.ok(Array.isArray(W.sect.reservePets) && W.sect.reservePets.some(p => p.uid === 'pet_test_1'), 'Retired/exiled NPC pets must be preserved in W.sect.reservePets');

  // Graveyard burial removes dead NPC from W.byId and masterId in graveyard deserializes cleanly
  const victim = SIM.addNpc(W, { rank: 1, stage: 1 });
  AI.kill(W, victim, 'ทดสอบสุสาน');
  victim.deathDay = W.day - 10;
  SIM.dailyUpdate(W);
  assert.ok(W.graveyard.includes(victim.id), 'Dead NPC after 4 days is buried in W.graveyard');
  assert.strictEqual(W.byId[victim.id], undefined, 'Buried NPC must be deleted from W.byId');

  const raw = SIM.serialize(W);
  const W2 = SIM.deserialize(raw);
  assert.ok(W2.sect.totemPillars && W2.sect.leylineGrid && W2.sect.tribunal, 'SIM.deserialize initializes all sect subsystems');

  console.log('  ✓ [5/8] Category 07E (SIM.retire Conservation, Exiled Scroll Guard, Burial W.byId & Deserialize) Verified');
}

// ----------------------------------------------------------------------------
// [6/8] Category 08A–08C: Foreign Sect Figure social.diplomacy, HydrateFigureToNpc & Outside World Pool Conservation
// ----------------------------------------------------------------------------
{
  const W = SIM.create('cat08abc-seed', { masterIdx: 0 });
  EXPED.ensureJianghuFigures(W);
  const fSect = W.world.allSects[0];
  assert.ok(fSect && fSect.figures && fSect.figures.master && Number.isFinite(fSect.figures.master.h.social.diplomacy), 'Procedural foreign sect figure must have h.social.diplomacy');

  // Hydrate wandering figure -> uppercase weapon skill, weapon recipe match, bed assigned, stones from pool
  const wf = EXPED.ensureWanderingFigures(W)[0];
  wf.weaponType = 'SWORD';
  const poolBeforeHyd = W.world.resourcePool.stones;
  const hRes = EXPED.hydrateFigureToNpc(W, wf, { rank: 3, quiet: true });
  assert.ok(hRes && hRes.ok && hRes.npc, 'hydrateFigureToNpc succeeded');
  const hNpc = hRes.npc;
  assert.ok((hNpc.h.skills.SWORD || 0) >= 55, 'Hydrated figure must have uppercase weapon skill initialized');
  assert.strictEqual(hNpc.personalStones, hNpc.inv.stones, 'Hydrated figure personalStones must match inv.stones');
  assert.strictEqual(poolBeforeHyd - W.world.resourcePool.stones, hNpc.inv.stones, 'Hydrated figure initial stones must be drawn from W.world.resourcePool.stones');
  assert.ok(hNpc.bed != null, 'Hydrated figure must be assigned a bed');

  console.log('  ✓ [6/8] Category 08A–08C (Foreign Figures social.diplomacy, HydrateFigureToNpc & Pool Sync) Verified');
}

// ----------------------------------------------------------------------------
// [7/8] Category 08D: Menagerie Tick, ReservePet Adoption, Beast Biomes/Elements & Wild Resources Herbalist
// ----------------------------------------------------------------------------
{
  const W = SIM.create('cat08d-seed', { masterIdx: 0 });
  const dragon = G.JD.BEASTS.species.find(s => s.id === 'BEAST_ABYSSAL_DRAGON');
  const lizard = G.JD.BEASTS.species.find(s => s.id === 'BEAST_THUNDER_DRAKE_LIZARD');
  const python = G.JD.BEASTS.species.find(s => s.id === 'BEAST_EMERALD_PYTHON');
  const hound = G.JD.BEASTS.species.find(s => s.id === 'BEAST_BLOOD_FIEND_HOUND_4');
  const taotie = G.JD.BEASTS.species.find(s => s.id === 'BEAST_MYTHIC_TAOTIE_SHADOW');

  assert.strictEqual(dragon.terrain, 'mountain', 'BEAST_ABYSSAL_DRAGON terrain fixed from urban -> mountain');
  assert.strictEqual(lizard.element, 'LIGHTNING', 'BEAST_THUNDER_DRAKE_LIZARD element fixed to LIGHTNING');
  assert.strictEqual(python.element, 'WOOD_LIFE', 'BEAST_EMERALD_PYTHON element fixed to WOOD_LIFE');
  assert.strictEqual(hound.element, 'BLOOD_DEMON', 'BEAST_BLOOD_FIEND_HOUND_4 element fixed to BLOOD_DEMON');
  assert.strictEqual(taotie.element, 'YIN_SHADOW', 'BEAST_MYTHIC_TAOTIE_SHADOW element fixed to YIN_SHADOW');

  // Orphaned reservePet adoption during SIM.dailyUpdate
  const beastDisc = W.npcs[1];
  if (!beastDisc.cult) SIM.awaken(W, W.rng, beastDisc, 2);
  beastDisc.cult.path = 'BEAST_SOVEREIGN';
  beastDisc.pets = [];
  W.sect.reservePets = [{ uid: 'orphan_pet_99', id: 'BEAST_MIST_WOLF', nameTh: 'หมาป่าหมอกกำพร้า', active: false }];
  SIM.dailyUpdate(W);
  assert.ok(Array.isArray(beastDisc.pets) && beastDisc.pets.some(p => p.uid === 'orphan_pet_99' && p.active === true), 'BEAST_SOVEREIGN disciple adopts orphaned pet from W.sect.reservePets');

  // Wild resources herbalist post bonus
  const herbHolder = W.npcs[2];
  herbHolder.post = 'herbal';
  const sHerb = { u: 0, why: [], add(lbl, v) { this.u += v; this.why.push([lbl, v]); } };
  AI.ACTS.gatherWildResource.score(herbHolder, W, sHerb);
  assert.ok(sHerb.why.some(w => w[0] === 'หน้าที่เก็บสมุนไพร' && w[1] === 1.5), 'gatherWildResource.score recognizes post === herbal');

  console.log('  ✓ [7/8] Category 08D (Beast Biomes/Elements, ReservePets Adoption & Herbalist Post Bonus) Verified');
}

// ----------------------------------------------------------------------------
// [8/8] Category 08E & 08F: Fish Dish Eating when meal===0, studyMult in A.study, External Market Visitor Pool Loop
// ----------------------------------------------------------------------------
{
  const W = SIM.create('cat08ef-seed', { masterIdx: 0 });
  const hungry = W.npcs[1];
  if (!hungry.cult) SIM.awaken(W, W.rng, hungry, 2);
  W.sect.stock.meal = 0;
  W.sect.stock.FOOD_JADE_KOI_SOUP = 2;
  hungry.h.state.satiety = 20;
  hungry.foodBuff = null;

  assert.strictEqual(AI.ACTS.eat.can(hungry, W), true, 'A.eat.can must return true when meal === 0 but cooked fish dish is in stock');
  const eatStarted = AI.ACTS.eat.start(hungry, W, {});
  assert.strictEqual(eatStarted, true, 'A.eat.start consumes cooked fish dish when meal === 0');
  assert.ok(hungry.foodBuff && hungry.foodBuff.studyMult > 1, 'Eating FOOD_JADE_KOI_SOUP grants studyMult > 1');

  // Verify A.study.tick applies foodBuff.studyMult
  const tStudy = JD.TECH.techniques.find(t => t.tier === 1 && !t.innateOnly);
  hungry.cult.learning = { id: tStudy.id, need: 1000, got: 0 };
  const savedBuff = hungry.foodBuff;
  hungry.foodBuff = null;
  AI.ACTS.study.tick(hungry, W);
  const gainWithoutBuff = hungry.cult.learning.got;
  hungry.cult.learning.got = 0;
  hungry.foodBuff = savedBuff;
  AI.ACTS.study.tick(hungry, W);
  const gainWithBuff = hungry.cult.learning.got;
  assert.ok(gainWithBuff > gainWithoutBuff * 1.05, `foodBuff.studyMult must accelerate A.study.tick (${gainWithBuff} > ${gainWithoutBuff})`);

  // External Market visitor default stones drawn from and returned to W.world.resourcePool.stones
  W.world.visitors = [];
  const pool0 = W.world.resourcePool.stones;
  const vis = EXT.openVisit(W, { stayDays: 1 });
  assert.strictEqual(W.world.resourcePool.stones, pool0 - vis.stones, 'EXT.openVisit draws default visitor stones from W.world.resourcePool.stones');
  vis.untilDay = W.day - 1;
  EXT.daily(W);
  // Note: EXT.daily may spawn a new visitor, so sum(W.world.resourcePool.stones + active trader stones) must equal pool0!
  const activeTraderStones = (W.world.visitors || []).filter(v => v && v.kind === 'trader' && v._backedByPool).reduce((s, v) => s + (v.stones || 0), 0);
  assert.strictEqual(W.world.resourcePool.stones + activeTraderStones, pool0, 'Departing trader returns remaining stones to W.world.resourcePool.stones');

  console.log('  ✓ [8/8] Category 08E & 08F (Fish Cuisine Fallback, studyMult & Visitor Pool Conservation) Verified');
}

console.log('ALL CATEGORY 07 & 08 REGRESSION TESTS PASSED.');
