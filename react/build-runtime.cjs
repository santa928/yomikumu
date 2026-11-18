"use strict";
// Docker内でReact 19.2.7、react-dom 19.2.7、esbuild 0.28.1を使い配信用の文字列を生成する。
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");
const modules = ["react", "react-dom", "scheduler"];
const licenses = [];
for (const name of modules) {
  const manifest = require.resolve(name + "/package.json");
  licenses.push(name + " " + require(manifest).version + "\n\n" + fs.readFileSync(path.join(path.dirname(manifest), "LICENSE"), "utf8"));
}
const result = esbuild.buildSync({
  stdin: {
    contents: 'globalThis.React = require("react"); globalThis.ReactDOM = {createRoot:require("react-dom/client").createRoot,flushSync:require("react-dom").flushSync};',
    resolveDir: path.dirname(require.resolve("react/package.json")),
  },
  bundle:true, minify:true, write:false, format:"iife", legalComments:"none",
  define:{"process.env.NODE_ENV":'"production"'},
});
const dir = path.join(__dirname, "vendor");
fs.writeFileSync(path.join(dir, "runtime.js"), '"use strict";\nconst reactRuntimeSource = ' + JSON.stringify(result.outputFiles[0].text) + ';\n');
fs.writeFileSync(path.join(dir, "LICENSES.txt"), licenses.join("\n\n"));
