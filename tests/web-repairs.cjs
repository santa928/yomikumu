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
    await page.getByRole("heading", {name:"Web制作のコース一覧"}).waitFor();
    await page.waitForFunction(() => typeof pathCourses !== "undefined");
    const entries = [
      ["html", "HTML / CSS", "#repair-image/1", /^#repair-image\/1$/],
      ["dom", "JavaScriptの画面操作", "dom/index.html#fetch-json", /^#fetch-json$/],
      ["typescript", "TypeScript", "typescript/index.html#practical", /^#practical$/],
      ["react", "React", "react/index.html#book-memos", /^#book-memos$/],
      ["next", "Next.js", "next/index.html#catalog-practice", /^#catalog-practice$/],
      ["tailwind", "Tailwind CSS", "tailwind/index.html#status-colors/slide", /^#status-colors\/slide$/],
    ];
    for (const [id, title, path, lessonRoute] of entries) {
      const entry = page.locator(`.path-course[data-course="${id}"]`);
      await entry.getByRole("link", { name: title + "の目次", exact: true }).click();
      const main = page.getByRole("main");
      await main.getByRole("heading", { level: 1, name: title + "の目次", exact: true }).waitFor();
      const lesson = main.locator("a[href]").filter({visible: true});
      const hrefs = await lesson.evaluateAll(links => links.map(link => link.getAttribute("href")));
      const href = hrefs.find(href => lessonRoute.test(href));
      assert.ok(href, title + "の目次から実習を選べる");
      const target = new URL(path, home).href;
      await Promise.all([page.waitForURL(target), main.locator(`a[href="${href}"]`).click()]);
      await page.getByRole("main").getByRole("heading", { level: 1 }).waitFor();
      await page.goto(home + "#paths/web");
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
    console.log("6分野の目次から実習への導線とTypeScript実習の下書きの引き継ぎを確認");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
