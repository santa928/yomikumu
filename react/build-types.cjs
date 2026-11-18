"use strict";
// #47だけが読み込む型宣言。JSX構文の変換と型検査は同じTypeScript Workerが行う。
const fs = require("node:fs");
const path = require("node:path");
const { gzipSync } = require("node:zlib");
const declarations = {};
const licenses = [];
for (const [name, sources] of [["@types/react", ["index.d.ts","global.d.ts"]], ["csstype", ["index.d.ts"]]]) {
  const manifest = require.resolve(name + "/package.json");
  const dir = path.dirname(manifest);
  for (const file of sources) declarations["node_modules/" + name + "/" + file] = fs.readFileSync(path.join(dir, file), "utf8");
  licenses.push(name + " " + require(manifest).version + "\n\n" + fs.readFileSync(path.join(dir,"LICENSE"), "utf8"));
}
const vendor = path.join(__dirname,"vendor");
const compressed = gzipSync(Buffer.from(JSON.stringify(declarations))).toString("base64");
fs.writeFileSync(path.join(vendor,"react-types.js"), '"use strict";\nwindow.reactTypeBundle = ' + JSON.stringify(compressed) + ";\n");
fs.writeFileSync(path.join(vendor,"TYPE-LICENSES.txt"),licenses.join("\n\n"));
