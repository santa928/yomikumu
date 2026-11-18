"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { gzipSync } = require("node:zlib");
const lib = path.dirname(require.resolve("typescript"));
const declarations = {};
function include(name) {
  if (Object.hasOwn(declarations, name)) return;
  const source = fs.readFileSync(path.join(lib, name), "utf8");
  declarations[name] = source;
  for (const [, ref] of source.matchAll(/<reference lib="([^"]+)"/g)) include("lib." + ref + ".d.ts");
}
include("lib.es2022.full.d.ts");
const source = [
  fs.readFileSync(path.join(lib, "typescript.js"), "utf8"),
  "const libraries = " + JSON.stringify(declarations) + ";",
  "ts.setLocalizedDiagnosticMessages(" + fs.readFileSync(path.join(lib, "ja/diagnosticMessages.generated.json"), "utf8") + ");",
  fs.readFileSync("worker-source.js", "utf8")
].join("\n");
const packed = gzipSync(source, { level: 9 }).toString("base64");
fs.writeFileSync("compiler-data.js", "window.quizCompilerGzip = " + JSON.stringify(packed) + ";\n");
for (const file of ["LICENSE.txt", "ThirdPartyNoticeText.txt"]) {
  const original = fs.readFileSync(path.join(lib, "..", file), "utf8");
  fs.writeFileSync(file, original.split(/\r?\n/).map(line => line.trimEnd()).join("\n").trimEnd() + "\n");
}
