#!/usr/bin/env node
'use strict';
/**
 * sync_lore_bundle.js — ซิงค์ไฟล์ Lore แยกทั้งหมด (44 บทมหากาพย์ภายใต้ GAME_SOURCE/data/lore_chronicle_*.js)
 * เข้าสู่บล็อกเฉพาะท้ายไฟล์ GAME_SOURCE/data/data_expansion.js
 * เพื่อให้ผู้พัฒนาแก้ไฟล์ Lore แยกได้อย่างอิสระเหมือนอ่านนิยาย โดยยังรักษาข้อบังคับ 40 <script> tags ครบ 100%
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const loreFiles = [
  // === 11 ปฐมบทหลัก (v3.8.3 Core Chronicles) ===
  'data/lore_chronicle_p1_antediluvian_and_cosmology.js',
  'data/lore_chronicle_e0_tianshu_pillar_sect.js',
  'data/lore_chronicle_p2_tiangu_heroes_and_hidden_relics.js',
  'data/lore_chronicle_e0_e1.js',
  'data/lore_chronicle_e1_e2_great_reunifier.js',
  'data/lore_chronicle_e26_yujing_sect_and_ink_moth.js',
  'data/lore_chronicle_e26_late_survivor_sects.js',
  'data/lore_chronicle_p3_middle_epochs_12_kingdoms.js',
  'data/lore_chronicle_e99_eve_of_balance.js',
  'data/lore_chronicle_p4_yunhe_treaty_and_six_fallen.js',
  'data/lore_chronicle_p5_present_epoch101_convergence.js',

  // === 23 มหากาพย์เชื่อมไทม์ไลน์ยุคที่ 2–94 (Books 12–34) ===
  'data/lore_chronicle_e2_late_broken_mandate_and_dragon_palms.js',
  'data/lore_chronicle_e3_e4_crimson_forges_and_sun_chariots.js',
  'data/lore_chronicle_e5_e8_clockwork_dynasty_and_bronze_golems.js',
  'data/lore_chronicle_e9_e10_beast_sovereign_empire_and_totem_clans.js',
  'data/lore_chronicle_e11_e14_emerald_plague_and_apothecary_war.js',
  'data/lore_chronicle_e15_e17_divine_faith_theocracy_and_pagoda_schism.js',
  'data/lore_chronicle_e18_e22_tide_voyagers_and_fog_edge.js',
  'data/lore_chronicle_e23_e25_imperial_literati_and_chess_warlords.js',
  'data/lore_chronicle_e27_e28_frost_moon_matriarchy_and_crystal_glacier.js',
  'data/lore_chronicle_e29_e34_transcendent_charter_and_oath_courts.js',
  'data/lore_chronicle_e35_e38_void_architects_and_pocket_citadels.js',
  'data/lore_chronicle_e39_e44_silent_blade_and_karma_monks.js',
  'data/lore_chronicle_e45_e46_grand_arena_empire_and_seven_weapons.js',
  'data/lore_chronicle_e47_e50_nether_eclipse_and_soul_lanterns.js',
  'data/lore_chronicle_e51_e53_dawn_of_middle_epochs_and_eight_desolations.js',
  'data/lore_chronicle_e54_e59_merchant_caravan_hegemony_and_salt_wars.js',
  'data/lore_chronicle_e60_e62_qiankun_shift_and_flying_knives.js',
  'data/lore_chronicle_e63_seven_days_of_jade_auction.js',
  'data/lore_chronicle_e64_e67_samsara_threads_and_forbidden_karma.js',
  'data/lore_chronicle_e68_e73_blood_moon_demon_court_and_sword_alliance.js',
  'data/lore_chronicle_e74_e77_ashura_blood_sea_and_commonwealth_twilight.js',
  'data/lore_chronicle_e78_e84_sky_citadel_and_dragon_veins.js',
  'data/lore_chronicle_e85_e94_dugu_sword_heart_and_ten_millennia_silence.js',

  // === 6 รวมเรื่องสั้นและสารานุกรมวิถีเจียงหู (Books 35–40) ===
  'data/lore_chronicle_anthology_culinary_and_spirit_taverns.js',
  'data/lore_chronicle_anthology_cursed_artifacts_and_taboo_vaults.js',
  'data/lore_chronicle_anthology_unsolved_mysteries_and_anomalies.js',
  'data/lore_chronicle_anthology_eccentric_hermits_and_rogues.js',
  'data/lore_chronicle_anthology_mythic_flora_and_spirit_ecology.js',
  'data/lore_chronicle_anthology_festivals_customs_and_martial_etiquette.js',

  // === 4 พิมพ์เขียวระบบประเพณี ประตูมิติ และวัฏจักรโลก (Books 41–44) ===
  'data/lore_chronicle_events_grand_martial_assemblies.js',
  'data/lore_chronicle_events_periodic_pocket_realms.js',
  'data/lore_chronicle_events_cosmic_tides_and_calamities.js',
  'data/lore_chronicle_events_markets_trials_and_sect_rites.js'
];

// Verify no unreferenced lore_chronicle_*.js files exist
const onDisk = fs.readdirSync(path.join(root, 'data'))
  .filter(f => f.startsWith('lore_chronicle_') && f.endsWith('.js'))
  .map(f => 'data/' + f);
const missingFromList = onDisk.filter(f => !loreFiles.includes(f));
if (missingFromList.length) {
  console.error('WARNING: Unlisted lore_chronicle files:', missingFromList);
  process.exit(1);
}

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
