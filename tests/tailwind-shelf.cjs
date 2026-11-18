"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const folder = path.resolve(__dirname, "../tailwind");
const url = pathToFileURL(path.join(folder, "index.html")).href;
const color = "@theme { --color-dusk: #613e57; }";
const normal = { shelf: "flex flex-col gap-4 sm:flex-row", theme: color, card: "text-dusk", other: "text-dusk" };
const custom = { shelf: "gap-[1rem] flex-col min-[640px]:flex-row flex", theme: "@theme { --color-night: #613E57; }", card: "text-night", other: "text-night" };

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(url);
    const specimen = page.frameLocator("iframe").nth(1);
    await specimen.locator("summary").first().click();
    assert.equal(await specimen.locator("details").first().getAttribute("open"), "");
    const position = () => specimen.locator("article").evaluateAll(items => items.map(item => [item.offsetLeft, item.offsetTop]));
    const narrow = await position();
    assert.equal(narrow[0][0], narrow[1][0]);
    assert.ok(narrow[0][1] < narrow[1][1]);
    await page.getByRole("button", {name:"広い幅（680px）"}).click();
    const wide = await position();
    assert.equal(wide[0][1], wide[1][1]);
    assert.ok(wide[0][0] < wide[1][0]);
    const answers = {
      column: [{shelf:"gap-[8px] flex-col flex"}, {shelf:"gap-2 flex"}],
      wide: [{shelf:"min-[640px]:flex-row flex flex-col"}, {shelf:"flex flex-col md:flex-row"}],
      "name-color": [{theme:"@theme { --color-river: rgb(97 62 87); }"}, {theme:"@theme { --color-dusk: #613e57; }"}],
      reuse: [{card:"text-[color:var(--color-dusk)]", other:"text-dusk"}, {card:"text-dusk", other:"text-[#613e57]"}],
      "local-shelf": [custom, {...normal, other:"text-black"}]
    };
    for (const [id, [alternate, wrong]] of Object.entries(answers)) {
      const sets = await page.evaluate(async ({id, alternate, wrong}) => {
        const unit = readingUnits.find(item => item.id === id);
        const right = Object.fromEntries(unit.fields.map(f => [f.part, f.solution]));
        return Promise.all([right, alternate, wrong].map(async data => (await evaluateReading(unit, data)).map(x => x.ok)));
      }, {id, alternate, wrong});
      assert.ok(sets[0].every(Boolean), id + " 正答");
      assert.ok(sets[1].every(Boolean), id + " 別解");
      assert.ok(sets[2].some(value => !value), id + " 誤答");
    }
    await page.goto(url + "#reuse/write");
    const boxes = page.getByRole("textbox");
    await boxes.first().fill("text-dusk");
    await page.getByRole("button", {name:"表示と答えを確かめる"}).click();
    await page.getByText(/^1項目は合っています。次の一手 · 二冊目/).waitFor();
    await page.getByRole("link", {name:"この課題の見本を読み返す"}).click();
    await page.getByRole("link", {name:"自分で書く"}).click();
    assert.equal(await boxes.first().inputValue(), "text-dusk");
    await page.goto(url + "#local-shelf/write");
    async function fill(values) {
      for (const [part, value] of Object.entries(values)) await page.locator('textarea[data-field="'+part+'"]').fill(value);
    }
    await fill(normal);
    await page.locator("#built-css").setInputFiles(path.join(folder,"shelf/input.css"));
    await page.getByText(/^生成後の shelf.css を選んでください/).waitFor();
    await page.locator("#built-css").setInputFiles(path.join(folder,"shelf/shelf.css"));
    await page.getByText(/^手元のCSSで、狭い棚/).waitFor();
    await fill(custom);
    const pending = page.waitForEvent("download");
    await page.getByRole("button", {name:"今の読書棚をZIPで保存"}).click();
    const download = await pending;
    assert.equal(download.suggestedFilename(), "reading-shelf.zip");
    if (process.env.SHELF_ARCHIVE) await download.saveAs(process.env.SHELF_ARCHIVE);

    const phone = await browser.newPage({ viewport:{width:375,height:812}, isMobile:true, hasTouch:true });
    await phone.goto(url);
    await phone.getByRole("link", {name:"広いときだけ棚を横並びにする"}).tap();
    await phone.getByRole("button", {name:"見本を一か所変える"}).tap();
    await phone.getByRole("button", {name:"狭い幅（300px）"}).tap();
    await phone.getByRole("link", {name:"表示を予測する"}).tap();
    await phone.getByText("sm: の指定前の向きで並ぶ", {exact:true}).tap();
    await phone.getByRole("button", {name:"予測を確かめる"}).tap();
    await phone.getByText(/^正解です。/).waitFor();
    await phone.getByRole("link", {name:"コードの練習へ"}).tap();
    for (const name of ["flex", "flex-col", "sm:flex-row"]) await phone.getByRole("button",{name,exact:true}).tap();
    await phone.getByRole("button",{name:"表示と答えを確かめる"}).tap();
    await phone.getByText(/^できました。/).waitFor();
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (process.env.SHELF_SCREENSHOT) await phone.screenshot({path:process.env.SHELF_SCREENSHOT});
    if (process.env.SHELF_BUILT) {
      const kit = process.env.SHELF_BUILT;
      await page.locator("#built-css").setInputFiles(path.join(kit,"shelf.css"));
      await page.getByText(/^手元のCSSで、狭い棚/).waitFor();
      await page.goto(pathToFileURL(path.join(kit,"index.html")).href);
      assert.match(fs.readFileSync(path.join(kit,"input.css"),"utf8"), /--color-night/);
      for (const [width, direction] of [[639,"column"],[640,"row"]]) {
        await page.setViewportSize({width,height:800});
        assert.equal(await page.locator("section").evaluate(el => getComputedStyle(el).flexDirection),direction);
        for (const article of await page.locator("article").all()) assert.equal(await article.evaluate(el => getComputedStyle(el).color),"rgb(97, 62, 87)");
      }
    }
    assert.deepEqual(errors, []);
    console.log("読書棚5課題の正答・別解・誤答、テーマの連動、2幅、部分一致・再開、ZIP、375pxタップを確認");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
