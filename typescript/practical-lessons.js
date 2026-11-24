"use strict";

const practicalChapter = tsChapters.length;
const resultType = 'type Result = { score: number; status: "correct" | "incorrect" | "invalid" };';
const sharedExample = `// types.ts で共有する型
${resultType}

// display.ts で受け取る値
function describe(result: Result): string {
  return result.status + " " + result.score + "点";
}
console.log(describe({ score: 4, status: "correct" }));`;
const inputExample = `function pointsOf(raw: unknown): number | null {
  if (typeof raw !== "object" || raw === null) return null;
  if (!("points" in raw) || typeof raw.points !== "number") return null;
  if (!Number.isInteger(raw.points) || raw.points < 0) return null;
  return raw.points;
}`;
const classExample = `type Question = { answer: string; points: number };

class QuizRound {
  question: Question;

  constructor(question: Question) {
    this.question = question;
  }

  answer(text: string): number {
    if (text !== this.question.answer) return 0;
    return this.question.points;
  }
}`;
const roundTest = (question, text, want, hint) =>
  trial(`new QuizRound(${question}).answer(${JSON.stringify(text)})`, want, hint);
const twoRoundsExample = `const moss = new QuizRound({ answer: "苔", points: 4 });
const stone = new QuizRound({ answer: "石", points: 7 });`;

tsChapters.push({
  title: "複数ファイルで型を共有し、採点機能を直す",
  intro: "別々のファイルから同じ型を使う方法を学びます。練習では、外から届く問題データを確かめ、問題と採点処理をまとめたクラスに渡します。",
  demo: [],
  practical: true
});

tsLessons.push({
  id: "shared-result", chapter: practicalChapter, title: "ほかのファイルから同じ型を使う（import type）",
  why: "採点した側と表示する側で、得点と結果の名前をそろえます。別ファイルから型を使うときは、定義側で export type、使う側で import type と書きます。見本には二つのファイルの役割を並べました。型の score だけを points に変えると、古い名前を読んでいる場所が型検査に出ます。",
  before: sharedExample, after: sharedExample.replace("score: number", "points: number"), change: "共有型の項目名だけを変える",
  question: [
    "共有型の項目名を points に変えた直後、result.score を読んでいた表示用の関数では何が起きますか。",
    ["4点のまま実行される", "型検査が score を読んでいる行を示す", "コンパイラが式を result.points に書き換える", "result に自動で0点が入る"],
    1, "使う側の result.score を、共有型にある新しい名前へ直します。"
  ],
  prompt: "describe(result) で、状態と得点をこの順で表示する文字列を返します。状態と得点の間に空白を入れ、得点の後ろに「点」を付けます。",
  template: resultType + '\nfunction describe(result: Result): string {\n  return § + " " + § + "点";\n}',
  slots: [["状態の項目", "result.score", "result.status"], ["得点の項目", "result.score", "result.status"]],
  starter: resultType + '\nfunction describe(result: Result): string {\n  return result.status;\n}',
  contract: "const describeCheck: (result: Result) => string = describe;",
  contractHint: "Result 型を一つ受け取り、文字列を返す describe を作ります。",
  probes: [
    trial('describe({ score: 4, status: "correct" })', "correct 4点", "正解の状態と得点をつなぎます。"),
    trial('describe({ score: 0, status: "invalid" })', "invalid 0点", "状態と得点は引数から読み取ります。")
  ]
}, {
  id: "points-input", chapter: practicalChapter, title: "外から届いた値が0以上の整数か確かめる",
  why: "外から届くJSONを読み取った値は unknown として受け取ります。まず null 以外のオブジェクトか確かめ、in で points の有無を、typeof で値の種類を調べます。Number.isInteger と 0 との比較で、点として使える数かを調べます。見本は配点だけを確認します。",
  before: inputExample + '\nconsole.log(pointsOf({ points: 4 }));',
  after: inputExample + '\nconsole.log(pointsOf({ points: "4" }));', change: "配点を文字の「4」に変える",
  question: [
    "points の存在と typeof が number だと確認できたとき、配点の −2 を見つける条件はどれですか。",
    ["raw が null かを見る", "points の文字数を調べる", "points が 0 より小さいかを見る", "points in raw をもう一度行う"],
    2, "配点は0以上の整数です。文字か数かに加えて、数の範囲も確かめます。"
  ],
  prompt: "pointsOf(raw) を作ります。raw は外から受け取った値です。raw にある points（配点）が0以上の整数ならその数を返し、null、項目の欠落、配点の文字列や負の数、小数を受け取ると null を返します。",
  template: inputExample.replace('!("points" in raw)', "§").replace("raw.points < 0", "§"),
  slots: [["points が欠けている条件", '!("points" in raw)', '"points" in raw'], ["配点に使えない数の条件", "raw.points > 0", "raw.points < 0"]],
  starter: inputExample.replace("  if (!Number.isInteger(raw.points) || raw.points < 0) return null;\n", ""),
  contract: "const pointsCheck: (input: unknown) => number | null = pointsOf;",
  contractHint: "unknown を受け取り、配点か null を返す pointsOf を作ります。",
  probes: [
    trial("pointsOf({ points: 4 })", 4, "正しい配点はその数を返します。"),
    trial("pointsOf({ points: 0 })", 0, "0点も扱えるようにします。"),
    trial("pointsOf(null)", null, "null の項目を読まずに終了します。"),
    trial("pointsOf({})", null, "配点が欠けた場合は null を返します。"),
    trial('pointsOf({ points: "4" })', null, "数に見える文字列も null にします。"),
    trial("pointsOf({ points: -2 })", null, "負の点は null を返します。"),
    trial("pointsOf({ points: 2.5 })", null, "整数だけを配点として使います。")
  ]
}, {
  id: "round-class", chapter: practicalChapter, title: "データと処理を一つにまとめる（クラス）",
  why: "class で、問題と回答を採点する処理を一つにまとめます。new QuizRound(question) で一問分のオブジェクト（インスタンス）を作ると、constructor が受け取った問題を this.question に保存します。answer はその回の問題を使うメソッドです。",
  before: classExample + '\nconst round = new QuizRound({ answer: "苔", points: 4 });\nconsole.log(round.answer("苔"));',
  after: classExample + "\n\n" + twoRoundsExample + '\nconsole.log(moss.answer("苔"));\nconsole.log(stone.answer("石"));',
  change: "二つの問題を作ってから採点する",
  question: [
    "答えと配点の違う問題を new QuizRound で二つ作ったとき、answer が参照するのはどれですか。",
    ["いちばん最後に作った問題", "各インスタンスの問題", "始めに作った問題だけ", "常に同じ配点の問題"],
    1, "this.question は、そのメソッドを呼び出したインスタンスが持つ問題です。"
  ],
  prompt: "クラス QuizRound を作ります。constructor で Question 型の問題を受け、this.question に保存します。answer(text) は一致したらこの回の配点を、不一致なら0を返します。QuizRound を二つ作ってから、別々の答えと配点で採点できるか確かめます。",
  template: classExample.replace("this.question.answer", "§").replace("this.question.points", "§"),
  slots: [["比べる答え", 'this.question.answer', '"苔"'], ["今回の配点", "4", "this.question.points"]],
  starter: `type Question = { answer: string; points: number };

// class QuizRound を定義します。
// constructor で問題を保存し、answer メソッドで採点します。
`,
  contract: "const roundCheck: new (question: Question) => { answer(text: string): number } = QuizRound;",
  contractHint: "Question を受け取って作る QuizRound に、数を返す answer メソッドを用意します。",
  probes: [
    roundTest('{ answer: "苔", points: 4 }', "苔", 4, "一致したら、この問題の配点を返します。"),
    roundTest('{ answer: "石", points: 7 }', "石", 7, "作るときに渡した問題から配点を読みます。"),
    roundTest('{ answer: "石", points: 7 }', "苔", 0, "別の問題の正解は加点しません。"),
    trial(`(() => {
      ${twoRoundsExample}
      return [moss.answer("苔"), stone.answer("石")];
    })()`, [4, 7], "二つを作ってから採点しても4点と7点になります。各回の問題を this.question に保存しましょう。")
  ],
  nextPractical: true
});
