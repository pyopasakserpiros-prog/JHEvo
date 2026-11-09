'use strict';
const assert=require('assert');const g=require('./load');require('../js/ui');const {UI}=g;
const C=UI.ITEM_ART_CATALOG;
const equipment=Object.entries(C.tierFamilies).filter(([,f])=>f.group==='equipment');
assert.equal(equipment.length,28);
const armors=new Set(['HEAVY','LIGHT','ROBE','BOOTS','HELMET']);
const accessories=new Set(['RING','NECKLACE','BRACELET','CHARM','ORNAMENT','AUX_TOOL']);
for(const [family] of equipment) {
 const slot=armors.has(family)?'ARMOR':accessories.has(family)?'ACCESSORY':'WEAPON';
 const images=new Set();
 for(let tier=1;tier<=7;tier++){
  const a=UI.resolveItemArt({id:'fixture-'+family,kind:'EQUIPMENT',subType:family,slot,tier,grade:'Common'});
  assert(a&&a.tierVariant);assert.equal(a.family,family);assert.equal(a.tier,tier);images.add(a.key);
 }
 assert.equal(images.size,7,family+' must have seven distinct tier illustrations');
 const plain={id:'fixture-'+family,kind:'EQUIPMENT',subType:family,slot,tier:3,grade:'Common'};
 assert.notEqual(UI.renderAtlasIconHtml(plain),UI.renderAtlasIconHtml({...plain,grade:'Rare'}),family+' grade finish');
}
for(const [alias,family] of Object.entries(C.typeAliases)) {
 const slot=armors.has(family)?'ARMOR':accessories.has(family)?'ACCESSORY':'WEAPON';
 assert.equal(UI.resolveItemArt({kind:'EQUIPMENT',subType:alias,slot,tier:2}).family,family);
}
const actual=Object.values(g.ECO.itemById).filter(x=>x.slot);
for(const it of actual){const art=UI.resolveItemArt({...it,kind:'EQUIPMENT'});assert(art&&(art.role==='relic'||art.tierVariant),it.id+' must have a supported item image');}
for(const id of ['EQ_V234_ACC_001','EQ_V234_AUX_001']) {
 const item=g.ECO.itemById[id];if(item)assert(['ORNAMENT','AUX_TOOL'].includes(UI.resolveItemArt({...item,kind:'EQUIPMENT'}).family));
}
assert.equal(Object.entries(C.tierFamilies).filter(([,f])=>f.group==='pill').length,6);
assert.equal(Object.entries(C.tierFamilies).filter(([,f])=>f.group==='material').length,6);
const materials={MAT_ORE:'MAT_IRON_TEST',MAT_HERB:'MAT_HERB_TEST',MAT_HIDE:'MAT_HIDE_TEST',MAT_BONE:'MAT_BONE_TEST',MAT_CORE:'MAT_CORE_TEST',MAT_CRYSTAL:'MAT_CRYSTAL_TEST',FISH:'MAT_FISH_TEST'};
for(const [family,id] of Object.entries(materials)){
 const keys=Array.from({length:7},(_,i)=>UI.resolveItemArt({id,kind:'MATERIAL',tier:i+1}).key);
 assert.equal(new Set(keys).size,7,family+' tier variety');
 assert.equal(UI.resolveItemArt({id,kind:'MATERIAL'}).family,family);
}
for(const [id,cell] of [['MAT_HERB_BLOOD_GINSENG',17],['MAT_CRYSTAL_FIRE',32],['ORG_LIVER_TEST',46]]){
 const art=UI.resolveItemArt({id,kind:id.startsWith('ORG')?'ORGAN':'MATERIAL',tier:5});assert.equal(art.sheet,'materials');assert.equal(art.cell,cell);
}
const W=g.SIM.create('equipment-tier-art',{masterIdx:0}),before=g.SIM.serialize(W),rng=JSON.stringify(W.rng.getState());
for(const it of actual)UI.renderAtlasIconHtml({...it,kind:'EQUIPMENT'});
assert.equal(g.SIM.serialize(W),before);assert.equal(JSON.stringify(W.rng.getState()),rng);
console.log('PASS equipment tier art: 28 equipment families × 7 tiers, aliases and '+actual.length+' real equipment records; six pill/six material families + fish; semantic exceptions and purity');
