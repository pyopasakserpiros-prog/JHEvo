'use strict';
// Deterministically slice/repack an approved generated atlas; no drawing or image synthesis.
// node tools/normalize_item_sheet.js /absolute/path/source.png resources
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..'),source=path.resolve(process.argv[2]||''),key=process.argv[3];
const layouts=JSON.parse(fs.readFileSync(path.join(root,'docs/ITEM_ART_TIER_CROPS.json'),'utf8'));
if(!Object.prototype.hasOwnProperty.call(layouts,key)||!fs.existsSync(source))throw new Error('Supply source image and a known crop-layout key');
const spec=layouts[key],dims=spawnSync('magick',['identify','-format','%w %h',source],{encoding:'utf8'});
if(dims.status!==0||dims.stdout.trim()!==spec.sourceWidth+' '+spec.sourceHeight)throw new Error('Source dimensions do not match the approved crop layout');
const args=['-limit','thread','1',source,'-write','mpr:atlas','+delete'];
for(let row=0;row<8;row++){
 args.push('(');
 for(let col=0;col<8;col++){
  const [x,y,w,h]=spec.boxes[row*8+col];
  args.push('(','mpr:atlas','-gravity','NorthWest','-crop',`${w}x${h}+${x}+${y}`,'+repage','-resize',`${spec.innerSize}x${spec.innerSize}`,'-gravity','center','-background','none','-extent',`${spec.cellSize}x${spec.cellSize}`,')');
 }
 args.push('+append',')');
}
const target=path.join(root,'assets','item_art_'+key+'.webp');
args.push('-append','-quality','88','-define','webp:method=4',target);
const r=spawnSync('magick',args,{encoding:'utf8',timeout:120000});
if(r.status!==0)throw new Error(r.stderr||'Atlas normalization failed');
console.log('Normalized '+key+': 64 fixed cells, '+(spec.cellSize*8)+'², subject <= '+spec.innerSize+'px/cell -> '+target);
