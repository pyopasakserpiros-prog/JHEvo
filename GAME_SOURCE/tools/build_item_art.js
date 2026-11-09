'use strict';
// Rebuild the small UI catalog after editing ITEM_ART_CATALOG.json. Artwork is not regenerated.
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/ITEM_ART_CATALOG.json'),'utf8'));
for(const spec of Object.values(manifest.sheets)) {
 if(spec.cells.length!==64||!fs.statSync(path.join(root,spec.url)).size)throw new Error('Invalid/missing atlas '+spec.url);
}
const file=path.join(root,'js/ui.js'),source=fs.readFileSync(file,'utf8');
const block='  // ITEM_ART_CATALOG_START\n  const ITEM_ART = '+JSON.stringify(manifest)+';\n  // ITEM_ART_CATALOG_END';
if(!source.includes('// ITEM_ART_CATALOG_START'))throw new Error('UI catalog markers are missing');
fs.writeFileSync(file,source.replace(/  \/\/ ITEM_ART_CATALOG_START[\s\S]*?  \/\/ ITEM_ART_CATALOG_END/,block));
console.log('Item art catalog: 4 sheets / 256 cells / '+Object.keys(manifest.legendaryEquipment).length+' relics / '+Object.keys(manifest.legendaryTechniques).length+' legendary manuals');
