'use strict';
// In-process standalone runner to execute test scripts directly within Node environment
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
console.log('--- IN-PROCESS TEST RUNNER ---');

const tests = [
  'core_lock',
  'lineage_chronicle',
  'ancestor_profile',
  'v229_figure_hydration_and_epic_chronicle_suite'
];

let passCount = 0;
let failCount = 0;

for (const t of tests) {
  const testPath = path.join(root, 'test', t + '.js');
  console.log(`\n▶ Running: ${t}...`);
  try {
    delete require.cache[require.resolve(testPath)];
    require(testPath);
    passCount++;
    console.log(`✅ ${t}: PASSED`);
  } catch (err) {
    failCount++;
    console.error(`❌ ${t}: FAILED\n`, err);
  }
}

console.log(`\n========================================`);
console.log(`Results: ${passCount} Passed, ${failCount} Failed`);
console.log(`========================================`);

if (failCount > 0) process.exit(1);
