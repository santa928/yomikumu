"use strict";

const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const { chromium } = require("playwright");

async function verifyJavaScript(browser, base) {
  const pc = await browser.newPage({ viewport: { width: 1200, height: 850 } });
  const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const errors = [];
  for (const page of [pc, phone]) page.on("pageerror", error => errors.push(error.message));
  const status = pc.locator("main [role=status]");
  const run = pc.getByRole("button", { name: "コードを実行して確かめる" });
  const editor = pc.getByRole("textbox", { name: "JavaScript", exact: true });
  async function open(page, route) {
    await page.goto(base + "#" + route);
    await page.waitForFunction(expected => currentRoute === expected, route);
  }
  async function submit(code, expected) {
    await editor.fill(code);
    await run.click();
    await status.filter({ hasText: expected }).waitFor({ timeout: 7000 });
  }
  try {
    await open(pc, "home");
    await pc.getByRole("link", { name: "JavaScript の得点クイズへ" }).click();
    await pc.getByRole("link", { name: "最初のスライドへ →" }).click();
    const sample = pc.getByRole("button", { name: "見本を実行" });
    await sample.click();
    await pc.getByRole("button", { name: "見本を停止" }).click();
    await status.filter({ hasText: "停止しました" }).waitFor();
    await pc.getByRole("heading", { name: "開館中", level: 2, exact: true }).waitFor();
    await sample.click();
    await pc.getByRole("heading", { name: "本日は閉館", level: 2, exact: true }).waitFor();
    const cases = [
      ["js-sign", "引用符", "showTitle('夜の展示')", ["夜の展示"]],
      ["js-console", "数として表示", "console.log('3');\nconsole.log(1+2);\nconsole.log(!false);", ["3", "true"]],
      ["js-constant", "開始点を数", "const ticket = (initialScore);\nconsole.log(ticket);\nconsole.log(ticket);", ["initialScore", "ticket"]],
      ["js-add", "数の3", "console.log(1 + initialScore + 2);", ["initialScore", "3"]],
      ["js-score", "2点増やした", "let score = initialScore;\nconsole.log(score);\nscore += 2;\nconsole.log(score);", ["initialScore", "2"]],
    ];
    for (const [id, typical, alternate, pieces] of cases) {
      const lesson = await pc.evaluate(id => {
        const l = javascriptLessons.find(item => item.id === id);
        return { count: l.slides.length, correct: l.quiz.correct, answer: l.exercise.answer };
      }, id);
      for (let i = 1; i <= lesson.count; i++) {
        await open(pc, id + "/" + i);
        await pc.locator("main .sources pre").first().waitFor();
        if (id !== "js-sign") await pc.locator("figure pre").first().waitFor();
      }
      await open(pc, id + "/quiz");
      const choices = pc.getByRole("radio");
      for (const index of [(lesson.correct + 1) % 4, lesson.correct]) {
        await choices.nth(index).check();
        await pc.getByRole("button", { name: "答えを確かめる" }).click();
        assert.equal((await status.textContent()).startsWith("正解です"), index === lesson.correct);
      }
      await open(pc, id + "/write");
      await run.click();
      await status.filter({ hasText: typical }).waitFor();
      await submit(lesson.answer, "できました");
      await submit(alternate, "できました");
      await open(phone, id + "/write");
      assert.equal(await phone.locator("textarea").count(), 0);
      for (const [index, value] of pieces.entries()) {
        const group = phone.locator("main form").getByRole("group").nth(index);
        await group.getByRole("radio", { name: value, exact: true }).check();
      }
      await phone.getByRole("button", { name: "組んだコードを確かめる" }).tap();
      await phone.locator("main [role=status]").filter({ hasText: "できました" }).waitFor();
      assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await open(pc, "js-constant/write");
    await submit("let ticket = initialScore;\nconsole.log(ticket);\nconsole.log(ticket);", "const");
    await open(pc, "js-score/write");
    await submit("let score = initialScore;\nconsole.log(score);\nconsole.log(score + 2);", "score 自体");
    await submit("let score = 2;\nconsole.log(score);\nscore += 2;\nconsole.log(score);", "開始点を5に変えた場合");
    const err = "let score = initialScore;\nconsole.log(scroe);";
    await submit(err, "2行目");
    await pc.getByRole("link", { name: "この問題のスライドを見直す" }).click();
    await pc.reload();
    await pc.getByRole("link", { name: /解きかけの問題へ戻る/ }).click();
    assert.equal(await editor.inputValue(), err);
    await status.filter({ hasText: "名前のつづり" }).waitFor();
    await submit('let score = 1;\nscore + = 2;', "2行目");
    await editor.fill("while (true) {}");
    await run.click();
    await pc.getByRole("button", { name: "実行を止める" }).click();
    await status.filter({ hasText: "停止しました" }).waitFor();
    assert.equal(await editor.inputValue(), "while (true) {}");
    await pc.getByLabel("開始点").selectOption("5");
    const final = cases.at(-1)[2];
    await submit(final, "できました");
    assert.equal(await pc.locator(".code-result pre").textContent(), "5（数）\n7（数）");
    if (process.env.SCREENSHOT_DIR) {
      await pc.getByRole("heading", { name: "自分で書いて確かめる" }).scrollIntoViewIfNeeded();
      await pc.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "js-score-pc.png") });
      await phone.locator("h1").scrollIntoViewIfNeeded();
      await phone.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "js-score-phone.png") });
    }
    await open(pc, "javascript");
    await pc.getByText("進捗と下書きの引き継ぎ", { exact: true }).click();
    const saving = pc.waitForEvent("download");
    await pc.getByRole("button", { name: "進捗を書き出す" }).click();
    const exported = await (await saving).path();
    await open(phone, "home");
    await phone.getByText("進捗と下書きの引き継ぎ", { exact: true }).tap();
    await phone.locator('input[type="file"]').setInputFiles(exported);
    await phone.getByRole("button", { name: "この記録を読み込む" }).tap();
    await phone.getByRole("link", { name: "前回の続きへ →" }).tap();
    await phone.getByRole("link", { name: "キーボードで書く" }).tap();
    assert.equal(await phone.getByRole("textbox", { name: "JavaScript" }).inputValue(), final);
    assert.deepEqual(errors, []);
    console.log("JavaScript入門の見本・選択・記述・タップ、二つの開始点、停止とエラー行、端末間の下書き移行を確認");
  } finally {
    await pc.close();
    await phone.close();
  }
}
module.exports = { verifyJavaScript };

if (require.main === module) {
  (async () => {
    const browser = await chromium.launch();
    try {
      await verifyJavaScript(browser, process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href);
    } finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
