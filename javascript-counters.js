"use strict";

const counterFactory = "function makeCounter(start, step) {\n  let score = start;\n  return function () {\n    score = score + step;\n    return score;\n  };\n}";
const resettingFactory = counterFactory.replace("  let score = start;\n  return function () {", "  return function () {\n    let score = start;");
const threeVisits = "const visit = makeCounter(initialScore, 1);\nconsole.log(visit());\nconsole.log(visit());\nconsole.log(visit());";
const twoDesks = "const red = makeCounter(initialScore, 2);\nconst blue = makeCounter(0, 3);";
const deskCalls = twoDesks + "\nconsole.log(red());\nconsole.log(blue());\nconsole.log(red());\nconsole.log(blue());";
const visitorTap = { label: "受付で1点加える", code: "console.log(visit());" };
const deskTaps = [
  { label: "赤い受付で2点加える", code: "console.log(red());" },
  { label: "青い受付で3点加える", code: "console.log(blue());" },
];

const javascriptCounterLessons = [
  {
    id: "js-return-action", topic: "呼べる手順を渡す", title: "受付に、後で呼べる手順を渡す",
    goal: "関数を渡す場合と、その場で動かして結果を渡す場合を区別する。",
    slides: [
      { title: "後で使う手順を受け取る", body: "受付係に「今すぐ表示」ではなく「必要なときに表示できる手順」を渡したいとします。return hello は hello という関数そのものを返します。受け取った announce を呼ぶ行を足してみましょう。操作するたびに、下のコードを上から実行します。",
        code: 'function hello() {\n  console.log("ようこそ");\n}\nfunction prepare() {\n  return hello;\n}\nconst announce = prepare();',
        actions: [{ label: "受付の案内を呼ぶ", code: "announce();" }] },
      { title: "丸かっこがあるのはどちら？", body: "return hello(); と書くと、この行で hello を実行して、その結果を返します。この例では呼べる手順を渡すため、return hello; と書き、受け取った後に announce() とします。", code: 'function hello() { return "開館"; }\nfunction prepare() { return hello; }\nconst announce = prepare();\nconsole.log(announce());' },
    ],
    quiz: { prompt: "後から自分で呼べる関数 hello を返す一行は？", options: ["return hello();", "return hello;", 'return "hello";', "console.log(hello());"], correct: 1,
      reasons: ["ここで実行した結果を返します。","関数を呼ばずに、その手順を渡します。","同じつづりの文字を返します。","関数の結果をその場で表示します。"] },
    exercise: { field: "javascript", task: "準備係 prepare から、あとで「受付中」を返す関数 desk を渡してください。確認用コードが prepare の結果を受け取り、二度呼びます。",
      code: 'function desk() { return "受付中"; }\nfunction prepare() { return desk(); }', answer: 'function desk() { return "受付中"; }\nfunction prepare() { return desk; }',
      calls: "const read = prepare();\nconsole.log(read());\nconsole.log(read());", callErrorHint: "prepare が返すのは受付の文字ではなく、後で呼べる desk です。return の丸かっこを見直しましょう。",
      review: 1, hint: "return desk; とすると受け取る側が desk を呼べます。", build: { code: 'function desk() { return "受付中"; }\nfunction prepare() { return ①; }', slots: [["後で呼べる手順", "desk()", "desk"]] },
      expected: () => ["受付中","受付中"], hints: ["受け取った手順を呼ぶと「受付中」と返るようにしましょう。"] },
  },
  {
    id: "js-kept-name", topic: "外側の値を読む", title: "窓口ごとの案内を後から読む",
    goal: "手順を作った場所の名前が、後でその手順を呼んでも使えることを確かめる。",
    slides: [
      { title: "呼び出しが終わっても、窓口名は読める", body: "makeDesk は受け取った name を使う関数を作って返します。red を後から呼ぶと、その関数を作ったときの「赤い受付」が返ります。外側の値を使い続けられるこの仕組みをクロージャと呼びます。", code: 'function makeDesk(name) {\n  return function () { return name; };\n}\nconst red = makeDesk("赤い受付");\nconsole.log(red());' },
      { title: "同じ手順から別の窓口を作る", body: "赤と青の窓口を別々に用意します。どちらを先に呼んでも、その窓口に渡した名前を読めます。好きな順に呼び出す行を加えて試しましょう。", code: 'function makeDesk(name) {\n  return function () { return name; };\n}\nconst red = makeDesk("赤");\nconst blue = makeDesk("青");', actions: [{ label: "赤の窓口を呼ぶ", code: "console.log(red());" }, { label: "青の窓口を呼ぶ", code: "console.log(blue());" }] },
    ],
    quiz: { prompt: 'const blue = makeDesk("青"); の後で blue() を呼ぶと、先ほどの見本では何が返る？', options: ["最後に画面に出た色", "赤", "青", "0"], correct: 2,
      reasons: ["画面の履歴を読み出す処理はありません。","赤い窓口に渡した名前です。","blue の関数を作ったときの名前を読みます。","この例では文字を返しています。"] },
    exercise: { field: "javascript", task: "makeDesk に渡された名前を、返す関数の中で読んでください。夕方、朝、夕方の順に呼ぶと、それぞれに渡した名前が出るようにします。",
      code: 'function makeDesk(name) {\n  return function () { return "朝"; };\n}', answer: 'function makeDesk(name) {\n  return function () { return name; };\n}',
      calls: 'const day = makeDesk("朝");\nconst late = makeDesk("夕方");\nconsole.log(late());\nconsole.log(day());\nconsole.log(late());', review: 0, hint: "内側の関数から、外で受け取った name を使います。",
      build: { code: "function makeDesk(name) {\n  return function () { return ①; };\n}", slots: [["その窓口で受け取った名前", '"朝"', "name"]] }, expected: () => ["夕方","朝","夕方"], hints: ["固定の文字を返すと、別の窓口にも同じ名前が出ます。受け取った name を返しましょう。"] },
  },
  {
    id: "js-counter", topic: "受付の得点・基本", title: "受付の得点を次の呼び出しに残す",
    goal: "数える手順を一度作り、繰り返し呼んで前の得点に足す。",
    slides: [
      { title: "受付をつくるのは一回だけ", body: "makeCounter を呼ぶと score が初期値から始まります。返ってきた visit() を呼ぶたび、同じ score に1を足します。受付を二回押して、コンソールの一行目と二行目を見比べましょう。", code: counterFactory + "\nconst visit = makeCounter(0, 1);", actions: [visitorTap] },
      { title: "開始点が変わっても前回の続き", body: "開始点を選ぶと、受付を開くときだけその数を入れます。最初の客、次の客で score がどう変わるか、一回ずつ呼んで確かめられます。", code: counterFactory + "\nconst visit = makeCounter(initialScore, 1);", actions: [visitorTap], variableStart: true },
    ],
    quiz: { prompt: "2点から始めて1点ずつ増える受付を二回呼んだとき、二回目に返る点は？", options: ["2", "3", "1", "4"], correct: 3, reasons: ["ここから数え始めます。","一回目の結果です。","一回で増える分です。","最初に3、次にその3から4になります。"] },
    exercise: { field: "javascript", variableStart: true, task: "受付が呼ばれたら、覚えている score に step を加え、増やした score を返してください。1点ずつ増える受付が三回呼ばれます。", code: counterFactory.replace("score = score + step;", "score = step;"), answer: counterFactory, calls: threeVisits, review: 0,
      hint: "右側で今の score に step を足してから、左の score に戻します。", build: { code: counterFactory.replace("score = score + step;", "score = ① + ②;"), slots: [["前回から持っている値", "0", "score"], ["一回で増える点", "step", "start"]] },
      expected: start => [start+1,start+2,start+3], hints: ["初回は開始点に1を足した値です。決まった数だけを返さず、持っている score を使いましょう。","初回は合っています。二回目はその値からもう1点増やしましょう。","二回目もできました。三回目にも同じ状態を引き継ぎます。"],
      further: [["初期化を直す練習", "js-reset-counter"], ["二つの受付に挑戦", "js-two-counters"]] },
  },
  {
    id: "js-reset-counter", topic: "受付の得点・やり直し", title: "毎回同じ点に戻る受付を修理する",
    goal: "初期値を置く場所を選び、一回目だけ合うカウンターを直す。",
    slides: [
      { title: "一人目は合うのに二人目も同じ", body: "この受付は毎回 let score = start; から始めます。二回押してみましょう。二人目も1になる理由を、実際に追加した呼び出しの行と見比べます。", code: resettingFactory + "\nconst visit = makeCounter(0, 1);", actions: [visitorTap] },
      { title: "初期値を置く行だけ外へ動かす", body: "let score = start; を返す関数の外に置くと、受付を作るときだけ初期値が入ります。内側には、来客のたびに増やして返す処理を残します。", code: counterFactory + "\nconst visit = makeCounter(0, 1);", actions: [visitorTap] },
    ],
    quiz: { prompt: "受付を開いたときだけ score を初期化できる位置は？", options: ["makeCounter の中で、内側の関数を返す前", "内側の関数を呼ぶたび", "点を返した後", "表示の行の外側ならどこでも"], correct: 0, reasons: ["受付を作る一回だけ通る場所です。","来客のたびに最初の値へ戻ります。","return でその関数の実行は終わります。","どの呼び出しで実行されるかが大切です。"] },
    exercise: { field: "javascript", variableStart: true, task: "一人2点の受付で、二回目にも一回目と同じ点が出ています。初期化する行を動かし、三回の得点が2点ずつ増えるように修理してください。",
      code: resettingFactory, answer: counterFactory, calls: threeVisits.replace("initialScore, 1","initialScore, 2"), review: 1,
      hint: "let score = start; は、return function の手前に一度だけ置きます。",
      build: { code: "function makeCounter(start, step) {\n  ①\n  return function () {\n    ②\n    return score;\n  };\n}", slots: [["受付を作るときに実行する行", "let score = start;", "score += step;"], ["来客ごとに実行する行", "score += step;", "let score = start;"]] },
      expected: start => [start+2,start+4,start+6], hints: ["一回目は開始点から2増やします。","一回目は正解です。二回目が同じ点に戻っています。初期化する行を外の関数へ移しましょう。","次は三回目も前の値から2点加えましょう。"] },
  },
  {
    id: "js-two-counters", topic: "受付の得点・発展", title: "赤と青、二つの受付を独立させる",
    goal: "別の開始点と増分で受付を二つ作り、交互に呼んでも各自の点だけを更新する。",
    slides: [
      { title: "赤と青を好きな順に押してみよう", body: "赤は開始点から2点ずつ、青は0から3点ずつ増えます。赤・青・赤と呼ぶと、最後の赤は一回目の赤の点から増えます。二つの受付は makeCounter を別々に呼んで作りました。", code: counterFactory + "\n" + twoDesks, variableStart: true, actions: deskTaps },
      { title: "名前を付け直しただけでは同じ受付", body: "const blue = red; と書くと、どちらも同じ関数を指します。赤の次に青を呼ぶと赤の続きを数えます。別の受付が必要なときは、異なる増分で makeCounter をもう一度呼びます。", code: counterFactory + "\nconst red = makeCounter(0, 2);\nconst blue = red;\nconsole.log(red());\nconsole.log(blue());" },
    ],
    quiz: { prompt: "赤を0から2点ずつ、青を0から3点ずつ数えます。赤・青・赤の順で返る数は？", options: ["2、5、7", "2、3、4", "2、3、2", "3、2、4"], correct: 1, reasons: ["二つを同じ箱で数えた場合の値です。","最後の赤は赤の前回値2に2を足します。","赤の二回目にも前の点が残ります。","赤は2点ずつです。"] },
    exercise: { field: "javascript", variableStart: true, task: "赤い受付は開始点から2点ずつ、青い受付は0から3点ずつ数えます。青い受付を自分で作ってください。赤と青を交互に二回ずつ呼びます。",
      code: counterFactory + "\nconst red = makeCounter(initialScore, 2);\nconst blue = red;", answer: counterFactory + "\n" + twoDesks, calls: deskCalls.slice(twoDesks.length + 1), review: 1,
      hint: "青も makeCounter で作り、二つの引数で青の開始点と増える点を渡します。",
      build: { code: counterFactory + "\n" + twoDesks.replace("makeCounter(0, 3)", "makeCounter(①, ②)"), excerpt: twoDesks.replace("makeCounter(0, 3)", "makeCounter(①, ②)"), slots: [["青だけの開始点", "0", "initialScore"], ["青が増える点", "2", "3"]] },
      expected: start => [start+2,3,start+4,6], hints: ["赤は開始点から2点増やします。","最初の赤は正解です。青は独立して0から3点増える受付を作りましょう。","青の点は出ました。二度目の赤は赤の前回値から数えます。","二度目の青も、青の前回値から3点増やします。"] },
  },
];
