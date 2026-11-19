"use strict";

const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");
const { verifyDom } = require("./dom-check.cjs");

const prefix = "/yomikumu/";
const root = path.resolve(__dirname, "..");
const served = new Map();
let shelfUnavailable = false;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const server = createServer(async (request, response) => {
  const route = new URL(request.url, "http://127.0.0.1").pathname;
  const file = path.join(root, route.slice(prefix.length));
  const available = !(shelfUnavailable && route === prefix + "dom/data/reading.json");
  const body = route.startsWith(prefix) && file.startsWith(root + path.sep) && available
    ? await readFile(file).catch(() => null) : null;
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
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    process.env.DOM_URL = "http://127.0.0.1:" + server.address().port + prefix + "dom/index.html";
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      await page.goto(process.env.DOM_URL);
      assert.equal(await page.getByRole("link", { name: "JSONで読書棚を更新する" }).count(), 2, "DOM目次と単元ナビから新単元へ進める");
    } finally { await browser.close(); }
    await verifyDom("fetch-json", [
      [null, statusAnswer],
      [null, okAnswer],
      [null, dataAnswer, dataAnswer.replace('books.join(" / ")', '"雲の地図 / 星の台所"')],
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
      await mode.selectOption("empty");
      await button.click();
      await result.filter({ hasText: "本はまだありません" }).waitFor();
      assert.equal(served.get(prefix + "dom/data/empty.json"), 200);
      await mode.selectOption("other");
      await button.click();
      await result.filter({ hasText: "風の標本" }).waitFor();
      assert.equal(served.get(prefix + "dom/data/other.json"), 200);
      await mode.selectOption("normal");
      shelfUnavailable = true;
      await button.click();
      await result.filter({ hasText: "HTTP 404。もう一度押してください" }).waitFor({ timeout: 3000 });
      shelfUnavailable = false;
      await button.click();
      await result.filter({ hasText: "雲の地図 / 星の台所" }).waitFor();
      assert.equal(served.get(prefix + "dom/data/reading.json"), 200);
    });
  } finally { server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
