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
    await pc.goto(base + "#routes");
    await pc.getByRole("button", { name: "/books/reed", exact: true }).click();
    await pc.locator(".code-result pre").filter({ hasText: "葦の小舟" }).waitFor();
    const lessons = await pc.evaluate(() => nextLessons.map(({id, slides, right, quiz, answer, file}) =>
      ({ id, count: slides.length, right, correct: quiz[2], answer, file })));
    for (const lesson of lessons) {
      const { id, count, right, correct, answer, file } = lesson;
      for (let i = 1; i <= count; i++) {
        await pc.goto(base + "#" + id + "/slide/" + i);
        await pc.getByRole("heading", { level: 1 }).waitFor();
        assert.ok(await pc.locator("main pre").textContent());
      }
      await phone.goto(base + "#" + id + "/quiz");
      for (const [index, text] of [[(correct + 1) % 4, "もう一度"], [correct, "正解です"]]) {
        await phone.getByRole("radio").nth(index).check();
        await phone.getByRole("button", { name: "答えを確かめる" }).tap();
        await phone.locator("main [role=status]").filter({ hasText: text }).waitFor();
      }
      await phone.getByRole("link", { name: "コードを練習する" }).tap();
      for (const [i, value] of right.entries()) {
        const options = phone.getByRole("group").nth(i);
        await options.getByRole("radio", { name: value, exact: true }).check();
        if (i === 0) {
          await phone.getByRole("button", { name: "組み立てを確かめる" }).tap();
          await phone.locator("main [role=status]").filter({ hasText: "最初の指定は合っています" }).waitFor();
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
        await pc.getByLabel("手元の採点結果を読み込む").setInputFiles(path.join(process.env.NEXT_REPORTS, lesson.id + ".json"));
        await pc.locator("main [role=status]").filter({ hasText: "手元のサーバーで動作を確認しました" }).waitFor();
      }
    }
    console.log("Next.js " + lessons.length + "課題の見本・四択・タップ組立・PC下書き・ZIPの内容を確認");
  } finally { await browser.close(); }
}
verifyNext().catch(error => { console.error(error); process.exitCode = 1; });
