'use strict';
const assert=require('assert'),path=require('path');
const fs=require('fs');
const {chromium}=(()=>{try{return require('playwright');}catch(_){return require('../tools/cdp_playwright.js');}})();
(async()=>{
 const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
 const browser=await chromium.launch(executablePath?{executablePath,args:['--no-sandbox','--disable-dev-shm-usage']}:{});
 try {
  const page=await browser.newPage({viewport:{width:1024,height:720}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(await require('../tools/browser_test_url').url(path.resolve(__dirname,'../index.html')));
  await page.click('[data-pick="0"]');
  const result=await page.evaluate(()=>{
   G.speed=0;const W=G.W;const c=document.createElement('canvas');c.width=1000;c.height=500;c.id='beast-gallery';document.body.append(c);
   const ctx=c.getContext('2d'),seen=new Set(),rows=[];
   for(const [zone,z] of Object.entries(WILD.zones))for(const pool of z.pools)for(const id of pool.speciesIds){
    const sp=WILD.speciesDefinition(id),family=SK.beastFamily({...sp,speciesId:id});
    if(seen.has(family))continue;seen.add(family);WILD.init(W);W.wildlife.beasts=[];
    const b=WILD.spawn(W,zone,pool.id,{speciesId:id});if(!b)throw Error('Missing spawned representative '+id);
    const i=rows.length,x=70+(i%6)*160,y=90+Math.floor(i/6)*160;
    ctx.save();ctx.translate(x-b.x*16,y-b.y*16);G.R.drawWild(ctx,b);ctx.restore();
    const pixels=ctx.getImageData(x-40,y-40,80,80).data;let opaque=0;
    for(let p=3;p<pixels.length;p+=4)if(pixels[p]>100)opaque++;
    rows.push({id,family,opaque,skills:b.skl.length});
   }
   return rows;
  });
  assert(result.length>=10);for(const row of result){assert(row.opaque>30,JSON.stringify(row));assert(row.skills>0);}
  const regionalCount=await page.evaluate(()=>{
   const W=G.W, n=W.byId[W.sect.masterId];
   const canvas=document.getElementById('beast-gallery'), ctx=canvas.getContext('2d');
   const images=new Set();
   for(const spec of JD.CORE.regionalCompanions){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();ctx.translate(100,80);ctx.scale(3,3);
    if(!Render.drawRegionalCompanion(ctx,spec,3,0,0,0,1,true)) throw Error('Missing companion sprite for '+spec.id);
    ctx.restore();
    images.add(ctx.getImageData(60,0,80,100).data.reduce((hash,pixel)=>(hash*31+pixel)|0,0));
   }
   const pet=CULT.bindPet(W,n,'PET_REGIONAL_BODHI',{provenance:'regional_bond'});
   if(!pet.ok) throw Error(pet.reason);
   UI.openNpc(n.id,'pets');
   return images.size;
  });
  assert.strictEqual(regionalCount,12);
  const card=page.locator('.regional-pet-card[data-tier="6"]');
  await card.waitFor({state:'visible'});
  assert((await card.textContent()).includes('ภูตพฤกษาผาหยั่งราก'));
  assert.deepStrictEqual(errors,[]);
  console.log('PASS browser Canvas beast families: '+JSON.stringify(result));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
