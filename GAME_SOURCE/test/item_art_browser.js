'use strict';
const assert=require('assert'),path=require('path'),fs=require('fs');
const {chromium}=(()=>{try{return require('playwright');}catch{return require('../tools/cdp_playwright');}})();
(async()=>{
 const browser=await chromium.launch();try{
 for(const width of [360,412,1280]){
  const context=await browser.newContext({viewport:{width,height:860}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(await require('../tools/browser_test_url').url(path.resolve(__dirname,'../index.html')));await page.click('[data-pick="0"]');
  const result=await page.evaluate(async()=>{
   G.speed=0;const W=G.W,n=W.byId[W.sect.masterId];
   const images={};await Promise.all(Object.entries(UI.ITEM_ART_CATALOG.sheets).map(([key,s])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[key]=im;resolve();};im.onerror=()=>reject(new Error('Atlas load failed: '+key));im.src=s.url;})));
   const pixelHash=it=>{const art=UI.resolveItemArt(it),im=images[art.sheet],c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d');
    const el=document.createElement('div');el.innerHTML=UI.renderAtlasIconHtml(it,48);document.body.append(el);x.filter=getComputedStyle(el.querySelector('.item-art-picture')).filter;
    x.drawImage(im,art.col*im.width/8,art.row*im.height/8,im.width/8,im.height/8,0,0,48,48);el.remove();let h=2166136261;for(const v of x.getImageData(0,0,48,48).data)h=Math.imul(h^v,16777619);return h>>>0;};
   const sword={id:'ordinary-sword',kind:'EQUIPMENT',slot:'WEAPON',gearType:'SWORD',nameTh:'กระบี่',tier:2,grade:'Common'};
   const tiers=Array.from({length:7},(_,i)=>({...sword,tier:i+1})),grades=['Common','Refined','Rare','Exceptional','Legendary'].map(grade=>({...sword,grade}));
   const before=SIM.serialize(W),rng=JSON.stringify(W.rng.getState());
   const keys={tiers:new Set(tiers.map(pixelHash)).size,grades:new Set(grades.map(pixelHash)).size,
    manuals:new Set(JD.TECH.techniques.filter(t=>t.legendary).map(t=>pixelHash({...t,kind:'TECH_MANUAL'}))).size,
    gear:new Set(VC.LEGENDARY_EQUIPMENT.map(t=>pixelHash({...t,kind:'EQUIPMENT'}))).size};
   const pure=before===SIM.serialize(W)&&rng===JSON.stringify(W.rng.getState());
   const mats=Object.keys(ECO.matById).filter(id=>/MEAT|FANG|HIDE|BONE|GINSENG|LOTUS|ORE|BLOOD|FEATHER|SHELL/.test(id)).slice(0,36);
   for(const id of mats)W.sect.stock[id]=10;
   W.sect.library=JD.TECH.techniques.filter(t=>t.legendary).map(t=>t.id);
   W.sect.gear=VC.LEGENDARY_EQUIPMENT.map(t=>ECO.mintGear(t,1.35));
   UI.setInvViewMode('grid');UI.open('sect','stockItems');UI.stockCat='MANUAL';UI.stockPage=0;UI.render();
   window.itemArtProof=()=>{const section=document.createElement('section');section.style='position:fixed;inset:0;z-index:99999;background:#12372e;padding:16px;overflow:auto;font:14px sans-serif;color:#ffe5a7';
    section.innerHTML='<h2>ภาพไอเท็ม · Tier และเกรด</h2><h3>กระบี่ T1–T7</h3><div style="display:flex;gap:6px;flex-wrap:wrap">'+tiers.map(it=>'<div>'+UI.renderAtlasIconHtml(it,56)+'<div>T'+it.tier+'</div></div>').join('')+'</div><h3>กระบี่ T2 · ต่างเกรด</h3><div style="display:flex;gap:6px;flex-wrap:wrap">'+grades.map(it=>'<div>'+UI.renderAtlasIconHtml(it,56)+'<div>'+it.grade+'</div></div>').join('')+'</div><h3>ตำนานเฉพาะชิ้น / เฉพาะบท</h3><div style="display:flex;gap:6px;flex-wrap:wrap">'+VC.LEGENDARY_EQUIPMENT.slice(0,8).concat(JD.TECH.techniques.filter(t=>t.legendary).slice(0,8).map(t=>({...t,kind:'TECH_MANUAL'}))).map(it=>UI.renderAtlasIconHtml({...it,kind:it.kind||'EQUIPMENT'},56)).join('')+'</div><h3>วัตถุดิบและโอสถ</h3><div style="display:flex;gap:6px;flex-wrap:wrap">'+mats.slice(0,8).map(id=>UI.renderAtlasIconHtml({id,kind:'MATERIAL'},56)).join('')+Object.values(ECO.itemById).filter(it=>it.cat==='PILL').slice(0,8).map(it=>UI.renderAtlasIconHtml({...it,kind:'PILL'},56)).join('')+'</div>';document.body.append(section);};
   return {...keys,pure,loaded:Object.keys(images).length,overflow:document.documentElement.scrollWidth>innerWidth+1,icons:document.querySelectorAll('.item-art').length};
  });
  assert.equal(result.loaded,4);assert.equal(result.tiers,7);assert.equal(result.grades,5);assert.equal(result.manuals,50);assert.equal(result.gear,27);assert(result.pure);assert(!result.overflow);assert(result.icons>0);assert.deepEqual(errors,[]);
  if(process.env.ITEM_ART_SNAPSHOTS){const dest=process.env.ITEM_ART_SNAPSHOTS;fs.mkdirSync(dest,{recursive:true});await page.screenshot({path:path.join(dest,'inventory-'+width+'.png')});await page.evaluate(()=>window.itemArtProof());await page.screenshot({path:path.join(dest,'tiers-grades-'+width+'.png')});}
  await context.close();console.log('PASS item art browser '+width+': four loaded atlases, 7 tier pixels, 5 grade pixels, 50 unique manuals / 27 relic pixels, purity, no overflow/errors');
 }
 const page=await browser.newPage();await page.goto(await require('../tools/browser_test_url').url(path.resolve(__dirname,'../JianghuSect_single.html')));await page.click('[data-pick="0"]');
 assert(await page.evaluate(async()=>{const sheets=Object.values(UI.ITEM_ART_CATALOG.sheets);if(sheets.some(s=>!s.url.startsWith('data:image/webp;base64,')))return false;await Promise.all(sheets.map(s=>new Promise((yes,no)=>{const im=new Image();im.onload=yes;im.onerror=no;im.src=s.url;})));return true;}));
 console.log('PASS offline single HTML: all four atlases decode from embedded WebP without external image URLs');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
