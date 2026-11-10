"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  os = require("node:os"),
  { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
test("permanent core lock matches exact source bytes and cannot be refreshed or removed", () => {
  const lock = JSON.parse(
    fs.readFileSync(path.join(root, "CORE_LOCK.json"), "utf8"),
  );
  assert.equal(lock.status, "locked");
  assert.equal(lock.permanentLock, true);
  assert.equal(lock.coreVersion, "1.0.0");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "company-core-lock-"));
  const run = (...args) =>
    spawnSync(
      process.execPath,
      [path.join(dir, "tools/core-review.cjs"), ...args],
      { encoding: "utf8" },
    );
  try {
    fs.mkdirSync(path.join(dir, "js"));
    fs.mkdirSync(path.join(dir, "tools"));
    for (const file of [
      "js/human-core.js",
      "tools/core-review.cjs",
      "CORE_LOCK.json",
    ])
      fs.copyFileSync(path.join(root, file), path.join(dir, file));
    assert.equal(run().status, 0);
    const before = fs.readFileSync(path.join(dir, "CORE_LOCK.json"), "utf8");
    assert.notEqual(run("--refresh-review").status, 0);
    assert.equal(
      fs.readFileSync(path.join(dir, "CORE_LOCK.json"), "utf8"),
      before,
    );
    fs.appendFileSync(
      path.join(dir, "js/human-core.js"),
      "\n// deliberate test change\n",
    );
    assert.notEqual(run().status, 0);
    assert.notEqual(run("--refresh-review").status, 0);
    fs.rmSync(path.join(dir, "CORE_LOCK.json"));
    assert.notEqual(run().status, 0);
    assert.notEqual(run("--refresh-review").status, 0);
    assert(!fs.existsSync(path.join(dir, "CORE_LOCK.json")));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
