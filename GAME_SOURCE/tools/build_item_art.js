'use strict';
// Rebuild the small UI catalog after editing ITEM_ART_CATALOG.json. Artwork is not regenerated.
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/ITEM_ART_CATALOG.json'),'utf8'));
for(const spec of Object.values(manifest.sheets)) {
 if(spec.cells.length!==64||!fs.statSync(path.join(root,spec.url)).size)throw new Error('Invalid/missing atlas '+spec.url);
 const data=fs.readFileSync(path.join(root,spec.url));
 if(data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WEBP'||data.toString('ascii',12,16)!=='VP8X'||data.readUIntLE(24,3)+1!==spec.width||data.readUIntLE(27,3)+1!==spec.height)throw new Error('Atlas dimensions/encoding differ from manifest: '+spec.url);
}
for(const [family,spec] of Object.entries(manifest.tierFamilies || {})) {
 if(!manifest.sheets[spec.sheet]||spec.cells.length!==8||spec.cells.some(c=>!Number.isInteger(c)||c<0||c>=64))throw new Error('Invalid tier family '+family);
}
const file=path.join(root,'js/ui.js'),source=fs.readFileSync(file,'utf8');
const block='  // ITEM_ART_CATALOG_START\n  const ITEM_ART = '+JSON.stringify(manifest)+';\n  // ITEM_ART_CATALOG_END';
if(!source.includes('// ITEM_ART_CATALOG_START'))throw new Error('UI catalog markers are missing');
fs.writeFileSync(file,source.replace(/  \/\/ ITEM_ART_CATALOG_START[\s\S]*?  \/\/ ITEM_ART_CATALOG_END/,block));
console.log('Item art catalog: '+Object.keys(manifest.sheets).length+' sheets / '+Object.values(manifest.sheets).reduce((n,s)=>n+s.cells.length,0)+' cells / '+Object.keys(manifest.legendaryEquipment).length+' relics / '+Object.keys(manifest.legendaryTechniques).length+' legendary manuals');
