"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

async function verifyPaths(browser, base) {
  const pc = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  const phone = await browser.newPage({ viewport: { width: 375, height: 800 }, hasTouch: true });
  const errors = [];
  for (const page of [pc, phone]) page.on("pageerror", e => errors.push(String(e)));
  try {
    await pc.goto(base);
    await pc.getByRole("link", { name: /Webで作品を紹介する/ }).focus();
    await pc.keyboard.press("Enter");
    const html = pc.locator(".path-course").first();
    await html.getByText("始める前に一問試す").click();
    await html.getByRole("radio", { name: "見出しの文字" }).check();
    await html.getByRole("button", { name: "答えを確かめる" }).click();
    await html.getByRole("status").filter({ hasText: "そうです" }).waitFor();
    await html.getByRole("link", { name: "最初の一課題を開く" }).click();
    assert.ok(pc.url().endsWith("#first-edit/1"));
    await pc.goto(base + "#first-edit/type");
    await pc.getByRole("textbox").fill("<h1>雨の図書館</h1>");
    await pc.getByRole("link", { name: "よみくむの学習パス" }).click();
    await pc.getByRole("link", { name: /Pythonで記録を集計する/ }).click();
    const py = pc.locator(".path-course").first();
    await py.getByText("始める前に一問試す").click();
    await py.getByRole("radio", { name: "来た人の名前" }).check();
    await py.getByRole("button", { name: "答えを確かめる" }).click();
    await py.getByRole("status").filter({ hasText: "そうです" }).waitFor();
    await py.getByRole("link", { name: "最初の一課題を開く" }).click();
    await pc.getByRole("heading", { name: "文字を表示する", exact: true }).waitFor();
    await pc.getByRole("button", { name: "入口", exact: true }).click();
    await pc.getByRole("link", { name: "見本を変えてみる" }).click();
    await pc.getByLabel("main.py のコード").fill('print("受付")');
    await pc.getByRole("button", { name: "別の条件でも採点" }).click();
    await pc.locator("#status").filter({ hasText: "すべての条件" }).waitFor();
    await pc.getByRole("link", { name: "学習パス一覧へ", exact: true }).click();
    await pc.getByRole("link", { name: "前回の続きへ　Python基礎" }).waitFor();
    if (process.env.SCREENSHOT_DIR) await pc.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "paths-pc.png") });
    await pc.getByText("進捗と下書きの引き継ぎ", { exact: true }).click();
    const download = pc.waitForEvent("download");
    await pc.getByRole("button", { name: "進捗を書き出す" }).click();
    const saved = await (await download).path();

    await phone.goto(base);
    await phone.getByText("進捗と下書きの引き継ぎ", { exact: true }).tap();
    const file = phone.locator("input[type=file]");
    await file.setInputFiles(saved);
    await phone.getByRole("button", { name: "この記録を読み込む" }).tap();
    await phone.getByRole("link", { name: "前回の続きへ　Python基礎" }).tap();
    await phone.getByRole("button", { name: "キーボードで書く" }).tap();
    assert.equal(await phone.getByLabel("main.py のコード").inputValue(), 'print("受付")');
    await phone.getByRole("link", { name: "学習パス一覧へ", exact: true }).tap();
    await phone.getByRole("link", { name: /Webで作品を紹介する/ }).tap();
    await phone.getByRole("heading", { name: "自分の作品をページにしよう" }).waitFor();
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (process.env.SCREENSHOT_DIR) await phone.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "paths-phone.png") });
    await phone.getByRole("link", { name: "HTML / CSSの続きを開く" }).tap();
    assert.equal(await phone.getByRole("textbox").inputValue(), "<h1>雨の図書館</h1>");
    const state = await phone.evaluate(() => JSON.parse(localStorage.getItem("yomikumu-python-v1")));
    assert.equal(state.completed["54/1/guide/code"], true);
    assert.equal(state.quizzes["54/1/slide"], 0);
    assert.deepEqual(errors, []);
    console.log("PC・375pxで独立した二つの学習パス、前提問題、キーボード操作、別端末へのPythonとHTMLの下書き・成績・再開位置の引き継ぎを確認");
  } finally { await pc.close(); await phone.close(); }
}
module.exports = { verifyPaths };
if (require.main === module) {
  (async () => {
    const browser = await chromium.launch();
    try { await verifyPaths(browser, process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href); }
    finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
