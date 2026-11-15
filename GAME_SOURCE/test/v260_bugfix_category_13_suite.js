/* ═══════════════════════════════════════════════════════════════════════════
   v260_bugfix_category_13_suite.js
   Comprehensive Regression Suite for Category 13 (13 & 13B: Worldbuilding,
   Cosmology, Diegetic Stage Naming, Conditional Upper-World Descent Law,
   Pantheon Veil Suppression, Subpath Boilerplate Scrubbing, Tiangu Canon Sync
   & Terminology Polish) + Category 01 Cross-Verification
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';

const assert = require('assert');
const win = require('./load');
require('../js/render');
require('../js/ui');

function log(msg) { console.log('  ✓ ' + msg); }

(function run() {
  console.log('\n═══ Running v260_bugfix_category_13_suite.js ═══');
  const { HC, JD, CULT, STATS, SECT, AI, COMBAT, MAP, SIM, EXPLORE, EXPED, VC, MARTIAL, UI } = win;

  // 1. Core Lock & Law 1: Diegetic "Mortal Aspirational Naming" Canon (Zero Stage/Path Renaming)
  assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
  assert.strictEqual(Object.keys(CULT.PATHS).length, 43, 'All 43 Major Paths preserved');
  assert(CULT.PATHS.XIAN.stages[8].nameTh.includes('เซียนสวรรค์'), 'XIAN Stage 9 title preserved per Law 1');
  assert(CULT.PATHS.BODY.stages.some(function(st){ return st.nameTh && st.nameTh.indexOf('อมตะ') >= 0; }), 'BODY Stage title preserved per Law 1');
  assert(typeof CULT.LOWER_WORLD_CEILING_LORE_TH === 'string' && CULT.LOWER_WORLD_CEILING_LORE_TH.includes('โลกเบื้องล่าง'), 'Diegetic Lower-World ceiling lore note defined');
  log('1. [LAW-1 & LORE-CEIL-01] Stage/Path titles preserved & Diegetic Mortal Aspirational Naming lore verified');

  // 2. Law 2: Conditional Upper-World Descent & Crippled-Cultivation Stranding Exception
  assert(CULT.UPPER_WORLD_DESCENT_LAW && CULT.UPPER_WORLD_DESCENT_LAW.canDescend === true, 'Upper-World Descent Law defined');
  assert.strictEqual(CULT.UPPER_WORLD_DESCENT_LAW.constraints.length, 3, '3 strict descent constraints defined');
  assert.strictEqual(CULT.UPPER_WORLD_DESCENT_LAW.permanentStrandingException.id, 'CRIPPLED_CULTIVATION_STRANDED', 'Crippled-cultivation stranding exception defined');
  assert(SECT.CELESTIAL_TRIBULATION.LORE_NOTE_TH && SECT.CELESTIAL_TRIBULATION.LORE_NOTE_TH.includes('เซียนเดินดิน'), 'Celestial Tribulation Lower-World Apex lore note defined');
  assert(SECT.IMMORTAL_TOMB.DESCENT_LORE_TH && SECT.IMMORTAL_TOMB.DESCENT_LORE_TH.includes('ตบะร่วงหล่น'), 'Immortal Tomb crippled-descender lore defined');
  for (const t of Object.values(SECT.IMMORTAL_TOMB.TOMB_TEMPLATES)) {
    assert(t.originLoreTh && t.originLoreTh.length > 20, `Tomb ${t.id} has originLoreTh`);
  }
  assert(EXPED.ANOMALY_TEMPLATES.GROTTO_ANCIENT_IMMORTAL.descTh.includes('ขงหมิง #21'), 'Ancient Immortal Grotto cites crippled-descender Kong Ming #21');
  assert(EXPLORE.REALM_GATE_LORE_TH && EXPLORE.REALM_GATE_LORE_TH.includes('ผู้เฝ้าประตูไร้หน้า (#25)'), 'Realm Gate Mirage Echo-Pocket lore cites Faceless Gatekeeper #25');
  log('2. [LAW-2, LORE-TOMB-02 & LORE-COSMOS-02] Upper-World Descent Law, Crippled-Stranding Tombs & Mirage Echo Gate verified');

  // 3. [LORE-POWER-03 & LORE-MYTH-03] Pantheon Veil Suppression, Donghuang Disambiguation & In-Universe Framing
  const pan = CULT.HIGHER_REALMS_PANTHEON;
  const sc8 = pan.getManifestationScale(8);
  assert(sc8.veilSuppressionNoteTh && sc8.veilSuppressionNoteTh.includes('ม่านกั้นภพกดทับ'), 'Manifestation scale explains <100% Veil suppression');
  assert.strictEqual(pan.DEITIES.DONGHUANG_TAIYI.nameTh, 'มหาเทพไท่อี้สุริยันบรรพกาล (องค์ไท่อี้)', 'Donghuang Taiyi disambiguated from Donghuang Empire');
  assert.strictEqual(pan.REALMS.OLYMPUS_TARTARUS.nameTh, 'เทวสภาอัสนีโพ้นม่านดารา', 'Olympus framed in-universe as Star-Court');
  assert.strictEqual(pan.REALMS.DUAT_NETHER_SANDS.nameTh, 'มหาพิภพสุริยันทรายทองดูอัต', 'Duat framed in-universe');
  assert.strictEqual(pan.ABYSSAL_REALMS.SEVEN_SINS_INFERNO.nameTh, 'ขุมอเวจีทูตสวรรค์ตกสวรรค์นอกม่านภพ', 'Infernal realm framed in-universe');
  assert.strictEqual(pan.ABYSSAL_REALMS.HUNDRED_YOKAI_REALM.nameTh, 'แดนขบวนร้อยอสูรรัตติกาลหมู่เกาะบูรพา', 'Yokai realm framed in-universe as Eastern Archipelago');
  assert(CULT.DOCTRINAL_CONTRAST_LORE && CULT.DOCTRINAL_CONTRAST_LORE.GOD && CULT.DOCTRINAL_CONTRAST_LORE.DIVINE_CONDUITS, 'GOD vs DIVINE_* doctrinal contrast defined');
  log('3. [LORE-POWER-03 & LORE-MYTH-03] Pantheon Veil suppression, Donghuang disambiguation & in-universe framing verified');

  // 4. [LORE-SUBPATH-04] Subpath Boilerplate, Raw English Enums & Real-Earth Historical Clashes Scrubbed
  let subCount = 0;
  const rawElemKeys = ['EARTH_METAL', 'WATER_ICE', 'LIGHT_YANG', 'YIN_SHADOW', 'WOOD_LIFE', 'BLOOD_DEMON'];
  for (const p of Object.values(CULT.PATHS)) {
    for (const sp of (p.subPaths || [])) {
      subCount++;
      const resTh = String(sp.resourceTh || '');
      const wkTh = String(sp.weaknessTh || '');
      assert(!resTh.includes('สร้างสรรค์พิเศษ v2.0.8'), `${sp.id} resourceTh must not contain patch note`);
      assert(!resTh.includes('ม่อจื่อ') && !resTh.includes('เหยียนซือ') && !resTh.includes('ตระกูลถัง') && !resTh.includes('หวงตี้เน่ยจิง'), `${sp.id} resourceTh must not contain Earth historical clash: ${resTh}`);
      for (const ek of rawElemKeys) {
        assert(!resTh.includes(ek), `${sp.id} resourceTh must not contain raw English enum ${ek}: ${resTh}`);
      }
      assert(!wkTh.includes('ต้องควบคุมเกจประจำวิถี ('), `${sp.id} weaknessTh must not use robotic gauge tutorial boilerplate: ${wkTh}`);
      assert(!wkTh.includes('ต้องอาศัยการวางจังหวะท่วงท่าและตราประทับให้สอดคล้องกับศาสตราประจำสาย'), `${sp.id} weaknessTh must not use generic copy-pasted boilerplate`);
    }
  }
  assert.strictEqual(subCount, 286, 'Audited all 286 subpaths');
  log('4. [LORE-SUBPATH-04] All 286 subpaths scrubbed of patch notes, raw English enums, Earth names & robotic boilerplate');

  // 5. [LORE-CANON-01, LORE-IDENTITY-05 & LORE-TERM-06] 27 Relics Canon Sync, 19 Sects Empire Spheres, World Crises & Martial Sobriquets
  for (const eq of VC.LEGENDARY_EQUIPMENT) {
    assert(String(eq.literarySource || '').includes('บันทึกพงศาวดารเทียนกู่'), `${eq.id} literarySource must cite Tiangu Chronicle`);
    assert(!String(eq.literarySource || '').includes('Jin Yong') && !String(eq.literarySource || '').includes('Gu Long'), `${eq.id} literarySource must not cite real-world novels`);
    assert(!String(eq.nameTh || '').includes('ตีสุนัข'), `${eq.id} nameTh must use Tiangu canon name`);
    assert(!String(eq.chineseName || '').includes('芭蕉') && !String(eq.chineseName || '').includes('乾坤'), `${eq.id} chineseName scrubbed of stray Hanzi`);
  }
  const validSpheres = new Set(['BEIMING', 'DONGHUANG', 'XIRONG', 'BUFFER_INDEPENDENT']);
  for (const s of EXPED.CANONICAL_SECTS) {
    assert(validSpheres.has(s.empireSphere), `Sect ${s.codeId} must have valid empireSphere (got ${s.empireSphere})`);
  }
  assert(EXPED.WORLD_LORE && EXPED.WORLD_LORE.ERAS.length === 4 && Object.keys(EXPED.WORLD_LORE.EMPIRES).length === 4, 'EXPED.WORLD_LORE exposes 4 Eras and 4 Empires');
  assert(SECT.WORLD_CRISIS.CRISIS_ARCS.CRISIS_DEMON_BLADE_ECLIPSE.chapters[0].descTh.includes('เฮ่อเหลียนม่อ (#19)'), 'Demon Blade Crisis linked to Helian Mo #19');
  assert(SECT.WORLD_CRISIS.CRISIS_ARCS.CRISIS_MARTIAL_ALLIANCE_THRONE.chapters[0].descTh.includes('เป่ยหมิง ตงหวง และซีหรง'), 'Alliance Throne Crisis linked to Three Empires');

  const W = SIM.create('cat13-test');
  const master = W.byId[W.sect.masterId];
  master.cult.stage = 5;
  const title = CULT.ensureDaoTitle(master);
  assert(typeof title === 'string' && title.includes('ฉายา'), 'Stage 3+ cultivator receives Martial Sobriquet on npc.ext.daoTitle: ' + title);
  log('5. [LORE-CANON-01, LORE-IDENTITY-05 & LORE-TERM-06] 27 Relics, 19 Sects Empire Spheres, World Crises & Martial Sobriquets verified');

  // 6. [CAT-01 POLISH] Track Effective Stage Cap, Subpath Traits Unlock & GOD Faith Lifecycle
  const nov = W.npcs[1];
  nov.cult.path = 'XIAN';
  nov.cult.sub = 'SWORD_IMMORTAL';
  nov.cult.stage = 1;
  nov.cult.track = CULT.initTrack('SWORD_IMMORTAL', 8, W.day);
  assert(CULT.effectiveTechStage(nov) <= 2, 'Stage 1 disciple with track.ordinal=8 must have effectiveTechStage <= 2');
  const t7Relic = VC.LEGENDARY_WEAPONS[0];
  assert.strictEqual(MARTIAL.gearUsable(nov, t7Relic), false, 'Stage 1 disciple cannot equip Tier-7 Divine Relic via track ordinal');

  // GOD faith lifecycle: low faith penalty & stage gate check
  nov.cult.path = 'GOD';
  nov.cult.sub = 'WAR_DEITY';
  nov.cult.stage = 2;
  nov.ext = nov.ext || {};
  nov.ext.divineFaith = 10;
  W.sect.rep = -20;
  const gateSt = CULT.godStageGateStatus(nov, W);
  assert.strictEqual(Boolean(gateSt && gateSt.passed), false, 'GOD stage 3 gate blocks breakthrough when faith/reputation are collapsed');
  log('6. [CAT-01 POLISH] Track effectiveTechStage cap, Tier-7 Relic gate, and GOD faith lifecycle verified');

  console.log('═══ ALL Category 13 & Category 01 Cross-Audit Checks Passed! ═══\n');
})();
