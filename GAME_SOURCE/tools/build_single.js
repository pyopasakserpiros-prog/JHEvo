'use strict';
// รวม index.html + css + js ทั้งหมดเป็นไฟล์เดียว: node tools/build_single.js
const fs = require('fs'), path = require('path'); const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<link[^>]+href="(css\/[^"]+)"[^>]*>/g, (m, f) => '<style>\n' + fs.readFileSync(path.join(root, f), 'utf8') + '\n</style>');
// Embed both the continent and the zoom detail art for the offline map.
html = html.replace(/url\(['"]?\.\.\/assets\/(world_atlas_(?:terrain|detail)\.jpg)['"]?\)/g, (_,file) =>
  'url("data:image/jpeg;base64,' + fs.readFileSync(path.join(root,'assets',file)).toString('base64') + '")');
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, f) => '<script>\n/* ' + f + ' */\n' + fs.readFileSync(path.join(root, f), 'utf8').replace(/<\/script/gi, '<\\/script') + '\n</script>');
// Embed generated item atlases exactly once per sheet for Android/offline use.
html = html.replace(/(['"])(assets\/item_art_[a-z]+\.webp)\1/g, (_, quote, file) =>
  JSON.stringify('data:image/webp;base64,' + fs.readFileSync(path.join(root,file)).toString('base64')));
const wuxiaAtlasPath = path.join(root, 'assets', 'wuxia_item_atlas.png');
if (fs.existsSync(wuxiaAtlasPath)) {
  html = html.replace(/(['"])(assets\/wuxia_item_atlas\.png)\1/g, () =>
    JSON.stringify('data:image/png;base64,' + fs.readFileSync(wuxiaAtlasPath).toString('base64')));
}
fs.writeFileSync(path.join(root, 'JianghuSect_single.html'), html); console.log('single file', Math.round(html.length / 1024), 'KB');
