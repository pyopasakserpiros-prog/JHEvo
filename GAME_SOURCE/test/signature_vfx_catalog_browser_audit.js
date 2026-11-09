'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = (() => { try { return require('playwright'); } catch (_) { return require('../tools/cdp_playwright.js'); } })();

(async () => {
  const systemChromium = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  const browser = await chromium.launch(systemChromium ? { executablePath: systemChromium, args: ['--no-sandbox', '--disable-dev-shm-usage'] } : {});
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(await require('../tools/browser_test_url').url(path.resolve(__dirname, '../index.html')));
    await page.waitForFunction(() => !!(window.Render && window.SK && Render.methods && SK.SIGNATURE_VFX_CATALOG && Render.PATH_VISUAL_SIGNATURES));
    const result = await page.evaluate(() => {
      const entries = Object.entries(SK.SIGNATURE_VFX_CATALOG), cols = 5, cellW = 210, cellH = 180;
      const sheet = document.createElement('canvas'); sheet.width = cols * cellW; sheet.height = Math.ceil(entries.length / cols) * cellH;
      const ctx = sheet.getContext('2d'); ctx.fillStyle = '#101720'; ctx.fillRect(0, 0, sheet.width, sheet.height);
      const hashes = [];
      entries.forEach(([id, spec], i) => {
        const x = (i % cols) * cellW, y = Math.floor(i / cols) * cellH;
        ctx.save(); ctx.translate(x + cellW / 2, y + 88);
        Render.methods.drawSignatureSkillVfx(ctx, { signatureVfx: id, angle: 0.3 }, 0.46, 44, false);
        ctx.restore();
        ctx.fillStyle = '#fff0cf'; ctx.font = '12px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(spec.nameTh || id, x + cellW / 2, y + 151, cellW - 12);
        ctx.fillStyle = '#a9b6c5'; ctx.font = '9px system-ui'; ctx.fillText(id, x + cellW / 2, y + 166, cellW - 12);
        const pixels = ctx.getImageData(x + 20, y + 12, cellW - 40, 124).data;
        let h = 2166136261; for (let p = 0; p < pixels.length; p += 4) { h ^= pixels[p]; h = Math.imul(h, 16777619); h ^= pixels[p + 1]; h = Math.imul(h, 16777619); h ^= pixels[p + 2]; h = Math.imul(h, 16777619); }
        hashes.push(h >>> 0);
      });
      const paths = Object.entries(Render.PATH_VISUAL_SIGNATURES), pathCols = 6, pathCell = 130;
      const pathSheet = document.createElement('canvas'); pathSheet.width = pathCols * pathCell; pathSheet.height = Math.ceil(paths.length / pathCols) * pathCell;
      const pc = pathSheet.getContext('2d'); pc.fillStyle = '#101720'; pc.fillRect(0, 0, pathSheet.width, pathSheet.height);
      const pathHashes = [];
      paths.forEach(([id, spec], i) => {
        const x = (i % pathCols) * pathCell, y = Math.floor(i / pathCols) * pathCell;
        pc.save(); pc.translate(x + pathCell / 2, y + 53);
        Render.methods.drawPathApexCrownGeometry(pc, id, spec, 0, 0.38, true, false);
        pc.restore();
        pc.fillStyle = '#fff0cf'; pc.font = '9px system-ui'; pc.textAlign = 'center'; pc.fillText(id, x + pathCell / 2, y + 107, pathCell - 6);
        const pixels = pc.getImageData(x + 10, y + 8, pathCell - 20, 90).data;
        let h = 2166136261; for (let p = 0; p < pixels.length; p += 4) { h ^= pixels[p]; h = Math.imul(h, 16777619); h ^= pixels[p + 1]; h = Math.imul(h, 16777619); h ^= pixels[p + 2]; h = Math.imul(h, 16777619); }
        pathHashes.push(h >>> 0);
      });
      return { ids: entries.map(([id]) => id), hashes, image: sheet.toDataURL('image/png'),
        pathIds: paths.map(([id]) => id), pathHashes, pathImage: pathSheet.toDataURL('image/png') };
    });
    assert.equal(result.ids.length, 30, 'current signature catalog must contain the 30 authored forms');
    assert.equal(new Set(result.hashes).size, result.ids.length, 'all current signature forms must remain visibly distinct in Canvas');
    assert.equal(result.pathIds.length, 43, 'all Grand Dao paths must have a distinct ascendant crown');
    assert.equal(new Set(result.pathHashes).size, result.pathIds.length, 'all 43 path crowns must remain visibly distinct in Canvas');
    assert.deepStrictEqual(errors, []);
    const outputPath = process.env.SIGNATURE_VFX_GALLERY || '/tmp/signature-vfx-catalog-gallery.png';
    fs.writeFileSync(outputPath, Buffer.from(result.image.split(',')[1], 'base64'));
    const pathOutput = process.env.PATH_VFX_GALLERY || '/tmp/path-apex-vfx-catalog-gallery.png';
    fs.writeFileSync(pathOutput, Buffer.from(result.pathImage.split(',')[1], 'base64'));
    console.log('PASS VFX browser audit: 30/30 Signature forms and 43/43 Path crowns pixel-distinct, no page errors');
    console.log('Signature gallery: ' + outputPath); console.log('Path crown gallery: ' + pathOutput);
    await context.close();
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
