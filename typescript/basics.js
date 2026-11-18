"use strict";

const tsChapters = [{
  title: "点数と一問に入れられる値を決める",
  intro: "JavaScriptで作ったクイズに、点と文字の取り違えを実行前に見つける目印を付けます。まず案内の札に正解の点を出しましょう。",
  demo: ["正解1点の札を出す", "正解3点の札を出す"],
  code: n => `const points: number = ${n ? 3 : 1};\nconsole.log("正解 " + points + "点");`
}];
const tsLessons = [];
const tsSafe = { kind: "safe", hint: "型の強制や any を外し、型を実際に確かめる書き方にしましょう。" };
const tsAnnotated = (name, hint) => ({ kind: "annotated", name, hint });
const trial = (expr, want, hint) => ({ expr, want, hint });

tsLessons.push(
  {
    id: "infer", chapter: 0, title: "最初の点から型を読む",
    why: "点の箱に最初に 0 を入れると、TypeScriptは数の箱だと判断します。これが型の推論です。数字を引用符で囲むと文字になり、次の代入で取り違えを発見できます。",
    before: 'let points = 0;\npoints = "2";\nconsole.log(points);',
    after: 'let points = 0;\npoints = 2;\nconsole.log(points);', change: "2行目の引用符を外す",
    question: ["let points = 0 のあとで同じ箱に入れられるのは？", ["数の 4", '文字の "4"', "本の題名", "真偽値"], 0, "初期値が数なので points は number と推論されます。"],
    prompt: "別の問題の得点です。最初は 0 の points に数の 4 を入れ、数のまま読み出せるようにしてください。",
    template: "let points = 0;\npoints = §;", slots: [["入れる値", "4", '"4"', "0"]], starter: 'let points = 0;\npoints = "4";',
    contract: "const __point: number = points;", contractHint: "点の箱 points を数として用意します。",
    probes: [trial("points", 4, "点は数になりました。今回の得点は 4 にします。")]
  },
  {
    id: "annotate", chapter: 0, title: "得点に数の注釈を書く",
    why: "誰が続きを書いても入れる値が伝わるよう、名前の後ろに : number と書けます。コロンから右が型注釈、等号から右が初期値です。",
    before: "let score = 1;\nconsole.log(score);", after: "let score: number = 1;\nconsole.log(score);", change: "score に数の注釈を付ける",
    question: ["let score: number = 1 の初期値は？", ["score", "number", "1", "let"], 2, "等号の右が最初に入れる値です。"],
    prompt: "星の問題の得点 score に、数を入れる注釈と初期値 3 を付けてください。",
    template: "let score: § = §;", slots: [["注釈", "number", "string"], ["初期値", "3", '"3"', "1"]], starter: "let score = 1;",
    rules: [tsAnnotated("score", "名前 score のすぐ後ろに、数の型注釈を足しましょう。")],
    contract: "const __score: number = score;", contractHint: "数として読める score を用意します。",
    probes: [trial("score", 3, "型は合っています。今回の初期値を 3 にします。")]
  },
  {
    id: "check-run", chapter: 0, title: "型が通った後に得点を実行する",
    why: "数から数を引くコードも型としては正しく、得点の要望を満たすかは実行して比べます。下の見本は 2 点に 1 点を足したい場面です。",
    before: "const total: number = 2 - 1;\nconsole.log(total);", after: "const total: number = 2 + 1;\nconsole.log(total);", change: "引き算を足し算に変える",
    question: ["2点に1点を足したいのに 2 - 1 と書いたら？", ["型検査が必ず止める", "型は通り、実行すると1になる", "3が出る", "文字になる"], 1, "数どうしの引き算も型は正しいので、実行結果を要望と照合します。"],
    prompt: "月の問題で 4 点から始め、正解で 2 点足します。total の型を数に保ち、結果を 6 点にします。",
    template: "const total: number = § § §;", slots: [["開始点", "4", '"4"'], ["演算", "+", "-"], ["追加点", "2", "1"]], starter: "const total: number = 4 - 2;",
    contract: "const __total: number = total;", contractHint: "合計 total を数として用意しましょう。",
    probes: [trial("total", 6, "数として型検査は通りました。足した後に6点になるよう式を見直します。")]
  },
  {
    id: "shape", chapter: 0, title: "一問にそろえる項目を決める",
    why: '書名と配点を取り違えないよう、一問に必要な形を Question と名付けます。interface の中に text: string と points: number を書きます。type Question = { … } という型別名でも同じ形を表せます。',
    before: 'interface Question { text: string; points: number }\nconst book: Question = { text: "池", points: 1 };\nconsole.log(book.text);',
    after: 'type Question = { text: string; points: number };\nconst book: Question = { text: "池", points: 1 };\nconsole.log(book.text);', change: "同じ形を型別名で書く",
    question: ["Question に text と points が必要。{text: \"星\"} に足すのは？", ["色の名前", "空の文字", "問題番号だけ", "数の points"], 3, "型で必須にした二つの項目を一問ずつそろえます。"],
    prompt: "Question に text（文字）と points（数）を定義します。既存の「池」1点に続けて「星」3点を追加し、questions から二問を順に読めるようにしてください。Question[] はその形の問題が並ぶ配列です。",
    template: '§ Question § { text: string; points: § };\nconst questions: Question[] = [{ text: "池", points: 1 }, { text: "星", points: § }];',
    slots: [["型の宣言", "type", "interface"], ["名前と形の間（interface は空白）", "=", " "], ["配点の型", "number", "string"], ["星の点", "3", '"3"', "1"]],
    starter: 'interface Question { text: string; points: number }\nconst questions: Question[] = [{ text: "池", points: 1 }];',
    contract: 'const __q: Question = { text: "朝", points: 7 };\nconst __pair: {text:string;points:number}[] = questions;',
    contractHint: "Question と questions を用意し、文字の text と数の points を持たせます。",
    probes: [trial("questions[0]", {text:"池",points:1}, "最初の「池」1点を残します。"), trial("questions[1]", {text:"星",points:3}, "次に「星」3点の一問を加えます。"), trial("questions.length",2,"一覧を指定の二問にします。")]
  }
);
