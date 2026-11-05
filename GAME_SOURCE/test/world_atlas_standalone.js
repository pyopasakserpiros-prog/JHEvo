'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'JianghuSect_single.html'), 'utf8');
const terrain = fs.readFileSync(path.join(__dirname, '..', 'assets', 'world_atlas_terrain.jpg')).toString('base64');
assert(html.includes('data:image/jpeg;base64,' + terrain), 'standalone must embed the atlas terrain rather than depend on an external image');
assert(html.includes('atlas-viewport'), 'standalone must contain the interactive geographic atlas');
console.log('PASS atlas terrain is embedded in the offline standalone');
