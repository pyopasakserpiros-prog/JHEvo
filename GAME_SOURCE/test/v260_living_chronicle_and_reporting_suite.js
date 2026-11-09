'use strict';
/**
 * ============================================================================
 * JianghuSect 2 (JS2-v2.6.0) — Living Chronicle, Jianghu Reporting & News Filtering Suite
 * ============================================================================
 * Verifies:
 *  0. Core Lock, 40-Script Invariant, SIM.PATCH_VERSION = '2.6.0' & Schema Migration
 *  1. Real Producer -> Snapshot -> 12-Format Presenter Across Combat, Bottleneck, Craft & Governance
 *  2. Authoritative Fact Snapshot Truthfulness, Deceased/Renamed Historical Fallback & Rumor Labeling
 *  3. Periodic Sect Digest Accuracy (External Ledger vs Internal Transfers vs Player Spawns, Zero Double-Count)
 *  4. Separation of News Intake Preferences (Toast/Feed/Digest/Critical Policy/Unread) vs Archive Filters
 *  5. Milestone-Protected Bounded Retention, 100% RNG/Serialize Purity & XSS Escaping in UI
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const g = require('./load.js');

if (!g.document) {
  const els = {};
  g.document = {
    getElementById: id => els[id] || (els[id] = {
      id, innerHTML: '', textContent: '', value: '', style: { setProperty(){} }, dataset: {},
      scrollTop: 0,
      classList: { add(){}, remove(){}, toggle(){} },
      addEventListener(){},
      querySelector: () => null,
      querySelectorAll: () => [],
      getBoundingClientRect: () => ({ bottom: 120, top: 0, left: 0, right: 412, width: 412, height: 120 })
    }),
    querySelectorAll: () => [],
    createElement: () => ({
      width: 0, height: 0, style: {}, dataset: {}, className: '', textContent: '',
      remove(){},
      getContext: () => ({
        save(){}, restore(){}, scale(){}, translate(){}, rotate(){},
        fillRect(){}, strokeRect(){}, clearRect(){}, drawImage(){},
        beginPath(){}, closePath(){}, moveTo(){}, lineTo(){}, quadraticCurveTo(){}, bezierCurveTo(){},
        arc(){}, ellipse(){}, rect(){}, roundRect(){}, clip(){},
        fill(){}, stroke(){}, fillText(){}, strokeText(){}, setLineDash(){},
        measureText: t => ({ width: String(t || '').length * 7 }),
        createLinearGradient: () => ({ addColorStop(){} }),
        createRadialGradient: () => ({ addColorStop(){} })
      })
    })
  };
  g.window = g;
  g.performance = g.performance || { now: () => Date.now() };
  require('../js/render.js');
  require('../js/ui.js');
}

const { SIM, SECT, COMBAT, CULT, ECO, BN, EXPED, HC, UI } = g;
const ROOT = path.resolve(__dirname, '..');

console.log('============================================================================');
console.log('   JIANGHUSECT 2 (JS2-v2.6.0: LIVING CHRONICLE & JIANGHU REPORTING SUITE)   ');
console.log('============================================================================');

// ---------------------------------------------------------------------------
// [0/6] Core Lock, 40-Script Invariant, Version & Schema Compatibility
// ---------------------------------------------------------------------------
{
  const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
  const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  assert.strictEqual(hcSha, 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js must remain 100% byte-identical');
  assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
  assert.strictEqual(SIM.PATCH_VERSION, '2.6.0', 'SIM.PATCH_VERSION must be 2.6.0');
  assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '2.6.0-living-chronicle-and-reporting', 'SIM.SAVE_SCHEMA_VERSION must be 2.6.0-living-chronicle-and-reporting');

  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const scriptMatches = indexHtml.match(/<script\s+src="[^"]+"\s*><\/script>/g) || [];
  assert.strictEqual(scriptMatches.length, 40, 'index.html must preserve exact 40 <script> tags');

  // Verify backward-compatible hydration of a v2.5.0 / 2.4.0 save payload without newsPrefs
  const W0 = SIM.create('v260-compat-seed', { masterIdx: 0 });
  const snapObj = JSON.parse(SIM.serialize(W0));
  snapObj.patchVersion = '2.5.0';
  snapObj.schemaVersion = '2.4.0-tactical-composable-grand-dao';
  delete snapObj.sect.newsPrefs;
  delete snapObj.sect.digestHistory;
  const WRestored = SIM.deserialize(JSON.stringify(snapObj));
  assert.ok(WRestored.sect.newsPrefs && WRestored.sect.newsPrefs.preset === 'ALL', 'Deserializing older JS2 save hydrates default newsPrefs');
  assert.ok(Array.isArray(WRestored.sect.digestHistory), 'Deserializing older JS2 save initializes digestHistory');
  console.log('  ✓ [0/6] Core Lock, 40-Script Invariant, SIM.PATCH_VERSION = 2.6.0 & Save Hydration Verified');
}

// ---------------------------------------------------------------------------
// [1/6] Real Producer -> Fact Snapshot -> 12 Formats & Storyline Threading
// ---------------------------------------------------------------------------
{
  const W = SIM.create('v260-producers-seed', { masterIdx: 0 });
  const fmtKeys = Object.keys(EXPED.CHRONICLE_REPORT_FORMATS);
  assert.strictEqual(fmtKeys.length, 12, 'CHRONICLE_REPORT_FORMATS must provide 12 distinct formats including PERIODIC_SECT_DIGEST');
  assert.ok(EXPED.CHRONICLE_REPORT_FORMATS.PERIODIC_SECT_DIGEST, 'PERIODIC_SECT_DIGEST format must exist');

  // 1A. Combat producer -> buildFightChroniclePayload -> WAR_PAVILION_RECORD
  const [uA, uB] = W.npcs;
  const f = COMBAT.startFight(W, [uA.id], [uB.id], 'duel', { serious: false });
  f.state = 'fight';
  f.winner = 'A';
  uA.tac = uA.tac || {};
  uA.tac.interceptCount = 3;
  COMBAT.recordTacticalHighlight(W, f, 'BODYGUARD_INTERCEPT', HC.fullName(uA) + ' พุ่งเข้าขวางกระบวนท่าสังหาร');
  f.tac.stats.intercepts = 3;
  f.tac.stats.interrupts = 1;
  const cPayload = COMBAT.buildFightChroniclePayload(W, f);
  assert.ok(cPayload && typeof cPayload.summaryLineTh === 'string' && cPayload.summaryLineTh.length > 10, 'buildFightChroniclePayload must populate summaryLineTh');
  assert.ok(cPayload.mvp && cPayload.mvp.id === uA.id, 'buildFightChroniclePayload must identify MVP participant');
  f.over = true;
  COMBAT.conclude(W, f);

  const warChron = EXPED.recordChronicle(W, {
    category: 'BATTLE',
    reportFormat: 'WAR_PAVILION_RECORD',
    titleTh: 'ศึกประลองหน้าหอยุทธ์',
    storyTh: HC.fullName(uA) + ' ประลองยุทธ์เอาชนะ ' + HC.fullName(uB),
    consequenceTh: 'ยกระดับความชำนาญการคุ้มกันแนวหน้า',
    npcIds: [uA.id, uB.id],
    combatSummary: cPayload,
    allowDuplicate: true
  });
  const warPresented = EXPED.presentChronicleEntry(W, warChron);
  assert.strictEqual(warPresented.formatId, 'WAR_PAVILION_RECORD');
  assert.ok(warPresented.turningPointBodyTh.includes('คุ้มกัน') && warPresented.turningPointBodyTh.includes(HC.fullName(uA)), 'WAR_PAVILION_RECORD turning point highlights actual tactical counters and MVP');
  assert.ok(warPresented.numericDetails.some(d => d.labelTh.includes('Tactical Counters') && d.valueTh.includes('คุ้มกัน 3')), 'Numeric drawer includes verified tactical counter counts');

  // 1B. Bottleneck -> Pill Grant -> Breakthrough Continuing Storyline Thread
  const cultNpc = W.npcs[2];
  if (!cultNpc.cult) SIM.awaken(W, W.rng, cultNpc, 2);
  cultNpc.cult.stage = 2;
  cultNpc.cult.prog = CULT.threshold(cultNpc) + 10;
  cultNpc.cult.bn = { since: W.day, plan: null };
  BN.decide(W, cultNpc);
  const pillKey = BN.pillKey(cultNpc.cult);
  ECO.add(W, pillKey, 2);
  cultNpc.merit = 120;
  BN.daily(W);

  // Trigger breakthrough log on same NPC & stage
  W.log('breakthrough', cultNpc.h.name.given + ' ทะลวงสู่ ' + CULT.stageName(cultNpc) + ' สำเร็จ!', [cultNpc.id], {
    storyThreadId: 'thread:cult:' + cultNpc.id + ':2',
    storyThreadTitleTh: 'เส้นเรื่องการทะลวงด่านของ ' + HC.fullName(cultNpc),
    originCauseTh: 'ได้รับโอสถทะลวงด่านและสะสมความมั่นใจครบเกณฑ์',
    consequenceTh: 'ทะลวงด่านสำเร็จ',
    factDeltas: { chancePct: 82, meritDelta: 40 },
    promoteChronicle: true
  });

  const threads = EXPED.getStoryThreads(W, 'thread:cult:' + cultNpc.id + ':2');
  assert.strictEqual(threads.length, 1, 'Bottleneck + Pill + Breakthrough must group into a single continuing storyline thread');
  assert.ok(threads[0].eventCount >= 2, 'Cultivation storyline thread must link multiple sequential events');
  assert.ok(threads[0].statusTh.includes('คลี่คลายแล้ว'), 'Completed breakthrough storyline marks status as resolved');

  // 1C. Treasury Embezzlement Scandal Producer -> sectChronicle
  const treNpc = W.npcs[2];
  treNpc.embezzled = 150;
  SECT.exposeEmbezzle(W, treNpc, W.npcs[0]);
  const scandalChron = W.sect.sectChronicle.find(e => e.type === 'scandal');
  assert.ok(scandalChron && scandalChron.severity === 'CRITICAL', 'Embezzlement exposure is promoted to W.sect.sectChronicle as CRITICAL');
  assert.strictEqual(scandalChron.factDeltas.embezzledAmt, 150, 'Scandal chronicle preserves exact embezzled stone amount');
  assert.strictEqual(scandalChron.factDeltas.recoveredAmt, 90, 'Scandal chronicle preserves exact recovered stone amount (60%)');

  console.log('  ✓ [1/6] Producer -> Fact Snapshot -> 12 Formats & Continuing Storyline Threads Verified');
}

// ---------------------------------------------------------------------------
// [2/6] Snapshot Immutability, Renamed/Deceased/Buried Fallback & Rumor Labeling
// ---------------------------------------------------------------------------
{
  const W = SIM.create('v260-snapshot-seed', { masterIdx: 0 });
  const hero = W.npcs[1];
  if (!hero.cult) SIM.awaken(W, W.rng, hero, 2);
  hero.cult.stage = 2;
  const oldGiven = hero.h.name.given;
  const oldFullName = HC.fullName(hero);
  hero.why = [['ต้องการปกป้องศิษย์น้อง', 4.2]];

  const earlyChron = EXPED.recordChronicle(W, {
    category: 'BATTLE',
    titleTh: 'ศึกประลองของ ' + oldFullName,
    storyTh: oldFullName + ' ออกรับหน้าศึกด้วยตบะขั้น 2',
    npcIds: [hero.id],
    allowDuplicate: true,
    quiet: true
  });
  assert.strictEqual(earlyChron.factSnapshot.actorsAtEvent[0].fullName, oldFullName, 'Snapshot captures original name at event time');
  assert.strictEqual(earlyChron.factSnapshot.actorsAtEvent[0].stage, 2, 'Snapshot captures stage 2 at event time');
  assert.strictEqual(earlyChron.factSnapshot.actorsAtEvent[0].topWhyTh, 'ต้องการปกป้องศิษย์น้อง', 'Snapshot captures psychological utility reason at event time');

  // Now rename hero, promote stage to 6, and kill + bury hero (removing from W.npcs and W.byId)
  hero.h.name.given = 'กระบี่ไร้พ่าย';
  hero.cult.stage = 6;
  const newFullName = HC.fullName(hero);
  SIM.snapshotPerson(W, hero);
  AI.kill(W, hero, 'สละชีพปิดผนึกประตูมาร');
  // Simulate burial cleanup removing hero from W.npcs and W.byId
  SIM.snapshotPerson(W, hero, 'เสียชีวิตและฝังในสุสานสำนัก');
  W.graveyard.push(hero.id);
  W.npcs = W.npcs.filter(n => n.id !== hero.id);
  delete W.byId[hero.id];

  // Verify old chronicle snapshot was NOT overwritten by later rename/promotion/death!
  assert.strictEqual(earlyChron.factSnapshot.actorsAtEvent[0].fullName, oldFullName, 'Past event snapshot must NEVER be overwritten by later rename');
  assert.strictEqual(earlyChron.factSnapshot.actorsAtEvent[0].stage, 2, 'Past event snapshot must NEVER be overwritten by later stage promotion');
  assert.strictEqual(earlyChron.factSnapshot.actorsAtEvent[0].deadAtEvent, false, 'Past event snapshot must record that actor was alive at event time');

  // Verify W.sect.historicalPeople preserves both current and former names
  const hp = W.sect.historicalPeople[hero.id];
  assert.ok(hp && hp.dead === true, 'Historical person record marks deceased state');
  assert.strictEqual(hp.fullName, newFullName, 'Historical person record has final name');
  assert.ok(Array.isArray(hp.formerNames) && hp.formerNames.includes(oldFullName), 'Historical person record preserves formerNames');

  // Verify UI.openNpc opens hist_npc memorial view when NPC is no longer in W.byId
  UI.G = { W, R: { selected: null, focus(){}, zoomAt(){}, cam: { x: 0, y: 0, z: 1 } }, speed: 0, acc: 0, opts: {} };
  UI.openNpc(hero.id);
  assert.strictEqual(UI.sheet, 'hist_npc', 'Opening deceased/buried NPC opens hist_npc memorial sheet');
  const histHtml = UI.rHistoricalPerson();
  assert.ok(histHtml.includes(newFullName) && histHtml.includes(oldFullName), 'Historical person sheet displays both final name and former name');
  assert.ok(histHtml.includes('สละชีพปิดผนึกประตูมาร'), 'Historical person sheet displays cause of death');
  assert.ok(histHtml.includes('ศึกประลองของ'), 'Historical person sheet lists related chronicle events');

  // Verify unknown/missing NPC ID fallback does not crash
  UI.openNpc('n_nonexistent_ghost_999');
  assert.strictEqual(UI.sheet, 'hist_npc');
  const ghostHtml = UI.rHistoricalPerson();
  assert.ok(ghostHtml.includes('ไม่พบระเบียนข้อมูลปัจจุบัน'), 'Unknown NPC ID shows safe fallback message without fabricating data');

  // Verify Rumor epistemic status & disclaimer
  const rumorChron = EXPED.recordChronicle(W, {
    category: 'LEGEND',
    reportFormat: 'TAVERN_BALLAD',
    isRumor: true,
    unverified: true,
    titleTh: 'ข่าวลือกระบี่เซียนตกในหุบเขาหมอก',
    storyTh: 'นักเล่านิทานร่ำลือว่ามีแสงกระบี่พุ่งลงกลางหุบเขาเมื่อคืนพระจันทร์สีเลือด',
    allowDuplicate: true,
    quiet: true
  });
  const rumorPres = EXPED.presentChronicleEntry(W, rumorChron);
  assert.strictEqual(rumorPres.epistemicStatus, 'RUMOR', 'Tavern rumor entry has RUMOR epistemic status');
  assert.ok(rumorChron.factSnapshot.unknownsTh && rumorChron.factSnapshot.unknownsTh.includes('คำบอกเล่า'), 'Rumor snapshot includes explicit unverified disclaimer');

  console.log('  ✓ [2/6] Snapshot Immutability, Renamed/Buried Historical Fallback & Rumor Labeling Verified');
}

// ---------------------------------------------------------------------------
// [3/6] Periodic Sect Digest Accuracy (External vs Internal vs Player Spawns)
// ---------------------------------------------------------------------------
{
  const W = SIM.create('v260-digest-seed', { masterIdx: 0 });
  W.t = 10 * 1440;
  W.day = 10;
  W.sect.ledger = [];
  W.logs = [];

  const stonesBefore = W.sect.stones;
  // External income (+500) and external expense (-180)
  ECO.earn(W, 500, 'ขายโอสถส่วนเกินให้คาราวาน');
  ECO.pay(W, 180, 'ซื้อแร่เหล็กดำจากพ่อค้าเร่');

  // Internal transfers & player spawns (must NOT pollute external stoneIncome / stoneExpense!)
  const d0 = W.npcs[0], d1 = W.npcs[1];
  W.log('finance', '[มอบของรางวัล] เจ้าสำนักมอบโอสถให้ศิษย์', [d0.id, d1.id], { txKind: 'gift', itemId: 'grain', qty: 2 });
  W.log('shop', '[ซื้อสินค้า] ศิษย์แลกคุณูปการ 30 คป. ซื้อโอสถจากร้านสำนัก', [d1.id], { txKind: 'purchase', itemId: 'grain', qty: 1 });
  W.log('finance', 'ศิษย์ส่งมอบอุปกรณ์เข้าคลังแสง ได้ 45 คป.', [d1.id], { txKind: 'donation', itemId: 'EQ_TEST', qty: 1 });
  W.log('finance', '[เสกโดยผู้เล่น] เพิ่มศิลา ×999 เข้าคลัง', [d0.id], { txKind: 'player-spawn', itemId: 'stones', qty: 999 });

  const dig1 = EXPED.computePeriodDigest(W, { windowDays: 7 });
  assert.strictEqual(dig1.treasury.stoneIncome, 500, 'Digest stoneIncome counts only real external ledger income');
  assert.strictEqual(dig1.treasury.stoneExpense, 180, 'Digest stoneExpense counts only real external ledger expense');
  assert.strictEqual(dig1.treasury.netStones, 320, 'Digest netStones equals stoneIncome - stoneExpense (+320)');
  assert.strictEqual(dig1.treasury.closingStones, Math.round(stonesBefore + 320), 'Digest closingStones matches current treasury');
  assert.strictEqual(dig1.stockAndInternal.internalGiftsCount, 1, 'Digest counts internal gifts separately');
  assert.strictEqual(dig1.stockAndInternal.internalCpPurchasesCount, 1, 'Digest counts internal CP purchases separately');
  assert.strictEqual(dig1.stockAndInternal.internalDonationsCount, 1, 'Digest counts internal donations separately');
  assert.strictEqual(dig1.stockAndInternal.playerInterventionCount, 1, 'Digest counts player spawns/edits separately');

  // Re-computing or saving/loading must NEVER double-count
  const dig2 = EXPED.computePeriodDigest(W, { windowDays: 7 });
  const WReloaded = SIM.deserialize(SIM.serialize(W));
  const dig3 = EXPED.computePeriodDigest(WReloaded, { windowDays: 7 });
  assert.deepStrictEqual(dig1.treasury, dig2.treasury, 'Re-running computePeriodDigest does not double-count');
  assert.deepStrictEqual(dig1.treasury, dig3.treasury, 'Save/load round-trip preserves exact digest numbers without double-counting');

  console.log('  ✓ [3/6] Periodic Sect Digest Ledger Separation & Zero Double-Counting Verified');
}

// ---------------------------------------------------------------------------
// [4/6] News Intake Preferences vs Archive Reading Filters
// ---------------------------------------------------------------------------
{
  const W = SIM.create('v260-prefs-seed', { masterIdx: 0 });
  EXPED.ensureNewsSystem(W);

  // Switch preset to QUIET_DIGEST (toasts muted for routine/notable/major, critical still allowed under ALWAYS_TOAST)
  EXPED.applyNewsPreset(W, 'QUIET_DIGEST');
  assert.strictEqual(W.sect.newsPrefs.preset, 'QUIET_DIGEST');
  assert.strictEqual(W.sect.newsPrefs.toastEnabled, false);
  assert.strictEqual(W.sect.newsPrefs.criticalAlertPolicy, 'ALWAYS_TOAST');

  const routineLog = W.log('craft', 'ศิษย์ผลิตโอสถสำเร็จ', [W.npcs[0].id]);
  const majorLog = W.log('tournament', 'ประลองยุทธ์สำนักเริ่มขึ้น!', []);
  const criticalLog = W.log('raid', '⚠ กองทัพมารโลหิตกำลังบุกสำนัก!', []);

  assert.strictEqual(EXPED.shouldDeliverToast(W, routineLog), false, 'QUIET_DIGEST suppresses routine craft toast');
  assert.strictEqual(EXPED.shouldDeliverToast(W, majorLog), false, 'QUIET_DIGEST suppresses non-critical tournament toast');
  assert.strictEqual(EXPED.shouldDeliverToast(W, criticalLog), true, 'ALWAYS_TOAST critical policy delivers critical raid alert even in QUIET_DIGEST');

  // If user explicitly chooses STRICT_MUTE, even critical toast is suppressed while history is still recorded!
  W.sect.newsPrefs.criticalAlertPolicy = 'STRICT_MUTE';
  assert.strictEqual(EXPED.shouldDeliverToast(W, criticalLog), false, 'STRICT_MUTE honors user choice to mute even critical toasts');
  assert.ok(W.logs.includes(routineLog) && W.logs.includes(criticalLog), 'Muting notifications NEVER stops recording events into W.logs');
  assert.ok(W.sect.sectChronicle.some(e => e.id === criticalLog.id), 'Muting notifications NEVER stops recording into W.sect.sectChronicle');

  // Unread/read tracking: opening UI.rLog() must NOT silently mark unread chronicles as read
  const newChron = EXPED.recordChronicle(W, {
    category: 'SECRET_REALM',
    titleTh: 'ค้นพบวิหารเมฆาเร้นลับ',
    storyTh: 'คณะสำรวจพบทางเข้าวิหารโบราณ',
    allowDuplicate: true,
    quiet: true
  });
  assert.strictEqual(EXPED.isEntryUnread(W, newChron), true, 'Newly recorded chronicle starts unread');

  UI.G = { W, R: {}, speed: 0, acc: 0, opts: {} };
  UI.sheet = 'log';
  UI.tab = 'all';
  UI.logFilters = new Set(['all']);
  UI.rLog();
  assert.strictEqual(EXPED.isEntryUnread(W, newChron), true, 'Merely rendering UI.rLog() must NOT auto-mark unread items as read');

  // Marking single item read or marking all read works and persists across save/load
  UI.doAction('mark-news-read', newChron.id);
  assert.strictEqual(EXPED.isEntryUnread(W, newChron), false, 'mark-news-read marks the specific chronicle as read');

  // Archive filters vs Reset
  UI.doAction('world-chronicle-epistemic', 'RUMOR');
  let htmlRumorOnly = UI.rLog();
  assert.ok(!htmlRumorOnly.includes('ค้นพบวิหารเมฆาเร้นลับ'), 'Epistemic RUMOR filter hides VERIFIED chronicle in view');
  UI.doAction('reset-archive-filters');
  let htmlReset = UI.rLog();
  assert.ok(htmlReset.includes('ค้นพบวิหารเมฆาเร้นลับ'), 'Resetting archive filters restores visibility of recorded chronicle');

  const WLoaded = SIM.deserialize(SIM.serialize(W));
  assert.strictEqual(WLoaded.sect.newsPrefs.criticalAlertPolicy, 'STRICT_MUTE', 'newsPrefs persists across save/load');
  assert.strictEqual(EXPED.isEntryUnread(WLoaded, newChron), false, 'Read state persists across save/load');

  console.log('  ✓ [4/6] News Intake Preferences, Critical Policy, Unread Tracking & Archive Filters Verified');
}

// ---------------------------------------------------------------------------
// [5/6] Milestone-Protected Retention, 100% RNG/Serialize Purity & XSS Safety
// ---------------------------------------------------------------------------
{
  const W = SIM.create('v260-retention-purity-seed', { masterIdx: 0 });
  W.world.chronicles = [];
  W.chronicle = W.world.chronicles;

  // Record 5 early CRITICAL / SUCCESSION milestones on Day 1..5
  for (let i = 1; i <= 5; i++) {
    EXPED.recordChronicle(W, {
      day: i,
      t: i * 1440,
      category: 'SUCCESSION',
      severity: 'CRITICAL',
      isMilestone: true,
      titleTh: 'หมุดหมายผลัดแผ่นดินรุ่นที่ ' + i,
      storyTh: 'จารึกเหตุการณ์สำคัญห้ามสูญหาย #' + i,
      allowDuplicate: true,
      quiet: true
    });
  }

  // Flood with 225 routine dispatches on Day 10..234
  for (let i = 10; i < 235; i++) {
    EXPED.recordChronicle(W, {
      day: i,
      t: i * 1440,
      category: 'VISITOR',
      severity: 'ROUTINE',
      isMilestone: false,
      titleTh: 'ข่าวทั่วไปรายวัน #' + i,
      storyTh: 'พ่อค้าเดินทางผ่านด่าน #' + i,
      allowDuplicate: true,
      quiet: true
    });
  }

  assert.strictEqual(W.world.chronicles.length, 200, 'W.world.chronicles is strictly capped at 200 entries');
  for (let i = 1; i <= 5; i++) {
    assert.ok(
      W.world.chronicles.some(c => c.titleTh === 'หมุดหมายผลัดแผ่นดินรุ่นที่ ' + i),
      'Milestone #' + i + ' must be protected from eviction when routine chronicles overflow 200'
    );
  }
  assert.ok(W.world.chronicleTrimmedCount >= 30, 'chronicleTrimmedCount tracks evicted routine entries');

  // Test XSS Escaping in UI.rLog and UI.rHistoricalPerson
  const xssNpc = W.npcs[0];
  const origGiven = xssNpc.h.name.given;
  xssNpc.h.name.given = '<img src=x onerror=alert(1)>';
  EXPED.recordChronicle(W, {
    category: 'BATTLE',
    titleTh: '<script>alert("xss")</script>ศึกทดสอบความปลอดภัย',
    storyTh: 'เนื้อหาทดสอบ <b>bold</b> & "quotes"',
    npcIds: [xssNpc.id],
    allowDuplicate: true,
    quiet: true
  });

  UI.G = { W, R: {}, speed: 0, acc: 0, opts: {} };
  UI.sheet = 'log';
  UI.tab = 'all';
  UI.logFilters = new Set(['all']);

  // Verify 100% RNG & Serialization Purity across UI rendering & digest calculation
  const rngBefore = W.rng.getState().slice();
  const serBefore = SIM.serialize(W);

  const renderedLogHtml = UI.rLog();
  EXPED.computePeriodDigest(W, { windowDays: 30 });
  EXPED.getStoryThreads(W);

  const rngAfter = W.rng.getState().slice();
  const serAfter = SIM.serialize(W);
  assert.deepStrictEqual(rngAfter, rngBefore, 'Rendering UI.rLog, digest, and story threads must NEVER consume W.rng');
  assert.strictEqual(serAfter, serBefore, 'Rendering UI.rLog, digest, and story threads must NEVER mutate serialized world state');

  assert.ok(!renderedLogHtml.includes('<script>alert("xss")</script>'), 'XSS script tag in chronicle title must be escaped');
  assert.ok(!renderedLogHtml.includes('<img src=x onerror=alert(1)>'), 'XSS img tag in NPC name must be escaped');
  assert.ok(renderedLogHtml.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'), 'Escaped title entities are rendered safely');
  xssNpc.h.name.given = origGiven;

  console.log('  ✓ [5/6] Milestone-Protected Retention, 100% RNG/Serialize Purity & XSS Escaping Verified');
}

console.log('\n✅ ALL JS2-v2.6.0 LIVING CHRONICLE & JIANGHU REPORTING CHECKS PASSED!');
