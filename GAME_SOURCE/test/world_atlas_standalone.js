'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'JianghuSect_single.html'), 'utf8');
const terrain = fs.readFileSync(path.join(__dirname, '..', 'assets', 'world_atlas_terrain.jpg')).toString('base64');
assert(html.includes('data:image/jpeg;base64,' + terrain), 'standalone must embed the atlas terrain rather than depend on an external image');
const detail = fs.readFileSync(path.join(__dirname, '..', 'assets', 'world_atlas_detail.jpg')).toString('base64');
assert(html.includes('data:image/jpeg;base64,' + detail), 'zoom detail art must be available offline');
assert(html.includes('atlas-viewport'), 'standalone must contain the interactive geographic atlas');
console.log('PASS overview and zoom detail terrain are embedded in the offline standalone');
