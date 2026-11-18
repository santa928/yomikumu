"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const os = require("node:os");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const base = process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href;

async function run() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 850 } });
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    async function open(route) {
      await page.goto(base + "#" + route);
      await page.waitForFunction(
        (expected) => currentRoute === expected,
        route.split("/").slice(0, 2).join("/"),
      );
    }
    const feedback = page.locator("main [role=status]");
    const confirm = page.getByRole("button", { name: "コードを確かめる" });
    async function says(text) {
      await feedback.filter({ hasText: text }).waitFor({ timeout: 5000 });
    }
    await open("home");
    const units = await page.evaluate(() =>
      lessons.map((l) => ({
        id: l.id,
        slides: l.slides.length,
        correct: l.quiz.correct,
        answer: l.exercise.answer,
      })),
    );
    const expectedIds = ["first-edit", "structure", "link", "word-language", "page-names", "class", "card", "padding", "layout", "responsive"];
    assert.deepEqual(units.map((unit) => unit.id), expectedIds);
    await page.getByRole("link", { name: "最初のスライドへ →" }).click();
    await page.getByRole("button", { name: "次の作品を表示" }).click();
    await page.frameLocator("main iframe").getByRole("heading", { name: "夕方の港" }).waitFor();
    await page.getByRole("button", { name: "最初の作品に戻す" }).click();
    await page.frameLocator("main iframe").getByRole("heading", { name: "朝の港" }).waitFor();
    if (process.env.SCREENSHOT_DIR)
      await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "first-edit.png") });
    for (const unit of units) {
      for (let i = 1; i <= unit.slides; i++) {
        await open(unit.id + "/" + i);
        assert.ok(await page.locator("main h1").textContent());
        await page.frameLocator("main iframe").first().locator("body").waitFor();
      }
      await open(unit.id + "/quiz");
      const choices = page.locator('input[name="choice"]');
      for (const choice of [(unit.correct + 1) % 4, unit.correct]) {
        await choices.nth(choice).check();
        await page.getByRole("button", { name: "答えを確かめる" }).click();
        assert.equal((await feedback.textContent()).startsWith("正解"), choice === unit.correct);
      }
      await open(unit.id + "/write");
      await confirm.click();
      await page.waitForFunction(
        () => document.querySelector("main [role=status]").textContent.length > 0,
      );
      assert.ok(!(await feedback.textContent()).startsWith("できました"));
      await page.locator("textarea").fill(unit.answer);
      await confirm.click();
      await says("できました");
      if (unit.id === "link") {
        const preview = page.frameLocator("main iframe").first();
        await preview.getByRole("link", { name: "作者ノートへ" }).click();
        await preview
          .locator("h2:target")
          .filter({ hasText: "作者ノート" })
          .waitFor({ timeout: 3000 });
      }
    }
    // 読む達成と書く達成が独立して残り、途中の解答にも個別の案内がある。
    await open("structure/write");
    await page.locator("textarea").fill("<h1>夜の図書室<p>閉館前の十枚。</p></h1>");
    await confirm.click();
    await says("作品名の直後");
    await open("page-names/write");
    await page.locator("textarea").fill("<title>夜の作品集</title><h1>月の切符</h1>");
    await confirm.click();
    await says("タブの名前はできました");
    await page.getByText("タブのタイトル　夜の作品集", { exact: true }).waitFor();
    await page.getByRole("link", { name: "この問題のスライドを見直す" }).click();
    await page.getByRole("link", { name: /解きかけの問題へ戻る/ }).click();
    assert.match(await page.locator("textarea").inputValue(), /月の切符/);
    await page.locator("textarea").fill("<title>夜の作品集</title><main><h1 lang='ja'>星の切符</h1></main>");
    await confirm.click();
    await says("できました");
    assert.equal(await page.frameLocator("main iframe").locator("body").evaluate((el) => el.ownerDocument.title), "夜の作品集");
    await open("padding/write");
    await page.locator("textarea").fill("padding: 8px 2px;");
    await confirm.click();
    await says("上下の8pxは合っています");
    await page.getByRole("link", { name: "この問題のスライドを見直す" }).click();
    await page.getByRole("link", { name: /解きかけの問題へ戻る/ }).waitFor();
    await page.reload();
    const back = page.getByRole("link", { name: /解きかけの問題へ戻る/ });
    await back.focus();
    await page.keyboard.press("Enter");
    await page.locator("textarea").waitFor();
    assert.equal(await page.locator("textarea").inputValue(), "padding: 8px 2px;");
    await says("上下の8pxは合っています");
    await page.locator("textarea").fill("padding-block: 8px; padding-inline: 16px;");
    await confirm.click();
    await says("できました");

    await open("studio");
    const htmlEditor = page.getByLabel("HTML", { exact: true });
    const mark = page.getByRole("button", { name: "作品を確認する" });
    const useManuscript = page.getByRole("button", { name: "この原稿をHTML欄に入れる" });
    await page.getByText("原稿を読む「夜の机の小さな作品展」", { exact: true }).click();
    await useManuscript.click();
    assert.match(await htmlEditor.inputValue(), /月の切手/);
    assert.doesNotMatch(await htmlEditor.inputValue(), /<[a-z]/i);
    assert.equal(await htmlEditor.evaluate((area) => area === document.activeElement), true);
    assert.equal(await useManuscript.isVisible(), false);
    const firstWork = "<h1>庭の作品展</h1><article><h2>石の笛</h2><p>庭で拾った石を削りました。</p></article>";
    await htmlEditor.fill(firstWork);
    await mark.click();
    await says("1作品目の紹介ができました");
    assert.equal(await page.evaluate(() => Boolean(readProgress().units.studio.writeDone)), false);
    const linkStep = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "2作品から同じ制作メモへ案内する" }) });
    await linkStep.getByText("ヒント", { exact: true }).click();
    await linkStep.getByRole("link", { name: "リンクと移動先を結ぶ例" }).click();
    await page.getByRole("link", { name: "卒業制作に戻る →" }).click();
    assert.equal(await htmlEditor.inputValue(), firstWork);
    await says("1作品目の紹介ができました");
    await page.getByText("原稿を読む「夜の机の小さな作品展」", { exact: true }).click();
    assert.equal(await useManuscript.isVisible(), false);
    const artwork =
      '<h1>紙の作品</h1><section class="gallery">' +
      '<article><h2>春</h2><p>紙の花。</p><a href="#memo">作者へ</a></article>' +
      '<article><h2>夏</h2><p>白い器。</p><a href="#memo">作者へ</a></article>' +
      '</section><h2 id="memo">作者メモ</h2>';
    const styles =
      ".gallery {display:flex; flex-direction:column; gap:10px} @media(min-width:600px){.gallery {flex-direction:row}}";
    await htmlEditor.fill(artwork);
    await mark.click();
    await says("スマホ幅はできました");
    await page.getByLabel("CSS", { exact: true }).fill(styles);
    await mark.click();
    await says("完成です");
    if (process.env.SCREENSHOT_DIR)
      await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "desktop.png") });
    const downloaded = page.waitForEvent("download");
    await page.getByRole("button", { name: "作品をHTMLで書き出す" }).click();
    const file = await downloaded;
    assert.equal(file.suggestedFilename(), "watashi-no-sakuhinten.html");
    const exportedPath = path.join(os.tmpdir(), file.suggestedFilename());
    await file.saveAs(exportedPath);
    const standalone = await browser.newPage();
    await standalone.goto(pathToFileURL(exportedPath).href);
    assert.equal(await standalone.locator("h1").textContent(), "紙の作品");
    assert.equal(await standalone.locator("article").count(), 2);
    await standalone.close();

    await open("home");
    assert.equal(await page.getByText("四択をクリア ・ 記述をクリア").count(), expectedIds.length);
    await page.locator("summary").filter({ hasText: "進捗と下書きの引き継ぎ" }).click();
    const progressFile = page.waitForEvent("download");
    await page.getByRole("button", { name: "進捗を書き出す" }).click();
    const original = await (await progressFile).path();
    const phone = await browser.newPage({ viewport: { width: 375, height: 812 } });
    phone.on("pageerror", (err) => errors.push(err.message));
    await phone.goto(base);
    await phone.getByText("進捗と下書きの引き継ぎ", { exact: true }).click();
    const upload = phone.locator('input[type="file"]');
    await upload.setInputFiles({
      name: "unknown.json",
      mimeType: "application/json",
      buffer: Buffer.from("{}"),
    });
    await phone.getByText(/読み込めませんでした/).waitFor();
    await upload.setInputFiles(original);
    await phone.getByRole("button", { name: "この記録を読み込む" }).click();
    await phone.getByText("読み込みました。目次に進捗を反映しました。").waitFor();
    assert.equal(await phone.getByText("四択をクリア ・ 記述をクリア").count(), expectedIds.length);
    await phone.getByRole("link", { name: "前回の続きへ →" }).click();
    await phone.getByLabel("HTML", { exact: true }).waitFor();
    assert.equal(await phone.getByLabel("HTML", { exact: true }).inputValue(), artwork);
    const touch = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
    touch.on("pageerror", (err) => errors.push(err.message));
    await touch.goto(base + "#link/1");
    const frame = touch.frameLocator("main iframe");
    const memo = frame.getByRole("heading", { name: "作品メモ" });
    assert.ok(await memo.evaluate((el) => el.getBoundingClientRect().top > el.ownerDocument.defaultView.innerHeight));
    await frame.getByRole("link", { name: "メモを読む" }).tap();
    await frame.locator("h2:target").waitFor();
    assert.ok(await memo.evaluate((el) => el.getBoundingClientRect().top < el.ownerDocument.defaultView.innerHeight));
    await touch.goto(base + "#link/quiz");
    await touch.getByRole("link", { name: "タップでコードを組む →" }).tap();
    await touch.getByRole("heading", { name: "タップでコードを組む" }).waitFor();
    assert.equal(await touch.locator("textarea").count(), 0);
    const group = (i) => touch.locator("main form").getByRole("group").nth(i);
    const choose = (i, name) => group(i).getByRole("radio", { name, exact: true }).check();
    const grade = touch.getByRole("button", { name: "組んだコードを確かめる" });
    await choose(0, "href");
    await choose(1, "artist");
    await grade.tap();
    await touch.getByRole("status").filter({ hasText: "行き先の id" }).waitFor();
    await touch.getByRole("link", { name: "この問題のスライドを見直す" }).tap();
    await touch.reload();
    await touch.getByRole("link", { name: /解きかけの問題へ戻る/ }).tap();
    await touch.getByRole("status").filter({ hasText: "行き先の id" }).waitFor();
    const buildSolutions = {
      "first-edit": ["雨の港"], "word-language": ["lang", "en"], "page-names": ["夜の作品集", "星の切符"],
      structure: ["h1", "p"], link: ["href", "#artist"], class: [".title", "font-size"],
      card: [".card", "border"], padding: ["8px", "16px"], layout: ["1fr 1fr", "gap"],
      responsive: ["min-width", "1fr 1fr"],
    };
    for (const [id, answers] of Object.entries(buildSolutions)) {
      await touch.goto(base + "#" + id + "/write");
      for (const [index, answer] of answers.entries()) await choose(index, answer);
      await grade.tap();
      await touch.getByRole("status").filter({ hasText: "できました" }).waitFor();
      assert.ok(await touch.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }
    await touch.goto(base + "#home");
    assert.equal(await touch.getByText("組み立てをクリア", { exact: true }).count(), expectedIds.length);
    await touch.goto(base + "#link/write");
    if (process.env.SCREENSHOT_DIR) {
      await touch.evaluate(() => window.scrollTo(0, 0));
      await touch.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "link-build.png") });
    }
    await touch.getByRole("link", { name: "キーボードで書く" }).tap();
    await touch.getByRole("textbox").fill("作者ノートへ（下書き）");
    await touch.getByRole("link", { name: "タップでコードを組む" }).tap();
    assert.ok(await group(1).getByRole("radio", { name: "#artist", exact: true }).isChecked());
    await touch.getByRole("link", { name: "キーボードで書く" }).tap();
    assert.equal(await touch.getByRole("textbox").inputValue(), "作者ノートへ（下書き）");
    await touch.goto(base + "#studio");
    await touch.getByText("原稿を読む「夜の机の小さな作品展」", { exact: true }).tap();
    await touch.getByText(/青い紙に、雲からのぞく月を刷りました/).waitFor();
    assert.equal(await touch.locator("textarea").count(), 0);
    if (process.env.SCREENSHOT_DIR) {
      await touch.evaluate(() => window.scrollTo(0, 0));
      await touch.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "studio-manuscript.png") });
    }
    await touch.getByRole("link", { name: "この端末で制作を始める" }).tap();
    await touch.getByLabel("HTML", { exact: true }).waitFor();
    for (const route of ["home", "padding/2", "responsive/2", "studio"]) {
      await phone.goto(base + "#" + route);
      await phone.waitForFunction((expected) => currentRoute === expected, route);
      assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      if (process.env.SCREENSHOT_DIR && route !== "responsive/2") {
        await phone.screenshot({
          path: path.join(process.env.SCREENSHOT_DIR, route.replace("/", "-") + ".png"),
        });
      }
    }
    assert.deepEqual(errors, []);
    console.log(
      expectedIds.length + "単元のスライド・四択・記述・組み立て、ページ内移動、下書き復帰、部分正解と別解、卒業制作、書き出しと引き継ぎが通りました。",
    );
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
