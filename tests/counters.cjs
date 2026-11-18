"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const { checkJsLessons } = require("./js-lessons.cjs");

async function verifyCounters(browser, base) {
  const pc = await browser.newPage({ viewport: { width: 1100, height: 820 } });
  const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  try {
    const counter = "const makeCounter = (value, amount) => () => { value += amount; return value; };";
    await checkJsLessons(pc, phone, base, [
      ["js-return-action", "後で呼べる desk", 'function desk() { return "受付中"; } function prepare(){return () => desk();}', ["desk"]],
      ["js-kept-name", "固定の文字", "const makeDesk = name => () => name;", ["name"]],
      ["js-counter", "初回は開始点", counter, ["score","step"]],
      ["js-reset-counter", "二回目が同じ点", counter, ["let score = start;","score += step;"]],
      ["js-two-counters", "青は独立", counter + "\nconst red=makeCounter(initialScore,2);\nconst blue=makeCounter(0,3);", ["0","3"]],
    ]);
    await phone.goto(base + "#js-counter/1");
    await phone.getByRole("link", { name: "初期化を直す練習" }).tap();
    for (let i=0; i<2; i++) await phone.getByRole("button", { name: "受付で1点加える" }).tap();
    await phone.getByText("2回の呼び出しを実行しました。", { exact: true }).waitFor();
    assert.equal(await phone.locator(".code-result pre").textContent(), "1（数）\n1（数）");
    await phone.getByRole("link", { name: "次のスライドへ →" }).tap();
    for (let i=0; i<2; i++) await phone.getByRole("button", { name: "受付で1点加える" }).tap();
    await phone.getByText("2回の呼び出しを実行しました。", { exact: true }).waitFor();
    assert.equal(await phone.locator(".code-result pre").textContent(), "1（数）\n2（数）");
    await phone.goto(base + "#js-counter/1");
    await phone.getByRole("link", { name: "二つの受付に挑戦" }).tap();
    const red = phone.getByRole("button", { name: "赤い受付で2点加える" });
    const blue = phone.getByRole("button", { name: "青い受付で3点加える" });
    await red.tap(); await blue.tap(); await red.tap();
    await phone.getByText("3回の呼び出しを実行しました。", { exact: true }).waitFor();
    assert.equal(await phone.locator(".code-result pre").textContent(), "4（数）\n3（数）\n6（数）");
    await phone.getByLabel("開始点").selectOption("5");
    await phone.locator(".code-result pre").filter({ hasText: "9（数）" }).waitFor();
    assert.equal(await phone.locator(".code-result pre").textContent(), "7（数）\n3（数）\n9（数）");
    if (process.env.SCREENSHOT_DIR) await phone.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "counters-phone.png") });
    await phone.getByRole("button", { name: "最初から試す" }).tap();
    await phone.getByText("出力はありません。", { exact: true }).waitFor();
    await pc.goto(base + "#js-reset-counter/write");
    const input = pc.getByRole("textbox", { name: "JavaScript" });
    const flawed = "function makeCounter(start,step){ return () => {let score=start; return score+step;}; }";
    await input.fill(flawed);
    await pc.getByRole("button", { name: "コードを実行して確かめる" }).click();
    await pc.locator("main [role=status]").filter({ hasText: "二回目が同じ" }).waitFor();
    await pc.getByRole("link", { name: "この問題のスライドを見直す" }).click();
    await pc.getByRole("link", { name: /解きかけの問題へ戻る/ }).click();
    assert.equal(await input.inputValue(), flawed);
    if (process.env.SCREENSHOT_DIR) await pc.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "counters-pc.png") });
    console.log("関数を返すところから独立した二受付までの五単元。実際の呼び出し順、初期化の修理、別解・タップ・下書きを確認");
  } finally { await pc.close(); await phone.close(); }
}

module.exports = { verifyCounters };
if (require.main === module) {
  (async () => {
    const browser = await chromium.launch();
    try { await verifyCounters(browser, process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href); }
    finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
