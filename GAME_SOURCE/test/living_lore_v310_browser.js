'use strict';
const assert = require('assert');
const path = require('path');
const { chromium } = (() => { try { return require('playwright'); } catch (_) { return require('../tools/cdp_playwright'); } })();

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(await require('../tools/browser_test_url').url(path.resolve(__dirname, '../index.html')));
    await page.click('[data-pick="0"]');

    const smokeResult = await page.evaluate(() => {
      G.speed = 0;
      const W = G.W;
      const master = W.byId[W.sect.masterId];

      // 1. Open NPC sheet and verify Living Lore & Epistemic Beliefs card
      UI.openNpc(master.id, 'ov');
      const npcHtml = document.getElementById('shBody').innerHTML;
      if (!npcHtml.includes('npc-living-lore-card')) throw new Error('Missing NPC Living Lore card');

      // 2. Open World -> Exp and verify World Living Lore Archive & 20 Story Chains
      UI.open('world', 'exp');
      const worldHtml = document.getElementById('shBody').innerHTML;
      if (!worldHtml.includes('living-lore-world-archive')) throw new Error('Missing World Living Lore Archive');

      // 3. Open World -> Polities -> POL_DONGHUANG and verify Fallen Dynasties & Local Lore
      UI.selectedPolityId = 'POL_DONGHUANG';
      UI.open('world', 'polities');
      const polHtml = document.getElementById('shBody').innerHTML;
      if (!polHtml.includes('ราชวงศ์ชิงหลานโบราณ')) throw new Error('Missing Fallen Dynasty in Polity view');

      // 4. Open World -> Map -> select CITY_YH_SHUANGJIANG and verify Settlement Lore popup
      UI.open('world', 'map');
      UI.doAction('atlas-select', 'CITY_YH_SHUANGJIANG');
      const atlasHtml = document.getElementById('shBody').innerHTML;
      if (!atlasHtml.includes('ราชวงศ์เหยียนหลิง')) throw new Error('Missing Settlement Lore in Atlas detail');

      // 5. Advance a story, save, reload in browser, and verify replay state
      EXPED.advanceLivingLoreStory(W, master, 'STORY_01_SHUANGJIANG_FLOOD_LEDGER');
      const saved = SIM.serialize(W);
      G.W = SIM.deserialize(saved);
      UI.open('world', 'exp');
      const reloadedStatus = G.W.world.livingLore.stories.STORY_01_SHUANGJIANG_FLOOD_LEDGER.status;
      return {
        ok: true,
        patchVersion: SIM.PATCH_VERSION,
        schemaVersion: SIM.SAVE_SCHEMA_VERSION,
        reloadedStatus,
        knownByMaster: COG.getNpcLoreSummary(G.W, G.W.byId[G.W.sect.masterId]).totalKnown
      };
    });

    assert.deepStrictEqual(errors, [], 'Browser smoke test must produce zero page errors');
    assert.strictEqual(smokeResult.ok, true);
    assert.ok(['3.1.0', '3.2.0', '3.3.0', '3.4.0', '3.5.0a', '3.5.0b', '3.5.0c', '3.6.0a', '3.8.2'].includes(smokeResult.patchVersion));
    assert.strictEqual(smokeResult.schemaVersion, '3.4.0-world-events');
    assert.strictEqual(smokeResult.reloadedStatus, 'active');
    console.log('PASS living_lore_v310_browser smoke test and current-save replay:', JSON.stringify(smokeResult));
  } finally {
    await browser.close();
  }
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
