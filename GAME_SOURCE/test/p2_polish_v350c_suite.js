'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const load = require('./load.js');
const g = typeof load === 'function' ? load() : (load.loadGame ? load.loadGame() : load);

const { SIM, CULT, ECO, WILD, EXPED, MARTIAL: M } = g;

console.log('=== JS2 v3.5.0c Phase C — P2 Polish & GitHub Release Suite ===');

const W = SIM.create('v350c-p2-seed');
assert.strictEqual(SIM.PATCH_VERSION, '3.5.0c', 'PATCH_VERSION must be 3.5.0c');
assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '3.5.0c-release-polish', 'SAVE_SCHEMA_VERSION must be 3.5.0c-release-polish');

// 1. WILD.awardSpiritBeastCrucible calls CULT.gain
{
  const n = W.npcs[0];
  const progBefore = n.cult.prog || 0;
  const gain = WILD.awardSpiritBeastCrucible(W, n, { tier: 4, name: 'อสูรทดสอบ' });
  assert(gain > 0, 'awardSpiritBeastCrucible must return positive expBonus');
  assert((n.cult.prog || 0) > progBefore, 'awardSpiritBeastCrucible must actually grant cultivation progress via CULT.gain');
  console.log('PASS [P2-WILD-1] WILD.awardSpiritBeastCrucible grants CULT.gain (+' + gain + ')');
}

// 2. WILD.finish must NOT resurrect/capture an already-dead beast on tameIntent
{
  const n = W.npcs[1];
  const deadBeast = { id: 'b_dead_test', name: 'หมาป่าตายแล้ว', dead: true, captured: false, hp: 0, hpMax: 200, tier: 2, wild: true, zone: 'west', drops: [] };
  const f = { id: 999, kind: 'wild', serious: true, A: [n.id], B: [deadBeast.id], ctx: { tameIntent: true, forceTame: true } };
  WILD.finish(W, f, deadBeast, 'A');
  assert.strictEqual(deadBeast.captured, false, 'WILD.finish must NOT capture an already-dead beast');
  assert.strictEqual(deadBeast.dead, true, 'WILD.finish must NOT resurrect an already-dead beast');
  console.log('PASS [P2-WILD-2] WILD.finish does not resurrect dead beast on tameIntent');
}

// 3. ECO.maintainUpkeepGear initializes lastUpkeepDay on newly forged gear after Day 15
{
  const n = W.npcs[1];
  const upkTpl = Object.values(ECO.itemById).find(x => x && x.id && x.id.startsWith('EQ_V320_') && x.upkeepMatId);
  assert(upkTpl, 'Need an upkeep EQ_V320 item');
  const freshGear = Object.assign({}, upkTpl, { uid: 'fresh_day20_gear', dur: 100, maxDur: 100, dormant: false });
  delete freshGear.lastUpkeepDay;
  n.equip = { [freshGear.slot]: freshGear };
  W.day = 25;
  ECO.maintainUpkeepGear(W, n);
  assert.strictEqual(freshGear.dormant, false, 'Newly forged upkeep gear on Day 25 must NOT immediately go dormant');
  assert.strictEqual(freshGear.lastUpkeepDay, 25, 'Newly forged upkeep gear must initialize lastUpkeepDay to current W.day');
  console.log('PASS [P2-ECO-1] Newly forged upkeep gear initializes lastUpkeepDay without instant dormancy');
}

// 4. STORY-SYNC-03 & STORY-SYNC-07 event references aligned
{
  const expSrc = fs.readFileSync(path.join(__dirname, '../js/expedition.js'), 'utf8');
  assert(expSrc.includes('(อีเวนต์ #10)'), 'STORY-SYNC-03 must reference Event #10');
  assert(expSrc.includes('(อีเวนต์ #8)'), 'STORY-SYNC-07 must reference Event #8');
  const evt12 = EXPED.EXTERNAL_WORLD_EVENTS.BY_ID['EXT_EVT_12_REFUGEE_AMBUSH'];
  assert.strictEqual(evt12.storySync, null, 'Event #12 must not carry mismatched STORY-SYNC-07 tag');
  console.log('PASS [P2-LORE-1] STORY-SYNC-03 (#10) & STORY-SYNC-07 (#8) cross-references aligned');
}

// 5. All GitHub release docs from 3.1.0 through 3.5.0c present
{
  const repoRoot = path.join(__dirname, '../..');
  const requiredDocs = [
    'CHANGELOG_JS2_V310_TO_V350C.md',
    'START_HERE_FOR_AI.md',
    'README.md',
    'PATCH_REPORTS/LIVING_LORE_JS2_V3_1_0.md',
    'PATCH_REPORTS/EQUIPMENT_EXPANSION_JS2_V3_2_0.md',
    'PATCH_REPORTS/TACTICAL_SIXPATHS_JS2_V3_3_0.md',
    'PATCH_REPORTS/WORLD_EVENTS_JS2_V3_4_0.md',
    'PATCH_REPORTS/PATCH_JS2_V350A_P0_HARDENING_REPORT.md',
    'PATCH_REPORTS/PATCH_JS2_V350B_P1_HARDENING_REPORT.md',
    'PATCH_REPORTS/PATCH_JS2_V350C_P2_POLISH_RELEASE_REPORT.md',
    'docs/handovers/JS2_V3_6_0_NEXT_PATCH_HANDOFF.md'
  ];
  for (const rel of requiredDocs) {
    assert(fs.existsSync(path.join(repoRoot, rel)), 'Missing release doc: ' + rel);
  }
  console.log('PASS [P2-DOCS-1] All 3.1.0-3.5.0c GitHub release docs verified (' + requiredDocs.length + ' files)');
}

console.log('✅ ALL JS2 v3.5.0c PHASE C P2 POLISH & RELEASE CHECKS PASSED!');
