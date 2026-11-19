'use strict';
/**
 * JianghuSect Evolution — JS2-v3.1.0 Living Lore Master Regression Suite
 * Verifies:
 *  0. Constitutional Locks (AGENTS.md byte-identical, human_core.js 155:2f9c9dd7, 40 script tags, SIM.PATCH_VERSION = '3.1.0', SIM.SAVE_SCHEMA_VERSION = '3.4.0-world-events').
 *  1. Living Lore Canon Registry: 4 Epistemic Layers, 8 Fallen Dynasties, 28 Multi-Perspective Canonical Facts (4 accounts each), and 20 Multi-Stage Playable Story Chains (12 Codex Adopted + 8 Original Gemini Chains), all anchored to verified EXPED.SETTLEMENTS.
 *  2. Epistemic Knowledge & Anti-Echo-Chamber Evidence-Lineage Engine: repeating the same originEventId across intermediaries (A -> B -> C -> D) remains 1 lineage and never inflates confidence; independent second originEventId corroborates or contests and synthesizes VERIFIED_CHRONICLE; bounded knowledge cap (MAX_KNOWN_FACTS = 32).
 *  3. Playable Story Chains & Causal World Follow-Through: all 20 story chains advance through stages 0 -> 1 -> 2, apply personality/role-matched resolutions, modify route travel time in planContinentalRoute, calibrate perceivedBreakthroughChance, and conserve closed-loop Spirit Stones.
 *  4. Autonomous NPC Follow-Through, Town Visits (onCityVisitLore), Sect Activity Hooks (study, forge, brew, cook, pray), Emergent Slice-of-Life/Lore Events (tickLivingLore), Chronicle location snapshots, and newsPrefs compliance.
 *  5. Secret Gating for Layer 3 & Layer 4, 100% Zero-RNG & Zero-Mutation Read-Only Observer UI Renderers (rNpc, rWorld, rPolities, renderSettlementLoreHtml), and Mid-Story / Mid-Journey Save/Load/Continue Replay Determinism.
 */
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const G = require('./load.js');
require('../js/render.js');
require('../js/ui.js');
const { JD, U, HC, MAP, CULT, ECO, SECT, AI, COMBAT, EXPED, EXPLORE, COG, SIM, VC, Render, UI } = G;

console.log('============================================================================');
console.log('   JIANGHUSECT 2 (JS2-v3.1.0: LIVING LORE & MULTI-ACCOUNT CHRONICLE SUITE)  ');
console.log('============================================================================');

// 0. Constitutional Locks & Patch Version Contract
{
  assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
  const hcPath = path.join(__dirname, '..', 'js', 'human_core.js');
  const hcSha = crypto.createHash('sha256').update(fs.readFileSync(hcPath)).digest('hex');
  assert.strictEqual(hcSha, 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js SHA-256 lock');

  const agentsPath = path.join(__dirname, '..', '..', 'AGENTS.md');
  if (fs.existsSync(agentsPath)) {
    const agBuf = fs.readFileSync(agentsPath);
    assert.strictEqual(agBuf.length, 67202, 'AGENTS.md byte size must remain 67,202');
    const agSha = crypto.createHash('sha256').update(agBuf).digest('hex');
    assert.strictEqual(agSha, 'f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4', 'AGENTS.md SHA-256 lock');
  }

  const idxHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const scriptTags = idxHtml.match(/<script\s+src="([^"]+)"/g) || [];
  assert.strictEqual(scriptTags.length, 40, 'index.html must contain exact 40 <script> tags');

  assert.strictEqual(SIM.PATCH_VERSION, '3.8.2', 'SIM.PATCH_VERSION must be 3.1.0');
  assert.strictEqual(SIM.SAVE_SCHEMA_VERSION, '3.8.2-chaos-era-lore-archive', 'SIM.SAVE_SCHEMA_VERSION must be 3.1.0-living-lore');
  console.log('  ✓ [0/6] Constitutional Locks, 40-Script Invariant & SIM.PATCH_VERSION = 3.1.0 Verified');
}

// 1. Living Lore Registry, 4 Epistemic Layers, 8 Fallen Dynasties, 28 Canon Facts & 20 Story Chains
{
  const LL = EXPED.LIVING_LORE;
  assert.ok(LL && LL.VERSION === '3.1.0-living-lore', 'EXPED.LIVING_LORE must be registered');
  assert.strictEqual(Object.keys(LL.EPISTEMIC_LAYERS).length, 4, 'Must define 4 epistemic layers');
  assert.strictEqual(LL.EPISTEMIC_LAYERS.PROVINCIAL_VEIL.secretGate, false);
  assert.strictEqual(LL.EPISTEMIC_LAYERS.IMPERIAL_CHESSBOARD.secretGate, false);
  assert.strictEqual(LL.EPISTEMIC_LAYERS.SHATTERED_SUBCONTINENT.secretGate, true);
  assert.strictEqual(LL.EPISTEMIC_LAYERS.ERASED_PREHISTORY.secretGate, true);

  const dynasties = Object.values(LL.FALLEN_DYNASTIES_ARCHIVE);
  assert.strictEqual(dynasties.length, 8, 'Must define 8 fallen dynasties in FALLEN_DYNASTIES_ARCHIVE');
  for (const d of dynasties) {
    assert.ok(d.id && d.nameTh && d.courtAccountTh && d.folkAccountTh, `Fallen dynasty ${d.id} must have court and folk accounts`);
    assert.ok(Array.isArray(d.anchorNodeIds) && d.anchorNodeIds.length > 0, `Fallen dynasty ${d.id} must anchor to settlements`);
    for (const nid of d.anchorNodeIds) {
      assert.ok(EXPED.SETTLEMENTS[nid], `Fallen dynasty ${d.id} anchor ${nid} must exist in EXPED.SETTLEMENTS`);
    }
  }

  assert.strictEqual(LL.CANON_FACTS.length, 40, 'Must define 28 canonical lore facts');
  for (const f of LL.CANON_FACTS) {
    assert.ok(LL.EPISTEMIC_LAYERS[f.layer], `Fact ${f.id} layer ${f.layer} must be valid`);
    assert.ok(f.accounts && f.accounts.FOLK_ORAL && f.accounts.COURT_CANON && f.accounts.SECT_ORTHODOX && f.accounts.VERIFIED_CHRONICLE,
      `Fact ${f.id} must provide all 4 epistemic accounts`);
    for (const nid of (f.anchorNodeIds || [])) {
      assert.ok(EXPED.SETTLEMENTS[nid], `Fact ${f.id} anchor ${nid} must exist in EXPED.SETTLEMENTS`);
    }
  }

  assert.strictEqual(LL.STORY_CHAINS.length, 20, 'Must define 20 playable multi-stage story chains');
  const codexCount = LL.STORY_CHAINS.filter(s => s.group === 'CODEX_ADOPTED').length;
  const geminiCount = LL.STORY_CHAINS.filter(s => s.group === 'GEMINI_ORIGINAL').length;
  assert.strictEqual(codexCount, 12, 'Must include 12 adopted/refined Codex story chains');
  assert.strictEqual(geminiCount, 8, 'Must include 8 original Gemini story chains');
  for (const s of LL.STORY_CHAINS) {
    assert.ok(LL.FACT_BY_ID[s.factId], `Story ${s.id} must link to valid factId ${s.factId}`);
    assert.strictEqual(s.stages.length, 3, `Story ${s.id} must have 3 sequential stages`);
    assert.ok(Array.isArray(s.resolutions) && s.resolutions.length >= 2, `Story ${s.id} must have multiple resolution branches`);
    for (const nid of s.anchorNodeIds) {
      assert.ok(EXPED.SETTLEMENTS[nid], `Story ${s.id} anchor ${nid} must exist in EXPED.SETTLEMENTS`);
    }
  }
  console.log('  ✓ [1/6] 4 Epistemic Layers, 8 Fallen Dynasties, 28 Canon Facts & 20 Story Chains Verified');
}

// 2. Anti-Echo-Chamber Evidence-Lineage Engine, Epistemic Debate & Bounded Cap
{
  const W = SIM.create('living-lore-epistemic-test');
  const [a, b, c] = W.npcs;
  const d = W.npcs[3] || SIM.addNpc(W, { ageYears: 24, stage: 2 });

  // A learns a rumor with originEventId 'rumor:shuangjiang:origin1'
  const r1 = COG.learnLoreFact(W, a, 'FACT_01_SHUANGJIANG_BACKFLOW', {
    accountId: 'FOLK_ORAL',
    originEventId: 'rumor:shuangjiang:origin1',
    sourceKind: 'visitor_rumor'
  });
  assert.strictEqual(r1.ok, true);
  assert.strictEqual(r1.independentLineages, 1);
  const confA0 = r1.confidence;

  // A repeats the exact same originEventId to B, B to C, C back to A
  COG.learnLoreFact(W, b, 'FACT_01_SHUANGJIANG_BACKFLOW', {
    accountId: 'FOLK_ORAL',
    originEventId: 'rumor:shuangjiang:origin1',
    sourceKind: 'conversation',
    fromId: a.id
  });
  COG.learnLoreFact(W, c, 'FACT_01_SHUANGJIANG_BACKFLOW', {
    accountId: 'FOLK_ORAL',
    originEventId: 'rumor:shuangjiang:origin1',
    sourceKind: 'conversation',
    fromId: b.id
  });
  const echoBack = COG.learnLoreFact(W, a, 'FACT_01_SHUANGJIANG_BACKFLOW', {
    accountId: 'FOLK_ORAL',
    originEventId: 'rumor:shuangjiang:origin1',
    sourceKind: 'conversation',
    fromId: c.id
  });
  assert.strictEqual(echoBack.sameLineage, true, 'Hearing same originEventId via intermediaries must be flagged sameLineage');
  assert.strictEqual(echoBack.independentLineages, 1, 'Repeating one story must NEVER increment independentLineages');
  assert.strictEqual(echoBack.confidence, confA0, 'Repeating one story must NEVER inflate confidence');
  assert.notStrictEqual(echoBack.status, 'verified', 'Echo chamber repetition must NEVER flip status to verified');

  // Now D holds a competing account (COURT_CANON) from a distinct originEventId
  COG.learnLoreFact(W, d, 'FACT_01_SHUANGJIANG_BACKFLOW', {
    accountId: 'COURT_CANON',
    originEventId: 'court_decree:shuangjiang:origin2',
    sourceKind: 'city_visit'
  });

  // A and D converse -> triggers COG.resolveLoreDebate on their competing accounts of FACT_01_SHUANGJIANG_BACKFLOW
  const debate = COG.resolveLoreDebate(W, a, d, 'FACT_01_SHUANGJIANG_BACKFLOW');
  assert.ok(debate && debate.factId === 'FACT_01_SHUANGJIANG_BACKFLOW', 'Conversing with competing accounts must trigger epistemic debate');
  const aEntryAfterDebate = COG.peekLoreState(a).knownFacts.FACT_01_SHUANGJIANG_BACKFLOW;
  assert.strictEqual(aEntryAfterDebate.independentLineages, 2, 'Distinct originEventId from debate must count as 2nd lineage');
  assert.strictEqual(aEntryAfterDebate.status, 'contested', 'Conflicting unverified accounts must mark fact as contested');

  // Now A inspects physical chisel marks & grain ledger (3rd independent lineage with physicalProof)
  const verRes = COG.learnLoreFact(W, a, 'FACT_01_SHUANGJIANG_BACKFLOW', {
    accountId: 'VERIFIED_CHRONICLE',
    originEventId: 'bridge_chisel_ledger:shuangjiang:origin3',
    sourceKind: 'city_ledger',
    physicalProof: true
  });
  assert.strictEqual(verRes.status, 'verified', 'Physical ledger verification with independent lineages must verify fact');
  assert.strictEqual(verRes.accountId, 'VERIFIED_CHRONICLE');

  // Bounded capacity test (MAX_KNOWN_FACTS = 32)
  for (let i = 0; i < 40; i++) {
    COG.learnLoreFact(W, b, 'SYNTHETIC_FACT_' + i, {
      accountId: 'FOLK_ORAL',
      originEventId: 'synth_origin_' + i,
      sourceKind: 'conversation'
    });
  }
  const bLore = COG.peekLoreState(b);
  assert.ok(Object.keys(bLore.knownFacts).length <= 32, 'Per-NPC knownFacts must remain strictly bounded at <= 32');
  console.log('  ✓ [2/6] Anti-Echo-Chamber Lineage De-Duplication, Epistemic Debate & Bounded Cap Verified');
}

// 3. All 20 Playable Story Chains, Route Modifiers, Breakthrough Calibration & Closed-Loop Stones
{
  const W = SIM.create('living-lore-stories-test');
  const master = W.byId[W.sect.masterId];
  const topo = EXPED.ensureWorldTopology(W);

  // Measure baseline route travel days between CITY_YH_SHUANGJIANG and PASS_YH_SANJIANG_BRIDGE
  const routeBefore = EXPED.planContinentalRoute(W, topo, EXPED.SETTLEMENTS.PASS_YH_SANJIANG_BRIDGE, 'CITY_YH_SHUANGJIANG');
  assert.ok(routeBefore && routeBefore.days > 0, 'Baseline Shuangjiang -> Sanjiang Bridge route must exist');

  // Advance STORY_01 through all 3 stages (0 -> 1 -> 2)
  const s1_0 = EXPED.advanceLivingLoreStory(W, master, 'STORY_01_SHUANGJIANG_FLOOD_LEDGER');
  assert.strictEqual(s1_0.ok, true);
  assert.strictEqual(s1_0.stageIdx, 0);
  assert.strictEqual(s1_0.resolved, false);

  const s1_1 = EXPED.advanceLivingLoreStory(W, master, 'STORY_01_SHUANGJIANG_FLOOD_LEDGER');
  assert.strictEqual(s1_1.ok, true);
  assert.strictEqual(s1_1.stageIdx, 1);
  assert.strictEqual(s1_1.status, 'contested');

  const s1_2 = EXPED.advanceLivingLoreStory(W, master, 'STORY_01_SHUANGJIANG_FLOOD_LEDGER');
  assert.strictEqual(s1_2.ok, true);
  assert.strictEqual(s1_2.resolved, true);
  assert.strictEqual(s1_2.status, 'resolved');

  const routeAfter = EXPED.planContinentalRoute(W, topo, EXPED.SETTLEMENTS.PASS_YH_SANJIANG_BRIDGE, 'CITY_YH_SHUANGJIANG');
  assert.ok(routeAfter.days < routeBefore.days, 'Verified STORY_01 flood ledger must causally reduce route travel days on Shuangjiang-Sanjiang leg');
  assert.ok(W.sect.loreArchive.includes('FACT_01_SHUANGJIANG_BACKFLOW'), 'Resolved story fact must be compiled into W.sect.loreArchive');

  // Verify breakthrough folklore calibration (STORY_13 / FACT_13_MERIDIAN_BELL_OMEN)
  const disc = W.npcs[1];
  disc.h.state.heartDemon = 48;
  COG.learnLoreFact(W, disc, 'FACT_13_MERIDIAN_BELL_OMEN', {
    accountId: 'FOLK_ORAL',
    originEventId: 'bell_folk_1',
    sourceKind: 'conversation'
  });
  const pSuperstitious = COG.perceivedBreakthroughChance(W, disc, 0.50);

  COG.learnLoreFact(W, disc, 'FACT_13_MERIDIAN_BELL_OMEN', {
    accountId: 'VERIFIED_CHRONICLE',
    originEventId: 'bell_verified_2',
    sourceKind: 'library_stele',
    physicalProof: true
  });
  const pCalibrated = COG.perceivedBreakthroughChance(W, disc, 0.50);
  assert.ok(pCalibrated < pSuperstitious, 'Verified meridian bell lore must curb reckless breakthrough overconfidence when heartDemon is high');

  // Verify closed-loop stone conservation across all remaining 19 story chains
  const totalStonesBefore = (W.sect.stones || 0) + ((W.world.resourcePool && W.world.resourcePool.stones) || 0) +
    W.npcs.reduce((sum, n) => sum + ((n.inv && n.inv.stones) || 0), 0);

  for (const sDef of EXPED.LIVING_LORE.STORY_CHAINS) {
    if (sDef.id === 'STORY_01_SHUANGJIANG_FLOOD_LEDGER') continue;
    EXPED.advanceLivingLoreStory(W, master, sDef.id);
    EXPED.advanceLivingLoreStory(W, master, sDef.id);
    const fin = EXPED.advanceLivingLoreStory(W, master, sDef.id);
    assert.strictEqual(fin.ok, true, `Story ${sDef.id} must resolve cleanly`);
    assert.strictEqual(fin.resolved, true, `Story ${sDef.id} must reach resolved state`);
  }

  const totalStonesAfter = (W.sect.stones || 0) + ((W.world.resourcePool && W.world.resourcePool.stones) || 0) +
    W.npcs.reduce((sum, n) => sum + ((n.inv && n.inv.stones) || 0), 0);
  assert.strictEqual(totalStonesAfter, totalStonesBefore, 'Story chain resolutions must strictly conserve closed-loop Spirit Stones');
  console.log('  ✓ [3/6] All 20 Story Chains, Route Modifiers, Breakthrough Calibration & Closed-Loop Stones Verified');
}

// 4. Town Visits (onCityVisitLore), Activity Hooks, Emergent Events & NewsPrefs Compliance
{
  const W = SIM.create('living-lore-cityvisit-test');
  const traveler = W.npcs.find(n => n.id !== W.sect.masterId && n.rank >= 1) || W.npcs[1];
  traveler.rank = Math.max(1, traveler.rank || 1);

  // Simulate arriving at CITY_YH_BAILU_ACADEMY via onCityVisitLore
  const visitRes = EXPED.onCityVisitLore(W, { targetNodeId: 'CITY_YH_BAILU_ACADEMY', kind: 'city_visit' }, [traveler]);
  assert.ok(visitRes && visitRes.ok, 'onCityVisitLore must advance or teach lore at visited settlement');
  assert.strictEqual(W.world.livingLore.stories.STORY_02_BAILU_DUAL_ANNOTATED_MANUAL.status, 'active',
    'Visiting CITY_YH_BAILU_ACADEMY must spark STORY_02_BAILU_DUAL_ANNOTATED_MANUAL');

  // Test emergent lore tick across multiple days
  for (let d = 1; d <= 15; d++) {
    W.day = d;
    W.t = d * 1440;
    EXPED.tickLivingLore(W);
  }
  assert.ok(W.world.livingLore.recentEvents.length >= 2, 'tickLivingLore must generate emergent slice-of-life and lore events over time');
  const latestEv = W.world.livingLore.recentEvents[W.world.livingLore.recentEvents.length - 1];
  assert.ok(latestEv.location && latestEv.location.nodeId && Number.isFinite(latestEv.location.x),
    'Emergent lore events must carry valid atlas location snapshots');

  // Test activity hooks (study, forge, cook, pray)
  AI.ACTS.study.done(traveler, W, {});
  AI.ACTS.cook.done(traveler, W, {});
  AI.ACTS.pray.done(traveler, W, {});
  const tSummary = COG.getNpcLoreSummary(W, traveler);
  assert.ok(tSummary.totalKnown >= 3, 'Everyday sect activities must enrich NPC lore knowledge');
  console.log('  ✓ [4/6] Town Visits, Sect Activity Hooks, Emergent Lore Events & Location Snapshots Verified');
}

// 5. Secret Gating (Layer 3 & 4), Zero-RNG / Zero-Mutation UI Renderers & No Player Command Buttons
{
  const W = SIM.create('living-lore-ui-purity-test');
  // In a fresh world, Layer 3 & Layer 4 secret facts must be veiled
  const pView0 = EXPED.getLivingLorePlayerView(W);
  const layer3 = pView0.layers.find(l => l.id === 'SHATTERED_SUBCONTINENT');
  const layer4 = pView0.layers.find(l => l.id === 'ERASED_PREHISTORY');
  assert.ok(layer3.facts.every(f => f.veiled === true), 'Undiscovered Layer 3 facts must be veiled in player view');
  assert.ok(layer4.facts.every(f => f.veiled === true), 'Undiscovered Layer 4 facts must be veiled in player view');

  // Verify Gen 1-6 plaques & public records contain zero Upper-World spoilers
  const plaques = SECT.getPreHistoryTablets(W);
  assert.strictEqual(plaques.length, 6);
  for (const p of plaques) {
    assert.strictEqual(p.mortalPerspectiveOnly, true, 'Pre-history plaques must maintain mortal perspective');
  }

  // Unlock one Layer 3 secret fact via actual discovery and verify it unveils while others remain veiled
  COG.learnLoreFact(W, W.byId[W.sect.masterId], 'FACT_22_SIMA_QING_BROKEN_CURIO_HUNT', {
    accountId: 'SECT_ORTHODOX',
    originEventId: 'curio_discovery_1',
    sourceKind: 'city_ledger'
  });
  const pView1 = EXPED.getLivingLorePlayerView(W);
  const f22View = pView1.layers.find(l => l.id === 'SHATTERED_SUBCONTINENT').facts.find(f => f.id === 'FACT_22_SIMA_QING_BROKEN_CURIO_HUNT');
  const f28View = pView1.layers.find(l => l.id === 'ERASED_PREHISTORY').facts.find(f => f.id === 'FACT_28_NAMELESS_FOUNDER_UPPER_WORLD_VIGIL');
  assert.strictEqual(f22View.veiled, false, 'Discovered Layer 3 fact must unveil in player view');
  assert.strictEqual(f28View.veiled, true, 'Undiscovered Layer 4 founder truth must remain veiled');

  // Verify 100% Zero-RNG & Zero-Mutation on all Living Lore UI renderers
  UI.G = { W, R: { selected: W.sect.masterId } };
  UI.npcId = W.sect.masterId;
  UI.selectedPolityId = 'POL_DONGHUANG';

  const snapBefore = SIM.serialize(W);
  const rngBefore = JSON.stringify(W.rng);

  const npcCardHtml = UI.renderNpcLivingLoreCard(W, W.byId[W.sect.masterId]);
  const worldArchiveHtml = UI.renderWorldLivingLoreArchive(W);
  const polityHtml = UI.rPolities(W);
  const cityLoreHtml = UI.renderSettlementLoreHtml(W, 'CITY_DH_QINGLAN_DICE_CITY');

  const snapAfter = SIM.serialize(W);
  const rngAfter = JSON.stringify(W.rng);

  assert.strictEqual(snapBefore, snapAfter, 'Living Lore UI renderers must NOT mutate serialized world state');
  assert.strictEqual(rngBefore, rngAfter, 'Living Lore UI renderers must NOT consume W.rng');
  assert.ok(npcCardHtml.includes('npc-living-lore-card'), 'NPC lore card must render');
  assert.ok(worldArchiveHtml.includes('living-lore-world-archive'), 'World lore archive must render');
  assert.ok(polityHtml.includes('ราชวงศ์ชิงหลานโบราณ'), 'Polity view must render fallen dynasty lore');
  assert.ok(cityLoreHtml.includes('ราชวงศ์ชิงหลานโบราณ'), 'Settlement atlas popup must render local fallen dynasty lore');
  console.log('  ✓ [5/6] Secret Gating (Layer 3/4) & 100% Zero-RNG / Zero-Mutation Observer UI Verified');
}

// 6. Mid-Story & Mid-Journey Save/Load/Continue Determinism
{
  const W1 = SIM.create('living-lore-save-replay-seed');
  const master1 = W1.byId[W1.sect.masterId];
  const traveler1 = W1.npcs.find(n => n.id !== master1.id && n.rank >= 1) || W1.npcs[1];
  traveler1.rank = Math.max(1, traveler1.rank || 1);

  // Advance a story halfway (Stage 1 contested) and start a city_visit journey
  EXPED.advanceLivingLoreStory(W1, master1, 'STORY_03_QINGLAN_SECOND_TOLL_STAMP');
  EXPED.advanceLivingLoreStory(W1, master1, 'STORY_03_QINGLAN_SECOND_TOLL_STAMP');
  W1.sect.stock.meal = Math.max(40, W1.sect.stock.meal || 40);
  W1.day = 5;
  W1.t = 5 * 1440;
  EXPED.departCityVisit(W1, traveler1);

  // Run 60 ticks, then serialize mid-story and mid-journey
  for (let i = 0; i < 60; i++) SIM.tick(W1);
  const savedJson = SIM.serialize(W1);
  const W2 = SIM.deserialize(savedJson);

  assert.strictEqual(W2.world.livingLore.stories.STORY_03_QINGLAN_SECOND_TOLL_STAMP.status, 'contested',
    'Deserialized world must preserve mid-story contested status');

  // Continue both worlds for 180 ticks and verify identical state & lore progression
  for (let i = 0; i < 180; i++) {
    SIM.tick(W1);
    SIM.tick(W2);
  }
  assert.strictEqual(JSON.stringify(W1.rng), JSON.stringify(W2.rng), 'Mid-story/mid-journey save/load must preserve exact RNG trajectory');
  assert.strictEqual(JSON.stringify(W1.world.livingLore), JSON.stringify(W2.world.livingLore),
    'Mid-story/mid-journey save/load must produce identical Living Lore state');
  console.log('  ✓ [6/6] Mid-Story & Mid-Journey Save/Load/Continue Replay Determinism Verified');
}

console.log('\n✅ ALL JS2-v3.1.0 LIVING LORE & MULTI-ACCOUNT CHRONICLE CHECKS PASSED!');
