"use strict";
const assert = require("node:assert/strict");

async function checkJsLessons(pc, phone, base, cases) {
  const run = pc.getByRole("button", { name: "コードを実行して確かめる" });
  const editor = pc.getByRole("textbox", { name: "JavaScript" });
  const feedback = pc.locator("main [role=status]");
  for (const [id, typical, alternate, pieces, failingSlide] of cases) {
    await pc.goto(base + "#" + id + "/1");
    const lesson = await pc.evaluate(id => {
      const l = javascriptLessons.find(l => l.id === id);
      return { slides: l.slides.map(s => ({ sign: s.sign })), answer: l.exercise.answer, correct: l.quiz.correct };
    }, id);
    for (const [i, slide] of lesson.slides.entries()) {
      await pc.goto(base + "#" + id + "/" + (i + 1));
      if (slide.sign) await pc.getByRole("button", { name: "見本を実行" }).click();
      if (i + 1 === failingSlide) await feedback.filter({ hasText: "行目で止まりました" }).waitFor();
      else await feedback.filter({ hasText: "実行しました" }).waitFor();
    }
    await pc.goto(base + "#" + id + "/quiz");
    for (const index of [(lesson.correct + 1) % 4, lesson.correct]) {
      await pc.getByRole("radio").nth(index).check();
      await pc.getByRole("button", { name: "答えを確かめる" }).click();
      assert.equal((await feedback.textContent()).startsWith("正解"), index === lesson.correct);
    }
    await pc.goto(base + "#" + id + "/write");
    await run.click();
    await feedback.filter({ hasText: typical }).waitFor();
    for (const code of [lesson.answer, alternate]) {
      await editor.fill(code);
      await run.click();
      await feedback.filter({ hasText: "できました" }).waitFor();
    }
    await phone.goto(base + "#" + id + "/write");
    for (const [i, name] of pieces.entries()) {
      await phone.locator("main form").getByRole("group").nth(i).getByRole("radio", { name, exact: true }).check();
    }
    await phone.getByRole("button", { name: "組んだコードを確かめる" }).tap();
    await phone.locator("main [role=status]").filter({ hasText: "できました" }).waitFor();
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
}
module.exports = { checkJsLessons };
