/* ui.js — หน้าจอ: HUD, แผ่นข้อมูล (people/sect/log/world/edit/menu/npc/building), หน้าเลือกเจ้าสำนัก, บันทึก/โหลด */
(function (g) {
  'use strict';
  const U = g.U, HC = g.HC, CULT = g.CULT, SECT = g.SECT, ECO = g.ECO, AI = g.AI, MAP = g.MAP, SIM = g.SIM, EXPED = g.EXPED, JD = g.JD, Render = g.Render;
  const clamp = U.clamp;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const UI = { G: null, sheet: null, tab: null, activePeakId: 'OVERVIEW', postDirFilter: 'ALL', lastHud: 0, logSubFilter: 'all', editNpcId: null, editStatGroup: 'personality', editDraft: null, spawnDest: 'sect', spawnSearch: '', spawnKind: 'ALL', spawnTier: 'ALL', spawnElement: 'ALL', spawnRarity: 'ALL', spawnPage: 1, spawnPageSize: 40, spawnQty: 1, spawnQuality: 1, stockSearch: '', stockType: 'ALL', stockTier: 'ALL', stockSort: 'qty', bagSearch: '', bagType: 'ALL', bagSort: 'tier', bagCat: 'ALL', bagPage: 1, bagSelKey: null, bagMoreOpen: false, stockCat: 'ALL', stockPage: 1, stockSelKey: null, stockMoreOpen: false, shopCat: 'ALL', shopSearch: '', shopSort: 'tier', shopPage: 1, shopSelKey: null, shopMoreOpen: false, shopBuyerId: null, sectSubTab: 'CORE', sectPostsSubTab: 'OFFICES', stockItemsSubTab: 'GRID', shopSubTab: 'EXCHANGE', npcSubTab: 'CORE', worldExpSubTab: 'TRAVEL', worldSectsSubTab: 'NEIGHBORS', worldDiscSubTab: 'PORTALS', worldContentSubTab: 'REGIONS', buildingSubTab: 'OVERVIEW', editCharSubTab: 'CULT_ECON', editPetSubTab: 'PETS_BUFFS' };
  const SPEEDS = [[0, '⏸'], [1, '1×'], [2, '2×'], [4, '4×'], [8, '8×'], [16, '16×'], [32, '32×'], [48, '48×']];
  UI.SPEEDS = SPEEDS.map(s => s[0]);

  const LOG_GROUPS = {
    all: ['ทั้งหมด', null],
    tracked: ['⭐ ที่ติดตาม', null],
    people: ['👥 ผู้คน', ['relation', 'marriage', 'recruit', 'death', 'injury', 'heal', 'awaken', 'desert', 'disciple', 'punish', 'expel']],
    combat: ['⚔️ ต่อสู้/ล่า', ['combat', 'hunt', 'beast', 'explore', 'raid', 'duel', 'spar', 'tournament', 'conflict', 'challenge']],
    craft: ['⚗️ การผลิต/ตกปลา', ['craft', 'harvest', 'fish', 'legend', 'alchemy', 'forge', 'organ', 'learn', 'research', 'insight', 'breakthrough']],
    economy: ['🪙 เศรษฐกิจ', ['economy', 'trade', 'finance', 'shop', 'gear', 'welfare', 'donation', 'surplus', 'shortage', 'salary']],
    building: ['🏯 อาคาร', ['build', 'building', 'decision', 'appoint', 'dismiss', 'promote', 'demote', 'succession', 'politics', 'scandal', 'crisis', 'banquet', 'seclusion', 'system']],
    major: ['⭐ สำคัญ', ['death', 'breakthrough', 'legend', 'succession', 'crisis', 'raid', 'challenge', 'tournament', 'marriage', 'expel', 'build']]
  };
  const LOG_SUBFILTERS = {
    all: 'ทุกประเภทย่อย',
    no_pill: '🚫 ซ่อนการใช้โอสถรายวัน',
    gift: '🎁 มอบของรางวัล/จัดสรรคลัง',
    trade: '🪙 ซื้อ/ขายสินค้า',
    spawn: '✨ เสก/แก้ไขโดยผู้เล่น'
  };
  const TOAST_TYPES = ['explore', 'death', 'breakthrough', 'raid', 'succession', 'challenge', 'tournament', 'marriage', 'desert', 'expel', 'research', 'build'];

  /* ---------- ตัวช่วย ---------- */
  function bar(label, v, o) {
    o = o || {}; const pct = clamp(v / (o.max || 100) * 100, 0, 100); const col = o.color || (v >= 71 ? '#5fd38a' : v >= 45 ? '#4fb2f2' : v >= 30 ? '#e8c43a' : '#e0584a');
    return '<div class="bar' + (o.wide ? ' wide' : '') + '"><div class="lb" title="' + esc(o.tip || '') + '">' + esc(label) + '</div><div class="tr"><div class="fl" style="width:' + pct + '%;background:' + col + '"></div>' + (o.mark != null ? '<div class="mk" style="left:' + clamp(o.mark / (o.max || 100) * 100, 0, 100) + '%"></div>' : '') + '</div><div class="vl">' + (o.txt != null ? o.txt : Math.round(v)) + '</div></div>';
  }
  function statLayer(n, layer, o) {
    o = o || {}; return HC.layerIds(layer).map(id => { const path = layer + '.' + id; const v = HC.eff(n, path); const inn = n.h.innate ? n.h.innate[path] : null; const d = HC.STAT_DEFS.find(s => s.path === path); return bar(HC.nameOf(path), v, { mark: o.mark !== false && inn != null ? inn : null, wide: true, tip: d ? d.descTh : '' }); }).join('');
  }
  function timeAgo(W, t) { const m = W.t - t; if (m < 60) return m + ' นาทีก่อน'; if (m < 1440) return Math.floor(m / 60) + ' ชม.ก่อน'; return Math.floor(m / 1440) + ' วันก่อน'; }
  function dayStamp(t) { const c = SIM.calendar(t); return 'ปี' + c.year + ' ด.' + c.month + ' ว.' + c.dom; }
  function portraitHtml(n, size) { return '<canvas class="pt" data-pid="' + n.id + '" data-size="' + (size || 40) + '" style="border-radius:10px;flex:0 0 auto"></canvas>'; }
  function dioramaHtml(n, w, h) { return '<canvas class="diorama" data-pid="' + n.id + '" data-w="' + (w || 220) + '" data-h="' + (h || 136) + '" style="border-radius:10px;display:block;margin:0 auto"></canvas>'; }
  function buildingShowcaseHtml(b, w, h) {
    if (!b) return '';
    return '<canvas class="building-showcase" data-bid="' + esc(b.id) + '" data-w="' + (w || 210) + '" data-h="' + (h || 92) + '" style="border-radius:8px;display:block;margin:6px auto"></canvas>';
  }
  function relicShowcaseHtml(item, w, h) {
    const eq = item && (item.eq || item.gear || item);
    const tier = (item && item.tier) || (eq && eq.tier) || 1;
    const el = (eq && eq.element) || '';
    const leg = !!(item && (item.legendary || item.rarity === 'Legendary' || tier >= 6));
    const slot = (eq && eq.slot) || (item && item.broadCat === 'EQUIPMENT' ? 'WEAPON' : 'RELIC');
    return '<canvas class="relic-showcase" data-tier="' + tier + '" data-slot="' + esc(slot) + '" data-el="' + esc(el) + '" data-leg="' + (leg ? '1' : '0') + '" data-w="' + (w || 180) + '" data-h="' + (h || 82) + '" style="border-radius:8px;display:block;margin:6px auto"></canvas>';
  }
  function renderSubTabBar(actionName, activeKey, tabs, labelTh) {
    return '<div class="card subtab-bar" style="padding:6px 8px;margin:6px 0 10px 0;border-color:var(--gold);background:rgba(233,205,133,0.05)">' +
      (labelTh ? '<div class="muted" style="font-size:11px;margin-bottom:4px">📂 <b>' + esc(labelTh) + ':</b> เลือกหมวดย่อยเพื่อแสดงเฉพาะส่วนที่ต้องการโดยไม่ต้องเลื่อนยาว</div>' : '') +
      '<div style="display:flex;gap:5px;flex-wrap:wrap">' +
      tabs.map(([k, lbl]) => '<button type="button" class="btn' + (activeKey === k ? ' pri' : '') + '" style="padding:3px 9px;font-size:11px" data-do="' + actionName + '" data-arg="' + esc(k) + '">' + lbl + '</button>').join('') +
      '</div></div>';
  }
  function subPane(activeKey, paneKey, htmlContent) {
    if (!htmlContent) return '';
    const vis = (activeKey === 'ALL' || activeKey === paneKey);
    return '<div class="subcat-pane" data-subcat="' + esc(paneKey) + '"' + (vis ? '' : ' style="display:none"') + '>' + htmlContent + '</div>';
  }
  UI.renderSubTabBar = renderSubTabBar;
  UI.subPane = subPane;
  function drawPortraits(root) {
    root.querySelectorAll('canvas.pt').forEach(cv => { const n = UI.G.W.byId[cv.dataset.pid]; if (n) Render.portrait(cv, n, +cv.dataset.size); });
    root.querySelectorAll('canvas.diorama').forEach(cv => { const n = UI.G.W.byId[cv.dataset.pid]; if (n && Render.diorama) Render.diorama(cv, n, { width: +cv.dataset.w || 220, height: +cv.dataset.h || 136, pose: UI.dioramaPose || 'cultivate' }); });
    root.querySelectorAll('canvas.relic-showcase').forEach(cv => {
      if (Render.relicShowcase) {
        Render.relicShowcase(cv, {
          tier: +cv.dataset.tier || 3,
          slot: cv.dataset.slot || 'WEAPON',
          element: cv.dataset.el || 'METAL',
          legendary: cv.dataset.leg === '1'
        }, { width: +cv.dataset.w || 180, height: +cv.dataset.h || 82 });
      }
    });
    root.querySelectorAll('canvas.building-showcase').forEach(cv => {
      const b = UI.G && UI.G.W && UI.G.W.map && UI.G.W.map.byId && UI.G.W.map.byId[cv.dataset.bid];
      if (b && Render.buildingShowcase) {
        Render.buildingShowcase(cv, b, { width: +cv.dataset.w || 210, height: +cv.dataset.h || 92 });
      }
    });
  }
  function nameLink(n) { return '<a class="link-ref" data-npc="' + n.id + '" style="color:var(--blue);text-decoration:none">' + esc(n.h.name.given) + '</a>'; }
  const SVG_ICONS = {
    stones: "<svg class=\"svg-ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><polygon points=\"12,2 21,9 17,21 7,21 3,9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"/><polyline points=\"3,9 12,13 21,9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\"/><line x1=\"12\" y1=\"13\" x2=\"12\" y2=\"21\" stroke=\"currentColor\" stroke-width=\"1.6\"/></svg>",
    food: "<svg class=\"svg-ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 12h16a8 8 0 0 1-16 0z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M8 19h8M7 9c0-1.5 1-2.5 1-4M12 9c0-1.5 1-2.5 1-4M17 9c0-1.5 1-2.5 1-4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg>",
    people: "<svg class=\"svg-ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"9\" cy=\"8\" r=\"3.2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M3.5 19c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"17\" cy=\"9\" r=\"2.3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.5 14.2c2.3.3 4.3 2 4.3 4.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/></svg>",
    fame: "<svg class=\"svg-ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"9\" r=\"5.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M9 14l-2 7 5-2.5L17 21l-2-7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linejoin=\"round\"/></svg>"
  };
  UI.icon = name => SVG_ICONS[name] || "";

  /* ---------- Patch v2.0.30: Atmospheric Web Audio API Synthesizer (100% Offline Oscillators) ---------- */
  const SFX = {
    muted: false,
    _ctx: null,
    stats: { bell: 0, blade: 0, guqin: 0 },
    init() {
      try {
        if (typeof localStorage !== 'undefined') {
          const saved = localStorage.getItem('jhs_audio_muted');
          if (saved != null) SFX.muted = saved === '1';
        }
      } catch (e) {}
    },
    getContext() {
      if (SFX.muted) return null;
      if (SFX._ctx) return SFX._ctx;
      const Ctx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) || (typeof globalThis !== 'undefined' && (globalThis.AudioContext || globalThis.webkitAudioContext));
      if (!Ctx) return null;
      try {
        SFX._ctx = new Ctx();
        if (SFX._ctx && SFX._ctx.state === 'suspended' && SFX._ctx.resume) SFX._ctx.resume();
      } catch (e) {
        SFX._ctx = null;
      }
      return SFX._ctx;
    },
    toggleMute(forceState) {
      SFX.muted = typeof forceState === 'boolean' ? forceState : !SFX.muted;
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem('jhs_audio_muted', SFX.muted ? '1' : '0');
      } catch (e) {}
      return SFX.muted;
    },
    playBell() {
      SFX.stats.bell = (SFX.stats.bell || 0) + 1;
      if (SFX.muted) return { ok: true, muted: true, sound: 'RESONANT_ZEN_BELL' };
      const ctx = SFX.getContext();
      if (!ctx) return { ok: true, simulated: true, sound: 'RESONANT_ZEN_BELL' };
      try {
        const now = ctx.currentTime;
        [528, 1056, 1584].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.14 / (i + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.45 - i * 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.5);
        });
      } catch (e) {}
      return { ok: true, sound: 'RESONANT_ZEN_BELL' };
    },
    playBladeClash() {
      SFX.stats.blade = (SFX.stats.blade || 0) + 1;
      if (SFX.muted) return { ok: true, muted: true, sound: 'CRISP_BLADE_CLASH' };
      const ctx = SFX.getContext();
      if (!ctx) return { ok: true, simulated: true, sound: 'CRISP_BLADE_CLASH' };
      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(1920, now);
        osc1.frequency.exponentialRampToValueAtTime(540, now + 0.18);
        osc2.frequency.setValueAtTime(2680, now);
        osc2.frequency.exponentialRampToValueAtTime(1120, now + 0.22);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.25);
        osc2.stop(now + 0.25);
      } catch (e) {}
      return { ok: true, sound: 'CRISP_BLADE_CLASH' };
    },
    playGuqinChime() {
      SFX.stats.guqin = (SFX.stats.guqin || 0) + 1;
      if (SFX.muted) return { ok: true, muted: true, sound: 'PENTATONIC_GUQIN_CHIME' };
      const ctx = SFX.getContext();
      if (!ctx) return { ok: true, simulated: true, sound: 'PENTATONIC_GUQIN_CHIME' };
      try {
        const now = ctx.currentTime;
        const notes = [523.25, 587.33, 659.25, 783.99, 880.0];
        notes.slice(0, 3).forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + idx * 0.09;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.10, start);
          gain.gain.exponentialRampToValueAtTime(0.0009, start + 0.65);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.68);
        });
      } catch (e) {}
      return { ok: true, sound: 'PENTATONIC_GUQIN_CHIME' };
    }
  };
  SFX.init();
  UI.audio = SFX;
  g.SFX = SFX;


  /* ---------- Wuxia Item Sprite Atlas & Paginated Icon-Grid Engine ---------- */
  const ITEM_ATLAS_URI = "data:image/png;base64,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";
  const ITEM_ATLAS_CELLS = [{"cell":0,"col":0,"row":0,"x":0,"y":0,"w":64,"h":64,"key":"LEG_WPN_YITIAN_SWORD","group":"legendary_weapon"},{"cell":1,"col":1,"row":0,"x":64,"y":0,"w":64,"h":64,"key":"LEG_WPN_XUANTIE_HEAVY_SWORD","group":"legendary_weapon"},{"cell":2,"col":2,"row":0,"x":128,"y":0,"w":64,"h":64,"key":"LEG_WPN_TULONG_SABER","group":"legendary_weapon"},{"cell":3,"col":3,"row":0,"x":192,"y":0,"w":64,"h":64,"key":"LEG_WPN_FULL_MOON_SCIMITAR","group":"legendary_weapon"},{"cell":4,"col":4,"row":0,"x":256,"y":0,"w":64,"h":64,"key":"LEG_WPN_XIAOLI_HEART_DAGGER","group":"legendary_weapon"},{"cell":5,"col":5,"row":0,"x":320,"y":0,"w":64,"h":64,"key":"LEG_WPN_DAGOU_JADE_STAFF","group":"legendary_weapon"},{"cell":6,"col":6,"row":0,"x":384,"y":0,"w":64,"h":64,"key":"LEG_WPN_OVERLORD_SPEAR","group":"legendary_weapon"},{"cell":7,"col":7,"row":0,"x":448,"y":0,"w":64,"h":64,"key":"LEG_WPN_OATHBREAKER_DRAGON_LANCE","group":"legendary_weapon"},{"cell":8,"col":0,"row":1,"x":0,"y":64,"w":64,"h":64,"key":"LEG_WPN_WRATHFUL_TIGER_GAUNTLETS","group":"legendary_weapon"},{"cell":9,"col":1,"row":1,"x":64,"y":64,"w":64,"h":64,"key":"LEG_WPN_CONDOR_METEOR_BOW","group":"legendary_weapon"},{"cell":10,"col":2,"row":1,"x":128,"y":64,"w":64,"h":64,"key":"LEG_WPN_PEACOCK_PLUME_FOCUS","group":"legendary_weapon"},{"cell":11,"col":3,"row":1,"x":192,"y":64,"w":64,"h":64,"key":"LEG_MANTRA_TAIXUAN_SCRIPTURE","group":"legendary_tech"},{"cell":12,"col":4,"row":1,"x":256,"y":64,"w":64,"h":64,"key":"LEG_MANTRA_SIX_MERIDIAN_QI","group":"legendary_tech"},{"cell":13,"col":5,"row":1,"x":320,"y":64,"w":64,"h":64,"key":"LEG_MANTRA_DRAGON_ELEPHANT_PRAJNA","group":"legendary_tech"},{"cell":14,"col":6,"row":1,"x":384,"y":64,"w":64,"h":64,"key":"LEG_MANTRA_DIAMOND_INDESTRUCTIBLE","group":"legendary_tech"},{"cell":15,"col":7,"row":1,"x":448,"y":64,"w":64,"h":64,"key":"LEG_MANTRA_EIGHT_DESOLATIONS_GOD","group":"legendary_tech"},{"cell":16,"col":0,"row":2,"x":0,"y":128,"w":64,"h":64,"key":"LEG_MANTRA_CELESTIAL_MANDATE_CANON","group":"legendary_tech"},{"cell":17,"col":1,"row":2,"x":64,"y":128,"w":64,"h":64,"key":"LEG_MANTRA_ASHURA_BLOOD_SEA","group":"legendary_tech"},{"cell":18,"col":2,"row":2,"x":128,"y":128,"w":64,"h":64,"key":"LEG_MANTRA_TEN_THOUSAND_GU_MONARCH","group":"legendary_tech"},{"cell":19,"col":3,"row":2,"x":192,"y":128,"w":64,"h":64,"key":"LEG_MANTRA_NINE_YIN_SOUL_MIRROR","group":"legendary_tech"},{"cell":20,"col":4,"row":2,"x":256,"y":128,"w":64,"h":64,"key":"LEG_MANTRA_LITTLE_LI_HEART_BLADE","group":"legendary_tech"},{"cell":21,"col":5,"row":2,"x":320,"y":128,"w":64,"h":64,"key":"LEG_COMBAT_DUGU_NINE_SWORDS","group":"legendary_tech"},{"cell":22,"col":6,"row":2,"x":384,"y":128,"w":64,"h":64,"key":"LEG_COMBAT_DRAGON_SUBDUING_PALMS","group":"legendary_tech"},{"cell":23,"col":7,"row":2,"x":448,"y":128,"w":64,"h":64,"key":"LEG_COMBAT_FEIXIAN_ONE_SWORD","group":"legendary_tech"},{"cell":24,"col":0,"row":3,"x":0,"y":192,"w":64,"h":64,"key":"LEG_AUX_QIANKUN_SHIFT","group":"legendary_tech"},{"cell":25,"col":1,"row":3,"x":64,"y":192,"w":64,"h":64,"key":"LEG_AUX_LINGXI_ONE_FINGER","group":"legendary_tech"},{"cell":26,"col":2,"row":3,"x":128,"y":192,"w":64,"h":64,"key":"LEG_LIGHT_LINGBO_STEP","group":"legendary_tech"},{"cell":27,"col":3,"row":3,"x":192,"y":192,"w":64,"h":64,"key":"LEG_LIGHT_MOON_BAT_SHADOW","group":"legendary_tech"},{"cell":28,"col":4,"row":3,"x":256,"y":192,"w":64,"h":64,"key":"LEG_FORB_STAR_ABSORBING_VORTEX","group":"legendary_tech"},{"cell":29,"col":5,"row":3,"x":320,"y":192,"w":64,"h":64,"key":"LEG_FORB_BLOOD_LOTUS_SACRIFICE","group":"legendary_tech"},{"cell":30,"col":6,"row":3,"x":384,"y":192,"w":64,"h":64,"key":"LEG_PASS_MINGYU_IMMORTAL_QI","group":"legendary_tech"},{"cell":31,"col":7,"row":3,"x":448,"y":192,"w":64,"h":64,"key":"LEG_PASS_NINE_YANG_MERIDIAN","group":"legendary_tech"},{"cell":32,"col":0,"row":4,"x":0,"y":256,"w":64,"h":64,"key":"LEG_PASS_DUGU_SWORD_HEART","group":"legendary_tech"},{"cell":33,"col":1,"row":4,"x":64,"y":256,"w":64,"h":64,"key":"PILL_HEAL_RED","group":"pill"},{"cell":34,"col":2,"row":4,"x":128,"y":256,"w":64,"h":64,"key":"PILL_QI_AZURE","group":"pill"},{"cell":35,"col":3,"row":4,"x":192,"y":256,"w":64,"h":64,"key":"PILL_BREAK_GOLD","group":"pill"},{"cell":36,"col":4,"row":4,"x":256,"y":256,"w":64,"h":64,"key":"PILL_DETOX_EMERALD","group":"pill"},{"cell":37,"col":5,"row":4,"x":320,"y":256,"w":64,"h":64,"key":"PILL_CALM_VIOLET","group":"pill"},{"cell":38,"col":6,"row":4,"x":384,"y":256,"w":64,"h":64,"key":"PILL_BODY_AMBER","group":"pill"},{"cell":39,"col":7,"row":4,"x":448,"y":256,"w":64,"h":64,"key":"WPN_SWORD_COMMON","group":"weapon"},{"cell":40,"col":0,"row":5,"x":0,"y":320,"w":64,"h":64,"key":"WPN_SABER_COMMON","group":"weapon"},{"cell":41,"col":1,"row":5,"x":64,"y":320,"w":64,"h":64,"key":"WPN_SPEAR_COMMON","group":"weapon"},{"cell":42,"col":2,"row":5,"x":128,"y":320,"w":64,"h":64,"key":"WPN_STAFF_COMMON","group":"weapon"},{"cell":43,"col":3,"row":5,"x":192,"y":320,"w":64,"h":64,"key":"WPN_DAGGER_COMMON","group":"weapon"},{"cell":44,"col":4,"row":5,"x":256,"y":320,"w":64,"h":64,"key":"WPN_GAUNTLET_COMMON","group":"weapon"},{"cell":45,"col":5,"row":5,"x":320,"y":320,"w":64,"h":64,"key":"WPN_BOW_COMMON","group":"weapon"},{"cell":46,"col":6,"row":5,"x":384,"y":320,"w":64,"h":64,"key":"EQP_ARMOR_ROBE","group":"armor"},{"cell":47,"col":7,"row":5,"x":448,"y":320,"w":64,"h":64,"key":"EQP_ARMOR_HEAVY","group":"armor"},{"cell":48,"col":0,"row":6,"x":0,"y":384,"w":64,"h":64,"key":"EQP_HELM_CROWN","group":"armor"},{"cell":49,"col":1,"row":6,"x":64,"y":384,"w":64,"h":64,"key":"EQP_BOOTS_STEP","group":"armor"},{"cell":50,"col":2,"row":6,"x":128,"y":384,"w":64,"h":64,"key":"EQP_RING_PENDANT","group":"armor"},{"cell":51,"col":3,"row":6,"x":192,"y":384,"w":64,"h":64,"key":"EQP_TALISMAN_RELIC","group":"armor"},{"cell":52,"col":4,"row":6,"x":256,"y":384,"w":64,"h":64,"key":"MAT_HERB_LEAF","group":"material"},{"cell":53,"col":5,"row":6,"x":320,"y":384,"w":64,"h":64,"key":"MAT_FLOWER_ROOT","group":"material"},{"cell":54,"col":6,"row":6,"x":384,"y":384,"w":64,"h":64,"key":"MAT_ORE_INGOT","group":"material"},{"cell":55,"col":7,"row":6,"x":448,"y":384,"w":64,"h":64,"key":"MAT_JADE_CRYSTAL","group":"material"},{"cell":56,"col":0,"row":7,"x":0,"y":448,"w":64,"h":64,"key":"MAT_BEAST_CORE","group":"material"},{"cell":57,"col":1,"row":7,"x":64,"y":448,"w":64,"h":64,"key":"MAT_BEAST_PART","group":"material"},{"cell":58,"col":2,"row":7,"x":128,"y":448,"w":64,"h":64,"key":"BOOK_TECH_SCROLL","group":"manual"},{"cell":59,"col":3,"row":7,"x":192,"y":448,"w":64,"h":64,"key":"BOOK_SUBPATH_CRYSTAL","group":"manual"},{"cell":60,"col":4,"row":7,"x":256,"y":448,"w":64,"h":64,"key":"BOOK_RECIPE_SCROLL","group":"manual"},{"cell":61,"col":5,"row":7,"x":320,"y":448,"w":64,"h":64,"key":"ITEM_PROVISION_STONE","group":"other"},{"cell":62,"col":6,"row":7,"x":384,"y":448,"w":64,"h":64,"key":"FALLBACK_UNKNOWN_LEGENDARY","group":"fallback"},{"cell":63,"col":7,"row":7,"x":448,"y":448,"w":64,"h":64,"key":"FALLBACK_GENERIC","group":"fallback"},{"cell":64,"col":0,"row":8,"x":0,"y":512,"w":64,"h":64,"key":"FISH_COMMON_SILVER","group":"fish"},{"cell":65,"col":1,"row":8,"x":64,"y":512,"w":64,"h":64,"key":"FISH_REFINED_GOLD","group":"fish"},{"cell":66,"col":2,"row":8,"x":128,"y":512,"w":64,"h":64,"key":"FISH_RARE_KOI_EEL","group":"fish"},{"cell":67,"col":3,"row":8,"x":192,"y":512,"w":64,"h":64,"key":"FISH_EXCEPTIONAL_STAR","group":"fish"},{"cell":68,"col":4,"row":8,"x":256,"y":512,"w":64,"h":64,"key":"FISH_APEX_DRAGON","group":"fish"},{"cell":69,"col":5,"row":8,"x":320,"y":512,"w":64,"h":64,"key":"FOOD_SPIRIT_FISH_DISH","group":"food"},{"cell":70,"col":6,"row":8,"x":384,"y":512,"w":64,"h":64,"key":"ITEM_MYSTERY_RIVER_CONTAINER","group":"container"},{"cell":71,"col":7,"row":8,"x":448,"y":512,"w":64,"h":64,"key":"TRASH_RIVER_DEBRIS","group":"trash"},{"cell":72,"col":0,"row":9,"x":0,"y":576,"w":64,"h":64,"key":"LEG_WPN_JIUXIAO_PHOENIX_ZITHER","group":"legendary_weapon"},{"cell":73,"col":1,"row":9,"x":64,"y":576,"w":64,"h":64,"key":"LEG_WPN_CHUNQIU_JUDGMENT_BRUSH","group":"legendary_weapon"},{"cell":74,"col":2,"row":9,"x":128,"y":576,"w":64,"h":64,"key":"LEG_WPN_TIANCAN_FATE_WHIP","group":"legendary_weapon"},{"cell":75,"col":3,"row":9,"x":192,"y":576,"w":64,"h":64,"key":"LEG_COMBAT_NINE_HEAVENS_GUANG_LING","group":"legendary_tech"},{"cell":76,"col":4,"row":9,"x":256,"y":576,"w":64,"h":64,"key":"LEG_AUX_HEAVEN_INSCRIPTION_SEAL","group":"legendary_tech"},{"cell":77,"col":5,"row":9,"x":320,"y":576,"w":64,"h":64,"key":"LEG_COMBAT_SAMSARA_PUPPET_THREADS","group":"legendary_tech"},{"cell":78,"col":6,"row":9,"x":384,"y":576,"w":64,"h":64,"key":"LEG_MANTRA_SHENNONG_MYRIAD_CRUCIBLE","group":"legendary_tech"},{"cell":79,"col":7,"row":9,"x":448,"y":576,"w":64,"h":64,"key":"WPN_ZITHER_COMMON","group":"weapon"},{"cell":80,"col":0,"row":10,"x":0,"y":640,"w":64,"h":64,"key":"WPN_BRUSH_COMMON","group":"weapon"},{"cell":81,"col":1,"row":10,"x":64,"y":640,"w":64,"h":64,"key":"WPN_WHIP_COMMON","group":"weapon"},{"cell":82,"col":2,"row":10,"x":128,"y":640,"w":64,"h":64,"key":"WPN_FOCUS_COMMON","group":"weapon"},{"cell":83,"col":3,"row":10,"x":192,"y":640,"w":64,"h":64,"key":"MAT_ZITHER_WOOD_STRING","group":"material"},{"cell":84,"col":4,"row":10,"x":256,"y":640,"w":64,"h":64,"key":"MAT_BRUSH_HAIR_CINNABAR","group":"material"},{"cell":85,"col":5,"row":10,"x":320,"y":640,"w":64,"h":64,"key":"MAT_WHIP_SILK_TENDON","group":"material"},{"cell":86,"col":6,"row":10,"x":384,"y":640,"w":64,"h":64,"key":"EQP_NECKLACE_BEADS","group":"armor"},{"cell":87,"col":7,"row":10,"x":448,"y":640,"w":64,"h":64,"key":"EQP_BRACELET_BANGLE","group":"armor"},{"cell":88,"col":0,"row":11,"x":0,"y":704,"w":64,"h":64,"key":"LEG_AUX_IMPERIAL_EIGHT_GATES","group":"legendary_tech"},{"cell":89,"col":1,"row":11,"x":64,"y":704,"w":64,"h":64,"key":"LEG_MANTRA_SOVEREIGN_HEAVEN_EDICT","group":"legendary_tech"},{"cell":90,"col":2,"row":11,"x":128,"y":704,"w":64,"h":64,"key":"LEG_COMBAT_JADE_NIRVANA_HARMONY","group":"legendary_tech"},{"cell":91,"col":3,"row":11,"x":192,"y":704,"w":64,"h":64,"key":"LEG_LIGHT_KUNPENG_ASTRAL_WINGS","group":"legendary_tech"},{"cell":92,"col":4,"row":11,"x":256,"y":704,"w":64,"h":64,"key":"LEG_FORB_SAMSARA_KARMA_REVERSAL","group":"legendary_tech"},{"cell":93,"col":5,"row":11,"x":320,"y":704,"w":64,"h":64,"key":"LEG_ARM_CELESTIAL_CRANE_ROBE","group":"legendary_weapon"},{"cell":94,"col":6,"row":11,"x":384,"y":704,"w":64,"h":64,"key":"LEG_ARM_SHADOW_KIRIN_CUIRASS","group":"legendary_weapon"},{"cell":95,"col":7,"row":11,"x":448,"y":704,"w":64,"h":64,"key":"LEG_ARM_IMMORTAL_TORTOISE_PLATE","group":"legendary_weapon"},{"cell":96,"col":0,"row":12,"x":0,"y":768,"w":64,"h":64,"key":"LEG_ACC_SAMSARA_KARMA_RING","group":"legendary_weapon"},{"cell":97,"col":1,"row":12,"x":64,"y":768,"w":64,"h":64,"key":"LEG_ACC_BODHI_STARLIGHT_BEADS","group":"legendary_weapon"},{"cell":98,"col":2,"row":12,"x":128,"y":768,"w":64,"h":64,"key":"LEG_ACC_TAICHI_HEAVEN_SEAL","group":"legendary_weapon"},{"cell":99,"col":3,"row":12,"x":192,"y":768,"w":64,"h":64,"key":"LEG_ACC_DRAGON_PHOENIX_BANGLE","group":"legendary_weapon"},{"cell":100,"col":4,"row":12,"x":256,"y":768,"w":64,"h":64,"key":"MANUAL_SECT_HERITAGE","group":"book"},{"cell":101,"col":5,"row":12,"x":320,"y":768,"w":64,"h":64,"key":"TOKEN_MENTOR_SEAL","group":"book"},{"cell":102,"col":6,"row":12,"x":384,"y":768,"w":64,"h":64,"key":"SCROLL_JIANGHU_RUMOR","group":"book"},{"cell":103,"col":7,"row":12,"x":448,"y":768,"w":64,"h":64,"key":"TOKEN_KARMA_BOND","group":"book"}];
  const ITEM_ATLAS_BY_KEY = {};
  ITEM_ATLAS_CELLS.forEach(c => { ITEM_ATLAS_BY_KEY[c.key] = c; });
  [
    {"cell":104,"col":0,"row":0,"x":0,"y":0,"w":64,"h":64,"key":"LEG_WPN_BODHI_NIRVANA_ROSARY","group":"legendary_weapon"},
    {"cell":105,"col":1,"row":0,"x":64,"y":0,"w":64,"h":64,"key":"LEG_WPN_TAOTIE_DEVOURING_CLAW","group":"legendary_weapon"},
    {"cell":106,"col":2,"row":0,"x":128,"y":0,"w":64,"h":64,"key":"LEG_WPN_BAIHUA_SOUL_NEEDLE","group":"legendary_weapon"},
    {"cell":107,"col":3,"row":0,"x":192,"y":0,"w":64,"h":64,"key":"LEG_WPN_BAJIAO_TEMPEST_FAN","group":"legendary_weapon"},
    {"cell":108,"col":4,"row":0,"x":256,"y":0,"w":64,"h":64,"key":"LEG_WPN_HETU_LUOSHU_ASTROLABE","group":"legendary_weapon"},
    {"cell":109,"col":5,"row":0,"x":320,"y":0,"w":64,"h":64,"key":"LEG_WPN_CAISHEN_GOLDEN_ABACUS","group":"legendary_weapon"}
  ].forEach(c => { ITEM_ATLAS_BY_KEY[c.key] = c; });
  UI.ITEM_ATLAS_URI = ITEM_ATLAS_URI;
  UI.ITEM_ATLAS_CELLS = ITEM_ATLAS_CELLS;

  UI.getInvViewMode = () => {
    const o = UI.G && UI.G.opts;
    if (o && (o.invViewMode === "list" || o.invViewMode === "grid")) return o.invViewMode;
    try {
      const saved = localStorage.getItem("jh_inv_view_mode");
      if (saved === "list" || saved === "grid") return saved;
    } catch (e) {}
    return "grid";
  };

  UI.setInvViewMode = mode => {
    const m = mode === "list" ? "list" : "grid";
    if (UI.G && UI.G.opts) UI.G.opts.invViewMode = m;
    try {
      localStorage.setItem("jh_inv_view_mode", m);
      if (UI.G && UI.G.opts) localStorage.setItem("jhs_opts", JSON.stringify(UI.G.opts));
    } catch (e) {}
  };

  UI.broadCategoryOf = item => {
    if (!item) return "OTHER";
    const k = item.rawKind || item.kind || "";
    if (k === "PILL" || k === "CRAFTED_PILL" || k === "pill") return "PILL";
    if (k === "EQUIPPED" || k === "EQUIPMENT" || k === "gear") return "EQUIPMENT";
    if (k === "MATERIAL" || k === "ORGAN" || k === "mat") return "MATERIAL";
    if (k === "TECH_MANUAL" || k === "SUB_MANUAL" || k === "CRYSTAL" || k === "RECIPE_SCROLL" || k === "crystal" || k === "tech" || k === "sub_manual") return "MANUAL";
    return "OTHER";
  };

  UI.resolveItemAtlasCell = item => {
    if (!item) return ITEM_ATLAS_BY_KEY.FALLBACK_GENERIC;
    const rawId = String(item.templateId || item.itemId || item.id || item.key || "").replace(/^(P:|T:|S:)/, "");
    if (ITEM_ATLAS_BY_KEY[rawId]) return ITEM_ATLAS_BY_KEY[rawId];
    const eq = item.gear || item.eq || item;
    if (eq && eq.id && ITEM_ATLAS_BY_KEY[eq.id]) return ITEM_ATLAS_BY_KEY[eq.id];
    const isLeg = !!(item.legendary || (eq && eq.legendary) || item.rarity === "Legendary" || item.grade === "Legendary" || /^LEG_/.test(rawId));
    if (isLeg) return ITEM_ATLAS_BY_KEY.FALLBACK_UNKNOWN_LEGENDARY;

    const k = item.rawKind || item.kind || "";
    if (k === "PILL" || k === "CRAFTED_PILL" || k === "pill") {
      const pid = String(item.id || item.key || "");
      const info = (ECO && ECO.pillInfo && ECO.pillInfo(pid)) || {};
      const eff = info.effect || {};
      if (eff.breakthroughBonus || eff.btFor) return ITEM_ATLAS_BY_KEY.PILL_BREAK_GOLD;
      if (eff.clearToxic || eff.clearPoison || /DETOX|ANTIDOTE/.test(pid)) return ITEM_ATLAS_BY_KEY.PILL_DETOX_EMERALD;
      if (eff.clearHeartDemon || eff.insight || /CALM|MIND|SOUL/.test(pid)) return ITEM_ATLAS_BY_KEY.PILL_CALM_VIOLET;
      if (eff.cultivationProgress || eff.qiRestore || /QI/.test(pid)) return ITEM_ATLAS_BY_KEY.PILL_QI_AZURE;
      if (eff.cbBuff || eff.energyRestore || /VIGOR|BODY/.test(pid)) return ITEM_ATLAS_BY_KEY.PILL_BODY_AMBER;
      return ITEM_ATLAS_BY_KEY.PILL_HEAL_RED;
    }
    if (k === "EQUIPPED" || k === "EQUIPMENT" || k === "gear") {
      const slot = (eq && eq.slot) || item.slot || "WEAPON";
      const gType = (g.MARTIAL && g.MARTIAL.gearType) ? g.MARTIAL.gearType(eq) : (eq.gearType || eq.type || "");
      const nm = String(item.nameTh || (eq && eq.nameTh) || "");
      if (slot === "ARMOR") {
        if (/เกราะ|โลหะ|หนัก/.test(nm)) return ITEM_ATLAS_BY_KEY.EQP_ARMOR_HEAVY;
        if (/รองเท้า|บู๊ต/.test(nm)) return ITEM_ATLAS_BY_KEY.EQP_BOOTS_STEP;
        if (/หมวก|รัดเกล้า|มงกุฎ/.test(nm)) return ITEM_ATLAS_BY_KEY.EQP_HELM_CROWN;
        return ITEM_ATLAS_BY_KEY.EQP_ARMOR_ROBE;
      }
      if (slot === "ACCESSORY") {
        if (gType === "NECKLACE" || /สร้อย|จี้|ประคำ/.test(nm)) return ITEM_ATLAS_BY_KEY.EQP_NECKLACE_BEADS || ITEM_ATLAS_BY_KEY.EQP_RING_PENDANT;
        if (gType === "BRACELET" || /กำไล|ข้อมือ/.test(nm)) return ITEM_ATLAS_BY_KEY.EQP_BRACELET_BANGLE || ITEM_ATLAS_BY_KEY.EQP_RING_PENDANT;
        if (/ยันต์|ป้าย|ตรา|กระดิ่ง|เข็ม/.test(nm)) return ITEM_ATLAS_BY_KEY.EQP_TALISMAN_RELIC;
        return ITEM_ATLAS_BY_KEY.EQP_RING_PENDANT;
      }
      if (gType === "ZITHER" || /พิณ|ขลุ่ย|สังข์|ระฆัง|กลอง/.test(nm)) return ITEM_ATLAS_BY_KEY.WPN_ZITHER_COMMON;
      if (gType === "BRUSH" || /พู่กัน|สิ่วจารึก/.test(nm)) return ITEM_ATLAS_BY_KEY.WPN_BRUSH_COMMON;
      if (gType === "WHIP" || /แส้|ด้าย|เส้นไหม|โซ่/.test(nm)) return ITEM_ATLAS_BY_KEY.WPN_WHIP_COMMON;
      if (gType === "FOCUS" || /สื่อปราณ|พัด|ลูกแก้ว/.test(nm)) return ITEM_ATLAS_BY_KEY.WPN_FOCUS_COMMON;
      if (gType === "BLADE" || /ดาบ/.test(nm)) return ITEM_ATLAS_BY_KEY.WPN_SABER_COMMON;
      if (gType === "SPEAR" || /ทวน|หอก/.test(nm)) return ITEM_ATLAS_BY_KEY.WPN_SPEAR_COMMON;
      if (gType === "STAFF" || /พลอง|ไม้เท้า/.test(nm)) return ITEM_ATLAS_BY_KEY.WPN_STAFF_COMMON;
      if (gType === "DAGGER" || /มีดสั้น/.test(nm)) return ITEM_ATLAS_BY_KEY.WPN_DAGGER_COMMON;
      if (gType === "GAUNTLET" || gType === "FIST" || gType === "FIST_PALM" || /สนับมือ|ถุงมือ/.test(nm)) return ITEM_ATLAS_BY_KEY.WPN_GAUNTLET_COMMON;
      if (gType === "BOW" || /ธนู|หน้าไม้/.test(nm)) return ITEM_ATLAS_BY_KEY.WPN_BOW_COMMON;
      return ITEM_ATLAS_BY_KEY.WPN_SWORD_COMMON;
    }
    if (rawId === "ITEM_MYSTERY_RIVER_CONTAINER" || k === "CONTAINER") return ITEM_ATLAS_BY_KEY.ITEM_MYSTERY_RIVER_CONTAINER;
    if (rawId === "TRASH_RIVER_DEBRIS" || k === "TRASH") return ITEM_ATLAS_BY_KEY.TRASH_RIVER_DEBRIS;
    if (/^FOOD_/.test(rawId) || k === "FOOD") return ITEM_ATLAS_BY_KEY.FOOD_SPIRIT_FISH_DISH;
    if (/^MAT_FISH_/.test(rawId) || k === "FISH") {
      const fTier = item.tier || (ECO.matById[rawId] && ECO.matById[rawId].tier) || 1;
      if (fTier >= 5) return ITEM_ATLAS_BY_KEY.FISH_APEX_DRAGON;
      if (fTier === 4) return ITEM_ATLAS_BY_KEY.FISH_EXCEPTIONAL_STAR;
      if (fTier === 3) return ITEM_ATLAS_BY_KEY.FISH_RARE_KOI_EEL;
      if (fTier === 2) return ITEM_ATLAS_BY_KEY.FISH_REFINED_GOLD;
      return ITEM_ATLAS_BY_KEY.FISH_COMMON_SILVER;
    }
    if (k === "ORGAN") return ITEM_ATLAS_BY_KEY.MAT_BEAST_CORE;
    if (k === "MATERIAL" || k === "mat") {
      if (/MAT_ZITHER_/.test(rawId)) return ITEM_ATLAS_BY_KEY.MAT_ZITHER_WOOD_STRING;
      if (/MAT_BRUSH_/.test(rawId)) return ITEM_ATLAS_BY_KEY.MAT_BRUSH_HAIR_CINNABAR;
      if (/MAT_WHIP_/.test(rawId)) return ITEM_ATLAS_BY_KEY.MAT_WHIP_SILK_TENDON;
      if (/CORE|BLOOD|SOUL/.test(rawId)) return ITEM_ATLAS_BY_KEY.MAT_BEAST_CORE;
      if (/BEAST|FANG|CLAW|HIDE|BONE|SCALE|HORN|SHELL|VENOM|SILK|PEARL|FIN/.test(rawId)) return ITEM_ATLAS_BY_KEY.MAT_BEAST_PART;
      if (/JADE|CRYSTAL|ICE|GEM/.test(rawId)) return ITEM_ATLAS_BY_KEY.MAT_JADE_CRYSTAL;
      if (/ORE|IRON|COPPER|SILVER|GOLD|METAL|STONE|COAL/.test(rawId)) return ITEM_ATLAS_BY_KEY.MAT_ORE_INGOT;
      if (/LOTUS|FLOWER|ORCHID|GINSENG|ROOT|MUSHROOM|FRUIT/.test(rawId)) return ITEM_ATLAS_BY_KEY.MAT_FLOWER_ROOT;
      return ITEM_ATLAS_BY_KEY.MAT_HERB_LEAF;
    }
    if (k === "CRYSTAL" || k === "crystal") return ITEM_ATLAS_BY_KEY.BOOK_SUBPATH_CRYSTAL;
    if (k === "RECIPE_SCROLL") return ITEM_ATLAS_BY_KEY.BOOK_RECIPE_SCROLL;
    if (k === "TECH_MANUAL" || k === "SUB_MANUAL" || k === "tech" || k === "sub_manual") return ITEM_ATLAS_BY_KEY.BOOK_TECH_SCROLL;
    if (k === "PROVISION" || rawId === "grain" || rawId === "meal" || rawId === "stones") return ITEM_ATLAS_BY_KEY.ITEM_PROVISION_STONE;
    return ITEM_ATLAS_BY_KEY.FALLBACK_GENERIC;
  };

  // ITEM_ART_CATALOG_START
  const ITEM_ART = {"version":2,"grid":{"columns":8,"rows":8},"style":"Generated painterly wuxia inventory art, transparent shared atlases; WebP quality 88. Five tier sheets normalized into fixed 96px cells with subject bounds <=80px; prior four named/manual/material sheets unchanged.","sheets":{"manuals":{"url":"assets/item_art_manuals.webp","width":1254,"height":1254,"cells":["starter","sword","fist","lightness","support-lotus","defensive-shield","spirit-mantra","forbidden","yin-yang","mechanism","karma","beast","alchemy","creation","array","strategy","astrology","buddha","void","sonic","venom","shifter","weather","wanderer","merchant","geomancy","gravity","chrono","ink","soul-puppet","chaos","samurai","ninja-shadow","ninja-elements","summoner","possession","channeler","heretic","occult","devouring","nether","ancestral","tide","archive","fortune","husbandry","arena","dragon-treasure","recipe-alchemy","recipe-forging","recipe-tailoring","recipe-cooking","recipe-talisman","recipe-beast","guide-fishing","guide-farming","treasure-map","forbidden-sealed","jade-tablet","bamboo-manual","phoenix-treasure","samsara-treasure","official-decree","starter-bundle"]},"equipment":{"url":"assets/item_art_equipment.webp","width":1254,"height":1254,"cells":["LEG_WPN_YITIAN_SWORD","LEG_WPN_XUANTIE_HEAVY_SWORD","LEG_WPN_TULONG_SABER","LEG_WPN_FULL_MOON_SCIMITAR","LEG_WPN_XIAOLI_HEART_DAGGER","LEG_WPN_DAGOU_JADE_STAFF","LEG_WPN_OVERLORD_SPEAR","LEG_WPN_OATHBREAKER_DRAGON_LANCE","LEG_WPN_WRATHFUL_TIGER_GAUNTLETS","LEG_WPN_CONDOR_METEOR_BOW","LEG_WPN_PEACOCK_PLUME_FOCUS","LEG_WPN_JIUXIAO_PHOENIX_ZITHER","LEG_WPN_CHUNQIU_JUDGMENT_BRUSH","LEG_WPN_TIANCAN_FATE_WHIP","LEG_WPN_BODHI_NIRVANA_ROSARY","LEG_WPN_TAOTIE_DEVOURING_CLAW","LEG_WPN_BAIHUA_SOUL_NEEDLE","LEG_WPN_BAJIAO_TEMPEST_FAN","LEG_WPN_HETU_LUOSHU_ASTROLABE","LEG_WPN_CAISHEN_GOLDEN_ABACUS","LEG_ARM_CELESTIAL_CRANE_ROBE","LEG_ARM_SHADOW_KIRIN_CUIRASS","LEG_ARM_IMMORTAL_TORTOISE_PLATE","LEG_ACC_SAMSARA_KARMA_RING","LEG_ACC_BODHI_STARLIGHT_BEADS","LEG_ACC_TAICHI_HEAVEN_SEAL","LEG_ACC_DRAGON_PHOENIX_BANGLE","sword","blade","spear","staff","fist","bow","focus","zither","brush","whip","rosary","claw","needle","fan","astrolabe","abacus","robe","leather","heavy-armor","ring","necklace","charm","bracelet","pill-heal","pill-qi","pill-breakthrough","pill-detox","pill-soul","pill-body","pill-blood","pill-ascension","pill-longevity","pill-ice","pill-fire","pill-lightning","medicine-gourd","medicine-bottle"]},"materials":{"url":"assets/item_art_materials.webp","width":1254,"height":1254,"cells":["meat","jerky","fang","claw","hide","fur","bone","horn","scale","feather","silk-cocoon","chitin","shell","resin","blood","core","herb","ginseng","mushroom","lotus","ice-lotus","fire-flower","poison-flower","grain","copper","iron","coal","silver","gold","jade","crystal","ice-crystal","fire-crystal","lightning-crystal","wood-crystal","shadow-crystal","light-crystal","astral-crystal","space-crystal","demon-crystal","powder","silk-cloth","wood","cinnabar","phoenix-feather","heart","liver","lungs","kidney","stomach","coins","spirit-stones","wooden-chest","treasure-chest","food","talisman","sword-t1","sword-t2","sword-t3","sword-t4","sword-t5","sword-t6","sword-t7","letter"]},"legends":{"url":"assets/item_art_legends.webp","width":1254,"height":1254,"cells":["LEG_COMBAT_DUGU_NINE_SWORDS","LEG_COMBAT_DRAGON_SUBDUING_PALMS","LEG_COMBAT_FEIXIAN_ONE_SWORD","LEG_AUX_QIANKUN_SHIFT","LEG_AUX_LINGXI_ONE_FINGER","LEG_LIGHT_LINGBO_STEP","LEG_LIGHT_MOON_BAT_SHADOW","LEG_FORB_STAR_ABSORBING_VORTEX","LEG_FORB_BLOOD_LOTUS_SACRIFICE","LEG_PASS_MINGYU_IMMORTAL_QI","LEG_PASS_NINE_YANG_MERIDIAN","LEG_PASS_DUGU_SWORD_HEART","LEG_COMBAT_NINE_HEAVENS_GUANG_LING","LEG_AUX_HEAVEN_INSCRIPTION_SEAL","LEG_COMBAT_SAMSARA_PUPPET_THREADS","LEG_AUX_IMPERIAL_EIGHT_GATES","LEG_COMBAT_JADE_NIRVANA_HARMONY","LEG_LIGHT_KUNPENG_ASTRAL_WINGS","LEG_FORB_SAMSARA_KARMA_REVERSAL","LEG_V230_ASTRO_DIVINATION","LEG_V230_BUDDHA_DHARMA","LEG_V230_VOID_SPACE","LEG_V230_SONIC_HARMONY","LEG_V230_VENOM_GU","LEG_V230_PRIMORDIAL_SHIFTER","LEG_V230_CELESTIAL_WEATHER","LEG_V230_WANDERING_DAO","LEG_V230_MERCANTILE_DAO","LEG_V230_DRAGON_VEIN_GEOMANCY","LEG_V230_GRAVITY_DAO","LEG_V230_CHRONO_EPOCH","LEG_V230_INK_LITERATI","LEG_V230_SOUL_PUPPETRY","LEG_V230_PRIMORDIAL_CHAOS","LEG_V230_SHADOW_SAMURAI","LEG_V230_NINPO_SHADOW","LEG_V230_NINPO_ELEMENTAL","LEG_V230_DIVINE_SUMMONER","LEG_V230_DIVINE_POSSESSION","LEG_V230_DIVINE_CHANNELER","LEG_V230_VOID_HERETIC_PACT","LEG_V230_OCCULT_MAGE","LEG_V230_DEVOURING_FLESH","LEG_V230_NETHER_GRAVE","LEG_V230_ANCESTRAL_RITUAL","LEG_V230_TIDE_VOYAGER","LEG_V230_LORE_ARCHIVIST","LEG_V230_FORTUNE_GAMBLER","LEG_V230_SPIRIT_HUSBANDRY","LEG_V230_ARENA_GLORY","robe-t2","robe-t3","armor-t4","armor-t5","robe-t6","robe-t7","pill-breakthrough","pill-detox","pill-soul","pill-body","pill-qi","pill-resurrection","pill-demonic","pill-ascension"]},"arsenala":{"url":"assets/item_art_arsenala.webp","width":768,"height":768,"cells":["blade-t1","blade-t2","blade-t3","blade-t4","blade-t5","blade-t6","blade-t7","blade-mythic","spear-t1","spear-t2","spear-t3","spear-t4","spear-t5","spear-t6","spear-t7","spear-mythic","staff-t1","staff-t2","staff-t3","staff-t4","staff-t5","staff-t6","staff-t7","staff-mythic","fist-t1","fist-t2","fist-t3","fist-t4","fist-t5","fist-t6","fist-t7","fist-mythic","bow-t1","bow-t2","bow-t3","bow-t4","bow-t5","bow-t6","bow-t7","bow-mythic","focus-t1","focus-t2","focus-t3","focus-t4","focus-t5","focus-t6","focus-t7","focus-mythic","dagger-t1","dagger-t2","dagger-t3","dagger-t4","dagger-t5","dagger-t6","dagger-t7","dagger-mythic","zither-t1","zither-t2","zither-t3","zither-t4","zither-t5","zither-t6","zither-t7","zither-mythic"]},"arsenalb":{"url":"assets/item_art_arsenalb.webp","width":768,"height":768,"cells":["brush-t1","brush-t2","brush-t3","brush-t4","brush-t5","brush-t6","brush-t7","brush-mythic","whip-t1","whip-t2","whip-t3","whip-t4","whip-t5","whip-t6","whip-t7","whip-mythic","rosary-t1","rosary-t2","rosary-t3","rosary-t4","rosary-t5","rosary-t6","rosary-t7","rosary-mythic","claw-t1","claw-t2","claw-t3","claw-t4","claw-t5","claw-t6","claw-t7","claw-mythic","needle-t1","needle-t2","needle-t3","needle-t4","needle-t5","needle-t6","needle-t7","needle-mythic","fan-t1","fan-t2","fan-t3","fan-t4","fan-t5","fan-t6","fan-t7","fan-mythic","astrolabe-t1","astrolabe-t2","astrolabe-t3","astrolabe-t4","astrolabe-t5","astrolabe-t6","astrolabe-t7","astrolabe-mythic","abacus-t1","abacus-t2","abacus-t3","abacus-t4","abacus-t5","abacus-t6","abacus-t7","abacus-mythic"]},"attire":{"url":"assets/item_art_attire.webp","width":768,"height":768,"cells":["heavy-t1","heavy-t2","heavy-t3","heavy-t4","heavy-t5","heavy-t6","heavy-t7","heavy-mythic","light-t1","light-t2","light-t3","light-t4","light-t5","light-t6","light-t7","light-mythic","robe-t1","robe-t2","robe-t3","robe-t4","robe-t5","robe-t6","robe-t7","robe-mythic","boots-t1","boots-t2","boots-t3","boots-t4","boots-t5","boots-t6","boots-t7","boots-mythic","helmet-t1","helmet-t2","helmet-t3","helmet-t4","helmet-t5","helmet-t6","helmet-t7","helmet-mythic","ring-t1","ring-t2","ring-t3","ring-t4","ring-t5","ring-t6","ring-t7","ring-mythic","necklace-t1","necklace-t2","necklace-t3","necklace-t4","necklace-t5","necklace-t6","necklace-t7","necklace-mythic","bracelet-t1","bracelet-t2","bracelet-t3","bracelet-t4","bracelet-t5","bracelet-t6","bracelet-t7","bracelet-mythic"]},"supplies":{"url":"assets/item_art_supplies.webp","width":768,"height":768,"cells":["charm-t1","charm-t2","charm-t3","charm-t4","charm-t5","charm-t6","charm-t7","charm-mythic","ornament-t1","ornament-t2","ornament-t3","ornament-t4","ornament-t5","ornament-t6","ornament-t7","ornament-mythic","aux_tool-t1","aux_tool-t2","aux_tool-t3","aux_tool-t4","aux_tool-t5","aux_tool-t6","aux_tool-t7","aux_tool-mythic","pill_heal-t1","pill_heal-t2","pill_heal-t3","pill_heal-t4","pill_heal-t5","pill_heal-t6","pill_heal-t7","pill_heal-mythic","pill_qi-t1","pill_qi-t2","pill_qi-t3","pill_qi-t4","pill_qi-t5","pill_qi-t6","pill_qi-t7","pill_qi-mythic","pill_break-t1","pill_break-t2","pill_break-t3","pill_break-t4","pill_break-t5","pill_break-t6","pill_break-t7","pill_break-mythic","pill_detox-t1","pill_detox-t2","pill_detox-t3","pill_detox-t4","pill_detox-t5","pill_detox-t6","pill_detox-t7","pill_detox-mythic","pill_body-t1","pill_body-t2","pill_body-t3","pill_body-t4","pill_body-t5","pill_body-t6","pill_body-t7","pill_body-mythic"]},"resources":{"url":"assets/item_art_resources.webp","width":768,"height":768,"cells":["pill_soul-t1","pill_soul-t2","pill_soul-t3","pill_soul-t4","pill_soul-t5","pill_soul-t6","pill_soul-t7","pill_soul-mythic","mat_ore-t1","mat_ore-t2","mat_ore-t3","mat_ore-t4","mat_ore-t5","mat_ore-t6","mat_ore-t7","mat_ore-mythic","mat_herb-t1","mat_herb-t2","mat_herb-t3","mat_herb-t4","mat_herb-t5","mat_herb-t6","mat_herb-t7","mat_herb-mythic","mat_hide-t1","mat_hide-t2","mat_hide-t3","mat_hide-t4","mat_hide-t5","mat_hide-t6","mat_hide-t7","mat_hide-mythic","mat_bone-t1","mat_bone-t2","mat_bone-t3","mat_bone-t4","mat_bone-t5","mat_bone-t6","mat_bone-t7","mat_bone-mythic","mat_core-t1","mat_core-t2","mat_core-t3","mat_core-t4","mat_core-t5","mat_core-t6","mat_core-t7","mat_core-mythic","mat_crystal-t1","mat_crystal-t2","mat_crystal-t3","mat_crystal-t4","mat_crystal-t5","mat_crystal-t6","mat_crystal-t7","mat_crystal-mythic","fish-t1","fish-t2","fish-t3","fish-t4","fish-t5","fish-t6","fish-t7","fish-mythic"]}},"manualPaths":{"XIAN":1,"BODY":2,"GOD":34,"DEMON":7,"HEART_SOUL":6,"MECH_PUPPET":9,"KARMA_SAMSARA":10,"BEAST_SOVEREIGN":11,"SAGE_SUPPORT":4,"CRAFT_CREATION":13,"ARRAY_TALISMAN":14,"STRATEGY_GOVERNANCE":15,"ASTRO_DIVINATION":16,"BUDDHA_DHARMA":17,"VOID_SPACE":18,"SONIC_HARMONY":19,"VENOM_GU":20,"PRIMORDIAL_SHIFTER":21,"CELESTIAL_WEATHER":22,"WANDERING_DAO":23,"MERCANTILE_DAO":24,"DRAGON_VEIN_GEOMANCY":25,"GRAVITY_DAO":26,"CHRONO_EPOCH":27,"INK_LITERATI":28,"SOUL_PUPPETRY":29,"PRIMORDIAL_CHAOS":30,"SHADOW_SAMURAI":31,"NINPO_SHADOW":32,"NINPO_ELEMENTAL":33,"DIVINE_SUMMONER":34,"DIVINE_POSSESSION":35,"DIVINE_CHANNELER":36,"VOID_HERETIC_PACT":37,"OCCULT_MAGE":38,"DEVOURING_FLESH":39,"NETHER_GRAVE":40,"ANCESTRAL_RITUAL":41,"TIDE_VOYAGER":42,"LORE_ARCHIVIST":43,"FORTUNE_GAMBLER":44,"SPIRIT_HUSBANDRY":45,"ARENA_GLORY":46},"legendaryEquipment":{"LEG_WPN_YITIAN_SWORD":0,"LEG_WPN_XUANTIE_HEAVY_SWORD":1,"LEG_WPN_TULONG_SABER":2,"LEG_WPN_FULL_MOON_SCIMITAR":3,"LEG_WPN_XIAOLI_HEART_DAGGER":4,"LEG_WPN_DAGOU_JADE_STAFF":5,"LEG_WPN_OVERLORD_SPEAR":6,"LEG_WPN_OATHBREAKER_DRAGON_LANCE":7,"LEG_WPN_WRATHFUL_TIGER_GAUNTLETS":8,"LEG_WPN_CONDOR_METEOR_BOW":9,"LEG_WPN_PEACOCK_PLUME_FOCUS":10,"LEG_WPN_JIUXIAO_PHOENIX_ZITHER":11,"LEG_WPN_CHUNQIU_JUDGMENT_BRUSH":12,"LEG_WPN_TIANCAN_FATE_WHIP":13,"LEG_WPN_BODHI_NIRVANA_ROSARY":14,"LEG_WPN_TAOTIE_DEVOURING_CLAW":15,"LEG_WPN_BAIHUA_SOUL_NEEDLE":16,"LEG_WPN_BAJIAO_TEMPEST_FAN":17,"LEG_WPN_HETU_LUOSHU_ASTROLABE":18,"LEG_WPN_CAISHEN_GOLDEN_ABACUS":19,"LEG_ARM_CELESTIAL_CRANE_ROBE":20,"LEG_ARM_SHADOW_KIRIN_CUIRASS":21,"LEG_ARM_IMMORTAL_TORTOISE_PLATE":22,"LEG_ACC_SAMSARA_KARMA_RING":23,"LEG_ACC_BODHI_STARLIGHT_BEADS":24,"LEG_ACC_TAICHI_HEAVEN_SEAL":25,"LEG_ACC_DRAGON_PHOENIX_BANGLE":26},"legendaryTechniques":{"LEG_COMBAT_DUGU_NINE_SWORDS":0,"LEG_COMBAT_DRAGON_SUBDUING_PALMS":1,"LEG_COMBAT_FEIXIAN_ONE_SWORD":2,"LEG_AUX_QIANKUN_SHIFT":3,"LEG_AUX_LINGXI_ONE_FINGER":4,"LEG_LIGHT_LINGBO_STEP":5,"LEG_LIGHT_MOON_BAT_SHADOW":6,"LEG_FORB_STAR_ABSORBING_VORTEX":7,"LEG_FORB_BLOOD_LOTUS_SACRIFICE":8,"LEG_PASS_MINGYU_IMMORTAL_QI":9,"LEG_PASS_NINE_YANG_MERIDIAN":10,"LEG_PASS_DUGU_SWORD_HEART":11,"LEG_COMBAT_NINE_HEAVENS_GUANG_LING":12,"LEG_AUX_HEAVEN_INSCRIPTION_SEAL":13,"LEG_COMBAT_SAMSARA_PUPPET_THREADS":14,"LEG_AUX_IMPERIAL_EIGHT_GATES":15,"LEG_COMBAT_JADE_NIRVANA_HARMONY":16,"LEG_LIGHT_KUNPENG_ASTRAL_WINGS":17,"LEG_FORB_SAMSARA_KARMA_REVERSAL":18,"LEG_V230_ASTRO_DIVINATION":19,"LEG_V230_BUDDHA_DHARMA":20,"LEG_V230_VOID_SPACE":21,"LEG_V230_SONIC_HARMONY":22,"LEG_V230_VENOM_GU":23,"LEG_V230_PRIMORDIAL_SHIFTER":24,"LEG_V230_CELESTIAL_WEATHER":25,"LEG_V230_WANDERING_DAO":26,"LEG_V230_MERCANTILE_DAO":27,"LEG_V230_DRAGON_VEIN_GEOMANCY":28,"LEG_V230_GRAVITY_DAO":29,"LEG_V230_CHRONO_EPOCH":30,"LEG_V230_INK_LITERATI":31,"LEG_V230_SOUL_PUPPETRY":32,"LEG_V230_PRIMORDIAL_CHAOS":33,"LEG_V230_SHADOW_SAMURAI":34,"LEG_V230_NINPO_SHADOW":35,"LEG_V230_NINPO_ELEMENTAL":36,"LEG_V230_DIVINE_SUMMONER":37,"LEG_V230_DIVINE_POSSESSION":38,"LEG_V230_DIVINE_CHANNELER":39,"LEG_V230_VOID_HERETIC_PACT":40,"LEG_V230_OCCULT_MAGE":41,"LEG_V230_DEVOURING_FLESH":42,"LEG_V230_NETHER_GRAVE":43,"LEG_V230_ANCESTRAL_RITUAL":44,"LEG_V230_TIDE_VOYAGER":45,"LEG_V230_LORE_ARCHIVIST":46,"LEG_V230_FORTUNE_GAMBLER":47,"LEG_V230_SPIRIT_HUSBANDRY":48,"LEG_V230_ARENA_GLORY":49},"tierFamilies":{"SWORD":{"sheet":"materials","cells":[56,57,58,59,60,61,62,62],"group":"equipment"},"BLADE":{"sheet":"arsenala","cells":[0,1,2,3,4,5,6,7],"group":"equipment"},"SPEAR":{"sheet":"arsenala","cells":[8,9,10,11,12,13,14,15],"group":"equipment"},"STAFF":{"sheet":"arsenala","cells":[16,17,18,19,20,21,22,23],"group":"equipment"},"FIST":{"sheet":"arsenala","cells":[24,25,26,27,28,29,30,31],"group":"equipment"},"BOW":{"sheet":"arsenala","cells":[32,33,34,35,36,37,38,39],"group":"equipment"},"FOCUS":{"sheet":"arsenala","cells":[40,41,42,43,44,45,46,47],"group":"equipment"},"DAGGER":{"sheet":"arsenala","cells":[48,49,50,51,52,53,54,55],"group":"equipment"},"ZITHER":{"sheet":"arsenala","cells":[56,57,58,59,60,61,62,63],"group":"equipment"},"BRUSH":{"sheet":"arsenalb","cells":[0,1,2,3,4,5,6,7],"group":"equipment"},"WHIP":{"sheet":"arsenalb","cells":[8,9,10,11,12,13,14,15],"group":"equipment"},"ROSARY":{"sheet":"arsenalb","cells":[16,17,18,19,20,21,22,23],"group":"equipment"},"CLAW":{"sheet":"arsenalb","cells":[24,25,26,27,28,29,30,31],"group":"equipment"},"NEEDLE":{"sheet":"arsenalb","cells":[32,33,34,35,36,37,38,39],"group":"equipment"},"FAN":{"sheet":"arsenalb","cells":[40,41,42,43,44,45,46,47],"group":"equipment"},"ASTROLABE":{"sheet":"arsenalb","cells":[48,49,50,51,52,53,54,55],"group":"equipment"},"ABACUS":{"sheet":"arsenalb","cells":[56,57,58,59,60,61,62,63],"group":"equipment"},"HEAVY":{"sheet":"attire","cells":[0,1,2,3,4,5,6,7],"group":"equipment"},"LIGHT":{"sheet":"attire","cells":[8,9,10,11,12,13,14,15],"group":"equipment"},"ROBE":{"sheet":"attire","cells":[16,17,18,19,20,21,22,23],"group":"equipment"},"BOOTS":{"sheet":"attire","cells":[24,25,26,27,28,29,30,31],"group":"equipment"},"HELMET":{"sheet":"attire","cells":[32,33,34,35,36,37,38,39],"group":"equipment"},"RING":{"sheet":"attire","cells":[40,41,42,43,44,45,46,47],"group":"equipment"},"NECKLACE":{"sheet":"attire","cells":[48,49,50,51,52,53,54,55],"group":"equipment"},"BRACELET":{"sheet":"attire","cells":[56,57,58,59,60,61,62,63],"group":"equipment"},"CHARM":{"sheet":"supplies","cells":[0,1,2,3,4,5,6,7],"group":"equipment"},"ORNAMENT":{"sheet":"supplies","cells":[8,9,10,11,12,13,14,15],"group":"equipment"},"AUX_TOOL":{"sheet":"supplies","cells":[16,17,18,19,20,21,22,23],"group":"equipment"},"PILL_HEAL":{"sheet":"supplies","cells":[24,25,26,27,28,29,30,31],"group":"pill"},"PILL_QI":{"sheet":"supplies","cells":[32,33,34,35,36,37,38,39],"group":"pill"},"PILL_BREAK":{"sheet":"supplies","cells":[40,41,42,43,44,45,46,47],"group":"pill"},"PILL_DETOX":{"sheet":"supplies","cells":[48,49,50,51,52,53,54,55],"group":"pill"},"PILL_BODY":{"sheet":"supplies","cells":[56,57,58,59,60,61,62,63],"group":"pill"},"PILL_SOUL":{"sheet":"resources","cells":[0,1,2,3,4,5,6,7],"group":"pill"},"MAT_ORE":{"sheet":"resources","cells":[8,9,10,11,12,13,14,15],"group":"material"},"MAT_HERB":{"sheet":"resources","cells":[16,17,18,19,20,21,22,23],"group":"material"},"MAT_HIDE":{"sheet":"resources","cells":[24,25,26,27,28,29,30,31],"group":"material"},"MAT_BONE":{"sheet":"resources","cells":[32,33,34,35,36,37,38,39],"group":"material"},"MAT_CORE":{"sheet":"resources","cells":[40,41,42,43,44,45,46,47],"group":"material"},"MAT_CRYSTAL":{"sheet":"resources","cells":[48,49,50,51,52,53,54,55],"group":"material"},"FISH":{"sheet":"resources","cells":[56,57,58,59,60,61,62,63],"group":"fish"}},"typeAliases":{"SABER":"BLADE","GAUNTLET":"FIST","FIST_PALM":"FIST","HEAVY_ARMOR":"HEAVY","LIGHT_ARMOR":"LIGHT","PENDANT":"NECKLACE","HEADGEAR":"HELMET","SHOES":"BOOTS"},"normalization":{"layouts":"docs/ITEM_ART_TIER_CROPS.json","tool":"tools/normalize_item_sheet.js","cellSize":96,"innerSize":80,"newSheets":["arsenala","arsenalb","attire","supplies","resources"]}};
  // ITEM_ART_CATALOG_END
  UI.ITEM_ART_CATALOG = ITEM_ART;
  const ART_GRADE_NAMES = ['Common','Refined','Rare','Exceptional','Legendary'];
  const ART_GRADE_TH = ['สามัญ','ประณีต','ล้ำค่า','ยอดฝีมือ','ตำนาน'];
  const ART_GRADE_COLORS = ['#aeb9b1','#66d4a4','#63baff','#ca8fff','#ffd778'];
  const ART_TIER_COLORS = ['#c2b7a0','#68ce92','#6dbdff','#ba8ef2','#f3b567','#ff7c85','#fff0b4','#83f5e2','#efacff'];
  UI.itemArtGrade = item => {
    item = item || {}; const eq = item.eq || item.gear || item;
    const id = String(item.templateId || eq.id || item.id || '').replace(/^(P:|T:|S:)/,'');
    const def = ECO.itemById[id] || CULT.tech(id) || {};
    if (eq.legendary || def.legendary || /^LEG_/.test(id)) return 'Legendary';
    const grade = eq.grade || def.grade || eq.rarity || item.grade || item.rarity || def.rarity || 'Common';
    return ART_GRADE_NAMES.includes(grade) ? grade : grade === 'Masterwork' ? 'Exceptional' : 'Common';
  };
  UI.resolveItemArt = item => {
    if (!item) return null;
    const eq = item.gear || item.eq || item;
    const raw = String(item.templateId || eq.id || item.itemId || item.id || item.key || '');
    const id = raw.replace(/^(P:|T:|S:)/,'');
    const tech = CULT.tech(id);
    const kind = String(item.rawKind || item.kind || (tech ? 'TECH_MANUAL' : eq.cat || '')).toUpperCase();
    const isRecipe = kind === 'RECIPE_SCROLL';
    const knowledge = g.MARTIAL && g.MARTIAL.knowledge && (kind === 'SUB_MANUAL' || kind === 'CRYSTAL')
      ? g.MARTIAL.knowledge(raw.startsWith('S:') || raw.startsWith('T:') ? raw : 'S:'+id) : null;
    const def = (isRecipe ? ECO.recipeById[id] : null) || tech || (g.CONTENT && g.CONTENT.organById && g.CONTENT.organById[id]) || ECO.itemById[id] || ECO.matById[id] || knowledge || {};
    const name = String(item.nameTh || eq.nameTh || def.nameTh || '');
    const tags = [id,name,eq.type,eq.subType,def.type,def.part,def.organType].join(' ').toUpperCase();
    const value = Number(item.tier || eq.tier || def.tier || def.reqTier || 1);
    const tier = Number.isFinite(value) ? Math.max(1,Math.min(9,Math.floor(value))) : 1;
    const grade = UI.itemArtGrade(item), rank = ART_GRADE_NAMES.indexOf(grade);
    const element = String(eq.element || def.element || item.element || '').toUpperCase();
    const pick = (sheet,cell,role='') => ({sheet,cell,col:cell%8,row:Math.floor(cell/8),key:sheet+':'+ITEM_ART.sheets[sheet].cells[cell],
      tier,grade,rank,role,legendary:grade==='Legendary',nameTh:name,tierColor:ART_TIER_COLORS[tier-1],gradeColor:ART_GRADE_COLORS[rank]});
    const pickTier = (family, role) => {
      const spec = Object.prototype.hasOwnProperty.call(ITEM_ART.tierFamilies || {},family) && ITEM_ART.tierFamilies[family];
      if (!spec) return null;
      const col = spec.group === 'equipment' && grade === 'Legendary' ? 7 : Math.min(6,tier-1);
      return { ...pick(spec.sheet,spec.cells[col],role), family, tierVariant:true };
    };
    const pickResource = (cell, role='material') => {
      const family = {4:'MAT_HIDE',6:'MAT_BONE',15:'MAT_CORE',16:'MAT_HERB',25:'MAT_ORE',30:'MAT_CRYSTAL'}[cell];
      return (family && pickTier(family,role)) || pick('materials',cell,role);
    };
    const crystalCell = () => /ICE|WATER|FROST/.test(element+tags)?31:/FIRE/.test(element+tags)?32:/LIGHTNING|THUNDER/.test(element+tags)?33:
      /WOOD|LIFE/.test(element+tags)?34:/YIN|SHADOW/.test(element+tags)?35:/LIGHT|YANG/.test(element+tags)?36:/ASTRAL|STAR/.test(element+tags)?37:/SPACE|VOID/.test(element+tags)?38:/DEMON|BLOOD/.test(element+tags)?39:30;
    if (kind === 'CRYSTAL') return pickResource(crystalCell(),'crystal');
    const manual = kind === 'TECH_MANUAL' || kind === 'SUB_MANUAL' || kind === 'TECH' || !!tech;
    if (manual && !isRecipe) {
      if (Object.prototype.hasOwnProperty.call(ITEM_ART.legendaryTechniques,id)) return pick('legends',ITEM_ART.legendaryTechniques[id],'legendary-manual');
      const cat = String(tech && tech.cat || def.cat || item.cat || '');
      const role = /FORBIDDEN/.test(cat)?'forbidden':/LIGHTNESS/.test(cat)?'lightness':/PASSIVE|INNATE/.test(cat)?'passive':/MANTRA/.test(cat)?'mantra':/DEFENSIVE/.test(cat)?'defensive':/SUPPORT/.test(cat)?'support':/AUXILIARY/.test(cat)?'auxiliary':kind==='SUB_MANUAL'?'subpath':'combat';
      const roleCells = {forbidden:7,lightness:3,passive:6,mantra:8,defensive:5,support:4,auxiliary:14,subpath:59,combat:1};
      const path = (tech && tech.path) || def.path || item.path;
      const pathCell = Object.prototype.hasOwnProperty.call(ITEM_ART.manualPaths,path) ? ITEM_ART.manualPaths[path] : undefined;
      const cell = grade==='Legendary'?47:tier<=2?roleCells[role]:(pathCell ?? roleCells[role]);
      return pick('manuals',cell,role);
    }
    if (isRecipe) {
      const craft = String(def.craft || def.profession || item.craft || '');
      return pick('manuals',/FORG|SMITH/.test(craft)?49:/TAILOR/.test(craft)?50:/COOK/.test(craft)?51:/ARRAY|TALISMAN/.test(craft)?52:/BEAST/.test(craft)?53:/FISH/.test(craft)?54:/FARM/.test(craft)?55:48,'recipe');
    }
    if (Object.prototype.hasOwnProperty.call(ITEM_ART.legendaryEquipment,id)) return pick('equipment',ITEM_ART.legendaryEquipment[id],'relic');
    if (['EQUIPMENT','EQUIPPED','GEAR','TALISMAN'].includes(kind) || eq.slot) {
      const slot = eq.slot || def.slot || 'WEAPON';
      // Prefer physical subtype metadata before generic inference; named relics already resolved above.
      const candidates = [eq.visualSubtype,eq.gearType,eq.weaponType,eq.subType,def.visualSubtype,def.gearType,def.subType,eq.type,def.type,
        g.MARTIAL && g.MARTIAL.gearType && g.MARTIAL.gearType(eq)].filter(Boolean).map(v=>String(v).toUpperCase());
      let family = candidates.map(t => Object.prototype.hasOwnProperty.call(ITEM_ART.typeAliases,t) ? ITEM_ART.typeAliases[t] : t)
        .find(t => Object.prototype.hasOwnProperty.call(ITEM_ART.tierFamilies,t) && ITEM_ART.tierFamilies[t].group==='equipment');
      if (/รองเท้า|บู๊ต/.test(name)) family='BOOTS';
      else if (/หมวก|เกราะศีรษะ/.test(name)) family='HELMET';
      else if (/ผ้าคาดศีรษะ/.test(name)) return null;
      else if (family==='FOCUS' && /พัด/.test(name)) family='FAN';
      if (!family) family=slot==='ARMOR'?'ROBE':slot==='ACCESSORY'?'CHARM':'SWORD';
      const role = family==='SWORD'?'sword':family==='ROBE'?'robe':slot==='ARMOR'?'armor':slot==='ACCESSORY'?'accessory':'weapon';
      return pickTier(family,role);
    }
    if(['PILL','CRAFTED_PILL'].includes(kind) || def.cat==='PILL') {
      const info = (ECO.pillInfo && ECO.pillInfo(id)) || {}, eff = info.effect || {};
      let cell=50, high=null;
      if(eff.breakthroughBonus||eff.btFor||/BREAK|ทะลวง/.test(tags)){cell=52;high=56;}
      else if(/ASCEN|เหินเซียน|ขึ้นสวรรค์/.test(tags)){cell=57;high=63;}
      else if(eff.clearToxic||eff.clearPoison||/DETOX|ANTIDOTE|แก้พิษ|ถอนพิษ/.test(tags)){cell=53;high=57;}
      else if(eff.clearHeartDemon||eff.insight||/SOUL|MIND|จิต|วิญญาณ/.test(tags)){cell=54;high=58;}
      else if(/DEMON|BLOOD|โลหิต|มาร/.test(tags)){cell=56;high=62;}
      else if(eff.qiRestore||eff.cultivationProgress||/QI|ปราณ|ตบะ/.test(tags)){cell=51;high=60;}
      else if(eff.cbBuff||eff.energyRestore||/BODY|VIGOR|กาย|เส้นเอ็น/.test(tags)){cell=55;high=59;}
      else if(/LONGEV|อายุ/.test(tags))cell=58;
      else if(/ICE|FROST|เหมันต์|น้ำแข็ง/.test(tags))cell=59;
      else if(/FIRE|เพลิง/.test(tags))cell=60;
      else if(/THUNDER|LIGHTNING|อสนี/.test(tags))cell=61;
      else if(/REVIVE|RESURRECT|คืนชีพ/.test(tags))high=61;
      const pillFamily = {50:'PILL_HEAL',51:'PILL_QI',52:'PILL_BREAK',53:'PILL_DETOX',54:'PILL_SOUL',55:'PILL_BODY'}[cell];
      if (pillFamily && high!==61) return pickTier(pillFamily,'pill');
      return high!==null && (tier>=5||rank>=3)?pick('legends',high,'pill'):pick('equipment',cell,'pill');
    }
    if (id.toLowerCase()==='stones')return pick('materials',51,'currency');
    if (id.toLowerCase()==='grain')return pick('materials',23,'food');
    if (id.toLowerCase()==='meal'||kind==='FOOD'||/^FOOD_/.test(id))return pick('materials',54,'food');
    if(kind==='CONTAINER'||/CONTAINER|CHEST/.test(id))return pick('materials',tier>=5?53:52,'container');
    if(/LETTER|DECREE|TOKEN|จดหมาย|โองการ/.test(tags))return pick('materials',63,'token');
    if(/COIN|เหรียญ/.test(tags))return pick('materials',50,'currency');
    if(/MAP|แผนที่/.test(tags))return pick('manuals',56,'map');
    if (kind==='FISH'||kind==='ORGAN'||kind==='MATERIAL'||kind==='MAT'||ECO.matById[id]) {
      if(kind==='FISH'||/^MAT_FISH_/.test(id))return pickTier('FISH','fish');
      // Physical material families outrank elemental words (e.g. blood crystals, wood herbs).
      if (/^MAT_(?:CRYSTAL|GEM)/.test(id)) return pickResource(crystalCell());
      if (/^MAT_(?:BEAST_)?CORE/.test(id)) return pickResource(15);
      if (/HERB|GINSENG|LOTUS|FLOWER|MUSHROOM|FUNG|ROOT|โสม|สมุนไพร|ดอกไม้|บัว|เห็ด/.test(tags)) {
        const cell=/GINSENG|ROOT|โสม|ราก/.test(tags)?17:/MUSHROOM|FUNG|เห็ด|หลินจือ/.test(tags)?18:
          /ICE.*LOTUS|บัวหิมะ/.test(tags)?20:/LOTUS|บัว/.test(tags)?19:/FIRE.*FLOWER|ดอกเพลิง/.test(tags)?21:/POISON|VENOM|พิษ/.test(tags)?22:16;
        return pickResource(cell);
      }
      const rules=[
        [/HEART|หัวใจ/,45],[/LIVER|ตับ/,46],[/LUNG|ปอด/,47],[/KIDNEY|ไต/,48],[/STOMACH|กระเพาะ/,49],
        [/JERKY|DRIED_MEAT|เนื้อแห้ง/,1],[/MEAT|FLESH|เนื้อ/,0],[/FANG|TOOTH|เขี้ยว|ฟัน/,2],[/CLAW|กรงเล็บ/,3],
        [/FUR|PELT|ขนสัตว์/,5],[/HIDE|LEATHER|หนัง/,4],[/BONE|กระดูก/,6],[/HORN|ANTLER|เขาสัตว์/,7],
        [/SCALE|เกล็ด/,8],[/PHOENIX.*FEATHER|ขนหงส์/,44],[/FEATHER|ขนนก/,9],[/CHITIN|กระดองแมลง/,11],
        [/SHELL|กระดอง|เปลือกหอย/,12],[/COCOON|SILK|รังไหม/,10],[/RESIN|ยางไม้|อำพัน/,13],[/BLOOD|เลือด|โลหิต/,14],
        [/CORE|BEAST_ESSENCE|แก่นอสูร|แกนอสูร/,15],[/CINNABAR|ชาด/,43],[/CLOTH|FABRIC|ผ้า/,41],[/^WOOD(?:\s|$)|MAT_WOOD|TIMBER|HARDWOOD|LOG_|ท่อนไม้|เนื้อไม้/,42],
        [/GINSENG|ROOT|โสม|ราก/,17],[/MUSHROOM|FUNG|เห็ด|หลินจือ/,18],[/ICE.*LOTUS|บัวหิมะ/,20],[/LOTUS|บัว/,19],
        [/FIRE.*FLOWER|ดอกเพลิง/,21],[/POISON|VENOM|ดอกพิษ/,22],[/HERB|FLOWER|LEAF|สมุนไพร|ใบไม้|ดอกไม้/,16],
        [/COPPER|ทองแดง/,24],[/SILVER|เงิน/,27],[/GOLD|ทองคำ/,28],[/COAL|CHARCOAL|ถ่าน/,26],[/JADE|หยก/,29],
        [/CRYSTAL|GEM|ESSENCE|ผลึก|อัญมณี/,crystalCell()],[/ORE|IRON|STEEL|METAL|STONE|แร่|เหล็ก|ศิลา|หิน/,25],
        [/POWDER|DUST|ผง/,40]
      ];
      const match=rules.find(([pattern])=>pattern.test(tags));
      return pickResource(match?match[1]:40);
    }
    return null;
  };
  UI.renderAtlasIconHtml = (item, sizePx) => {
    const semantic = UI.resolveItemAtlasCell(item) || ITEM_ATLAS_BY_KEY.FALLBACK_GENERIC;
    const sz = Math.max(16,Math.min(128,Number(sizePx)||40));
    const art = UI.resolveItemArt(item);
    if(art) {
      const filters=['brightness(.87) saturate(.8)','brightness(1) saturate(1.08)','brightness(1.07) saturate(1.25)','brightness(1.12) saturate(1.45)','brightness(1.05) saturate(1.15)'];
      const gearTint = ['weapon','armor','accessory'].includes(art.role) && !art.legendary && !art.tierVariant ? ' sepia(.5) saturate(1.35) hue-rotate('+[0,55,150,225,340,305,15,130,245][art.tier-1]+'deg)' : '';
      const gradeTint = ['weapon','armor','accessory','robe','sword'].includes(art.role) && art.role!=='relic' ? ['', ' saturate(1.35)', ' sepia(.45) saturate(1.8) hue-rotate(145deg)', ' sepia(.45) saturate(1.8) hue-rotate(215deg)', ' sepia(.6) saturate(1.6) hue-rotate(345deg)'][art.rank] : '';
      const pictureFilter = filters[art.rank]+gearTint+gradeTint+(art.rank>=2?' drop-shadow(0 0 1.5px '+art.gradeColor+')':'');
      const marks={combat:'⚔',mantra:'☯',passive:'✧',defensive:'⬡',support:'✚',lightness:'➶',forbidden:'⚠',auxiliary:'✥',subpath:'◇',recipe:'⌘'};
      return '<span class="inv-atlas-ic item-art tier-'+art.tier+' grade-'+art.grade+'" data-atlas-cell="'+semantic.cell+'" data-atlas-key="'+esc(semantic.key)+'" data-art-key="'+esc(art.key)+'" data-art-tier="'+art.tier+'" data-art-grade="'+art.grade+'" data-art-role="'+art.role+'" role="img" aria-label="'+esc((art.nameTh||'ไอเท็ม')+' · T'+art.tier+' · เกรด'+ART_GRADE_TH[art.rank])+'" style="width:'+sz+'px;height:'+sz+'px;--item-tier:'+art.tierColor+';--item-grade:'+art.gradeColor+'">'+
        '<span class="item-art-picture" style="background-image:url(&quot;'+ITEM_ART.sheets[art.sheet].url+'&quot;);background-size:'+(sz*8)+'px '+(sz*8)+'px;background-position:'+(-art.col*sz)+'px '+(-art.row*sz)+'px;filter:'+pictureFilter+'"></span>'+
        (marks[art.role]?'<span class="item-art-role" aria-hidden="true">'+marks[art.role]+'</span>':'')+'<span class="item-art-grade" aria-hidden="true">'+'•'.repeat(art.rank+1)+'</span></span>';
    }
    return '<div class="inv-atlas-ic" data-atlas-cell="'+semantic.cell+'" data-atlas-key="'+esc(semantic.key)+'" style="width:'+sz+'px;height:'+sz+'px;background-image:url(\''+ITEM_ATLAS_URI+'\');background-size:'+(sz*8)+'px '+(sz*13)+'px;background-position:'+(-semantic.col*sz)+'px '+(-semantic.row*sz)+'px"></div>';
  };

  UI.calcGridPageSize = () => {
    const vw = (typeof window !== "undefined" && window.innerWidth) ? window.innerWidth : 412;
    const vh = (typeof window !== "undefined" && window.innerHeight) ? window.innerHeight : 800;
    const cols = vw >= 960 ? 10 : vw >= 600 ? 8 : vw >= 400 ? 6 : 5;
    const rows = vh < 680 ? 2 : 3;
    return { cols, rows, perPage: cols * rows };
  };

  function gradeChip(t) {
    if (!t) return '';
    const gKey = t.grade || (t.legendary ? 'Legendary' : 'Common');
    const gDef = (JD.MARTIAL && JD.MARTIAL.GRADES && JD.MARTIAL.GRADES[gKey]) || { nameTh: gKey, color: '#9aa5b1' };
    return '<span class="chip" style="border-color:' + gDef.color + ';color:' + gDef.color + ';font-size:10.5px">' + (t.legendary ? '★ ' : '') + esc(gDef.nameTh) + ' · T' + (t.tier || t.reqTier || 1) + '</span>';
  }

  /* ---------- Single-Pass Positional Linkify for NPCs and Buildings ---------- */
  function buildLogRefs(W, text, ids, refs) {
    const out = [];
    const seen = new Set();
    if (Array.isArray(refs)) {
      refs.forEach(r => {
        if (!r || !r.id || seen.has(r.kind + ':' + r.id)) return;
        seen.add(r.kind + ':' + r.id);
        const liveNpc = r.kind === 'npc' ? (W.byId && W.byId[r.id]) : null;
        const liveBld = r.kind === 'bld' ? (W.map && W.map.byId && W.map.byId[r.id]) : null;
        out.push({
          kind: r.kind || (liveBld ? 'bld' : 'npc'),
          id: r.id,
          label: r.label || (liveNpc ? liveNpc.h.name.given : liveBld ? liveBld.nameTh : r.id),
          currentLabel: liveNpc ? liveNpc.h.name.given : liveBld ? liveBld.nameTh : null,
          fullName: liveNpc ? HC.fullName(liveNpc) : (r.fullName || r.label || r.id),
          surname: liveNpc ? liveNpc.h.name.surname : '',
          role: liveNpc && SECT.title ? SECT.title(liveNpc) : (r.role || ''),
          exists: r.kind === 'bld' ? !!liveBld : !!liveNpc
        });
      });
    }
    (ids || []).forEach(id => {
      if (!id) return;
      const liveNpc = W.byId && W.byId[id];
      const liveBld = !liveNpc && W.map && W.map.byId && W.map.byId[id];
      const kind = liveBld ? 'bld' : 'npc';
      if (seen.has(kind + ':' + id)) return;
      seen.add(kind + ':' + id);
      if (liveNpc) {
        out.push({
          kind: 'npc',
          id,
          label: liveNpc.h.name.given,
          currentLabel: liveNpc.h.name.given,
          formerNames: Array.isArray(liveNpc.h.name.formerNames) ? liveNpc.h.name.formerNames : [],
          fullName: HC.fullName(liveNpc),
          surname: liveNpc.h.name.surname || '',
          role: SECT.title ? SECT.title(liveNpc) : '',
          exists: true
        });
      } else if (liveBld) {
        out.push({
          kind: 'bld',
          id,
          label: liveBld.nameTh,
          currentLabel: liveBld.nameTh,
          fullName: liveBld.nameTh,
          surname: '',
          role: 'อาคารสำนัก',
          exists: true
        });
      } else {
        const vis = (g.VC && g.VC.findVisitor) ? g.VC.findVisitor(W, id) : null;
        const clue = (W.world && W.world.clues && W.world.clues.active && W.world.clues.active[id]) || null;
        if (vis) {
          out.push({
            kind: 'visitor',
            id,
            label: vis.nameTh || id,
            currentLabel: vis.nameTh || id,
            fullName: (vis.nameTh || id) + (vis.titleTh ? ' · ' + vis.titleTh : ''),
            surname: '',
            role: vis.state === 'offsite' ? 'ผู้มาเยือน (เดินทางกลับแล้ว)' : 'ผู้มาเยือนจากยุทธภพ',
            exists: vis.state === 'admitted' || vis.state === 'restricted'
          });
        } else if (clue) {
          out.push({
            kind: 'clue',
            id,
            label: clue.titleTh || id,
            currentLabel: clue.titleTh || id,
            fullName: clue.titleTh || id,
            surname: '',
            role: 'เบาะแสยุทธภพ',
            exists: true
          });
        } else {
          const histNpc = W.sect && W.sect.historicalPeople && W.sect.historicalPeople[id];
          if (histNpc) {
            out.push({
              kind: "npc",
              id,
              label: histNpc.given || histNpc.fullName || id,
              currentLabel: histNpc.given || histNpc.fullName || null,
              formerNames: Array.isArray(histNpc.formerNames) ? histNpc.formerNames : [],
              fullName: histNpc.fullName || id,
              surname: histNpc.surname || "",
              role: (histNpc.roleTh ? histNpc.roleTh + " · " : "") + (histNpc.statusTh || "ไม่อยู่ในสำนักแล้ว"),
              exists: false
            });
          } else {
            out.push({
              kind: "npc",
              id,
              label: id,
              currentLabel: null,
              fullName: id,
              surname: "",
              role: "ไม่อยู่ในสำนักแล้ว",
              exists: false
            });
          }
        }
      }
    });
    if (W && W.map && Array.isArray(W.map.buildings) && typeof text === 'string') {
      W.map.buildings.forEach(b => {
        if (b && b.nameTh && !seen.has('bld:' + b.id) && text.includes(b.nameTh)) {
          seen.add('bld:' + b.id);
          out.push({
            kind: 'bld',
            id: b.id,
            label: b.nameTh,
            currentLabel: b.nameTh,
            fullName: b.nameTh,
            surname: '',
            role: 'อาคารสำนัก',
            exists: true
          });
        }
      });
    }
    return out;
  }

  function renderEntityAnchor(ref, displayTxt, dupCount) {
    const disambig = (dupCount > 1 && ref.surname) ? ' (' + ref.surname + ')' : '';
    const title = ref.fullName + (ref.role ? ' · ' + ref.role : '');
    if (ref.kind === 'bld') {
      return '<a class="link-ref bld" data-bld="' + esc(ref.id) + '" title="' + esc(title) + '" style="color:#f2c96d;text-decoration:none;font-weight:600">' + esc(displayTxt) + '</a>';
    }
    if (ref.kind === 'visitor') {
      return '<a class="link-ref visitor" data-visitor="' + esc(ref.id) + '" title="' + esc(title) + '" style="color:#ffcb77;text-decoration:none;font-weight:600">🎐 ' + esc(displayTxt) + '</a>';
    }
    if (ref.kind === 'clue') {
      return '<a class="link-ref clue" data-clue="' + esc(ref.id) + '" title="' + esc(title) + '" style="color:#a8dadc;text-decoration:none;font-weight:600">🗺️ ' + esc(displayTxt) + '</a>';
    }
    if (!ref.exists) {
      return '<span class="link-ref gone" data-npc="' + esc(ref.id) + '" title="' + esc(title) + '" style="color:var(--muted);text-decoration:underline dotted;cursor:pointer">' + esc(displayTxt) + '</span>';
    }
    return '<a class="link-ref npc" data-npc="' + esc(ref.id) + '" title="' + esc(title) + '" style="color:#9bd7fa;text-decoration:none;font-weight:600">' + esc(displayTxt + disambig) + '</a>';
  }

  function linkify(W, text, ids, refs) {
    const raw = String(text == null ? '' : text).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
    if (!W) return esc(raw);
    const refList = buildLogRefs(W, raw, ids, refs);
    if (!refList.length) return esc(raw);

    // Count duplicate labels among NPC refs in this entry
    const labelCounts = {};
    refList.filter(r => r.kind === 'npc').forEach(r => {
      const k = r.currentLabel || r.label;
      if (k) labelCounts[k] = (labelCounts[k] || 0) + 1;
    });

    // Single-pass positional matching: find earliest non-overlapping match for each ref in order, then any remaining occurrences
    const matches = [];
    const usedRanges = [];
    const overlaps = (s, e) => usedRanges.some(([a, b]) => s < b && e > a);

    // Pass 1: assign each ref in order to its first unclaimed occurrence in `raw`
    const matchedRefKeys = new Set();
    refList.forEach(ref => {
      const candidates = [ref.fullName, ref.label, ref.currentLabel].concat(ref.formerNames || []).filter(x => typeof x === 'string' && x.length > 0);
      for (const token of candidates) {
        let from = 0;
        let found = -1;
        while (from <= raw.length - token.length) {
          const idx = raw.indexOf(token, from);
          if (idx < 0) break;
          if (!overlaps(idx, idx + token.length)) {
            found = idx;
            break;
          }
          from = idx + 1;
        }
        if (found >= 0) {
          usedRanges.push([found, found + token.length]);
          matches.push({ start: found, end: found + token.length, token, ref });
          matchedRefKeys.add(ref.kind + ':' + ref.id);
          break;
        }
      }
    });

    // Pass 2: link any additional occurrences of unambiguous refs
    refList.forEach(ref => {
      const k = ref.currentLabel || ref.label;
      if ((labelCounts[k] || 0) > 1) return; // already matched positionally in Pass 1
      const candidates = [ref.fullName, ref.label, ref.currentLabel].concat(ref.formerNames || []).filter(x => typeof x === 'string' && x.length > 0);
      candidates.forEach(token => {
        let from = 0;
        while (from <= raw.length - token.length) {
          const idx = raw.indexOf(token, from);
          if (idx < 0) break;
          if (!overlaps(idx, idx + token.length)) {
            usedRanges.push([idx, idx + token.length]);
            matches.push({ start: idx, end: idx + token.length, token, ref });
          }
          from = idx + token.length;
        }
      });
    });

    matches.sort((a, b) => a.start - b.start);
    let out = '', cursor = 0;
    for (const m of matches) {
      if (m.start > cursor) out += esc(raw.slice(cursor, m.start));
      const k = m.ref.currentLabel || m.ref.label;
      const disp = (m.ref.currentLabel && m.ref.currentLabel !== m.token && m.token === m.ref.label)
        ? (m.ref.currentLabel + ' (' + m.token + ')')
        : m.token;
      out += renderEntityAnchor(m.ref, disp, labelCounts[k] || 1);
      cursor = m.end;
    }
    if (cursor < raw.length) out += esc(raw.slice(cursor));

    // Append clickable chips for any referenced entities that did not appear verbatim in text (e.g. renamed or legacy log)
    const unmatched = refList.filter(r => !matchedRefKeys.has(r.kind + ':' + r.id));
    if (unmatched.length) {
      out += ' <span class="log-ref-chips">' + unmatched.map(r => {
        const k = r.currentLabel || r.label || r.id;
        return '[' + renderEntityAnchor(r, k, labelCounts[k] || 1) + ']';
      }).join(' ') + '</span>';
    }
    return out;
  }
  UI.linkify = linkify;

  function actText(n) {
    if (n.dead) return '☠ เสียชีวิต'; if (n.away) { const ex = UI.G.W.world.expeds.find(e => e.id === n.expId), mission = ex && EXPED.MISSIONS[ex.kind]; return '🧭 ออกภารกิจ' + (mission ? '「' + mission.nameTh + '」' : ''); }
    if (n.travel) return n.travel.to === 'exit' ? '🚶 กำลังออกจากสำนัก' : '🚶 กำลังกลับเข้าสำนัก';
    const a = AI.ACTS[n.act.id]; let t = a ? a.icon + ' ' + a.nameTh : n.act.id === 'pair' ? '💬 พบปะ' : n.act.id === 'fight' ? '⚔️ ต่อสู้' : '🚶 เดินเล่น';
    if (n.act.id === 'pair' && n.act.ctx.pair) { const tp = { chat: 'พูดคุย', spar: 'ประลองฝีมือ', teach: 'สอนวิชา', date: 'พบกันตามลำพัง', argue: 'ทะเลาะ' }[n.act.ctx.pair.type]; const o = UI.G.W.byId[n.act.ctx.pair.partner]; t = '💬 ' + (tp || 'พบปะ') + (o ? 'กับ ' + o.h.name.given : ''); }
    if (n.act.stage === 'move' && n.act.id !== 'idle') t += ' (กำลังเดินไป)'; return t;
  }
  UI.actText = actText;

  /* ---------- HUD ---------- */
  UI.buildHud = () => {
    $('speedBar').innerHTML = SPEEDS.map(s => '<button type="button" data-sp="' + s[0] + '" title="' + (s[0] === 0 ? 'หยุดเวลา' : 'เร่งเวลา ' + s[0] + ' เท่า') + '" aria-label="' + (s[0] === 0 ? 'หยุดเวลา' : 'เร่งเวลา ' + s[0] + ' เท่า') + '">' + s[1] + '</button>').join('');
    $('speedBar').onclick = e => { const b = e.target.closest('button'); if (!b) return; UI.G.speed = +b.dataset.sp; if (UI.G.W) { UI.G.W.speed = UI.G.speed; UI.G.W.runtimeTiming = { pendingTicks: UI.G.acc || 0, speed: UI.G.speed }; } UI.updateHud(true); };
    document.querySelectorAll('#hudBottom button').forEach(b => b.onclick = () => UI.open(b.dataset.nav));
    $('shClose').onclick = () => UI.close();
    $('fZoomIn').onclick = () => UI.G.R.zoomAt(UI.G.R.vw / 2, UI.G.R.vh / 2, 1.35);
    $('fZoomOut').onclick = () => UI.G.R.zoomAt(UI.G.R.vw / 2, UI.G.R.vh / 2, 1 / 1.35);
    $('fHome').onclick = () => { UI.G.R.follow = false; UI.G.R.focus(118, 70, 0.9); };
    $('fFollow').onclick = () => { const R = UI.G.R; if (!R.selected) { UI.toast('เลือกตัวละครก่อน (แตะที่ตัวละครบนแผนที่)'); return; } R.follow = !R.follow; if (R.follow && R.cam.z < 1.6) R.cam.z = 2; $('fFollow').style.background = R.follow ? 'var(--gold)' : ''; };
    $('shBody').addEventListener('click', e => {
      const f = e.target.closest('[data-do]'); if (f) { UI.doAction(f.dataset.do, f.dataset.arg); return; }
      const a = e.target.closest('[data-npc]'); if (a) { UI.openNpc(a.dataset.npc); return; }
      const b = e.target.closest('[data-bld]'); if (b) { UI.openBuilding(b.dataset.bld); return; }
      const v = e.target.closest('[data-visitor]'); if (v) { UI.openVisitor(v.dataset.visitor); return; }
      const cl = e.target.closest('[data-clue]'); if (cl) { UI.openClue(cl.dataset.clue); return; }
    });
    $('toasts').addEventListener('click', e => { const t = e.target.closest('.toast'); if (t && t.dataset.npc) UI.focusNpc(t.dataset.npc); });
  };
  UI.updateHud = (force) => {
    const G = UI.G, W = G.W; if (!W) return; const now = performance.now(); if (!force && now - UI.lastHud < 250) return; UI.lastHud = now;
    const c = SIM.calendar(W.t); const wk = { clear: '☀️', cloud: '⛅', rain: '🌧️', snow: '❄️', fog: '🌫️' }[W.weather.kind] || '';
    const celEv = (W.celestialAlignment && W.celestialAlignment.activeEvent) || W.celestialEvent;
    const celTxt = celEv ? (' · ' + (celEv.icon || '🌌') + ' ' + celEv.nameTh) : '';
    $('dateTxt').title = SIM.SEASON_TH[c.season] + (celEv ? (' — ' + (celEv.descTh || celEv.nameTh)) : '');
    $('dateTxt').textContent = wk + ' ปี ' + c.year + ' ด.' + c.month + ' ว.' + c.dom + '  ' + U.pad2(c.hour) + ':' + U.pad2(c.minute) + ' · ' + SIM.SEASON_TH[c.season] + celTxt;
    document.querySelectorAll('#speedBar button').forEach(b => b.classList.toggle('on', +b.dataset.sp === G.speed));
    const alive = W.npcs.filter(n => !n.dead && !n.exiled), away = alive.filter(n => n.away).length; const S = W.sect;
    const pop = SECT.memberOccupancy ? SECT.memberOccupancy(W) : alive.length;
    const cap = SECT.housingCapacity ? SECT.housingCapacity(W) : 46;
    const activeTribs = (W.sect && Array.isArray(W.sect.activeTribulations)) ? W.sect.activeTribulations.filter(x => x && x.active) : [];
    const tribPill = activeTribs.length ? '<button type="button" id="btnFocusTribHud" class="pill" style="cursor:pointer;border-color:#ffd740;color:#ffe57f;background:rgba(255,215,64,0.14)" title="คลิกเพื่อส่องกล้องดูศิษย์กำลังฝ่าทัณฑ์สวรรค์">⚡ ส่องดูทัณฑ์สวรรค์ (' + activeTribs.length + ')</button>' : '';
    const raid = (W.threat && W.threat.raid ? '<span class="pill" style="border-color:#ff8a3a;color:#ffb27a">⚠ ศัตรูบุก!</span>' : '') + tribPill;
    const audioPill = '<button type="button" id="btnAudioToggle" class="pill" style="cursor:pointer;background:transparent;color:inherit" title="เปิด/ปิดเสียงบรรยากาศยุทธภพ">' + (UI.audio && UI.audio.muted ? '🔇 ปิดเสียง' : '🔊 เสียงยุทธภพ') + '</button>';
    $('resRow').innerHTML = '<span class="pill" title="ศิลาวิญญาณ">💎 ' + UI.icon('stones') + '<b>' + U.fmtNum(S.stones) + '</b></span><span class="pill" title="เสบียงรวม">🍚 ' + UI.icon('food') + '<b>' + U.fmtNum(ECO.count(W, 'meal') + ECO.count(W, 'grain') * 3) + '</b></span><span class="pill" title="สมาชิกปัจจุบัน / ความจุเตียงพัก">👥 ' + UI.icon('people') + '<b>' + pop + '/' + cap + '</b>' + (away ? ' (นอก ' + away + ')' : '') + '</span><span class="pill" title="ชื่อเสียงสำนัก">🏅 ' + UI.icon('fame') + '<b>' + U.fmtNum(S.fame) + '</b></span>' + audioPill + raid + (G.acc >= 1 ? '<span class="pill" title="งานจำลองที่รอประมวลผลยังถูกเก็บไว้">⏳ รอ ' + Math.floor(G.acc) + ' นาทีเกม</span>' : '');
    const btnAud = $('btnAudioToggle'); if (btnAud) btnAud.onclick = () => UI.doAction('toggle-audio');
    const btnTrb = $('btnFocusTribHud'); if (btnTrb) btnTrb.onclick = () => UI.doAction('focus-tribulation');
    const R = G.R, sel = R.selected && W.byId[R.selected]; const si = $('selInfo');
    if (sel && !UI.sheet) {
      si.classList.add('show'); const key = sel.id + ':' + sel.act.id + ':' + sel.rank + ':' + (sel.dead ? 1 : 0);
      if (si.dataset.key !== key || force) {
        si.dataset.key = key;
        si.innerHTML = portraitHtml(sel, 40) + '<div style="flex:1;min-width:0"><div style="font-weight:700">' + esc(HC.fullName(sel)) + ' <span class="muted">' + SECT.title(sel) + '</span></div><div class="muted" id="selAct"></div></div><button data-do="npc" data-arg="' + sel.id + '">ดูข้อมูล</button><button data-do="editnpc" data-arg="' + sel.id + '">✏️</button><button data-do="deselect">✕</button>';
        drawPortraits(si);
        si.querySelectorAll('button').forEach(b => b.onclick = () => UI.doAction(b.dataset.do, b.dataset.arg));
      }
      const sa = $('selAct'); if (sa) sa.textContent = actText(sel) + (sel.why && sel.why[0] && !sel.dead ? ' · เพราะ ' + sel.why[0][0] : '');
    } else si.classList.remove('show');
  };
  UI.toast = (text, type, npcId) => {
    const el = document.createElement('div'); el.className = 'toast t-' + (type || ''); el.textContent = text; if (npcId) el.dataset.npc = npcId; $('toasts').appendChild(el);
    while ($('toasts').children.length > 4) $('toasts').removeChild($('toasts').firstChild);
    setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = 0; setTimeout(() => el.remove(), 450); }, 5200);
  };
  UI.onLog = e => { if (TOAST_TYPES.includes(e.type) && !UI.G.muted) { const sp = UI.G.speed; if (e.type === 'build' || e.type === 'research' || e.type === 'tournament' || (sp > 0 && sp <= 16)) { const now = performance.now(); if (sp === 0 && now - (UI._lastBatchToast || 0) < 40) return; UI._lastBatchToast = now; UI.toast(e.text, e.type, e.ids[0]); } } };

  /* ---------- ระบบติดตามตัวละคร (Tracked Disciples) ---------- */
  UI.isTrackedNpc = (W, id) => {
    if (!W || !W.sect || !Array.isArray(W.sect.trackedNpcIds) || !id) return false;
    return W.sect.trackedNpcIds.includes(id);
  };
  UI.toggleTrackNpc = (W, id) => {
    if (!W || !W.sect || !id) return false;
    if (!Array.isArray(W.sect.trackedNpcIds)) W.sect.trackedNpcIds = [];
    const idx = W.sect.trackedNpcIds.indexOf(id);
    const n = W.byId && W.byId[id];
    const name = n ? HC.fullName(n) : id;
    if (idx >= 0) {
      W.sect.trackedNpcIds.splice(idx, 1);
      UI.toast('เลิกติดตาม ' + name + ' แล้ว');
      return false;
    } else {
      W.sect.trackedNpcIds.push(id);
      UI.toast('⭐ เริ่มติดตาม ' + name + ' แล้ว (ดูได้ใน เมนู > ตัวละครที่ติดตาม)');
      return true;
    }
  };

  /* ---------- แผ่นข้อมูล ---------- */
  UI.close = () => { UI.sheet = null; UI.tab = null; $('sheet').classList.remove('show'); document.querySelectorAll('#hudBottom button').forEach(b => b.classList.remove('on')); if (!UI.G.W) $('start').classList.remove('hidden'); UI.updateHud(true); };
  function show(kind, title, tabs, active, tall) {
    UI.sheet = kind; UI.tab = active; UI.tabs = tabs || []; $('sheet').classList.add('show'); $('sheet').classList.toggle('tall', !!tall); $('shTitle').innerHTML = title;
    $('shTabs').style.display = tabs && tabs.length ? 'flex' : 'none';
    $('shTabs').innerHTML = (tabs || []).map(t => '<button data-t="' + t[0] + '" class="' + (t[0] === active ? 'on' : '') + '">' + t[1] + '</button>').join('');
    $('shTabs').onclick = e => { const b = e.target.closest('button'); if (b) { UI.tab = b.dataset.t; if (UI.sheet === 'log') UI.logFilters = new Set([UI.tab]); UI.render(); } };
    document.querySelectorAll('#hudBottom button').forEach(b => b.classList.toggle('on', b.dataset.nav === kind));
    $('selInfo').classList.remove('show');
  }
  UI.open = (kind, arg) => {
    if (!UI.G.W && kind !== 'menu') { UI.close(); return; }
    if (UI.sheet === kind && kind !== 'npc' && kind !== 'edit' && (!arg || UI.tab === arg)) { UI.close(); return; }
    if (kind === 'people') {
      const tCount = ((UI.G.W && UI.G.W.sect && UI.G.W.sect.trackedNpcIds) || []).length;
      show('people', '👥 ผู้คนในสำนัก', [['rank', 'ตามระดับ'], ['act', 'กำลังทำอะไร'], ['cult', 'ตบะ'], ['mood', 'อารมณ์'], ['tracked', '⭐ ที่ติดตาม' + (tCount ? ' (' + tCount + ')' : '')]], arg || 'rank');
    }
    else if (kind === 'sect') show('sect', '🏯 สำนัก', [['over', 'ภาพรวม'], ['council', '🏛️ สภา/ธรรมนูญ'], ['peaks', '⛰️ หุบเขา/ยอดเขา'], ['lineage', '💞 คู่บำเพ็ญ/มรดก'], ['dao', '🌌 แดนลับ/ชะตาฟ้า'], ['visuals', '✨ กราฟิก/ฟ้าดิน'], ['policy', 'นโยบาย/นิสัยผู้นำ'], ['posts', 'ตำแหน่ง'], ['library', '📚 หอคัมภีร์'], ['stock', 'ภาพรวมคลัง'], ['stockItems', '📦 คลังไอเทม'], ['shop', '🛒 ร้าน/คุณูปการ'], ['bld', 'อาคาร']], arg || 'over');
    else if (kind === 'log') { if (UI.audio && UI.audio.playGuqinChime) UI.audio.playGuqinChime(); show('log', '📜 บันทึกเหตุการณ์', Object.keys(LOG_GROUPS).map(k => [k, LOG_GROUPS[k][0]]), 'all'); }
    else if (kind === 'world') show('world', '🧭 ยุทธภพนอกสำนัก', [['map', '🗺️ แผนที่ยุทธภพ'], ['exp', 'คณะเดินทาง'], ['visitors', '🎐 ผู้มาเยือน'], ['clues', '🗺️ เบาะแส/มรดก'], ['content', '🌿 พื้นที่/ตำรับ'], ['ecology', '🐾 อสูรและนิเวศ'], ['disc', '🔭 ค้นพบ'], ['sects', 'สำนักอื่น'], ['hist', 'ประวัติ']], arg || 'exp', true);
    else if (kind === 'edit') {
      const W = UI.G.W;
      if (!UI.editNpcId || !W.byId[UI.editNpcId] || W.byId[UI.editNpcId].dead) {
        UI.editNpcId = (UI.G.R && UI.G.R.selected && W.byId[UI.G.R.selected] && !W.byId[UI.G.R.selected].dead) ? UI.G.R.selected : W.sect.masterId;
      }
      UI.editDraft = null;
      show('edit', '✏️ ศูนย์แก้ไขตัวละครและเสกไอเทม', [['char', '🧙 แก้ไขตัวละคร'], ['pet', '🐾 สัตว์อสูร/บัฟ/กลไก'], ['spawn', '✨ เสกไอเทม'], ['bag', '🎒 จัดการถุง/คลัง'], ['dip', '📜 การทูต/ยุทธภพ'], ['sanctum', '🏛️ วิหาร/ขัดเกลา'], ['backup', '💾 สำรองก่อนแก้']], arg || 'char', true);
    }
    else if (kind === 'menu') {
      const tCount = ((UI.G.W && UI.G.W.sect && UI.G.W.sect.trackedNpcIds) || []).length;
      show('menu', UI.G.W ? '⚙️ เมนู' : '📂 โหลดเกมที่บันทึก', UI.G.W ? [['main', 'เกม'], ['tracked', '⭐ ตัวละครที่ติดตาม' + (tCount ? ' (' + tCount + ')' : '')], ['set', 'ตั้งค่า'], ['tools', 'ผู้สังเกตการณ์'], ['about', 'เกี่ยวกับ']] : [], arg || 'main');
    }
    UI.render();
  };
  UI.openEditNpc = (id, subTab) => {
    const W = UI.G.W;
    if (!W || !W.byId[id]) { UI.toast('ไม่พบข้อมูลตัวละครนี้'); return; }
    UI.editNpcId = id;
    UI.editDraft = null;
    if (subTab === 'spawn') UI.spawnDest = 'npc';
    show('edit', '✏️ ศูนย์แก้ไขตัวละครและเสกไอเทม', [['char', '🧙 แก้ไขตัวละคร'], ['pet', '🐾 สัตว์อสูร/บัฟ/กลไก'], ['spawn', '✨ เสกไอเทม'], ['bag', '🎒 จัดการถุง/คลัง'], ['dip', '📜 การทูต/ยุทธภพ'], ['sanctum', '🏛️ วิหาร/ขัดเกลา'], ['backup', '💾 สำรองก่อนแก้']], subTab || 'char', true);
    UI.render();
  };
  UI.openNpc = (id, tab) => {
    const W = UI.G && UI.G.W;
    const n = W && W.byId[id];
    if (!n) {
      const hp = W && W.sect && W.sect.historicalPeople && W.sect.historicalPeople[id];
      if (hp) {
        UI.toast("📜 " + hp.fullName + " (" + (hp.roleTh || "อดีตสมาชิกสำนัก") + ") — " + (hp.statusTh || "ไม่อยู่ในสำนักแล้ว"));
      } else {
        UI.toast("ไม่พบข้อมูลตัวละครนี้ (ออกจากสำนักหรือถูกลบแล้ว)");
      }
      return;
    }
    UI.G.R.selected = id; UI.npcId = id;
    show('npc', esc(HC.fullName(n)) + ' <span class="muted" style="font-weight:400">' + SECT.title(n) + '</span>', [
      ['ov', 'ภาพรวม'],
      ['meridian', '🪡 ชีพจร/พลังรบ'],
      ['pets', '🐾 อสูร/กลไก'],
      ['lineage', '🎓 สายเลือด/อาจารย์'],
      ['bag', '🎒 ถุงสัมภาระ'],
      ['tech', '⚔️ วรยุทธ์'],
      ['sub', '🌿 สายย่อย'],
      ['elem', 'ธาตุ/รากปราณ'],
      ['self', 'ตัวตน'],
      ['body', 'กาย'],
      ['mind', 'ปัญญา/สังคม'],
      ['skill', 'ทักษะ'],
      ['rel', 'ความสัมพันธ์'],
      ['life', 'ชีวิต'],
      ['cmp', 'เทียบกับ…']
    ], tab || 'ov', true);
    UI.render();
  };
  UI.openBuilding = id => {
    const W = UI.G && UI.G.W;
    const b = W && W.map && W.map.byId[id];
    if (!b) { UI.toast('ไม่พบข้อมูลอาคารนี้'); return; }
    UI.bldId = id;
    show('building', esc(b.nameTh), [], null);
    UI.render();
  };
  UI.openVisitor = id => {
    const W = UI.G && UI.G.W;
    const v = (W && g.VC && g.VC.findVisitor) ? g.VC.findVisitor(W, id) : null;
    if (!v) { UI.toast('ไม่พบข้อมูลผู้มาเยือนนี้'); return; }
    UI.visitorId = id;
    show('visitor', '🎐 ' + esc(v.nameTh) + ' <span class="muted" style="font-weight:400">' + esc(v.titleTh || 'ผู้มาเยือน') + '</span>', [], null, true);
    UI.render();
  };
  UI.openClue = id => {
    const W = UI.G && UI.G.W;
    const cs = W && W.world && W.world.clues;
    const inst = cs && (cs.active[id] || (cs.history || []).find(x => x.instanceId === id));
    if (!inst) { UI.toast('ไม่พบข้อมูลเบาะแสนี้'); return; }
    UI.clueId = id;
    show('clue', '🗺️ ' + esc(inst.titleTh), [], null, true);
    UI.render();
  };
  UI.focusNpc = id => { const n = UI.G.W.byId[id]; if (!n) return; UI.G.R.selected = id; if (!n.away && !n.dead) { UI.G.R.focus(n.x, n.y, Math.max(UI.G.R.cam.z, 2)); } UI.updateHud(true); };

  function R_SHADERS_HAS(k) { return !!(g.Render && g.Render.CELESTIAL_SHADERS && g.Render.CELESTIAL_SHADERS[k]); }
  UI.doAction = (a, arg) => {
    const G = UI.G, W = G.W;
    if (a === 'npc') { const p = String(arg || '').split('|'); UI.openNpc(p[0], p[1]); }
    else if (a === "chronicle-filter") { UI.chronicleFilter = arg || "all"; UI.sectChronicleLimit = 50; UI.render(); }
    else if (a === "chronicle-person") { UI.chronicleNpcId = arg || null; UI.chronicleFilter = "all"; UI.sectChronicleLimit = 50; UI.logFilters = new Set(["all"]); UI.open("log"); }
    else if (a === "chronicle-clear-person") { UI.chronicleNpcId = null; UI.render(); }
    else if (a === "sect-chronicle-more") { UI.sectChronicleLimit = (UI.sectChronicleLimit || 50) + 50; UI.render(); }
    else if (a === "world-chronicle-cat") { UI.worldChronicleCategory = arg || "all"; UI.worldChronicleLimit = 15; UI.render(); }
    else if (a === "world-chronicle-fmt") { UI.worldChronicleFormat = arg || "all"; UI.worldChronicleLimit = 15; UI.render(); }
    else if (a === "world-chronicle-more") { UI.worldChronicleLimit = (UI.worldChronicleLimit || 15) + 20; UI.render(); }
    else if (a === "timeline-filter") { UI.timelineFilter = arg || "all"; UI.timelineLimit = 25; if (UI.audio) UI.audio.playGuqinChime(); UI.render(); }
    else if (a === "timeline-more") { UI.timelineLimit = (UI.timelineLimit || 25) + 25; UI.render(); }
    else if (a === 'toggle-audio') {
      const isMuted = UI.audio ? UI.audio.toggleMute() : false;
      if (!isMuted && UI.audio) UI.audio.playBell();
      UI.toast(isMuted ? '🔇 ปิดเสียงบรรยากาศยุทธภพแล้ว' : '🔊 เปิดเสียงบรรยากาศยุทธภพแล้ว');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'play-audio-demo') {
      if (arg === 'bell' && UI.audio) UI.audio.playBell();
      else if (arg === 'blade' && UI.audio) UI.audio.playBladeClash();
      else if (UI.audio) UI.audio.playGuqinChime();
    }
    else if (a === 'cycle-celestial-preview') {
      const order = ['AUTO', 'BLOOD_MOON', 'NINE_SUNS', 'METEOR_SHOWER', 'PRANA_TIDE'];
      const cur = (G.opts && G.opts.celestialPreview) || (G.R && G.R.opts && G.R.opts.celestialPreview) || 'AUTO';
      const next = (arg && R_SHADERS_HAS(arg)) ? arg : order[(order.indexOf(cur) + 1) % order.length];
      if (G.opts) G.opts.celestialPreview = next;
      if (G.R && G.R.opts) G.R.opts.celestialPreview = next;
      const spec = (g.Render && g.Render.CELESTIAL_SHADERS && g.Render.CELESTIAL_SHADERS[next]) || { icon: '✨', nameTh: next };
      if (UI.audio) UI.audio.playGuqinChime();
      UI.toast(spec.icon + ' ทัศนียภาพฟ้าดิน: ' + spec.nameTh);
      UI.applyOpts();
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'toggle-vfx-opt') {
      const k = String(arg || 'realmHalos');
      const curVal = (G.opts && G.opts[k] !== undefined) ? G.opts[k] : (G.R && G.R.opts && G.R.opts[k] !== undefined ? G.R.opts[k] : true);
      const nextVal = !curVal;
      if (G.opts) G.opts[k] = nextVal;
      if (G.R && G.R.opts) G.R.opts[k] = nextVal;
      UI.applyOpts();
      UI.toast((nextVal ? '✨ เปิดแสดงผล: ' : '○ ซ่อนแสดงผล: ') + k);
      UI.render();
    }
    else if (a === 'cycle-ceremony-preview') {
      const order = ['AUTO', 'BANQUET', 'COMPANION_WEDDING', 'ANCESTRAL_RITE', 'TOURNAMENT_ARENA'];
      const cur = (G.opts && G.opts.ceremonyPreview) || (G.R && G.R.opts && G.R.opts.ceremonyPreview) || 'AUTO';
      const next = (arg && g.Render && g.Render.CEREMONY_PRESETS && g.Render.CEREMONY_PRESETS[arg]) ? arg : order[(order.indexOf(cur) + 1) % order.length];
      if (G.opts) G.opts.ceremonyPreview = next;
      if (G.R && G.R.opts) G.R.opts.ceremonyPreview = next;
      const spec = (g.Render && g.Render.CEREMONY_PRESETS && g.Render.CEREMONY_PRESETS[next]) || { icon: '🎎', nameTh: next };
      if (UI.audio) UI.audio.playBell();
      UI.toast(spec.icon + ' ฉากทัศน์พิธีกรรมสำนัก: ' + spec.nameTh);
      UI.applyOpts();
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'focus-plaza-ceremony') {
      const pl = W && W.map && W.map.byId && W.map.byId.plaza;
      if (pl && G.R && G.R.focus) {
        G.R.focus(pl.x + pl.w / 2, pl.y + pl.h / 2, 1.85);
      }
      if (arg && g.Render && g.Render.CEREMONY_PRESETS && g.Render.CEREMONY_PRESETS[arg]) {
        if (G.opts) G.opts.ceremonyPreview = arg;
        if (G.R && G.R.opts) G.R.opts.ceremonyPreview = arg;
      }
      UI.close();
      UI.toast('🏯 โฟกัสกล้องสู่ลานแปดทิศกลางสำนัก');
    }
    else if (a === 'focus-martial-arena') {
      const tg = W && W.map && W.map.byId && W.map.byId.training_ground;
      if (tg && G.R && G.R.focus) {
        G.R.focus(tg.x + tg.w / 2, tg.y + tg.h / 2, 1.95);
      }
      if (G.opts) G.opts.ceremonyPreview = 'TOURNAMENT_ARENA';
      if (G.R && G.R.opts) G.R.opts.ceremonyPreview = 'TOURNAMENT_ARENA';
      UI.close();
      UI.toast('🏆 โฟกัสกล้องสู่เวทีประลองยุทธ์แปดเหลี่ยม');
    }
    else if (a === 'set-diorama-pose') {
      UI.dioramaPose = arg || 'cultivate';
      UI.render();
    }
    else if (a === 'set-sect-subtab') {
      UI.sectSubTab = arg || 'CORE';
      UI.render();
      const sb = $('shBody'); if (sb) sb.scrollTop = 0;
    }
    else if (a === 'set-sect-posts-subtab') {
      UI.sectPostsSubTab = arg || 'OFFICES';
      UI.render();
      const sb = $('shBody'); if (sb) sb.scrollTop = 0;
    }
    else if (a === 'set-stock-subtab') {
      UI.stockItemsSubTab = arg || 'GRID';
      UI.render();
      const sb = $('shBody'); if (sb) sb.scrollTop = 0;
    }
    else if (a === 'set-shop-subtab') {
      UI.shopSubTab = arg || 'EXCHANGE';
      UI.render();
      const sb = $('shBody'); if (sb) sb.scrollTop = 0;
    }
    else if (a === 'set-npc-subtab') {
      UI.npcSubTab = arg || 'CORE';
      UI.render();
      const sb = $('shBody'); if (sb) sb.scrollTop = 0;
    }
    else if (a === 'set-exp-subtab') {
      UI.worldExpSubTab = arg || 'TRAVEL';
      UI.render();
      const sb = $('shBody'); if (sb) sb.scrollTop = 0;
    }
    else if (a === 'set-disc-subtab') {
      UI.worldDiscSubTab = arg || 'PORTALS';
      UI.render();
      const sb = $('shBody'); if (sb) sb.scrollTop = 0;
    }
    else if (a === 'set-content-subtab') {
      UI.worldContentSubTab = arg || 'REGIONS';
      UI.render();
      const sb = $('shBody'); if (sb) sb.scrollTop = 0;
    }
    else if (a === 'set-building-subtab') {
      UI.buildingSubTab = arg || 'OVERVIEW';
      UI.render();
      const sb = $('shBody'); if (sb) sb.scrollTop = 0;
    }
    else if (a === 'set-edit-char-subtab') {
      UI.collectEditDraftFromDom();
      UI.editCharSubTab = arg || 'CULT_ECON';
      UI.render();
      const sb = $('shBody'); if (sb) sb.scrollTop = 0;
    }
    else if (a === 'set-edit-pet-subtab') {
      UI.editPetSubTab = arg || 'PETS_BUFFS';
      UI.render();
      const sb = $('shBody'); if (sb) sb.scrollTop = 0;
    }
    else if (a === 'set-npc-forbidden-seal') {
      const [npcIdArg, sealKey, archKey] = String(arg || '').split('|');
      const n = (npcIdArg && W.byId[npcIdArg]) || (UI.npcId && W.byId[UI.npcId]) || W.byId[W.sect.masterId];
      if (n && CULT.FORBIDDEN_ARTS) {
        const res = CULT.FORBIDDEN_ARTS.setForbiddenSealMode(W, n, sealKey || 'SEALED_RESTRAINT', archKey || null);
        if (res) {
          UI.dioramaPose = 'forbidden';
          UI.toast(res.sealSpec.icon + ' ปรับผนึกวิชาต้องห้ามของ「' + HC.fullName(n) + '」เป็น: ' + res.sealSpec.nameTh);
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'demo-forbidden-taboo') {
      const targetId = arg || UI.npcId || (W && W.sect && W.sect.masterId);
      const n = targetId && W && W.byId && W.byId[targetId];
      if (n && CULT.FORBIDDEN_ARTS) {
        const res = CULT.FORBIDDEN_ARTS.setForbiddenSealMode(W, n, 'BLOOD_TABOO_UNLEASHED');
        UI.dioramaPose = 'forbidden';
        if (G.R) {
          G.R.selected = n.id;
          if (G.R.focus) G.R.focus(n.x, n.y, 2.25);
        }
        if (res) {
          UI.toast(res.spec.icon + ' ' + HC.fullName(n) + ' ปลดผนึก「' + res.spec.nameTh + '」(โจมตี +' + Math.round(res.effAtkBonusPct * 100) + '%)!');
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-npc-passive-constellation') {
      const [npcIdArg, constKey] = String(arg || '').split('|');
      const n = (npcIdArg && W.byId[npcIdArg]) || (UI.npcId && W.byId[UI.npcId]) || W.byId[W.sect.masterId];
      if (n && CULT.PASSIVE_RESONANCE) {
        const res = CULT.PASSIVE_RESONANCE.setFocusConstellation(W, n, constKey || 'AUTO');
        if (res) {
          UI.toast(res.spec.icon + ' เชื่อมโยงดาราจักรวิชาติดตัวของ「' + HC.fullName(n) + '」เข้ากับ: ' + res.spec.nameTh);
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-sect-forbidden-policy') {
      if (SECT.FORBIDDEN_VAULT) {
        const res = SECT.FORBIDDEN_VAULT.setVaultPolicy(W, arg || 'ELDER_LICENSED_ACCESS');
        if (res && res.ok) {
          UI.toast(res.spec.icon + ' ประกาศนโยบายหอผนึกคัมภีร์ต้องห้าม:「' + res.spec.nameTh + '」!');
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'perform-forbidden-altar-ritual') {
      if (SECT.FORBIDDEN_VAULT) {
        const res = SECT.FORBIDDEN_VAULT.performAltarRitual(W, arg || 'AWAKEN_BLOODLINE_ALTAR');
        if (res && res.ok) {
          UI.toast(res.spec.icon + ' ประกอบ「' + res.spec.nameTh + '」สำเร็จ (' + res.affectedCount + ' คน)!');
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-npc-support-posture') {
      const [npcIdArg, postureKey, archKey] = String(arg || '').split('|');
      const n = (npcIdArg && W.byId[npcIdArg]) || (UI.npcId && W.byId[UI.npcId]) || W.byId[W.sect.masterId];
      if (n && CULT.SUPPORT_ARTS) {
        const res = CULT.SUPPORT_ARTS.setSupportPosture(W, n, postureKey || 'SOUL_MELODY_HARMONY', archKey || null);
        if (res) {
          UI.dioramaPose = 'support';
          UI.toast(res.postureSpec.icon + ' ปรับท่วงท่าสายสนับสนุนของ「' + HC.fullName(n) + '」เป็น: ' + res.postureSpec.nameTh);
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'demo-support-art-aura') {
      const targetId = arg || UI.npcId || (W && W.sect && W.sect.masterId);
      const n = targetId && W && W.byId && W.byId[targetId];
      if (n && CULT.SUPPORT_ARTS) {
        CULT.SUPPORT_ARTS.ensureState(n);
        const res = CULT.SUPPORT_ARTS.stepFacilityAndDailySynergy(W, n);
        UI.dioramaPose = 'support';
        if (G.R) {
          G.R.selected = n.id;
          if (G.R.focus) G.R.focus(n.x, n.y, 2.25);
        }
        if (res && res.supportProfile) {
          const sp = res.supportProfile;
          UI.toast(sp.spec.icon + ' ' + HC.fullName(n) + ' สำแดง「' + sp.spec.nameTh + '」หนุนศิษย์รอบข้าง ' + res.affected + ' คน!');
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'trigger-sect-emergency-support') {
      if (CULT.SUPPORT_ARTS) {
        const res = CULT.SUPPORT_ARTS.triggerSectEmergencySupport(W, arg || 'ZITHER_PURGE_HEART_DEMON');
        if (res && res.ok) {
          const msgMap = {
            ZITHER_PURGE_HEART_DEMON: '🎶 บรรเลงคีตเวทย์พิณขลุ่ยหยกสลายจิตมารและหนุนโอกาสทะลวงด่านทั้งสำนัก (' + res.affectedCount + ' คน)!',
            INFIRMARY_ACUPOINT_HEAL: '🪡 ระดมเข็มทองสมานแผลและขับพิษโอสถศิษย์ทั้งสำนัก (' + res.affectedCount + ' คน)!',
            QIMEN_BANNER_RALLY: '🚩 ชูธงรบฉีเหมินฟื้นฟูแรงกายและปราณพร้อมรบทั้งสำนัก (' + res.affectedCount + ' คน)!'
          };
          UI.toast(msgMap[res.mode] || '🎶 สำแดงวิชาสนับสนุนทั้งสำนักสำเร็จ!');
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-npc-defensive-posture') {
      const [npcIdArg, postureKey, archKey] = String(arg || '').split('|');
      const n = (npcIdArg && W.byId[npcIdArg]) || (UI.npcId && W.byId[UI.npcId]) || W.byId[W.sect.masterId];
      if (n && CULT.DEFENSIVE_ARTS) {
        const res = CULT.DEFENSIVE_ARTS.setDefensivePosture(W, n, postureKey || 'COUNTER_PARRY_STANCE', archKey || null);
        if (res) {
          UI.dioramaPose = 'defensive';
          UI.toast(res.postureSpec.icon + ' ปรับท่าตั้งรับวิชาคุ้มกายของ「' + HC.fullName(n) + '」เป็น: ' + res.postureSpec.nameTh);
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'demo-defensive-aegis') {
      const targetId = arg || UI.npcId || (W && W.sect && W.sect.masterId);
      const n = targetId && W && W.byId && W.byId[targetId];
      if (n && CULT.DEFENSIVE_ARTS) {
        CULT.DEFENSIVE_ARTS.ensureState(n);
        const df = CULT.DEFENSIVE_ARTS.resolveNpcDefense(W, n);
        UI.dioramaPose = 'defensive';
        if (G.R) {
          G.R.selected = n.id;
          if (G.R.focus) G.R.focus(n.x, n.y, 2.25);
        }
        if (df) {
          UI.toast(df.spec.icon + ' ' + HC.fullName(n) + ' สำแดง「' + df.spec.nameTh + '」(ลดดาเมจ -' + Math.round(df.effDmgRedPct * 100) + '%)!');
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-npc-mantra-stance') {
      const [npcIdArg, stanceKey] = String(arg || '').split('|');
      const n = (npcIdArg && W.byId[npcIdArg]) || (UI.npcId && W.byId[UI.npcId]) || W.byId[W.sect.masterId];
      if (n && CULT.MANTRA_SYSTEM) {
        const res = CULT.MANTRA_SYSTEM.setMantraStance(W, n, stanceKey || 'HARMONIOUS_CIRCULATION');
        if (res) {
          UI.dioramaPose = 'mantra';
          UI.toast(res.stanceSpec.icon + ' ปรับจังหวะโคจรปราณของ「' + HC.fullName(n) + '」เป็น: ' + res.stanceSpec.nameTh);
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'demo-mantra-resonance') {
      const targetId = arg || UI.npcId || (W && W.sect && W.sect.masterId);
      const n = targetId && W && W.byId && W.byId[targetId];
      if (n && CULT.MANTRA_SYSTEM) {
        CULT.MANTRA_SYSTEM.ensureState(n);
        const mr = CULT.MANTRA_SYSTEM.stepMeditationResonance(W, n);
        UI.dioramaPose = 'mantra';
        if (G.R) {
          G.R.selected = n.id;
          if (G.R.focus) G.R.focus(n.x, n.y, 2.25);
        }
        if (mr) {
          UI.toast(mr.spec.icon + ' ' + HC.fullName(n) + ' สำแดง「' + mr.spec.nameTh + '」(×' + mr.effectiveCultMult.toFixed(2) + ')!');
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-sect-formation-stance') {
      if (SECT.FORMATION_WARFARE) {
        const res = SECT.FORMATION_WARFARE.setFormationStance(W, arg || 'FIVE_ELEMENT_NURTURE');
        if (res && res.ok) {
          UI.toast(res.spec.icon + ' แปรขบวนมหาค่ายกลสำนักเป็น「' + res.spec.nameTh + '」!');
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-sect-weather-phenomenon') {
      if (SECT.FORMATION_WARFARE) {
        const res = SECT.FORMATION_WARFARE.triggerWeatherPhenomenon(W, arg || 'clear');
        if (res && res.ok) {
          UI.toast(res.spec.icon + ' ปรากฏการณ์ฟ้าดินเหนือสำนักเปลี่ยนเป็น「' + res.spec.nameTh + '」!');
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-npc-qinggong-mode') {
      const [npcIdArg, modeKey] = String(arg || '').split('|');
      const n = (npcIdArg && W.byId[npcIdArg]) || (UI.npcId && W.byId[UI.npcId]) || W.byId[W.sect.masterId];
      if (n && CULT.QINGGONG) {
        const st = CULT.QINGGONG.ensureState(n);
        st.preferredMode = modeKey || 'AUTO';
        st.exhaustedFallback = false;
        n._qgUnlockCache = null;
        const resolved = CULT.QINGGONG.resolveNpcMode(W, n);
        UI.toast('🌬️ ตั้งค่ารูปแบบการเคลื่อนที่ของ「' + HC.fullName(n) + '」เป็น: ' + resolved.spec.nameTh);
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'demo-qinggong-flight') {
      const targetId = arg || UI.npcId || (W && W.sect && W.sect.masterId);
      const n = targetId && W && W.byId && W.byId[targetId];
      if (n && CULT.QINGGONG) {
        const stObj = (n.h && n.h.state) || n.state;
        if (stObj) stObj.qi = Math.max(stObj.qi || 0, CULT.qiMax(n));
        const st = CULT.QINGGONG.ensureState(n);
        st.exhaustedFallback = false;
        const qg = CULT.QINGGONG.resolveNpcMode(W, n);
        const destX = clamp(Math.round(n.x + (n.x < 118 ? 18 : -18)), 25, 210);
        const destY = clamp(Math.round(n.y + (n.y < 75 ? 10 : -10)), 22, 130);
        AI.goTo(W, n, destX, destY);
        if (G.R) {
          G.R.selected = n.id;
          if (G.R.focus) G.R.focus(n.x, n.y, 2.2);
        }
        UI.dioramaPose = 'qinggong';
        UI.toast(qg.spec.icon + ' ' + HC.fullName(n) + ' สำแดง「' + qg.spec.nameTh + '」(ความเร็ว ×' + qg.speedMult.toFixed(2) + ')!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'focus-tribulation') {
      const activeList = (W && W.sect && Array.isArray(W.sect.activeTribulations)) ? W.sect.activeTribulations.filter(x => x && x.active) : [];
      const targetId = arg || (activeList[0] && activeList[0].npcId) || UI.npcId || (W && W.sect && W.sect.masterId);
      const n = targetId && W && W.byId && W.byId[targetId];
      if (n) {
        if (G.R) {
          G.R.selected = n.id;
          if (G.R.focus) G.R.focus(n.x, n.y, 2.25);
        }
        if (UI.audio) UI.audio.playBell();
        UI.close();
        UI.toast('⚡ ส่องดูทัณฑ์สวรรค์ของ「' + HC.fullName(n) + '」บนแผนที่สำนัก');
      } else {
        UI.toast('ยังไม่มีศิษย์ที่กำลังฝ่าด่านทัณฑ์สวรรค์ในขณะนี้');
      }
      UI.updateHud(true);
    }
    else if (a === 'start-tribulation-ritual') {
      const targetId = arg || UI.npcId || (W && W.sect && W.sect.masterId);
      const n = targetId && W && W.byId && W.byId[targetId];
      if (n && n.cult && CULT.TRIBULATION && CULT.TRIBULATION.start) {
        const res = CULT.TRIBULATION.start(W, n, { prep: 0.25, totalTicks: 15, announce: true, standaloneRitual: true });
        if (res && res.ok) {
          n.tribulationState.standaloneRitual = true;
          if (G.R) {
            G.R.selected = n.id;
            if (G.R.focus) G.R.focus(n.x, n.y, 2.25);
          }
          if (UI.audio) UI.audio.playBell();
          UI.toast('⛈️ อัญเชิญทัณฑ์สวรรค์: ' + HC.fullName(n) + ' เริ่มฝ่าด่าน (' + res.state.boltLabelTh + ')!');
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'preview-signature-vfx') {
      const [npcIdArg, sigOrTechId] = String(arg || '').split('|');
      const n = (npcIdArg && W.byId[npcIdArg]) || (UI.npcId && W.byId[UI.npcId]) || W.byId[W.sect.masterId];
      if (n && g.SK) {
        const previewTech = CULT.tech(sigOrTechId);
        const sigKey = (g.SK.SIGNATURE_VFX_CATALOG && g.SK.SIGNATURE_VFX_CATALOG[sigOrTechId])
          ? sigOrTechId
          : (g.SK.resolveSignatureVfx && g.SK.resolveSignatureVfx(CULT.tech(sigOrTechId) || { id: sigOrTechId, legendary: true })) || 'sig_meteor_sword_rain';
        const spec = (g.SK.SIGNATURE_VFX_CATALOG && g.SK.SIGNATURE_VFX_CATALOG[sigKey]) || { nameTh: sigKey, icon: '✨' };
        n.castFx = {
          seq: ((n.castFx && n.castFx.seq) || 0) + 1,
          t: W.t,
          kind: 'normal',
          signatureVfx: sigKey,
          legendary: !!(previewTech && previewTech.legendary),
          motif: previewTech && previewTech.fxKind || null,
          techId: sigOrTechId || sigKey,
          x: (Number.isFinite(n.x) ? n.x : 118) + 3,
          y: Number.isFinite(n.y) ? n.y : 75
        };
        if (G.R && G.R.updateCastEffects) G.R.updateCastEffects(performance.now());
        if (UI.audio) UI.audio.playBladeClash();
        UI.toast((spec.icon || '✨') + ' สำแดงเอฟเฟกต์วิชาเฉพาะตัว:「' + spec.nameTh + '」!');
      }
      UI.render();
    }
    else if (a === 'resolve-extradition') {
      const [ultId, choice] = String(arg || '').split('|');
      const res = (EXPED && EXPED.resolveExtraditionUltimatum) ? EXPED.resolveExtraditionUltimatum(W, ultId, choice || 'DEFY_PROTECT') : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast(res.chronicle ? res.chronicle.titleTh : 'ตัดสินใจสารทวงตัวเรียบร้อย');
      } else {
        UI.toast('ไม่สามารถดำเนินการได้: ' + (res && res.reason ? res.reason : 'ศิลาไม่พอหรือไม่พบสาร'));
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'launch-vendetta-reclamation') {
      if (UI.audio) UI.audio.playBladeClash();
      const res = (EXPED && EXPED.launchVendettaReclamation) ? EXPED.launchVendettaReclamation(W, arg || null, null, {}) : { ok: false };
      if (res && res.ok && res.chronicle) {
        UI.toast('👑 ' + res.chronicle.titleTh);
      } else if (res && res.reason === 'insufficient-stage') {
        UI.toast('ต้องบ่มเพาะตบะถึงขั้น ' + (res.requiredStage || 5) + ' ขึ้นไปก่อนจึงจะนำทัพทวงคืนสำนักเดิมได้ (ปัจจุบันขั้น ' + (res.stage || 1) + ')');
      } else {
        UI.toast('ยังไม่พร้อมเปิดศึกทวงคืน: ' + (res && res.reason ? res.reason : 'กำลังพลไม่เพียงพอ'));
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'bind-taoist-companions') {
      const [idA, idB] = String(arg || '').split('|');
      const res = (SECT && SECT.bindTaoistCompanions) ? SECT.bindTaoistCompanions(W, idA || null, idB || null, { force: true }) : { ok: false };
      if (res && res.ok && UI.audio) UI.audio.playBell();
      UI.toast(res && res.ok && res.chronicle ? ('💞 ' + res.chronicle.titleTh) : 'ยังไม่มีคู่ศิษย์ที่พร้อมผูกวาสนา');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'practice-dual-cultivation') {
      const [idA, idB] = String(arg || '').split('|');
      const res = (SECT && SECT.practiceDualCultivation) ? SECT.practiceDualCultivation(W, idA, idB) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast('💞 โคจรปราณคู่บำเพ็ญสำเร็จ! ตบะเพิ่มขึ้น +' + res.partnerAGain + ' / +' + res.partnerBGain + ' และชำระจิตมาร');
      } else {
        UI.toast('ไม่สามารถโคจรปราณคู่ได้ในขณะนี้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'spawn-companion-offspring') {
      const [idA, idB] = String(arg || '').split('|');
      const res = (SECT && SECT.spawnCompanionOffspring) ? SECT.spawnCompanionOffspring(W, idA || null, idB || null, { forceMutatedRoot: true }) : { ok: false };
      if (res && res.ok && UI.audio) UI.audio.playBell();
      UI.toast(res && res.ok && res.chronicle ? ('👶 ' + res.chronicle.titleTh) : 'ต้องมีคู่บำเพ็ญในสำนักก่อนจึงจะมีทายาทได้');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'interact-wandering-figure') {
      const [figId, actType] = String(arg || '').split('|');
      if (actType === 'DUEL' && UI.audio) UI.audio.playBladeClash();
      const res = (EXPED && EXPED.interactWanderingFigure) ? EXPED.interactWanderingFigure(W, figId, actType || 'INTERACT', {}) : { ok: false };
      UI.toast(res && res.ok && res.chronicle ? (res.chronicle.titleTh) : ('ไม่สามารถดำเนินการได้: ' + (res && res.reason ? res.reason : '')));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'recruit-wandering-figure') {
      const res = (EXPED && EXPED.recruitWanderingFigure) ? EXPED.recruitWanderingFigure(W, arg, {}) : { ok: false };
      if (res && res.ok && res.npc) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🤝 ต้อนรับยอดคนพเนจร「' + HC.fullName(res.npc) + '」เข้าเป็นสมาชิกสำนัก!');
      } else if (res && res.reason === 'insufficient-affinity-or-fame') {
        UI.toast('ต้องสร้างไมตรีกับยอดคนพเนจรถึง 50/100 (ปัจจุบัน ' + (res.affinity || 0) + '/100) หรือมีชื่อเสียงสำนัก ≥ 80 ก่อนจึงจะชักชวนเข้าสำนักได้');
      } else {
        UI.toast('ยังไม่สามารถชักชวนได้ในขณะนี้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'exchange-craft-elder') {
      const res = (EXPED && EXPED.exchangeWithCraftElder) ? EXPED.exchangeWithCraftElder(W, arg, {}) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast('⚗️ ' + (res.chronicle ? res.chronicle.titleTh : 'แลกเปลี่ยนกับผู้อาวุโสหลอมสร้างสำเร็จ!'));
      } else if (res && res.reason === 'insufficient-stones') {
        UI.toast('ศิลาวิญญาณไม่พอ (ต้องใช้ ' + (res.required || 150) + ' ศิลา)');
      } else {
        UI.toast('ไม่สามารถแลกเปลี่ยนได้: ' + (res && res.reason ? res.reason : 'สำนักเป็นศัตรู'));
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'attune-building-leyline') {
      const [bldId, el] = String(arg || '').split('|');
      const res = (SECT && SECT.FENG_SHUI) ? SECT.FENG_SHUI.attuneBuilding(W, null, bldId || UI.bldId, el || null) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('☯️ ' + HC.fullName(res.caster) + ' วางแกนฮวงจุ้ย ณ ' + res.record.buildingNameTh + ' (เกรด ' + res.node.grade + ')');
      } else {
        UI.toast('ไม่สามารถวางแกนฮวงจุ้ยได้ในขณะนี้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'activate-grand-array') {
      const res = (SECT && SECT.FENG_SHUI) ? SECT.FENG_SHUI.activateGrandGuardianArray(W, null, arg || null, { force: true }) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🌌 เปิดเดิน「' + res.grandArray.nameTh + '」สำเร็จ!');
      } else {
        UI.toast('ต้องปรับจูนฮวงจุ้ยอาคารอย่างน้อย 3 แห่งก่อนเปิดค่ายกลใหญ่');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'counsel-heart-demon') {
      const [npcId, knotId] = String(arg || '').split('|');
      const res = (SECT && SECT.HEART_DEMON) ? SECT.HEART_DEMON.counselHeartDemon(W, null, npcId, knotId || null) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast('🪷 ' + HC.fullName(res.counselor) + ' ชี้แนะคลายปมมารในใจให้ ' + HC.fullName(res.target) + ' แปรเป็นตราแจ้งชัดแห่งเต๋า!');
      } else {
        UI.toast('ไม่มีปมมารในใจที่รอการคลี่คลายในขณะนี้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'devour-heart-demon') {
      const [npcId, knotId] = String(arg || '').split('|');
      const res = (SECT && SECT.HEART_DEMON) ? SECT.HEART_DEMON.devourHeartDemon(W, npcId, knotId || null) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBladeClash();
        UI.toast('🔥 กลืนกินปมมารในใจแปรเป็นตราเพลิงมารสำเร็จ!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'awaken-weapon-spirit') {
      const res = (SECT && SECT.SOUL_FORGE) ? SECT.SOUL_FORGE.awakenWeaponSpirit(W, null, arg || UI.npcId, { initialXp: 40 }) : { ok: false };
      if (res && res.ok && res.weaponSpirit) {
        if (UI.audio) UI.audio.playBladeClash();
        UI.toast('🗡️ ปลุกจิตวิญญาณศาสตรา「' + res.weaponSpirit.spiritNameTh + '」ขั้นที่ ' + res.weaponSpirit.stage + ' สำเร็จ!');
      } else if (res && res.reason) {
        UI.toast('ไม่สามารถปลุกจิตศาสตราได้ (' + res.reason + ')');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'annotate-heritage-sutra') {
      const res = (SECT && SECT.SOUL_FORGE) ? SECT.SOUL_FORGE.annotateHeritageSutra(W, null, arg || null) : { ok: false };
      if (res && res.ok && res.sutra) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast('📜 ' + HC.fullName(res.scholar) + ' ขัดเกลาคัมภีร์「' + res.sutra.nameTh + '」สู่ ' + res.sutra.editionNameTh + '!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'dispatch-trade-caravan') {
      const res = (SECT && SECT.CARAVAN_AUCTION) ? SECT.CARAVAN_AUCTION.dispatchTradeCaravan(W, arg || null, null, {}) : { ok: false };
      if (res && res.ok && res.caravan) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🐪 ' + res.caravan.summaryTh);
      } else {
        UI.toast(res && res.reason === 'caravan-cooldown' ? '⏳ คาราวานการค้าอยู่ระหว่างคูลดาวน์ (ส่งได้ทุก 15 วัน)' : 'ไม่สามารถจัดส่งคาราวานได้ในขณะนี้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'bid-auction-lot') {
      const res = (SECT && SECT.CARAVAN_AUCTION) ? SECT.CARAVAN_AUCTION.bidOnAuctionLot(W, arg || null, null, {}) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🔨 ชนะการประมูล「' + res.lot.nameTh + '」(' + res.price + ' ศิลา) — ' + res.effectSummaryTh);
      } else if (res && res.reason === 'insufficient-stones') {
        UI.toast('ศิลาวิญญาณในคลังไม่พอประมูล (ต้องการ ' + (res.required || 350) + ' ศิลา)');
      } else {
        UI.toast('ไม่สามารถประมูลรายการนี้ได้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'convene-elder-council') {
      const res = (SECT && SECT.ELDER_COUNCIL_EDICTS) ? SECT.ELDER_COUNCIL_EDICTS.conveneElderCouncil(W, arg || null, null, {}) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🏛️ มติสภาผู้อาวุโส: ' + res.effectSummaryTh);
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'execute-standing-edicts') {
      const res = (SECT && SECT.ELDER_COUNCIL_EDICTS) ? SECT.ELDER_COUNCIL_EDICTS.executeStandingEdicts(W, {}) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('📜 ราชโองการโควตาอัตโนมัติ: ' + res.craftedSummaryTh);
      } else {
        UI.toast(res && res.reason === 'cooldown' ? '⏳ เพิ่งเบิกจ่ายโควตาราชโองการไป (คูลดาวน์ 10 วัน)' : 'ศิลาหรือเงื่อนไขไม่เพียงพอสำหรับราชโองการโควตา');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'audit-officer-conduct') {
      const res = (SECT && SECT.ELDER_COUNCIL_EDICTS) ? SECT.ELDER_COUNCIL_EDICTS.auditOfficerConduct(W, arg || null, null, {}) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast(res.summaryTh);
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'run-secret-realm-nodes') {
      const res = (SECT && SECT.SECRET_REALM_NODES) ? SECT.SECRET_REALM_NODES.runFullNodeExpedition(W, null, null, arg || null, {}) : { ok: false };
      if (res && res.ok && res.run) {
        if (UI.audio) UI.audio.playBladeClash();
        UI.toast('🧭 ' + res.run.summaryTh);
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'restore-ancient-scroll') {
      const res = (SECT && SECT.SECRET_REALM_NODES) ? SECT.SECRET_REALM_NODES.restoreAncientScroll(W, null, { force: true }) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast(res.summaryTh);
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'convene-grand-assembly') {
      const res = (SECT && SECT.GRAND_ASSEMBLY_BANQUET) ? SECT.GRAND_ASSEMBLY_BANQUET.conveneGrandAssembly(W, {}) : { ok: false };
      if (res && res.ok && res.assembly) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🏆 ' + res.assembly.summaryTh);
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'host-spirit-banquet') {
      const res = (SECT && SECT.GRAND_ASSEMBLY_BANQUET) ? SECT.GRAND_ASSEMBLY_BANQUET.hostSpiritCuisineBanquet(W, null, arg || null, {}) : { ok: false };
      if (res && res.ok && res.banquet) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast(res.banquet.summaryTh);
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'director-pulse') {
      const [persona, lens] = String(arg || '').split('|');
      const res = (SECT && SECT.HEAVENLY_DAO_DIRECTOR) ? SECT.HEAVENLY_DAO_DIRECTOR.evaluateDirectorPulse(W, persona || null, lens || null, {}) : { ok: false };
      if (res && res.ok && res.record) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast('🌌 ' + res.record.interventionSummaryTh);
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'shift-cultivation-era') {
      const res = (SECT && SECT.HEAVENLY_DAO_DIRECTOR) ? SECT.HEAVENLY_DAO_DIRECTOR.shiftCultivationEra(W, arg || null, {}) : { ok: false };
      if (res && res.ok && res.era) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🌌 ก้าวเข้าสู่「' + res.era.nameTh + '」!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'open-sect-peaks') {
      UI.activePeakId = arg || 'OVERVIEW';
      UI.open('sect', 'peaks');
    }
    else if (a === 'select-peak-tab') {
      UI.activePeakId = String(arg || 'OVERVIEW');
      UI.render();
    }
    else if (a === 'focus-peak-camera') {
      const peakId = String(arg || 'PEAK_AZURE_SWORD');
      const pb = (MAP && MAP.getPeakBuilding && W && W.map) ? MAP.getPeakBuilding(W.map, peakId) : null;
      if (pb && G && G.R) {
        UI.close();
        G.R.follow = false;
        G.R.focus(pb.x + pb.w / 2, pb.y + pb.h / 2, 1.5);
        UI.toast('🔍 เคลื่อนกล้องส่องดู「' + pb.nameTh + '」(' + (pb.dirTh || '') + ')');
      }
    }
    else if (a === 'found-specific-peak') {
      const peakId = String(arg || 'PEAK_AZURE_SWORD');
      const res = (SECT && SECT.PEAKS) ? SECT.PEAKS.foundPeak(W, peakId, { allowDecree: true }) : { ok: false };
      if (res && res.ok && res.peak) {
        if (MAP && MAP.syncPeakSanctuaries) MAP.syncPeakSanctuaries(W);
        if (UI.audio) UI.audio.playBell();
        UI.activePeakId = peakId;
        UI.toast('⛰️ สถาปนา「' + res.peak.nameTh + '」สำเร็จ! หมอกปราณสลายตัวเผยโฉมอาคารยอดเขาแล้ว');
      } else {
        UI.toast('ยังไม่สามารถสถาปนายอดเขานี้ได้: ' + ((res && res.reason) || ''));
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'appoint-peak-leader') {
      const [peakId, role, npcId] = String(arg || '').split('|');
      const res = (SECT && SECT.PEAKS && SECT.PEAKS.appointPeakLeader) ? SECT.PEAKS.appointPeakLeader(W, peakId, role || 'MASTER', npcId || null) : { ok: false };
      if (res && res.ok && res.leader) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('👑 แต่งตั้ง「' + HC.fullName(res.leader) + '」เป็น' + (res.role === 'MASTER' ? 'ประธาน' : 'รองประธาน') + res.peak.nameTh + ' สำเร็จ!');
      } else {
        UI.toast('ไม่มีศิษย์ที่เหมาะสมสำหรับการแต่งตั้งในขณะนี้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'remove-peak-leader') {
      const [peakId, role] = String(arg || '').split('|');
      const res = (SECT && SECT.PEAKS && SECT.PEAKS.removePeakLeader) ? SECT.PEAKS.removePeakLeader(W, peakId, role || 'MASTER') : { ok: false };
      if (res && res.ok) {
        UI.toast('ถอดถอนตำแหน่งผู้นำยอดเขาเรียบร้อยแล้ว');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'assign-disciple-peak') {
      const [npcId, peakId] = String(arg || '').split('|');
      const res = (SECT && SECT.PEAKS && SECT.PEAKS.transferDiscipleToPeak) ? SECT.PEAKS.transferDiscipleToPeak(W, npcId, peakId) : { ok: false };
      if (res && res.ok && res.peak) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast('⛰️ โยกย้าย「' + HC.fullName(res.npc) + '」เข้าสังกัด「' + res.peak.nameTh + '」สำเร็จ!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'remove-from-peak') {
      const res = (SECT && SECT.PEAKS && SECT.PEAKS.removeDiscipleFromPeak) ? SECT.PEAKS.removeDiscipleFromPeak(W, arg) : { ok: false };
      if (res && res.ok && res.npc) {
        UI.toast('🍃 ให้「' + HC.fullName(res.npc) + '」แยกตัวเป็นศิษย์อิสระไร้สังกัดยอดเขาแล้ว');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'auto-assign-peak-disciples') {
      const res = (SECT && SECT.PEAKS && SECT.PEAKS.autoAssignUnassignedDisciples) ? SECT.PEAKS.autoAssignUnassignedDisciples(W, { allowDecree: true }) : { ok: false };
      if (res && res.ok && res.assignedCount > 0) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('⛰️ จัดสรรศิษย์เข้าสังกัดยอดเขาตามวิถีสำเร็จ ' + res.assignedCount + ' คน!');
      } else {
        UI.toast('ศิษย์ทุกคนมีสังกัดยอดเขาครบถ้วนแล้ว');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-peak-policy') {
      const [peakId, rule] = String(arg || '').split('|');
      const res = (SECT && SECT.PEAKS && SECT.PEAKS.setPeakPolicy) ? SECT.PEAKS.setPeakPolicy(W, peakId, rule) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast('📜 ตั้งนโยบายจัดสรรทรัพยากรยอดเขา: ' + res.policy.allocationRuleTh);
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'distribute-single-peak') {
      const peakId = String(arg || UI.activePeakId);
      const pk = SECT && SECT.PEAKS ? SECT.PEAKS.ensure(W) : null;
      if (pk && pk.byId[peakId] && (pk.byId[peakId].treasuryStones || 0) < 30) {
        SECT.PEAKS.allocateCentralResourcesToPeaks(W, { quiet: true });
      }
      const res = (SECT && SECT.PEAKS) ? SECT.PEAKS.distributePeakResourcesToMembers(W, peakId, {}) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🎁 แจกจ่ายทรัพยากรประจำยอดเขาแก่ศิษย์ ' + res.recipients.length + ' คน ตามหลัก「' + res.ruleTh + '」!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'peak-joint-exchange') {
      const [pA, pB] = String(arg || '').split('|');
      const res = (SECT && SECT.PEAKS && SECT.PEAKS.holdJointPeakExchange) ? SECT.PEAKS.holdJointPeakExchange(W, pA, pB || null, {}) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast(res.summaryTh);
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'unlock-all-offices') {
      const res = (SECT && SECT.unlockAllOffices) ? SECT.unlockAllOffices(W, {}) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🔓 ปลดล็อกทำเนียบขุนนางครบทั้ง ' + res.unlockedCount + ' ตำแหน่ง (6 ทำเนียบฝ่าย) เรียบร้อยแล้ว!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-post-dir-filter') {
      UI.postDirFilter = String(arg || 'ALL');
      UI.render();
    }
    else if (a === 'auto-appoint-office') {
      const post = SECT.resolveOfficeId ? SECT.resolveOfficeId(String(arg || 'envoy')) : String(arg || 'envoy');
      W.sect.unlockSpecializedOffices = true;
      const master = W.byId[W.sect.masterId];
      const cands = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== W.sect.masterId && n.id !== W.sect.deputyId);
      cands.sort((a, b) => SECT.appointScore(W, post, b, master) - SECT.appointScore(W, post, a, master));
      const pick = cands.find(n => !n.post) || cands[0];
      if (pick) {
        SECT.appoint(W, post, pick, 'เจ้าสำนักคัดเลือกผู้มีความเหมาะสมสูงสุดเข้าดำรงตำแหน่ง');
        if (UI.audio) UI.audio.playBell();
        UI.toast('🎖️ แต่งตั้ง「' + HC.fullName(pick) + '」ดำรงตำแหน่ง' + (SECT.POSTS[post] ? SECT.POSTS[post].nameTh : post) + ' สำเร็จ!');
      } else {
        UI.toast('ยังไม่มีศิษย์ที่พร้อมรับตำแหน่งนี้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'dismiss-office') {
      const post = SECT.resolveOfficeId ? SECT.resolveOfficeId(String(arg || '')) : String(arg || '');
      const holder = SECT.holder(W, post);
      if (holder) {
        SECT.dismiss(W, post, 'เจ้าสำนักสั่งปรับเปลี่ยนทำเนียบตำแหน่ง');
        UI.toast('ปลด「' + HC.fullName(holder) + '」ออกจากตำแหน่งเรียบร้อยแล้ว');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'run-single-office') {
      const post = SECT.resolveOfficeId ? SECT.resolveOfficeId(String(arg || '')) : String(arg || '');
      const res = (SECT && SECT.runOfficerJurisdictionSingle) ? SECT.runOfficerJurisdictionSingle(W, post, null, { ignoreAvailability: true }) : { ok: false };
      if (res && res.ok && res.summaryTh) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast('🏛️ ' + res.summaryTh);
      } else {
        UI.toast('ตำแหน่งนี้ยังว่างอยู่หรือไม่มีผู้ปฏิบัติงาน');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'pay-office-stipends') {
      const res = (SECT && SECT.payOfficeStipends) ? SECT.payOfficeStipends(W, {}) : { ok: false, totalPaid: 0, recipients: [] };
      if (res && res.ok && res.recipients.length) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('💰 จ่ายเบี้ยหวัดเสริมประจำตำแหน่งให้ขุนนาง ' + res.recipients.length + ' คน รวม ' + res.totalPaid + ' ศิลาวิญญาณ (ความพึงพอใจ +8 · ประสิทธิภาพงาน +20%)!');
      } else if (res && res.cooldown) {
        UI.toast('⏳ เบิกเบี้ยหวัดเสริมประจำเดือนนี้ไปแล้ว (เบิกได้อีกครั้งวันที่ ' + res.nextAvailableDay + ')');
      } else {
        UI.toast('ยังไม่มีผู้ดำรงตำแหน่งบริหารที่รอรับเบี้ยหวัดเสริม');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'toggle-peak-array') {
      const peakId = String(arg || UI.activePeakId || 'PEAK_AZURE_SWORD');
      const res = (SECT && SECT.PEAKS && SECT.PEAKS.togglePeakArray) ? SECT.PEAKS.togglePeakArray(W, peakId) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast('☯️ ' + (res.arrayActive ? 'เปิดใช้งาน' : 'ปิดพัก') + 'ค่ายกลปราณประจำ' + res.peak.nameTh + ' (ระดับ ' + (res.arrayLevel || 1) + ') เรียบร้อย!');
      } else {
        UI.toast('ต้องสถาปนายอดเขาก่อนจึงจะเปิดค่ายกลปราณได้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'upgrade-peak-array') {
      const peakId = String(arg || UI.activePeakId || 'PEAK_AZURE_SWORD');
      const res = (SECT && SECT.PEAKS && SECT.PEAKS.upgradePeakArray) ? SECT.PEAKS.upgradePeakArray(W, peakId, {}) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('✨ ยกระดับค่ายกลปราณประจำ' + res.peak.nameTh + ' เป็นระดับ ' + res.arrayLevel + ' สำเร็จ!');
      } else {
        UI.toast('ไม่สามารถยกระดับค่ายกลยอดเขาได้ (' + ((res && res.reason) || 'ศิลาไม่พอหรือระดับสูงสุดแล้ว') + ')');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'open-meridian') {
      const [npcId, merId] = String(arg || '').split('|');
      const tNpc = W.byId[npcId || UI.npcId];
      const res = (tNpc && CULT && CULT.MERIDIANS && CULT.MERIDIANS.openMeridian) ? CULT.MERIDIANS.openMeridian(tNpc, merId || null, { consumeResource: true }) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast('🪡 ทะลวงจุดชีพจรพิสดาร「' + (res.spec ? res.spec.nameTh : res.meridianId) + '」สำเร็จ (' + res.openedCount + '/8 เส้น)!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'trigger-meridian-overdrive') {
      const tNpc = W.byId[arg || UI.npcId];
      const res = (tNpc && CULT && CULT.MERIDIANS && CULT.MERIDIANS.triggerOverdrive) ? CULT.MERIDIANS.triggerOverdrive(W, tNpc, 36) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBladeClash();
        UI.toast('⚡ ระเบิดชีพจรพิสดารเร่งพลังยุทธ์ขีดสุด (ATK/MATK +30%, Cast +28 นาน 36 นาที)!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'bind-dao-oath') {
      const [npcId, oathId] = String(arg || '').split('|');
      const tNpc = W.byId[npcId || UI.npcId];
      const res = (tNpc && CULT && CULT.bindOathVow) ? CULT.bindOathVow(W, tNpc, oathId || 'VOW_CHALLENGE_STRONG') : { ok: false };
      if (res && res.ok && res.oath) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('📜 ตั้งสัตย์สาบานแห่งมรรคา「' + res.oath.nameTh + '」สำเร็จ (อัตราฝึกปราณ +' + Math.round((res.oath.cultSpeedBonus || 0.25) * 100) + '%)!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'grant-dao-seal') {
      const [npcId, sealId] = String(arg || '').split('|');
      const tNpc = W.byId[npcId || UI.npcId];
      const res = (tNpc && CULT && CULT.grantDaoSeal) ? CULT.grantDaoSeal(W, tNpc, sealId || 'SEAL_UNDEFEATED_10') : { ok: false };
      if (res && res.ok && res.seal) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('💮 ประทับตราแห่งเต๋า「' + res.seal.nameTh + '」สำเร็จ (โอกาสทะลวงด่าน +' + Math.round((res.seal.btBonus || 0.08) * 100) + '%)!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'socket-elemental-runes') {
      const [npcId, itemKey] = String(arg || '').split('|');
      const tNpc = W.byId[npcId || UI.npcId] || W.byId[W.sect.masterId];
      let targetGear = null;
      if (tNpc && tNpc.equip) {
        targetGear = Object.values(tNpc.equip).find(g2 => g2 && (g2.uid === itemKey || g2.id === itemKey || itemKey === g2.slot)) || tNpc.equip.WEAPON || tNpc.equip.ARMOR;
      }
      if (!targetGear && tNpc && tNpc.inv && Array.isArray(tNpc.inv.gear)) {
        targetGear = tNpc.inv.gear.find(g2 => g2 && (g2.uid === itemKey || g2.id === itemKey));
      }
      if (!targetGear && W.sect && Array.isArray(W.sect.gear)) {
        targetGear = W.sect.gear.find(g2 => g2 && (g2.uid === itemKey || g2.id === itemKey)) || W.sect.gear[0];
      }
      const rootEl = (tNpc && tNpc.h && tNpc.h.root && tNpc.h.root.primaryElement) || 'FIRE';
      const secEl = rootEl === 'FIRE' ? 'WATER_ICE' : 'FIRE';
      const res = (targetGear && ECO && ECO.socketElementalRunes) ? ECO.socketElementalRunes(W, tNpc, targetGear, [rootEl, secEl]) : { ok: false };
      if (res && res.ok) {
        if (tNpc && g.STATS && g.STATS.dirty) g.STATS.dirty(tNpc);
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast('💎 ฝังรูนธาตุประสาน「' + (res.embeddedReaction ? res.embeddedReaction.nameTh : 'ปฏิกิริยาธาตุ') + '」ลงใน「' + targetGear.nameTh + '」สำเร็จ!');
      } else {
        UI.toast('ไม่พบอุปกรณ์ที่สามารถฝังรูนธาตุได้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'ingest-beast-core') {
      const tNpc = W.byId[arg || UI.npcId] || W.byId[W.sect.masterId];
      const res = (tNpc && CULT && CULT.BEAST_SYMBIOSIS && CULT.BEAST_SYMBIOSIS.ingestBeastCore) ? CULT.BEAST_SYMBIOSIS.ingestBeastCore(W, tNpc, null) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🐉 กลืนแก่นเนยในอสูร「' + (res.latestCore ? res.latestCore.nameTh : '') + '」หลอมรวมสู่ตันเถียนสำเร็จ (' + res.count + '/3 แก่น)!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'activate-beast-possession') {
      const [npcId, petUid] = String(arg || '').split('|');
      const tNpc = W.byId[npcId || UI.npcId] || W.byId[W.sect.masterId];
      const res = (tNpc && CULT && CULT.BEAST_SYMBIOSIS && CULT.BEAST_SYMBIOSIS.activatePossession) ? CULT.BEAST_SYMBIOSIS.activatePossession(W, tNpc, petUid || null, 36) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBladeClash();
        UI.toast('🐾 สถิตร่างอสูรวิญญาณ「' + res.petNameTh + '」สำเร็จ (ผสานสเตตัส +25% นาน 36 นาที)!');
      } else {
        UI.toast('ต้องมีสัตว์อสูรคู่สัญญาที่มีความผูกพัน (Bond) >= 80 จึงจะสถิตร่างอสูรได้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'erect-totem-pillar') {
      const totemId = String(arg || 'TOTEM_WHITE_TIGER');
      const res = (SECT && SECT.TOTEMS_BLOODLINES && SECT.TOTEMS_BLOODLINES.erectTotemPillar) ? SECT.TOTEMS_BLOODLINES.erectTotemPillar(W, totemId) : { ok: false };
      if (res && res.ok && res.totem) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🏛️ สถาปนา「' + res.totem.nameTh + '」คุ้มครองสำนักสำเร็จ (เปิดใช้งาน ' + res.activeTotems.length + '/4 ต้น)!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'enter-closed-door-seclusion') {
      const [npcId, protId] = String(arg || '').split('|');
      const tNpc = W.byId[npcId || UI.npcId];
      const res = (tNpc && CULT && CULT.enterClosedDoorSeclusion) ? CULT.enterClosedDoorSeclusion(W, tNpc, { days: 15, protectorId: protId || null, force: true }) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🧘 สั่งกักตนปิดด่านทะลวงคอขวดสำเร็จ (15 วัน)!');
      } else {
        UI.toast('ไม่สามารถเข้ากักตนปิดด่านได้ (' + ((res && res.reason) || 'ยังไม่ถึงคอขวด') + ')');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'resolve-defector-ultimatum') {
      const dec = String(arg || 'PROTECT_AND_FIGHT');
      const res = (SECT && SECT.resolveDefectorUltimatum) ? SECT.resolveDefectorUltimatum(W, dec) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('📜 ดำเนินการตอบโต้คำขาดศิษย์แปรพักตร์ (' + dec + ') สำเร็จ!');
      } else {
        UI.toast('ไม่สามารถดำเนินการคำขาดได้ (' + ((res && res.reason) || 'ไม่มีคำขาด') + ')');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'peak-launch-expedition') {
      const pid = String(arg || UI.activePeakId || 'PEAK_AZURE_SWORD');
      const res = (SECT && SECT.PEAKS && SECT.PEAKS.launchPeakExpedition) ? SECT.PEAKS.launchPeakExpedition(W, pid) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🧭 ส่งทัพสำรวจประจำยอดเขาสำเร็จ (คลังยอดเขา +' + res.peakShare + ' · คลังสำนัก +' + res.sectShare + ' ศิลา)!');
      } else {
        UI.toast('ยังไม่สามารถส่งทัพสำรวจประจำยอดเขาได้ (' + ((res && res.reason) || 'ติดคูลดาวน์ 15 วัน') + ')');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'tribunal-adjudicate') {
      const [caseId, verdict] = String(arg || '|MERIT_FINE_AND_PENANCE').split('|');
      const res = (SECT && SECT.TRIBUNAL && SECT.TRIBUNAL.adjudicateCase) ? SECT.TRIBUNAL.adjudicateCase(W, caseId, verdict || 'MERIT_FINE_AND_PENANCE') : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('⚖️ ศาลหอวินัยพิพากษาคดีด้วยโทษ ' + res.verdict + ' สำเร็จ!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'assign-leyline-guard') {
      const [ancId, npcId] = String(arg || '').split('|');
      const gNpc = W.byId[npcId] || W.npcs.find(n => n && !n.dead && !n.exiled);
      const res = (SECT && SECT.LEYLINE_GRID && SECT.LEYLINE_GRID.assignAnchorGuard) ? SECT.LEYLINE_GRID.assignAnchorGuard(W, ancId, gNpc) : { ok: false };
      if (res && res.ok) {
        UI.toast('🛡️ ส่งผู้คุ้มกันเสาค่ายกลปฐพีสำเร็จ!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'repair-leyline-anchor') {
      const ancId = String(arg || '');
      const res = (SECT && SECT.LEYLINE_GRID && SECT.LEYLINE_GRID.repairAnchor) ? SECT.LEYLINE_GRID.repairAnchor(W, ancId) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🔧 ซ่อมแซมเสาค่ายกลชีพจรปฐพีกลับมาสมบูรณ์ 100%!');
      } else {
        UI.toast('ไม่สามารถซ่อมแซมเสาค่ายกลได้ (' + ((res && res.reason) || 'ศิลาไม่พอ') + ')');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'awaken-weapon-soul') {
      const [npcId] = String(arg || '').split('|');
      const tNpc = W.byId[npcId || UI.npcId] || W.byId[W.sect.masterId];
      const res = (tNpc && SECT && SECT.SOUL_FORGE && SECT.SOUL_FORGE.awakenWeaponSpirit) ? SECT.SOUL_FORGE.awakenWeaponSpirit(W, tNpc, tNpc, { initialXp: 40 }) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBladeClash();
        UI.toast('🗡️ ปลุกจิตวิญญาณศาสตราสำเร็จ!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'toggle-automation-rule') {
      const ruleKey = String(arg || 'enabled');
      const res = (SECT && SECT.AUTOMATION && SECT.AUTOMATION.toggleRule) ? SECT.AUTOMATION.toggleRule(W, ruleKey) : { ok: false };
      if (res && res.ok) {
        UI.toast('⚙️ สลับการตั้งค่าอัตโนมัติ (' + ruleKey + ': ' + (res.value ? 'เปิด' : 'ปิด') + ')');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'recharge-elemental-barrier') {
      const amt = Number(arg) || 100;
      const res = (SECT && SECT.ELEMENTAL_BARRIER && SECT.ELEMENTAL_BARRIER.rechargeBarrier) ? SECT.ELEMENTAL_BARRIER.rechargeBarrier(W, amt) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🛡️ ป้อนศิลาปราณเสริมม่านพลังพิทักษ์สำนัก +' + res.restoredHp + ' HP สำเร็จ!');
      } else {
        UI.toast('ไม่สามารถเติมม่านพลังสำนักได้ (' + ((res && res.reason) || 'ศิลาไม่พอ') + ')');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'invoke-founder-phantom') {
      const res = (SECT && SECT.ANCESTRAL_PAVILION && SECT.ANCESTRAL_PAVILION.invokeFounderPhantom) ? SECT.ANCESTRAL_PAVILION.invokeFounderPhantom(W, null) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('👻 อัญเชิญเจตจำนงบูรพาจารย์คุ้มครองศิษย์ทั้งสำนักสำเร็จ!');
      } else {
        UI.toast('แต้มธูปสักการะไม่เพียงพอสำหรับอัญเชิญเจตจำนงบูรพาจารย์');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'resolve-faction-schism') {
      const res = (SECT && SECT.resolveFactionSchism) ? SECT.resolveFactionSchism(W, arg || 'NEGOTIATE') : { ok: false };
      if (res && res.ok) UI.toast('🏛️ คลี่คลายวิกฤตกบฏก๊กการเมืองสำเร็จ (' + res.mode + ')');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'dispatch-exchange-disciple') {
      const res = (SECT && SECT.dispatchExchangeDisciple) ? SECT.dispatchExchangeDisciple(W, null, arg) : { ok: false };
      if (res && res.ok) UI.toast('🎓 ส่งศิษย์แลกเปลี่ยนข้ามสำนักสำเร็จ · เรียนรู้「' + res.learnedTechNameTh + '」!');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'claim-bounty-hunt') {
      const res = (SECT && SECT.BOUNTY_BOARD && SECT.BOUNTY_BOARD.claimBountyHunt) ? SECT.BOUNTY_BOARD.claimBountyHunt(W, arg, null) : { ok: false };
      if (res && res.ok) UI.toast('🎯 ปราบอาชญากรค่าหัวสำเร็จ · รับรางวัล +' + res.rewardStones + ' ศิลา!');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'bid-black-market') {
      const res = (SECT && SECT.CARAVAN_AUCTION && SECT.CARAVAN_AUCTION.bidOnAuctionItem) ? SECT.CARAVAN_AUCTION.bidOnAuctionItem(W, arg, null) : { ok: false };
      if (res && res.ok) UI.toast('🌙 ชนะการประมูลลับตลาดมืด「' + (res.lot ? res.lot.nameTh : '') + '」!');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'brew-multiphase-pill') {
      const res = (ECO && ECO.brewMultiPhaseSpecialtyPill) ? ECO.brewMultiPhaseSpecialtyPill(W, null, arg) : { ok: false };
      if (res && res.ok) UI.toast('⚗️ หลอมโอสถสองระยะ「' + (res.pill ? res.pill.nameTh : '') + '」เข้าคลังสำเร็จ!');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'excavate-immortal-tomb') {
      const res = (SECT && SECT.IMMORTAL_TOMB && SECT.IMMORTAL_TOMB.excavateTombLayer) ? SECT.IMMORTAL_TOMB.excavateTombLayer(W, arg, null) : { ok: false };
      if (res && res.ok) UI.toast('🏛️ ขุดค้นสุสานเซียนโบราณชั้นที่ ' + res.layerCleared + '/3 สำเร็จ!');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'advance-world-crisis') {
      const res = (SECT && SECT.WORLD_CRISIS && SECT.WORLD_CRISIS.advanceCrisisChapter) ? SECT.WORLD_CRISIS.advanceCrisisChapter(W, arg || 'ORTHODOX') : { ok: false };
      if (res && res.ok) UI.toast('🌌 ตัดสินใจวิกฤตการณ์ยุทธภพบทที่ ' + res.chapter + '/3 สำเร็จ!');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'establish-outpost') {
      const parts = String(arg || 'MINE_CELESTIAL_STONE|CAMP_REST').split('|');
      const res = (SECT && SECT.OUTPOSTS_LOGISTICS && SECT.OUTPOSTS_LOGISTICS.establishOutpost)
        ? SECT.OUTPOSTS_LOGISTICS.establishOutpost(W, parts[0] || 'MINE_CELESTIAL_STONE', parts[1] || 'CAMP_REST')
        : { ok: false };
      if (res && res.ok) UI.toast('⛺ สถาปนาค่ายพักหน้าด่าน「' + (res.outpost ? res.outpost.nameTh : '') + '」สำเร็จ!');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'dispatch-supply-convoy') {
      const res = (SECT && SECT.OUTPOSTS_LOGISTICS && SECT.OUTPOSTS_LOGISTICS.dispatchSupplyConvoy)
        ? SECT.OUTPOSTS_LOGISTICS.dispatchSupplyConvoy(W, arg || 'MINE_CELESTIAL_STONE', 20, 5)
        : { ok: false };
      if (res && res.ok) UI.toast('🐪 จัดส่งขบวนเสบียงยุทธปัจจัยสู่ค่ายพักสำเร็จ!');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'enact-sect-charter') {
      const res = (SECT && SECT.CHARTER_DOCTRINE && SECT.CHARTER_DOCTRINE.enactSectCharter)
        ? SECT.CHARTER_DOCTRINE.enactSectCharter(W, arg || 'CHARTER_MERITOCRACY')
        : { ok: false };
      if (res && res.ok) UI.toast('📜 สถาปนาธรรมนูญสำนัก「' + (res.charter ? res.charter.nameTh : '') + '」สำเร็จ!');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'convene-strategic-council') {
      const res = (SECT && SECT.STRATEGIC_COUNCIL && SECT.STRATEGIC_COUNCIL.conveneCouncil)
        ? SECT.STRATEGIC_COUNCIL.conveneCouncil(W)
        : { ok: false };
      if (res && res.ok) UI.toast('👑 เรียกประชุมสภาแผนยุทธศาสตร์ 6 ขุนนางใหญ่สำเร็จ!');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'resolve-council-agenda') {
      const res = (SECT && SECT.STRATEGIC_COUNCIL && SECT.STRATEGIC_COUNCIL.resolveCouncilAgenda)
        ? SECT.STRATEGIC_COUNCIL.resolveCouncilAgenda(W, arg || 'FORTIFY_LOGISTICS')
        : { ok: false };
      if (res && res.ok) UI.toast('⚖️ เคาะแผนยุทธศาสตร์สภา 6 ขุนนาง「' + (res.choice ? res.choice.nameTh : '') + '」สำเร็จ!');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'explore-micro-location') {
      const parts = String(arg || 'LOC_NAMELESS_SWORD_TOMB|').split('|');
      const res = (EXPLORE && EXPLORE.dispatchExploration)
        ? EXPLORE.dispatchExploration(W, parts[0] || 'LOC_NAMELESS_SWORD_TOMB', null, { choiceId: parts[1] || undefined })
        : { ok: false };
      if (res && res.ok) UI.toast('🧭 สำรวจ「' + (res.location ? res.location.nameTh : '') + '」สำเร็จ (+' + res.rewardStones + ' ศิลา)!');
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'cleanse-marrow-pool') {
      const tNpc = W.byId[arg || UI.npcId] || W.byId[W.sect.masterId];
      const res = (SECT && SECT.TOTEMS_BLOODLINES && SECT.TOTEMS_BLOODLINES.cleanseMarrowPool) ? SECT.TOTEMS_BLOODLINES.cleanseMarrowPool(W, tNpc) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playGuqinChime();
        UI.toast('♨️ ชำระไขกระดูกในสระบรรพกาลสำเร็จ · ปลุกสายเลือด「' + (res.bloodline ? res.bloodline.nameTh : 'บรรพกาล') + '」!');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'scan-and-found-peaks') {
      const res = (SECT && SECT.PEAKS) ? SECT.PEAKS.scanAndFoundEligiblePeaks(W, {}) : { ok: false };
      if (res && res.ok && res.newlyFounded && res.newlyFounded.length) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🏔️ สถาปนายอดเขาใหม่สำเร็จ: ' + res.newlyFounded.map(p => p.nameTh).join(', '));
      } else {
        UI.toast('ตรวจสอบยอดเขาแล้ว: ยอดเขาจะแสดงเมื่อมีผู้ฝึกตนในวิถีนั้นครบ 4 คนและมีผู้อาวุโสอย่างน้อย 1 คน (หรือกดปุ่มสถาปนาในหน้าหุบเขา)');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'allocate-peak-resources') {
      const res = (SECT && SECT.PEAKS) ? SECT.PEAKS.allocateCentralResourcesToPeaks(W, {}) : { ok: false };
      if (res && res.ok) {
        if (UI.audio) UI.audio.playBell();
        UI.toast('🏔️ ส่วนกลางจัดสรรทรัพยากรให้ ' + res.allocations.length + ' ยอดเขาเรียบร้อย!');
      } else {
        UI.toast('ยังไม่มีการตั้งยอดเขาในสำนัก');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'hold-inter-peak-tournament') {
      const res = (SECT && SECT.PEAKS) ? SECT.PEAKS.holdInterPeakTournament(W, { autoFoundIfNeeded: true }) : { ok: false };
      if (res && res.ok && res.tournament) {
        if (UI.audio) UI.audio.playBladeClash();
        UI.toast(res.tournament.summaryTh);
      } else {
        UI.toast('ต้องมียอดเขาที่ก่อตั้งแล้วอย่างน้อย 2 ยอดเขาจึงจะจัดประลองระหว่างยอดเขาได้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'evaluate-elder-ascensions') {
      const curDay = W.day || 0;
      if (W.sect.lastElderEvalDay != null && (curDay - W.sect.lastElderEvalDay) < 15) {
        UI.toast('⏳ เพิ่งจัดประเมินเลื่อนขั้นผู้อาวุโสไปเมื่อวันที่ ' + W.sect.lastElderEvalDay + ' (คูลดาวน์ 15 วัน)');
      } else {
        W.sect.lastElderEvalDay = curDay;
        if (SECT && SECT.reviewPromotions) SECT.reviewPromotions(W);
        const res = (SECT && SECT.ELDER_STATUS) ? SECT.ELDER_STATUS.evaluateElderAscensions(W, {}) : { ok: false };
        if (res && res.ok && res.ascended && res.ascended.length) {
          if (UI.audio) UI.audio.playBell();
          UI.toast('🎖️ จัดสอบคัดเลือกและเลื่อนขั้นผู้อาวุโสกิตติมศักดิ์สำเร็จ ' + res.ascended.length + ' คน!');
        } else {
          UI.toast('🎖️ จัดสอบคัดเลือกศิษย์สายในและประเมินผู้อาวุโสเรียบร้อยแล้ว');
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'exchange-jade-seal') {
      if (SECT && SECT.HEAVENLY_DAO_DIRECTOR) {
        const exp = SECT.HEAVENLY_DAO_DIRECTOR.exportJadeSealCode(W);
        const imp = SECT.HEAVENLY_DAO_DIRECTOR.importJadeSealCode(W, arg || (exp && exp.code), {});
        if (imp && imp.ok && imp.guestSect) {
          if (UI.audio) UI.audio.playBell();
          UI.toast('🎴 ' + imp.guestSect.summaryTh);
        }
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'launch-coalition-offensive') {
      if (UI.audio) UI.audio.playBladeClash();
      const targetId = arg || ((W.world.allSects && W.world.allSects[0] && W.world.allSects[0].id) || 'S0');
      const res = (EXPED && EXPED.launchCoalitionOffensive) ? EXPED.launchCoalitionOffensive(W, null, targetId, null, {}) : { ok: false };
      UI.toast(res && res.ok && res.chronicle ? ('🚩 ' + res.chronicle.titleTh) : 'ยังไม่มีสำนักพันธมิตรที่พร้อมร่วมทัพ');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'trigger-siege-beacon') {
      if (UI.audio) UI.audio.playBladeClash();
      const res = (EXPED && EXPED.triggerSiegeReinforcementBeacon) ? EXPED.triggerSiegeReinforcementBeacon(W, {}) : { ok: false };
      UI.toast(res && res.ok && res.chronicle ? ('🔥 ' + res.chronicle.titleTh) : (res && res.reason === 'no-active-siege' ? 'สำนักไม่ได้อยู่ระหว่างถูกปิดล้อมในขณะนี้' : 'ยังไม่มีพันธมิตรที่พร้อมส่งทัพหนุน'));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'offer-infernal-tribute') {
      const [planeId] = String(arg || '').split('|');
      const res = (SECT && SECT.INFERNAL_SHRINE && SECT.INFERNAL_SHRINE.offerInfernalTribute)
        ? SECT.INFERNAL_SHRINE.offerInfernalTribute(W, planeId || 'NINE_SERENITIES_HELL', {})
        : { ok: false };
      UI.toast(res && res.ok ? ('🩸 ถวายเครื่องสังเวยโลหิตสู่「' + (res.record ? res.record.planeNameTh : 'พิภพมาร') + '」สำเร็จ!') : 'ไม่สามารถถวายเครื่องสังเวยโลหิตได้');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'sign-blood-covenant') {
      const [npcId, lordId] = String(arg || '').split('|');
      const res = (SECT && SECT.INFERNAL_SHRINE && SECT.INFERNAL_SHRINE.signBloodCovenant)
        ? SECT.INFERNAL_SHRINE.signBloodCovenant(W, npcId || UI.npcId || W.sect.masterId, lordId || 'MARA_PAPIYAN', {})
        : { ok: false };
      UI.toast(res && res.ok ? ('🩸 ทำพันธสัญญาโลหิตสำเร็จ!') : 'ไม่สามารถทำพันธสัญญาโลหิตได้');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'swear-voluntary-vow') {
      const [npcId, vowId] = String(arg || '').split('|');
      const tNpc = W.byId[npcId || UI.npcId] || W.byId[W.sect.masterId];
      const res = (CULT && CULT.VOLUNTARY_VOWS && CULT.VOLUNTARY_VOWS.swearVow)
        ? CULT.VOLUNTARY_VOWS.swearVow(W, tNpc, vowId || 'VOW_NO_MEDICINE')
        : { ok: false };
      UI.toast(res && res.ok ? ('📜 ตั้งสัตย์สาบาน「' + res.vow.nameTh + '」สำเร็จ!') : 'ไม่สามารถตั้งสัตย์สาบานได้');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'toggle-combat-row') {
      const tNpc = W.byId[arg || UI.npcId];
      if (tNpc) {
        tNpc.preferredRow = tNpc.preferredRow === 'BACK_ROW' ? 'FRONT_ROW' : 'BACK_ROW';
        tNpc.combatRow = tNpc.preferredRow;
        UI.toast('จัดแถวยืนสนามรบของ ' + HC.fullName(tNpc) + ' เป็น ' + (tNpc.preferredRow === 'BACK_ROW' ? 'แถวหลัง (BACK_ROW)' : 'แถวหน้า (FRONT_ROW)'));
        UI.render();
      }
    }
    else if (a === 'editnpc') UI.openEditNpc(arg, 'char');
    else if (a === 'spawnnpc') UI.openEditNpc(arg, 'spawn');
    else if (a === 'open-spawn-sect') { UI.spawnDest = 'sect'; UI.open('edit', 'spawn'); }
    else if (a === 'deselect') { G.R.selected = null; G.R.follow = false; UI.updateHud(true); }
    else if (a === 'locate') { UI.close(); UI.focusNpc(arg); }
    else if (a === 'follow') { UI.close(); UI.focusNpc(arg); G.R.follow = true; G.R.cam.z = Math.max(G.R.cam.z, 2.2); $('fFollow').style.background = 'var(--gold)'; }
    else if (a === 'goto-npc') { UI.close(); UI.focusNpc(arg); G.R.follow = true; G.R.cam.z = Math.max(G.R.cam.z, 2.2); if ($('fFollow')) $('fFollow').style.background = 'var(--gold)'; }
    else if (a === 'toggle-track-npc') { UI.toggleTrackNpc(W, arg); UI.render(); UI.updateHud(true); }
    else if (a === 'untrack-npc') {
      if (W && W.sect && Array.isArray(W.sect.trackedNpcIds)) {
        const idx = W.sect.trackedNpcIds.indexOf(arg);
        if (idx >= 0) W.sect.trackedNpcIds.splice(idx, 1);
      }
      const tn = W && W.byId && W.byId[arg];
      UI.toast('เลิกติดตาม ' + (tn ? HC.fullName(tn) : 'ตัวละคร') + ' แล้ว');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'clear-all-tracked') {
      if (W && W.sect) W.sect.trackedNpcIds = [];
      UI.toast('ยกเลิกการติดตามตัวละครทั้งหมดแล้ว');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'open-log-tracked') {
      UI.open('log', 'tracked');
      UI.logFilters = new Set(['tracked']);
      UI.render();
    }
    else if (a === 'open-menu-tracked') { UI.open('menu', 'tracked'); }
    else if (a === 'open-people') { UI.open('people', arg || 'rank'); }
    else if (a === 'locb') { const b = W.map.byId[arg]; if (b) { UI.close(); G.R.follow = false; G.R.focus(b.x + b.w / 2, b.y + b.h / 2, 1.3); } }
    else if (a === 'begin-tribulation') {
      const parts = String(arg || '').split('|');
      const result = SECT.beginCelestialTribulation ? SECT.beginCelestialTribulation(W, parts[0], { useMedicine: parts[1] === 'medicine' }) : { ok: false, reasonTh: 'ระบบด่านเคราะห์ยังไม่พร้อม' };
      UI.toast(result.ok ? ('เริ่มเตรียมค่ายกลคุ้มภัยให้ ' + result.attempt.candidateNameTh + ' แล้ว · พิธีจะเริ่มใน 3 วัน' + (result.attempt.medicineId ? ' · ใช้โอสถฟื้นฟู 1 เม็ด' : '')) : (result.reasonTh || 'ยังเริ่มพิธีไม่ได้'));
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'locv') { const v = g.VC && g.VC.findVisitor ? g.VC.findVisitor(W, arg) : null; if (v && Number.isFinite(v.x) && Number.isFinite(v.y)) { UI.close(); G.R.follow = false; G.R.focus(v.x, v.y, Math.max(G.R.cam.z, 1.8)); } else UI.toast('ผู้มาเยือนนี้ไม่ได้อยู่ในเขตสำนักแล้ว'); }
    else if (a === 'toggle-clue-debug') { UI.showClueDebug = !UI.showClueDebug; UI.render(); }
    else if (a === 'open-visitor') { UI.openVisitor(arg); }
    else if (a === 'open-clue') { UI.openClue(arg); }
    else if (a === 'save') UI.saveSlot(arg);
    else if (a === 'load') UI.loadSlot(arg);
    else if (a === 'export') UI.exportFile();
    else if (a === 'import') $('impFile').click();
    else if (a === 'elect-successor') {
      const res = SECT.electSuccessor(W);
      if (res && res.winner) {
        UI.toast('สภาสำนักมีมติเลือก ' + res.winner.h.name.given + ' เป็นศิษย์สืบทอด!');
      } else {
        UI.toast(res && res.reason ? res.reason : 'ยังไม่สามารถคัดเลือกศิษย์สืบทอดได้ในขณะนี้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'new') { UI.close(); UI.showStart(); }
    else if (a === 'tool') UI.tool(arg);
    else if (a === 'cmp') { UI.cmpId = arg; UI.render(); }
    else if (a === 'logfilter') { UI.toggleLogFilter(arg); }
    else if (a === 'logsubfilter') { UI.logSubFilter = arg || 'all'; UI.render(); }
    else if (a === 'apply-char-edit') { UI.applyCharEditFromDom(); }
    else if (a === 'undo-char-edit') {
      const res = SECT.EDITOR.undoLastEdit(W);
      UI.toast(res.ok ? ('ย้อนคืนค่าสถานะของ ' + res.nameTh + ' แล้ว') : res.reason);
      UI.editDraft = null;
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-pet-spawn') {
      const spEl = $("shBody") && $("shBody").querySelector("#editPetSpeciesSel");
      const tierEl = $("shBody") && $("shBody").querySelector("#editPetTier");
      const sovEl = $("shBody") && $("shBody").querySelector("#editPetSovereign");
      const res = SECT.EDITOR.applyPetAction(W, {
        action: 'spawn_pet',
        npcId: UI.editNpcId,
        speciesId: spEl ? spEl.value : 'B01',
        tier: tierEl ? +tierEl.value : 3,
        growthStage: (sovEl && sovEl.checked) ? 4 : 2,
        bondXp: (sovEl && sovEl.checked) ? 500 : 120,
        sovereignAwakened: !!(sovEl && sovEl.checked)
      });
      UI.toast(res.ok ? ('ผูกพันธสัญญาสัตว์อสูร「' + (res.pet ? res.pet.nameTh : '') + '」สำเร็จ') : ('ไม่สำเร็จ: ' + res.reason));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-pet-awaken') {
      const res = SECT.EDITOR.applyPetAction(W, { action: 'awaken_sovereign', npcId: UI.editNpcId, petUid: arg });
      UI.toast(res.ok ? ('ปลุกสายเลือดราชันย์อสูร「' + res.pet.nameTh + '」สำเร็จ!') : res.reason);
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-pet-feed') {
      const res = SECT.EDITOR.applyPetAction(W, { action: 'feed_pet', npcId: UI.editNpcId, petUid: arg });
      UI.toast(res.ok ? 'ให้อาหารและเพิ่มสายสัมพันธ์สัตว์อสูรแล้ว' : res.reason);
      UI.render();
    }
    else if (a === 'edit-pet-release') {
      const res = SECT.EDITOR.applyPetAction(W, { action: 'release_pet', npcId: UI.editNpcId, petUid: arg });
      UI.toast(res.ok ? ('ปลดปล่อย「' + (res.removed ? res.removed.nameTh : '') + '」แล้ว') : res.reason);
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-gate-beast') {
      const parts = String(arg || '').split('|');
      const res = SECT.EDITOR.applyPetAction(W, { action: parts[0] === 'add' ? 'assign_gate_beast' : 'release_gate_beast', npcId: UI.editNpcId, beastUid: parts.slice(1).join('|') });
      UI.toast(res.ok ? (res.assigned ? 'จัดสัตว์อสูรเข้ากองพิทักษ์ประตูแล้ว' : 'นำสัตว์อสูรออกจากกองพิทักษ์ประตูแล้ว') : res.reason);
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-cast-buff') {
      const bfEl = $("shBody") && $("shBody").querySelector("#editBuffKeySel");
      const durEl = $("shBody") && $("shBody").querySelector("#editBuffDuration");
      const tgtEl = $("shBody") && $("shBody").querySelector("#editBuffTargetSel");
      const res = SECT.EDITOR.applyPetAction(W, {
        action: 'cast_heal_buff',
        npcId: UI.editNpcId,
        targetId: tgtEl ? tgtEl.value : UI.editNpcId,
        buffKey: bfEl ? bfEl.value : 'vitalRegen',
        duration: durEl ? +durEl.value : 180,
        healPct: 0.30
      });
      UI.toast(res.ok ? ('ร่ายวิชาฟื้นฟูและบัฟ「' + (res.buffNameTh || res.buffKey) + '」สำเร็จ (+HP ' + (res.healed || 0) + ')') : res.reason);
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-clear-buffs') {
      const res = SECT.EDITOR.applyPetAction(W, { action: 'clear_buffs', npcId: UI.editNpcId });
      UI.toast(res.ok ? 'ล้างบัฟและสถานะชั่วคราวทั้งหมดแล้ว' : res.reason);
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-save-mech') {
      const rdEl = $("shBody") && $("shBody").querySelector("#editMechReadiness");
      const ocEl = $("shBody") && $("shBody").querySelector("#editMechOverclock");
      const dcEl = $("shBody") && $("shBody").querySelector("#editMechDecoy");
      const res = SECT.EDITOR.applyPetAction(W, {
        action: 'set_mech_state',
        npcId: UI.editNpcId,
        constructReadiness: rdEl ? +rdEl.value : 100,
        overclockReady: !!(ocEl && ocEl.checked),
        decoyAvailable: !!(dcEl && dcEl.checked)
      });
      UI.toast(res.ok ? 'บันทึกสถานะหุ่นเชิดกลไกแล้ว' : res.reason);
      UI.render();
    }
    else if (a === 'edit-save-karma') {
      const dbEl = $("shBody") && $("shBody").querySelector("#editKarmaDebt");
      const stEl = $("shBody") && $("shBody").querySelector("#editKarmaStance");
      const ecEl = $("shBody") && $("shBody").querySelector("#editKarmaEcho");
      const res = SECT.EDITOR.applyPetAction(W, {
        action: 'set_karma_state',
        npcId: UI.editNpcId,
        karmicDebt: dbEl ? +dbEl.value : 0,
        activeRealmStance: stEl ? stEl.value : 'DEVA',
        echoReady: !!(ecEl && ecEl.checked)
      });
      UI.toast(res.ok ? 'บันทึกสถานะหนี้กรรมและวัฏสงสารแล้ว' : res.reason);
      UI.render();
    }
    else if (a === 'edit-pet-breed') {
      const aSel = $("shBody") && $("shBody").querySelector("#breedParentASel");
      const bSel = $("shBody") && $("shBody").querySelector("#breedParentBSel");
      const pData = SECT.EDITOR.petState(W, UI.editNpcId);
      const allPool = (pData.pets || []).concat(pData.menagerie || []);
      const pA = allPool.find(p => p.uid === (aSel ? aSel.value : ''));
      const pB = allPool.find(p => p.uid === (bSel ? bSel.value : ''));
      const res = SECT.EDITOR.applyPetAction(W, {
        action: 'breed_pets',
        npcId: UI.editNpcId,
        parentA: pA,
        parentB: pB,
        breederId: UI.editNpcId
      });
      UI.toast(res.ok ? ('ผสมพันธุ์สำเร็จ! กำเนิด「' + (res.child ? res.child.nameTh : '') + '」') : ('ไม่สำเร็จ: ' + res.reason));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-save-doctrine') {
      const triEl = $("shBody") && $("shBody").querySelector("#editTriagePriority");
      const hpEl = $("shBody") && $("shBody").querySelector("#editMinHpThresh");
      const res = SECT.EDITOR.applyPetAction(W, {
        action: 'set_support_doctrine',
        triagePriority: triEl ? triEl.value : 'BALANCED',
        minHpThreshold: hpEl ? +hpEl.value : 65
      });
      UI.toast(res.ok ? 'บันทึกนโยบายซัพพอร์ตสำนักแล้ว' : res.reason);
      UI.render();
    }
    else if (a === 'edit-upgrade-facility') {
      const res = SECT.EDITOR.applyPetAction(W, {
        action: 'upgrade_specialist_facility',
        facilityId: arg
      });
      UI.toast(res.ok ? ('ยกระดับ' + (res.facility ? res.facility.nameTh : '') + ' สำเร็จ!') : ('ไม่สำเร็จ: ' + res.reason));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'heal-char-edit') {
      const n = W.byId[UI.editNpcId];
      if (n) {
        const res = SECT.EDITOR.applyCharacterEdit(W, n.id, { state: { hpPct: 100, qiPct: 100, energy: 100, stress: 0, heartDemon: 0, clearInjuries: true, clearToxic: true } });
        UI.toast(res.ok ? 'ฟื้นฟูพลังชีวิต ปราณ และรักษาอาการบาดเจ็บแล้ว' : res.reason);
        UI.editDraft = null;
        UI.render();
        UI.updateHud(true);
      }
    }
    else if (a === "spawn-item" || a === "spawn-equip-item" || a === "spawn-teach-item") {
      const [kind, id] = String(arg || "").split("|");
      const qtyEl = $("shBody") && $("shBody").querySelector("#spawnQty");
      const qualEl = $("shBody") && $("shBody").querySelector("#spawnQuality");
      const qty = qtyEl ? +qtyEl.value : (UI.spawnQty || 1);
      const quality = qualEl ? +qualEl.value : (UI.spawnQuality || 1);
      let res;
      if (a === "spawn-equip-item" && SECT.EDITOR.directCatalogAction) {
        res = SECT.EDITOR.directCatalogAction(W, { action: "equip", kind, id, npcId: UI.editNpcId, quality });
        UI.toast(res.ok ? ("เสกและสวมใส่ " + (res.equipped ? res.equipped.nameTh : id) + " สำเร็จ") : ("ไม่สำเร็จ: " + res.reason));
      } else if (a === "spawn-teach-item" && SECT.EDITOR.directCatalogAction) {
        res = SECT.EDITOR.directCatalogAction(W, { action: "teach", kind, id, npcId: UI.editNpcId });
        UI.toast(res.ok ? ("ถ่ายทอดวิชา「" + res.nameTh + "」สำเร็จ") : ("ไม่สำเร็จ: " + res.reason));
      } else {
        res = SECT.EDITOR.spawnItem(W, {
          kind,
          id,
          dest: UI.spawnDest || "sect",
          npcId: UI.editNpcId,
          qty,
          quality
        });
        UI.toast(res.ok ? ("เสก " + res.nameTh + " ×" + res.qty + " สำเร็จ") : ("เสกไม่สำเร็จ: " + res.reason));
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === "spawn-page") {
      UI.spawnPage = Math.max(1, (UI.spawnPage || 1) + (+arg || 0));
      UI.render();
    }
    else if (a === 'edit-dip-attitude') {
      const sectId = UI.editDipSectId;
      const attEl = $("shBody") && $("shBody").querySelector("#editDipAttitude");
      const att = attEl ? +attEl.value : 0;
      const res = SECT.EDITOR.applyDiplomacyAction(W, { action: 'set_attitude', sectId, attitude: att });
      UI.toast(res.ok ? ('ปรับค่าไมตรีเป็น ' + res.attitude + ' แล้ว') : res.reason);
      UI.render();
    }
    else if (a === 'edit-dip-treaty') {
      const sectId = UI.editDipSectId;
      const tEl = $("shBody") && $("shBody").querySelector("#editDipTreatySel");
      const treaty = tEl ? tEl.value : 'TRADE_CARAVAN_ACCORD';
      const res = SECT.EDITOR.applyDiplomacyAction(W, { action: 'sign_treaty', sectId, treaty });
      UI.toast(res.ok ? ('ลงนามสนธิสัญญาสำเร็จ') : res.reason);
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-dip-cleartreaty') {
      const sectId = UI.editDipSectId;
      const res = SECT.EDITOR.applyDiplomacyAction(W, { action: 'clear_treaty', sectId });
      UI.toast(res.ok ? 'ยกเลิกสนธิสัญญาแล้ว' : res.reason);
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-dip-resetcd') {
      const sectId = UI.editDipSectId;
      const res = SECT.EDITOR.applyDiplomacyAction(W, { action: 'reset_cooldowns', sectId });
      UI.toast(res.ok ? 'ล้างคูลดาวน์ทั้งหมดแล้ว' : res.reason);
      UI.render();
    }
    else if (a === 'edit-dip-exchange') {
      const sectId = UI.editDipSectId;
      const res = SECT.EDITOR.applyDiplomacyAction(W, { action: 'ally_exchange', sectId, free: true });
      UI.toast(res.ok ? ('แลกเปลี่ยนพันธมิตรสำเร็จ! ' + res.summaryTh) : ('ไม่สำเร็จ: ' + res.reason));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-dip-envoy') {
      const sectId = UI.editDipSectId;
      const forceWin = arg === 'win' ? true : arg === 'loss' ? false : null;
      const res = SECT.EDITOR.applyDiplomacyAction(W, { action: 'trigger_envoy', sectId, forceWin });
      if (res && res.ok) {
        UI.toast(res.won ? ('🏆 เอาชนะทูตท้าประลองสำเร็จ! (+' + res.cpAwarded + ' CP)') : 'พ่ายต่อทูตท้าประลอง');
      } else {
        UI.toast('ไม่สามารถเรียกทูตได้ในขณะนี้');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-dip-spawnevent') {
      const sectId = UI.editDipSectId;
      const evSel = $("shBody") && $("shBody").querySelector("#editDipSpawnEventKind");
      const eventKind = evSel ? evSel.value : 'SPECIALTY_CARAVAN';
      const res = SECT.EDITOR.applyDiplomacyAction(W, { action: 'spawn_political_event', sectId, eventKind });
      UI.toast(res.ok ? ('จุดประกายเหตุการณ์: ' + res.event.titleTh) : 'ไม่สามารถสร้างเหตุการณ์ได้');
      UI.render();
    }
    else if (a === 'edit-dip-resolveevent') {
      const choice = String(arg || 'ACCEPT');
      const res = SECT.EDITOR.applyDiplomacyAction(W, { action: 'resolve_political_event', choice });
      UI.toast(res.ok ? res.summaryTh : ('คลี่คลายไม่สำเร็จ: ' + res.reason));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-sanctum-setfloor') {
      const sanctumId = UI.editSanctumId;
      const flSel = $("shBody") && $("shBody").querySelector("#editSanctumFloorSel");
      const floor = flSel ? +flSel.value : 0;
      const res = SECT.EDITOR.applySanctumAction(W, { action: 'set_cleared', sanctumId, floor });
      UI.toast(res.ok ? ('กำหนดชั้นสูงสุดที่ผ่านเป็น ' + res.floor + '/3 แล้ว') : res.reason);
      UI.render();
    }
    else if (a === 'edit-sanctum-run') {
      const sanctumId = UI.editSanctumId;
      const forceClear = arg === 'clear';
      const res = SECT.EDITOR.applySanctumAction(W, { action: 'instant_run', sanctumId, forceClear, targetFloor: 3 });
      if (res.ok) {
        const out = res.result;
        const bText = out.bonusReward ? (' · โบนัส: ' + out.bonusReward.nameTh) : '';
        UI.toast('จำลองลงวิหารสำเร็จ! ผ่าน ' + out.floorsCleared + '/3 ชั้น' + bText);
      } else {
        UI.toast('ไม่สำเร็จ: ' + res.reason);
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-sanctum-refine') {
      const gearEl = $("shBody") && $("shBody").querySelector("#editRefineGearSel");
      const catEl = $("shBody") && $("shBody").querySelector("#editRefineCatSel");
      if (!gearEl || !catEl) { UI.toast('กรุณาเลือกอุปกรณ์และผลึกขัดเกลา'); return; }
      const [gearUid, npcId] = gearEl.value.split('|');
      const catalystId = catEl.value;
      const res = SECT.EDITOR.applySanctumAction(W, { action: 'refine_gear', gearUid, catalystId, npcId: npcId || null, free: false });
      if (res.ok) {
        UI.toast('✨ ขัดเกลา ' + res.gear.nameTh + ' สำเร็จ! คุณภาพ: ' + Math.round(res.oldQuality * 100) + '% → ' + Math.round(res.newQuality * 100) + '%');
      } else {
        UI.toast('ขัดเกลาไม่สำเร็จ: ' + res.reason);
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-sanctum-spawncat') {
      const res = SECT.EDITOR.applySanctumAction(W, { action: 'spawn_catalysts', qty: 5 });
      UI.toast(res.ok ? 'เติมผลึกขัดเกลาทุกชนิดเข้าคลังสำนักแล้ว (+5 ก้อน)' : res.reason);
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'equip-personal') {
      const [npcId, uid] = String(arg || '').split('|');
      const res = SECT.EDITOR.equipPersonalGear(W, npcId, uid);
      if (G.R && G.R.invalidate) G.R.invalidate();
      UI.toast(res.ok ? ('สวมใส่ ' + res.equipped.nameTh + ' แล้ว') : res.reason);
      UI.render();
    }
    else if (a === 'repair-gear') {
      const [npcId, uid] = String(arg || '').split('|');
      const n = W.byId[npcId];
      const res = (ECO && ECO.repairGear) ? ECO.repairGear(W, uid, null, n) : { ok: false, reason: 'ไม่พบระบบซ่อมศาสตรา' };
      UI.toast(res.ok ? ('🔧 ซ่อม ' + res.gear.nameTh + ' สำเร็จ (' + res.newDur + '/' + res.newMaxDur + ')') : ('ซ่อมไม่สำเร็จ: ' + res.reason));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'retire-gear') {
      const [npcId, uid] = String(arg || '').split('|');
      const n = W.byId[npcId];
      const res = (ECO && ECO.retireGear) ? ECO.retireGear(W, n, uid) : { ok: false, reason: 'ไม่พบระบบปลดระวาง' };
      UI.toast(res.ok ? ('♻️ ปลดระวาง ' + res.gear.nameTh + ' แยกชิ้นส่วนเข้าคลังแล้ว') : ('ปลดระวางไม่สำเร็จ: ' + res.reason));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'unequip-bag') {
      const [npcId, slot] = String(arg || '').split('|');
      const res = SECT.EDITOR.unequipGear(W, npcId, slot, false);
      UI.toast(res.ok ? ('ถอด ' + res.unequipped.nameTh + ' เก็บในถุงส่วนตัวแล้ว') : res.reason);
      UI.render();
    }
    else if (a === 'unequip-sect') {
      const [npcId, slot] = String(arg || '').split('|');
      const res = SECT.EDITOR.unequipGear(W, npcId, slot, true);
      UI.toast(res.ok ? ('ส่งคืน ' + res.unequipped.nameTh + ' เข้าคลังสำนักแล้ว') : res.reason);
      UI.render();
    }
    else if (a === 'equip-passive') {
      const [npcId, techId, slotIdx] = String(arg || '').split('|');
      const n = W.byId[npcId];
      if (!n || !g.MARTIAL || !g.MARTIAL.equipPassive) return;
      const res = g.MARTIAL.equipPassive(W, n, techId, slotIdx !== undefined && slotIdx !== '' ? +slotIdx : undefined);
      const t = CULT.tech(techId);
      UI.toast(res.ok ? ('บรรจุวิชาติดตัว「' + (t ? t.nameTh : techId) + '」ลงช่องวิชาติดตัวแล้ว') : (res.reason || 'ไม่สามารถบรรจุวิชาติดตัวได้'));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'unequip-passive') {
      const [npcId, techId] = String(arg || '').split('|');
      const n = W.byId[npcId];
      if (!n || !g.MARTIAL || !g.MARTIAL.unequipPassive) return;
      const res = g.MARTIAL.unequipPassive(W, n, techId);
      const t = CULT.tech(techId);
      UI.toast(res.ok ? ('ถอดวิชาติดตัว「' + (t ? t.nameTh : techId) + '」ออกจากช่องวิชาติดตัวแล้ว') : (res.reason || 'ไม่สามารถถอดวิชาติดตัวได้'));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'switch-mantra') {
      const parts = String(arg || '').split('|');
      const npc = W.byId[parts[0]], mId = parts[1];
      if (npc && npc.cult && mId && (npc.cult.unlockedMantras || []).includes(mId)) {
        const chk = (g.MARTIAL && g.MARTIAL.canActivateMantra) ? g.MARTIAL.canActivateMantra(npc, mId) : { ok: true };
        if (!chk.ok) {
          UI.toast('ไม่สามารถโคจรคัมภีร์นี้ได้: ' + (chk.reason || 'ไม่ตรงสายวิถี'));
          return;
        }
        npc.cult.mantra = mId;
        HC.bump(npc);
        if (g.MARTIAL && g.MARTIAL.reconcilePassives) g.MARTIAL.reconcilePassives(npc);
        UI.render();
        UI.toast('เปลี่ยนคัมภีร์ลมปราณหลักเป็น「' + (CULT.tech(mId) ? CULT.tech(mId).nameTh : mId) + '」');
      }
    }
    else if (a === 'donate-personal') {
      const [npcId, kind, itemId] = String(arg || '').split('|');
      const n = W.byId[npcId];
      if (!n) return;
      let res = { ok: false, reason: 'ไม่รองรับ' };
      if (kind === 'EQUIPMENT') res = SECT.EDITOR.donatePersonalGear(W, npcId, itemId);
      else if (kind === 'MATERIAL') res = SECT.donateMat(W, n, itemId, 1);
      else if (kind === 'PILL') res = ECO.donatePersonalProduct(W, n, { kind: 'PILL', pillKey: itemId, qty: 1 });
      else if (kind === 'CRYSTAL') res = g.MARTIAL.donateCrystal(W, n, String(itemId).startsWith('S:') || String(itemId).startsWith('T:') ? itemId : ('S:' + itemId));
      else if (kind === 'TECH_MANUAL' || kind === 'SUB_MANUAL') res = g.MARTIAL.donateManual(W, n, itemId, kind === 'SUB_MANUAL' ? 'sub' : 'tech');
      else if (kind === 'RECIPE_SCROLL') res = g.CONTENT.donateRecipe(W, n, itemId);
      else if (kind === 'ORGAN') res = g.CONTENT.donateOrgan(W, n, itemId, 1);
      UI.toast(res && res.ok ? 'บริจาคเข้าคลังสำนักเรียบร้อย' : (res && res.reason ? res.reason : 'ไม่สามารถบริจาคได้'));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'use-personal') {
      const [npcId, kind, itemId] = String(arg || '').split('|');
      const res = SECT.EDITOR.usePersonalItem(W, npcId, kind, itemId);
      UI.toast(res && res.ok ? 'ใช้งานไอเทมสำเร็จ' : (res && res.reason ? res.reason : 'ไม่สามารถใช้งานได้'));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-inv-mode') {
      UI.setInvViewMode(arg);
      UI.render();
    }
    else if (a === 'bag-cat') {
      UI.bagCat = arg || 'ALL';
      UI.bagPage = 1;
      UI.render();
    }
    else if (a === 'bag-page') {
      UI.bagPage = Math.max(1, (UI.bagPage || 1) + (+arg || 0));
      UI.render();
    }
    else if (a === 'bag-sel') {
      UI.bagSelKey = arg;
      UI.render();
    }
    else if (a === 'bag-close-detail') {
      UI.bagSelKey = null;
      UI.bagMoreOpen = false;
      UI.render();
    }
    else if (a === 'bag-toggle-more') {
      UI.bagMoreOpen = !UI.bagMoreOpen;
      UI.render();
    }
    else if (a === 'stock-cat') {
      UI.stockCat = arg || 'ALL';
      UI.stockPage = 1;
      UI.render();
    }
    else if (a === 'stock-page') {
      UI.stockPage = Math.max(1, (UI.stockPage || 1) + (+arg || 0));
      UI.render();
    }
    else if (a === 'library-detail') { UI.libraryDetail = arg || null; UI.render(); }
    else if (a === 'stock-sel') {
      UI.stockSelKey = arg;
      UI.stockMoreOpen = false;
      UI.render();
    }
    else if (a === 'stock-close-detail') {
      UI.stockSelKey = null;
      UI.stockMoreOpen = false;
      UI.render();
    }
    else if (a === 'stock-toggle-more') {
      UI.stockMoreOpen = !UI.stockMoreOpen;
      UI.render();
    }
    else if (a === 'stock-distribute-now') {
      const res = SECT.distributeSectStock ? SECT.distributeSectStock(W, { maxGifts: 4 }) : { gifted: 0 };
      UI.toast(res && res.gifted > 0 ? ('หอคลังจัดสรรไอเทมให้ศิษย์แล้ว ' + res.gifted + ' รายการ') : 'ยังไม่มีรายการส่วนเกินที่ตรงกับความต้องการของศิษย์ในขณะนี้');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'shop-cat') {
      UI.shopCat = arg || 'ALL';
      UI.shopPage = 1;
      UI.render();
    }
    else if (a === 'shop-page') {
      UI.shopPage = Math.max(1, (UI.shopPage || 1) + (+arg || 0));
      UI.render();
    }
    else if (a === 'shop-sel') {
      UI.shopSelKey = arg;
      UI.render();
    }
    else if (a === 'shop-close-detail') {
      UI.shopSelKey = null;
      UI.shopMoreOpen = false;
      UI.render();
    }
    else if (a === 'shop-toggle-more') {
      UI.shopMoreOpen = !UI.shopMoreOpen;
      UI.render();
    }
    else if (a === 'shop-buy') {
      const [selKey, quotedStr] = String(arg || '').split('|');
      const quotedPrice = +quotedStr;
      const buyer = W.byId[UI.shopBuyerId] || W.byId[W.sect.masterId];
      if (!buyer || buyer.dead) { UI.toast('ไม่พบผู้ซื้อ'); return; }
      const item = buildSectShopItems(W).find(x => x.selKey === selKey);
      if (!item) { UI.toast('สินค้านี้หมดหรือไม่มีอยู่ในร้านแล้ว'); UI.render(); return; }
      if (item.shopKind === 'pill') {
        const ok = g.CPE.buy(W, buyer, { kind: 'pill', key: item.key, price: quotedPrice });
        UI.toast(ok ? (buyer.h.name.given + ' แลกซื้อ「' + item.nameTh + '」สำเร็จ (' + quotedPrice + ' คป.)') : 'ไม่สามารถแลกซื้อได้ (แต้ม คลัง หรือราคาเปลี่ยนไป)');
      } else if (item.shopKind === 'gear') {
        const ok = g.CPE.buy(W, buyer, { kind: 'gear', gear: item.gear, price: quotedPrice });
        if (ok && G.R && G.R.invalidate) G.R.invalidate();
        UI.toast(ok ? (buyer.h.name.given + ' แลกซื้อและสวมใส่「' + item.nameTh + '」สำเร็จ') : 'ไม่สามารถแลกซื้ออุปกรณ์นี้ได้ (ตรวจสอบแต้มหรือขั้นตบะ)');
      } else if (item.shopKind === 'crystal') {
        const ok = g.CPE.buy(W, buyer, { kind: 'crystal', key: item.key, price: quotedPrice });
        UI.toast(ok ? (buyer.h.name.given + ' แลกซื้อ「' + item.nameTh + '」เข้าถุงส่วนตัวสำเร็จ') : 'ไม่สามารถแลกซื้อผลึกนี้ได้ (ตรวจสอบวิถี ขั้นตบะ หรือแต้ม)');
      } else if (item.shopKind === 'tech_study') {
        const res = (g.MARTIAL && g.MARTIAL.startStudy) ? g.MARTIAL.startStudy(W, buyer, item.id) : { ok: false, reason: 'ไม่พบบริการศึกษา' };
        UI.toast(res && res.ok ? (buyer.h.name.given + ' เริ่มศึกษา「' + item.nameTh + '」แล้ว') : (res && res.reason ? res.reason : 'ไม่สามารถเริ่มศึกษาวิชานี้ได้'));
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'study-tech-lib') {
      const [npcId, techId] = String(arg || '').split('|');
      const n = W.byId[npcId];
      if (!n || !techId) return;
      const res = (g.MARTIAL && g.MARTIAL.startStudy) ? g.MARTIAL.startStudy(W, n, techId) : { ok: false, reason: 'ไม่พบบริการศึกษา' };
      const t = CULT.tech(techId);
      UI.toast(res && res.ok ? (n.h.name.given + ' เริ่มศึกษา「' + (t ? t.nameTh : techId) + '」จากหอคัมภีร์แล้ว') : (res && res.reason ? res.reason : 'ไม่สามารถเริ่มศึกษาได้'));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'study-sub-lib') {
      const [npcId, subId] = String(arg || '').split('|');
      const n = W.byId[npcId];
      if (!n || !subId) return;
      const res = (g.MARTIAL && g.MARTIAL.studySubpath) ? g.MARTIAL.studySubpath(W, n, subId) : { ok: false, reason: 'ไม่พบบริการศึกษา' };
      const subObj = CULT.subList.find(x => x.sub.id === subId);
      UI.toast(res && res.ok ? (n.h.name.given + ' ศึกษาสายย่อย「' + (subObj ? subObj.sub.nameTh : subId) + '」สำเร็จแล้ว!') : (res && res.reason ? res.reason : 'ไม่สามารถศึกษาสายย่อยนี้ได้'));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-lib-cat') {
      UI.libCat = arg;
      UI.render();
    }
    else if (a === 'open-bag-container') {
      const n = W.byId[arg];
      if (!n || !g.FISHING) return;
      const res = g.FISHING.openContainer(W, n);
      if (res && res.ok) {
        if (res.branch === 'TRASH') UI.toast(n.h.name.given + ' เปิดหีบไม้โบราณแช่น้ำ: พบเพียงเศษซากใต้น้ำไร้ค่า');
        else if (res.branch === 'LEGENDARY' && !res.fallbackUsed) UI.toast('🌟 ปาฏิหาริย์! ' + n.h.name.given + ' เปิดหีบได้สมบัติระดับตำนาน「' + res.drop.nameTh + '」!');
        else UI.toast(n.h.name.given + ' เปิดหีบได้รับ「' + res.drop.nameTh + '」(T' + res.drop.tier + ')');
      } else {
        UI.toast('ไม่มีหีบไม้โบราณแช่น้ำในถุงส่วนตัว');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'open-sect-container') {
      if (!g.FISHING) return;
      const master = W.byId[W.sect.masterId] || W.npcs.find(x => !x.dead);
      const res = g.FISHING.openContainer(W, master, { fromSectStock: true });
      if (res && res.ok) {
        if (res.branch === 'TRASH') UI.toast('เปิดหีบในคลังสำนัก: พบเพียงเศษซากใต้น้ำไร้ค่า');
        else if (res.branch === 'LEGENDARY' && !res.fallbackUsed) UI.toast('🌟 เปิดหีบคลังสำนักได้สมบัติระดับตำนาน「' + res.drop.nameTh + '」!');
        else UI.toast('เปิดหีบในคลังสำนัก ได้รับ「' + res.drop.nameTh + '」(T' + res.drop.tier + ')');
      } else {
        UI.toast('ไม่มีหีบไม้โบราณแช่น้ำในคลังสำนัก');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'discard-bag-trash') {
      const n = W.byId[arg];
      if (!n || !g.FISHING) return;
      const res = g.FISHING.discardTrash(W, n, false);
      UI.toast(res.ok ? ('ทิ้งเศษซากใต้น้ำไร้ค่า ×' + res.removed + ' แล้ว') : 'ไม่มีขยะใต้น้ำในถุง');
      UI.render();
    }
    else if (a === 'discard-sect-trash') {
      if (!g.FISHING) return;
      const res = g.FISHING.discardTrash(W, null, true);
      UI.toast(res.ok ? ('ทิ้งเศษซากใต้น้ำจากคลังสำนัก ×' + res.removed + ' แล้ว') : 'ไม่มีขยะใต้น้ำในคลัง');
      UI.render();
    }
    else if (a === 'eat-bag-dish') {
      const [npcId, dishId] = String(arg || '').split('|');
      const n = W.byId[npcId];
      if (!n || !g.FISHING) return;
      const res = g.FISHING.eatFishDish(W, n, dishId, false);
      UI.toast(res.ok ? (n.h.name.given + ' กิน「' + res.dish.nameTh + '」ได้รับบัฟ ' + (res.buff ? res.buff.nameTh : '')) : (res.reasonTh || 'ไม่สามารถกินอาหารนี้ได้'));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'cook-bag-fish') {
      const [npcId, fishId] = String(arg || '').split('|');
      const n = W.byId[npcId];
      if (!n || !g.FISHING) return;
      const sp = g.FISHING.SPECIES_BY_ID[fishId];
      const dishId = (sp && sp.recipes && sp.recipes.find(r => r.startsWith('FOOD_'))) || 'FOOD_STEAMED_SPIRIT_FISH';
      const res = g.FISHING.cookDish(W, dishId, n, true);
      UI.toast(res.ok ? (n.h.name.given + ' ปรุง「' + res.dish.nameTh + '」สำเร็จ!') : 'วัตถุดิบปลาในถุงไม่พอสำหรับปรุงอาหาร');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'cook-sect-fish') {
      const fishId = String(arg || '');
      if (!g.FISHING) return;
      const sp = g.FISHING.SPECIES_BY_ID[fishId];
      const dishId = (sp && sp.recipes && sp.recipes.find(r => r.startsWith('FOOD_'))) || 'FOOD_STEAMED_SPIRIT_FISH';
      const res = g.FISHING.cookDish(W, dishId, null, false);
      UI.toast(res.ok ? ('โรงครัวปรุง「' + res.dish.nameTh + '」×2 และเสบียงอาหารเข้าคลังแล้ว') : 'วัตถุดิบปลาในคลังไม่พอ');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'fish-at-zone') {
      const zid = String(arg || 'river_central');
      const zdef = g.FISHING && g.FISHING.ZONES[zid];
      const target = (G.R && G.R.selected && W.byId[G.R.selected] && !W.byId[G.R.selected].dead) ? W.byId[G.R.selected] : W.byId[W.sect.masterId];
      if (!target || !zdef) { UI.toast('ไม่พบตัวละครที่จะส่งไปตกปลา'); return; }
      const st = AI.freeStation(W, target, 'fish', zdef.bkey);
      if (!st) { UI.toast('จุดตกปลาที่' + zdef.nameTh + ' เต็มทุกจุดในขณะนี้'); return; }
      const ok = AI.begin(W, target, 'riverFish', { st, zoneId: zid, bkey: zdef.bkey, mode: 'fish' });
      if (ok) {
        UI.close();
        UI.focusNpc(target.id);
        UI.toast('ส่ง ' + target.h.name.given + ' ไปตกปลาที่' + zdef.nameTh + ' แล้ว');
      } else {
        UI.toast('ไม่สามารถเดินทางไปยังจุดตกปลานี้ได้');
      }
    }
    else if (a === 'refresh-rumors') {
      if (SECT.JIANGHU && SECT.JIANGHU.refreshTavernRumors) {
        const list = SECT.JIANGHU.refreshTavernRumors(W, { count: 3 });
        UI.toast('🍶 โรงเตี๊ยมยุทธภพอัปเดตข่าวลือใหม่ ' + list.length + ' เรื่องแล้ว');
        UI.render();
      }
    }
    else if (a === 'investigate-tavern-rumor') {
      const [rumorId, npcId] = String(arg || '').split('|');
      const actorId = npcId || (G.R && G.R.selected) || W.sect.masterId;
      const res = (SECT.JIANGHU && SECT.JIANGHU.investigateRumor) ? SECT.JIANGHU.investigateRumor(W, actorId, rumorId) : { ok: false, reason: 'ไม่พบระบบโรงเตี๊ยมยุทธภพ' };
      UI.toast(res.ok ? ('🍶 ' + res.summaryTh) : ('ไม่สำเร็จ: ' + (res.reason || 'ไม่สามารถออกสืบข่าวได้')));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'ally-aid') {
      const res = (SECT.JIANGHU && SECT.JIANGHU.triggerAllyAid) ? SECT.JIANGHU.triggerAllyAid(W, arg) : { ok: false, reason: 'ไม่พบพันธมิตร' };
      UI.toast(res.ok ? res.summaryTh : ('ไม่สำเร็จ: ' + (res.reason || 'พันธมิตรไม่พร้อม')));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'challenge-nemesis') {
      const [bondId, mode] = String(arg || '').split('|');
      const forceWin = mode === 'win' ? true : (mode === 'loss' ? false : undefined);
      const res = (SECT.JIANGHU && SECT.JIANGHU.triggerNemesisChallenge) ? SECT.JIANGHU.triggerNemesisChallenge(W, bondId, { forceWin }) : { ok: false, reason: 'ไม่พบคู่อาฆาต' };
      UI.toast(res.ok ? res.summaryTh : ('ไม่สำเร็จ: ' + (res.reason || 'ไม่สามารถท้าดวลได้')));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'synthesize-sect-art') {
      const creatorId = arg || (G.R && G.R.selected) || W.sect.masterId;
      const res = (SECT.MENTORSHIP && SECT.MENTORSHIP.synthesizeSectArt) ? SECT.MENTORSHIP.synthesizeSectArt(W, { creatorId }) : { ok: false, reason: 'ไม่พบระบบบัญญัติวิชาสำนัก' };
      UI.toast(res.ok ? ('📜 บัญญัติวิชาประจำสำนัก「' + res.art.nameTh + '」เข้าหอคัมภีร์สำเร็จ!') : ('ยังไม่พร้อม: ' + (res.reason || 'ต้องมีศิษย์ตบะขั้น 4 ขึ้นไป')));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'form-mentor-bond') {
      const [mentorId, discipleId] = String(arg || '').split('|');
      const res = (SECT.MENTORSHIP && SECT.MENTORSHIP.formBond) ? SECT.MENTORSHIP.formBond(W, mentorId, discipleId) : { ok: false, reason: 'ไม่พบระบบฝากตัวศิษย์-อาจารย์' };
      UI.toast(res.ok ? ('🎓 รับศิษย์สายตรงสำเร็จ! (' + res.bond.mentorNameTh + ' → ' + res.bond.discipleNameTh + ')') : ('ไม่สำเร็จ: ' + (res.reason || 'เงื่อนไขไม่ครบ')));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'coach-disciple') {
      const [mentorId, discipleId] = String(arg || '').split('|');
      const res = (SECT.MENTORSHIP && SECT.MENTORSHIP.coachDisciple) ? SECT.MENTORSHIP.coachDisciple(W, mentorId, discipleId) : { ok: false, reason: 'ไม่พบระบบชี้แนะวิชา' };
      UI.toast(res.ok ? ('🎓 ชี้แนะสำเร็จ! (+ตบะ ' + res.cultGain + ')') : ('ไม่สำเร็จ: ' + (res.reason || 'ไม่สามารถชี้แนะได้')));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'transmit-qi') {
      const [mentorId, discipleId] = String(arg || '').split('|');
      const res = (SECT.MENTORSHIP && SECT.MENTORSHIP.transmitQi) ? SECT.MENTORSHIP.transmitQi(W, mentorId, discipleId, { free: false }) : { ok: false, reason: 'ไม่พบระบบถ่ายทอดปราณ' };
      UI.toast(res.ok ? ('✨ ถ่ายทอดปราณสำเร็จ! (+ตบะ ' + res.transmission.surgePts + (res.transmission.inheritedTechId ? ' · สืบทอด「' + ((CULT.tech(res.transmission.inheritedTechId) || {}).nameTh || res.transmission.inheritedTechId) + '」' : '') + ')') : ('ไม่สำเร็จ: ' + (res.reason || 'เงื่อนไขยังไม่ครบ')));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-clue-approach') {
      const [instId, appId] = String(arg || '').split('|');
      const cs = g.VC && g.VC.ensure ? g.VC.ensure(W) : null;
      const inst = cs && cs.active && cs.active[instId];
      if (inst) {
        inst.preferredApproach = appId || 'auto';
        UI.toast('ตั้งแนวทางสืบค้นเบาะแสเป็น: ' + (appId || 'อัตโนมัติ'));
        UI.render();
      }
    }
    else if (a === 'open-world-map') { UI.open('world', 'map'); }
    else if (a === 'atlas-select') {
      UI.atlasSelectedId = String(arg || ''); UI.atlasGroupIds = null; UI.render();
    }
    else if (a === 'atlas-group') {
      UI.atlasSelectedId = null; UI.atlasGroupIds = String(arg || '').split('|').filter(Boolean); UI.render();
    }
    else if (a === 'atlas-close') { UI.atlasSelectedId = null; UI.atlasGroupIds = null; UI.render(); }
    else if (a === 'atlas-filter') {
      const v = UI.atlasView || (UI.atlasView = {zoom:1,x:0.5,y:0.5,filter:'ALL'});
      v.filter = String(arg || 'ALL'); UI.atlasSelectedId = null; UI.atlasGroupIds = null; UI.render();
    }
    else if (a === 'atlas-layer') {
      const v = UI.atlasView || (UI.atlasView = {zoom:1,x:0.5,y:0.5,filter:'ALL'});
      v.layers = Object.assign({routes:true, fog:true, aura:true, parties:true, season:true}, v.layers || {});
      v.layers[String(arg)] = !v.layers[String(arg)]; UI.render();
    }
    else if (a === 'atlas-zoom') {
      const v = UI.atlasView || (UI.atlasView = {zoom:1,x:0.5,y:0.5,filter:'ALL'});
      v.zoom = clamp(v.zoom * (arg === 'in' ? 1.4 : 1/1.4), 1, 4); UI.render();
    }
    else if (a === 'atlas-home') {
      const v = UI.atlasView || (UI.atlasView = {zoom:1,x:0.5,y:0.5,filter:'ALL'});
      v.x = 0.5; v.y = 0.5; UI.render();
    }
    else if (a === 'atlas-open-discovery') { UI.open('world', 'disc'); }
    else if (a === 'atlas-open-realms') { UI.worldSectsSubTab = 'REALMS'; UI.open('world', 'sects'); }
    else if (a === 'atlas-open-legends') { UI.worldSectsSubTab = 'FACTIONS'; UI.open('world', 'sects'); }
    else if (a === 'atlas-depart') {
      const node = UI.buildWorldAtlas(W).nodes.find(n => n.id === arg);
      const party = node ? UI.atlasParty(W, node) : [];
      const exploration = g.EXPLORE;
      let result = null;
      if (node && party.length) {
        if (node.kind === 'NEIGHBOR_SECT') {
          const choice = $('shBody').querySelector('#atlasSiegeChoice');
          result = EXPED.marshalStrikeForce(W, party, node.sectId, {immediate:false, postResolution:choice ? choice.value : 'SUBJUGATE'});
        } else if (node.kind === 'RESOURCE_NODE') result = EXPED.departResourceClaim(W, node.id, party);
        else if (node.kind === 'WORLD_ANOMALY') result = EXPED.departWorldAnomaly(W, party, node.anomalyId || node.id, {immediate:false});
        else if (node.kind === 'FORTUNE_SITE' || node.kind === 'EXPEDITION_REGION') {
          const region = EXPED.REGIONS.find(r => r.id === (node.regionId || node.id));
          const ex = region && EXPED.depart(W, party, node.kind === 'FORTUNE_SITE' ? 'fortune' : 'gather', region, node.siteId ? {siteId:node.siteId} : {});
          result = ex && {ok:true, expedition:ex};
        } else if (node.kind === 'SANCTUM') {
          const ex = exploration && exploration.departSanctum(W, party, node.id); result = ex && {ok:true, expedition:ex};
        } else if (node.kind === 'PAGODA') {
          const ex = exploration && exploration.departNineDaoPagoda(W, party); result = ex && {ok:true, expedition:ex};
        } else if (node.kind === 'ELEMENTAL_REALM') {
          const ex = exploration && exploration.departElementalRealm(W, party, {realmId:node.id}); result = ex && {ok:true, expedition:ex};
        }
      }
      if (result && result.ok) UI.toast('🧭 ส่งคณะสู่「' + node.nameTh + '」แล้ว · ใช้เวลาประมาณ ' + result.expedition.days + ' วัน');
      else {
        const reasons = {'already-en-route':'มีคณะเดินทางไปยังจุดนี้แล้ว', 'already-owned':'จุดนี้เป็นของสำนักเราแล้ว', 'already-vassal':'สำนักนี้เป็นบริวารอยู่แล้ว', 'anomaly-unavailable':'วาสนานี้สิ้นสุดแล้ว', 'unavailable-member':'สมาชิกในคณะไม่พร้อม', 'no-party':'ไม่มีคณะที่พร้อมเดินทาง', 'no-available-disciples':'ไม่มีศิษย์ที่พร้อมเดินทาง'};
        UI.toast('ยังออกเดินทางไม่ได้: ' + (reasons[result && result.reason] || 'คณะไม่พร้อมหรือสถานที่ยังไม่เปิด'));
      }
      UI.render(); UI.updateHud(true);
    }
    else if (a === 'select-world-node') {
      if (EXPED && EXPED.selectWorldNode) EXPED.selectWorldNode(W, arg);
      UI.render();
    }
    else if (a === 'launch-sect-siege') {
      const [sectId, postRes] = String(arg || '').split('|');
      const resSel = $("shBody") && $("shBody").querySelector("#siegeResolutionSel");
      const postResolution = postRes || (resSel ? resSel.value : 'SUBJUGATE');
      const res = (EXPED && EXPED.marshalStrikeForce) ? EXPED.marshalStrikeForce(W, null, sectId, { immediate: false, postResolution }) : { ok: false, reason: 'ไม่พบระบบตีค่ายสำนัก' };
      if (res && res.ok) {
        UI.toast(res.queued ? ('⚔️ ส่งกองทัพมุ่งหน้าตีค่าย (เดินทาง ' + (res.travel ? res.travel.days : 1.5) + ' วัน)') : (res.won ? ('⚔️ พิชิตศึกตีค่าย「' + res.sectNameTh + '」ทั้ง 3 ด่านสำเร็จ!') : ('✘ การบุกตีค่าย「' + res.sectNameTh + '」ถูกต้านทานไว้ได้')));
      } else {
        UI.toast('ไม่สามารถกรีฑาทัพได้: ' + (res && res.reason ? res.reason : 'ไม่พร้อม'));
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-vassal-policy') {
      const [sectId, policy] = String(arg || '').split('|');
      const res = (EXPED && EXPED.setVassalTributePolicy) ? EXPED.setVassalTributePolicy(W, sectId, policy) : { ok: false };
      UI.toast(res.ok ? ('ตั้งนโยบายบรรณาการเป็น ' + res.tributePolicy + ' (ความภักดี ' + Math.round(res.loyalty) + '%)') : 'ไม่สามารถเปลี่ยนนโยบายได้');
      UI.render();
    }
    else if (a === 'collect-vassal-tribute') {
      const res = (EXPED && EXPED.collectVassalTributes) ? EXPED.collectVassalTributes(W, { force: false }) : { ok: false, count: 0 };
      UI.toast(res.ok && res.count > 0 ? ('👑 เก็บเกี่ยวบรรณาการจากสำนักบริวาร ' + res.count + ' แห่งเรียบร้อย!') : 'ยังไม่มีสำนักบริวารที่ครบกำหนดส่งบรรณาการ');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'respond-vassal-distress') {
      const [callOrSectId, choice] = String(arg || '').split('|');
      const res = (EXPED && EXPED.respondVassalDistress) ? EXPED.respondVassalDistress(W, callOrSectId, choice || 'REINFORCE') : { ok: false };
      UI.toast(res.ok ? res.summaryTh : 'ไม่พบสัญญาณขอความช่วยเหลือ');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'claim-resource-node') {
      const nodeId = String(arg || 'MINE_CELESTIAL_STONE');
      const res = (EXPED && EXPED.departResourceClaim) ? EXPED.departResourceClaim(W, nodeId, null) : { ok: false };
      UI.toast(res.ok ? ('🚩 ส่งกองกำลังเดินทางไปยึดครองจุดยุทธศาสตร์ (' + (res.travel ? res.travel.days : 1.5) + ' วัน)') : 'ไม่สามารถส่งกองกำลังไปยึดครองได้');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'assign-node-garrison') {
      const nodeId = String(arg || 'MINE_CELESTIAL_STONE');
      const topDisciples = (W.npcs || []).filter(n => n && !n.dead && !n.away).sort((x, y) => CULT.power(y) - CULT.power(x)).slice(0, 2);
      const menagerie = (CULT && CULT.ensureMenagerie) ? CULT.ensureMenagerie(W) : ((W.sect && W.sect.beasts) || []);
      const guardBeast = menagerie.find(b => b && !b.dead && (b.fourSymbol === 'BLACK_TORTOISE' || b.role === 'IRON_GUARDIAN')) || menagerie[0];
      const res = (EXPED && EXPED.assignNodeGarrison) ? EXPED.assignNodeGarrison(W, nodeId, { discipleIds: topDisciples.map(d => d.id), beastUid: guardBeast ? (guardBeast.uid || guardBeast.id) : null }) : { ok: false };
      UI.toast(res.ok ? ('🛡️ จัดกำลังประจำการ ณ จุดยุทธศาสตร์สำเร็จ (พลังป้องกัน ' + res.garrison.defensePower + ')') : 'จัดกำลังไม่สำเร็จ');
      UI.render();
    }
    else if (a === 'harvest-resource-nodes') {
      const isSeasonalDay = (W.day || 0) > 0 && (W.day % 90 === 0);
      const res = (EXPED && EXPED.harvestResourceNodes) ? EXPED.harvestResourceNodes(W, { seasonal: isSeasonalDay, includeMats: true }) : { ok: false, totalStones: 0 };
      UI.toast(res.ok && res.totalStones > 0 ? ('💎 เก็บเกี่ยวผลผลิตจุดยุทธศาสตร์ได้ +' + res.totalStones + ' ศิลาวิญญาณ!') : 'ยังไม่มีจุดยุทธศาสตร์ที่ยึดครอง');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'spawn-world-anomaly') {
      const anom = (EXPED && EXPED.spawnWorldAnomaly) ? EXPED.spawnWorldAnomaly(W, { templateId: arg || null }) : null;
      UI.toast(anom ? ('☄️ วาสนาฟ้าดินปรากฏ:「' + anom.nameTh + '」!') : 'ไม่สามารถสร้างวาสนาฟ้าดินได้');
      UI.render();
    }
    else if (a === 'dispatch-world-anomaly') {
      const res = (EXPED && EXPED.departWorldAnomaly) ? EXPED.departWorldAnomaly(W, null, arg, { immediate: false }) : { ok: false };
      UI.toast(res.ok ? ('🌟 ส่งคณะศิษย์เดินทางไปช่วงชิงวาสนาฟ้าดิน (' + (res.travel ? res.travel.days : 1.5) + ' วัน)') : 'ไม่สามารถส่งคณะศิษย์ไปช่วงชิงวาสนาได้');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'edit-pet-four-symbol') {
      const [petUid, symbolId] = String(arg || '').split('|');
      const res = SECT.EDITOR.applyPetAction(W, { action: 'awaken_four_symbol', npcId: UI.editNpcId, petUid, symbolId: symbolId || null, free: true, force: true });
      UI.toast(res.ok ? ('🌟 ปลุกสายเลือดเทพอสูร「' + (res.fourSymbol ? res.fourSymbol.nameTh : '') + '」สำเร็จ!') : ('ไม่สำเร็จ: ' + (res.reason || '')));
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'declare-sect-alignment') {
      const res = (SECT && SECT.declareSectAlignment) ? SECT.declareSectAlignment(W, arg) : { ok: false };
      UI.toast(res.ok ? ('☯️ ประกาศจุดยืนสำนักเป็น「' + res.fullTh + '」เรียบร้อย!') : 'ไม่สามารถเปลี่ยนจุดยืนได้');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'propose-clique-nomination') {
      const post = String(arg || 'envoy');
      const res = (SECT && SECT.proposeCliqueNomination) ? SECT.proposeCliqueNomination(W, post) : { ok: false };
      UI.toast(res.ok ? ('📜 ' + res.nomination.reasonTh) : 'ยังไม่มีการเสนอชื่อ');
      UI.render();
    }
    else if (a === 'resolve-nomination') {
      const [nomId, choice] = String(arg || '').split('|');
      const res = (SECT && SECT.resolvePoliticalNomination) ? SECT.resolvePoliticalNomination(W, nomId, choice || 'AUTO') : { ok: false };
      UI.toast(res.ok ? res.summaryTh : 'ไม่สามารถตัดสินใจข้อเสนอชื่อได้');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'appease-undercurrent') {
      const res = (SECT && SECT.appeaseUndercurrent) ? SECT.appeaseUndercurrent(W, arg || 'COUNCIL_CONCESSION', { free: false }) : { ok: false };
      UI.toast(res.ok ? res.summaryTh : 'ศิลาวิญญาณไม่พอจัดสภาประนีประนอม');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'run-officer-jurisdictions') {
      const res = (SECT && SECT.runOfficerJurisdictions) ? SECT.runOfficerJurisdictions(W, { ignoreAvailability: true }) : { ok: false, decisions: [] };
      UI.toast(res.ok && res.decisions.length ? ('🏛️ ขุนนางและผู้อาวุโสตัดสินใจตามตำแหน่งรวม ' + res.decisions.length + ' ฝ่าย!') : 'ยังไม่มีผู้ดำรงตำแหน่งเฉพาะทาง');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'set-world-subtab') {
      UI.worldSectsSubTab = String(arg || 'ALL');
      UI.render();
    }
    else if (a === 'set-chronicle-filter') {
      UI.chronicleFilter = String(arg || 'ALL');
      UI.render();
    }
    else if (a === 'intervene-jianghu-figure') {
      const [figId, actType] = String(arg || '').split('|');
      const res = (EXPED && EXPED.interveneJianghuFigure) ? EXPED.interveneJianghuFigure(W, figId, actType || 'GIFT_RELIC') : { ok: false };
      if (res && res.ok) {
        if (res.chronicle) UI.toast('📜 ' + res.chronicle.titleTh);
        else if (res.succession && res.succession.chronicle) UI.toast('👑 ' + res.succession.chronicle.titleTh);
        else if (res.reemergence && res.reemergence.chronicle) UI.toast('🐉 ' + res.reemergence.chronicle.titleTh);
        else UI.toast('✨ ประทานวาสนาสำเร็จ!');
      } else {
        UI.toast('ไม่พบข้อมูลบุคคลในยุทธภพ');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'trigger-alliance-council') {
      const curDay = W.day || 0;
      if (W.sect.lastAllianceCouncilDay != null && (curDay - W.sect.lastAllianceCouncilDay) < 60) {
        UI.toast('⏳ สภาฝ่ายพันธมิตรอยู่ในช่วงคูลดาวน์ 60 วัน (จัดได้อีกครั้งวันที่ ' + (W.sect.lastAllianceCouncilDay + 60) + ')');
      } else {
        W.sect.lastAllianceCouncilDay = curDay;
        const res = (EXPED && EXPED.tickAllianceCouncil) ? EXPED.tickAllianceCouncil(W, { alignment: arg || null }) : null;
        UI.toast(res && res.chronicle ? ('⚖️ ' + res.chronicle.titleTh) : '⚖️ เรียกประชุมสภาฝ่ายพันธมิตรเรียบร้อย');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'trigger-secret-realm') {
      const curDay = W.day || 0;
      if (W.sect.lastSecretRealmDay != null && (curDay - W.sect.lastSecretRealmDay) < 90) {
        UI.toast('⏳ การสำรวจร่องรอยแดนลับโบราณอยู่ในช่วงคูลดาวน์ 90 วัน (สำรวจได้อีกครั้งวันที่ ' + (W.sect.lastSecretRealmDay + 90) + ')');
      } else {
        W.sect.lastSecretRealmDay = curDay;
        const sr = (EXPED && EXPED.spawnSecretRealm) ? EXPED.spawnSecretRealm(W, arg || null, { quiet: true }) : null;
        const res = (sr && EXPED && EXPED.resolveSecretRealmRace) ? EXPED.resolveSecretRealmRace(W, sr) : null;
        UI.toast(res && res.chronicle ? ('🌌 ' + res.chronicle.titleTh) : '🌌 สำรวจร่องรอยแดนลับโบราณเรียบร้อย');
      }
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'hold-dao-lecture') {
      const res = (SECT && SECT.holdGrandDaoLecture) ? SECT.holdGrandDaoLecture(W, arg || null) : { ok: false };
      UI.toast(res.ok ? ('🪷 ' + res.summaryTh) : 'ไม่สามารถจัดเทศนาธรรมได้');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'handle-dungeon-prisoner') {
      const [prisId, actType] = String(arg || '').split('|');
      const res = (SECT && SECT.handleDungeonPrisoner) ? SECT.handleDungeonPrisoner(W, prisId || null, actType || 'RANSOM', { autoSpawnIfEmpty: true }) : { ok: false };
      UI.toast(res.ok && res.chronicle ? ('⛓️ ' + res.chronicle.titleTh) : 'จัดการเชลยศึกเรียบร้อย');
      UI.render();
      UI.updateHud(true);
    }
    else if (a === 'hold-martial-assembly') {
      const res = (EXPED && EXPED.holdGrandMartialAssembly) ? EXPED.holdGrandMartialAssembly(W) : { ok: false };
      UI.toast(res.ok && res.chronicle ? ('🏆 ' + res.chronicle.titleTh) : 'จัดงานประลองยุทธภพสิบทิศเรียบร้อย');
      UI.render();
      UI.updateHud(true);
    }
  };

  UI.toggleLogFilter = cat => {
    if (!UI.logFilters) UI.logFilters = new Set(['all']);
    if (cat === 'all') {
      UI.logFilters = new Set(['all']);
      UI.tab = 'all';
    } else {
      UI.logFilters.delete('all');
      if (UI.logFilters.has(cat)) {
        UI.logFilters.delete(cat);
        if (UI.logFilters.size === 0) {
          UI.logFilters.add('all');
          UI.tab = 'all';
        }
      } else {
        UI.logFilters.add(cat);
        UI.tab = cat;
      }
    }
    UI.render();
  };

  UI.render = () => {
    const G = UI.G, W = G.W, body = $('shBody'); if (!UI.sheet) return; const keepScroll = body.scrollTop;
    let html = '';
    switch (UI.sheet) {
      case 'people': html = UI.rPeople(); break;
      case 'sect': html = UI.rSect(); break;
      case 'log': html = UI.rLog(); break;
      case 'world': html = UI.rWorld(); break;
      case 'edit': html = UI.rEdit(); break;
      case 'menu': html = UI.rMenu(); break;
      case 'npc': html = UI.rNpc(); break;
      case 'building': html = UI.rBuilding(); break;
      case 'visitor': html = UI.rVisitor(); break;
      case 'clue': html = UI.rClueDetail(); break;
    }
    const isWideInv = UI.getInvViewMode() === "grid" && ((UI.sheet === "sect" && (UI.tab === "stockItems" || UI.tab === "shop")) || UI.sheet === "npc" || (UI.sheet === "edit" && UI.tab === "bag"));
    $("sheet").classList.toggle("wide-inv", !!isWideInv);
    $("sheet").classList.toggle("stock-items", UI.sheet === "sect" && UI.tab === "stockItems");
    if (UI.sheet === "sect" && UI.tab === "stockItems") $("sheet").style.setProperty("--stock-top", Math.ceil($("hudTop").getBoundingClientRect().bottom) + "px");
    $("sheet").classList.toggle("world-atlas", UI.sheet === "world" && UI.tab === "map");
    if (UI.sheet === "world" && UI.tab === "map") $("sheet").style.setProperty("--atlas-top", Math.ceil($("hudTop").getBoundingClientRect().bottom) + "px");
    body.innerHTML = html; drawPortraits(body); body.scrollTop = keepScroll;
    if (UI.sheet === 'world' && UI.tab === 'map') UI.bindWorldAtlas(body);
    const ivSel = body.querySelector("#invViewModeSel");
    if (ivSel) ivSel.onchange = () => { UI.setInvViewMode(ivSel.value); UI.render(); };
    body.querySelectorAll('[data-set]').forEach(el => el.onchange = () => { G.opts[el.dataset.set] = el.checked; UI.applyOpts(); if (UI.sheet === 'menu' && UI.tab === 'set') UI.render(); });
    const qSel = body.querySelector('#gfxQualitySel');
    if (qSel) qSel.onchange = () => { G.opts.quality = qSel.value; if (G.R) G.R._autoDowngraded = false; UI.applyOpts(); UI.render(); };
    const sf = body.querySelector('#npcSel'); if (sf) sf.onchange = () => { UI.cmpId = sf.value; UI.render(); };
    const q = body.querySelector('#pq'); if (q) { q.oninput = () => { UI.pq = q.value; UI.render(); const q2 = $('shBody').querySelector('#pq'); if (q2) { q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length); } }; }
    UI.bindDynamicFilters(body);
  };

  UI.bindDynamicFilters = body => {
    // Sect stock filters
    const stSearch = body.querySelector('#stockSearch');
    if (stSearch) stSearch.oninput = () => { UI.stockSearch = stSearch.value; UI.render(); const el = $('shBody').querySelector('#stockSearch'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } };
    const stType = body.querySelector('#stockType');
    if (stType) stType.onchange = () => { UI.stockType = stType.value; UI.render(); };
    const stTier = body.querySelector('#stockTier');
    if (stTier) stTier.onchange = () => { UI.stockTier = stTier.value; UI.render(); };
    const stSort = body.querySelector('#stockSort');
    if (stSort) stSort.onchange = () => { UI.stockSort = stSort.value; UI.render(); };

    // Sect shop filters
    const shSearch = body.querySelector("#shopSearch");
    if (shSearch) shSearch.oninput = () => { UI.shopSearch = shSearch.value; UI.shopPage = 1; UI.render(); const el = $("shBody").querySelector("#shopSearch"); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } };
    const shSort = body.querySelector("#shopSort");
    if (shSort) shSort.onchange = () => { UI.shopSort = shSort.value; UI.shopPage = 1; UI.render(); };
    const shBuyer = body.querySelector("#shopBuyerSel");
    if (shBuyer) shBuyer.onchange = () => { UI.shopBuyerId = shBuyer.value; UI.render(); };

    // Sect library member selector
    const libNpc = body.querySelector('#libNpcId');
    if (libNpc) libNpc.onchange = () => { UI.libNpcId = libNpc.value; UI.render(); };

    // Personal bag filters
    const bgSearch = body.querySelector("#bagSearch");
    if (bgSearch) bgSearch.oninput = () => { UI.bagSearch = bgSearch.value; UI.bagPage = 1; UI.render(); const el = $("shBody").querySelector("#bagSearch"); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } };
    const bgType = body.querySelector('#bagType');
    if (bgType) bgType.onchange = () => { UI.bagType = bgType.value; UI.render(); };
    const bgSort = body.querySelector('#bagSort');
    if (bgSort) bgSort.onchange = () => { UI.bagSort = bgSort.value; UI.render(); };

    // Edit Hub selectors
    const edNpc = body.querySelector('#editNpcSel');
    if (edNpc) edNpc.onchange = () => { UI.editNpcId = edNpc.value; UI.editDraft = null; UI.render(); };
    const edGrp = body.querySelector('#editStatGroupSel');
    if (edGrp) edGrp.onchange = () => { UI.collectEditDraftFromDom(); UI.editStatGroup = edGrp.value; UI.render(); };
    const edPath = body.querySelector('#editCultPath');
    if (edPath) edPath.onchange = () => { UI.collectEditDraftFromDom(); UI.render(); };
    body.querySelectorAll('.edit-live-input').forEach(inp => {
      inp.onchange = () => { UI.collectEditDraftFromDom(); UI.updateEditPreviewDom(); };
      inp.oninput = () => { UI.collectEditDraftFromDom(); UI.updateEditPreviewDom(); };
    });

    const edRootCount = body.querySelector("#editRootCount");
    if (edRootCount) edRootCount.onchange = () => { UI.collectEditDraftFromDom(); UI.render(); };

    // Spawn filters
    const spDest = body.querySelector("#spawnDest");
    if (spDest) spDest.onchange = () => { UI.spawnDest = spDest.value; UI.spawnPage = 1; UI.render(); };
    const spSearch = body.querySelector("#spawnSearch");
    if (spSearch) spSearch.oninput = () => { UI.spawnSearch = spSearch.value; UI.spawnPage = 1; UI.render(); const el = $("shBody").querySelector("#spawnSearch"); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } };
    const spKind = body.querySelector("#spawnKind");
    if (spKind) spKind.onchange = () => { UI.spawnKind = spKind.value; UI.spawnPage = 1; UI.render(); };
    const spTier = body.querySelector("#spawnTier");
    if (spTier) spTier.onchange = () => { UI.spawnTier = spTier.value; UI.spawnPage = 1; UI.render(); };
    const spElem = body.querySelector("#spawnElement");
    if (spElem) spElem.onchange = () => { UI.spawnElement = spElem.value; UI.spawnPage = 1; UI.render(); };
    const spRar = body.querySelector("#spawnRarity");
    if (spRar) spRar.onchange = () => { UI.spawnRarity = spRar.value; UI.spawnPage = 1; UI.render(); };
    const spPageSize = body.querySelector("#spawnPageSize");
    if (spPageSize) spPageSize.onchange = () => { UI.spawnPageSize = +spPageSize.value || 40; UI.spawnPage = 1; UI.render(); };
    const spQty = body.querySelector("#spawnQty");
    if (spQty) spQty.onchange = () => { UI.spawnQty = Math.max(1, Math.min(50000, Math.floor(+spQty.value || 1))); };
    const spQual = body.querySelector("#spawnQuality");
    if (spQual) spQual.onchange = () => { UI.spawnQuality = +spQual.value || 1; };
    const dipSel = body.querySelector("#editDipSectSel");
    if (dipSel) dipSel.onchange = () => { UI.editDipSectId = dipSel.value; UI.render(); };
    const sancSel = body.querySelector("#editSanctumSel");
    if (sancSel) sancSel.onchange = () => { UI.editSanctumId = sancSel.value; UI.render(); };

    // Sect & World Chronicle Search
    const scSearch = body.querySelector("#sectChronicleSearch");
    if (scSearch) {
      scSearch.oninput = () => {
        UI.sectChronicleSearch = scSearch.value;
        UI.render();
        const el = $("shBody").querySelector("#sectChronicleSearch");
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      };
    }
    const wcSearch = body.querySelector("#worldChronicleSearch");
    if (wcSearch) {
      wcSearch.oninput = () => {
        UI.worldChronicleSearch = wcSearch.value;
        UI.render();
        const el = $("shBody").querySelector("#worldChronicleSearch");
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      };
    }
  };

  UI.tick = () => { if (!UI.sheet || UI.atlasDragging || UI.sheet === 'menu' && UI.tab !== 'main' || UI.sheet === 'edit') return; const now = performance.now(); if (now - (UI.lastRender || 0) < 1200) return; if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) return; UI.lastRender = now; UI.render(); };

  /* ----- ผู้คน ----- */
  UI.rPeople = () => {
    const W = UI.G.W; let list = W.npcs.filter(n => !n.dead && !n.exiled); const q = (UI.pq || '').trim(); if (q) list = list.filter(n => HC.fullName(n).includes(q) || SECT.title(n).includes(q));
    const tab = UI.tab;
    const trackedIds = (W.sect && W.sect.trackedNpcIds) || [];
    const trackedSet = new Set(trackedIds);
    if (tab === 'tracked') {
      list = list.filter(n => trackedSet.has(n.id));
      list.sort((a, b) => b.rank - a.rank || (b.cult ? b.cult.stage : 0) - (a.cult ? a.cult.stage : 0));
    }
    else if (tab === 'rank') list.sort((a, b) => b.rank - a.rank || (b.cult ? b.cult.stage : 0) - (a.cult ? a.cult.stage : 0));
    else if (tab === 'act') list.sort((a, b) => (a.away ? 'z' : a.act.id).localeCompare(b.away ? 'z' : b.act.id));
    else if (tab === 'cult') list.sort((a, b) => (b.cult ? CULT.power(b) : 0) - (a.cult ? CULT.power(a) : 0));
    else list.sort((a, b) => a.h.state.mood - b.h.state.mood);
    const cap = SECT.housingCapacity ? SECT.housingCapacity(W) : 46;
    const head = '<input id="pq" type="search" placeholder="ค้นหาชื่อ/ตำแหน่ง…" value="' + esc(UI.pq || '') + '" style="margin-bottom:8px"><div class="muted" style="margin-bottom:6px">' + (tab === 'tracked' ? 'สมาชิกที่ติดตาม ' + list.length + ' คน' : 'สมาชิก ' + list.length + '/' + cap + ' คน (เพดานที่พักสูงสุด 100 คน)') + ' · แตะเพื่อดูตัวตนเต็ม</div>';
    if (tab === 'tracked' && !list.length) {
      return head + '<div class="card" style="margin-top:10px;text-align:center"><div class="muted">ยังไม่มีศิษย์ที่ติดตามในขณะนี้</div><div style="margin-top:6px;font-size:12.5px;line-height:1.6">แตะที่ชื่อศิษย์คนใดก็ได้ แล้วกดปุ่ม <b>⭐ ติดตามตัวละคร</b> เพื่อปักหมุดติดตามความคืบหน้า<br>หรือเลือกศิษย์ที่ต้องการติดตามจากแท็บอื่น</div><div style="margin-top:8px"><button class="btn pri" data-do="open-people" data-arg="rank">👥 ไปหน้ารายชื่อศิษย์ทั้งหมด</button></div></div>';
    }
    return head + list.map(n => { const hpf = n.h.state.hp / CULT.hpMax(n); const sub = tab === 'cult' ? (n.cult ? CULT.stageName(n) + ' · พลัง ' + Math.round(CULT.power(n)) : 'ปุถุชน') : tab === 'mood' ? 'อารมณ์ ' + Math.round(n.h.state.mood) + ' · เครียด ' + Math.round(n.h.state.stress) + ' · พอใจสำนัก ' + Math.round(n.sat == null ? 60 : n.sat) : actText(n);
      const c = n.cult, path = c && CULT.PATHS[c.path], subpath = c && c.sub && c.sub !== 'NONE' ? CULT.subInfo(c.path, c.sub) : null;
      const roots = (n.h.root && (n.h.root.roots || n.h.root.elements)) || [];
      const rootText = roots.map(r => { const key = typeof r === 'string' ? r : r.element; const m = g.ELEM && g.ELEM.META && g.ELEM.META[key]; return m ? (m.icon || '✦') + ' ' + (m.shortTh || m.nameTh) : ''; }).filter(Boolean).join(' · ');
      const isTr = trackedSet.has(n.id);
      const trChip = isTr ? ' <span class="chip" style="border-color:#ffd700;color:#ffd700;font-size:10px" title="กำลังติดตาม">⭐ ติดตาม</span>' : '';
      const badges = '<div class="people-badges">' + (c ? '<span class="chip b">' + esc(CULT.stageName(n)) + '</span> <span class="chip" style="border-color:' + esc((path && path.color) || '#749b89') + '">' + esc((path && path.icon) || '☯') + ' ' + esc((path && (path.shortTh || path.nameTh)) || 'วิถี') + '</span>' + (subpath ? ' <span class="chip">' + esc(subpath.nameTh) + '</span>' : '') : '<span class="chip">ปุถุชน</span>') + trChip + (rootText ? '<div class="sub">รากธาตุ: ' + esc(rootText) + '</div>' : '') + '</div>';
      return '<div class="prow" data-npc="' + n.id + '">' + portraitHtml(n, 42) + '<div class="pi"><div class="nm">' + esc(HC.fullName(n)) + ' <span class="chip ' + (n.rank >= 4 ? 'g' : '') + '" style="font-size:10.5px">' + esc(SECT.title(n)) + '</span>' + (isTr ? ' <span style="color:#ffd700;font-size:12px" title="กำลังติดตาม">⭐</span>' : '') + '</div>' + badges + '<div class="sub">' + esc(sub) + '</div><div class="mini"><i style="width:' + clamp(hpf * 100, 0, 100) + '%;background:' + (hpf > .6 ? '#5fd38a' : hpf > .3 ? '#e8c43a' : '#e0584a') + '"></i></div></div></div>'; }).join('');
  };

  /* ----- Helper: Build Filtered Sect Stock & Shop Rows (Read-Only, Authoritative) ----- */
  function buildSectStockItems(W) {
    const S = W.sect;
    const rows = [];
    const getRes = id => (g.EXT && g.EXT.reserveForSect) ? g.EXT.reserveForSect(W, id) : (ECO.reserveFloor ? ECO.reserveFloor(W, id) : 2);
    // 1. Provisions & Stones
    if ((S.stones || 0) > 0) {
      rows.push({
        selKey: "ST:stones",
        kind: "PROVISION",
        rawKind: "PROVISION",
        broadCat: "OTHER",
        kindTh: "ทุนสำนัก",
        id: "stones",
        templateId: "stones",
        nameTh: "ศิลาวิญญาณสำนัก",
        tier: 2,
        rarity: "Common",
        qty: Math.round(S.stones || 0),
        value: Math.round(S.stones || 0),
        resFloor: 150,
        statusTh: "เงินทุนหมุนเวียนและค่าบำรุงอาคาร",
        descTh: "ใช้ก่อสร้าง ขยายหอพัก วิจัยตำรับ และซื้อขายกับพ่อค้าเร่ภายนอก",
        moreTh: "ศิลาคงคลัง: " + Math.round(S.stones || 0) + " ก้อน"
      });
    }
    ["grain", "meal"].forEach(id => {
      const qty = ECO.count(W, id);
      if (qty > 0) {
        const res = getRes(id);
        rows.push({
          selKey: "ST:" + id,
          kind: "PROVISION",
          rawKind: "PROVISION",
          broadCat: "OTHER",
          kindTh: "เสบียง",
          id,
          templateId: id,
          nameTh: ECO.name(id),
          tier: 1,
          rarity: "Common",
          qty,
          value: id === "meal" ? 4 : 2,
          resFloor: res,
          isShortage: qty < res,
          isSurplus: qty > res * 2,
          statusTh: qty > res ? "เพียงพอ (สำรอง " + res + ")" : "สำรองจำเป็น (" + qty + "/" + res + ")",
          descTh: id === "meal" ? "อาหารพร้อมกินสำหรับศิษย์และเสบียงเดินทาง" : "ข้าวสารสำหรับหุงเป็นอาหารในโรงครัว",
          moreTh: "เกณฑ์สำรองขั้นต่ำ: " + res + " หน่วย · คงเหลือจริง: " + qty + " หน่วย"
        });
      }
    });
    // 2. Stock pills & materials
    Object.keys(S.stock || {}).forEach(id => {
      if (id === "grain" || id === "meal") return;
      const qty = ECO.count(W, id);
      if (qty <= 0) return;
      const res = getRes(id);
      if (ECO.isPill(id)) {
        const info = ECO.pillInfo(id) || {};
        const tier = info.tier || 1;
        const qVal = ECO.pillQuality ? ECO.pillQuality(W, id) : 1;
        const price = (g.CPE && g.CPE.priceOf) ? g.CPE.priceOf(W, id) : tier * 10;
        rows.push({
          selKey: "ST:" + id,
          kind: "PILL",
          rawKind: "PILL",
          broadCat: "PILL",
          kindTh: "โอสถคลัง",
          id,
          templateId: id,
          nameTh: ECO.name(id),
          tier,
          rarity: tier >= 6 ? "Legendary" : tier >= 5 ? "Exceptional" : tier >= 3 ? "Rare" : "Common",
          qualityPct: Math.round(qVal * 100),
          qty,
          value: price,
          resFloor: res,
          isShortage: qty < res,
          isSurplus: qty > res,
          statusTh: qty > res ? "เกินสำรอง " + (qty - res) + " (พร้อมจัดสรร/ขาย)" : "สำรองคลัง (" + qty + "/" + res + ")",
          descTh: pillEffectSummaryTh(id),
          moreTh: "ราคาแลกในร้านสำนัก: " + price + " คป. · เกณฑ์สำรองคลัง: " + res + " เม็ด"
        });
      } else {
        const m = ECO.matById[id] || {};
        const tier = m.tier || 1;
        const isContainer = id === "ITEM_MYSTERY_RIVER_CONTAINER";
        const isTrash = id === "TRASH_RIVER_DEBRIS";
        const isDish = !!(g.FISHING && g.FISHING.isFishDish && g.FISHING.isFishDish(id));
        const isFish = !!(g.FISHING && g.FISHING.isFish && g.FISHING.isFish(id));
        const reward = (isContainer || isTrash) ? 0 : ((g.CPE && g.CPE.reward) ? Math.round(g.CPE.reward(W, id, 1)) : tier * 5);
        rows.push({
          selKey: "ST:" + id,
          kind: isContainer ? "CONTAINER" : isTrash ? "TRASH" : isDish ? "FOOD" : "MATERIAL",
          rawKind: isContainer ? "CONTAINER" : isTrash ? "TRASH" : isDish ? "FOOD" : "MATERIAL",
          broadCat: (isContainer || isTrash || isDish) ? "OTHER" : "MATERIAL",
          kindTh: isContainer ? "หีบปริศนาใต้น้ำ" : isTrash ? "ขยะใต้น้ำไร้ค่า" : isDish ? "อาหารปราณ" : isFish ? "ปลาปราณ" : "วัตถุดิบ",
          id,
          templateId: id,
          nameTh: ECO.name(id),
          tier,
          rarity: m.rarity || (tier >= 6 ? "Legendary" : tier >= 4 ? "Exceptional" : tier >= 3 ? "Rare" : "Common"),
          qty,
          value: reward,
          resFloor: (isContainer || isTrash) ? 0 : res,
          isShortage: !(isContainer || isTrash) && qty < res,
          isSurplus: !(isContainer || isTrash) && qty > res + 4,
          canOpenContainer: isContainer,
          canDiscardTrash: isTrash,
          canCookFish: isFish,
          statusTh: isContainer ? "พร้อมเปิดดูสิ่งของภายใน" : isTrash ? "ไม่มีมูลค่า (ทิ้งทำลายได้)" : isDish ? "อาหารพร้อมรับประทานในโรงครัว" : (qty > res ? "ส่วนเกิน +" + (qty - res) : "สำรองหอผลิต/โรงครัว (" + qty + "/" + res + ")"),
          descTh: m.descTh || "วัตถุดิบสำหรับหอโอสถและโรงหลอมศาสตรา",
          moreTh: isContainer ? "โอกาสเปิดได้: เศษซากใต้น้ำ 50.0% · ของทั่วไปตามลำดับขั้น 49.5% · สมบัติระดับตำนาน 0.5%" : isTrash ? "มูลค่า 0 ศิลา / 0 คป. ไม่สามารถขายหรือบริจาคได้" : ("แต้มรับบริจาค: " + reward + " คป./หน่วย · เกณฑ์สำรอง: " + res + " หน่วย")
        });
      }
    });
    // 3. Equipment
    (S.gear || []).forEach((eq, idx) => {
      if (!eq) return;
      const qVal = (g.VC && g.VC.gearQuality) ? g.VC.gearQuality(eq) : (eq.q || eq.quality || 1);
      const isLeg = !!(eq.legendary || eq.grade === "Legendary" || eq.rarity === "Legendary" || /^LEG_/.test(eq.id || ""));
      const tier = eq.tier || 1;
      const price = (g.CPE && g.CPE.gearPrice) ? g.CPE.gearPrice(W, eq) : tier * 25;
      rows.push({
        selKey: "ST_EQ:" + (eq.uid || eq.id || idx),
        kind: "EQUIPMENT",
        rawKind: "EQUIPMENT",
        broadCat: "EQUIPMENT",
        kindTh: isLeg ? "ศาสตราตำนาน" : "อุปกรณ์",
        id: eq.uid || eq.id,
        templateId: eq.id,
        eq,
        nameTh: (isLeg ? "★ " : "") + eq.nameTh,
        tier,
        rarity: UI.itemArtGrade(eq),
        legendary: isLeg,
        qualityPct: Math.round(qVal * 100),
        qty: 1,
        value: price,
        resFloor: 1,
        statusTh: "ช่อง " + (eq.slot || "-") + " · คุณภาพ " + Math.round(qVal * 100) + "%",
        descTh: gearEffectSummaryTh(eq),
        moreTh: "ช่อง: " + (eq.slot || "-") + " · ขั้นขั้นต่ำ: " + (eq.minStage || 1) + " · ราคาแลกในร้าน: " + price + " คป."
      });
    });
    // 4. Crystals
    Object.keys(S.crystals || {}).forEach(subId => {
      const qty = S.crystals[subId] || 0;
      if (qty <= 0) return;
      const rawSub = subId.startsWith("S:") ? subId.slice(2) : subId;
      const subObj = CULT.subList.find(x => x.sub.id === rawSub);
      const kInfo = (g.MARTIAL && g.MARTIAL.knowledge) ? g.MARTIAL.knowledge(subId) : null;
      const tier = (kInfo && kInfo.tier) || 3;
      const price = (g.MARTIAL && g.MARTIAL.crystalPrice) ? g.MARTIAL.crystalPrice(W, subId) : tier * 35;
      rows.push({
        selKey: "ST_CR:" + subId,
        kind: "CRYSTAL",
        rawKind: "CRYSTAL",
        broadCat: "MANUAL",
        kindTh: "ผลึกสายย่อย",
        id: subId,
        templateId: rawSub,
        nameTh: (g.MARTIAL && g.MARTIAL.crystalName) ? g.MARTIAL.crystalName(subId) : ("ผลึก「" + (subObj ? subObj.sub.nameTh : subId) + "」"),
        tier,
        rarity: tier >= 6 ? "Legendary" : tier >= 4 ? "Exceptional" : "Rare",
        qty,
        value: price,
        resFloor: 0,
        statusTh: "พร้อมมอบให้ศิษย์วิถี " + (subObj ? subObj.path : (kInfo ? kInfo.path : "")),
        descTh: "ผลึกสืบทอดสายย่อยหรือวิชาเฉพาะทางในคลังสำนัก",
        moreTh: "ราคาแลกในร้านสำนัก: " + price + " คป. · บริจาคได้ไม่เกิน " + ((g.MARTIAL && g.MARTIAL.crystalReward) ? g.MARTIAL.crystalReward(W, subId) : 20) + " คป."
      });
    });
    // 5. Organs
    Object.keys(S.organs || {}).forEach(oid => {
      const qty = S.organs[oid] || 0;
      if (qty <= 0) return;
      const o = g.CONTENT && g.CONTENT.organById && g.CONTENT.organById[oid];
      const tier = o ? o.tier : 2;
      rows.push({
        selKey: "ST_ORG:" + oid,
        kind: "ORGAN",
        rawKind: "ORGAN",
        broadCat: "MATERIAL",
        kindTh: "อวัยวะอสูร",
        id: oid,
        templateId: oid,
        nameTh: o ? o.nameTh : oid,
        tier,
        rarity: tier >= 6 ? "Legendary" : tier >= 4 ? "Exceptional" : "Rare",
        qty,
        value: tier * 28,
        resFloor: 0,
        statusTh: "วัตถุดิบวิจัย/หลอมสกัด",
        descTh: o ? ("ธาตุ " + o.element + " · " + (o.usesTh || "ชิ้นส่วนอสูรกลายพันธุ์")) : "ชิ้นส่วนอสูรกลายพันธุ์",
        moreTh: o && o.propertyTags ? ("คุณสมบัติ: " + o.propertyTags.join(", ")) : "เก็บรักษาในคลังวิจัยสำนัก"
      });
    });
    // 6. Library Techniques (Read-Only Reference in Manual Category)
    (S.library || []).forEach(tid => {
      const t = CULT.tech(tid);
      if (!t) return;
      const isLeg = !!(t.legendary || t.grade === "Legendary" || /^LEG_/.test(tid));
      const tier = t.tier || t.reqTier || 1;
      const fee = (g.CPE && g.CPE.techPrice) ? g.CPE.techPrice(W, t) : tier * 25;
      rows.push({
        selKey: "ST_LIB:" + tid,
        kind: "TECH_MANUAL",
        rawKind: "TECH_MANUAL",
        broadCat: "MANUAL",
        kindTh: isLeg ? "คัมภีร์หอตำนาน" : "คัมภีร์ในหอ",
        id: tid,
        templateId: tid,
        nameTh: (isLeg ? "★ " : "") + "คัมภีร์「" + t.nameTh + "」",
        tier,
        rarity: UI.itemArtGrade(t),
        legendary: isLeg,
        qty: 1,
        value: fee,
        resFloor: 1,
        statusTh: "บรรจุในหอคัมภีร์ · ค่าเรียน " + fee + " คป.",
        descTh: (t.descTh || "คัมภีร์ประจำหอคัมภีร์") + " · " + techniqueSummary(t).pathText,
        moreTh: "ระดับคุณภาพ: " + (t.grade || "Common") + " · ขั้นขั้นต่ำ: " + (t.reqTier || tier) + " · ศิษย์เรียนซ้ำได้ไม่จำกัดครั้ง"
      });
    });
    return rows;
  }
  UI.buildSectStockItems = buildSectStockItems;

  function buildSectShopItems(W) {
    const S = W.sect;
    const out = [];
    // 1. All shopItems from CPE.shopItems(W) (pills, gear, crystals)
    const rawShop = (g.CPE && g.CPE.shopItems) ? g.CPE.shopItems(W) : [];
    rawShop.forEach((it, idx) => {
      if (it.kind === "pill") {
        const info = ECO.pillInfo(it.key) || {};
        const tier = info.tier || 1;
        const isBasic = String(it.key).startsWith("P:BASIC");
        const qVal = ECO.pillQuality ? ECO.pillQuality(W, it.key) : 1;
        out.push({
          selKey: "SH_PILL:" + it.key,
          shopKind: "pill",
          kind: "PILL",
          rawKind: "PILL",
          broadCat: "PILL",
          kindTh: isBasic ? "โอสถพื้นฐาน" : "โอสถพรีเมียม",
          id: it.key,
          key: it.key,
          templateId: it.key,
          nameTh: ECO.name(it.key),
          tier,
          rarity: tier >= 6 ? "Legendary" : tier >= 5 ? "Exceptional" : tier >= 3 ? "Rare" : "Common",
          qualityPct: Math.round(qVal * 100),
          qty: it.n || ECO.count(W, it.key),
          price: it.price,
          value: it.price,
          descTh: pillEffectSummaryTh(it.key),
          moreTh: (isBasic ? "โอสถพื้นฐาน (แจกสวัสดิการเมื่อจำเป็น หรือแลกซื้อด้วย คป.)" : "โอสถพิเศษ ต้องแลกซื้อด้วยแต้มคุณูปการเท่านั้น") + " · รับบริจาคคืน ~" + Math.round((g.CPE && g.CPE.reward) ? g.CPE.reward(W, it.key, 1) : 4) + " คป."
        });
      } else if (it.kind === "gear" && it.gear) {
        const eq = it.gear;
        const qVal = (g.VC && g.VC.gearQuality) ? g.VC.gearQuality(eq) : (eq.q || eq.quality || 1);
        const isLeg = !!(eq.legendary || eq.grade === "Legendary" || eq.rarity === "Legendary" || /^LEG_/.test(eq.id || ""));
        const tier = eq.tier || 1;
        out.push({
          selKey: "SH_EQ:" + (eq.uid || eq.id || idx),
          shopKind: "gear",
          kind: "EQUIPMENT",
          rawKind: "EQUIPMENT",
          broadCat: "EQUIPMENT",
          kindTh: isLeg ? "ศาสตราตำนาน" : "อุปกรณ์ยุทธ์",
          id: eq.uid || eq.id,
          templateId: eq.id,
          gear: eq,
          eq,
          nameTh: (isLeg ? "★ " : "") + eq.nameTh,
          tier,
          rarity: UI.itemArtGrade(eq),
          legendary: isLeg,
          qualityPct: Math.round(qVal * 100),
          qty: 1,
          price: it.price,
          value: it.price,
          descTh: "ช่อง " + (eq.slot || "-") + " · " + gearEffectSummaryTh(eq),
          moreTh: "ขั้นขั้นต่ำที่สวมใส่ได้: ขั้น " + (eq.minStage || 1) + " · คุณภาพ " + Math.round(qVal * 100) + "%"
        });
      } else if (it.kind === "crystal") {
        const kInfo = (g.MARTIAL && g.MARTIAL.knowledge) ? g.MARTIAL.knowledge(it.key) : null;
        const rawSub = String(it.key).replace(/^(S:|T:)/, "");
        const tier = (kInfo && kInfo.tier) || 3;
        out.push({
          selKey: "SH_CR:" + it.key,
          shopKind: "crystal",
          kind: "CRYSTAL",
          rawKind: "CRYSTAL",
          broadCat: "MANUAL",
          kindTh: "ผลึกความรู้",
          id: it.key,
          key: it.key,
          templateId: rawSub,
          nameTh: (g.MARTIAL && g.MARTIAL.crystalName) ? g.MARTIAL.crystalName(it.key) : it.key,
          tier,
          rarity: tier >= 6 ? "Legendary" : tier >= 4 ? "Exceptional" : "Rare",
          qty: it.n || 1,
          price: it.price,
          value: it.price,
          descTh: "วิถี " + ((kInfo && kInfo.path) || "ANY") + " · ใช้ซึมซับเปิดสายย่อยหรือวิชาโดยตรง",
          moreTh: "บริจาคคืนได้ไม่เกิน " + ((g.MARTIAL && g.MARTIAL.crystalReward) ? g.MARTIAL.crystalReward(W, it.key) : 20) + " คป."
        });
      }
    });
    // 2. Library Techniques requiring CP fee
    (S.library || []).forEach(tid => {
      const t = CULT.tech(tid);
      if (!t) return;
      const isFree = (g.CPE && g.CPE.techFree) ? g.CPE.techFree(W, t) : false;
      const price = isFree ? 0 : ((g.CPE && g.CPE.techPrice) ? g.CPE.techPrice(W, t) : (t.tier || 1) * 30);
      const isLeg = !!(t.legendary || t.grade === "Legendary" || /^LEG_/.test(tid));
      const tier = t.tier || t.reqTier || 1;
      out.push({
        selKey: "SH_TECH:" + tid,
        shopKind: "tech_study",
        kind: "TECH_MANUAL",
        rawKind: "TECH_MANUAL",
        broadCat: "MANUAL",
        kindTh: isLeg ? "ศึกษาวิชาตำนาน" : "ศึกษาคัมภีร์หอ",
        id: tid,
        key: tid,
        templateId: tid,
        tech: t,
        nameTh: (isLeg ? "★ " : "") + "วิชา「" + t.nameTh + "」",
        tier,
        rarity: UI.itemArtGrade(t),
        legendary: isLeg,
        qty: 1,
        price,
        value: price,
        descTh: (t.descTh || "คัมภีร์ในหอคัมภีร์") + " · วิถี " + (t.path || "ANY") + " · ขั้นขั้นต่ำ " + (t.reqTier || tier),
        moreTh: isFree ? "วิชาพื้นฐานของสำนัก (เรียนฟรี 0 คป.)" : ("ค่าธรรมเนียมศึกษาจากหอคัมภีร์ " + price + " คป. (คัมภีร์คงอยู่ในหอถาวร)")
      });
    });
    // 3. Buyback / Donation Bounties (Materials in OTHER/MATERIAL)
    ["MAT_HERB_DEW_GRASS_1", "MAT_HERB_JADE_LOTUS_2", "MAT_HERB_BLOOD_GINSENG_3"].forEach(mid => {
      const m = ECO.matById[mid] || {};
      const tier = m.tier || 1;
      const reward = (g.CPE && g.CPE.reward) ? Math.round(g.CPE.reward(W, mid, 1)) : tier * 6;
      const have = ECO.count(W, mid);
      out.push({
        selKey: "SH_BOUNTY:" + mid,
        shopKind: "bounty_mat",
        kind: "MATERIAL",
        rawKind: "MATERIAL",
        broadCat: "MATERIAL",
        kindTh: "ป้ายรับซื้อสมุนไพร",
        id: mid,
        key: mid,
        templateId: mid,
        nameTh: "รับบริจาค: " + ECO.name(mid),
        tier,
        rarity: tier >= 3 ? "Rare" : "Common",
        qty: have,
        price: reward,
        value: reward,
        descTh: "สำนักรับบริจาคเข้าคลัง ให้รางวัล +" + reward + " คป./หน่วย (ในคลังมี " + have + " หน่วย)",
        moreTh: "ศิษย์ที่มีสมุนไพรนี้ในถุงส่วนตัวสามารถนำมาบริจาคเพื่อรับแต้มคุณูปการได้ทันที"
      });
    });
    return out;
  }
  UI.buildSectShopItems = buildSectShopItems;

  function techniqueSummary(t) {
    const c = g.MARTIAL && g.MARTIAL.classifyTechniqueAccess ? g.MARTIAL.classifyTechniqueAccess(t) : null;
    const p = t.path && CULT.PATHS[t.path];
    const path = p ? (p.shortTh || p.nameTh) : 'ทุกวิถี';
    const sub = t.sub && CULT.subInfo(t.path, t.sub);
    const w = Array.isArray(t.weaponTypes) ? t.weaponTypes : [];
    const weapon = w.map(x => (g.MARTIAL && g.MARTIAL.TYPES && g.MARTIAL.TYPES[x]) || x).join(' / ');
    const restricted = c && !c.learnableAcrossPaths;
    const subRestricted = c && !c.learnableAcrossSubpaths;
    const pathText = p ? (restricted ? 'จำกัดวิถี ' : 'วิถีที่ถนัด ') + path : 'ทุกวิถี';
    const subText = sub ? (subRestricted ? 'จำกัดสายย่อย ' : 'สายย่อยที่ถนัด ') + sub.nameTh : '';
    const weaponText = weapon ? (t.requiresWeapon && !t.legendary ? 'ต้องใช้อาวุธ ' : 'อาวุธที่ได้โบนัส ') + weapon : 'ไม่จำกัดอาวุธ';
    return { pathText, subText, weaponText, path: p };
  }
  UI.rSectLibrary = W => {
    const S = W.sect;
    const alive = W.npcs.filter(n => !n.dead && !n.exiled);
    if (!UI.libNpcId || !W.byId[UI.libNpcId] || W.byId[UI.libNpcId].dead || W.byId[UI.libNpcId].exiled) {
      UI.libNpcId = (UI.G.R && UI.G.R.selected && W.byId[UI.G.R.selected] && !W.byId[UI.G.R.selected].dead && !W.byId[UI.G.R.selected].exiled)
        ? UI.G.R.selected
        : (S.masterId && W.byId[S.masterId] ? S.masterId : (alive[0] ? alive[0].id : null));
    }
    const selNpc = UI.libNpcId ? W.byId[UI.libNpcId] : null;

    let h = '<h3>📚 หอคัมภีร์สำนัก (Sect Knowledge Library)</h3>';
    h += '<div class="card"><div class="grid2">';
    h += '<div>📖 คัมภีร์วิชาหลักในหอ <b>' + (S.library || []).length + '</b> เล่ม</div>';
    h += '<div>🌿 คัมภีร์สายย่อยในหอ <b>' + (S.subLibrary || []).length + '</b> เล่ม</div>';
    const surplusTechCount = (S.surplusTechManuals || []).length;
    const surplusSubCount = (S.surplusSubManuals || []).length;
    if (surplusTechCount > 0 || surplusSubCount > 0) {
      h += '<div>📦 คัมภีร์ฉบับส่วนเกินรอจำหน่าย <b>' + (surplusTechCount + surplusSubCount) + '</b> เล่ม</div>';
    }
    h += '</div><div class="muted" style="margin-top:6px">คัมภีร์ในหอคัมภีร์เป็นความรู้ถาวรของสำนัก สมาชิกที่มีสิทธิ์และวิถีต้องกันสามารถศึกษาได้โดยใช้แต้มคุณูปการ (คป.) โดยคัมภีร์ยังคงอยู่ในหอตลอดไป</div></div>';

    // Member selection bar
    h += '<h3>👤 เลือกศิษย์/สมาชิกที่จะศึกษา</h3><div class="card">';
    h += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">';
    h += '<label style="font-weight:600">สมาชิก:</label><select id="libNpcId" style="flex:1;min-width:180px">';
    alive.forEach(n => {
      const stageTxt = n.cult ? CULT.stageName(n) : 'ปุถุชน';
      const cpVal = Math.round(n.cp || 0);
      const isSel = n.id === UI.libNpcId;
      h += '<option value="' + n.id + '"' + (isSel ? ' selected' : '') + '>' + esc(HC.fullName(n)) + ' (' + SECT.title(n) + ' · ' + stageTxt + ' · ' + cpVal + ' คป.)</option>';
    });
    h += '</select></div>';

    if (selNpc) {
      const cpVal = Math.round(selNpc.cp || 0);
      const allowedTier = SECT.canLearnTier ? SECT.canLearnTier(W, selNpc) : 1;
      const pathTxt = selNpc.cult ? ((CULT.PATHS[selNpc.cult.path] && CULT.PATHS[selNpc.cult.path].nameTh) || selNpc.cult.path) : 'ยังไม่เปิดวิถี';
      const subTxt = selNpc.cult && selNpc.cult.sub !== 'NONE' ? ((CULT.subInfo(selNpc.cult.path, selNpc.cult.sub) || {}).nameTh || selNpc.cult.sub) : 'ไม่มีสายย่อย';
      h += '<div style="margin-top:6px;font-size:12px;display:flex;gap:8px;flex-wrap:wrap" class="muted">';
      h += '<span>วิถี: <b>' + esc(pathTxt) + '</b></span>';
      h += '<span>สายย่อย: <b>' + esc(subTxt) + '</b></span>';
      h += '<span>สิทธิ์หอคัมภีร์: <b>ขั้น ' + allowedTier + '</b></span>';
      h += '<span>แต้มคงเหลือ: <b style="color:var(--gold,#f0a030)">' + cpVal + ' คป.</b></span>';
      if (selNpc.cult && selNpc.cult.learning) {
        const lTech = CULT.tech(selNpc.cult.learning.id) || {};
        const pct = Math.round((selNpc.cult.learning.got / selNpc.cult.learning.need) * 100);
        h += '<span style="color:#4fb2f2">กำลังศึกษา: <b>' + esc(lTech.nameTh || selNpc.cult.learning.id) + ' (' + pct + '%)</b></span>';
      }
      h += '</div>';
    }
    h += '</div>';

    // Sub-category selector
    UI.libCat = UI.libCat || 'ALL';
    h += '<div style="margin:8px 0 4px;display:flex;gap:6px;flex-wrap:wrap">';
    [['ALL', 'ทั้งหมด (' + ((S.library || []).length + (S.subLibrary || []).length) + ')'],
     ['MAIN', 'คัมภีร์วิชาหลัก (' + (S.library || []).length + ')'],
     ['SUB', 'คัมภีร์สายย่อย (' + (S.subLibrary || []).length + ')']].forEach(([k, label]) => {
      h += '<button class="btn' + (UI.libCat === k ? ' pri' : '') + '" style="padding:4px 10px;font-size:11.5px" data-do="set-lib-cat" data-arg="' + k + '">' + label + '</button>';
    });
    h += '</div>';

    // 1. Main Technique Library
    if (UI.libCat === 'ALL' || UI.libCat === 'MAIN') {
      h += '<h3>📖 คัมภีร์วิชาหลักในหอ (' + (S.library || []).length + ' เล่ม)</h3>';
      if (!(S.library || []).length) {
        h += '<div class="card muted">หอคัมภีร์ยังไม่มีคัมภีร์วิชาหลัก (สามารถค้นหาจากยุทธภพ มอบบริจาค หรือเสกเข้าหอคัมภีร์)</div>';
      } else {
        h += '<div class="card">';
        (S.library || []).forEach(tid => {
          const t = CULT.tech(tid);
          if (!t) return;
          const isLeg = !!(t.legendary || t.grade === "Legendary" || /^LEG_/.test(tid));
          const reqTier = t.reqTier || t.tier || 1;
          const fee = (g.CPE && g.CPE.techPrice) ? g.CPE.techPrice(W, t) : (reqTier * 30);
          const elMeta = (g.ELEM && g.ELEM.META && g.ELEM.META[t.element]) || { nameTh: t.element || "ไร้ธาตุ", icon: "⚪" };
          const elChip = t.element && t.element !== "NEUTRAL" ? (' <span class="chip">' + elMeta.icon + ' ' + esc(elMeta.nameTh) + '</span>') : '';
          const legChip = isLeg ? ' <span class="chip g">★ Legendary</span>' : '';

          let statusBadge = '';
          let canStudy = false;
          let blockReason = '';

          if (!selNpc) {
            blockReason = 'กรุณาเลือกสมาชิก';
          } else if (!selNpc.cult) {
            blockReason = 'ยังเป็นปุถุชน ต้องเปิดวิถีบำเพ็ญก่อน';
          } else if ((selNpc.cult.techs || []).includes(tid) || selNpc.cult.mantra === tid) {
            statusBadge = '<span class="chip ok">✔ เรียนรู้แล้ว</span>';
          } else if (selNpc.cult.learning && selNpc.cult.learning.id === tid) {
            const pct = Math.round((selNpc.cult.learning.got / selNpc.cult.learning.need) * 100);
            statusBadge = '<span class="chip b">กำลังศึกษา (' + pct + '%)</span>';
          } else if (selNpc.cult.learning) {
            blockReason = 'กำลังศึกษาวิชาอื่นอยู่';
          } else if (reqTier > (SECT.canLearnTier ? SECT.canLearnTier(W, selNpc) : 1)) {
            blockReason = '🔒 สิทธิ์หอคัมภีร์ไม่ถึงขั้น ' + reqTier;
          } else if (g.MARTIAL && g.MARTIAL.eligible && !g.MARTIAL.eligible(selNpc, 'T:' + tid, { allowMantra: true, libraryStudy: true }).ok) {
            blockReason = '🔒 ' + (g.MARTIAL.eligible(selNpc, 'T:' + tid, { allowMantra: true, libraryStudy: true }).reason || 'ยังไม่ผ่านเกณฑ์ศึกษา');
          } else if ((selNpc.cp || 0) < fee) {
            blockReason = '🔒 แต้ม คป. ไม่พอ (ต้องการ ' + fee + ' คป.)';
          } else {
            canStudy = true;
          }

          const actionBtn = canStudy
            ? '<button class="btn pri" style="padding:4px 10px;font-size:11.5px" data-do="study-tech-lib" data-arg="' + selNpc.id + '|' + tid + '">📖 ศึกษา (' + fee + ' คป.)</button>'
            : (statusBadge || '<span class="muted" style="font-size:11px">' + esc(blockReason) + '</span>');

          const info = techniqueSummary(t);
          h += '<div class="logrow library-row" style="align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--line,#2a2f3a)">';
          h += '<button type="button" class="library-icon" data-do="library-detail" data-arg="' + esc(tid) + '" aria-label="รายละเอียด ' + esc(t.nameTh) + '">' + UI.renderAtlasIconHtml({id:tid, kind:'TECH_MANUAL', tier:reqTier}, 40) + '</button>';
          h += '<div style="flex:1;min-width:0">';
          h += '<b>' + esc(t.nameTh) + '</b> <span class="chip b">ขั้น ' + reqTier + '</span>' + legChip + elChip + (info.path ? ' <span class="chip" style="border-color:' + esc(info.path.color || '#8ebba4') + '">' + esc(info.path.icon || '☯') + ' ' + esc(info.path.shortTh || info.path.nameTh) + '</span>' : '');
          h += '<div class="muted" style="font-size:11.5px;margin-top:2px">' + esc(info.pathText) + (info.subText ? ' · ' + esc(info.subText) : '') + ' · ' + esc(info.weaponText) + ' · ค่าศึกษา ' + fee + ' คป.</div>';
          if (t.descTh) h += '<div class="muted" style="font-size:11px">' + esc(t.descTh) + '</div>';
          h += '</div><div style="flex-shrink:0">' + actionBtn + '</div></div>';
        });
        h += '</div>';
      }
    }

    // 2. Subpath Manual Library
    if (UI.libCat === 'ALL' || UI.libCat === 'SUB') {
      h += '<h3>📜 คัมภีร์สายย่อยในหอ (' + (S.subLibrary || []).length + ' เล่ม)</h3>';
      if (!(S.subLibrary || []).length) {
        h += '<div class="card muted">หอคัมภีร์ยังไม่มีคัมภีร์สายย่อย (สามารถค้นหาจากมรดกยุทธภพ หรือรับบริจาคจากสมาชิก)</div>';
      } else {
        h += '<div class="card">';
        (S.subLibrary || []).forEach(subId => {
          const subObj = CULT.subList.find(x => x.sub.id === subId);
          if (!subObj) return;
          const sub = subObj.sub;
          const path = subObj.path;
          const fee = (g.MARTIAL && g.MARTIAL.studyFee) ? g.MARTIAL.studyFee(W, "S:" + subId) : 180;
          const elMeta = (g.ELEM && g.ELEM.META && g.ELEM.META[sub.element]) || { nameTh: sub.element || "ไร้ธาตุ", icon: "⚪" };
          const elChip = sub.element && sub.element !== "NEUTRAL" ? (' <span class="chip">' + elMeta.icon + ' ' + esc(elMeta.nameTh) + '</span>') : '';

          let statusBadge = '';
          let canStudy = false;
          let blockReason = '';

          if (!selNpc) {
            blockReason = 'กรุณาเลือกสมาชิก';
          } else if (!selNpc.cult) {
            blockReason = 'ยังเป็นปุถุชน ต้องเปิดวิถีบำเพ็ญก่อน';
          } else if (selNpc.cult.sub === subId) {
            statusBadge = '<span class="chip ok">✔ สายย่อยปัจจุบัน</span>';
          } else {
            const elig = g.MARTIAL ? g.MARTIAL.eligible(selNpc, "S:" + subId) : { ok: false, reason: 'ไม่พบระบบตรวจสอบ' };
            const reqTier = (elig.knowledge && elig.knowledge.tier) || (g.MARTIAL && g.MARTIAL.knowledge && g.MARTIAL.knowledge("S:" + subId) ? g.MARTIAL.knowledge("S:" + subId).tier : 1);
            const tierOk = (SECT.canLearnTier ? SECT.canLearnTier(W, selNpc) : 1) >= reqTier;
            if (!tierOk) {
              blockReason = '🔒 สิทธิ์หอคัมภีร์ไม่ถึงขั้น ' + reqTier;
            } else if (!elig.ok) {
              blockReason = '🔒 ' + (elig.reason || 'ไม่ผ่านเกณฑ์วิถีหรือมีสายย่อยอื่นอยู่');
            } else if ((selNpc.cp || 0) < fee) {
              blockReason = '🔒 แต้ม คป. ไม่พอ (ต้องการ ' + fee + ' คป.)';
            } else {
              canStudy = true;
            }
          }

          const subReqTier = (g.MARTIAL && g.MARTIAL.knowledge && g.MARTIAL.knowledge("S:" + subId)) ? g.MARTIAL.knowledge("S:" + subId).tier : 1;
          const actionBtn = canStudy
            ? '<button class="btn pri" style="padding:4px 10px;font-size:11.5px" data-do="study-sub-lib" data-arg="' + selNpc.id + '|' + subId + '">🌿 ศึกษาสายย่อย (' + fee + ' คป.)</button>'
            : (statusBadge || '<span class="muted" style="font-size:11px">' + esc(blockReason) + '</span>');

          h += '<div class="logrow" style="align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--line,#2a2f3a)">';
          h += '<div style="flex:1;min-width:0">';
          h += '<span class="chip v">สายย่อย T' + subReqTier + '</span>' + elChip + ' <b>' + esc(sub.nameTh) + '</b>';
          h += '<div class="muted" style="font-size:11.5px;margin-top:2px">วิถี ' + path + ' · ค่าศึกษา ' + fee + ' คป. · กำหนดสายย่อยถาวร</div>';
          if (sub.descTh) h += '<div class="muted" style="font-size:11px">' + esc(sub.descTh) + '</div>';
          h += '</div><div style="flex-shrink:0">' + actionBtn + '</div></div>';
        });
        h += '</div>';
      }
    }
    if (UI.libraryDetail) {
      const t = CULT.tech(UI.libraryDetail);
      if (t) { const info = techniqueSummary(t); h += '<div class="library-popup"><button class="btn library-close" data-do="library-detail" data-arg="">✕ ปิด</button><b>' + esc(t.nameTh) + '</b><div>' + esc(info.pathText) + (info.subText ? ' · ' + esc(info.subText) : '') + '</div><div>' + esc(info.weaponText) + '</div><div>ขั้น ' + (t.reqTier || t.tier || 1) + ' · ' + esc((g.ELEM && g.ELEM.META && g.ELEM.META[t.element] || {}).nameTh || 'ไร้ธาตุ') + '</div><div>' + (t.power != null ? 'พลัง ' + esc(String(t.power)) + ' · ' : '') + 'ค่าศึกษา ' + ((g.CPE && g.CPE.techPrice) ? g.CPE.techPrice(W, t) : (t.reqTier || t.tier || 1) * 30) + ' คป.</div><div>' + esc(t.descTh || '') + '</div>' + (Array.isArray(t.moves) && t.moves.length ? '<div>กระบวนท่า: ' + t.moves.map(esc).join(' · ') + '</div>' : '') + '</div>'; }
    }
    return h;
  };

  /* ----- หน้าต่างเฉพาะระบบหุบเขาและ 8 ยอดเขา (Dedicated Sect Peaks & Valleys Sanctuary Hub v3.1.0) ----- */
  UI.rSectPeaks = W => {
    W = W || (UI.G && UI.G.W);
    if (!W || !W.sect || !SECT.PEAKS) return '<div class="card muted">ระบบยอดเขายังไม่พร้อมใช้งาน</div>';
    const pk = SECT.PEAKS.ensure(W);
    const allPeaks = SECT.PEAKS.PEAK_IDS.map(pid => pk.byId[pid]).filter(Boolean);
    const foundedPeaks = SECT.PEAKS.getVisibleFoundedPeaks(W);
    const activeTab = UI.activePeakId || UI._peaksTab || UI._peaksSubView || UI._peaksView || 'OVERVIEW';
    const independents = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== W.sect.masterId && !n.peakId);

    let h = '';
    // 1. Single-Row Horizontal Scrollable Selector (Mobile-Friendly Clean UX — Zero 3-Level Nested Menus)
    h += '<div class="card" style="padding:8px 10px;margin-bottom:8px;border-color:var(--gold)">';
    h += '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin;white-space:nowrap">';
    h += '<button class="btn ' + (activeTab === 'OVERVIEW' ? 'pri' : '') + '" style="padding:4px 10px;font-size:11.5px;flex-shrink:0" data-do="select-peak-tab" data-arg="OVERVIEW">🗺️ ภาพรวมทุกยอดเขา (' + foundedPeaks.length + '/8)</button>';
    allPeaks.forEach(pObj => {
      const isSelected = activeTab === pObj.id;
      const badge = pObj.founded ? (' · ' + ((pObj.memberIds && pObj.memberIds.length) || 0)) : ' 🔒';
      h += '<button class="btn ' + (isSelected ? 'pri' : '') + '" style="padding:4px 9px;font-size:11.5px;flex-shrink:0" data-do="select-peak-tab" data-arg="' + esc(pObj.id) + '">' + esc((pObj.icon || '⛰️') + ' ' + (pObj.shortTh || pObj.nameTh) + badge) + '</button>';
    });
    h += '<button class="btn ' + (activeTab === 'TOURNAMENT' ? 'pri' : 'ok') + '" style="padding:4px 10px;font-size:11.5px;flex-shrink:0" data-do="select-peak-tab" data-arg="TOURNAMENT">🏆 ศึกประลองยอดเขา</button>';
    h += '</div></div>';

    if (activeTab === 'OVERVIEW') {
      // Top Action Bar
      h += '<div class="card" style="margin-bottom:8px">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
      h += '<div><b>🗺️ แผนผังบริหาร 8 ยอดเขาและหุบเขาประจำสำนัก</b><div class="muted" style="font-size:11.5px">ประธานยอดเขามีศักดิ์เทียบเท่ารองเจ้าสำนัก (น้ำหนักโหวตสภา 1.8–2.5) · สมาชิกในสังกัดรับโบนัสค่ายกลปราณยอดเขา +14%</div></div>';
      h += '<div style="display:flex;gap:5px;flex-wrap:wrap">' +
        '<button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="scan-and-found-peaks">🏔️ ตรวจสอบ/สถาปนายอดเขาครบเกณฑ์</button>' +
        '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="auto-assign-peak-disciples">🤝 จัดสรรศิษย์ไร้สังกัดเข้ายอดเขา</button>' +
        '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="allocate-peak-resources">🪙 จัดสรรงบส่วนกลางสู่ยอดเขา</button>' +
        '<button class="btn ok" style="padding:3px 8px;font-size:11px" data-do="hold-inter-peak-tournament">⚔️ จัดประลองระหว่างยอดเขา</button>' +
        '</div></div></div>';

      // 8-Peak Comparison Grid
      h += '<div class="grid2">';
      allPeaks.forEach(pObj => {
        const def = SECT.PEAKS.PEAK_DEFS[pObj.id] || {};
        const aura = def.auraBonus || { cultRate: 0.14 };
        const memCount = (pObj.memberIds || []).filter(id => W.byId[id] && !W.byId[id].dead && !W.byId[id].exiled).length;
        const pathMembersCount = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== W.sect.masterId && n.cult && pObj.paths.includes(n.cult.path)).length;
        const allies = [];
        const rivals = [];
        SECT.PEAKS.PEAK_IDS.forEach(otherId => {
          if (otherId === pObj.id) return;
          const sc = SECT.PEAKS.getInterPeakScore(W, pObj.id, otherId);
          const oName = pk.byId[otherId] ? (pk.byId[otherId].shortTh || pk.byId[otherId].nameTh) : otherId;
          if (sc >= 15) allies.push(oName + ' (+' + sc + ')');
          else if (sc <= -15) rivals.push(oName + ' (' + sc + ')');
        });
        h += '<div class="card" style="margin:0;border-color:' + (pObj.founded ? 'var(--gold)' : 'var(--line,#3a3f4a)') + '">';
        h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">';
        h += '<div><b>' + esc((pObj.icon || '⛰️') + ' ' + pObj.nameTh) + '</b> ' +
          (pObj.founded ? '<span class="chip ok">สถาปนาแล้ว</span>' : '<span class="chip">รอสถาปนา (' + pathMembersCount + '/4 คน)</span>') +
          '<div class="muted" style="font-size:11px;margin-top:2px">วิถีประจำยอดเขา: <b>' + esc(pObj.paths.join(' + ')) + '</b> · ค่ายกลปราณ <b>+' + Math.round((aura.cultRate || 0.14) * 100) + '%</b></div></div>';
        h += '<div style="display:flex;gap:4px;flex-shrink:0">' +
          (!pObj.founded ? '<button class="btn pri" style="padding:2px 7px;font-size:10.5px" data-do="found-specific-peak" data-arg="' + esc(pObj.id) + '">🏔️ สถาปนา</button>' : '') +
          '<button class="btn" style="padding:2px 7px;font-size:10.5px" data-do="focus-peak-camera" data-arg="' + esc(pObj.id) + '">🔍 ส่องดูกล้อง</button>' +
          '<button class="btn pri" style="padding:2px 7px;font-size:10.5px" data-do="peak-launch-expedition" data-arg="' + esc(pObj.id) + '">🧭 ส่งทัพสำรวจประจำยอดเขา</button>' + '<button class="btn" style="padding:2px 7px;font-size:10.5px" data-do="select-peak-tab" data-arg="' + esc(pObj.id) + '">⚙️ จัดการ</button>' +
          '</div></div>';
        h += '<div style="font-size:11.5px;margin-top:6px;padding-top:5px;border-top:1px dotted var(--line,#3a3f4a)">' +
          '<div>👑 <b>ประธานยอดเขา:</b> ' + esc(pObj.masterNameTh || 'ยังไม่ได้แต่งตั้ง') + ' · <b>รองประธาน:</b> ' + esc(pObj.deputyNameTh || '-') + '</div>' +
          '<div>👥 <b>ศิษย์ในสังกัด:</b> ' + memCount + ' คน · 🏅 <b>ความรุ่งเรือง:</b> ' + (pObj.prestige || 50) + ' · 💎 <b>คลังยอดเขา:</b> ' + (pObj.treasuryStones || 0) + ' ศิลา (' + (pObj.pillReserve || 0) + ' โอสถ)</div>' +
          '<div class="muted" style="font-size:11px">📜 นโยบาย: ' + esc(pObj.policy && pObj.policy.allocationRuleTh ? pObj.policy.allocationRuleTh : 'เน้นผลงานและตบะ') + '</div>' +
          '<div class="muted" style="font-size:11px">🤝 พันธมิตร: ' + esc(allies.length ? allies.join(', ') : 'เป็นกลาง') + ' · ⚔️ คู่ปรับ: ' + esc(rivals.length ? rivals.join(', ') : 'ไม่มี') + '</div>' +
          '</div></div>';
      });
      h += '</div>';

      // Unassigned / Independent Disciples Panel
      h += '<h3>🍃 ทำเนียบศิษย์อิสระไร้สังกัดยอดเขา (' + independents.length + ' คน)</h3>';
      h += '<div class="card">';
      if (!independents.length) {
        h += '<div class="muted">ศิษย์ทุกคนในสำนักมีสังกัดยอดเขาครบถ้วนแล้ว</div>';
      } else {
        h += '<div class="muted" style="font-size:11.5px;margin-bottom:6px">ศิษย์ไร้สังกัดยอดเขาจะขาดค่ายกลปราณหนุนตบะ (-12%) และไม่ได้รับส่วนแบ่งโอสถ/ศิลาประจำยอดเขา — กดเลือกส่งเข้าสังกัดยอดเขาที่ตรงสายได้ทันที:</div>';
        independents.forEach(n => {
          const recPeakId = (n.cult && SECT.PEAKS.peakIdForPath(n.cult.path)) || 'PEAK_AZURE_SWORD';
          const recPeak = pk.byId[recPeakId] || allPeaks[0];
          h += '<div style="padding:5px 0;border-top:1px dotted var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">' +
            '<div><b>' + nameLink(n) + '</b> <span class="chip">' + esc((SECT.RANKS[n.rank] && SECT.RANKS[n.rank].nameTh) || 'ศิษย์') + '</span> <span class="chip b">วิถี: ' + esc(n.cult ? n.cult.path : 'ปุถุชน') + ' · ' + (n.cult ? CULT.stageName(n) : '-') + '</span></div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
            '<button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="assign-disciple-peak" data-arg="' + esc(n.id + '|' + recPeak.id) + '">➕ ส่งเข้า「' + esc(recPeak.shortTh || recPeak.nameTh) + '」(ตรงสาย)</button>' +
            foundedPeaks.filter(fp => fp.id !== recPeak.id).slice(0, 2).map(fp => '<button class="btn" style="padding:2px 7px;font-size:10.5px" data-do="assign-disciple-peak" data-arg="' + esc(n.id + '|' + fp.id) + '">➔ ' + esc(fp.shortTh || fp.nameTh) + '</button>').join('') +
            '</div></div>';
        });
      }
      h += '</div>';
      return h;
    }

    if (activeTab === 'TOURNAMENT') {
      const tHist = pk.tournamentHistory || [];
      h += '<div class="card" style="border-color:var(--gold)">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
      h += '<div><b>🏆 ศึกลานประลองยุทธ์เชื่อมสัมพันธ์ 8 ยอดเขา (Inter-Peak Grand Tournament)</b><div class="muted" style="font-size:11.5px">คัดเลือกตัวแทนยอดฝีมือของแต่ละยอดเขามาประลองชิงธงเกียรติยศ แชมป์รับ +90 ศิลา, +40 CP, +55 ตบะ และยอดเขาชนะเลิศได้โควตางบส่วนกลาง +25%!</div></div>';
      h += '<button class="btn ok" style="padding:5px 12px;font-size:12px" data-do="hold-inter-peak-tournament">⚔️ จัดศึกประลองยุทธ์ระหว่างยอดเขาทันที</button>';
      h += '</div></div>';

      // Leaderboard of Peaks
      h += '<h3>🏅 ตารางอันดับเกียรติภูมิและศักยภาพยอดเขา</h3><div class="card">';
      const rankedPeaks = allPeaks.slice().sort((a, b) => ((b.founded ? 1000 : 0) + (b.prestige || 50)) - ((a.founded ? 1000 : 0) + (a.prestige || 50)));
      rankedPeaks.forEach((pObj, idx) => {
        const mems = (pObj.memberIds || []).map(id => W.byId[id]).filter(n => n && !n.dead && !n.exiled);
        mems.sort((a, b) => CULT.power(b) - CULT.power(a));
        const topRep = mems[0];
        const wins = tHist.filter(t => t.winnerPeakId === pObj.id).length;
        h += '<div style="padding:5px 0;border-bottom:1px dotted var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">' +
          '<div><b>#' + (idx + 1) + ' ' + esc((pObj.icon || '⛰️') + ' ' + pObj.nameTh) + '</b> ' +
          (pObj.founded ? '<span class="chip g">เกียรติภูมิ ' + (pObj.prestige || 50) + '</span>' : '<span class="chip">ยังไม่สถาปนา</span>') +
          ' <span class="chip b">แชมป์สะสม ' + wins + ' สมัย</span> <span class="muted">โควตางบ ×' + (pObj.budgetMultiplier || 1).toFixed(2) + '</span></div>' +
          '<div class="muted" style="font-size:11.5px">ตัวแทนสูงสุด: <b>' + esc(topRep ? HC.fullName(topRep) : '-') + '</b>' + (topRep ? (' (พลังยุทธ์ ' + Math.round(CULT.power(topRep)) + ')') : '') + '</div></div>';
      });
      h += '</div>';

      // Tournament History
      h += '<h3>📜 บันทึกประวัติแชมป์ศึกประลองยอดเขา (' + tHist.length + ' ครั้ง)</h3><div class="card">';
      if (!tHist.length) {
        h += '<div class="muted">ยังไม่มีประวัติการประลองระหว่างยอดเขา — กดปุ่ม「⚔️ จัดศึกประลองยุทธ์ระหว่างยอดเขาทันที」ด้านบนเพื่อเปิดศึกชิงเจ้ายอดเขา!</div>';
      } else {
        tHist.forEach(tr => {
          h += '<div style="padding:6px 0;border-bottom:1px dotted var(--line,#3a3f4a)">' +
            '<div><b>🏆 วันที่ ' + tr.day + ' — แชมป์ยอดเขา: ' + esc(tr.championNameTh) + ' (' + esc(tr.winnerPeakNameTh) + ')</b> <span class="chip ok">ชนะ ' + esc(tr.runnerUpNameTh) + ' (' + esc(tr.runnerUpPeakNameTh) + ')</span></div>' +
            '<div class="muted" style="font-size:11.5px;margin-top:2px">' + esc(tr.summaryTh) + '</div></div>';
        });
      }
      h += '</div>';
      return h;
    }

    // 3. Individual Peak Detail View
    const pObj = pk.byId[activeTab] || allPeaks[0];
    const def = SECT.PEAKS.PEAK_DEFS[pObj.id] || {};
    const aura = def.auraBonus || { cultRate: 0.14 };
    const masterNpc = pObj.masterId ? W.byId[pObj.masterId] : null;
    const deputyNpc = pObj.deputyId ? W.byId[pObj.deputyId] : null;
    const members = (pObj.memberIds || []).map(id => W.byId[id]).filter(n => n && !n.dead && !n.exiled);
    const eligibleOutsiders = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== W.sect.masterId && n.peakId !== pObj.id);
    eligibleOutsiders.sort((a, b) => {
      const mA = (a.cult && pObj.paths.includes(a.cult.path)) ? 100 : 0;
      const mB = (b.cult && pObj.paths.includes(b.cult.path)) ? 100 : 0;
      return (mB + (b.rank || 1) * 15 + CULT.power(b)) - (mA + (a.rank || 1) * 15 + CULT.power(a));
    });

    h += '<div class="card" style="border-color:var(--gold)">';
    h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px">';
    h += '<div><div style="font-size:15px"><b>' + esc((pObj.icon || '⛰️') + ' ' + pObj.nameTh) + '</b> ' +
      (pObj.founded ? '<span class="chip ok">สถาปนาแล้ว (วันที่ ' + (pObj.foundedDay || 360) + ')</span>' : '<span class="chip r">ยังไม่สถาปนา</span>') +
      '</div><div class="muted" style="font-size:11.5px;margin-top:2px">' + esc(pObj.descTh) + '</div>' +
      '<div style="margin-top:5px;display:flex;gap:6px;flex-wrap:wrap">' +
      '<span class="chip g">☯️ ค่ายกลปราณยอดเขา: อัตราฝึกปราณ +' + Math.round((aura.cultRate || 0.14) * 100) + '%</span>' +
      '<span class="chip b">วิถีหลัก: ' + esc(pObj.paths.join(' + ')) + '</span>' +
      '<span class="chip">🏅 เกียรติภูมิ ' + (pObj.prestige || 50) + '</span>' +
      '<span class="chip">💎 คลังยอดเขา ' + (pObj.treasuryStones || 0) + ' ศิลา · โอสถ ' + (pObj.pillReserve || 0) + ' เม็ด</span>' +
      '</div></div>';
    h += '<div style="display:flex;gap:5px;flex-wrap:wrap">' +
      '<button class="btn" style="padding:4px 10px;font-size:11.5px" data-do="focus-peak-camera" data-arg="' + esc(pObj.id) + '">🔍 ส่องดูกล้องยอดเขานี้</button>' +
      (!pObj.founded ? '<button class="btn pri" style="padding:4px 10px;font-size:11.5px" data-do="found-specific-peak" data-arg="' + esc(pObj.id) + '">🏔️ สถาปนายอดเขานี้ทันที</button>' : '') +
      (pObj.founded ? '<button class="btn ' + (pObj.arrayActive ? 'pri' : '') + '" style="padding:4px 10px;font-size:11.5px" data-do="toggle-peak-array" data-arg="' + esc(pObj.id) + '">☯️ ' + (pObj.arrayActive ? 'ค่ายกลปราณ: เปิดอยู่ (Lv.' + (pObj.arrayLevel || 1) + ')' : 'เปิดค่ายกลปราณยอดเขา') + '</button>' : '') +
      (pObj.founded && (pObj.arrayLevel || 1) < 3 ? '<button class="btn" style="padding:4px 10px;font-size:11.5px" data-do="upgrade-peak-array" data-arg="' + esc(pObj.id) + '">⬆️ อัปเกรดค่ายกลยอดเขา (Lv.' + ((pObj.arrayLevel || 1) + 1) + ')</button>' : '') +
      '<button class="btn ok" style="padding:4px 10px;font-size:11.5px" data-do="distribute-single-peak" data-arg="' + esc(pObj.id) + '">🎁 แจกจ่ายทรัพยากรคลังยอดเขา</button>' +
      '</div></div></div>';

    // Leadership Cards (Peak Master & Deputy)
    h += '<h3>👑 ทำเนียบผู้นำยอดเขา (ประธานยอดเขา & รองประธานยอดเขา)</h3>';
    h += '<div class="grid2">';
    // Peak Master Card
    h += '<div class="card" style="margin:0">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px"><b>👑 ประธานยอดเขา (Peak Master)</b><span class="chip g">ศักดิ์เทียบเท่ารองเจ้าสำนัก · โหวต 2.5</span></div>';
    if (masterNpc) {
      h += '<div class="prow" style="margin:6px 0" data-npc="' + masterNpc.id + '">' + portraitHtml(masterNpc, 42) + '<div class="pi"><div class="nm">' + esc(HC.fullName(masterNpc)) + '</div><div class="sub">' + (masterNpc.cult ? CULT.stageName(masterNpc) : '-') + ' · พลังยุทธ์ ' + Math.round(CULT.power(masterNpc)) + '</div></div></div>';
    } else {
      h += '<div class="muted" style="padding:8px 0">ยังไม่มีประธานยอดเขา — กดปุ่มแต่งตั้งผู้เหมาะสมด้านล่าง</div>';
    }
    h += '<div style="display:flex;gap:5px;flex-wrap:wrap">' +
      '<button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="appoint-peak-leader" data-arg="' + esc(pObj.id + '|MASTER|') + '">👑 แต่งตั้ง/เปลี่ยนประธานยอดเขา</button>' +
      (masterNpc ? '<button class="btn dan" style="padding:2px 8px;font-size:11px" data-do="remove-peak-leader" data-arg="' + esc(pObj.id + '|MASTER') + '">✕ ถอดถอน</button>' : '') +
      '</div></div>';

    // Deputy Peak Master Card
    h += '<div class="card" style="margin:0">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px"><b>🎖️ รองประธานยอดเขา (Deputy)</b><span class="chip b">ผู้ช่วยบริหารหุบเขา · เบี้ยหวัด +15%</span></div>';
    if (deputyNpc) {
      h += '<div class="prow" style="margin:6px 0" data-npc="' + deputyNpc.id + '">' + portraitHtml(deputyNpc, 42) + '<div class="pi"><div class="nm">' + esc(HC.fullName(deputyNpc)) + '</div><div class="sub">' + (deputyNpc.cult ? CULT.stageName(deputyNpc) : '-') + ' · พลังยุทธ์ ' + Math.round(CULT.power(deputyNpc)) + '</div></div></div>';
    } else {
      h += '<div class="muted" style="padding:8px 0">ยังไม่มีรองประธานยอดเขา — กดปุ่มแต่งตั้งผู้เหมาะสมด้านล่าง</div>';
    }
    h += '<div style="display:flex;gap:5px;flex-wrap:wrap">' +
      '<button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="appoint-peak-leader" data-arg="' + esc(pObj.id + '|DEPUTY|') + '">🎖️ แต่งตั้ง/เปลี่ยนรองประธาน</button>' +
      (deputyNpc ? '<button class="btn dan" style="padding:2px 8px;font-size:11px" data-do="remove-peak-leader" data-arg="' + esc(pObj.id + '|DEPUTY') + '">✕ ถอดถอน</button>' : '') +
      '</div></div>';
    h += '</div>';

    // Resource Allocation Policy Selector
    const curRule = (pObj.policy && pObj.policy.allocationRule) || 'MERITOCRATIC';
    h += '<h3>📜 นโยบายการจัดสรรทรัพยากรและโอสถประจำยอดเขา</h3><div class="card">';
    h += '<div style="margin-bottom:6px">นโยบายปัจจุบัน: <b>' + esc(pObj.policy && pObj.policy.allocationRuleTh ? pObj.policy.allocationRuleTh : 'เน้นผลงานและตบะ') + '</b></div>';
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
    Object.values(SECT.PEAKS.POLICY_RULES || {}).forEach(rSpec => {
      h += '<button class="btn ' + (curRule === rSpec.id ? 'pri' : '') + '" style="padding:3px 9px;font-size:11px" data-do="set-peak-policy" data-arg="' + esc(pObj.id + '|' + rSpec.id) + '">' + esc(rSpec.nameTh) + '</button>';
    });
    h += '</div></div>';

    // Peak Disciple Roster & Transfer Controls
    h += '<h3>👥 ทำเนียบศิษย์ในสังกัด「' + esc(pObj.shortTh || pObj.nameTh) + '」(' + members.length + ' คน)</h3><div class="card">';
    if (!members.length) {
      h += '<div class="muted">ยังไม่มีศิษย์สังกัดยอดเขานี้ — สามารถรับศิษย์เข้าสังกัดได้จากรายชื่อด้านล่าง</div>';
    } else {
      members.forEach(mNpc => {
        const roleBadge = mNpc.peakRole === 'MASTER' ? '<span class="chip g">👑 ประธานยอดเขา</span>' : mNpc.peakRole === 'DEPUTY' ? '<span class="chip b">🎖️ รองประธาน</span>' : '<span class="chip">ศิษย์ในสังกัด</span>';
        h += '<div style="padding:5px 0;border-bottom:1px dotted var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">' +
          '<div><b>' + nameLink(mNpc) + '</b> ' + roleBadge + ' <span class="muted">วิถี ' + esc(mNpc.cult ? mNpc.cult.path : '-') + ' · ' + (mNpc.cult ? CULT.stageName(mNpc) : '-') + ' · พลัง ' + Math.round(CULT.power(mNpc)) + '</span></div>' +
          '<div style="display:flex;gap:4px">' +
          (mNpc.peakRole !== 'MASTER' ? '<button class="btn" style="padding:2px 6px;font-size:10.5px" data-do="appoint-peak-leader" data-arg="' + esc(pObj.id + '|MASTER|' + mNpc.id) + '">👑 ตั้งเป็นประธาน</button>' : '') +
          (mNpc.peakRole !== 'DEPUTY' ? '<button class="btn" style="padding:2px 6px;font-size:10.5px" data-do="appoint-peak-leader" data-arg="' + esc(pObj.id + '|DEPUTY|' + mNpc.id) + '">🎖️ ตั้งเป็นรอง</button>' : '') +
          '<button class="btn dan" style="padding:2px 6px;font-size:10.5px" data-do="remove-from-peak" data-arg="' + esc(mNpc.id) + '">🍃 ย้ายออก</button>' +
          '</div></div>';
      });
    }
    if (eligibleOutsiders.length) {
      h += '<div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--line,#3a3f4a)"><b>➕ รับศิษย์เข้าสังกัด「' + esc(pObj.shortTh || pObj.nameTh) + '」เพิ่มเติม:</b></div>';
      eligibleOutsiders.slice(0, 8).forEach(cand => {
        const isPathMatch = cand.cult && pObj.paths.includes(cand.cult.path);
        h += '<div style="padding:4px 0;border-bottom:1px dotted var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">' +
          '<div><b>' + nameLink(cand) + '</b> ' + (isPathMatch ? '<span class="chip ok">ตรงวิถี (' + esc(cand.cult.path) + ')</span>' : '<span class="chip">วิถี ' + esc(cand.cult ? cand.cult.path : '-') + '</span>') + ' <span class="muted">(' + (cand.peakNameTh ? 'สังกัด: ' + esc(cand.peakNameTh) : 'ศิษย์อิสระ') + ')</span></div>' +
          '<button class="btn pri" style="padding:2px 8px;font-size:10.5px" data-do="assign-disciple-peak" data-arg="' + esc(cand.id + '|' + pObj.id) + '">➕ โยกย้ายเข้ายอดเขานี้</button></div>';
      });
    }
    h += '</div>';

    // Inter-Peak Diplomacy & Exchange
    h += '<h3>🤝 สายสัมพันธ์ระหว่างยอดเขาและการแลกเปลี่ยนเคล็ดวิชา</h3><div class="card">';
    h += '<div class="grid2">';
    allPeaks.filter(op => op.id !== pObj.id).forEach(op => {
      const sc = SECT.PEAKS.getInterPeakScore(W, pObj.id, op.id);
      const stLabel = sc >= 15 ? '<span class="chip ok">พันธมิตร (+' + sc + ')</span>' : sc <= -15 ? '<span class="chip r">คู่ปรับ (' + sc + ')</span>' : '<span class="chip">เป็นกลาง (' + sc + ')</span>';
      h += '<div style="padding:5px 7px;border:1px solid var(--line,#3a3f4a);border-radius:8px;display:flex;justify-content:space-between;align-items:center;gap:4px">' +
        '<div><b>' + esc((op.icon || '⛰️') + ' ' + (op.shortTh || op.nameTh)) + '</b> ' + stLabel + '</div>' +
        '<button class="btn" style="padding:2px 7px;font-size:10.5px" data-do="peak-joint-exchange" data-arg="' + esc(pObj.id + '|' + op.id) + '">🤝 เชื่อมไมตรี</button></div>';
    });
    h += '</div></div>';

    return h;
  };

  /* ----- สำนัก ----- */
  UI.rSect = wArg => {
    const W = wArg || (UI.G && UI.G.W), S = W.sect, m = W.byId[S.masterId];
    let tab = UI.tab || 'over';
    let forcedSectSub = null;
    if (tab === 'council') { tab = 'over'; forcedSectSub = 'COUNCIL'; }
    else if (tab === 'lineage') { tab = 'over'; forcedSectSub = 'LINEAGE'; }
    else if (tab === 'dao') { tab = 'over'; forcedSectSub = 'DAO'; }
    else if (tab === 'visuals') { tab = 'over'; forcedSectSub = 'VISUALS'; }
    let h = '';
    if (tab === 'over') {
      const sSub = forcedSectSub || UI.sectSubTab || 'CORE';
      const sectSubTabs = [
        ['CORE', '📌 สรุป & บัญชาการ'],
        ['COUNCIL', '🏛️ สภา · ธรรมนูญ & ค่ายพัก'],
        ['PEAKS_ARRAY', '⛰️ 8 ยอดเขา · ฮวงจุ้ย & โทเท็ม'],
        ['LINEAGE', '💞 คู่บำเพ็ญ · อาจารย์ & ทำเนียบ'],
        ['DAO', '🌌 แดนลับ · ชะตาฟ้า & วิจัย'],
        ['VISUALS', '✨ กราฟิก & ทัศนียภาพ'],
        ['ALL', '📋 ดูทั้งหมด']
      ];
      const alive = W.npcs.filter(n => !n.dead && !n.exiled);
      const pop = SECT.memberOccupancy ? SECT.memberOccupancy(W) : alive.length;
      const cap = SECT.housingCapacity ? SECT.housingCapacity(W) : 46;
      const maxCap = SECT.maxHousingCapacity ? SECT.maxHousingCapacity() : 100;
      const byRank = SECT.RANKS.map(r => alive.filter(n => n.rank === r.id).length);
      h += '<div class="prow" data-npc="' + m.id + '">' + portraitHtml(m, 54) + '<div class="pi"><div class="nm" style="font-size:15px">' + esc(S.name) + '</div><div class="sub">เจ้าสำนัก: ' + esc(HC.fullName(m)) + ' · ' + HC.ageText(m) + ' · ' + esc(HC.identity(m).title) + '</div></div></div>';
      h += '<div class="card"><div class="grid2"><div>👥 สมาชิก <b>' + pop + '/' + cap + '</b> <span class="muted">(สูงสุด ' + maxCap + ')</span></div><div>🏅 ชื่อเสียง <b>' + U.fmtNum(S.fame) + '</b></div><div>💎 ศิลาวิญญาณ <b>' + U.fmtNum(S.stones) + '</b></div><div>😊 ความพึงพอใจ <b>' + Math.round(W.avgSat) + '</b></div><div>🍚 ข้าว/อาหาร <b>' + ECO.count(W, 'grain') + '/' + ECO.count(W, 'meal') + '</b></div><div>☠ ผู้เสียชีวิตสะสม <b>' + (W.deaths || 0) + '</b></div></div></div>';
      const activeTribs = (S.activeTribulations || []).filter(x => x && x.active);
      if (activeTribs.length) {
        h += '<div class="card" style="border-color:#ffd740;background:rgba(255,215,64,0.10);margin-bottom:8px">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div><b>⛈️ แจ้งเตือนทัณฑ์สวรรค์กำลังฟาดถล่มเหนือสำนัก (' + activeTribs.length + ' คน)</b></div></div>';
        activeTribs.forEach(tr => {
          h += '<div style="margin-top:4px;padding-top:4px;border-top:1px dotted var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">' +
            '<div><b>' + esc(tr.npcNameTh) + '</b> <span class="chip g">' + esc(tr.pathStyleNameTh) + '</span> <span class="chip b">' + esc(tr.boltLabelTh) + '</span><div class="muted" style="font-size:11px">' + esc(tr.phaseTh) + ' (ทิค ' + tr.elapsedTicks + '/' + tr.totalTicks + ')</div></div>' +
            '<button type="button" class="btn pri" style="padding:3px 9px;font-size:11px" data-do="focus-tribulation" data-arg="' + esc(tr.npcId) + '">⚡ ส่องดูทัณฑ์สวรรค์</button></div>';
        });
        h += '</div>';
      }
      h += renderSubTabBar('set-sect-subtab', sSub, sectSubTabs, 'หมวดย่อยภาพรวมสำนัก');
      let hCore = '', hCouncil = '', hPeaksArray = '', hLineage = '', hDao = '', hVisuals = '';
      h += '<div class="subcat-pane" data-subcat="CORE"' + ((sSub === 'ALL' || sSub === 'CORE') ? '' : ' style="display:none"') + '>';
      if (S.queue && S.queue.length) {
        h += '<h3>🚪 ผู้สมัครรอหน้าประตู (' + S.queue.length + '/' + (SECT.MAX_QUEUE || 6) + ')</h3><div class="card">' + S.queue.map(q => {
          const ca = SECT.observableCapability ? SECT.observableCapability(W, q) : { summaryTh: 'พื้นฐานทั่วไป' };
          return '<div class="sub" style="padding:3px 0;border-bottom:1px dotted var(--line)"><b>' + esc(q.h.name.given) + '</b> · ' + esc(q.h.origin.cls) + ' จาก' + esc(q.h.origin.region) + ' · รอมา ' + (W.day - q.joinDay) + ' วัน<br><span class="muted">การประเมินเบื้องต้น (CA): ' + esc(ca.summaryTh) + '</span></div>';
        }).join('') + '<div class="sub" style="margin-top:4px">' + (SECT.holder(W, 'registry') ? 'ผู้อาวุโสหอทะเบียนเป็นผู้พิจารณา' : 'เจ้าสำนักเป็นผู้พิจารณาเอง') + ' (ประเมินจากรูปลักษณ์และทักษะที่สังเกตได้ ไม่ทราบพรสวรรค์ซ่อนเร้น)</div></div>';
      }
      h += '<h3>จำนวนตามระดับ</h3><div class="card">' + SECT.RANKS.slice().reverse().map(r => '<span class="chip" style="border-color:' + r.color + '">' + r.nameTh + ' ' + byRank[r.id] + '</span>').join('') + '</div>';
      const cult = Object.fromEntries(Object.keys(CULT.PATHS).map(k => [k, 0])); cult.none = 0;
      alive.forEach(n => { const k = n.cult && cult[n.cult.path] != null ? n.cult.path : 'none'; cult[k]++; });
      h += '<h3>วิถีที่เดิน (' + Object.keys(CULT.PATHS).length + ' วิถีหลัก)</h3><div class="card">' + Object.values(CULT.PATHS).map(p => '<span class="chip">' + esc(p.shortTh || p.nameTh) + ' ' + cult[p.id] + '</span>').join('') + '<span class="chip">ปุถุชน ' + cult.none + '</span></div>';
      if (SECT.governanceSummary) { const gov = SECT.governanceSummary(W); h += '<div class="card">การบริหารสำนัก: ลดค่าดูแล ' + Math.round((gov.upkeepReduction || 0) * 100) + '% · ประสิทธิภาพก่อสร้างเพิ่ม ' + Math.round((gov.constructionSpeedBonus || 0) * 100) + '%</div>'; }
      if (SECT.evaluateSectTier && SECT.evaluateSectAlignment) {
        const tierInfo = SECT.evaluateSectTier(W, { readOnly: true });
        const alignInfo = SECT.evaluateSectAlignment(W, { readOnly: true });
        const polState = S.internalPolitics || { undercurrent: 8, undercurrentLabelTh: 'คลื่นลมสงบ' };
        h += '<h3>🏯 ระดับชั้นสำนักในยุทธภพ (6 ระดับ) & จุดยืนอุดมการณ์</h3><div class="card">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
        h += '<div><span class="chip g">👑 ' + esc(tierInfo.badgeTh) + '</span> <span class="chip b">' + esc(alignInfo.icon + ' ' + alignInfo.fullTh) + '</span> <span class="chip">🌊 คลื่นใต้น้ำ: ' + Math.round(polState.undercurrent || 0) + '/100</span></div>';
        h += '<div class="muted">คะแนนศักดาสำนัก: <b>' + tierInfo.score + '</b>' + (tierInfo.nextTierNameTh && tierInfo.nextMinScore > tierInfo.score ? (' (เป้าหมายถัดไป: ' + esc(tierInfo.nextTierNameTh) + ' ที่ ' + tierInfo.nextMinScore + ' คะแนน)') : ' (ระดับสูงสุดของสายปัจจุบัน)') + '</div>';
        h += '</div>';
        if (tierInfo.cappedByNeutralAlignment) {
          h += '<div class="muted" style="margin-top:4px;color:#ffd166">⚠️ ' + esc(tierInfo.capReasonTh) + '</div>';
        }
        h += '<div class="muted" style="margin-top:4px">ลำดับชั้นยุทธภพ 6 ระดับ: <b>สำนักเล็ก → สำนักทั่วไป/มาตรฐาน → สำนักใหญ่ → สำนักชั้นนำ → สำนักมหาอำนาจ → แดนศักดิ์สิทธิ์</b> (สำนักสายกลางไม่มีระดับผู้นำสูงสุด/แดนศักดิ์สิทธิ์)</div>';
        h += '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">';
        h += '<button class="btn" data-do="declare-sect-alignment" data-arg="RIGHTEOUS">☀️ ประกาศจุดยืนฝ่ายธรรมะ</button>';
        h += '<button class="btn" data-do="declare-sect-alignment" data-arg="NEUTRAL">☯️ รักษาจุดยืนสายกลาง (อิสระ)</button>';
        h += '<button class="btn dan" data-do="declare-sect-alignment" data-arg="DEMONIC">🩸 ประกาศจุดยืนฝ่ายอธรรม</button>';
        h += '<button class="btn pri" data-do="evaluate-elder-ascensions" title="จัดสอบคัดเลือกศิษย์สายในและประเมินศิษย์อาวุโสขึ้นเป็นผู้อาวุโสกิตติมศักดิ์">🎖️ ประเมินเลื่อนขั้นผู้อาวุโสกิตติมศักดิ์</button>';
        h += '<button class="btn ok" data-do="pay-office-stipends" title="จ่ายเบี้ยหวัดโบนัสพิเศษรายเดือนแก่ขุนนาง (+8 ความพอใจ, +20% ประสิทธิภาพ)">💰 จ่ายเบี้ยหวัดเสริมขุนนาง</button>';
        h += '</div></div>';
        if (SECT.TOTEMS_BLOODLINES) {
          const totSt = SECT.TOTEMS_BLOODLINES.ensure(W);
          const actTots = (totSt && totSt.activeTotems) || [];
          h += '</div><div class="subcat-pane" data-subcat="PEAKS_ARRAY"' + ((sSub === 'ALL' || sSub === 'PEAKS_ARRAY') ? '' : ' style="display:none"') + '><h3>🏛️ เสาโทเท็มพิทักษ์สำนัก 4 ทิศ & ♨️ สระชำระไขกระดูกบรรพกาล</h3><div class="card">';
          h += '<div class="muted" style="font-size:11.5px;margin-bottom:6px">เสาโทเท็มที่เปิดใช้งานแล้ว (' + actTots.length + '/4 ต้น): มอบโบนัสสเตตัสถาวรแก่ศิษย์ทุกคนในสำนักและคงอยู่ข้ามการบันทึกเกม</div>';
          h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
          Object.values(SECT.TOTEMS_BLOODLINES.TOTEM_CATALOG).forEach(tSpec => {
            const isBuilt = actTots.includes(tSpec.id);
            h += '<button class="btn ' + (isBuilt ? 'ok' : 'pri') + '" style="padding:3px 8px;font-size:11px" data-do="erect-totem-pillar" data-arg="' + esc(tSpec.id) + '">🏛️ ' + (isBuilt ? '✓ ' : 'สร้าง') + esc(tSpec.nameTh) + '</button>';
          });
          h += '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="cleanse-marrow-pool" data-arg="' + esc(m ? m.id : '') + '">♨️ สระชำระไขกระดูก (Lv.' + ((totSt && totSt.marrowPoolLevel) || 1) + ')</button>';
          h += '</div></div>';
        }
        if (SECT.AUTOMATION) {
          const autoPol = SECT.AUTOMATION.ensure(W);
          const alertsObj = SECT.AUTOMATION.getExecutiveAlerts(W);
          h += '</div><div class="subcat-pane" data-subcat="CORE"' + ((sSub === 'ALL' || sSub === 'CORE') ? '' : ' style="display:none"') + '><h3>⚙️ ศูนย์บัญชาการอัตโนมัติและการแจ้งเตือนเจ้าสำนัก (Executive QoL Dashboard)</h3><div class="card">';
          h += '<div class="muted" style="font-size:11.5px;margin-bottom:6px">แจ้งเตือนด่วน: คอขวดตบะ ' + alertsObj.bottleneckCount + ' คน · คดีหอวินัยค้าง ' + alertsObj.pendingTribunalCases + ' คดี · เสาค่ายกลชำรุด ' + alertsObj.damagedLeylineAnchors + ' ต้น</div>';
          h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">';
          [
            ['enabled', 'ระบบช่วยบริหารอัตโนมัติ'],
            ['autoAssignNewDisciplesToPeaks', 'จัดสรรศิษย์ใหม่เข้ายอดเขาอัตโนมัติ'],
            ['autoDistributeBreakthroughPills', 'แจกโอสถทะลวงด่านอัตโนมัติ'],
            ['autoRepairLeylines', 'ซ่อมแซมเสาค่ายกลปฐพีอัตโนมัติ'],
            ['autoTriggerClosedDoorOnBottleneck', 'สั่งกักตนปิดด่านเมื่อติดคอขวดอัตโนมัติ']
          ].forEach(([rk, labelTh]) => {
            const on = !!(autoPol && autoPol[rk]);
            h += '<button class="btn ' + (on ? 'ok' : '') + '" style="padding:3px 8px;font-size:11px" data-do="toggle-automation-rule" data-arg="' + esc(rk) + '">' + (on ? '✓ ' : '○ ') + esc(labelTh) + '</button>';
          });
          h += '</div>';
          if (SECT.TRIBUNAL) {
            const tb = SECT.TRIBUNAL.ensure(W);
            const firstCaseId = (tb && tb.activeCases[0] && tb.activeCases[0].id) || 'CASE_1';
            h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">';
            h += '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="tribunal-adjudicate" data-arg="' + esc(firstCaseId + '|MERIT_FINE_AND_PENANCE') + '">⚖️ ศาลหอวินัยตัดสินคดี (' + ((tb && tb.activeCases.length) || 0) + ')</button>';
            h += '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="assign-leyline-guard" data-arg="ANCHOR_NORTH_PEAK|">🛡️ ส่งผู้คุ้มกันเสาปฐพี</button>';
            h += '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="repair-leyline-anchor" data-arg="ANCHOR_NORTH_PEAK">🔧 ซ่อมแซมเสาค่ายกลปฐพี</button>';
            h += '<button class="btn dan" style="padding:3px 8px;font-size:11px" data-do="resolve-defector-ultimatum" data-arg="PROTECT_AND_FIGHT">⚔️ ปกป้องศิษย์แปรพักตร์</button>';
            h += '<button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="recharge-elemental-barrier" data-arg="100">🛡️ เสริมม่านพลังสำนัก 5 ธาตุ</button>';
            h += '<button class="btn ok" style="padding:3px 8px;font-size:11px" data-do="invoke-founder-phantom">👻 อัญเชิญเจตจำนงบูรพาจารย์</button>';
            h += '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="resolve-faction-schism" data-arg="NEGOTIATE">🏛️ คลี่คลายวิกฤตกบฏก๊ก</button>';
            h += '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="dispatch-exchange-disciple">🎓 ส่งศิษย์แลกเปลี่ยนข้ามสำนัก</button>';
            h += '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="claim-bounty-hunt">🎯 ล่าค่าหัวโรงเตี๊ยม</button>';
            h += '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="bid-black-market">🌙 ประมูลลับตลาดมืด</button>';
            h += '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="brew-multiphase-pill">⚗️ หลอมโอสถสองระยะ</button>';
            h += '<button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="excavate-immortal-tomb">🏛️ ขุดค้นสุสานเซียน 3 ชั้น</button>';
            h += '<button class="btn dan" style="padding:3px 8px;font-size:11px" data-do="advance-world-crisis" data-arg="ORTHODOX">🌌 ตัดสินใจวิกฤตยุทธภพ</button>';
            h += '<button class="btn ok" style="padding:3px 8px;font-size:11px" data-do="establish-outpost" data-arg="MINE_CELESTIAL_STONE|CAMP_REST">⛺ ตั้งค่ายพักยุทธศาสตร์</button>';
            h += '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="dispatch-supply-convoy" data-arg="MINE_CELESTIAL_STONE">🐪 ส่งขบวนเสบียงค่ายพัก</button>';
            h += '<button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="enact-sect-charter" data-arg="CHARTER_BROTHERHOOD_SANCTUARY">📜 สถาปนาธรรมนูญสำนัก</button>';
            h += '<button class="btn ok" style="padding:3px 8px;font-size:11px" data-do="convene-strategic-council">👑 ประชุมสภา 6 ขุนนาง</button>';
            h += '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="resolve-council-agenda" data-arg="FORTIFY_LOGISTICS">⚖️ เคาะมติสภายุทธศาสตร์</button>';
            h += '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="explore-micro-location" data-arg="LOC_NAMELESS_SWORD_TOMB">🧭 สำรวจจุดสำรวจย่อย</button>';
            h += '</div>';
          }
          h += '</div>';
        }
      }
      h += '</div><div class="subcat-pane" data-subcat="COUNCIL"' + ((sSub === 'ALL' || sSub === 'COUNCIL') ? '' : ' style="display:none"') + '>';
      if (SECT.CHARTER_DOCTRINE && SECT.STRATEGIC_COUNCIL && SECT.OUTPOSTS_LOGISTICS) {
        const ch = SECT.CHARTER_DOCTRINE.ensure(W);
        const sc = SECT.STRATEGIC_COUNCIL.ensure(W);
        const op = SECT.OUTPOSTS_LOGISTICS.ensure(W);
        const opList = Object.values((op && op.byNodeId) || {});
        h += '<h3>📜 ธรรมนูญสำนัก · 👑 สภา 6 ขุนนาง & ⛺ เครือข่ายค่ายพักหน้าด่าน (v4.0.0)</h3><div class="card">';
        h += '<div><b>ธรรมนูญปัจจุบัน:</b> <span class="chip g">' + esc((ch.icon || '📜') + ' ' + (ch.nameTh || ch.activeDoctrine)) + '</span> <span class="muted">โบนัสความภักดี +' + (ch.loyaltyBonus || 10) + ' · ประกาศใช้วันที่ ' + (ch.adoptedDay || 1) + '</span></div>';
        h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:5px">' + Object.values(SECT.CHARTER_DOCTRINE.DOCTRINES).map(d => '<button class="btn' + (ch.activeDoctrine === d.id ? ' pri' : '') + '" style="padding:2px 7px;font-size:10.5px" data-do="enact-sect-charter" data-arg="' + esc(d.id) + '">' + esc(d.icon + ' ' + d.nameTh) + '</button>').join('') + '</div>';
        h += '<div style="margin-top:6px;padding-top:6px;border-top:1px dotted var(--line,#3a3f4a)"><b>⛺ ค่ายพักยุทธศาสตร์ (' + opList.length + ' แห่ง):</b> ' + (opList.length ? opList.map(o => '<span class="chip ok">' + esc(o.icon + ' ' + o.nameTh + ' (ข้าว ' + o.grainStock + '/โอสถ ' + o.pillStock + ' · ขวัญ ' + o.morale + '%)') + '</span>').join(' ') : '<span class="muted">ยังไม่ได้ตั้งค่ายพักหน้าด่าน</span>') + '</div>';
        if (sc && sc.activeSession) {
          h += '<div style="margin-top:6px;padding-top:6px;border-top:1px dotted var(--line,#3a3f4a)"><b>👑 รายงานสภา 6 ขุนนาง:</b> <span class="muted">' + esc(sc.activeSession.threatSummaryTh || '') + '</span></div>';
        }
        h += '</div>';
      }
      h += '</div><div class="subcat-pane" data-subcat="LINEAGE"' + ((sSub === 'ALL' || sSub === 'LINEAGE') ? '' : ' style="display:none"') + '>';
      if (SECT.ensureCompanionsAndBloodlines) {
        SECT.ensureCompanionsAndBloodlines(W);
        const comps = S.companions || [];
        const offs = S.offspring || [];
        h += '<h3>💞 ทำเนียบคู่บำเพ็ญ & สายเลือดตระกูลทายาทรุ่นถัดไป (' + comps.length + ' คู่ · ทายาท ' + offs.length + ' คน)</h3><div class="card">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div>คู่บำเพ็ญในสำนักได้รับโบนัสสะสมตบะ <b>+25%</b> ลดโอกาสธาตุไฟเข้าแทรก และให้กำเนิดทายาทสืบทอดรากปราณ/วิชาพ่อแม่</div><div style="display:flex;gap:5px;flex-wrap:wrap"><button class="btn pri" style="padding:3px 9px;font-size:11.5px" data-do="bind-taoist-companions">💞 จัดพิธีผูกวาสนาคู่บำเพ็ญ</button><button class="btn" style="padding:3px 9px;font-size:11.5px" data-do="spawn-companion-offspring">👶 ให้กำเนิดทายาทสายเลือด</button></div></div>';
        if (comps.length) {
          h += '<div style="margin-top:6px">' + comps.slice(0, 6).map(c => '<div style="padding:3px 0;border-top:1px dotted var(--line,#3a3f4a)">💞 <b>' + esc(c.partnerANameTh) + ' ♥ ' + esc(c.partnerBNameTh) + '</b> <span class="chip ok">ฝึกปราณคู่ +' + Math.round((c.synergyBonus || 0.25) * 100) + '%</span> <span class="muted">(ผูกวาสนาวันที่ ' + c.marriedDay + ' · ทายาท ' + ((c.childrenIds && c.childrenIds.length) || 0) + ' คน)</span></div>').join('') + '</div>';
        }
        if (offs.length) {
          h += '<div style="margin-top:6px">' + offs.slice(0, 6).map(ch => {
            const bl = ch.bloodlineTrait || {};
            return '<div style="padding:3px 0;border-top:1px dotted var(--line,#3a3f4a)">👶 <b>' + esc(ch.nameTh) + '</b> <span class="chip g">' + esc(bl.nameTh || ('ตระกูล' + ch.sur)) + '</span> <span class="muted">(บุตรของ ' + esc(ch.parentANameTh) + ' & ' + esc(ch.parentBNameTh) + ' · อายุ ' + (ch.ageYears || 15) + ' ปี · ตบะ +' + Math.round((bl.cultRateBonus || 0.18) * 100) + '%)</span></div>';
          }).join('') + '</div>';
        }
        h += '</div>';
      }
      const ults = (W.world && Array.isArray(W.world.extraditionUltimatums)) ? W.world.extraditionUltimatums.filter(u => u && u.status === 'PENDING') : [];
      const renegades = alive.filter(n => n && n.renegadeOrigin);
      if (ults.length || renegades.length) {
        h += '<h3>📜 สารทวงตัวผู้ลี้ภัยข้ามสำนัก & ศึกทวงคืนบัลลังก์สำนักเดิม</h3><div class="card" style="border-color:var(--gold)">';
        if (ults.length) {
          h += ults.map(u => '<div style="padding:5px 0;border-bottom:1px dotted var(--line,#3a3f4a)"><b>📜 ' + esc(u.titleTh) + '</b><div class="muted" style="font-size:11.5px;margin-top:2px">' + esc(u.descTh) + '</div><div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="resolve-extradition" data-arg="' + esc(u.id) + '|DEFY_PROTECT">🛡️ ปกป้องศิษย์ถึงที่สุด (ซาบซึ้ง +50 / ภักดี 100%)</button><button class="btn" style="padding:3px 8px;font-size:11px" data-do="resolve-extradition" data-arg="' + esc(u.id) + '|INDEMNITY_SETTLEMENT">💎 ไถ่ตัวด้วยศิลาวิญญาณ (' + u.indemnityStones + ' ก้อน)</button><button class="btn dan" style="padding:3px 8px;font-size:11px" data-do="resolve-extradition" data-arg="' + esc(u.id) + '|EXTRADITE_RENEGADE">⛓️ ส่งตัวผู้ลี้ภัยคืนสำนักเดิม</button></div></div>').join('');
        }
        if (renegades.length) {
          h += '<div style="margin-top:4px">' + renegades.map(rn => {
            const ro = rn.renegadeOrigin || {};
            const stg = (rn.cult && rn.cult.stage) || 1;
            const canReclaim = stg >= 5 && ro.pursuitStatus !== 'RECLAIMED_THRONE';
            return '<div style="padding:4px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div>🗡️ <b>' + esc(HC.fullName(rn)) + '</b> <span class="chip b">' + esc(ro.formerPostTh || 'อดีตศิษย์ลี้ภัย') + ' · ' + esc(ro.sectNameTh || '') + '</span> <span class="muted">(ขั้น ' + stg + ' · สถานะ: ' + esc(ro.pursuitStatus || 'PROTECTED') + ' · ความซาบซึ้ง ' + (ro.gratitude || 0) + ')</span></div>' +
              (ro.pursuitStatus === 'RECLAIMED_THRONE' ? '<span class="chip ok">👑 ทวงคืนบัลลังก์สำเร็จ (พันธมิตรนิรันดร์)</span>' : '<button class="btn ' + (canReclaim ? 'pri' : '') + '" style="padding:3px 8px;font-size:11px" data-do="launch-vendetta-reclamation" data-arg="' + esc(rn.id) + '">🔥 เปิดศึกทวงคืนสำนัก「' + esc(ro.sectNameTh || 'เดิม') + '」</button>') + '</div>';
          }).join('') + '</div>';
        }
        h += '</div>';
      }
      if (SECT.MENTORSHIP && SECT.MENTORSHIP.ensure) {
        const ms = SECT.MENTORSHIP.ensure(W);
        const hArts = Array.isArray(ms.heritageArts) ? ms.heritageArts : [];
        const activePairs = alive.filter(x => x.mentorId && W.byId[x.mentorId] && !W.byId[x.mentorId].dead).length;
        h += '<h3>🎓 สายสืบทอดอาจารย์-ศิษย์ & วิชาประจำสำนัก (' + hArts.length + '/6 เล่ม)</h3><div class="card">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div>คู่ศิษย์-อาจารย์สายตรงในสำนัก: <b>' + activePairs + ' คู่</b> · การชี้แนะสะสม <b>' + (ms.totalCoachings || 0) + ' ครั้ง</b> · พิธีถ่ายทอดปราณ <b>' + (ms.totalTransmissions || 0) + ' ครั้ง</b></div><button class="btn pri" style="padding:4px 10px;font-size:11.5px" data-do="synthesize-sect-art" data-arg="' + m.id + '">📜 บัญญัติวิชาประจำสำนัก</button></div>';
        if (hArts.length) {
          h += '<div style="margin-top:6px">' + hArts.map(a => {
            const edName = a.editionNameTh || 'ฉบับร่างก่อตั้ง';
            const anns = Array.isArray(a.annotations) ? a.annotations : [];
            return '<div style="padding:4px 0;border-top:1px dotted var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div><span class="chip g">★ มรดกสำนัก T' + (a.tier || 5) + '</span> <b>' + esc(a.nameTh) + '</b> <span class="chip b">' + esc(edName) + '</span> <span class="muted">(ผู้บัญญัติ: ' + esc(a.creatorNameTh || '-') + ' · ขัดเกลาแล้ว ' + anns.length + ' รุ่น)</span><div class="muted" style="font-size:11px">' + esc(a.descTh || '') + (anns.length ? (' · ล่าสุด: ' + esc(anns[anns.length - 1].noteTh)) : '') + '</div></div><button class="btn" style="padding:2px 8px;font-size:11px" data-do="annotate-heritage-sutra" data-arg="' + esc(a.id) + '">📜 เขียนอรรถาธิบายรุ่นถัดไป</button></div>';
          }).join('') + '</div>';
        } else {
          h += '<div class="muted" style="margin-top:4px">ยังไม่มีวิชาที่สำนักบัญญัติขึ้นเอง — เจ้าสำนักหรือผู้อาวุโสขั้น 4 ขึ้นไปสามารถผสาน 2 วิชาเพื่อบัญญัติคัมภีร์มรดกประจำสำนักเข้าหอคัมภีร์ได้</div>';
        }
        h += '</div>';
      }
      h += '</div><div class="subcat-pane" data-subcat="PEAKS_ARRAY"' + ((sSub === 'ALL' || sSub === 'PEAKS_ARRAY') ? '' : ' style="display:none"') + '>';
      if (SECT.PEAKS) {
        SECT.PEAKS.ensure(W);
        const foundedPeaks = SECT.PEAKS.getVisibleFoundedPeaks(W);
        const independents = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== W.sect.masterId && !n.peakId);
        const unappointedElders = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && (n.rank === 4 || n.isElder) && !n.post && n.id !== W.sect.masterId && n.id !== W.sect.deputyId);
        h += '<h3>⛰️ ระบบหุบเขาและ 8 ยอดเขาประจำสำนัก (ก่อตั้งแล้ว ' + foundedPeaks.length + '/8 ยอดเขา · ศิษย์ไร้สังกัด ' + independents.length + ' คน)</h3>';
        h += '<div class="card" style="border-color:var(--gold)">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div>บริหารจัดการทั้ง 8 ยอดเขา แต่งตั้งประธานยอดเขา โยกย้ายศิษย์เข้าสังกัด ตั้งนโยบายแจกโอสถ และจัดศึกประลองยอดเขาได้ในหน้าต่างเฉพาะ</div><div style="display:flex;gap:5px;flex-wrap:wrap">' +
          '<button class="btn pri" style="padding:4px 10px;font-size:11.5px" data-do="open-sect-peaks" data-arg="OVERVIEW">⛰️ เปิดหน้าต่างบริหารหุบเขา/ยอดเขา</button>' +
          '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="scan-and-found-peaks">🏔️ ตรวจสอบยอดเขาครบเกณฑ์</button>' +
          '<button class="btn ok" style="padding:3px 8px;font-size:11px" data-do="open-sect-peaks" data-arg="TOURNAMENT">🏆 ศึกประลองยอดเขา</button>' +
          '</div></div>';
        if (foundedPeaks.length) {
          h += '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">' + foundedPeaks.map(p => '<span class="chip g" style="cursor:pointer" data-do="open-sect-peaks" data-arg="' + esc(p.id) + '">' + esc(p.icon || '⛰️') + ' ' + esc(p.shortTh || p.nameTh) + ' (' + ((p.memberIds && p.memberIds.length) || 0) + ' คน · เจ้าหุบเขา: ' + esc(p.masterNameTh || '-') + ')</span>').join('') + '</div>';
        }
        if (unappointedElders.length) {
          h += '<div style="margin-top:5px;font-size:11px" class="muted">🎖️ ผู้อาวุโสสำนักไร้ตำแหน่งบริหาร (' + unappointedElders.length + ' คน): ' + unappointedElders.slice(0, 6).map(eNpc => esc(HC.fullName(eNpc))).join(', ') + '</div>';
        }
        h += '</div>';
      }
      {
        const curPrev = (UI.G && UI.G.R && UI.G.R.opts && UI.G.R.opts.celestialPreview) || 'AUTO';
        const shaders = (g.Render && g.Render.CELESTIAL_SHADERS) ? Object.values(g.Render.CELESTIAL_SHADERS) : [];
        h += '</div><div class="subcat-pane" data-subcat="VISUALS"' + ((sSub === 'ALL' || sSub === 'VISUALS') ? '' : ' style="display:none"') + '><h3>✨ ศูนย์ควบคุมกราฟิกเซียนยุคที่ 5 (Era 5 Grand Celestial Visuals v5.0.0)</h3><div class="card" style="border-color:var(--gold);background:rgba(255,215,64,0.05)">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div><b>ทัศนียภาพฟ้าดิน (Celestial Phenomenon Shader):</b> เลือกชมบรรยากาศแสงสีและปรากฏการณ์ฟ้าดินเหนือสำนักได้ทันที</div><button class="btn pri" style="padding:3px 9px;font-size:11.5px" data-do="cycle-celestial-preview">🌌 สลับปรากฏการณ์ฟ้าดิน</button></div>';
        if (shaders.length) {
          h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">' + shaders.map(sh => '<button class="btn' + (curPrev === sh.id ? ' ok' : '') + '" style="padding:3px 8px;font-size:11px" data-do="cycle-celestial-preview" data-arg="' + esc(sh.id) + '">' + esc(sh.icon + ' ' + sh.nameTh) + '</button>').join('') + '</div>';
        }
        const curCer = (UI.G && UI.G.R && UI.G.R.opts && UI.G.R.opts.ceremonyPreview) || 'AUTO';
        const ceremonies = (g.Render && g.Render.CEREMONY_PRESETS) ? Object.values(g.Render.CEREMONY_PRESETS) : [];
        if (ceremonies.length) {
          h += '<div style="margin-top:8px;padding-top:6px;border-top:1px dotted var(--line,#3a3f4a)"><b>🎎 ฉากคัตซีนพิธีกรรม & สนามประลองยุทธ์บนแผนที่ (v5.1.0):</b></div>';
          h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px">' + ceremonies.map(cm => '<button class="btn' + (curCer === cm.id ? ' pri' : '') + '" style="padding:3px 8px;font-size:11px" data-do="cycle-ceremony-preview" data-arg="' + esc(cm.id) + '">' + esc(cm.icon + ' ' + cm.nameTh) + '</button>').join('') + '</div>';
          h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px"><button class="btn ok" style="padding:3px 8px;font-size:11px" data-do="focus-plaza-ceremony" data-arg="BANQUET">🎆 ส่องกล้องชมพลุลานแปดทิศ</button><button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="focus-martial-arena">🏆 ส่องกล้องชมเวทีประลองยุทธ์</button></div>';
          h += '<div style="margin-top:8px;padding-top:6px;border-top:1px dotted var(--line,#3a3f4a)"><b>⚡ ทัณฑ์สวรรค์ 3 จังหวะ & 15 เอฟเฟกต์วิชาเฉพาะตัว (v5.3.0):</b></div>';
          h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px">' +
            '<button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="start-tribulation-ritual" data-arg="' + esc(m ? m.id : '') + '">⛈️ อัญเชิญทัณฑ์สวรรค์ทะลวงด่าน</button>' +
            '<button class="btn ok" style="padding:3px 8px;font-size:11px" data-do="focus-tribulation" data-arg="' + esc(m ? m.id : '') + '">⚡ ส่องดูทัณฑ์สวรรค์</button>' +
            '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="preview-signature-vfx" data-arg="' + esc((m ? m.id : '') + '|sig_meteor_sword_rain') + '">☄️ ทดสอบเอฟเฟกต์วิชาเฉพาะตัว</button>' +
            '<button class="btn ok" style="padding:3px 8px;font-size:11px" data-do="demo-qinggong-flight" data-arg="' + esc(m ? m.id : '') + '">🗡️ ทดสอบวิชาตัวเบา/ขี่กระบี่บิน</button>' +
            '<button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="demo-mantra-resonance" data-arg="' + esc(m ? m.id : '') + '">☯️ สำแดงคัมภีร์ปราณบ่มเพาะ</button>' +
            '</div>';
          if (SECT.FORMATION_WARFARE) {
            const fw = SECT.FORMATION_WARFARE.ensure(W);
            const curW = (W.weather && (W.weather.kind || W.weather)) || 'clear';
            h += '<div style="margin-top:8px;padding-top:6px;border-top:1px dotted var(--line,#3a3f4a)"><b>🏯 มหาค่ายกลพิทักษ์สำนัก 3 รูปแบบ & ปรากฏการณ์ฟ้าดินหนุนคัมภีร์ปราณ (v5.5.0):</b></div>';
            h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px">' +
              Object.values(SECT.FORMATION_WARFARE.STANCES).map(fs => '<button class="btn' + (fw.activeStance === fs.id ? ' pri' : '') + '" style="padding:3px 8px;font-size:11px" data-do="set-sect-formation-stance" data-arg="' + esc(fs.id) + '">' + esc(fs.icon + ' ' + fs.shortTh) + '</button>').join('') +
              '</div>';
            h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px">' +
              Object.values(SECT.FORMATION_WARFARE.WEATHER_PHENOMENA).map(wp => '<button class="btn' + (curW === wp.id ? ' ok' : '') + '" style="padding:2px 7px;font-size:10.5px" data-do="set-sect-weather-phenomenon" data-arg="' + esc(wp.id) + '">' + esc(wp.icon + ' ' + wp.nameTh) + '</button>').join('') +
              '</div>';
          }
          if (CULT.SUPPORT_ARTS) {
            h += '<div style="margin-top:8px;padding-top:6px;border-top:1px dotted var(--line,#3a3f4a)"><b>🎶 คำสั่งฉุกเฉินวิชาสายสนับสนุน & อาคารสำนัก (Support & Facility Synergy v5.7.0):</b></div>';
            h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px">' +
              '<button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="trigger-sect-emergency-support" data-arg="ZITHER_PURGE_HEART_DEMON">🎶 บรรเลงคีตเวทย์สลายจิตมารทั้งสำนัก</button>' +
              '<button class="btn ok" style="padding:3px 8px;font-size:11px" data-do="trigger-sect-emergency-support" data-arg="INFIRMARY_ACUPOINT_HEAL">🪡 ระดมเข็มทองสมานแผลหอพยาบาล</button>' +
              '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="trigger-sect-emergency-support" data-arg="QIMEN_BANNER_RALLY">🚩 ชูธงรบฉีเหมินปลุกขวัญทั้งสำนัก</button>' +
              '</div>';
          }
          if (SECT.FORBIDDEN_VAULT) {
            const fv = SECT.FORBIDDEN_VAULT.ensure(W);
            h += '<div style="margin-top:8px;padding-top:6px;border-top:1px dotted var(--line,#3a3f4a)"><b>🩸 หอผนึกคัมภีร์ต้องห้าม & แท่นสังเวยโลหิตบรรพกาล (Forbidden Vault & Blood Altar v5.8.0):</b></div>';
            h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px">' +
              Object.values(SECT.FORBIDDEN_VAULT.POLICIES).map(pol => '<button class="btn' + (fv.policy === pol.id ? (pol.id === 'UNRESTRICTED_BLOOD_CULT' ? ' dan' : ' pri') : '') + '" style="padding:3px 8px;font-size:11px" data-do="set-sect-forbidden-policy" data-arg="' + esc(pol.id) + '">' + esc(pol.icon + ' ' + pol.shortTh) + '</button>').join('') +
              '</div>';
            h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px">' +
              '<button class="btn dan" style="padding:3px 8px;font-size:11px" data-do="perform-forbidden-altar-ritual" data-arg="AWAKEN_BLOODLINE_ALTAR">🩸 ปลุกสายเลือดบรรพกาลบนแท่นสังเวย</button>' +
              '<button class="btn ok" style="padding:3px 8px;font-size:11px" data-do="perform-forbidden-altar-ritual" data-arg="PURIFY_TABOO_BACKLASH">🪷 พิธีชำระล้างปราณต้องห้ามและคลายชีพจร</button>' +
              '</div>';
          }
        }
        h += '</div>';
      }
      h += '</div><div class="subcat-pane" data-subcat="PEAKS_ARRAY"' + ((sSub === 'ALL' || sSub === 'PEAKS_ARRAY') ? '' : ' style="display:none"') + '>';
      if (SECT.FENG_SHUI) {
        const fs = SECT.FENG_SHUI.ensure(W);
        const ga = fs.activeGrandArray;
        const ph = fs.celestialPhenomenon;
        h += '<h3>☯️ ค่ายกลฮวงจุ้ยเส้นชีพจรปราณ 8+2 & มหาค่ายกลพิทักษ์สำนัก (เกรดเฉลี่ย ' + esc(fs.sectGrade || 'B') + ' · ' + (fs.sectAverageScore || 68) + '/100)</h3><div class="card">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div>' + (ga ? ('<b>' + esc(ga.icon) + ' ' + esc(ga.nameTh) + '</b> <span class="chip ok">เดินค่ายกลโดย ' + esc(ga.activatedByNameTh) + '</span><div class="muted" style="font-size:11.5px">' + esc(ga.descTh) + '</div>') : '<span class="muted">ยังไม่ได้ผสานมหาค่ายกล 5 อาคารหลัก — ให้เจ้าหอค่ายกลปรับจูนอาคารหรือกดเปิดเดินค่ายกลใหญ่</span>') + '</div><div style="display:flex;gap:5px;flex-wrap:wrap"><button class="btn pri" style="padding:3px 9px;font-size:11.5px" data-do="attune-building-leyline" data-arg="meditation_hall|ASTRAL">☯️ ปรับจูนชีพจรปราณอาคาร</button><button class="btn" style="padding:3px 9px;font-size:11.5px" data-do="activate-grand-array">🌌 เปิดเดินมหาค่ายกลพิทักษ์สำนัก</button></div></div>';
        if (ph) {
          h += '<div style="margin-top:5px;font-size:11.5px;color:var(--gold)">' + esc(ph.icon) + ' <b>ปรากฏการณ์ฟ้าดินประจำเดือน:</b> ' + esc(ph.nameTh) + ' — ' + esc(ph.descTh) + '</div>';
        }
        h += '</div>';
      }
      h += '</div><div class="subcat-pane" data-subcat="COUNCIL"' + ((sSub === 'ALL' || sSub === 'COUNCIL') ? '' : ' style="display:none"') + '>';
      if (SECT.ELDER_COUNCIL_EDICTS) {
        const ed = SECT.ELDER_COUNCIL_EDICTS.ensure(W);
        const ag = ed.activeCliqueAgenda;
        const lastVote = (ed.councilHistory && ed.councilHistory[0]) || null;
        h += '<h3>🏛️ สภาผู้อาวุโส 4 ขั้วการเมือง · ราชโองการโควตาอัตโนมัติ & การตรวจสอบตำแหน่ง</h3><div class="card" style="border-color:var(--gold)">';
        if (ag) {
          h += '<div style="margin-bottom:6px"><b>' + esc(ag.icon || '🏛️') + ' ' + esc(ag.nameTh) + '</b> <span class="chip ' + (ag.fulfilled ? 'ok' : 'b') + '">' + (ag.fulfilled ? '✔ บรรลุวาระแล้ว' : '⏳ รอการดำเนินการ') + '</span> <span class="muted">(แกนนำ: ' + esc(ag.leaderNameTh) + ')</span><div class="muted" style="font-size:11px">' + esc(ag.descTh) + '</div></div>';
        }
        h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px">' +
          '<button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="convene-elder-council" data-arg="EXPAND_PRODUCTION_QUOTAS">🏛️ เปิดลงมติสภาผู้อาวุโส</button>' +
          '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="execute-standing-edicts">📜 เดินสายพานโควตาราชโองการ</button>' +
          '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="audit-officer-conduct">⚖️ ตรวจสอบความโปร่งใส 22 ตำแหน่ง</button>' +
          '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="host-spirit-banquet">🍲 จัดงานเลี้ยงฉลองปราณโอชา</button>' +
          '</div>';
        if (lastVote) {
          h += '<div class="muted" style="font-size:11px;border-top:1px dotted var(--line,#3a3f4a);padding-top:4px">มติสภาล่าสุด: <b>' + esc(lastVote.motionNameTh) + '</b> (' + (lastVote.passed ? 'ผ่านมติ ' : 'ถูกปัดตก ') + lastVote.ayeWeight + ':' + lastVote.nayWeight + ') — ' + esc(lastVote.effectSummaryTh) + '</div>';
        }
        h += '</div>';
      }
      h += '</div><div class="subcat-pane" data-subcat="DAO"' + ((sSub === 'ALL' || sSub === 'DAO') ? '' : ' style="display:none"') + '>';
      if (SECT.SECRET_REALM_NODES) {
        const ne = SECT.SECRET_REALM_NODES.ensure(W);
        const lastRun = ne.activeRun || (ne.history && ne.history[0]);
        h += '<h3>🧭 สำรวจโหนดแดนลับโบราณ 5 ด่าน (12 มรรคา) & บูรณะเศษคัมภีร์โบราณ (สะสม ' + (ne.ancientScrollFragments || 0) + ' ชิ้น)</h3><div class="card">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div>ส่งคณะศิษย์เดินหมากแดนลับ 5 โหนด ใช้ทักษะเฉพาะของทั้ง 12 มรรคาแก้ค่ายกล ซ่อมหุ่นเชิด สกัดสมุนไพรพิษ และสร้างสายใยผู้ช่วยชีวิต</div><div style="display:flex;gap:5px;flex-wrap:wrap">' +
          '<button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="run-secret-realm-nodes" data-arg="BALANCED">🧭 ส่งทีมลุยโหนดแดนลับ (สมดุล)</button>' +
          '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="run-secret-realm-nodes" data-arg="GREEDY">🔥 บุกทะลวงชิงมรดกลึก</button>' +
          '<button class="btn ok" style="padding:3px 8px;font-size:11px" data-do="restore-ancient-scroll">📜 บูรณะเศษคัมภีร์โบราณ</button>' +
          '</div></div>';
        if (lastRun) {
          h += '<div class="muted" style="font-size:11px;margin-top:5px">บันทึกสำรวจล่าสุด: ' + esc(lastRun.summaryTh) + '</div>';
        }
        h += '</div>';
      }
      if (SECT.HEAVENLY_DAO_DIRECTOR) {
        const hd = SECT.HEAVENLY_DAO_DIRECTOR.ensure(W);
        const rep = SECT.HEAVENLY_DAO_DIRECTOR.getPlayerArchetypeReport(W);
        h += '<h3>🌌 ผู้กำกับชะตาฟ้าดิน (Heavenly Dao Director) · วัฏจักรยุคสมัย & มุมมองผู้เล่น 4 สไตล์</h3><div class="card" style="border-color:var(--gold);background:rgba(233,205,133,0.04)">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px"><div><b>' + esc(hd.currentEra.icon || '🌌') + ' ' + esc(hd.currentEra.nameTh) + '</b> <span class="chip b">' + esc(SECT.HEAVENLY_DAO_DIRECTOR.PERSONAS[hd.persona].nameTh) + '</span> <span class="chip g">ความตึงเครียด ' + hd.tensionScore + ' · ความมั่งคั่ง ' + hd.prosperityScore + '</span></div>' +
          '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
          '<button class="btn pri" style="padding:2px 7px;font-size:10.5px" data-do="director-pulse" data-arg="IMPARTIAL_DAO|NOVEL_READER">📖 มุมมองนักอ่านนิยาย</button>' +
          '<button class="btn" style="padding:2px 7px;font-size:10.5px" data-do="director-pulse" data-arg="IMPARTIAL_DAO|WORLD_WATCHER">🌍 มุมมองเฝ้าดูโลก</button>' +
          '<button class="btn" style="padding:2px 7px;font-size:10.5px" data-do="director-pulse" data-arg="IMPARTIAL_DAO|NPC_OBSERVER">🔍 มุมมองจับตาดู NPC</button>' +
          '<button class="btn" style="padding:2px 7px;font-size:10.5px" data-do="director-pulse" data-arg="IMPARTIAL_DAO|GRAND_STRATEGIST">♟️ มุมมองนักวางแผน</button>' +
          '<button class="btn" style="padding:2px 7px;font-size:10.5px" data-do="shift-cultivation-era">🔄 เปลี่ยนยุคสมัยปราณ</button>' +
          '<button class="btn ok" style="padding:2px 7px;font-size:10.5px" data-do="exchange-jade-seal">🎴 เทียบเชิญตราหยกสำนัก</button>' +
          '</div></div>';
        h += '<div style="font-size:11.5px;margin-top:4px;line-height:1.45">' + esc(rep.activeSummaryTh) + '</div>';
        if (hd.spotlightSummaryTh) {
          h += '<div class="muted" style="font-size:11px;margin-top:3px">🌟 ' + esc(hd.spotlightSummaryTh) + '</div>';
        }
        h += '</div>';
      }
      if (S.research) h += '<h3>งานวิจัย</h3><div class="card">ตำรับระดับ ' + S.research.tier + ' ' + bar('ความคืบหน้า', S.research.progress / S.research.need * 100, { wide: true, txt: Math.round(S.research.progress / S.research.need * 100) + '%' }) + '</div>';
      if (S.tournament) h += '<div class="card">🏆 ชุมนุมประลองยุทธ์สำนัก: ' + (S.tournament.state === 'announce' ? 'ประกาศแล้ว จะเริ่มอีก ' + Math.max(0, Math.round((S.tournament.start - W.t) / 60)) + ' ชม.' : 'กำลังแข่ง เหลือ ' + (S.tournament.alive || []).length + ' คน') + '</div>';
      if (S.festival && S.festival.until > W.t) h += '<div class="card">🎎 งานเลี้ยงกำลังจัดอยู่</div>';
      h += '</div><div class="subcat-pane" data-subcat="LINEAGE"' + ((sSub === 'ALL' || sSub === 'LINEAGE') ? '' : ' style="display:none"') + '>';
      const asmHist = (S.assemblyHistory || []).slice(0, 4);
      if (asmHist.length) {
        h += '<h3>🏆 ทำเนียบแชมป์ชุมนุมยุทธ์สำนัก & ยอดเขายุทธ์</h3><div class="card">' + asmHist.map(a => {
          const brHtml = (a.brackets || []).map(b => '<div style="font-size:11.5px;padding:2px 0">• <b>' + esc(b.nameTh) + ':</b> ' + esc(b.championName) + ' <span class="chip g">' + esc(b.weaponNameTh) + ' · ' + esc(b.signatureTechName) + '</span> <span class="muted">(+' + b.cpAwarded + ' CP' + (b.rewardItemNameTh ? ' · รับ「' + esc(b.rewardItemNameTh) + '」' : '') + ')</span></div>').join('');
          return '<div style="padding:4px 0;border-bottom:1px dotted var(--line,#3a3f4a)"><div><b>ปีที่ ' + a.year + ' (วันที่ ' + a.day + ') — แชมป์เปี้ยนสูงสุด: ' + esc(a.championName) + '</b> <span class="chip b">+' + (a.fameGained || 0) + ' ชื่อเสียงสำนัก</span></div>' + brHtml + '</div>';
        }).join('') + '</div>';
      }
      const sf = (S.fallen || []).slice(-5).reverse(); if (sf.length) h += '<h3>ผู้ล่วงลับล่าสุด</h3><div class="card">' + sf.map(f => '<div class="muted">☠ ' + esc(f.name) + ' — ' + esc(f.why) + ' (' + dayStamp(f.day * 1440) + ')</div>').join('') + '</div>';
      h += '</div>';
    } else if (tab === 'policy') {
      h += '<div class="muted" style="margin-bottom:6px">นโยบายของสำนักคือผลรวมของ <b>ตัวตนเจ้าสำนัก 78% · รองเจ้าสำนัก 14% · ผู้อาวุโส 8%</b> และค่อย ๆ เปลี่ยนไปเดือนละ 20% เมื่อเปลี่ยนผู้นำ</div><h3>ท่าทีของสำนักตอนนี้</h3><div class="card">';
      Object.keys(SECT.POLICY_TH).forEach(k => { h += bar(SECT.POLICY_TH[k], S.policy[k], { wide: true, txt: SECT.policyLabel(k, S.policy[k]), color: '#4fb2f2' }); });
      h += '</div><h3>สิ่งที่สำนักให้ความสำคัญ</h3><div class="card">';
      Object.keys(SECT.FOCUS_TH).forEach(k => { h += bar(SECT.FOCUS_TH[k], S.policy.focus[k] * 100, { wide: true, txt: Math.round(S.policy.focus[k] * 100) + '%', color: '#b58cf0' }); });
      h += '</div><h3>นิสัยเจ้าสำนักที่ส่งผล</h3><div class="card">';
      ['ambition', 'discipline', 'empathy', 'integrity', 'caution', 'courage', 'pride', 'rationality'].forEach(k => { h += bar(HC.nameOf('personality.' + k), HC.eff(m, 'personality.' + k), { wide: true }); }); h += '</div>';
      const tr = SECT.holder(W, 'treasury') || m;
      const merVal = Math.round(S.policy.meritocracy);
      h += '<h3>การจัดสรรสวัสดิการและการบริหารทรัพยากร</h3><div class="card">';
      h += bar('ยึดความสามารถและความจำเป็น', merVal, { wide: true, color: '#5fd38a', txt: merVal + '%' });
      h += bar('ความเอนเอียงตามสายสัมพันธ์', 100 - merVal, { wide: true, color: '#f0a030', txt: (100 - merVal) + '%' });
      if (tr) {
        h += '<div class="muted" style="margin-top:6px">ผู้ดูแลคลัง: <b>' + esc(HC.fullName(tr)) + '</b> · ความซื่อตรง ' + Math.round(HC.eff(tr, 'personality.integrity')) + '% · ความใจกว้าง ' + Math.round((g.CPE.S(W).welfare || 0.5) * 100) + '%</div>';
      }
      const hist = (S.welfareHistory || []).slice(0, 5);
      if (hist.length) {
        h += '<div style="margin-top:8px;font-size:12px"><b>ประวัติการแจกจ่ายล่าสุด:</b><br>' + hist.map(wh => '<div style="padding:2px 0;border-bottom:1px dotted var(--line,#3a3f4a)">• วันที่ ' + wh.day + ' · ผู้ดูแล ' + esc(wh.treasurerName) + ' · แจก ' + wh.given + ' เม็ด (ความชอบธรรม ' + wh.meritocracy + '%)' + (wh.passedOverCount > 0 ? ' · มีผู้จำเป็นตกค้าง ' + wh.passedOverCount + ' คน' : '') + '</div>').join('') + '</div>';
      }
      h += '</div>';
      const recent = W.logs.filter(l => l.type === 'decision').slice(-6).reverse(); if (recent.length) h += '<h3>การตัดสินใจล่าสุดของเจ้าสำนัก</h3><div class="card">' + recent.map(l => '<div class="logrow"><span class="tm">' + dayStamp(l.t) + '</span>' + linkify(W, l.text, l.ids, l.refs) + '</div>').join('') + '</div>';
    } else if (tab === 'posts') {
      const pSub = UI.sectPostsSubTab || 'OFFICES';
      h += renderSubTabBar('set-sect-posts-subtab', pSub, [
        ['OFFICES', '🎖️ ทำเนียบ 6 ฝ่าย 22 ตำแหน่ง'],
        ['POLITICS', '🌊 ก๊กการเมือง & คลื่นใต้น้ำ'],
        ['PRISON', '⛓️ ลานเทศนาธรรม & คุกเชลยศึก'],
        ['ALL', '📋 ดูทั้งหมด']
      ], 'หมวดย่อยตำแหน่งและการเมืองในสำนัก');
      h += '<div class="subcat-pane" data-subcat="OFFICES"' + ((pSub === 'ALL' || pSub === 'OFFICES') ? '' : ' style="display:none"') + '>';
      const dirFilter = UI.postDirFilter || 'ALL';
      const filledCount = SECT.POST_IDS.filter(p => SECT.holder(W, p)).length;
      h += '<div class="card" style="border-color:var(--gold)">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
      h += '<div><b>🏛️ ทำเนียบขุนนางและตำแหน่งบริหาร 6 ทำเนียบฝ่าย (' + filledCount + '/' + SECT.POST_IDS.length + ' ตำแหน่ง)</b><div class="muted" style="font-size:11.5px">ผู้นำเลือกคนตามความสามารถหรือความสนิท (ยึดความสามารถ ' + Math.round(S.policy.meritocracy) + '%) · ทุกตำแหน่งมีเบี้ยหวัดจริง บารมีโหวตสภา และสิทธิตัดสินใจอัตโนมัติ</div></div>';
      h += '<div style="display:flex;gap:5px;flex-wrap:wrap">' +
        '<button class="btn pri" style="padding:3px 9px;font-size:11px" data-do="unlock-all-offices">🔓 ปลดล็อกทำเนียบตำแหน่งทั้งหมด</button>' +
        '<button class="btn ok" style="padding:3px 9px;font-size:11px" data-do="run-officer-jurisdictions">🏛️ ให้ขุนนางตัดสินใจตามตำแหน่ง</button>' +
        '<button class="btn" style="padding:3px 9px;font-size:11px" data-do="pay-office-stipends">💰 จ่ายเบี้ยหวัดตำแหน่ง</button>' +
        '</div></div>';
      // 4 Unlocked Strategic Bureaus Banner (ฝ่ายการทูต, ฝ่ายข่าวกรอง, ฝ่ายสัตว์วิญญาณ, ฝ่ายค่ายกลป้องกัน)
      const plannedBureaus = Object.entries(SECT.PLANNED_POSTS || {});
      if (plannedBureaus.length) {
        h += '<div style="margin-top:8px;padding-top:6px;border-top:1px dotted var(--line,#3a3f4a);display:flex;gap:6px;flex-wrap:wrap;align-items:center">';
        h += '<span class="muted" style="font-size:11px"><b>4 ฝ่ายยุทธศาสตร์หลัก:</b></span>';
        plannedBureaus.forEach(([bId, bp]) => {
          const linkedId = bp.linkedPost || (SECT.POST_ALIASES && SECT.POST_ALIASES[bId]) || 'envoy';
          const lPost = SECT.POSTS[linkedId];
          const lHolder = SECT.holder(W, linkedId);
          h += '<span class="chip g" style="font-size:11px">✅ ' + esc(bp.nameTh) + ' ➔ ' + esc(lPost ? lPost.nameTh : linkedId) + (lHolder ? (' (' + esc(HC.fullName(lHolder)) + ')') : ' (ว่าง)') + '</span>';
        });
        h += '</div>';
      }
      // Single-row Directorate Filter Chips
      h += '<div style="display:flex;gap:5px;overflow-x:auto;padding-top:8px;scrollbar-width:thin">';
      h += '<button class="btn ' + (dirFilter === 'ALL' ? 'pri' : '') + '" style="padding:3px 8px;font-size:11px;flex-shrink:0" data-do="set-post-dir-filter" data-arg="ALL">📋 ทุกทำเนียบ (' + SECT.POST_IDS.length + ')</button>';
      (SECT.DIRECTORATE_IDS || []).forEach(dId => {
        const dSpec = SECT.DIRECTORATES[dId];
        const cnt = SECT.POST_IDS.filter(p => SECT.POSTS[p].category === dId).length;
        h += '<button class="btn ' + (dirFilter === dId ? 'pri' : '') + '" style="padding:3px 8px;font-size:11px;flex-shrink:0" data-do="set-post-dir-filter" data-arg="' + esc(dId) + '">' + esc(dSpec.icon + ' ' + dSpec.nameTh) + ' (' + cnt + ')</button>';
      });
      h += '</div></div>';

      // Supreme Leadership (Sect Master & Deputy Master)
      const depNpc = W.byId[S.deputyId];
      h += '<div class="grid2" style="margin-bottom:8px">';
      [[ '👑 เจ้าสำนัก', m, 'ผู้นำสูงสุด · บารมีโหวต 2.4 · เบี้ยหวัด 130 ศิลา/เดือน' ], [ '🦅 รองเจ้าสำนัก', depNpc, 'ผู้ช่วยบริหารสูงสุด · บารมีโหวต 1.8 · เบี้ยหวัด 85 ศิลา/เดือน' ]].forEach(slot => {
        const ldr = slot[1];
        h += '<div class="prow" style="margin:0" ' + (ldr ? 'data-npc="' + ldr.id + '"' : '') + '>' +
          (ldr ? portraitHtml(ldr, 42) : '<div style="width:42px;height:42px;border-radius:10px;background:#0e141b;display:flex;align-items:center;justify-content:center">—</div>') +
          '<div class="pi"><div class="nm">' + slot[0] + '</div><div class="sub">' + (ldr ? (esc(HC.fullName(ldr)) + ' · ' + (ldr.cult ? CULT.stageName(ldr) : 'ปุถุชน')) : 'ว่าง · รอเจ้าสำนักแต่งตั้ง') + '</div><div class="sub muted">' + slot[2] + '</div></div></div>';
      });
      h += '</div>';

      // Render offices grouped by Directorate
      const activeDirs = (SECT.DIRECTORATE_IDS || []).filter(dId => dirFilter === 'ALL' || dirFilter === dId);
      activeDirs.forEach(dId => {
        const dSpec = SECT.DIRECTORATES[dId] || { icon: '🏛️', nameTh: dId, descTh: '' };
        const dirPosts = SECT.POST_IDS.filter(p => (SECT.POSTS[p].category || 'governance') === dId);
        if (!dirPosts.length) return;
        h += '<h3>' + esc(dSpec.icon + ' ' + dSpec.nameTh) + ' <span class="muted" style="font-size:11px;font-weight:normal">— ' + esc(dSpec.descTh) + '</span></h3>';
        dirPosts.forEach(pId => {
          const pSpec = SECT.POSTS[pId];
          const n = SECT.holder(W, pId);
          const st = SECT.officeState(W, pId);
          const del = S.delegations && S.delegations[pId];
          const delNpc = del && del.until > W.t ? W.byId[del.delegateId] : null;
          const minRankName = (SECT.RANKS[pSpec.minRank || 3] && SECT.RANKS[pSpec.minRank || 3].nameTh) || 'ศิษย์แกนกลาง';
          const plan = S.officePlans && S.officePlans[pId];
          const lastDec = n && n.lastJurisdictionDecision && n.lastJurisdictionDecision.post === pId ? n.lastJurisdictionDecision.summaryTh : (plan ? plan.title : '');
          let subText = '';
          let actBtns = '';
          if (n) {
            const suitScore = SECT.suitability ? SECT.suitability(pId, n, W) : Math.round(SECT.relevance(pId, n));
            subText = '<b>' + esc(HC.fullName(n)) + '</b> · ' + (n.cult ? CULT.stageName(n) : 'ปุถุชน') + ' <span class="chip ok">ความเหมาะสม ' + suitScore + '</span>';
            if (delNpc) subText += ' <span class="chip b">รักษาการแทนโดย ' + esc(HC.fullName(delNpc)) + '</span>';
            if (pId === 'disciples') {
              actBtns = '<button class="btn" style="padding:2px 7px;font-size:10.5px" data-do="elect-successor">🗳️ คัดเลือกใหม่</button>';
            } else {
              actBtns = '<button class="btn ok" style="padding:2px 7px;font-size:10.5px" data-do="run-single-office" data-arg="' + esc(pId) + '">⚡ สั่งงาน</button> ' +
                '<button class="btn" style="padding:2px 7px;font-size:10.5px" data-do="auto-appoint-office" data-arg="' + esc(pId) + '">🔄 เปลี่ยนคน</button> ' +
                '<button class="btn dan" style="padding:2px 7px;font-size:10.5px" data-do="dismiss-office" data-arg="' + esc(pId) + '">✕ ปลด</button>';
            }
          } else if (st && !st.enabled) {
            subText = '🔒 ยังไม่ปลดล็อก · ' + esc(st.reason);
            actBtns = '<button class="btn pri" style="padding:2px 8px;font-size:10.5px" data-do="auto-appoint-office" data-arg="' + esc(pId) + '">🔓 ปลดล็อก & แต่งตั้ง</button>';
          } else if (pId === 'disciples') {
            subText = 'ว่าง · รอการลงมติคัดเลือกศิษย์สืบทอด';
            actBtns = '<button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="elect-successor">🗳️ เปิดประชุมคัดเลือกศิษย์สืบทอด</button>';
          } else {
            subText = 'ว่าง · พร้อมแต่งตั้งผู้มีความสามารถเข้าประจำตำแหน่ง';
            actBtns = '<button class="btn pri" style="padding:2px 8px;font-size:10.5px" data-do="auto-appoint-office" data-arg="' + esc(pId) + '">🎖️ แต่งตั้งผู้เหมาะสมสูงสุด</button>';
          }
          h += '<div class="prow" style="align-items:flex-start">' +
            (n ? '<div data-npc="' + n.id + '" style="cursor:pointer">' + portraitHtml(n, 42) + '</div>' : '<div style="width:42px;height:42px;border-radius:10px;background:#0e141b;display:flex;align-items:center;justify-content:center;flex-shrink:0">—</div>') +
            '<div class="pi" style="flex:1;min-width:0">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">' +
            '<div class="nm">' + esc(pSpec.nameTh) + ' <span class="chip" style="font-size:10.5px">ขั้นต่ำ: ' + esc(minRankName) + '</span> <span class="chip g" style="font-size:10.5px">+' + (pSpec.stipendBonus || 20) + ' ศิลา/ด.</span> <span class="chip b" style="font-size:10.5px">บารมี ' + (pSpec.authority || 65) + '</span> <span class="chip" style="font-size:10.5px">🏯 ' + esc(pSpec.hall || 'main_hall') + '</span></div>' +
            '<div style="flex-shrink:0">' + actBtns + '</div></div>' +
            '<div class="sub" style="margin-top:2px">' + subText + '</div>' +
            '<div class="sub muted">' + esc(pSpec.descTh || pSpec.desc || '') + '</div>' +
            (lastDec ? '<div class="sub" style="color:var(--gold);font-size:11px;margin-top:2px">📋 การตัดสินใจล่าสุด: ' + esc(lastDec) + '</div>' : '') +
            '</div></div>';
        });
      });

      h += '</div><div class="subcat-pane" data-subcat="POLITICS"' + ((pSub === 'ALL' || pSub === 'POLITICS') ? '' : ' style="display:none"') + '>';
      if (S.internalPolitics) {
        const ip = S.internalPolitics;
        const uc = Math.round(ip.undercurrent || 0);
        const ucCol = uc >= 80 ? '#e0584a' : uc >= 60 ? '#f0a030' : uc >= 30 ? '#ffd166' : '#5fd38a';
        h += '<h3>🌊 การเมืองภายในสำนัก · ก๊กการเมือง & คลื่นใต้น้ำ</h3><div class="card">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
        h += '<div><b>ระดับคลื่นใต้น้ำ (Undercurrent Unrest): <span style="color:' + ucCol + '">' + uc + '/100</span></b> · <span class="muted">' + esc(ip.undercurrentLabelTh || 'คลื่นลมสงบ') + ' (ประสิทธิภาพงาน ×' + (ip.efficiencyMultiplier || 1).toFixed(2) + ')</span></div>';
        h += '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn" style="padding:3px 8px;font-size:11px" data-do="propose-clique-nomination" data-arg="envoy">📜 ให้ก๊กเสนอชื่อตำแหน่งว่าง</button><button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="appease-undercurrent" data-arg="COUNCIL_CONCESSION">🕊️ เปิดสภาคลี่คลายคลื่นใต้น้ำ</button><button class="btn" style="padding:3px 8px;font-size:11px" data-do="run-officer-jurisdictions">🏛️ ให้ขุนนางตัดสินใจตามตำแหน่ง</button></div>';
        h += '</div>';
        const cqList = Object.values(ip.cliques || {});
        if (cqList.length) {
          h += '<div class="grid2" style="margin-top:8px">';
          cqList.forEach(cq => {
            const cDef = (SECT.CLIQUE_DEFS && SECT.CLIQUE_DEFS[cq.id]) || {};
            const leaderNpc = cq.leaderId && W.byId[cq.leaderId];
            h += '<div style="padding:5px 7px;border:1px solid var(--line,#3a3f4a);border-radius:8px"><b>' + esc((cDef.icon || '🏛️') + ' ' + cq.nameTh) + '</b> <span class="chip">อิทธิพล ' + (cq.influence || 10) + '</span><div class="muted" style="font-size:11px">แกนนำ: ' + esc(leaderNpc ? HC.fullName(leaderNpc) : 'ยังไม่มี') + ' · สมาชิก ' + ((cq.memberIds && cq.memberIds.length) || 0) + ' คน · ความพอใจ ' + (cq.satisfaction || 65) + '%</div></div>';
          });
          h += '</div>';
        }
        const pendingNoms = (ip.nominations || []).filter(nm => nm && nm.status === 'PENDING');
        if (pendingNoms.length) {
          h += '<div style="margin-top:8px;padding-top:6px;border-top:1px dotted var(--line,#3a3f4a)"><b>🗳️ ข้อเสนอชื่อผู้ดำรงตำแหน่งจากก๊กการเมือง (' + pendingNoms.length + '):</b>';
          pendingNoms.forEach(nm => {
            h += '<div style="margin-top:5px;padding:6px;background:rgba(255,255,255,0.03);border-radius:8px"><div><b>' + esc(nm.postNameTh) + ':</b> ' + esc(nm.reasonTh) + ' <span class="chip v">แรงกดดัน ' + nm.pressureLevel + '</span></div>';
            h += '<div style="margin-top:5px;display:flex;gap:6px;flex-wrap:wrap">';
            h += '<button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="resolve-nomination" data-arg="' + esc(nm.id) + '|ACCEPT_NOMINEE">✅ รับข้อเสนอก๊ก (ลดคลื่นใต้น้ำ)</button>';
            h += '<button class="btn" style="padding:2px 8px;font-size:11px" data-do="resolve-nomination" data-arg="' + esc(nm.id) + '|OVERRIDE_APPOINT">⚖️ ตั้งคนตามใจเจ้าสำนัก (+คลื่นใต้น้ำ)</button>';
            h += '<button class="btn dan" style="padding:2px 8px;font-size:11px" data-do="resolve-nomination" data-arg="' + esc(nm.id) + '|DISMISS_AGITATOR">⚡ ไม่ยอมใคร · ปลดแกนนำก๊กที่กดดัน! (+คลื่นใต้น้ำพุ่ง)</button>';
            h += '</div></div>';
          });
          h += '</div>';
        }
        h += '</div>';
      }
      h += '</div><div class="subcat-pane" data-subcat="PRISON"' + ((pSub === 'ALL' || pSub === 'PRISON') ? '' : ' style="display:none"') + '>';
      const dng = (W.sect && W.sect.dungeon) || { prisoners: [], stats: { captured: 0, ransomed: 0, interrogated: 0, defected: 0, totalRansomStones: 0 } };
      const wardenNpc = SECT.holder(W, 'warden') || SECT.holder(W, 'discipline');
      h += '<h3>🪷 มรรคาเทศนาธรรม & ⛓️ คุกคุมขังเชลยศึกสำนัก (ผู้คุมทัณฑ์: ' + esc(wardenNpc ? HC.fullName(wardenNpc) : 'ยังไม่ได้แต่งตั้ง') + ')</h3><div class="card">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px"><div><b>🪷 ลานมรรคาเทศนาธรรม:</b> ชำระจิตมาร (-20) ลดความเครียด และกระตุ้นการตื่นรู้ฉับพลันทะลวงคอขวด</div><button class="btn pri" style="padding:3px 9px;font-size:11.5px" data-do="hold-dao-lecture">🪷 เปิดลานเทศนาธรรมทันที</button></div>';
      h += '<div style="padding-top:6px;border-top:1px solid var(--line,#3a3f4a)"><b>⛓️ คุกคุมขังเชลยศึก (' + (dng.prisoners ? dng.prisoners.length : 0) + ' คน):</b> เรียกค่าไถ่แล้ว ' + ((dng.stats && dng.stats.ransomed) || 0) + ' ครั้ง (+' + ((dng.stats && dng.stats.totalRansomStones) || 0) + ' ศิลา) · เค้นคัมภีร์ ' + ((dng.stats && dng.stats.interrogated) || 0) + ' ครั้ง · เกลี้ยกล่อมแปรพักตร์ ' + ((dng.stats && dng.stats.defected) || 0) + ' คน</div>';
      if (dng.prisoners && dng.prisoners.length) {
        h += dng.prisoners.map(p => '<div style="padding:4px 0;border-top:1px dotted var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div><b>⛓️ ' + esc(p.nameTh) + '</b> <span class="chip r">' + esc(p.roleTh) + ' · ' + esc(p.sectNameTh) + '</span> <span class="muted">(ขั้น ' + p.stage + ' · ค่าไถ่ ' + p.ransomStones + ' ศิลา)</span></div><div style="display:flex;gap:4px"><button class="btn pri" style="padding:2px 7px;font-size:11px" data-do="handle-dungeon-prisoner" data-arg="' + esc(p.id) + '|RANSOM">🪙 เรียกค่าไถ่</button><button class="btn" style="padding:2px 7px;font-size:11px" data-do="handle-dungeon-prisoner" data-arg="' + esc(p.id) + '|INTERROGATE">📖 เค้นคัมภีร์</button><button class="btn ok" style="padding:2px 7px;font-size:11px" data-do="handle-dungeon-prisoner" data-arg="' + esc(p.id) + '|RECRUIT_DEFECTOR">🤝 กล่อมแปรพักตร์</button></div></div>').join('');
      } else {
        h += '<div class="muted" style="font-size:11.5px;margin-top:4px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><span>ขณะนี้ไม่มีเชลยศึกในคุกใต้ดิน (เชลยจะถูกจับกุมอัตโนมัติเมื่อชนะศึกป้องกันสำนักหรือสกัดสายลับ)</span><button class="btn" style="padding:2px 8px;font-size:11px" data-do="handle-dungeon-prisoner" data-arg="|RANSOM">⛓️ จับกุมสายลับศัตรูและสอบสวนทันที</button></div>';
      }
      h += '</div></div>';
    } else if (tab === 'peaks') {
      h += UI.rSectPeaks(W);
    } else if (tab === 'library') {
      h += UI.rSectLibrary(W);
    } else if (tab === 'stock') {
      h += '<div class="card"><div class="grid2"><div>💎 ศิลา <b>' + U.fmtNum(S.stones) + '</b></div><div>🌾 ข้าว <b>' + ECO.count(W, 'grain') + '</b></div><div>🍚 อาหารปรุง <b>' + ECO.count(W, 'meal') + '</b></div><div>⚔ อุปกรณ์ในคลัง <b>' + S.gear.length + '</b></div><div>📚 คัมภีร์ในหอ <b>' + S.library.length + '</b></div><div>🔬 ตำรับระดับ <b>' + S.recipeTier + '</b></div></div><div style="margin-top:8px"><button class="btn pri" data-do="open-spawn-sect">✨ เสกไอเทมเข้าคลังสำนัก</button></div></div>';
      const rd = S.reserveDirectives || {};
      const popN = Math.max(1, W.npcs.filter(n => !n.dead).length);
      const curMeal = ECO.count(W, 'meal'), curGrain = ECO.count(W, 'grain');
      const medRes = rd.medicine || {};
      h += '<h3>คำสั่งสำรองคลังและความปลอดภัยการเดินทาง</h3><div class="card">';
      h += '<div class="grid2">';
      h += '<div>🍚 อาหารสำรองขั้นต่ำ <b>' + curMeal + '/' + (rd.minMealReserve || 20) + '</b></div>';
      h += '<div>🌾 ข้าวสารสำรอง <b>' + curGrain + '/' + (popN * (rd.minGrainDays || 14)) + ' (' + (rd.minGrainDays || 14) + ' วัน)</b></div>';
      h += '<div>🛡️ เกณฑ์ฉุกเฉินเดินทาง <b>' + (rd.expeditionMinSafetyMeal || 15) + ' ชุด</b></div>';
      h += '<div>🎒 เพดานเบิกเดินทาง <b>' + (rd.expeditionMealCap || 18) + ' มื้อ/คน</b></div>';
      h += '</div>';
      h += '<div style="margin-top:6px;font-size:12px"><b>สำรองโอสถฉุกเฉิน:</b> ' + Object.keys(medRes).map(k => esc(ECO.name(k)) + ' ' + ECO.count(W, k) + '/' + medRes[k]).join(' · ') + '</div>';
      h += '</div>';

      const shorts = S.shortageDirectives || [];
      h += '<h3>คำสั่งจัดการของขาดแคลน (' + shorts.length + ')</h3><div class="card">';
      if (shorts.length) {
        h += shorts.map(sd => {
          const priCol = sd.priority === 'critical' ? '#e0584a' : sd.priority === 'high' ? '#f0a030' : '#4fb2f2';
          const priTh = sd.priority === 'critical' ? 'วิกฤต' : sd.priority === 'high' ? 'ขาดแคลน' : 'ควรเติม';
          return '<div class="logrow"><span><span class="chip" style="border-color:' + priCol + ';color:' + priCol + '">' + priTh + '</span> <b>' + esc(sd.nameTh) + '</b> ขาด ' + Math.ceil(sd.deficit) + ' (มี ' + sd.current + '/' + sd.needed + ') <span class="muted">— ' + esc(sd.reason) + '</span></span></div>';
        }).join('');
      } else {
        h += '<span class="muted">ไม่มีรายการขาดแคลน คลังสำรองอยู่ในเกณฑ์ปลอดภัย</span>';
      }
      h += '</div>';

      if (ECO.inventoryIntelligence) {
        const intel = ECO.inventoryIntelligence(W);
        h += '<h3>📊 ปัญญาประดิษฐ์คลังและอัตราหมุนเวียน (Inventory Intelligence)</h3><div class="card">';
        h += '<div class="sub" style="margin-bottom:6px">ประเมินอัตราการใช้ย้อนหลัง 14/30 วัน เพื่อแบ่งประเภทสินค้า ป้องกันของขาดและหาของล้นขายตลาดภายนอก</div>';
        const surp = intel.surplus || [];
        const short = intel.shortage || [];
        const resReq = intel.reserveRequired || [];
        h += '<div><span class="chip" style="border-color:#5fd38a;color:#5fd38a">🟢 ส่วนเกินคลัง (' + surp.length + ')</span> ' + (surp.length ? surp.slice(0, 8).map(x => esc(ECO.name(x.id)) + ' (มี ' + x.stock + '/เกิน ' + x.surplusQty + ')').join(' · ') : '<span class="muted">ไม่มีของล้น</span>') + '</div>';
        h += '<div style="margin-top:4px"><span class="chip" style="border-color:#e0584a;color:#e0584a">🔴 ขาดแคลน (' + short.length + ')</span> ' + (short.length ? short.slice(0, 8).map(x => esc(ECO.name(x.id)) + ' (มี ' + x.stock + '/เป้า ' + x.floor + ')').join(' · ') : '<span class="muted">ไม่มีของขาด</span>') + '</div>';
        h += '<div style="margin-top:4px"><span class="chip" style="border-color:#f0a030;color:#f0a030">🟡 สำรองจำเป็น (' + resReq.length + ')</span> ' + (resReq.length ? resReq.slice(0, 6).map(x => esc(ECO.name(x.id)) + ' (' + x.stock + '/' + x.floor + ')').join(' · ') : '<span class="muted">ปกติ</span>') + '</div>';
        h += '</div>';
      }

    } else if (tab === 'stockItems') {
      // Searchable & Filterable Sect Stock Browser (Paginated Icon-Grid + Classic List)
      const mode = UI.getInvViewMode();
      const allStockRows = buildSectStockItems(W);
      let stockRows = allStockRows.slice();
      const sq = (UI.stockSearch || "").trim().toLowerCase();
      if (sq) stockRows = stockRows.filter(r => r.nameTh.toLowerCase().includes(sq) || String(r.id).toLowerCase().includes(sq));
      if (mode === "grid") {
        const cat = UI.stockCat || "ALL";
        if (cat !== "ALL") stockRows = stockRows.filter(r => r.broadCat === cat);
      } else {
        if (UI.stockType && UI.stockType !== "ALL") stockRows = stockRows.filter(r => r.kind === UI.stockType);
      }
      if (UI.stockTier && UI.stockTier !== "ALL") stockRows = stockRows.filter(r => r.tier === +UI.stockTier);
      if (UI.stockSort === "tier") stockRows.sort((a, b) => b.tier - a.tier || b.qty - a.qty);
      else if (UI.stockSort === "value") stockRows.sort((a, b) => (b.value || 0) - (a.value || 0) || b.tier - a.tier);
      else if (UI.stockSort === "name") stockRows.sort((a, b) => a.nameTh.localeCompare(b.nameTh));
      else stockRows.sort((a, b) => b.qty - a.qty || b.tier - a.tier);

      h += renderModeToggleBar("<h3>🔎 ค้นหาและจัดการคลังสำนัก (" + stockRows.length + " รายการ)</h3>");
      h += "<div class=\"card\">";
      if (mode === "grid") {
        h += "<details class=\"stock-filters\"><summary>🔎 ค้นหาและกรองรายการ</summary>";
        h += "<div class=\"inv-cat-bar\">";
        BROAD_CATS.forEach(([ck, cv]) => {
          const cnt = ck === "ALL" ? allStockRows.length : allStockRows.filter(x => x.broadCat === ck).length;
          h += "<button type=\"button\" class=\"" + ((UI.stockCat || "ALL") === ck ? "on" : "") + "\" data-do=\"stock-cat\" data-arg=\"" + ck + "\">" + cv + " (" + cnt + ")</button>";
        });
        h += "</div>";
        h += "<div class=\"inv-filter-row\">";
        h += "<input id=\"stockSearch\" type=\"search\" placeholder=\"ค้นหาชื่อหรือรหัสไอเทมในคลัง…\" value=\"" + esc(UI.stockSearch || "") + "\">";
        h += "<select id=\"stockTier\">" + [["ALL", "ทุกระดับ"], ["1", "T1"], ["2", "T2"], ["3", "T3"], ["4", "T4"], ["5", "T5"], ["6", "T6"], ["7", "T7"]].map(([k, v]) => "<option value=\"" + k + "\"" + (UI.stockTier === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select>";
        h += "<select id=\"stockSort\">" + [["qty", "เรียง: จำนวน"], ["tier", "เรียง: ระดับ"], ["value", "เรียง: มูลค่า"], ["name", "เรียง: ชื่อ"]].map(([k, v]) => "<option value=\"" + k + "\"" + (UI.stockSort === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select>";
        h += "</div>";

        h += "</details>";
        const pgSpec = { cols: 6, rows: 4, perPage: 24 };
        const totalPages = Math.max(1, Math.ceil(stockRows.length / pgSpec.perPage));
        UI.stockPage = clamp(UI.stockPage || 1, 1, totalPages);
        const startIdx = (UI.stockPage - 1) * pgSpec.perPage;
        const pageItems = stockRows.slice(startIdx, startIdx + pgSpec.perPage);

        if (UI.stockSelKey && !stockRows.some(x => x.selKey === UI.stockSelKey)) {
          UI.stockSelKey = null;
        }
        const selItem = UI.stockSelKey ? stockRows.find(x => x.selKey === UI.stockSelKey) : null;

        h += "<div class=\"inv-grid-wrap\">";
        if (!pageItems.length) {
          h += "<div class=\"muted\" style=\"padding:10px 4px;text-align:center\">ไม่พบไอเทมในคลังที่ตรงกับเงื่อนไขการค้นหา</div>";
        } else {
          h += "<div class=\"inv-grid\">" + pageItems.map(it => renderGridCellHtml(it, selItem && selItem.selKey === it.selKey, "stock-sel")).join("") + "</div>";
        }
        h += "<div class=\"inv-page-bar\">" +
          "<button type=\"button\" data-do=\"stock-page\" data-arg=\"-1\"" + (UI.stockPage <= 1 ? " disabled" : "") + ">◀ ก่อนหน้า</button>" +
          "<span>หน้า <b>" + UI.stockPage + "</b> / " + totalPages + " <span class=\"muted\">(" + stockRows.length + " รายการ)</span></span>" +
          "<button type=\"button\" data-do=\"stock-page\" data-arg=\"+1\"" + (UI.stockPage >= totalPages ? " disabled" : "") + ">ถัดไป ▶</button>" +
          "</div>";

        if (selItem) {
          const techInfo = selItem.kind === 'TECH_MANUAL' && CULT.tech(selItem.templateId) ? techniqueSummary(CULT.tech(selItem.templateId)) : null;
          const eqType = selItem.eq && g.MARTIAL && g.MARTIAL.gearType ? g.MARTIAL.gearType(selItem.eq) : null;
          const eqTypeTh = eqType && g.MARTIAL.TYPES && g.MARTIAL.TYPES[eqType];
          const element = selItem.eq && selItem.eq.element && g.ELEM && g.ELEM.META && g.ELEM.META[selItem.eq.element];
          const summaryExtra = techInfo ? [techInfo.pathText, techInfo.subText, techInfo.weaponText].filter(Boolean).join(' · ') : [eqTypeTh, element && element.nameTh].filter(Boolean).join(' · ');
          const rLabel = selItem.legendary || selItem.rarity === "Legendary" ? "★ ตำนาน" : selItem.rarity === "Exceptional" ? "◆ ล้ำเลิศ" : selItem.rarity === "Rare" ? "▲ หายาก" : "ทั่วไป";
          h += "<div class=\"inv-detail-panel\" data-detail-for=\"" + esc(selItem.selKey) + "\">" +
            ((selItem.kind === "EQUIPMENT" || selItem.broadCat === "EQUIPMENT" || selItem.eq) ? relicShowcaseHtml(selItem, 180, 82) : "") +
            "<div class=\"inv-detail-top\">" +
            UI.renderAtlasIconHtml(selItem, 44) +
            "<div class=\"inv-detail-meta\">" +
            "<div class=\"inv-detail-title\">" + esc(selItem.nameTh) + "</div>" +
            "<div class=\"inv-detail-sub\"><span class=\"chip b\">" + esc(selItem.kindTh) + " · T" + selItem.tier + "</span>" +
            "<span class=\"chip\">" + rLabel + "</span>" +
            "<span>คงคลัง <b>×" + selItem.qty + "</b></span>" +
            (selItem.qualityPct ? "<span>· คุณภาพ <b>" + selItem.qualityPct + "%</b></span>" : "") +
            "</div></div>" +
            "<button type=\"button\" class=\"inv-detail-close\" data-do=\"stock-close-detail\">✕ ปิด</button>" +
            "</div>" +
            (summaryExtra ? "<div class=\"inv-detail-eff\">" + esc(summaryExtra) + "</div>" : "") +
            "<div class=\"inv-detail-eff\">📦 <b>สถานะคลัง:</b> " + esc(selItem.statusTh || "-") + "<br>✨ <b>สรรพคุณ/การใช้งาน:</b> " + esc(selItem.descTh || "-") + "</div>" +
            "<div class=\"inv-detail-actions\">" +
            (selItem.canOpenContainer ? "<button type=\"button\" class=\"btn pri\" data-do=\"open-sect-container\">🎁 เปิดหีบปริศนาในคลัง (1 ใบ)</button>" : "") +
            (selItem.canCookFish ? "<button type=\"button\" class=\"btn pri\" data-do=\"cook-sect-fish\" data-arg=\"" + esc(selItem.id) + "\">🍳 ปรุงอาหารปลาเข้าโรงครัว</button>" : "") +
            (selItem.canDiscardTrash ? "<button type=\"button\" class=\"btn dan\" data-do=\"discard-sect-trash\">🗑️ ทิ้งเศษซากใต้น้ำ</button>" : "") +
            (selItem.kind === "EQUIPMENT" || selItem.eq ? "<button type=\"button\" class=\"btn pri\" data-do=\"socket-elemental-runes\" data-arg=\"|" + esc((selItem.eq && (selItem.eq.uid || selItem.eq.id)) || selItem.id) + "\">💎 ฝังรูนธาตุ</button>" : "") + (selItem.kind === "EQUIPMENT" || selItem.eq ? "<button type=\"button\" class=\"btn\" data-do=\"awaken-weapon-soul\" data-arg=\"\">🗡️ ปลุกจิตวิญญาณศาสตรา</button>" : "") +
            "<button type=\"button\" class=\"btn pri\" data-do=\"stock-distribute-now\">🎁 ให้หอคลังจัดสรรสวัสดิการ/มอบของ</button>" +
            "<button type=\"button\" class=\"btn\" data-do=\"stock-toggle-more\">" + (UI.stockMoreOpen ? "ปิดรายละเอียด" : "ดูรายละเอียดเต็ม") + "</button>" +
            "</div>" +
            (UI.stockMoreOpen ? "<div class=\"stock-modal-backdrop\"><div class=\"stock-modal\"><button class=\"btn stock-modal-close\" data-do=\"stock-toggle-more\">✕ ปิด</button><h3>" + esc(selItem.nameTh) + "</h3><p>" + esc(selItem.kindTh) + " · ขั้น " + selItem.tier + " · จำนวน " + selItem.qty + "</p><p>" + esc(selItem.descTh || "-") + "</p><p>" + esc(selItem.moreTh || "-") + "</p><p>มูลค่าประเมิน ~" + (selItem.value || 0) + " คป.</p></div></div>" : "") +
            "</div>";
        }
        h += "</div>";
      } else {
        h += "<div class=\"edit-grid\" style=\"margin-bottom:8px\">";
        h += "<input id=\"stockSearch\" type=\"search\" placeholder=\"ค้นหาชื่อไอเทมในคลัง…\" value=\"" + esc(UI.stockSearch || "") + "\">";
        h += "<select id=\"stockType\">" + [["ALL", "ทุกประเภท"], ["PROVISION", "เสบียง"], ["PILL", "โอสถ"], ["MATERIAL", "วัตถุดิบ"], ["EQUIPMENT", "อุปกรณ์"], ["CRYSTAL", "ผลึกวิชา/สายย่อย"], ["TECH_MANUAL", "คัมภีร์ในหอ"], ["ORGAN", "อวัยวะอสูร"]].map(([k, v]) => "<option value=\"" + k + "\"" + (UI.stockType === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select>";
        h += "<select id=\"stockTier\">" + [["ALL", "ทุกระดับ"], ["1", "ระดับ 1"], ["2", "ระดับ 2"], ["3", "ระดับ 3"], ["4", "ระดับ 4"], ["5", "ระดับ 5"], ["6", "ระดับ 6"], ["7", "ระดับ 7"]].map(([k, v]) => "<option value=\"" + k + "\"" + (UI.stockTier === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select>";
        h += "<select id=\"stockSort\">" + [["qty", "เรียงตามจำนวน"], ["tier", "เรียงตามระดับ"], ["value", "เรียงตามมูลค่า"], ["name", "เรียงตามชื่อ"]].map(([k, v]) => "<option value=\"" + k + "\"" + (UI.stockSort === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select>";
        h += "</div>";
        h += stockRows.length ? stockRows.slice(0, 60).map(r => "<div class=\"logrow\"><span><span class=\"chip\">" + esc(r.kindTh) + " T" + r.tier + "</span> <b>" + esc(r.nameTh) + "</b> ×" + r.qty + "</span><span class=\"muted\">" + esc(r.statusTh) + "</span></div>").join("") : "<div class=\"muted\">ไม่พบไอเทมในคลังที่ตรงกับเงื่อนไขการค้นหา</div>";
      }
      h += "</div>";

      const stSub = UI.stockItemsSubTab || 'GRID';
      h += renderSubTabBar('set-stock-subtab', stSub, [['GRID', '📦 ตารางไอเทมหลัก'], ['SUMMARY', '📊 สรุปโอสถ/วัตถุดิบ & บัญชีคลัง'], ['ALL', '📋 ดูทั้งหมด']], 'หมวดย่อยคลังสำนัก');
      h += '<div class="subcat-pane" data-subcat="SUMMARY"' + ((stSub === 'ALL' || stSub === 'SUMMARY') ? '' : ' style="display:none"') + '>';
      ["alchemy", "forge"].forEach(hh => { const o = S.orders && S.orders[hh]; const r = o ? ECO.recipeById[o.rid] : null; h += "<div class=\"card\">" + (hh === "alchemy" ? "⚗️ หอโอสถกำลังผลิต: " : "🔨 โรงหลอมกำลังผลิต: ") + (r ? "<b>" + esc(r.outNameTh) + "</b> <span class=\"muted\">(" + esc(o.why || "") + ")</span>" : "<span class=\"muted\">ไม่มีคำสั่ง/วัตถุดิบไม่พอ</span>") + "</div>"; });
      const pills = Object.keys(S.stock).filter(k => ECO.isPill(k)).map(k => [k, S.stock[k]]); h += "<h3>โอสถ</h3><div class=\"card\">" + (pills.length ? pills.map(p => "<span class=\"chip ok\">" + esc(ECO.name(p[0])) + " ×" + p[1] + "</span>").join("") : "<span class=\"muted\">ไม่มี</span>") + "</div>";
      const mats = Object.keys(S.stock).filter(k => !ECO.isPill(k) && k !== "grain" && k !== "meal").map(k => [k, S.stock[k]]).sort((a, b) => b[1] - a[1]); h += "<h3>วัตถุดิบ</h3><div class=\"card\">" + (mats.length ? mats.slice(0, 60).map(p => "<span class=\"chip\">" + esc(ECO.name(p[0])) + " ×" + p[1] + "</span>").join("") : "<span class=\"muted\">ไม่มี</span>") + "</div>";
      const gears = S.gear.slice(0, 30); h += "<h3>อุปกรณ์ในคลัง</h3><div class=\"card\">" + (gears.length ? gears.map(x => "<span class=\"chip b\">" + esc(x.nameTh) + " · " + esc(g.MARTIAL.TYPES[g.MARTIAL.gearType(x)]) + "</span>").join("") : "<span class=\"muted\">ไม่มี</span>") + "</div>";
      const led = S.ledger.slice(-14).reverse(); h += "<h3>บัญชีล่าสุด</h3><div class=\"card\">" + led.map(l => "<div class=\"logrow\"><span class=\"tm\">" + dayStamp(l.t) + "</span><b style=\"color:" + (l.amt >= 0 ? "#5fd38a" : "#e0584a") + "\">" + (l.amt >= 0 ? "+" : "") + l.amt + "</b> " + esc(l.why) + "</div>").join("") + "</div></div>";
    } else if (tab === "shop") {
      const c = g.CPE.S(W), al = W.npcs.filter(n => !n.dead && !n.exiled), tot = al.reduce((a, n) => a + (n.cp || 0), 0), tr = SECT.holder(W, "treasury");
      const recent = (c.hist || []).slice(-30), minted30 = recent.reduce((a, x) => a + (x.mint || 0), 0), burned30 = recent.reduce((a, x) => a + (x.burn || 0), 0);
      const flowLabel = minted30 > burned30 * 1.25 ? "แต้มกำลังเพิ่มเร็ว" : burned30 > minted30 * 1.1 ? "แต้มกำลังถูกใช้มาก" : "แต้มหมุนเวียนใกล้สมดุล";
      h += "<div class=\"card\"><b>🛒 ร้านค้าสำนัก & แต้มคุณูปการ (คป.)</b><div class=\"muted\">สำนักเสกแต้มจ่ายเป็นค่าตอบแทน แต้มมีค่าเพราะแลกของ/วิชาที่ต้องหามาจากข้างนอกได้ การเรียนวิชา ซื้อสินค้า และขอคำชี้แนะจะเผาแต้มออกจากระบบ</div><div class=\"grid2\"><div>แต้มรวมที่ถือ <b>" + U.fmtNum(Math.round(tot)) + "</b></div><div>เฉลี่ย/คน <b>" + Math.round(tot / Math.max(1, al.length)) + "</b></div><div>เสกสะสม <b>" + U.fmtNum(Math.round(c.minted)) + "</b></div><div>เผาสะสม <b>" + U.fmtNum(Math.round(c.burned)) + "</b></div><div>แต้มหมุนเวียน <b>" + U.fmtNum(Math.round(c.circulation || tot)) + "</b></div><div>แต้มปลดเกษียณ <b>" + U.fmtNum(Math.round(c.retired || 0)) + "</b></div><div>สกัดอาร์บิทราจ <b>" + (c.arbitrageBlocked || 0) + " ครั้ง</b></div><div>ดัชนีราคา <b>×" + c.price.toFixed(2) + "</b></div><div>กำไรร้าน <b>×" + c.markup.toFixed(2) + "</b></div><div>แจกสวัสดิการแล้ว <b>" + c.welfareGiven + "</b></div><div>ขายแล้ว <b>" + c.sales + "</b> · ค่าวิชา <b>" + Math.round(c.techSales) + "</b></div><div>บริการชี้แนะ <b>" + (c.studyServices || 0) + " ครั้ง</b></div><div>เผาค่าชี้แนะ <b>" + U.fmtNum(Math.round(c.studyFees || 0)) + " คป.</b></div><div>ฝึกปราณแบบเสียแต้ม <b>" + (c.trainingServices || 0) + " ครั้ง</b></div><div>เผาค่าฝึกปราณ <b>" + U.fmtNum(Math.round(c.trainingFees || 0)) + " คป.</b></div><div>ขอสิทธิ์ตำรับ <b>" + (c.recipeAuthorizations || 0) + " ครั้ง</b></div><div>เผาค่าสิทธิ์ตำรับ <b>" + U.fmtNum(Math.round(c.recipeFees || 0)) + " คป.</b></div></div><div class=\"muted\">30 วันล่าสุด: เสก " + Math.round(minted30) + " · เผา " + Math.round(burned30) + " · " + flowLabel + "</div>" + (tr ? "<div class=\"muted\">ผู้ดูแลคลัง: " + esc(HC.fullName(tr)) + " · ความใจกว้าง " + Math.round(c.welfare * 100) + "%</div>" : "") + "</div>";

      // Active Buyer Selector + Paginated Icon-Grid / Classic List Shop Browser
      const mode = UI.getInvViewMode();
      if (!UI.shopBuyerId || !W.byId[UI.shopBuyerId] || W.byId[UI.shopBuyerId].dead) {
        UI.shopBuyerId = (UI.G.R && UI.G.R.selected && W.byId[UI.G.R.selected] && !W.byId[UI.G.R.selected].dead) ? UI.G.R.selected : W.sect.masterId;
      }
      const buyer = W.byId[UI.shopBuyerId] || al[0];
      const allShopItems = buildSectShopItems(W).map(it => {
        let locked = false, lockReason = "";
        if (buyer) {
          if (it.price > Math.floor(buyer.cp || 0) && it.shopKind !== "bounty_mat") {
            locked = true; lockReason = "แต้มคุณูปการไม่พอ (มี " + Math.round(buyer.cp || 0) + "/" + it.price + " คป.)";
          } else if (it.shopKind === "gear" && it.gear) {
            const effSt = buyer.cult ? (CULT.effectiveTechStage ? CULT.effectiveTechStage(buyer) : buyer.cult.stage) : 0;
            if (!buyer.cult || (it.gear.minStage || 1) > effSt + 1) {
              locked = true; lockReason = "ขั้นตบะเทียบเคียงยังไม่ถึงเกณฑ์สวมใส่ (ต้องการขั้น " + Math.max(1, (it.gear.minStage || 1) - 1) + ")";
            }
          } else if (it.shopKind === "crystal") {
            const ok = (g.MARTIAL && g.MARTIAL.canAcquireKnowledge) ? g.MARTIAL.canAcquireKnowledge(W, buyer, it.key) : ((g.MARTIAL && g.MARTIAL.eligible) ? g.MARTIAL.eligible(buyer, it.key).ok : true);
            if (!ok) { locked = true; lockReason = "วิถีหรือขั้นตบะของ " + buyer.h.name.given + " ยังไม่ตรงเกณฑ์ผลึกนี้"; }
          } else if (it.shopKind === "tech_study" && it.tech) {
            const eGate = (g.MARTIAL && g.MARTIAL.eligible) ? g.MARTIAL.eligible(buyer, g.MARTIAL.techKey(it.id)) : { ok: true };
            if (!eGate.ok) { locked = true; lockReason = eGate.reason || "ยังไม่ผ่านเกณฑ์เรียนวิชานี้"; }
            else if ((it.tech.reqTier || it.tech.tier || 1) > SECT.canLearnTier(W, buyer)) { locked = true; lockReason = "ยศในสำนักยังไม่ได้รับสิทธิ์หอคัมภีร์ชั้นนี้"; }
          } else if (it.shopKind === "bounty_mat") {
            const haveMat = (buyer.inv && buyer.inv.mats && buyer.inv.mats[it.id]) || 0;
            if (haveMat <= 0) { locked = true; lockReason = buyer.h.name.given + " ไม่มีสมุนไพรนี้ในถุงส่วนตัว"; }
          }
        }
        return Object.assign({}, it, { locked, lockReason });
      });

      let shopRows = allShopItems.slice();
      const shq = (UI.shopSearch || "").trim().toLowerCase();
      if (shq) shopRows = shopRows.filter(r => r.nameTh.toLowerCase().includes(shq) || String(r.id).toLowerCase().includes(shq));
      if (mode === "grid") {
        const cat = UI.shopCat || "ALL";
        if (cat !== "ALL") shopRows = shopRows.filter(r => r.broadCat === cat);
      }
      if (UI.shopSort === "price") shopRows.sort((a, b) => b.price - a.price || b.tier - a.tier);
      else if (UI.shopSort === "qty") shopRows.sort((a, b) => b.qty - a.qty || b.tier - a.tier);
      else if (UI.shopSort === "name") shopRows.sort((a, b) => a.nameTh.localeCompare(b.nameTh));
      else shopRows.sort((a, b) => b.tier - a.tier || b.price - a.price);

      h += renderModeToggleBar("<h3>🏮 กระดานแลกเปลี่ยนคุณูปการสำนัก (" + shopRows.length + " รายการ)</h3>");
      h += "<div class=\"card\">";
      if (buyer) {
        h += "<div style=\"display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #395244\">" +
          "<div style=\"font-size:12.5px\">👤 ผู้ทำรายการ: <select id=\"shopBuyerSel\" style=\"width:auto;display:inline-block;padding:4px 8px\">" +
          al.slice().sort((a, b) => b.rank - a.rank).map(x => "<option value=\"" + x.id + "\"" + (x.id === buyer.id ? " selected" : "") + ">" + esc(HC.fullName(x)) + " (" + Math.round(x.cp || 0) + " คป.)</option>").join("") +
          "</select></div>" +
          "<span class=\"chip g\">🏅 แต้มคงเหลือ: <b>" + Math.round(buyer.cp || 0) + " คป.</b></span></div>";
      }

      if (mode === "grid") {
        h += "<div class=\"inv-cat-bar\">";
        BROAD_CATS.forEach(([ck, cv]) => {
          const cnt = ck === "ALL" ? allShopItems.length : allShopItems.filter(x => x.broadCat === ck).length;
          h += "<button type=\"button\" class=\"" + ((UI.shopCat || "ALL") === ck ? "on" : "") + "\" data-do=\"shop-cat\" data-arg=\"" + ck + "\">" + cv + " (" + cnt + ")</button>";
        });
        h += "</div>";
        h += "<div class=\"inv-filter-row\">";
        h += "<input id=\"shopSearch\" type=\"search\" placeholder=\"ค้นหาสินค้า/คัมภีร์ในร้านสำนัก…\" value=\"" + esc(UI.shopSearch || "") + "\">";
        h += "<select id=\"shopSort\">" + [["tier", "เรียง: ระดับ"], ["price", "เรียง: ราคา คป."], ["qty", "เรียง: คงเหลือ"], ["name", "เรียง: ชื่อ"]].map(([k, v]) => "<option value=\"" + k + "\"" + (UI.shopSort === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select>";
        h += "</div>";

        const pgSpec = UI.calcGridPageSize();
        const totalPages = Math.max(1, Math.ceil(shopRows.length / pgSpec.perPage));
        UI.shopPage = clamp(UI.shopPage || 1, 1, totalPages);
        const startIdx = (UI.shopPage - 1) * pgSpec.perPage;
        const pageItems = shopRows.slice(startIdx, startIdx + pgSpec.perPage);

        if (UI.shopSelKey && !shopRows.some(x => x.selKey === UI.shopSelKey)) {
          UI.shopSelKey = null;
        }
        const selItem = UI.shopSelKey ? shopRows.find(x => x.selKey === UI.shopSelKey) : null;

        h += "<div class=\"inv-grid-wrap\">";
        if (!pageItems.length) {
          h += "<div class=\"muted\" style=\"padding:10px 4px;text-align:center\">ไม่พบรายการแลกเปลี่ยนในหมวดนี้</div>";
        } else {
          h += "<div class=\"inv-grid\">" + pageItems.map(it => renderGridCellHtml(it, selItem && selItem.selKey === it.selKey, "shop-sel")).join("") + "</div>";
        }
        h += "<div class=\"inv-page-bar\">" +
          "<button type=\"button\" data-do=\"shop-page\" data-arg=\"-1\"" + (UI.shopPage <= 1 ? " disabled" : "") + ">◀ ก่อนหน้า</button>" +
          "<span>หน้า <b>" + UI.shopPage + "</b> / " + totalPages + " <span class=\"muted\">(" + shopRows.length + " รายการ)</span></span>" +
          "<button type=\"button\" data-do=\"shop-page\" data-arg=\"+1\"" + (UI.shopPage >= totalPages ? " disabled" : "") + ">ถัดไป ▶</button>" +
          "</div>";

        if (selItem && buyer) {
          const rLabel = selItem.legendary || selItem.rarity === "Legendary" ? "★ ตำนาน" : selItem.rarity === "Exceptional" ? "◆ ล้ำเลิศ" : selItem.rarity === "Rare" ? "▲ หายาก" : "ทั่วไป";
          let actBtn = "";
          if (selItem.shopKind === "bounty_mat") {
            const haveMat = (buyer.inv && buyer.inv.mats && buyer.inv.mats[selItem.id]) || 0;
            actBtn = "<button type=\"button\" class=\"btn pri\" data-do=\"donate-personal\" data-arg=\"" + buyer.id + "|MATERIAL|" + selItem.id + "\"" + (haveMat <= 0 ? " disabled" : "") + ">🎁 บริจาคสมุนไพร (+ " + selItem.price + " คป.)</button>";
          } else {
            const btnLabel = selItem.shopKind === "tech_study" ? ("📖 ชำระค่าศึกษา (" + selItem.price + " คป.)") : ("🛒 แลกซื้อ (" + selItem.price + " คป.)");
            actBtn = "<button type=\"button\" class=\"btn pri\" data-do=\"shop-buy\" data-arg=\"" + esc(selItem.selKey) + "|" + selItem.price + "\"" + (selItem.locked ? " disabled" : "") + ">" + btnLabel + "</button>";
          }
          h += "<div class=\"inv-detail-panel\" data-detail-for=\"" + esc(selItem.selKey) + "\">" +
            "<div class=\"inv-detail-top\">" +
            UI.renderAtlasIconHtml(selItem, 44) +
            "<div class=\"inv-detail-meta\">" +
            "<div class=\"inv-detail-title\">" + esc(selItem.nameTh) + "</div>" +
            "<div class=\"inv-detail-sub\"><span class=\"chip g\">" + (selItem.shopKind === "bounty_mat" ? "รับบริจาค +" : "ราคา ") + selItem.price + " คป.</span>" +
            "<span class=\"chip b\">" + esc(selItem.kindTh) + " · T" + selItem.tier + "</span>" +
            "<span class=\"chip\">" + rLabel + "</span>" +
            "<span>คงเหลือ <b>×" + selItem.qty + "</b></span>" +
            "</div></div>" +
            "<button type=\"button\" class=\"inv-detail-close\" data-do=\"shop-close-detail\">✕ ปิด</button>" +
            "</div>" +
            "<div class=\"inv-detail-eff\">✨ <b>ผลลัพธ์/สรรพคุณ:</b> " + esc(selItem.descTh || "-") +
            (selItem.locked ? "<div style=\"color:#ff9e94;margin-top:3px\">🔒 " + esc(selItem.lockReason) + "</div>" : "<div style=\"color:#7ff5ad;margin-top:3px\">✔ " + esc(buyer.h.name.given) + " สามารถทำรายการนี้ได้</div>") +
            "</div>" +
            "<div class=\"inv-detail-actions\">" +
            actBtn +
            "<button type=\"button\" class=\"btn\" data-do=\"shop-toggle-more\">" + (UI.shopMoreOpen ? "▲ ซ่อนรายละเอียด" : "▼ รายละเอียดเพิ่มเติม") + "</button>" +
            "</div>" +
            (UI.shopMoreOpen ? "<div class=\"inv-detail-more\">" + esc(selItem.moreTh || "-") + "</div>" : "") +
            "</div>";
        }
        h += "</div>";
      }
      h += "</div>";

      const need = g.JD.CP.BASIC.map(r => "P:" + r.id);
      h += "<h3>โอสถพื้นฐาน 8 สูตร (หลอมให้สำนัก แจกเป็นสวัสดิการ/ขาย)</h3><div class=\"card\">" + need.map(k => { const sc = g.CPE.scarcity(W, k); return "<div class=\"logrow\"><span>" + esc(ECO.name(k)) + " ×" + ECO.count(W, k) + "</span><b style=\"color:" + (sc > 1.3 ? "#e0584a" : sc < 0.8 ? "#7aa" : "#5fd38a") + "\">ขาย " + g.CPE.priceOf(W, k) + " · รับบริจาค " + Math.round(g.CPE.reward(W, k, 1)) + " คป.</b></div>"; }).join("") + "</div>";
      const herbs = ["MAT_HERB_DEW_GRASS_1", "MAT_HERB_JADE_LOTUS_2", "MAT_HERB_BLOOD_GINSENG_3"]; h += "<h3>ป้ายรับซื้อ (ค่าบริจาคตามความขาด)</h3><div class=\"card\">" + herbs.map(k => "<div class=\"logrow\"><span>" + esc(ECO.name(k)) + " ในคลัง " + ECO.count(W, k) + "</span><b>" + Math.round(g.CPE.reward(W, k, 1)) + " คป./หน่วย</b></div>").join("") + "</div>";
      h += UI.martialShop(W);
      const shop = g.CPE.shopItems(W).filter(i => i.kind !== "crystal").filter(i => !(i.kind === "pill" && i.key.startsWith("P:BASIC"))).slice(0, 24);
      h += "<h3>โอสถและอุปกรณ์พรีเมียม (แลกซื้อด้วย คป. · ไม่อยู่ในสวัสดิการแจกฟรี)</h3><div class=\"card\">";
      h += "<div class=\"muted\" style=\"margin-bottom:6px\">🛡️ โอสถนำเข้าและวิชาพิเศษต้องแลกซื้อด้วยแต้มคุณูปการ (คป.) เท่านั้น จะไม่มีการแจกฟรีเป็นสวัสดิการพื้นฐาน เพื่อรักษาสมดุลคลังสำนัก</div>";
      h += (shop.length ? shop.map(i => "<span class=\"chip " + (i.kind === "gear" ? "b" : "ok") + "\">" + esc(i.kind === "gear" ? i.gear.nameTh : ECO.name(i.key) + " ×" + i.n) + " · " + i.price + " คป.</span>").join("") : "<span class=\"muted\">ยังไม่มีสินค้าพรีเมียม — ผลิตจากหอโอสถ/โรงหลอม หรือนำกลับจากการเดินทาง</span>") + "</div>";
      const tl = W.sect.library.map(id => CULT.tech(id)).filter(t => t && !g.CPE.techFree(W, t)).sort((a, b) => a.tier - b.tier).slice(0, 14); h += "<h3>วิชาที่ต้องใช้แต้มเรียน (วิชาพื้นฐานเรียนฟรี)</h3><div class=\"card\">" + (tl.length ? tl.map(t => "<span class=\"chip b\">" + esc(t.nameTh) + " ระดับ" + t.tier + " · " + g.CPE.techPrice(W, t) + "</span>").join("") : "<span class=\"muted\">ไม่มี</span>") + "</div>";
      h += "<h3>บันทึกคุณูปการ</h3><div class=\"card\">" + (c.log.slice(-12).reverse().map(l => "<div class=\"logrow\"><span class=\"tm\">" + dayStamp(l.t) + "</span>" + esc(l.text) + "</div>").join("") || "<span class=\"muted\">ยังไม่มี</span>") + "</div>";
      if (g.EXT) {
        const ext = g.EXT, visitors = ext.activeVisitors(W), stats = (W.world && W.world.marketStats) || {}, history = (W.world.tradeHistory || []).slice(-8).reverse();
        h += "<h3>🪙 ตลาดภายนอก · ใช้หินวิญญาณ</h3><div class=\"card\"><div class=\"muted\">สมาชิกซื้อขายกับสำนักด้วยแต้มคุณูปการ ส่วนการค้ากับพ่อค้าภายนอกใช้หินวิญญาณและตัดสต็อกจริง</div>";
        h += "<div class=\"grid2\"><div>หินวิญญาณสำนัก <b>" + U.fmtNum(Math.round(S.stones)) + "</b></div><div>จำนวนผู้มาเยือนสะสม <b>" + (stats.visits || 0) + "</b></div><div>สำนักซื้อจากคนนอก <b>" + (stats.sectBought || 0) + " หน่วย</b></div><div>สำนักขายให้คนนอก <b>" + (stats.sectSold || 0) + " หน่วย</b></div><div>เงินจ่ายซื้อเข้า <b>" + U.fmtNum(stats.sectStonesOut || 0) + " ศิลา</b></div><div>เงินรับจากขายออก <b>" + U.fmtNum(stats.sectStonesIn || 0) + " ศิลา</b></div></div></div>";
        if (visitors.length) {
          h += "<h3>พ่อค้าที่กำลังแวะสำนัก</h3>" + visitors.map(v => {
            const stock = Object.keys(v.stock || {}).filter(k => v.stock[k] > 0).slice(0, 5).map(k => esc(ECO.name(k)) + " ×" + v.stock[k] + " · " + ext.quotePrice(W, k, "member-buy") + " ศิลา").join(" · ");
            const wants = Object.keys(v.wants || {}).filter(k => v.wants[k] > 0).slice(0, 5).map(k => esc(ECO.name(k)) + " ×" + v.wants[k]).join("、");
            return "<div class=\"card\"><b>" + esc(v.nameTh) + "</b> <span class=\"chip\">อยู่ได้อีก " + Math.max(0, v.untilDay - W.day + 1) + " วัน</span><div class=\"sub\">เงินทุน " + U.fmtNum(v.stones) + " ศิลา</div><div class=\"sub\">เสนอขาย: " + (stock || "สินค้าหมด") + "</div><div class=\"sub\">รับซื้อ: " + (wants || "ไม่มีความต้องการคงเหลือ") + "</div></div>";
          }).join("");
        } else h += "<div class=\"card muted\">ไม่มีพ่อค้าอยู่ในขณะนี้ · ผู้มาเยือนจะเข้ามาตามชื่อเสียงสำนัก นโยบายเปิดรับ และสภาพเส้นทาง</div>";
        h += "<h3>ธุรกรรมภายนอกล่าสุด</h3><div class=\"card\">" + (history.length ? history.map(t => "<div class=\"logrow\"><span class=\"tm\">วันที่ " + t.day + "</span><span>" + (t.side === "sect-buy" ? "สำนักซื้อ" : t.side === "sect-sell" ? "สำนักขาย" : t.side === "member-buy" ? esc(t.npcName || "สมาชิก") + " ซื้อ" : esc(t.npcName || "สมาชิก") + " ขาย") + esc(ECO.name(t.itemId)) + " ×" + t.qty + " กับ" + esc(t.traderName) + "</span><b>" + t.total + " ศิลา</b></div>").join("") : "<span class=\"muted\">ยังไม่มีการซื้อขายภายนอก</span>") + "</div>";
      }
    } else if (tab === 'bld') {
      const pop = SECT.memberOccupancy ? SECT.memberOccupancy(W) : W.npcs.filter(n => !n.dead).length;
      const cap = SECT.housingCapacity ? SECT.housingCapacity(W) : 46;
      h += '<div class="card"><b>🏠 ความจุที่พักสำนัก: ' + pop + '/' + cap + ' เตียง</b> <span class="muted">(ขยายเรือนพักทั้ง 3 แห่งได้สูงสุดรวม 100 เตียง)</span></div>';
      h += W.map.buildings.filter(b => b.type !== 'plaza').map(b => {
        const fd = S.facilityDemand && S.facilityDemand[b.id];
        const maxL = SECT.maxBuildingLevel ? SECT.maxBuildingLevel(b) : 3;
        const isDorm = SECT.HOUSING_IDS && SECT.HOUSING_IDS.includes(b.id);
        const maxBeds = isDorm && SECT.FACILITY_SPECS[b.id] ? SECT.FACILITY_SPECS[b.id].bedsByLevel[maxL] : 0;
        const congText = fd && (fd.congestedHours >= 2 || fd.failedAttempts >= 2) ? ' · <span style="color:#f0a030">⚠️ แออัด (' + fd.congestedHours + ' ชม./พลาด ' + fd.failedAttempts + ')</span>' : '';
        return '<div class="prow" data-bld="' + b.id + '"><div style="font-size:24px;width:40px;text-align:center">' + MAP.BTYPES[b.type].icon + '</div><div class="pi"><div class="nm">' + esc(b.nameTh) + ' <span class="chip g">ระดับ ' + b.level + '/' + maxL + '</span></div><div class="sub">' + (b.building ? '🚧 กำลังขยายเป็นระดับ ' + b.building.to + '/' + maxL : (isDorm ? 'เตียงพัก ' + b.stations.length + ' เตียง (สูงสุด ' + maxBeds + ') · ' : 'ใช้งานอยู่ ' + (b.inside ? b.inside.length : 0) + '/' + b.stations.length + ' จุด · ') + 'สภาพ ' + Math.round(b.hp) + '%' + congText) + '</div></div></div>';
      }).join('');
    }
    return h;
  };

  UI.rBuilding = () => {
    const W = UI.G.W, b = W.map.byId[UI.bldId]; if (!b) return ''; const bt = MAP.BTYPES[b.type];
    const maxL = SECT.maxBuildingLevel ? SECT.maxBuildingLevel(b) : 3;
    const isDorm = SECT.HOUSING_IDS && SECT.HOUSING_IDS.includes(b.id);
    const maxBeds = isDorm && SECT.FACILITY_SPECS[b.id] ? SECT.FACILITY_SPECS[b.id].bedsByLevel[maxL] : 0;
    const inside = (b.inside || []).map(id => W.byId[id]).filter(Boolean); const around = W.npcs.filter(n => !n.dead && !n.away && !n.hidden && n.x >= b.x - 2 && n.x <= b.x + b.w + 2 && n.y >= b.y - 1 && n.y <= b.y + b.h + 5);
    const bSub = UI.buildingSubTab || 'OVERVIEW';
    const bSubTabs = [
      ['OVERVIEW', '🏯 ภาพรวม & ผู้ใช้งาน'],
      ['FENGSHUI', '☯️ ฮวงจุ้ย & ชีพจรปราณ'],
      ['ACTIVITIES', '⚙️ กิจกรรม & มรดกอาคาร'],
      ['ALL', '📋 ดูทั้งหมด']
    ];
    let h = renderSubTabBar('set-building-subtab', bSub, bSubTabs, 'หมวดย่อยข้อมูลอาคารสำนัก');
    h += '<div class="subcat-pane" data-subcat="OVERVIEW"' + ((bSub === 'ALL' || bSub === 'OVERVIEW') ? '' : ' style="display:none"') + '>';
    h += '<div class="card">' + buildingShowcaseHtml(b, 210, 92) + '<div style="font-size:30px">' + bt.icon + '</div><div>' + esc(bt.desc) + '</div><div class="muted">ระดับ ' + b.level + '/' + maxL + ' · สภาพ ' + Math.round(b.hp) + '% · ' + (isDorm ? ('เตียงพัก ' + b.stations.length + '/' + maxBeds + ' เตียง') : ('จุดกิจกรรม ' + b.stations.length)) + '</div></div>';
    if ((b.id === 'scripture' || b.id === 'main_hall') && SECT.PATH_LIBRARY) {
      const plSum = SECT.PATH_LIBRARY.getSummary(W);
      h += '<h3>📚 หอคัมภีร์มหาวิถีประจำสำนัก (ปลดล็อกแล้ว ' + plSum.unlockedCount + '/' + plSum.totalPaths + ' มหาวิถี)</h3><div class="card" style="border-color:var(--gold)">';
      h += '<div class="muted" style="margin-bottom:6px">คนธรรมดาและศิษย์ในสำนักสามารถศึกษาและเปิดเส้นลมปราณได้เฉพาะมหาวิถีที่มีคัมภีร์ต้นกำเนิดในหอคัมภีร์สำนัก (หรือใช้ผลึกมรดกวิถีชี้แนะโดยตรง)</div>';
      h += '<div style="display:flex;gap:4px;flex-wrap:wrap">' + plSum.unlockedPaths.map(pid => { const pd = CULT.PATHS[pid]; return '<span class="chip ok">' + esc((pd && pd.icon) || '☯') + ' ' + esc((pd && pd.nameTh) || pid) + '</span>'; }).join('') + '</div>';
      if (plSum.lockedPaths.length) {
        h += '<div class="muted" style="font-size:11px;margin-top:6px">🔒 มหาวิถีที่ยังไม่มีคัมภีร์ในสำนัก (' + plSum.lockedPaths.length + ' วิถี): ค้นหาได้จากเจดีย์ 27 วิถี, คาราวานพ่อค้าแดนไกล, บรรณาการสำนักพันธมิตร หรือโบราณสถาน</div>';
      }
      h += '</div>';
    }
    h += '</div><div class="subcat-pane" data-subcat="FENGSHUI"' + ((bSub === 'ALL' || bSub === 'FENGSHUI') ? '' : ' style="display:none"') + '>';
    if (SECT.FENG_SHUI) {
      const fs = SECT.FENG_SHUI.ensure(W);
      const fn = fs && fs.nodes && fs.nodes[b.id];
      if (fn) {
        const em = SECT.FENG_SHUI.ELEMENT_META[fn.coreElement] || { icon: '☯️', nameTh: fn.coreElement };
        h += '<div class="card" style="border-color:var(--gold)"><div><b>☯️ ฮวงจุ้ยเส้นชีพจรปราณประจำอาคาร: เกรด ' + esc(fn.grade) + ' (' + fn.fengShuiScore + '/100)</b> <span class="chip g">' + em.icon + ' ' + esc(em.nameTh) + '</span> <span class="chip ok">เร่งตบะ/งาน ×' + (fn.cultMult || 1).toFixed(2) + '</span></div>';
        if (fn.attunedByNameTh) h += '<div class="muted" style="font-size:11.5px;margin-top:2px">ผู้วางแกนค่ายกล: <b>' + esc(fn.attunedByNameTh) + '</b> (วันที่ ' + fn.attunedDay + ')</div>';
        if (fn.synergyLinks && fn.synergyLinks.length) h += '<div class="muted" style="font-size:11.5px">อาคารข้างเคียงเกื้อหนุน: ' + fn.synergyLinks.map(l => esc(l.targetNameTh) + ' (' + esc(l.relationTh) + ')').join(' · ') + '</div>';
        h += '<div style="margin-top:5px;display:flex;gap:4px;flex-wrap:wrap">' + ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER', 'ASTRAL', 'BLOOD'].map(elKey => '<button class="btn" style="padding:2px 6px;font-size:10.5px" data-do="attune-building-leyline" data-arg="' + esc(b.id) + '|' + elKey + '">ฝังแกน ' + esc((SECT.FENG_SHUI.ELEMENT_META[elKey] || {}).nameTh || elKey) + '</button>').join('') + '</div></div>';
      }
    }
    h += '</div><div class="subcat-pane" data-subcat="ACTIVITIES"' + ((bSub === 'ALL' || bSub === 'ACTIVITIES' || bSub === 'OVERVIEW') ? '' : ' style="display:none"') + '>';
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"><button class="btn pri" data-do="locb" data-arg="' + b.id + '">📍 ไปที่สถานที่นี้</button>';
    if (g.FISHING && ['spirit_pond', 'river_dock', 'river_west', 'river_east'].includes(b.id)) {
      const zid = b.zoneId || (b.id === 'river_dock' ? 'river_central' : b.id);
      h += '<button class="btn" data-do="fish-at-zone" data-arg="' + zid + '">🎣 ส่งตัวละครมาตกปลาที่นี่</button></div>';
      const f = g.FISHING.ensure(W);
      const zdef = g.FISHING.ZONES[zid];
      const zst = f && f.zones && f.zones[zid];
      if (zdef && zst) {
        const spList = g.FISHING.SPECIES.filter(s => s.habitats.includes(zid));
        h += '<h3>🐟 นิเวศแหล่งน้ำและประชากรปลา</h3><div class="card">';
        h += bar('ความอุดมสมบูรณ์ของปลา', zst.stock, { max: zst.maxStock, txt: zst.stock + '/' + zst.maxStock + ' (ฟื้น +' + zst.dailyRegen + '/วัน)', wide: true, color: '#38a3a5' });
        h += '<div class="muted" style="margin-top:4px">โอกาสเมื่อตกสำเร็จ: <b>ปลา 90.0%</b> · <b>หีบไม้โบราณแช่น้ำ 10.0%</b> (เปิดหีบ: ขยะ 50% / ของทั่วไป 49.5% / ตำนาน 0.5%)</div>';
        h += '<div style="margin-top:6px"><b>สายพันธุ์ปลาประจำแหล่งน้ำนี้ (' + spList.length + ' ชนิด):</b></div>';
        h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">' + spList.map(sp => '<span class="chip ' + (sp.tier >= 4 ? 'v' : sp.tier === 3 ? 'ok' : 'b') + '">' + esc(sp.nameTh) + ' (T' + sp.tier + ')</span>').join('') + '</div>';
        h += '</div>';
      }
    } else {
      h += '</div>';
    }
    if (inside.length) h += '<h3>อยู่ข้างใน (' + inside.length + ')</h3>' + inside.map(n => '<div class="prow" data-npc="' + n.id + '">' + portraitHtml(n, 36) + '<div class="pi"><div class="nm">' + esc(HC.fullName(n)) + '</div><div class="sub">' + esc(actText(n)) + '</div></div></div>').join('');
    if (around.length) h += '<h3>อยู่บริเวณนี้ (' + around.length + ')</h3>' + around.map(n => '<div class="prow" data-npc="' + n.id + '">' + portraitHtml(n, 36) + '<div class="pi"><div class="nm">' + esc(HC.fullName(n)) + '</div><div class="sub">' + esc(actText(n)) + '</div></div></div>').join('');
    if (b.type === 'alchemy' || b.type === 'forge') { const o = W.sect.orders && W.sect.orders[b.id]; const r = o ? ECO.recipeById[o.rid] : null; h += '<h3>คำสั่งผลิตปัจจุบัน</h3><div class="card">' + (r ? esc(r.outNameTh) + ' — ' + esc(o.why || '') : 'ไม่มี') + '</div>'; }
    if (b.id === 'ancestral' || b.id === 'shrine' || b.type === 'ancestral') {
      const tablets = (SECT.ensureLegacyTablets ? SECT.ensureLegacyTablets(W) : (W.sect.legacyTablets || []));
      h += '<h3>🕯️ ป้ายวิญญาณมรดกบรรพชน (' + tablets.length + ')</h3><div class="card">' + (tablets.length ? tablets.map(t => '<details class="ancestor-card"><summary>🕯️ <b>' + esc(t.nameTh) + '</b> <span class="chip g">' + esc(t.subpathNameTh || t.path) + '</span></summary>' + UI.ancestorProfile(W,t) + '</details>').join('') : '<span class="muted">ยังไม่มีป้ายวิญญาณมรดกของผู้อาวุโสระดับสูง</span>') + '</div>';
      h += '<details class="lineage-chronicle"><summary>📜 ประวัติการสืบทอดของสำนัก</summary>' + UI.lineageHistory(W) + '</details>';
      h += '<details class="lineage-chronicle"><summary>🌳 ผังอาจารย์–ศิษย์</summary>' + UI.lineageTree(W) + '</details>';
      const tribState = SECT.ensureCelestialTribulation ? SECT.ensureCelestialTribulation(W) : { active: null, history: [] };
      const legacyBonus = SECT.ascensionCultivationMultiplier ? Math.round((SECT.ascensionCultivationMultiplier(W) - 1) * 100) : 0;
      h += '<h3>⚡ ด่านเคราะห์สวรรค์และจุติ</h3><div class="card"><div>จุติแล้ว ' + (W.sect.ascendedLegacyCount || 0) + ' ท่าน · พรสืบทอดเร่งการบ่มเพาะ +' + legacyBonus + '% (สูงสุด 5%)</div>';
      if (tribState.active) {
        const at = tribState.active;
        const helpers = (at.supportIds || []).map(id => W.byId[id]).filter(Boolean).map(n => esc(HC.fullName(n))).join('、');
        h += '<div style="margin-top:5px"><b>กำลังเตรียมพิธีให้ ' + esc(at.candidateNameTh || '') + '</b> · เหลือ ' + Math.max(0, at.resolveDay - W.day) + ' วัน</div><div class="muted">ศิษย์หนุนค่ายกล: ' + (helpers || 'ไม่มี') + ' · โอกาสสำเร็จ ' + Math.round((at.chance || 0) * 100) + '%</div>';
      } else {
        const eligible = (W.npcs || []).map(n => ({ n, check: SECT.canBeginCelestialTribulation ? SECT.canBeginCelestialTribulation(W, n) : { ok: false } })).filter(x => x.check.ok);
        h += '<div class="muted" style="margin:4px 0 8px">ต้องถึงขั้นสูงสุดของวิถี (เทียบเคียงขั้น 9) มีศิษย์ช่วยอย่างน้อย 2 คน และใช้ศิลาสำนัก 500 ศิลา · พิธีใช้เวลา 3 วัน · สามารถเลือกใช้โอสถฟื้นฟูจากคลังได้</div>';
        h += eligible.length ? eligible.map(({ n, check }) => '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:5px 0;border-top:1px solid var(--line,#3a3f4a)"><span>' + esc(HC.fullName(n)) + ' · ' + esc(n.cult.path) + ' ขั้น ' + n.cult.stage + '/' + CULT.maxStage(n) + '</span><span><button type="button" class="btn pri" data-do="begin-tribulation" data-arg="' + esc(n.id) + '|no-medicine">เริ่มพิธี</button>' + (check.medicineId ? ' <button type="button" class="btn" data-do="begin-tribulation" data-arg="' + esc(n.id) + '|medicine">เริ่มพิธี + ใช้โอสถ</button>' : '') + '</span></div>').join('') : '<span class="muted">ยังไม่มีผู้ฝึกตนที่พร้อมเริ่มพิธี</span>';
      }
      const ascHistory = Array.isArray(W.sect.ascendedLegacyHistory) ? W.sect.ascendedLegacyHistory.slice(0, 5) : [];
      if (ascHistory.length) h += '<div class="muted" style="margin-top:7px">จารึกจุติล่าสุด: ' + ascHistory.map(r => esc(r.candidateNameTh) + ' (' + esc(r.path) + ')').join(' · ') + '</div>';
      h += '</div>';
    }
    h += '</div>';
    return h;
  };

  /* ----- บันทึก ----- */
  function isDailyPillLog(l) {
    if (!l || !l.text) return false;
    if (l.txKind === 'gift' || l.txKind === 'purchase' || l.txKind === 'sale' || l.txKind === 'player-spawn') return false;
    return /กินโอสถ|ใช้โอสถพื้นฐาน|สวัสดิการโอสถ/.test(l.text);
  }
  function matchesLogSubFilter(l, sub) {
    if (!sub || sub === 'all') return true;
    if (sub === 'no_pill') return !isDailyPillLog(l);
    if (sub === 'gift') return l.txKind === 'gift' || l.type === 'gear' || /\[มอบของรางวัล\]|จัดสรรโอสถ|มอบอุปกรณ์|มอบผลึก/.test(l.text || '');
    if (sub === 'trade') return l.txKind === 'purchase' || l.txKind === 'sale' || l.type === 'shop' || /\[ซื้อสินค้า\]|สั่งซื้อ|ขายส่วนเกิน/.test(l.text || '');
    if (sub === 'spawn') return l.txKind === 'player-spawn' || l.txKind === 'player-edit' || l.txKind === 'player-edit-undo' || /\[(เสก|แก้ไข)โดยผู้เล่น\]/.test(l.text || '');
    return true;
  }

  UI.ancestorProfile = (W, tablet) => {
    const t=tablet || {}, profile=t.profile || {}, id=t.npcId;
    let h='<div class="ancestor-profile"><b>' + esc(profile.nameTh || t.nameTh || 'บรรพชน') + '</b>';
    h+='<div class="muted">' + esc(t.titleTh || '') + (t.subpathNameTh ? ' · ' + esc(t.subpathNameTh) : '') + (t.stage ? ' · ขั้น ' + esc(t.stage) : '') + '</div>';
    if (t.signatureTechNameTh) h+='<div>📖 วิชาเอก: ' + esc(t.signatureTechNameTh) + '</div>';
    if (t.causeTh) h+='<div>🕯️ ' + esc(t.causeTh) + ' · วันที่จารึก ' + esc(t.inscribedDay) + '</div>';
    h+='<div class="muted">พรทะลวง +' + Math.round((t.breakthroughBonus || 0)*100) + '% · ความเข้าใจคัมภีร์ +' + Math.round((t.comprehensionBonus || 0)*100) + '% · สักการะ ' + (t.prayersCount || 0) + ' ครั้ง</div>';
    if (profile.mentorNameTh) h+='<div>🎓 อาจารย์: ' + esc(profile.mentorNameTh) + '</div>';
    const students=(profile.disciples || []).filter(d => d && d.nameTh);
    if (students.length) h+='<div>👥 ศิษย์ที่บันทึกไว้: ' + students.map(d => esc(d.nameTh)).join(' · ') + '</div>';
    if (profile.merit != null) h+='<div>🏅 ผลงานสะสมเมื่อจารึก: ' + esc(profile.merit) + '</div>';
    const events=profile.events || [];
    if (events.length) h+='<div class="ancestor-events"><b>📜 เหตุการณ์ที่บันทึกไว้</b>' + events.map(e => '<div class="lineage-entry"><span class="lineage-date">' + dayStamp(e.t) + '</span> ' + esc(e.text) + '</div>').join('') + '</div>';
    else h+='<div class="muted">ไม่มีข้อมูลเหตุการณ์ที่บันทึกไว้สำหรับบุคคลนี้</div>';
    if (id) h+='<details class="lineage-chronicle"><summary>🎓 สายสืบทอดที่เกี่ยวข้อง</summary>' + UI.lineageTree(W,id) + UI.lineageHistory(W,id) + '</details>';
    return h+'</div>';
  };

  UI.lineageTree = (W, npcId) => {
    const ms = W.sect && W.sect.mentorship || {}, nodes = new Map(), edges = new Map();
    const add = (mentorId, mentorName, discipleId, discipleName, active) => {
      if (!mentorId || !discipleId || mentorId === discipleId) return;
      if (!nodes.has(mentorId)) nodes.set(mentorId, mentorName || 'ไม่ทราบชื่อ');
      if (!nodes.has(discipleId)) nodes.set(discipleId, discipleName || 'ไม่ทราบชื่อ');
      const key = mentorId + '|' + discipleId, old = edges.get(key);
      edges.set(key, {mentorId, discipleId, active:!!active || !!(old && old.active)});
    };
    const isActive = (mentorId,discipleId) => {
      const mentor=W.byId && W.byId[mentorId], disciple=W.byId && W.byId[discipleId];
      return !!(mentor && disciple && !mentor.dead && !disciple.dead && !mentor.exiled && !disciple.exiled && (W.npcs || []).includes(mentor) && (W.npcs || []).includes(disciple) && (disciple.mentorId || disciple.mentor) === mentorId);
    };
    (W.npcs || []).forEach(disciple => {
      const mentor = W.byId && W.byId[disciple.mentorId || disciple.mentor];
      if (mentor) add(mentor.id,HC.fullName(mentor),disciple.id,HC.fullName(disciple),isActive(mentor.id,disciple.id));
    });
    Object.values(ms.bonds || {}).forEach(b => b && add(b.mentorId,b.mentorNameTh,b.discipleId,b.discipleNameTh,isActive(b.mentorId,b.discipleId)));
    (ms.history || []).filter(e => e && e.kind === 'bond').forEach(e => add(e.mentorId,e.mentorNameTh,e.discipleId,e.discipleNameTh,isActive(e.mentorId,e.discipleId)));
    if (!nodes.size) return '<div class="muted">ยังไม่มีสายสืบทอดที่บันทึกไว้</div>';
    const es = [...edges.values()]; let allowed = new Set(nodes.keys());
    if (npcId) {
      allowed = new Set([npcId]); let changed = true;
      while (changed) { changed=false; es.forEach(e => { if (allowed.has(e.mentorId) || allowed.has(e.discipleId)) for (const id of [e.mentorId,e.discipleId]) if (!allowed.has(id)) {allowed.add(id);changed=true;} }); }
    }
    const relevant = es.filter(e => allowed.has(e.mentorId) && allowed.has(e.discipleId));
    let roots = [...allowed].filter(id => nodes.has(id) && !relevant.some(e => e.discipleId === id));
    if (!roots.length) roots = [...allowed].filter(id => nodes.has(id)).slice(0,1);
    let rendered=0;
    const person = id => W.byId && W.byId[id] && !W.byId[id].dead && !W.byId[id].exiled ? nameLink(W.byId[id]) : esc(nodes.get(id));
    const draw = (id, seen, depth) => {
      if (seen.has(id) || depth > 12 || rendered++ >= 200) return '<li class="muted">…</li>';
      const next = new Set(seen); next.add(id);
      const children = relevant.filter(e => e.mentorId === id);
      return '<li><span class="lineage-node">' + person(id) + (id === npcId ? ' <small>· บุคคลนี้</small>' : '') + '</span>' + (children.length ? '<ul>' + children.map(e => '<li><small class="lineage-edge">' + (e.active ? 'ศิษย์ปัจจุบัน' : 'เคยเป็นศิษย์') + '</small><ul>' + draw(e.discipleId,next,depth+1) + '</ul></li>').join('') + '</ul>' : '') + '</li>';
    };
    return '<p class="muted">แสดงสายที่มีข้อมูลในปัจจุบันและประวัติที่บันทึกไว้</p><div class="lineage-tree"><ul>' + roots.map(id => draw(id,new Set(),0)).join('') + '</ul></div>';
  };
  UI.sectChronicle = (W, category, npcId) => {
    const cats = {
      people: ["death","marriage","recruit","expel","succession"],
      cult: ["breakthrough","heal"],
      battle: ["raid","tournament","mission","challenge","duel"],
      heritage: ["legacy","research","craft","decision"],
      economy: ["finance"]
    };
    const all = ((W.sect && W.sect.sectChronicle) || []).slice();
    const known = new Set(all.map(e => e.id));
    (W.logs || []).forEach(e => {
      if (!known.has(e.id) && matchesLogSubFilter(e, UI.logSubFilter) && (cats.people.includes(e.type) || cats.cult.includes(e.type) || cats.battle.includes(e.type) || cats.heritage.includes(e.type) || cats.economy.includes(e.type))) {
        all.push(e);
      }
    });
    const scSearch = (UI.sectChronicleSearch || "").trim().toLowerCase();
    const filtered = all.filter(e => {
      if (!matchesLogSubFilter(e, UI.logSubFilter)) return false;
      if (category && category !== "all" && !(cats[category] || []).includes(e.type)) return false;
      if (npcId && !(e.ids || []).includes(npcId)) return false;
      if (scSearch) {
        const hay = ((e.text || "") + " " + ((e.names || []).join(" ")) + " " + ((e.combatSummary && e.combatSummary.summaryLineTh) || "")).toLowerCase();
        if (!hay.includes(scSearch)) return false;
      }
      return true;
    }).sort((a, b) => b.t - a.t || b.id - a.id);
    if (!filtered.length) return "<div class=\"muted\">ยังไม่มีเหตุการณ์ในเงื่อนไขนี้</div>";
    const limit = Math.max(20, UI.sectChronicleLimit || 50);
    const shown = filtered.slice(0, limit);
    let html = shown.map(e => {
      const refs = Array.isArray(e.names) && Array.isArray(e.ids)
        ? e.ids.map((id, idx) => e.names[idx] ? ({ kind: "npc", id, label: e.names[idx], fullName: e.names[idx] }) : null).filter(Boolean)
        : undefined;
      const cs = e.combatSummary || (e.meta && e.meta.combatSummary);
      const csHtml = cs && cs.summaryLineTh
        ? ("<div class=\"muted\" style=\"font-size:11px;margin-top:2px;color:#8ecae6\">⚔️ " + esc(cs.summaryLineTh) + "</div>")
        : "";
      return "<div class=\"lineage-entry\"><span class=\"lineage-date\">" + dayStamp(e.t) + "</span> " + linkify(W, e.text, e.ids, refs) + csHtml + "</div>";
    }).join("");
    if (filtered.length > shown.length) {
      html += "<div style=\"margin-top:6px\"><button type=\"button\" class=\"btn\" style=\"padding:3px 10px;font-size:11px\" data-do=\"sect-chronicle-more\">แสดงเพิ่มเติม (" + (filtered.length - shown.length) + " รายการ)</button></div>";
    }
    return html;
  };
  UI.lineageHistory = (W, npcId) => {
    const list = ((W.sect && W.sect.mentorship && W.sect.mentorship.history) || []).filter(e => e && (!npcId || e.mentorId === npcId || e.discipleId === npcId)).slice(0, 30);
    if (!list.length) return '<div class="muted">ยังไม่มีเหตุการณ์สายสืบทอดที่บันทึกไว้</div>';
    const person = (id, name) => W.byId && W.byId[id] && !W.byId[id].dead && !W.byId[id].exiled ? nameLink(W.byId[id]) : '<b>' + esc(name || 'ไม่ทราบชื่อ') + '</b>';
    return list.map(e => '<div class="lineage-entry"><span class="lineage-date">วันที่ ' + esc(e.day) + '</span> ' + (e.kind === 'bond' ? '🍵 ' + person(e.discipleId,e.discipleNameTh) + ' ฝากตัวเป็นศิษย์ของ ' + person(e.mentorId,e.mentorNameTh) : '✨ ' + person(e.mentorId,e.mentorNameTh) + ' ถ่ายทอดปราณให้ ' + person(e.discipleId,e.discipleNameTh) + ' · ตบะ +' + esc(e.surgePts) + (e.inheritedTechId ? ' · วิชา「' + esc((CULT.tech(e.inheritedTechId) || {}).nameTh || e.inheritedTechId) + '」' : '') + (e.occasion === 'dying' ? ' · ก่อนสิ้นชีวิต' : e.occasion === 'ascension' ? ' · ก่อนขึ้นสู่แดนเซียน' : '')) + '</div>').join('');
  };

  UI.rLog = () => {
    const W = UI.G.W;
    if (!UI.logFilters) UI.logFilters = new Set([(UI.tab && LOG_GROUPS[UI.tab]) ? UI.tab : 'all']);
    if (UI.tab && LOG_GROUPS[UI.tab] && (!UI.logFilters.has(UI.tab) && UI.logFilters.size === 1 && UI.logFilters.has('all') && UI.tab !== 'all')) {
      UI.logFilters = new Set([UI.tab]);
    }

    let h = '<div class="log-filter-bar" style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px">';
    for (const k in LOG_GROUPS) {
      const active = UI.logFilters.has(k);
      h += '<button type="button" class="chip ' + (active ? 'ok' : '') + '" data-do="logfilter" data-arg="' + k + '" style="cursor:pointer;padding:6px 11px;font-size:12px;' + (active ? 'border-color:var(--gold);font-weight:bold;background:rgba(233,205,133,.18)' : '') + '">' + LOG_GROUPS[k][0] + '</button>';
    }
    h += '</div>';

    if (UI.logFilters.has('all')) h += '<details class="lineage-chronicle"><summary>📜 พงศาวดารสายสืบทอด</summary>' + UI.lineageHistory(W) + '</details>';
    if (UI.logFilters.has('all')) {
      const filter = UI.chronicleFilter || 'all', id = UI.chronicleNpcId;
      h += '<details class="lineage-chronicle" open><summary>📖 พงศาวดารสำนัก</summary><div class="chronicle-filters">' + [['all','ทั้งหมด'],['people','👥 ผู้คน'],['cult','✨ ทะลวง/จิตใจ'],['battle','⚔️ ศึก'],['heritage','🗡️ คัมภีร์/ศาสตรา/ฮวงจุ้ย'],['economy','🐪 การค้า/ประมูล']].map(([k,v]) => '<button class="btn ' + (filter === k ? 'pri' : '') + '" data-do="chronicle-filter" data-arg="' + k + '">' + v + '</button>').join('') + '</div>';
      if (id) {
        const pName = (W.byId[id] && HC.fullName(W.byId[id])) || (W.sect && W.sect.historicalPeople && W.sect.historicalPeople[id] && W.sect.historicalPeople[id].fullName) || "บุคคลที่เลือก";
        h += "<div class=\"lineage-note\">กำลังดูเหตุการณ์ของ " + esc(pName) + " <button class=\"btn\" data-do=\"chronicle-clear-person\">ดูทุกคน</button></div>";
      }
      h += "<div style=\"margin:6px 0\"><input id=\"sectChronicleSearch\" type=\"search\" placeholder=\"ค้นหาเหตุการณ์/ชื่อศิษย์/วิชาในพงศาวดารสำนัก…\" value=\"" + esc(UI.sectChronicleSearch || "") + "\" style=\"font-size:11.5px;padding:4px 8px;width:100%\"></div>";
      h += "<div class=\"lineage-note\">บันทึกเหตุการณ์สำคัญใหม่และรายการเดิมที่ยังอยู่ในบันทึก</div>" + UI.sectChronicle(W,filter,id) + "</details>";
      h += '<details class="lineage-chronicle" data-chronicle-tree><summary>🌳 ผังสายสืบทอดของสำนัก</summary>' + UI.lineageTree(W) + '</details>';
      if (SECT && SECT.getHistoricalTimeline) {
        const tlFilter = UI.timelineFilter || 'all';
        const tlList = SECT.getHistoricalTimeline(W, tlFilter);
        const tlCats = [
          ['all', 'ทั้งหมด'],
          ['FOUNDING', '🏛️ ก่อตั้งสำนัก'],
          ['SUCCESSION', '👑 เจ้าสำนักแต่ละรุ่น'],
          ['ASCENSION', '🌩️ บรรลุเซียน'],
          ['WAR_VICTORY', '⚔️ ศึกใหญ่/ทวงคืน'],
          ['LEGENDARY_CRAFT', '🗡️ ศาสตราตำนาน'],
          ['COMPANION_BLOODLINE', '💞 คู่บำเพ็ญ/ทายาท']
        ];
        h += '<details class="lineage-chronicle" open data-sect-timeline><summary>🏛️ ทำเนียบประวัติศาสตร์สำนัก & ไทม์ไลน์ยุคสมัย (Interactive Chronicle Timeline · ' + tlList.length + ' หมุดหมาย)</summary>';
        h += '<div class="card" style="border-color:var(--gold);background:rgba(233,205,133,0.05);margin-top:6px">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px">';
        h += '<div style="display:flex;gap:4px;flex-wrap:wrap">' + tlCats.map(([tk, tv]) => '<button type="button" class="btn ' + (tlFilter === tk ? 'pri' : '') + '" style="padding:2px 7px;font-size:11px" data-do="timeline-filter" data-arg="' + tk + '">' + tv + '</button>').join('') + '</div>';
        h += '<div style="display:flex;gap:4px;align-items:center"><button type="button" class="btn" style="padding:2px 7px;font-size:11px" data-do="toggle-audio">' + (UI.audio && UI.audio.muted ? '🔇 เปิดเสียงบรรยากาศ' : '🔊 ปิดเสียงบรรยากาศ') + '</button><button type="button" class="btn" style="padding:2px 6px;font-size:10.5px" data-do="play-audio-demo" data-arg="bell" title="ทดสอบเสียงระฆังทองสำนัก">🔔 ระฆัง</button><button type="button" class="btn" style="padding:2px 6px;font-size:10.5px" data-do="play-audio-demo" data-arg="guqin" title="ทดสอบเสียงพิณโบราณ">🎶 พิณ</button><button type="button" class="btn" style="padding:2px 6px;font-size:10.5px" data-do="play-audio-demo" data-arg="blade" title="ทดสอบเสียงศาสตราปะทะ">⚔️ ศาสตรา</button></div>';
        h += '</div>';
        if (!tlList.length) {
          h += '<div class="muted">ยังไม่มีหมุดหมายประวัติศาสตร์ในหมวดที่เลือก</div>';
        } else {
          const tlLim = Math.max(15, UI.timelineLimit || 25);
          const tlShown = tlList.slice(0, tlLim);
          h += "<div class=\"timeline-stream\" style=\"border-left:2px solid var(--gold);padding-left:10px;margin-left:4px\">" + tlShown.map(item => "<div class=\"timeline-node\" style=\"padding:5px 0;border-bottom:1px dotted var(--line,#3a3f4a)\"><div><span class=\"chip g\">ปีที่ " + item.year + " เดือน " + item.month + " · รุ่นที่ " + (item.generation || 1) + "</span> <span class=\"chip b\">" + esc(item.typeNameTh) + "</span>" + (item.reportFormatTh ? (" <span class=\"chip\">" + esc(item.reportFormatTh) + "</span>") : "") + " <b>" + esc(item.icon || "🏛️") + " " + esc(item.titleTh) + "</b></div>" + (item.descTh ? "<div class=\"muted\" style=\"font-size:11.5px;margin-top:2px\">" + linkify(W, item.descTh, item.involvedIds) + "</div>" : "") + (item.originCauseTh ? "<div class=\"muted\" style=\"font-size:10.5px;margin-top:1px\">🌱 <b>แหล่งที่มา:</b> " + esc(item.originCauseTh) + "</div>" : "") + (item.systemImpactTh && item.systemImpactTh !== item.descTh ? "<div class=\"muted\" style=\"font-size:10.5px;color:#8ecae6\">🔗 <b>ผลกระทบเชื่อมโยง:</b> " + esc(item.systemImpactTh) + "</div>" : "") + "</div>").join("") + "</div>";
          if (tlList.length > tlShown.length) {
            h += "<div style=\"margin-top:6px\"><button type=\"button\" class=\"btn\" style=\"padding:3px 10px;font-size:11px\" data-do=\"timeline-more\">แสดงหมุดหมายเพิ่มเติม (" + (tlList.length - tlShown.length) + " รายการ)</button></div>";
          }
        }
        h += '</div></details>';
      }
    }

    h += '<div class="log-subfilter-bar" style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">';
    Object.keys(LOG_SUBFILTERS).forEach(sk => {
      const on = (UI.logSubFilter || 'all') === sk;
      h += '<button type="button" class="chip ' + (on ? 'b' : '') + '" data-do="logsubfilter" data-arg="' + sk + '" style="cursor:pointer;padding:4px 9px;font-size:11.5px;' + (on ? 'border-color:#4fb2f2;font-weight:bold' : '') + '">' + LOG_SUBFILTERS[sk] + '</button>';
    });
    h += '</div>';

    const chrons = (W.world && Array.isArray(W.world.chronicles)) ? W.world.chronicles : [];
    if (chrons.length && UI.logFilters.has('all')) {
      const cFilter = UI.worldChronicleCategory || 'all';
      const fFilter = UI.worldChronicleFormat || 'all';
      const cSearch = (UI.worldChronicleSearch || '').trim().toLowerCase();
      const catList = [
        ['all', 'ทั้งหมด'],
        ['BATTLE', '⚔️ ศึก/ชิงแดน'],
        ['SUCCESSION', '👑 วิกฤตบัลลังก์'],
        ['FACTION', '⚖️ สภา/การเมือง'],
        ['SECRET_REALM', '🌌 แดนลับ'],
        ['LEGEND', '🐉 ยอดคน'],
        ['VISITOR', '🎐 ผู้มาเยือน'],
        ['FENG_SHUI_ARRAY', '☯️ ฮวงจุ้ย/ค่ายกล'],
        ['DAO_HEART_SUTRA', '🪷 มารในใจ/จิตศาสตรา/คัมภีร์'],
        ['ECONOMY_AUCTION', '🐪 คาราวาน/ประมูล'],
        ['ELDER_COUNCIL_EDICT', '🏛️ สภาผู้อาวุโส/ราชโองการ'],
        ['SECRET_REALM_NODE', '🧭 โหนดแดนลับ/ตำราโบราณ'],
        ['GRAND_ASSEMBLY', '🏆 มหาชุมนุม 4 สาย/งานเลี้ยง'],
        ['HEAVENLY_DAO_ERA', '🌌 ลิขิตฟ้าดิน/ยุคสมัย'],
        ['SECT_PEAK_POLITICS', '🏔️ ยอดเขา/ผู้อาวุโส/สายสัมพันธ์']
      ];
      const fmtList = [
        ['all', 'รูปแบบทั้งหมด'],
        ['PIGEON_DISPATCH', '🕊️ สารลับพิราบ'],
        ['WAR_PAVILION_RECORD', '⚔️ บันทึกศึก'],
        ['DISCIPLINE_EDICT', '⚖️ ประกาศิตหอวินัย'],
        ['ANCESTRAL_INSCRIPTION', '🕯️ จารึกบรรพชน'],
        ['TAVERN_BALLAD', '🍶 ลำนำโรงเตี๊ยม'],
        ['LINEAGE_COMPANION_SCROLL', '💞 สมุดหยกวาสนา'],
        ['IMPERIAL_COUNCIL_DECREE', '🏛️ มติสภา/ราชโองการ'],
        ['SECRET_REALM_LOGBOOK', '🧭 บันทึกแดนลับ/โบราณคดี'],
        ['CONTINENTAL_ASSEMBLY_GAZETTE', '🏆 มหาชุมนุม/หอการค้า'],
        ['HEAVENLY_DAO_OMEN_SCROLL', '🌌 ลิขิตสวรรค์/ยุคสมัย'],
        ['PEAK_HALL_SCROLL', '🏔️ ทำเนียบยอดเขา/สายสัมพันธ์']
      ];
      let filteredChrons = chrons.filter(c => {
        if (cFilter !== 'all' && c.category !== cFilter) return false;
        if (fFilter !== 'all' && (c.reportFormat || 'PIGEON_DISPATCH') !== fFilter) return false;
        if (cSearch) {
          const hay = ((c.titleTh || '') + ' ' + (c.storyTh || '') + ' ' + (c.consequenceTh || '') + ' ' + (c.originCauseTh || '') + ' ' + (c.systemImpactTh || '') + ' ' + (c.involvedSects || []).join(' ') + ' ' + (c.involvedFigures || []).join(' ')).toLowerCase();
          if (!hay.includes(cSearch)) return false;
        }
        return true;
      });

      h += '<details class="lineage-chronicle" open><summary>📜 จดหมายเหตุยุทธภพ & พงศาวดารพิราบสื่อสาร (' + filteredChrons.length + '/' + chrons.length + ' ฉบับ)</summary><div class="card" style="border-color:var(--gold);background:rgba(233,205,133,0.04);margin-top:6px">';
      h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">' + catList.map(([ck, cv]) => '<button class="btn ' + (cFilter === ck ? 'pri' : '') + '" style="padding:2px 7px;font-size:11px" data-do="world-chronicle-cat" data-arg="' + ck + '">' + cv + '</button>').join('') + '</div>';
      h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;align-items:center"><span class="muted" style="font-size:10.5px">รูปแบบพงศาวดาร:</span>' + fmtList.map(([fk, fv]) => '<button class="btn ' + (fFilter === fk ? 'pri' : '') + '" style="padding:1px 6px;font-size:10.5px" data-do="world-chronicle-fmt" data-arg="' + fk + '">' + fv + '</button>').join('') + '</div>';
      h += '<div style="margin-bottom:8px"><input id="worldChronicleSearch" type="search" placeholder="ค้นหาเหตุการณ์/ชื่อบุคคล/ชื่อสำนัก/แหล่งที่มาในยุทธภพ…" value="' + esc(UI.worldChronicleSearch || '') + '" style="font-size:11.5px;padding:4px 8px;width:100%"></div>';

      if (!filteredChrons.length) {
        h += '<div class="muted">ไม่พบบันทึกจดหมายเหตุยุทธภพที่ตรงกับเงื่อนไขการค้นหา</div>';
      } else {
        const wcLim = Math.max(10, UI.worldChronicleLimit || 15);
        const wcShown = filteredChrons.slice(0, wcLim);
        h += wcShown.map(c => {
          const vBadge = c.verificationStatusTh ? (" <span class=\"chip\">" + esc(c.verificationStatusTh) + "</span>") : "";
          const cHighs = (c.combatSummary && Array.isArray(c.combatSummary.highlights) && c.combatSummary.highlights.length)
            ? ("<div class=\"muted\" style=\"font-size:10.5px;margin-top:2px;color:#a8dadc\">🎯 <b>จังหวะยุทธวิธี:</b> " + c.combatSummary.highlights.slice(0, 4).map(hl => esc(hl.textTh || hl)).join(" · ") + "</div>")
            : "";
          return "<div style=\"padding:6px 0;border-bottom:1px dotted var(--line,#3a3f4a)\"><div><span class=\"chip g\">" + esc(c.categoryTh || "จดหมายเหตุ") + "</span>" + (c.reportFormatTh ? (" <span class=\"chip b\">" + esc(c.reportFormatTh) + "</span>") : "") + vBadge + " <b>" + esc(c.icon || "📜") + " " + esc(c.titleTh) + "</b> <span class=\"muted\" style=\"font-size:11px\">(วันที่ " + c.day + ")</span></div>" +
          "<div style=\"font-size:12px;margin-top:3px;line-height:1.45\">" + linkify(W, c.storyTh, c.npcIds) + "</div>" +
          (c.originCauseTh ? "<div class=\"muted\" style=\"font-size:11px;margin-top:2px\">🌱 <b>ต้นทาง/สาเหตุ:</b> " + esc(c.originCauseTh) + "</div>" : "") +
          (c.actorChainTh ? "<div class=\"muted\" style=\"font-size:11px;margin-top:1px\">👤 <b>ผู้กระทำ/ที่มา:</b> " + esc(c.actorChainTh) + "</div>" : "") +
          (c.systemImpactTh ? "<div class=\"muted\" style=\"font-size:11px;margin-top:1px;color:#8ecae6\">🔗 <b>การเชื่อมโยงระบบ:</b> " + esc(c.systemImpactTh) + "</div>" : "") +
          (c.directorInsightTh ? "<div class=\"muted\" style=\"font-size:10.5px;margin-top:1px;color:#cdb4db\">🎬 <b>มุมมองผู้กำกับ:</b> " + esc(c.directorInsightTh) + "</div>" : "") +
          (c.combatBreakdownTh ? "<div class=\"muted\" style=\"font-size:11px;margin-top:2px\">⚔️ " + esc(c.combatBreakdownTh) + "</div>" : "") +
          cHighs +
          (c.consequenceTh ? "<div style=\"font-size:11.5px;color:#ffd166;margin-top:2px\">➔ <b>ผลลัพธ์:</b> " + esc(c.consequenceTh) + "</div>" : "") +
          "</div>";
        }).join("");
        if (filteredChrons.length > wcShown.length) {
          h += "<div style=\"margin-top:6px\"><button type=\"button\" class=\"btn\" style=\"padding:3px 10px;font-size:11px\" data-do=\"world-chronicle-more\">แสดงจดหมายเหตุเพิ่มเติม (" + (filteredChrons.length - wcShown.length) + " ฉบับ)</button></div>";
        }
      }
      h += '</div></details>';
    }
    let list = W.logs || [];
    const trackedIds = (W.sect && W.sect.trackedNpcIds) || [];
    const trackedSet = new Set(trackedIds);
    const hasTrackedFilter = UI.logFilters.has('tracked');

    if (!UI.logFilters.has('all')) {
      const allowed = new Set();
      for (const k of UI.logFilters) {
        if (k === 'tracked') continue;
        const types = LOG_GROUPS[k] && LOG_GROUPS[k][1];
        if (types) types.forEach(t => allowed.add(t));
      }
      if (allowed.size > 0) {
        list = list.filter(l => allowed.has(l.type));
      }
    }
    if (hasTrackedFilter) {
      list = list.filter(l => {
        if (Array.isArray(l.ids) && l.ids.some(id => trackedSet.has(id))) return true;
        if (l.meta && (trackedSet.has(l.meta.npcId) || trackedSet.has(l.meta.targetId))) return true;
        return false;
      });
      const trackedNpcs = trackedIds.map(id => W.byId && W.byId[id]).filter(Boolean);
      h += '<div class="card" style="border-color:var(--gold);background:rgba(233,205,133,0.06);margin-bottom:8px">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">';
      h += '<div><b>⭐ บันทึกเฉพาะตัวละครที่ติดตาม</b> (' + trackedNpcs.length + ' คน)</div>';
      h += '<button class="btn" style="padding:2px 7px;font-size:11px" data-do="open-menu-tracked">⚙️ จัดการรายชื่อติดตาม</button>';
      h += '</div>';
      if (!trackedNpcs.length) {
        h += '<div class="muted" style="margin-top:4px;font-size:12px">ยังไม่มีตัวละครที่ติดตาม คุณสามารถกดปุ่ม <b>⭐ ติดตามตัวละคร</b> ในหน้ารายละเอียดตัวละคร เพื่อกรองดูเฉพาะเหตุการณ์ของพวกเขาได้ที่นี่</div>';
      } else {
        h += '<div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap">' + trackedNpcs.map(n => '<span class="chip" style="cursor:pointer" data-npc="' + n.id + '">⭐ ' + esc(HC.fullName(n)) + ' (' + esc(SECT.title(n)) + ')</span>').join('') + '</div>';
      }
      h += '</div>';
    }
    list = list.filter(l => matchesLogSubFilter(l, UI.logSubFilter));
    list = list.slice(-150).reverse();
    if (!list.length) return h + '<div class="muted">ยังไม่มีเหตุการณ์ในหมวดที่เลือก</div>';
    const majorBanners = {
      breakthrough: ['⚡ ทัณฑ์สวรรค์/ทะลวงด่าน', '#ffd740'],
      death: ['🕯️ จารึกผู้ล่วงลับ', '#ef476f'],
      tournament: ['🏆 ประลองยุทธ์สำนัก', '#00f5d4'],
      raid: ['⚔️ ศึกป้องกันสำนัก', '#ff6b35'],
      marriage: ['💞 มงคลคู่บำเพ็ญ', '#ff9ebb'],
      succession: ['👑 สืบทอดเจ้าสำนัก', '#c77dff'],
      legend: ['🐉 ตำนานยุทธภพ', '#90e0ef']
    };
    return h + list.map(l => {
      const mb = majorBanners[l.type];
      const badge = mb ? '<span class="chip" style="border-color:' + mb[1] + ';color:' + mb[1] + ';margin-right:4px">' + mb[0] + '</span>' : '';
      return '<div class="logrow"' + (mb ? ' style="border-left:3px solid ' + mb[1] + ';padding-left:6px;background:rgba(255,255,255,0.02)"' : '') + '><span class="tm">' + dayStamp(l.t) + ' ' + U.pad2(Math.floor((l.t % 1440) / 60)) + ':' + U.pad2(l.t % 60) + '</span>' + badge + linkify(W, l.text, l.ids, l.refs) + '</div>';
    }).join('');
  };

  /* ----- แผนที่ยุทธภพ 5 แคว้น & ยุทธศาสตร์ครองยุทธภพ (v2.0.18) ----- */
  // The atlas is a view over the simulation, not another world state.  Some
  // encounters only have a region in the simulation; their pin is explicitly
  // approximate and is never used to calculate the duration of a mission.
  UI.atlasParty = (W, node) => {
    const available = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && !n.away && !n.expId && !n.travel && !n.sealed && !n.sealedBt && !(SECT && SECT.isNpcDetained && SECT.isNpcDetained(W, n))).slice().sort((a,b) => CULT.power(b) - CULT.power(a));
    if (node && node.kind === 'FORTUNE_SITE') {
      const rank = node.fortuneRank;
      const eligible = available.filter(n => Math.max(1, CULT.worldRank(n)) <= rank);
      const lead = eligible.find(n => Math.max(1, CULT.worldRank(n)) === rank);
      return lead ? [lead].concat(eligible.filter(n => n !== lead).slice(0, 2)) : [];
    }
    return available.slice(0, node && node.kind === 'NEIGHBOR_SECT' ? 4 : 3);
  };

  UI.buildWorldAtlas = W => {
    const topo = EXPED.ensureWorldTopology(W), exploration = g.EXPLORE;
    const nodes = Object.values(topo.nodes || {}).map(n => Object.assign({}, n));
    const anchors = {
      forest: {macroRegion:'EASTERN_PLAINS', x:70, y:35, regionId:'forest'},
      plains: {macroRegion:'EASTERN_PLAINS', x:78, y:54, regionId:'plains'},
      mountain: {macroRegion:'NORTHERN_PEAKS', x:48, y:24, regionId:'mountain'},
      ruins: {macroRegion:'NORTHERN_PEAKS', x:62, y:19, regionId:'ruins'},
      water: {macroRegion:'SOUTHERN_WATERS', x:45, y:76, regionId:'water'},
      desert: {macroRegion:'WESTERN_BADLANDS', x:19, y:51, regionId:'desert'}
    };
    Object.keys(EXPED.FORTUNE_REGISTRY || {}).forEach(rank => (EXPED.FORTUNE_REGISTRY[rank] || []).forEach((site, index) => {
      const a = anchors[site.biome] || anchors.forest;
      const r = Number(rank), x = clamp(a.x + ((index * 7 + r * 3) % 15) - 7, 5, 95), y = clamp(a.y + ((index * 5 + r * 4) % 13) - 6, 5, 95);
      nodes.push({ id:'FORTUNE:' + site.id, kind:'FORTUNE_SITE', siteId:site.id, fortuneRank:r, nameTh:site.nameTh, icon:site.icon || '✨',
        macroRegion:a.macroRegion, terrain:site.biome, regionId:a.regionId, x, y, approximate:true, descTh:site.desc || site.nameTh, pools:site.pools || [] });
    }));
    const gate = W.explore && W.explore.gate || {};
    const world = gate.world && exploration && exploration.WORLD_BY_ID && exploration.WORLD_BY_ID[gate.world];
    nodes.push({ id:'ATLAS_DIMENSION_GATE', kind:'DIMENSION_GATE', nameTh:'ประตูมิติแดนหมื่นพิภพ', icon:'🌀', macroRegion:'CENTRAL_HEARTLAND',
      x:54, y:53, terrain:'forest', baseDays:0, gateOpen:!!gate.open, gateWorld:world, gateUntil:gate.until, gateNext:gate.next,
      descTh:'ประตูภายในสำนักเชื่อมสู่แดนหมื่นพิภพซึ่งอยู่นอกแผนที่โลก ประตูจะเปิดเป็นครั้งคราว' });
    const regionAnchors = {CENTRAL_HEARTLAND:[55,43], NORTHERN_PEAKS:[52,20], SOUTHERN_WATERS:[40,80], EASTERN_PLAINS:[78,48], WESTERN_BADLANDS:[20,46]};
    (W.world.wanderingLegends || []).filter(l => l && !l.dead && l.macroRegion).forEach(legend => {
      const a = regionAnchors[legend.macroRegion] || regionAnchors.CENTRAL_HEARTLAND;
      let hash = 0;
      for (const c of String(legend.id)) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
      nodes.push({ id:'LEGEND:' + legend.id, kind:'WANDERING_LEGEND', legendId:legend.id,
        nameTh:legend.titleAndNameTh || legend.fullNameTh, icon:'🐉', alignment:legend.alignment,
        macroRegion:legend.macroRegion, x:clamp(a[0] + (hash % 17) - 8,5,95),
        y:clamp(a[1] + ((hash >>> 8) % 17) - 8,5,95), approximate:true,
        descTh:legend.reemergenceOriginTh, power:legend.power, stage:legend.cult && legend.cult.stage,
        doctrineNameTh:legend.doctrineNameTh, weaponNameTh:legend.weaponNameTh, signatureTechNameTh:legend.signatureTechNameTh });
    });
    const wFigs = (EXPED.ensureWanderingFigures ? EXPED.ensureWanderingFigures(W) : (W.world.wanderingFigures || [])).filter(wf => wf && !wf.dead && !wf.recruitedToPlayer);
    wFigs.forEach((wf, wIdx) => {
      const a = wf.visitingPlayerSect ? [52, 48] : (regionAnchors[wf.macroRegion] || regionAnchors.CENTRAL_HEARTLAND);
      let hash = 0;
      for (const c of String(wf.id)) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
      nodes.push({
        id: 'WANDERER:' + wf.id,
        kind: 'WANDERING_FIGURE',
        figureId: wf.id,
        archetypeId: wf.archetypeId,
        archetypeNameTh: wf.archetypeNameTh,
        archetypeBadgeTh: wf.archetypeBadgeTh,
        nameTh: wf.titleAndNameTh || wf.fullNameTh,
        icon: wf.icon || '🧭',
        alignment: wf.alignment || 'NEUTRAL',
        macroRegion: wf.macroRegion || 'CENTRAL_HEARTLAND',
        x: clamp(a[0] + ((hash + wIdx * 5) % 15) - 7, 6, 94),
        y: clamp(a[1] + (((hash >>> 4) + wIdx * 3) % 15) - 7, 6, 94),
        approximate: true,
        visitingPlayerSect: !!wf.visitingPlayerSect,
        affinity: wf.affinity || 25,
        descTh: wf.descTh,
        power: wf.power,
        stage: wf.cult && wf.cult.stage,
        weaponNameTh: wf.weaponNameTh,
        signatureTechNameTh: wf.signatureTechNameTh
      });
    });
    Object.values(EXPED.SECRET_REALM_TEMPLATES || {}).forEach((tpl, index) => {
      const a = regionAnchors[tpl.macroRegion] || regionAnchors.CENTRAL_HEARTLAND;
      const latest = (W.world.secretRealms || []).find(r => r && r.templateId === tpl.id);
      const current = latest && latest.status === 'OPEN' ? latest : null;
      nodes.push({ id:'SECRET_SITE:' + tpl.id, kind:'SECRET_REALM_SITE', templateId:tpl.id, realmId:current && current.id,
        nameTh:tpl.nameTh, icon:tpl.icon || '🌀', macroRegion:tpl.macroRegion, x:clamp(a[0] + (index%3-1)*7,5,95),
        y:clamp(a[1] + (index%2 ? 6 : -6),5,95), danger:tpl.danger, descTh:tpl.descTh,
        active:!!current, expiresDay:current && current.expiresDay, latestRealm:latest || null, approximate:true, prizeNameTh:tpl.prizeNameTh });
    });
    return { nodes, topology:topo };
  };

  UI.atlasTravelInfo = (W, node, party) => {
    if (!node) return null;
    if (node.kind === 'HOME_SECT' || node.kind === 'DIMENSION_GATE') return {days:0, label:'ภายในสำนัก'};
    if (node.kind === 'SECRET_REALM_SITE') return {days:null, label:'การแข่งขันดำเนินโดยระบบอัตโนมัติ'};
    if (node.kind === 'WANDERING_LEGEND' || node.kind === 'WANDERING_FIGURE') return {days:null, label:node.visitingPlayerSect ? 'เดินทางมาปรากฏตัวใกล้เขตสำนักของเราแล้ว!' : 'พเนจรอยู่ในภูมิภาคนี้ · สามารถปฏิสัมพันธ์หรือชักชวนได้'};
    if (node.kind === 'TRADE_HUB') return {days:null, label:'ชุมทางการค้า · ไม่มีภารกิจเดินทางตรง'};
    if (node.kind === 'SANCTUM') return {days:1.5, label:'1.5 วัน · วิหารใช้เวลาสำรวจคงที่'};
    const members = Array.isArray(party) ? party : UI.atlasParty(W, node);
    if (node.kind === 'PAGODA' || node.kind === 'ELEMENTAL_REALM') {
      const baseDays = node.kind === 'PAGODA' ? 1.5 : 1.25;
      const trip = members.length && EXPED.createParty(W, members, {kind:node.kind === 'PAGODA' ? 'nine_dao_pagoda' : 'elemental_realm', baseDays, baseCapacity:20+members.length*12});
      const days = trip && trip.ok ? trip.days : baseDays;
      return {days, baseDays, label:days + ' วัน' + (trip && trip.hasMount ? ' · รวมสัตว์ขี่' : ' · เวลาเดินทางพื้นฐาน')};
    }
    if (node.kind === 'FORTUNE_SITE' || node.kind === 'EXPEDITION_REGION') {
      const region = EXPED.REGIONS.find(r => r.id === (node.regionId || node.id));
      if (!region) return {days:null, label:'ไม่มีข้อมูลการเดินทาง'};
      const low = Math.max(2, Math.round(region.days * 0.7)), high = Math.max(2, Math.round(region.days * 1.3));
      const trip = members.length && EXPED.createParty(W, members, {kind:'fortune', regionId:region.id, baseDays:low});
      const mult = trip && trip.ok ? trip.durationMultiplier : 1;
      const lo = Math.max(0, Math.round((low * mult - 300/1440) * 10) / 10), hi = Math.round((high * mult + 300/1440) * 10) / 10;
      return {days:null, minDays:lo, maxDays:hi, label:'ประมาณ ' + lo + '–' + hi + ' วัน · สุ่มตามภารกิจและเวลาเดินออกจากสำนัก'};
    }
    const t = EXPED.estimateTravelTime(W, members, node.id, {useSectPhoenixAura:true});
    return {days:t.days, baseDays:t.baseDays, label:t.days + ' วัน' + (t.durationMultiplier < 1 ? ' · รวมโบนัสเดินทาง' : '')};
  };

  const ATLAS_SECT_EMBLEMS = Object.freeze({
    FAC_ROARING_TIGER:'🐅', FAC_GOLDEN_SUN:'☀️', FAC_LONGMEN:'💰', FAC_YIN_RAIN:'🌙', FAC_AZURE_PAVILION:'🖌️',
    FAC_JADE_LOTUS:'🪷', FAC_WHITE_CLOUD:'⚔️', FAC_MIST_DRAGON:'🐉', FAC_GREEN_BAMBOO:'🎋', FAC_IRON_FIST_VALLEY:'✊',
    FAC_BLACK_SCORPION:'🦂', FAC_WIND_BLADE_POST:'🍃', FAC_CRIMSON_BONE_CAVE:'💀', FAC_THUNDER_PEAK_MONASTERY:'🔔',
    FAC_MYRIAD_ORIGIN_VILLA:'⚒️', FAC_HEAVENLY_VAJRA_TEMPLE:'🎼', FAC_ASHURA_SLAUGHTER_PALACE:'🔱',
    FAC_CELESTIAL_SWORD_SACRED:'🗡️', FAC_NETHER_BLOOD_SACRED:'🩸'
  });
  const ATLAS_FILTERS = [ ['ALL','ทั้งหมด'], ['SECT','สำนัก'], ['PEOPLE','ยอดคน'], ['FORTUNE','วาสนา'], ['REALM','วิหาร / แดนลับ'], ['RESOURCE','ทรัพยากร'], ['REGION','พื้นที่สำรวจ'] ];
  function atlasCategory(n) {
    if (n.kind === 'HOME_SECT' || n.kind === 'NEIGHBOR_SECT') return 'SECT';
    if (n.kind === 'WANDERING_LEGEND' || n.kind === 'WANDERING_FIGURE') return 'PEOPLE';
    if (n.kind === 'WORLD_ANOMALY' || n.kind === 'FORTUNE_SITE') return 'FORTUNE';
    if (['SANCTUM','PAGODA','ELEMENTAL_REALM','DIMENSION_GATE','SECRET_REALM_SITE'].includes(n.kind)) return 'REALM';
    if (n.kind === 'RESOURCE_NODE' || n.kind === 'TRADE_HUB') return 'RESOURCE';
    return 'REGION';
  }
  function atlasSymbol(n) {
    if (n.kind === 'NEIGHBOR_SECT') return ATLAS_SECT_EMBLEMS[n.canonicalId || n.factionId] || n.icon || '🏯';
    return n.icon || ({EXPEDITION_REGION:'🧭', RESOURCE_NODE:'💎', TRADE_HUB:'🏮'})[n.kind] || '📍';
  }
  function atlasSide(n) { return n.alignment === 'RIGHTEOUS' ? 'righteous' : n.alignment === 'DEMONIC' ? 'demonic' : 'neutral'; }
  function atlasSideTh(n) { return n.alignment === 'RIGHTEOUS' ? 'ฝ่ายธรรมะ' : n.alignment === 'DEMONIC' ? 'ฝ่ายอธรรม' : 'สายกลาง'; }
  UI.atlasGroups = (nodes, zoom) => {
    const list = nodes.slice().sort((a,b) => (a.kind === 'HOME_SECT' ? -1 : b.kind === 'HOME_SECT' ? 1 : String(a.id).localeCompare(String(b.id))));
    const groups = [], radius = 9.2 / Math.max(1, zoom || 1);
    for (const node of list) {
      const x = clamp(Number(node.x) || 0, 2, 98), y = clamp(Number(node.y) || 0, 2, 98);
      let group = groups.find(g => Math.hypot(g.x-x, g.y-y) < radius);
      if (!group) { group = {x,y,nodes:[]}; groups.push(group); }
      group.nodes.push(node);
    }
    return groups;
  };
  function atlasDetail(W, node) {
    const party = UI.atlasParty(W, node), travel = UI.atlasTravelInfo(W, node, party);
    const region = EXPED.WORLD_REGIONS[node.macroRegion] || EXPED.WORLD_REGIONS.CENTRAL_HEARTLAND;
    const active = (W.world.expeds || []).filter(e => e && !e.done && (e.targetNodeId === node.id || e.region === node.id || (node.siteId && e.siteId === node.siteId) || (node.sectId && e.sectId === node.sectId) || (node.anomalyId && e.anomalyId === node.anomalyId)));
    let h = '<section class="atlas-detail" aria-label="รายละเอียดสถานที่" role="region"><button type="button" class="atlas-detail-close" data-do="atlas-close" aria-label="ปิดรายละเอียด">✕</button>';
    h += '<div class="atlas-detail-heading"><span class="atlas-detail-icon">' + esc(atlasSymbol(node)) + '</span><div><span class="atlas-eyebrow">' + esc(region.shortTh || region.nameTh) + '</span><h3>' + esc(node.rawNameTh || node.nameTh) + '</h3></div></div>';
    if (node.kind === 'NEIGHBOR_SECT' || node.kind === 'WANDERING_LEGEND') h += '<div class="atlas-pills"><span class="atlas-side ' + atlasSide(node) + '">' + esc(atlasSideTh(node)) + '</span><span> ' + esc(node.kind === 'WANDERING_LEGEND' ? 'ยอดคนพเนจร' : node.tierNameTh || 'สำนัก') + '</span>' + (node.isVassal ? '<span>🚩 สำนักบริวาร</span>' : '') + '</div>';
    if (node.descTh) h += '<p>' + esc(node.descTh) + '</p>';
    if (node.approximate) h += '<p class="atlas-note">📍 ตำแหน่งแสดงบริเวณโดยประมาณในภูมิภาค</p>';
    if (node.danger != null) h += '<div class="atlas-fact">⚔ ความอันตราย <b>' + esc(node.danger) + '</b></div>';
    if (node.kind === 'NEIGHBOR_SECT') {
      h += '<div class="atlas-fact">กำลังสำนัก <b>' + esc(node.power) + '</b> · ท่าที <b>' + esc(node.attitude) + '</b></div>';
      h += '<div class="atlas-fact">สนธิสัญญา <b>' + esc((g.CONTENT && g.CONTENT.TREATY_TH && g.CONTENT.TREATY_TH[node.treaty]) || (node.treaty === 'NONE' ? 'ยังไม่มี' : node.treaty)) + '</b></div>';
      if (node.isVassal) h += '<div class="atlas-fact">ความภักดี <b>' + Math.round(node.loyalty == null ? 50 : node.loyalty) + '/100</b></div>';
      if (node.isVassal) {
        h += '<div class="atlas-fact">นโยบายบรรณาการ</div><div class="atlas-policy">';
        [['LENIENT','ผ่อนปรน'],['STANDARD','มาตรฐาน'],['HARSH','เข้มงวด']].forEach(([policy,label]) => {
          h += '<button class="btn" data-do="set-vassal-policy" data-arg="' + esc(node.sectId) + '|' + policy + '">' + label + '</button>';
        });
        h += '</div>';
        const call = (W.world.vassalDistressCalls || []).find(c => c && !c.resolved && c.sectId === node.sectId);
        if (call) h += '<div class="atlas-distress-detail">🚨 ' + esc(call.threatNameTh) + ' · ตอบกลับก่อนวันที่ ' + esc(call.expiresDay) + '<div><button class="btn pri" data-do="respond-vassal-distress" data-arg="' + esc(call.id) + '|REINFORCE">🛡️ ช่วยเหลือทันที</button> <button class="btn" data-do="respond-vassal-distress" data-arg="' + esc(call.id) + '|REFUSE">ไม่ช่วย</button></div></div>';
      }
    }
    if (node.kind === 'RESOURCE_NODE') {
      h += '<div class="atlas-fact">ผู้ครอบครอง <b>' + esc(node.ownerNameTh || 'กองกำลังอิสระ') + '</b></div>';
      h += '<div class="atlas-fact">รายได้พื้นฐาน <b>' + (node.dailyStones || 0) + ' ศิลา/วัน</b> · กำลังป้องกัน <b>' + ((node.garrison && node.garrison.defensePower) || 0) + '</b></div>';
      if (Array.isArray(node.mats) && node.mats.length) h += '<div class="atlas-fact">ผลผลิต: ' + node.mats.map(id => esc(ECO.name(id))).join(' · ') + '</div>';
    }
    if (node.kind === 'FORTUNE_SITE') {
      h += '<div class="atlas-fact">ระดับคณะสำรวจ <b>' + node.fortuneRank + '</b> · ' + (party.length ? 'มีคณะระดับนี้พร้อมออกเดินทาง' : 'ยังไม่มีคณะที่มีระดับตรงกับจุดนี้') + '</div>';
      if (node.pools && node.pools.length) h += '<div class="atlas-fact">สิ่งที่อาจพบ: ' + node.pools.map(p => esc(p.nameTh)).join(' · ') + '</div>';
    }
    if (node.kind === 'WANDERING_LEGEND') {
      h += '<div class="atlas-fact">พลัง <b>' + esc(node.power) + '</b> · ขั้นบ่มเพาะ <b>' + esc(node.stage) + '</b> · ' + esc(node.doctrineNameTh || 'เร้นกาย') + '</div>';
      if (node.signatureTechNameTh) h += '<div class="atlas-fact">วิชาประจำตัว: ' + esc(node.signatureTechNameTh) + '</div>';
      if (node.weaponNameTh) h += '<div class="atlas-fact">ศาสตรา: ' + esc(node.weaponNameTh) + '</div>';
    }
    if (node.kind === 'WANDERING_FIGURE') {
      h += '<div class="atlas-fact">ประเภท <b>' + esc(node.archetypeBadgeTh || node.archetypeNameTh || 'จอมยุทธ์พเนจร') + '</b> · ไมตรี <b>' + Math.round(node.affinity || 25) + '/100</b></div>';
      h += '<div class="atlas-fact">พลัง <b>' + esc(node.power) + '</b> · ขั้นบ่มเพาะ <b>' + esc(node.stage) + '</b> · ศาสตรา: ' + esc(node.weaponNameTh || '-') + '</div>';
      if (node.signatureTechNameTh) h += '<div class="atlas-fact">วิชาประจำตัว: ' + esc(node.signatureTechNameTh) + '</div>';
      h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">';
      if (node.archetypeId === 'SWORD_SEEKER') h += '<button class="btn pri" data-do="interact-wandering-figure" data-arg="' + esc(node.figureId) + '|DUEL">⚔️ ท้าประลองยุทธ์</button>';
      if (node.archetypeId === 'HERMIT_DOCTOR') h += '<button class="btn pri" data-do="interact-wandering-figure" data-arg="' + esc(node.figureId) + '|HEAL_DISCIPLE">⚕️ ขอรับการรักษา (120 ศิลา)</button>';
      if (node.archetypeId === 'UNORTHODOX_BANDIT') h += '<button class="btn pri" data-do="interact-wandering-figure" data-arg="' + esc(node.figureId) + '|BEFRIEND">🍶 ร่วมดื่มสุราผูกมิตร</button><button class="btn dan" data-do="interact-wandering-figure" data-arg="' + esc(node.figureId) + '|SUPPRESS">⚔️ ปราบปราม</button>';
      if (node.archetypeId === 'ROGUE_ARRAYIST') h += '<button class="btn pri" data-do="interact-wandering-figure" data-arg="' + esc(node.figureId) + '|REVEAL_SECRET_REALM">🧭 ถามพิกัดแดนลับ</button>';
      h += '<button class="btn ok" data-do="recruit-wandering-figure" data-arg="' + esc(node.figureId) + '">🤝 ชักชวนเข้าสำนัก</button></div>';
    }
    if (node.kind === 'WORLD_ANOMALY') h += '<div class="atlas-fact">⏳ เหลือ ' + Math.max(0, (node.expiresDay || 0) - W.day) + ' วัน · ' + esc(node.rivalSectNameTh || 'คู่แข่ง') + ' ถึงวันที่ ' + esc(node.rivalEtaDay || '-') + '</div>';
    if (node.kind === 'DIMENSION_GATE') {
      h += '<div class="atlas-fact">' + (node.gateOpen && node.gateWorld ? '🟢 เปิดสู่ ' + esc(node.gateWorld.nameTh) + ' · ปิดวันที่ ' + esc(node.gateUntil) : '🔒 ประตูยังปิด · กำหนดถัดไปวันที่ ' + esc(node.gateNext || 'ยังไม่ทราบ')) + '</div>';
      h += '<div class="atlas-fact">แดนหมื่นพิภพทั้งหมด ' + ((g.EXPLORE && g.EXPLORE.WORLDS || []).length) + ' แห่งอยู่หลังประตูมิติ</div>';
    }
    if (node.kind === 'SECRET_REALM_SITE') {
      h += '<div class="atlas-fact">' + (node.active ? '🟢 เปิดอยู่ · หมดเขตวันที่ ' + esc(node.expiresDay) : 'ยังไม่เปิด · การชิงมรดกดำเนินตามเหตุการณ์ยุทธภพ') + '</div>';
      if (node.latestRealm && node.latestRealm.winner) h += '<div class="atlas-fact">ผู้ชนะครั้งล่าสุด: ' + esc(node.latestRealm.winner.nameTh || node.latestRealm.winner.sectNameTh || 'ไม่ระบุ') + '</div>';
      if (node.prizeNameTh) h += '<div class="atlas-fact">มรดก: ' + esc(node.prizeNameTh) + '</div>';
    }
    if (node.kind === 'ELEMENTAL_REALM') {
      const current = g.EXPLORE && g.EXPLORE.elementalRealmAt(W.day);
      const open = current && current.id === node.id;
      h += '<div class="atlas-fact">' + (open ? '🟢 แดนธาตุประจำฤดูกาลนี้' : '🔒 ยังไม่ถึงฤดูกาลของแดนนี้') + '</div>';
      const def = g.EXPLORE && g.EXPLORE.ELEMENTAL_REALMS.find(r => r.id === node.id);
      if (def) h += '<div class="atlas-fact">ผู้พิทักษ์: ' + esc(def.guardianNameTh) + ' · ธาตุ ' + esc(def.elementNameTh) + '</div>';
    }
    if (node.kind === 'SANCTUM') {
      const def = g.EXPLORE && g.EXPLORE.SANCTUMS[node.id];
      if (def) h += '<div class="atlas-fact">' + esc(def.descTh) + ' · ' + def.floors.length + ' ชั้น · กำลังแนะนำ ' + def.minPower + '</div>';
    }
    if (active.length) h += '<div class="atlas-fact">🧭 คณะกำลังเดินทาง ' + active.length + ' คณะ</div>';
    if (travel) h += '<div class="atlas-travel">⏱ ' + esc(travel.label) + '</div>';
    if (party.length && travel && travel.days !== 0 && !['SECRET_REALM_SITE','TRADE_HUB','WANDERING_LEGEND'].includes(node.kind)) h += '<div class="atlas-note">คณะที่ใช้ประมาณ: ' + party.map(n => esc(HC.fullName(n))).join('、') + '</div>';
    if (node.kind === 'FORTUNE_SITE') h += '<p class="atlas-note">จุดวาสนานี้ผูกกับการสำรวจภูมิภาค ผลที่พบจะสุ่มจากรายการของจุดนั้น</p>';
    const canGo = ['NEIGHBOR_SECT','RESOURCE_NODE','WORLD_ANOMALY','FORTUNE_SITE','PAGODA','SANCTUM','ELEMENTAL_REALM','EXPEDITION_REGION'].includes(node.kind) && !(node.kind === 'NEIGHBOR_SECT' && node.isVassal) && !(node.kind === 'RESOURCE_NODE' && node.ownerSectId === 'PLAYER');
    const realmOpen = node.kind !== 'ELEMENTAL_REALM' || (g.EXPLORE && g.EXPLORE.elementalRealmAt(W.day).id === node.id);
    if (node.kind === 'NEIGHBOR_SECT' && !node.isVassal) h += '<label class="atlas-choice">หลังชนะ <select id="atlasSiegeChoice"><option value="SUBJUGATE">รับเป็นสำนักบริวาร</option><option value="PILLAGE">ปล้นคลังสมบัติ</option><option value="FREE_TRADE">บังคับเปิดการค้าเสรี</option></select></label>';
    if (canGo) h += '<button class="btn pri atlas-action" data-do="atlas-depart" data-arg="' + esc(node.id) + '"' + (!party.length || !realmOpen ? ' disabled' : '') + '>' + (node.kind === 'NEIGHBOR_SECT' ? '⚔️ ส่งทัพตีสำนัก' : node.kind === 'RESOURCE_NODE' ? '🚩 ส่งคณะเข้ายึด' : node.kind === 'WORLD_ANOMALY' ? '☄️ ส่งคณะช่วงชิง' : '🧭 ส่งคณะสำรวจ') + '</button>';
    if (node.kind === 'DIMENSION_GATE') h += '<button class="btn atlas-action" data-do="atlas-open-discovery">ดูข้อมูลแดนหมื่นพิภพ</button>';
    if (node.kind === 'SECRET_REALM_SITE') h += '<button class="btn atlas-action" data-do="atlas-open-realms">ดูเหตุการณ์แดนลับ</button>';
    if (node.kind === 'WANDERING_LEGEND') h += '<button class="btn atlas-action" data-do="atlas-open-legends">ดูทำเนียบยอดคน</button>';
    if (node.kind === 'RESOURCE_NODE' && node.ownerSectId === 'PLAYER') h += '<button class="btn atlas-action" data-do="assign-node-garrison" data-arg="' + esc(node.id) + '">🛡️ จัดกำลังประจำการ</button>';
    return h + '</section>';
  }
  UI.rWorldMap = W => {
    if (!EXPED || !EXPED.ensureWorldTopology) return '<div class="muted">ไม่พบระบบแผนที่ยุทธภพ</div>';
    const atlas = UI.buildWorldAtlas(W), view = UI.atlasView || (UI.atlasView = {zoom:1, x:0.5, y:0.5, filter:'ALL'});
    const nodes = atlas.nodes.filter(n => view.filter === 'ALL' || atlasCategory(n) === view.filter || n.kind === 'HOME_SECT');
    const selected = atlas.nodes.find(n => n.id === UI.atlasSelectedId);
    if (UI.atlasSelectedId && !selected) UI.atlasSelectedId = null;
    const groups = UI.atlasGroups(nodes, view.zoom), labels = [];
    const regionCount = Object.values(atlas.topology.discoveredRegions || {}).filter(Boolean).length;
    let h = '<div class="atlas-header"><div><span class="atlas-kicker">บันทึกภูมิศาสตร์ยุทธภพ</span><h2>🧭 แผนที่ยุทธภพ</h2></div><span class="atlas-regions">สำรวจแล้ว ' + regionCount + '/5 แคว้น</span></div>';
    h += '<div class="card" style="padding:6px 8px;margin-bottom:6px;display:flex;gap:5px;flex-wrap:wrap;align-items:center">' +
      '<button type="button" class="btn pri" style="padding:3px 8px;font-size:11px" data-do="collect-vassal-tribute" title="เบิกผลผลิตตามฤดูกาลจากสำนักที่ตกเป็นบริวาร">👑 เก็บเกี่ยวบรรณาการสำนักบริวาร</button>' +
      '<button type="button" class="btn ok" style="padding:3px 8px;font-size:11px" data-do="harvest-resource-nodes" title="รวบรวมแร่และสมุนไพรจากจุดเหมืองโลกที่ส่งคนไปเฝ้า">💎 เก็บเกี่ยวผลผลิตจุดยุทธศาสตร์ทั้งหมด</button>' +
      '<button type="button" class="btn" style="padding:3px 8px;font-size:11px" data-do="trigger-alliance-council" title="ประชุมเจรจาความร่วมมือและการค้ากับสำนักพันธมิตร (คูลดาวน์ 60 วัน)">⚖ เรียกประชุมสภาฝ่ายพันธมิตร</button>' +
      '<button type="button" class="btn" style="padding:3px 8px;font-size:11px" data-do="trigger-secret-realm" title="ค้นหาพิกัดถ้ำโบราณที่ซ่อนอยู่ (คูลดาวน์ 90 วัน)">🌌 สำรวจร่องรอยแดนลับโบราณ</button>' +
      '<button type="button" class="btn" style="padding:3px 8px;font-size:11px" data-do="evaluate-elder-ascensions" title="ประเมินศิษย์อาวุโสที่มีผลงานเด่นขึ้นเป็นผู้อาวุโส">🎖 ประเมินเลื่อนขั้นผู้อาวุโสกิตติมศักดิ์</button>' +
      '<button type="button" class="btn pri" style="padding:3px 8px;font-size:11px" data-do="explore-micro-location" data-arg="LOC_NAMELESS_SWORD_TOMB">🗡️ สุสานกระบี่นิรนาม</button>' +
      '<button type="button" class="btn" style="padding:3px 8px;font-size:11px" data-do="explore-micro-location" data-arg="LOC_ANCIENT_MECH_RUINS">⚙️ ซากนครกลไก</button>' +
      '<button type="button" class="btn" style="padding:3px 8px;font-size:11px" data-do="explore-micro-location" data-arg="LOC_MYRIAD_VENOM_FOREST">🐍 ป่าหมื่นพิษ</button>' +
      '<button type="button" class="btn" style="padding:3px 8px;font-size:11px" data-do="explore-micro-location" data-arg="LOC_MOON_MIRROR_VALLEY">🌙 หุบเขากระจกจันทรา</button>' +
      '</div>';
    h += '<div class="atlas-filters" aria-label="ประเภทสถานที่">' + ATLAS_FILTERS.map(([id,label]) => '<button type="button" class="atlas-filter' + (view.filter === id ? ' active' : '') + '" data-do="atlas-filter" data-arg="' + id + '">' + label + '</button>').join('') + '</div>';
    { const Ll = Object.assign({routes:true, fog:true, aura:true, parties:true, outposts:true, season:true}, view.layers || {});
      h += '<div class="atlas-filters atlas-layers" aria-label="ชั้นแผนที่">' + [['routes','🛤 เส้นทาง'],['aura','🔆 อิทธิพล/พันธมิตร'],['parties','🧭 คณะเดินทาง'],['outposts','⛺ ค่ายพัก/ขบวนเสบียง'],['fog','🌫 หมอกแคว้น'],['season','🍂 ฤดู/ยามค่ำ']].map(([id,label]) => '<button type="button" class="atlas-filter' + (Ll[id] ? ' active' : '') + '" data-do="atlas-layer" data-arg="' + id + '">' + label + '</button>').join('') + '</div>'; }
    h += '<div class="atlas-legend"><span class="righteous">◆ ธรรมะ</span><span class="demonic">◆ อธรรม</span><span class="neutral">◆ สายกลาง</span><span>แตะจุดเพื่อดูข้อมูล · ลากเพื่อเลื่อน</span></div>';
    const distress = (W.world.vassalDistressCalls || []).find(c => c && !c.resolved);
    const threatened = distress && atlas.nodes.find(n => n.kind === 'NEIGHBOR_SECT' && n.sectId === distress.sectId);
    if (distress && threatened) h += '<button class="atlas-alert" data-do="atlas-select" data-arg="' + esc(threatened.id) + '">🚨 ' + esc(distress.sectNameTh) + ' ขอความช่วยเหลือ · แตะเพื่อดู</button>';
    h += '<div class="atlas-shell"><div class="atlas-viewport" tabindex="0" role="region" aria-label="แผนที่ยุทธภพ ลากเพื่อเลื่อนและใช้ปุ่มซูม"><div class="atlas-surface" style="width:' + (view.zoom * 100) + '%">';
    // ===== ชั้นแผนที่ที่ผูกกับข้อมูลจริงของเกม (เปิด/ปิดได้) =====
    const L = Object.assign({routes:true, fog:true, aura:true, parties:true, season:true}, view.layers || {});
    const shown = new Set(nodes.map(n => n.id)); shown.add('NODE_HOME_SECT');
    const byId = {}; atlas.nodes.forEach(n => { byId[n.id] = n; });
    const home = byId.NODE_HOME_SECT || {x:50, y:50, id:'NODE_HOME_SECT'};
    const routeCol = {forest:'#2f6a3a', mountain:'#5a4a3c', plains:'#8a6a2a', water:'#1f6f8a', desert:'#8a4a2a'};
    const ATLAS_CELLS = {
      CENTRAL_HEARTLAND:'65.0,64.1 35.5,62.1 32.2,35.2 65.0,32.9', NORTHERN_PEAKS:'0,0 93.8,0 65.0,32.9 32.2,35.2 0,5.1',
      SOUTHERN_WATERS:'98.7,100 2.7,100 35.5,62.1 65.0,64.1', EASTERN_PLAINS:'93.8,0 100,0 100,100 98.7,100 65.0,64.1 65.0,32.9',
      WESTERN_BADLANDS:'32.2,35.2 35.5,62.1 2.7,100 0,100 0,5.1'
    };
    // ฤดูกาลและกลางวัน/กลางคืนจากเวลาจริงในเกม
    if (L.season) {
      const seasonTint = ['rgba(255,170,200,.10)', 'rgba(255,225,120,.06)', 'rgba(225,115,40,.16)', 'rgba(205,228,255,.22)'][W.season || 0];
      const hr = Math.floor(((W.t || 0) % 1440) / 60);
      const night = hr >= 21 || hr < 4 ? .34 : hr >= 19 || hr < 6 ? .16 : 0;
      h += '<div class="atlas-season" style="background:' + seasonTint + '"></div>' + (night ? '<div class="atlas-night" style="opacity:' + night + '"></div>' : '');
    }
    // หมอกแคว้นที่ยังไม่ได้สำรวจ (หมุดยังกดได้ตามเดิม)
    if (L.fog) {
      let fog = '';
      Object.keys(ATLAS_CELLS).forEach(rid => {
        if (atlas.topology.discoveredRegions && atlas.topology.discoveredRegions[rid] === false) fog += '<polygon points="' + ATLAS_CELLS[rid] + '" fill="#f1e6c8" opacity=".62"/><polygon points="' + ATLAS_CELLS[rid] + '" fill="none" stroke="#8a6a3f" stroke-width="1.2" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" opacity=".7"/>';
      });
      if (fog) h += '<svg class="atlas-fog" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="atlasFogBlur"><feGaussianBlur stdDeviation="1.1"/></filter></defs><g filter="url(#atlasFogBlur)">' + fog + '</g></svg>';
    }
    let rs = '', defs = '<defs>' + [['R','#3fb0c8'],['D','#d24a3c'],['N','#e3b848'],['P','#e6c75a'],['H','#38c493']].map(([k,c]) => '<radialGradient id="atlasAura' + k + '"><stop offset="0" stop-color="' + c + '" stop-opacity=".55"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>').join('') + '</defs>';
    if (L.aura) {
      atlas.nodes.forEach(n => {
        if (!shown.has(n.id)) return;
        if (n.kind === 'NEIGHBOR_SECT') {
          const k = n.isVassal ? 'P' : n.alignment === 'RIGHTEOUS' ? 'R' : n.alignment === 'DEMONIC' ? 'D' : 'N', r = 3.2 + (n.tierLevel || 2) * 0.9 + (n.isAllianceLeader ? 1.5 : 0);
          rs += '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + r + '" fill="url(#atlasAura' + k + ')"/>';
        } else if (n.kind === 'RESOURCE_NODE' && n.ownerSectId === 'PLAYER') rs += '<circle cx="' + n.x + '" cy="' + n.y + '" r="4" fill="url(#atlasAuraP)"/>';
        else if (n.kind === 'HOME_SECT') rs += '<circle cx="' + n.x + '" cy="' + n.y + '" r="8" fill="url(#atlasAuraH)"/>';
      });
      // เส้นสัมพันธ์กับสำนักเรา: บริวาร / พันธมิตร / ไม่รุกราน
      atlas.nodes.forEach(n => {
        if (n.kind !== 'NEIGHBOR_SECT' || !shown.has(n.id)) return;
        const col = n.isVassal || n.treaty === 'VASSAL_TREATY' ? '#d9a521' : (n.treaty === 'ALLIANCE' || n.treaty === 'ALLIANCE_PACT') ? '#2fa36b' : n.treaty === 'NON_AGGRESSION' ? '#3b82c4' : null;
        if (!col) return;
        rs += '<path d="M' + home.x + ',' + home.y + ' L' + n.x + ',' + n.y + '" stroke="' + col + '" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round" fill="none" opacity=".9" vector-effect="non-scaling-stroke"><title>' + esc(n.rawNameTh || n.nameTh) + ' · ' + esc((g.CONTENT && g.CONTENT.TREATY_TH && g.CONTENT.TREATY_TH[n.treaty]) || n.treaty) + '</title></path>';
      });
    }
    if (L.routes) (atlas.topology.routes || []).forEach(r => {
      const A = byId[r.from], B = byId[r.to];
      if (!A || !B || !shown.has(A.id) || !shown.has(B.id)) return;
      const hot = selected && (selected.id === A.id || selected.id === B.id);
      const mx = (A.x + B.x) / 2 + (B.y - A.y) * 0.08, my = (A.y + B.y) / 2 - (B.x - A.x) * 0.08;
      rs += '<path d="M' + A.x + ',' + A.y + ' Q' + mx + ',' + my + ' ' + B.x + ',' + B.y + '" fill="none" stroke="' + (hot ? '#c0392b' : routeCol[r.terrain] || '#5a4a3c') + '" stroke-width="' + (hot ? 2.6 : 1.5) + '" stroke-dasharray="' + (r.terrain === 'water' ? '2 5' : '6 4') + '" stroke-linecap="round" opacity="' + (hot ? 0.95 : 0.55) + '" vector-effect="non-scaling-stroke"><title>' + esc(A.rawNameTh || A.nameTh) + ' → ' + esc(B.rawNameTh || B.nameTh) + ' · ' + r.days + ' วัน</title></path>';
    });
    // คณะเดินทางจริง: เส้นทางสีแดง + ตำแหน่งปัจจุบัน (ครึ่งแรกขาไป ครึ่งหลังขากลับ)
    const partyDots = [];
    if (L.parties) (W.world.expeds || []).forEach(e => {
      if (!e || e.done || !(e.ret > e.t0)) return;
      const tid = e.targetNodeId || e.region, T = byId[tid] || (e.siteId && byId['FORTUNE:' + e.siteId]) || atlas.nodes.find(n => (e.sectId && n.sectId === e.sectId) || (e.anomalyId && n.anomalyId === e.anomalyId));
      if (!T || T.id === home.id) return;
      const pr = clamp(((W.t || 0) - e.t0) / (e.ret - e.t0), 0, 1), out = pr < 0.5, f = out ? pr * 2 : (1 - pr) * 2;
      rs += '<path d="M' + home.x + ',' + home.y + ' L' + T.x + ',' + T.y + '" stroke="#c0392b" stroke-width="2" stroke-dasharray="4 3" fill="none" opacity=".8" vector-effect="non-scaling-stroke"/>';
      partyDots.push({x:home.x + (T.x - home.x) * f, y:home.y + (T.y - home.y) * f, out, name:(T.rawNameTh || T.nameTh), n:(e.party || []).length, days:Math.max(0, ((e.ret - (W.t || 0)) / 1440)).toFixed(1)});
    });
    const convoyDots = [];
    if (L.outposts !== false && SECT && SECT.OUTPOSTS_LOGISTICS) {
      const opState = SECT.OUTPOSTS_LOGISTICS.ensure(W);
      const opNodes = Object.values((opState && opState.byNodeId) || {});
      opNodes.forEach((op, idx) => {
        const targetNode = byId[op.nodeId] || atlas.nodes.find(n => n.kind === 'RESOURCE_NODE');
        if (!targetNode) return;
        rs += '<path d="M' + home.x + ',' + home.y + ' L' + targetNode.x + ',' + targetNode.y + '" stroke="#ffd166" stroke-width="2.1" stroke-dasharray="3 2" fill="none" opacity=".88" vector-effect="non-scaling-stroke"/>';
        rs += '<circle cx="' + targetNode.x + '" cy="' + targetNode.y + '" r="4.6" fill="none" stroke="#80ed99" stroke-width="1.3" vector-effect="non-scaling-stroke"/>';
        const prog = (((W.t || 0) * 0.015 + idx * 0.37) % 1);
        convoyDots.push({ x: home.x + (targetNode.x - home.x) * prog, y: home.y + (targetNode.y - home.y) * prog, name: op.nameTh || targetNode.nameTh });
      });
    }
    // Dimensional Gate & Secret Realm Astral Rings on World Atlas
    atlas.nodes.forEach(n => {
      if (!shown.has(n.id)) return;
      if ((n.kind === 'DIMENSION_GATE' && n.gateOpen) || (n.kind === 'SECRET_REALM_SITE' && n.active) || n.kind === 'WORLD_ANOMALY') {
        const rCol = n.kind === 'WORLD_ANOMALY' ? '#ff4d6d' : '#00f5d4';
        rs += '<circle cx="' + n.x + '" cy="' + n.y + '" r="5.2" fill="none" stroke="' + rCol + '" stroke-width="1.6" stroke-dasharray="2 2" vector-effect="non-scaling-stroke"/>';
      }
    });
    h += '<svg class="atlas-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + defs + rs + '</svg>';
    convoyDots.forEach(c => { h += '<span class="atlas-party atlas-convoy" style="left:' + c.x + '%;top:' + c.y + '%" title="ขบวนเสบียงค่ายพักมุ่งสู่ ' + esc(c.name) + '">🐪</span>'; });
    partyDots.forEach(d => { h += '<span class="atlas-party" style="left:' + d.x + '%;top:' + d.y + '%" title="คณะ ' + d.n + ' คน ' + (d.out ? 'มุ่งหน้า' : 'เดินทางกลับจาก') + ' ' + esc(d.name) + ' · อีก ~' + d.days + ' วัน">🧭</span>'; });
    const regTitles = [['NORTHERN_PEAKS',50,3.5],['WESTERN_BADLANDS',9,76],['EASTERN_PLAINS',87,22],['SOUTHERN_WATERS',50,95],['CENTRAL_HEARTLAND',33,45]];
    regTitles.forEach(([rid,x,y]) => {
      const reg = EXPED.WORLD_REGIONS[rid]; if (!reg) return;
      const seen = !atlas.topology.discoveredRegions || atlas.topology.discoveredRegions[rid] !== false;
      h += '<span class="atlas-region-title' + (seen ? '' : ' unseen') + '" style="left:' + x + '%;top:' + y + '%">' + esc(reg.shortTh) + (seen ? '' : ' · ยังไม่สำรวจ') + '</span>';
    });
    for (const g1 of groups) {
      const many = g1.nodes.length > 1, n = g1.nodes[0], isHome = n.kind === 'HOME_SECT';
      const symbol = many && !isHome ? String(g1.nodes.length) : atlasSymbol(n);
      const side = !many && (n.kind === 'NEIGHBOR_SECT' || n.kind === 'WANDERING_LEGEND') ? atlasSide(n) : isHome ? 'home' : !many && n.kind === 'WORLD_ANOMALY' ? 'event' : '';
      const marked = selected && g1.nodes.some(x => x.id === selected.id);
      const priority = !many && (n.kind === 'HOME_SECT' || (n.kind === 'NEIGHBOR_SECT' && n.isAllianceLeader) || marked);
      const visibleLabel = !many && (priority || view.zoom >= 1.8) && !labels.some(p => Math.abs(p.x-g1.x)<20/view.zoom && Math.abs(p.y-g1.y)<7/view.zoom);
      if (visibleLabel) labels.push({x:g1.x,y:g1.y});
      const label = many ? g1.nodes.length + ' สถานที่ในบริเวณนี้' : (n.rawNameTh || n.nameTh || 'สถานที่');
      const travelling = (W.world.expeds || []).some(e => e && !e.done && g1.nodes.some(x => e.region === x.id || e.targetNodeId === x.id || (x.siteId && e.siteId === x.siteId) || (x.sectId && e.sectId === x.sectId) || (x.anomalyId && e.anomalyId === x.anomalyId)));
      h += '<button type="button" class="atlas-marker ' + side + (many ? ' cluster' : '') + (marked ? ' selected' : '') + (g1.x < 18 ? ' edge-left' : g1.x > 82 ? ' edge-right' : '') + '" style="left:' + g1.x + '%;top:' + g1.y + '%" data-do="' + (many ? 'atlas-group' : 'atlas-select') + '" data-arg="' + esc(many ? g1.nodes.map(x=>x.id).join('|') : n.id) + '" title="' + esc(label) + '" aria-label="' + esc(label) + '"><span class="atlas-marker-icon">' + esc(symbol) + '</span>' + (many && isHome ? '<span class="atlas-marker-count">' + g1.nodes.length + '</span>' : '') + (travelling ? '<span class="atlas-marker-travel" aria-label="มีคณะเดินทาง">🧭</span>' : '') + (visibleLabel ? '<span class="atlas-marker-label">' + esc(label) + '</span>' : '') + '</button>';
    }
    h += '</div></div><div class="atlas-map-controls"><button type="button" data-do="atlas-zoom" data-arg="in" aria-label="ซูมเข้า">＋</button><button type="button" data-do="atlas-zoom" data-arg="out" aria-label="ซูมออก">−</button><button type="button" data-do="atlas-home" aria-label="กลับสู่สำนัก">⌂</button></div>';
    h += '<div class="atlas-scale">' + Math.round(view.zoom * 100) + '%</div>';
    if (UI.atlasGroupIds && UI.atlasGroupIds.length) {
      const options = UI.atlasGroupIds.map(id => atlas.nodes.find(n => n.id === id)).filter(Boolean);
      h += '<section class="atlas-detail atlas-cluster-list" role="region" aria-label="เลือกสถานที่"><button class="atlas-detail-close" data-do="atlas-close">✕</button><h3>สถานที่ใกล้กัน (' + options.length + ')</h3>' + options.map(n => '<button class="atlas-place-choice" data-do="atlas-select" data-arg="' + esc(n.id) + '"><span>' + esc(atlasSymbol(n)) + '</span><span>' + esc(n.rawNameTh || n.nameTh) + '</span>' + (n.kind === 'NEIGHBOR_SECT' || n.kind === 'WANDERING_LEGEND' ? '<small class="' + atlasSide(n) + '">' + esc(atlasSideTh(n)) + '</small>' : '') + '</button>').join('') + '</section>';
    } else if (selected) h += atlasDetail(W, selected);
    h += '</div>';
    h += '<div class="atlas-footnote">จุดที่ซ้อนกันจะแสดงเป็นตัวเลข แตะเพื่อเลือก · ประตูมิติเชื่อมแดนหมื่นพิภพ</div>';
    return h;
  };

  UI.bindWorldAtlas = body => {
    const viewport = body.querySelector('.atlas-viewport'), surface = body.querySelector('.atlas-surface'), view = UI.atlasView;
    if (!viewport || !surface || !view) return;
    viewport.scrollLeft = view.x * surface.offsetWidth - viewport.clientWidth / 2;
    viewport.scrollTop = view.y * surface.offsetHeight - viewport.clientHeight / 2;
    const remember = () => {
      view.x = clamp((viewport.scrollLeft + viewport.clientWidth/2) / surface.offsetWidth, 0, 1);
      view.y = clamp((viewport.scrollTop + viewport.clientHeight/2) / surface.offsetHeight, 0, 1);
    };
    viewport.addEventListener('scroll', remember, {passive:true});
    let pointers = new Map(), last = null, pinch = null, moved = false;
    viewport.addEventListener('pointerdown', e => {
      pointers.set(e.pointerId, {x:e.clientX,y:e.clientY});
      if (!e.target.closest('button')) viewport.setPointerCapture(e.pointerId);
      UI.atlasDragging = true;
      if (pointers.size === 1) { last = {x:e.clientX,y:e.clientY}; moved = false; }
      if (pointers.size === 2) { const [a,b] = [...pointers.values()]; pinch = {distance:Math.hypot(a.x-b.x,a.y-b.y), zoom:view.zoom}; }
    });
    viewport.addEventListener('pointermove', e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, {x:e.clientX,y:e.clientY});
      if (pointers.size >= 2 && pinch) {
        const [a,b] = [...pointers.values()], distance = Math.hypot(a.x-b.x,a.y-b.y);
        const newZoom = clamp(pinch.zoom * distance / Math.max(1,pinch.distance), 1, 4);
        remember(); view.zoom = newZoom; surface.style.width = (100*newZoom) + '%';
        viewport.scrollLeft = view.x * surface.offsetWidth - viewport.clientWidth/2;
        viewport.scrollTop = view.y * surface.offsetHeight - viewport.clientHeight/2;
        moved = true;
      } else if (last) {
        const dx = e.clientX-last.x, dy = e.clientY-last.y;
        viewport.scrollLeft -= dx; viewport.scrollTop -= dy; last = {x:e.clientX,y:e.clientY};
        if (Math.abs(dx)+Math.abs(dy)>1) moved = true;
      }
    });
    const finish = e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId); pinch = null;
      if (pointers.size) { const p = [...pointers.values()][0]; last = {x:p.x,y:p.y}; return; }
      remember(); UI.atlasDragging = false;
      if (moved) UI.render();
    };
    viewport.addEventListener('pointerup', finish); viewport.addEventListener('pointercancel', finish);
    viewport.addEventListener('wheel', e => { e.preventDefault(); remember(); view.zoom = clamp(view.zoom * (e.deltaY < 0 ? 1.25 : 0.8), 1, 4); UI.render(); }, {passive:false});
  };

  /* ----- ยุทธภพ ----- */
  UI.rWorld = () => {
    const W = UI.G.W, tab = UI.tab; let h = '';
    if (tab === 'map') {
      return UI.rWorldMap(W);
    }
    if (tab === 'exp') {
      const eSub = UI.worldExpSubTab || 'TRAVEL';
      h += '<div class="card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div><b>🗺️ แผนที่ยุทธภพ 5 มหาภูมิภาค & ศึกตีค่ายสำนัก</b><div class="muted">สำรวจจุดยุทธศาสตร์ เหมืองศิลา ด่านภาษี และสั่งการทัพตีค่ายสำนักเพื่อนบ้าน</div></div><button class="btn pri" data-do="open-world-map">🗺️ เปิดแผนที่ยุทธภพ</button></div>';
      h += renderSubTabBar('set-exp-subtab', eSub, [
        ['TRAVEL', '🚩 คณะเดินทาง & ประวัติสำรวจ'],
        ['RUMORS', '🍶 โรงเตี๊ยมข่าวลือ & สายสัมพันธ์ยุทธภพ'],
        ['ALL', '📋 ดูทั้งหมด']
      ], 'หมวดย่อยคณะเดินทางและข่าวสารยุทธภพ');
      const act = W.world.expeds.filter(e => !e.done);
      const destinations = EXPED.ensureWorldTopology(W).nodes || {};
      h += '<div class="subcat-pane" data-subcat="RUMORS"' + ((eSub === 'ALL' || eSub === 'RUMORS') ? '' : ' style="display:none"') + '>';
      if (SECT.JIANGHU && SECT.JIANGHU.ensure) {
        const jh = SECT.JIANGHU.ensure(W);
        if (!jh.rumors || !jh.rumors.length) SECT.JIANGHU.refreshTavernRumors(W, { count: 3 });
        const openRumors = (jh.rumors || []).filter(r => r && r.status !== 'resolved' && !r.resolved);
        const rawBonds = Array.isArray(jh.bonds) ? jh.bonds : Object.values(jh.karmaBonds || {});
        const bonds = rawBonds.filter(b => b && b.active !== false);
        const leadActor = (UI.G.R && UI.G.R.selected && W.byId[UI.G.R.selected] && !W.byId[UI.G.R.selected].dead) ? W.byId[UI.G.R.selected] : W.byId[W.sect.masterId];
        h += '<h3>🍶 โรงเตี๊ยมข่าวลือยุทธภพ (' + openRumors.length + ' ข่าวที่กำลังแพร่สะพัด)</h3><div class="card">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px"><span class="muted">ผู้พร้อมออกสืบข่าว: <b>' + esc(leadActor ? HC.fullName(leadActor) : 'เจ้าสำนัก') + '</b> (คลี่คลายแล้ว ' + ((jh.encounters && jh.encounters.length) || 0) + ' ครั้ง)</span><button class="btn" style="padding:3px 8px;font-size:11px" data-do="refresh-rumors">🔄 ฟังข่าวลือชุดใหม่</button></div>';
        if (openRumors.length) {
          h += openRumors.map(r => '<div style="padding:5px 0;border-top:1px solid var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><div style="flex:1;min-width:180px"><b>🍶 ' + esc(r.titleTh) + '</b> <span class="chip b">' + esc(r.regionId || r.kind || 'ยุทธภพ') + '</span><div class="muted" style="font-size:11.5px">' + esc(r.descTh || '') + ' (หมดอายุวันที่ ' + r.expiresDay + ')</div></div><button class="btn pri" style="padding:4px 9px;font-size:11.5px" data-do="investigate-tavern-rumor" data-arg="' + esc(r.id) + '|' + (leadActor ? leadActor.id : '') + '">🧭 ส่งไปสืบข่าว</button></div>').join('');
        } else {
          h += '<div class="muted">ข่าวลือรอบนี้ถูกคลี่คลายหมดแล้ว กดปุ่มฟังข่าวลือชุดใหม่หรือรอวันถัดไป</div>';
        }
        h += '</div>';
        if (bonds.length) {
          h += '<h3>☯️ สายสัมพันธ์คุณธรรมและความแค้นในยุทธภพ (' + bonds.length + ' คน)</h3><div class="card">';
          h += bonds.map(b => {
            const mem = W.byId[b.npcId || b.memberId];
            const isAlly = b.kind === 'SWORN_ALLY' || b.kind === 'BENEFACTOR';
            const figName = b.figureNameTh || b.npcNameTh || 'จอมยุทธ์ยุทธภพ';
            const btns = isAlly
              ? '<button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="ally-aid" data-arg="' + esc(b.id) + '">🤝 ขอรับการหนุนนำ</button>'
              : '<button class="btn dan" style="padding:3px 8px;font-size:11px" data-do="challenge-nemesis" data-arg="' + esc(b.id) + '|">⚔️ นัดดวลชี้ขาด</button>';
            return '<div style="padding:4px 0;border-bottom:1px dotted var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap"><div><span class="chip ' + (isAlly ? 'ok' : 'r') + '">' + (isAlly ? '🤝 สหายร่วมสาบาน' : '🩸 คู่อาฆาตยุทธภพ') + '</span> <b>' + esc(figName) + '</b> <span class="muted">(' + esc(b.sectNameTh || b.titleTh || b.path) + ' · พลัง ' + b.power + ' CP)</span><div class="muted" style="font-size:11px">ผูกพันกับ: ' + (mem ? nameLink(mem) : esc(b.npcNameTh || b.memberNameTh || '-')) + (isAlly ? ' (พร้อมช่วยรบเมื่อสำนักถูกบุก)' : '') + '</div></div><div>' + btns + '</div></div>';
          }).join('');
          h += '</div>';
        }
      }
      h += '</div><div class="subcat-pane" data-subcat="TRAVEL"' + ((eSub === 'ALL' || eSub === 'TRAVEL') ? '' : ' style="display:none"') + '>';
      h += '<h3>กำลังเดินทาง (' + act.length + ')</h3>' + (act.length ? act.map(e => { const ms = e.party.map(i => W.byId[i]).filter(Boolean); const reg = e.fortuneSite || (e.placeTh && {nameTh:e.placeTh}) || EXPED.REGIONS.find(r => r.id === e.region) || destinations[e.targetNodeId || e.region] || {nameTh:'ไม่ทราบจุดหมาย'}; const mission = EXPED.MISSIONS[e.kind] || {icon:'🧭',nameTh:'ภารกิจ'}; return '<div class="card"><b>' + esc(mission.icon) + ' ' + esc(mission.nameTh) + '</b> → ' + esc(reg.rawNameTh || reg.nameTh) + '<div>' + ms.map(nameLink).join('、') + '</div><div class="muted">กลับในอีก ~' + Math.max(0, Math.round((e.ret - W.t) / 1440 * 10) / 10) + ' วัน</div></div>'; }).join('') : '<div class="muted">ไม่มี</div>');
      const done = W.world.expeds.filter(e => e.done && e.out).slice(-5).reverse(); if (done.length) h += '<h3>เพิ่งกลับ</h3>' + done.map(e => { const ms = e.party.map(i => W.byId[i]).filter(Boolean), mission = EXPED.MISSIONS[e.kind] || {icon:'🧭',nameTh:'ภารกิจ'}; return '<div class="card"><b>' + esc(mission.icon) + ' ' + esc(mission.nameTh) + '</b> ' + ms.map(nameLink).join('、') + '<div class="muted">' + esc(e.journal.slice(-4).join(' → ')) + '</div><div>' + esc(EXPED.summarize(e.out)) + '</div></div>'; }).join('');
      h += '</div>';
    } else if (tab === 'visitors') {
      h += UI.rVisitors();
    } else if (tab === 'clues') {
      h += UI.rClues();
    } else if (tab === 'content') {
      h += UI.rContent();
    } else if (tab === 'ecology') {
      h += UI.rEcology();
    } else if (tab === 'disc') {
      h += UI.rDisc();
    } else if (tab === 'sects') {
      const C = g.CONTENT; if (C && C.ensure) C.ensure(W);
      const subTab = UI.worldSectsSubTab || 'NEIGHBORS';
      h += renderSubTabBar('set-world-subtab', subTab, [
        ['NEIGHBORS', '🏯 สำนักเพื่อนบ้าน & สนธิสัญญา'],
        ['FACTIONS', '⚖️ ขั้วอำนาจ 3 ฝ่าย & เจ้าสำนัก'],
        ['COMMERCE', '🐪 คาราวาน · ประมูล & ชุมนุมยุทธ์'],
        ['LEGENDS', '🐉 ยอดคนพเนจร & ตำนานหวนคืน'],
        ['REALMS', '🌌 แดนลับเปิดผนึก & ประลองสิบทิศ'],
        ['CHRONICLES', '📜 จดหมายเหตุยุทธภพ'],
        ['ALL', '📋 ดูทั้งหมด']
      ], 'หมวดย่อยการเมืองและขั้วอำนาจยุทธภพ');
      h += '<div class="subcat-pane" data-subcat="NEIGHBORS"' + ((subTab === 'ALL' || subTab === 'NEIGHBORS') ? '' : ' style="display:none"') + '>';
      const pol = W.world.politics || { treaties: {}, activeEvent: null, events: [], stats: {} };
      if (pol.activeEvent) {
        const ev = pol.activeEvent;
        h += '<h3>⚡ เหตุการณ์การเมืองยุทธภพปัจจุบัน</h3><div class="card" style="border-color:var(--gold)"><b>' + esc(ev.titleTh) + '</b><div class="muted">' + esc(ev.descTh) + '</div><div class="muted">ครบกำหนดวันที่ ' + ev.expiresDay + ' · ศิลาที่เกี่ยวข้อง ' + ev.demandStones + ' ก้อน</div></div>';
      }
      h += '<h3>🏯 ขั้วอำนาจและสำนักเพื่อนบ้าน (' + W.world.sects.length + ')</h3>';
      h += W.world.sects.map(s => {
        const trLabel = (C && C.TREATY_TH && C.TREATY_TH[s.treaty || 'NONE']) || (s.treaty || 'NONE');
        const trChip = ['ALLIANCE','ALLIANCE_PACT','MARTIAL_EXCHANGE'].includes(s.treaty) ? 'ok' : ['TRADE_PACT','TRADE_CARAVAN_ACCORD'].includes(s.treaty) ? 'g' : s.treaty === 'NON_AGGRESSION' ? 'b' : ['EMBARGO','RIVAL_FEUD'].includes(s.treaty) ? 'r' : '';
        const specs = Array.isArray(s.specialtyMatIds) ? s.specialtyMatIds.map(id => esc(ECO.name(id))).join(' · ') : '';
        return '<div class="card"><b>' + esc(s.icon || '🏯') + ' ' + esc(s.nameTh) + '</b> <span class="chip">' + esc(s.style) + '</span>' + (s.alignmentLabelTh ? ' <span class="chip v">' + esc(s.alignmentLabelTh) + '</span>' : '') + ' <span class="chip ' + trChip + '">📜 ' + esc(trLabel) + '</span>' + bar('ท่าทีต่อเรา', s.attitude + 100, { max: 200, txt: Math.round(s.attitude), wide: true, color: s.attitude > 20 ? '#5fd38a' : s.attitude < -20 ? '#e0584a' : '#e8c43a' }) + '<div class="muted">กำลัง ' + s.power + ' · อิทธิพล ' + (s.influence || 70) + (s.leaderNameTh ? ' · ประมุข: ' + esc(s.leaderNameTh) : '') + ' · ติดต่อล่าสุด ' + (s.contact ? 'วันที่ ' + s.contact : 'ยังไม่เคย') + '</div>' + (specs ? '<div class="muted">สินค้า/ทรัพยากรเฉพาะถิ่น: ' + specs + '</div>' : '') + '</div>';
      }).join('');
      if (pol.events && pol.events.length) {
        h += '<h3>📜 บันทึกสนธิสัญญาและการเมืองยุทธภพ</h3><div class="card">' + pol.events.slice(-8).reverse().map(e => '<div class="logrow"><span class="tm">วันที่ ' + e.day + '</span>' + esc(e.summaryTh) + '</div>').join('') + '</div>';
      }
      h += '<div class="muted">ท่าทีต่ำมาก → เสี่ยงถูกคว่ำบาตร/บุกโจมตี · ท่าทีสูง → ลงนามสัญญาการค้า/พันธมิตรยุทธภพ ส่งขบวนทรัพยากรและช่วยป้องกันสำนัก</div></div>';
      if (EXPED && EXPED.ensureWorldTopology) {
        EXPED.ensureWorldTopology(W);
        const alliances = (W.world.grandPolitics && W.world.grandPolitics.alliances) || (EXPED.evaluateAllianceLeadership ? EXPED.evaluateAllianceLeadership(W) : {});
        const allOrgs = (W.world.allSects || []).slice().sort((a, b) => (b.tierLevel || 1) - (a.tierLevel || 1) || (b.power || 1) - (a.power || 1));
        const legends = (W.world.wanderingLegends || []).filter(l => l && !l.dead);
        const fallenLegs = (W.world.fallenLegends || []).slice(0, 5);
        const realms = (W.world.secretRealms || []).slice(0, 8);
        const chrons = (W.world.chronicles || []).slice(0, 30);

        h += '<div class="card" style="margin-top:10px;border-color:var(--gold)">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><b>⚖️ หมวดย่อยยุทธภพ: ขั้วอำนาจ 3 ฝ่าย · สภาเจ้าสำนัก · แดนลับโบราณ & จดหมายเหตุยุทธภพ</b>';
        h += '<div style="display:flex;gap:5px;flex-wrap:wrap">';
        [['ALL', '🌐 ภาพรวมทั้งหมด'], ['FACTIONS', '⚖️ ขั้วอำนาจ 3 ฝ่าย & ยอดคน'], ['REALMS', '🌌 แดนลับโบราณ (' + realms.length + ')'], ['CHRONICLES', '📜 จดหมายเหตุยุทธภพ (' + chrons.length + ')']].forEach(([k, lbl]) => {
          h += '<button type="button" class="btn ' + (subTab === k ? 'pri' : '') + '" style="padding:4px 9px;font-size:11.5px" data-do="set-world-subtab" data-arg="' + k + '">' + lbl + '</button>';
        });
        h += '</div></div>';
        h += '<div class="muted" style="font-size:11.5px;margin-top:4px">ทุกเหตุการณ์ในยุทธภพดำเนินไปเองตามธรรมชาติจากนิสัย Human Core ของเจ้าสำนัก รองเจ้าสำนัก ศิษย์สืบทอด และยอดคนในตำนาน (ผู้เล่นสามารถกดปุ่ม ✨ เสกศาสตรา/ประทานโอสถ เพื่อแทรกแซงวาสนาได้ตลอดเวลา)</div>';
        h += '</div>';

        h += '<div class="subcat-pane" data-subcat="FACTIONS"' + ((subTab === 'ALL' || subTab === 'FACTIONS') ? '' : ' style="display:none"') + '><h3>⚖️ ขั้วอำนาจทั้ง 3 ฝ่าย & หลักนิยมผู้นำฝ่าย (สายเหยี่ยว / สายพิราบ / สายพาณิชย์ / สายจารีต / สายเร้นกาย)</h3>';
          ['RIGHTEOUS', 'DEMONIC', 'NEUTRAL'].forEach(alignKey => {
            const al = alliances[alignKey] || {};
            const fOrgs = allOrgs.filter(s => s && s.alignment === alignKey);
            const chipCls = alignKey === 'RIGHTEOUS' ? 'ok' : alignKey === 'DEMONIC' ? 'r' : 'b';
            const icon = alignKey === 'RIGHTEOUS' ? '☀️' : alignKey === 'DEMONIC' ? '🩸' : '☯️';
            h += '<div class="card" style="border-left:3px solid ' + (alignKey === 'RIGHTEOUS' ? '#5fd38a' : alignKey === 'DEMONIC' ? '#e0584a' : '#4fb2f2') + '">';
            h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
            h += '<div><b style="font-size:14px">' + icon + ' ' + esc(al.nameTh || alignKey) + ' (' + fOrgs.length + ' องค์กร · กำลังรบรวม ' + (al.totalPower || 0) + ')</b> <span class="chip ' + chipCls + '">' + esc(al.doctrineBadgeTh || al.doctrineNameTh || '-') + '</span></div>';
            if (alignKey !== 'NEUTRAL') {
              h += '<div style="font-size:12px">👑 <b>ผู้นำฝ่ายปัจจุบัน:</b> <span style="color:var(--gold)">[' + esc(EXPED.SECT_TIER_DEFS.SACRED_LAND.nameTh) + '] ' + esc(al.leaderSectNameTh || '-') + '</span> · ประมุข: <b>' + esc(al.leaderMasterNameTh || '-') + '</b></div>';
            } else {
              h += '<div style="font-size:12px">☯️ <b>สถานะผู้นำ:</b> <span class="muted">สายกลางไม่มีสำนักระดับผู้นำสูงสุด (แดนศักดิ์สิทธิ์) · ผู้ประสานงานสูงสุด: ' + esc(al.coordinatorSectNameTh || '-') + '</span></div>';
            }
            h += '</div>';
            h += '<div class="muted" style="font-size:11.5px;margin-top:4px">ผลกระทบแนวทางผู้นำฝ่าย: ' + esc(al.doctrineDescTh || '-') + '</div>';

            h += '<div style="margin-top:8px">' + fOrgs.map(s => {
              const clash = EXPED.computeDiscipleClashChance ? EXPED.computeDiscipleClashChance(W, null, s) : { probability: 0.2 };
              const figs = s.figures || {};
              const m = figs.master, dp = figs.deputy, sc = figs.successor, anc = figs.ancestor;
              let row = '<div style="padding:7px 0;border-top:1px dotted var(--line,#3a3f4a)">';
              row += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
              row += '<div><b>' + esc(s.icon || '🏯') + ' [' + esc(s.tierNameTh || '') + '] ' + esc(s.nameTh) + '</b> <span class="chip g">' + esc(s.tierBadgeTh || '') + '</span> <span class="chip">' + esc(s.orgType || 'สำนัก') + '</span>' + (s.isAllianceLeader ? ' <span class="chip ok">👑 ประมุขฝ่าย</span>' : '') + '</div>';
              row += '<div class="muted" style="font-size:11px">กำลังสำนัก <b>' + s.power + '</b> · โอกาสศิษย์ปะทะนอกสำนัก <b>' + Math.round((clash.probability || 0) * 100) + '%</b></div>';
              row += '</div>';
              row += '<div class="muted" style="font-size:11.5px;margin-top:2px">หลักคำสอน: <b>' + esc(s.doctrineModeTh || s.doctrineMode) + '</b> · เอกลักษณ์: ' + esc(s.signatureGearTh || '-') + '</div>';

              if (m) {
                row += '<div style="font-size:11.5px;margin-top:4px;background:rgba(255,255,255,0.02);padding:5px;border-radius:6px">';
                row += '<div>👑 <b>เจ้าสำนัก:</b> ' + esc(m.titleAndNameTh) + ' (ขั้น ' + m.cult.stage + ' · พลัง ' + m.power + ' · ' + esc(m.doctrineBadgeTh) + ') — <span class="muted">วิชา「' + esc(m.signatureTechNameTh) + '」· ' + esc(m.weaponNameTh) + '</span> ';
                row += '<button class="btn" style="padding:1px 6px;font-size:10px" data-do="intervene-jianghu-figure" data-arg="' + esc(m.id) + '|GIFT_RELIC">✨ เสกศาสตราให้</button> ';
                row += '<button class="btn" style="padding:1px 6px;font-size:10px" data-do="intervene-jianghu-figure" data-arg="' + esc(m.id) + '|BOOST_STAGE">💊 ประทานโอสถ</button> ';
                row += '<button class="btn dan" style="padding:1px 6px;font-size:10px" data-do="intervene-jianghu-figure" data-arg="' + esc(m.id) + '|SMITE">⚡ ทดสอบมรณกรรม/สืบทอด</button></div>';
                if (dp) {
                  row += '<div style="margin-top:2px">🛡️ <b>รองเจ้าสำนัก:</b> ' + esc(dp.titleAndNameTh) + ' (ขั้น ' + dp.cult.stage + ' · พลัง ' + dp.power + ' · ทะเยอทะยาน ' + Math.round((dp.h && dp.h.personality && dp.h.personality.ambition) || 50) + ' / คุณธรรม ' + Math.round((dp.h && dp.h.personality && dp.h.personality.integrity) || 50) + ' / ภักดี ' + Math.round((dp.h && dp.h.personality && dp.h.personality.loyalty) || 50) + ') ';
                  row += '<button class="btn" style="padding:1px 6px;font-size:10px" data-do="intervene-jianghu-figure" data-arg="' + esc(dp.id) + '|BOOST_STAGE">💊 หนุนรองเจ้าสำนัก</button></div>';
                }
                if (sc) {
                  row += '<div style="margin-top:2px">🎓 <b>ศิษย์สืบทอด (ทายาทเจ้าสำนัก):</b> ' + esc(sc.titleAndNameTh) + ' (ขั้น ' + sc.cult.stage + ' · พลัง ' + sc.power + ' · แรงหนุนหลัง +' + (sc.backingBonus || 0) + ') ';
                  row += '<button class="btn pri" style="padding:1px 6px;font-size:10px" data-do="intervene-jianghu-figure" data-arg="' + esc(sc.id) + '|GIFT_RELIC">✨ เสกของหนุนศิษย์สืบทอด</button></div>';
                }
                if (anc) {
                  row += '<div style="margin-top:2px" class="muted">🐉 <b>บรรพชนพิทักษ์สำนัก:</b> ' + esc(anc.titleAndNameTh) + ' (ขั้น ' + anc.cult.stage + ' · พลัง ' + anc.power + ' · อายุ ' + anc.ageYears + ' ปี)</div>';
                }
                const de = figs.disciplineElder, ce = figs.craftElder, wm = figs.warMarshal, cds = figs.coreDisciples || [];
                if (de || ce || wm) {
                  row += '<div style="margin-top:3px;padding-top:3px;border-top:1px dashed rgba(255,255,255,0.08);font-size:11px">';
                  if (de) row += '<div>⚖️ <b>ผู้อาวุโสหอวินัย (Tier 2):</b> ' + esc(de.titleAndNameTh) + ' (ขั้น ' + de.cult.stage + ' · คุณธรรม ' + Math.round((de.h && de.h.personality && de.h.personality.integrity) || 75) + ' · ดุดัน ' + Math.round((de.h && de.h.personality && de.h.personality.aggression) || 75) + ')</div>';
                  if (ce) row += '<div>⚗️ <b>ผู้อาวุโสหอโอสถ/หลอมสร้าง (Tier 2):</b> ' + esc(ce.titleAndNameTh) + ' (ขั้น ' + ce.cult.stage + ' · ปรุงยา ' + Math.round((ce.h && ce.h.skills && ce.h.skills.ALCHEMY) || 80) + ' · ตีเหล็ก ' + Math.round((ce.h && ce.h.skills && ce.h.skills.FORGING) || 80) + ') <button class="btn" style="padding:1px 6px;font-size:10px" data-do="exchange-craft-elder" data-arg="' + esc(s.id) + '">⚗️ แลกเปลี่ยนโอสถ/แร่ (150 ศิลา)</button></div>';
                  if (wm) row += '<div>🚩 <b>ผู้อาวุโสแม่ทัพศึก (Tier 2):</b> ' + esc(wm.titleAndNameTh) + ' (ขั้น ' + wm.cult.stage + ' · พลังรบ ' + wm.power + ')</div>';
                  if (cds.length) row += '<div class="muted">🥋 <b>ทำเนียบศิษย์เอก (Tier 3 · ' + cds.length + ' คน):</b> ' + cds.map(c => esc(c.fullNameTh) + ' (ขั้น ' + c.cult.stage + ')').join(' · ') + '</div>';
                  row += '</div>';
                }
                if (s.eternalSwornAlly) {
                  row += '<div style="margin-top:3px"><span class="chip ok">👑 สำนักพันธมิตรร่วมสาบานนิรันดร์ (ส่งบรรณาการ ' + (s.annualTributeStones || 450) + ' ศิลา/ปี)</span></div>';
                }
                row += '</div>';
              }
              row += '</div>';
              return row;
            }).join('') + '</div>';
            h += '</div>';
          });

          h += '</div><div class="subcat-pane" data-subcat="COMMERCE"' + ((subTab === 'ALL' || subTab === 'COMMERCE' || subTab === 'FACTIONS') ? '' : ' style="display:none"') + '>';
          if (SECT && SECT.CARAVAN_AUCTION) {
            const ca = SECT.CARAVAN_AUCTION.ensure(W);
            const mIdx = Object.values(ca.marketIndex || {});
            const lots = (ca.auctionHouse && ca.auctionHouse.activeLots) || [];
            if (!lots.length) SECT.CARAVAN_AUCTION.openSeasonalAuction(W, { quiet: true });
            h += '<h3>🐪 ดัชนีตลาดยุทธภพพลวัต · กองคาราวานการค้าศิษย์ & หอประมูลแดนเซียนรายฤดูกาล</h3><div class="card" style="border-color:var(--gold)">';
            h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px"><div>ราคาสินค้าทั้ง 8 หมวดผันผวนตามสงคราม ฤดูกาล และอุปสงค์จริง เจ้าคลัง/ทูตการค้าสามารถจัดขบวนคาราวานศิษย์ออกไปเก็งกำไรได้</div><button class="btn pri" style="padding:3px 9px;font-size:11.5px" data-do="dispatch-trade-caravan">🐪 จัดส่งกองคาราวานการค้า</button></div>';
            h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">' + mIdx.map(m => '<span class="chip ' + (m.trend === 'UP' ? 'ok' : m.trend === 'DOWN' ? 'r' : '') + '">' + esc(m.icon || '📦') + ' ' + esc(m.nameTh) + ' ×' + (m.multiplier || 1).toFixed(2) + (m.trend === 'UP' ? ' ▲' : m.trend === 'DOWN' ? ' ▼' : '') + '</span>').join('') + '</div>';
            if (ca.auctionHouse && ca.auctionHouse.activeLots && ca.auctionHouse.activeLots.length) {
              h += '<div style="border-top:1px dotted var(--line,#3a3f4a);padding-top:6px"><b>🔨 ลานประมูลแดนเซียนประจำฤดูกาล:</b></div>';
              h += ca.auctionHouse.activeLots.map(lt => '<div style="padding:4px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div><b>' + esc(lt.icon || '✦') + ' ' + esc(lt.nameTh) + '</b> <span class="chip g">ราคาประมูล ' + lt.currentBid + ' ศิลา</span> <span class="muted">(ผู้ถือราคาสูงสุด: ' + esc(lt.highestBidderNameTh) + ')</span><div class="muted" style="font-size:11px">' + esc(lt.descTh) + '</div></div>' + (lt.status === 'OPEN' ? '<button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="bid-auction-lot" data-arg="' + esc(lt.lotId) + '">🔨 เคาะประมูลสู้ราคา</button>' : '<span class="chip ok">✔ ประมูลชนะแล้ว</span>') + '</div>').join('');
            }
            h += '</div>';
          }

          // Patch v2.0.32: 4-Division Continental Grand Assembly & Spirit Cuisine Sect Banquet (Proposal F08)
          if (SECT && SECT.GRAND_ASSEMBLY_BANQUET) {
            const ga = SECT.GRAND_ASSEMBLY_BANQUET.ensure(W);
            const lastAsm = (ga.history && ga.history[0]) || null;
            h += '<h3>🏆 มหาชุมนุมยุทธภพและถกเต๋าระดับทวีป 4 สาย & สิทธิ์สำนักเจ้าภาพ</h3><div class="card" style="border-color:var(--gold)">';
            h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px"><div>สำนักเจ้าภาพปัจจุบัน: <b>' + esc(ga.continentalHostNameTh || W.sect.name) + '</b> <span class="chip ok">ปันผลภาษีตลาดคาราวาน +' + Math.round((ga.hostMarketTaxBonus || 0.15) * 100) + '%</span><div class="muted" style="font-size:11px">ประชันครบ 4 สาย: ประลองยุทธ์ · หลอมโอสถ/ตีศาสตรา · ค่ายกล/กลไก · ชุมนุมถกมรรคาเต๋า</div></div>' +
              '<div style="display:flex;gap:5px;flex-wrap:wrap"><button class="btn pri" style="padding:3px 9px;font-size:11.5px" data-do="convene-grand-assembly">🏆 เปิดมหาชุมนุมยุทธภพ 4 สาย</button><button class="btn" style="padding:3px 9px;font-size:11.5px" data-do="host-spirit-banquet">🍲 จัดงานเลี้ยงฉลองปราณโอชา</button></div></div>';
            if (lastAsm && Array.isArray(lastAsm.divisionResults)) {
              h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:4px">' + lastAsm.divisionResults.map(d => '<span class="chip ' + (d.playerWon ? 'ok' : '') + '">' + esc(d.icon) + ' ' + esc(d.divisionNameTh) + ': ' + esc(d.winnerNameTh) + (d.titleAwardedTh ? (' [' + esc(d.titleAwardedTh) + ']') : '') + '</span>').join('') + '</div>';
            }
            h += '</div>';
          }

          // Patch v2.0.30: Coalition War & Siege Beacon + Emergent Unaffiliated Wandering Figures
          const wFigs = (EXPED.ensureWanderingFigures ? EXPED.ensureWanderingFigures(W) : (W.world.wanderingFigures || [])).filter(f => f && !f.dead && !f.recruitedToPlayer);
          h += '<h3>🚩 สงครามพันธมิตรร่วมทัพ & สัญญาณขอทัพหนุนยามถูกปิดล้อม</h3><div class="card">';
          h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div>เชิญสำนักพันธมิตรที่มีไมตรีสูง (≥60) ส่งผู้อาวุโสแม่ทัพศึกมาร่วมกรีฑาทัพตีค่ายศัตรู หรือจุดพลุสัญญาณเรียกทัพหนุนมาตีขนาบหลังข้าศึกยามสำนักถูกปิดล้อม</div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn pri" style="padding:3px 9px;font-size:11.5px" data-do="launch-coalition-offensive">🚩 เปิดศึกพันธมิตรร่วมทัพ</button><button class="btn" style="padding:3px 9px;font-size:11.5px" data-do="trigger-siege-beacon">🔥 จุดพลุสัญญาณเรียกทัพหนุนพันธมิตร</button></div></div></div>';

          h += '</div><div class="subcat-pane" data-subcat="LEGENDS"' + ((subTab === 'ALL' || subTab === 'LEGENDS' || subTab === 'FACTIONS') ? '' : ' style="display:none"') + '><h3>🧭 ทำเนียบยอดคนอิสระไร้สังกัดแบบสุ่มอุบัติ (' + wFigs.length + ' คน)</h3><div class="card">';
          h += '<div class="muted" style="margin-bottom:6px">จอมยุทธ์พเนจร หมอยาเทวดาเร้นกาย จอมโจรคุณธรรม และนักวางค่ายกลพเนจรที่เดินทางท่องยุทธภพ สามารถท้าประลอง ขอรับการรักษา ผูกมิตร หรือชักชวนเข้าสำนักของเราได้</div>';
          h += wFigs.map(wf => '<div style="padding:6px 0;border-top:1px dotted var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">' +
            '<div style="flex:1;min-width:220px"><b>' + esc(wf.icon || '🧭') + ' ' + esc(wf.titleAndNameTh) + '</b> <span class="chip b">' + esc(wf.archetypeBadgeTh || wf.archetypeNameTh) + '</span> <span class="chip g">' + esc(wf.cult.path) + ' ขั้น ' + wf.cult.stage + ' · พลัง ' + wf.power + '</span> <span class="chip">ไมตรี ' + Math.round(wf.affinity || 25) + '/100</span>' +
            '<div class="muted" style="font-size:11px;margin-top:2px">' + esc(wf.descTh || '') + '</div></div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
            (wf.archetypeId === 'SWORD_SEEKER' ? '<button class="btn pri" style="padding:2px 7px;font-size:11px" data-do="interact-wandering-figure" data-arg="' + esc(wf.id) + '|DUEL">⚔️ ท้าประลองยุทธ์</button>' : '') +
            (wf.archetypeId === 'HERMIT_DOCTOR' ? '<button class="btn pri" style="padding:2px 7px;font-size:11px" data-do="interact-wandering-figure" data-arg="' + esc(wf.id) + '|HEAL_DISCIPLE">⚕️ ขอรับการรักษา/โอสถ (120 ศิลา)</button>' : '') +
            (wf.archetypeId === 'UNORTHODOX_BANDIT' ? '<button class="btn pri" style="padding:2px 7px;font-size:11px" data-do="interact-wandering-figure" data-arg="' + esc(wf.id) + '|BEFRIEND">🍶 ร่วมดื่มสุราผูกมิตร</button><button class="btn dan" style="padding:2px 7px;font-size:11px" data-do="interact-wandering-figure" data-arg="' + esc(wf.id) + '|SUPPRESS">⚔️ ปราบปราม</button>' : '') +
            (wf.archetypeId === 'ROGUE_ARRAYIST' ? '<button class="btn pri" style="padding:2px 7px;font-size:11px" data-do="interact-wandering-figure" data-arg="' + esc(wf.id) + '|REVEAL_SECRET_REALM">🧭 ถามพิกัดแดนลับ</button>' : '') +
            '<button class="btn ok" style="padding:2px 7px;font-size:11px" data-do="recruit-wandering-figure" data-arg="' + esc(wf.id) + '">🤝 ชักชวนเข้าสำนัก</button>' +
            '</div></div>').join('') + '</div>';

          // Wandering Legends Card
          h += '<h3>🐉 ทำเนียบผู้บำเพ็ญในตำนานพเนจร & ปรมาจารย์เร้นกายหวนคืนสู่ยุทธภพ (' + legends.length + ' คน)</h3>';
          h += '<div class="card"><div class="muted" style="margin-bottom:6px">ยอดคนอิสระไร้สังกัดระดับขั้น 7–9 ที่สุ่มกำเนิดใหม่ทุกครั้ง สามารถต่อสู้ บาดเจ็บ หรือถูกสังหารได้ และเมื่อสิ้นชีพจะมีปรมาจารย์ที่เคยสาบสูญปิดด่านพันปีหวนคืนสู่ยุทธภพขึ้นมาแทนที่ตามธรรมชาติ</div>';
          h += legends.map(l => '<div style="padding:6px 0;border-top:1px dotted var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">' +
            '<div style="flex:1;min-width:220px"><b>🐉 ' + esc(l.titleAndNameTh) + '</b> <span class="chip g">' + esc(l.cult.path) + ' ขั้น ' + l.cult.stage + ' · พลัง ' + l.power + '</span> <span class="chip">' + esc(l.alignmentLabelTh) + '</span>' + (l.isReemergence ? ' <span class="chip v">🌟 หวนคืนหลังสาบสูญ</span>' : '') +
            '<div class="muted" style="font-size:11.5px;margin-top:2px">ศาสตรา: <b>' + esc(l.weaponNameTh) + '</b> · วิชาคู่กาย:「' + esc(l.signatureTechNameTh) + '」· ' + esc(l.personalitySummaryTh) + '</div>' +
            '<div class="muted" style="font-size:11px">ประวัติ: ' + esc(l.reemergenceOriginTh) + '</div></div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
            '<button class="btn pri" style="padding:3px 7px;font-size:11px" data-do="intervene-jianghu-figure" data-arg="' + esc(l.id) + '|GIFT_RELIC">✨ เสกศาสตราให้</button>' +
            '<button class="btn" style="padding:3px 7px;font-size:11px" data-do="intervene-jianghu-figure" data-arg="' + esc(l.id) + '|BOOST_STAGE">💊 ประทานโอสถ</button>' +
            '<button class="btn dan" style="padding:3px 7px;font-size:11px" data-do="intervene-jianghu-figure" data-arg="' + esc(l.id) + '|SMITE">⚡ ทดสอบมรณกรรม/หวนคืน</button>' +
            '</div></div>').join('');
          if (fallenLegs.length) {
            h += '<div class="muted" style="margin-top:6px;padding-top:6px;border-top:1px solid var(--line,#3a3f4a);font-size:11px">🕯️ <b>ทำเนียบตำนานผู้ดับสูญไปแล้ว:</b> ' + fallenLegs.map(f => esc(f.titleAndNameTh) + ' (' + esc(f.deathCauseTh || 'ดับสูญ') + ')').join(' · ') + '</div>';
          }
          h += '</div></div>';
        h += '<div class="subcat-pane" data-subcat="REALMS"' + ((subTab === 'ALL' || subTab === 'REALMS') ? '' : ' style="display:none"') + '>';
          const mRanks = (W.world && Array.isArray(W.world.martialRankings)) ? W.world.martialRankings : [];
          h += '<h3>🏆 งานประลองยุทธภพสิบทิศ & ทำเนียบยอดฝีมือใต้หล้า</h3><div class="card">';
          h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px"><span class="muted">ตัวแทน 19 สำนัก ยอดคนในตำนาน และศิษย์เอกของเราประลองชิงความเป็นหนึ่งตามวงจรฤดูกาล</span><button class="btn pri" style="padding:3px 9px;font-size:11.5px" data-do="hold-martial-assembly">🏆 จัดงานประลองยุทธภพสิบทิศ</button></div>';
          if (mRanks.length) {
            h += mRanks.map(r => '<div class="logrow"><span><b>อันดับ ' + r.rank + ': ' + esc(r.nameTh) + '</b> <span class="chip ' + (r.isPlayer ? 'ok' : 'g') + '">' + esc(r.sectNameTh) + '</span></span><span class="muted">วิชา「' + esc(r.techNameTh) + '」· ' + esc(r.weaponNameTh) + ' (คะแนนประลอง ' + r.score + ')</span></div>').join('');
          } else {
            h += '<div class="muted">กำลังรอการเปิดฉากงานประลองยุทธภพสิบทิศรอบถัดไป</div>';
          }
          h += '</div>';
          h += '<h3>🌌 ดินแดนลับโบราณเปิดผนึก & ศึกชิงมรดกตกทอด (' + realms.length + ' แห่ง)</h3>';
          h += '<div class="card"><div class="muted" style="margin-bottom:6px">เมื่อแดนลับโบราณคลายผนึก ศิษย์สืบทอด เจ้าสำนัก และยอดคนในตำนานจากทั่วหล้าจะเดินทางเข้าไปแข่งขันฝ่า 3 ด่าน (ค่ายกลโบราณ ➔ อสูรบรรพกาล ➔ ศึกชิงมรดกห้องชั้นใน) โดยอัตโนมัติ</div>';
          if (realms.length) {
            h += realms.map(r => '<div style="padding:6px 0;border-top:1px dotted var(--line,#3a3f4a)"><div><b>' + esc(r.icon || '🌌') + ' ' + esc(r.nameTh) + '</b> <span class="chip ' + (r.status === 'RESOLVED' ? 'ok' : 'g') + '">' + (r.status === 'RESOLVED' ? ('คว้าชัยโดย: ' + esc(r.winner ? r.winner.nameTh : '-')) : 'กำลังเปิดศึกชิงมรดก') + '</span> <span class="muted" style="font-size:11px">(วันที่ ' + r.openedDay + ')</span></div>' +
              '<div class="muted" style="font-size:11.5px;margin-top:2px">มรดกสูงสุด: <b>' + esc(r.prizeNameTh) + '</b> · ผู้พิทักษ์: ' + esc(r.guardianNameTh) + '</div>' +
              (Array.isArray(r.stageReports) && r.stageReports.length ? '<div style="font-size:11.5px;margin-top:4px;line-height:1.45">' + r.stageReports.map(sr => '<div>• ' + esc(sr) + '</div>').join('') + '</div>' : '') +
              '</div>').join('');
          } else {
            h += '<div class="muted">แดนลับโบราณจะเปิดผนึกขึ้นเองตามวงจรฟ้าดิน</div>';
          }
          h += '</div></div>';
        h += '<div class="subcat-pane" data-subcat="CHRONICLES"' + ((subTab === 'ALL' || subTab === 'CHRONICLES') ? '' : ' style="display:none"') + '>';
          const cFilter = UI.chronicleFilter || 'ALL';
          const filteredChrons = cFilter === 'ALL' ? chrons : chrons.filter(c => c && c.category === cFilter);
          h += '<h3>📜 จดหมายเหตุยุทธภพ & รายงานศึกนอกสำนักฉบับอรรถรส (' + filteredChrons.length + ' บันทึก)</h3>';
          h += '<div class="card">';
          h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">';
          [['ALL', 'ทั้งหมด'], ['BATTLE', '⚔️ ศึกปะทะ'], ['SUCCESSION', '👑 สืบทอดบัลลังก์'], ['FACTION', '⚖️ สภา 3 ฝ่าย'], ['SECRET_REALM', '🌌 แดนลับโบราณ'], ['LEGEND', '🐉 ยอดคนในตำนาน'], ['VISITOR', '🎐 ผู้มาเยือน']].forEach(([ck, clbl]) => {
            h += '<button type="button" class="chip ' + (cFilter === ck ? 'ok' : '') + '" style="cursor:pointer" data-do="set-chronicle-filter" data-arg="' + ck + '">' + clbl + '</button>';
          });
          h += '</div>';
          if (filteredChrons.length) {
            h += filteredChrons.map(c => '<div style="padding:7px 0;border-top:1px dotted var(--line,#3a3f4a)">' +
              '<div><span class="chip g">' + esc(c.categoryTh) + '</span> <b>' + esc(c.icon || '📜') + ' ' + esc(c.titleTh) + '</b> <span class="muted" style="font-size:11px">(วันที่ ' + c.day + ')</span></div>' +
              '<div style="font-size:12px;margin-top:4px;line-height:1.5">' + esc(c.storyTh) + '</div>' +
              (c.combatBreakdownTh ? '<div class="muted" style="font-size:11px;margin-top:3px">⚔️ <b>วิเคราะห์การปะทะ/แรงขับ:</b> ' + esc(c.combatBreakdownTh) + '</div>' : '') +
              (c.consequenceTh ? '<div style="font-size:11.5px;color:#ffd166;margin-top:2px">➔ <b>ผลลัพธ์ต่อยุทธภพ:</b> ' + esc(c.consequenceTh) + '</div>' : '') +
              '</div>').join('');
          } else {
            h += '<div class="muted">ยังไม่มีบันทึกจดหมายเหตุในหมวดนี้</div>';
          }
          h += '</div></div>';
      }
    } else {
      const l = W.logs.filter(x => ['mission', 'raid', 'event', 'tournament'].includes(x.type)).slice(-60).reverse(); h += l.length ? l.map(x => '<div class="logrow"><span class="tm">' + dayStamp(x.t) + '</span>' + linkify(W, x.text, x.ids, x.refs) + '</div>').join('') : '<div class="muted">ยังไม่มีเหตุการณ์นอกสำนัก</div>';
    }
    return h;
  };


  UI.rVisitors = () => {
    const W = UI.G.W;
    if (!g.VC) return '<div class="muted">ไม่พบโมดูลผู้มาเยือน</div>';
    g.VC.ensure(W);
    const guests = g.VC.activeGuests(W);
    const traders = g.EXT ? g.EXT.activeVisitors(W) : [];
    const regList = Object.values(W.world.guestRegistry || {}).slice(-16).reverse();
    const hist = (W.world.visitorHistory || []).slice(-15).reverse();
    let h = '<div class="card"><b>🎐 ผู้มาเยือนและคนนอกสำนัก (Outsiders & Visitors)</b><div class="muted">ผู้มาเยือนเป็นคนนอกที่เดินทางมาค้าขาย สนทนา แลกเปลี่ยนคัมภีร์ หรือบอกเล่าเบาะแสในยุทธภพ โดยไม่นับรวมในโควตาเตียงพัก 100 คนของศิษย์ในสำนัก</div>';
    h += '<div class="grid2" style="margin-top:6px"><div>🎐 แขกในสำนักขณะนี้ <b>' + guests.length + ' คน</b></div><div>🪙 พ่อค้าเร่ในตลาด <b>' + traders.length + ' คน</b></div><div>📖 แขกขาจรที่คุ้นเคย <b>' + Object.keys(W.world.guestRegistry || {}).length + ' คน</b></div><div>門 นโยบายเปิดรับสำนัก <b>' + Math.round((W.sect.policy && W.sect.policy.openness) || 50) + '%</b></div></div></div>';

    h += '<h3>🎐 แขกยุทธภพที่กำลังพำนักในสำนัก (' + guests.length + ')</h3>';
    if (guests.length) {
      h += guests.map(v => {
        const stChip = v.state === 'admitted' ? '<span class="chip ok">รับรองเข้าสำนัก</span>' : '<span class="chip g">จำกัดพื้นที่หน้าด่าน/ลาน</span>';
        const bld = (W.map.byId && W.map.byId[v.targetBkey]) ? W.map.byId[v.targetBkey].nameTh : 'ลานสำนัก';
        return '<div class="card" style="cursor:pointer" data-visitor="' + esc(v.id) + '"><div style="display:flex;justify-content:space-between;align-items:center"><b>🎐 ' + esc(v.nameTh) + (v.chineseName ? ' (' + esc(v.chineseName) + ')' : '') + '</b>' + stChip + '</div><div class="sub">' + esc(v.titleTh || '') + ' · พักถึงวันที่ ' + v.untilDay + ' · บริเวณ: ' + esc(bld) + '</div><div class="muted" style="font-size:11.5px;margin-top:3px">จุดประสงค์: ' + esc(v.purposeTh || '-') + ' · อนุญาตโดย: ' + esc(v.admissionBy || 'เวรยามประตู') + ' (' + esc(v.admissionReasonTh || '') + ')</div></div>';
      }).join('');
    } else {
      h += '<div class="card muted">ขณะนี้ไม่มีแขกยุทธภพพำนักในสำนัก</div>';
    }

    if (traders.length) {
      h += '<h3>🪙 พ่อค้าเร่ที่ตลาดสำนัก (' + traders.length + ')</h3>';
      h += traders.map(v => '<div class="card" style="cursor:pointer" data-visitor="' + esc(v.id) + '"><b>🪙 ' + esc(v.nameTh) + '</b> <span class="chip">อยู่ถึงวันที่ ' + v.untilDay + '</span><div class="sub">เงินทุน ' + U.fmtNum(v.stones || 0) + ' ศิลา · แตะเพื่อดูรายละเอียด</div></div>').join('');
    }

    if (regList.length) {
      h += '<h3>🤝 บันทึกผู้มาเยือนขาประจำและคนรู้จักนอกสำนัก (' + regList.length + ')</h3><div class="card">';
      h += regList.map(v => '<div class="logrow" style="cursor:pointer" data-visitor="' + esc(v.id) + '"><span><b>' + esc(v.nameTh) + '</b> <span class="muted">(' + esc(v.titleTh || v.role) + ')</span></span><span class="muted">มาเยือน ' + (v.visits || 1) + ' ครั้ง · ไมตรี ' + Math.round(v.affinityToSect || 50) + '</span></div>').join('');
      h += '</div>';
    }

    if (hist.length) {
      h += '<h3>📜 ประวัติการมาเยือนล่าสุด</h3><div class="card">' + hist.map(x => '<div class="logrow"><span class="tm">วันที่ ' + x.day + '</span><span><a class="link-ref visitor" data-visitor="' + esc(x.visitorId) + '" style="color:#ffcb77;text-decoration:none;font-weight:600">🎐 ' + esc(x.nameTh) + '</a> — ' + esc(x.summaryTh || x.outcome || '') + '</span></div>').join('') + '</div>';
    }
    return h;
  };

  UI.rVisitor = () => {
    const W = UI.G.W;
    const v = (g.VC && g.VC.findVisitor) ? g.VC.findVisitor(W, UI.visitorId) : null;
    if (!v) return '<div class="muted">ไม่พบข้อมูลผู้มาเยือน</div>';
    const onMap = (v.state === 'admitted' || v.state === 'restricted') && v.untilDay >= W.day && Number.isFinite(v.x);
    let h = '<div class="card"><div style="font-size:16px;font-weight:700">🎐 ' + esc(v.nameTh) + (v.chineseName ? ' <span class="muted">(' + esc(v.chineseName) + ')</span>' : '') + '</div>';
    h += '<div class="sub">' + esc(v.titleTh || v.role || 'ผู้มาเยือน') + ' · สถานะ: <b>' + (onMap ? 'กำลังพำนักในสำนัก' : 'เดินทางออกจากสำนักแล้ว (Offsite Registry)') + '</b></div>';
    if (v.purposeTh) h += '<div style="margin-top:6px">🎯 <b>จุดประสงค์การมาเยือน:</b> ' + esc(v.purposeTh) + '</div>';
    if (v.admissionReasonTh) h += '<div class="muted" style="margin-top:4px">🚪 <b>การคัดกรองที่ประตูสำนัก:</b> ' + esc(v.admissionReasonTh) + (v.admissionBy ? ' (ผู้พิจารณา: ' + esc(v.admissionBy) + ')' : '') + '</div>';
    h += '<div class="grid2" style="margin-top:6px"><div>ไมตรีต่อสำนัก <b>' + Math.round(v.affinityToSect == null ? 50 : v.affinityToSect) + '/100</b></div><div>ความน่าเชื่อถือ <b>' + Math.round(v.credibility == null ? 65 : v.credibility) + '%</b></div><div>จำนวนครั้งที่มาเยือน <b>' + (v.visits || 1) + ' ครั้ง</b></div><div>ศิลาพกพา <b>' + U.fmtNum(Math.round(v.stones || 0)) + '</b></div></div>';
    if (onMap) {
      h += '<div style="margin-top:8px"><button class="btn pri" data-do="locv" data-arg="' + esc(v.id) + '">📍 ดูตำแหน่งบนแผนที่สำนัก</button></div>';
    }
    h += '</div>';
    if (Array.isArray(v.interactions) && v.interactions.length) {
      h += '<h3>💬 บันทึกการสนทนาและแลกเปลี่ยนกับคนในสำนัก</h3><div class="card">' + v.interactions.slice(-12).reverse().map(it => '<div class="logrow"><span class="tm">วันที่ ' + it.day + '</span><span>' + linkify(W, it.textTh, it.npcId ? [it.npcId] : []) + '</span></div>').join('') + '</div>';
    }
    return h;
  };

  UI.rClues = () => {
    const W = UI.G.W;
    if (!g.VC) return "<div class=\"muted\">ไม่พบโมดูลเบาะแส</div>";
    const cs = g.VC.ensure(W);
    const activeList = Object.values(cs.active || {}).sort((a, b) => (b.rarity === "Legendary" ? 1 : 0) - (a.rarity === "Legendary" ? 1 : 0) || b.createdDay - a.createdDay);
    const uniqueArts = Object.values(W.world.uniqueArtifacts || {});
    const vNews = (W.world && Array.isArray(W.world.visitorNews)) ? W.world.visitorNews.slice(-6).reverse() : [];

    let h = "<div class=\"card\"><div style=\"display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px\"><b>🗺️ เบาะแส ข่าวลือ และมรดกยุทธภพ (Living Clues & Inheritance)</b><button class=\"btn\" style=\"padding:3px 8px;font-size:11px\" data-do=\"toggle-clue-debug\">" + (UI.showClueDebug ? "🙈 ซ่อนโหมดผู้สังเกตการณ์ (Debug)" : "👁️ เปิดโหมดผู้สังเกตการณ์ (Debug)") + "</button></div>";
    h += "<div class=\"muted\" style=\"margin-top:4px\">ศิษย์ตัดสินใจสืบเบาะแสจากความเชื่อมั่น การยืนยันจากหลายแหล่ง และความพร้อมของตนเอง (แสดงเฉพาะขั้นตอนที่สำนัก/ศิษย์ค้นพบแล้วเท่านั้น)</div>";
    const fn = cs.funnel || {};
    h += "<div class=\"grid2\" style=\"margin-top:6px\"><div>ข่าวลือที่ได้รับ <b>" + (fn.rumorsSpawned || 0) + "</b></div><div>แบ่งปันในสำนัก <b>" + (fn.cluesShared || 0) + "</b></div><div>ข่าวสารยุทธภพทั่วไป <b>" + (fn.worldNewsShared || 0) + "</b></div><div>ออกสืบเบาะแส <b>" + (fn.investigationsStarted || 0) + "</b></div><div>ผ่านด่านทดสอบ <b>" + (fn.nodesPassed || 0) + "</b></div><div>คว้ามรดกสำเร็จ <b>" + (fn.rewardsClaimed || 0) + "</b></div></div></div>";

    if (vNews.length) {
      h += "<h3>📰 ข่าวสารและเหตุการณ์ยุทธภพจากผู้มาเยือน (" + vNews.length + ")</h3><div class=\"card\">";
      h += vNews.map(nw => "<div class=\"logrow\"><span class=\"tm\">วันที่ " + nw.day + "</span><span><b>" + esc(nw.speakerNameTh || "ผู้มาเยือน") + ":</b> " + esc(nw.textTh) + "</span></div>").join("");
      h += "</div>";
    }

    if (uniqueArts.length) {
      const totalLegEq = (g.VC.LEGENDARY_EQUIPMENT && g.VC.LEGENDARY_EQUIPMENT.length) || 21;
      h += "<h3>👑 ศาสตรา เกราะ และเครื่องประดับระดับตำนานที่ปรากฏในโลกแล้ว (" + uniqueArts.length + "/" + totalLegEq + ")</h3><div class=\"card\">";
      h += uniqueArts.map(ua => {
        const wDef = (g.VC.LEGENDARY_EQUIPMENT_BY_ID && g.VC.LEGENDARY_EQUIPMENT_BY_ID[ua.itemId]) || (g.VC.LEGENDARY_WEAPON_BY_ID && g.VC.LEGENDARY_WEAPON_BY_ID[ua.itemId]);
        const slotLbl = wDef && wDef.slot === "ARMOR" ? "🛡️ เกราะตำนาน" : wDef && wDef.slot === "ACCESSORY" ? "📿 เครื่องประดับตำนาน" : "🗡️ อาวุธตำนาน";
        return "<div class=\"logrow\"><span><span class=\"chip g\">★ " + slotLbl + " T7</span> <b>" + esc(wDef ? wDef.nameTh : ua.itemId) + "</b>" + (wDef && wDef.chineseName ? " <span class=\"muted\">(" + esc(wDef.chineseName) + ")</span>" : "") + "</span><span class=\"muted\">ผู้ถือครอง: <b>" + esc(ua.ownerNameTh || ua.ownerKind) + "</b></span></div>";
      }).join("");
      h += "</div>";
    }

    h += "<h3>🧭 เบาะแสและสายสืบค้นทั้งหมด (" + activeList.length + ")</h3>";
    if (!activeList.length) {
      h += "<div class=\"card muted\">ยังไม่มีเบาะแสที่รับรู้ในสำนัก — ผู้มาเยือน การพูดคุยกับสำนักพันธมิตร และการออกสำรวจจะค่อย ๆ นำข่าวลือเข้ามา</div>";
    } else {
      h += activeList.map(inst => {
        const pView = (g.VC.getPlayerClueView && !UI.showClueDebug) ? g.VC.getPlayerClueView(W, inst.instanceId, { debugAllSteps: false }) : null;
        const tpl = g.VC.TEMPLATE_BY_ID[inst.templateId] || {};
        const step = pView ? pView.currentKnownStep : (tpl.steps || [])[inst.currentNodeIdx || 0];
        const knowers = Object.keys(inst.knownBy || {}).map(id => W.byId[id]).filter(Boolean);
        const avgConf = knowers.length ? Math.round(knowers.reduce((s, n) => s + ((inst.knownBy[n.id] && inst.knownBy[n.id].confidence) || 55), 0) / knowers.length) : 55;
        const stCol = inst.status === "claimed" ? "ok" : inst.status === "disproven" ? "r" : inst.status === "in_progress" ? "b" : "g";
        const stTh = { active: "กำลังเปิดสืบค้น", in_progress: "กำลังส่งคนไปสืบ", claimed: "ได้รับมรดกแล้ว", disproven: "พิสูจน์แล้วว่าเป็นข่าวลือเท็จ", expired: "พ้นกำหนดเวลา", abandoned: "ยุติการสืบค้นชั่วคราว" }[inst.status] || inst.status;
        let card = "<div class=\"card\" style=\"cursor:pointer\" data-clue=\"" + esc(inst.instanceId) + "\">";
        card += "<div style=\"display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap\"><b>" + (tpl.rarity === "Legendary" ? "★ " : "🗺️ ") + esc(inst.titleTh) + "</b><span class=\"chip " + stCol + "\">" + esc(stTh) + "</span></div>";
        card += "<div class=\"sub\" style=\"margin-top:3px\">" + esc(inst.rumorTextTh || "") + "</div>";
        card += "<div class=\"muted\" style=\"font-size:11.5px;margin-top:4px\">ผู้รับรู้ในสำนัก (" + knowers.length + "): " + (knowers.length ? knowers.slice(0, 5).map(n => esc(n.h.name.given)).join("、") : "คลังข่าวสารสำนัก") + " · ความเชื่อมั่นเฉลี่ย <b>" + avgConf + "%</b> · แหล่งข่าวอิสระ <b>" + ((inst.corroboratingRoots || []).length) + " แหล่ง</b></div>";
        if (step && inst.status !== "claimed" && inst.status !== "disproven") {
          const scopeTh = step.scope === "personal" ? "👤 ทดสอบเฉพาะตัวผู้สืบทอด" : step.scope === "party_all" ? "👥 ทดสอบร่วมกันทั้งคณะ" : "🤝 สมาชิกในคณะช่วยกันได้";
          const hiddenCnt = pView ? pView.hiddenFutureStepsCount : 0;
          card += "<div style=\"margin-top:4px;font-size:12px\">↳ <b>ขั้นปัจจุบันที่ทราบ:</b> " + esc(step.titleTh) + " <span class=\"chip\">" + scopeTh + "</span>" + (hiddenCnt > 0 ? " <span class=\"muted\">(มีเงื่อนงำถัดไปที่ยังไม่เปิดเผยอีก " + hiddenCnt + " ขั้น)</span>" : "") + "</div>";
        }
        if (inst.backoffUntilDay && inst.backoffUntilDay > W.day) {
          card += "<div class=\"muted\" style=\"font-size:11.5px;margin-top:3px;color:#ff9e94\">⏳ พักเตรียมความพร้อมหลังติดขัด ถึงวันที่ " + inst.backoffUntilDay + " (ล้มเหลวสะสม " + (inst.failCount || 1) + " ครั้ง)</div>";
        }
        if (inst.lastActionReasonTh) {
          card += "<div class=\"muted\" style=\"font-size:11.5px;margin-top:3px;color:var(--gold)\">📌 สถานะล่าสุด: " + esc(inst.lastActionReasonTh) + "</div>";
        }
        if (UI.showClueDebug) {
          card += "<div style=\"margin-top:5px;padding:4px 6px;background:rgba(255,215,100,0.08);border:1px dashed var(--gold);font-size:11px\">🔍 <b>[Debug World Truth]</b> template=<code>" + esc(inst.templateId) + "</code> · truth=<b>" + esc(inst.truthState) + "</b> · target=<code>" + esc(tpl.targetKind + ":" + tpl.targetId) + "</code> · rootRumorId=<code>" + esc(inst.rootRumorId) + "</code></div>";
        }
        card += "</div>";
        return card;
      }).join("");
    }
    return h;
  };

  UI.rClueDetail = () => {
    const W = UI.G.W;
    const cs = g.VC && g.VC.ensure ? g.VC.ensure(W) : null;
    const inst = cs && (cs.active[UI.clueId] || (cs.history || []).find(x => x.instanceId === UI.clueId));
    if (!inst) return "<div class=\"muted\">ไม่พบข้อมูลเบาะแส</div>";
    const tpl = (g.VC && g.VC.TEMPLATE_BY_ID && g.VC.TEMPLATE_BY_ID[inst.templateId]) || {};
    const pView = (g.VC && g.VC.getPlayerClueView) ? g.VC.getPlayerClueView(W, inst.instanceId, { debugAllSteps: !!UI.showClueDebug }) : null;
    const knowers = Object.entries(inst.knownBy || {});
    let h = "<div class=\"card\"><div style=\"font-size:16px;font-weight:700\">" + (tpl.rarity === "Legendary" ? "★ " : "🗺️ ") + esc(inst.titleTh) + "</div>";
    h += "<div class=\"sub\" style=\"margin-top:4px\">" + esc(inst.rumorTextTh || "") + "</div>";
    h += "<div class=\"muted\" style=\"margin-top:4px\">สถานะ: <b>" + esc(inst.status) + "</b> · บันทึกเข้าหอคัมภีร์สำนัก: <b>" + (inst.reportedToSect ? "บันทึกแล้ว" : "รู้เฉพาะตัว") + "</b> · แหล่งข่าวต้นตออิสระ: <b>" + ((inst.corroboratingRoots || []).length) + " แหล่ง</b></div>";
    if (inst.backoffUntilDay && inst.backoffUntilDay > W.day) {
      h += "<div style=\"margin-top:4px;color:#ff9e94;font-size:12px\">⏳ <b>ช่วงพักเตรียมตัว (Backoff):</b> รอถึงวันที่ " + inst.backoffUntilDay + " · ล้มเหลวสะสม " + (inst.failCount || 1) + " ครั้ง</div>";
    }
    if (inst.lastActionReasonTh) h += "<div style=\"margin-top:6px;color:var(--gold)\">📌 <b>ความคืบหน้าล่าสุด:</b> " + esc(inst.lastActionReasonTh) + "</div>";
    h += "</div>";

    // Readiness Forecast & Approach Selector for Current Step
    const curStep = (tpl.steps || [])[inst.currentNodeIdx || 0];
    if (curStep && inst.status !== "claimed" && inst.status !== "disproven") {
      const leadNpc = knowers.length ? W.byId[knowers[0][0]] : W.byId[W.sect.masterId];
      const forecast = (g.VC && g.VC.forecastNodeReadiness && leadNpc) ? g.VC.forecastNodeReadiness(W, leadNpc, inst, curStep) : null;
      const approaches = Array.isArray(curStep.approaches) && curStep.approaches.length ? curStep.approaches : ["interpret_evidence", "tactical_retreat"];
      const appNames = {
        auto: "🤖 ให้ผู้สืบเลือกตามความถนัด",
        interpret_evidence: "🔍 ตีความจารึก/แกะรอย",
        help_contact: "🤝 ช่วยเหลือผู้รู้/สานไมตรี",
        honor_commitment: "⚖️ รักษาคำสัตย์/พันธสัญญา",
        nonlethal_trial: "🥋 ประลองเชิงยุทธ์ไม่เอาชีวิต",
        deliver_item: "🎁 มอบสิ่งของ/เครื่องเซ่น",
        guardian_combat: "⚔️ ปะทะผู้พิทักษ์ด่าน",
        tactical_retreat: "🛡️ ถอยเชิงยุทธ์รักษาชีวิต"
      };
      const curApp = inst.preferredApproach || "auto";
      h += "<h3>🧭 แนวทางคลี่คลายด่านปัจจุบัน & การประเมินความพร้อม</h3><div class=\"card\">";
      if (forecast) {
        h += "<div>ผู้ประเมินหลัก: <b>" + esc(leadNpc ? HC.fullName(leadNpc) : "-") + "</b> · ความพร้อม: <b style=\"color:" + (forecast.ready ? "#5fd38a" : "#f0a030") + "\">" + (forecast.ready ? "✔ พร้อมดำเนินการ" : "⏳ ต้องเตรียมตัวเพิ่ม") + "</b> (" + esc(forecast.reasonTh || "") + ")</div>";
      }
      h += "<div style=\"margin-top:6px;font-size:12px\"><b>เลือกแนวทางรับมือเมื่อคณะเดินทางไปถึง:</b></div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-top:4px\">";
      ["auto"].concat(approaches).forEach(ap => {
        const on = curApp === ap;
        h += "<button type=\"button\" class=\"chip " + (on ? "g" : "") + "\" data-do=\"set-clue-approach\" data-arg=\"" + esc(inst.instanceId + "|" + ap) + "\" style=\"cursor:pointer\">" + esc(appNames[ap] || ap) + "</button>";
      });
      h += "</div></div>";
    }

    if (tpl.steps && tpl.steps.length) {
      const maxKnownIdx = UI.showClueDebug ? (tpl.steps.length - 1) : (pView && Array.isArray(pView.visibleSteps) ? (pView.visibleSteps.length - 1) : (inst.currentNodeIdx || 0));
      const visibleSteps = tpl.steps.slice(0, maxKnownIdx + 1);
      const hiddenCount = Math.max(0, tpl.steps.length - visibleSteps.length);
      h += "<h3>🪜 ลำดับขั้นการสืบค้นที่เปิดเผยแล้ว (" + visibleSteps.length + (UI.showClueDebug ? "/" + tpl.steps.length : "") + " ขั้น)</h3><div class=\"card\">";
      h += visibleSteps.map((st, idx) => {
        const done = idx < (inst.currentNodeIdx || 0) || inst.status === "claimed";
        const cur = idx === (inst.currentNodeIdx || 0) && inst.status !== "claimed" && inst.status !== "disproven";
        const scopeTh = st.scope === "personal" ? "ทดสอบเฉพาะบุคคล (เพื่อนร่วมทีมแบกแทนไม่ได้)" : st.scope === "party_all" ? "ทดสอบทั้งคณะ" : "สมาชิกในทีมช่วยตรวจได้";
        return "<div style=\"padding:4px 0;border-bottom:1px solid var(--line,#3a3f4a)\"><b>" + (done ? "✅ " : cur ? "👉 " : "🔒 ") + "ขั้นที่ " + (idx + 1) + ": " + esc(st.titleTh) + "</b> <span class=\"chip\">" + esc(st.type) + "</span> <span class=\"chip b\">📍 " + esc(st.locationId || "sect") + "</span><div class=\"muted\" style=\"font-size:11.5px\">" + esc(st.hintTh || "") + " · ขอบเขต: " + scopeTh + "</div></div>";
      }).join("");
      if (hiddenCount > 0) {
        h += "<div class=\"muted\" style=\"padding-top:6px\">🔒 <i>ยังมีเงื่อนงำขั้นถัดไปที่ยังไม่ถูกค้นพบอีก " + hiddenCount + " ขั้น (ต้องคลี่คลายขั้นปัจจุบันให้สำเร็จก่อน)</i></div>";
      }
      h += "</div>";
    }

    if (inst.lastEncounterSummary && Array.isArray(inst.lastEncounterSummary.logTh) && inst.lastEncounterSummary.logTh.length) {
      const el = inst.lastEncounterSummary;
      h += "<h3>⚔️ บันทึกการปะทะในการสำรวจนอกสำนัก (" + esc(el.guardianNameTh || "ผู้พิทักษ์") + ")</h3><div class=\"card\">";
      h += "<div class=\"sub\" style=\"margin-bottom:4px\">ผลลัพธ์: <b>" + (el.win ? "ชนะผู้พิทักษ์" : el.retreated ? "ถอยเชิงยุทธ์" : "พ่ายแพ้") + "</b> · จำนวนกระบวนท่า: " + el.rounds + " รอบ</div>";
      h += el.logTh.map(line => "<div class=\"logrow\">" + esc(line) + "</div>").join("");
      h += "</div>";
    }

    if (Array.isArray(inst.partyRefusals) && inst.partyRefusals.length) {
      h += "<h3>🙅 บันทึกการพิจารณาคำชวนร่วมคณะสืบค้น</h3><div class=\"card\">";
      h += inst.partyRefusals.slice(-6).reverse().map(rf => "<div class=\"logrow\"><span class=\"tm\">วันที่ " + rf.day + "</span><span><b>" + esc(rf.npcNameTh || rf.npcId) + "</b> ปฏิเสธคำชวนของ " + esc(rf.leaderNameTh || "-") + " — <span class=\"muted\">" + esc(rf.reasonTh || "") + "</span></span></div>").join("");
      h += "</div>";
    }

    if (knowers.length) {
      h += "<h3>👥 ศิษย์ที่รับรู้เบาะแสนี้ (" + knowers.length + " คน)</h3><div class=\"card\">";
      h += knowers.map(([nid, info]) => {
        const npc = W.byId[nid];
        return "<div class=\"logrow\"><span>" + (npc ? nameLink(npc) : esc(nid)) + " <span class=\"muted\">(รับรู้วันที่ " + info.learnedDay + " · ทราบถึงขั้นที่ " + ((info.knownNodeIdx || 0) + 1) + ")</span></span><b>เชื่อมั่น " + Math.round(info.confidence || 55) + "%</b></div>";
      }).join("");
      h += "</div>";
    }

    if (Array.isArray(inst.history) && inst.history.length) {
      h += "<h3>📜 บันทึกการสืบค้นเบาะแส</h3><div class=\"card\">" + inst.history.slice().reverse().map(ev => "<div class=\"logrow\"><span class=\"tm\">วันที่ " + ev.day + "</span><span>" + esc(ev.text) + "</span></div>").join("") + "</div>";
    }
    return h;
  };

  UI.rEcology = () => {
    const W = UI.G.W, eco = JD.ECOLOGY;
    if (!eco) return '<div class="muted">ยังไม่มีข้อมูลนิเวศอสูร</div>';
    let h = '<div class="card"><b>🐾 สัตว์อสูรและนิเวศยุทธภพ v1.10.12</b><div class="muted">สัตว์อสูร 80 ชนิด 12 ตระกูล วัตถุดิบ 160 รายการ และสูตรผลิต 80 สูตร อสูรอาศัยอยู่ตามทิศและภูมิประเทศรอบสำนัก</div></div>';

    const active = W.wildlife ? W.wildlife.beasts.filter(b => !b.dead && !b.gone) : [];
    h += '<h3>สัตว์อสูรบนแผนที่ขณะนี้ (' + active.length + '/12)</h3>';
    if (active.length) {
      h += active.map(b => {
        const z = g.WILD?.zones[b.zone];
        const zName = z ? z.nameTh : b.zone;
        const hpPct = Math.round((b.hp / b.hpMax) * 100);
        return '<div class="card"><b>' + (b.legendary ? '★ ' : '') + esc(b.name) + '</b> <span class="chip ' + (b.legendary ? 'v' : b.tier >= 4 ? 'ok' : 'b') + '">ระดับ ' + b.tier + '</span> <span class="chip">' + esc(zName) + '</span><div>พลังรบ ' + b.power + ' CP · เลือด ' + Math.round(b.hp) + '/' + b.hpMax + ' (' + hpPct + '%)</div>' + (b.legendary ? '<div class="muted">อสูรบรรพกาลหายาก อาจจากไปเมื่อใดก็ได้</div>' : '') + '</div>';
      }).join('');
    } else {
      h += '<div class="muted">ยังไม่มีสัตว์อสูรปรากฏตัวรอบสำนักในขณะนี้</div>';
    }

    h += '<h3>สารานุกรม 12 ตระกูลอสูรและอสูรบรรพกาล (80 ชนิด)</h3>';
    const famNames = {
      CANINE: 'สุนัข/หมาป่า', FELINE: 'เสือ/แมวป่า', URSINE: 'หมี', BOAR: 'หมูป่า',
      SERPENT: 'อสรพิษ/งู', AVIAN: 'วิหค/อินทรี', ARTHROPOD: 'แมลง/แมงป่อง',
      SHELL: 'เต่า/หุ้มเกราะ', UNGULATE: 'กวาง/กระทิง', AQUATIC: 'มัจฉา/สัตว์น้ำ',
      PLANT_SPIRIT: 'พฤกษา/เห็ด', CHIMERA: 'สัตว์ผสม/วิญญาณ'
    };

    h += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">';
    Object.keys(famNames).forEach(f => {
      const cnt = eco.species.filter(s => s.family === f).length;
      h += '<span class="chip">' + esc(famNames[f]) + ' (' + cnt + ')</span>';
    });
    h += '<span class="chip v">ตำนานชั้นฟ้า (8)</span></div>';

    h += '<h3>ตัวอย่างสายพันธุ์และชิ้นส่วนสำคัญ</h3>';
    const _terrTh = { forest: 'ป่าไผ่·พงไพร', mountain: 'ขุนเขา·ผาหิน', water: 'ลุ่มน้ำ·ทะเลสาบ', plains: 'ทุ่งหญ้า·ที่ราบ', desert: 'ทะเลทราย·แดนแร้นแค้น', swamp: 'บึงพิษ·หุบเหว', cave: 'ถ้ำลึก', ruins: 'ซากโบราณ' };
    h += eco.species.slice(0, 36).map(s => {
      const drops = (s.drops || []).map(id => esc(ECO.name(id))).join(' · ');
      const habitat = s.terrain === 'water' ? 'ลุ่มน้ำสาบมังกรคราม (ภารกิจภายนอก)' : 'รอบสำนัก (' + (_terrTh[s.terrain] || s.terrain) + ')';
      const elName = (g.ELEM && g.ELEM.ELEMENTS && g.ELEM.ELEMENTS[s.element] && g.ELEM.ELEMENTS[s.element].nameTh) || (HC.AFF_TH && HC.AFF_TH[s.element]) || s.element;
      return '<div class="card"><b>' + (s.tier >= 6 ? '★ ' : '') + esc(s.nameTh) + '</b> <span class="chip ' + (s.tier >= 6 ? 'v' : s.tier >= 4 ? 'ok' : 'b') + '">ขั้น ' + s.tier + '</span> <span class="chip">' + esc(s.familyTh || s.family || 'อสูร') + '</span><div class="muted">พลังรบ ' + s.cp + ' CP · ถิ่น: ' + esc(habitat) + ' · ธาตุ: ' + esc(elName) + '</div><div>ชิ้นส่วนดรอป: ' + drops + '</div></div>';
    }).join('');
    h += '<div class="muted" style="text-align:center;padding:8px">และอีก 44 ชนิดในสารานุกรมธรรมชาติ</div>';

    h += '<h3>ตำรับคราฟจากวัตถุดิบอสูร (80 สูตร)</h3>';
    h += '<div class="card">โอสถรักษา/บัฟ/ตบะ 48 ตำรับ · ศาสตราวุธและชุดยุทธ์ 32 รายการ รองรับวิถีทั้ง 12 ประเภท<div class="muted">ผลิตได้ที่โรงหลอมและหอโอสถ สมาชิกจะนำวัตถุดิบจากการล่ามาบริจาคหรือซื้อใช้ตามความเหมาะสมของวิถี</div></div>';

    return h;
  };

  UI.rContent = () => {
    const W = UI.G.W, D = JD.EXPANSION, C = g.CONTENT;
    const cSub = UI.worldContentSubTab || 'REGIONS';
    let h = '<div class="card"><b>เนื้อหายุทธภพ v1.10</b><div class="muted">สมาชิกเลือกเดินทางจากกำลัง ความสนใจ ความระวัง และของที่สำนักขาด คัมภีร์กับตำรับต้องค้นพบก่อนใช้งาน</div></div>';
    h += renderSubTabBar('set-content-subtab', cSub, [
      ['REGIONS', '🗺️ เส้นทางภายนอก & สายย่อย 9 ขั้น'],
      ['RECIPES', '⚗️ ตำรับ · อวัยวะอสูร & การทดลอง'],
      ['ALL', '📋 ดูทั้งหมด']
    ], 'หมวดย่อยพื้นที่และตำรับยุทธภพ');
    h += '<div class="subcat-pane" data-subcat="REGIONS"' + ((cSub === 'ALL' || cSub === 'REGIONS') ? '' : ' style="display:none"') + '><h3>เส้นทางภายนอก</h3>' + D.regions.map(r => {
      const s = C.site(W, r), known = r.recipes.filter(id => W.sect.knownRecipes.includes(id)).length;
      return '<div class="card"><b>' + r.icon + ' ' + esc(r.nameTh) + '</b><div class="muted">' + esc(r.desc) + '</div><div>อันตราย ' + r.danger + '/4 · เดินทางประมาณ ' + r.days + ' วัน · กำลังคณะขั้นต่ำ ' + r.minPower + '</div><div class="muted">' + esc(r.hazardTh) + '</div><div>' + r.resources.map(e => '<span class="chip ' + (e.kind === 'hunt' ? 'v' : 'ok') + '">' + (e.kind === 'hunt' ? '🐾 ' : '🌿 ') + esc(ECO.name(e.id)) + ' ' + Math.floor(s.stock[e.id]) + '/' + e.cap + '</span>').join('') + '</div><div class="muted">ทรัพยากรฟื้นตัววันละ 1–3 หน่วยตามชนิด · 🐾 ต้องล่าสำเร็จ · กลับแล้ว ' + s.visits + ' ครั้ง · พบตำรับ ' + known + '/' + r.recipes.length + '</div></div>';
    }).join('');
    h += '</div><div class="subcat-pane" data-subcat="RECIPES"' + ((cSub === 'ALL' || cSub === 'RECIPES') ? '' : ' style="display:none"') + '><h3>ตำรับที่ค้นพบ ' + W.sect.knownRecipes.filter(id => ECO.recipeById[id]).length + '/' + D.recipes.length + '</h3>' + D.recipes.map(r => {
      const found = W.sect.knownRecipes.includes(r.id), known = ECO.recipeKnown(W, r), holders = C.formulaHolders ? C.formulaHolders(W, r.id) : [];
      const route = D.regions.find(z => z.recipes.includes(r.id)), fee = C.recipeFee ? C.recipeFee(W, r) : 0;
      const statusTxt = known ? 'รู้สูตรแล้ว' : found ? 'ต้องวิจัยตำรับระดับ ' + r.tier : holders.length ? 'ม้วนตำรับอยู่กับ ' + holders.map(x => esc(x.h.name.given)).join('、') : 'ต้องค้นพบและนำกลับสำนัก';
      return '<div class="card"><b>' + ((found || holders.length) ? esc(r.nameTh) : '🔒 ม้วนตำรับที่ยังไม่พบ') + '</b><div class="muted">' + esc(route.nameTh) + ' · ระดับ ' + r.tier + ' · ' + statusTxt + '</div>' + ((found || holders.length) ? '<div>' + r.inputs.map(i => esc(ECO.name(i.matId)) + ' ' + ECO.count(W, i.matId) + '/' + i.count).join(' · ') + '</div><div class="muted">ฝีมือ ' + r.craft + ' ≥ ' + Math.max(0, r.minMastery - 20) + ' · อาคารระดับ ' + r.facilityLevel + ' · ค่าสิทธิ์ศึกษา ' + fee + ' คป. · ผลผลิต ' + esc(r.outNameTh) + (r.sourceCompatiblePath !== 'ANY' ? ' · เหมาะกับวิถี ' + r.sourceCompatiblePath : '') + '</div>' : '') + '</div>';
    }).join('');
    h += '</div><div class="subcat-pane" data-subcat="REGIONS"' + ((cSub === 'ALL' || cSub === 'REGIONS') ? '' : ' style="display:none"') + '><h3>สายย่อยและลำดับขั้นเฉพาะทางอิสระ (9 ขั้นแท้จริง)</h3>' + (D.progressionMapping || []).map(pm => {
      const sub = D.subPaths.find(s => s.id === pm.subPath) || CULT.subInfo(pm.targetMajorPath, pm.subPath);
      return '<div class="card"><b>' + esc(sub ? sub.nameTh : pm.subPath) + '</b> <span class="chip b">วิถี' + esc(CULT.PATHS[pm.targetMajorPath].nameTh) + ' · ลำดับขั้นหลัก ' + pm.targetMajorStages + ' ขั้น · ขั้นเฉพาะทาง 9 ขั้น</span><div class="muted">' + esc(sub ? sub.strengthTh : '') + '<br>ข้อจำกัด: ' + esc(sub ? sub.weaknessTh : '') + '</div><div style="margin-top:6px;font-size:12px"><b>ลำดับ 9 ขั้นแท้จริงและค่าเทียบเคียง:</b><br>' + (pm.realms || []).map(r => '<div style="padding:2px 0;border-bottom:1px dotted var(--line,#3a3f4a)">• <b>ลำดับ ' + r.ordinal + ': ' + esc(r.nameTh) + '</b> <span class="chip ok">เทียบขั้นหลัก ' + r.majorBandEquivalent.toFixed(1) + '</span> <span class="chip">พลังรบเทียบเคียง ' + r.functionalCombatPower + ' CP</span> · อายุขัย ~' + r.lifespanMax + ' ปี · เกณฑ์ทักษะ: ' + r.skillGate.primarySkill + ' ≥ ' + r.skillGate.minPrimarySkill + ' · ศิลา ' + r.resourceCost.stones + ' ก้อน</div>').join('') + '</div></div>';
    }).join('');
    h += '</div><div class="subcat-pane" data-subcat="RECIPES"' + ((cSub === 'ALL' || cSub === 'RECIPES') ? '' : ' style="display:none"') + '><h3>อวัยวะอสูรกลายพันธุ์และกายวิภาค (' + Object.values(W.sect.organs || {}).reduce((s, v) => s + v, 0) + ' ชิ้นในคลัง)</h3>' + (D.rareOrgans || []).map(o => {
      const cnt = C.organCount ? C.organCount(W, o.id) : 0;
      const beast = (JD.BEASTS.species || []).find(b => b.id === o.beastId);
      const reg = D.regions.find(r => r.id === o.regionId);
      return '<div class="card"><b>🧬 ' + esc(o.nameTh) + '</b> <span class="chip ' + (cnt > 0 ? 'ok' : '') + '">คลัง ' + cnt + '</span> <span class="chip v">ระดับ ' + o.tier + ' · ธาตุ ' + esc(o.element) + '</span><div class="muted">อสูรต้นกำเนิด: ' + esc(beast ? beast.nameTh : o.beastId) + ' (' + esc(reg ? reg.nameTh : o.regionId) + ') · ความยากชำแหละ ' + o.dissectionDifficulty + '</div><div>' + (o.propertyTags || []).map(t => '<span class="chip b">' + esc(t) + '</span>').join('') + '</div><div class="muted">' + esc(o.usesTh || '') + '</div></div>';
    }).join('');
    const expState = (W.sect && W.sect.experiments) || { discovered: [], propertyKnowledge: {}, notes: [] };
    const knownTagList = Object.entries(expState.propertyKnowledge || {}).filter(x => x[1] > 0);
    h += '<h3>การทดลองคุณสมบัติและสูตรประยุกต์ ' + expState.discovered.length + '/' + (D.experiments || []).length + '</h3>';
    if (knownTagList.length) h += '<div class="card"><b>คุณสมบัติวัตถุดิบที่วิเคราะห์แล้ว:</b><div>' + knownTagList.map(x => '<span class="chip ok">' + esc(x[0]) + ' ×' + x[1] + '</span>').join('') + '</div></div>';
    h += (D.experiments || []).map(e => {
      const disc = expState.discovered.includes(e.id);
      const catOrg = C.organById && C.organById[e.catalystOrganId];
      const linkedRec = ECO.recipeById[e.linkedRecipeId];
      return '<div class="card"><b>' + (disc ? '🧪 ' + esc(e.nameTh) : '🔬 สมมติฐาน: ' + esc(e.nameTh)) + '</b> <span class="chip ' + (disc ? 'ok' : 'b') + '">' + (disc ? 'ค้นพบแล้ว' : 'รอการทดลอง') + '</span><div class="muted">ศาสตร์ ' + e.discipline + ' ≥ ' + Math.max(0, e.minMastery - 15) + ' · ระดับ ' + e.tier + ' · ศิลาวิจัย ' + e.stoneCost + ' ก้อน</div><div>วัตถุดิบทดลอง: ' + e.trialInputs.map(i => esc(ECO.name(i.matId)) + ' ' + ECO.count(W, i.matId) + '/' + i.count).join(' · ') + '</div><div class="muted">ตัวเร่งอวัยวะพิเศษ: ' + esc(catOrg ? catOrg.nameTh : e.catalystOrganId) + ' (+' + Math.round((e.catalystBonusChance || 0.18) * 100) + '%) · ยกระดับตำรับ: ' + esc(linkedRec ? linkedRec.nameTh : e.linkedRecipeId) + '</div></div>';
    }).join('');
    h += '<h3>คัมภีร์ใหม่ในหอ ' + D.techniques.filter(t => W.sect.library.includes(t.id)).length + '/' + D.techniques.length + '</h3>' + D.techniques.map(t => {
      const held = W.sect.library.includes(t.id), route = D.regions.find(r => r.techniques.includes(t.id));
      return '<div class="card"><b>' + (held ? esc(t.nameTh) : '🔒 คัมภีร์ที่ยังไม่เข้าสำนัก') + '</b> ' + (held ? gradeChip(t) : '') + '<div class="muted">' + esc(route ? route.nameTh : 'แดนลับยุทธภพ') + ' · ' + esc((CULT.subInfo(t.path, t.sub) || { nameTh: t.path }).nameTh) + ' · ขั้นขั้นต่ำ ' + t.reqTier + '</div>' + (held ? '<div>' + esc(t.passive ? (t.descTh || 'วิชาติดตัว') : g.SK.profile(t).summary) + '</div><div class="muted">ค่าเรียน ' + CPEPrice(W, t) + ' คป. · ต้องได้รับสิทธิ์หอคัมภีร์และมีสายย่อยตรงกัน</div>' : '') + '</div>';
    }).join('');
    h += '</div>';
    return h;
  };
  UI.martialNpc = (W, n) => {
    if (!n.cult || !g.MARTIAL) return '';
    const M = g.MARTIAL, d = M.describe(W, n), fmt = o => Object.entries(o).map(([k, v]) => esc(HC.nameOf('physiology.' + k) || k) + ' ' + (v >= 0 ? '+' : '') + Number(v).toFixed(1)).join(' · '), life = o => Object.entries(o).map(([k, v]) => esc(HC.nameOf('skills.' + k) || k) + ' +' + Math.round((v - 1) * 100) + '%').join(' · ');
    let h = '<h3>วิถีและการเติบโตตามขั้น</h3><div class="card"><b>' + esc(d.now.identity) + '</b><div class="muted">ใช้งานหนึ่งวิถีหลักและหนึ่งสายย่อย · เปลี่ยนได้เมื่อมีความรู้และยอมเสียขั้น · ' + (n.cult.sub === 'NONE' ? 'รอผลึกหรือคัมภีร์สายย่อย' : 'มีสายย่อยแล้ว') + '</div><div>อยากได้: ' + d.desires.map(esc).join(' / ') + '</div><div>สรีระเสริมตอนนี้: ' + fmt(d.now.body) + '</div><div class="muted">สรีระเสริมเข้าค่าสู้โดยตรง ไม่เขียนทับค่ามนุษย์และไม่นับซ้ำเป็นบัฟ</div><div>ขั้นถัดไป: ' + fmt(d.next.body) + '</div><div>งานตอนนี้: ' + life(d.now.life) + '</div><div>งานขั้นถัดไป: ' + life(d.next.life) + '</div>';
    const actInn = (M.activeInnateTechs ? M.activeInnateTechs(n) : []).map(id => typeof id === 'string' ? CULT.tech(id) : id).filter(Boolean);
    const dormInn = (M.dormantInnateTechs ? M.dormantInnateTechs(n) : []).map(id => typeof id === 'string' ? CULT.tech(id) : id).filter(Boolean);
    if (actInn.length || dormInn.length) {
      h += '<div style="margin-top:6px"><b>✦ วิชาเฉพาะสายย่อยติดตัว (ไม่กินช่องวิชาติดตัว):</b></div>';
      actInn.forEach(t => {
        const curStage = (g.SK.unlockedStage && t) ? g.SK.unlockedStage(n, t) : 1;
        const maxStage = (t && Array.isArray(t.stages) && t.stages.length) ? t.stages.length : 1;
        const mast = (g.SK.masteryPoints && t) ? g.SK.masteryPoints(n, t.id) : 0;
        h += '<div style="padding:2px 0"><span class="chip g">ติดตัวสายย่อย · ทำงาน</span> ' + gradeChip(t) + ' <b>' + esc(t.nameTh) + '</b> <span class="muted">(ความชำนาญ ' + mast + ' · ขั้นวิชา ' + curStage + '/' + maxStage + ')</span><div class="muted" style="font-size:11.5px">' + esc(t.descTh || '') + '</div></div>';
      });
      dormInn.forEach(t => {
        const mast = (g.SK.masteryPoints && t) ? g.SK.masteryPoints(n, t.id) : 0;
        h += '<div style="padding:2px 0;opacity:0.7"><span class="chip">หลับใหล · สายย่อยเดิม (' + esc(t.sub) + ')</span> ' + esc(t.nameTh) + ' <span class="muted">(ความชำนาญคงเดิม ' + mast + ')</span></div>';
      });
    }
    const synInfo = M.evaluateSynergies ? M.evaluateSynergies(n) : { active: [] };
    if (synInfo && Array.isArray(synInfo.active) && synInfo.active.length) {
      h += '<div style="margin-top:6px"><b>⚡ การประสานวิชา สายย่อย และศาสตรา (' + synInfo.active.length + '):</b></div>';
      synInfo.active.forEach(sy => {
        h += '<div style="padding:2px 0"><span class="chip ok">ประสานสำเร็จ</span> <b>' + esc(sy.nameTh) + '</b> <span class="muted">— ' + esc(sy.descTh || '') + '</span></div>';
      });
    }
    const slotInfo = M.passiveSlotInfo ? M.passiveSlotInfo(n) : { base: 3, bonus: 0, total: 3, reasons: [] };
    const maxSlots = slotInfo.total || slotInfo.max || 3;
    const bonusReasons = slotInfo.reasons || slotInfo.bonusReasons || [];
    const activePassIds = M.activePassives ? M.activePassives(n) : [];
    const inactivePassList = M.inactivePassives ? M.inactivePassives(n) : [];
    const pass = n.cult.techs.map(CULT.tech).filter(t => t && (t.passive || t.cat === 'PASSIVE'));
    h += '<div style="margin-top:6px"><b>ช่องวิชาติดตัวที่ทำงาน: ' + activePassIds.length + '/' + maxSlots + ' ช่อง</b> <span class="muted">(พื้นฐาน ' + slotInfo.base + (slotInfo.bonus > 0 ? ' + โบนัสสายย่อย +' + slotInfo.bonus + ' [' + esc(bonusReasons.join(', ')) + ']' : '') + ')</span></div>';
    if (pass.length) {
      h += '<div>' + pass.map(t => {
        const isComp = M.isTechCompatible ? M.isTechCompatible(n, t) : M.activeTechs(n).includes(t.id);
        const condOk = M.conditionMatches(n, t);
        const inSlot = activePassIds.includes(t.id);
        const inactObj = inactivePassList.find(x => x.id === t.id);
        let statusTxt = 'ทำงาน';
        if (!isComp) statusTxt = 'หยุดทำงาน (วิถี/สาย/ขั้นไม่ตรง)';
        else if (!condOk) statusTxt = 'หยุดทำงาน (อุปกรณ์ไม่ตรง)';
        else if (!inSlot) statusTxt = 'หยุดทำงาน (' + (inactObj ? inactObj.reason : 'ไม่ได้บรรจุในช่องวิชาติดตัว') + ')';
        const btn = inSlot
          ? ' <button class="btn" style="padding:1px 6px;font-size:10.5px" data-do="unequip-passive" data-arg="' + n.id + '|' + t.id + '">ถอด</button>'
          : (isComp && condOk ? ' <button class="btn pri" style="padding:1px 6px;font-size:10.5px" data-do="equip-passive" data-arg="' + n.id + '|' + t.id + '">สวมใส่</button>' : '');
        return '<div style="padding:2px 0">' + gradeChip(t) + ' ' + esc(t.nameTh) + ' · ' + esc(M.conditionText(t)) + ' · ' + esc(statusTxt) + btn + '</div>';
      }).join('') + '</div>';
    }
    const combat = (p, f) => Object.entries(p || {}).map(([k, v]) => esc(g.STATS.INFO[k]?.nameTh || k) + ' ' + (v >= 0 ? '+' : '') + Math.round(v * 100) + '%').concat(Object.entries(f || {}).map(([k, v]) => esc(g.STATS.INFO[k]?.nameTh || k) + ' ' + (v >= 0 ? '+' : '') + Number(v).toFixed(1))).join(' · ');
    h += '<div>วิถีตอนนี้: ' + combat(d.now.p) + '</div><div>วิถีขั้นถัดไป: ' + combat(d.next.p) + '</div><div>สายย่อยตอนนี้: ' + combat(d.subNow.p, d.subNow.f) + '</div><div>สายย่อยขั้นถัดไป: ' + combat(d.subNext.p, d.subNext.f) + '</div><div class="muted">แนวเติบโต: ' + ({ early: 'เด่นช่วงต้น', late: 'เด่นช่วงปลาย', steady: 'เพิ่มสม่ำเสมอ' })[d.now.curve] + '</div>';
    h += '</div><h3>ผลึกความรู้ในตัว</h3><div class="card">' + (d.crystals.length ? d.crystals.map(([key, qty]) => { const choice = M.crystalDecision(W, n, key), gate = M.eligible(n, key); return '<div>' + esc(M.crystalName(key)) + ' ×' + qty + ' · ' + esc(({ use: 'ตั้งใจใช้', retain: 'เก็บไว้', donate: 'ตั้งใจบริจาค' })[choice.action]) + '<div class="muted">' + esc(gate.ok ? choice.reason : gate.reason) + '</div></div>'; }).join('') : '<span class="muted">ยังไม่มีผลึก · ผลึกใช้ได้ครั้งเดียวเมื่อเรียนสำเร็จ</span>') + '</div>';
    return h;
  };
  UI.martialSkills = (W, n) => {
    const M = g.MARTIAL; return Object.entries(M.SKILL_GROUPS).map(([group, ids]) => '<h3>ทักษะ' + esc(M.SKILL_GROUP_NAMES[group]) + '</h3><div class="card">' + ids.slice().sort((a, b) => M.skillRead(n, b) - M.skillRead(n, a)).map(id => { const info = M.SKILL_INFO[id], boost = M.lifeMult(n, id); return bar(info.nameTh, M.skillRead(n, id), { wide: true }) + '<div class="muted" style="margin-bottom:8px">' + esc(info.effect) + '<br>ฝึกได้จาก: ' + esc(info.route) + (boost > 1 ? ' · ประสิทธิภาพ/การฝึกจากวิถี +' + Math.round((boost - 1) * 100) + '%' : '') + '</div>'; }).join('') + '</div>').join('');
  };
  UI.martialRetraining = (W, n) => {
    const M = g.MARTIAL, intent = n.martialIntent, pick = M.pickRetraining(W, n), target = intent && M.knowledge(intent.targetKey), rows = pick && pick.accessible ? pick.reasons : (intent && intent.reasons || []);
    let h = '<h3>การปรับวิถีและต้นทุนฝึกใหม่</h3><div class="card"><div class="muted">เปลี่ยนวิถีหลักเริ่มขั้น1 ตบะ0 · เปลี่ยนสายเดิมลดอย่างน้อย2ขั้นหรือครึ่งหนึ่ง · ต้องมีผลึก/คัมภีร์จริง</div>';
    if (target) h += '<div>เป้าหมาย: ' + esc(target.nameTh) + ' · ' + esc(({ prepare: 'กำลังเตรียมอาวุธ/วิชา', switch: 'พร้อมยอมลดขั้น', restabilize: 'พักปรับรากฐาน' })[intent.action] || 'เก็บไว้พิจารณา') + '</div>';
    h += rows.length ? rows.map(reason => '<div class="muted">' + esc(reason) + '</div>').join('') : '<div class="muted">ยังไม่มีแผนเปลี่ยนสายที่คุ้มต้นทุน</div>';
    if ((n.retrainUntil || 0) > W.day) h += '<div>พักปรับรากฐานอีก ' + (n.retrainUntil - W.day) + ' วัน</div>';
    const inactive = n.cult ? n.cult.techs.filter(id => !M.activeTechs(n).includes(id)) : []; if (inactive.length) h += '<div class="muted">วิชาที่จำได้แต่ยังไม่ทำงานกับวิถี/ขั้นนี้: ' + inactive.map(id => esc((CULT.tech(id) || {}).nameTh || id)).join(' · ') + '</div>';
    return h + '</div>';
  };
  UI.martialShop = W => {
    const M = g.MARTIAL; if (!M) return ''; const rows = Object.entries(W.sect.crystals || {}).filter(x => x[1] > 0);
    let h = '<h3>ผลึกและคัมภีร์หายาก</h3><div class="card"><div class="muted">ผลึกเป็นของจริง ซื้อเข้ากระเป๋าก่อนใช้ · ต้องตรงวิถี/สาย/ขั้น · คัมภีร์เก็บถาวร เรียนซ้ำได้โดยจ่ายค่าศึกษา</div>' + (rows.length ? rows.map(([key, qty]) => { const k = M.knowledge(key), fee = M.studyFee(W, key), held = k.kind === 'sub' ? (W.sect.subLibrary || []).includes(k.id) : W.sect.library.includes(k.id); return '<div class="logrow"><span>' + esc(M.crystalName(key)) + ' ×' + qty + '</span><b>ขาย ' + M.crystalPrice(W, key) + ' · บริจาคไม่เกิน ' + M.crystalReward(W, key) + ' คป.</b></div><div class="muted">' + esc(CULT.PATHS[k.path]?.shortTh || k.path) + ' · ขั้น ' + k.tier + ' · ' + (held ? 'มีคัมภีร์แล้ว · ค่าศึกษา ' + fee + ' คป.' : '🔒 ยังไม่มีคัมภีร์ในหอ') + '</div>'; }).join('') : '<div class="muted">ยังไม่มีผลึกในคลัง</div>') + '</div>';
    h += '<div class="card">คัมภีร์สายย่อยในหอ: ' + ((W.sect.subLibrary || []).length ? (W.sect.subLibrary || []).map(id => { const k = M.knowledge(M.subKey(id)); return esc(k.nameTh) + ' · ขั้น ' + k.tier + ' · ค่าศึกษา ' + M.studyFee(W, M.subKey(id)) + ' คป.'; }).join(' / ') : 'ยังไม่ค้นพบ') + '</div>'; return h;
  };
  function CPEPrice(W, t) { return g.CPE.techPrice(W, t); }

  UI.rDisc = () => {
    const W = UI.G.W, e = W.explore, EXP = g.EXPLORE; if (!e) return '';
    const dSub = UI.worldDiscSubTab || 'PORTALS';
    let h = renderSubTabBar('set-disc-subtab', dSub, [
      ['PORTALS', '🌀 ประตูมิติ & ถ้ำหมื่นสายหมอก'],
      ['SPOTS', '🏛️ จุดสำรวจ · ของวิเศษ & วิหารโบราณ'],
      ['CODEX', '📖 สมุดบันทึกแดนหมื่นพิภพ'],
      ['ALL', '📋 ดูทั้งหมด']
    ], 'หมวดย่อยการค้นพบและแดนลับ');
    h += '<div class="subcat-pane" data-subcat="PORTALS"' + ((dSub === 'ALL' || dSub === 'PORTALS') ? '' : ' style="display:none"') + '>';
    const gt = e.gate, wd = gt.world ? EXP.WORLD_BY_ID[gt.world] : null;
    const gTypeObj = (EXP.GATE_TYPES && gt.gateType && EXP.GATE_TYPES[gt.gateType]) || (EXP.GATE_TYPES && EXP.GATE_TYPES.GATE_STANDARD) || null;
    h += '<h3>🌀 ประตูมิติสู่แดนหมื่นพิภพ (' + EXP.WORLDS.length + ' พิภพ · ' + Object.keys(EXP.GATE_TYPES || {}).length + ' ประเภทประตูมิติ)</h3><div class="card">' + (gt.open && wd ? '<b style="color:var(--gold)">เปิดอยู่!</b> ' + (gTypeObj ? '<span class="chip v">' + gTypeObj.icon + ' ' + esc(gTypeObj.nameTh) + '</span> ' : '') + 'แดน「' + esc(wd.nameTh) + '」' + wd.icon + '<div class="muted">' + esc(wd.desc) + '</div><div>อีก ' + Math.max(0, gt.until - W.day) + ' วันจะปิด · อันตราย ' + '★'.repeat(Math.round(wd.d)) + '</div>' : '<span class="muted">ปิดอยู่ — ประตูจะเปิดสุ่มทุก ๆ 3–7 สัปดาห์ แต่ละครั้งเป็นโลกและรูปแบบประตูมิติที่ต่างกัน (เปิดมาแล้ว ' + gt.openings + ' ครั้ง)</span>') + (EXP.GATE_TYPES ? '<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">' + Object.values(EXP.GATE_TYPES).map(gtp => '<span class="chip" title="' + esc(gtp.descTh) + '">' + gtp.icon + ' ' + esc(gtp.nameTh) + ' (รางวัล ×' + gtp.lootMult + ')</span>').join('') + '</div>' : '') + '</div>';
    const cv = e.cave; h += '<h3>🕳️ ถ้ำหมื่นสายหมอก</h3><div class="card"><div class="grid2"><div>ลึกสุดที่เคยถึง <b>' + cv.maxDepth + '/10</b></div><div>สำรวจแล้ว <b>' + cv.delves + '</b> ครั้ง</div><div>ผู้พิทักษ์ชั้น 5: ' + (cv.guard[5] ? '✔ ล้มแล้ว' : '<span style="color:#ff9a8f">ยังอยู่</span>') + '</div><div>ผู้พิทักษ์ชั้น 10: ' + (cv.guard[10] ? '✔ ล้มแล้ว' : '<span style="color:#ff9a8f">ยังอยู่</span>') + '</div></div>' + bar('ความสดของถ้ำ', (cv.fresh == null ? 1 : cv.fresh) * 100, { wide: true, color: '#7fd1b9' }) + '<div class="muted">สำรวจถี่ ของที่ได้จะน้อยลง ถ้ำค่อย ๆ ฟื้นตัวเอง</div></div>';
    if (EXP.CAVE_FLOORS) h += '<h3>เส้นทางถ้ำทั้ง 10 ชั้น</h3><div class="card"><div class="muted">แต่ละชั้นมีพื้นที่และเหตุการณ์ต่างกัน การสำรวจหนึ่งครั้งสุ่มพบ 1–2 พื้นที่ และพบเพียงบางเหตุการณ์ในพื้นที่นั้น</div>' + EXP.CAVE_FLOORS.map(floor => '<div data-cave-floor="' + floor.floor + '" style="padding:6px 0;border-bottom:1px solid var(--line)"><b>ชั้น ' + floor.floor + '</b> · ' + (floor.floor <= cv.maxDepth ? esc(floor.nameTh) : '<span class="muted">ยังไม่สำรวจ</span>') + '</div>').join('') + '</div>';
    h += '</div><div class="subcat-pane" data-subcat="SPOTS"' + ((dSub === 'ALL' || dSub === 'SPOTS') ? '' : ' style="display:none"') + '><h3>🔍 จุดสำรวจในสำนัก</h3>' + ['stele', 'spring', 'ruin', 'grove'].map(k => { const s = e.spots[k], sp = EXP.SPOTS[k]; return '<div class="card" data-bld="' + k + '"><b>' + sp.icon + ' ' + sp.nameTh + '</b> <span class="chip g">ระดับ ' + (s.lvl + 1) + '</span><div class="muted">' + sp.desc + '</div><div class="muted">สำรวจแล้ว ' + s.visits + ' ครั้ง' + (k === 'stele' ? ' · เศษจารึก ' + s.frag + '/6' : k === 'spring' ? ' · ปราณในตา ' + Math.round(s.charge) + '/' + s.max : k === 'ruin' ? ' · เงื่อนงำที่พบ ' + s.secrets : '') + '</div></div>'; }).join('');
    h += '<h3>★ ของวิเศษประจำสำนัก (' + e.relics.length + '/' + Object.keys(EXP.RELICS).length + ')</h3><div class="card">' + (e.relics.length ? e.relics.map(id => { const r = EXP.RELICS[id]; return '<div style="margin:4px 0"><b>' + esc(r.nameTh) + '</b> <span class="muted">— ' + esc(r.desc) + '</span></div>'; }).join('') : '<span class="muted">ยังไม่เคยได้ — พบได้จากผู้พิทักษ์ถ้ำและต่างโลกที่หายากมาก</span>') + '</div>';
    h += '<h3>📖 สมุดบันทึกแดนหมื่นพิภพ</h3><div class="muted" style="margin-bottom:6px">แต่ละโลกมี “กองของ” ที่สุ่มเจอ ไม่จำเป็นต้องเจอครบ ช่อง ??? คือสิ่งที่ยังไม่เคยพบ</div>';
    h += EXP.WORLDS.map(w => { const c = e.codex.worlds[w.id], seen = !!c; const got = w.loot.filter(l => e.codex.found[l.id]).length; return '<div class="card"><b>' + (seen ? w.icon + ' ' + esc(w.nameTh) : '❓ โลกที่ยังไม่เคยเห็น') + '</b> ' + (seen ? '<span class="chip">เข้าแล้ว ' + (c.visits || 0) + ' ครั้ง</span><span class="chip b">ของที่พบ ' + got + '/' + w.loot.length + '</span>' : '') + (seen ? '<div class="muted">' + esc(w.desc) + '</div><div>' + w.loot.map(l => e.codex.found[l.id] ? '<span class="chip ' + (l[5] >= 4 ? 'g' : l[5] >= 3 ? 'v' : 'ok') + '">' + esc(l[2]) + ' ×' + e.codex.found[l.id].n + '</span>' : '<span class="chip" style="opacity:.5">???</span>').join('') + '</div>' : '') + '</div>'; }).join('');
    h += '<h3>🕳️ ของที่พบในถ้ำ</h3><div class="card">' + EXP.CAVE_BANDS.map(b => '<div class="muted">' + esc(b.nameTh) + ' (ชั้น ' + b.from + '–' + b.to + ')</div><div>' + b.loot.map(l => e.codex.found[l.id] ? '<span class="chip ok">' + esc(l[2]) + ' ×' + e.codex.found[l.id].n + '</span>' : '<span class="chip" style="opacity:.5">???</span>').join('') + '</div>').join('') + '</div>';
    if (EXP.SANCTUMS) {
      const sState = EXP.ensureSanctums ? EXP.ensureSanctums(W) : { clearedFloors: {}, catalystsFound: 0 };
      const cats = ECO.ensureCatalysts ? ECO.ensureCatalysts(W) : {};
      h += '</div><div class="subcat-pane" data-subcat="SPOTS"' + ((dSub === 'ALL' || dSub === 'SPOTS') ? '' : ' style="display:none"') + '><h3>🏛️ วิหารโบราณหลายชั้นและหินขัดเกลาชุดสัจธรรม</h3><div class="card">';
      h += Object.values(EXP.SANCTUMS).map(sc => '<div style="padding:4px 0;border-bottom:1px solid var(--line,#3a3f4a)"><b>' + sc.icon + ' ' + esc(sc.nameTh) + '</b> <span class="chip ok">ผ่านด่าน ' + (sState.clearedFloors[sc.id] || 0) + '/3 ชั้น</span><div class="muted" style="font-size:11.5px">' + esc(sc.descTh) + '</div></div>').join('');
      const catList = Object.values(ECO.REFINEMENT_CATALYSTS || {});
      if (catList.length) {
        h += '<div style="margin-top:6px"><b>✨ ศิลาขัดเกลาศาสตราในคลัง:</b> ' + catList.map(c => '<span class="chip g">' + esc(c.nameTh) + ' ×' + (cats[c.id] || 0) + '</span>').join(' ') + '</div>';
      }
      h += '</div>';
    }
    h += '</div><div class="subcat-pane" data-subcat="CODEX"' + ((dSub === 'ALL' || dSub === 'CODEX') ? '' : ' style="display:none"') + '>';
    if (e.codex.notes.length) h += '<h3>บันทึกการค้นพบ</h3><div class="card">' + e.codex.notes.slice().reverse().slice(0, 20).map(n => '<div class="logrow"><span class="tm">' + dayStamp(n.d * 1440) + '</span>' + esc(n.text) + '</div>').join('') + '</div>';
    h += '</div>';
    return h;
  };

  /* ----- Helper: Build Personal Bag Rows (Read-Only, Authoritative) ----- */
  const BROAD_CATS = [
    ["ALL", "ทั้งหมด"],
    ["PILL", "💊 โอสถ"],
    ["EQUIPMENT", "🗡️ อุปกรณ์"],
    ["MATERIAL", "🌿 วัตถุดิบ"],
    ["MANUAL", "📜 คัมภีร์/ผลึก"],
    ["OTHER", "🍚 เสบียง/อื่นๆ"]
  ];

  function pillEffectSummaryTh(pid) {
    const info = (ECO && ECO.pillInfo && ECO.pillInfo(pid)) || {};
    const e = info.effect || {};
    const parts = [];
    if (e.healHealth) parts.push("ฟื้นพลังชีวิต +" + e.healHealth + "%");
    if (e.healInjury) parts.push("สมานบาดแผล -" + e.healInjury + " ชม.");
    if (e.qiRestore) parts.push("ฟื้นปราณ +" + e.qiRestore);
    if (e.energyRestore) parts.push("ฟื้นเรี่ยวแรง +" + e.energyRestore);
    if (e.cultivationProgress) parts.push("ตบะ +" + e.cultivationProgress);
    if (e.rateBoost) parts.push("เร่งฝึก +" + Math.round(e.rateBoost * 100) + "%");
    if (e.breakthroughBonus) parts.push("ทะลวงขั้น +" + Math.round(e.breakthroughBonus * 100) + "%");
    if (e.clearToxic) parts.push("ถอนพิษโอสถ -" + e.clearToxic);
    if (e.clearHeartDemon) parts.push("สลายจิตมาร -" + e.clearHeartDemon);
    if (e.insight) parts.push("รู้แจ้ง ×" + e.insight);
    return parts.length ? parts.join(" · ") : "โอสถบำรุงร่างกายและลมปราณ";
  }

  function gearEffectSummaryTh(eq) {
    if (!eq) return "";
    const parts = [];
    if (eq.procedural) parts.push("ศาสตราสุ่ม [" + (eq.gradeTh || eq.grade || ("T" + (eq.tier || 1))) + "]");
    const maxD = eq.maxDur == null ? 100 : eq.maxDur, curD = eq.dur == null ? maxD : eq.dur;
    if (eq.procedural || curD < 100 || maxD < 100) {
      parts.push("ทนทาน " + Math.round(curD) + "/" + Math.round(maxD) + (eq.retired ? " (ชำรุดถาวร)" : eq.broken || (eq.procedural && curD <= 0) ? " (ชำรุด)" : ""));
    }
    if (eq.element && eq.element !== "NEUTRAL") {
      const elMap = (ECO && ECO.PROCEDURAL_POOLS && ECO.PROCEDURAL_POOLS.elements) || {};
      const elName = (elMap[eq.element] && elMap[eq.element].nameTh) || eq.element;
      const secName = eq.secondaryElement ? ((elMap[eq.secondaryElement] && elMap[eq.secondaryElement].nameTh) || eq.secondaryElement) : null;
      parts.push("ธาตุ: " + elName + (secName ? "+" + secName : ""));
    }
    if (eq.combatMult) parts.push("กำลังรบ +" + Math.round(eq.combatMult * 100) + "%");
    if (eq.defMult) parts.push("ป้องกัน +" + Math.round(eq.defMult * 100) + "%");
    const stObj = (eq.st && typeof eq.st === "object") ? eq.st : ((eq.stats && typeof eq.stats === "object") ? eq.stats : (g.STATS && g.STATS.gearStats ? g.STATS.gearStats(eq) : null));
    if (stObj && typeof stObj === "object") {
      Object.entries(stObj).forEach(([k, v]) => {
        if (!v) return;
        const inf = g.STATS && g.STATS.INFO && g.STATS.INFO[k];
        const isPct = ["crit", "critDmg", "pen"].includes(k);
        parts.push((inf ? inf.nameTh : k) + " " + (v >= 0 ? "+" : "") + Math.round(v * 10) / 10 + (isPct ? "%" : ""));
      });
    }
    if (Array.isArray(eq.effects) && eq.effects.length) {
      eq.effects.forEach(ef => { if (ef.nameTh || ef.effectId) parts.push(ef.nameTh || ef.effectId); });
    }
    return parts.length ? parts.join(" · ") : "อุปกรณ์เสริมกำลังยุทธ์";
  }

  function buildPersonalBagItems(W, n) {
    const items = [];
    const inv = n.inv || {};
    // 1. Equipped Gear
    ["WEAPON", "ARMOR", "ACCESSORY"].forEach(slot => {
      const eq = n.equip && n.equip[slot];
      if (!eq) return;
      const qVal = (g.VC && g.VC.gearQuality) ? g.VC.gearQuality(eq) : (eq.q || eq.quality || 1);
      const isLeg = !!(eq.legendary || eq.grade === "Legendary" || eq.rarity === "Legendary" || /^LEG_/.test(eq.id || ""));
      const rarity = UI.itemArtGrade(eq);
      items.push({
        selKey: "EQ:" + slot + ":" + (eq.uid || eq.id),
        kind: "EQUIPPED",
        rawKind: "EQUIPMENT",
        broadCat: "EQUIPMENT",
        kindTh: "สวมใส่อยู่ (" + slot + ")",
        id: eq.uid || eq.id,
        templateId: eq.id,
        slot,
        eq,
        nameTh: eq.nameTh,
        tier: eq.tier || 1,
        rarity,
        legendary: isLeg,
        qualityPct: Math.round(qVal * 100),
        qty: 1,
        value: g.CPE && g.CPE.gearPrice ? g.CPE.gearPrice(W, eq) : (eq.tier || 1) * 25,
        spawned: !!eq.playerSpawned,
        descTh: gearEffectSummaryTh(eq),
        moreTh: "ช่องสวมใส่: " + slot + " · UID: " + (eq.uid || eq.id) + " · ทนทาน: " + Math.round(eq.dur == null ? 100 : eq.dur) + "/" + Math.round(eq.maxDur == null ? 100 : eq.maxDur) + " · คุณภาพ: " + Math.round(qVal * 100) + "% · ขั้นขั้นต่ำ: " + (eq.minStage || 1) + (eq.literarySource ? " · ที่มา: " + eq.literarySource : ""),
        canUnequip: true,
        canRepair: !!(eq.procedural && (eq.maxDur == null ? 100 : eq.maxDur) > 20 && (eq.dur == null ? 100 : eq.dur) < (eq.maxDur == null ? 100 : eq.maxDur)),
        canRetire: !!(eq.procedural && ((eq.dur != null && eq.dur <= 0 && (eq.maxDur || 100) <= 20) || eq.retired))
      });
    });
    // 2. Unequipped Personal Gear
    (inv.gear || []).forEach(eq => {
      if (!eq) return;
      const qVal = (g.VC && g.VC.gearQuality) ? g.VC.gearQuality(eq) : (eq.q || eq.quality || 1);
      const isLeg = !!(eq.legendary || eq.grade === "Legendary" || eq.rarity === "Legendary" || /^LEG_/.test(eq.id || ""));
      const rarity = UI.itemArtGrade(eq);
      items.push({
        selKey: "BAG_EQ:" + (eq.uid || eq.id),
        kind: "EQUIPMENT",
        rawKind: "EQUIPMENT",
        broadCat: "EQUIPMENT",
        kindTh: isLeg ? "ศาสตราตำนานในถุง" : "อุปกรณ์ในถุง",
        id: eq.uid || eq.id,
        templateId: eq.id,
        slot: eq.slot,
        eq,
        nameTh: eq.nameTh,
        tier: eq.tier || 1,
        rarity,
        legendary: isLeg,
        qualityPct: Math.round(qVal * 100),
        qty: 1,
        value: g.CPE && g.CPE.gearPrice ? g.CPE.gearPrice(W, eq) : (eq.tier || 1) * 25,
        spawned: !!eq.playerSpawned,
        descTh: "ช่อง " + (eq.slot || "-") + " · " + gearEffectSummaryTh(eq),
        moreTh: "คุณภาพ: " + Math.round(qVal * 100) + "% · ขั้นขั้นต่ำ: " + (eq.minStage || 1) + (eq.compatiblePath ? " · วิถี: " + eq.compatiblePath : "") + (eq.literarySource ? " · ที่มา: " + eq.literarySource : ""),
        canEquip: !(eq.retired || eq.broken || (eq.procedural && eq.dur != null && eq.dur <= 0)),
        canDonate: true
      });
    });
    // 3. Personal Pills
    Object.entries(inv.pills || {}).forEach(([pid, qty]) => {
      if (!qty || qty <= 0) return;
      const info = ECO.pillInfo(pid) || {};
      const tier = info.tier || 1;
      const sp = (inv.spawnedPills && inv.spawnedPills[pid]) || 0;
      const qVal = (inv.pillQuality && inv.pillQuality[pid]) || 1;
      items.push({
        selKey: "PILL:" + pid,
        kind: "PILL",
        rawKind: "PILL",
        broadCat: "PILL",
        kindTh: "โอสถ",
        id: pid,
        templateId: pid,
        nameTh: ECO.name(pid),
        tier,
        rarity: tier >= 6 ? "Legendary" : tier >= 5 ? "Exceptional" : tier >= 3 ? "Rare" : "Common",
        qualityPct: Math.round(qVal * 100),
        qty,
        value: (g.CPE && g.CPE.priceOf) ? g.CPE.priceOf(W, pid) : tier * 12,
        spawned: sp > 0,
        descTh: pillEffectSummaryTh(pid),
        moreTh: "รหัสโอสถ: " + pid + " · ความบริสุทธิ์: " + Math.round(qVal * 100) + "% · แต้มรับบริจาคประมาณ " + (sp > 0 ? 0 : Math.round((g.CPE && g.CPE.reward ? g.CPE.reward(W, pid, 1) : tier * 5))) + " คป.",
        canUse: true,
        canDonate: true
      });
    });
    // 3b. Personal Crafted Pills (if any kept/pending in inv.craftedPills)
    (inv.craftedPills || []).forEach((cp, idx) => {
      if (!cp || !cp.qty || cp.qty <= 0) return;
      const info = ECO.pillInfo(cp.key) || {};
      const tier = info.tier || 1;
      items.push({
        selKey: "CPILL:" + (cp.id || idx),
        kind: "PILL",
        rawKind: "PILL",
        broadCat: "PILL",
        kindTh: "โอสถปรุงเอง",
        id: cp.key,
        craftedId: cp.id,
        templateId: cp.key,
        nameTh: ECO.name(cp.key) + " (ปรุงเอง)",
        tier,
        rarity: tier >= 5 ? "Exceptional" : tier >= 3 ? "Rare" : "Common",
        qualityPct: Math.round((cp.q || 1) * 100),
        qty: cp.qty,
        value: Math.round((g.CPE && g.CPE.reward ? g.CPE.reward(W, cp.key, 1) : tier * 10)),
        spawned: false,
        descTh: pillEffectSummaryTh(cp.key),
        moreTh: "ความตั้งใจ: " + (cp.intent === "donate" ? "รอบริจาคเข้าคลัง" : "เก็บไว้ใช้ส่วนตัว") + " · คุณภาพ " + Math.round((cp.q || 1) * 100) + "%",
        canUse: true,
        canDonate: true
      });
    });
    // 4. Personal Materials, Caught Fish, Cooked Fish Dishes, Mystery Containers & River Trash
    Object.entries(inv.mats || {}).forEach(([mid, qty]) => {
      if (!qty || qty <= 0) return;
      const m = ECO.matById[mid] || {};
      const tier = m.tier || 1;
      const sp = (inv.spawnedMats && inv.spawnedMats[mid]) || 0;
      const isContainer = mid === "ITEM_MYSTERY_RIVER_CONTAINER";
      const isTrash = mid === "TRASH_RIVER_DEBRIS";
      const isDish = !!(g.FISHING && g.FISHING.isFishDish && g.FISHING.isFishDish(mid));
      const isFish = !!(g.FISHING && g.FISHING.isFish && g.FISHING.isFish(mid));
      const qVal = (inv.matQuality && inv.matQuality[mid]) || null;
      const val = (isContainer || isTrash) ? 0 : ((g.CPE && g.CPE.reward) ? Math.round(g.CPE.reward(W, mid, 1)) : tier * 6);
      items.push({
        selKey: "MAT:" + mid,
        kind: isContainer ? "CONTAINER" : isTrash ? "TRASH" : isDish ? "FOOD" : "MATERIAL",
        rawKind: isContainer ? "CONTAINER" : isTrash ? "TRASH" : isDish ? "FOOD" : "MATERIAL",
        broadCat: (isContainer || isTrash || isDish) ? "OTHER" : "MATERIAL",
        kindTh: isContainer ? "หีบปริศนาใต้น้ำ" : isTrash ? "ขยะใต้น้ำไร้ค่า" : isDish ? "อาหารปราณ" : isFish ? "ปลาปราณ" : "วัตถุดิบ",
        id: mid,
        templateId: mid,
        nameTh: ECO.name(mid),
        tier,
        rarity: m.rarity || (tier >= 6 ? "Legendary" : tier >= 4 ? "Exceptional" : tier >= 3 ? "Rare" : "Common"),
        qualityPct: qVal ? Math.round(qVal * 100) : undefined,
        qty,
        value: val,
        spawned: sp > 0,
        descTh: m.descTh || "วัตถุดิบสำหรับหลอมโอสถและตีศาสตรา",
        moreTh: isContainer
          ? "โอกาสเปิดหีบ: เศษซากใต้น้ำ 50.0% · ของทั่วไปตามหมวดและขั้น 49.5% · สมบัติระดับตำนาน 0.5%"
          : isTrash
          ? "เศษไม้ผุและซากใต้น้ำไร้ค่า (0 ศิลา / 0 คป.) กดปุ่มทิ้งเพื่อทำความสะอาดถุงสัมภาระ"
          : ("รหัส: " + mid + " · ระดับ T" + tier + (isFish && m.habitats ? " · ถิ่นอาศัย: " + m.habitats.join(", ") : "") + " · บริจาคเข้าคลังได้ประมาณ " + (sp > 0 ? 0 : val) + " คป./หน่วย"),
        canOpenContainer: isContainer,
        canDiscardTrash: isTrash,
        canEatDish: isDish,
        canCookFish: isFish,
        canDonate: !isTrash
      });
    });
    // 5. Personal Crystals
    Object.entries(inv.crystals || {}).forEach(([cid, qty]) => {
      if (!qty || qty <= 0) return;
      const kInfo = (g.MARTIAL && g.MARTIAL.knowledge) ? g.MARTIAL.knowledge(cid) : null;
      const rawSub = cid.startsWith("S:") ? cid.slice(2) : cid;
      const subObj = CULT.subList.find(x => x.sub.id === rawSub);
      const tier = (kInfo && kInfo.tier) || 3;
      const sp = (inv.spawnedCrystals && inv.spawnedCrystals[cid]) || 0;
      items.push({
        selKey: "CRYS:" + cid,
        kind: "CRYSTAL",
        rawKind: "CRYSTAL",
        broadCat: "MANUAL",
        kindTh: "ผลึกความรู้",
        id: cid,
        templateId: rawSub,
        nameTh: (g.MARTIAL && g.MARTIAL.crystalName) ? g.MARTIAL.crystalName(cid) : ("ผลึก「" + (subObj ? subObj.sub.nameTh : cid) + "」"),
        tier,
        rarity: tier >= 6 ? "Legendary" : tier >= 4 ? "Exceptional" : "Rare",
        qty,
        value: (g.MARTIAL && g.MARTIAL.crystalPrice) ? g.MARTIAL.crystalPrice(W, cid) : tier * 35,
        spawned: sp > 0,
        descTh: "วิถี " + ((kInfo && kInfo.path) || (subObj ? subObj.path : "-")) + " · ใช้ซึมซับเปิดสายย่อยหรือวิชาโดยตรง",
        moreTh: "ใช้ได้ครั้งเดียวเมื่อผ่านเกณฑ์วิถีและขั้นตบะ · มูลค่าบริจาค ~" + (sp > 0 ? 0 : ((g.MARTIAL && g.MARTIAL.crystalReward) ? g.MARTIAL.crystalReward(W, cid) : 20)) + " คป.",
        canUse: true,
        canDonate: true
      });
    });
    // 6. Personal Technique Manuals & Subpath Manuals
    Array.from(new Set(inv.techs || [])).forEach(tid => {
      const t = CULT.tech(tid);
      if (!t) return;
      const sp = Array.isArray(inv.spawnedTechs) && inv.spawnedTechs.includes(tid);
      const isLeg = !!(t.legendary || t.grade === "Legendary" || /^LEG_/.test(tid));
      const tier = t.tier || t.reqTier || 1;
      items.push({
        selKey: "TECH:" + tid,
        kind: "TECH_MANUAL",
        rawKind: "TECH_MANUAL",
        broadCat: "MANUAL",
        kindTh: isLeg ? "คัมภีร์ระดับตำนาน" : "คัมภีร์วิชา",
        id: tid,
        templateId: tid,
        nameTh: "คัมภีร์「" + t.nameTh + "」",
        tier,
        rarity: UI.itemArtGrade(t),
        legendary: isLeg,
        qty: 1,
        value: (g.CPE && g.CPE.techPrice) ? g.CPE.techPrice(W, t) : tier * 40,
        spawned: sp,
        descTh: (t.descTh || "คัมภีร์ยุทธ์") + " · วิถี " + (t.path || "ANY") + " · ขั้นขั้นต่ำ " + (t.reqTier || tier),
        moreTh: "ระดับคุณภาพ: " + (t.grade || "Common") + (t.sub ? " · สายย่อย: " + t.sub : "") + " · บริจาคเข้าหอคัมภีร์สำนักเพื่อบันทึกเป็นมรดกถาวร",
        canUse: true,
        canDonate: true
      });
    });
    Array.from(new Set(inv.subManuals || [])).forEach(sid => {
      const subObj = CULT.subList.find(x => x.sub.id === sid);
      const sp = Array.isArray(inv.spawnedSubManuals) && inv.spawnedSubManuals.includes(sid);
      items.push({
        selKey: "SUBM:" + sid,
        kind: "SUB_MANUAL",
        rawKind: "SUB_MANUAL",
        broadCat: "MANUAL",
        kindTh: "คัมภีร์สายย่อย",
        id: sid,
        templateId: sid,
        nameTh: "คัมภีร์สายย่อย「" + (subObj ? subObj.sub.nameTh : sid) + "」",
        tier: 3,
        rarity: "Rare",
        qty: 1,
        value: 160,
        spawned: sp,
        descTh: "เปิดสายย่อย " + (subObj ? subObj.sub.nameTh : sid) + " (วิถี " + (subObj ? subObj.path : "-") + ")",
        moreTh: subObj && subObj.sub ? (subObj.sub.strengthTh || "") : "คัมภีร์ต้นฉบับสำหรับศึกษาสายย่อย",
        canUse: true,
        canDonate: true
      });
    });
    // 7. Personal Recipe Scrolls
    Array.from(new Set(inv.recipes || [])).forEach(rid => {
      const r = ECO.recipeById[rid];
      if (!r) return;
      const sp = Array.isArray(inv.spawnedRecipes) && inv.spawnedRecipes.includes(rid);
      const tier = r.tier || 1;
      items.push({
        selKey: "REC:" + rid,
        kind: "RECIPE_SCROLL",
        rawKind: "RECIPE_SCROLL",
        broadCat: "MANUAL",
        kindTh: "ม้วนตำรับ",
        id: rid,
        templateId: rid,
        nameTh: "ม้วนตำรับ" + r.nameTh,
        tier,
        rarity: tier >= 5 ? "Exceptional" : tier >= 3 ? "Rare" : "Common",
        qty: 1,
        value: tier * 35,
        spawned: sp,
        descTh: "ผลผลิต: " + (r.outNameTh || r.nameTh) + " · ศาสตร์ " + (r.craft || "ALCHEMY"),
        moreTh: "ความชำนาญขั้นต่ำ: " + (r.minMastery || 20) + " · ระดับอาคาร: " + (r.facilityLevel || 1),
        canUse: true,
        canDonate: true
      });
    });
    // 8. Personal Rare Beast Organs
    Object.entries(inv.organs || {}).forEach(([oid, qty]) => {
      if (!qty || qty <= 0) return;
      const o = g.CONTENT && g.CONTENT.organById && g.CONTENT.organById[oid];
      if (!o) return;
      const sp = (inv.spawnedOrgans && inv.spawnedOrgans[oid]) || 0;
      const tier = o.tier || 2;
      items.push({
        selKey: "ORG:" + oid,
        kind: "ORGAN",
        rawKind: "ORGAN",
        broadCat: "MATERIAL",
        kindTh: "อวัยวะอสูร",
        id: oid,
        templateId: oid,
        nameTh: o.nameTh,
        tier,
        rarity: tier >= 6 ? "Legendary" : tier >= 4 ? "Exceptional" : "Rare",
        qty,
        value: tier * 28,
        spawned: sp > 0,
        descTh: "ธาตุ " + (o.element || "-") + " · " + (o.usesTh || "ชิ้นส่วนอสูรกลายพันธุ์สำหรับวิจัยและหลอม"),
        moreTh: "คุณสมบัติ: " + ((o.propertyTags || []).join(", ") || "-") + " · ความยากชำแหละ " + (o.dissectionDifficulty || "-"),
        canUse: true,
        canDonate: true
      });
    });
    return items;
  }
  UI.buildPersonalBagItems = buildPersonalBagItems;

  function renderModeToggleBar(titleHtml) {
    const mode = UI.getInvViewMode();
    return "<div class=\"inv-head-bar\">" + titleHtml +
      "<div class=\"inv-mode-toggle\" role=\"group\" aria-label=\"รูปแบบการแสดงผลไอเทม\">" +
      "<button type=\"button\" class=\"" + (mode === "grid" ? "on" : "") + "\" data-do=\"set-inv-mode\" data-arg=\"grid\">⊞ ตารางไอคอน</button>" +
      "<button type=\"button\" class=\"" + (mode === "list" ? "on" : "") + "\" data-do=\"set-inv-mode\" data-arg=\"list\">☰ รายการ</button>" +
      "</div></div>";
  }

  function renderGridCellHtml(it, isSelected, selectAction) {
    const rCls = it.legendary || it.rarity === "Legendary" ? "r-Legendary" : it.rarity === "Exceptional" ? "r-Exceptional" : it.rarity === "Rare" ? "r-Rare" : it.rarity === "Refined" ? "r-Refined" : "";
    const tlCls = it.legendary || it.rarity === "Legendary" ? "leg" : it.rarity === "Exceptional" ? "exc" : it.rarity === "Rare" ? "rar" : it.rarity === "Refined" ? "ref" : "";
    const sym = it.legendary || it.rarity === "Legendary" ? "★" : it.rarity === "Exceptional" ? "◆" : it.rarity === "Rare" ? "▲" : "";
    let trBadge = "";
    if (it.kind === "EQUIPPED") trBadge = "<span class=\"inv-b-tr\">สวม</span>";
    else if (it.locked) trBadge = "<span class=\"inv-b-tr warn\">🔒</span>";
    else if (it.isShortage) trBadge = "<span class=\"inv-b-tr warn\">ขาด</span>";
    else if (it.qualityPct && it.qualityPct !== 100) trBadge = "<span class=\"inv-b-tr qual\">" + it.qualityPct + "%</span>";
    else if (it.isSurplus) trBadge = "<span class=\"inv-b-tr\">+ล้น</span>";

    const blBadge = it.price != null ? "<span class=\"inv-b-bl\">" + it.price + "คป</span>" : (it.spawned ? "<span class=\"inv-b-bl\">เสก</span>" : "");
    const brBadge = "<span class=\"inv-b-br\">×" + (it.qty != null ? it.qty : 1) + "</span>";
    return "<button type=\"button\" class=\"inv-cell " + rCls + (isSelected ? " sel" : "") + (it.locked ? " is-locked" : "") + "\" data-do=\"" + selectAction + "\" data-arg=\"" + esc(it.selKey) + "\" title=\"" + esc(it.nameTh + " (T" + (it.tier || 1) + " ×" + (it.qty || 1) + ")") + "\">" +
      "<span class=\"inv-b-tl " + tlCls + "\">" + sym + "T" + (it.tier || 1) + "</span>" +
      trBadge +
      UI.renderAtlasIconHtml(it, 40) +
      blBadge +
      brBadge +
      "</button>";
  }

  function renderPersonalBagActionsHtml(n, it) {
    let btns = "";
    if (it.canUnequip) {
      btns += "<button type=\"button\" class=\"btn\" data-do=\"unequip-bag\" data-arg=\"" + n.id + "|" + it.slot + "\">ถอดเก็บ</button>";
      btns += "<button type=\"button\" class=\"btn\" data-do=\"unequip-sect\" data-arg=\"" + n.id + "|" + it.slot + "\">คืนคลัง</button>";
    }
    if (it.canEquip) {
      btns += "<button type=\"button\" class=\"btn pri\" data-do=\"equip-personal\" data-arg=\"" + n.id + "|" + it.id + "\">สวมใส่</button>";
    }
    if (it.kind === "EQUIPPED" || it.kind === "EQUIPMENT" || it.rawKind === "EQUIPMENT" || it.eq) {
      btns += "<button type=\"button\" class=\"btn\" data-do=\"socket-elemental-runes\" data-arg=\"" + n.id + "|" + esc((it.eq && (it.eq.uid || it.eq.id)) || it.id) + "\">💎 ฝังรูนธาตุ</button>";
    }
    if (it.canRepair || (it.eq && it.eq.procedural && (it.eq.maxDur == null ? 100 : it.eq.maxDur) > 20 && (it.eq.dur == null ? 100 : it.eq.dur) < (it.eq.maxDur == null ? 100 : it.eq.maxDur))) {
      btns += "<button type=\"button\" class=\"btn\" data-do=\"repair-gear\" data-arg=\"" + n.id + "|" + it.id + "\">🔧 ซ่อมศาสตรา</button>";
    }
    if (it.canRetire || (it.eq && it.eq.procedural && ((it.eq.dur != null && it.eq.dur <= 0 && (it.eq.maxDur || 100) <= 20) || it.eq.retired))) {
      btns += "<button type=\"button\" class=\"btn dan\" data-do=\"retire-gear\" data-arg=\"" + n.id + "|" + it.id + "\">♻️ ปลดระวาง</button>";
    }
    if (it.canOpenContainer) {
      btns += "<button type=\"button\" class=\"btn pri\" data-do=\"open-bag-container\" data-arg=\"" + n.id + "\">🎁 เปิดหีบปริศนา</button>";
    }
    if (it.canEatDish) {
      btns += "<button type=\"button\" class=\"btn pri\" data-do=\"eat-bag-dish\" data-arg=\"" + n.id + "|" + it.id + "\">🍲 กินอาหารปราณ</button>";
    }
    if (it.canCookFish) {
      btns += "<button type=\"button\" class=\"btn pri\" data-do=\"cook-bag-fish\" data-arg=\"" + n.id + "|" + it.id + "\">🍳 ปรุงอาหารปลา</button>";
    }
    if (it.canDiscardTrash) {
      btns += "<button type=\"button\" class=\"btn dan\" data-do=\"discard-bag-trash\" data-arg=\"" + n.id + "\">🗑️ ทิ้งขยะ</button>";
    }
    if (it.canUse) {
      btns += "<button type=\"button\" class=\"btn pri\" data-do=\"use-personal\" data-arg=\"" + n.id + "|" + it.rawKind + "|" + it.id + "\">ใช้งาน</button>";
    }
    if (it.canDonate) {
      btns += "<button type=\"button\" class=\"btn\" data-do=\"donate-personal\" data-arg=\"" + n.id + "|" + (it.rawKind === "CONTAINER" || it.rawKind === "FOOD" ? "MATERIAL" : it.rawKind) + "|" + (it.craftedId || it.id) + "\">บริจาค</button>";
    }
    return btns;
  }

  function renderPersonalBagSection(W, n) {
    const mode = UI.getInvViewMode();
    let allItems = buildPersonalBagItems(W, n);
    let items = allItems.slice();
    const bq = (UI.bagSearch || "").trim().toLowerCase();
    if (bq) items = items.filter(it => it.nameTh.toLowerCase().includes(bq) || String(it.id).toLowerCase().includes(bq));

    if (mode === "grid") {
      const cat = UI.bagCat || "ALL";
      if (cat !== "ALL") items = items.filter(it => it.broadCat === cat);
    } else {
      if (UI.bagType && UI.bagType !== "ALL") items = items.filter(it => it.kind === UI.bagType || it.rawKind === UI.bagType);
    }

    if (UI.bagSort === "qty") items.sort((a, b) => b.qty - a.qty || b.tier - a.tier);
    else if (UI.bagSort === "value") items.sort((a, b) => (b.value || 0) - (a.value || 0) || b.tier - a.tier);
    else if (UI.bagSort === "name") items.sort((a, b) => a.nameTh.localeCompare(b.nameTh));
    else items.sort((a, b) => (a.kind === "EQUIPPED" ? -1 : 0) - (b.kind === "EQUIPPED" ? -1 : 0) || b.tier - a.tier || b.qty - a.qty);

    let h = renderModeToggleBar("<h3>🎒 ถุงสัมภาระและอุปกรณ์ส่วนตัว (" + items.length + " รายการ)</h3>");
    h += "<div class=\"card\">";

    if (mode === "grid") {
      // Category pills
      h += "<div class=\"inv-cat-bar\">";
      BROAD_CATS.forEach(([ck, cv]) => {
        const cnt = ck === "ALL" ? allItems.length : allItems.filter(x => x.broadCat === ck).length;
        h += "<button type=\"button\" class=\"" + ((UI.bagCat || "ALL") === ck ? "on" : "") + "\" data-do=\"bag-cat\" data-arg=\"" + ck + "\">" + cv + " (" + cnt + ")</button>";
      });
      h += "</div>";
      // Search & Sort row
      h += "<div class=\"inv-filter-row\">";
      h += "<input id=\"bagSearch\" type=\"search\" placeholder=\"ค้นหาชื่อหรือรหัสไอเทมในถุง…\" value=\"" + esc(UI.bagSearch || "") + "\">";
      h += "<select id=\"bagSort\">" + [["tier", "เรียง: สวมใส่/ระดับ"], ["qty", "เรียง: จำนวน"], ["value", "เรียง: มูลค่า"], ["name", "เรียง: ชื่อ"]].map(([k, v]) => "<option value=\"" + k + "\"" + (UI.bagSort === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select>";
      h += "</div>";

      const pgSpec = UI.calcGridPageSize();
      const totalPages = Math.max(1, Math.ceil(items.length / pgSpec.perPage));
      UI.bagPage = clamp(UI.bagPage || 1, 1, totalPages);
      const startIdx = (UI.bagPage - 1) * pgSpec.perPage;
      const pageItems = items.slice(startIdx, startIdx + pgSpec.perPage);

      if (UI.bagSelKey && !items.some(x => x.selKey === UI.bagSelKey)) {
        UI.bagSelKey = null;
      }
      const selItem = UI.bagSelKey ? items.find(x => x.selKey === UI.bagSelKey) : null;

      h += "<div class=\"inv-grid-wrap\">";
      if (!pageItems.length) {
        h += "<div class=\"muted\" style=\"padding:10px 4px;text-align:center\">ไม่พบไอเทมในถุงที่ตรงกับหมวดหรือคำค้นหา</div>";
      } else {
        h += "<div class=\"inv-grid\">" + pageItems.map(it => renderGridCellHtml(it, selItem && selItem.selKey === it.selKey, "bag-sel")).join("") + "</div>";
      }
      h += "<div class=\"inv-page-bar\">" +
        "<button type=\"button\" data-do=\"bag-page\" data-arg=\"-1\"" + (UI.bagPage <= 1 ? " disabled" : "") + ">◀ ก่อนหน้า</button>" +
        "<span>หน้า <b>" + UI.bagPage + "</b> / " + totalPages + " <span class=\"muted\">(" + items.length + " ชิ้น)</span></span>" +
        "<button type=\"button\" data-do=\"bag-page\" data-arg=\"+1\"" + (UI.bagPage >= totalPages ? " disabled" : "") + ">ถัดไป ▶</button>" +
        "</div>";

      if (selItem) {
        const rLabel = selItem.legendary || selItem.rarity === "Legendary" ? "★ ตำนาน" : selItem.rarity === "Exceptional" ? "◆ ล้ำเลิศ" : selItem.rarity === "Rare" ? "▲ หายาก" : "ทั่วไป";
        h += "<div class=\"inv-detail-panel\" data-detail-for=\"" + esc(selItem.selKey) + "\">" +
          ((selItem.kind === "EQUIPPED" || selItem.kind === "EQUIPMENT" || selItem.broadCat === "EQUIPMENT" || selItem.eq) ? relicShowcaseHtml(selItem, 180, 82) : "") +
          "<div class=\"inv-detail-top\">" +
          UI.renderAtlasIconHtml(selItem, 44) +
          "<div class=\"inv-detail-meta\">" +
          "<div class=\"inv-detail-title\">" + esc(selItem.nameTh) + "</div>" +
          "<div class=\"inv-detail-sub\"><span class=\"chip " + (selItem.kind === "EQUIPPED" ? "g" : "b") + "\">" + esc(selItem.kindTh) + " · T" + selItem.tier + "</span>" +
          "<span class=\"chip\">" + rLabel + "</span>" +
          "<span>จำนวน <b>×" + selItem.qty + "</b></span>" +
          (selItem.qualityPct ? "<span>· คุณภาพ <b>" + selItem.qualityPct + "%</b></span>" : "") +
          (selItem.spawned ? "<span class=\"chip v\">ไอเทมเสก (0 คป.)</span>" : "") +
          "</div></div>" +
          "<button type=\"button\" class=\"inv-detail-close\" data-do=\"bag-close-detail\" title=\"ปิดแผงรายละเอียด\">✕ ปิด</button>" +
          "</div>" +
          "<div class=\"inv-detail-eff\">✨ <b>ผลลัพธ์/สรรพคุณ:</b> " + esc(selItem.descTh || "-") + "</div>" +
          "<div class=\"inv-detail-actions\">" +
          renderPersonalBagActionsHtml(n, selItem) +
          "<button type=\"button\" class=\"btn\" data-do=\"bag-toggle-more\">" + (UI.bagMoreOpen ? "▲ ซ่อนรายละเอียด" : "▼ รายละเอียดเพิ่มเติม") + "</button>" +
          "</div>" +
          (UI.bagMoreOpen ? "<div class=\"inv-detail-more\">" + esc(selItem.moreTh || "ไม่มีข้อมูลเพิ่มเติม") + " · มูลค่าประเมิน ~" + (selItem.value || 0) + " คป.</div>" : "") +
          "</div>";
      }
      h += "</div>";
    } else {
      // Classic List View
      h += "<div class=\"edit-grid\" style=\"margin-bottom:8px\">";
      h += "<input id=\"bagSearch\" type=\"search\" placeholder=\"ค้นหาไอเทมในถุง…\" value=\"" + esc(UI.bagSearch || "") + "\">";
      h += "<select id=\"bagType\">" + [["ALL", "ทุกประเภท"], ["EQUIPPED", "สวมใส่อยู่"], ["EQUIPMENT", "อุปกรณ์ในถุง"], ["PILL", "โอสถ"], ["MATERIAL", "วัตถุดิบ"], ["CRYSTAL", "ผลึกวิชา/สายย่อย"], ["TECH_MANUAL", "คัมภีร์วิชา"], ["SUB_MANUAL", "คัมภีร์สายย่อย"], ["RECIPE_SCROLL", "ม้วนตำรับ"], ["ORGAN", "อวัยวะอสูร"]].map(([k, v]) => "<option value=\"" + k + "\"" + (UI.bagType === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select>";
      h += "<select id=\"bagSort\">" + [["tier", "เรียงตามระดับ/สวมใส่"], ["qty", "เรียงตามจำนวน"], ["value", "เรียงตามมูลค่า"], ["name", "เรียงตามชื่อ"]].map(([k, v]) => "<option value=\"" + k + "\"" + (UI.bagSort === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select>";
      h += "</div>";

      if (!items.length) {
        h += "<div class=\"muted\">ยังไม่มีไอเทมในถุงส่วนตัวที่ตรงกับเงื่อนไข (สามารถกดปุ่ม ✨ เสกของเข้าถุง เพื่อเพิ่มไอเทมได้)</div>";
      } else {
        h += items.map(it => {
          const btns = renderPersonalBagActionsHtml(n, it);
          return "<div class=\"logrow\" style=\"align-items:center\"><div><span class=\"chip " + (it.kind === "EQUIPPED" ? "g" : "b") + "\">" + esc(it.kindTh) + " T" + it.tier + "</span> <b>" + esc(it.nameTh) + "</b> ×" + it.qty + (it.spawned ? " <span class=\"chip v\">ไอเทมเสก (0 คป.)</span>" : "") + "<div class=\"muted\" style=\"font-size:11px\">" + esc(it.descTh || "") + "</div></div><div style=\"display:flex;gap:4px;flex-wrap:wrap\">" + btns + "</div></div>";
        }).join("");
      }
    }
    h += "</div>";
    return h;
  }

  function renderTechTab(W, n) {
    if (!n.cult) return '<div class="card muted">ตัวละครนี้ยังเป็นปุถุชน ยังไม่ตื่นรู้ปราณหรือฝึกวรยุทธ์</div>';
    let h = '';
    const c = n.cult, M = g.MARTIAL;
    // 1. Mantra (คัมภีร์ลมปราณหลัก)
    const curMantra = c.mantra ? CULT.tech(c.mantra) : null;
    h += '<h3>1. คัมภีร์ลมปราณหลัก (Mantra)</h3><div class="card">';
    if (curMantra) {
      const em = g.ELEM ? g.ELEM.explainCompatibility(n, curMantra, 'MANTRA_PRACTICE') : null;
      h += '<div style="display:flex;justify-content:space-between;align-items:center"><b>' + esc(curMantra.nameTh) + '</b> ' + gradeChip(curMantra) + '</div>';
      h += '<div class="muted" style="margin-top:2px">' + esc(curMantra.descTh || curMantra.desc || '') + '</div>';
      if (em) h += '<div class="muted" style="font-size:11.5px;color:var(--text)">' + esc(em.summaryTh) + ' · อัตราบำเพ็ญ ×' + em.cultivationMultiplier.toFixed(2) + (em.breakthroughBonus ? ' · โบนัสทะลวงด่าน ' + (em.breakthroughBonus >= 0 ? '+' : '') + Math.round(em.breakthroughBonus * 100) + '%' : '') + '</div>';
    } else {
      h += '<div class="muted">ยังไม่ได้โคจรคัมภีร์ลมปราณหลัก</div>';
    }
    const unlockedMantras = (c.unlockedMantras || []).filter(id => id !== c.mantra && (!M || !M.canActivateMantra || M.canActivateMantra(n, id).ok));
    if (unlockedMantras.length) {
      h += '<div style="margin-top:6px;border-top:1px solid var(--line,#3a3f4a);padding-top:4px"><b>คัมภีร์ปราณอื่นที่ตื่นรู้แล้ว:</b></div>' + unlockedMantras.map(id => {
        const mt = CULT.tech(id);
        if (!mt) return '';
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0"><span>' + esc(mt.nameTh) + ' ' + gradeChip(mt) + '</span><button class="btn" style="padding:1px 6px;font-size:11px" data-do="switch-mantra" data-arg="' + n.id + '|' + id + '">เปลี่ยนมาใช้เล่มนี้</button></div>';
      }).join('');
    }
    h += '</div>';

    // 2. Study in progress (กำลังศึกษา)
    if (c.learning) {
      const lt = CULT.tech(c.learning.id);
      const pct = Math.min(100, Math.round(c.learning.got / Math.max(1, c.learning.need) * 100));
      h += '<h3>2. ความก้าวหน้าการศึกษาตำรา</h3><div class="card">';
      h += '<div>กำลังศึกษา: <b>' + esc(lt ? lt.nameTh : c.learning.id) + '</b> ' + (lt ? gradeChip(lt) : '') + '</div>';
      h += bar('ความคืบหน้า', pct, { wide: true, txt: Math.round(c.learning.got) + '/' + c.learning.need + ' (' + pct + '%)', color: '#c9a15b' });
      h += '<div class="muted" style="font-size:11.5px">เหลือเวลาประมาณ ' + Math.max(1, Math.ceil((c.learning.need - c.learning.got) / 10)) + ' กิจกรรม · สามารถใช้ผลึกวิชาเพื่อเรียนรู้ทันทีได้</div>';
      h += '</div>';
    }

    // 3. Active combat techniques and moves (วิชาต่อสู้และกระบวนท่าที่พร้อมใช้)
    const sl = g.SK ? g.SK.list(n) : [];
    h += '<h3>' + (c.learning ? '3' : '2') + '. วิชาต่อสู้และกระบวนท่า (' + sl.length + ')</h3><div class="card">';
    if (sl.length) {
      h += sl.map(p => {
        const parent = CULT.tech(p.tech || p.id);
        const curStage = (g.SK.unlockedStage && parent) ? g.SK.unlockedStage(n, parent) : 1;
        const maxStage = (parent && Array.isArray(parent.stages) && parent.stages.length) ? parent.stages.length : 1;
        const mastery = (g.SK.masteryPoints && parent) ? g.SK.masteryPoints(n, parent.id) : 0;
        const allM = (g.SK.allMoves && parent && Array.isArray(parent.moveDefs) && parent.moveDefs.length > 1) ? g.SK.allMoves(parent) : [];
        const lockedM = allM.filter(mv => !g.SK.canSelectMove(n, parent, mv.id));
        const elemInter = (g.ELEM && parent) ? g.ELEM.explainCompatibility(n, parent, 'COMBAT_SKILL') : null;
        const sigId = p.signatureVfx || (parent && parent.signatureVfx) || (g.SK && g.SK.resolveSignatureVfx ? g.SK.resolveSignatureVfx(parent || p, p) : null);
        const sigSpec = (sigId && g.SK && g.SK.SIGNATURE_VFX_CATALOG) ? g.SK.SIGNATURE_VFX_CATALOG[sigId] : null;
        const sigBadge = sigSpec ? (' <span class="chip g">' + esc(sigSpec.icon + ' เอฟเฟกต์เฉพาะ: ' + sigSpec.nameTh) + '</span> <button type="button" class="btn" style="padding:1px 6px;font-size:10.5px" data-do="preview-signature-vfx" data-arg="' + esc(n.id + '|' + sigSpec.id) + '">✨ ชมท่าไม้ตาย</button>') : '';
        return '<div style="padding:4px 0;border-bottom:1px solid var(--line,#3a3f4a)"><b>' + esc(p.nameTh) + '</b> ' + gradeChip(parent || p) + sigBadge + ' <span class="muted">(ความชำนาญ ' + mastery + ' · ขั้นวิชา ' + curStage + '/' + maxStage + ')</span><div class="muted" style="font-size:12px">' + esc(p.summary) + '</div>' + (elemInter ? '<div class="muted" style="font-size:11px;color:var(--text)">' + esc(elemInter.summaryTh) + '</div>' : '') + (lockedM.length ? '<div class="muted" style="font-size:11px;color:#e8c43a">🔒 กระบวนท่าที่ยังไม่ปลดล็อก: ' + lockedM.map(lm => esc(lm.nameTh) + ' (ขั้นวิชา ' + (lm.stageReq || 1) + '/ชำนาญ ' + (lm.reqMastery || 0) + ')').join(' · ') + '</div>' : '') + '</div>';
      }).join('');
    } else {
      h += '<div class="muted">ยังไม่มีกระบวนท่าต่อสู้ที่ติดตั้ง</div>';
    }
    h += '</div>';

    // 4. Passive techniques and slot occupancy (วิชาติดตัวและช่องติดตั้ง)
    if (M) {
      const slotInfo = M.passiveSlotInfo ? M.passiveSlotInfo(n) : { base: 3, bonus: 0, total: 3, reasons: [] };
      const maxSlots = slotInfo.total || slotInfo.max || 3;
      const bonusReasons = slotInfo.reasons || slotInfo.bonusReasons || [];
      const activePassIds = M.activePassives ? M.activePassives(n) : [];
      const inactivePassList = M.inactivePassives ? M.inactivePassives(n) : [];
      const pass = c.techs.map(CULT.tech).filter(t => t && (t.passive || t.cat === 'PASSIVE'));
      h += '<h3>' + (c.learning ? '4' : '3') + '. ช่องวิชาติดตัว (Passives: ' + activePassIds.length + '/' + maxSlots + ' ช่อง)</h3><div class="card">';
      h += '<div class="muted" style="margin-bottom:6px">ช่องพื้นฐาน ' + slotInfo.base + (slotInfo.bonus > 0 ? ' + โบนัสสายย่อย +' + slotInfo.bonus + ' [' + esc(bonusReasons.join(', ')) + ']' : '') + '</div>';
      if (pass.length) {
        h += pass.map(t => {
          const isComp = M.isTechCompatible ? M.isTechCompatible(n, t) : M.activeTechs(n).includes(t.id);
          const condOk = M.conditionMatches(n, t);
          const inSlot = activePassIds.includes(t.id);
          const inactObj = inactivePassList.find(x => x.id === t.id);
          let statusTxt = 'ทำงาน';
          if (!isComp) statusTxt = 'หยุดทำงาน (วิถี/สาย/ขั้นไม่ตรง)';
          else if (!condOk) statusTxt = 'หยุดทำงาน (อุปกรณ์ไม่ตรง)';
          else if (!inSlot) statusTxt = 'หยุดทำงาน (' + (inactObj ? inactObj.reason : 'ไม่ได้บรรจุในช่องวิชาติดตัว') + ')';
          const btn = inSlot
            ? ' <button class="btn" style="padding:1px 6px;font-size:10.5px" data-do="unequip-passive" data-arg="' + n.id + '|' + t.id + '">ถอด</button>'
            : (isComp && condOk ? ' <button class="btn pri" style="padding:1px 6px;font-size:10.5px" data-do="equip-passive" data-arg="' + n.id + '|' + t.id + '">สวมใส่</button>' : '');
          return '<div style="padding:3px 0;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.04)"><div>' + gradeChip(t) + ' <b>' + esc(t.nameTh) + '</b> <span class="muted">(' + esc(M.conditionText(t)) + ')</span><div class="muted" style="font-size:11px">' + esc(statusTxt) + '</div></div><div>' + btn + '</div></div>';
        }).join('');
      } else {
        h += '<div class="muted">ยังไม่มีวิชาติดตัวที่เรียนรู้</div>';
      }
      h += '</div>';
    }

    // 5. All learned techniques overview
    h += '<h3>' + (c.learning ? '5' : '4') + '. คัมภีร์วิชาที่จดจำได้ทั้งหมด (' + c.techs.length + ')</h3><div class="card">';
    if (c.techs.length) {
      h += c.techs.map(id => {
        const t = CULT.tech(id);
        if (!t) return '';
        const ex = g.ELEM ? g.ELEM.explainCompatibility(n, t, 'COMBAT_SKILL') : null;
        const tc = (M && M.resolveTechCompatibility) ? M.resolveTechCompatibility(n, t) : null;
        const _catTh = ({ COMBAT_TECHNIQUE: 'กระบวนท่าต่อสู้', INNER_KUNGFU: 'คัมภีร์บ่มเพาะ', MOVEMENT_TECHNIQUE: 'วิชาตัวเบา', SUPPORT_TECHNIQUE: 'วิชาหนุนเสริม', DEFENSIVE_TECHNIQUE: 'วิชาคุ้มกาย', FORBIDDEN_ART: 'วิชาต้องห้าม', PASSIVE: 'วิชาติดตัว' })[t.cat] || (t.cat || 'วิชา');
        return '<div style="padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.04)"><div>' + gradeChip(t) + ' <b>' + esc(t.nameTh) + '</b> <span class="muted">(ขั้น ' + t.tier + ' · ' + esc(_catTh) + ')</span></div>' + (tc ? '<div class="muted" style="font-size:11px;color:#b8d8ff">⚖ ' + esc(tc.summaryTh) + '</div>' : '') + (ex ? '<div class="muted" style="font-size:11px">' + esc(ex.summaryTh) + '</div>' : '') + '</div>';
      }).join('');
    } else {
      h += '<div class="muted">ยังไม่ได้เรียนรู้วิชาใด</div>';
    }
    h += '</div>';

    return h;
  }

  function renderSubTab(W, n) {
    if (!n.cult) return '<div class="card muted">ตัวละครนี้ยังเป็นปุถุชน ยังไม่มีสายย่อยเฉพาะทาง</div>';
    let h = '';
    const c = n.cult, M = g.MARTIAL;
    const sub = CULT.subInfo(c.path, c.sub);
    h += '<h3>1. ข้อมูลสายย่อยเฉพาะทาง (Specialization)</h3><div class="card">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center"><b>สายย่อย: ' + esc(sub ? sub.nameTh : (c.sub || 'ไม่มี')) + '</b> <span class="chip b">' + esc(CULT.PATHS[c.path]?.shortTh || c.path) + '</span></div>';
    if (sub && sub.descTh) h += '<div class="muted" style="margin-top:2px">' + esc(sub.descTh) + '</div>';
    if (c.track) {
      const tr = c.track;
      const trR = CULT.trackRealm(n);
      const trTh = CULT.trackThreshold(n);
      const trGate = CULT.checkTrackGates(W, n);
      h += '<div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--line,#3a3f4a)"><b>🌿 ขั้นสายเฉพาะ: ' + esc(trR ? trR.nameTh : '') + ' (ลำดับ ' + tr.ordinal + '/9)</b>' + (trTh !== Infinity ? bar('ความก้าวหน้าสายเฉพาะ', tr.prog / trTh * 100, { wide: true, txt: Math.round(tr.prog) + '/' + trTh, color: '#7fd1b9' }) : '') + '<div class="muted" style="font-size:11.5px">เทียบเคียงขั้นหลัก: <b>' + (trR ? trR.majorBandEquivalent.toFixed(1) : '') + '</b> · พลังรบเฉพาะทางเทียบเคียง: <b>' + (trR ? trR.functionalCombatPower : '') + ' CP</b></div><div style="font-size:12px;margin-top:4px">' + (tr.ordinal >= 9 ? '<span class="chip ok">บรรลุขั้น 9 สูงสุดแล้ว</span>' : trGate.ok ? '<span class="chip ok">✔ ผ่านเกณฑ์ทักษะและศิลา พร้อมทะลวงขั้นถัดไป</span>' : '<span class="chip r">🔒 ' + esc(trGate.reason) + '</span>' + (CULT.inspectProgressionBottleneck ? (() => { const bni = CULT.inspectProgressionBottleneck(W, n); return (bni && bni.track && bni.track.active) ? '<div class="muted" style="margin-top:3px;color:var(--gold)">⚡ ' + esc(bni.track.statusTh) + '<br><span style="font-size:11px">' + esc(bni.track.statusEn) + '</span></div>' : ''; })() : '')) + '</div></div>';
    } else {
      h += '<div class="muted" style="margin-top:6px">ยังไม่ได้เปิดขั้นสายเฉพาะทาง (ต้องใช้คัมภีร์หรือผลึกสายย่อย)</div>';
    }
    h += '</div>';

    // 2. Innate subpath techniques & dormant techniques
    if (M) {
      const actInn = (M.activeInnateTechs ? M.activeInnateTechs(n) : []).map(id => typeof id === 'string' ? CULT.tech(id) : id).filter(Boolean);
      const dormInn = (M.dormantInnateTechs ? M.dormantInnateTechs(n) : []).map(id => typeof id === 'string' ? CULT.tech(id) : id).filter(Boolean);
      if (actInn.length || dormInn.length) {
        h += '<h3>2. วิชาเฉพาะสายย่อยติดตัว</h3><div class="card">';
        actInn.forEach(t => {
          const curStage = (g.SK.unlockedStage && t) ? g.SK.unlockedStage(n, t) : 1;
          const maxStage = (t && Array.isArray(t.stages) && t.stages.length) ? t.stages.length : 1;
          const mast = (g.SK.masteryPoints && t) ? g.SK.masteryPoints(n, t.id) : 0;
          h += '<div style="padding:3px 0"><span class="chip g">ติดตัวสายย่อย · ทำงาน</span> ' + gradeChip(t) + ' <b>' + esc(t.nameTh) + '</b> <span class="muted">(ความชำนาญ ' + mast + ' · ขั้น ' + curStage + '/' + maxStage + ')</span><div class="muted" style="font-size:11.5px">' + esc(t.descTh || '') + '</div></div>';
        });
        dormInn.forEach(t => {
          const mast = (g.SK.masteryPoints && t) ? g.SK.masteryPoints(n, t.id) : 0;
          h += '<div style="padding:3px 0;opacity:0.7"><span class="chip">หลับใหล · สายเดิม (' + esc(t.sub) + ')</span> ' + esc(t.nameTh) + ' <span class="muted">(ความชำนาญคงเดิม ' + mast + ')</span></div>';
        });
        h += '</div>';
      }
      // Synergies
      const synInfo = M.evaluateSynergies ? M.evaluateSynergies(n) : { active: [] };
      if (synInfo && Array.isArray(synInfo.active) && synInfo.active.length) {
        h += '<h3>3. การประสานวิชาและสายย่อย (Synergies)</h3><div class="card">';
        synInfo.active.forEach(sy => {
          h += '<div style="padding:2px 0"><span class="chip ok">ประสานสำเร็จ</span> <b>' + esc(sy.nameTh) + '</b> <span class="muted">— ' + esc(sy.descTh || '') + '</span></div>';
        });
        h += '</div>';
      }
      // Crystals in personal inventory
      const d = M.describe ? M.describe(W, n) : { crystals: [] };
      if (d && Array.isArray(d.crystals) && d.crystals.length) {
        h += '<h3>4. ผลึกความรู้ในตัว</h3><div class="card">' + d.crystals.map(([key, qty]) => {
          const choice = M.crystalDecision(W, n, key), gate = M.eligible(n, key);
          return '<div style="padding:2px 0"><b>' + esc(M.crystalName(key)) + '</b> ×' + qty + ' · <span class="chip">' + esc(({ use: 'ตั้งใจใช้', retain: 'เก็บไว้', donate: 'ตั้งใจบริจาค' })[choice.action] || 'เก็บไว้') + '</span><div class="muted" style="font-size:11.5px">' + esc(gate.ok ? choice.reason : gate.reason) + '</div></div>';
        }).join('') + '</div>';
      }
    }

    // Retraining interface
    h += UI.martialRetraining(W, n);
    return h;
  }

  /* ----- ตัวละคร ----- */
  UI.rNpc = () => {
    const W = UI.G.W, n = W.byId[UI.npcId]; if (!n) return '<div class="muted">ไม่พบตัวละคร</div>';
    let tab = UI.tab;
    let forcedNpcSub = null;
    if (tab === 'meridian') { tab = 'ov'; forcedNpcSub = 'COMBAT'; }
    else if (tab === 'pets') { tab = 'ov'; forcedNpcSub = 'PETS'; }
    else if (tab === 'lineage') { tab = 'ov'; forcedNpcSub = 'LINEAGE'; }
    const s = n.h.state; let h = '';
    const idn = HC.identity(n);
    if (tab === 'ov') {
      const nSub = forcedNpcSub || (UI.bagSelKey ? 'PETS' : (UI.npcSubTab || 'CORE'));
      const npcSubTabs = [
        ['CORE', '🪪 สรุปหลัก & แท่นเซียน'],
        ['MIND', '🧠 ความคิด · ปณิธาน & ปมมาร'],
        ['COMBAT', '⚔️ สเตตัสต่อสู้ · ชีพจร & ศาสตรา'],
        ['LINEAGE', '🎓 สายเลือด · อาจารย์ & ยุทธภพ'],
        ['PETS', '🐾 สัตว์อสูร · กลไก & ถุงด่วน'],
        ['ALL', '📋 ดูทั้งหมด']
      ];
      const isTr = UI.isTrackedNpc(W, n.id);
      h += '<div class="prow">' + portraitHtml(n, 64) + '<div class="pi"><div class="nm" style="font-size:15px">' + esc(HC.fullName(n)) + (isTr ? ' <span style="color:#ffd700;font-size:14px" title="กำลังติดตาม">⭐</span>' : '') + '</div><div class="sub">' + (n.h.sex === 'M' ? 'ชาย' : 'หญิง') + ' · ' + HC.ageText(n) + ' · ' + esc(n.h.origin.cls) + ' จาก' + esc(n.h.origin.region) + '</div><div class="sub">' + esc(idn.title) + '</div></div></div>';
      h += '<div>' + (isTr ? '<span class="chip" style="border-color:#ffd700;background:rgba(255,215,0,0.12);color:#ffd700;font-weight:bold">⭐ กำลังติดตาม</span>' : '') + idn.tags.map(t => '<span class="chip v">' + esc(t) + '</span>').join('') + '<span class="chip">' + esc(idn.archetypeTh) + '</span><span class="chip b">ปัญญา: ' + esc(idn.smart) + '</span></div>';
      h += '<div style="margin:8px 0;display:flex;gap:6px;flex-wrap:wrap">' +
        (isTr
          ? '<button class="btn ok" style="font-weight:bold" data-do="toggle-track-npc" data-arg="' + n.id + '">⭐ เลิกติดตาม</button>'
          : '<button class="btn" style="border-color:#ffd700;color:#ffd700;font-weight:bold" data-do="toggle-track-npc" data-arg="' + n.id + '">⭐ ติดตามตัวละคร</button>'
        ) +
        '<button class="btn pri" data-do="follow" data-arg="' + n.id + '">🎯 ติดตามกล้อง</button><button class="btn" data-do="locate" data-arg="' + n.id + '">📍 ดูบนแผนที่</button><button class="btn" data-do="editnpc" data-arg="' + n.id + '">✏️ แก้ไขตัวละครนี้</button><button class="btn" data-do="spawnnpc" data-arg="' + n.id + '">✨ เสกของเข้าถุง</button>' + (SECT.MENTORSHIP && n.cult ? '<button class="btn" data-do="chronicle-person" data-arg="' + esc(n.id) + '">📖 ดูพงศาวดารของคนนี้</button>' : '') + '</div>';
      h += renderSubTabBar('set-npc-subtab', nSub, npcSubTabs, 'หมวดย่อยข้อมูลตัวละคร');
      h += '<div class="subcat-pane" data-subcat="CORE"' + ((nSub === 'ALL' || nSub === 'CORE') ? '' : ' style="display:none"') + '>';
      {
        const curPose = UI.dioramaPose || 'cultivate';
        const stg = (n.cult && n.cult.stage) || 1;
        const rSpec = (g.Render && g.Render.REALM_VISUAL_TIERS && g.Render.REALM_VISUAL_TIERS[stg]) || { nameTh: 'หลอมปราณ' };
        const petObj = (Array.isArray(n.pets) && n.pets[0]) ? n.pets[0] : (n.pet || null);
        h += '<div class="card" style="border-color:var(--gold);background:rgba(255,215,64,0.04);margin:6px 0">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;margin-bottom:6px"><b>✨ แท่นจำลองรัศมีเซียน & ศาสตราคู่กาย (Era 5 Visual Diorama)</b><div style="display:flex;gap:4px">' +
          [['cultivate', '🧘 โคจรปราณ'], ['mantra', '☯️ คัมภีร์ปราณ'], ['defensive', '🛡️ วิชาคุ้มกาย'], ['support', '🎶 วิชาหนุนเสริม'], ['forbidden', '🩸 วิชาต้องห้าม'], ['fight', '⚔️ สำแดงวิชา'], ['qinggong', '🗡️ วิชาตัวเบา/เหินเวหา'], ['breakthrough', '⚡ ทัณฑ์สวรรค์']].map(([pk, pl]) => '<button class="btn' + (curPose === pk ? ' pri' : '') + '" style="padding:2px 7px;font-size:10.5px" data-do="set-diorama-pose" data-arg="' + pk + '">' + pl + '</button>').join('') +
          '</div></div>';
        h += dioramaHtml(n, 220, 136);
        h += '<div class="muted" style="font-size:11px;text-align:center;margin-top:5px">รัศมีตบะ: <b>' + esc(rSpec.nameTh) + '</b>' + (stg >= 7 ? ' · มีผ้าแพรเซียนเหินเมฆา (披帛)' : '') + (petObj ? ' · สัตว์อสูรคู่ใจ: <b>' + esc(petObj.nameTh || petObj.speciesId || 'อสูรวิญญาณ') + '</b>' : '') + '</div>';
        h += '</div>';
      }
      h += '<div class="muted">🏅 แต้มคุณูปการ <b>' + Math.round(n.cp || 0) + '</b> · สะสมตลอดชีพ ' + Math.round(n.cpEarned || 0) + '</div>';
      if (CULT.FORBIDDEN_ARTS && n.cult) {
        const fb = CULT.FORBIDDEN_ARTS.resolveNpcForbidden(W, n);
        if (fb && fb.spec) {
          const fSt = n.forbiddenArtState || { sealMode: 'SEALED_RESTRAINT', tabooStrain: 0, totalBloodSacrificed: 0, totalDesperationNovas: 0 };
          h += '<h3>🩸 คัมภีร์วิชาต้องห้ามและการปลดผนึกโลหิต (Forbidden Arts & Taboo Seals v5.8.0)</h3><div class="card" style="border-color:' + esc(fb.spec.color || '#ef233c') + '">';
          h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
          h += '<div><span class="chip r" style="border-color:' + esc(fb.spec.color || '#ef233c') + '">' + fb.spec.icon + ' <b>' + esc(fb.spec.nameTh) + '</b></span> <span class="chip b">สถานะผนึก: ' + esc(fb.sealSpec.shortTh) + '</span>' + (fb.isUnsealed ? ' <span class="chip r">🔥 พลังโจมตี +' + Math.round(fb.effAtkBonusPct * 100) + '% · เร่งตบะ ×' + fb.effCultMult.toFixed(2) + '</span>' : ' <span class="chip ok">🔒 ปลอดภัยไร้ผลสะท้อน</span>') + '</div>';
          h += '<button class="btn dan" style="padding:2px 8px;font-size:11px" data-do="demo-forbidden-taboo" data-arg="' + esc(n.id) + '">🩸 สำแดงปราณต้องห้าม</button>';
          h += '</div>';
          h += '<div class="muted" style="font-size:11.5px;margin-top:4px"><b>อานุภาพต้องห้าม:</b> ' + esc(fb.spec.prosTh) + '<br><b>ราคาที่ต้องจ่าย:</b> ' + esc(fb.spec.consTh) + '<br><b>สถิติต้องห้าม:</b> ชีพจรตึงเครียดสะสม ' + Math.round(fSt.tabooStrain || 0) + '/100 · สังเวยโลหิตสะสม ' + Math.round(fSt.totalBloodSacrificed || 0) + ' HP · ระเบิดพลีชีพฝืนฟ้า ' + (fSt.totalDesperationNovas || 0) + ' ครั้ง</div>';
          h += '<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;align-items:center"><span class="muted" style="font-size:11px">ระดับการคลายผนึกต้องห้าม:</span>';
          Object.values(CULT.FORBIDDEN_ARTS.SEAL_MODES).forEach(sSpec => {
            h += '<button class="btn' + (fb.sealModeId === sSpec.id ? (sSpec.id === 'BLOOD_TABOO_UNLEASHED' ? ' dan' : ' pri') : '') + '" style="padding:2px 7px;font-size:10.5px" data-do="set-npc-forbidden-seal" data-arg="' + esc(n.id + '|' + sSpec.id) + '">' + esc(sSpec.icon + ' ' + sSpec.shortTh) + '</button>';
          });
          h += '</div></div>';
        }
      }
      if (CULT.PASSIVE_RESONANCE && n.cult) {
        const pr = CULT.PASSIVE_RESONANCE.resolveNpcConstellation(W, n);
        if (pr && pr.spec) {
          h += '<h3>🌟 ดาราจักรวิชาติดตัวและเคล็ดสายย่อยประสานชีพจร (Passive & Innate Constellations v5.8.0)</h3><div class="card" style="border-color:' + esc(pr.spec.color || '#00f5d4') + '">';
          h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
          h += '<div><span class="chip g" style="border-color:' + esc(pr.spec.color || '#00f5d4') + '">' + pr.spec.icon + ' <b>' + esc(pr.spec.nameTh) + '</b></span> <span class="chip b">ดาราจักรขั้นที่ ' + pr.setTier + '/3</span> <span class="chip ok">โจมตี +' + Math.round(pr.atkBonusPct * 100) + '% · ลดดาเมจ -' + Math.round(pr.dmgRedPct * 100) + '% · บ่มเพาะ +' + Math.round(pr.cultRateBonusPct * 100) + '%</span></div>';
          h += '</div>';
          h += '<div class="muted" style="font-size:11.5px;margin-top:4px">' + esc(pr.spec.descTh) + '</div>';
          h += '<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;align-items:center"><span class="muted" style="font-size:11px">เปลี่ยนดาราจักรประสานหลัก:</span>';
          Object.values(CULT.PASSIVE_RESONANCE.CONSTELLATIONS).forEach(cSpec => {
            h += '<button class="btn' + (pr.constellationId === cSpec.id ? ' pri' : '') + '" style="padding:2px 7px;font-size:10.5px" data-do="set-npc-passive-constellation" data-arg="' + esc(n.id + '|' + cSpec.id) + '">' + esc(cSpec.icon + ' ' + cSpec.shortTh) + '</button>';
          });
          h += '</div></div>';
        }
      }
      if (CULT.SUPPORT_ARTS && n.cult) {
        const sup = CULT.SUPPORT_ARTS.resolveNpcSupport(W, n);
        if (sup && sup.spec) {
          const sSt = n.supportState || { posture: 'SOUL_MELODY_HARMONY', totalAlliesHealed: 0, totalHeartDemonCleansed: 0, totalCommandBuffs: 0, breakthroughBlessingsGranted: 0 };
          h += '<h3>🎶 วิชาสายสนับสนุนและวิชาเสริม (Support & Auxiliary Arts v5.7.0)</h3><div class="card" style="border-color:' + esc(sup.spec.color || '#48cae4') + '">';
          h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
          h += '<div><span class="chip g" style="border-color:' + esc(sup.spec.color || '#48cae4') + '">' + sup.spec.icon + ' <b>' + esc(sup.spec.nameTh) + '</b></span> <span class="chip b">อาคารประสาน: ' + esc(sup.spec.facilityNameTh) + '</span> <span class="chip ok">หนุนทะลวงด่าน +' + Math.round(sup.effBreakthroughBonus * 100) + '%</span></div>';
          h += '<button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="demo-support-art-aura" data-arg="' + esc(n.id) + '">🎶 แผ่รัศมีวิชาสนับสนุน</button>';
          h += '</div>';
          h += '<div class="muted" style="font-size:11.5px;margin-top:4px"><b>เอกลักษณ์และผลกระทบต่อเนื่อง:</b> ' + esc(sup.spec.prosTh) + '<br><b>ข้อจำกัด:</b> ' + esc(sup.spec.consTh) + '<br><b>สถิติสนับสนุนสำนัก:</b> ชะล้างจิตมารสะสม ' + Math.round(sSt.totalHeartDemonCleansed || 0) + ' แต้ม · สมานแผลสหาย ' + Math.round(sSt.totalAlliesHealed || 0) + ' HP · อวยพรทะลวงด่าน ' + (sSt.breakthroughBlessingsGranted || 0) + ' ครั้ง</div>';
          h += '<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;align-items:center"><span class="muted" style="font-size:11px">ท่วงท่ายุทธวิธีสายสนับสนุน:</span>';
          Object.values(CULT.SUPPORT_ARTS.POSTURES).forEach(pSpec => {
            h += '<button class="btn' + (sup.postureId === pSpec.id ? ' pri' : '') + '" style="padding:2px 7px;font-size:10.5px" data-do="set-npc-support-posture" data-arg="' + esc(n.id + '|' + pSpec.id) + '">' + esc(pSpec.icon + ' ' + pSpec.shortTh) + '</button>';
          });
          h += '</div></div>';
        }
      }
      if (CULT.DEFENSIVE_ARTS && n.cult) {
        const df = CULT.DEFENSIVE_ARTS.resolveNpcDefense(W, n);
        if (df && df.spec) {
          const dSt = n.defensiveArtState || { posture: 'COUNTER_PARRY_STANCE', totalDamageMitigated: 0, totalDamageRedirected: 0, totalAllyIntercepts: 0 };
          h += '<h3>🛡️ วิชาคุ้มกายและปราณเกราะพิทักษ์ (Defensive Kungfu & Aegis v5.6.0)</h3><div class="card" style="border-color:' + esc(df.spec.color || '#72efdd') + '">';
          h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
          h += '<div><span class="chip g" style="border-color:' + esc(df.spec.color || '#72efdd') + '">' + df.spec.icon + ' <b>' + esc(df.spec.nameTh) + '</b></span> <span class="chip b">ลดดาเมจ -' + Math.round(df.effDmgRedPct * 100) + '%</span>' + (df.effRedirectPct > 0 ? ' <span class="chip ok">☯️ ยืมแรงสะท้อน ' + Math.round(df.effRedirectPct * 100) + '%</span>' : '') + (df.effCounterPct > 0 ? ' <span class="chip ok">⚔️ สวนกลับ ' + Math.round(df.effCounterPct * 100) + '%</span>' : '') + (df.allyInterceptActive ? ' <span class="chip g">👑 คุ้มครองสหาย 5.5 ช่อง</span>' : '') + '</div>';
          h += '<button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="demo-defensive-aegis" data-arg="' + esc(n.id) + '">🛡️ สำแดงปราณคุ้มกาย</button>';
          h += '</div>';
          h += '<div class="muted" style="font-size:11.5px;margin-top:4px"><b>จุดเด่นวิชาคุ้มกาย:</b> ' + esc(df.spec.prosTh) + '<br><b>ข้อจำกัด:</b> ' + esc(df.spec.consTh) + '<br><b>สถิติการป้องกัน:</b> สลายดาเมจสะสม ' + Math.round(dSt.totalDamageMitigated || 0) + ' หน่วย · สะท้อน/สวนกลับ ' + Math.round(dSt.totalDamageRedirected || 0) + ' หน่วย · รับเคราะห์แทนสหาย ' + (dSt.totalAllyIntercepts || 0) + ' ครั้ง</div>';
          h += '<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;align-items:center"><span class="muted" style="font-size:11px">ท่าตั้งรับปราณคุ้มกาย:</span>';
          Object.values(CULT.DEFENSIVE_ARTS.POSTURES).forEach(pSpec => {
            h += '<button class="btn' + (df.postureId === pSpec.id ? ' pri' : '') + '" style="padding:2px 7px;font-size:10.5px" data-do="set-npc-defensive-posture" data-arg="' + esc(n.id + '|' + pSpec.id) + '">' + esc(pSpec.icon + ' ' + pSpec.shortTh) + '</button>';
          });
          h += '</div></div>';
        }
      }
      if (CULT.MANTRA_SYSTEM && n.cult) {
        const mr = CULT.MANTRA_SYSTEM.resolveNpcMantra(W, n);
        if (mr && mr.spec) {
          const mSt = n.mantraState || { stance: 'HARMONIOUS_CIRCULATION', resonanceStacks: 0, totalAutonomousGain: 0, totalCombatProcs: 0 };
          h += '<h3>☯️ คัมภีร์ปราณบ่มเพาะและเอกลักษณ์การเดินลมปราณ (Mantra Resonance v5.5.0)</h3><div class="card" style="border-color:' + esc(mr.spec.color || '#ffd166') + '">';
          h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
          h += '<div><span class="chip g" style="border-color:' + esc(mr.spec.color || '#ffd166') + '">' + mr.spec.icon + ' <b>' + esc(mr.spec.nameTh) + '</b></span> <span class="chip b">คัมภีร์: ' + esc(mr.mantraNameTh) + '</span> <span class="chip ok">ตัวคูณเดินปราณ ×' + mr.effectiveCultMult.toFixed(2) + '</span>' + (mr.weatherResonanceActive ? ' <span class="chip g">🌌 สอดคล้องฟ้าดิน (+' + Math.round((mr.spec.weatherBonusPct || 0.2) * 100) + '%)</span>' : '') + '</div>';
          h += '<button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="demo-mantra-resonance" data-arg="' + esc(n.id) + '">☯️ สำแดงวงจรคัมภีร์ปราณ</button>';
          h += '</div>';
          h += '<div class="muted" style="font-size:11.5px;margin-top:4px"><b>เอกลักษณ์คัมภีร์ปราณ:</b> ' + esc(mr.spec.prosTh) + '<br><b>ข้อจำกัดเฉพาะทาง:</b> ' + esc(mr.spec.consTh) + '<br><b>จังหวะปัจจุบัน:</b> ' + esc(mr.stanceSpec.icon + ' ' + mr.stanceSpec.nameTh) + ' — ' + esc(mr.stanceSpec.descTh) + '</div>';
          h += '<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;align-items:center"><span class="muted" style="font-size:11px">เปลี่ยนจังหวะการเดินลมปราณ:</span>';
          Object.values(CULT.MANTRA_SYSTEM.STANCES).forEach(stSpec => {
            h += '<button class="btn' + (mr.stanceId === stSpec.id ? ' pri' : '') + '" style="padding:2px 7px;font-size:10.5px" data-do="set-npc-mantra-stance" data-arg="' + esc(n.id + '|' + stSpec.id) + '">' + esc(stSpec.icon + ' ' + stSpec.shortTh) + '</button>';
          });
          h += '</div></div>';
        }
      }
      if (CULT.QINGGONG && n.cult) {
        const qg = CULT.QINGGONG.resolveNpcMode(W, n);
        const st = CULT.QINGGONG.ensureState(n);
        const cmp = CULT.QINGGONG.compareSwordVsLevitation(W, n);
        const curPref = st.preferredMode || 'AUTO';
        h += '<h3>🌬️ วิชาตัวเบาและการเคลื่อนที่ในสำนัก/ยุทธภพ (Qinggong & Flight)</h3><div class="card" style="border-color:' + esc(qg.spec.color || '#48cae4') + '">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">';
        h += '<div><span class="chip g" style="border-color:' + esc(qg.spec.color || '#48cae4') + '">' + qg.spec.icon + ' <b>' + esc(qg.spec.nameTh) + '</b></span> <span class="chip b">ความเร็วสำนัก ×' + qg.speedMult.toFixed(2) + '</span> <span class="chip">ผลาญปราณ ' + qg.qiCostPerTick.toFixed(2) + '/ทิค</span>' + (qg.airborne ? ' <span class="chip ok">✈️ บินลัดสิ่งกีดขวาง</span>' : '') + (qg.exhaustedFallback ? ' <span class="chip r">⚠️ ปราณต่ำ พักเดินพื้นชั่วคราว</span>' : '') + (qg.weaponPenaltyActive ? ' <span class="chip r">⚠️ ไร้ศาสตรา (ความเร็วกระบี่บินลดลง)</span>' : '') + '</div>';
        h += '<button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="demo-qinggong-flight" data-arg="' + esc(n.id) + '">🚀 ทดสอบเหินเวหา/วิ่งปราณบนแผนที่</button>';
        h += '</div>';
        h += '<div class="muted" style="font-size:11.5px;margin-top:4px"><b>จุดเด่น:</b> ' + esc(qg.spec.prosTh) + '<br><b>ข้อจำกัด:</b> ' + esc(qg.spec.consTh) + '<br><b>สถิติสะสม:</b> เคลื่อนที่ ' + Math.round(st.totalTilesMoved || 0) + ' ช่อง · เหินเวหา ' + Math.round(st.totalTilesFlown || 0) + ' ช่อง · ใช้ปราณสะสม ' + Math.round(st.totalQiSpent || 0) + ' แต้ม</div>';
        h += '<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;align-items:center"><span class="muted" style="font-size:11px">เลือกรูปแบบการเคลื่อนที่:</span>';
        [['AUTO', '⚙️ อัตโนมัติ (ดีสุด)']].concat(qg.unlockedModes.map(mId => [mId, CULT.QINGGONG.MODES[mId].icon + ' ' + CULT.QINGGONG.MODES[mId].shortTh])).forEach(([mKey, mLbl]) => {
          h += '<button class="btn' + (curPref === mKey ? ' pri' : '') + '" style="padding:2px 7px;font-size:10.5px" data-do="set-npc-qinggong-mode" data-arg="' + esc(n.id + '|' + mKey) + '">' + esc(mLbl) + '</button>';
        });
        h += '</div>';
        h += '<details style="margin-top:6px;font-size:11.5px"><summary style="cursor:pointer;color:var(--gold)">⚖️ เปรียบเทียบ「ขี่กระบี่บิน (ขั้น 3+)」กับ「เหาะเหินเดินอากาศเซียนอมตะ (ขั้น 6+)」</summary>';
        h += '<div class="muted" style="padding-top:4px">• <b>' + esc(cmp.swordFlight.nameTh) + ':</b> ความเร็ว ×' + cmp.swordFlight.effectiveSpeedMult.toFixed(2) + ' · กินปราณ ' + cmp.swordFlight.qiCostPerTick + '/ทิค · ' + esc(cmp.swordFlight.drawbacksTh.join(' · ')) + '<br>• <b>' + esc(cmp.celestialLevitation.nameTh) + ':</b> ความเร็ว ×' + cmp.celestialLevitation.effectiveSpeedMult.toFixed(2) + ' · กินปราณเพียง ' + cmp.celestialLevitation.qiCostPerTick + '/ทิค · ' + esc(cmp.celestialLevitation.advantagesTh.join(' · ')) + '</div></details>';
        h += '</div>';
      }
      h += '<h3>กำลังทำอะไร</h3><div class="card"><div style="font-size:15px;font-weight:600">' + esc(actText(n)) + '</div>';
      if (n.why && n.why.length && !n.dead) h += '<div class="muted" style="margin-top:4px">เพราะ:</div><ul class="why" style="margin:2px 0 0 16px;padding:0">' + n.why.map(w => '<li>' + esc(w[0]) + ' <span class="muted">(' + (w[1] > 0 ? '+' : '') + w[1] + ')</span></li>').join('') + '</ul>';
      if (n.lastScores) h += '<div class="muted" style="margin-top:6px">ตัวเลือกที่ชั่งใจ: ' + n.lastScores.slice(0, 5).map(x => (AI.ACTS[x.id] ? AI.ACTS[x.id].nameTh : x.id === 'pair' ? 'พบปะ' : x.id) + ' ' + x.u).join(' · ') + '</div>';
      h += '</div>';
      h += '</div><div class="subcat-pane" data-subcat="MIND"' + ((nSub === 'ALL' || nSub === 'MIND') ? '' : ' style="display:none"') + '>';
      if (g.COG) {
        const mind = g.COG.explain(W, n);
        h += '<h3>หน้าที่และความตั้งใจ</h3><div class="card"><b>' + esc(mind.role) + '</b>' + (mind.delegated ? ' <span class="chip g">รักษาการแทน</span>' : mind.acting ? ' <span class="chip">ผู้ช่วยงาน</span>' : '') + '<div class="muted">' + esc(mind.responsibility) + '</div>';
        if (!n.dead && mind.aspiration) {
          h += '<div style="margin-top:6px">🌟 <b>ปณิธานระยะยาว:</b> ' + esc(mind.aspiration.title) + (mind.aspiration.progress > 0 ? ' <span class="chip ok">สำเร็จ ' + mind.aspiration.progress + ' ขั้น</span>' : '') + '<div class="muted" style="font-size:11.5px">' + esc(mind.aspiration.descTh || '') + (mind.aspiration.reasonTh ? ' (' + esc(mind.aspiration.reasonTh) + ')' : '') + '</div></div>';
        }
        h += '<div style="margin-top:6px">🎯 <b>เป้าหมายปัจจุบัน:</b> ' + esc(n.dead ? 'สิ้นสุดการตัดสินใจแล้ว' : mind.goal?.title || 'ยังไม่มีเป้าหมายระยะกลาง เลือกตามความต้องการและความชอบ') + '</div>';
        if (!n.dead && mind.goal?.stepTitle && mind.goal.stepTitle !== mind.goal.title) {
          h += '<div class="muted" style="font-size:11.5px">↳ ขั้นตอนย่อย: ' + esc(mind.goal.stepTitle) + '</div>';
        }
        if (!n.dead && mind.goal?.blocked) h += '<div class="muted" style="color:var(--gold)">⚠ เงื่อนไขที่ติดขัด: ' + esc(mind.goal.blocked) + '</div>';
        if (!n.dead && mind.bottleneck && mind.bottleneck.active) {
          h += '<div class="muted" style="margin-top:4px;color:var(--gold);font-size:11.5px">🚧 <b>การคลี่คลายคอขวด:</b> ' + esc(mind.bottleneck.explanationTh) + (mind.bottleneck.explanationEn ? ' <span class="muted">(' + esc(mind.bottleneck.explanationEn) + ')</span>' : '') + '</div>';
        }
        if (!n.dead && mind.situational) {
          const sit = mind.situational;
          if (sit.activeCircumstances && sit.activeCircumstances.length) {
            h += '<div class="muted" style="margin-top:4px;font-size:11.5px">🧭 <b>การรับรู้และตอบสนองต่อสถานการณ์:</b> ' + sit.activeCircumstances.map(a => esc(a.summaryTh) + (a.isAddressingNow ? ' <span class="chip ok">กำลังทำ</span>' : '')).join(' · ') + '</div>';
          }
          if (sit.competingPriorities && sit.competingPriorities.length) {
            h += '<div class="muted" style="margin-top:3px;font-size:11.5px">⚖️ <b>ความสำคัญที่แข่งกันอยู่:</b> ' + sit.competingPriorities.map(esc).join(' · ') + '</div>';
          }
          if (sit.practicalBlockers && sit.practicalBlockers.length) {
            h += '<div class="muted" style="margin-top:3px;color:var(--gold);font-size:11.5px">⛔ <b>ข้อจำกัดในทางปฏิบัติ:</b> ' + sit.practicalBlockers.map(esc).join(' · ') + '</div>';
          }
        }
        if (!n.dead && mind.suspendedGoal) h += '<div class="muted" style="font-size:11.5px">⏸ แผนที่พักไว้ชั่วคราว: ' + esc(mind.suspendedGoal.title) + ' (' + esc(mind.suspendedGoal.reason) + ')</div>';
        if (!n.dead && mind.commitment) {
          const partner = W.byId[mind.commitment.partnerId];
          h += '<div class="muted" style="font-size:11.5px">🤝 พันธะสัญญา: นัดหมายกับ ' + esc(partner ? partner.h.name.given : mind.commitment.partnerId) + '</div>';
        }
        if (!n.dead && mind.estimates && mind.estimates.length) {
          h += '<div class="muted" style="margin-top:4px;font-size:11.5px">📐 <b>การคาดการณ์ของเจ้าตัว:</b> ' + mind.estimates.map(esc).join(' · ') + '</div>';
        }
        if (!n.dead && mind.deferenceToMaster) {
          h += '<div class="muted" style="margin-top:4px;font-size:11.5px">🙇 <b>ท่าทีต่อผู้นำสำนัก:</b> ' + esc(mind.deferenceToMaster.summaryTh) + '</div>';
        }
        if (mind.officeDecision) h += '<div class="muted" style="margin-top:6px">พิจารณางานล่าสุด: ' + esc(mind.officeDecision.action) + ' · ' + dayStamp(mind.officeDecision.at) + '</div>';
        h += '</div>';
      }
      h += '</div><div class="subcat-pane" data-subcat="CORE"' + ((nSub === 'ALL' || nSub === 'CORE') ? '' : ' style="display:none"') + '><h3>สถานะ</h3><div class="card">' + bar('พลังชีวิต', s.hp, { max: CULT.hpMax(n), txt: Math.round(s.hp) + '/' + CULT.hpMax(n), wide: true, color: '#e0584a' }) + (n.cult ? bar('ปราณ', s.qi, { max: CULT.qiMax(n), txt: Math.round(s.qi), wide: true, color: '#4fb2f2' }) : '') + bar('อิ่ม', s.satiety, { wide: true }) + bar('พักผ่อน', s.rest, { wide: true }) + bar('แรง', s.energy, { wide: true }) + bar('อารมณ์', clamp(s.mood + 50, 0, 100), { txt: Math.round(s.mood), wide: true }) + bar('เครียด', s.stress, { wide: true, color: s.stress > 60 ? '#e0584a' : '#9aa' }) + bar('สังคม', s.social, { wide: true }) + bar('ความเหงา', s.loneliness, { wide: true, color: '#b58cf0' }) + (s.heartDemon > 1 ? bar('จิตมาร', s.heartDemon, { wide: true, color: '#c33' }) : '') + '</div>';
      if (n.inj && n.inj.length) h += '<div class="card" style="border-color:var(--red)">🩹 ' + n.inj.map(i => esc(i.part) + ' (' + esc(i.why) + ')').join(' · ') + '</div>';
      h += '</div><div class="subcat-pane" data-subcat="COMBAT"' + ((nSub === 'ALL' || nSub === 'COMBAT') ? '' : ' style="display:none"') + '>';
      {
        const ex = g.STATS.explain(n), INFO = g.STATS.INFO; const fmt = (k, v) => k === 'crit' || k === 'pen' ? v.toFixed(1) + '%' : k === 'critDmg' ? Math.round(v) + '%' : Math.round(v);
        h += '<h3>⚔ สเตตัสต่อสู้ <span class="muted" style="font-weight:400">(แตะแต่ละค่าดูที่มา)</span></h3><div class="card">' + g.STATS.KEYS.map(k => {
          const inf = INFO[k], parts = ex.parts[k] || [];
          return '<details style="border-bottom:1px solid var(--line,#3a3f4a);padding:3px 0"><summary style="cursor:pointer;display:flex;justify-content:space-between"><span>' + inf.icon + ' ' + inf.nameTh + '</span><b>' + fmt(k, ex.v[k]) + '</b></summary><div class="muted" style="font-size:12px;padding:2px 0 4px 6px">' + esc(inf.desc) + '<br>' + parts.map(q => '• ' + esc(q[0]) + ' : ' + (q[1] === 'b' ? 'ฐาน ' + Math.round(q[2]) : q[1] === 'p' ? (q[2] >= 0 ? '+' : '') + Math.round(q[2] * 1000) / 10 + '%' : (q[2] >= 0 ? '+' : '') + Math.round(q[2] * 10) / 10)).join('<br>') + '</div></details>';
        }).join('');
        if (g.STATS && g.STATS.purgeExpired) g.STATS.purgeExpired(n, W.t);
        const bf = (n.buffs || []).filter(b => b && b.until > W.t), sx = (n.sx || []).filter(x => x && x.until > W.t);
        const fb = (g.FISHING && g.FISHING.activeFoodBuff) ? g.FISHING.activeFoodBuff(W, n) : null;
        if (bf.length) h += '<div style="margin-top:6px">✨ <b>บัฟและโอสถหนุนนำที่ทำงานอยู่:</b> ' + bf.map(b => '<span class="chip b">' + (b.icon ? b.icon + ' ' : '💊 ') + esc(b.nameTh || b.name || b.id) + ' (เหลือ ' + Math.max(0, Math.round(b.until - W.t)) + ' นาที' + (b.shieldHp > 0 ? ' · เกราะ ' + Math.round(b.shieldHp) : '') + (b.cheatDeath ? ' · คุ้มชีพนิพพาน' : '') + ')</span>').join('') + '</div>';
        if (CULT.isAncestralBlessingActive ? CULT.isAncestralBlessingActive(n, W.t) : (n.ancestralBlessing && (!n.ancestralBlessing.untilDay || n.ancestralBlessing.untilDay >= W.day))) {
          const ab = n.ancestralBlessing;
          h += '<div style="margin-top:6px">🕯️ <span class="chip g">พรบรรพชน「' + esc(ab.elderNameTh) + '」</span> <span class="muted" style="font-size:11.5px">ทะลวงขั้น +' + Math.round((ab.breakthroughBonus || 0) * 100) + '% · เรียนวิชา ×' + (ab.studySpeedMult || 1).toFixed(2) + (ab.injuryShield ? ' · คุ้มครองตบะย้อนกลับ' : '') + '</span></div>';
        }
        if (fb) h += '<div style="margin-top:6px">🍲 <span class="chip ok">' + esc(fb.nameTh) + ' (' + Math.max(0, Math.round(fb.until - W.t)) + ' นาที)</span> <span class="muted" style="font-size:11.5px">' + esc(fb.descTh || '') + '</span></div>';
        if (sx.length) h += '<div style="margin-top:6px">' + sx.map(x => { const S = g.SK.STATUS[x.k]; return S ? '<span class="chip">' + S.icon + ' ' + esc(S.nameTh) + '</span>' : ''; }).join('') + '</div>';
        if (g.COMBAT && g.COMBAT.explainTactics) {
          const tacInfo = g.COMBAT.explainTactics(n);
          if (tacInfo) {
            h += '<div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--line,#3a3f4a);font-size:12px"><b>🎯 เชิงยุทธ์ระยะอาวุธ:</b> <span class="chip b">' + esc(tacInfo.nameTh) + ' (' + esc(tacInfo.reachClass) + ')</span><div class="muted" style="margin-top:2px">' + esc(tacInfo.descTh || '') + ' · แพ้ทาง/แก้ทาง: ' + esc(tacInfo.counteredByTh || '') + '</div>';
            if (tacInfo.lastTacticalEvent && tacInfo.lastTacticalEvent.noteTh) {
              h += '<div style="color:var(--gold);font-size:11.5px;margin-top:2px">⚡ จังหวะยุทธ์ล่าสุด: ' + esc(tacInfo.lastTacticalEvent.noteTh) + '</div>';
            }
            if (tacInfo.resonanceSet && tacInfo.resonanceSet.active) {
              const rs = tacInfo.resonanceSet;
              h += '<div style="margin-top:4px"><span class="chip g">✦ สัจธรรมชุดอุปกรณ์ ' + rs.pieces + '/3</span> <b>' + esc(rs.nameTh) + '</b><div class="muted" style="font-size:11.5px">' + esc(rs.summaryTh) + (rs.rider ? ' · ' + esc(rs.rider.descTh) : '') + '</div></div>';
            }
            if (g.MARTIAL && g.MARTIAL.evaluateLegendaryRelicResonance) {
              const lr = g.MARTIAL.evaluateLegendaryRelicResonance(n);
              if (lr && lr.active) {
                h += '<div style="margin-top:4px"><span class="chip g">👑 ' + esc(lr.tierLabelTh) + '</span>' + (lr.attunedStarsTotal > 0 ? ' <span class="chip v">★ หลอมดาววิญญาณ +' + lr.attunedStarsTotal + '</span>' : '') + '<div class="muted" style="font-size:11.5px">' + esc(lr.summaryTh) + '</div></div>';
              }
            }
            if (g.MARTIAL && g.MARTIAL.evaluateSubEquipmentBonus) {
              const sb = g.MARTIAL.evaluateSubEquipmentBonus(n);
              if (sb && sb.matchedCount > 0) {
                h += '<div style="margin-top:4px"><span class="chip ok">⚔️ อุปกรณ์ตรงสายย่อย ' + sb.matchedCount + '/3 ช่อง</span> <span class="muted" style="font-size:11.5px">' + esc(sb.summaryTh) + '</span></div>';
              }
            }
            h += '</div>';
          }
        }
        h += '</div>';
        if (g.COMBAT && g.COMBAT.ACTION_MASTERY_TRAITS) {
          const ch = g.COMBAT.ACTION_MASTERY_TRAITS.ensureHistory(n);
          const defs = Object.values(g.COMBAT.ACTION_MASTERY_TRAITS.TRAIT_DEFS);
          h += '<h3>⚔️ รอยชำนาญจากพฤติกรรมจริงในสนามรบ (' + ((ch && ch.unlockedTraits.length) || 0) + '/4 เทรต)</h3><div class="card">';
          h += '<div style="display:flex;gap:5px;flex-wrap:wrap">' + defs.map(td => {
            const has = ch && ch.unlockedTraits.includes(td.id);
            const cur = (ch && ch[td.statKey]) || 0;
            return '<span class="chip ' + (has ? 'ok' : '') + '">' + esc(td.icon + ' ' + td.nameTh + ' (' + cur + '/' + td.threshold + ')') + '</span>';
          }).join('') + '</div>';
          h += '</div>';
        }
        if (CULT.MERIDIANS && n.cult) {
          const mSt = CULT.MERIDIANS.ensure(n);
          h += '<h3>🪡 จุดชีพจรพิสดารทั้ง 8 เส้น (' + (mSt.openedCount || 0) + '/8 เส้น)</h3><div class="card">';
          h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">' + CULT.MERIDIANS.ORDER.map(mid => {
            const mSpec = CULT.MERIDIANS.CATALOG[mid];
            const isOpen = !!(mSt.opened && mSt.opened[mid]);
            return '<button class="btn ' + (isOpen ? 'ok' : '') + '" style="padding:2px 7px;font-size:10.5px" data-do="open-meridian" data-arg="' + esc(n.id + '|' + mid) + '">' + (isOpen ? '✦ ' : '🔒 ') + esc(mSpec.nameTh) + '</button>';
          }).join('') + '</div>';
          h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><span class="muted" style="font-size:11px">' + (mSt.allEightOpened ? '🌟 เปิดครบ 8 เส้น: ATK/MATK +8%, Cast +10, ต้านสกัดจุด' : mSt.fourOpened ? '✨ เปิดครบ 4 เส้น: ATK/MATK +4%, Cast +5' : 'กดเลือกเส้นชีพจรเพื่อทะลวงเปิดรับโบนัสเฉพาะทาง') + '</span><button class="btn dan" style="padding:2px 8px;font-size:11px" data-do="trigger-meridian-overdrive" data-arg="' + esc(n.id) + '">⚡ ระเบิดชีพจรพิสดาร (+30% ATK/MATK)</button><button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="enter-closed-door-seclusion" data-arg="' + esc(n.id) + '">🧘 สั่งกักตนปิดด่านทะลวงคอขวด</button></div></div>';
        }
        h += '</div><div class="subcat-pane" data-subcat="MIND"' + ((nSub === 'ALL' || nSub === 'MIND') ? '' : ' style="display:none"') + '>';
        if (CULT.OATH_CATALOG && n.cult && (n.cult.stage || 1) >= 3) {
          const curOath = n.daoOath || (n.ext && n.ext.daoOath);
          const seals = n.daoSeals || (n.ext && n.ext.daoSeals) || [];
          h += '<h3>📜 สัตย์สาบานแห่งมรรคา & ตราประทับเต๋า (' + seals.length + ' ตรา)</h3><div class="card">';
          if (curOath) {
            h += '<div style="margin-bottom:6px"><b>' + esc(curOath.nameTh) + '</b> ' + (curOath.upheld ? '<span class="chip ok">รักษาสัตย์ (+' + Math.round((curOath.cultSpeedBonus || 0.25) * 100) + '% อัตราฝึกปราณ)</span>' : '<span class="chip r">สัตย์สาบานพังทลาย</span>') + '</div>';
          }
          h += '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
            ['VOW_NO_KILL', 'VOW_CHALLENGE_STRONG', 'VOW_PROTECT_JUNIOR', 'VOW_ABSTAIN_PILLS'].map(oid => {
              const oSpec = CULT.OATH_CATALOG[oid];
              return oSpec ? '<button class="btn ' + (curOath && curOath.id === oid && curOath.upheld ? 'pri' : '') + '" style="padding:2px 7px;font-size:10.5px" data-do="bind-dao-oath" data-arg="' + esc(n.id + '|' + oid) + '">📜 ' + esc(oSpec.nameTh) + '</button>' : '';
            }).join('') + '</div>';
          if (seals.length) {
            h += '<div style="margin-top:5px">' + seals.map(s2 => '<span class="chip g">💮 ' + esc(s2.nameTh) + ' (+' + Math.round((s2.btBonus || 0.08) * 100) + '% ทะลวงด่าน)</span>').join(' ') + '</div>';
          }
          h += '</div>';
        }
        if ((Array.isArray(n.destinyThreads) && n.destinyThreads.length) || n.karmicLedger) {
          const ths = n.destinyThreads || [];
          const kl = n.karmicLedger || { virtueKarma: 0, sinKarma: 0, netKarma: 0, aura: 'NEUTRAL' };
          h += '<h3>🧶 ด้ายชะตาสามสี (' + ths.length + '/5) & สมุดบัญชีกรรม</h3><div class="card">';
          h += '<div style="margin-bottom:4px">☯️ <b>กุศลกรรม:</b> +' + Math.round(kl.virtueKarma || 0) + ' · <b>อกุศลกรรม:</b> -' + Math.round(kl.sinKarma || 0) + ' · <b>กรรมสุทธิ:</b> ' + Math.round(kl.netKarma || 0) + ' <span class="chip b">' + esc(kl.aura || 'NEUTRAL') + '</span></div>';
          if (ths.length) {
            h += ths.map(t2 => '<div style="font-size:11.5px;padding:2px 0"><span class="chip ' + (t2.type === 'GOLD_THREAD' ? 'g' : t2.type === 'RED_THREAD' ? 'ok' : 'r') + '">' + esc(t2.nameTh) + '</span> ' + esc(t2.reasonTh || '') + '</div>').join('');
          }
          h += '</div>';
        }
        h += '</div><div class="subcat-pane" data-subcat="PETS"' + ((nSub === 'ALL' || nSub === 'PETS') ? '' : ' style="display:none"') + '>';
        if (CULT.ensurePets) CULT.ensurePets(n);
        if ((Array.isArray(n.pets) && n.pets.length) || (n.cult && n.cult.path === 'BEAST_SOVEREIGN')) {
          const pList = Array.isArray(n.pets) ? n.pets : [];
          const maxP = CULT.maxActivePets ? CULT.maxActivePets(n) : 1;
          const actP = CULT.activePets ? CULT.activePets(n) : pList.filter(p => p && p.active);
          h += '<h3>🐾 สัตว์อสูรพันธสัญญา & สถิตร่างอสูร (' + actP.length + '/' + maxP + ' ตัวที่ออกรบ · ทั้งหมด ' + pList.length + ' ตัว)</h3><div class="card">' + pList.map(p => {
            const gNames = { 1: 'วัยเยาว์ (Juvenile)', 2: 'โตเต็มวัย (Mature)', 3: 'อสูรบรรพกาล (Elder)', 4: 'ราชันย์อสูรจุติ (Sovereign Awakened)' };
            return '<div style="padding:4px 0;border-bottom:1px dotted var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px"><div><b>' + (p.sovereignAwakened ? '👑 ' : '🐾 ') + esc(p.nameTh) + '</b> <span class="chip ' + (p.active ? 'ok' : '') + '">' + (p.active ? 'ร่วมรบ' : 'พักฟื้น') + ' · T' + (p.tier || 1) + '</span> <span class="chip b">' + esc(gNames[p.growthStage || 1] || 'วัยเยาว์') + '</span><div class="muted" style="font-size:11.5px">ความภักดี ' + Math.round(p.loyalty || 0) + '% · ความผูกพัน (Bond) ' + Math.round(p.bond != null ? p.bond : (p.bondXp || 0)) + '</div></div><button class="btn pri" style="padding:2px 7px;font-size:10.5px" data-do="activate-beast-possession" data-arg="' + esc(n.id + '|' + (p.uid || p.id || '')) + '">🐾 ประทับร่างอสูร</button></div>';
          }).join('') + '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><button class="btn ok" style="padding:3px 9px;font-size:11px" data-do="ingest-beast-core" data-arg="' + esc(n.id) + '">🐉 กลืนแก่นอสูรหลอมตันเถียน</button><button class="btn" style="padding:3px 9px;font-size:11px" data-do="activate-beast-possession" data-arg="' + esc(n.id + '|') + '">⚡ สถิตร่างอสูรคู่สัญญา</button></div></div>';
        }
        if (n.cult && (n.cult.path === 'MECH_PUPPET' || n.mechState)) {
          const ms = CULT.ensureMechState ? CULT.ensureMechState(n) : n.mechState;
          if (ms) {
            h += '<h3>⚙️ สถานะหุ่นเชิดกลไกและค่ายกล</h3><div class="card">ความพร้อมหุ่นเชิด: <b>' + Math.round(ms.constructReadiness || 0) + '%</b> · ระดับหุ่นเชิด <b>T' + (ms.puppetTier || 1) + '</b> · โอเวอร์คล็อก: <span class="chip ' + (ms.overclockReady ? 'ok' : '') + '">' + (ms.overclockReady ? 'พร้อมปะทุ' : 'รอชาร์จ') + '</span> · หุ่นสลับร่างคุ้มภัย: <span class="chip ' + (ms.decoyAvailable ? 'g' : '') + '">' + (ms.decoyAvailable ? 'พร้อมทำงาน' : 'ใช้ไปแล้ว') + '</span></div>';
          }
        }
        if (n.cult && (n.cult.path === 'KARMA_SAMSARA' || n.karmaState)) {
          const ks = CULT.ensureKarmaState ? CULT.ensureKarmaState(n) : n.karmaState;
          if (ks) {
            h += '<h3>☸️ บัญชีหนี้กรรมและวัฏสงสาร</h3><div class="card">หนี้กรรมสะสม: <b>' + Math.round(ks.karmicDebt || 0) + ' / ' + Math.round(ks.maxDebt || 500) + '</b> · ท่าทีวัฏจักร: <span class="chip v">' + esc(ks.activeRealmStance || 'HUMAN') + '</span> · กุศลหนุนนำ: <b>' + Math.round(ks.meritStacks || 0) + ' ชั้น</b> · กายาอดีตชาติคุ้มชีพ: <span class="chip ' + (ks.echoReady ? 'g' : '') + '">' + (ks.echoReady ? 'พร้อมจุติ' : 'สงบนิ่ง') + '</span></div>';
          }
        }
        h += '</div><div class="subcat-pane" data-subcat="COMBAT"' + ((nSub === 'ALL' || nSub === 'COMBAT') ? '' : ' style="display:none"') + '>';
        const sl = g.SK.list(n);
        if (sl.length) {
          h += '<h3>วิชาต่อสู้และกระบวนท่าที่ใช้ได้ (' + sl.length + ')</h3><div class="card">' + sl.map(p => {
            const parent = CULT.tech(p.tech || p.id);
            const curStage = (g.SK.unlockedStage && parent) ? g.SK.unlockedStage(n, parent) : 1;
            const maxStage = (parent && Array.isArray(parent.stages) && parent.stages.length) ? parent.stages.length : 1;
            const mastery = (g.SK.masteryPoints && parent) ? g.SK.masteryPoints(n, parent.id) : 0;
            const allM = (g.SK.allMoves && parent && Array.isArray(parent.moveDefs) && parent.moveDefs.length > 1) ? g.SK.allMoves(parent) : [];
            const lockedM = allM.filter(mv => !g.SK.canSelectMove(n, parent, mv.id));
            return '<div style="padding:4px 0;border-bottom:1px solid var(--line,#3a3f4a)"><b>' + esc(p.nameTh) + '</b> ' + gradeChip(parent || p) + ' <span class="muted">(ความชำนาญ ' + mastery + ' · ขั้นวิชา ' + curStage + '/' + maxStage + ')</span><div class="muted" style="font-size:12px">' + esc(p.summary) + '</div>' + (lockedM.length ? '<div class="muted" style="font-size:11px;color:#e8c43a">🔒 กระบวนท่าที่ยังไม่ปลดล็อก: ' + lockedM.map(lm => esc(lm.nameTh) + ' (ขั้นวิชา ' + (lm.stageReq || 1) + '/ชำนาญ ' + (lm.reqMastery || 0) + ')').join(' · ') + '</div>' : '') + '</div>';
          }).join('') + '</div>';
        }
      }
      h += '</div><div class="subcat-pane" data-subcat="CORE"' + ((nSub === 'ALL' || nSub === 'CORE') ? '' : ' style="display:none"') + '><h3>ตบะและพลังรบ</h3><div class="card">';
      const wr = CULT.worldRank ? CULT.worldRank(n) : 0;
      h += '<div><span class="chip b">🌐 แรงค์ยุทธภพสากล: Rank ' + wr + (wr === 0 ? ' (ปุถุชน)' : '') + '</span></div>';
      if (g.ELEM) g.ELEM.ensureNpc(n);
      {
        const rt = n.h.root || {};
        const rootsArr = Array.isArray(rt.roots) ? rt.roots : [];
        const rootChips = rootsArr.map(r => {
          const em = (g.ELEM && g.ELEM.META && g.ELEM.META[r.element]) || { icon: "✦", shortTh: r.element };
          const gf = (g.ELEM && g.ELEM.GRADE_FACTORS && g.ELEM.GRADE_FACTORS[r.grade]) || { shortTh: r.grade };
          return "<span class=\"chip " + (r.grade === "HEAVENLY" ? "g" : r.grade === "TRUE" ? "b" : r.grade === "SPIRIT" ? "ok" : "") + "\">" + em.icon + " " + esc(em.shortTh) + " (" + esc(gf.shortTh) + ")</span>";
        }).join(" ");
        h += "<div style=\"margin-top:6px;padding:6px 8px;border-radius:6px;background:rgba(255,255,255,0.03)\"><div><b>รากวิญญาณกำเนิด (" + (rt.rootCount || 1) + " ราก):</b> " + rootChips + "</div><div class=\"muted\" style=\"font-size:11.5px;margin-top:2px\">ระดับความหายาก: <b style=\"color:var(--gold)\">" + esc(rt.rarityTitleTh || "รากวิญญาณสามัญ") + "</b> · เกรดรวม: <b>" + esc(rt.grade || "MORTAL") + "</b></div></div>";
      }
      if (n.cult) {
        const c = n.cult, pth = CULT.PATHS[c.path]; const sub = CULT.subInfo(c.path, c.sub); h += '<div style="margin-top:4px"><b>' + esc(CULT.stageName(n)) + '</b> · สาย' + esc(sub ? sub.nameTh : c.sub) + '</div>' + bar('ความก้าวหน้า', c.prog / CULT.threshold(n) * 100, { wide: true, txt: Math.round(c.prog) + '/' + CULT.threshold(n), color: pth.color }) + '<div class="muted">พลังรบ ' + Math.round(CULT.power(n)) + ' · อัตราบ่มเพาะ ' + (CULT.rate(n) || 0).toFixed(2) + '/ชม. · อายุขัย ~' + (n.lifespanMax || CULT.lifespan(n)) + ' ปี · รากวิญญาณรวม ' + esc(n.h.root.grade) + '</div>';
        if (c.track) {
          const tr = c.track; const trR = CULT.trackRealm(n); const trTh = CULT.trackThreshold(n); const trGate = CULT.checkTrackGates(W, n);
          h += '<div class="card" style="margin-top:6px;background:rgba(255,255,255,0.03)"><b>🌿 ขั้นสายเฉพาะทาง: ' + esc(trR ? trR.nameTh : '') + ' (ลำดับ ' + tr.ordinal + '/9)</b>' + (trTh !== Infinity ? bar('ความก้าวหน้าสายเฉพาะ', tr.prog / trTh * 100, { wide: true, txt: Math.round(tr.prog) + '/' + trTh, color: '#7fd1b9' }) : '') + '<div class="muted">เทียบเคียงขั้นหลัก: <b>' + (trR ? trR.majorBandEquivalent.toFixed(1) : '') + '</b> · พลังรบเฉพาะทางเทียบเคียง: <b>' + (trR ? trR.functionalCombatPower : '') + ' CP</b></div><div style="font-size:12px;margin-top:2px">' + (tr.ordinal >= 9 ? '<span class="chip ok">บรรลุขั้น 9 สูงสุดแล้ว</span>' : trGate.ok ? '<span class="chip ok">✔ ผ่านเกณฑ์ทักษะและศิลา พร้อมทะลวงขั้นถัดไป</span>' : '<span class="chip r">🔒 ' + esc(trGate.reason) + '</span>') + '</div></div>';
        }
        if (c.bn || c.found || c.failN) { const tr = g.BN.treasureOf(c); h += '<div class="card" style="margin-top:6px"><b>🚧 คอขวด</b>' + (c.bn ? ' · แผน: <b>' + (c.bn.plan === 'go' ? 'ลุยทะลวง' : 'รอเตรียมตัว') + '</b> (' + esc(c.bn.why || '') + ')' : '') + '<div class="muted">ฐานตกผลึก +' + Math.round((c.found || 0) * 100) + '% · ประสบการณ์ล้มเหลว +' + Math.round((c.failExp || 0) * 100) + '% (ล้ม ' + (c.failN || 0) + ' ครั้ง)' + (c.toxic > 5 ? ' · พิษโอสถ ' + Math.round(c.toxic) : '') + '</div>' + (tr ? '<div class="muted">ด่านใหญ่ต้องใช้ ✦' + esc(tr.nameTh) + ' — ' + (c.treasure === tr.id ? 'มีแล้ว (+16%)' : 'ยังไม่มี (−30%)') + '</div>' : '') + '<div class="muted">โอสถเฉพาะขั้น: ' + esc(ECO.name(g.BN.pillKey(c))) + (g.BN.heldPill(n) ? ' (ถืออยู่)' : '') + '</div></div>'; }
        if (c.mantra) { const mt = CULT.tech(c.mantra); h += '<div class="muted">คัมภีร์หลัก: ' + esc((mt || {}).nameTh || '') + ' ' + gradeChip(mt) + '</div>'; }
        if (c.techs.length) h += '<div style="margin-top:4px">' + c.techs.map(id => { const t2 = CULT.tech(id); return '<span class="chip b">' + esc((t2 || {}).nameTh || id) + (t2 && t2.grade ? ' (' + esc((JD.MARTIAL?.GRADES?.[t2.grade]?.nameTh) || t2.grade) + ')' : '') + '</span>'; }).join('') + '</div>';
        if (c.learning) h += '<div class="muted">กำลังศึกษา: ' + esc((CULT.tech(c.learning.id) || {}).nameTh) + ' ' + Math.round(c.learning.got / c.learning.need * 100) + '%</div>';
        if (CULT.ensurePathGauge) {
          const pg = CULT.ensurePathGauge(n);
          if (pg) {
            h += '<div style="margin-top:6px">' + bar('⚡ เกจเอกลักษณ์: ' + pg.nameTh, (pg.value || 0) / Math.max(1, pg.max || 100) * 100, { wide: true, txt: Math.round(pg.value || 0) + '/' + (pg.max || 100) + (pg.ready ? ' (พร้อมสำแดงท่าไม้ตาย!)' : ''), color: pth.color || '#ffd166' }) + '</div>';
          }
        }
        if (CULT.GRAND_DAO_MECHANICS && CULT.GRAND_DAO_MECHANICS.getActiveTraits) {
          const trObj = CULT.GRAND_DAO_MECHANICS.getActiveTraits(n);
          if (trObj && trObj.allTraits && trObj.allTraits.length) {
            h += '<div style="margin-top:6px"><div class="muted" style="font-size:11.5px">✦ <b>คุณสมบัติขั้นวิถีและสายย่อยที่ตื่นรู้ (' + trObj.allTraits.length + '):</b></div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px">' + trObj.allTraits.map(rt => '<span class="chip g" title="' + esc(rt.descTh || '') + '">✦ ' + esc(rt.nameTh) + '</span>').join('') + '</div></div>';
          }
        }
      } else {
        const mc = (CULT.MORTAL_INITIATION && CULT.MORTAL_INITIATION.ensureMortalState) ? CULT.MORTAL_INITIATION.ensureMortalState(n, W) : { qiFoundation: 0, daoComprehension: 0, targetPath: 'XIAN' };
        const tPathDef = (mc && mc.targetPath && CULT.PATHS[mc.targetPath]) ? CULT.PATHS[mc.targetPath] : CULT.PATHS.XIAN;
        h += '<div class="muted" style="margin-bottom:4px">ยังเป็นปุถุชน (กำลังเตรียมเปิดเส้นลมปราณสู่ <b>' + esc(tPathDef ? tPathDef.nameTh : 'วิถีเซียน') + '</b>) · พลังรบ ' + Math.round(CULT.power(n)) + '</div>';
        h += bar('📖 ความเข้าใจคัมภีร์วิถี (Dao Comprehension)', mc.daoComprehension || 0, { wide: true, txt: Math.round(mc.daoComprehension || 0) + '/100', color: '#a78bfa' });
        h += bar('🌅 รากฐานปราณเปิดตันเถียน (Qi Foundation)', mc.qiFoundation || 0, { wide: true, txt: Math.round(mc.qiFoundation || 0) + '/100 (เต็ม 100 ทะลวงสู่ขั้นกลั่นลมปราณ)', color: '#38bdf8' });
      }
      const eq = Object.keys(n.equip || {}).filter(k => n.equip[k]); if (eq.length) h += '<div style="margin-top:4px">' + eq.map(k => '<span class="chip g">' + esc(n.equip[k].nameTh) + ' · ' + esc(g.MARTIAL.TYPES[g.MARTIAL.gearType(n.equip[k])]) + '</span>').join('') + '</div>';
      h += '</div>';
      h += '<div style="margin:8px 0;display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="btn" data-do="npc" data-arg="' + n.id + '|bag">🎒 เปิดถุงสัมภาระ</button>' +
        '<button class="btn" data-do="npc" data-arg="' + n.id + '|tech">⚔️ วิชา/วรยุทธ์ (' + (n.cult ? n.cult.techs.length : 0) + ')</button>' +
        '<button class="btn" data-do="npc" data-arg="' + n.id + '|sub">🌿 สายย่อย/ทะลวงด่าน' + (n.cult && n.cult.track ? ' (ขั้น ' + n.cult.track.ordinal + ')' : '') + '</button>' +
      '</div>';
      const mObj = W.byId[n.mentorId || n.mentor];
      const discList = Array.from(new Set([].concat(n.disciples || [], n.apprenticeIds || [], (n.h.life.family && n.h.life.family.disciples) || []))).map(i => W.byId[i]).filter(Boolean);
      const compObj = (n.companionId && W.byId[n.companionId]) || (n.h.life.family.spouse && W.byId[n.h.life.family.spouse]) || null;
      const parentObjs = Array.from(new Set([].concat(n.parentIds || [], (n.h.life && n.h.life.family && n.h.life.family.parents) || []))).map(i => W.byId[i]).filter(Boolean);
      const childObjs = Array.from(new Set((n.h.life && n.h.life.family && n.h.life.family.children) || [])).map(i => W.byId[i]).filter(Boolean);
      h += '<h3>ในสำนัก</h3><div class="card"><div class="grid2"><div>ระดับ: <b>' + SECT.title(n) + '</b></div><div>เข้าสำนัก: ' + Math.max(0, Math.round(W.day - n.joinDay)) + ' วันก่อน</div><div>ผลงานสะสม: ' + Math.round(n.merit) + '</div><div>พอใจสำนัก: ' + Math.round(n.sat == null ? 60 : n.sat) + '</div><div>ศิลาส่วนตัว: ' + Math.round(n.inv.stones) + '</div><div>โชค: ' + Math.round(n.h.destiny.luck) + '</div></div>' +
        (mObj ? '<div>อาจารย์สายตรง: ' + nameLink(mObj) + '</div>' : '') +
        (compObj ? '<div style="margin-top:3px">💞 <b>คู่บำเพ็ญร่วมสาบาน:</b> ' + nameLink(compObj) + ' <span class="chip ok">ฝึกปราณคู่ +' + Math.round((n.companionSynergyBonus || 0.25) * 100) + '%</span> <button class="btn" style="padding:1px 6px;font-size:10.5px" data-do="practice-dual-cultivation" data-arg="' + n.id + '|' + compObj.id + '">💞 โคจรปราณคู่</button></div>' : '') +
        (parentObjs.length ? '<div>👨‍👩‍👧 บิดามารดาผู้ให้กำเนิด: ' + parentObjs.map(nameLink).join(' & ') + '</div>' : '') +
        (childObjs.length ? '<div>👶 ทายาทสายเลือด (' + childObjs.length + '): ' + childObjs.map(nameLink).join('、') + '</div>' : '') +
        (discList.length ? '<div>ศิษย์สายตรง (' + discList.length + '): ' + discList.map(nameLink).join('、') + '</div>' : '') +
        (n.stats && (n.stats.kills || n.stats.sparWin) ? '<div class="muted">สถิติ: สังหาร ' + (n.stats.kills || 0) + ' · ประลองชนะ ' + (n.stats.sparWin || 0) + ' แพ้ ' + (n.stats.sparLoss || 0) + '</div>' : '') + '</div>';
      if (n.peakId || n.isIndependentFromPeak || n.isElder) {
        h += '<h3>🏔️ สังกัดยอดเขา · ศักดิ์ผู้อาวุโส & สถานะในสำนัก</h3><div class="card" style="border-color:var(--gold)">';
        if (n.peakId && W.sect && W.sect.peaks && W.sect.peaks.byId[n.peakId]) {
          const pkObj = W.sect.peaks.byId[n.peakId];
          const roleLabel = n.peakRole === 'MASTER' ? '👑 ผู้นำยอดเขา (ศักดิ์เทียบเท่ารองเจ้าสำนัก)' : n.peakRole === 'DEPUTY' ? '⚜️ รองผู้นำยอดเขา' : '🏔️ สมาชิกประจำยอดเขา';
          h += '<div><b>' + esc(pkObj.icon || '🏔️') + ' ' + esc(pkObj.nameTh) + '</b> <span class="chip g">' + roleLabel + '</span> <span class="chip ok">รับปราณยอดเขาเร่งตบะ +14% & ส่วนแบ่งทรัพยากรหุบเขา</span></div>';
        } else if (n.isIndependentFromPeak) {
          h += '<div><b>🍃 ผู้บำเพ็ญอิสระไร้สังกัดยอดเขา</b> <span class="chip r">ตบะช้าลง -12% · ไม่ได้รับงบจัดสรรหุบเขา</span><div class="muted" style="font-size:11px;margin-top:2px">' + esc(n.independentDrawbackSummaryTh || 'เลือกเดินวิถีอิสระไม่สังกัดยอดเขา') + '</div></div>';
        }
        if (n.rank >= 4 || n.isElder) {
          h += '<div style="margin-top:4px"><span class="chip b">🎖️ สถานะผู้อาวุโส: ' + esc(n.elderTitleTh || 'ผู้อาวุโสสำนัก') + '</span> <span class="muted" style="font-size:11px">(มีสิทธิ์ออกเสียงในสภาสำนักและการเลือกศิษย์สืบทอดแม้ไม่ถือตำแหน่งบริหารส่วนกลาง)</span></div>';
        }
        h += '</div>';
      }
      h += '</div><div class="subcat-pane" data-subcat="LINEAGE"' + ((nSub === 'ALL' || nSub === 'LINEAGE') ? '' : ' style="display:none"') + '>';
      if (n.bloodlineTrait || (n.h && n.h.bloodline)) {
        const bl = n.bloodlineTrait || n.h.bloodline;
        h += '<h3>🧬 สายเลือดตระกูลและรากปราณสืบทอด</h3><div class="card" style="border-color:var(--gold)"><div><b>' + esc(bl.nameTh || ('สายเลือดตระกูล' + (bl.clanSurnameTh || ''))) + '</b> ' + (bl.isMutatedRoot ? '<span class="chip v">✦ ' + esc(bl.mutatedRootNameTh || bl.mutatedElement) + '</span>' : '<span class="chip g">สายเลือดผู้ฝึกตน</span>') + '</div><div class="muted" style="font-size:11.5px;margin-top:3px">โบนัสอัตราบ่มเพาะสายเลือด +' + Math.round((bl.cultRateBonus || 0.18) * 100) + '% · พลังรบ +' + Math.round((bl.combatPowerBonus || 0.12) * 100) + '% · โอกาสทะลวงด่าน +' + Math.round((bl.btBonus || 0.06) * 100) + '%</div></div>';
      }
      h += '</div><div class="subcat-pane" data-subcat="MIND"' + ((nSub === 'ALL' || nSub === 'MIND') ? '' : ' style="display:none"') + '>';
      if ((Array.isArray(n.heartDemons) && n.heartDemons.length) || (Array.isArray(n.daoScars) && n.daoScars.length)) {
        const activeKnots = (n.heartDemons || []).filter(k => k && !k.resolved);
        const scars = n.daoScars || [];
        h += '<h3>🪷 ปมมารในใจและตราแจ้งชัดแห่งเต๋า (ปมค้าง ' + activeKnots.length + ' · ตราเต๋า ' + scars.length + ')</h3><div class="card">';
        if (activeKnots.length) {
          h += activeKnots.map(k => '<div style="padding:4px 0;border-bottom:1px dotted var(--line,#3a3f4a);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div><b>' + esc(k.icon || '💔') + ' ' + esc(k.nameTh) + '</b> <span class="chip r">ความรุนแรง ' + k.severity + '</span><div class="muted" style="font-size:11.5px">ที่มา: ' + esc(k.originEventTh) + '</div></div><div style="display:flex;gap:4px"><button class="btn pri" style="padding:2px 7px;font-size:11px" data-do="counsel-heart-demon" data-arg="' + esc(n.id) + '|' + esc(k.id) + '">🪷 ชี้แนะคลายปม</button>' + (n.cult && n.cult.path === 'DEMON' ? '<button class="btn dan" style="padding:2px 7px;font-size:11px" data-do="devour-heart-demon" data-arg="' + esc(n.id) + '|' + esc(k.id) + '">🔥 กลืนกินมาร</button>' : '') + '</div></div>').join('');
        }
        if (scars.length) {
          h += '<div style="margin-top:4px">' + scars.map(sc => '<div style="padding:3px 0"><span class="chip ok">✦ ' + esc(sc.nameTh) + '</span> <span class="muted" style="font-size:11.5px">(คลี่คลายโดย ' + esc(sc.counselorNameTh || '-') + ' · ทะลวงด่าน +' + Math.round((sc.btBonus || 0.06) * 100) + '%)</span></div>').join('') + '</div>';
        }
        h += '</div>';
      }
      h += '</div><div class="subcat-pane" data-subcat="COMBAT"' + ((nSub === 'ALL' || nSub === 'COMBAT') ? '' : ' style="display:none"') + '>';
      if (n.equip && n.equip.WEAPON) {
        const wpn = n.equip.WEAPON;
        const ws = wpn.weaponSpirit;
        h += '<h3>🗡️ จิตวิญญาณศาสตราคู่กาย</h3><div class="card">';
        if (ws) {
          h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><div><b>' + esc(ws.spiritNameTh) + '</b> <span class="chip g">ขั้นที่ ' + ws.stage + ' · ' + esc(ws.stageNameTh) + '</span> <span class="chip b">โบนัสศาสตรา +' + Math.round((ws.multBonus || 0.05) * 100) + '%</span><div class="muted" style="font-size:11.5px">นิสัยจิตศาสตรา: ' + esc(ws.personalityTh) + ' · ผ่านศึก ' + (ws.battlesFought || 1) + ' ครั้ง · ปราณศึกสะสม ' + (ws.spiritXp || 0) + ' XP' + (ws.formerOwners && ws.formerOwners.length ? (' · สืบทอดจาก ' + ws.formerOwners.map(fo => esc(fo.nameTh)).join(' ➔ ')) : '') + '</div></div><button class="btn" style="padding:2px 8px;font-size:11px" data-do="awaken-weapon-spirit" data-arg="' + esc(n.id) + '">🔥 ขัดเกลาจิตศาสตรา</button></div>';
        } else {
          h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><span class="muted">ศาสตรา「' + esc(wpn.nameTh) + '」ยังไม่ตื่นรู้จิตวิญญาณ</span><button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="awaken-weapon-spirit" data-arg="' + esc(n.id) + '">🗡️ ปลุกจิตวิญญาณศาสตรา</button></div>';
        }
        h += '</div>';
      }
      h += '</div><div class="subcat-pane" data-subcat="LINEAGE"' + ((nSub === 'ALL' || nSub === 'LINEAGE') ? '' : ' style="display:none"') + '>';
      if (n.renegadeOrigin || (n.h && n.h.renegadeOrigin)) {
        const ro = n.renegadeOrigin || n.h.renegadeOrigin;
        const canReclaim = n.cult && n.cult.stage >= 5 && ro.pursuitStatus !== 'RECLAIMED_THRONE';
        h += '<h3>🗡️ ประวัติผู้ลี้ภัยข้ามสำนัก & หนี้แค้นบัลลังก์</h3><div class="card" style="border-color:var(--gold)"><div><b>' + esc(ro.formerPostTh || 'อดีตศิษย์ลี้ภัย') + ' แห่ง「' + esc(ro.sectNameTh || '') + '」</b> <span class="chip b">สถานะ: ' + esc(ro.pursuitStatus || 'PROTECTED') + '</span> <span class="chip ok">ความซาบซึ้ง ' + Math.round(ro.gratitude || 0) + '</span></div><div class="muted" style="font-size:11.5px;margin-top:3px">เมื่อบ่มเพาะตบะถึงขั้น 5 ขึ้นไป สามารถนำทัพสำนักเรากลับไปโค่นล้มเจ้าสำนักผู้ทรยศและสถาปนาสำนักเดิมเป็นพันธมิตรร่วมสาบานนิรันดร์ได้</div>' + (ro.pursuitStatus !== 'RECLAIMED_THRONE' ? '<div style="margin-top:6px"><button class="btn ' + (canReclaim ? 'pri' : '') + '" style="padding:3px 9px;font-size:11.5px" data-do="launch-vendetta-reclamation" data-arg="' + esc(n.id) + '">🔥 เปิดศึกทวงคืนสำนัก「' + esc(ro.sectNameTh || 'เดิม') + '」</button></div>' : '') + '</div>';
      }
      if (SECT.MENTORSHIP && n.cult) {
        h += '<h3>🎓 สายสืบทอดอาจารย์-ศิษย์ & ปราณต้นกำเนิด</h3><div class="card">';
        h += '<details class="lineage-chronicle"><summary>📜 ประวัติสายสืบทอดของคนนี้</summary>' + UI.lineageHistory(W, n.id) + '</details>';
        h += '<details class="lineage-chronicle"><summary>🌳 ผังอาจารย์–ศิษย์ที่เกี่ยวข้อง</summary>' + UI.lineageTree(W,n.id) + '</details>';
        if (n.mentorImprint) {
          const impTech = n.mentorImprint.inheritedTechNameTh || (n.mentorImprint.inheritedTechId && (CULT.tech(n.mentorImprint.inheritedTechId) || {}).nameTh) || '';
          h += '<div style="margin-bottom:4px"><span class="chip g">✦ รากฐานที่ได้รับการถ่ายทอด</span> จาก <b>' + esc(n.mentorImprint.mentorNameTh || 'อาจารย์') + '</b> · เร่งบ่มเพาะ +' + Math.round(((n.mentorImprint.cultSpeedBonus || n.mentorImprint.cultRateBonus || 0.12)) * 100) + '% · ทะลวงด่าน +' + Math.round(((n.mentorImprint.breakthroughBonus || n.mentorImprint.btBonus || 0.08)) * 100) + '%' + (impTech ? ' · สืบทอด「' + esc(impTech) + '」' : '') + '</div>';
        }
        if (mObj && !mObj.dead) {
          h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:4px"><span>อาจารย์ปัจจุบัน: ' + nameLink(mObj) + '</span><div style="display:flex;gap:4px"><button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="coach-disciple" data-arg="' + mObj.id + '|' + n.id + '">🎓 ขอรับการชี้แนะ</button>' + ((mObj.cult && !mObj.qiTransmitted && (CULT.equivalentStage ? CULT.equivalentStage(mObj) : mObj.cult.stage) >= 4) ? '<button class="btn" style="padding:3px 8px;font-size:11px" data-do="transmit-qi" data-arg="' + mObj.id + '|' + n.id + '">✨ รับการถ่ายทอดปราณ</button>' : '') + '</div></div>';
        } else if (!mObj) {
          const potMentor = W.npcs.filter(x => !x.dead && !x.exiled && x.id !== n.id && x.cult && x.cult.stage >= (n.cult.stage || 1) + 1 && (x.rank >= 3 || x.cult.stage >= 3) && (!Array.isArray(x.disciples) || x.disciples.length < 3)).sort((a, b) => ((b.cult.path === n.cult.path ? 50 : 0) + b.cult.stage * 10) - ((a.cult.path === n.cult.path ? 50 : 0) + a.cult.stage * 10))[0];
          if (potMentor) {
            h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><span>ยังไม่มีอาจารย์สายตรง (แนะนำ: ' + nameLink(potMentor) + ')</span><button class="btn pri" style="padding:3px 8px;font-size:11px" data-do="form-mentor-bond" data-arg="' + potMentor.id + '|' + n.id + '">🙇 ฝากตัวเป็นศิษย์</button></div>';
          } else {
            h += '<div class="muted">ยังไม่มีอาจารย์สายตรงที่เหมาะสมในขณะนี้</div>';
          }
        }
        if (discList.length) {
          h += '<div style="margin-top:6px;border-top:1px dotted var(--line,#3a3f4a);padding-top:4px"><b>ศิษย์ในปกครอง (' + discList.length + '/3):</b></div>';
          discList.forEach(dNpc => {
            h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;gap:6px;flex-wrap:wrap"><span>' + nameLink(dNpc) + ' <span class="muted">(' + esc(CULT.stageName(dNpc)) + ')</span></span><div style="display:flex;gap:4px"><button class="btn pri" style="padding:2px 7px;font-size:11px" data-do="coach-disciple" data-arg="' + n.id + '|' + dNpc.id + '">🎓 ชี้แนะวิชา</button>' + (!n.qiTransmitted && (CULT.equivalentStage ? CULT.equivalentStage(n) : n.cult.stage) >= 4 ? '<button class="btn" style="padding:2px 7px;font-size:11px" data-do="transmit-qi" data-arg="' + n.id + '|' + dNpc.id + '">✨ ถ่ายทอดปราณ</button>' : '') + '</div></div>';
          });
        }
        h += '</div>';
      }
      if (SECT.JIANGHU && W.world && W.world.jianghu) {
        const rawB = Array.isArray(W.world.jianghu.bonds) ? W.world.jianghu.bonds : Object.values(W.world.jianghu.karmaBonds || {});
        const myBonds = rawB.filter(b => b && b.active !== false && (b.npcId === n.id || b.memberId === n.id));
        if (myBonds.length) {
          h += '<h3>☯️ สายสัมพันธ์คุณธรรมและความแค้นในยุทธภพ (' + myBonds.length + ')</h3><div class="card">';
          myBonds.forEach(b => {
            const isAlly = b.kind === 'SWORN_ALLY' || b.kind === 'BENEFACTOR';
            const figName = b.figureNameTh || b.npcNameTh || 'จอมยุทธ์ยุทธภพ';
            h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;gap:6px;flex-wrap:wrap"><div><span class="chip ' + (isAlly ? 'ok' : 'r') + '">' + (isAlly ? '🤝 สหายร่วมสาบาน' : '🩸 คู่อาฆาต') + '</span> <b>' + esc(figName) + '</b> <span class="muted">(' + esc(b.sectNameTh || '') + ' · พลัง ' + b.power + ' CP)</span></div><div>' + (isAlly ? '<button class="btn pri" style="padding:2px 7px;font-size:11px" data-do="ally-aid" data-arg="' + esc(b.id) + '">🤝 ขอแรงหนุน</button>' : '<button class="btn dan" style="padding:2px 7px;font-size:11px" data-do="challenge-nemesis" data-arg="' + esc(b.id) + '|">⚔️ ดวลชี้ขาด</button>') + '</div></div>';
          });
          h += '</div>';
        }
      }
      const authRecipes = Array.from(new Set(n.recipes || [])).map(id => ECO.recipeById[id]).filter(Boolean);
      if (authRecipes.length) h += '<h3>📖 ตำรับที่ได้รับสิทธิ์ศึกษา</h3><div class="card">' + authRecipes.map(r => '<span class="chip ok">' + esc(r.nameTh) + ' (' + esc(r.outNameTh) + ')</span>').join('') + '</div>';
      h += '<h3>รูปลักษณ์</h3><div class="card muted">' + esc(HC.appearanceText(n)) + '</div>';
      h += '</div><div class="subcat-pane" data-subcat="PETS"' + ((nSub === 'ALL' || nSub === 'PETS' || UI.bagSelKey) ? '' : ' style="display:none"') + '>' + renderPersonalBagSection(W, n) + '</div>';
    } else if (tab === 'bag') {
      h += renderPersonalBagSection(W, n);
    } else if (tab === 'tech') {
      h += renderTechTab(W, n);
    } else if (tab === 'sub') {
      h += renderSubTab(W, n);
    } else if (tab === 'self') {
      h += '<div class="muted">แถบสีขาว = ค่ากำเนิด · แถบสี = ค่าปัจจุบัน (รวมผลฝึก/อายุ/นิสัยพิเศษ)</div><h3>คุณค่าชีวิต 8 (และความอิ่มเอมของแต่ละข้อ)</h3><div class="card">' + HC.layerIds('values').map(id => bar(AI.VALUE_TH[id] || HC.nameOf('values.' + id), HC.eff(n, 'values.' + id), { wide: true, mark: n.h.fulfil[id], tip: HC.nameOf('values.' + id) })).join('') + '<div class="muted">ขีดขาว = ความอิ่มเอมตอนนี้ (ต่ำ → อยากทำสิ่งนั้น)</div></div>';
      h += '<h3>บุคลิกภาพ 14</h3><div class="card">' + statLayer(n, 'personality') + '</div><h3>อารมณ์พื้นฐาน</h3><div class="card">' + statLayer(n, 'temperament') + '</div>';
      const ints = HC.layerIds('interests').map(id => [id, HC.eff(n, 'interests.' + id)]).sort((a, b) => b[1] - a[1]); h += '<h3>สิ่งที่ชอบ (เรียงจากมากสุด)</h3><div class="card">' + ints.slice(0, 12).map(i => bar(HC.nameOf('interests.' + i[0]), i[1], { wide: true })).join('') + '</div>';
      h += '<h3>พรสวรรค์ 6</h3><div class="card">' + statLayer(n, 'aptitudes') + '</div>';
      h += '<h3>จุดเด่น/ข้อจำกัด</h3><div class="card">' + ((n.h.traits || []).length ? n.h.traits.map(t => { const d = HC.traitDef(t.id); return d ? '<div><span class="chip ' + (d.isCurse ? 'r' : 'g') + '">' + esc(d.nameTh) + '</span><span class="muted">' + esc(d.descTh || '') + '</span></div>' : ''; }).join('') : '<span class="muted">ไม่มีลักษณะพิเศษ</span>') + '<div class="muted" style="margin-top:6px">รสนิยม: ชอบ' + esc(n.h.tastes.food) + ' · ' + esc(n.h.tastes.drink) + ' · สี' + esc(n.h.tastes.color) + ' · ' + esc(n.h.tastes.pastime) + ' · การผูกพัน: ' + esc(n.h.attachment) + '</div></div>';
    } else if (tab === "elem") {
      if (g.ELEM) g.ELEM.ensureNpc(n);
      const rt = n.h.root || {};
      const sys = (n.ext && n.ext.elementalSystem) || { mastery: {}, specialMastery: {}, specialAccess: {}, dailyGainLog: { byElement: {} } };
      const capTraitDef = (rt.rootCapacityTrait && HC.traitDef(rt.rootCapacityTrait)) || { nameTh: "เอกรากวิญญาณ (1 ราก)", descTh: "ผู้ถือครองรากวิญญาณสายเดียว" };
      h += "<h3>1. รากวิญญาณกำเนิดและระดับความหายาก</h3><div class=\"card\">";
      h += "<div style=\"display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px\"><div><b>" + esc(capTraitDef.nameTh) + "</b> <span class=\"chip g\">" + (rt.rootCount || 1) + " รากวิญญาณ</span></div><div><span class=\"chip b\">" + esc(rt.rarityBand || "COMMON") + " · " + esc(rt.rarityTitleTh || "") + "</span></div></div>";
      h += "<div class=\"muted\" style=\"margin-top:4px\">เกรดรากวิญญาณรวม (Conservative Aggregate): <b>" + esc(rt.grade || "MORTAL") + "</b> (คะแนนรวม " + (rt.aggregateScore || 2).toFixed(2) + ") · โอกาสพบตามธรรมชาติ ~1 ใน " + (rt.expectedCharacters || rt.expectedBirths || 3) + " ตัวละครที่ถูกสร้าง (" + (rt.expectedWorldYears || 0.1) + " ปีโลก)</div>";
      h += "<div style=\"margin-top:8px;display:grid;gap:6px\">";
      (rt.roots || []).forEach((r, idx) => {
        const em = (g.ELEM && g.ELEM.META[r.element]) || { icon: "✦", nameTh: r.element, color: "#6ddfb5", descTh: "" };
        const gf = (g.ELEM && g.ELEM.GRADE_FACTORS[r.grade]) || { nameTh: r.grade, combat: 1, cult: 1, study: 1 };
        const affVal = Math.round(HC.eff(n, "affinities." + r.element));
        h += "<div style=\"padding:6px 8px;border:1px solid var(--line,#3a3f4a);border-radius:6px\"><div style=\"display:flex;justify-content:space-between;align-items:center\"><span><b>รากที่ " + (idx + 1) + (idx === 0 ? " (รากหลัก)" : " (รากรอง)") + ":</b> " + em.icon + " <b>" + esc(em.nameTh) + "</b></span><span class=\"chip " + (r.grade === "HEAVENLY" ? "g" : r.grade === "TRUE" ? "b" : r.grade === "SPIRIT" ? "ok" : "") + "\">" + esc(gf.nameTh) + " (" + esc(r.grade) + ")</span></div><div class=\"muted\" style=\"font-size:11.5px;margin-top:2px\">ตัวคูณราก: ยุทธ์ ×" + gf.combat.toFixed(2) + " · บำเพ็ญ ×" + gf.cult.toFixed(2) + " · ศึกษา ×" + gf.study.toFixed(2) + " · ความถนัดธาตุกำเนิด " + affVal + "/100</div></div>";
      });
      h += "</div></div>";

      h += "<h3>2. ความเข้าใจธาตุจากการปฏิบัติจริง (Trainable Elemental Mastery)</h3><div class=\"card\"><div class=\"muted\" style=\"margin-bottom:6px\">เพิ่มขึ้นเฉพาะเมื่อลงมือฝึกวิชา โคจรปราณ ศึกษาคัมภีร์ ใช้กระบวนท่า หรือหลอมสร้างจริง (เพดานรายวัน " + (g.ELEM ? g.ELEM.MAX_DAILY_GAIN : 2.5) + " แต้ม/ธาตุ)</div>";
      (g.ELEM ? g.ELEM.ORDINARY_ELEMENTS : []).forEach(el => {
        const em = g.ELEM.META[el] || { icon: "•", nameTh: el, color: "#4fb2f2" };
        const direct = +(sys.mastery && sys.mastery[el] || 0).toFixed(1);
        const effM = +(g.ELEM.effectiveMastery(n, el) || 0).toFixed(1);
        const today = +((sys.dailyGainLog && sys.dailyGainLog.byElement && sys.dailyGainLog.byElement[el]) || 0).toFixed(2);
        const hasRoot = Array.isArray(rt.elements) && rt.elements.includes(el);
        h += bar(em.icon + " " + em.nameTh + (hasRoot ? " ★" : ""), direct, { wide: true, color: em.color, txt: direct + " (ใช้จริง " + effM + (today > 0 ? " · วันนี้ +" + today : "") + ")" });
      });
      h += "<div style=\"margin-top:8px;padding-top:6px;border-top:1px solid var(--line,#3a3f4a)\"><b>ธาตุพิเศษ (Special Elements — ไม่เกิดเป็นรากวิญญาณสามัญ):</b></div>";
      (g.ELEM ? g.ELEM.SPECIAL_ELEMENTS : []).forEach(el => {
        const em = g.ELEM.META[el] || { icon: "✦", nameTh: el, color: "#b197fc" };
        const direct = +(sys.specialMastery && sys.specialMastery[el] || 0).toFixed(1);
        const effM = +(g.ELEM.effectiveMastery(n, el) || 0).toFixed(1);
        const acc = (sys.specialAccess && sys.specialAccess[el]) || { unlocked: false, affinity: 25, sources: [] };
        h += "<div style=\"margin-top:4px\"><div style=\"display:flex;justify-content:space-between;font-size:12px\"><span>" + em.icon + " <b>" + esc(em.nameTh) + "</b></span><span class=\"chip " + (acc.unlocked ? "ok" : "") + "\">" + (acc.unlocked ? "ปลดล็อกแล้ว (ความเชื่อมโยง " + acc.affinity + ")" : "ยังไม่เปิดช่องทางธาตุพิเศษ") + "</span></div>" + bar("ความเข้าใจ " + em.shortTh, direct, { wide: true, color: em.color, txt: direct + " (ใช้จริง " + effM + ")" }) + (acc.sources && acc.sources.length ? "<div class=\"muted\" style=\"font-size:11px\">ที่มา: " + esc(acc.sources.join(", ")) + "</div>" : "") + "</div>";
      });
      h += "</div>";

      h += "<h3>3. ความเข้ากันได้ของวิถี วิชา และศาสตราปัจจุบัน</h3><div class=\"card\">";
      if (n.cult && g.ELEM) {
        const c = n.cult;
        const subObj = c.sub && c.sub !== "NONE" ? CULT.subInfo(c.path, c.sub) : CULT.PATHS[c.path];
        if (subObj) {
          const exSub = g.ELEM.explainCompatibility(n, subObj, "CULTIVATION_TICK");
          h += "<div style=\"padding:4px 0;border-bottom:1px solid var(--line,#3a3f4a)\"><b>วิถี/สายย่อย (" + esc(subObj.nameTh || c.path) + "):</b> " + esc(exSub.summaryTh) + " · อัตราบำเพ็ญ ×" + exSub.cultivationMultiplier.toFixed(2) + "</div>";
        }
        if (c.mantra) {
          const mt = CULT.tech(c.mantra);
          if (mt) {
            const exM = g.ELEM.explainCompatibility(n, mt, "MANTRA_PRACTICE");
            h += "<div style=\"padding:4px 0;border-bottom:1px solid var(--line,#3a3f4a)\"><b>คัมภีร์ปราณ (" + esc(mt.nameTh) + "):</b> " + esc(exM.summaryTh) + " · บำเพ็ญ ×" + exM.cultivationMultiplier.toFixed(2) + " · ทะลวงด่าน " + (exM.breakthroughBonus >= 0 ? "+" : "") + Math.round(exM.breakthroughBonus * 100) + "%</div>";
          }
        }
        (c.techs || []).forEach(tid => {
          const t = CULT.tech(tid);
          if (!t) return;
          const exT = g.ELEM.explainCompatibility(n, t, "COMBAT_SKILL");
          const exL = g.ELEM.resolveCompatibility(n, t, "TECH_STUDY");
          h += "<div style=\"padding:4px 0;border-bottom:1px solid var(--line,#3a3f4a)\"><b>วิชา「" + esc(t.nameTh) + "」:</b> " + esc(exT.summaryTh) + " · ปราณ ×" + exT.qiCostMultiplier.toFixed(2) + " · เรียนรู้ ×" + exL.studySpeedMultiplier.toFixed(2) + "</div>";
        });
      } else {
        h += "<div class=\"muted\">ยังเป็นปุถุชน ยังไม่มีวิถีหรือวิชาที่ฝึก</div>";
      }
      ["WEAPON", "ARMOR", "ACCESSORY"].forEach(slot => {
        const eq = n.equip && n.equip[slot];
        if (!eq || !g.ELEM) return;
        const exEq = g.ELEM.explainCompatibility(n, eq, "EQUIPMENT");
        h += "<div style=\"padding:4px 0;border-bottom:1px solid var(--line,#3a3f4a)\"><b>อุปกรณ์ " + slot + "「" + esc(eq.nameTh) + "」:</b> " + esc(exEq.elementIcon + " " + exEq.elementShortTh + " · " + exEq.tierTh) + " (ความสอดคล้อง ×" + exEq.equipmentSynergyMultiplier.toFixed(2) + ")</div>";
      });
      h += "</div>";
    } else if (tab === "body") {
      const elemAffKeys = (g.ELEM && g.ELEM.AFFINITY_GROUPS && g.ELEM.AFFINITY_GROUPS.ELEMENTAL) || ["FIRE", "WATER_ICE", "LIGHTNING", "WIND", "EARTH_METAL", "WOOD_LIFE", "YIN_SHADOW", "LIGHT_YANG"];
      const nonElemAffKeys = (g.ELEM && g.ELEM.AFFINITY_GROUPS && g.ELEM.AFFINITY_GROUPS.NON_ELEMENTAL) || HC.AFF_ALL.filter(k => !elemAffKeys.includes(k));
      h += "<div class=\"muted\">ขีดขาวคือค่ากำเนิด · แสดงความถนัดครบทั้ง 23 ด้านจากฐานข้อมูลเดียวกัน (h.affinities)</div><div class=\"card\">" + statLayer(n, "physiology") + "</div>";
      h += "<h3>ความถนัดธาตุทั้ง 8 (Elemental Affinities 8)</h3><div class=\"card\">" + elemAffKeys.map(k => {
        const em = (g.ELEM && g.ELEM.META && g.ELEM.META[k]) || { icon: "", color: "#4fb2f2" };
        return bar((em.icon ? em.icon + " " : "") + (HC.AFF_TH[k] || k), HC.eff(n, "affinities." + k), { wide: true, mark: n.h.affinities[k], color: em.color });
      }).join("") + "</div>";
      h += "<h3>ความถนัดศาสตราและศาสตร์ทั้ง 15 (Martial & Craft Affinities 15)</h3><div class=\"card\">" + nonElemAffKeys.map(k => {
        return bar(HC.AFF_TH[k] || k, HC.eff(n, "affinities." + k), { wide: true, mark: n.h.affinities[k] });
      }).join("") + "</div>";
      h += "<h3>รูปร่าง</h3><div class=\"card muted\">" + esc(HC.appearanceText(n)) + "</div>";
    } else if (tab === 'mind') {
      h += '<h3>สติปัญญา</h3><div class="card">' + statLayer(n, 'intellect') + '</div><h3>ทักษะสังคม</h3><div class="card">' + statLayer(n, 'social') + '</div>';
    } else if (tab === 'skill') {
      h += '<div class="muted">ค่าทักษะคือฝีมือที่ฝึกไว้ถาวร · ผลเสริมจากวิถีแสดงแยกและหายเมื่อเปลี่ยนสาย</div>' + UI.martialSkills(W, n);
    } else if (tab === 'rel') {
      const rs = Object.keys(n.h.mind.relations).map(id => ({ id, r: n.h.mind.relations[id], o: W.byId[id] })).filter(x => x.o).sort((a, b) => Math.abs(b.r.a) + b.r.l * .3 - Math.abs(a.r.a) - a.r.l * .3);
      h += rs.length ? rs.slice(0, 40).map(x => {
        const ri = (g.COG && g.COG.relInfo) ? g.COG.relInfo(W, n, x.id) : null;
        return '<div class="prow" data-npc="' + x.id + '">' + portraitHtml(x.o, 36) + '<div class="pi"><div class="nm">' + esc(HC.fullName(x.o)) + (x.r.bond ? ' <span class="chip ' + (x.r.bond === 'ศัตรู' ? 'r' : 'g') + '">' + esc(x.r.bond) + '</span>' : '') + (x.o.dead ? ' ☠' : '') + '</div><div class="sub">ถูกชะตา ' + Math.round(x.r.a) + ' · นับถือ ' + Math.round(x.r.r) + (ri && ri.trust !== 40 ? ' · ไว้ใจ ' + Math.round(ri.trust) : '') + (ri && ri.gratitude > 2 ? ' · กตัญญู ' + Math.round(ri.gratitude) : '') + (ri && ri.fear > 5 ? ' · ยำเกรง ' + Math.round(ri.fear) : '') + (x.r.l > 5 ? ' · รัก ' + Math.round(x.r.l) : '') + (x.r.v > 10 ? ' · ขัดแย้ง ' + Math.round(x.r.v) : '') + ' · พบกัน ' + x.r.n + ' ครั้ง</div></div></div>';
      }).join('') : '<div class="muted">ยังไม่คุ้นเคยกับใครเป็นพิเศษ</div>';
    } else if (tab === 'life') {
      h += '<h3>ความทรงจำสำคัญ</h3><div class="card">' + (n.h.mind.memories.slice().sort((a, b) => b.w - a.w).slice(0, 10).map(m => '<div class="logrow"><span class="tm">' + dayStamp(m.t) + '</span>' + esc(m.text) + '</div>').join('') || '<span class="muted">—</span>') + '</div>';
      h += '<h3>ประวัติ</h3><div class="card">' + (n.h.life.bio.slice().reverse().slice(0, 50).map(b => '<div class="logrow"><span class="tm">ปี' + (Math.floor(b.d / 360) + 1) + ' ด.' + (Math.floor(b.d % 360 / 30) + 1) + '</span>' + linkify(W, b.text, [n.id]) + '</div>').join('') || '<span class="muted">ยังไม่มีเหตุการณ์สำคัญ</span>') + '</div>';
    } else if (tab === 'cmp') {
      const others = W.npcs.filter(o => !o.dead && o !== n).sort((a, b) => b.rank - a.rank); if (!UI.cmpId || !W.byId[UI.cmpId] || UI.cmpId === n.id) UI.cmpId = others[0] ? others[0].id : null; const o = UI.cmpId ? W.byId[UI.cmpId] : null;
      h += '<div class="muted" style="margin-bottom:6px">เปรียบเทียบ “ตัวตน” ครบทั้ง 155 มิติของมนุษย์ เพื่อดูว่า A ต่างจาก B ตรงไหน</div><select id="npcSel">' + others.map(x => '<option value="' + x.id + '"' + (x.id === UI.cmpId ? ' selected' : '') + '>' + esc(HC.fullName(x)) + ' (' + SECT.title(x) + ')</option>').join('') + '</select>';
      if (o) {
        const c = HC.compare(n, o); const pCmp = CULT.compareFunctionalPower(n, o); h += '<div class="card" style="margin-top:8px;text-align:center"><div style="font-size:26px;font-weight:700;color:var(--gold)">คล้ายกัน ' + c.similarity + '%</div><div class="muted">' + esc(HC.fullName(n)) + ' เทียบกับ ' + esc(HC.fullName(o)) + '</div><div style="margin-top:6px;font-size:13px"><b>การประเมินพลังรบเชิงการทำงาน (Functional Power):</b><br><span style="color:var(--gold)">' + esc(pCmp.assessmentTh) + '</span><br><span class="muted">' + esc(pCmp.a.label) + ' (' + pCmp.powerA + ' CP) เทียบกับ ' + esc(pCmp.b.label) + ' (' + pCmp.powerB + ' CP) · อัตราส่วน ' + pCmp.ratio + ' เท่า</span></div></div>';
        h += '<h3>ต่างกันมากที่สุด</h3><div class="card">' + c.topDiffs.slice(0, 8).map(d => { const def = HC.STAT_DEFS.find(s => s.path === d.path); const va = HC.eff(n, d.path), vb = HC.eff(o, d.path); return '<div style="margin:5px 0"><b>' + esc(def ? def.nameTh : d.path) + '</b> <span class="muted">' + esc(HC.LAYER_TH[def ? def.layer : ''] || '') + '</span>' + bar(esc(n.h.name.given), va, { wide: true, color: '#4fb2f2' }) + bar(esc(o.h.name.given), vb, { wide: true, color: '#f0714f' }) + '</div>'; }).join('') + '</div>';
        h += '<h3>คล้ายกันที่สุด</h3><div class="card">' + c.topAlike.slice(0, 5).map(d => { const def = HC.STAT_DEFS.find(s => s.path === d.path); return '<span class="chip ok">' + esc(def ? def.nameTh : d.path) + '</span>'; }).join('') + '</div>';
        h += '<h3>ต่างกันรายหมวด</h3><div class="card">' + c.layers.map(l => bar(l.layerTh, Math.min(100, l.diff / 2 * 100), { wide: true, txt: l.diff.toFixed(2), color: '#b58cf0' })).join('') + '</div>';
      }
    }
    return h;
  };

  /* ---------- PHASE 2 & ELEMENTAL OVERHAUL: SHARED EDIT HUB (UI.rEdit) ---------- */
  UI.collectEditDraftFromDom = () => {
    const body = $("shBody");
    if (!body || !UI.G || !UI.G.W) return null;
    const W = UI.G.W;
    const n = W.byId[UI.editNpcId];
    if (!n) return null;
    if (g.ELEM) g.ELEM.ensureNpc(n);
    const d = UI.editDraft || { cult: {}, economy: {}, state: {} };
    const pathEl = body.querySelector("#editCultPath");
    const subEl = body.querySelector("#editCultSub");
    const stageEl = body.querySelector("#editCultStage");
    const xpEl = body.querySelector("#editCultXp");
    if (pathEl) d.cult.path = pathEl.value;
    if (subEl) d.cult.sub = subEl.value;
    if (stageEl) d.cult.stage = +stageEl.value;
    if (xpEl) d.cult.xp = +xpEl.value;
    const trOrdEl = body.querySelector("#editTrackOrdinal");
    if (trOrdEl) d.cult.trackOrdinal = +trOrdEl.value;

    const stEl = body.querySelector("#editStones");
    const cpEl = body.querySelector("#editCp");
    const merEl = body.querySelector("#editMerit");
    const satEl = body.querySelector("#editSat");
    if (stEl) d.economy.stones = +stEl.value;
    if (cpEl) d.economy.cp = +cpEl.value;
    if (merEl) d.economy.merit = +merEl.value;
    if (satEl) d.economy.sat = +satEl.value;

    // Collect spiritual root edits
    const rcEl = body.querySelector("#editRootCount");
    if (rcEl && g.ELEM) {
      const k = clamp(Math.floor(+rcEl.value || 1), 1, 4);
      const prevEls = (d.root && Array.isArray(d.root.elements)) ? d.root.elements : (n.h.root ? n.h.root.elements.slice() : ["FIRE"]);
      const prevGrs = (d.root && Array.isArray(d.root.grades)) ? d.root.grades : (n.h.root ? n.h.root.grades.slice() : ["MORTAL"]);
      const elements = [];
      const grades = [];
      for (let i = 0; i < k; i++) {
        const elSel = body.querySelector("#editRootEl_" + i);
        const grSel = body.querySelector("#editRootGrade_" + i);
        let pickedEl = elSel ? elSel.value : (prevEls[i] || g.ELEM.ORDINARY_ELEMENTS.find(e => !elements.includes(e)) || "FIRE");
        elements.push(pickedEl);
        grades.push(grSel ? grSel.value : (prevGrs[i] || "MORTAL"));
      }
      d.root = {
        rootCount: k,
        rootCapacityTrait: g.ELEM.ROOT_CAPACITY_TRAITS[k] || "ROOT_CAPACITY_SINGLE",
        elements,
        grades
      };
    }

    // Collect trainable elemental mastery & special element unlocks
    const mastInputs = body.querySelectorAll("[data-edit-mastery]");
    if (mastInputs.length) {
      d.elemental = d.elemental || { mastery: {}, specialMastery: {}, specialAccess: {} };
      mastInputs.forEach(inp => {
        const el = inp.dataset.editMastery;
        const val = clamp(+inp.value || 0, 0, 100);
        if (g.ELEM && g.ELEM.isValidSpecialElement(el)) {
          d.elemental.specialMastery[el] = val;
        } else {
          d.elemental.mastery[el] = val;
        }
      });
    }
    const specUnlockInputs = body.querySelectorAll("[data-edit-spec-unlock]");
    if (specUnlockInputs.length) {
      d.elemental = d.elemental || { mastery: {}, specialMastery: {}, specialAccess: {} };
      specUnlockInputs.forEach(chk => {
        const el = chk.dataset.editSpecUnlock;
        d.elemental.specialAccess[el] = !!chk.checked;
      });
    }

    body.querySelectorAll("[data-edit-stat]").forEach(inp => {
      const [grp, key] = inp.dataset.editStat.split(".");
      d[grp] = d[grp] || {};
      d[grp][key] = +inp.value;
    });
    UI.editDraft = d;
    return d;
  };

  UI.updateEditPreviewDom = () => {
    const body = $("shBody");
    if (!body || !UI.G || !UI.G.W) return;
    const W = UI.G.W;
    const prevEl = body.querySelector("#editLivePreview");
    if (!prevEl || !UI.editNpcId) return;
    const draft = UI.editDraft || {};
    const prev = SECT.EDITOR.previewCharacterEdit(W, UI.editNpcId, draft);
    if (!prev.ok) {
      prevEl.innerHTML = "<span style=\"color:var(--red)\">⚠️ " + esc(prev.reason) + "</span>";
    } else {
      const recNotes = (prev.reconciled.notes || []).concat(prev.reconciled.unequippedGear.length ? ["ถอดอุปกรณ์ที่ไม่รองรับเข้าคลัง: " + prev.reconciled.unequippedGear.join(", ")] : []);
      prevEl.innerHTML = "<b>ผลคำนวณหลังแก้ไข:</b> " + esc(prev.after.stageName) +
        " · รากปราณ <b>" + (prev.after.rootCount || 1) + " ราก (" + esc(prev.after.aggregateGrade || "MORTAL") + " · " + esc(prev.after.rarityTitleTh || "") + ")</b>" +
        " · พลังชีวิตสูงสุด <b>" + prev.after.hpMax + "</b> (เดิม " + prev.before.hpMax + ")" +
        " · ปราณสูงสุด <b>" + prev.after.qiMax + "</b> (เดิม " + prev.before.qiMax + ")" +
        " · พลังรบ <b>" + prev.after.combatPower + "</b> (เดิม " + prev.before.combatPower + ")" +
        " · อัตราบ่มเพาะ <b>" + (prev.after.cultRate || 0) + "/ชม.</b> (เดิม " + (prev.before.cultRate || 0) + "/ชม.)" +
        (recNotes.length ? "<div class=\"muted\" style=\"color:var(--gold)\">หมายเหตุ: " + esc(recNotes.join(" · ")) + "</div>" : "");
    }
  };

  UI.applyCharEditFromDom = () => {
    const W = UI.G.W;
    const draft = UI.collectEditDraftFromDom();
    if (!draft || !UI.editNpcId) return;
    const res = SECT.EDITOR.applyCharacterEdit(W, UI.editNpcId, draft);
    if (!res.ok) {
      UI.toast("แก้ไขไม่สำเร็จ: " + res.reason);
      return;
    }
    if (UI.G && UI.G.R && UI.G.R.invalidate) UI.G.R.invalidate();
    UI.toast("บันทึกการแก้ไขของ " + W.byId[UI.editNpcId].h.name.given + " สำเร็จ");
    UI.editDraft = null;
    UI.render();
    UI.updateHud(true);
  };

  UI.rEdit = () => {
    const W = UI.G.W, tab = UI.tab || "char";
    const members = W.npcs.filter(n => !n.dead && !n.exiled).sort((a, b) => b.rank - a.rank);
    if (!UI.editNpcId || !W.byId[UI.editNpcId] || W.byId[UI.editNpcId].dead) {
      UI.editNpcId = members[0] ? members[0].id : W.sect.masterId;
    }
    const n = W.byId[UI.editNpcId];
    if (n && g.ELEM) g.ELEM.ensureNpc(n);
    let h = "<div class=\"card\"><b>ตัวละครเป้าหมาย:</b><select id=\"editNpcSel\" style=\"margin-top:4px\">" + members.map(x => "<option value=\"" + x.id + "\"" + (x.id === UI.editNpcId ? " selected" : "") + ">" + esc(HC.fullName(x)) + " (" + SECT.title(x) + " · " + CULT.stageName(x) + ")</option>").join("") + "</select>";
    if (n) {
      const st = SECT.EDITOR.memberEditState(W, n);
      if (st.warnings && st.warnings.length) {
        h += "<div class=\"muted\" style=\"margin-top:4px;color:var(--gold)\">⚠️ " + esc(st.warnings.join(" · ")) + "</div>";
      }
      h += "<div style=\"margin-top:6px;display:flex;gap:6px;flex-wrap:wrap\"><button class=\"btn\" data-do=\"npc\" data-arg=\"" + n.id + "\">👤 เปิดหน้าข้อมูลตัวละคร</button><button class=\"btn\" data-do=\"heal-char-edit\">✨ ฟื้นฟู/รักษาเต็ม</button>" + (Array.isArray(W._editUndoStack) && W._editUndoStack.length ? "<button class=\"btn\" data-do=\"undo-char-edit\">↩️ ย้อนคืนการแก้ไขล่าสุด (" + W._editUndoStack.length + ")</button>" : "") + "</div>";
    }
    h += "</div>";

    if (tab === "char" && n) {
      const d = UI.editDraft || {};
      const curPath = (d.cult && d.cult.path) || (n.cult ? n.cult.path : "MORTAL");
      const pathDef = CULT.PATHS[curPath];
      const maxStage = pathDef ? pathDef.maxStage : 0;
      const curStage = (d.cult && d.cult.stage !== undefined) ? clamp(d.cult.stage, 0, maxStage) : (n.cult ? Math.min(n.cult.stage, maxStage || 1) : 0);
      const validSubs = pathDef ? pathDef.subPaths : [];
      const curSub = (d.cult && d.cult.sub !== undefined) ? d.cult.sub : (n.cult ? n.cult.sub : "NONE");
      const curXp = (d.cult && d.cult.xp !== undefined) ? d.cult.xp : (n.cult ? Math.round(n.cult.prog || 0) : 0);

      const eCharSub = UI.editCharSubTab || 'CULT_ECON';
      const editCharTabs = [
        ['CULT_ECON', '🧘 วิถีตบะ & ทรัพยากร'],
        ['ROOTS_ELEM', '🌿 รากวิญญาณ & ธาตุ'],
        ['STATS', '📊 ค่าพื้นฐาน 9 หมวด'],
        ['ALL', '📋 ดูทั้งหมด']
      ];
      h += renderSubTabBar('set-edit-char-subtab', eCharSub, editCharTabs, 'หมวดย่อยแก้ไขตัวละคร');
      h += '<div class="subcat-pane" data-subcat="CULT_ECON"' + ((eCharSub === 'ALL' || eCharSub === 'CULT_ECON') ? '' : ' style="display:none"') + '>';
      h += "<h3>1. วิถีบำเพ็ญ ขั้นตบะ และทรัพยากรส่วนตัว</h3><div class=\"card\"><div class=\"edit-grid\">";
      h += "<div class=\"edit-field\"><label>วิถีหลัก</label><select id=\"editCultPath\" class=\"edit-live-input\"><option value=\"MORTAL\"" + (curPath === "MORTAL" ? " selected" : "") + ">ปุถุชน (ไร้ตบะ)</option>" + Object.keys(CULT.PATHS).map(pid => "<option value=\"" + pid + "\"" + (curPath === pid ? " selected" : "") + ">" + esc(CULT.PATHS[pid].nameTh) + " (สูงสุดขั้น " + CULT.PATHS[pid].maxStage + ")</option>").join("") + "</select></div>";
      h += "<div class=\"edit-field\"><label>สายย่อย</label><select id=\"editCultSub\" class=\"edit-live-input\"><option value=\"NONE\">พื้นฐาน (ยังไม่เลือกสายย่อย)</option>" + validSubs.map(s => "<option value=\"" + s.id + "\"" + (curSub === s.id ? " selected" : "") + ">" + esc(s.nameTh) + "</option>").join("") + "</select></div>";
      h += "<div class=\"edit-field\"><label>ขั้นตบะ (0–" + maxStage + ")</label><input id=\"editCultStage\" class=\"edit-live-input\" type=\"number\" min=\"0\" max=\"" + maxStage + "\" value=\"" + curStage + "\"></div>";
      h += "<div class=\"edit-field\"><label>แต้มตบะสะสม (XP)</label><input id=\"editCultXp\" class=\"edit-live-input\" type=\"number\" min=\"0\" max=\"500000\" value=\"" + curXp + "\"></div>";
      h += "<div class=\"edit-field\"><label>บันไดขั้นเฉพาะทาง (Ordinal 1–9 หรือ 0 = ปิด)</label><input id=\"editTrackOrdinal\" class=\"edit-live-input\" type=\"number\" min=\"0\" max=\"9\" value=\"" + (n && n.cult && n.cult.track ? n.cult.track.ordinal : 0) + "\"></div>";
      h += "<div class=\"edit-field\"><label>ศิลาส่วนตัว</label><input id=\"editStones\" class=\"edit-live-input\" type=\"number\" min=\"0\" max=\"999999\" value=\"" + Math.round((d.economy && d.economy.stones !== undefined) ? d.economy.stones : (n.inv.stones || 0)) + "\"></div>";
      h += "<div class=\"edit-field\"><label>แต้มคุณูปการ (คป.)</label><input id=\"editCp\" class=\"edit-live-input\" type=\"number\" min=\"0\" max=\"999999\" value=\"" + Math.round((d.economy && d.economy.cp !== undefined) ? d.economy.cp : (n.cp || 0)) + "\"></div>";
      h += "<div class=\"edit-field\"><label>ผลงานสะสม (Merit)</label><input id=\"editMerit\" class=\"edit-live-input\" type=\"number\" min=\"0\" max=\"999999\" value=\"" + Math.round((d.economy && d.economy.merit !== undefined) ? d.economy.merit : (n.merit || 0)) + "\"></div>";
      h += "<div class=\"edit-field\"><label>ความพึงพอใจ (0–100)</label><input id=\"editSat\" class=\"edit-live-input\" type=\"number\" min=\"0\" max=\"100\" value=\"" + Math.round((d.economy && d.economy.sat !== undefined) ? d.economy.sat : (n.sat == null ? 60 : n.sat)) + "\"></div>";
      h += "</div></div>";

      h += '</div><div class="subcat-pane" data-subcat="ROOTS_ELEM"' + ((eCharSub === 'ALL' || eCharSub === 'ROOTS_ELEM') ? '' : ' style="display:none"') + '>';
      // Spiritual Roots & Elemental Mastery Editor
      if (g.ELEM) {
        const curRoot = d.root || n.h.root || { rootCount: 1, elements: ["FIRE"], grades: ["MORTAL"] };
        const k = clamp(Number(curRoot.rootCount || (curRoot.elements && curRoot.elements.length) || 1), 1, 4);
        const curEls = (curRoot.elements || ["FIRE"]).slice();
        const curGrs = (curRoot.grades || ["MORTAL"]).slice();
        while (curEls.length < k) {
          const nextEl = g.ELEM.ORDINARY_ELEMENTS.find(e => !curEls.includes(e)) || "FIRE";
          curEls.push(nextEl);
        }
        while (curGrs.length < k) curGrs.push("MORTAL");

        h += "<h3>2. รากวิญญาณกำเนิด (1–4 ราก) และความเข้าใจธาตุ</h3><div class=\"card\">";
        h += "<div class=\"muted\" style=\"margin-bottom:6px\">กำหนดจำนวนรากวิญญาณ (1–4 ราก ตามลักษณะความจุรากวิญญาณ Option A · ไม่มีระบบ 5 ราก) พร้อมระบุธาตุสามัญไม่ซ้ำกันและเกรดของแต่ละรากโดยอิสระ</div>";
        h += "<div class=\"edit-grid\">";
        h += "<div class=\"edit-field\"><label>ความจุรากวิญญาณ (1–4 ราก)</label><select id=\"editRootCount\" class=\"edit-live-input\">" +
          [[1, "1 ราก · เอกรากวิญญาณ (ROOT_CAPACITY_SINGLE)"], [2, "2 ราก · กายาทวิรากวิญญาณ (TR_ROOT_CAPACITY_DUAL)"], [3, "3 ราก · กายาตรีรากวิญญาณ (TR_ROOT_CAPACITY_TRIPLE)"], [4, "4 ราก · กายาจตุรธาตุบรรพกาล (TR_ROOT_CAPACITY_FOURFOLD)"]].map(([cnt, lbl]) => "<option value=\"" + cnt + "\"" + (k === cnt ? " selected" : "") + ">" + lbl + "</option>").join("") +
          "</select></div>";
        for (let i = 0; i < k; i++) {
          h += "<div class=\"edit-field\"><label>ธาตุรากที่ " + (i + 1) + (i === 0 ? " (หลัก)" : "") + "</label><select id=\"editRootEl_" + i + "\" class=\"edit-live-input\">" +
            g.ELEM.ORDINARY_ELEMENTS.map(el => "<option value=\"" + el + "\"" + (curEls[i] === el ? " selected" : "") + ">" + g.ELEM.META[el].icon + " " + esc(g.ELEM.META[el].nameTh) + " (" + el + ")</option>").join("") +
            "</select></div>";
          h += "<div class=\"edit-field\"><label>เกรดรากที่ " + (i + 1) + "</label><select id=\"editRootGrade_" + i + "\" class=\"edit-live-input\">" +
            g.ELEM.GRADE_ORDER.map(gId => "<option value=\"" + gId + "\"" + (curGrs[i] === gId ? " selected" : "") + ">" + esc(g.ELEM.GRADE_FACTORS[gId].nameTh) + " (" + gId + ")</option>").join("") +
            "</select></div>";
        }
        h += "</div>";

        const sys = (n.ext && n.ext.elementalSystem) || { mastery: {}, specialMastery: {}, specialAccess: {} };
        h += "<div style=\"margin-top:8px;padding-top:6px;border-top:1px solid var(--line,#3a3f4a)\"><b>ความเข้าใจธาตุจากการฝึกฝน (Elemental Mastery 0–100):</b></div><div class=\"edit-grid\" style=\"margin-top:4px\">";
        g.ELEM.ORDINARY_ELEMENTS.forEach(el => {
          const mVal = (d.elemental && d.elemental.mastery && d.elemental.mastery[el] !== undefined)
            ? d.elemental.mastery[el]
            : Math.round(((sys.mastery && sys.mastery[el]) || 0) * 10) / 10;
          h += "<div class=\"edit-field\"><label>" + g.ELEM.META[el].icon + " " + esc(g.ELEM.META[el].shortTh) + " (0–100)</label><input type=\"number\" step=\"0.5\" min=\"0\" max=\"100\" class=\"edit-live-input\" data-edit-mastery=\"" + el + "\" value=\"" + mVal + "\"></div>";
        });
        g.ELEM.SPECIAL_ELEMENTS.forEach(el => {
          const smVal = (d.elemental && d.elemental.specialMastery && d.elemental.specialMastery[el] !== undefined)
            ? d.elemental.specialMastery[el]
            : Math.round(((sys.specialMastery && sys.specialMastery[el]) || 0) * 10) / 10;
          const isUnl = (d.elemental && d.elemental.specialAccess && d.elemental.specialAccess[el] !== undefined)
            ? !!d.elemental.specialAccess[el]
            : !!(sys.specialAccess && sys.specialAccess[el] && sys.specialAccess[el].unlocked);
          h += "<div class=\"edit-field\"><label>" + g.ELEM.META[el].icon + " " + esc(g.ELEM.META[el].shortTh) + " (ธาตุพิเศษ 0–100)</label><input type=\"number\" step=\"0.5\" min=\"0\" max=\"100\" class=\"edit-live-input\" data-edit-mastery=\"" + el + "\" value=\"" + smVal + "\"><label style=\"font-size:11px;margin-top:2px;display:flex;align-items:center;gap:4px\"><input type=\"checkbox\" class=\"edit-live-input\" data-edit-spec-unlock=\"" + el + "\"" + (isUnl ? " checked" : "") + "> ปลดล็อกวิถีธาตุพิเศษ</label></div>";
        });
        h += "</div></div>";
      }

      const grp = UI.editStatGroup || "personality";
      const grpSpec = SECT.EDITOR.EDITABLE_GROUPS[grp] || SECT.EDITOR.EDITABLE_GROUPS.personality;
      const grpLabels = {
        personality: "บุคลิกภาพ (Personality 14)",
        values: "คุณค่าชีวิต (Values 8)",
        interests: "ความสนใจ (Interests 24)",
        aptitudes: "พรสวรรค์ (Aptitudes 6)",
        affinities: "ความถนัดทั้ง 23 ด้าน (Affinities: 8 ธาตุ + 15 ศาสตร์)",
        physiology: "สรีระและรากฐานกาย (Physiology 22)",
        intellect: "สติปัญญา (Intellect 18)",
        social: "ทักษะสังคม (Social 7)",
        skills: "ทักษะยุทธ์และวิชาชีพ (Skills 26)"
      };
      h += '</div><div class="subcat-pane" data-subcat="STATS"' + ((eCharSub === 'ALL' || eCharSub === 'STATS') ? '' : ' style="display:none"') + '>';
      h += "<h3>3. ค่าพื้นฐานและความถนัดตัวละคร (คำนวณ HP/Qi/พลังรบอัตโนมัติ)</h3><div class=\"card\">";
      h += "<select id=\"editStatGroupSel\" style=\"margin-bottom:8px\">" + Object.keys(grpLabels).map(gk => "<option value=\"" + gk + "\"" + (grp === gk ? " selected" : "") + ">" + grpLabels[gk] + "</option>").join("") + "</select>";
      h += "<div class=\"edit-grid\">";
      grpSpec.keys.forEach(k => {
        const curVal = (d[grp] && d[grp][k] !== undefined) ? d[grp][k] : Math.round((n.h[grp] && n.h[grp][k]) || 0);
        const label = grp === "affinities" ? (HC.AFF_TH[k] || k) : (HC.nameOf(grp + "." + k) || k);
        h += "<div class=\"edit-field\"><label>" + esc(label) + " (" + grpSpec.min + "–" + grpSpec.max + ")</label><input type=\"number\" class=\"edit-live-input\" data-edit-stat=\"" + grp + "." + k + "\" min=\"" + grpSpec.min + "\" max=\"" + grpSpec.max + "\" value=\"" + curVal + "\"></div>";
      });
      h += "</div></div>";

      h += "</div>";
      const prev = SECT.EDITOR.previewCharacterEdit(W, n.id, d);
      h += "<div class=\"card\" id=\"editLivePreview\">" + (prev.ok ? ("<b>ผลคำนวณหลังแก้ไข:</b> " + esc(prev.after.stageName) + " · รากปราณ <b>" + (prev.after.rootCount || 1) + " ราก (" + esc(prev.after.aggregateGrade || "MORTAL") + " · " + esc(prev.after.rarityTitleTh || "") + ")</b> · พลังชีวิตสูงสุด <b>" + prev.after.hpMax + "</b> · ปราณสูงสุด <b>" + prev.after.qiMax + "</b> · พลังรบ <b>" + prev.after.combatPower + "</b> · อัตราบ่มเพาะ <b>" + (prev.after.cultRate || 0) + "/ชม.</b>") : ("<span style=\"color:var(--red)\">⚠️ " + esc(prev.reason) + "</span>")) + "</div>";
      h += "<div style=\"display:flex;gap:8px;margin-top:8px\"><button class=\"btn pri\" style=\"flex:1\" data-do=\"apply-char-edit\">💾 บันทึกการแก้ไขตัวละคร</button></div>";
    } else if (tab === "pet" && n) {
      const pData = SECT.EDITOR.petState(W, n.id);
      const species = pData.speciesCatalog || [];
      const buffCat = pData.buffCatalog || {};
      const ePetSub = UI.editPetSubTab || 'PETS_BUFFS';
      const editPetTabs = [
        ['PETS_BUFFS', '🐾 สัตว์อสูร & บัฟหนุนนำ'],
        ['MECH_KARMA', '⚙️ หุ่นเชิด · หนี้กรรม & ผสมพันธุ์'],
        ['FACILITIES', '🏛️ นโยบายหมอ & สิ่งปลูกสร้างวิถี'],
        ['ALL', '📋 ดูทั้งหมด']
      ];
      h += renderSubTabBar('set-edit-pet-subtab', ePetSub, editPetTabs, 'หมวดย่อยสัตว์อสูร บัฟ และกลไกวิถี');
      h += '<div class="subcat-pane" data-subcat="PETS_BUFFS"' + ((ePetSub === 'ALL' || ePetSub === 'PETS_BUFFS') ? '' : ' style="display:none"') + '>';
      h += "<h3>1. 🐾 จัดการสัตว์อสูรพันธสัญญา (Universal Spirit Beast Companions)</h3><div class=\"card\">";
      h += "<div class=\"muted\" style=\"margin-bottom:6px\">ผู้ฝึกตนทั่วไปสามารถผูกพันธสัญญาสัตว์อสูรออกรบได้สูงสุด <b>1 ตัว</b> · ส่วนผู้เดิน <b>วิถีราชันย์อสูร (BEAST_SOVEREIGN)</b> สามารถควบคุมฝูงอสูรออกรบพร้อมกันได้สูงสุด <b>2–4 ตัว</b> ตามขั้นตบะ (ปัจจุบันของ " + esc(n.h.name.given) + ": สูงสุด <b>" + pData.maxPets + " ตัว</b>)</div>";
      h += "<div class=\"edit-grid\">";
      h += "<div class=\"edit-field\"><label>เลือกสายพันธุ์อสูรวิญญาณ</label><select id=\"editPetSpeciesSel\">" + species.map(sp => "<option value=\"" + sp.id + "\">" + esc(sp.nameTh) + " (T" + sp.tier + " · " + esc(sp.element || "WOOD_LIFE") + ")</option>").join("") + "</select></div>";
      h += "<div class=\"edit-field\"><label>ระดับอสูร (Tier 1–7)</label><input id=\"editPetTier\" type=\"number\" min=\"1\" max=\"7\" value=\"3\"></div>";
      h += "<div class=\"edit-field\"><label>ตัวเลือกราชันย์อสูรจุติ</label><label style=\"display:flex;align-items:center;gap:6px;margin-top:6px\"><input type=\"checkbox\" id=\"editPetSovereign\"> 👑 ปลุกขั้นราชันย์อสูรจุติทันที (Sovereign Awakened)</label></div>";
      h += "</div>";
      h += "<div style=\"margin-top:8px\"><button class=\"btn pri\" data-do=\"edit-pet-spawn\">🐾 เสกและผูกพันธสัญญาสัตว์อสูร</button></div>";
      if (pData.pets && pData.pets.length) {
        h += "<div style=\"margin-top:10px;border-top:1px solid var(--line,#3a3f4a);padding-top:6px\"><b>สัตว์อสูรในพันธสัญญาปัจจุบัน (" + pData.pets.length + " ตัว):</b></div>";
        pData.pets.forEach(pt => {
          const fsBadge = pt.fourSymbol && CULT.FOUR_SYMBOL_BLOODLINES && CULT.FOUR_SYMBOL_BLOODLINES[pt.fourSymbol] ? (" <span class=\"chip g\">" + CULT.FOUR_SYMBOL_BLOODLINES[pt.fourSymbol].icon + " " + esc(CULT.FOUR_SYMBOL_BLOODLINES[pt.fourSymbol].nameTh) + "</span>") : "";
          h += "<div class=\"logrow\" style=\"align-items:center;gap:6px\"><div style=\"flex:1\"><b>" + (pt.fourSymbol ? "🌟 " : pt.sovereignAwakened ? "👑 " : "🐾 ") + esc(pt.nameTh) + "</b> <span class=\"chip " + (pt.active ? "ok" : "") + "\">" + (pt.active ? "ออกรบ" : "สำรอง") + " · T" + pt.tier + " · ขั้นเติบโต " + (pt.growthStage || 1) + "/5</span>" + fsBadge + "<div class=\"muted\" style=\"font-size:11px\">ความภักดี " + Math.round(pt.loyalty || 0) + "% · ความอิ่ม " + Math.round(pt.satisfaction || 0) + "% · Bond XP " + Math.round(pt.bondXp || 0) + "</div></div><div style=\"display:flex;gap:4px;flex-wrap:wrap\"><button class=\"btn\" data-do=\"edit-pet-feed\" data-arg=\"" + pt.uid + "\">🍖 ให้อาหาร</button><button class=\"btn pri\" data-do=\"edit-pet-awaken\" data-arg=\"" + pt.uid + "\">👑 ปลุกราชันย์</button><button class=\"btn pri\" data-do=\"edit-pet-four-symbol\" data-arg=\"" + pt.uid + "|\">🌟 ปลุก 4 เทพอสูร</button><button class=\"btn dan\" data-do=\"edit-pet-release\" data-arg=\"" + pt.uid + "\">ปลดปล่อย</button></div></div>";
        });
      }
      h += "<h4 style='margin-top:12px'>🛡️ กองอสูรพิทักษ์ประตู (สูงสุด 4 ตัว)</h4><div class='muted'>เลือกอสูรสำรองของสำนักให้ร่วมป้องกันเมื่อมีการบุก</div>";
      if (pData.menagerie && pData.menagerie.length) {
        pData.menagerie.forEach(beast => {
          const uid = beast.uid || beast.id || '';
          const assigned = (pData.gateBeasts || []).includes(uid);
          h += "<div class='logrow' style='align-items:center;gap:6px'><div style='flex:1'><b>🐾 " + esc(beast.nameTh || 'อสูรสำนัก') + "</b> <span class='chip " + (assigned ? 'ok' : '') + "'>" + (assigned ? 'พิทักษ์ประตู' : 'สำรอง') + " · T" + (beast.tier || 1) + " · " + esc(beast.bloodlineTrait || beast.trait || 'ไร้สายเลือดพิเศษ') + "</span></div><button class='btn " + (assigned ? '' : 'pri') + "' data-do='edit-gate-beast' data-arg='" + (assigned ? 'remove|' : 'add|') + esc(uid) + "'>" + (assigned ? 'นำออกจากกอง' : 'จัดเข้ากอง') + "</button></div>";
        });
      } else h += "<div class='muted' style='margin-top:6px'>คอกสัตว์สำนักยังไม่มีสัตว์อสูรสำรอง</div>";
      h += "</div>";

      h += "<h3>2. ✨ ร่ายวิชาฟื้นฟูและบัฟหนุนนำ (Self & Ally Healing + Timed Buffs)</h3><div class=\"card\">";
      h += "<div class=\"muted\" style=\"margin-bottom:6px\">ระบบบัฟมีเวลาหมดอายุชัดเจน (ตรวจสอบ <code>until &gt; W.t</code> ทุกทิคและล้างแคชอัตโนมัติเมื่อหมดเวลา ไม่ค้างถาวร)</div>";
      h += "<div class=\"edit-grid\">";
      h += "<div class=\"edit-field\"><label>ผู้รับการฟื้นฟู/บัฟ</label><select id=\"editBuffTargetSel\">" + members.map(m2 => "<option value=\"" + m2.id + "\"" + (m2.id === n.id ? " selected" : "") + ">" + esc(HC.fullName(m2)) + " (HP " + Math.round(m2.h.state.hp) + "/" + CULT.hpMax(m2) + ")</option>").join("") + "</select></div>";
      h += "<div class=\"edit-field\"><label>ชนิดบัฟหนุนนำ (" + Object.keys(buffCat).length + " รูปแบบ)</label><select id=\"editBuffKeySel\">" + Object.values(buffCat).map(bf => "<option value=\"" + bf.id + "\">" + bf.icon + " " + esc(bf.nameTh) + " — " + esc(bf.descTh) + "</option>").join("") + "</select></div>";
      h += "<div class=\"edit-field\"><label>ระยะเวลาบัฟ (นาทีในเกม · สูงสุด 1,440)</label><input id=\"editBuffDuration\" type=\"number\" min=\"10\" max=\"1440\" value=\"180\"></div>";
      h += "</div>";
      h += "<div style=\"display:flex;gap:6px;margin-top:8px;flex-wrap:wrap\"><button class=\"btn pri\" data-do=\"edit-cast-buff\">✨ ร่ายฟื้นฟู + มอบบัฟทันที</button><button class=\"btn dan\" data-do=\"edit-clear-buffs\">🧹 ล้างบัฟทั้งหมดของตัวละครนี้</button></div>";
      if (pData.activeBuffs && pData.activeBuffs.length) {
        h += "<div style=\"margin-top:8px\"><b>บัฟที่ทำงานอยู่ตอนนี้:</b> " + pData.activeBuffs.map(b => "<span class=\"chip b\">" + (b.icon || "✨") + " " + esc(b.nameTh || b.name) + " (เหลือ " + Math.max(0, Math.round(b.until - W.t)) + " นาที)</span>").join(" ") + "</div>";
      }
      h += "</div>";

      const ms = pData.mechState || { constructReadiness: 100, overclockReady: true, decoyAvailable: true };
      const ks = pData.karmaState || { karmicDebt: 0, activeRealmStance: 'DEVA', echoReady: true };
      h += '</div><div class="subcat-pane" data-subcat="MECH_KARMA"' + ((ePetSub === 'ALL' || ePetSub === 'MECH_KARMA') ? '' : ' style="display:none"') + '>';
      h += "<h3>3. ⚙️ กลไกหุ่นเชิด (MECH_PUPPET) & ☸️ บัญชีหนี้กรรม (KARMA_SAMSARA)</h3><div class=\"card\"><div class=\"edit-grid\">";
      h += "<div class=\"edit-field\"><label>ความพร้อมหุ่นเชิด (Construct Readiness 0–100%)</label><input id=\"editMechReadiness\" type=\"number\" min=\"0\" max=\"100\" value=\"" + Math.round(ms.constructReadiness || 0) + "\"><label style=\"font-size:11px;margin-top:4px;display:flex;gap:4px\"><input type=\"checkbox\" id=\"editMechOverclock\"" + (ms.overclockReady ? " checked" : "") + "> โอเวอร์คล็อกพร้อม</label><label style=\"font-size:11px;display:flex;gap:4px\"><input type=\"checkbox\" id=\"editMechDecoy\"" + (ms.decoyAvailable ? " checked" : "") + "> หุ่นสลับร่างพร้อม</label><button class=\"btn\" style=\"margin-top:4px\" data-do=\"edit-save-mech\">⚙️ บันทึกสถานะหุ่นเชิด</button></div>";
      h += "<div class=\"edit-field\"><label>หนี้กรรมสะสม (Karmic Debt Ledger)</label><input id=\"editKarmaDebt\" type=\"number\" min=\"0\" max=\"5000\" value=\"" + Math.round(ks.karmicDebt || 0) + "\"><label style=\"font-size:11px;margin-top:4px\">ท่าทีวัฏจักร 6 ภพภูมิ</label><select id=\"editKarmaStance\">" + [["DEVA", "สวรรค์ (DEVA)"], ["ASURA", "อสูรสงคราม (ASURA)"], ["HUMAN", "มนุษย์สมดุล (HUMAN)"], ["PRETA", "เปรตสูบปราณ (PRETA)"], ["NARAKA", "นรกโลกันตร์ (NARAKA)"], ["ANIMAL", "เดรัจฉานสัญชาตญาณ (ANIMAL)"]].map(([k, v]) => "<option value=\"" + k + "\"" + (ks.activeRealmStance === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select><label style=\"font-size:11px;margin-top:4px;display:flex;gap:4px\"><input type=\"checkbox\" id=\"editKarmaEcho\"" + (ks.echoReady ? " checked" : "") + "> กายาอดีตชาติคุ้มชีพพร้อม</label><button class=\"btn\" style=\"margin-top:4px\" data-do=\"edit-save-karma\">☸️ บันทึกสถานะหนี้กรรม</button></div>";
      h += "</div></div>";

      // 4. Spirit Beast Breeding & Sect Menagerie
      const allPetPool = (pData.pets || []).concat(pData.menagerie || []);
      const doc = pData.supportDoctrine || { triagePriority: "BALANCED", minHpThreshold: 65, autoBuffBeforeBattle: true };
      const facs = pData.specialistFacilities || {};

      h += "<h3>4. 🐣 ระบบผสมพันธุ์สัตว์อสูร & คอกสัตว์วิญญาณสำนัก (Breeding & Menagerie)</h3><div class=\"card\">";
      h += "<div class=\"muted\" style=\"margin-bottom:6px\">ผสมพันธุ์สัตว์อสูร 2 ตัวเพื่อสืบทอดสายเลือด บทบาท และมีโอกาสปลุกสายเลือดเทพอสูรขั้นสูง (+1 Tier สูงสุด T7) · คอกสัตว์วิญญาณสำนักมีอสูรพักฟื้น <b>" + (pData.menagerie ? pData.menagerie.length : 0) + " ตัว</b></div>";
      if (allPetPool.length >= 2) {
        h += "<div class=\"edit-grid\">";
        h += "<div class=\"edit-field\"><label>พ่อพันธุ์ (Parent A)</label><select id=\"breedParentASel\">" + allPetPool.map((pt, idx) => "<option value=\"" + pt.uid + "\">" + (pt.ownerId ? ("🐾 " + esc(pt.nameTh)) : ("🏯 คอก: " + esc(pt.nameTh))) + " (T" + pt.tier + " · " + esc(pt.bloodlineTrait || "NORMAL") + ")</option>").join("") + "</select></div>";
        h += "<div class=\"edit-field\"><label>แม่พันธุ์ (Parent B)</label><select id=\"breedParentBSel\">" + allPetPool.map((pt, idx) => "<option value=\"" + pt.uid + "\"" + (idx === 1 ? " selected" : "") + ">" + (pt.ownerId ? ("🐾 " + esc(pt.nameTh)) : ("🏯 คอก: " + esc(pt.nameTh))) + " (T" + pt.tier + " · " + esc(pt.bloodlineTrait || "NORMAL") + ")</option>").join("") + "</select></div>";
        h += "</div>";
        h += "<div style=\"margin-top:8px;display:flex;gap:6px\"><button class=\"btn pri\" data-do=\"edit-pet-breed\">🐣 ผสมพันธุ์สัตว์อสูรทันที</button></div>";
      } else {
        h += "<div class=\"muted\">ต้องมีสัตว์อสูรในสำนักอย่างน้อย 2 ตัวจึงจะสามารถผสมพันธุ์ได้</div>";
      }
      h += "</div>";

      h += '</div><div class="subcat-pane" data-subcat="FACILITIES"' + ((ePetSub === 'ALL' || ePetSub === 'FACILITIES') ? '' : ' style="display:none"') + '>';
      // 5. Sect Support & Medical Triage Doctrine
      h += "<h3>5. 🪷 นโยบายซัพพอร์ตและการรักษาสำนัก (Sect Support Doctrine)</h3><div class=\"card\">";
      h += "<div class=\"muted\" style=\"margin-bottom:6px\">กำหนดลำดับความสำคัญในการเดินปราณรักษาและแจกบัฟของศิษย์สาย <b>SAGE_SUPPORT</b> และหมอหลวงประจำสำนัก</div>";
      h += "<div class=\"edit-grid\">";
      h += "<div class=\"edit-field\"><label>ลำดับความสำคัญ (Triage Priority)</label><select id=\"editTriagePriority\">" + [
        ["BALANCED", "สมดุลเมตตา (BALANCED — ช่วยทุกคนตามความเหมาะสม)"],
        ["ELDER_FIRST", "ผู้อาวุโสก่อน (ELDER_FIRST — เน้นเจ้าสำนักและผู้อาวุโส)"],
        ["SEVEREST_FIRST", "ผู้บาดเจ็บหนักสุดก่อน (SEVEREST_FIRST — เน้นฉุกเฉิน)"],
        ["VANGUARD_FIRST", "ทัพหน้าแนวรบก่อน (VANGUARD_FIRST — เน้นนักรบ/ผู้ตรวจการ)"]
      ].map(([k, v]) => "<option value=\"" + k + "\"" + (doc.triagePriority === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select></div>";
      h += "<div class=\"edit-field\"><label>เกณฑ์ HP เริ่มรักษา (Min HP Threshold 20–95%)</label><input id=\"editMinHpThresh\" type=\"number\" min=\"20\" max=\"95\" value=\"" + (doc.minHpThreshold || 65) + "\"></div>";
      h += "</div>";
      h += "<div style=\"margin-top:8px\"><button class=\"btn pri\" data-do=\"edit-save-doctrine\">🪷 บันทึกนโยบายซัพพอร์ตสำนัก</button></div>";
      h += "</div>";

      // 6. Specialist Sect Facilities
      h += "<h3>6. 🏛️ สิ่งปลูกสร้างเฉพาะทางประจำวิถี (Specialist Sect Facilities)</h3><div class=\"card\">";
      h += "<div class=\"muted\" style=\"margin-bottom:8px\">สิ่งปลูกสร้างเฉพาะทางช่วยยกระดับความสามารถของวิถีใหม่และทั้งสำนัก</div>";
      h += "<div class=\"edit-grid\">";
      Object.keys(facs).forEach(fId => {
        const fc = facs[fId];
        h += "<div class=\"edit-field\"><b>" + esc(fc.nameTh) + "</b> <span class=\"chip ok\">ระดับ " + fc.level + "/" + fc.maxLevel + "</span><div class=\"muted\" style=\"font-size:11px;margin:3px 0\">" + esc(fc.descTh) + "</div>" + (fc.level < fc.maxLevel ? ("<button class=\"btn\" data-do=\"edit-upgrade-facility\" data-arg=\"" + fId + "\">🏛️ ยกระดับ (ใช้ " + (fc.costBase * fc.level * fc.level) + " ศิลา)</button>") : "<span class=\"chip\">ระดับสูงสุดแล้ว</span>") + "</div>";
      });
      h += "</div></div></div>";
    } else if (tab === "spawn") {
      const paged = SECT.EDITOR.catalogPaginated(W, {
        search: UI.spawnSearch,
        kind: UI.spawnKind,
        tier: UI.spawnTier === "ALL" ? null : +UI.spawnTier,
        element: UI.spawnElement,
        rarity: UI.spawnRarity,
        dest: UI.spawnDest,
        page: UI.spawnPage || 1,
        pageSize: UI.spawnPageSize || 40
      });
      UI.spawnPage = paged.page;
      h += "<h3>✨ เสกไอเทม ศาสตราในตำนาน และคัมภีร์เข้าคลังหรือถุงส่วนตัว</h3><div class=\"card\">";
      h += "<div class=\"muted\" style=\"margin-bottom:6px\">รองรับการค้นหาด้วยชื่อ รหัส ระดับความหายาก (เช่น <code>Legendary</code>, <code>LEG_WPN_</code>, <code>LEG_</code>) ธาตุ สายวิชา และรหัสเอฟเฟกต์ พร้อมระบบแบ่งหน้าแสดงผลครบทุกไอเทม</div>";
      h += "<div class=\"edit-grid\">";
      h += "<div class=\"edit-field\"><label>ปลายทาง</label><select id=\"spawnDest\"><option value=\"sect\"" + (UI.spawnDest === "sect" ? " selected" : "") + ">🏯 คลังสำนัก</option><option value=\"npc\"" + (UI.spawnDest === "npc" ? " selected" : "") + ">🎒 ถุงส่วนตัวของ " + esc(n ? n.h.name.given : "ตัวละคร") + "</option></select></div>";
      h += "<div class=\"edit-field\"><label>หมวดหมู่</label><select id=\"spawnKind\">" + [["ALL", "ทุกหมวดหมู่"], ["PROVISION", "เสบียง/ศิลา"], ["MATERIAL", "วัตถุดิบ"], ["PILL", "โอสถพื้นฐาน"], ["CRAFTED_PILL", "โอสถตำรับ"], ["EQUIPMENT", "อุปกรณ์ยุทธ์/ศาสตราตำนาน"], ["TECH_MANUAL", "คัมภีร์วิชา/ปราณตำนาน"], ["CRYSTAL", "ผลึกวิชา/สายย่อย"], ["SUB_MANUAL", "คัมภีร์สายย่อย"], ["RECIPE_SCROLL", "ม้วนตำรับ"], ["ORGAN", "อวัยวะอสูร"]].map(([k, v]) => "<option value=\"" + k + "\"" + (UI.spawnKind === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select></div>";
      h += "<div class=\"edit-field\"><label>ระดับ (Tier)</label><select id=\"spawnTier\">" + [["ALL", "ทุกระดับ"], ["1", "ระดับ 1"], ["2", "ระดับ 2"], ["3", "ระดับ 3"], ["4", "ระดับ 4"], ["5", "ระดับ 5"], ["6", "ระดับ 6"], ["7", "ระดับ 7"]].map(([k, v]) => "<option value=\"" + k + "\"" + (UI.spawnTier === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select></div>";
      h += "<div class=\"edit-field\"><label>ธาตุ (Element)</label><select id=\"spawnElement\">" + [["ALL", "ทุกธาตุ"], ["FIRE", "🔥 ธาตุไฟ"], ["WATER_ICE", "❄️ ธาตุน้ำ-น้ำแข็ง"], ["LIGHTNING", "⚡ ธาตุสายฟ้า"], ["WIND", "🌪️ ธาตุลม"], ["EARTH_METAL", "⛰️ ธาตุดิน-โลหะ"], ["WOOD_LIFE", "🌿 ธาตุไม้-ชีวิต"], ["YIN_SHADOW", "🌑 ธาตุหยิน-เงา"], ["LIGHT_YANG", "☀️ ธาตุแสง-หยาง"], ["ASTRAL", "✨ ดารา-มิติ (พิเศษ)"], ["BLOOD_DEMON", "🩸 โลหิต-มาร (พิเศษ)"], ["NEUTRAL", "⚪ ไร้ธาตุเฉพาะ"]].map(([k, v]) => "<option value=\"" + k + "\"" + ((UI.spawnElement || "ALL") === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select></div>";
      h += "<div class=\"edit-field\"><label>ความหายาก (Rarity)</label><select id=\"spawnRarity\">" + [["ALL", "ทุกระดับความหายาก"], ["Legendary", "★ Legendary (ตำนาน)"], ["Rare", "Rare (หายาก)"], ["Uncommon", "Uncommon (ปานกลาง)"], ["Common", "Common (ทั่วไป)"]].map(([k, v]) => "<option value=\"" + k + "\"" + ((UI.spawnRarity || "ALL") === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select></div>";
      h += "<div class=\"edit-field\"><label>จำนวนต่อหน้า</label><select id=\"spawnPageSize\">" + [["40", "40 รายการ/หน้า"], ["80", "80 รายการ/หน้า"], ["150", "150 รายการ/หน้า"]].map(([k, v]) => "<option value=\"" + k + "\"" + (String(UI.spawnPageSize || 40) === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select></div>";
      h += "<div class=\"edit-field\"><label>จำนวนที่จะเสก</label><input id=\"spawnQty\" type=\"number\" min=\"1\" max=\"50000\" value=\"" + (UI.spawnQty || 1) + "\"></div>";
      h += "<div class=\"edit-field\"><label>คุณภาพอุปกรณ์</label><select id=\"spawnQuality\">" + [["0.85", "ธรรมดา (85%)"], ["1", "มาตรฐาน (100%)"], ["1.15", "ประณีต (115%)"], ["1.3", "ชั้นเลิศ (130%)"]].map(([k, v]) => "<option value=\"" + k + "\"" + (String(UI.spawnQuality) === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select></div>";
      h += "<div class=\"edit-field\"><label>ค้นหาชื่อ/รหัส/Legendary/เอฟเฟกต์</label><input id=\"spawnSearch\" type=\"search\" placeholder=\"พิมพ์ชื่อ รหัส Legendary หรือธาตุ…\" value=\"" + esc(UI.spawnSearch || "") + "\"></div>";
      h += "</div></div>";

      h += "<div style=\"display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin:8px 0 4px\"><h3 style=\"margin:0\">รายการไอเทม (พบทั้งหมด " + paged.total + " รายการ · หน้า " + paged.page + "/" + paged.totalPages + ")</h3>";
      if (paged.totalPages > 1) {
        h += "<div style=\"display:flex;gap:6px;align-items:center\"><button class=\"btn\" style=\"padding:3px 8px\" data-do=\"spawn-page\" data-arg=\"-1\"" + (paged.page <= 1 ? " disabled" : "") + ">◀ หน้าก่อน</button><span class=\"muted\">หน้า " + paged.page + "/" + paged.totalPages + "</span><button class=\"btn\" style=\"padding:3px 8px\" data-do=\"spawn-page\" data-arg=\"1\"" + (paged.page >= paged.totalPages ? " disabled" : "") + ">หน้าถัดไป ▶</button></div>";
      }
      h += "</div><div class=\"card\">";
      if (!paged.items.length) {
        h += "<div class=\"muted\">ไม่พบไอเทมที่ตรงกับตัวกรอง</div>";
      } else {
        h += paged.items.map(item => {
          const legChip = item.legendary ? " <span class=\"chip g\">★ Legendary</span>" : "";
          const elChip = item.element && item.element !== "NEUTRAL" ? (" <span class=\"chip\">" + (item.elementIcon || "") + " " + esc(item.elementShortTh || item.element) + "</span>") : "";
          const famChip = item.crystalFamily === "TECH" ? " <span class=\"chip b\">ผลึกวิชา</span>" : (item.crystalFamily === "SUBPATH" ? " <span class=\"chip v\">ผลึกสายย่อย</span>" : "");
          const extraBtns = [];
          if (n && item.kind === "EQUIPMENT") {
            extraBtns.push("<button class=\"btn\" style=\"padding:4px 8px;font-size:11px\" data-do=\"spawn-equip-item\" data-arg=\"" + item.kind + "|" + item.id + "\">⚔️ เสก+สวมใส่</button>");
          }
          if (n && n.cult && item.kind === "TECH_MANUAL") {
            extraBtns.push("<button class=\"btn\" style=\"padding:4px 8px;font-size:11px\" data-do=\"spawn-teach-item\" data-arg=\"" + item.kind + "|" + item.id + "\">📖 ถ่ายทอด</button>");
          }
          return "<div class=\"logrow\" style=\"align-items:center;gap:6px\"><div style=\"flex:1;min-width:0\"><span class=\"chip b\">" + esc(item.kind) + " T" + item.tier + "</span>" + famChip + legChip + elChip + " <b>" + esc(item.nameTh) + "</b> <span class=\"muted\" style=\"font-size:11px\">(" + esc(item.id) + ")</span><div class=\"muted\" style=\"font-size:11px\">" + esc(item.descTh || "") + "</div></div><div style=\"display:flex;gap:4px;flex-wrap:wrap\">" + extraBtns.join("") + "<button class=\"btn pri\" style=\"padding:4px 10px;font-size:11.5px\" data-do=\"spawn-item\" data-arg=\"" + item.kind + "|" + item.id + "\">✨ เสก</button></div></div>";
        }).join("");
      }
      h += "</div>";
    } else if (tab === "bag" && n) {
      h += renderPersonalBagSection(W, n);
    } else if (tab === "dip") {
      const dipData = SECT.EDITOR.diplomacyState(W, UI.editDipSectId);
      const selSect = dipData.selectedSect;
      if (selSect) UI.editDipSectId = selSect.id;
      h += "<h3>📜 จัดการการทูตและสำนักในยุทธภพ (Edit Hub Diplomacy)</h3><div class=\"card\">";
      h += "<div class=\"muted\" style=\"margin-bottom:6px\">เลือกสำนักเป้าหมายเพื่อปรับค่าความสัมพันธ์ ลงนามหรือยกเลิกสนธิสัญญา ล้างคูลดาวน์ ส่งกองคาราวานแลกเปลี่ยน หรือจำลองศึกทูตประลองได้โดยตรง</div>";
      h += "<div class=\"edit-grid\">";
      h += "<div class=\"edit-field\"><label>เลือกสำนักในยุทธภพ</label><select id=\"editDipSectSel\">" + dipData.sects.map(s => "<option value=\"" + s.id + "\"" + (selSect && selSect.id === s.id ? " selected" : "") + ">" + esc(s.nameTh) + " (" + esc(CONTENT.TREATY_TH[s.treaty] || s.treaty) + " · สัมพันธ์ " + s.attitude + ")</option>").join("") + "</select></div>";
      if (selSect) {
        h += "<div class=\"edit-field\"><label>ระดับไมตรี / ปรปักษ์ (-100 ถึง 100)</label><div style=\"display:flex;gap:6px\"><input id=\"editDipAttitude\" type=\"number\" min=\"-100\" max=\"100\" value=\"" + selSect.attitude + "\" style=\"width:100px\"><button class=\"btn pri\" data-do=\"edit-dip-attitude\">ปรับค่าไมตรี</button></div></div>";
        h += "<div class=\"edit-field\"><label>ลงนามสนธิสัญญาโดยตรง</label><div style=\"display:flex;gap:6px;flex-wrap:wrap\"><select id=\"editDipTreatySel\">" + Object.entries(CONTENT.TREATY_TH).map(([k, v]) => "<option value=\"" + k + "\"" + (selSect.treaty === k ? " selected" : "") + ">" + v + "</option>").join("") + "</select><button class=\"btn pri\" data-do=\"edit-dip-treaty\">ลงนามทันที</button><button class=\"btn dan\" data-do=\"edit-dip-cleartreaty\">ยกเลิกสัญญา</button></div></div>";
        h += "<div class=\"edit-field\"><label>คูลดาวน์ทางการทูต</label><div style=\"display:flex;gap:6px;align-items:center;flex-wrap:wrap\"><span class=\"chip\">คาราวานล่าสุด: " + (selSect.lastCaravanDay != null ? ("วันที่ " + selSect.lastCaravanDay) : "ยังไม่มี") + "</span><span class=\"chip\">ทูตล่าสุด: " + (selSect.lastEnvoyDay != null ? ("วันที่ " + selSect.lastEnvoyDay) : "ยังไม่มี") + "</span><button class=\"btn\" data-do=\"edit-dip-resetcd\">🔄 ล้างคูลดาวน์ทั้งหมด</button></div></div>";
      }
      h += "</div></div>";

      if (selSect) {
        h += "<h3>1. ปฏิบัติการทางการทูตและคาราวานพันธมิตร</h3><div class=\"card\"><div style=\"display:flex;gap:8px;flex-wrap:wrap\">";
        h += "<button class=\"btn pri\" data-do=\"edit-dip-exchange\">🚚 ส่งคาราวานแลกเปลี่ยนทันที (รับผลึกสายย่อย+ตำรับ)</button>";
        h += "<button class=\"btn\" data-do=\"edit-dip-envoy\" data-arg=\"normal\">⚔️ เรียกทูตคู่ปรับมาประลอง (สู้จริงตามพลัง)</button>";
        h += "<button class=\"btn\" data-do=\"edit-dip-envoy\" data-arg=\"win\">⚔️ บังคับสำนักเราชนะทูต (+45 CP, +60 ศิลา)</button>";
        h += "<button class=\"btn dan\" data-do=\"edit-dip-envoy\" data-arg=\"loss\">⚔️ บังคับสำนักเราแพ้ทูต</button>";
        h += "</div></div>";
      }

      // Political Event Hub
      h += "<h3>2. วิกฤตและเหตุการณ์การเมือง (Political Events Hub)</h3><div class=\"card\">";
      if (dipData.activeEvent) {
        const ev = dipData.activeEvent;
        h += "<b>⚡ กำลังเกิดเหตุการณ์: " + esc(ev.titleTh) + "</b><div class=\"muted\" style=\"margin-top:2px\">" + esc(ev.descTh) + "</div>";
        h += "<div style=\"display:flex;gap:6px;margin-top:8px;flex-wrap:wrap\">";
        if (ev.kind === "SPECIALTY_CARAVAN") {
          h += "<button class=\"btn pri\" data-do=\"edit-dip-resolveevent\" data-arg=\"ACCEPT\">ยอมรับการแลกเปลี่ยน</button><button class=\"btn dan\" data-do=\"edit-dip-resolveevent\" data-arg=\"DECLINE\">ปฏิเสธ</button>";
        } else if (ev.kind === "TRIBUTE_DEMAND") {
          h += "<button class=\"btn\" data-do=\"edit-dip-resolveevent\" data-arg=\"PARLEY\">เจรจาทางการทูต</button><button class=\"btn pri\" data-do=\"edit-dip-resolveevent\" data-arg=\"PAY\">ยอมจ่ายค่าคุ้มครอง</button><button class=\"btn dan\" data-do=\"edit-dip-resolveevent\" data-arg=\"DEFY\">ยืนหยัดปฏิเสธ</button>";
        } else if (ev.kind === "DOCTRINE_SUMMIT") {
          h += "<button class=\"btn pri\" data-do=\"edit-dip-resolveevent\" data-arg=\"ATTEND\">ส่งตัวแทนร่วมชุมนุม</button><button class=\"btn\" data-do=\"edit-dip-resolveevent\" data-arg=\"SKIP\">งดเข้าร่วม</button>";
        } else {
          h += "<button class=\"btn dan\" data-do=\"edit-dip-resolveevent\" data-arg=\"ASSERT\">แสดงกำลังคุ้มครอง</button><button class=\"btn pri\" data-do=\"edit-dip-resolveevent\" data-arg=\"COMPROMISE\">ตกลงแบ่งปัน</button>";
        }
        h += "</div>";
      } else {
        h += "<div class=\"muted\" style=\"margin-bottom:6px\">ขณะนี้ไม่มีเหตุการณ์การเมืองค้างอยู่ — สามารถจุดประกายเหตุการณ์เพื่อทดสอบได้ทันที:</div>";
        h += "<div style=\"display:flex;gap:6px;flex-wrap:wrap;align-items:center\"><select id=\"editDipSpawnEventKind\"><option value=\"SPECIALTY_CARAVAN\">ขบวนแลกเปลี่ยนของวิเศษ (SPECIALTY_CARAVAN)</option><option value=\"TRIBUTE_DEMAND\">คำขาดเรียกค่าคุ้มครอง (TRIBUTE_DEMAND)</option><option value=\"DOCTRINE_SUMMIT\">เทียบเชิญชุมนุมมรรคา (DOCTRINE_SUMMIT)</option><option value=\"BORDER_HERB_DISPUTE\">ข้อพิพาททรัพยากรชายแดน (BORDER_HERB_DISPUTE)</option></select><button class=\"btn pri\" data-do=\"edit-dip-spawnevent\">⚡ จุดประกายเหตุการณ์</button></div>";
      }
      h += "</div>";
    } else if (tab === "sanctum") {
      const sData = SECT.EDITOR.sanctumState(W, UI.editSanctumId);
      const selSanctum = sData.selectedSanctum;
      if (selSanctum) UI.editSanctumId = selSanctum.id;
      const cats = sData.catalysts;
      h += "<h3>🏛️ จัดการวิหารโบราณและรางวัลโบนัส (Edit Hub Sanctums)</h3><div class=\"card\">";
      h += "<div class=\"edit-grid\">";
      h += "<div class=\"edit-field\"><label>เลือกวิหารโบราณ</label><select id=\"editSanctumSel\">" + sData.sanctums.map(sc => "<option value=\"" + sc.id + "\"" + (selSanctum && selSanctum.id === sc.id ? " selected" : "") + ">" + sc.icon + " " + esc(sc.nameTh) + " (ผ่าน " + (sData.clearedFloors[sc.id] || 0) + "/3 ชั้น)</option>").join("") + "</select></div>";
      if (selSanctum) {
        h += "<div class=\"edit-field\"><label>กำหนดชั้นสูงสุดที่ผ่านด่าน (0–3)</label><div style=\"display:flex;gap:6px\"><select id=\"editSanctumFloorSel\">" + [0, 1, 2, 3].map(fl => "<option value=\"" + fl + "\"" + ((sData.clearedFloors[selSanctum.id] || 0) === fl ? " selected" : "") + ">ชั้น " + fl + (fl === 0 ? " (ยังไม่เคยผ่าน)" : " / 3") + "</option>").join("") + "</select><button class=\"btn pri\" data-do=\"edit-sanctum-setfloor\">บันทึกชั้น</button></div></div>";
      }
      h += "</div>";

      if (selSanctum) {
        h += "<div style=\"margin-top:8px\"><div class=\"muted\" style=\"margin-bottom:4px\">ผู้พิทักษ์ประจำวิหาร:</div>";
        selSanctum.floors.forEach(fl => {
          h += "<div style=\"padding:2px 0;font-size:12px\"><b>ชั้น " + fl.floor + " (" + esc(fl.nameTh) + "):</b> " + esc(fl.guardianNameTh) + " [พลัง " + fl.basePower + " · T" + fl.tier + " · " + fl.weaponType + "] — ผลึกการันตี: <span class=\"chip g\">" + esc(ECO.REFINEMENT_CATALYSTS[fl.catalystId]?.nameTh || fl.catalystId) + "</span></div>";
        });
        h += "</div>";

        h += "<div style=\"margin-top:8px;padding-top:6px;border-top:1px solid var(--line,#3a3f4a)\"><b>จำลองการลงสำรวจวิหารทันที (Instant Run):</b><div style=\"display:flex;gap:6px;margin-top:4px;flex-wrap:wrap\">";
        h += "<button class=\"btn pri\" data-do=\"edit-sanctum-run\" data-arg=\"clear\">🏛️ ผ่านฉลุย 3 ชั้น (Force Clear — รับผลึกการันตี + สุ่มโบนัส)</button>";
        h += "<button class=\"btn\" data-do=\"edit-sanctum-run\" data-arg=\"sim\">⚔️ สู้จริงตามพลัง (อาจถอยทัพตามพลังชีวิต)</button>";
        h += "</div></div>";
      }
      h += "</div>";

      // Bonus Drop Stats
      h += "<h3>🎲 สถิติการดรอปรางวัลโบนัสวิหาร (Bonus Drop Metrics)</h3><div class=\"card\">";
      h += "<div>ดรอปโบนัสสำเร็จแล้วทั้งหมด: <b>" + sData.bonusDrops + "</b> ครั้ง (โอกาส 4% ชั้น1 / 8% ชั้น2 / 12% ชั้น3 · สูงสุด 1 ชิ้น/รอบ)</div>";
      h += "<div style=\"display:flex;gap:6px;flex-wrap:wrap;margin-top:6px\">" + EXPLORE.SANCTUM_BONUS_TIERS.map(t => "<span class=\"chip " + (t.id === "APEX_LEGENDARY" ? "g" : t.id === "UNCOMMON_MANUAL" ? "v" : "b") + "\">" + t.rarityLabel + " (" + t.weight + "%): " + (sData.bonusByTier[t.id] || 0) + " ครั้ง</span>").join("") + "</div>";
      h += "</div>";

      // Refinement Hub
      h += "<h3>✨ หลอมขัดเกลาศาสตราด้วยผลึกโบราณ (Refinement Hub)</h3><div class=\"card\">";
      h += "<div style=\"display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px\"><div><b>ผลึกในคลัง:</b> " + Object.values(ECO.REFINEMENT_CATALYSTS).map(c => "<span class=\"chip g\">" + esc(c.nameTh) + " ×" + (cats[c.id] || 0) + "</span>").join(" ") + "</div><button class=\"btn\" data-do=\"edit-sanctum-spawncat\">✨ เติมผลึกเข้าคลัง (+5 ชิ้นทุกชนิด)</button></div>";

      // Collect all T3-T7 refinable gear
      const refinableGear = [];
      (W.sect.gear || []).forEach(g2 => {
        if (g2 && (g2.tier || 1) >= 3) refinableGear.push({ gear: g2, ownerName: "คลังสำนัก", ownerId: null });
      });
      W.npcs.forEach(mem => {
        if (mem.equip) {
          for (const sl of ["WEAPON", "ARMOR", "ACCESSORY"]) {
            const eq = mem.equip[sl];
            if (eq && (eq.tier || 1) >= 3) refinableGear.push({ gear: eq, ownerName: mem.h.name.given + " (สวมใส่อยู่)", ownerId: mem.id });
          }
        }
        if (mem.inv && Array.isArray(mem.inv.gear)) {
          mem.inv.gear.forEach(eq => {
            if (eq && (eq.tier || 1) >= 3) refinableGear.push({ gear: eq, ownerName: mem.h.name.given + " (ในถุง)", ownerId: mem.id });
          });
        }
      });

      if (!refinableGear.length) {
        h += "<div class=\"muted\">ยังไม่พบอุปกรณ์ T4–T6 ในสำนัก สามารถเสกไอเทมในแท็บ \"เสกไอเทม\" ก่อนนำมาขัดเกลา</div>";
      } else {
        h += "<div class=\"edit-grid\"><div class=\"edit-field\"><label>เลือกอุปกรณ์ที่จะขัดเกลา</label><select id=\"editRefineGearSel\">" + refinableGear.map(r => "<option value=\"" + (r.gear.uid || r.gear.id) + "|" + (r.ownerId || "") + "\">" + esc(r.gear.nameTh) + " [T" + r.gear.tier + " · " + r.gear.slot + " · คุณภาพ " + Math.round((r.gear.q || 1) * 100) + "%] — " + esc(r.ownerName) + "</option>").join("") + "</select></div>";
        h += "<div class=\"edit-field\"><label>เลือกผลึกขัดเกลา</label><select id=\"editRefineCatSel\">" + Object.values(ECO.REFINEMENT_CATALYSTS).map(c => "<option value=\"" + c.id + "\">" + esc(c.nameTh) + " (เพิ่มคุณภาพ +" + Math.round(c.qualityBoost * 100) + "% / เพดาน " + Math.round(c.maxQuality * 100) + "%) [มี " + (cats[c.id] || 0) + "]</option>").join("") + "</select></div>";
        h += "</div>";
        h += "<div style=\"margin-top:6px\"><button class=\"btn pri\" data-do=\"edit-sanctum-refine\">✨ ขัดเกลาคุณภาพอุปกรณ์ทันที</button></div>";
      }
      h += "</div>";
    } else if (tab === "backup") {
      const slots = UI.slotInfo();
      h += "<h3>💾 สำรองข้อมูลก่อนแก้ไขหรือเสกของ</h3><div class=\"card\"><div class=\"muted\">แนะนำให้บันทึกเกมลงช่องบันทึกหรือส่งออกเป็นไฟล์ JSON ก่อนปรับแก้ค่าสถานะขนาดใหญ่ การกดปุ่ม \"ย้อนคืนการแก้ไขล่าสุด\" จะย้อนคืนเฉพาะค่าสถานะตัวละครโดยไม่ย้อนเวลาของโลกที่เดินไปแล้ว</div>";
      [1, 2, 3].forEach(i => {
        const s = slots[i];
        h += "<div style=\"margin-top:6px\"><b>ช่องที่ " + i + ":</b> <span class=\"muted\">" + (s ? esc(s.text) : "ว่าง") + "</span> <button class=\"btn pri\" data-do=\"save\" data-arg=\"" + i + "\">💾 บันทึกทับช่อง " + i + "</button></div>";
      });
      h += "<div style=\"margin-top:8px\"><button class=\"btn\" data-do=\"export\">⬇ ส่งออกไฟล์สำรอง (.json)</button></div></div>";
    }
    return h;
  };

  /* ----- เมนู ----- */
  UI.rMenu = () => {
    const G = UI.G, tab = UI.tab; let h = '';
    if (tab === 'main') {
      const slots = UI.slotInfo(); h += '<h3>' + (G.W ? 'บันทึก / โหลด' : 'โหลดเกม') + '</h3>';
      [1, 2, 3].forEach(i => { const s = slots[i]; h += '<div class="card"><b>ช่องที่ ' + i + '</b> <span class="muted">' + (s ? esc(s.text) : 'ว่าง') + '</span><div>' + (G.W ? '<button class="btn pri" data-do="save" data-arg="' + i + '">💾 บันทึก</button>' : '') + (s ? '<button class="btn" data-do="load" data-arg="' + i + '">📂 โหลด</button>' : '') + '</div></div>'; });
      h += '<div class="card"><b>ไฟล์สำรอง</b><div class="muted">' + (G.W ? 'ส่งออกเป็นไฟล์ เก็บไว้ในเครื่อง หรือนำเข้ามาเล่นต่อ' : 'นำเข้าไฟล์สำรองเพื่อเล่นต่อ') + '</div>' + (G.W ? '<button class="btn" data-do="export">⬇ ส่งออกไฟล์</button>' : '') + '<button class="btn" data-do="import">⬆ นำเข้าไฟล์</button></div>';
      h += '<div class="card"><button class="btn dan" data-do="new">🔄 เริ่มเกมใหม่ (เลือกเจ้าสำนักใหม่)</button></div>';
    } else if (tab === 'tracked') {
      const W = G.W;
      const trackedIds = (W && W.sect && W.sect.trackedNpcIds) || [];
      const trackedNpcs = trackedIds.map(id => W.byId && W.byId[id]).filter(Boolean);
      h += '<h3>⭐ ตัวละครที่กำลังติดตาม (Tracked Disciples · ' + trackedNpcs.length + ' คน)</h3>';
      h += '<div class="muted" style="margin-bottom:8px">ติดตามความคืบหน้า ตบะ สภาพร่างกาย ภารกิจ และกรองบันทึกเหตุการณ์เฉพาะบุคคลได้ทันที</div>';
      if (!trackedNpcs.length) {
        h += '<div class="card" style="text-align:center;padding:16px 10px">';
        h += '<div style="font-size:28px;margin-bottom:6px">⭐</div>';
        h += '<b>ยังไม่มีตัวละครที่ติดตาม</b>';
        h += '<div class="muted" style="font-size:12px;margin:6px 0 12px 0;line-height:1.6">คุณสามารถกดปุ่ม <b>⭐ ติดตามตัวละคร</b> ในหน้ารายละเอียดของศิษย์คนใดก็ได้ เพื่อปักหมุดความคืบหน้าไว้ที่นี่</div>';
        h += '<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap"><button class="btn pri" data-do="open-people" data-arg="rank">👥 เลือกศิษย์จากทำเนียบสำนัก</button><button class="btn" data-do="open-log-tracked">📜 ไปที่บันทึกเหตุการณ์</button></div>';
        h += '</div>';
      } else {
        h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px">';
        h += '<div style="display:flex;gap:4px;flex-wrap:wrap"><button class="btn pri" data-do="open-log-tracked">📜 ดูกระแสบันทึกที่ติดตาม</button><button class="btn" data-do="open-people" data-arg="tracked">👥 ดูในรายชื่อผู้คน</button></div>';
        h += '<button class="btn dan" style="font-size:11px;padding:3px 8px" data-do="clear-all-tracked">❌ ยกเลิกติดตามทั้งหมด</button>';
        h += '</div>';
        h += trackedNpcs.map(n => {
          const c = n.cult, path = c && CULT.PATHS[c.path], subpath = c && c.sub && c.sub !== 'NONE' ? CULT.subInfo(c.path, c.sub) : null;
          const hpf = n.h.state.hp / CULT.hpMax(n);
          const mood = Math.round(n.h.state.mood);
          const act = n.away ? 'เดินทางภายนอก' : actText(n);
          const stgName = c ? CULT.stageName(n) : 'ปุถุชน';
          const pwr = c ? Math.round(CULT.power(n)) : 0;
          return '<div class="card" style="margin-bottom:8px;border-color:var(--gold);background:rgba(233,205,133,0.03)">' +
            '<div style="display:flex;gap:10px;align-items:flex-start">' +
            portraitHtml(n, 48) +
            '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">' +
            '<div><span style="font-size:14px;font-weight:bold;cursor:pointer" data-npc="' + n.id + '">⭐ ' + esc(HC.fullName(n)) + '</span> <span class="chip ' + (n.rank >= 4 ? 'g' : '') + '" style="font-size:10.5px">' + esc(SECT.title(n)) + '</span>' + (n.dead ? ' <span class="chip r">🕯️ ล่วงลับ</span>' : '') + '</div>' +
            '<button class="btn" style="padding:2px 7px;font-size:10.5px" data-do="untrack-npc" data-arg="' + n.id + '" title="เลิกติดตาม">❌ เลิกติดตาม</button>' +
            '</div>' +
            '<div style="margin-top:3px;display:flex;gap:4px;flex-wrap:wrap">' +
            (c ? '<span class="chip b" style="font-size:11px">' + esc(stgName) + ' (พลัง ' + pwr + ')</span> <span class="chip" style="font-size:11px;border-color:' + esc((path && path.color) || '#749b89') + '">' + esc((path && path.icon) || '☯') + ' ' + esc((path && (path.shortTh || path.nameTh)) || 'วิถี') + '</span>' + (subpath ? ' <span class="chip" style="font-size:11px">' + esc(subpath.nameTh) + '</span>' : '') : '<span class="chip">ปุถุชน</span>') +
            '</div>' +
            '<div class="muted" style="font-size:11.5px;margin-top:3px">📍 <b>กิจกรรม:</b> ' + esc(act) + ' · <b>อารมณ์:</b> ' + mood + '/100</div>' +
            '<div style="margin-top:4px;display:flex;align-items:center;gap:6px">' +
            '<span class="muted" style="font-size:10.5px">HP:</span><div class="mini" style="flex:1;max-width:160px;height:6px"><i style="width:' + clamp(hpf * 100, 0, 100) + '%;background:' + (hpf > .6 ? '#5fd38a' : hpf > .3 ? '#e8c43a' : '#e0584a') + '"></i></div>' +
            '</div>' +
            '<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">' +
            '<button class="btn" style="padding:2px 8px;font-size:11px" data-npc="' + n.id + '">👁️ ดูรายละเอียด</button>' +
            '<button class="btn pri" style="padding:2px 8px;font-size:11px" data-do="goto-npc" data-arg="' + n.id + '">🎯 ติดตามกล้อง</button>' +
            '<button class="btn" style="padding:2px 8px;font-size:11px" data-do="locate" data-arg="' + n.id + '">📍 แผนที่</button>' +
            (SECT.MENTORSHIP && n.cult ? '<button class="btn" style="padding:2px 8px;font-size:11px" data-do="chronicle-person" data-arg="' + esc(n.id) + '">📖 บันทึก</button>' : '') +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        }).join('');
      }
    } else if (tab === 'set') {
      const o = G.opts, effQ = (G.R && G.R.resolveQuality) ? G.R.resolveQuality() : (o.quality || 'standard');
      const qNames = { low: 'ประหยัดพลังงาน', standard: 'มาตรฐาน', high: 'คมชัดสูง' };
      h += '<div class="card"><b>คุณภาพกราฟิกและการเคลื่อนไหว</b><div class="edit-field" style="margin-top:6px"><label>ระดับความละเอียดภาพ (ใช้งานจริง: ' + esc(qNames[effQ] || effQ) + ')</label><select id="gfxQualitySel">' + [['auto', 'อัตโนมัติ (ปรับตามขนาดจอและเฟรมเรต)'], ['low', 'ประหยัดพลังงาน (Low — ลดเงาและละออง)'], ['standard', 'มาตรฐาน (Standard — สมดุลคมชัด)'], ['high', 'คมชัดสูง (High — เต็มพิกัด DPR 2×)']].map(([k, v]) => '<option value="' + k + '"' + ((o.quality || 'auto') === k ? ' selected' : '') + '>' + v + '</option>').join('') + '</select></div>';
      h += '<label class="sw" style="border-bottom:0;padding-bottom:2px"><span>ลดการเคลื่อนไหว (หยุดอนิเมชันน้ำ/ควัน/ประกาย)</span><input type="checkbox" data-set="reducedMotion" ' + (o.reducedMotion ? 'checked' : '') + '></label><div class="edit-field" style="margin-top:6px"><label>รูปแบบแสดงผลถุงสัมภาระ คลังสำนัก และร้านค้า</label><select id="invViewModeSel"><option value="grid"' + (UI.getInvViewMode() === 'grid' ? ' selected' : '') + '>⊞ ตารางไอคอนแบบแบ่งหน้า (Paginated Icon-Grid)</option><option value="list"' + (UI.getInvViewMode() === 'list' ? ' selected' : '') + '>☰ รายการแบบดั้งเดิม (Classic List View)</option></select></div></div>';
      h += '<div class="card" style="border-color:var(--gold)"><b>✨ กราฟิกเซียนยุคที่ 5 (Era 5 Celestial Visual Overhaul v5.0.0)</b><div class="muted" style="font-size:11.5px;margin-top:2px">ควบคุมรัศมีตบะ 9 ขั้น · กระบี่บินโคจร · ปราณศาสตรา 7 ระดับ · ค่ายกลแปดทิศ · นกกระเรียนเซียน และปรากฏการณ์ฟ้าดิน</div>';
      const curPrev = (G.R && G.R.opts && G.R.opts.celestialPreview) || o.celestialPreview || 'AUTO';
      const shaders = (g.Render && g.Render.CELESTIAL_SHADERS) ? Object.values(g.Render.CELESTIAL_SHADERS) : [];
      h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">' + shaders.map(sh => '<button type="button" class="btn' + (curPrev === sh.id ? ' pri' : '') + '" style="padding:3px 8px;font-size:11px" data-do="cycle-celestial-preview" data-arg="' + esc(sh.id) + '">' + esc(sh.icon + ' ' + sh.nameTh) + '</button>').join('') + '</div>';
      h += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">' + [
        ['realmHalos', 'วงล้อรัศมีตบะ 9 ขั้น & ผ้าแพรเซียน'],
        ['flyingSwords', 'กระบี่บินโคจรรอบกาย (飞剑环绕)'],
        ['combatSlashes', 'คลื่นคมกระบี่ 3 ชั้น & ภาพติดตา'],
        ['sectSpectacles', 'ค่ายกลหยินหยางลานกลาง & ธงยอดเขา'],
        ['livingFauna', 'ปลาคาร์ปวิญญาณ · นกกระเรียนเซียน & โคมลอย'],
        ['celestialShaders', 'แสงบรรยากาศปรากฏการณ์ฟ้าดิน']
      ].map(([vk, vl]) => {
        const isOn = (G.R && G.R.opts && G.R.opts[vk] !== undefined) ? G.R.opts[vk] : (o[vk] !== false);
        return '<button type="button" class="btn' + (isOn ? ' ok' : '') + '" style="padding:3px 8px;font-size:11px" data-do="toggle-vfx-opt" data-arg="' + esc(vk) + '">' + (isOn ? '✓ ' : '○ ') + esc(vl) + '</button>';
      }).join('') + '</div></div>';
      h += [['names', 'แสดงชื่อตัวละคร (ขยายภาพ)'], ['bubbles', 'แสดงไอคอนกิจกรรมเหนือหัว'], ['weather', 'เอฟเฟกต์อากาศ/ใบไม้ร่วง'], ['night', 'กลางคืนมืดลง'], ['toast', 'แจ้งเตือนเหตุการณ์สำคัญ'], ['autosave', 'บันทึกอัตโนมัติ (ทุก 3 นาที)']].map(s => '<label class="sw"><span>' + s[1] + '</span><input type="checkbox" data-set="' + s[0] + '" ' + (o[s[0]] ? 'checked' : '') + '></label>').join('');
      h += '<div class="muted" style="margin-top:10px">การลากนิ้ว = เลื่อนแผนที่ · บีบนิ้ว = ซูม · แตะตัวละคร/อาคาร = ดูข้อมูล</div>';
    } else if (tab === 'tools') {
      h += '<div class="muted" style="margin-bottom:8px">เครื่องมือทดลองสำหรับผู้สังเกตการณ์ — ไม่ใช่ส่วนหนึ่งของระบบสำนักตามปกติ ใช้ดูว่า NPC ตัดสินใจอย่างไรเมื่อเกิดเหตุ</div>';
      h += [['stones', '💎 มอบศิลา 1,000'], ['food', '🍚 มอบเสบียง'], ['raid', '⚠ เรียกโจรบุก'], ['beast', '🐺 เรียกอสูรบุก'], ['recruit', '🧑‍🎓 เรียกผู้สมัครเข้าสำนัก'], ['banquet', '🎎 ให้เจ้าสำนักจัดงานเลี้ยง'], ['tourney', '🏆 ให้เจ้าสำนักจัดประลองยุทธ์'], ['challenge', '⚔ ให้ผู้อาวุโสท้าชิงตำแหน่ง'], ['heal', '✨ รักษาทุกคนจนหาย']].map(t => '<button class="btn" data-do="tool" data-arg="' + t[0] + '">' + t[1] + '</button>').join('');
    } else {
      h += '<div class="card"><b>สำนักเมฆาหยก v1.10 · ยุทธภพและสายวิชา</b><div class="muted">เกมจำลองสำนักยุทธภพแบบ sandbox — NPC ทุกคนมี “แกนมนุษย์” ชุดเดียวกัน 155 มิติ (บุคลิก 14 · คุณค่า 8 · กาย 22 · ปัญญา 18 · สังคม 7 · อารมณ์ 7 · ความสนใจ 24 · พรสวรรค์ 6 · ความถนัด · ทักษะ) ตัดสินใจเองจากตัวตน ไม่มีสคริปต์ตายตัว</div></div><div class="card"><b>ข้อมูลเกม</b><div class="muted">เมล็ดโลก: ' + esc(G.W.seed) + ' · เวอร์ชันแกน: ' + esc(HC.FINGERPRINT) + '<br>ข้อมูลวิถี/โอสถ/คัมภีร์/อสูรสกัดจาก Jianghu Universal Game Data Pack v1</div></div>';
    }
    return h;
  };
  UI.applyOpts = () => { const o = UI.G.opts, R = UI.G.R; R.opts.names = o.names; R.opts.bubbles = o.bubbles; R.opts.weather = o.weather; R.opts.night = o.night; R.opts.quality = o.quality || 'auto'; R.opts.reducedMotion = !!o.reducedMotion; ['realmHalos', 'flyingSwords', 'combatSlashes', 'sectSpectacles', 'livingFauna', 'celestialShaders', 'sacredSpectacles'].forEach(k => { if (o[k] !== undefined) R.opts[k] = !!o[k]; }); if (o.celestialPreview) R.opts.celestialPreview = o.celestialPreview; if (o.ceremonyPreview) R.opts.ceremonyPreview = o.ceremonyPreview; if (R.resize) R.resize(); try { localStorage.setItem('jhs_opts', JSON.stringify(o)); } catch (e) { } };
  UI.tool = a => {
    const G = UI.G, W = G.W, S = W.sect, m = W.byId[S.masterId];
    if (a === 'stones') { ECO.earn(W, 1000, 'ของขวัญจากผู้สังเกตการณ์'); UI.toast('มอบศิลา 1,000'); }
    else if (a === 'food') { ECO.add(W, 'grain', 300); ECO.add(W, 'meal', 100); UI.toast('มอบเสบียงแล้ว'); }
    else if (a === 'raid') { if (W.threat.raid) UI.toast('กำลังมีศัตรูบุกอยู่'); else { EXPED.spawnRaid(W, 'bandit'); UI.close(); } }
    else if (a === 'beast') { if (W.threat.raid) UI.toast('กำลังมีศัตรูบุกอยู่'); else { EXPED.spawnRaid(W, 'beast'); UI.close(); } }
    else if (a === 'recruit') { const n = EXPED.recruitApplicants(W); UI.toast(n ? 'มีผู้สมัครใหม่ ' + n + ' คน' : 'หอพักเต็มหรือคิวเต็ม ไม่มีผู้สมัครใหม่'); }
    else if (a === 'banquet') { if (!m) { UI.toast('ยังไม่มีเจ้าสำนัก'); return; } S.cd.banquet = 0; SECT.banquet(W, m); }
    else if (a === 'tourney') { if (!m) { UI.toast('ยังไม่มีเจ้าสำนัก'); return; } if (!S.tournament) SECT.tournament(W, m); }
    else if (a === 'challenge') { if (!m || m.dead) { UI.toast('ยังไม่มีเจ้าสำนักให้ท้าชิง'); return; } const c = W.npcs.filter(n => !n.dead && !n.away && n.rank >= 3 && n.id !== m.id).sort((a, b) => CULT.power(b) - CULT.power(a))[0]; if (c) { W.duelQueue.push({ a: c.id, b: m.id, kind: 'leadership', serious: false }); W.log('challenge', c.h.name.given + ' ท้าชิงตำแหน่งเจ้าสำนักจาก ' + m.h.name.given + ' !', [c.id, m.id]); UI.close(); } }
    else if (a === 'heal') { W.npcs.forEach(n => { if (!n.dead) { n.h.state.hp = CULT.hpMax(n); n.inj = []; } }); UI.toast('รักษาทุกคนแล้ว'); }
  };

  /* ---------- บันทึก/โหลด ---------- */
  UI.slotInfo = () => { const out = {}; [1, 2, 3].forEach(i => { try { const m = localStorage.getItem('jhs_meta_' + i); if (m) out[i] = JSON.parse(m); } catch (e) { } }); return out; };
  UI.saveSlot = i => {
    const slotKey = 'jhs_slot_' + i, metaKey = 'jhs_meta_' + i;
    let prevSlot = null, prevMeta = null, slotWritten = false, metaWritten = false;
    try {
      prevSlot = localStorage.getItem(slotKey);
      prevMeta = localStorage.getItem(metaKey);
      UI.G.W.runtimeTiming = { pendingTicks: UI.G.acc || 0, speed: UI.G.speed };
      UI.G.W.speed = UI.G.speed;
      const W = UI.G.W, s = SIM.serialize(W);
      const metaStr = JSON.stringify({ text: SIM.dateText(W.t) + ' · ' + W.npcs.filter(n => !n.dead).length + ' คน · ' + Math.round(s.length / 1024) + ' KB' });
      localStorage.setItem(metaKey, metaStr); metaWritten = true;
      localStorage.setItem(slotKey, s); slotWritten = true;
      UI.toast('บันทึกลงช่อง ' + i + ' แล้ว');
      UI.render();
    } catch (e) {
      try {
        if (metaWritten) {
          if (prevMeta != null) localStorage.setItem(metaKey, prevMeta);
          else if (typeof localStorage.removeItem === 'function') localStorage.removeItem(metaKey);
        }
        if (slotWritten) {
          if (prevSlot != null) localStorage.setItem(slotKey, prevSlot);
          else if (typeof localStorage.removeItem === 'function') localStorage.removeItem(slotKey);
        }
      } catch (_) {}
      UI.toast('บันทึกไม่สำเร็จ (พื้นที่เก็บเต็ม?) ลองส่งออกเป็นไฟล์แทน');
    }
  };
  UI.loadSlot = i => { try { const s = localStorage.getItem('jhs_slot_' + i); if (!s) return; UI.G.load(s); if ($('start')) $('start').classList.add('hidden'); UI.close(); UI.toast('โหลดช่อง ' + i + ' แล้ว'); } catch (e) { UI.toast('โหลดไม่สำเร็จ: ' + e.message); } };
  UI.exportFile = () => { UI.G.W.runtimeTiming = { pendingTicks: UI.G.acc || 0, speed: UI.G.speed }; UI.G.W.speed = UI.G.speed; const s = SIM.serialize(UI.G.W); const blob = new Blob([s], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'jianghu_sect_' + UI.G.W.seed + '_y' + SIM.calendar(UI.G.W.t).year + '.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); UI.toast('ส่งออกไฟล์แล้ว'); };

  /* ---------- หน้าเริ่มเกม ---------- */
  UI.showStart = (seed) => {
    const st = $('start'); st.classList.remove('hidden'); seed = seed || String(Math.floor(Math.random() * 90000 + 10000));
    UI.selectedArchetype = UI.selectedArchetype || 'sword';
    const cands = SIM.candidates(seed, UI.selectedArchetype);
    const archs = (g.SECT && g.SECT.ARCHETYPES) ? Object.values(g.SECT.ARCHETYPES) : [];
    const curArch = (g.SECT && g.SECT.ARCHETYPES && g.SECT.ARCHETYPES[UI.selectedArchetype]) || archs[0] || { nameTh: 'สำนักกระบี่เซียน', titleTh: 'วิถีกระบี่เหินเมฆา', descTh: '', subs: [], techs: [] };

    let h = '<h1>🏯 สำนักเมฆาหยก</h1><div class="sub">เกมจำลองสำนักยุทธภพ · NPC ทุกคนคิดและใช้ชีวิตเอง<br>เลือก “ชุดวิชาประจำสำนักเริ่มต้น” และ “เจ้าสำนัก” ผู้กำหนดชะตาสำนักจริง ๆ</div>';

    if (archs.length) {
      h += '<h3 style="margin-top:10px">⚔️ เลือกชุดสำนักเริ่มต้น (Sect Archetype)</h3>';
      h += '<div class="row" style="gap:6px;margin:8px 0;flex-wrap:wrap">';
      archs.forEach(a => {
        const isSel = a.id === curArch.id;
        h += '<button type="button" class="btn' + (isSel ? ' pri' : '') + '" data-pick-arch="' + a.id + '" style="flex:1;min-width:130px;padding:7px 9px;text-align:left">';
        h += '<b style="font-size:12.5px">' + esc(a.nameTh) + '</b><div style="font-size:10.5px;opacity:0.85">' + esc(a.titleTh) + '</div>';
        h += '<div style="font-size:10px;color:var(--gold);margin-top:2px">' + a.techs.length + ' วิชา · ' + a.subs.length + ' สายย่อย</div>';
        h += '</button>';
      });
      h += '</div>';
      h += '<div class="card" style="margin-bottom:12px;background:rgba(255,255,255,0.03)"><div class="muted">' + esc(curArch.descTh) + '</div><div style="font-size:11.5px;margin-top:4px"><b>สายย่อยเริ่มต้นในสำนัก:</b> ' + curArch.subs.map(s => (CULT.subInfo(curArch.path, s) || { nameTh: s }).nameTh).join(', ') + '</div></div>';
    }

    h += '<h3>👑 เลือกเจ้าสำนัก</h3>';
    cands.forEach(c => {
      const n = c.npc, s = c.style; const top = Object.keys(s.focus).sort((a, b) => s.focus[b] - s.focus[a])[0];
      h += '<div class="cand"><div class="top">' + portraitHtml(n, 64) + '<div><div class="nm">' + esc(c.name) + '</div><div class="muted">' + esc(c.age) + ' · ' + esc(CULT.stageName(n)) + '</div><div class="muted">' + esc(c.identity.title) + '</div></div></div><div style="margin-top:6px">' + c.identity.tags.map(t => '<span class="chip v">' + esc(t) + '</span>').join('') + '</div>';
      h += '<div style="margin-top:6px">' + ['openness', 'strictness', 'meritocracy', 'expansion', 'generosity', 'secrecy'].map(k => bar(SECT.POLICY_TH[k], s[k], { wide: true, color: '#4fb2f2', txt: SECT.policyLabel(k, s[k]) })).join('') + '</div><div class="muted">จะผลักสำนักไปทาง: <b style="color:var(--gold)">' + esc(SECT.FOCUS_TH[top]) + '</b> · สนใจ' + c.identity.loves.map(esc).join(' / ') + '</div>';
      h += '<button class="btn pri" data-pick="' + c.idx + '">เลือกท่านนี้เป็นเจ้าสำนัก</button></div>';
    });
    h += '<div class="row" style="gap:8px;margin:10px 0"><button id="stReroll" style="flex:1">🎲 สุ่มผู้สมัครชุดใหม่</button><button id="stLoad" style="flex:1">📂 โหลดเกมที่บันทึก</button></div>' + (hasAuto() ? '<button id="stAuto" class="btn pri" style="width:100%;margin:0 0 8px">▶ เล่นต่อจากออโตเซฟ (' + esc(localStorage.getItem('jhs_auto_meta') || '') + ')</button>' : '') + '<div class="muted" style="text-align:center">เมล็ดโลก ' + esc(seed) + ' (เมล็ดเดียวกัน = โลกเดียวกัน)</div>';
    st.innerHTML = h; drawPortraitsCands(st, cands);
    st.querySelectorAll('[data-pick-arch]').forEach(b => b.onclick = () => { UI.selectedArchetype = b.dataset.pickArch; UI.showStart(seed); });
    st.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { st.classList.add('hidden'); UI.G.newGame(seed, +b.dataset.pick, UI.selectedArchetype || 'sword'); });
    if ($('stAuto')) $('stAuto').onclick = () => { try { UI.G.load(localStorage.getItem('jhs_auto')); st.classList.add('hidden'); } catch (e) { UI.toast('โหลดออโตเซฟไม่ได้: ' + e.message); } };
    $('stReroll').onclick = () => UI.showStart(); $('stLoad').onclick = () => { if (UI.G && UI.G.W) st.classList.add('hidden'); UI.open('menu'); };
    st.scrollTop = 0;
  };
  function hasAuto() { try { return !!localStorage.getItem('jhs_auto'); } catch (e) { return false; } }
  function drawPortraitsCands(root, cands) { root.querySelectorAll('canvas.pt').forEach((cv, i) => { Render.portrait(cv, cands[i].npc, +cv.dataset.size); }); }

  UI.init = G => {
    UI.G = G; UI.buildHud();
    const f = document.createElement('input'); f.type = 'file'; f.id = 'impFile'; f.accept = '.json,application/json'; f.style.display = 'none'; document.body.appendChild(f);
    f.onchange = () => {
      const file = f.files[0]; if (!file) return;
      const r = new FileReader();
      r.onerror = r.onabort = () => { UI.toast('ไม่สามารถอ่านไฟล์เซฟได้'); if (!G.W && $('start')) $('start').classList.remove('hidden'); };
      r.onload = () => {
        try { G.load(r.result); if ($('start')) $('start').classList.add('hidden'); UI.close(); UI.toast('นำเข้าไฟล์สำเร็จ'); }
        catch (e) { UI.toast('ไฟล์ไม่ถูกต้อง: ' + e.message); if (!G.W && $('start')) $('start').classList.remove('hidden'); }
      };
      try { r.readAsText(file); } catch (e) { UI.toast('ไม่สามารถอ่านไฟล์เซฟได้: ' + e.message); }
      f.value = '';
    };
  };
  g.UI = UI;
  if (typeof module === "object" && module.exports) module.exports = UI;
})(typeof globalThis !== 'undefined' ? globalThis : this);
