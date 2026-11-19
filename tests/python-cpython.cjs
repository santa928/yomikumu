"use strict";

const assert = require("node:assert/strict");

async function verifyCPython(page, entry) {
  await page.goto(entry + "#62/demo");
  assert.equal(await page.evaluate(() => Boolean(globalThis.yomikumuCPythonAssets)), false);
  await page.locator("#input").fill("-1");
  await page.locator("#run").click();
  await page.locator("#status").getByText("実行できました。").waitFor({ timeout: 45000 });
  assert.equal(await page.locator("#output").textContent(), "記録を確認\n1\n");
  await page.locator("#input").fill("30");
  await page.locator("#run").click();
  await page.locator("#status").getByText("実行できました。").waitFor({ timeout: 45000 });
  assert.equal(await page.locator("#output").textContent(), "90\n1\n");
  // 配布CSVを実ファイルとして読み、相対パスを含む名前は配置されない。
  const csv = await page.evaluate(() => runPython({
    engine: "cpython",
    files: { "reading.csv": 'title,minutes\n"春,夏",12\n', "../unlisted.csv": "unused" },
    source: [
      "import csv, os",
      "with open('reading.csv', encoding='utf-8', newline='') as stream:",
      "    print(next(csv.DictReader(stream))['title'])",
      "print(os.path.exists('../unlisted.csv'))",
    ].join("\n"),
    lines: [],
  }).result);
  assert.equal(csv.error, null, csv.error);
  assert.equal(csv.output, "春,夏\nFalse\n");
}
module.exports = { verifyCPython };
