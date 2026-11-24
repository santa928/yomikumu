"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const expected = {
  web: { html: "HTML / CSS", javascript: "JavaScript", dom: "JavaScriptの画面操作", typescript: "TypeScript", react: "React", next: "Next.js", tailwind: "Tailwind CSS" },
  python: { python: "Python基礎", "python-practice": "Python実践", "python-oop": "Python OOP" },
};

(async () => {
  const browser = await chromium.launch();
  try {
    const home = process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href;
    for (const width of [375, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 812 }, hasTouch: width === 375 });
      const errors = [];
      page.on("pageerror", err => errors.push(err.message));
      for (const [route, courses] of Object.entries(expected)) {
        const pathPage = home + "#paths/" + route;
        await page.goto(pathPage);
        const entries = page.locator(".path-course");
        await entries.first().waitFor();
        assert.deepEqual(await entries.evaluateAll(sections => sections.map(section => section.dataset.course)), Object.keys(courses));
        for (const [id, title] of Object.entries(courses)) {
          const entry = page.locator(`.path-course[data-course="${id}"]`);
          const label = title + "の目次";
          await entry.getByRole("link", { name: label, exact: true }).click();
          const main = page.getByRole("main");
          const heading = main.getByRole("heading", { level: 1, name: label, exact: true });
          await heading.waitFor();
          const groups = main.locator("ol > li").filter({ has: page.locator(":scope > h2") });
          assert.ok(await groups.count() >= 2, title + "の章");
          for (const group of await groups.all()) {
            assert.ok(await group.locator(":scope > ol > li a:visible").count(), title + "の章から単元を選べる");
          }
          assert.equal(await main.locator("textarea:visible, iframe:visible, input:visible").count(), 0, label + "に演習を表示しない");
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label);
          const intro = main.locator(".course-toc-intro");
          assert.match(await intro.getByRole("heading", { level: 2 }).innerText(), /？$/);
          assert.ok(!(await intro.locator("p").first().innerText()).includes("`"), title + "の目次では説明のMarkdown記号をそのまま表示しない");
          assert.ok(await intro.getByRole("link", { name: /^最初の課題：|^前回の続きへ/ }).first().isVisible(), label + "から学習を開始できる");
          if (width === 375) {
            await page.evaluate(async () => {
              await document.fonts.ready;
              window.scrollTo(0, 0);
            });
            const chapter = groups.first().getByRole("heading", { level: 2 }).first();
            const visibleInFirstScreen = await chapter.evaluate(element => {
              const bounds = element.getBoundingClientRect();
              return bounds.top >= 0 && bounds.bottom <= innerHeight;
            });
            assert.ok(visibleInFirstScreen, title + "の目次は最初の画面内に最初の章が見える");
            const extra = intro.locator("details");
            const summary = extra.getByText("学ぶ内容と始める目安", { exact: true });
            const prereqs = extra.getByText("始める前に", { exact: true });
            assert.equal(await prereqs.isVisible(), false, title + "の目次は追加説明を最初は畳む");
            await summary.focus();
            await page.keyboard.press("Enter");
            await prereqs.waitFor({ state: "visible" });
            await page.keyboard.press("Space");
            await prereqs.waitFor({ state: "hidden" });
          }
          const back = main.getByRole("link", { name: (route === "web" ? "Web制作" : "Python") + "のコース一覧に戻る", exact: true });
          await back.click();
          await page.waitForURL(pathPage + "/" + id);
          await entry.waitFor();
          await page.waitForFunction(target => {
            const h = document.querySelector(`[data-course="${target}"] h2`);
            if (!h) return false;
            const r = h.getBoundingClientRect();
            return document.activeElement === h && r.top >= 0 && r.bottom <= innerHeight;
          }, id);
          await entry.getByRole("link", { name: label, exact: true }).click();
          await heading.waitFor();
          await groups.first().locator(":scope > ol > li a").first().click();
          await main.getByRole("heading", {level: 1}).waitFor();
          await page.getByRole("link", { name: label, exact: true }).first().click();
          await heading.waitFor();
          await page.getByRole("link", { name: "全コース目次", exact: true }).first().click();
          await main.getByRole("heading", { level: 1, name: "全コース目次", exact: true }).waitFor();
          await page.goto(pathPage);
          const start = entry.getByRole("link", { name: /最初の課題：|の続きを開く/ });
          const dest = new URL(await start.getAttribute("href"), home).href;
          await Promise.all([page.waitForURL(dest), start.click()]);
          await main.getByRole("heading", { level: 1 }).waitFor();
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), title);
          await page.goBack();
          await entry.waitFor();
        }
      }
      assert.deepEqual(errors, []);
      await page.close();
      console.log(width + "px: 全10コースの目次、章から単元への移動、コース／全体へ戻る操作、学習の再開を確認");
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
