'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const g=require('./load');require('../js/ui');const UI=g.UI;
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/ITEM_ART_CATALOG.json')));
assert.deepEqual(UI.ITEM_ART_CATALOG,manifest);
assert.equal(Object.keys(manifest.sheets).length,4);
for(const s of Object.values(manifest.sheets)) {
 assert.equal(s.cells.length,64);assert.equal(new Set(s.cells).size,64);
 const b=fs.readFileSync(path.join(__dirname,'..',s.url));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert(b.length>10000);
}
for(const [list,kind,count,sheet] of [[g.VC.LEGENDARY_EQUIPMENT,'EQUIPMENT',27,'equipment'],[g.JD.TECH.techniques.filter(t=>t.legendary),'TECH_MANUAL',50,'legends']]) {
 const keys=new Set();for(const item of list){const a=UI.resolveItemArt({...item,kind});assert.equal(a.sheet,sheet);assert.equal(a.grade,'Legendary');keys.add(a.key);}
 assert.equal(keys.size,count,'Every authored legendary item must have its own art');
}
const swords=Array.from({length:7},(_,i)=>({id:'generic-sword',kind:'EQUIPMENT',gearType:'SWORD',tier:i+1,grade:'Common'}));
assert.equal(new Set(swords.map(it=>UI.resolveItemArt(it).key)).size,7);
const grades=['Common','Refined','Rare','Exceptional','Legendary'];
const gradeHtml=grades.map(grade=>UI.renderAtlasIconHtml({...swords[1],grade}));assert.equal(new Set(gradeHtml).size,5);
assert.equal(UI.resolveItemArt({...swords[1],id:'other-sword'}).key,UI.resolveItemArt(swords[1]).key,'Appropriate reuse for same type and tier');
for(const [item,sheet,cell] of [
 [{id:'ITEM190_EQ_001',kind:'EQUIPMENT'},'materials',58],
 [{id:'MAT_BEAST_MEAT_TEST',kind:'MATERIAL',nameTh:'เนื้อปราณและต่อมกลิ่นอสูร'},'materials',0],
 [{id:'MAT_FANG_TEST',kind:'MATERIAL'},'materials',2],
 [{id:'MAT_HIDE_TEST',kind:'MATERIAL'},'materials',4],
 [{id:'MAT_HERB_WOOD_LIFE',kind:'MATERIAL'},'materials',16],
 [{id:'MAT_HERB_BLOOD_GINSENG',kind:'MATERIAL'},'materials',17],
 [{id:'MAT_CRYSTAL_DEMON_BLOOD',kind:'MATERIAL'},'materials',39],
 [{id:'MAT_CORE_BLOOD',kind:'MATERIAL'},'materials',15],
 [{id:'ORG_HEART_TEST',kind:'ORGAN'},'materials',45],
 [{id:'grain',kind:'PROVISION'},'materials',23],
 [{id:'stones',kind:'PROVISION'},'materials',51],
 [{id:'REC140_ALC_QI_DEW_1',kind:'RECIPE_SCROLL'},'manuals',48]
]){const art=UI.resolveItemArt(item);assert.equal(art.sheet,sheet);assert.equal(art.cell,cell,item.id);}
assert.equal(UI.resolveItemArt({id:'T:LEG_COMBAT_DUGU_NINE_SWORDS',kind:'TECH_MANUAL'}).cell,0);
assert.equal(UI.resolveItemArt({id:'uid-1',templateId:'LEG_WPN_YITIAN_SWORD',eq:{id:'LEG_WPN_YITIAN_SWORD',legendary:true},kind:'EQUIPPED'}).cell,0);
assert.equal(UI.resolveItemArt({id:'T:LEG_COMBAT_DUGU_NINE_SWORDS',kind:'CRYSTAL'}).sheet,'materials','Knowledge crystals are not scrolls');
assert.equal(UI.itemArtGrade({tier:7,eq:{id:'plain-t7',tier:7,grade:'Common'}}),'Common','Tier alone cannot declare legendary rarity');
assert.equal(UI.resolveItemArt({kind:'TECH_MANUAL',path:'constructor',tier:3}).cell,1);
assert.equal(UI.resolveItemArt(null),null);
assert(UI.renderAtlasIconHtml(null).includes('inv-atlas-ic'));
const untrusted=UI.renderAtlasIconHtml({nameTh:'<script>alert(1)</script>',kind:'TECH_MANUAL',tier:Infinity},'bad');assert(!untrusted.includes('<script>'));assert(!untrusted.includes('NaN'));assert(!untrusted.includes('Infinity'));
const W=g.SIM.create('item-art-purity',{masterIdx:0});const before=g.SIM.serialize(W),rng=JSON.stringify(W.rng.getState());
for(const it of UI.buildSectStockItems(W).concat(UI.buildPersonalBagItems(W,W.npcs[0]),UI.buildSectShopItems(W)))UI.renderAtlasIconHtml(it);
assert.equal(g.SIM.serialize(W),before);assert.equal(JSON.stringify(W.rng.getState()),rng);
const offline=fs.readFileSync(path.join(__dirname,'../JianghuSect_single.html'),'utf8');
assert.equal((offline.match(/data:image\/webp;base64,/g)||[]).length,4);assert(!/['"]assets\/item_art_[a-z]+\.webp['"]/.test(offline));
console.log('PASS item art: 256 cells, 50 unique legendary manuals, 27 unique relics, 7 sword tiers, 5 grades, real metadata/aliases, material anatomy, purity, escaping and four offline atlases');
