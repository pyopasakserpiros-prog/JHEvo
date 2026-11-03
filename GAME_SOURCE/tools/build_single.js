'use strict';
// รวม index.html + css + js ทั้งหมดเป็นไฟล์เดียว: node tools/build_single.js
const fs = require('fs'), path = require('path'); const root = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<link[^>]+href="(css\/[^"]+)"[^>]*>/g, (m, f) => '<style>\n' + fs.readFileSync(path.join(root, f), 'utf8') + '\n</style>');
// Keep the geographic atlas available when the single HTML file is opened offline.
const atlasPath = path.join(root, 'assets', 'world_atlas_terrain.jpg');
html = html.replace(/url\(['"]?\.\.\/assets\/world_atlas_terrain\.jpg['"]?\)/g, () => 'url("data:image/jpeg;base64,' + fs.readFileSync(atlasPath).toString('base64') + '")');
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, f) => '<script>\n/* ' + f + ' */\n' + fs.readFileSync(path.join(root, f), 'utf8').replace(/<\/script/gi, '<\\/script') + '\n</script>');
fs.writeFileSync(path.join(root, 'JianghuSect_single.html'), html); console.log('single file', Math.round(html.length / 1024), 'KB');
