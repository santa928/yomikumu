"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const home = process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href;
const workbook = new URL("python/index.html", home).href;

async function follow(page, link, destination, touch = false) {
  assert.equal(await link.evaluate(element => element.href), destination);
  await Promise.all([page.waitForURL(destination), touch ? link.tap() : link.click()]);
}

async function fromCoursePicker(browser) {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
  try {
    await page.goto(home + "#paths/python");
    const practice = page.locator(".path-course").filter({
      has: page.getByRole("heading", { name: "Python実践", exact: true }),
    });
    await follow(page, practice.getByRole("link", { name: "最初の一課題を開く" }), workbook + "#63/1/slide/practice", true);
    await page.getByRole("heading", { name: "Book クラスで1冊分の記録を作る" }).waitFor();
    assert.equal(await page.locator("#course-name").textContent(), "Python クラス入門");
    await page.goto(home + "#paths/python");
    await follow(page, practice.getByRole("link", { name: /クラスを学習済み/ }), workbook + "#59/1/slide", true);
  } finally { await page.close(); }
}

async function fromBasics(browser) {
  const page = await browser.newPage();
  try {
    await page.goto(workbook + "#58/5/write");
    const steps = page.getByRole("navigation", { name: "この単元の移動" });
    await follow(page, steps.locator(".next"), workbook + "#63/1/slide/basics");
    await page.goto(workbook + "#63/3/write/basics");
    await follow(page, steps.getByRole("link", { name: "Python実践へ" }), workbook + "#59/1/slide");
    await page.goto(workbook + "#63/3/write");
    await follow(page, steps.getByRole("link", { name: "Python OOPの続きへ" }), workbook + "#63/4/slide");
  } finally { await page.close(); }
}

async function fromPractice(browser) {
  const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
  try {
    // このURLと下書きは共通入門の導入前から OOP で使われていた。
    await phone.goto(workbook + "#63/3/write");
    await phone.locator("#keyboard").tap();
    const saved = "class Book:\n    def reset(self):\n        self.pages = 0";
    await phone.locator("#source").fill(saved);
    await phone.goto(workbook + "#61/3/write");
    const steps = phone.getByRole("navigation", { name: "この単元の移動" });
    await follow(phone, steps.locator(".next"), workbook + "#63/1/slide/practice", true);
    await phone.getByText("Python OOPの目次", { exact: true }).tap();
    await phone.locator("#contents").getByRole("link", { name: "self で呼ばれた本だけ更新する" }).tap();
    await phone.getByRole("link", { name: "見本を変えてみる" }).tap();
    await phone.getByRole("link", { name: "自分で解く課題へ" }).tap();
    await phone.getByRole("heading", { name: "自分で解く", exact: true }).waitFor();
    assert.equal(await phone.locator("#source").inputValue(), saved);
    await follow(phone, steps.getByRole("link", { name: /with の練習へ戻る/ }), workbook + "#61/4/slide", true);
    await phone.goto(workbook + "#61/3/write");
    await follow(phone, steps.getByRole("link", { name: /クラスを学習済み/ }), workbook + "#61/4/slide", true);
    await phone.goto(workbook + "#61/4/write");
    assert.equal(await phone.locator("#course-name").textContent(), "Python実践");
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  } finally { await phone.close(); }
}

async function afterCompletedIntro(browser) {
  const page = await browser.newPage();
  try {
    await page.goto(workbook + "#61/3/write");
    await page.evaluate(() => {
      localStorage.setItem("yomikumu-python-oop-v1", JSON.stringify({
        route: "63/3/write", drafts: {}, quizzes: {},
        completed: { "63/1/write/tap": true, "63/2/write/code": true, "63/3/write/tap": true },
      }));
    });
    await page.reload();
    const steps = page.getByRole("navigation", { name: "この単元の移動" });
    await follow(page, steps.locator(".next"), workbook + "#61/4/slide");
    await follow(page, steps.getByRole("link", { name: "クラス入門を読み直す" }), workbook + "#63/1/slide/practice");
  } finally { await page.close(); }
}

async function independentResume(browser) {
  const pc = await browser.newPage();
  const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
  const oopDraft = "history = []";
  const practiceDraft = "first = Book(4)";
  try {
    await pc.goto(workbook + "#67/5/write");
    await pc.locator("#source").fill(oopDraft);
    await pc.goto(home + "#paths/python");
    await pc.locator(".path-course").filter({ has: pc.getByRole("heading", { name: "Python実践", exact: true }) })
      .getByRole("link", { name: "最初の一課題を開く" }).click();
    await pc.getByRole("link", { name: "見本を変えてみる" }).click();
    await pc.getByRole("link", { name: "自分で解く課題へ" }).click();
    await pc.getByRole("link", { name: "次のスライドへ" }).click();
    await pc.getByRole("link", { name: "見本を変えてみる" }).click();
    await pc.getByRole("heading", { name: "見本のコードを直す", exact: true }).waitFor();
    await pc.locator("#source").fill(practiceDraft);
    await pc.getByRole("link", { name: "関連スライドを読み直す" }).click();
    await pc.getByRole("link", { name: "書き途中の課題に戻る" }).waitFor();
    await pc.reload();
    await pc.getByRole("link", { name: "書き途中の課題に戻る" }).click();
    await pc.getByRole("heading", { name: "見本のコードを直す", exact: true }).waitFor();
    await pc.goto(home + "#paths");
    const latest = pc.getByRole("link", { name: /^前回の続きへ/ });
    assert.match(await latest.textContent(), /Python実践/);
    assert.equal(await latest.evaluate(element => element.href), workbook + "#63/2/guide/practice");

    await pc.goto(workbook + "#58/5/write");
    await follow(pc, pc.locator("#steps .next"), workbook + "#63/1/slide/basics");
    await pc.getByRole("heading", { name: "Book クラスで1冊分の記録を作る" }).waitFor();
    await pc.goto(home + "#paths/python");
    await pc.getByText("進捗と下書きの引き継ぎ", { exact: true }).click();
    const download = pc.waitForEvent("download");
    await pc.getByRole("button", { name: "進捗を書き出す" }).click();
    const saved = await (await download).path();
    await phone.goto(home + "#paths/python");
    await phone.getByText("進捗と下書きの引き継ぎ", { exact: true }).tap();
    await phone.locator("input[type=file]").setInputFiles(saved);
    await phone.getByRole("button", { name: "この記録を読み込む" }).tap();
    const [basics, practice, oop] = ["Python基礎", "Python実践", "Python OOP"]
      .map(name => phone.getByRole("link", { name: name + "の続きを開く" }));
    assert.equal(await basics.evaluate(element => element.href), workbook + "#63/1/slide/basics");
    await follow(phone, practice, workbook + "#63/2/guide/practice", true);
    await phone.getByRole("button", { name: "キーボードで書く" }).tap();
    assert.equal(await phone.locator("#source").inputValue(), practiceDraft);
    assert.equal(await phone.evaluate(() => JSON.parse(localStorage.getItem("yomikumu-python-oop-v1")).route), "67/5/write");
    await phone.goto(home + "#paths/python");
    await follow(phone, oop, workbook + "#67/5/write", true);
    await phone.getByRole("button", { name: "キーボードで書く" }).tap();
    assert.equal(await phone.locator("#source").inputValue(), oopDraft);
  } finally { await pc.close(); await phone.close(); }
}

async function openCourseToc(browser) {
  const page = await browser.newPage();
  try {
    for (const [name, id] of [["Python基礎", 54], ["Python実践", 59], ["Python OOP", 63]]) {
      await page.goto(home + "#paths/python");
      await page.getByRole("link", { name: name + "の単元を選ぶ" }).click();
      const toc = page.getByText(name + "の目次", { exact: true });
      await toc.waitFor();
      assert.equal(await toc.evaluate(element => element.parentElement.open), true);
      assert.equal(await toc.evaluate(element => element === document.activeElement), true);
      await page.goto(workbook + "#" + id + "/demo");
      await page.locator("details:not([open]) > #course-toc").waitFor();
    }
  } finally { await page.close(); }
}

async function transferNewChapters(browser) {
  const pc = await browser.newPage();
  const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
  const namesDraft = 'if count == 0:\n    print("受付なし")';
  const csvDraft = 'import csv\nwith open(input(), encoding="utf-8", newline="") as file:';
  try {
    await pc.goto(workbook + "#56/6/write");
    await follow(pc, pc.locator("#steps .next"), workbook + "#names/demo");
    await pc.goto(workbook + "#names/1/slide");
    await pc.locator("#quiz").getByRole("button", { name: "空", exact: true }).click();
    await pc.goto(workbook + "#names/1/write");
    await pc.locator("#source").fill(namesDraft + '\nelif count == 1:\n    print("個人")\nelse:\n    print("グループ")');
    await pc.locator("#grade").click();
    await pc.locator("#status").filter({ hasText: "すべての条件で正解" }).waitFor();
    await pc.locator("#source").fill(namesDraft);
    await pc.goto(workbook + "#62/6/write");
    await follow(pc, pc.locator("#steps .next"), workbook + "#csv/demo");
    await pc.goto(workbook + "#csv/1/guide");
    await pc.locator("#source").fill(csvDraft);
    await pc.locator("#task-files").getByText("reading.csv のデータ", { exact: true }).waitFor();
    assert.equal(await pc.locator("#task-files textarea").count(), 0);
    await pc.locator("#csv-kit").waitFor();

    await pc.goto(home + "#paths/python");
    await pc.getByText("進捗と下書きの引き継ぎ", { exact: true }).click();
    const download = pc.waitForEvent("download");
    await pc.getByRole("button", { name: "進捗を書き出す" }).click();
    const saved = await (await download).path();
    await phone.goto(home + "#paths/python");
    await phone.getByText("進捗と下書きの引き継ぎ", { exact: true }).tap();
    await phone.locator("input[type=file]").setInputFiles(saved);
    await phone.getByRole("button", { name: "この記録を読み込む" }).tap();
    await follow(phone, phone.getByRole("link", { name: "Python実践の続きを開く" }), workbook + "#csv/1/guide", true);
    await phone.getByRole("button", { name: "キーボードで書く" }).tap();
    assert.equal(await phone.locator("#source").inputValue(), csvDraft);
    await phone.goto(home + "#paths/python");
    await follow(phone, phone.getByRole("link", { name: "Python基礎の続きを開く" }), workbook + "#names/1/write", true);
    await phone.getByRole("button", { name: "キーボードで書く" }).tap();
    assert.equal(await phone.locator("#source").inputValue(), namesDraft);
    assert.equal(await phone.locator("#csv-kit").isVisible(), false);
    await phone.getByText("Python基礎の目次", { exact: true }).tap();
    await phone.locator("#contents").getByRole("link", { name: /elif.*（練習済み）/ }).tap();
    await phone.locator("#quiz").getByRole("button", { name: "空", pressed: true, exact: true }).waitFor();
  } finally { await pc.close(); await phone.close(); }
}

(async () => {
  const browser = await chromium.launch();
  try {
    const results = await Promise.allSettled([
      fromCoursePicker(browser), fromBasics(browser), fromPractice(browser), afterCompletedIntro(browser),
      transferNewChapters(browser), independentResume(browser), openCourseToc(browser),
    ]);
    const errors = results.filter(result => result.status === "rejected").map(result => result.reason);
    if (errors.length) throw new AggregateError(errors, "Pythonの共通入門または引き継ぎに失敗しました");
    console.log("Pythonの共通入門への移動、実践とOOPへの分岐、下書きの再開、新章の引き継ぎ形式を確認");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
