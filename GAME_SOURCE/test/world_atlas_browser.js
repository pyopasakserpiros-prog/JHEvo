'use strict';
const assert = require('assert'), path = require('path');
const { chromium } = (() => { try { return require('playwright'); } catch (_) { return require('../tools/cdp_playwright'); } })();
(async () => {
  const browser = await chromium.launch();
  try {
    for (const viewport of [{width:390,height:844},{width:800,height:360},{width:1280,height:800}]) {
      const context = await browser.newContext({ viewport, hasTouch:viewport.width < 500, isMobile:viewport.width < 500 });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(await require('../tools/browser_test_url').url(path.join(__dirname, '..', 'JianghuSect_single.html')));
      await page.click('[data-pick="0"]');
      await page.evaluate(() => { G.speed = 0; UI.open('world','map'); });
      await page.waitForSelector('.atlas-viewport');
      const state = await page.evaluate(() => ({
        hud:document.getElementById('hudTop').getBoundingClientRect().bottom,
        sheet:document.getElementById('sheet').getBoundingClientRect().top,
        nodes:UI.buildWorldAtlas(G.W).nodes.length,
        groups:document.querySelectorAll('.atlas-marker.cluster').length,
        labels:document.querySelectorAll('.atlas-marker-label').length,
        overflow:document.documentElement.scrollWidth > document.documentElement.clientWidth,
        background:getComputedStyle(document.querySelector('.atlas-surface')).backgroundImage
      }));
      assert(state.sheet >= state.hud - 1, 'atlas sheet must not hide the top HUD');
      assert(state.nodes >= 75 && state.groups > 0, 'actual destinations must be represented and nearby places clustered');
      assert(state.labels <= 8, 'overview must not display all overlapping names');
      assert(!state.overflow, 'atlas must not create page-level horizontal overflow');
      assert(state.background.includes('data:image/jpeg;base64,'), 'the standalone atlas terrain must load offline');
      if (viewport.width === 390) await page.screenshot({path:'/tmp/jhevo-world-atlas-overview.png'});
      await page.click('.atlas-marker.cluster');
      assert(await page.locator('.atlas-place-choice').count() > 1, 'cluster must provide a selectable place list');
      await page.click('.atlas-place-choice');
      assert.strictEqual(await page.locator('.atlas-detail-heading').count(), 1, 'selecting a place opens its detail panel');
      await page.click('.atlas-detail-close');
      await page.click('[data-do="atlas-filter"][data-arg="SECT"]');
      const sects = await page.evaluate(() => UI.buildWorldAtlas(G.W).nodes.filter(n => n.kind === 'NEIGHBOR_SECT'));
      assert.strictEqual(sects.length, 19, 'all actual sects remain represented');
      await page.evaluate(id => UI.doAction('atlas-select', id), sects[0].id);
      assert((await page.evaluate(() => document.querySelector('.atlas-detail').textContent)).includes(sects[0].alignmentLabelTh), 'sect detail must identify its real alignment');
      if (viewport.width === 390) await page.screenshot({path:'/tmp/jhevo-world-atlas-detail.png'});
      await page.click('.atlas-detail-close');
      const before = await page.evaluate(() => UI.atlasView.zoom);
      await page.click('[data-do="atlas-zoom"][data-arg="in"]');
      assert((await page.evaluate(() => UI.atlasView.zoom)) > before, 'zoom control must enlarge the atlas');
      if (viewport.width === 390) {
        const box = await page.locator('.atlas-viewport').boundingBox();
        const beforePan = await page.evaluate(() => ({x:UI.atlasView.x,y:UI.atlasView.y}));
        await page.mouse.move(box.x+box.width*0.65,box.y+box.height*0.75);
        await page.mouse.down();
        await page.mouse.move(box.x+box.width*0.35,box.y+box.height*0.55,{steps:8});
        await page.mouse.up();
        const afterPan = await page.evaluate(() => ({x:UI.atlasView.x,y:UI.atlasView.y}));
        assert(Math.abs(beforePan.x-afterPan.x) + Math.abs(beforePan.y-afterPan.y) > 0.01, 'drag must pan the zoomed atlas');
        const cdp = context.newCDPSession ? await context.newCDPSession(page) : {send:(method, params) => page.cdp.send(method, params, page.sessionId)};
        const rect = await page.locator('.atlas-viewport').boundingBox();
        const x = rect.x + rect.width * 0.50, y = rect.y + rect.height * 0.70;
        const z = await page.evaluate(() => UI.atlasView.zoom);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-25,y,id:0},{x:x+25,y,id:1}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-55,y,id:0},{x:x+55,y,id:1}]});
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        assert((await page.evaluate(() => UI.atlasView.zoom)) > z, 'two-finger pinch must zoom in');
      }
      await page.click('[data-do="atlas-home"]');
      assert.strictEqual(await page.locator('.atlas-marker.home').count(), 1, 'home control retains the player sect');
      if (viewport.width === 390) {
        const choice = await page.evaluate(() => {
          const node = UI.buildWorldAtlas(G.W).nodes.find(n => n.kind === 'RESOURCE_NODE' && n.ownerSectId !== 'PLAYER');
          const party = UI.atlasParty(G.W, node);
          const travel = UI.atlasTravelInfo(G.W, node, party);
          UI.doAction('atlas-select', node.id);
          return {id:node.id, owner:node.ownerSectId, days:travel.days};
        });
        await page.click('.atlas-detail [data-do="atlas-depart"]');
        const sent = await page.evaluate(id => ({
          ex:G.W.world.expeds.find(e => e.kind === 'resource_claim' && e.targetNodeId === id && !e.done),
          owner:G.W.world.resourceNodes[id].ownerSectId
        }), choice.id);
        assert(sent.ex, 'the map action must launch a real resource expedition');
        assert.strictEqual(sent.owner, choice.owner, 'the location must not change hands before arrival');
        assert.strictEqual(sent.ex.days, choice.days, 'displayed travel must match the expedition timer');
        for (const kind of ['NEIGHBOR_SECT','RESOURCE_NODE','WORLD_ANOMALY','FORTUNE_SITE','EXPEDITION_REGION','SANCTUM','PAGODA','ELEMENTAL_REALM']) {
          await page.evaluate(kind => {
            G.speed = 0; G.W = SIM.create('atlas-browser-action-' + kind);
            UI.atlasSelectedId = null; UI.atlasGroupIds = null; UI.open('world','map');
            if (kind === 'WORLD_ANOMALY') EXPED.spawnWorldAnomaly(G.W,{durationDays:20});
            const node = UI.buildWorldAtlas(G.W).nodes.find(n => n.kind === kind && (kind !== 'FORTUNE_SITE' || UI.atlasParty(G.W,n).length) && (kind !== 'ELEMENTAL_REALM' || EXPLORE.elementalRealmAt(G.W.day).id === n.id));
            if (!node) throw Error('No available fixture for ' + kind);
            const estimate = UI.atlasTravelInfo(G.W,node,UI.atlasParty(G.W,node));
            UI.doAction('atlas-select',node.id);
            if (!document.querySelector('.atlas-detail [data-do="atlas-depart"]')) throw Error('Missing action for ' + kind);
            UI.doAction('atlas-depart',node.id);
            const ex = G.W.world.expeds.find(e => !e.done);
            const expected = {NEIGHBOR_SECT:'sect_siege',RESOURCE_NODE:'resource_claim',WORLD_ANOMALY:'world_anomaly',FORTUNE_SITE:'fortune',EXPEDITION_REGION:'gather',SANCTUM:'sanctum',PAGODA:'nine_dao_pagoda',ELEMENTAL_REALM:'elemental_realm'}[kind];
            if (!ex || ex.kind !== expected) throw Error('Wrong expedition for ' + kind);
            if (kind === 'FORTUNE_SITE' && ex.siteId !== node.siteId) throw Error('Wrong fortune target');
            if (estimate.days != null && estimate.days !== ex.days) throw Error('Wrong travel estimate for ' + kind);
            if (estimate.minDays != null && (ex.ret-ex.t0)/1440 > estimate.maxDays + 0.06) throw Error('Journey exceeds estimated range');
            UI.open('world','exp');
            if (!document.getElementById('shBody').innerText.includes(node.rawNameTh || node.nameTh)) throw Error('Travel list missing ' + kind);
          }, kind);
        }
        for (const args of [['DIMENSION_GATE','atlas-open-discovery','disc'],['SECRET_REALM_SITE','atlas-open-realms','sects'],['WANDERING_LEGEND','atlas-open-legends','sects']]) {
          await page.evaluate(([kind,action,tab]) => {
            const node = UI.buildWorldAtlas(G.W).nodes.find(n => n.kind === kind);
            UI.open('world','map'); UI.doAction('atlas-select',node.id);
            if (!document.querySelector('.atlas-detail [data-do="' + action + '"]')) throw Error('Missing link for ' + kind);
            UI.doAction(action);
            if (UI.tab !== tab) throw Error('Wrong tab for ' + kind);
          }, args);
        }
      }
      assert.deepStrictEqual(errors, [], 'no uncaught browser errors');
      await context.close();
      console.log('PASS world atlas browser ' + viewport.width + 'x' + viewport.height);
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
