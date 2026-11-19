"use strict";

const practicalStarterTS = {
  "types.ts": `export type Question = { answer: string; points: number };

// TODO: Result の points を score にし、answered を correct と incorrect に分ける。
export type Result = { points: number; status: "answered" | "invalid" };
`,
  "input.ts": `import type { Question } from "./types.js";

export function questionFrom(raw: unknown): Question | null {
  // TODO: null、項目の欠落、配点の種類と範囲を確かめる。
  return null;
}
`,
  "score.ts": `import type { Question, Result } from "./types.js";
import { questionFrom } from "./input.js";

export class QuizRound {
  question: Question;

  constructor(question: Question) {
    this.question = question;
  }

  answer(text: string): Result {
    // TODO: この問題の答えと比べ、状態と得点を分ける。
    return { status: "answered", points: this.question.points };
  }
}

export function scoreAnswer(raw: unknown, text: string): Result {
  const question = questionFrom(raw);
  if (question === null) return { status: "invalid", points: 0 };
  return new QuizRound(question).answer(text);
}
`,
  "display.ts": `import type { Result } from "./types.js";

export function describe(result: Result): string {
  return result.status + " " + result.points + "点";
}
`
};


const practicalChecksTS = [
  ["正解", '{"answer":"苔","points":4}', "苔", "correct 4点"],
  ["別の配点", '{"answer":"石","points":7}', "石", "correct 7点"],
  ["不正解", '{"answer":"石","points":7}', "苔", "incorrect 0点"],
  ["0点の問題", '{"answer":"海","points":0}', "海", "correct 0点"],
  ["答えがない", '{"points":4}', "苔", "invalid 0点"],
  ["配点がない", '{"answer":"苔"}', "苔", "invalid 0点"],
  ["null", 'null', "苔", "invalid 0点"],
  ["文字の配点", '{"answer":"苔","points":"4"}', "苔", "invalid 0点"],
  ["負の配点", '{"answer":"苔","points":-2}', "苔", "invalid 0点"],
  ["小数の配点", '{"answer":"苔","points":1.5}', "苔", "invalid 0点"]
];

const practicalCheckCodeTS = `import { describe } from "./display.js";
import { scoreAnswer } from "./score.js";

const cases = [
${practicalChecksTS.map(row => "  " + JSON.stringify(row)).join(",\n")}
];

export function runChecks() {
  return cases.map(([label, json, text, expected]) => {
    const raw: unknown = JSON.parse(json);
    return { label, actual: describe(scoreAnswer(raw, text)), expected };
  });
}
`;

const practicalVerifyTS = `import { runChecks } from "./dist/check.js";

for (const { label, actual, expected } of runChecks()) {
  console.log(label + " · " + actual);
  if (actual !== expected) {
    console.error("  期待する結果 " + expected);
    process.exitCode = 1;
  }
}
if (!process.exitCode) console.log("すべての確認を通りました。");
`;

const practicalReadmeTS = `# 観察クイズの採点を改修する

このZIPには、保存時点の4ファイルと動作確認用のデータが入っています。

1. 展開したフォルダーをPCのエディターで開きます。
2. Dockerを起動します。ターミナルで展開したフォルダーへ移動し、次の3つのコマンドを一つずつ実行します。macOS のターミナルや Linux のシェルを想定しています。
3. 一つ目はこのフォルダーに TypeScript 6.0.3 を入れます。初回の取得にはネット接続が必要です。二つ目は型だけを検査します。三つ目は型検査を通ったファイルを dist に出力して、10通りの結果まで確かめます。

\`\`\`sh
docker run --rm -v "\${PWD}:/practice" -w /practice node:24-bookworm npm ci --no-audit --no-fund
docker run --rm --network none -v "\${PWD}:/practice" -w /practice node:24-bookworm npm run typecheck
docker run --rm --network none -v "\${PWD}:/practice" -w /practice node:24-bookworm npm run verify
\`\`\`

診断が display.ts(4,39) のように出たら、display.ts の4行目39列を開きます。
types.ts だけを変えた直後には score.ts や display.ts にエラーが出ます。
使う側の項目と返す値を合わせ、型検査をもう一度行いましょう。

- types.ts で Result を score と status に変えます。status は correct、incorrect、invalid の3種類です。Question の points は問題の配点です。
- score.ts で QuizRound の answer を完成させます。一致したときは correct と問題の配点、不一致なら incorrect と0点。問題を読み取れなければ invalid と0点です。
- display.ts は状態と得点を「correct 4点」のように表示します。
- input.ts は unknown から文字列の answer と0以上の整数の points が両方確認できたときだけ問題を返します。ほかは null を返します。

check.ts と verify.mjs は確認用です。「すべての確認を通りました。」が表示されたら、共有相手に4つの .ts ファイルかZIPと、npm run verify の結果を渡せます。
`;

const practicalPackageTS = {
  name: "yomikumu-score-practice",
  private: true,
  type: "module",
  scripts: {
    typecheck: "tsc --locale ja --noEmit",
    verify: "tsc --locale ja && node verify.mjs"
  },
  devDependencies: { typescript: "6.0.3" }
};
const practicalLockTS = {
  name: practicalPackageTS.name,
  lockfileVersion: 3,
  requires: true,
  packages: {
    "": { name: practicalPackageTS.name, devDependencies: practicalPackageTS.devDependencies },
    "node_modules/typescript": {
      version: "6.0.3",
      resolved: "https://registry.npmjs.org/typescript/-/typescript-6.0.3.tgz",
      integrity: "sha512-y2TvuxSZPDyQakkFRPZHKFm+KKVqIisdg9/CZwm9ftvKXLP8NRWj38/ODjNbr43SsoXqNuAisEf1GdCxqWcdBw==",
      dev: true,
      license: "Apache-2.0",
      bin: { tsc: "bin/tsc", tsserver: "bin/tsserver" },
      engines: { node: ">=14.17" }
    }
  }
};
const practicalConfigTS = {
  compilerOptions: {
    target: "ES2022",
    module: "NodeNext",
    strict: true,
    types: [],
    noEmitOnError: true,
    outDir: "dist"
  },
  include: ["*.ts"]
};

function makePracticalArchiveTS(files) {
  const toJson = object => JSON.stringify(object, null, 2) + "\n";
  const project = {
    ...files,
    "check.ts": practicalCheckCodeTS,
    "verify.mjs": practicalVerifyTS,
    "package.json": toJson(practicalPackageTS),
    "package-lock.json": toJson(practicalLockTS),
    "tsconfig.json": toJson(practicalConfigTS),
    "README.md": practicalReadmeTS
  };
  return fflate.zipSync(Object.fromEntries(Object.entries(project).map(([name, text]) => [name, fflate.strToU8(text)])));
}
