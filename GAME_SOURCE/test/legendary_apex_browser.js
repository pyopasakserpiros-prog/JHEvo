'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const {chromium}=(()=>{try{return require('playwright');}catch(_){return require('../tools/cdp_playwright');}})();
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(await require('../tools/browser_test_url').url(path.resolve(__dirname,'../index.html')));await page.waitForFunction(()=>window.Render&&Render.LEGENDARY_SCENES);
 const out=await page.evaluate(capture=>{
  const rr=Object.assign({opts:{quality:'high'},t:.5,W:{t:1},castClock:1150},Render.methods);rr.isReducedMotion=()=>false;
  const arts=Object.values(Render.LEGENDARY_ART_VISUALS).filter(a=>!a.passive),relics=Object.values(Render.LEGENDARY_GEAR_VISUALS);
  const fxFor=a=>({techId:a.id,motif:a.motif,signatureVfx:SK.resolveSignatureVfx(CULT.tech(a.id)),angle:.25});
  const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const hash=c=>{let h=2166136261,count=0;const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=0;i<data.length;i++){h=Math.imul(h^data[i],16777619);if(i%4===3&&data[i])count++;}return[h>>>0,count];};
  const draw=(ctx,a,p,reduced,relic)=>{if(relic)rr.drawLegendaryRelicScene(ctx,{relicId:a.id},p,reduced);else rr.drawLegendaryArtVfx(ctx,fxFor(a),p,reduced);};
  const unique=[];
  for(const low of [false,true])for(const reduced of [false,true]){rr.opts.quality=low?'low':'high';for(const relic of [false,true]){const set=relic?relics:arts,hs=[];for(const a of set){const c=canvas(300,300),ctx=c.getContext('2d');ctx.translate(150,160);draw(ctx,a,.56,reduced,relic);const h=hash(c);if(h[1]<80)throw Error(a.id+' blank');hs.push(h[0]);}unique.push({low,reduced,relic,count:new Set(hs).size,expected:set.length});}}
  rr.opts.quality='high';
  function gallery(entries,relic){const c=canvas(5*340,Math.ceil(entries.length/5)*300),ctx=c.getContext('2d');ctx.fillStyle='#101b29';ctx.fillRect(0,0,c.width,c.height);entries.forEach((a,i)=>{const x=i%5*340,y=Math.floor(i/5)*300;ctx.save();ctx.translate(x+170,y+155);draw(ctx,a,.56,false,relic);ctx.restore();ctx.textAlign='center';ctx.font='11px sans-serif';ctx.fillStyle='#f2e6c5';ctx.fillText(a.nameTh,x+170,y+264,324);ctx.fillStyle='#8dacc6';ctx.font='9px monospace';ctx.fillText(a.id,x+170,y+283,324);});return c.toDataURL();}
  const examples=[arts.find(a=>a.id==='LEG_COMBAT_DUGU_NINE_SWORDS'),arts.find(a=>a.id==='LEG_COMBAT_DRAGON_SUBDUING_PALMS'),arts.find(a=>a.id==='LEG_COMBAT_JADE_NIRVANA_HARMONY'),arts.find(a=>a.id==='LEG_V230_VOID_SPACE'),arts.find(a=>a.id==='LEG_AUX_IMPERIAL_EIGHT_GATES')];
  const timeline=canvas(1500,examples.length*280),tc=timeline.getContext('2d');tc.fillStyle='#101b29';tc.fillRect(0,0,timeline.width,timeline.height);
  examples.forEach((a,row)=>{[null,.1,.34,.56,.88].forEach((p,col)=>{tc.save();tc.translate(col*300+150,row*280+135);if(p===null)rr.drawLegacyLegendaryArtVfx(tc,fxFor(a),.5,false);else draw(tc,a,p,false,false);tc.restore();tc.textAlign='center';tc.font='13px sans-serif';tc.fillStyle='#e6d9b8';tc.fillText(p===null?'เดิม':['เดิม','รวมพลัง','ปรากฏรูป','สำแดง','ร่องรอย'][col],col*300+150,row*280+246);});tc.font='10px sans-serif';tc.fillStyle='#a8bfd0';tc.fillText(a.nameTh,750,row*280+270,1400);});
  // Bounded simultaneous-scene stress at a mobile-sized backing canvas.
  const stress=canvas(412,860),sc=stress.getContext('2d'),stressStats=[];
  for(const quality of ['high','low']){rr.opts.quality=quality;rr.castActive=new Map();for(let i=0;i<24;i++)rr.castActive.set(i,{...(i%2?{relicId:relics[i].id}:{...fxFor(arts[i]),legendary:true}),x:100+i%3*80,y:120+Math.floor(i/3)*85,start:0,life:2300});const times=[];for(let f=0;f<35;f++){sc.clearRect(0,0,412,860);rr.castClock=700+f*17;const t=performance.now();rr.drawCastEffects(sc);times.push(performance.now()-t);}times.sort((a,b)=>a-b);stressStats.push({quality,avg:times.reduce((a,b)=>a+b,0)/times.length,p95:times[Math.floor(times.length*.95)]});}
  rr.opts.quality='high';
  const frames=[];
  if(capture)for(let i=0;i<50;i++){const c=canvas(900,430),ctx=c.getContext('2d'),p=(i+.5)/50;ctx.fillStyle='#101b29';ctx.fillRect(0,0,900,430);
   const pair=[examples[1],examples[2],relics[0]];pair.forEach((a,j)=>{ctx.save();ctx.translate(150+j*300,215);draw(ctx,a,p,false,j===2);ctx.restore();ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillStyle='#eee1bf';ctx.fillText(j===0?'วิชาโจมตีตำนาน':j===1?'วิชาหนุนนำตำนาน':'อุปกรณ์ตำนาน',150+j*300,370);});frames.push(c.toDataURL());}
  return{unique,stressStats,arts:capture?gallery(arts,false):null,relics:capture?gallery(relics,true):null,timeline:capture?timeline.toDataURL():null,frames};
 },!!process.env.LEGENDARY_APEX_GALLERY_DIR);
 for(const row of out.unique)assert.equal(row.count,row.expected,JSON.stringify(row));assert.deepEqual(errors,[]);
 for(const row of out.stressStats)assert(row.avg<50,'Canvas stress average must stay below 50 ms: '+JSON.stringify(row));
 const dest=process.env.LEGENDARY_APEX_GALLERY_DIR;if(dest){fs.mkdirSync(dest,{recursive:true});for(const key of ['arts','relics','timeline'])fs.writeFileSync(path.join(dest,key+'.png'),Buffer.from(out[key].split(',')[1],'base64'));const frameDir=process.env.LEGENDARY_APEX_FRAME_DIR||'/tmp/legendary-apex-frames';fs.mkdirSync(frameDir,{recursive:true});out.frames.forEach((data,i)=>fs.writeFileSync(path.join(frameDir,String(i).padStart(3,'0')+'.png'),Buffer.from(data.split(',')[1],'base64')));}
 console.log('PASS Legendary Apex browser: 47 arts / 27 relic scenes distinct in High/Low × normal/Reduced Motion, no page errors; Canvas 24-scene stress '+JSON.stringify(out.stressStats));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
