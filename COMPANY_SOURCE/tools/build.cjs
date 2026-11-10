"use strict";
const fs = require("node:fs"),
  path = require("node:path");
const root = path.resolve(__dirname, "..");
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
html = html.replace(
  /<link rel="stylesheet" href="([^"]+)"\s*\/?>/g,
  (_, name) =>
    "<style>\n" + fs.readFileSync(path.join(root, name), "utf8") + "\n</style>",
);
html = html.replace(
  /<script src="([^"]+)"><\/script>/g,
  (_, name) =>
    "<script>\n/* " +
    name +
    " */\n" +
    fs
      .readFileSync(path.join(root, name), "utf8")
      .replace(/<\/script/gi, "<\\/script") +
    "\n</script>",
);
if (/<script[^>]+src=|<link[^>]+rel="stylesheet"/.test(html))
  throw Error("external source dependency remains");
fs.writeFileSync(path.join(root, "CompanyFoundation_single.html"), html);
console.log(
  "Built CompanyFoundation_single.html:",
  Buffer.byteLength(html),
  "UTF-8 bytes; autonomous campus simulation",
);
