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
        answerCss: l.exercise.answerCss,
      })),
    );
    const expectedIds = [
      "first-edit", "structure", "link", "word-language", "page-names",
      "heading-levels", "material-list", "making-steps", "page-regions", "work-section", "word-emphasis",
      "museum-link", "sign-image", "field-name", "clear-form", "contact-card",
      "class", "linked-css", "rule-order", "specific-rule", "inherited-size", "root-size",
      "card", "padding", "outer-space", "border-width", "link-area", "narrow-card",
      "bio-lines", "name-colors", "picked-mark", "shared-ink", "author-pair",
      "flex-parent", "along-axis", "across-axis", "wrap-works", "flex-guide", "layout", "responsive",
    ];
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
      if (unit.answerCss) {
        await page.getByRole("textbox", { name: "HTML", exact: true }).fill(unit.answer);
        await page.getByRole("textbox", { name: "CSS", exact: true }).fill(unit.answerCss);
      } else {
        await page.getByRole("textbox").fill(unit.answer);
      }
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
    await open("museum-link/1");
    const destinations = page.frameLocator("main iframe").first();
    await destinations.getByRole("link", { name: "受付へ" }).click();
    await destinations.locator("h2:target").waitFor();
    await page.context().route("https://www.tnm.jp/", (route) =>
      route.fulfill({ contentType: "text/html", body: "<title>テスト用の行き先</title>" }));
    const opened = page.waitForEvent("popup");
    await destinations.getByRole("link", { name: "東京国立博物館" }).click();
    const museum = await opened;
    await museum.waitForURL("https://www.tnm.jp/");
    assert.equal(await museum.evaluate(() => window.opener === null), true);
    await museum.close();
    await open("sign-image/1");
    const image = page.frameLocator("main iframe").getByRole("img", { name: "受付は右です" });
    assert.equal(await image.evaluate((img) => img.complete && img.naturalWidth > 0), true);
    await open("sign-image/2");
    assert.equal(await image.evaluate((img) => img.naturalWidth), 0);
    await open("field-name/write");
    await page.getByRole("textbox").fill('<label>見学メモ<input type="text"></label>');
    await confirm.click();
    await says("できました。条件を満たしています");
    const preview = page.frameLocator("main iframe").first();
    await preview.locator("label").click();
    assert.ok(await preview.getByRole("textbox").evaluate((el) => el === el.ownerDocument.activeElement));
    await open("clear-form/2");
    const field = preview.getByRole("textbox");
    await field.fill("赤い紙を見たい");
    await preview.getByRole("button", { name: "書き直す" }).click();
    assert.equal(await field.inputValue(), "");
    await open("contact-card/write");
    const answer = units.find((unit) => unit.id === "contact-card").answer;
    const incomplete = answer.replace('type="reset"', 'type="button"');
    await page.getByRole("textbox").fill(incomplete);
    await confirm.click();
    await says("入力欄はできました");
    await page.getByRole("link", { name: "この問題のスライドを見直す" }).click();
    await page.getByRole("link", { name: /解きかけの問題へ戻る/ }).click();
    assert.equal(await page.getByRole("textbox").inputValue(), incomplete);
    await page.getByRole("textbox").fill(answer.replaceAll("note", "private-memo")
      .replace('src="arrow.png"', 'src="./arrow.png"').replace("kahaku.go.jp/", "kahaku.go.jp"));
    await confirm.click();
    await says("できました。条件を満たしています");
    const requests = [];
    const rememberRequest = (request) => requests.push(request.url());
    page.on("request", rememberRequest);
    await preview.locator("label").click();
    await preview.getByRole("textbox").fill("これは練習メモ");
    await preview.getByRole("textbox").press("Enter");
    await preview.getByRole("button", { name: "メモを消す" }).click();
    assert.equal(await preview.getByRole("textbox").inputValue(), "");
    page.off("request", rememberRequest);
    assert.deepEqual(requests, []);
    await open("class/1");
    await page.getByRole("button", { name: "緑の指定を試す" }).click();
    await page.locator("pre").filter({ hasText: "color: green;" }).waitFor();
    assert.equal(await page.frameLocator("main iframe").locator("p").evaluate((el) => getComputedStyle(el).color), "rgb(0, 128, 0)");
    await open("linked-css/1");
    const sample = page.frameLocator("main iframe").first();
    const authorColor = () => sample.locator(".author").evaluate((el) => getComputedStyle(el).color);
    assert.equal(await authorColor(), "rgb(0, 0, 0)");
    await open("linked-css/2");
    assert.equal(await authorColor(), "rgb(0, 0, 128)");
    await open("inherited-size/1");
    await page.getByText("撮影者の文字の実測値　16px", { exact: true }).waitFor();
    await page.getByText("撮影者の文字の実測値　20px", { exact: true }).waitFor();
    const typeCases = [
      ["linked-css", '<link rel="stylesheet" href="paper.css"><p class="author">青木ミナ</p>', "href に ink.css", '<link href="./ink.css" rel="stylesheet"><main><p class="author">青木ミナ</p><p>紙の小さな展示です。</p></main>'],
      ["rule-order", ".author{color:green}", "二行を残し", ".author{color:#000080} .author{color:#008000}"],
      ["specific-rule", "p{color:navy}", "紹介文には", "p{color:green} p.author{color:#000080}"],
      ["inherited-size", ".wall{font-size:22px} .credit{font-size:22px}", "引き継ぐ", ".wall{font-size:22px} .credit{font-size:inherit}"],
      ["root-size", "html{font-size:20px} .credit{font-size:30px}", "今の表示は30px", "html{font-size:20px} .credit{font-size:calc(1rem + .5rem)}"],
    ];
    for (const [id, wrong, message, alternate] of typeCases) {
      await open(id + "/write");
      await page.getByRole("textbox").fill(wrong);
      await confirm.click();
      await says(message);
      if (id === "root-size") {
        await page.getByRole("link", { name: "この問題のスライドを見直す" }).click();
        await page.getByRole("link", { name: /解きかけの問題へ戻る/ }).click();
        assert.equal(await page.getByRole("textbox").inputValue(), wrong);
      }
      await page.getByRole("textbox").fill(alternate);
      await confirm.click();
      await says("できました。条件を満たしています");
    }
    const boxCases = [
      ["outer-space", ".tags{display:flex}.tag{border:2px solid;padding:6px}", "札の内側はできました", ".tags{display:flex;column-gap:12px}.tag{border:2px solid;padding:6px}"],
      ["border-width", ".ticket{box-sizing:border-box;width:100px;padding:2px;border:2px solid}", "幅はできました", ".ticket{box-sizing:border-box;inline-size:100px;padding-inline:8px;border:2px solid}"],
      ["link-area", ".desk{width:160px;border:1px solid}.desk a{display:block}", "横の押せる範囲", ".desk{width:160px;border:1px solid}.desk a{display:flex;padding-block:6px}"],
      ["narrow-card", ".piece{box-sizing:border-box;width:100%;padding:8px;border:1px solid;overflow:hidden}.piece a{display:block}", "長い作品名を途中で", ".piece{padding:8px;border:1px solid}.piece h2{word-break:break-all}.piece a{display:flex}"],
    ];
    for (const [id, wrong, message, alternate] of boxCases) {
      await open(id + "/write");
      await page.getByRole("textbox").fill(wrong);
      await confirm.click();
      await says(message);
      await page.getByRole("textbox").fill(alternate);
      await confirm.click();
      await says("できました。条件を満たしています");
    }
    await open("link-area/1");
    const linkFrame = page.frameLocator("main iframe").first();
    await linkFrame.locator(".desk").click({ position: { x: 155, y: 10 } });
    assert.equal(await linkFrame.locator("h2:target").count(), 0);
    await open("link-area/2");
    await linkFrame.locator(".desk").click({ position: { x: 155, y: 10 } });
    await linkFrame.locator("h2:target").waitFor();
    await open("border-width/2");
    await page.getByText("札の外幅　140px", { exact: true }).waitFor();
    await page.getByText("札の外幅　120px", { exact: true }).waitFor();
    const profiles = [
      ["bio-lines", ".bio{font-size:16px; line-height:2}", "一行分の高さ", ".bio{font-size:16px;line-height:24px}"],
      ["name-colors", "p{color:white;background:navy}", "下の説明文", ".badge{background:#000080;color:#fff}"],
      ["picked-mark", ".badge{border-left:4px solid}", "もう一人", ".picked{border-inline-start:solid 4px green}"],
      ["shared-ink", ":root{--ink:teal}.name{color:teal}", "一か所の変更", ":root{--ink:#008080} h2.name{color:var(--ink)}"],
    ];
    for (const [id, wrong, message, alternate] of profiles) {
      await open(id + "/write");
      await page.getByRole("textbox").fill(wrong);
      await confirm.click();
      await says(message);
      await page.getByRole("textbox").fill(alternate);
      await confirm.click();
      await says("できました。条件を満たしています");
    }
    const pair = units.find((u) => u.id === "author-pair");
    await open("author-pair/write");
    const pairHtml = page.getByRole("textbox", { name: "HTML", exact: true });
    const pairCss = page.getByRole("textbox", { name: "CSS", exact: true });
    await pairHtml.fill(pair.answer.replace("profile picked", "profile"));
    await pairCss.fill(pair.answerCss);
    await confirm.click();
    await says("浜ナオだけ");
    await page.getByRole("link", { name: "この問題のスライドを見直す" }).click();
    await page.getByRole("link", { name: /解きかけの問題へ戻る/ }).click();
    assert.equal(await pairHtml.inputValue(), pair.answer.replace("profile picked", "profile"));
    assert.equal(await pairCss.inputValue(), pair.answerCss);
    await pairHtml.fill(pair.answer.replace("profile picked", "picked profile"));
    await pairCss.fill(pair.answerCss.replace("teal", "#008080"));
    await confirm.click();
    await says("できました。条件を満たしています");
    const flexCases = [
      ["flex-parent", ".bar span{display:flex}", "二枚を囲んでいる", ".bar{display:inline-flex;flex-flow:column}"],
      ["along-axis", ".bar{width:180px;display:flex;justify-content:center}", "余りを二枚の間", ".bar{display:flex;width:180px}.bar span:last-child{margin-left:auto}"],
      ["across-axis", ".bar{height:80px;display:flex}", "交差軸", ".bar{display:flex;height:80px}.bar span{align-self:center}"],
      ["wrap-works", ".row{display:flex;width:200px;gap:8px}.row article{flex:0 0 84px}", "次の行", ".row{display:flex;flex-flow:row wrap;gap:8px;width:200px}.row article{flex:0 0 84px}"],
    ];
    for (const [id, wrong, message, alternate] of flexCases) {
      await open(id + "/write");
      await page.getByRole("textbox").fill(wrong);
      await confirm.click();
      await says(message);
      await page.getByRole("textbox").fill(alternate);
      await confirm.click();
      await says("できました。条件を満たしています");
    }
    await open("flex-guide/write");
    const guide = units.find((u) => u.id === "flex-guide");
    const guideHtml = page.getByRole("textbox", { name: "HTML", exact: true });
    const guideStyle = page.getByRole("textbox", { name: "CSS", exact: true });
    await guideHtml.fill(guide.answer.replace("aria-current", "data-current"));
    await guideStyle.fill(guide.answerCss);
    await confirm.click();
    await says("現在地と伝わり");
    await page.getByRole("link", { name: "この問題のスライドを見直す" }).click();
    await page.getByRole("link", { name: /解きかけの問題へ戻る/ }).click();
    assert.ok((await guideHtml.inputValue()).includes("data-current"));
    await guideHtml.fill(guide.answer.replace("</article>\n</div>", "</article><article>夕暮れの散歩道</article>\n</div>"));
    await confirm.click();
    await says("できました。条件を満たしています");
    const flexPreview = page.frameLocator("main iframe");
    const works = await flexPreview.locator(".row article").evaluateAll((cards) => cards.map(c => c.offsetTop));
    assert.equal(works.length, 4);
    assert.ok(works[0] === works[1] && works[2] === works[3] && works[0] < works[2]);
    await flexPreview.getByRole("link", { name: "受付へ" }).click();
    await flexPreview.locator("h2:target").filter({ hasText: "受付" }).waitFor();
    const exhibitionCases = [
      ["heading-levels", "<h1>小さな版画展</h1><h2>体験会</h2><h2>午前の部</h2>", "章はできました", "<main><h1>小さな版画展</h1><section><h2>体験会</h2><h3 style='font-size:26px'>午前の部</h3></section></main>"],
      ["material-list", "<p>受付で使います。</p><ul><li>入場券</li></ul><ul><li>手帳</li></ul>", "同じ ul", "<p>受付で使います。</p><ul><li>手帳</li><li>消しゴム</li><li>入場券</li></ul>"],
      ["making-steps", "<ol><li>切る</li><li>結ぶ</li><li>穴をあける</li></ol>", "この順", "<ol><li>切る</li><li>印を付ける</li><li>穴をあける</li><li>結ぶ</li></ol>"],
      ["page-regions", "<header><h1>窓辺の作品展</h1></header><main><h2>展示内容</h2><p>木版画を二枚展示します。</p><footer><p>問い合わせは図書室へ。</p></footer></main>", "本文はできました", "<div><header><h1>窓辺の作品展</h1></header><main><section><h2>展示内容</h2><p>木版画を二枚展示します。</p></section></main><footer><p>問い合わせは図書室へ。</p></footer></div>"],
      ["work-section", "<section><h2>木の作品</h2><article><h3>小さな舟</h3></article><p>枝を削りました。</p></section>", "同じ article", "<main><section><h2>木の作品</h2><article><header><h3>小さな舟</h3></header><p>枝を削りました。</p></article></section></main>"],
      ["word-emphasis", "<p><strong>足元にご注意</strong>ください。</p><p>原画は<em>今日だけ</em>です。</p>", "今日」だけ", "<section><p><strong>足元にご注意</strong>ください。</p><p>原画は<span><em>今日</em></span>だけです。</p></section>"],
    ];
    for (const [id, wrong, message, alternate] of exhibitionCases) {
      await open(id + "/write");
      await page.getByRole("textbox").fill(wrong);
      await confirm.click();
      await says(message);
      if (id === "page-regions") {
        await page.getByRole("link", { name: "この問題のスライドを見直す" }).click();
        await page.getByRole("link", { name: /解きかけの問題へ戻る/ }).click();
        assert.equal(await page.getByRole("textbox").inputValue(), wrong);
      }
      await page.getByRole("textbox").fill(alternate);
      await confirm.click();
      await says("できました。条件を満たしています");
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
      "museum-link": ["href", "https://www.kahaku.go.jp/"], "sign-image": ["arrow.png", "受付は右です"],
      "field-name": ["for", "note"], "clear-form": ["reset"], "contact-card": ["受付は右です", "memo"],
      "linked-css": ["stylesheet", "ink.css"], "rule-order": ["navy", "green"],
      "specific-rule": [".author", "navy"], "inherited-size": [".wall", "22px"], "root-size": ["1.5rem"],
      "outer-space": ["padding", "margin-right"], "border-width": ["100px", "border-box"],
      "link-area": ["block", "padding"], "narrow-card": ["border-box", "anywhere"],
      "bio-lines": ["line-height", "1.5"], "name-colors": ["white", "navy"],
      "picked-mark": [".picked", "border-left"], "shared-ink": [".name", "var(--ink)"],
      "author-pair": ["profile", "profile picked"],
      "flex-parent": [".bar", "column"], "along-axis": ["justify-content", "space-between"],
      "across-axis": ["align-items", "center"], "wrap-works": ["wrap", "flex-basis"],
      "flex-guide": ["aria-current", "窓辺"],
      "heading-levels": ["h2", "h3"], "material-list": ["li", "手帳"], "making-steps": ["ol", "li"],
      "page-regions": ["main", "footer"], "work-section": ["section", "article"], "word-emphasis": ["strong", "em"],
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
