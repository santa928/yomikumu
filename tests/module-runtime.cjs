"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

async function verifyModuleRuntime(browser, base) {
  const page = await browser.newPage();
  try {
    await page.goto(base);
    const files = {
      "questions.js": "export const quiz = { points: 3 };",
      "score.js": "export function score(n) { return n + 2; }",
      "main.js": 'import { quiz } from "./questions.js";\nimport { score } from "./score.js";\nconsole.log(score(quiz.points));',
    };
    const run = files => page.evaluate(async files => executeCode("", 0, undefined, false, files), files);
    const good = await run(files);
    assert.ok(good.ok, JSON.stringify(good));
    assert.equal(good.output[0][0].text, "5");
    const missing = await run({ ...files, "main.js": 'import { quiz } from "./cards.js";' });
    assert.match(missing.error, /main.js の1行目の読み込み先/);
    const spelling = await run({ ...files, "main.js": 'import { item } from "./questions.js";' });
    assert.match(spelling.error, /export がありません/);
    const faulty = await run({ ...files, "score.js": 'export function score(n) {\n  throw new Error("配点を確認");\n}' });
    assert.equal(faulty.file, "score.js");
    assert.equal(faulty.line, 2);
    assert.equal(await page.locator("iframe[hidden]").count(), 0);
    console.log("実際のESモジュールの読み込み、別ファイルの関数、読み込み先とexport名の誤り、例外のファイルと行を確認");
  } finally { await page.close(); }
}
module.exports = { verifyModuleRuntime };
if (require.main === module) {
  (async () => {
    const browser = await chromium.launch();
    try { await verifyModuleRuntime(browser, process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname,"../index.html")).href); }
    finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
