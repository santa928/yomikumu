"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const { checkJsLessons } = require("./js-lessons.cjs");
const { verifyModuleRuntime } = require("./module-runtime.cjs");

async function verifyModules(browser, base) {
  await verifyModuleRuntime(browser, base);
  const pc = await browser.newPage({ viewport: { width: 1100, height: 820 } });
  const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  try {
    const alternate = 'const items=[{points:2,title:"舟"},{points:5,title:"窓"}]; export {items as cards};';
    await checkJsLessons(pc, phone, base, [
      ["js-file-value", "読み込み先", 'import { title as name } from "./questions.js"; console.log(name);', ["title", "./questions.js"]],
      ["js-file-score", "export がありません", "const add=(a,b)=>b+a; export {add as score};", ["export", "score"]],
      ["js-throw", "0点は正常", 'export const check=p=>{ if(p>=0)return p; throw Error("配点は0以上です"); };', ["<", "throw"], 2],
      ["js-catch", "固定の言葉", 'import {check} from "./score.js"; for(const p of [3,-1,0]){try{console.log(check(p));}catch(reason){console.log(reason.message);}}', ["catch", "error.message"]],
      ["js-file-audit", "窓の配点は5", alternate, ["窓", "5"]],
    ]);
    const status = pc.locator("main [role=status]");
    const run = pc.getByRole("button", { name: "コードを実行して確かめる" });
    for (const [id, fixed, hint] of [
      ["js-file-value", 'console.log("星のしおり");', "別の原稿"],
      ["js-catch", 'console.log(3); console.log("配点は0以上です"); console.log(0);', "採点係の理由が変わった"],
    ]) {
      await pc.goto(base + "#" + id + "/write");
      await pc.getByRole("textbox", { name: "main.js", exact: true }).fill(fixed);
      await run.click();
      await status.filter({ hasText: hint }).waitFor();
    }
    await pc.goto(base + "#js-file-audit/write");
    const editor = pc.getByRole("textbox", { name: "questions.js", exact: true });
    const file = pc.getByLabel("手元の問題集をコード欄に取り込む");
    const downloadEvent = pc.waitForEvent("download");
    await pc.getByRole("button", { name: "問題集の見本を保存" }).click();
    const download = await downloadEvent;
    assert.equal(download.suggestedFilename(), "questions.js");
    const saved = await download.path();
    await editor.fill(alternate);
    await file.setInputFiles(saved);
    await status.filter({ hasText: "取り込みました" }).waitFor();
    const sample = await editor.inputValue();
    assert.match(sample, /points: 3/);
    await pc.getByRole("button", { name: "取り込み前の下書きに戻す" }).click();
    assert.equal(await editor.inputValue(), alternate);
    await file.setInputFiles(saved);
    await run.click();
    await status.filter({ hasText: "窓の配点は5" }).waitFor();
    await pc.getByRole("link", { name: "この問題のスライドを見直す" }).click();
    await pc.getByRole("link", { name: /解きかけの問題へ戻る/ }).click();
    assert.equal(await editor.inputValue(), sample);
    await editor.fill(sample.replace("points: 3", "points: 5"));
    await run.click();
    await status.filter({ hasText: "できました" }).waitFor();
    assert.equal(await pc.locator(".code-result pre").textContent(), "舟（文字）\n2（数）\n窓（文字）\n5（数）");
    await phone.goto(base + "#js-throw/2");
    await phone.locator("main [role=status]").filter({ hasText: "score.js の3行目" }).waitFor();
    if (process.env.SCREENSHOT_DIR) {
      await phone.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "modules-phone.png") });
      await pc.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "modules-pc.png") });
    }
    console.log("5単元のスライド・四択・PC別解・スマホタップ、原稿差し替え、取り込みと復旧、ファイルと行の案内を確認");
  } finally { await pc.close(); await phone.close(); }
}
module.exports = { verifyModules };
if (require.main === module) {
  (async () => {
    const browser = await chromium.launch();
    try { await verifyModules(browser, process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href); }
    finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
