"use strict";

const opening = 'function announce() {\n  console.log("受付開始");\n}';
const stampCall = "stamp(initialScore);\nstamp(initialScore + 2);";
const returnCall = "const total = addBonus(initialScore);\nconsole.log(total);\nconsole.log(total + 1);";
const scopeExample = 'const points = 1;\nfunction showInside() {\n  const points = 4;\n  console.log(points);\n}\nshowInside();\nconsole.log(points);';
const arrowCall = "console.log(double(initialScore));\nconsole.log(double(initialScore + 1));";
const scoringCall = "const first = award(initialScore, 2);\nconst total = award(first, 3);\nconsole.log(first);\nshowTitle(total);";

const javascriptFunctionLessons = [
  {
    id: "js-call", topic: "関数の入口", title: "関数を呼んでメッセージを表示する",
    goal: "表示の手順に名前を付け、同じ手順を二回使う。",
    slides: [
      { title: "関数を定義しただけのとき", body: "function announce() の後の波かっこには、「受付開始」と表示する処理を書いています。この見本には announce() を呼ぶ行がないため、コンソールの出力は空です。", code: opening },
      { title: "名前の後に丸かっこを付けて呼ぶ", body: "announce(); の行に来ると、用意した手順の中が動きます。二回呼べば二回表示されます。何度も使えるこうした手順を関数と呼びます。", code: opening + "\nannounce();\nannounce();" },
    ],
    quiz: { prompt: "function announce() { … } を用意した後、手順を一回動かす行は？", options: ["announce;", "announce();", '"announce";', "true;"], correct: 1,
      reasons: ["丸かっこがないので手順は始まりません。", "名前に丸かっこを付けると手順を呼び出します。", "これは名前と同じ文字を書いただけです。", "この真偽だけでは関数を呼びません。"] },
    exercise: { field: "javascript", task: "用意した関数 announce を二回呼んで、コンソールに「受付開始」を二行表示してください。",
      code: opening + "\nannounce();", answer: opening + "\nannounce();\nannounce();", review: 1,
      hint: "関数をもう一つ書く必要はありません。今ある呼び出しと同じ行を足します。",
      build: { code: opening + "\nannounce();\n①;", slots: [["二回目の呼び出し", "announce", "announce()"]] },
      expected: () => ["受付開始","受付開始"], hints: ["まず announce() を一回呼びましょう。","一行目は表示できました。もう一度 announce() を呼んで二行目を表示しましょう。"] },
  },
  {
    id: "js-parameter", topic: "関数に値を渡す", title: "同じ関数に違う点数を渡す",
    goal: "丸かっこの中の値が、呼ぶたびに関数の中で使えることを確かめる。",
    slides: [
      { title: "呼ぶたび違う点を受け取る", body: "stamp(2) の 2 は、関数に渡す値（引数）です。function stamp(points) の points は、値を受け取る名前（仮引数）です。stamp(2) の回は points が2、stamp(5) の回は5になります。", code: "function stamp(points) {\n  console.log(points);\n}\nstamp(2);\nstamp(5);" },
      { title: "受け取った値を計算に使う", body: "渡された点に1を足してから表示します。二回目の stamp は新しく5を受け取るので、最初の計算とは別に6を表示します。", code: "function stamp(points) {\n  console.log(points + 1);\n}\nstamp(2);\nstamp(5);" },
    ],
    quiz: { prompt: "stamp(7) と呼ぶと、その回の points はどの値？", options: ["いつも2", "前回の最後の点", "7", "文字のpoints"], correct: 2,
      reasons: ["呼ぶときに渡す値によって変わります。","呼び出すたびに渡された値を受け取ります。","今回は丸かっこの中の7を渡しました。","points は関数の中で値を読む名前です。"] },
    exercise: { field: "javascript", variableStart: true, task: "stamp が、points で受け取った点に2を足し、その結果を一行表示するように直してください。開始点が2なら、確認用コードは stamp(2) と stamp(4) を呼び、4と6が表示されます。",
      code: "function stamp(points) {\n  console.log(2);\n}", calls: stampCall, answer: "function stamp(points) {\n  console.log(points + 2);\n}", review: 1,
      hint: "渡された points から始めます。固定した点を表示すると、別の引数でも結果が変わりません。",
      build: { code: "function stamp(points) {\n  console.log(① + ②);\n}", slots: [["受け取った値", "points", '"points"'], ["加える点", '"2"', "2"]] },
      expected: start => [start + 2, start + 4], hints: ["一回目に受け取った数へ2を足しましょう。","一回目はできました。二回目も、その回に渡された数に2を足します。"] },
  },
  {
    id: "js-return", topic: "関数から値を返す", title: "返ってきた点を次の計算に使う",
    goal: "コンソールに表示する操作と、呼び出し元が使える値を返す操作を見分ける。",
    slides: [
      { title: "表示した数が total に入らない理由", body: "最初に出る 5 は、関数の中の console.log が表示した数です。ただし return がないので、呼び出し元の total に 5 は入りません。最後の console.log(total) には、値が返されなかったことを示す undefined が出ます。", code: "function bonus(n) {\n  console.log(n + 2);\n}\nconst total = bonus(3);\nconsole.log(total);" },
      { title: "return で呼び出した場所に渡す", body: "return は結果を呼んだ場所に返して関数を終えます。bonus(3) の結果を total に入れると、別の行でさらに1点を足せます。", code: "function bonus(n) {\n  return n + 2;\n}\nconst total = bonus(3);\nconsole.log(total + 1);" },
    ],
    quiz: { prompt: "関数の外で点を受け取り、さらに1を足すには、中で何を書く？", options: ["console.log で表示するだけ", '"total" と書く', "同じ関数を呼び続ける", "return で数を返す"], correct: 3,
      reasons: ["表示しただけでは呼んだ場所に数が渡りません。","この文字は計算した値を返しません。","値の受け渡しはできません。","呼び出した式が返された数になるので続けて使えます。"] },
    exercise: { field: "javascript", variableStart: true, returnsValue: true, task: "addBonus が、受け取った点に3を足した数を返すように直してください。確認用コードは結果を total に入れ、total と total + 1 を順に表示します。",
      code: "function addBonus(n) {\n  console.log(n + 3);\n}", calls: returnCall, answer: "function addBonus(n) {\n  return n + 3;\n}", review: 1,
      hint: "関数の外の total が数を受け取れるように、表示の代わりに return を使います。",
      build: { code: "function addBonus(n) {\n  ① n + ②;\n}", slots: [["呼んだ場所に渡す指定", "return", "let"], ["加える点", "1", "3"]] },
      expected: start => [start + 3, start + 4], hints: ["呼び出した場所へ、3点を加えた数を返しましょう。","返した値を使って、もう1点分を表示できるようにしましょう。"] },
  },
  {
    id: "js-scope", topic: "名前が使える場所", title: "関数の中と外で使える変数を見分ける",
    goal: "関数の内側で付けた名前を、その関数の中で使う。",
    slides: [
      { title: "同じ名前でも中と外で値が違う", body: "関数の中の const points は、その関数内で読む名前です。外にも points がある場合、中では内側の名前を読みます。見本を実行して4と1の順を確認しましょう。", code: scopeExample },
      { title: "外から内側の名前を読むと何が起きる？", body: "round の中で作る special は、その中だけで使えます。最後の行で止まったら、どの行から名前を読んだかを見てください。中から値を持ち出すには return を使えます。", code: "function round() {\n  const special = 4;\n  return special;\n}\nconsole.log(round());\nconsole.log(special);" },
    ],
    quiz: { prompt: "関数の中だけにある名前を外で使いたいとき、数をどう受け取る？", options: ["関数から値を返し、外で受け取る", "外で同じ名前を書く", "引用符で囲む", "実行を二回押す"], correct: 0,
      reasons: ["外の変数には返ってきた数を入れられます。","内側だけの名前は外から読めません。","名前と同じ文字になります。","実行回数を増やしても名前が使える範囲は同じです。"] },
    exercise: { field: "javascript", variableStart: true, task: "special は round の中で定義した変数です。関数の外の console.log を直し、一行目に round が返した得点、二行目に開始点を表示してください。",
      code: "function round() {\n  const special = initialScore + 4;\n  return special;\n}\nconsole.log(special);\nconsole.log(initialScore);",
      answer: "function round() {\n  const special = initialScore + 4;\n  return special;\n}\nconsole.log(round());\nconsole.log(initialScore);", review: 1,
      hint: "関数の外では special の代わりに round() で返り値を受け取れます。",
      scopeHint: "special は round の中で読める名前です。外では round() が返す数を使いましょう。",
      build: { code: "function round() {\n  const special = initialScore + 4;\n  return special;\n}\nconsole.log(①);\nconsole.log(②);", slots: [["round が返す得点", "round()", "special"], ["開始点", "initialScore", "special"]] },
      expected: start => [start + 4,start], hints: ["一行目には round() が返した得点を表示しましょう。","得点は表示できました。二行目は開始点です。"] },
  },
  {
    id: "js-arrow", topic: "関数の別の書き方", title: "短い計算を矢印で書く",
    goal: "一つの値を受けて一つの数を返す処理を、矢印関数に書き換える。",
    slides: [
      { title: "引数から返す式に向けて矢印を書く", body: "n => n + 1 は、左で受け取った n を使って右の式の値を返す関数です。const next にこの関数を入れれば next(2) のように呼べます。=> という形から矢印関数と呼びます。", code: "const next = n => n + 1;\nconsole.log(next(2));" },
      { title: "波かっこを付けたら return を書く", body: "処理を波かっこで囲む書き方もあります。このときは、返す値を return で示します。どちらの書き方も渡した点を1増やして返します。", code: "const next = n => {\n  return n + 1;\n};\nconsole.log(next(5));" },
    ],
    quiz: { prompt: "const next = n => n + 1; の後の next(4) は？", options: ["4", "文字のn", "5", "undefined"], correct: 2,
      reasons: ["右の式で1を足します。","左の n に渡した4を使います。","右の式 4 + 1 の結果がそのまま返ります。","波かっこのない式では結果を返します。"] },
    exercise: { field: "javascript", variableStart: true, returnsValue: true, arrowName: "double", task: "ボーナスは受け取った点の2倍です。double を矢印関数で書き、異なる点を入れても2倍の数を返してください。掛け算は * で書けます。同じ数を二度足しても構いません。",
      code: "const double = n => n;", answer: "const double = n => n + n;", calls: arrowCall, review: 0,
      hint: "n => の右に、受け取った n と n を足した式を置けます。",
      build: { code: "const double = n ① n ② n;", slots: [["矢印", "=>", ">="], ["同じ数を二度足す記号", "+", "-"]] },
      expected: start => [start * 2,(start + 1) * 2], hints: ["受け取った点を二度足した数を返しましょう。","一回目はできました。違う引数でもその点を2倍にしましょう。"] },
  },
  {
    id: "js-award", topic: "採点の仕上げ", title: "二種類の問題を一つの採点関数で扱う",
    goal: "同じ関数に違う加点を渡し、一問目の得点から二問目の合計を計算して見出しに表示する。",
    slides: [
      { title: "今の点と増える点を一緒に渡す", body: "丸かっこの中をカンマで区切れば、二つの値を渡せます。award(3, 2) では score が3、bonus が2です。返された点を次の問題の開始点にすると、一続きの採点になります。", code: "function award(score, bonus) {\n  return score + bonus;\n}\nconst first = award(3, 2);\nconsole.log(first);\nconsole.log(award(first, 1));" },
      { title: "合計を見出しに表示する", body: "計算した数も、用意した showTitle に渡せます。開始点を変えて実行し、コンソールに出た一問目の得点と、見出しに出た二問目の合計を比べましょう。", code: "function award(score, bonus) {\n  return score + bonus;\n}\nconst first = award(initialScore, 1);\nconsole.log(first);\nshowTitle(award(first, 2));", variableStart: true, sign: true },
    ],
    quiz: { prompt: "開始点4から、一問目は2点、二問目は3点増えます。二問目に渡す「今の点」は？", options: ["最初の4", "二問目の3", "0", "一問目から返った6"], correct: 3,
      reasons: ["最初からやり直すと一問目の加点が消えます。","これは二問目で増える点です。","合計に一問目が入らなくなります。","一問目の結果から二問目の計算を続けます。"] },
    exercise: { field: "javascript", variableStart: true, sign: true, returnsValue: true,
      task: "通常問題は2点、特別問題は3点です。award に今の点と加点を渡し、合計を返す関数を作ってください。用意した二つの呼び出しを使い、一問目の得点はコンソールに、二問目の後の合計は見出しに表示してください。",
      code: "function award(score, bonus) {\n  return score;\n}\nconst first = award(initialScore, 2);\nconst total = award(first, 3);\nconsole.log(first);\nshowTitle(first);",
      answer: "function award(score, bonus) {\n  return score + bonus;\n}\n" + scoringCall,
      calls: "console.log(award(initialScore, 1));", review: 1,
      hint: "関数で二つの引数を足して返します。見出しを変える showTitle には total を渡します。確認用コードは別の加点でも同じ関数を使います。",
      build: { code: "function award(score, bonus) {\n  return score + ①;\n}\n" + scoringCall.replace("showTitle(total)", "showTitle(②)"), slots: [["毎回渡される加点", "2", "bonus"], ["二問目の後の点", "first", "total"]] },
      judge: (result, start) => {
        const numbers = result.output;
        if (numbers[0]?.length !== 1 || numbers[0][0].type !== "number" || numbers[0][0].text !== String(start + 2)) return "まず、一問目の2点を加えた数を返し、コンソールに出しましょう。";
        if (result.title !== String(start + 5)) return "一問目はできました。その点から3点を加え、二問目の後の合計を見出しに表示しましょう。";
        if (numbers.length !== 2 || numbers[1].length !== 1 || numbers[1][0].type !== "number" || numbers[1][0].text !== String(start + 1)) return "合計は出ました。別の加点でも使えるように、関数内では引数の bonus を使いましょう。";
        return "";
      } },
  },
];
