"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const { checkJsLessons } = require("./js-lessons.cjs");

async function verifyChoices(browser, base) {
  const pc = await browser.newPage({ viewport: { width: 1100, height: 820 } });
  const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  try {
    const cases = [
      ["js-compare", "4点が true", "console.log(4 <= initialScore);", [">=", "4"]],
      ["js-two-doors", "待機", 'if(initialScore < 4) { console.log("待機"); } else { console.log("通過"); }', ["通過", "待機"]],
      ["js-three-messages", "合格を先に", 'if(initialScore < 3) console.log("再挑戦"); else if(initialScore < 6) console.log("もう一歩"); else console.log("合格");', ["6","3"]],
      ["js-numbers", "最後の番号", "for(let i = 0; i < questionCount; i++) {console.log(i + 1);}", ["1", "<="]],
    ];
    const run = pc.getByRole("button", { name: "コードを実行して確かめる" });
    const input = pc.getByRole("textbox", { name: "JavaScript" });
    const feedback = pc.locator("main [role=status]");
    await checkJsLessons(pc, phone, base, cases);
    await pc.goto(base + "#js-numbers/2");
    const sample = pc.getByRole("button", { name: "見本を実行" });
    for (const [count, expected] of [["0","出力はありません。"],["3","1（数）\n2（数）\n3（数）"]]) {
      await pc.getByLabel("問題数").selectOption(count);
      await sample.click();
      await pc.locator("main .code-result pre").filter({ hasText: expected }).waitFor();
    }
    await pc.goto(base + "#js-three-messages/write");
    for (const [score, note] of [[2,"再挑戦"], [3,"もう一歩"], [5,"もう一歩"], [6,"合格"], [7,"合格"]]) {
      await pc.getByLabel("開始点").selectOption(String(score));
      await run.click();
      await feedback.filter({ hasText: "できました" }).waitFor();
      assert.equal(await pc.locator("main .code-result pre").textContent(), note + "（文字）");
    }
    await pc.goto(base + "#js-numbers/write");
    const wrong = "for(let n=1;n<=questionCount+1;n++) console.log(n);";
    await input.fill(wrong);
    await run.click();
    await feedback.filter({ hasText: "問題数を超えて" }).waitFor();
    await pc.getByRole("link", { name: "この問題のスライドを見直す" }).click();
    await pc.getByRole("link", { name: /解きかけの問題へ戻る/ }).click();
    assert.equal(await input.inputValue(), wrong);
    await feedback.filter({ hasText: "問題数を超えて" }).waitFor();
    if (process.env.SCREENSHOT_DIR) {
      await phone.goto(base + "#js-compare/1");
      await phone.locator(".code-result pre").waitFor();
      await phone.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "js-choices-phone.png") });
      await pc.goto(base + "#js-three-messages/2");
      await pc.locator(".code-result pre").waitFor();
      await pc.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "js-choices-pc.png") });
    }
    console.log("比較・二択・三択・番号の四単元、条件の境目と0問・3問、記述と別解、タップと下書き復帰を確認");
  } finally { await pc.close(); await phone.close(); }
}
module.exports = { verifyChoices };

if (require.main === module) {
  (async () => {
    const browser = await chromium.launch();
    try { await verifyChoices(browser, process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href); }
    finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
