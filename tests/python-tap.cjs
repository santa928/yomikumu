"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");

async function verifyTapExercises(phone, entry) {
  const report = await phone.evaluate(() => {
    const errors = [];
    let guided = 0;
    for (const chapter of pythonChapters) {
      for (const [i, lesson] of chapter.lessons.entries()) for (const view of ["guide", "write"]) {
        const task = lesson[view];
        const step = chapter.id + "/" + (i + 1);
        let saved, template = tapTemplate(task, view, step);
        if (!template) continue;
        guided++;
        for (let n = 0; n < 4 && template.index !== undefined; n++) {
          const line = task.solution.split("\n")[template.index];
          if (!template.candidates.includes(line)) errors.push(step + "/" + view + " 候補不足");
          saved = template.program;
          saved[template.index] = line;
          template = tapTemplate(task, view, step, saved);
        }
        if (saved.join("\n") !== task.solution || template.index !== undefined) errors.push(step + "/" + view + " 復元失敗");
      }
    }
    return { guided, errors };
  });
  assert.deepEqual(report.errors, []);
  assert.ok(report.guided >= 50);
  await phone.goto(entry + "#63/4/write");
  const choose = async name => phone.locator("#pieces").getByRole("button", { name, exact: true }).tap();
  await choose("@classmethod");
  await phone.getByRole("link", { name: "関連スライドを読み直す" }).tap();
  await phone.getByRole("link", { name: "書き途中の課題に戻る" }).tap();
  await phone.locator("#undo-line").tap();
  assert.ok((await phone.locator("#source").inputValue()).includes("# 空欄 1"));
  for (const name of ["@classmethod", "def from_text(cls, text):", "return cls(int(text))"]) await choose(name);
  await phone.locator("#grade").tap();
  await phone.locator("#status").getByText("すべての条件で正解です。").waitFor();
  await phone.goto(entry + "#67/5/write");
  assert.match(await phone.locator("#tap-instruction").textContent(), /空欄 1 \/ 3/);
  if (process.env.SCREENSHOT_DIR) {
    await phone.locator("#builder").scrollIntoViewIfNeeded();
    await phone.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "python-oop-tap.png") });
  }
  assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  console.log("長いPython課題 " + report.guided + "件の空欄とスマホでの復帰・やり直し・採点を確認");
}
module.exports = { verifyTapExercises };
