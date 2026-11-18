"use strict";
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

(async () => {
  const browser = await chromium.launch();
  try {
    const pc = await browser.newPage();
    const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
    const home = process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href;
    const reflection = "親が冊数を数えると、一冊の部品は題名だけに集中できる。";
    const source = "entry = Book(18)\nprint(entry.pages)";
    await pc.goto(new URL("react/index.html#reading-project/8", home).href);
    await pc.getByRole("textbox", { name: /分けた理由/ }).fill(reflection);
    await pc.goto(home + "#paths/python");
    const oop = pc.locator(".path-course").filter({ has: pc.getByRole("heading", { name: "Python OOP" }) });
    await oop.getByRole("link", { name: "最初の一課題を開く" }).click();
    assert.match(pc.url(), /#63\/1\/slide$/);
    await pc.goto(new URL("python/index.html#63/1/write", home).href);
    await pc.locator("#source").fill(source);
    await pc.goto(home + "#paths");
    await pc.getByText("進捗と下書きの引き継ぎ", { exact: true }).click();
    const exported = pc.waitForEvent("download");
    await pc.getByRole("button", { name: "進捗を書き出す" }).click();
    const download = await exported;
    await phone.goto(home + "#paths");
    await phone.getByText("進捗と下書きの引き継ぎ", { exact: true }).tap();
    await phone.locator("input[type=file]").setInputFiles(await download.path());
    await phone.getByRole("button", { name: "この記録を読み込む" }).tap();
    await phone.getByRole("link", { name: /前回の続きへ.*Python OOP/ }).tap();
    await phone.locator("#keyboard").tap();
    assert.equal(await phone.locator("#source").inputValue(), source);
    await phone.goto(home + "#paths/web");
    await phone.getByRole("link", { name: "Reactの続きを開く" }).tap();
    assert.equal(await phone.getByRole("textbox", { name: /分けた理由/ }).inputValue(), reflection);
    console.log("Python OOPのコードとReactの設計メモを別のブラウザに引き継ぎました");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
