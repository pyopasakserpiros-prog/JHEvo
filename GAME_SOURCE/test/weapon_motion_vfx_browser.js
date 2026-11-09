'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = (() => { try { return require('playwright'); } catch (_) { return require('../tools/cdp_playwright.js'); } })();

(async () => {
  const systemChromium = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  const browser = await chromium.launch(systemChromium ? { executablePath: systemChromium, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {});
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 840 } });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(await require('../tools/browser_test_url').url(path.resolve(__dirname, '../index.html')));
    await page.waitForFunction(() => !!(window.G && G.R && window.Render && Render.WEAPON_MOTION_VFX));
    await page.click('[data-pick="0"]');
    const result = await page.evaluate(() => {
      const types = Object.keys(Render.WEAPON_MOTION_VFX), cellW = 150, cellH = 110, cols = 4;
      const gallery = document.createElement('canvas'); gallery.width = cols * cellW; gallery.height = Math.ceil(types.length / cols) * cellH;
      const ctx = gallery.getContext('2d'); ctx.fillStyle = '#101720'; ctx.fillRect(0, 0, gallery.width, gallery.height);
      const hashes = [];
      const renderer = Object.assign({ opts: { quality: 'high' }, resolveQuality() { return this.opts.quality; } }, Render.methods);
      types.forEach((type, i) => {
        const x = (i % cols) * cellW + cellW / 2, y = Math.floor(i / cols) * cellH + 56;
        ctx.save(); ctx.translate(x, y);
        renderer.drawWeaponMotionVfx(ctx, { weaponType: type, tier: 5, angle: 0.28 }, 0.48, 27, false);
        ctx.restore();
        ctx.fillStyle = '#f2ead8'; ctx.font = '13px system-ui'; ctx.textAlign = 'center'; ctx.fillText(Render.WEAPON_MOTION_VFX[type].nameTh, x, y + 39);
        const pixels = ctx.getImageData(x - 48, y - 36, 96, 72).data;
        let h = 2166136261; for (let p = 0; p < pixels.length; p += 4) { h ^= pixels[p]; h = Math.imul(h, 16777619); h ^= pixels[p + 1]; h = Math.imul(h, 16777619); h ^= pixels[p + 2]; h = Math.imul(h, 16777619); }
        hashes.push(h >>> 0);
      });
      const W = G.W, gameR = G.R, n = W.npcs.find(x => x && !x.dead && !x.away);
      G.speed = 0; W.speed = 0; gameR.setWorld(W);
      const target = W.npcs.find(x => x && x !== n && !x.dead && !x.away) || n;
      gameR.cam.x = target.x * 16; gameR.cam.y = target.y * 16;
      n.castFx = { seq: 901, t: W.t, kind: 'normal', x: target.x, y: target.y, originX: n.x, originY: n.y,
        weaponType: 'ZITHER', tier: 4, arch: 'strike', techId: null,
        targetPoints: [{ x: target.x, y: target.y, team: false }, { x: n.x, y: n.y, team: true }] };
      gameR.updateCastEffects(performance.now());
      const ingested = Array.from(gameR.castActive.values()).find(fx => fx.weaponType === 'ZITHER');
      const draw = document.createElement('canvas').getContext('2d');
      const recipientsCanvas = document.createElement('canvas'); recipientsCanvas.width = 260; recipientsCanvas.height = 80;
      const recipientsCtx = recipientsCanvas.getContext('2d');
      gameR.drawCastTargetMarks(recipientsCtx, { x: 20, y: 20, targetPoints: [
        { x: 20, y: 20, team: true }, { x: 100, y: 40, team: true }, { x: 190, y: 48, team: false }
      ] }, 0.4, false);
      const markerPixels = recipientsCtx.getImageData(0, 0, recipientsCanvas.width, recipientsCanvas.height).data;
      let markerPixelCount = 0; for (let p = 3; p < markerPixels.length; p += 4) if (markerPixels[p]) markerPixelCount++;
      const buffCanvas = document.createElement('canvas'); buffCanvas.width = 64; buffCanvas.height = 48;
      const buffCtx = buffCanvas.getContext('2d'); buffCtx.translate(32, 28);
      const oldStatuses = n.sx; n.sx = [{ k: 'aegisWard', startedAt: W.t, until: W.t + 8 }];
      const buffAura = gameR.drawAppliedBuffAura(buffCtx, n, 0);
      const buffPixels = buffCtx.getImageData(0, 0, buffCanvas.width, buffCanvas.height).data;
      let buffPixelCount = 0; for (let p = 3; p < buffPixels.length; p += 4) if (buffPixels[p]) buffPixelCount++;
      n.sx = oldStatuses;
      const beforeDraw = SIM.serialize(W), rngBeforeDraw = JSON.stringify(W.rng.getState());
      if (ingested) gameR.drawCastEffects(draw);
      return { types, hashes, ingested: !!ingested, ingestedAngle: ingested && ingested.angle,
        recipientCount: ingested && ingested.targetPoints.length, markerPixelCount, buffAura, buffPixelCount,
        purity: beforeDraw === SIM.serialize(W) && rngBeforeDraw === JSON.stringify(W.rng.getState()), image: gallery.toDataURL('image/png') };
    });
    assert.equal(result.types.length, 17);
    assert.equal(new Set(result.hashes).size, result.types.length, 'all weapon family silhouettes must be pixel-distinct in Canvas');
    assert(result.ingested, 'real Render cast event must carry a weapon family to the visual queue');
    assert.equal(result.recipientCount, 2, 'render ingestion preserves friendly and hostile cast recipients');
    assert(result.markerPixelCount > 0, 'recipient marks produce visible Canvas pixels');
    assert.equal(result.buffAura, 'guard', 'active shield buff resolves to an attached aura family');
    assert(result.buffPixelCount > 0, 'persistent buff aura produces Canvas pixels on its recipient');
    assert(result.purity, 'browser rendering stays read-only and RNG-free');
    assert.deepStrictEqual(errors, []);
    const outputPath = process.env.WEAPON_VFX_GALLERY || '/tmp/weapon-motion-vfx-gallery.png';
    fs.writeFileSync(outputPath, Buffer.from(result.image.split(',')[1], 'base64'));
    console.log('PASS browser weapon motion VFX: 17 distinct Canvas silhouettes, real event ingest, serialization/RNG purity, no page errors');
    console.log('Gallery: ' + outputPath);
    await context.close();
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
