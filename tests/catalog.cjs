"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const expected = {
  web: ["HTML / CSS", "JavaScript", "JavaScriptの画面操作", "TypeScript", "React", "Next.js", "Tailwind CSS"],
  python: ["Python基礎", "Python実践", "Python OOP"],
};

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
    const home = process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href;
    const errors = [];
    page.on("pageerror", err => errors.push(err.message));
    for (const [route, titles] of Object.entries(expected)) {
      await page.goto(home + "#paths/" + route);
      const entries = page.locator(".path-course");
      const names = await entries.locator("h2").allTextContents();
      assert.deepEqual(names.sort(), [...titles].sort());
      for (const title of titles) {
        const entry = entries.filter({ has: page.getByRole("heading", { name: title, exact: true }) });
        const go = entry.getByRole("link", { name: /最初の一課題を開く|の続きを開く/ });
        const expectedUrl = await go.getAttribute("href");
        await Promise.all([page.waitForURL(new URL(expectedUrl, home).href), go.tap()]);
        await page.locator("h1:visible").first().waitFor();
        assert.ok(await page.evaluate(() => innerWidth + 1 >= document.documentElement.scrollWidth), title);
        await page.goBack();
        await entry.waitFor();
      }
    }
    assert.deepEqual(errors, []);
    console.log("375pxの2つの学習パスから全9コースとJavaScript画面操作へ進み、元の目次に戻りました");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
