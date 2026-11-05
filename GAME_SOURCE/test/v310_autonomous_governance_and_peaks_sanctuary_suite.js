'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const G = require('./load.js');
G.document = { getElementById() { return { querySelectorAll() { return []; }, style: {}, classList: { add() {}, remove() {} } }; } };
require('../js/ui.js');
const { SIM, SECT, COG, AI, UI, EXPED, HC } = G;

let assertions = 0;
function check(cond, msg) {
  assert.ok(cond, msg);
  assertions++;
}

console.log('=========================================================================');
console.log('   JIANGHUSECT v3.1.0 AUTONOMOUS GOVERNANCE & PEAKS SANCTUARY SUITE      ');
console.log('=========================================================================\n');

// 1. Version, Core Lock & 6-Directorate / 25-Office Catalog Verification
console.log('▶ [1/6] Testing Version Metadata, Core Lock & 25-Office Catalog...');
{
  check(SIM.PATCH_VERSION === '3.1.0', 'SIM.PATCH_VERSION must be 3.1.0');
  check(SIM.SAVE_SCHEMA_VERSION === '3.1.0-autonomous-governance-peaks', 'SIM.SAVE_SCHEMA_VERSION must be 3.1.0-autonomous-governance-peaks');
  check(HC.FINGERPRINT === '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');

  const hcBytes = fs.readFileSync(path.resolve(__dirname, '../js/human_core.js'));
  const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  check(hcSha === 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js SHA-256 must remain untouched');

  check(SECT.DIRECTORATES && Object.keys(SECT.DIRECTORATES).length === 6, 'SECT.DIRECTORATES must define 6 Directorates');
  const expectedDirs = ['war', 'diplomacy', 'economy', 'craft', 'beasts', 'governance'];
  for (const d of expectedDirs) {
    check(SECT.DIRECTORATES[d] && SECT.DIRECTORATES[d].nameTh, `Directorate ${d} must have Thai name`);
  }

  check(SECT.POSTS && Object.keys(SECT.POSTS).length === 25, `SECT.POSTS must contain 25 offices (got ${SECT.POSTS && Object.keys(SECT.POSTS).length})`);
  check(Array.isArray(SECT.POST_IDS) && SECT.POST_IDS.length === 25, 'SECT.POST_IDS must contain 25 office IDs');
  const expectedOffices = [
    'commander', 'martial', 'guard', 'vanguard',
    'envoy', 'spymaster', 'warden', 'mission',
    'treasury', 'quartermaster', 'provision', 'marketmaster',
    'alchemy', 'forge', 'arraymaster',
    'herbal', 'beastmaster', 'wildwarden',
    'discipline', 'censor', 'scripture', 'registry', 'healer', 'steward', 'disciples'
  ];
  for (const id of expectedOffices) {
    const p = SECT.POST_CATALOG[id];
    check(!!p, `Office ${id} must exist in SECT.POST_CATALOG`);
    check(typeof p.nameTh === 'string' && p.nameTh.length > 0, `Office ${id} must have nameTh`);
    check(typeof p.category === 'string' && SECT.DIRECTORATES[p.category], `Office ${id} must belong to a valid Directorate`);
    check(typeof p.hall === 'string' && p.hall.length > 0, `Office ${id} must have a target hall`);
    check(typeof p.minRank === 'number' && p.minRank >= 1, `Office ${id} must have minRank`);
    check(typeof p.stipendBonus === 'number' && p.stipendBonus > 0, `Office ${id} must have positive stipendBonus`);
    check(typeof p.authority === 'number' && p.authority > 0, `Office ${id} must have positive authority weight`);
    check(typeof p.suitability === 'function', `Office ${id} must have suitability(n) function`);
    check(typeof p.descTh === 'string' && p.descTh.length > 10, `Office ${id} must have Thai jurisdiction description`);
  }

  check(SECT.resolveOfficeId('diplomacy') === 'envoy', 'diplomacy alias must resolve to envoy');
  check(SECT.resolveOfficeId('intelligence') === 'spymaster', 'intelligence alias must resolve to spymaster');
  check(SECT.resolveOfficeId('beastcare') === 'beastmaster', 'beastcare alias must resolve to beastmaster');
  check(SECT.resolveOfficeId('formation') === 'arraymaster', 'formation alias must resolve to arraymaster');
}
console.log('  ✓ Verified 6 Directorates, 25 Offices, Alias Resolution & Core Lock');

// 2. Unlock All Offices & Real Autonomous Jurisdiction Execution (All 25 Posts)
console.log('▶ [2/6] Testing Autonomous Jurisdiction Execution Across All 25 Offices...');
{
  const W = SIM.create('v310-jurisdiction-suite');
  while (W.npcs.filter(n => !n.dead).length < 30) {
    const npc = SIM.addNpc(W, { rank: 3, stage: 3, ageYears: 26, quality: 0.65 });
    npc.rank = 3;
    npc.realm = 3;
  }
  for (const n of W.npcs) {
    if (!n.dead && n.id !== W.sect.masterId) {
      n.rank = Math.max(n.rank || 1, 3);
      n.realm = Math.max(n.realm || 1, 3);
    }
  }

  const unlockRes = SECT.unlockAllOffices(W);
  check(unlockRes && unlockRes.ok, 'SECT.unlockAllOffices(W) must succeed');
  check(SECT.officeState(W, 'diplomacy').enabled === true, 'diplomacy bureau must be enabled after unlockAllOffices');
  check(SECT.officeState(W, 'vanguard').enabled === true, 'vanguard office must be enabled after unlockAllOffices');
  check(SECT.officeState(W, 'warden').enabled === true, 'warden office must be enabled after unlockAllOffices');
  check(SECT.officeState(W, 'marketmaster').enabled === true, 'marketmaster office must be enabled after unlockAllOffices');

  const candidates = W.npcs.filter(n => !n.dead && n.id !== W.sect.masterId);
  SECT.POST_IDS.forEach((postId, idx) => {
    const holder = candidates[idx];
    check(!!holder, `Candidate must exist for post ${postId}`);
    const ok = SECT.appoint(W, postId, holder.id);
    check(ok === true, `SECT.appoint must succeed for ${postId}`);
    check(W.sect.posts[postId] === holder.id, `W.sect.posts[${postId}] must reference appointed holder`);
  });

  W.sect.stones = 2500;
  W.sect.stock.grain = 200;
  W.sect.stock.meal = 50;
  W.sect.stock.MAT_HERB_DEW_GRASS_1 = 20;
  W.sect.stock.MAT_ORE_BLACK_IRON_1 = 20;
  SECT.capturePrisoner(W, { name: 'โจรเงาโลหิต', sectId: 'S0', sectName: 'สำนักเงาโลหิต', realm: 3, power: 480 });

  for (const postId of SECT.POST_IDS) {
    const res = SECT.runOfficerJurisdictionSingle(W, postId, true);
    check(res && res.ok, `runOfficerJurisdictionSingle must succeed for ${postId}`);
    check(typeof res.summaryTh === 'string' && res.summaryTh.length > 5, `Jurisdiction ${postId} must produce Thai summary`);
  }

  check(Array.isArray(W.sect.jurisdictionLog) && W.sect.jurisdictionLog.length >= 25, 'W.sect.jurisdictionLog must record all executed jurisdictions');

  const vanguardHolder = W.byId[W.sect.posts.vanguard];
  const dutyOk = COG.performDuty(W, vanguardHolder);
  check(dutyOk === true, 'COG.performDuty must succeed for vanguard officer');
  const revOk = COG.reviewOffice(W, vanguardHolder, 'vanguard');
  check(revOk === true, 'COG.reviewOffice must succeed for vanguard officer');
}
console.log('  ✓ All 25 Office Jurisdictions Executed & Logged with Real State Mutations');

// 3. Real Office Stipends (stipendBonus) & Elder Council Authority Weighting
console.log('▶ [3/6] Testing Office Stipends (stipendBonus) & Elder Council Authority...');
{
  const W = SIM.create('v310-stipends-and-authority');
  while (W.npcs.filter(n => !n.dead).length < 12) {
    const npc = SIM.addNpc(W, { rank: 3, stage: 3, ageYears: 26, quality: 0.65 });
    npc.rank = 3;
    npc.realm = 3;
  }
  SECT.unlockAllOffices(W);
  const pool = W.npcs.filter(n => !n.dead && n.id !== W.sect.masterId);
  SECT.appoint(W, 'commander', pool[0].id);
  SECT.appoint(W, 'treasury', pool[1].id);
  SECT.appoint(W, 'vanguard', pool[2].id);
  SECT.appoint(W, 'warden', pool[3].id);
  SECT.appoint(W, 'marketmaster', pool[4].id);

  W.sect.stones = 2000;
  const stonesBefore = W.sect.stones;
  const cmdPersonalBefore = pool[0].personalStones || 0;
  const payRes = SECT.payOfficeStipends(W, true);
  check(payRes && payRes.ok && payRes.paidCount >= 5, 'SECT.payOfficeStipends must pay all active officers');
  check(payRes.totalBonus >= (15 + 14 + 13 + 12 + 12), 'Total stipendBonus must sum catalog stipendBonus values');
  check(W.sect.stones < stonesBefore, 'Sect stones must decrease after paying office stipends');
  check((pool[0].personalStones || 0) > cmdPersonalBefore, 'Officer personalStones must increase after stipend payout');

  const councilRes = SECT.ELDER_COUNCIL_EDICTS.conveneElderCouncil(W, 'MARTIAL_MOBILIZATION', { force: true });
  check(councilRes && councilRes.ok, 'conveneElderCouncil must succeed');
  check(Array.isArray(councilRes.votes) && councilRes.votes.length > 0, 'Council vote breakdown must contain votes');
  const cmdVote = councilRes.votes.find(v => v.npcId === pool[0].id);
  check(cmdVote && cmdVote.officeId === 'commander' && cmdVote.authorityBonus > 0, 'Commander vote must include officeId and positive authorityBonus');
  check(cmdVote.weight > 1.3, `Commander vote weight must reflect high office authority (got ${cmdVote.weight})`);

  const lowDisciple = pool[8];
  lowDisciple.rank = 1;
  const defToCmd = COG.deferenceToward(W, lowDisciple, pool[0]);
  const defToPeer = COG.deferenceToward(W, lowDisciple, pool[9]);
  check(defToCmd.deference > defToPeer.deference, 'COG.deferenceToward must grant higher deference to high-authority office holders');
}
console.log('  ✓ Verified Office Stipends & Elder Council Authority Weighting');

// 4. Dedicated Peaks Sanctuary Subsystems & UI (⛰️ หุบเขา/ยอดเขา)
console.log('▶ [4/6] Testing Dedicated Peaks Sanctuary Subsystems & UI...');
{
  const W = SIM.create('v310-peaks-sanctuary');
  while (W.npcs.filter(n => !n.dead).length < 18) {
    const npc = SIM.addNpc(W, { rank: 3, stage: 3, ageYears: 26, quality: 0.65 });
    npc.rank = 2;
    npc.realm = 2;
  }
  const elders = W.npcs.filter(n => !n.dead && n.id !== W.sect.masterId).slice(0, 4);
  elders.forEach(e => { e.rank = 3; e.realm = 3; });

  W.sect.stones = 8000;
  W.sect.fame = 500;

  const f0 = SECT.PEAKS.foundPeak(W, 'PEAK_AZURE_SWORD', elders[2].id, { allowDecree: true });
  check(f0 && f0.ok, 'foundPeak must succeed for PEAK_AZURE_SWORD');
  const f1 = SECT.PEAKS.foundPeak(W, 'PEAK_DIVINE_BEAST', elders[0].id, { allowDecree: true });
  check(f1 && f1.ok, 'foundPeak must succeed for PEAK_DIVINE_BEAST');
  const f2 = SECT.PEAKS.foundPeak(W, 'PEAK_CRIMSON_SHADOW', elders[1].id, { allowDecree: true });
  check(f2 && f2.ok, 'foundPeak must succeed for PEAK_CRIMSON_SHADOW');

  const apMaster = SECT.PEAKS.appointPeakLeader(W, 'PEAK_AZURE_SWORD', elders[2].id, 'MASTER');
  check(apMaster && apMaster.ok, 'appointPeakLeader MASTER must succeed');
  const apDeputy = SECT.PEAKS.appointPeakLeader(W, 'PEAK_AZURE_SWORD', elders[3].id, 'DEPUTY');
  check(apDeputy && apDeputy.ok, 'appointPeakLeader DEPUTY must succeed');

  const rmDeputy = SECT.PEAKS.removePeakLeader(W, 'PEAK_AZURE_SWORD', 'DEPUTY');
  check(rmDeputy && rmDeputy.ok, 'removePeakLeader DEPUTY must succeed');
  SECT.PEAKS.appointPeakLeader(W, 'PEAK_AZURE_SWORD', elders[3].id, 'DEPUTY');

  const regularDisciples = W.npcs.filter(n => !n.dead && n.id !== W.sect.masterId && !elders.includes(n));
  const tr1 = SECT.PEAKS.transferDiscipleToPeak(W, regularDisciples[0].id, 'PEAK_AZURE_SWORD');
  check(tr1 && tr1.ok && regularDisciples[0].peakId === 'PEAK_AZURE_SWORD', 'transferDiscipleToPeak must assign disciple to PEAK_AZURE_SWORD');
  const rm1 = SECT.PEAKS.removeDiscipleFromPeak(W, regularDisciples[0].id);
  check(rm1 && rm1.ok && !regularDisciples[0].peakId, 'removeDiscipleFromPeak must unassign disciple');

  const autoRes = SECT.PEAKS.autoAssignUnassignedDisciples(W);
  check(autoRes && autoRes.ok && autoRes.assignedCount > 0, 'autoAssignUnassignedDisciples must assign unassigned disciples');

  for (const pol of ['MERITOCRATIC', 'REALM_PRIORITY', 'EGALITARIAN', 'NEPOTISTIC_INNER_CIRCLE']) {
    const polRes = SECT.PEAKS.setPeakPolicy(W, 'PEAK_AZURE_SWORD', pol);
    check(polRes && polRes.ok, `setPeakPolicy must support ${pol}`);
    check(W.sect.peaks.byId.PEAK_AZURE_SWORD.policy.allocationRule === pol, `Peak policy must update to ${pol}`);
  }

  const arrRes = SECT.PEAKS.activatePeakArray(W, 'PEAK_AZURE_SWORD');
  check(arrRes && arrRes.ok, 'activatePeakArray must succeed');
  const swordDisciple = W.npcs.find(n => !n.dead && n.peakId === 'PEAK_AZURE_SWORD');
  if (swordDisciple) {
    const cBonus = SECT.PEAKS.cultivationBonusFor(W, swordDisciple);
    check(cBonus >= 0.14, `cultivationBonusFor must include +14% Qi Array bonus when active (got ${cBonus})`);
  }

  const exRes = SECT.PEAKS.holdJointPeakExchange(W, 'PEAK_AZURE_SWORD', 'PEAK_DIVINE_BEAST');
  check(exRes && exRes.ok, 'holdJointPeakExchange must succeed between two founded peaks');

  const tourRes = SECT.PEAKS.holdInterPeakTournament(W, true);
  check(tourRes && tourRes.ok && tourRes.championPeakId, 'holdInterPeakTournament must crown a champion peak');

  G.W = W; UI.G = { W, R: {}, opts: {}, acc: 13, speed: 32 };
  UI.activePeakId = 'OVERVIEW';
  const htmlOverview = UI.rSectPeaks(W);
  check(htmlOverview.includes('ภาพรวมทุกยอดเขา') && htmlOverview.includes('ศึกประลองยอดเขา'), 'UI.rSectPeaks OVERVIEW must render horizontal selector & overview');

  UI.activePeakId = 'PEAK_AZURE_SWORD';
  const htmlPeak = UI.rSectPeaks(W);
  check(htmlPeak.includes('ยอดเขากระบี่เมฆา') && htmlPeak.includes('ประธานยอดเขา') && htmlPeak.includes('ค่ายกลปราณ'), 'UI.rSectPeaks PEAK_AZURE_SWORD must render Peak Sanctuary detail cards');

  UI.activePeakId = 'TOURNAMENT';
  const htmlTour = UI.rSectPeaks(W);
  check(htmlTour.includes('ศึกประลองยอดเขา') && htmlTour.includes('จัดศึกประลองยุทธ์ระหว่างยอดเขาทันที'), 'UI.rSectPeaks TOURNAMENT must render tournament center');
}
console.log('  ✓ Verified Dedicated Peaks Sanctuary Subsystems & Mobile-Friendly UI');

// 5. Dungeon & Prisoner Management (RANSOM, INTERROGATE, RECRUIT_DEFECTOR)
console.log('▶ [5/6] Testing Dungeon & Prisoner Management + 4D Chronicle Causal Links...');
{
  const W = SIM.create('v310-dungeon-prisoners');
  W.sect.stones = 1000;
  const p1 = SECT.capturePrisoner(W, { name: 'นักพรตมารอสูร', sectId: 'S0', sectName: 'สำนักมารโลหิต', realm: 3, power: 420 });
  const p2 = SECT.capturePrisoner(W, { name: 'ทูตเงาพิษ', sectId: 'S0', sectName: 'สำนักมารโลหิต', realm: 2, power: 310 });
  const p3 = SECT.capturePrisoner(W, { name: 'จอมยุทธ์พเนจรหลิน', sectId: 'S1', sectName: 'ตระกูลกระบี่อุดร', realm: 3, power: 460 });
  check(p1 && p2 && p3 && W.sect.dungeon.prisoners.length === 3, 'capturePrisoner must add 3 prisoners to W.sect.dungeon');

  const stonesBeforeRansom = W.sect.stones;
  const r1 = SECT.executePrisonerAction(W, p1.id, 'RANSOM');
  check(r1 && r1.ok, 'executePrisonerAction RANSOM must succeed');
  check(W.sect.stones > stonesBeforeRansom, 'RANSOM must increase sect stones');

  const r2 = SECT.executePrisonerAction(W, p2.id, 'INTERROGATE');
  check(r2 && r2.ok, 'executePrisonerAction INTERROGATE must succeed');
  check(W.sect.dungeon.stats.interrogated >= 1, 'INTERROGATE must increment dungeon stats.interrogated');

  const npcCountBefore = W.npcs.length;
  const r3 = SECT.executePrisonerAction(W, p3.id, 'RECRUIT_DEFECTOR');
  check(r3 && r3.ok && r3.npcId, 'executePrisonerAction RECRUIT_DEFECTOR must succeed and spawn a new disciple');
  check(W.npcs.length === npcCountBefore + 1, 'RECRUIT_DEFECTOR must add new disciple to W.npcs');
  const defector = W.byId[r3.npcId];
  check(defector && defector.renegadeOrigin && defector.renegadeOrigin.sectName === 'ตระกูลกระบี่อุดร', 'Defector must carry renegadeOrigin metadata');
  check(W.sect.historicalPeople && W.sect.historicalPeople[defector.id], 'Defector must be snapshotted into W.sect.historicalPeople');

  const chrons = (W.world && W.world.chronicles) || [];
  check(chrons.some(e => e && e.reportFormat === 'DISCIPLINE_EDICT' && e.originCauseTh && e.actorChainTh && e.systemImpactTh && e.directorInsightTh), 'Living Chronicle must record 4D causal prisoner events');
}
console.log('  ✓ Verified Prisoner Ransom, Interrogation, Defector Recruitment & Living Chronicle');

// 6. Save/Load Round-Trip Determinism & UI Tab Verification
console.log('▶ [6/6] Testing v3.1.0 Save/Load Determinism & UI Sub-Tabs...');
{
  const W = SIM.create('v310-save-load-determinism');
  SECT.unlockAllOffices(W);
  SECT.capturePrisoner(W, { name: 'สายลับวังเหมันต์', sectId: 'S0', sectName: 'วังเหมันต์', realm: 2, power: 290 });
  for (let i = 0; i < 60; i++) SIM.tick(W);

  const raw = SIM.serialize(W);
  const loaded = SIM.deserialize(raw);
  check(loaded.sect.unlockSpecializedOffices === true, 'Save/Load must preserve unlockSpecializedOffices');
  check(loaded.sect.dungeon && loaded.sect.dungeon.prisoners.length === 1, 'Save/Load must preserve W.sect.dungeon prisoners');
  check(Array.isArray(loaded.sect.jurisdictionLog), 'Save/Load must preserve W.sect.jurisdictionLog');

  for (let i = 0; i < 40; i++) {
    SIM.tick(W);
    SIM.tick(loaded);
  }
  check(SIM.serialize(W) === SIM.serialize(loaded), 'Post-load simulation must remain 100% deterministic');

  G.W = W; UI.G = { W, R: {}, opts: {}, acc: 13, speed: 32 };
  UI.tab = 'posts';
  const postsHtml = UI.rSect();
  check(postsHtml.includes('6 ทำเนียบฝ่าย') && postsHtml.includes('คุกใต้ดิน'), 'UI.rSect posts tab must render 6 Directorates and Dungeon management');
}
console.log('  ✓ Verified v3.1.0 Save/Load Round-Trip Determinism & UI Tabs');

console.log(`\n✅ PASS: v310_autonomous_governance_and_peaks_sanctuary_suite (${assertions} assertions passed)`);
