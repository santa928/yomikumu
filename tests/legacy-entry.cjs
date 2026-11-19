"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const home = process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href;
const legacy = new URL("padding.html", home);

async function run() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(legacy.href + "#axes");
    await page.waitForURL(legacy.href + "#padding/2");
    await page.locator("main h1").waitFor();

    // 単独教材の頃にこのURLへ保存した記録から、書きかけの問題を開く。
    const oldDraft = "padding: 3px 7px;";
    await page.evaluate(draft => {
      localStorage.setItem("yomikumu/padding/v1", JSON.stringify({ page: "write", draft }));
    }, oldDraft);
    await page.goto(legacy.href);
    await page.reload();
    await page.waitForURL(legacy.href + "#padding/write");
    const code = page.getByRole("textbox", { name: "CSSの宣言" });
    assert.equal(await code.inputValue(), oldDraft);
    await code.fill("padding: 8px 16px;");
    await page.getByRole("button", { name: "コードを確かめる" }).click();
    await page.getByRole("status").filter({ hasText: "できました" }).waitFor();
    await page.reload();
    assert.equal(await code.inputValue(), "padding: 8px 16px;");
    assert.deepEqual(errors, []);
    console.log("旧教材のリンクと保存済みの下書きから再開し、採点・再読込まで確認");
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
