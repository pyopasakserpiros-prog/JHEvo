'use strict';
const assert=require('assert'),path=require('path');
const {chromium}=(()=>{try{return require('playwright');}catch{return require('../tools/cdp_playwright');}})();
(async()=>{
 const browser=await chromium.launch();
 try {
  for(const viewport of [{width:1280,height:900},{width:412,height:860}]) {
   const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(await require('../tools/browser_test_url').url(path.resolve(__dirname,'../index.html')));
   await page.click('[data-pick="0"]');
   const result=await page.evaluate(()=>{
    G.speed=0;const W=G.W,R=G.R,n=W.byId[W.sect.masterId];
    R.opts.quality='high';n.cult.stage=9;n.cult.path='XIAN';
    n.equip={WEAPON:{...VC.LEGENDARY_WEAPONS[0],minStage:1},ARMOR:{...VC.LEGENDARY_ARMORS[0],minStage:1},ACCESSORY:{...VC.LEGENDARY_ACCESSORIES[0],minStage:1}};
    R.focus(n.x,n.y,2.5);R.selected=n.id;R.setWorld(W);R.updateCastEffects(100);
    UI.doAction('preview-signature-vfx',n.id+'|sig_meteor_sword_rain');
    const ordinaryPreview=!n.castFx.legendary;
    UI.doAction('preview-signature-vfx',n.id+'|LEG_COMBAT_DUGU_NINE_SWORDS');
    R.updateCastEffects(116);R.castClock=600;R.draw(performance.now());
    const legendary=[...R.castActive.values()].some(f=>f.legendary&&f.life===1500);
    const frozen=R.castClock;R.updateCastEffects(216);const paused=frozen===R.castClock;
    const before=SIM.serialize(W),rng=JSON.stringify(W.rng.getState());
    const digest=(draw)=>{const c=document.createElement('canvas');c.width=220;c.height=220;const x=c.getContext('2d');x.translate(110,120);draw(x);let h=2166136261,pixels=0;const d=x.getImageData(0,0,220,220).data;for(let i=0;i<d.length;i++){h=Math.imul(h^d[i],16777619);if(i%4===3&&d[i])pixels++;}return [h>>>0,pixels];};
    const arts=Object.values(Render.LEGENDARY_ART_VISUALS).filter(t=>!t.passive);
    const artPixels=arts.map(a=>digest(x=>R.drawLegendaryArtVfx(x,{techId:a.id,motif:a.motif,signatureVfx:SK.resolveSignatureVfx(CULT.tech(a.id)),angle:.3},.5,false)));
    const relics=Object.values(Render.LEGENDARY_GEAR_VISUALS);
    const relicPixels=relics.map(a=>digest(x=>R.drawLegendaryRelicGlyph(x,a,30,.5,false)));
    const pure=before===SIM.serialize(W)&&rng===JSON.stringify(W.rng.getState());
    window.legendaryGallery=(kind)=>{
     const entries=kind==='arts'?arts:relics;
     const columns=kind==='arts'?5:5,cellW=260,cellH=205;
     const c=document.createElement('canvas');c.width=columns*cellW;c.height=Math.ceil(entries.length/columns)*cellH+70;
     const x=c.getContext('2d');x.fillStyle='#0c1220';x.fillRect(0,0,c.width,c.height);x.font='bold 26px sans-serif';x.fillStyle='#ffe3a1';
     x.fillText(kind==='arts'?'วิชาตำนาน — อัตลักษณ์เฉพาะบท':'อุปกรณ์ตำนาน — อัตลักษณ์ครบ 27 ชิ้น',20,40);
     entries.forEach((a,i)=>{const col=i%columns,row=Math.floor(i/columns);x.save();x.translate(col*cellW,row*cellH+65);
      x.fillStyle='#172338';x.fillRect(5,0,cellW-10,cellH-10);x.fillStyle='#f0dfbf';x.font='13px sans-serif';
      const name=a.nameTh||a.id;let lines=[''];for(const ch of name){if(x.measureText(lines.at(-1)+ch).width>cellW-35)lines.push('');lines[lines.length-1]+=ch;}
      lines.slice(0,3).forEach((txt,k)=>x.fillText(txt,14,22+k*17));x.translate(cellW/2,138);
      if(kind==='arts')R.drawLegendaryArtVfx(x,{techId:a.id,motif:a.motif,signatureVfx:SK.resolveSignatureVfx(CULT.tech(a.id)),angle:.3},.5,false);
      else R.drawLegendaryRelicGlyph(x,a,30,.5,false);x.restore();});
     document.body.replaceChildren(c);document.body.style='margin:0;background:#0c1220';return c.toDataURL('image/png');
    };
    return {ordinaryPreview,legendary,paused,pure,arts:new Set(artPixels.map(a=>a[0])).size,relics:new Set(relicPixels.map(a=>a[0])).size,visible:artPixels.concat(relicPixels).every(a=>a[1]>50)};
   });
   assert(result.ordinaryPreview&&result.legendary&&result.paused&&result.pure&&result.visible,JSON.stringify(result));
   assert.equal(result.arts,47);assert.equal(result.relics,27);assert.deepEqual(errors,[]);
   if(process.env.LEGENDARY_VFX_SNAPSHOTS){
    const dest=process.env.LEGENDARY_VFX_SNAPSHOTS;
    await page.screenshot({path:path.join(dest,`world-${viewport.width}.png`)});
    if(viewport.width>500)for(const kind of ['arts','relics']){const data=await page.evaluate(k=>window.legendaryGallery(k),kind);require('fs').writeFileSync(path.join(dest,kind+'.png'),Buffer.from(data.split(',')[1],'base64'));}
   }
   await context.close();
   console.log('PASS browser legendary VFX '+viewport.width+': real preview routing, 47 unique art pixel images, 27 unique relics, pause, serialization/RNG purity, no JS errors');
  }
  // The rebuilt offline entry must expose the same catalogs and boot without external source files.
  const page=await browser.newPage();await page.goto(await require('../tools/browser_test_url').url(path.resolve(__dirname,'../JianghuSect_single.html')));
  await page.click('[data-pick="0"]');
  assert(await page.evaluate(()=>Object.keys(Render.LEGENDARY_GEAR_VISUALS).length===27&&Object.keys(Render.LEGENDARY_ART_VISUALS).length===50));
  console.log('PASS standalone legendary catalogs and startup');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
