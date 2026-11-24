"use strict";

const tsChapters = [{
  title: "得点とクイズの問題に型を付ける",
  intro: "TypeScript は JavaScript に「この値は何に使えるか」を確認する型検査を足した言語です。たとえば得点を number（数値）と決めると、数字に見える文字を入れた間違いを実行前に見つけられます。まず points の値を 1 から 3 に変えて、表示される得点を確かめましょう。",
  demo: ["正解1点を表示", "正解3点を表示"],
  code: n => `const points: number = ${n ? 3 : 1};\nconsole.log("正解 " + points + "点");`
}];
const tsLessons = [];
const tsSafe = { kind: "safe", hint: "型アサーションや any を外し、条件式で値の種類を確認しましょう。" };
const tsAnnotated = (name, hint) => ({ kind: "annotated", name, hint });
const trial = (expr, want, hint) => ({ expr, want, hint });

tsLessons.push(
  {
    id: "infer", chapter: 0, title: "変数の初期値から型を知る",
    why: "let points = 0 と書くと、TypeScript は初期値の 0 から points の型を number（数値）と判断します。これを型推論と呼びます。引用符で囲んだ数字は文字列なので、points に代入すると型エラーになります。",
    before: 'let points = 0;\npoints = "2";\nconsole.log(points);',
    after: 'let points = 0;\npoints = 2;\nconsole.log(points);', change: "2行目の引用符を外す",
    question: ["let points = 0 の後、points に代入できる値は？", ["数の 4", '文字の "4"', "本の題名", "真偽値"], 0, "初期値が数なので points は number と推論されます。"],
    prompt: "points の初期値は 0 です。次の行で数値の 4 を代入してください。",
    template: "let points = 0;\npoints = §;", slots: [["入れる値", "4", '"4"', "0"]], starter: 'let points = 0;\npoints = "4";',
    contract: "const __point: number = points;", contractHint: "points の型が number になるよう、初期値と代入する値を確認しましょう。",
    probes: [trial("points", 4, "点は数になりました。今回の得点は 4 にします。")]
  },
  {
    id: "annotate", chapter: 0, title: "得点の変数に型注釈を書く",
    why: "変数名の後に : number と書くと、代入できる値は数値に限られます。let score: number = 1 では : number が型注釈、1 が初期値です。",
    before: "let score = 1;\nconsole.log(score);", after: "let score: number = 1;\nconsole.log(score);", change: "score に数の注釈を付ける",
    question: ["let score: number = 1 の初期値は？", ["score", "number", "1", "let"], 2, "等号の右が最初に入れる値です。"],
    prompt: "得点を表す score に number の型注釈を付け、初期値を 3 にしてください。",
    template: "let score: § = §;", slots: [["注釈", "number", "string"], ["初期値", "3", '"3"', "1"]], starter: "let score = 1;",
    rules: [tsAnnotated("score", "名前 score のすぐ後ろに、数の型注釈を足しましょう。")],
    contract: "const __score: number = score;", contractHint: "数として読める score を用意します。",
    probes: [trial("score", 3, "型は合っています。今回の初期値を 3 にします。")]
  },
  {
    id: "check-run", chapter: 0, title: "型検査の後で得点を計算する",
    why: "型検査で確かめるのは、この例では「結果が数値か」です。「正しい得点か」までは確かめられません。2 - 1 は数値の 1 になるので型検査を通りますが、欲しい結果は 2 + 1 の 3 です。二つを実行して比べましょう。",
    before: "const total: number = 2 - 1;\nconsole.log(total);", after: "const total: number = 2 + 1;\nconsole.log(total);", change: "引き算を足し算に変える",
    question: ["2点に1点を足したいのに 2 - 1 と書いたら？", ["型検査が必ず止める", "型は通り、実行すると1になる", "3が出る", "文字になる"], 1, "2 - 1 の結果も数値ですが、実行すると欲しかった 3 とは違う 1 が表示されます。"],
    prompt: "得点は 4 点から始まり、正解すると 2 点増えます。total の型を数に保ち、結果を 6 点にします。",
    template: "const total: number = § § §;", slots: [["開始点", "4", '"4"'], ["演算", "+", "-"], ["追加点", "2", "1"]], starter: "const total: number = 4 - 2;",
    contract: "const __total: number = total;", contractHint: "合計 total を数として用意しましょう。",
    probes: [trial("total", 6, "数として型検査は通りました。足した後に6点になるよう式を見直します。")]
  },
  {
    id: "shape", chapter: 0, title: "一問にそろえる項目を決める",
    why: '問題文 text と配点 points を持つオブジェクトの型を Question と名付けます。interface の中に text: string と points: number を書きます。type Question = { … } という型別名でも同じ形を表せます。',
    before: 'interface Question { text: string; points: number }\nconst book: Question = { text: "池", points: 1 };\nconsole.log(book.text);',
    after: 'type Question = { text: string; points: number };\nconst book: Question = { text: "池", points: 1 };\nconsole.log(book.text);', change: "同じ形を型別名で書く",
    question: ["Question に text と points が必要。{text: \"星\"} に足すのは？", ['points: "3"', "points: true", "score: 3", "points: 3"], 3, "text と points はどちらも必須です。すでに text があるので、数値の points を追加します。"],
    prompt: "Question に text（文字）と points（数）を定義します。既存の「池」1点に続けて「星」3点を追加し、questions から二問を順に読めるようにしてください。Question[] はその形の問題が並ぶ配列です。",
    template: '§ Question § { text: string; points: § };\nconst questions: Question[] = [{ text: "池", points: 1 }, { text: "星", points: § }];',
    slots: [["型の宣言", "type", "interface"], ["名前と形の間（interface は空白）", "=", " "], ["配点の型", "number", "string"], ["星の点", "3", '"3"', "1"]],
    starter: 'interface Question { text: string; points: number }\nconst questions: Question[] = [{ text: "池", points: 1 }];',
    contract: 'const __q: Question = { text: "朝", points: 7 };\nconst __pair: {text:string;points:number}[] = questions;',
    contractHint: "Question と questions を用意し、文字の text と数の points を持たせます。",
    probes: [trial("questions[0]", {text:"池",points:1}, "最初の「池」1点を残します。"), trial("questions[1]", {text:"星",points:3}, "次に「星」3点の一問を加えます。"), trial("questions.length",2,"一覧を指定の二問にします。")]
  }
);
