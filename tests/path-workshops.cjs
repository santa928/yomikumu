"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  try {
    const base = process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href;
    const pc = await browser.newPage();
    const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
    await pc.goto(base + "#paths/web");
    const tailwind = pc.locator('.path-course[data-course="tailwind"]');
    await tailwind.getByRole("link", { name: /^最初の課題：/ }).click();
    await pc.getByRole("link", { name: "自分で書く", exact: true }).click();
    await pc.getByRole("textbox").fill("p-2");
    await pc.getByRole("button", { name: "表示と答えを確かめる" }).click();
    await pc.getByText(/^できました。/).waitFor();
    await pc.getByRole("link", { name: "全コース目次" }).click();
    await pc.getByRole("link", { name: /Webで作品を紹介する/ }).click();
    const dom = pc.locator('.path-course[data-course="dom"]');
    await dom.getByRole("link", { name: /^最初の課題：/ }).click();
    await pc.waitForURL("**/dom/index.html#elements/1");
    const draft = 'const title = document.getElementById("heading");';
    await pc.getByRole("textbox", { name: "JavaScript", exact: true }).fill(draft);
    await pc.getByRole("link", { name: "よみくむ", exact: true }).click();
    await pc.getByRole("link", { name: "前回の続きへ　JavaScriptの画面操作" }).waitFor();
    await pc.getByText("進捗と下書きの引き継ぎ", { exact: true }).click();
    const event = pc.waitForEvent("download");
    await pc.getByRole("button", { name: "進捗を書き出す" }).click();
    const download = await event;
    await phone.goto(base + "#paths");
    await phone.getByText("進捗と下書きの引き継ぎ", { exact: true }).tap();
    await phone.locator("input[type=file]").setInputFiles(await download.path());
    await phone.getByRole("button", { name: "この記録を読み込む" }).tap();
    await phone.getByRole("link", { name: "前回の続きへ　JavaScriptの画面操作" }).tap();
    await phone.getByLabel("練習方法").selectOption("write");
    assert.equal(await phone.getByRole("textbox", { name: "JavaScript", exact: true }).inputValue(), draft);
    await phone.getByRole("link", { name: "よみくむ", exact: true }).tap();
    await phone.getByRole("link", { name: /Webで作品を紹介する/ }).tap();
    await phone.getByRole("link", { name: "Tailwind CSSの続きを開く" }).tap();
    assert.equal(await phone.getByRole("textbox").inputValue(), "p-2");
    const saved = await phone.evaluate(() => JSON.parse(localStorage.getItem("yomikumu/tailwind/v1")));
    assert.equal(saved.units.padding.writeDone, true);
    console.log("学習パスから読書カード・画面操作へ進み、別端末に両方の記述と達成状態を引き継ぎました");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
