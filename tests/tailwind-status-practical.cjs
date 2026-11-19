"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const url = process.env.TAILWIND_URL || pathToFileURL(path.resolve(__dirname, "../tailwind/index.html")).href;

async function verifyBuild(page, standalone, download, modules) {
  const { unzipSync } = require(path.join(modules, "fflate"));
  const cli = path.join(modules, "@tailwindcss/cli/dist/index.mjs");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "status-shelf-"));
  try {
    const files = unzipSync(await fs.readFile(await download.path()));
    for (const name of ["index.html", "status.js", "input.css", "compose.yaml", "package.json", "package-lock.json"])
      await fs.writeFile(path.join(dir, name), files[name]);
    await fs.symlink(modules, path.join(dir, "node_modules"), "dir");
    const css = path.join(dir, "shelf.css");
    function build() {
      const result = spawnSync(process.execPath, [cli, "-i", "./input.css", "-o", "./shelf.css", "--minify"], { cwd: dir, encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr || result.error?.message);
    }
    const serverless = pathToFileURL(path.join(dir, "index.html")).href;
    const colors = () => standalone.locator("[data-status]").evaluateAll(elements => elements.map(el => getComputedStyle(el).color));
    build();
    await standalone.goto(serverless);
    assert.deepEqual(await standalone.locator("[data-status]").evaluateAll(elements => elements.map(el => el.className)), ["text-emerald-700", "text-rose-700"]);
    const [unbuiltA, unbuiltB] = await colors();
    assert.equal(unbuiltA, unbuiltB, "動的に組み立てたクラス名だけでは、先に生成したCSSに2色が含まれない");
    await page.locator("#status-built-css").setInputFiles(css);
    await page.getByRole("status").filter({ hasText: /利用可の文字色/ }).waitFor();

    const source = path.join(dir, "status.js");
    const dynamic = await fs.readFile(source, "utf8");
    const map = `function statusClass(state) {
  const colors = { available: "text-emerald-700", borrowed: "text-rose-700" };
  return colors[state];
}`;
    const fixed = dynamic.replace(/^function statusClass\(state\) \{[\s\S]+?^\}/m, map);
    assert.notEqual(fixed, dynamic, "キットの状態からクラスを選ぶ関数を置き換える");
    await fs.writeFile(source, fixed);
    build();
    await standalone.reload();
    const [available, borrowed] = await colors();
    assert.notEqual(available, borrowed);
    assert.notEqual(available, unbuiltA);
    assert.notEqual(borrowed, unbuiltB);
    const upload = page.locator("#status-built-css");
    await upload.evaluate(input => input.addEventListener("change", () => { input.dataset.selectedAgain = "true"; }));
    await upload.setInputFiles(css);
    assert.equal(await upload.getAttribute("data-selected-again"), "true", "同名の再生成ファイルも読み込み直す");
    const localResult = page.locator("#status-local-result");
    await localResult.filter({ hasNotText: "CSSの表示を確認しています。" }).waitFor({ timeout: 5000 });
    assert.match(await localResult.textContent(), /2状態の文字色・幅・フォーカスを確認/);
    for (const [width, direction] of [[639, "column"], [640, "row"]]) {
      await standalone.setViewportSize({ width, height: 780 });
      assert.equal(await standalone.locator("[data-part=shelf]").evaluate(el => getComputedStyle(el).flexDirection), direction);
    }
    await standalone.keyboard.press("Tab");
    assert.deepEqual(await standalone.getByRole("button").first().evaluate(el => [
      el === document.activeElement, el.matches(":focus-visible"), getComputedStyle(el).outlineWidth,
    ]), [true, true, "2px"]);
    await standalone.keyboard.press("Enter");
    assert.deepEqual(await colors(), [borrowed, borrowed], "操作で貸出中の文字と色に切り替わる");
    await standalone.getByText("貸出中", { exact: true }).first().waitFor();
    await standalone.keyboard.press("Enter");
    assert.deepEqual(await colors(), [available, borrowed], "同じボタンで利用可に戻る");
    console.log("配布ZIPのTailwind CLIを修正前後で実行し、2色・639/640px・TabとEnterを確認");
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
}

(async () => {
  const browser = await chromium.launch();
  try {
    const pc = await browser.newPage();
    await pc.goto(url);
    const entry = pc.getByRole("link", { name: "生成されない状態の色を直す" });
    assert.equal(await entry.count(), 1, "コース目次からクラス名の実践教材へ入れる");
    await entry.click();
    const preview = pc.frameLocator(".sample-window iframe");
    const colors = () => preview.locator("article").evaluateAll(elements => elements.map(el => getComputedStyle(el).color));
    await preview.locator(".sample-book").first().waitFor();
    await pc.waitForFunction(() => document.querySelector(".sample-window iframe").contentDocument.querySelector("style"));
    const [a, b] = await colors();
    assert.equal(a, b);
    await pc.getByRole("button", { name: "見本を一か所変える" }).click();
    await pc.waitForFunction(() => {
      const rows = [...document.querySelector(".sample-window iframe").contentDocument.querySelectorAll("article")];
      return rows.length === 2 && getComputedStyle(rows[0]).color !== getComputedStyle(rows[1]).color;
    });
    await pc.getByRole("link", { name: "自分で書く" }).click();
    for (const [part, value] of [["card", "text-emerald-700"], ["other", "text-rose-700"]])
      await pc.locator('textarea[data-field="' + part + '"]').fill(value);
    await pc.getByRole("button", { name: "表示と答えを確かめる" }).click();
    await pc.getByText(/^できました。/).waitFor();
    const pending = pc.waitForEvent("download");
    await pc.getByRole("button", { name: "故障した読書棚をZIPで保存" }).click();
    const download = await pending;
    assert.equal(download.suggestedFilename(), "reading-status-shelf.zip");

    const phone = await browser.newPage({ viewport: { width: 375, height: 780 }, isMobile: true, hasTouch: true });
    await phone.goto(url + "#status-colors/slide");
    await phone.getByRole("link", { name: "表示を予測する" }).tap();
    await phone.getByRole("radio", { name: "完成したクラス名を状態ごとに書く" }).tap();
    await phone.getByRole("button", { name: "予測を確かめる" }).tap();
    await phone.getByText(/^正解です。/).waitFor();
    await phone.getByRole("link", { name: "コードの練習へ" }).tap();
    await phone.locator('fieldset[data-field=card]').getByRole("button", { name: "text-emerald-700", exact: true }).tap();
    await phone.locator('fieldset[data-field=other]').getByRole("button", { name: "text-rose-700", exact: true }).tap();
    await phone.getByRole("button", { name: "表示と答えを確かめる" }).tap();
    await phone.getByText(/^できました。/).waitFor();
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (process.env.TAILWIND_STATUS_CAPTURE) await phone.screenshot({ path: process.env.TAILWIND_STATUS_CAPTURE });
    console.log("状態色の見本、375pxの四択・タップとPCの記述・ZIPを確認");

    if (process.env.TAILWIND_NODE_MODULES) await verifyBuild(pc, await browser.newPage(), download, process.env.TAILWIND_NODE_MODULES);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
