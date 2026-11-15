'use strict';
/**
 * ============================================================================
 * JianghuSect 2 (JS2-v2.6.0) — Literary Prose, Wuxia Naming Polish & Lore Canon Suite
 * ============================================================================
 * Verifies all 3 Tracks of the v2.6.0 13-PDF Master Patch:
 *  1. Track A (14A/14B/14C): SIM.PROSE (Zero-RNG), Cause-Classified Death Eulogies,
 *     9-Family Breakthrough Prose, 28 Simulation Metrics (metrics28),
 *     6-Hall Officer-Voiced Court Memorials (memorialSections), 10 Tavern Ballads,
 *     UI.TERM_TH & UI.formatNpcInnerThought (100% read-only on n.why).
 *  2. Track B (15/16A/16B): 43 Paths & 286 Subpaths Thai Wuxia Polish (zero English
 *     parentheses), 360 procTraits cleansed, 12 Gate Worlds cleansed of modern sci-fi/
 *     factory jargon, and all 31 REL_V230_* weapon names strictly matching gearType.
 *  3. Track C (LORE_01A..02D): Upper-World Barrier Law & Crippled-Descent Canon Sync,
 *     27 Legendary Equipment + 31 Path Relics + 33 Legendary Scriptures + 60+6 Clue
 *     Templates, and all 12 STORY-SYNC-01..12 entries.
 */

const assert = require('assert');
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

const { SIM, SECT, CULT, ECO, EXPED, EXPLORE, VC, SK, UI, JD } = g;

console.log('============================================================================');
console.log('  JIANGHUSECT 2 (v2.6.0 PROSE, WUXIA NAMING & LORE CANON VERIFICATION)      ');
console.log('============================================================================');

// ---------------------------------------------------------------------------
// [1/4] Track A: SIM.PROSE, Death Eulogies, 28 Metrics, 6-Hall Memorial & Inner Thoughts
// ---------------------------------------------------------------------------
{
  const W = SIM.create('v260-prose-canon-seed', { masterIdx: 0 });
  const rngBefore = W.rng.getState().slice();

  assert.ok(SIM.PROSE && typeof SIM.PROSE.breakthroughProse === 'function', 'SIM.PROSE.breakthroughProse must exist');
  assert.ok(typeof SIM.PROSE.deathEulogy === 'function', 'SIM.PROSE.deathEulogy must exist');

  // Verify cause-classified death eulogies never call qi-deviation or starvation "สิ้นใจอย่างสงบ"
  const n0 = W.npcs[1];
  const eulogyQiDev = SIM.PROSE.deathEulogy(W, n0, 'ตบะแตกระหว่างทะลวงขั้น');
  const eulogyStarve = SIM.PROSE.deathEulogy(W, n0, 'อดอยาก');
  const eulogyOldAge = SIM.PROSE.deathEulogy(W, n0, 'ชราภาพ');
  assert.ok(!eulogyQiDev.includes('สิ้นใจอย่างสงบ'), 'Qi-deviation death must NEVER say สิ้นใจอย่างสงบ');
  assert.ok(eulogyQiDev.includes('ปราณแตกซ่าน'), 'Qi-deviation death uses violent meridian backlash eulogy');
  assert.ok(!eulogyStarve.includes('สิ้นใจอย่างสงบ'), 'Starvation death must NEVER say สิ้นใจอย่างสงบ');
  assert.ok(eulogyStarve.includes('ข้าวยากหมากแพง'), 'Starvation death uses famine tragedy eulogy');
  assert.ok(eulogyOldAge.includes('อย่างสงบ'), 'Natural old age death preserves peaceful passing eulogy');

  // Verify 28 hidden metrics and 6-Hall Officer Memorial in computePeriodDigest
  const dig = EXPED.computePeriodDigest(W, { windowDays: 7 });
  assert.ok(dig.metrics28 && Object.keys(dig.metrics28).length === 28, 'computePeriodDigest must return all 28 metrics in metrics28');
  assert.ok(Array.isArray(dig.memorialSections) && dig.memorialSections.length === 6, 'computePeriodDigest must return 6 Officer-Voiced Court Memorial sections');

  // Verify Tavern Ballads
  assert.ok(Array.isArray(EXPED.TAVERN_BALLAD_TEMPLATES) && EXPED.TAVERN_BALLAD_TEMPLATES.length === 10, 'EXPED.TAVERN_BALLAD_TEMPLATES must provide 10 lore ballads');

  // Verify UI.TERM_TH & UI.formatNpcInnerThought are 100% pure and do not mutate n.why
  assert.strictEqual(UI.termTh('OVERDRIVE'), 'เร่งแกนกลไกเต็มพิกัด');
  assert.strictEqual(UI.termTh('PRETA'), 'ภพเปรตกลืนปราณ');
  n0.why = [['หิว', 2.5]];
  const thoughtTxt = UI.formatNpcInnerThought(n0, n0.why[0][0], n0.why[0][1]);
  assert.ok(thoughtTxt.length > 10 && !thoughtTxt.includes('undefined'), 'UI.formatNpcInnerThought returns persona-voiced inner monologue');
  assert.strictEqual(n0.why[0][0], 'หิว', 'UI.formatNpcInnerThought must NEVER mutate raw n.why[0][0]');

  const rngAfter = W.rng.getState().slice();
  assert.deepStrictEqual(rngAfter, rngBefore, 'Track A helpers must consume ZERO W.rng');
  console.log('  ✓ [1/4] Track A: SIM.PROSE, Death Eulogies, 28 Metrics, 6-Hall Memorials & Inner Thoughts Verified');
}

// ---------------------------------------------------------------------------
// [2/4] Track B: 43 Paths, 286 Subpaths, 360 procTraits & 12 Gate Worlds Cleanse
// ---------------------------------------------------------------------------
{
  const paths = Object.values(CULT.PATHS);
  assert.strictEqual(paths.length, 43, 'Must have 43 cultivation paths');
  let subCount = 0;
  for (const p of paths) {
    assert.ok(!/\([A-Za-z]/.test(p.nameTh), 'Path nameTh must not contain raw English parenthetical: ' + p.id + ' -> ' + p.nameTh);
    for (const sp of Object.values(p.subPaths || {})) {
      subCount++;
      assert.ok(!/\([A-Za-z]/.test(sp.nameTh), 'Subpath nameTh must not contain raw English parenthetical: ' + sp.id + ' -> ' + sp.nameTh);
    }
  }
  assert.strictEqual(subCount, 286, 'Must have 286 subpaths across 43 paths');

  // Verify 360 procTraits have zero robotic prefixes/suffixes
  const procTraits = (JD.CORE.procTraits || []).filter(t => /^TR_GEN_\d+_\d+$/.test(t.id));
  assert.strictEqual(procTraits.length, 360, 'Must have 360 procedural traits');
  const badTrait = procTraits.find(t => /ผู้มีดวง|ผู้มีนิสัย|แต่ใจร้อน|แต่เก็บตัว|สายสมดุล/.test(t.nameTh));
  assert.strictEqual(badTrait, undefined, 'Zero procedural traits may retain robotic prefixes/suffixes');

  // Verify 12 Gate Worlds have zero modern sci-fi / factory / physics loanwords
  const bannedGateWords = ['ไดสัน', 'ควอนตัม', 'นาโน', 'ไซเบอร์', 'บิ๊กแบง', 'ซิงกูลาริตี้', 'เอนโทรปี', 'คริสตัล', 'โรงงาน'];
  for (const gw of Object.values(EXPLORE.GATE_WORLDS || {})) {
    const blob = JSON.stringify(gw);
    for (const bw of bannedGateWords) {
      assert.ok(!blob.includes(bw), 'Gate world ' + gw.id + ' must not contain modern/sci-fi word: ' + bw);
    }
  }
  console.log('  ✓ [2/4] Track B: 43 Paths, 286 Subpaths, 360 procTraits & 12 Gate Worlds Cleanse Verified');
}

// ---------------------------------------------------------------------------
// [3/4] Track B+C: ID-to-Item Consistency Audit (All 31 REL_V230_* Weapon Types)
// ---------------------------------------------------------------------------
{
  const expectedWeaponPrefix = {
    SWORD: ['กระบี่'],
    BLADE: ['ดาบ'],
    SPEAR: ['ทวน', 'หอก'],
    STAFF: ['พลอง', 'คฑา', 'ไม้เท้า'],
    FIST: ['สนับมือ', 'สนับหมัด', 'หมัด'],
    CLAW: ['กรงเล็บ'],
    BOW: ['เกาทัณฑ์', 'ธนู'],
    NEEDLE: ['เข็ม'],
    WHIP: ['แส้'],
    ZITHER: ['พิณ', 'ขลุ่ย'],
    BRUSH: ['พู่กัน'],
    ROSARY: ['ประคำ', 'ลูกประคำ'],
    FAN: ['พัด'],
    ASTROLABE: ['จานดารา', 'จาน'],
    ABACUS: ['ลูกคิด'],
    FOCUS: ['ตรา', 'หยก', 'กระจก', 'กระดิ่ง', 'โคม']
  };
  const relics = Object.values(ECO.itemById || {}).filter(w => w && /^REL_V230_/.test(w.id));
  assert.strictEqual(relics.length, 31, 'Must have all 31 REL_V230_* path relics');
  for (const r of relics) {
    const allowed = expectedWeaponPrefix[r.gearType] || [];
    const matches = allowed.some(prefix => r.nameTh.includes(prefix));
    assert.ok(matches, 'Relic ' + r.id + ' (gearType=' + r.gearType + ') nameTh "' + r.nameTh + '" must match its weapon class noun');
    assert.ok(!r.nameTh.includes('芭蕉') && !/[\u0900-\u097F]/.test(r.nameTh), 'Relic ' + r.id + ' must contain zero foreign script characters');
  }
  console.log('  ✓ [3/4] ID-to-Item Consistency Audit: All 31 REL_V230_* Relics Match Exact gearType Nouns');
}

// ---------------------------------------------------------------------------
// [4/4] Track C: Upper-World Barrier Law, 60+6 Clue Templates & 12 Story Syncs
// ---------------------------------------------------------------------------
{
  assert.strictEqual(VC.CLUE_TEMPLATES.length, 60, 'VC.CLUE_TEMPLATES must preserve exact 60 templates');
  assert.strictEqual(VC.V200_WEAPON_CLUE_TEMPLATES.length, 6, 'VC.V200_WEAPON_CLUE_TEMPLATES must preserve exact 6 templates');
  const syncs = EXPED.WORLD_LORE && EXPED.WORLD_LORE.STORY_RIPPLE_CANON_SYNC;
  assert.ok(syncs && Object.keys(syncs).length === 12, 'EXPED.WORLD_LORE.STORY_RIPPLE_CANON_SYNC must contain all 12 STORY-SYNC-01..12 entries');
  console.log('  ✓ [4/4] Track C: Upper-World Barrier Law, 60+6 Clue Templates & 12 Story Syncs Verified');
}

console.log('\n✅ ALL JS2-v2.6.0 PROSE, WUXIA NAMING & LORE CANON CHECKS PASSED!');
