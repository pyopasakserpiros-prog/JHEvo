#!/usr/bin/env node
'use strict';
/**
 * sync_lore_bundle.js — ซิงค์ไฟล์ Lore แยกทั้งหมด (104 บทมหากาพย์ภายใต้ GAME_SOURCE/data/lore_chronicle_*.js)
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
  'data/lore_chronicle_events_markets_trials_and_sect_rites.js',

  // === 46 คัมภีร์ตำนานชุดใหม่ v3.8.6 (Books 45–90: Prehistory, Sects, Fallen Clans, Multi-Format, Gaps, Continental Origins & Turning Points) ===
  'data/lore_chronicle_aftermath_daren_commonwealth_exiles.js',
  'data/lore_chronicle_aftermath_e26_ink_moth_and_azure_brush.js',
  'data/lore_chronicle_aftermath_tianshu_remnants_and_seven_scrolls.js',
  'data/lore_chronicle_beasts_point_of_view_six_sovereign_bloodlines.js',
  'data/lore_chronicle_continental_crises_low_sky_and_double_voice.js',
  'data/lore_chronicle_demon_paths_and_heretic_saints.js',
  'data/lore_chronicle_e13_e17_birth_of_well_and_canal_accord.js',
  'data/lore_chronicle_e18_e22_lighthouse_keepers_of_fog_coast.js',
  'data/lore_chronicle_e19_e21_turning_point_fog_sea_closure_pivot.js',
  'data/lore_chronicle_e22_e24_donghuang_sima_to_ji_transition.js',
  'data/lore_chronicle_e30_e39_forging_of_three_great_empires.js',
  'data/lore_chronicle_e32_e36_oathbreakers_and_iron_bridges.js',
  'data/lore_chronicle_e40_e43_lantern_monks_and_frost_famine.js',
  'data/lore_chronicle_e42_e44_turning_point_forging_and_alchemy_revolution.js',
  'data/lore_chronicle_e44_e54_continental_currency_and_spirit_standard.js',
  'data/lore_chronicle_e4_e12_grand_canal_and_river_reshaping.js',
  'data/lore_chronicle_e50_e52_turning_point_dawn_of_middle_epochs.js',
  'data/lore_chronicle_e55_e56_eve_of_red_salt_and_smuggler_roads.js',
  'data/lore_chronicle_e65_e97_great_migrations_and_five_buffer_origins.js',
  'data/lore_chronicle_e69_e72_eclipse_doctors_and_mirror_wards.js',
  'data/lore_chronicle_e6_e9_turning_point_codification_of_55_paths.js',
  'data/lore_chronicle_e74_e82_turning_point_death_of_republican_dream.js',
  'data/lore_chronicle_e80_e83_the_silent_epoch_and_ash_river.js',
  'data/lore_chronicle_e85_e97_the_three_way_bell_chain.js',
  'data/lore_chronicle_e89_e95_seven_epochs_of_paper_emperors.js',
  'data/lore_chronicle_e98_e100_turning_point_eve_of_epoch101.js',
  'data/lore_chronicle_five_fallen_ascendant_clans.js',
  'data/lore_chronicle_forgotten_academies_and_lost_arts.js',
  'data/lore_chronicle_format_bounty_boards_and_infamous_rogues.js',
  'data/lore_chronicle_format_folklore_songs_proverbs_and_taboos.js',
  'data/lore_chronicle_format_forbidden_zone_containment_dossiers.js',
  'data/lore_chronicle_format_item_whispers_thirty_relics.js',
  'data/lore_chronicle_format_jianghu_detective_casebook.js',
  'data/lore_chronicle_format_letters_wills_and_last_testaments.js',
  'data/lore_chronicle_format_naturalist_field_journal_spirit_anomalies.js',
  'data/lore_chronicle_format_ruin_inscriptions_and_broken_steles.js',
  'data/lore_chronicle_format_treaties_ledgers_and_martial_law.js',
  'data/lore_chronicle_format_unreliable_historians_three_versions.js',
  'data/lore_chronicle_parallel_epoch100_secret_wars_before_dawn.js',
  'data/lore_chronicle_parallel_middle_epochs_shadow_underworld.js',
  'data/lore_chronicle_prehistory_three_forgotten_ages.js',
  'data/lore_chronicle_prince14_donghuang_genius_bloodline.js',
  'data/lore_chronicle_seams_of_the_realm_six_bridges.js',
  'data/lore_chronicle_sect_three_ascensions_ten_epochs.js',
  'data/lore_chronicle_sect_two_tribulations_softened_stone.js',
  'data/lore_chronicle_sects_of_epoch101_nineteen_pillars.js',

  // === 6 คัมภีร์ตำนานชุดใหม่ v3.9.2 (Books 91–96: Golden Tiangu, Three Empires Shadow, 7 Middle Kingdoms, Epoch 101 Scene, Black Ledger & Mortal Almanac) ===
  'data/lore_chronicle_b91_golden_tiangu_and_outer_empires.js',
  'data/lore_chronicle_b92_three_empires_shadow_continuity.js',
  'data/lore_chronicle_b93_seven_middle_kingdoms_and_heroes.js',
  'data/lore_chronicle_b94_epoch101_five_buffers_and_sect_masters.js',
  'data/lore_chronicle_b95_black_ledger_and_neutral_charter.js',
  'data/lore_chronicle_b96_mortal_almanac_faiths_and_refugees.js',

  // === 8 คัมภีร์ตำนานชุดใหม่ v3.9.3 (Books 97–104: Yunhe Survey, Breath Relay, Epoch 1 Anatomy, Bloodless War, Living Economy A-D, Two Witnesses, 12 Shards E101, Shadow Market & Ash City) ===
  'data/lore_chronicle_b97_yunhe_survey_and_nine_benches.js',
  'data/lore_chronicle_b98_breath_relay_pavilion.js',
  'data/lore_chronicle_b99_epoch1_anatomy_and_unpermitted_dead.js',
  'data/lore_chronicle_b100_court_vs_jianghu_bloodless_war.js',
  'data/lore_chronicle_b101_epoch101_living_economy_dossiers.js',
  'data/lore_chronicle_b102_two_reincarnated_witnesses.js',
  'data/lore_chronicle_b103_twelve_shards_ancients_and_beasts_e101.js',
  'data/lore_chronicle_b104_shadow_market_and_ash_city.js',
  'data/lore_chronicle_b105_grand_periodic_festivals.js',
  'data/lore_chronicle_b106_fallen_star_pear_blossom.js'
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
