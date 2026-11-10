"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
for (const dir of ["js", "tools", "test"])
  for (const name of fs
    .readdirSync(path.join(root, dir))
    .filter((n) => /\.(c?js)$/.test(n))) {
    const r = spawnSync(
      process.execPath,
      ["--check", path.join(root, dir, name)],
      { encoding: "utf8" },
    );
    if (r.status !== 0) throw Error(name + ": " + r.stderr);
  }
const S = require("../js/sim.js"),
  Save = require("../js/save.js"),
  errors = Save.validate(S.create("verification"));
if (errors.length) throw Error(errors.join("; "));
const review = spawnSync(
  process.execPath,
  [path.join(__dirname, "core-review.cjs")],
  { stdio: "inherit" },
);
if (review.status !== 0) process.exit(review.status || 1);
console.log(
  "PASS source syntax and initial catalog/layout/accounting/save schema",
);
