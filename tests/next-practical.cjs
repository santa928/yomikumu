"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs/promises");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const zip = require("../next/vendor/fflate.js");

const base = process.env.NEXT_URL || pathToFileURL(path.join(__dirname, "../next/index.html")).href;
const linkFile = "library/recommendation-title.jsx";
const detailFile = "app/recommendations/[id]/page.jsx";
const listFile = "app/recommendations/page.jsx";
const steps = [
  { id: "catalog-links", file: linkFile, slots: ["Link", "book.id"] },
  { id: "catalog-detail", file: detailFile, slots: ["params", "id"] },
  { id: "catalog-search", file: listFile, slots: ["q", "page"] },
];

async function download(page, filename) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "今のコードをZIPで保存" }).click();
  const archive = await pending;
  if (filename) await archive.saveAs(filename);
  return zip.unzipSync(new Uint8Array(await fs.readFile(await archive.path())));
}

(async () => {
  const browser = await chromium.launch();
  try {
    const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
    await phone.goto(base + "#catalog-practice");
    const heading = await phone.locator("main h1").textContent();
    assert.equal(heading, "一覧に詳細ページ・検索・ページ送りを加える");
    assert.equal(await phone.getByRole("link", { name: "一覧の本を詳細へのリンクにする", exact: true }).count(), 1);
    for (const { id, slots } of steps) {
      await phone.goto(base + "#" + id + "/slide/1");
      await phone.locator("main pre").waitFor();
      const chapter = phone.getByRole("link", { name: "この章の目次", exact: true });
      assert.equal(await chapter.getAttribute("href"), "#catalog-practice");
      await phone.goto(base + "#" + id + "/tap");
      const groups = phone.getByRole("group");
      await groups.nth(0).getByRole("radio", { name: slots[0], exact: true }).check();
      await phone.getByRole("button", { name: "組み立てを確かめる" }).tap();
      const feedback = phone.locator("main [role=status]");
      assert.match(await feedback.textContent(), /最初の指定は合っています/);
      await phone.getByRole("link", { name: "見本を読み直す" }).tap();
      await phone.getByRole("link", { name: "解きかけの課題へ戻る" }).tap();
      assert.equal(await groups.nth(0).getByRole("radio", { name: slots[0], exact: true }).isChecked(), true);
      await groups.nth(1).getByRole("radio", { name: slots[1], exact: true }).check();
      await phone.getByRole("button", { name: "組み立てを確かめる" }).tap();
      assert.match(await feedback.textContent(), /できました/);
      assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }

    const pc = await browser.newPage({ viewport: { width: 1100, height: 800 }, acceptDownloads: true });
    await pc.goto(base + "#catalog-detail/write");
    const setup = await pc.locator("main ol").textContent();
    assert.ok(setup.includes(detailFile));
    assert.match(setup, /\[id\] フォルダーとその中の page\.jsx を作り/);
    const pcSteps = await pc.evaluate(ids => ids.map(id => {
      const lesson = nextLessons.find(item => item.id === id);
      return { id, file: lesson.file, source: lesson.source, answer: lesson.answer };
    }), steps.map(step => step.id));
    const starter = await download(pc, process.env.NEXT_PRACTICAL_STARTER);
    assert.ok(!Object.keys(starter).some(file => file.startsWith("app/recommendations/[id]/")));
    for (const { file, source } of pcSteps.filter(item => item.file !== detailFile)) {
      assert.equal(zip.strFromU8(starter[file]), source);
    }
    for (const { id, file, answer } of pcSteps) {
      await pc.goto(base + "#" + id + "/write");
      const editor = pc.getByRole("textbox", { name: file, exact: true });
      assert.notEqual(await editor.inputValue(), answer);
      await editor.fill(answer);
    }
    const solved = await download(pc, process.env.NEXT_PRACTICAL_SOLVED);
    for (const { file, answer } of pcSteps) assert.equal(zip.strFromU8(solved[file]), answer);
    assert.ok(solved["check/catalog.mjs"]);

    if (process.env.NEXT_PRACTICAL_REPORTS) {
      for (const { id } of steps) {
        await pc.goto(base + "#" + id + "/write");
        const upload = pc.getByLabel("手元の採点結果を読み込む");
        await upload.setInputFiles(path.join(process.env.NEXT_PRACTICAL_REPORTS, id + ".json"));
        await pc.getByText("手元のサーバーで動作を確認しました。", { exact: false }).waitFor();
      }
      await pc.goto(base + "#catalog-practice");
      assert.equal(await pc.getByText("PCで実行", { exact: true }).count(), steps.length);
    }
    console.log("Next.js実践の章、スマホの解き直し、PCの初期ZIP・正答ZIPを確認");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
