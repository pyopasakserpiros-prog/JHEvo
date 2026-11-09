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
      const reducedSheet = document.createElement('canvas'); reducedSheet.width = sheet.width; reducedSheet.height = sheet.height;
      const reducedCtx = reducedSheet.getContext('2d'); reducedCtx.fillStyle = '#101720'; reducedCtx.fillRect(0, 0, reducedSheet.width, reducedSheet.height);
      const hashes = [], reducedHashes = [];
      entries.forEach(([id, spec], i) => {
        const x = (i % cols) * cellW, y = Math.floor(i / cols) * cellH;
        ctx.save(); ctx.translate(x + cellW / 2, y + 88);
        Render.methods.drawSignatureSkillVfx(ctx, { signatureVfx: id, angle: 0.3 }, 0.46, 44, false);
        ctx.restore();
        reducedCtx.save(); reducedCtx.translate(x + cellW / 2, y + 88);
        Render.methods.drawSignatureSkillVfx(reducedCtx, { signatureVfx: id, angle: 0.3 }, 0.46, 44, true);
        reducedCtx.restore();
        ctx.fillStyle = '#fff0cf'; ctx.font = '12px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(spec.nameTh || id, x + cellW / 2, y + 151, cellW - 12);
        ctx.fillStyle = '#a9b6c5'; ctx.font = '9px system-ui'; ctx.fillText(id, x + cellW / 2, y + 166, cellW - 12);
        const pixels = ctx.getImageData(x + 20, y + 12, cellW - 40, 124).data;
        let h = 2166136261; for (let p = 0; p < pixels.length; p += 4) { h ^= pixels[p]; h = Math.imul(h, 16777619); h ^= pixels[p + 1]; h = Math.imul(h, 16777619); h ^= pixels[p + 2]; h = Math.imul(h, 16777619); }
        hashes.push(h >>> 0);
        const reducedPixels = reducedCtx.getImageData(x + 20, y + 12, cellW - 40, 124).data;
        let rh = 2166136261; for (let p = 0; p < reducedPixels.length; p += 4) { rh ^= reducedPixels[p]; rh = Math.imul(rh, 16777619); rh ^= reducedPixels[p + 1]; rh = Math.imul(rh, 16777619); rh ^= reducedPixels[p + 2]; rh = Math.imul(rh, 16777619); }
        reducedHashes.push(rh >>> 0);
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
      const networkPreview = points => {
        const canvas = document.createElement('canvas'); canvas.width = 360; canvas.height = 288;
        const nc = canvas.getContext('2d'); nc.fillStyle = '#101720'; nc.fillRect(0, 0, canvas.width, canvas.height);
        nc.save(); nc.translate(180, 123); nc.scale(3, 3);
        Render.methods.drawSignatureSkillVfx(nc, { signatureVfx: 'sig_thousand_faith_link', x: 100, y: 100, targetPoints: points }, 0.46, 24, false);
        nc.restore();
        const pixels = nc.getImageData(0, 0, canvas.width, canvas.height).data;
        let h = 2166136261; for (let p = 0; p < pixels.length; p += 4) { h ^= pixels[p]; h = Math.imul(h, 16777619); h ^= pixels[p + 1]; h = Math.imul(h, 16777619); h ^= pixels[p + 2]; h = Math.imul(h, 16777619); }
        return { hash: h >>> 0, image: canvas.toDataURL('image/png') };
      };
      const networkSingle = networkPreview([{ x: 100, y: 100, team: true }]);
      const networkTeam = networkPreview([{ x: 100, y: 100, team: true }, { x: 78, y: 112, team: true }, { x: 121, y: 110, team: true }, { x: 100, y: 82, team: true }]);
      return { ids: entries.map(([id]) => id), hashes, reducedHashes, image: sheet.toDataURL('image/png'), networkSingle, networkTeam,
        pathIds: paths.map(([id]) => id), pathHashes, pathImage: pathSheet.toDataURL('image/png') };
    });
    assert.equal(result.ids.length, 45, 'current signature catalog must contain the 30 original and 15 new authored forms');
    assert.equal(new Set(result.hashes).size, result.ids.length, 'all current signature forms must remain visibly distinct in Canvas');
    assert.equal(new Set(result.reducedHashes).size, result.ids.length, 'all signature forms must stay distinct under Reduced Motion');
    assert.notEqual(result.networkTeam.hash, result.networkSingle.hash, 'Faith Network draws links to actual additional recipients');
    assert.equal(result.pathIds.length, 43, 'all Grand Dao paths must have a distinct ascendant crown');
    assert.equal(new Set(result.pathHashes).size, result.pathIds.length, 'all 43 path crowns must remain visibly distinct in Canvas');
    assert.deepStrictEqual(errors, []);
    const outputPath = process.env.SIGNATURE_VFX_GALLERY || '/tmp/signature-vfx-catalog-gallery.png';
    fs.writeFileSync(outputPath, Buffer.from(result.image.split(',')[1], 'base64'));
    const pathOutput = process.env.PATH_VFX_GALLERY || '/tmp/path-apex-vfx-catalog-gallery.png';
    fs.writeFileSync(pathOutput, Buffer.from(result.pathImage.split(',')[1], 'base64'));
    const recipientOutput = process.env.FAITH_NETWORK_VFX_PREVIEW || '/tmp/faith-network-recipient-links.png';
    fs.writeFileSync(recipientOutput, Buffer.from(result.networkTeam.image.split(',')[1], 'base64'));
    console.log('PASS VFX browser audit: 45/45 Signature forms in full and Reduced Motion and 43/43 Path crowns pixel-distinct, no page errors');
    console.log('Signature gallery: ' + outputPath); console.log('Path crown gallery: ' + pathOutput);
    console.log('Faith recipient preview: ' + recipientOutput);
    await context.close();
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
