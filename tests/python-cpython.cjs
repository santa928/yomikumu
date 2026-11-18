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
}
module.exports = { verifyCPython };
