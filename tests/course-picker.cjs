"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const families = [
  ["Webで作品を紹介する", { html: "HTML / CSS", javascript: "JavaScript", dom: "JavaScriptの画面操作", typescript: "TypeScript", react: "React", next: "Next.js", tailwind: "Tailwind CSS" }],
  ["Pythonで記録を集計する", { python: "Python基礎", "python-practice": "Python実践", "python-oop": "Python OOP" }],
];
const firstTasks = {
  html: "#first-edit/1", javascript: "#js-sign/1", dom: "dom/index.html#elements/1",
  typescript: "typescript/index.html#infer/slide", react: "react/index.html#components/1",
  next: "next/index.html#request/slide/1", tailwind: "tailwind/index.html#padding/slide",
  python: "python/index.html#54/1/slide", "python-practice": "python/index.html#63/1/slide/practice",
  "python-oop": "python/index.html#63/1/slide",
};
const exercises = [
  "#repair-image/1", "dom/index.html#fetch-json", "typescript/index.html#practical",
  "react/index.html#book-memos", "next/index.html#catalog-practice", "tailwind/index.html#status-colors/slide",
];
const base = process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href;

async function above(first, second, message, gap = 0) {
  const [a, b] = await Promise.all([first.boundingBox(), second.boundingBox()]);
  assert.ok(a && b && a.y + a.height + gap <= b.y + 1, message);
}

const comparisonSummary = "素のCSSとTailwindを比べる";

async function verifyComparison(comparison) {
  assert.equal(await comparison.count(), 1,
    "CSSを手書きする場合とTailwindの違いを同じ例で比較できる");
  await comparison.waitFor({ state: "visible" });
  const sides = ["css", "tailwind"].map(kind => comparison.locator(`[data-tailwind-example="${kind}"]`));
  const [plainHtml, tailwindHtml] = await Promise.all(sides.map(side => side.locator('pre[data-language="html"]').innerText()));
  const plainCss = await sides[0].locator('pre[data-language="css"]').innerText();
  assert.match(plainHtml, /class=["']card["']/);
  assert.match(tailwindHtml, /class=["']p-4["']/);
  assert.match(plainCss, /\.card\s*\{[\s\S]*padding\s*:\s*1rem\b/);

  const previews = await comparison.locator("[data-tailwind-preview]").evaluateAll(nodes => {
    function measure(node) {
      const style = getComputedStyle(node);
      return {
        tag: node.tagName, text: node.textContent.trim(), classes: Array.from(node.classList),
        padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
      };
    }
    const normal = nodes.map(measure);
    const root = document.documentElement;
    const previous = root.style.fontSize;
    root.style.fontSize = "20px";
    try { return { normal, at20px: nodes.map(measure) }; }
    finally { root.style.fontSize = previous; }
  });
  assert.deepEqual(previews.at20px.map(side => side.padding), Array(2).fill(Array(4).fill("20px")),
    "どちらの表示も固定px値ではなくルート文字サイズに連動する");
  const [plain, generated] = previews.normal;
  assert.deepEqual(plain.padding, ["16px", "16px", "16px", "16px"], "デモの既定条件では 1rem");
  assert.deepEqual(generated.padding, plain.padding, "コードは異なっても四辺の余白は同じ");
  assert.equal(plain.tag, generated.tag);
  assert.equal(plain.text, generated.text);
  assert.ok(plain.classes.includes("card"));
  assert.ok(generated.classes.includes("p-4"));
  return { plainHtml, tailwindHtml, plainCss };
}

async function verifyDisplayedSources(page, examples) {
  const output = await page.evaluate(async ({plainHtml, tailwindHtml, plainCss}) => {
    const render = (html, css) => {
      const host = document.createElement("div");
      document.body.append(host);
      try {
        const shadow = host.attachShadow({ mode: "open" });
        const template = document.createElement("template");
        template.innerHTML = html.trim();
        const style = document.createElement("style");
        style.textContent = css;
        shadow.append(style, template.content);
        const element = shadow.querySelector("[class]");
        const computed = getComputedStyle(element);
        return {
          tag: element.tagName, text: element.textContent.trim(),
          padding: [computed.paddingTop, computed.paddingRight, computed.paddingBottom, computed.paddingLeft],
        };
      } finally {
        host.remove();
      }
    };
    const withoutCss = render(tailwindHtml, "");
    const plain = render(plainHtml, plainCss);
    const compiled = await window.readingStyles(["p-4"]);
    return { withoutCss, plain, tailwind: render(tailwindHtml, compiled) };
  }, examples);
  assert.deepEqual(output.plain.padding, ["16px", "16px", "16px", "16px"]);
  assert.deepEqual(output.tailwind, output.plain, "教材のコンパイラが生成するCSSでも表示コードの結果が一致する");
  assert.deepEqual(output.withoutCss.padding, ["0px", "0px", "0px", "0px"], "生成されたCSSのない p-4 は余白を付けない");
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [320, 375, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 812 }, hasTouch: width < 720 });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      try {
        for (const [family, titles] of families) {
          await page.goto(base);
          await page.getByRole("link", { name: new RegExp(family) }).click();
          const entries = page.locator(".path-course");
          await entries.first().waitFor();
          assert.deepEqual(await entries.evaluateAll(sections => sections.map(section => section.dataset.course)), Object.keys(titles));
          for (const [id, title] of Object.entries(titles)) {
            const entry = page.locator(`.path-course[data-course="${id}"]`);
            const heading = entry.getByRole("heading", { level: 2 });
            assert.match(await heading.innerText(), /？$/);
            const definition = entry.locator(".course-definition");
            const example = entry.locator(".course-example");
            const prerequisites = entry.locator(".course-prerequisite");
            const start = entry.getByRole("link", { name: /^最初の課題：/ });
            assert.equal(await start.getAttribute("href"), firstTasks[id], title + "の直接の始め方");
            const catalog = entry.getByRole("link", { name: title + "の目次", exact: true });
            const check = entry.getByText("始める前に一問試す", { exact: true });
            assert.ok((await definition.innerText()).trim().length >= 20, title + "の定義は項目名の繰り返しではない");
            assert.ok(!(await definition.innerText()).includes("`"), title + "の説明はMarkdownの記号を表示しない");
            assert.ok(!(await example.innerText()).includes("`"), title + "の例はMarkdownの記号を表示しない");
            await above(heading, definition, title + "の見出しからすぐ定義を読める");
            await above(definition, example, title + "の定義を最初に読む");
            await above(example, prerequisites, title + "の例と前提は区別される");
            await above(prerequisites, start, title + "の説明が開始操作より先");
            await above(catalog, check, title + "の任意の確認問題は目次操作のあと");
            const rects = await Promise.all([start.boundingBox(), catalog.boundingBox()]);
            assert.ok(rects.every(r => r && r.height >= 43), title + "の主要導線はタップしやすい高さ");
            const [a, b] = rects;
            assert.ok(a.x + a.width + 7 <= b.x || b.x + b.width + 7 <= a.x ||
              a.y + a.height + 7 <= b.y || b.y + b.height + 7 <= a.y, title + "の開始と目次の操作が接していない");
            const unlabelled = await entry.locator("a[href]").evaluateAll(links =>
              links.map(link => link.getAttribute("href")));
            assert.deepEqual(unlabelled.filter(href => exercises.includes(href)), [], title + "の紹介に飛び道具が混ざらない");
          }
          const tail = page.getByText("進捗と下書きの引き継ぎ", { exact: true });
          await above(entries.last(), tail, "全コースのあと、別の領域に引き継ぎ操作を置く", 23);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width + "pxで横にあふれない");
        }

        // 用語の存在だけでなく、初出で意味が説明され、実際の初回と再開先が異なるか確認する。
        await page.goto(base + "#paths/web");
        const tw = page.locator('.path-course[data-course="tailwind"]');
        assert.equal(await tw.getByRole("heading", { level: 2 }).innerText(), "Tailwind CSSとは？");
        const definition = await tw.locator(".course-definition").innerText();
        assert.match(definition, /class|クラス/);
        assert.match(definition, /自分で/);
        assert.match(definition, /用意|組み合わ/);
        assert.match(definition, /p-4/);
        assert.match(definition, /CSSを生成/);
        assert.match(definition, /ブラウザが使うのは、どちらもCSS/);
        assert.match(await tw.locator(".course-example").innerText(), /余白/);
        const courseComparison = await verifyComparison(tw.locator(".tailwind-comparison:visible"));
        await tw.getByText("始める前に一問試す", { exact: true }).click();
        await tw.getByRole("radio", { name: "増える", exact: true }).check();
        await tw.getByRole("button", { name: "答えを確かめる" }).click();
        await tw.getByRole("status").filter({ hasText: "対応するCSSを読み込む必要" }).waitFor();
        await tw.getByRole("radio", { name: "増えない", exact: true }).check();
        await tw.getByRole("button", { name: "答えを確かめる" }).click();
        await tw.getByRole("status").filter({ hasText: "対応するCSSのルール" }).waitFor();
        const tocLink = tw.getByRole("link", { name: "Tailwind CSSの目次", exact: true });
        await tocLink.click();
        await page.getByRole("heading", { name: "Tailwind CSSの目次", exact: true }).waitFor();
        const catalog = page.locator(".course-toc-intro");
        assert.equal(await catalog.locator("p").first().innerText(), definition, "目次に直接来ても違いは最初から説明される");
        await catalog.getByText(comparisonSummary, { exact: true }).click();
        assert.deepEqual(await verifyComparison(catalog.locator(".tailwind-comparison:visible")), courseComparison);
        await verifyDisplayedSources(page, courseComparison);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "比較例を展開しても横にあふれない");
        await page.goBack();
        await tw.waitFor();
        await tw.getByRole("link", { name: /^最初の課題：/ }).click();
        await page.waitForURL("**/tailwind/index.html#padding/slide");
        const firstLesson = page.getByRole("main");
        await firstLesson.getByText(comparisonSummary, { exact: true }).click();
        assert.deepEqual(await verifyComparison(firstLesson.locator(".tailwind-comparison:visible")), courseComparison);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "最初の課題の比較も横にあふれない");
        await page.getByRole("link", { name: "表示を予測する", exact: true }).click();
        await page.waitForURL("**/tailwind/index.html#padding/quiz");
        await page.getByRole("button", { name: "予測を確かめる", exact: true }).waitFor();
        await page.goto(base + "#paths/web");
        const resume = tw.getByRole("link", { name: "Tailwind CSSの続きを開く", exact: true });
        await above(tw.getByText("Tailwind CSSとは？", { exact: true }), resume, "保存後も定義が先");
        await resume.click();
        await page.waitForURL("**/tailwind/index.html#padding/quiz");

        // 指摘を受けたもう一つの構成も再開状態で検証する。
        await page.goto(base + "#first-edit/type");
        await page.getByRole("textbox").fill("<h1>私の作品</h1>");
        await page.goto(base + "#paths/web");
        const html = page.locator(".path-course").first();
        assert.equal(await html.getByRole("link", { name: "画像とフォームを直す", exact: true }).count(), 0);
        const htmlResume = html.getByRole("link", { name: "HTML / CSSの続きを開く", exact: true });
        await above(html.locator(".course-prerequisite"), htmlResume, "HTML / CSSの再開時も紹介が先に読める");
        await htmlResume.click();
        await page.waitForURL("**/index.html#first-edit/type");
        assert.equal(await page.getByRole("textbox").inputValue(), "<h1>私の作品</h1>");
        assert.deepEqual(errors, []);
      } finally { await page.close(); }
    }
    console.log("320・375・1280pxで全10コースの冒頭の説明、操作の間隔、任意の確認問題と引き継ぎの区別、保存後の再開と、手書きCSS・実際のTailwind生成CSSの四辺の余白の一致を確認");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
