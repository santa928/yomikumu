"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const { unzipSync, strFromU8 } = require("../next/vendor/fflate.js");

const url = process.env.TS_URL || pathToFileURL(path.join(__dirname, "../typescript/index.html")).href;
const changedType = `export type Question = { answer: string; points: number };
export type Result = { score: number; status: "correct" | "incorrect" | "invalid" };`;
const scoreCode = `import type { Question, Result } from "./types.js";
import { questionFrom } from "./input.js";

export class QuizRound {
  question: Question;

  constructor(question: Question) {
    this.question = question;
  }

  answer(text: string): Result {
    if (text !== this.question.answer) return { status: "incorrect", score: 0 };
    return { status: "correct", score: this.question.points };
  }
}

export function scoreAnswer(raw: unknown, text: string): Result {
  const question = questionFrom(raw);
  return question === null ? { status: "invalid", score: 0 } : new QuizRound(question).answer(text);
}`;
const inputCode = `import type { Question } from "./types.js";

export function questionFrom(raw: unknown): Question | null {
  if (typeof raw !== "object" || raw === null) return null;
  if (!("answer" in raw) || typeof raw.answer !== "string") return null;
  if (!("points" in raw) || typeof raw.points !== "number" || !Number.isInteger(raw.points) || raw.points < 0) return null;
  return { answer: raw.answer, points: raw.points };
}`;
const displayCode = `import type { Result } from "./types.js";

export function describe(result: Result): string {
  return result.status + " " + result.score + "点";
}`;
const roundClassCode = `type Question = { answer: string; points: number };
class QuizRound {
  question: Question;

  constructor(question: Question) {
    this.question = question;
  }

  answer(text: string): number {
    return text === this.question.answer ? this.question.points : 0;
  }
}`;

function shareQuestionAmongRounds(source) {
  return source.replace("  question: Question;", "  static question: Question;")
    .replaceAll("this.question", "QuizRound.question");
}

async function verifyDesktop(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await page.goto(url + "#practical");
  await page.getByRole("heading", { name: "複数ファイルで採点を改修する" }).waitFor({ timeout: 5000 });
  const files = page.getByLabel("編集するファイル");
  const editor = page.getByRole("textbox", { name: "TypeScript コード" });
  const check = page.getByRole("button", { name: "型を検査", exact: true });
  const run = page.getByRole("button", { name: "実行して確かめる" });
  const typeStatus = page.locator("[data-practical-type]");
  const output = page.locator("[data-practical-run]");
  const grade = page.locator("[data-practical-grade]");

  await check.click();
  await typeStatus.getByText("型検査を通りました。").waitFor();
  await run.click();
  await grade.getByText(/結果を見比べましょう/).waitFor();

  await files.selectOption("types.ts");
  await editor.fill(changedType);
  await check.click();
  const scoreDiagnostic = page.getByRole("button", { name: /^score\.ts:\d+:\d+ · TS\d+/ }).first();
  await scoreDiagnostic.waitFor();
  await page.getByRole("button", { name: /^display\.ts:\d+:\d+ · TS2339/ }).waitFor();
  await scoreDiagnostic.press("Enter");
  assert.equal(await files.inputValue(), "score.ts");
  assert.equal(await editor.evaluate(element => document.activeElement === element), true);

  await editor.fill(scoreCode);
  await files.selectOption("display.ts");
  await editor.fill(displayCode);
  await files.selectOption("input.ts");
  await editor.fill(inputCode.replace(" || raw.points < 0", ""));
  await run.click();
  await grade.getByText(/結果を見比べましょう/).waitFor();
  assert.match(await output.textContent(), /負の配点 · correct -2点/);

  await editor.fill(inputCode);
  await run.click();
  await grade.getByText(/すべての確認を通りました/).waitFor();
  assert.match(await output.textContent(), /正解 · correct 4点/);
  assert.match(await output.textContent(), /別の配点 · correct 7点/);
  assert.match(await output.textContent(), /不正解 · incorrect 0点/);
  for (const label of ["答えがない", "配点がない", "null", "文字の配点", "負の配点", "小数の配点"]) {
    assert.ok((await output.textContent()).includes(label + " · invalid 0点"), label);
  }

  await files.selectOption("score.ts");
  await editor.fill(shareQuestionAmongRounds(scoreCode));
  await run.click();
  await grade.waitFor();
  assert.match(await grade.textContent(), /結果を見比べましょう。「2つの問題を続けて採点」/);
  assert.match(await output.textContent(), /2つの問題を続けて採点 · incorrect 0点 \/ correct 7点/);
  await editor.fill(scoreCode);
  await run.click();
  await grade.getByText(/すべての確認を通りました/).waitFor();
  assert.match(await output.textContent(), /2つの問題を続けて採点 · correct 4点 \/ correct 7点/);

  await files.selectOption("display.ts");
  await editor.fill(displayCode.replace("result.score", "result.points"));
  await check.click();
  const displayDiagnostic = page.getByRole("button", { name: /^display\.ts:\d+:\d+ · TS2339/ });
  await displayDiagnostic.waitFor();
  await editor.fill(displayCode);
  await displayDiagnostic.waitFor({ state: "detached" });
  assert.match(await typeStatus.textContent(), /もう一度「型を検査」/);

  await page.reload();
  await files.selectOption("input.ts");
  assert.equal(await editor.inputValue(), inputCode);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "現在のプロジェクトをZIPで保存" }).click();
  const zip = await download;
  const archive = unzipSync(await fs.readFile(await zip.path()));
  assert.equal(strFromU8(archive["input.ts"]).trimEnd(), inputCode);
  assert.equal(strFromU8(archive["score.ts"]).trimEnd(), scoreCode);
  assert.equal(JSON.parse(strFromU8(archive["package.json"])).devDependencies.typescript, "6.0.3");
  assert.ok(archive["check.ts"] && archive["tsconfig.json"] && archive["README.md"]);
  if (process.env.TS_PRACTICAL_DOWNLOAD) {
    const destination = process.env.TS_PRACTICAL_DOWNLOAD;
    await fs.mkdir(destination, { recursive: true });
    await zip.saveAs(path.join(destination, zip.suggestedFilename()));
    for (const [name, content] of Object.entries(archive)) await fs.writeFile(path.join(destination, name), content);
  }
  await page.goto(url + "#round-class/write");
  const classEditor = page.getByRole("textbox", { name: "自分のTypeScript" });
  assert.doesNotMatch(await classEditor.inputValue(), /^\s*class QuizRound\s*\{/m);
  await classEditor.fill(shareQuestionAmongRounds(roundClassCode));
  await run.click();
  const classGrade = page.locator("[data-grade]");
  await classGrade.waitFor();
  assert.match(await classGrade.textContent(), /二つを作ってから/);
  await classEditor.fill(roundClassCode);
  await run.click();
  await page.getByText(/^できました。/).waitFor();
  await page.close();
}

async function verifyMobile(browser) {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const practice = [
    ["採点結果の型を共有する", "型検査が score を読んでいる行を示す", ["result.status", "result.score"]],
    ["届いた配点を読めるか確かめる", "points が 0 より小さいかを見る", ['!("points" in raw)', "raw.points < 0"]],
    ["問題と採点のクラスを作る", "各インスタンスの問題", ["this.question.answer", "this.question.points"]]
  ];
  for (const [title, answer, picks] of practice) {
    await page.goto(url + "#practical");
    await page.getByRole("link", { name: title, exact: true }).tap();
    await page.getByRole("link", { name: "表示を予測する" }).tap();
    const correct = page.getByRole("radio", { name: answer, exact: true });
    await correct.waitFor();
    assert.equal(await page.getByRole("radio").count(), 4);
    await correct.tap();
    await page.getByRole("button", { name: "予測を確認" }).tap();
    await page.getByText(/^正解です。/).waitFor();
    await page.getByRole("link", { name: "コードの練習へ" }).tap();
    for (const [index, pick] of picks.entries()) {
      const field = page.locator("fieldset").nth(index);
      await field.getByRole("radio", { name: pick, exact: true }).tap();
    }
    assert.match(page.url(), /\/tap$/);
    await page.getByRole("button", { name: "実行して確かめる" }).tap();
    await page.getByText(/^できました。/).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  }
  await page.close();
}

(async () => {
  const browser = await chromium.launch();
  try {
    await verifyDesktop(browser);
    await verifyMobile(browser);
    console.log("TypeScript実践の複数ファイル診断・JSON境界・class・下書きとZIP・モバイル四択と組立を確認");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
