'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const {chromium}=(()=>{try{return require('playwright');}catch(_){return require('../tools/cdp_playwright');}})();
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(await require('../tools/browser_test_url').url(path.resolve(__dirname,'../index.html')));await page.waitForFunction(()=>window.Render&&SK.COMMON_VFX_CATALOG);
 const out=await page.evaluate(()=>{
   const ids=Object.keys(SK.COMMON_VFX_CATALOG),hashes=[],reducedHashes=[];
   const sheet=document.createElement('canvas');sheet.width=1000;sheet.height=1140;const c=sheet.getContext('2d');c.fillStyle='#122126';c.fillRect(0,0,sheet.width,sheet.height);
   const hash=data=>{let h=2166136261;for(const v of data){h^=v;h=Math.imul(h,16777619);}return h>>>0;};
   for(let i=0;i<ids.length;i++){
     const id=ids[i],x=i%5*200,y=Math.floor(i/5)*190;
     for(const reduced of [false,true]){
       const tile=document.createElement('canvas');tile.width=120;tile.height=120;const tc=tile.getContext('2d');tc.translate(60,60);
       Render.methods.drawCommonSkillVfx(tc,id,.42,15,reduced,.2);
       (reduced?reducedHashes:hashes).push(hash(tc.getImageData(0,0,120,120).data));
     }
     c.save();c.translate(x+100,y+77);c.scale(3,3);Render.methods.drawCommonSkillVfx(c,id,.42,15,false,.2);c.restore();
     // An actual-size sample alongside the enlarged silhouette.
     c.save();c.translate(x+177,y+20);Render.methods.drawCommonSkillVfx(c,id,.42,15,true,.2);c.restore();
     c.fillStyle='#d2dbd6';c.font='12px sans-serif';c.textAlign='center';c.fillText(SK.COMMON_VFX_CATALOG[id].nameTh,x+100,y+143,190);
     c.fillStyle='#93a6aa';c.font='10px sans-serif';c.fillText(id,x+100,y+164,190);
   }
   const states=document.createElement('canvas');states.width=1000;states.height=360;const sc=states.getContext('2d');sc.fillStyle='#122126';sc.fillRect(0,0,1000,360);
   const statuses=Object.keys(SK.STATUS_TO_COMMON_VFX),r=Object.assign({W:{t:10},t:.4,opts:{}},Render.methods);r.isReducedMotion=()=>true;
   for(let i=0;i<statuses.length;i++){
     const k=statuses[i],x=i%11*90+45,y=Math.floor(i/11)*180+77;
     sc.save();sc.translate(x,y);sc.scale(3,3);sc.fillStyle='#607d70';sc.fillRect(-3,-12,6,13);sc.beginPath();sc.arc(0,-16,3.3,0,Math.PI*2);sc.fill();r.drawCommonStatusAuras(sc,{sx:[{k,until:15}]});sc.restore();
     sc.fillStyle='#c7d4cd';sc.font='9px sans-serif';sc.textAlign='center';sc.fillText(k,x,y+57,86);
   }
   return {ids,hashes,reducedHashes,image:sheet.toDataURL(),states:states.toDataURL()};
 });
 assert.equal(out.ids.length,30);assert.equal(new Set(out.hashes).size,30);assert.equal(new Set(out.reducedHashes).size,30);assert.deepEqual(errors,[]);
 const dir=process.env.COMMON_VFX_GALLERY_DIR||'/tmp/common-vfx-gallery';fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'common-skill-forms.png'),Buffer.from(out.image.split(',')[1],'base64'));fs.writeFileSync(path.join(dir,'common-status-auras.png'),Buffer.from(out.states.split(',')[1],'base64'));
 console.log('PASS common VFX browser: 30 distinct forms full/reduced, 22 recipient status previews, no page errors; '+dir);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
