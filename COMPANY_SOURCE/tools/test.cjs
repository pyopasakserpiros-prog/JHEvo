"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, ".."),
  files = fs
    .readdirSync(path.join(root, "test"))
    .filter((f) => f.endsWith(".test.cjs"))
    .sort()
    .map((f) => path.join(root, "test", f));
const result = spawnSync(process.execPath, ["--test", ...files], {
  cwd: root,
  stdio: "inherit",
});
process.exitCode = result.status ?? 1;
