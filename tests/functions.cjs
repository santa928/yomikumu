"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const { checkJsLessons } = require("./js-lessons.cjs");

async function verifyFunctions(browser, base) {
  const pc = await browser.newPage({ viewport: { width: 1100, height: 820 } });
  const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  try {
    const cases = [
      ["js-call", "もう一度 announce() を呼んで", 'const announce = () => console.log("受付開始");\nfor(let i=0;i<2;i++) announce();', ["announce()"]],
      ["js-parameter", "一回目に受け取った", "function stamp(value) {console.log(2 + value);}", ["points","2"]],
      ["js-return", "return で返し", "function addBonus(value) { const result = 3 + value; return result; }", ["return","3"]],
      ["js-scope", "special は round", "function round(){const value=initialScore+4;return value}\nconst result=round();console.log(result);console.log(initialScore);", ["round()","initialScore"], 2],
      ["js-arrow", "二度足した", "const double = (value) => { return value * 2; };", ["=>","+"]],
      ["js-award", "一問目の2点", "const award = (point, amount) => point + amount;\nconst first=award(initialScore,2);\nconsole.log(first);\nshowTitle(award(first,3));", ["bonus","total"]],
    ];
    await checkJsLessons(pc, phone, base, cases);
    const run = pc.getByRole("button", { name: "コードを実行して確かめる" });
    const input = pc.getByRole("textbox", { name: "JavaScript" });
    const feedback = pc.locator("main [role=status]");
    await pc.goto(base + "#js-arrow/write");
    await input.fill("function double(n){ return n + n; }");
    await run.click();
    await feedback.filter({ hasText: "二倍の数を返せました" }).waitFor();
    await pc.goto(base + "#js-return/write");
    await input.fill("function another(n){return n+3;}");
    await run.click();
    await feedback.filter({ hasText: "確認用の呼び出しで止まりました" }).waitFor();
    const noReturn = "function addBonus(n){console.log(n+3);}";
    await input.fill(noReturn);
    await run.click();
    await feedback.filter({ hasText: "return で返し" }).waitFor();
    await pc.getByRole("link", { name: "この問題のスライドを見直す" }).click();
    await pc.getByRole("link", { name: /解きかけの問題へ戻る/ }).click();
    assert.equal(await input.inputValue(), noReturn);
    await pc.goto(base + "#js-award/write");
    await input.fill(cases.at(-1)[2].replace("showTitle(award(first,3))","showTitle(first)"));
    await run.click();
    await feedback.filter({ hasText: "一問目はできました" }).waitFor();
    await input.fill(cases.at(-1)[2]);
    await pc.getByLabel("開始点").selectOption("5");
    await run.click();
    await feedback.filter({ hasText: "できました" }).waitFor();
    await pc.getByRole("heading", { name: "10", exact: true }).waitFor();
    assert.equal(await pc.locator(".code-result pre").textContent(), "7（数）\n6（数）");
    if (process.env.SCREENSHOT_DIR) {
      await pc.locator(".code-result").first().scrollIntoViewIfNeeded();
      await pc.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "functions-pc.png") });
      await phone.goto(base + "#js-return/2");
      await phone.locator(".code-result pre").waitFor();
      await phone.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "functions-phone.png") });
    }
    console.log("関数の六単元、実引数二種類・戻り値・スコープ・矢印・二段階の加点、タップ・途中採点・下書き復帰を確認");
  } finally { await pc.close(); await phone.close(); }
}

module.exports = { verifyFunctions };
if (require.main === module) {
  (async () => {
    const browser = await chromium.launch();
    try { await verifyFunctions(browser, process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href); }
    finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
