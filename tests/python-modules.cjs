"use strict";

const assert = require("node:assert/strict");

async function verifyModules(page, entry) {
  await page.goto(entry + "#58/1/write");
  const helper = page.getByLabel("counts.py のコード");
  await helper.fill("def as_count(text):\n    return int(text)");
  await page.getByRole("button", { name: "別の条件でも採点" }).click();
  await page.locator("#status").getByText(/できました。すべて/).waitFor();
  await page.goto(entry + "#58/5/write");
  const source = page.getByLabel("main.py のコード");
  await source.fill("from counts import as_count\na = as_count(input())\nprint(a)\nprint(a)");
  await page.locator("#grade").click();
  await page.locator("#status").getByText(/途中まで.*二行目/).waitFor();
  await helper.fill("def as_count(raw):\n    return int(raw)");
  await page.getByRole("link", { name: "関連スライドを読み直す" }).click();
  await page.getByRole("link", { name: "書き途中の課題に戻る" }).click();
  assert.equal(await helper.inputValue(), "def as_count(raw):\n    return int(raw)");
  await page.goto(entry + "#58/demo");
  await page.locator("#input").fill("4\n本");
  await page.locator("#run").click();
  await page.locator("#status").getByText("実行できました。").waitFor();
  assert.equal(await page.locator("#output").textContent(), "4\n数字を入力\n");
  await page.locator("#input").fill("4\n5");
  await page.locator("#run").click();
  await page.locator("#status").getByText("実行できました。").waitFor();
  assert.equal(await page.locator("#output").textContent(), "4\n9\n");
}
module.exports = { verifyModules };
