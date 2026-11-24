"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

async function verifyRecordBasics(browser, entry = pathToFileURL(path.resolve("python/index.html")).href) {
  const pc = await browser.newPage();
  const phone = await browser.newPage({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true });
  try {
    await pc.goto(entry + "#54/demo/toc");
    const contents = pc.locator("#contents");
    for (const [route, title] of [
      ["#55/demo", "条件で表示を変え、同じ処理を繰り返す"],
      ["#56/demo", "リストで合計し、辞書で名前から値を探す"],
      ["#names/demo", "空白を除き、同じ名前が出る回数を数える"],
    ]) {
      await contents.getByRole("heading", { name: title, exact: true }).waitFor();
      assert.equal(await contents.getByRole("link", { name: title, exact: true }).count(), 0);
      const link = contents.getByRole("link", { name: "「" + title + "」の完成例を見る", exact: true });
      assert.equal(await link.getAttribute("href"), route);
    }
    await contents.getByRole("link", { name: "「空白を除き、同じ名前が出る回数を数える」の完成例を見る", exact: true }).click();
    await pc.getByRole("heading", { name: "空白を除き、同じ名前が出る回数を数える", exact: true }).waitFor();
    assert.equal(new URL(pc.url()).hash, "#names/demo", "目次から名前の集計の完成例を開ける");
    assert.match(await pc.locator("#description").textContent(), /受付で入力した名前.*1行につき1回分の受付/);
    assert.equal(await pc.locator("#course-name").textContent(), "Python基礎");
    const status = pc.locator("#status");
    await pc.locator("#run").click();
    await status.getByText("実行できました。").waitFor();
    assert.equal(await pc.locator("#output").textContent(), "凪 2\n光 1\n");
    await pc.locator("#input").fill("  梢 \n澪\n \n澪\n終了\n集計外");
    await pc.locator("#run").click();
    await status.getByText("実行できました。").waitFor();
    assert.equal(await pc.locator("#output").textContent(), "澪 2\n梢 1\n");

    const last = await pc.evaluate(() => chapter.lessons.length);
    const assignment = entry + "#names/" + last + "/write";
    await pc.goto(assignment);
    const source = pc.getByLabel("main.py のコード");
    assert.equal(await source.inputValue(), "");
    await source.fill('print("森 3")\nprint("空 2")');
    await pc.locator("#grade").click();
    await status.getByText(/途中まで/).waitFor();
    assert.match(await pc.locator("#checks").textContent(), /✓ /);

    const alternate = [
      "totals = {}",
      "for row in rows:",
      "    key = row.strip()",
      "    if key != '':",
      "        if key in totals:",
      "            totals[key] += 1",
      "        else:",
      "            totals[key] = 1",
      "for key in sorted(totals, key=totals.get, reverse=True):",
      "    print(key, totals[key])",
    ].join("\n");
    await source.fill(alternate);
    await pc.locator("#grade").click();
    await status.getByText("すべての条件で正解です。").waitFor();

    await phone.goto(assignment);
    const lines = await phone.evaluate(() => {
      const solution = task.solution.split("\n");
      return tapTemplate(task, view, chapter.id + "/" + number)?.slots.map(i => solution[i].trim());
    });
    assert.equal(lines?.length, 3, "スマホでは集計に必要な操作を3か所選べる");
    for (const line of lines) {
      await phone.locator("#pieces").getByRole("button", { name: line, exact: true }).tap();
    }
    await phone.locator("#grade").tap();
    await phone.locator("#status").getByText("すべての条件で正解です。").waitFor();
    await phone.locator("#keyboard").tap();
    assert.equal(await phone.locator("#source").inputValue(), "");
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    console.log("基礎コースの目次、名前の集計、別データでの採点、スマホの組み立てと白紙記述を確認");
  } finally {
    await pc.close();
    await phone.close();
  }
}

module.exports = { verifyRecordBasics };

if (require.main === module) {
  (async () => {
    const browser = await chromium.launch({ args: ["--no-sandbox"] });
    try { await verifyRecordBasics(browser, process.env.PYTHON_URL); }
    finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
