"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const home = process.env.COURSE_URL || pathToFileURL(path.resolve("index.html")).href;
    await page.goto(home + "#paths/web");
    await page.getByRole("heading", {name:"自分の作品をページにしよう"}).waitFor();
    await page.waitForFunction(() => typeof pathCourses !== "undefined");
    const entries = [
      ["画像とフォームを直す", "#repair-image/1"],
      ["JSONを使う画面操作へ", "dom/index.html#fetch-json"],
      ["JSONの読み込みを直す", "dom/index.html#fetch-json"],
      ["共有する型を変える", "typescript/index.html#practical"],
      ["並べ替えで移るメモを直す", "react/index.html#book-memos"],
      ["詳細ページと検索を作る", "next/index.html#catalog-practice"],
      ["生成されない色を調べる", "tailwind/index.html#status-colors/slide"],
    ];
    for (const [label, href] of entries) {
      const link = page.getByRole("link", {name:label, exact:true});
      assert.equal(await link.count(), 1, label);
      assert.equal(await link.getAttribute("href"), href);
    }
    await page.goto(new URL("react/index.html#book-memos/2", home).href);
    const shortExample = page.locator("#example > pre");
    await shortExample.waitFor();
    assert.ok((await shortExample.textContent()).split("\n").length <= 3);
    await page.getByText("見本のコードをすべて読む", {exact:true}).click();
    assert.match(await page.locator("#example details pre").textContent(), /function Memo/);
    await page.getByRole("combobox").selectOption("build");
    const firstPiece = page.getByRole("group", {name:"《1》に入れるコード", exact:true});
    assert.match(await firstPiece.textContent(), /<li 《1》>/);
    // この端末で保存する教材をTypeScriptの実習一つに限定する。
    await page.evaluate(() => localStorage.clear());
    await page.goto(new URL("typescript/index.html#practical", home).href);
    const draft = "export type Result = { score: number };";
    await page.getByLabel("TypeScript コード").fill(draft);
    await page.goto(home + "#paths/web");
    await page.waitForFunction(() => typeof exportStores === "function");
    const saved = await page.evaluate(() => exportStores());
    assert.equal(saved.typescript.practical["types.ts"], draft);
    await page.getByText("進捗と下書きの引き継ぎ", {exact:true}).click();
    const gettingFile = page.waitForEvent("download");
    await page.getByRole("button", {name:"進捗を書き出す"}).click();
    const file = await (await gettingFile).path();
    const phone = await browser.newPage({viewport:{width:375,height:812},hasTouch:true});
    await phone.goto(home + "#paths/web");
    await phone.getByText("進捗と下書きの引き継ぎ", {exact:true}).tap();
    await phone.locator("input[type=file]").setInputFiles(file);
    const importButton = phone.getByRole("button", {name:"この記録を読み込む"});
    await importButton.waitFor();
    const summary = await phone.locator("#transfer-status").textContent();
    assert.match(summary, /^1件の記録/);
    assert.match(summary, /TypeScript実習の4ファイルの下書きも置き換わります/);
    await importButton.tap();
    await phone.getByRole("link", {name:"TypeScriptの続きを開く"}).tap();
    assert.equal(await phone.getByLabel("TypeScript コード").inputValue(), draft);
    await phone.goto(home + "#paths/web");
    // 旧形式の進捗を追加で取り込んでも新しい実習の下書きを残す。
    await phone.evaluate(() => restoreStores({typescript:{last:"",units:{},version:1}}));
    assert.equal(await phone.evaluate(() => exportStores().typescript.practical["types.ts"]), draft);
    console.log("6分野の入口とTypeScript実習の下書きの引き継ぎを確認");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
