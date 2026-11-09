'use strict';
const path = require('path');
const root = path.resolve(__dirname, '..');
exports.url = async file => {
  const abs = path.resolve(file);
  const rel = path.relative(root, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw Error('Browser fixture must be inside GAME_SOURCE');
  // Managed Chromium installations can block file:// access. Allow the same
  // fixtures to be served from a local HTTP server without changing tests.
  if (process.env.BROWSER_TEST_BASE_URL) {
    const base = process.env.BROWSER_TEST_BASE_URL.replace(/\/$/, '') + '/';
    return new URL(rel.split(path.sep).map(encodeURIComponent).join('/'), base).href;
  }
  return 'file://' + abs;
};
