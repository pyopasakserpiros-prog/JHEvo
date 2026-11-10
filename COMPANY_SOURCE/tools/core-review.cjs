"use strict";
// Read-only permanent lock checker. No refresh/write/fallback mode exists.
const fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const root = path.resolve(__dirname, ".."),
  source = "js/human-core.js";
if (process.argv.length !== 2)
  throw Error(
    "Permanent human core cannot be refreshed. Only an explicit user instruction can authorize a core change.",
  );
const lock = JSON.parse(
  fs.readFileSync(path.join(root, "CORE_LOCK.json"), "utf8"),
);
const hash = crypto
  .createHash("sha256")
  .update(fs.readFileSync(path.join(root, source)))
  .digest("hex");
if (
  lock.status !== "locked" ||
  lock.permanentLock !== true ||
  lock.algorithm !== "sha256" ||
  Object.keys(lock.files).join() !== source ||
  lock.files[source] !== hash ||
  lock.coreVersion !== require(path.join(root, source)).VERSION
)
  throw Error(
    "Permanent human core lock mismatch. Restore the accepted bytes; do not rebaseline or disable this check.",
  );
console.log(
  "PASS permanently locked human core " + lock.coreVersion + ": " + hash,
);
