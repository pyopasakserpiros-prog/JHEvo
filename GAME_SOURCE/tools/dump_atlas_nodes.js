'use strict';
// ดึงพิกัดสถานที่คงที่ทั้งหมดของแผนที่ยุทธภพจากข้อมูลเกมจริง เพื่อใช้วาดภูมิประเทศให้ตรงกับหมุด
// ใช้งาน: node tools/dump_atlas_nodes.js > nodes.json
const path = require('path');
const root = path.join(__dirname, '..');
const G = require(path.join(root, 'test', 'load'));
require(path.join(root, 'js', 'ui'));
const { SIM, UI, EXPED } = G;
const W = SIM.create('atlas-terrain-dump');
const atlas = UI.buildWorldAtlas(W);
const nodes = atlas.nodes.map(n => ({
  id: n.id, kind: n.kind, terrain: n.terrain || null, region: n.macroRegion, x: n.x, y: n.y,
  approximate: !!n.approximate, name: n.rawNameTh || n.nameTh, alignment: n.alignment || null,
  tier: n.tierLevel || null, icon: n.icon || null
}));
const regions = Object.values(EXPED.WORLD_REGIONS).map(r => ({ id: r.id, shortTh: r.shortTh, terrain: r.terrain, center: r.center }));
process.stdout.write(JSON.stringify({ nodes, regions, routes: EXPED.WORLD_ROUTES }));
