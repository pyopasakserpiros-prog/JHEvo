'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const g = require('./load');

const ROOT = path.resolve(__dirname, '..');

function run() {
  console.log('=== JS2 v3.16.3 Path #59 (FALLEN_STAR_DEFIANCE), 6 Subpaths, Relics & Gate Suite ===');

  // 1. Catalog Integrity: 59 Paths, 364 Subpaths, 12 Techs, 4 Relics, 2 Transcendent Materials
  const pathCount = Object.keys(g.CULT.PATHS).length;
  assert.strictEqual(pathCount, 59, 'Total major paths must be 59, got ' + pathCount);
  const p59 = g.CULT.PATHS.FALLEN_STAR_DEFIANCE;
  assert(p59 && p59.nameTh === 'วิถีดาราคล้อยทวนชะตา', 'Path #59 FALLEN_STAR_DEFIANCE must be registered');
  assert.strictEqual(p59.subPaths.length, 6, 'Path #59 must have all 6 subpaths');
  assert.strictEqual(p59.stages.length, 9, 'Path #59 must have 9 stages');

  const totalSubs = Object.values(g.CULT.PATHS).reduce((acc, p) => acc + ((p && Array.isArray(p.subPaths)) ? p.subPaths.length : 0), 0);
  assert.strictEqual(totalSubs, 364, 'Total subpaths across 59 paths must be 364, got ' + totalSubs);

  const expectedTechIds = [
    'TECH_V3163_NINE_SKY_STAR_EYE', 'TECH_V3163_THREE_VERSE_BROKEN_BRIDGE',
    'TECH_V3163_CLOUD_STAIR_SPEAR', 'TECH_V3163_SILVER_ARMOR_DEBT',
    'TECH_V3163_WHITE_PEAR_CURTAIN', 'TECH_V3163_PURE_HAND_VOW',
    'TECH_V3163_THREE_THOUSAND_TABLETS', 'TECH_V3163_ONE_ARM_WAR_DRUM',
    'TECH_V3163_STAR_FURNACE_BLUEPRINT', 'TECH_V3163_PUPPET_SHADOW_ARMY',
    'TECH_V3163_SHADOW_UNDER_RIGHTEOUS_BANNER', 'TECH_V3163_ECLIPSE_VANISH_STEP'
  ];
  for (const tid of expectedTechIds) {
    assert((g.CULT.techById && g.CULT.techById[tid]) || (g.CULT.tech && g.CULT.tech(tid)), 'Tech must be indexed in CULT.techById: ' + tid);
  }

  const expectedRelics = [
    'REL_V3163_SHEATHLESS_STAR_SWORD',
    'REL_V3163_BLOOMING_PEAR_PIN',
    'REL_V3163_SILVER_SPEAR_CLOUD_STAIR',
    'REL_V3163_NOTCHED_BLADE_ANING'
  ];
  for (const rid of expectedRelics) {
    const it = g.JD.ITEMS.items.find(x => x && x.id === rid);
    assert(it && it.year10Locked === true, 'Relic must be registered with year10Locked: ' + rid);
  }
  const expectedMats = ['MAT_V3163_STAR_PUPPET_CORE', 'MAT_V3163_PEAR_ASH_DEW'];
  for (const mid of expectedMats) {
    const m = g.ECO.matById && g.ECO.matById[mid];
    assert(m && m.year10Locked === true, 'Material must be indexed in ECO.matById with year10Locked: ' + mid);
  }
  console.log('[PASS] 1. Catalog verified: 59 paths, 364 subpaths, 12 signature techs, 4 relics, 2 transcendent materials');

  // 2. Strict Pre-Year-10 Unlock Gate (Natural rolls locked!)
  const W = g.SIM.create('v3163_gate_check');
  const FSE = g.EXPED.FALLEN_STAR_EPIC;
  const st = FSE.ensure(W);
  assert.strictEqual(st.path59Unlocked, false, 'Path #59 must start locked on Day 1');
  assert.strictEqual(g.CULT.isPathUnlocked('FALLEN_STAR_DEFIANCE', W), false, 'CULT.isPathUnlocked must return false pre-Y10');
  assert.strictEqual(FSE.canDropYear10Relic(W, 'REL_V3163_SHEATHLESS_STAR_SWORD'), false, 'Year-10 relics locked pre-Y10');

  const npc = (W.npcs || []).find(n => n && !n.dead && n.cult && n.cult.path !== 'FALLEN_STAR_DEFIANCE');
  assert(npc, 'Need living NPC for gate check');
  const scoresPre = g.CULT.majorPathScores(npc, null, W);
  assert(!scoresPre.some(x => x.path === 'FALLEN_STAR_DEFIANCE'), 'majorPathScores must exclude FALLEN_STAR_DEFIANCE pre-Y10');
  for (let i = 0; i < 40; i++) {
    const pick = g.CULT.choosePath(npc, W.rng, null, W);
    assert.notStrictEqual(pick.path, 'FALLEN_STAR_DEFIANCE', 'choosePath must never naturally roll Path #59 pre-Y10');
  }
  for (let d = 0; d < 12; d++) {
    W.day = 360 + d;
    const sr = g.EXPED.spawnSecretRealm(W, null, { quiet: true });
    assert(sr && sr.templateId !== 'REALM_STAR_ASH_MOUND', 'REALM_STAR_ASH_MOUND must not naturally spawn pre-Y10');
  }
  console.log('[PASS] 2. Strict pre-Year-10 lock verified (0/40 natural path rolls, 0/12 natural realm rolls, relics locked)');

  // 3. Edit Hub / God-Sandbox Direct Grant on Day 1 (Works even while naturally locked!)
  npc.cult.path = 'FALLEN_STAR_DEFIANCE';
  npc.cult.sub = 'FALLEN_STAR_PRESSURE';
  npc.cult.stage = 3;
  assert(String(g.CULT.stageName(npc) || '').includes('สลักพันธะลงชีพจร'), 'Edit Hub assigned Path #59 stageName works on Day 1');
  const subInf = g.CULT.sub(npc) || g.CULT.subInfo(npc.cult.path, npc.cult.sub);
  assert(subInf && subInf.id === 'FALLEN_STAR_PRESSURE', 'Edit Hub assigned Path #59 subInfo works on Day 1');
  const scoresOwned = g.CULT.majorPathScores(npc, null, W);
  assert(scoresOwned.some(x => x.path === 'FALLEN_STAR_DEFIANCE'), 'NPC already granted Path #59 via Edit Hub can score it');
  console.log('[PASS] 3. Edit Hub / God-Sandbox direct grant works seamlessly even on Day 1');

  // 4. Post-Year-10 Unlock + Dynamic Star-Ash Mound Secret Realm Morphing
  const otherNpc = (W.npcs || []).find(n => n && !n.dead && n.id !== npc.id);
  st.path59Unlocked = true;
  st.starAshMoundState = 'BATTLEFIELD_CRATER';
  assert.strictEqual(g.CULT.isPathUnlocked('FALLEN_STAR_DEFIANCE', W), true, 'Path #59 unlocks after Year-10 resolution');
  assert.strictEqual(FSE.canDropYear10Relic(W, 'REL_V3163_SHEATHLESS_STAR_SWORD'), true, 'Year-10 relics unlock post-Y10');
  const scoresPost = g.CULT.majorPathScores(otherNpc, null, W);
  assert(scoresPost.some(x => x.path === 'FALLEN_STAR_DEFIANCE'), 'Post-Y10 majorPathScores opens Path #59 symmetrically');

  const realmWin = g.EXPED.spawnSecretRealm(W, 'REALM_STAR_ASH_MOUND', { quiet: true });
  assert(realmWin && realmWin.nameTh.includes('หุบเหวศิลาดาราคล้อย'), 'Victory mound morphs to หุบเหวศิลาดาราคล้อย');

  st.starAshMoundState = 'WHITE_PEAR_GROVE';
  const realmLoss = g.EXPED.spawnSecretRealm(W, 'REALM_STAR_ASH_MOUND', { quiet: true });
  assert(realmLoss && realmLoss.nameTh.includes('ป่าสาลี่ขาวกลางเถ้าดารา'), 'Defeat/Pear-Smoke mound morphs to ป่าสาลี่ขาวกลางเถ้าดารา');
  console.log('[PASS] 4. Post-Year-10 unlock & Star-Ash Mound morphing (หุบเหวศิลาดาราคล้อย <-> ป่าสาลี่ขาวกลางเถ้าดารา) verified');

  // 5. Exact 40 <script> Tags Lock Check
  const idxHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const scriptCount = (idxHtml.match(/<script\b[^>]*src=/g) || []).length;
  assert.strictEqual(scriptCount, 40, 'index.html must preserve exact 40 <script> tags');
  console.log('[PASS] 5. Exact 40 <script> tags lock preserved');

  console.log('ALL 5/5 CHECKS PASSED — JS2 v3.16.3 Path #59, Relics, Realm & Gate verified!');
}

run();
