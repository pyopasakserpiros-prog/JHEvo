#!/usr/bin/env node
'use strict';

/**
 * JS2 Automated Lore Linter (Canon Lock Validator)
 * Checks all GAME_SOURCE/data/lore_chronicle_*.js files for:
 *  1. Valid JS syntax & export to JD.LORE_CHRONICLE_*
 *  2. Standard 12 Thai month names (matching SIM.CALENDAR.MONTH_NAMES_TH)
 *  3. Strict eraId <-> worldYear alignment across all EVENTS
 *  4. Zero raw game code tokens leaked inside Thai narrative prose
 *  5. Zero duplicate IDs across the entire Lore Archive
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataDir = path.join(__dirname, '..', 'data');
const files = fs.readdirSync(dataDir)
  .filter(f => f.startsWith('lore_chronicle_') && f.endsWith('.js'))
  .sort();

const VALID_ERAS = new Set([
  'ERA_0_PRIMORDIAL_BEFORE',
  'ERA_1_TIANGU_WAR',
  'ERA_2_POST_TIANGU_CHAOS',
  'ERA_3_MIDDLE_EPOCHS',
  'ERA_4_THREE_EMPIRES_BALANCE',
  'ERA_5_PRESENT_CONVERGENCE'
]);

const VALID_MONTHS = [
  'เดือนอ้ายวสันต์', 'เดือนยี่บุปผา', 'เดือนสามวสันต์ปลาย',
  'เดือนสี่คิมหันต์แรก', 'เดือนห้าสุริยัน', 'เดือนหกพิรุณร้อน',
  'เดือนเจ็ดสารทแรก', 'เดือนแปดใบไม้ร่วง', 'เดือนเก้าสารทปลาย',
  'เดือนสิบเหมันต์แรก', 'เดือนสิบเอ็ดน้ำค้างแข็ง', 'เดือนสิบสองเหมันต์ลึก'
];
const MONTH_SEASON_RE = /เดือน(อ้าย|ยี่|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า|สิบเอ็ด|สิบสอง|สิบ)(วสันต์|บุปผา|คิมหันต์|สุริยัน|พิรุณ|สารท|ใบไม้ร่วง|เหมันต์|น้ำค้าง|ลมหนาว|ฝน|กลาง|ต้น|ปลาย|จันทร์เพ็ญ)[ก-๙]*/g;
const RAW_CODE_PROSE_RE = /\b(LEG_|MAT_|ATLAS_|REL_|EQ_|RES_|KW_|M2_|ECO2_MAT_|CONST_|ITEM190_|FACT_28_|TOWN_YH_|SIM\.|W\.day|CULT\.|EXPED\.)[A-Z0-9_.]*\b|HP\s*\d+%/g;
const NON_PROSE_TH_KEYS = new Set([
  'possibleLocationTh', 'pathsTh', 'phase1Th', 'phase2Th', 'phase3Th',
  'phaseMechanicsTh', 'loreEffectTh', 'gameplayHookTh', 'counterplayTh',
  'coreCounterplaySummaryTh', 'recommendedCountersTh', 'signatureDropsAndRewardsTh',
  'specialEasterEggHookTh', 'loreCounterplayHookTh', 'componentsTh',
  'cultivationPathTh', 'signaturePathsTh', 'signaturePathTh', 'linkedPathTh',
  'corePathsTh', 'signatureTreasuresTh', 'realmCeilingRuleTh', 'epoch101HookTh',
  'powerCeilingNoteTh', 'peacefulResolutionHookTh'
]);

function canonicalEra(wy) {
  if (wy < -10000) return 'ERA_0_PRIMORDIAL_BEFORE';
  if (wy <= 0) return 'ERA_1_TIANGU_WAR';
  if (wy <= 50000) return 'ERA_2_POST_TIANGU_CHAOS';
  if (wy <= 99180) return 'ERA_3_MIDDLE_EPOCHS';
  if (wy <= 100000) return 'ERA_4_THREE_EMPIRES_BALANCE';
  return 'ERA_5_PRESENT_CONVERGENCE';
}

const errors = [];
const warnings = [];
const seenIds = new Map();
let totalEvents = 0;

for (const f of files) {
  const fp = path.join(dataDir, f);
  const src = fs.readFileSync(fp, 'utf8');

  // 1. Check non-standard Thai month-season strings
  const monthHits = src.match(MONTH_SEASON_RE) || [];
  const badM = monthHits.filter(m => !VALID_MONTHS.some(vm => m.startsWith(vm)));
  if (badM.length) {
    errors.push(`${f}: non-standard Thai month(s): ${[...new Set(badM)].join(', ')}`);
  }

  // 2. Load in sandboxed VM
  const ctx = { JD: {}, window: {}, globalThis: {} };
  ctx.window.JD = ctx.JD;
  ctx.globalThis.JD = ctx.JD;
  try {
    vm.runInNewContext(src, ctx, { filename: f });
  } catch (e) {
    errors.push(`${f}: JS syntax/runtime error: ${e.message}`);
    continue;
  }

  const keys = Object.keys(ctx.JD).filter(k => k.startsWith('LORE_CHRONICLE_'));
  if (!keys.length) {
    errors.push(`${f}: did not export any JD.LORE_CHRONICLE_* object`);
    continue;
  }

  for (const k of keys) {
    const book = ctx.JD[k];
    // Walk events
    if (Array.isArray(book.EVENTS)) {
      for (const ev of book.EVENTS) {
        totalEvents++;
        if (ev.id) {
          if (seenIds.has(ev.id)) {
            errors.push(`${f}: duplicate event id ${ev.id} (also in ${seenIds.get(ev.id)})`);
          } else {
            seenIds.set(ev.id, f);
          }
        }
        if (typeof ev.worldYear === 'number' && ev.eraId) {
          const want = canonicalEra(ev.worldYear);
          if (!VALID_ERAS.has(ev.eraId)) {
            errors.push(`${f} [${ev.id}]: invalid eraId "${ev.eraId}" (expected ${want} for worldYear=${ev.worldYear})`);
          } else if (ev.eraId !== want) {
            errors.push(`${f} [${ev.id}]: eraId "${ev.eraId}" mismatches worldYear=${ev.worldYear} (expected ${want})`);
          }
        }
      }
    }
    // Check raw code tokens in all Thai prose (*Th) fields
    (function walk(node, prop) {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(x => walk(x, prop)); return; }
      for (const [prop2, val] of Object.entries(node)) {
        if (typeof val === 'string' && prop2.endsWith('Th') && !NON_PROSE_TH_KEYS.has(prop2)) {
          const hits = val.match(RAW_CODE_PROSE_RE);
          if (hits) errors.push(`${f} [${prop2}]: raw game code leaked in prose: ${[...new Set(hits)].join(', ')}`);
        } else if (val && typeof val === 'object') {
          walk(val, prop2);
        }
      }
    })(book, 'root');
  }
}

console.log(`====================================================`);
console.log(`   JS2 LORE ARCHIVE LINTER (${files.length} books, ${totalEvents} events)`);
console.log(`====================================================`);
console.log(`Errors:   ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
if (errors.length) {
  console.log('\nFirst 30 errors:');
  errors.slice(0, 30).forEach(e => console.log('  [ERR]', e));
  process.exit(1);
}
console.log('\n✅ ALL LORE CANON LINT CHECKS PASSED!');
