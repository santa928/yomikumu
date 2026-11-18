"use strict";

const assert = require("node:assert/strict");

const defaults = {
  54: "つばき\n3\n", 55: "団体受付\n1\n2\n3\n", 56: "6\n2\n", 57: "280\n", 58: "2\n7\n",
  59: "[0.5, 1.0, 2.0]\n", 60: "3\n5\n3\n", 61: "5\n['開く', '読む', '閉じる']\n",
  62: "90\n1\n", 63: "12\n12\n12\n", 64: "12\n11\n8\n", 65: "9\n", 66: "6\n1\ncharge\n", 67: "もう一度\n4\n2\n['青失敗', '青成功']\n['赤成功']\n",
};
async function verifyDemos(page, entry, only) {
  for (const [id, output] of Object.entries(defaults)) {
    if (only && id !== only) continue;
    await page.goto(entry + "#" + id + "/demo");
    // 各完成例の初期の入力を使う。
    const input = await page.evaluate(() => chapter.demo.input || "");
    await page.locator("#input").fill(input);
    await page.locator("#run").click();
    await page.locator("#status").getByText("実行できました。").waitFor({ timeout: 45000 });
    assert.equal(await page.locator("#output").textContent(), output);
    if (Number(id) >= 63) {
      assert.equal(await page.locator("#course-name").textContent(), "Python OOP");
      assert.equal(await page.locator("#contents a[href^='#59']").count(), 0);
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("yomikumu-python-oop-v1")).route), id + "/demo");
    }
  }
}
module.exports = { verifyDemos };
