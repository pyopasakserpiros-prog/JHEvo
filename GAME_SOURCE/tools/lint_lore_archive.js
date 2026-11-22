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

const BAD_MONTH_RE = /เดือน(แปดจันทร์เพ็ญ|แปดสารทกลาง|แปดกลางสารท|เจ็ดสารทต้น|เจ็ดต้นสารท|สี่คิมหันต์ต้น|สิบเหมันต์ต้น|สิบต้นเหมันต์|สิบสารทปลาย|สิบสารทลึก|เก้าปลายสารท|เก้าสารทลึก|สิบเอ็ดเหมันต์กลาง|สิบเอ็ดเหมันต์หนาว|ห้าคิมหันต์กลาง|ห้าสุริยันแผด|หกคิมหันต์เดือด|หกคิมหันต์ลึก|หกพิรุณสาด|สามปลายวสันต์)/g;
const RAW_CODE_PROSE_RE = /\b(ATLAS_DIMENSION_GATE|SPIRIT_FEAST_HEALER|MAT_TR_[A-Z0-9_]+|imperialTension|W\.day)\b|HP\s*\d+%/g;
const PROSE_KEYS = new Set([
  'narrativeTh', 'summaryTh', 'storyTh', 'descriptionTh', 'loreTh',
  'biographyTh', 'noteTh', 'verdictTh', 'hiddenTruthTh', 'orthodoxVerdictTh',
  'impactTh', 'aftermathTh', 'legacyTh'
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

  // 1. Check bad month strings
  const badM = src.match(BAD_MONTH_RE);
  if (badM) {
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
    // Check raw code tokens in prose fields
    (function walk(node) {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(walk); return; }
      for (const [prop, val] of Object.entries(node)) {
        if (typeof val === 'string' && PROSE_KEYS.has(prop)) {
          const hits = val.match(RAW_CODE_PROSE_RE);
          if (hits) errors.push(`${f} [${prop}]: raw game code leaked in prose: ${[...new Set(hits)].join(', ')}`);
        } else if (val && typeof val === 'object') {
          walk(val);
        }
      }
    })(book);
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
