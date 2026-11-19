"use strict";

const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { cp, mkdtemp, readFile, rm, writeFile } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");
const { verifyDom } = require("./dom-check.cjs");

const prefix = "/yomikumu/";
const root = path.resolve(__dirname, "..");
const served = new Map();
let shelfUnavailable = false;
let workingData;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const server = createServer(async (request, response) => {
  const route = new URL(request.url, "http://127.0.0.1").pathname;
  const file = path.join(root, route.slice(prefix.length));
  const available = !(shelfUnavailable && route === prefix + "dom/data/reading.json");
  const dataSource = route.startsWith(prefix + "dom/data/") ? path.join(workingData, path.basename(file)) : file;
  const body = route.startsWith(prefix) && file.startsWith(root + path.sep) && available
    ? await readFile(dataSource).catch(() => null) : null;
  const status = body ? 200 : 404;
  served.set(route, status);
  response.writeHead(status, { "Content-Type": (types[path.extname(file)] || "text/plain") + "; charset=utf-8" });
  response.end(body || "ページが見つかりません");
});

const statusAnswer = `document.querySelector("#load").onclick = async () => {
  const reply = await fetch(nextReadingFile());
  document.querySelector("#result").textContent = String(reply.status);
};`;
const okAnswer = `document.querySelector("#load").onclick = async function () {
  const reply = await fetch(nextReadingFile());
  document.querySelector("#result").textContent = reply.ok ? "読めます" : "読めません";
};`;
const dataAnswer = `document.querySelector("#load").onclick = async () => {
  const reply = await fetch(nextReadingFile());
  if (!reply.ok) return;
  const books = await reply.json();
  document.querySelector("#result").textContent = books.join(" / ");
};`;
const oldTitlesAnswer = `document.querySelector("#load").onclick = async () => {
  const file = nextReadingFile();
  const reply = await fetch(file);
  if (!reply.ok) return;
  document.querySelector("#result").textContent =
    file === "data/other.json" ? "風の標本" : "雲の地図 / 星の台所";
};`;
const emptyAnswer = `document.querySelector("#load").onclick = async () => {
  const reply = await fetch(nextReadingFile());
  const result = document.querySelector("#result");
  if (!reply.ok) {
    result.textContent = "HTTP " + reply.status;
    return;
  }
  const books = await reply.json();
  result.textContent = books.length === 0 ? "本はまだありません" : books.join(" / ");
};`;
const finishAnswer = `const load = document.querySelector("#load");
const output = document.querySelector("#result");
load.addEventListener("click", async () => {
  load.disabled = true;
  output.textContent = "読み込み中";
  try {
    const reply = await fetch(nextReadingFile());
    if (!reply.ok) {
      output.textContent = ["HTTP ", reply.status, "。もう一度押してください"].join("");
    } else {
      const books = await reply.json();
      output.textContent = books.length ? books.join(" / ") : "本はまだありません";
    }
  } catch {
    output.textContent = "通信できません。もう一度押してください";
  } finally {
    load.disabled = false;
  }
});`;

(async () => {
  workingData = await mkdtemp(path.join(os.tmpdir(), "yomikumu-reading-json-"));
  try {
    await cp(path.join(root, "dom/data"), workingData, { recursive: true });
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    process.env.DOM_URL = "http://127.0.0.1:" + server.address().port + prefix + "dom/index.html";
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      await page.goto(process.env.DOM_URL);
      const entry = page.getByRole("link", { name: "JSONで読書棚を更新する" });
      assert.equal(await entry.count(), 2, "DOM目次と単元ナビから新単元へ進める");
      await entry.last().click();
      await page.getByText("PCでJSONを書き換える", { exact: true }).click();
      const download = page.getByRole("link", { name: "教材ソースのZIPをダウンロード" });
      assert.equal(await download.getAttribute("href"), "https://github.com/santa928/yomikumu/archive/refs/heads/main.zip");
      assert.equal(await page.getByRole("link", { name: "手元のJSON実習を開く" }).getAttribute("href"), "http://localhost:8080/dom/index.html#fetch-json");
      await page.getByText("docker compose up web", { exact: true }).waitFor();
      await page.getByText(/展開したフォルダーの dom\/data\/reading\.json/).waitFor();
      if (process.env.DOM_GUIDE_CAPTURE) await page.locator("main details").screenshot({ path: process.env.DOM_GUIDE_CAPTURE });
    } finally { await browser.close(); }
    await verifyDom("fetch-json", [
      [null, statusAnswer],
      [null, okAnswer],
      [null, dataAnswer, oldTitlesAnswer],
      [null, emptyAnswer],
      [null, finishAnswer, finishAnswer.replace('if (!reply.ok)', 'if (!reply.ok && reply.status !== 404)')],
    ], async frame => {
      const button = frame.getByRole("button", { name: "棚を読み込む" });
      const mode = frame.getByRole("combobox", { name: "試すデータ" });
      const result = frame.getByRole("status");
      assert.equal(await frame.locator("body").evaluate(() => window.origin), "null");
      const directRequests = await frame.locator("body").evaluate(async () =>
        (await Promise.allSettled([
          window.fetch(new URL("data/unlisted.json", document.baseURI)),
          fetch("data/unlisted.json"),
        ])).map(result => result.status));
      assert.deepEqual(directRequests, ["rejected", "rejected"]);
      assert.equal(served.has(prefix + "dom/data/unlisted.json"), false);
      await mode.selectOption("retry");
      await button.click();
      await result.filter({ hasText: "HTTP 404。もう一度押してください" }).waitFor();
      assert.equal(await button.isEnabled(), true);
      assert.equal(served.get(prefix + "dom/data/missing.json"), 404);
      await button.click();
      await result.filter({ hasText: "雲の地図 / 星の台所" }).waitFor();
      assert.equal(served.get(prefix + "dom/data/reading.json"), 200);
      await writeFile(path.join(workingData, "reading.json"), '["朝の時計", "帰り道の雲"]\n');
      await button.click();
      await result.filter({ hasText: "朝の時計 / 帰り道の雲" }).waitFor();
      await mode.selectOption("empty");
      await button.click();
      await result.filter({ hasText: "本はまだありません" }).waitFor();
      assert.equal(served.get(prefix + "dom/data/empty.json"), 200);
      await mode.selectOption("other");
      await button.click();
      await result.filter({ hasText: "風の標本" }).waitFor();
      assert.equal(served.get(prefix + "dom/data/other.json"), 200);
      await writeFile(path.join(workingData, "other.json"), '["鳥の絵はがき", "雨上がり"]\n');
      await button.click();
      await result.filter({ hasText: "鳥の絵はがき / 雨上がり" }).waitFor();
      await mode.selectOption("normal");
      shelfUnavailable = true;
      await button.click();
      await result.filter({ hasText: "HTTP 404。もう一度押してください" }).waitFor({ timeout: 3000 });
      shelfUnavailable = false;
      await button.click();
      await result.filter({ hasText: "朝の時計 / 帰り道の雲" }).waitFor();
      assert.equal(served.get(prefix + "dom/data/reading.json"), 200);
    });
  } finally {
    server.close();
    await rm(workingData, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
