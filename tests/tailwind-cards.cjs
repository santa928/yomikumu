"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const url = pathToFileURL(path.resolve(__dirname, "../tailwind/index.html")).href;

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(url);
    const frame = page.frameLocator("iframe").first();
    const mark = frame.getByRole("button", { name: "しおりをはさむ" });
    await mark.click();
    assert.equal(await mark.count(), 0);
    const enabled = frame.getByRole("button", { name: "しおりをはずす" });
    await enabled.hover();
    assert.equal(await enabled.evaluate(n => getComputedStyle(n).textDecorationLine), "underline");
    await page.mouse.move(0, 0);
    await enabled.blur();
    await frame.locator("body").click({ position: {x: 1, y: 1} });
    await page.keyboard.press("Tab");
    assert.equal(await enabled.evaluate(n => n.matches(":focus-visible") && getComputedStyle(n).outlineWidth), "2px");
    const locked = frame.getByRole("button", { name: "貸出中" });
    assert.ok(await locked.isDisabled());
    assert.equal(await locked.evaluate(n => getComputedStyle(n).opacity), "0.5");
    const answers = {
      padding: ["p-[8px]", "m-2"], width: ["w-[12rem]", "w-64"],
      type: ["text-[18px]", "text-base"], paper: ["bg-[oklch(96.2%_0.059_95.617)]", "bg-white"],
      layout: ["flex flex-row", "block"], gap: ["gap-[8px] flex", "p-2 flex"],
      hover: ["hover:[text-decoration-line:underline]", "underline"],
      focus: ["focus-visible:[outline:2px_solid]", "outline-2"],
      disabled: ["disabled:opacity-[0.5]", "opacity-50"],
      "night-card": ["bg-amber-100 text-lg p-[.5rem] w-[12rem]", "p-2"]
    };
    for (const [id, [alternate, wrong]] of Object.entries(answers)) {
      const results = await page.evaluate(async ({id, alternate, wrong}) => {
        const unit = readingUnits.find(item => item.id === id);
        const {part, solution} = unit.fields[0];
        const result = [];
        for (const value of [solution, alternate, wrong]) {
          result.push((await evaluateReading(unit, { [part]: value })).map(x => x.ok));
        }
        return result;
      }, {id, alternate, wrong});
      assert.ok(results[0].every(Boolean), id + " 正答");
      assert.ok(results[1].every(Boolean), id + " 別解");
      assert.ok(results[2].some(item => !item), id + " 誤答");
    }
    await page.goto(url + "#night-card/write");
    const editor = page.getByRole("textbox");
    await editor.fill("w-48 p-2");
    await page.getByRole("button", {name:"表示と答えを確かめる"}).click();
    await page.getByText("2項目は合っています。次の一手 · 書名と本文の文字を 1.125rem にします。").waitFor();
    await page.getByRole("link", {name:"この課題の見本を読み返す"}).click();
    await page.getByRole("button", {name:"見本を一か所変える"}).click();
    await page.getByRole("link", {name:"自分で書く"}).click();
    assert.equal(await editor.inputValue(), "w-48 p-2");
    await page.reload();
    assert.equal(await editor.inputValue(), "w-48 p-2");
    await editor.fill("bg-amber-100 text-lg p-2 w-48");
    await page.getByRole("button", {name:"表示と答えを確かめる"}).click();
    await page.getByText(/^できました。/).waitFor();
    const reference = page.frameLocator("#plain iframe");
    const output = page.frameLocator("main > .sample-window iframe");
    const style = el => {
      const s = getComputedStyle(el);
      return [s.width, s.padding, s.fontSize, s.lineHeight, s.backgroundColor];
    };
    assert.deepEqual(await reference.locator("article").first().evaluate(style), await output.locator("article").first().evaluate(style));
    const phone = await browser.newPage({ viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
    await phone.goto(url);
    await phone.getByRole("link", {name:"カードの間だけを空ける"}).tap();
    await phone.getByRole("button", {name:"見本を一か所変える"}).tap();
    await phone.getByRole("link", {name:"表示を予測する"}).tap();
    await phone.getByText("padding", {exact:true}).tap();
    await phone.getByRole("button", {name:"予測を確かめる"}).tap();
    await phone.getByText(/^もう一度比べましょう。/).waitFor();
    await phone.getByText("gap", {exact:true}).tap();
    await phone.getByRole("button", {name:"予測を確かめる"}).tap();
    await phone.getByText(/^正解です。/).waitFor();
    await phone.getByRole("link", {name:"コードの練習へ"}).tap();
    for (const name of ["gap-2", "flex"]) await phone.getByRole("button",{name,exact:true}).tap();
    await phone.getByRole("button",{name:"表示と答えを確かめる"}).tap();
    await phone.getByText(/^できました。/).waitFor();
    const progress = await phone.evaluate(() => JSON.parse(localStorage.getItem("yomikumu/tailwind/v1")));
    assert.equal(progress.last, "gap/tap");
    assert.equal(progress.units.gap.quizDone, true);
    assert.equal(progress.units.gap.tapDone, true);
    assert.equal(progress.units.gap.writeDone, undefined);
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log("Tailwind 読書カード10課題の正答・別解・誤答、静的見本の3状態、部分一致・再開、375pxタップを確認");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
