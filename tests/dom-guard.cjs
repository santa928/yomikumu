"use strict";
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const base = process.env.DOM_URL || pathToFileURL(path.resolve(__dirname, "../dom/index.html")).href;
    await page.goto(base + "#elements/1");
    const code = page.getByRole("textbox", {name:"JavaScript"});
    for (const loop of ["while (true) {}", "for (;;) continue;", "do ; while (true)"]) {
      await code.fill(loop);
      await page.getByRole("button",{name:"実行して確かめる"}).click();
      await page.getByRole("status").filter({hasText:"繰り返しを中断"}).waitFor({timeout:4000});
      assert.equal(await code.inputValue(),loop);
    }
    await code.fill('let title="";\nouter: for (const a of ["光","の","問題"]) { for (let j=0; j<2; j++) {title+=a; continue outer;} }\n// while (true) {}\nconst regex=/while \(true\)/; document.querySelector("h1, h2").textContent=title;');
    await page.getByRole("button",{name:"実行して確かめる"}).click();
    await page.getByRole("status").filter({hasText:"できました"}).waitFor();
    console.log("3種類の同期ループを中断し、ラベル・コメント・正規表現を含む正答で復帰");
  } finally {await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
