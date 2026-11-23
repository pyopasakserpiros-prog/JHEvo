'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const g = require('./load.js');
if (!g.UI) require('../js/ui.js');
const { SIM, CULT, COMBAT, ECO, SECT, EXPED, COG, AI, STATS, HC, UI, JD } = g;
const EP = CULT.EPITHETS;

console.log('=== LIVING JIANGHU EPITHETS REGRESSION SUITE (JS2-v2.6.0) ===');

// 1. Verify Tracker CSV, Audit Docs & Catalog Completeness
{
  const rootDir = path.resolve(__dirname, '../..');
  const csvPath = path.join(rootDir, 'docs/handovers/EPITHET_260_REVIEW_TRACKER.csv');
  const oppPath = path.join(rootDir, 'docs/audits/EPITHET_FEATURE_OPPORTUNITIES.md');
  const regPath = path.join(rootDir, 'docs/audits/EPITHET_ACTIVE_REGISTRY.md');
  assert(fs.existsSync(csvPath), 'EPITHET_260_REVIEW_TRACKER.csv must exist');
  assert(fs.existsSync(oppPath), 'EPITHET_FEATURE_OPPORTUNITIES.md must exist');
  assert(fs.existsSync(regPath), 'EPITHET_ACTIVE_REGISTRY.md must exist');

  const csvText = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = csvText.split(/\r?\n/);
  assert.strictEqual(lines.length, 261, 'Tracker CSV must have 1 header + 260 proposal rows');
  assert(!csvText.includes(',UNREVIEWED,'), 'Zero UNREVIEWED rows allowed');
  assert(!csvText.includes(',BLOCKED,'), 'Zero BLOCKED rows allowed');

  assert(JD.EPITHETS && Array.isArray(JD.EPITHETS.LIST), 'JD.EPITHETS.LIST must be defined');
  assert.strictEqual(JD.EPITHETS.LIST.length, 274, '274 active runtime epithets (258 PDF + 16 Original)');
  for (let n = 261; n <= 276; n++) {
    const id = 'EPI_NEW_' + n;
    assert(JD.EPITHETS.BY_ID[id], 'Original epithet must exist in JD.EPITHETS.BY_ID: ' + id);
  }
  console.log('PASS [1/9] 260-Proposal CSV tracker (0 UNREVIEWED/BLOCKED) + 16 new originals = 274 active runtime epithets');
}

// 2. Verify Evidence-Backed Deeds & Anti-Farming Guards
{
  const W = SIM.create('epithet-deeds-test');
  const a = W.npcs[0];
  a.cult.stage = 5;

  // Guard 1: Non-serious sparring ignored for combat kills
  const rSpar = EP.recordDeed(W, a, 'combat_kill', 1, { fightKind: 'spar', serious: false });
  assert.strictEqual(rSpar.ok, false);
  assert.strictEqual(rSpar.reason, 'non-serious-spar-ignored');

  // Guard 2: Trivial prey (>2 stages below) ignored
  const rTrivial = EP.recordDeed(W, a, 'combat_kill', 1, { fightKind: 'wild', serious: true, targetStage: 2 });
  assert.strictEqual(rTrivial.ok, false);
  assert.strictEqual(rTrivial.reason, 'trivial-prey-ignored');

  // Guard 3: Overhealing healthy target (>=90% HP) ignored
  const rOverheal = EP.recordDeed(W, a, 'heal_patient', 1, { patientHpRatioBefore: 0.95 });
  assert.strictEqual(rOverheal.ok, false);
  assert.strictEqual(rOverheal.reason, 'overheal-ignored');

  // Guard 4: Zero-contribution AFK tag-along ignored
  const rAfk = EP.recordDeed(W, a, 'combat_win', 1, { contributionScore: 0 });
  assert.strictEqual(rAfk.ok, false);
  assert.strictEqual(rAfk.reason, 'zero-contribution-ignored');

  // Guard 5: Receipt idempotency
  const r1 = EP.recordDeed(W, a, 'combat_kill', 1, { fightKind: 'wild', serious: true, targetStage: 4, receiptId: 'rcpt_dup_1' });
  const r2 = EP.recordDeed(W, a, 'combat_kill', 1, { fightKind: 'wild', serious: true, targetStage: 4, receiptId: 'rcpt_dup_1' });
  assert.strictEqual(r1.ok, true);
  assert.strictEqual(r2.ok, false);
  assert.strictEqual(r2.reason, 'duplicate-receipt');

  // Guard 6: Cauldron explosion grants campus eccentricity (EPI_CMP_033), not positive stats
  EP.recordDeed(W, a, 'cauldron_explode', 3, { receiptId: 'cauld_exp_3' });
  assert(a.epithets.owned.some(x => x.id === 'EPI_CMP_033'), '3x cauldron explosions grant campus nickname EPI_CMP_033');
  assert(!a.epithets.owned.some(x => x.id === 'EPI_ART_057'), 'Cauldron explosion alone never grants master alchemist');
  EP.recordDeed(W, a, 'alchemy_success', 3, { receiptId: 'alch_succ_3' });
  assert(a.epithets.owned.some(x => x.id === 'EPI_ART_057'), 'Subsequent real alchemy success unlocks EPI_ART_057');

  console.log('PASS [2/9] Evidence-backed deeds, receipt idempotency & all 6 anti-farming guards');
}

// 3. Verify Witness vs. Unwitnessed Deeds, Rumor Deduplication & False Accusations
{
  const W = SIM.create('epithet-witness-test');
  const hero = W.npcs[0], peerA = W.npcs[1], peerB = W.npcs[2];
  hero.away = true;

  // Solo wilderness boss kill with zero witnesses & no physical proof yet
  const rSecret = EP.recordDeed(W, hero, 'solo_boss_kill', 1, {
    soloWilderness: true,
    witnessIds: [],
    hasPhysicalProof: false,
    receiptId: 'secret_boss_1',
    descTh: 'สังหารพญาอสูรในหุบเขาลึกไร้ผู้พบเห็น'
  });
  assert.strictEqual(rSecret.ok, true);
  assert.strictEqual(rSecret.unwitnessed, true);
  assert(!hero.epithets.owned.some(x => x.id === 'EPI_EXP_139'), 'Unwitnessed deed must NOT coin public epithet yet');
  assert.strictEqual(hero.deedStats.unwitnessedDeeds.length, 1);

  // Verify with physical proof upon return
  hero.away = false;
  const rProof = EP.verifySecretDeedWithProof(W, hero, 'solo_boss_kill', 'นำแก่นอสูรบรรพกาลกลับมาแสดงต่อหอภารกิจ');
  assert.strictEqual(rProof.ok, true);
  assert(hero.epithets.owned.some(x => x.id === 'EPI_EXP_139'), 'Verified proof coins EPI_EXP_139');
  assert.strictEqual(hero.deedStats.unwitnessedDeeds.length, 0);

  // Rumor propagation & anti-echo-chamber deduplication
  const rec = hero.epithets.owned.find(x => x.id === 'EPI_EXP_139');
  const wBefore = rec.witnessCount;
  COG.shareKnowledgeOnInteract(W, hero, peerA, 'chat');
  const wAfterFirst = rec.witnessCount;
  assert.strictEqual(wAfterFirst, wBefore + 1, 'First rumor share to peerA increments witnessCount by 1');
  // Echo chamber repeat between hero and peerA must NOT increment witnessCount again
  COG.shareKnowledgeOnInteract(W, hero, peerA, 'chat');
  COG.shareKnowledgeOnInteract(W, peerA, hero, 'chat');
  assert.strictEqual(rec.witnessCount, wAfterFirst, 'Echo chamber gossip never inflates witnessCount');

  // False accusation (RUMOR) & tribunal exoneration
  const acc = EP.seedAccusationRumor(W, peerB, 'EPI_INF_124', {
    accuserId: peerA.id,
    accuserNpc: peerA,
    reasonTh: 'ข่าวลือใส่ร้ายว่าแอบส่งข่าวให้สำนักอริ'
  });
  assert.strictEqual(acc.ok, true);
  assert(peerB.epithets.owned.some(x => x.id === 'EPI_INF_124' && x.epistemicStatus === 'RUMOR'));

  // High-perceptiveness, high-integrity observer waits for proof rather than blindly condemning
  hero.h.intellect.perceptiveness = 85;
  hero.h.values.integrity = 80;
  const percBeforeClear = EP.evaluatePerception(W, hero, peerB);
  assert.strictEqual(percBeforeClear.perceptionLabelTh, 'รอพิสูจน์ข้อเท็จจริง');

  const clr = EP.clearFalseAccusation(W, peerB, 'EPI_INF_124', hero);
  assert.strictEqual(clr.ok, true);
  assert(!peerB.epithets.owned.some(x => x.id === 'EPI_INF_124'), 'Cleared false accusation removed from owned epithets');

  console.log('PASS [3/9] Unwitnessed deeds, proof verification, anti-echo-chamber rumor deduplication & tribunal clearing');
}

// 4. Verify Multi-Perspective Perception, Shame Stigma & Autonomous Redemption
{
  const W = SIM.create('epithet-shame-redemption');
  const target = W.npcs[0], righteousObs = W.npcs[1], ruthlessObs = W.npcs[2];
  righteousObs.h.values.righteousness = 85;
  righteousObs.h.values.compassion = 80;
  ruthlessObs.h.values.righteousness = 20;
  ruthlessObs.h.values.compassion = 25;
  ruthlessObs.h.personality.aggression = 82;

  // High stealth can suppress heroic boasting, but NEVER suppresses SHAME
  target.h.skills.STEALTH = 90;
  target.h.values.humility = 85;
  EP.grantEpithet(W, target, 'EPI_CMB_001', { descTh: 'สังหารศัตรูอย่างเงียบเชียบ' });
  const stealthRec = target.epithets.owned.find(x => x.id === 'EPI_CMB_001');
  assert.strictEqual(stealthRec.suppressedByStealth, true, 'High-stealth humble NPC suppresses heroic public boasting');

  // Trigger SHAME stigma (fleeing battle twice)
  target.h.values.integrity = 75;
  EP.recordDeed(W, target, 'flee_battle', 2, { receiptId: 'flee_2x', descTh: 'หนีทัพกลางศึกสองครั้งซ้อน' });
  const shameRec = target.epithets.owned.find(x => x.id === 'EPI_INF_113');
  assert(shameRec && shameRec.shameActive, 'Shame epithet EPI_INF_113 is active');
  assert.strictEqual(shameRec.suppressedByStealth, false, 'Shame epithet can NEVER be hidden by stealth');
  assert.strictEqual(target.epithets.primaryId, 'EPI_INF_113', 'Shame overrides primary epithet');
  assert(target.epithets.redemptionDrive && target.epithets.redemptionDrive.active, 'Autonomous redemptionDrive activated');
  assert.strictEqual(target.cognition.goal.id, 'wash_shame_epithet', 'Autonomous wash_shame_epithet goal set');

  const pShame = EP.evaluatePerception(W, righteousObs, target);
  assert(pShame.respectDelta < 0, 'Observers lose respect while shame stigma is active');

  // Autonomous redemption via 2 real heroic deeds
  EP.recordDeed(W, target, 'defend_sect_win', 1, { receiptId: 'red_deed_1', descTh: 'ยืนหยัดปกป้องประตูสำนักครั้งที่ 1' });
  EP.recordDeed(W, target, 'rescue_comrade', 1, { receiptId: 'red_deed_2', descTh: 'ฝ่าวงล้อมช่วยชีวิตศิษย์น้องสำเร็จ' });

  assert.strictEqual(shameRec.shameActive, false, 'Shame stigma redeemed after 2 heroic deeds');
  assert.strictEqual(target.epithets.redemptionDrive.active, false);
  assert.strictEqual(target.epithets.primaryId, 'EPI_FAT_228', 'Primary epithet updated to redemption honorific EPI_FAT_228');

  const pRightAfter = EP.evaluatePerception(W, righteousObs, target);
  const pCynicAfter = EP.evaluatePerception(W, ruthlessObs, target);
  assert(pRightAfter.respectDelta > 0, 'Righteous/compassionate observer respects redemption');
  assert(pCynicAfter.trustDelta < 0, 'Cynical observer retains residual skepticism during 30-day window');

  console.log('PASS [4/9] Multi-perspective perception, stealth vs. shame rule & autonomous wash_shame_epithet redemption');
}

// 5. Verify 12 One-in-the-World Moveable Crowns (#235-#246)
{
  const W = SIM.create('epithet-crowns-test');
  const crowns = W.world.uniqueCrowns;
  assert.strictEqual(Object.keys(crowns).length, 12, 'All 12 Moveable Crowns exist in W.world.uniqueCrowns');

  // Uniqueness check: each crown has at most 1 holder
  for (const cid of Object.keys(crowns)) {
    const cr = crowns[cid];
    assert(cr.holderId, 'Crown ' + cid + ' initialized with a top world holder');
  }

  const duelistA = W.npcs[0], duelistB = W.npcs[1];
  duelistA.cult.stage = 5;
  duelistB.cult.stage = 5;
  duelistA.h.skills.SWORD = 88;
  duelistB.h.skills.SWORD = 85;

  // Assign Sword Crown (#235) and Young Prodigy Crown (#245) to duelistB
  duelistB.h.birthDay = W.day - 22 * 360; // age 22
  duelistA.h.birthDay = W.day - 23 * 360; // age 23
  EP.assignCrownHolder(W, 'EPI_CRN_235', duelistB, { immediatePublic: true });
  EP.assignCrownHolder(W, 'EPI_CRN_245', duelistB, { immediatePublic: true });

  // Single Sovereign Aura cap & no assemblyTitles inflation
  assert(!Array.isArray(duelistB.assemblyTitles) || !duelistB.assemblyTitles.includes('EPI_CRN_235'), 'Crowns never inflate assemblyTitles');
  const bBonus = EP.getNpcStatBonuses(duelistB);
  assert(bBonus && bBonus.p.atk <= 0.11, 'Holding 2 crowns caps Sovereign Aura at max 1 crown bonus');

  const atkBeforeA = STATS.get(duelistA).atk;
  const atkBeforeB = STATS.get(duelistB).atk;

  // Direct duel transfer: duelistA defeats duelistB in a serious duel
  const fakeFight = { id: 'crown_duel_1', kind: 'duel', serious: true, gather: false };
  const transferred = EP.checkCrownDuelTransfer(W, fakeFight, duelistA, duelistB);
  assert(transferred.includes('EPI_CRN_235'), 'Sword crown transferred on direct duel victory');
  assert.strictEqual(crowns.EPI_CRN_235.holderId, duelistA.id);
  // Rumor lag: non-public duel keeps publicKnownHolderId on duelistB for 2 days
  assert.strictEqual(crowns.EPI_CRN_235.publicKnownHolderId, duelistB.id, 'Rumor lag preserves previous publicKnownHolderId until propagation day');
  W.day += 3;
  EP.syncPublicCrownKnowledge(W);
  assert.strictEqual(crowns.EPI_CRN_235.publicKnownHolderId, duelistA.id, 'Public holder knowledge updates after rumor lag');

  const atkAfterA = STATS.get(duelistA).atk;
  const atkAfterB = STATS.get(duelistB).atk;
  assert(atkAfterA > atkBeforeA, 'New crown holder immediately gains Sovereign stat bonus');
  assert(atkAfterB < atkBeforeB, 'Defeated former holder immediately loses Sovereign stat bonus');

  // Age-out rule on #245 (Young Prodigy Crown vacates at age >= 28)
  const holder245 = EP.findWorldActorById(W, crowns.EPI_CRN_245.holderId).actor;
  if (holder245.h) holder245.h.birthDay = W.day - 29 * 360;
  else holder245.ageYears = 29;
  EP.reconcileUniqueCrowns(W);
  assert.notStrictEqual(crowns.EPI_CRN_245.holderId, holder245.id, 'Age >= 28 automatically vacates/transfers EPI_CRN_245');

  // Death immediately vacates crown
  AI.kill(W, duelistA, 'ศึกตัดสินยุทธภพ');
  assert.strictEqual(crowns.EPI_CRN_235.holderId, null, 'Death immediately vacates held crown');
  assert.strictEqual(duelistA.epithets.crownIds.length, 0);

  console.log('PASS [5/9] 12 One-in-the-World Moveable Crowns: uniqueness, duel transfer, rumor lag, age-28 vacation, death vacation & single aura cap');
}

// 6. Verify External Notable Hydration & Collective Group Epithets (#173-#188)
{
  const W = SIM.create('epithet-groups-hydrate');
  const extFig = Object.values(W.world.figuresById)[0];
  EP.assignCrownHolder(W, 'EPI_CRN_236', extFig, { immediatePublic: true });
  const hyd = EXPED.hydrateFigureToNpc(W, extFig.id, { quiet: true });
  assert(hyd.ok && hyd.npc, 'External figure hydrated to resident NPC');
  assert(hyd.npc.epithets.crownIds.includes('EPI_CRN_236'), 'Hydrated NPC preserves held crown');
  assert.strictEqual(W.world.uniqueCrowns.EPI_CRN_236.holderId, hyd.npc.id);

  // Collective Group formation, bereavement & fracture
  const m1 = W.npcs[0], m2 = W.npcs[1], m3 = W.npcs[2];
  const gRes = EP.formCollectiveGroup(W, 'EPI_GRP_176', [m1.id, m2.id, m3.id], {
    titleTh: 'สามพยัคฆ์ร่วมสาบานหุบเขาสองแคว'
  });
  assert(gRes.ok);
  assert.strictEqual(m1.epithets.groupTitleTh, 'สามพยัคฆ์ร่วมสาบานหุบเขาสองแคว');

  // Member m3 dies -> group becomes BEREAVED, survivors receive EPI_CHV_101
  AI.kill(W, m3, 'พลีชีพในศึกป้องกันสำนัก');
  assert.strictEqual(W.sect.collectiveEpithets.byId.EPI_GRP_176.status, 'BEREAVED');
  assert(m1.epithets.owned.some(x => x.id === 'EPI_CHV_101'));

  // Member m2 dies -> m1 becomes SOLE_SURVIVOR and receives EPI_CHV_096
  AI.kill(W, m2, 'สิ้นชีพกลางสมรภูมิ');
  assert.strictEqual(W.sect.collectiveEpithets.byId.EPI_GRP_176.status, 'SOLE_SURVIVOR');
  assert(m1.epithets.owned.some(x => x.id === 'EPI_CHV_096'));

  // Second group fracture test
  const m4 = m1, m5 = hyd.npc;
  EP.formCollectiveGroup(W, 'EPI_GRP_173', [m4.id, m5.id], { titleTh: 'คู่กระบี่หงส์มังกรไร้พ่าย' });
  EP.onGroupMemberFracture(W, m4, m5, 'แตกหักเพราะศึกชิงตำแหน่ง');
  assert.strictEqual(W.sect.collectiveEpithets.byId.EPI_GRP_173.status, 'FRACTURED');
  assert.strictEqual(W.sect.collectiveEpithets.byId.EPI_GRP_173.groupBonusActive, false);

  console.log('PASS [6/9] External notable hydration & collective group formation, bereavement, sole survivor & fracture');
}

// 7. Verify Daoist Names (#077-#084), Lineage Seniority (#085-#092), Posthumous Honorifics (#247-#260) & Snapshot Immutability
{
  const W = SIM.create('epithet-dao-posthumous');
  const elder = W.npcs[0], worshiper = W.npcs[1];
  const origGiven = elder.h.name.given;
  const origFam = elder.h.name.family || elder.h.name.sur;
  elder.cult.stage = 4;

  const dRes = EP.bestowDaoName(W, elder);
  assert(dRes.ok && dRes.daoNameTh, 'Daoist name bestowed');
  assert.strictEqual(elder.h.name.given, origGiven, 'Birth given name strictly preserved');
  assert.strictEqual(elder.h.name.family || elder.h.name.sur, origFam, 'Birth family name strictly preserved');

  // Record a Chronicle entry while elder holds EPI_CMB_001
  EP.grantEpithet(W, elder, 'EPI_CMB_001', { forcePublic: true });
  const snapBefore = SIM.snapshotPerson(W, elder);
  const factSnap = EXPED.buildFactSnapshot(W, { t: W.t, day: W.day }, [snapBefore], 'PIGEON_DISPATCH');
  const frozenEpithet = factSnap.actorsAtEvent[0].epithetAtEventTh;
  assert.strictEqual(frozenEpithet, 'หนึ่งกระบี่สะบั้นพิรุณ');

  // Later elder changes primary epithet and dies -> past Chronicle factSnapshot remains immutable!
  EP.grantEpithet(W, elder, 'EPI_EXP_139', { forcePublic: true });
  AI.kill(W, elder, 'ดับขันธ์ใต้อสนีทัณฑ์สวรรค์');
  const tablet = SECT.inscribeLegacyTablet(W, elder, 'ดับขันธ์ใต้อสนีทัณฑ์สวรรค์');
  assert.strictEqual(factSnap.actorsAtEvent[0].epithetAtEventTh, 'หนึ่งกระบี่สะบั้นพิรุณ', 'Historical Chronicle snapshot is strictly immutable');
  assert(elder.epithets.posthumousTitleTh, 'Posthumous honorific bestowed on death');
  assert.strictEqual(tablet.posthumousTitleTh, elder.epithets.posthumousTitleTh, 'Legacy tablet carries posthumous honorific');

  const prayRes = SECT.prayAtAncestralShrine(W, worshiper, tablet.id);
  assert(prayRes && prayRes.tabletId === tablet.id && prayRes.posthumousTitleTh === tablet.posthumousTitleTh, 'Ancestral shrine prayer succeeds with posthumous tablet');

  console.log('PASS [7/9] Daoist names preserve birth name, posthumous tablets engraved & Chronicle snapshots remain immutable');
}

// 8. Verify 16 Original Codebase-Grounded Epithets (#261-#276) Producer Hooks
{
  const W = SIM.create('epithet-16-originals');
  const u = W.npcs[0];
  u.rank = 3;
  u.cult.stage = 4;

  EP.recordDeed(W, u, 'herb_beast_tame', 1, { receiptId: 'o261' });
  EP.recordDeed(W, u, 'iron_marrow_breaker', 1, { receiptId: 'o262' });
  EP.recordDeed(W, u, 'qinggong_flight_mastery', 1, { receiptId: 'o263' });
  EP.recordDeed(W, u, 'mantra_weather_sync', 1, { receiptId: 'o264' });
  EP.recordDeed(W, u, 'defensive_redirect_mastery', 1, { receiptId: 'o265' });
  EP.recordDeed(W, u, 'support_blessing_mastery', 1, { receiptId: 'o266' });
  EP.recordDeed(W, u, 'forbidden_blood_taboo_survived', 1, { receiptId: 'o267' });
  EP.recordDeed(W, u, 'passive_constellation_tier3', 1, { receiptId: 'o268' });
  EP.recordDeed(W, u, 'multiphase_pill_brew', 1, { receiptId: 'o269' });
  EP.recordDeed(W, u, 'catalyst_3star_refine', 1, { receiptId: 'o270' });
  EP.recordDeed(W, u, 'leyline_anchor_guard', 1, { receiptId: 'o271' });
  EP.recordDeed(W, u, 'court_memorial_accepted', 1, { receiptId: 'o272' });
  EP.recordDeed(W, u, 'micro_locations_all4', 1, { receiptId: 'o273' });
  EP.recordDeed(W, u, 'ancient_dao_legacy_awakened', 1, { receiptId: 'o274' });
  EP.recordDeed(W, u, 'spirit_fish_banquet', 1, { receiptId: 'o275' });
  EP.recordDeed(W, u, 'heal_patient', 4, { receiptId: 'o276', patientHpRatioBefore: 0.4 });

  for (let n = 261; n <= 276; n++) {
    const id = 'EPI_NEW_' + n;
    assert(u.epithets.owned.some(x => x.id === id), 'Original epithet unlocked via deed hook: ' + id);
  }
  console.log('PASS [8/9] All 16 codebase-grounded original epithets (EPI_NEW_261..276) unlocked via real deed producers');
}

// 9. Verify Save/Load Round-Trip & Zero-RNG / Zero-Mutation UI Purity
{
  const W = SIM.create('epithet-ui-purity');
  const n = W.npcs[0];
  EP.grantEpithet(W, n, 'EPI_CMB_001', { forcePublic: true });
  EP.bestowDaoName(W, n);
  const tablet = SECT.inscribeLegacyTablet(W, n, 'จารึกเกียรติคุณ');
  SIM.snapshotPerson(W, n);

  UI.G = { W, speed: 0 };
  UI.npcId = n.id;
  UI.histNpcId = n.id;
  UI.tab = 'ov';

  UI.rNpc(); // Warmup baseline lazy state initializers (qinggongState/meridians)
  const rngBefore = W.rng.getState();
  const serBefore = SIM.serialize(W);

  const htmlNpc = UI.rNpc();
  const htmlPeople = UI.rPeople();
  const htmlWorld = UI.rWorld();
  const htmlHist = UI.rHistoricalPerson();
  const htmlAnc = UI.ancestorProfile(W, tablet);
  const perc = EP.evaluatePerception(W, W.npcs[1], n);

  const rngAfter = W.rng.getState();
  const serAfter = SIM.serialize(W);

  assert.deepStrictEqual(rngAfter, rngBefore, 'UI renders and perception checks must NEVER advance W.rng');
  assert.strictEqual(serAfter, serBefore, 'UI renders and perception checks must NEVER mutate serialized world state');
  assert(htmlNpc.includes('หนึ่งกระบี่สะบั้นพิรุณ'), 'UI.rNpc displays active primary epithet');
  assert(htmlPeople.includes('หนึ่งกระบี่สะบั้นพิรุณ'), 'UI.rPeople displays epithet badge');
  assert(htmlWorld.includes('ทำเนียบ 12 มงกุฎหนึ่งเดียวในใต้หล้า'), 'UI.rWorld displays 12 Moveable Crowns leaderboard');
  assert(htmlHist.includes('หนึ่งกระบี่สะบั้นพิรุณ'), 'UI.rHistoricalPerson displays snapshot epithet');
  assert(htmlAnc.includes(tablet.posthumousTitleTh), 'UI.ancestorProfile displays posthumous honorific');
  assert(perc && typeof perc.attitudeDelta === 'number');

  // Verify Save/Load round-trip
  const loaded = SIM.deserialize(serAfter);
  assert.deepStrictEqual(loaded.byId[n.id].epithets, n.epithets, 'npc.epithets survives save/load round-trip');
  assert.deepStrictEqual(loaded.byId[n.id].deedStats, n.deedStats, 'npc.deedStats survives save/load round-trip');
  assert.deepStrictEqual(loaded.world.uniqueCrowns, W.world.uniqueCrowns, 'W.world.uniqueCrowns survives save/load round-trip');

  console.log('PASS [9/9] Save/Load round-trip fidelity + strict Zero-RNG & Zero-Mutation UI purity');
}

console.log('✅ ALL LIVING JIANGHU EPITHETS TESTS PASSED!');
