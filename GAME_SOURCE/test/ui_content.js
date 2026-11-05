'use strict';
const assert=require('assert'),G=require('./load');
G.document={getElementById(){return {querySelectorAll(){return[];},style:{},classList:{add(){},remove(){}}};}};
require('../js/ui.js');const {UI,SIM,JD,ECO,EXT,CONTENT:C}=G;
const W=SIM.create('ui-content');UI.G={W,R:{},opts:{},acc:13,speed:32};UI.tab='content';
let html=UI.rWorld();assert(html.includes('พื้นที่')||html.includes('เส้นทาง'));assert(!html.includes('undefined'));assert(!html.includes('NaN'));
assert(html.includes('🔒'));for(const r of JD.EXPANSION.regions)assert(html.includes(r.nameTh));
const tribW=SIM.create('ui-tribulation');
const tribCandidate=tribW.byId[tribW.sect.masterId];tribCandidate.cult.path='XIAN';tribCandidate.cult.stage=G.CULT.maxStage(tribCandidate);
ECO.add(tribW,'P:REC190_PILL_004',1);UI.G.W=tribW;UI.bldId=tribW.map.byId.ancestral?'ancestral':'shrine';
html=UI.rBuilding();assert(html.includes('ด่านเคราะห์สวรรค์และจุติ'));assert(html.includes('เริ่มพิธี + ใช้โอสถ'));assert(html.includes('เริ่มพิธี'));
const priorUiFns={toast:UI.toast,render:UI.render,updateHud:UI.updateHud};let tribToast='';
UI.toast=msg=>{tribToast=String(msg);};UI.render=()=>{};UI.updateHud=()=>{};
UI.doAction('begin-tribulation',tribCandidate.id+'|no-medicine');
assert(tribW.sect.celestialTribulation.active,'Shrine action should begin and persist the preparation');assert.equal(ECO.count(tribW,'P:REC190_PILL_004'),1,'the no-medicine control should preserve stock');assert(tribToast.includes('3 วัน'));
UI.toast=priorUiFns.toast;UI.render=priorUiFns.render;UI.updateHud=priorUiFns.updateHud;UI.G.W=W;UI.bldId=null;
// Test personal scroll holder visibility in UI.rContent and UI.rNpc
const heldRecipe=JD.EXPANSION.recipes[0];
W.npcs[1].inv.recipes=[heldRecipe.id];
C.grantRecipeAuth(W,W.npcs[1],heldRecipe.id);
html=UI.rContent();assert(html.includes(heldRecipe.nameTh),'personally held formula should show its name and holder');assert(html.includes('ม้วนตำรับอยู่กับ'));
UI.npcId=W.npcs[1].id;UI.tab='ov';
const npcHtml=UI.rNpc();assert(npcHtml.includes('ม้วนตำรับ'+heldRecipe.nameTh),'NPC sheet should display held personal formula scroll');assert(npcHtml.includes('ตำรับที่ได้รับสิทธิ์ศึกษา'),'NPC sheet should display authorized formulas');assert(!npcHtml.includes('undefined'));assert(!npcHtml.includes('NaN'));
const snapshot=SIM.serialize(W),rng=W.rng.getState();
UI.tab='posts';const officesHtml=UI.rSect();assert(officesHtml.includes('ยังไม่ปลดล็อก'));for(const p of Object.values(G.SECT.PLANNED_POSTS))assert(officesHtml.includes(p.nameTh));
UI.tab='ov';UI.rNpc();assert.equal(SIM.serialize(W),snapshot,'cognitive UI reads never change the simulation');assert.deepEqual(W.rng.getState(),rng);
assert(npcHtml.includes('หน้าที่และความตั้งใจ'));
W.npcs[1].inv.recipes=[];
W.sect.knownRecipes=JD.EXPANSION.recipes.map(r=>r.id);W.sect.library.push(...JD.EXPANSION.techniques.map(t=>t.id));W.sect.recipeTier=3;
html=UI.rContent();for(const r of JD.EXPANSION.recipes)assert(html.includes(r.nameTh));for(const t of JD.EXPANSION.techniques)assert(html.includes(t.nameTh));
assert(html.includes('ค่าเรียน'));assert(html.includes('ค่าสิทธิ์ศึกษา'));assert(!html.includes('undefined'));assert(!html.includes('NaN'));
for(const tab of ['exp','disc','sects','hist']){UI.tab=tab;assert(typeof UI.rWorld()==='string');}
for(const tab of ['over','policy','posts','stock','shop','bld']){UI.tab=tab;assert(typeof UI.rSect()==='string');}
const visitor=EXT.openVisit(W,{nameTh:'พ่อค้าทดสอบ UI',stones:500,stock:{'MAT_ORE_BLACK_IRON_1':3},wants:{'MAT_HERB_DEW_GRASS_1':2},stayDays:2});UI.tab='shop';html=UI.rSect();assert(html.includes('ตลาดภายนอก'));assert(html.includes('ขอสิทธิ์ตำรับ'));assert(html.includes(visitor.nameTh));assert(html.includes('ธุรกรรมภายนอกล่าสุด'));assert(!html.includes('undefined'));assert(!html.includes('NaN'));
require('../js/render.js');const markerTexts=[];const ctx={font:'',textAlign:'',fillStyle:'',strokeStyle:'',lineWidth:1,measureText(t){return{width:t.length*5};},fillRect(){},strokeRect(){},fillText(t){markerTexts.push(t);},strokeText(){}};G.Render.methods.drawMarkers.call({W,cam:{z:1},selected:null},ctx);assert(markerTexts.some(t=>String(t).includes('พ่อค้า')),'active traders should be visible by the market map marker');
console.log('PASS native UI content, discovery locks, personal formula scrolls, external market panel/map marker and existing world/sect tab renderers');
