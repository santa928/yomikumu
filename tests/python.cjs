"use strict";

const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const { chromium } = require("playwright");
const fixtures = require("./python-answers.cjs");

async function verifyPython(browser, entry = pathToFileURL(path.resolve("python/index.html")).href, only) {
  const pc = await browser.newPage();
  const phone = await browser.newPage({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true });
  try {
    await pc.goto(entry + "#54/demo");
    const status = pc.locator("#status");
    await pc.locator("#run").click();
    await status.getByText("実行できました。").waitFor();
    assert.equal(await pc.locator("#output").textContent(), "つばき\n3\n");
    await pc.locator("#input").fill("はる");
    await pc.locator("#run").click();
    await pc.getByLabel("入力待ち・次の一行").fill("3");
    await pc.getByRole("button", { name: "一行を渡す" }).click();
    await status.getByText("実行できました。").waitFor();
    assert.equal(await pc.locator("#output").textContent(), "はる\n4\n");
    await pc.locator("#input").fill("あき\n三");
    await pc.locator("#run").click();
    await status.getByText(/ValueError/).waitFor();

    await pc.goto(entry + "#54/5/write");
    const source = pc.getByLabel("main.py のコード");
    await source.fill('name = input()\nprint(name)');
    await pc.locator("#grade").click();
    await status.getByText(/途中まで/).waitFor();
    await pc.getByRole("link", { name: "関連スライドを読み直す" }).click();
    await pc.getByRole("button", { name: "int(input()) + 1", exact: true }).click();
    await pc.locator("#quiz-result").getByText(/正解/).waitFor();
    await pc.getByRole("link", { name: "書き途中の課題に戻る" }).click();
    assert.equal(await source.inputValue(), "name = input()\nprint(name)");
    await source.fill("while True:\n    pass");
    await pc.locator("#run").click();
    await pc.locator("#stop").click();
    await status.getByText(/停止しました/).waitFor();
    const alternate = "visitor = input()\ntickets = input()\nprint(visitor)\nprint(3 + int(tickets))";
    await source.fill(alternate);
    await pc.locator("#grade").click();
    await status.getByText(/できました。すべて/).waitFor();
    await pc.reload();
    assert.equal(await source.inputValue(), alternate);

    await phone.goto(entry + "#54/4/write");
    const pieces = phone.locator("#pieces");
    for (const line of ["work = input()", 'print("展示")', "print(work)"]) {
      await pieces.getByRole("button", { name: line, exact: true }).tap();
    }
    await phone.locator("#grade").tap();
    await phone.locator("#status").getByText(/できました。すべて/).waitFor();
    await phone.locator("#keyboard").tap();
    assert.equal(await phone.locator("#source").inputValue(), "");
    await phone.locator("#tap").tap();
    assert.ok((await phone.locator("#source").inputValue()).endsWith("print(work)"));
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (process.env.SCREENSHOT_DIR) await phone.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "python-mobile.png") });

    if (!only || only === "58") await require("./python-modules.cjs").verifyModules(pc, entry);
    if ((!only || Number(only) >= 59) && await pc.evaluate(() => pythonChapters.some(ch => ch.id === "59"))) {
      await pc.goto(entry + "#59/1/guide");
      assert.equal(await pc.locator("#course-name").textContent(), "Python実践");
      assert.equal(await pc.locator("#contents a[href^='#54']").count(), 0);
      await pc.locator("#source").fill("読書の下書き");
      await pc.reload();
      assert.equal(await pc.locator("#source").inputValue(), "読書の下書き");
      assert.equal(await pc.evaluate(() => JSON.parse(localStorage.getItem("yomikumu-python-practice-v1")).route), "59/1/guide");
    }
    const report = await pc.evaluate(async ({ requested, fixtures }) => {
      const errors = [];
      let count = 0;
      async function run(source, test, files) {
        return runPython({ source, before: test.before, lines: splitInput(test.input || ""), files, observe: test.observe, interactive: false }).result;
      }
      for (const ch of pythonChapters.filter(ch => !requested || ch.id === requested)) {
        for (const [i, lesson] of ch.lessons.entries()) {
          const id = ch.id + "/" + (i + 1);
          const ex = await run(lesson.code, lesson, lesson.files);
          const expected = lesson.output ? lesson.output + "\n" : "";
          if (ex.output !== expected || (lesson.error ? !ex.error?.startsWith(lesson.error) : ex.error)) errors.push([id, "slide", ex]);
          for (const step of ["guide", "write"]) {
            const assignment = lesson[step];
            const fixture = fixtures[ch.id]?.[i];
            for (const test of assignment.cases) {
              const files = { ...assignment.files, ...assignment.tapFiles };
              for (const source of [assignment.solution, fixture?.[step === "guide" ? 0 : 2] || assignment.solution]) {
                const result = assignment.targetFile
                  ? await run(assignment.main, test, { ...files, [assignment.targetFile]: source })
                  : await run(source, test, files);
                if (!passed(result, test)) errors.push([id, step, test.label, result]);
              }
            }
            const incorrect = (step === "write" && fixture ? fixture[1] : assignment.starter);
            const wrong = [];
            for (const test of assignment.cases) wrong.push(passed(assignment.targetFile ? await run(assignment.main, test, { [assignment.targetFile]: incorrect }) : await run(incorrect, test, assignment.files), test));
            if (wrong.every(Boolean)) errors.push([id, step, "典型誤答が通過"]);
            count++;
          }
        }
      }
      return { errors, count };
    }, { requested: only || "", fixtures });
    assert.deepEqual(report.errors, []);
    console.log("Python " + report.count + "課題の実行・正誤採点・別解、スマホ組立、入力待ち・停止・保存復帰を確認");
  } finally { await pc.close(); await phone.close(); }
}
module.exports = { verifyPython };
if (require.main === module) {
  (async () => {
    const browser = await chromium.launch({ args: ["--no-sandbox"] });
    try { await verifyPython(browser, process.env.PYTHON_URL, process.argv[2]); } finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
