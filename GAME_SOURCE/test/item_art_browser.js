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
   const images={};await Promise.all(Object.entries(UI.ITEM_ART_CATALOG.sheets).map(([key,s])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{
     if(im.width!==s.width||im.height!==s.height){reject(new Error('Wrong atlas dimensions: '+key));return;}
     if(s.width===768){const cv=document.createElement('canvas');cv.width=cv.height=768;const x=cv.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,768,768).data;
      for(let p=0;p<768;p++)for(let cell=0;cell<8;cell++)for(const edge of [cell*96,cell*96+95])if(d[(edge*768+p)*4+3]||d[(p*768+edge)*4+3]){reject(new Error('Sprite bleeds at cell boundary: '+key));return;}}
     images[key]=im;resolve();};im.onerror=()=>reject(new Error('Atlas load failed: '+key));im.src=s.url;})));
   const pixelHash=it=>{const art=UI.resolveItemArt(it),im=images[art.sheet],c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d');
    const el=document.createElement('div');el.innerHTML=UI.renderAtlasIconHtml(it,48);document.body.append(el);x.filter=getComputedStyle(el.querySelector('.item-art-picture')).filter;
    x.drawImage(im,art.col*im.width/8,art.row*im.height/8,im.width/8,im.height/8,0,0,48,48);el.remove();let h=2166136261;for(const v of x.getImageData(0,0,48,48).data)h=Math.imul(h^v,16777619);return h>>>0;};
   const sword={id:'ordinary-sword',kind:'EQUIPMENT',slot:'WEAPON',gearType:'SWORD',nameTh:'กระบี่',tier:2,grade:'Common'};
   const tiers=Array.from({length:7},(_,i)=>({...sword,tier:i+1})),grades=['Common','Refined','Rare','Exceptional','Legendary'].map(grade=>({...sword,grade}));
   const before=SIM.serialize(W),rng=JSON.stringify(W.rng.getState());
   const familyEntries=Object.entries(UI.ITEM_ART_CATALOG.tierFamilies);
   const armorFamilies=new Set(['HEAVY','LIGHT','ROBE','BOOTS','HELMET']),accFamilies=new Set(['RING','NECKLACE','BRACELET','CHARM','ORNAMENT','AUX_TOOL']);
   const sampleFamily=(family,spec,tier,grade='Common')=>({id:spec.group==='equipment'?'preview-'+family:family==='FISH'?'MAT_FISH_PREVIEW':family,
    kind:spec.group==='equipment'?'EQUIPMENT':spec.group==='pill'?'PILL':'MATERIAL',subType:family,
    slot:spec.group==='equipment'?(armorFamilies.has(family)?'ARMOR':accFamilies.has(family)?'ACCESSORY':'WEAPON'):undefined,tier,grade});
   const equipmentFamilies=familyEntries.filter(([,f])=>f.group==='equipment'),otherFamilies=familyEntries.filter(([,f])=>f.group!=='equipment');
   const failedFamilies=familyEntries.filter(([family,spec])=>new Set(Array.from({length:7},(_,i)=>pixelHash(sampleFamily(family,spec,i+1)))).size!==7).map(([family])=>family);
   const failedGradeFamilies=equipmentFamilies.filter(([family,spec])=>new Set(['Common','Refined','Rare','Exceptional','Legendary'].map(grade=>pixelHash(sampleFamily(family,spec,2,grade)))).size!==5).map(([family])=>family);
   window.tierArtGallery=group=>{
    const families=group==='equipment'?equipmentFamilies:otherFamilies;
    const cols=group==='equipment'?8:7,rowHeight=94,left=174,cellWidth=91;
    const c=document.createElement('canvas');c.width=left+cols*cellWidth+10;c.height=90+families.length*rowHeight;
    const x=c.getContext('2d');x.fillStyle='#102c27';x.fillRect(0,0,c.width,c.height);
    x.fillStyle='#ffe4a7';x.font='bold 22px sans-serif';x.fillText(group==='equipment'?'อุปกรณ์ทุกประเภท · ภาพตาม Tier และเกรด':'โอสถ วัตถุดิบ และปลา · ภาพตาม Tier',14,30);
    x.font='14px sans-serif';for(let i=0;i<cols;i++)x.fillText(i<7?'T'+(i+1):'ตำนานทั่วไป',left+i*cellWidth+8,62);
    const names={SWORD:'กระบี่',BLADE:'ดาบ',SPEAR:'ทวน / หอก',STAFF:'พลอง',FIST:'สนับมือ / หมัด',BOW:'ธนู',FOCUS:'สื่อปราณ',DAGGER:'มีดสั้น',ZITHER:'พิณ',BRUSH:'พู่กัน',WHIP:'แส้',ROSARY:'ประคำ',CLAW:'กรงเล็บ',NEEDLE:'เข็ม',FAN:'พัด',ASTROLABE:'จานดารา',ABACUS:'ลูกคิด',HEAVY:'เกราะหนัก',LIGHT:'เกราะเบา',ROBE:'ชุดคลุม',BOOTS:'รองเท้า',HELMET:'หมวก / เกราะศีรษะ',RING:'แหวน',NECKLACE:'สร้อย / จี้',BRACELET:'กำไล',CHARM:'ยันต์ / ตราพก',ORNAMENT:'หยกประดับ',AUX_TOOL:'เครื่องมือเสริม',PILL_HEAL:'โอสถฟื้นชีวิต',PILL_QI:'โอสถฟื้นปราณ',PILL_BREAK:'โอสถทะลวง',PILL_DETOX:'โอสถถอนพิษ',PILL_BODY:'โอสถเสริมกาย',PILL_SOUL:'โอสถบำรุงจิต',MAT_ORE:'แร่ทั่วไป',MAT_HERB:'สมุนไพรใบ',MAT_HIDE:'หนังอสูร',MAT_BONE:'กระดูกอสูร',MAT_CORE:'แก่นอสูร',MAT_CRYSTAL:'ผลึกทั่วไป',FISH:'ปลา'};
    families.forEach(([family,spec],row)=>{
     const y=80+row*rowHeight;x.fillStyle=row%2?'#173a31':'#14332e';x.fillRect(0,y,c.width,rowHeight-3);x.fillStyle='#eddfbe';x.font='14px sans-serif';x.fillText(names[family]||family,12,y+45);
     for(let col=0;col<cols;col++){
      const item=sampleFamily(family,spec,col<7?col+1:7,col===7?'Legendary':'Common');const a=UI.resolveItemArt(item),im=images[a.sheet];
      const holder=document.createElement('div');holder.innerHTML=UI.renderAtlasIconHtml(item,72);document.body.append(holder);
      x.save();x.filter=getComputedStyle(holder.querySelector('.item-art-picture')).filter;holder.remove();
      x.drawImage(im,a.col*im.width/8,a.row*im.height/8,im.width/8,im.height/8,left+col*cellWidth+4,y+7,72,72);x.restore();
     }
    });return c.toDataURL('image/png');
   };
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
   return {...keys,pure,equipmentFamilies:equipmentFamilies.length,otherFamilies:otherFamilies.length,failedFamilies,failedGradeFamilies,loaded:Object.keys(images).length,overflow:document.documentElement.scrollWidth>innerWidth+1,icons:document.querySelectorAll('.item-art').length};
  });
  assert.equal(result.equipmentFamilies,28);assert.equal(result.otherFamilies,13);assert.deepEqual(result.failedFamilies,[]);assert.deepEqual(result.failedGradeFamilies,[]);assert.equal(result.loaded,9);assert.equal(result.tiers,7);assert.equal(result.grades,5);assert.equal(result.manuals,50);assert.equal(result.gear,27);assert(result.pure);assert(!result.overflow);assert(result.icons>0);assert.deepEqual(errors,[]);
  if(process.env.ITEM_ART_SNAPSHOTS){const dest=process.env.ITEM_ART_SNAPSHOTS;fs.mkdirSync(dest,{recursive:true});await page.screenshot({path:path.join(dest,'inventory-'+width+'.png')});await page.evaluate(()=>window.itemArtProof());await page.screenshot({path:path.join(dest,'tiers-grades-'+width+'.png')});if(width===1280)for(const group of ['equipment','others']){const data=await page.evaluate(g=>window.tierArtGallery(g),group);fs.writeFileSync(path.join(dest,'all-'+group+'-tiers.png'),Buffer.from(data.split(',')[1],'base64'));}}
  await context.close();console.log('PASS item art browser '+width+': nine loaded atlases, 28 equipment + 13 other families × 7 tier pixels, 5 grade pixels, 50 unique manuals / 27 relic pixels, purity, no overflow/errors');
 }
 const page=await browser.newPage();await page.goto(await require('../tools/browser_test_url').url(path.resolve(__dirname,'../JianghuSect_single.html')));await page.click('[data-pick="0"]');
 assert(await page.evaluate(async()=>{const sheets=Object.values(UI.ITEM_ART_CATALOG.sheets);if(sheets.some(s=>!s.url.startsWith('data:image/webp;base64,')))return false;await Promise.all(sheets.map(s=>new Promise((yes,no)=>{const im=new Image();im.onload=yes;im.onerror=no;im.src=s.url;})));return true;}));
 console.log('PASS offline single HTML: all nine atlases decode from embedded WebP without external image URLs');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
