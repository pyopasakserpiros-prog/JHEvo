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
  assert.deepStrictEqual(errors,[]);
  console.log('PASS browser Canvas beast families: '+JSON.stringify(result));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
