"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { zipSync } = require("./vendor/fflate.js");
const root = path.join(__dirname, "kit");
const entries = {};
function include(name) {
  const file = path.join(root, name);
  if (fs.statSync(file).isDirectory()) {
    for (const child of fs.readdirSync(file).sort()) {
      if (!["node_modules", ".next"].includes(child)) include(name + "/" + child);
    }
  } else entries[name] = [new Uint8Array(fs.readFileSync(file)), { mtime: new Date("2020-01-02T12:00:00Z") }];
}
for (const name of ["app", "library", "public", "check", "reports/README.txt", "package.json", "package-lock.json", "compose.yaml", "Dockerfile", ".dockerignore"]) include(name);
const bytes = zipSync(entries, { level: 9 });
fs.writeFileSync(path.join(__dirname, "kit-data.js"), '"use strict";\nwindow.nextStarter = "' + Buffer.from(bytes).toString("base64") + '";\n');
