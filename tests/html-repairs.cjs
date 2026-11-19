"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const {pathToFileURL} = require("node:url");
const fs = require("node:fs");
const os = require("node:os");
const {unzipSync} = require("../next/vendor/fflate.js");
const {chromium} = require("playwright");

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const home = process.env.COURSE_URL || pathToFileURL(path.resolve("index.html")).href;
    for (const id of ["repair-image","repair-color","form-entry","form-email"]) {
      await page.goto(home + "#" + id + "/write");
      await page.waitForFunction(() => typeof lessons !== "undefined");
      const answer = await page.evaluate(id => lessons.find(lesson => lesson.id === id)?.exercise.answer, id);
      assert.ok(answer, id);
      const check = page.getByRole("button", {name:"コードを確かめる"});
      await check.click();
      const status = page.locator("main [role=status]");
      await status.filter({hasText:/./}).waitFor();
      assert.doesNotMatch(await status.textContent(), /できました/);
      await page.getByRole("textbox").fill(answer);
      await check.click();
      await status.filter({hasText:/できました/}).waitFor();
    }
    await page.goto(home + "#form-email/2");
    const checkForm = page.getByRole("button", {name:"この入力で送る内容を見る"});
    await checkForm.waitFor();
    for (const [value, text] of [["", "連絡先を入力"], ["hello", "アドレスの形"], ["a@example.com", "email = a@example.com"]]) {
      await page.frameLocator("main iframe").getByLabel("連絡先").fill(value);
      await checkForm.click();
      await page.locator(".slide-examples [role=status]").filter({hasText:text}).waitFor();
    }
    await page.goto(home + "#repair-image/1");
    const zip = page.waitForEvent("download");
    await page.getByRole("link", {name:"PCで直すファイルを保存（ZIP）"}).click();
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "yomikumu-exhibit-"));
    try {
      const files = unzipSync(fs.readFileSync(await (await zip).path()));
      const names = ["README.md", "index.html", "styles/exhibit.css", "form.js", "assets/port.png"];
      assert.deepEqual(Object.keys(files).sort(), [...names].sort());
      for (const name of names) {
        const bytes = Buffer.from(files[name]);
        assert.deepEqual(bytes, fs.readFileSync(path.resolve("html-css/repair-kit", name)));
        const target = path.join(temp, name);
        fs.mkdirSync(path.dirname(target), {recursive:true});
        fs.writeFileSync(target, bytes);
      }
      const html = path.join(temp, "index.html");
      const css = path.join(temp, "styles/exhibit.css");
      await page.goto(pathToFileURL(html).href);
      const picture = page.getByRole("img", {name:"港に浮かぶ舟"});
      assert.equal(await picture.evaluate(img => img.naturalWidth), 0);
      const output = page.locator("output");
      const submit = page.getByRole("button", {name:"送る内容を見る"});
      await page.getByLabel("連絡先").fill("a@example.com");
      await submit.click();
      await output.getByText("送る項目がありません。").waitFor();
      fs.writeFileSync(html, fs.readFileSync(html, "utf8")
        .replace('src="port.png"', 'src="assets/port.png"')
        .replace('type="text"', 'type="email" name="email" required'));
      fs.writeFileSync(css, fs.readFileSync(css, "utf8").replace("color: gray", "color: green"));
      await page.reload();
      assert.ok(await picture.evaluate(img => img.naturalWidth > 0));
      assert.deepEqual(await page.locator("h2").evaluateAll(items => items.map(el => getComputedStyle(el).color)),
        ["rgb(0, 0, 128)", "rgb(0, 128, 0)"]);
      for (const value of ["", "hello", "a@example.com"]) {
        await page.getByLabel("連絡先").fill(value);
        await submit.click();
        assert.equal(await output.textContent(), value.includes("@") ? "email = " + value : "");
      }
    } finally { fs.rmSync(temp, {recursive:true, force:true}); }
    console.log("HTMLの4単元と、配布ZIP内の画像・CSS・メール入力3条件を確認");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
