"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const zip = require("../next/vendor/fflate.js");

async function verifyNext() {
  const browser = await chromium.launch();
  try {
    const pc = await browser.newPage({ viewport: { width: 1100, height: 800 } });
    const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
    const base = process.env.NEXT_URL || pathToFileURL(path.resolve(__dirname, "../next/index.html")).href;
    await pc.goto(base + "#contents");
    const chapters = await pc.evaluate(() => nextChapters.map(({ id, title, examples }) =>
      ({ id, title, examples })));
    assert.deepEqual(chapters.map(chapter => chapter.id), ["routes", "client", "refresh", "signup", "guide-project", "catalog-practice"]);
    for (const chapter of chapters) {
      await pc.getByRole("link", { name: chapter.title, exact: true }).click();
      const [action, result] = chapter.examples.at(-1);
      const option = pc.getByRole("button", { name: action, exact: true });
      await option.click();
      assert.equal(await option.getAttribute("aria-pressed"), "true");
      assert.equal(await pc.locator(".code-result pre").textContent(), result);
      await pc.getByRole("link", { name: "図書室の目次" }).click();
    }
    await pc.goto(base + "#routes");
    await pc.getByRole("button", { name: "/books/reed", exact: true }).click();
    await pc.locator(".code-result pre").filter({ hasText: "葦の小舟" }).waitFor();
    const lessons = await pc.evaluate(() => nextLessons.map(({id, slides, right, quiz, answer, file, task}) =>
      ({ id, count: slides.length, right, correct: quiz[2], question: quiz[0], answer, file, task })));
    for (const lesson of lessons) {
      const { id, count, right, correct, answer, file } = lesson;
      for (let i = 1; i <= count; i++) {
        await pc.goto(base + "#" + id + "/slide/" + i);
        await pc.getByRole("heading", { level: 1 }).waitFor();
        assert.ok(await pc.locator("main pre").textContent());
      }
      await phone.goto(base + "#" + id + "/quiz");
      await phone.getByText(lesson.question, { exact: true }).first().waitFor();
      for (const [index, text] of [[(correct + 1) % 4, "もう一度"], [correct, "正解です"]]) {
        await phone.getByRole("radio").nth(index).check();
        await phone.getByRole("button", { name: "答えを確かめる" }).tap();
        await phone.locator("main [role=status]").filter({ hasText: text }).waitFor();
      }
      await phone.getByRole("link", { name: "コードを練習する" }).tap();
      await phone.getByText(lesson.task, { exact: true }).first().waitFor();
      for (const [i, value] of right.entries()) {
        const options = phone.getByRole("group").nth(i);
        await options.getByRole("radio", { name: value, exact: true }).check();
        if (i === 0 && right.length > 1) {
          await phone.getByRole("button", { name: "組み立てを確かめる" }).tap();
          const status = await phone.locator("main [role=status]").innerText();
          assert.match(status, /最初の指定は合っています/, id + " " + status);
        }
      }
      await phone.getByRole("button", { name: "組み立てを確かめる" }).tap();
      await phone.locator("main [role=status]").filter({ hasText: "できました" }).waitFor();
      assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await pc.goto(base + "#" + id + "/write");
      const editor = pc.getByRole("textbox", { name: file, exact: true });
      await editor.fill(answer);
      await pc.getByRole("link", { name: "見本を読み直す" }).click();
      await pc.getByRole("link", { name: "解きかけの課題へ戻る" }).click();
      assert.equal(await editor.inputValue(), answer);
    }
    const download = pc.waitForEvent("download");
    await pc.getByRole("button", { name: "今のコードをZIPで保存" }).click();
    const archive = await download;
    assert.equal(archive.suggestedFilename(), "yomikumu-reading-room.zip");
    const files = zip.unzipSync(new Uint8Array(await fs.readFile(await archive.path())));
    for (const lesson of lessons) assert.equal(zip.strFromU8(files[lesson.file]), lesson.answer);
    assert.ok(files["compose.yaml"] && files["package-lock.json"] && files["check/grade.mjs"]);
    if (process.env.NEXT_ARCHIVE) await archive.saveAs(process.env.NEXT_ARCHIVE);
    if (process.env.NEXT_SHOTS) {
      await pc.screenshot({ path: path.join(process.env.NEXT_SHOTS, "next-write.png") });
      await phone.screenshot({ path: path.join(process.env.NEXT_SHOTS, "next-tap.png") });
    }
    if (process.env.NEXT_REPORTS) {
      for (const lesson of lessons) {
        await pc.goto(base + "#" + lesson.id + "/write");
        const upload = pc.getByLabel("手元の採点結果を読み込む");
        const reportFile = path.join(process.env.NEXT_REPORTS, lesson.id + ".json");
        if (lesson === lessons[0]) {
          const editor = pc.getByRole("textbox", { name: lesson.file, exact: true });
          await editor.fill(lesson.answer + "\n// 続きを書いている途中");
          await upload.setInputFiles(reportFile);
          await pc.locator("main [role=status]").filter({ hasText: "採点したコードと記述欄が違います" }).waitFor();
          await editor.fill(lesson.answer);
        }
        if (lesson.id === "meeting-export") {
          const project = lessons.find(item => item.id === "meeting-project");
          const companion = pc.getByRole("textbox", { name: project.file, exact: true });
          await pc.goto(base + "#meeting-project/write");
          await companion.fill(project.answer + "\n// 別の版");
          await pc.goto(base + "#meeting-export/write");
          await upload.setInputFiles(reportFile);
          await pc.locator("main [role=status]").filter({ hasText: "下書きも採点した内容とそろえ" }).waitFor();
          await pc.goto(base + "#meeting-project/write");
          await companion.fill(project.answer);
          await pc.goto(base + "#meeting-export/write");
        }
        await upload.setInputFiles(reportFile);
        await pc.locator("main [role=status]").filter({ hasText: "手元のサーバーで動作を確認しました" }).waitFor();
      }
    }
    console.log("Next.js " + lessons.length + "課題の見本・四択・タップ組立・PC下書き・ZIPの内容を確認");
  } finally { await browser.close(); }
}
verifyNext().catch(error => { console.error(error); process.exitCode = 1; });
