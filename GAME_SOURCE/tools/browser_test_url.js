'use strict';
const path = require('path');
const root = path.resolve(__dirname, '..');
exports.url = async file => {
  const abs = path.resolve(file);
  const rel = path.relative(root, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw Error('Browser fixture must be inside GAME_SOURCE');
  return 'file://' + abs;
};
