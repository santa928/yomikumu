"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const zip = require("../next/vendor/fflate.js");

const entry = process.env.NEXT_URL || pathToFileURL(path.resolve(__dirname, "../next/index.html")).href;
const folder = process.env.NEXT_TEST_KIT;
const mode = process.argv[2];
const base = process.env.BOOK_URL || "http://localhost:3000";

async function exportGuide(browser, lessons) {
  assert.equal((await fs.readdir(folder)).length, 0, "新しい空の出力先を使います");
  const pc = await browser.newPage();
  const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
  await phone.goto(entry + "#guide-project");
  await phone.getByRole("button", { name: "/meetings/river?edition=autumn", exact: true }).tap();
  await phone.locator(".code-result pre").filter({ hasText: "夕方の詩の会" }).waitFor();
  for (const unit of lessons) {
    for (const [i, slide] of unit.slides.entries()) {
      await pc.goto(entry + "#" + unit.id + "/slide/" + (i + 1));
      await pc.getByText(slide[0], { exact: true }).waitFor();
    }
    await phone.goto(entry + "#" + unit.id + "/quiz");
    for (const [i, status] of [[(unit.quiz[2] + 1) % 4, "もう一度"], [unit.quiz[2], "正解です"]]) {
      await phone.getByRole("radio").nth(i).check();
      await phone.getByRole("button", { name: "答えを確かめる" }).tap();
      await phone.locator("main [role=status]").filter({ hasText: status }).waitFor();
    }
    await phone.getByRole("link", { name: "コードを練習する" }).tap();
    for (const [i, value] of unit.right.entries()) {
      const option = phone.getByRole("group").nth(i).getByRole("radio", { name: value, exact: true });
      await option.tap();
      assert.ok(await option.isChecked(), unit.id + " " + value + " を選択");
      await phone.waitForFunction(({ id, index, wanted }) => state.units[id]?.pieces?.[index] === wanted, { id: unit.id, index: i, wanted: value }, { timeout: 2500 });
      await phone.getByRole("button", { name: "組み立てを確かめる" }).tap();
      const status = await phone.locator("main [role=status]").innerText();
      assert.ok(status.includes(i ? "できました" : "最初の指定は合っています"), unit.id + " " + i + " " + status);
    }
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await pc.goto(entry + "#" + unit.id + "/write");
    const editor = pc.getByRole("textbox", { name: unit.file, exact: true });
    await editor.fill(unit.answer);
    await pc.getByRole("link", { name: "見本を読み直す" }).click();
    await pc.getByRole("link", { name: "解きかけの課題へ戻る" }).click();
    assert.equal(await editor.inputValue(), unit.answer);
  }
  const pending = pc.waitForEvent("download");
  await pc.getByRole("button", { name: "今のコードをZIPで保存" }).click();
  const download = await pending;
  const archive = zip.unzipSync(new Uint8Array(await fs.readFile(await download.path())));
  for (const unit of lessons) assert.equal(zip.strFromU8(archive[unit.file]), unit.answer);
  for (const [filename, bytes] of Object.entries(archive)) {
    const target = path.resolve(folder, filename);
    assert.ok(target.startsWith(path.resolve(folder) + path.sep));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes);
  }
  await fs.writeFile(path.join(folder, ".yomikumu-test-scratch"), "temporary test copy");
  if (process.env.NEXT_SHOTS) {
    await phone.screenshot({ path: path.join(process.env.NEXT_SHOTS, "meeting-tap.png") });
  }
  console.log("卒業制作7単元のスライド・四択・タップ・下書き復帰と、ブラウザから保存したZIPのソースを確認");
}

function alternate(unit) {
  const edits = {
    "travel-list": ['<Link href="/travel/hill">夕方の丘</Link>', '<a href={"/travel/" + "hill"}>夕方の丘</a>'],
    "travel-detail": ['<Link href="/travel">旅の一覧へ</Link>', '<a href="/travel">旅の一覧へ</a>'],
    "travel-search": ["stops.filter(stop => !town || stop.town === town)", "town === '' ? stops : stops.filter(({ town: region }) => region === town)"],
    "travel-meta": ['title: "港の道順"', 'title: ["港", "道順"].join("の")'],
    "travel-image": ['alt="港の赤い太陽と白い帆"', 'alt={["港の赤い太陽", "白い帆"].join("と")}'],
    "meeting-project": ["records.filter(item => !town || item.town === town)", "town ? records.filter(({ town: region }) => region === town) : [...records]"],
    "meeting-export": ["<section><h2>海辺の読書会場</h2>{children}</section>", "<><h2>{'海辺の読書会場'}</h2><article>{children}</article></>"],
  };
  const [from, to] = edits[unit.id];
  assert.ok(unit.answer.includes(from));
  return unit.answer.replace(from, to);
}
async function verifyHttp(browser, lessons, restart) {
  assert.equal(await fs.readFile(path.join(folder, ".yomikumu-test-scratch"), "utf8"), "temporary test copy");
  const { guideChecks } = await import(pathToFileURL(path.join(folder, "check/guide.mjs")).href);
  const page = await browser.newPage({ baseURL: base });
  const http = address => fetch(new URL(address, base));
  await page.goto("/travel/example");
  await page.getByLabel("地区").fill("港");
  await page.getByRole("button", { name: "探す" }).click();
  await page.getByRole("link", { name: "水辺の桟橋" }).click();
  await page.getByText("港の入口です。", { exact: true }).waitFor();

  async function checkSuite(suite) {
    const rows = [];
    for (const [name, verify] of suite.checks) {
      let ok = false;
      try { ok = Boolean(await verify({ page, http })); } catch { /* 保存直後はコンパイルを待って再読する。 */ }
      rows.push({ name, ok });
      if (!ok) break;
    }
    return rows;
  }
  async function expectResult(unit, expected, minPass = 0) {
    const deadline = Date.now() + 45000;
    let rows, matches = 0;
    do {
      rows = await checkSuite(guideChecks[unit.id]);
      const good = rows.filter(row => row.ok).length;
      if (rows.every(row => row.ok) === expected && good >= minPass) {
        if (expected || ++matches === 2) return;
      } else matches = 0;
      await new Promise(resolve => setTimeout(resolve, 250));
    } while (Date.now() < deadline);
    assert.fail(unit.id + " 期待 " + expected + " " + JSON.stringify(rows));
  }
  for (const unit of lessons) {
    if (restart && unit.id !== "meeting-export") continue;
    const filename = path.join(folder, unit.file);
    assert.equal(await fs.readFile(filename, "utf8"), unit.answer);
    await expectResult(unit, true);
    if (restart) continue;
    try {
      await fs.writeFile(filename, unit.source);
      await expectResult(unit, false);
      await fs.writeFile(filename, alternate(unit));
      await expectResult(unit, true);
      if (unit.id === "meeting-project") {
        const fixed = 'import { meetingsFor } from "./meetings";\n' + unit.answer.replace("const found = records.filter", 'const found = meetingsFor("spring").filter');
        await fs.writeFile(filename, fixed);
        await expectResult(unit, false, 2);
      }
    } finally { await fs.writeFile(filename, unit.answer); }
    await expectResult(unit, true);
    console.log(unit.id + "　実Nextで正答・典型誤答・別解を確認");
  }
  if (restart) {
    const report = JSON.parse(await fs.readFile(path.join(folder, "reports/meeting-export.json"), "utf8"));
    const imported = await browser.newPage();
    const project = lessons.find(lesson => lesson.id === "meeting-project");
    await imported.goto(entry + "#meeting-project/write");
    await imported.getByRole("textbox", { name: project.file }).fill(project.answer);
    await imported.goto(entry + "#meeting-export/write");
    const unit = lessons.find(lesson => lesson.id === "meeting-export");
    await imported.getByRole("textbox", { name: unit.file }).fill(unit.answer);
    assert.equal(report.passed, true);
    await imported.getByLabel("手元の採点結果を読み込む").setInputFiles(path.join(folder, "reports/meeting-export.json"));
    await imported.locator("main [role=status]").filter({ hasText: "手元のサーバーで動作を確認しました" }).waitFor();
    console.log("書き出したサーバーの再開後に春・秋の実HTTPと採点結果の復帰を確認");
  }
  if (process.env.NEXT_SHOTS) {
    await page.goto("/meetings?edition=autumn&town=" + encodeURIComponent("港"));
    await page.screenshot({ path: path.join(process.env.NEXT_SHOTS, "meeting-autumn.png") });
  }
}

(async () => {
  assert.ok(folder && ["export", "compare", "restart"].includes(mode), "NEXT_TEST_KITとexport・compare・restartのいずれかを指定します");
  const browser = await chromium.launch();
  try {
    const intro = await browser.newPage();
    await intro.goto(entry + "#guide-project");
    const lessons = await intro.evaluate(() => nextLessons.filter(unit => unit.chapter === "guide-project"));
    assert.equal(lessons.length, 7);
    if (mode === "export") await exportGuide(browser, lessons);
    else await verifyHttp(browser, lessons, mode === "restart");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
