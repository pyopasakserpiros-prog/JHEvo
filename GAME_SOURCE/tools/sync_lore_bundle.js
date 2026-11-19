#!/usr/bin/env node
'use strict';
/**
 * sync_lore_bundle.js — ซิงค์ไฟล์ Lore แยก (GAME_SOURCE/data/lore_chronicle_e0_e1.js)
 * เข้าสู่บล็อกเฉพาะท้ายไฟล์ GAME_SOURCE/data/data_expansion.js
 * เพื่อให้ผู้พัฒนาแก้ไฟล์ Lore แยกได้อย่างอิสระเหมือนอ่านนิยาย โดยยังรักษาข้อบังคับ 40 <script> tags ครบ 100%
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const loreFiles = [
  'data/lore_chronicle_e0_e1.js'
];
const targetPath = path.join(root, 'data/data_expansion.js');
const START_MARK = '\n/* === LORE_CHRONICLE_BUNDLE_START (auto-synced by tools/sync_lore_bundle.js) === */\n';
const END_MARK = '\n/* === LORE_CHRONICLE_BUNDLE_END === */\n';

let target = fs.readFileSync(targetPath, 'utf8');
const sIdx = target.indexOf(START_MARK.trim());
if (sIdx !== -1) {
  const eIdx = target.indexOf(END_MARK.trim(), sIdx);
  if (eIdx !== -1) {
    target = target.slice(0, sIdx).trimEnd() + '\n';
  }
}

let bundle = START_MARK;
for (const rel of loreFiles) {
  const full = path.join(root, rel);
  const src = fs.readFileSync(full, 'utf8');
  bundle += `// --- source: ${rel} ---\n` + src.trim() + '\n';
}
bundle += END_MARK;

fs.writeFileSync(targetPath, target.trimEnd() + '\n' + bundle, 'utf8');
console.log(`Synced ${loreFiles.length} standalone lore file(s) into data/data_expansion.js (${bundle.length} bytes)`);
