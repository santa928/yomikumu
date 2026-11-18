"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

(async () => {
  const folder = process.env.NEXT_TEST_KIT;
  if (!folder || (await fs.readFile(path.join(folder, ".yomikumu-test-scratch"), "utf8")) !== "temporary test copy")
    throw Error("教材から書き出したテスト専用コピーを指定してください。");
  const base = process.env.BOOK_URL || "http://localhost:3000";
  const { routeChecks } = await import(pathToFileURL(path.join(folder, "check/routes.mjs")).href);
  const browser = await chromium.launch();
  try {
    const intro = await browser.newPage();
    await intro.goto(process.env.NEXT_URL || pathToFileURL(path.resolve(__dirname,"../next/index.html")).href);
    const lessons = await intro.evaluate(() => nextLessons.filter(lesson => lesson.chapter === "routes").map(({id, file, source, answer}) => ({id, file, source, answer})));
    const page = await browser.newPage({ baseURL: base });
    const http = url => fetch(new URL(url, base));
    await page.goto("/");
    await page.getByRole("link", { name: "葦の小舟", exact: true }).click();
    await page.getByRole("heading", { name: "葦の小舟" }).waitFor();
    await page.goto("/books/lamp");
    await page.getByRole("heading", { name: "坂の灯" }).waitFor();
    assert.equal((await (await http("/api/books?topic=町")).json())[0].id, "lamp");
    const alternatives = {
      request: 'const title = "夜の読書室"; export default () => <h1>{title}</h1>;',
      restart: 'export default function Open(){ return <section><p>午後の受付</p></section>; }',
      format: 'export function GET(){ const count = 1 + 1; return Response.json({count, shelf:"北の棚"}); }',
      query: 'import {books} from "../../../library/books"; export function GET(req){ const kind=new URL(req.url).searchParams.get("topic");return Response.json(books.filter(b=>!kind||b.topic===kind)); }',
      layout: 'export default ({children:page}) => <><h2>北の読書室</h2>{page}</>;',
      dynamic: 'import MissingBook from "../../not-found";import {books} from "../../../library/books";export default async function Book(p){const {id}=await p.params;for(const b of books)if(b.id===id)return <h1>{b.title}</h1>;return <MissingBook/>;}',
    };
    for (const lesson of lessons) {
      if (process.env.NEXT_CHECK_STEP && lesson.id !== process.env.NEXT_CHECK_STEP) continue;
      const filename = path.join(folder, lesson.file);
      const original = await fs.readFile(filename, "utf8");
      assert.equal(original, lesson.answer, "画面から書き出した答えを検査します");
      const exercise = routeChecks[lesson.id];
      const verify = async () => {
        const list = [];
        for (const [,check] of exercise.checks) {
          let ok = false;
          try { ok = await check({ page, http }); } catch { /* 更新途中の応答を後で再読する。 */ }
          list.push(Boolean(ok));
          if (!ok) break;
        }
        return list;
      };
      try {
        for (const [source, expected] of [[original,true],[lesson.source,false],[alternatives[lesson.id],true]]) {
          await fs.writeFile(filename, source);
          const deadline = Date.now() + 20000;
          let checks;
          do {
            checks = await verify();
            if (checks.every(Boolean) === expected) break;
            await new Promise(resolve => setTimeout(resolve,150));
          } while (Date.now() < deadline);
          assert.equal(checks.every(Boolean), expected, lesson.id + " " + JSON.stringify(checks));
        }
      } finally { await fs.writeFile(filename, original); }
      console.log(lesson.id + " 実NextのHTTP応答で正答・初期の誤り・別解を確認");
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
