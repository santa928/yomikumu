"use strict";

const counterFactory = "function makeCounter(start, step) {\n  let score = start;\n  return function () {\n    score = score + step;\n    return score;\n  };\n}";
const resettingFactory = counterFactory.replace("  let score = start;\n  return function () {", "  return function () {\n    let score = start;");
const threeVisits = "const visit = makeCounter(initialScore, 1);\nconsole.log(visit());\nconsole.log(visit());\nconsole.log(visit());";
const twoDesks = "const red = makeCounter(initialScore, 2);\nconst blue = makeCounter(0, 3);";
const deskCalls = twoDesks + "\nconsole.log(red());\nconsole.log(blue());\nconsole.log(red());\nconsole.log(blue());";
const visitorTap = { label: "visit() を呼ぶ", code: "console.log(visit());" };
const deskTaps = [
  { label: "red() を呼ぶ", code: "console.log(red());" },
  { label: "blue() を呼ぶ", code: "console.log(blue());" },
];

const javascriptCounterLessons = [
  {
    id: "js-return-action", topic: "関数を返す", title: "関数を返し、後から呼び出す",
    goal: "関数を渡す場合と、その場で動かして結果を渡す場合を区別する。",
    slides: [
      { title: "prepare() で関数を受け取る", body: "prepare() の return hello; は、関数 hello をそのまま返します。「announce() を呼ぶ」を押すと、その関数が実行され、コンソールに「ようこそ」と表示されます。",
        code: 'function hello() {\n  console.log("ようこそ");\n}\nfunction prepare() {\n  return hello;\n}\nconst announce = prepare();',
        actions: [{ label: "announce() を呼ぶ", code: "announce();" }] },
      { title: "hello と hello() の違い", body: "return hello(); と書くと、この行で hello を実行して、その結果を返します。この例では関数を返すため、return hello; と書き、受け取った後に announce() とします。", code: 'function hello() { return "開館"; }\nfunction prepare() { return hello; }\nconst announce = prepare();\nconsole.log(announce());' },
    ],
    quiz: { prompt: "後から自分で呼べる関数 hello を返す一行は？", options: ["return hello();", "return hello;", 'return "hello";', "console.log(hello());"], correct: 1,
      reasons: ["ここで実行した結果を返します。","関数を呼ばずに、その手順を渡します。","同じつづりの文字を返します。","関数の結果をその場で表示します。"] },
    exercise: { field: "javascript", task: "prepare が関数 desk を返すように直してください。確認用コードは戻り値を read で受け取り、read() を二度呼んで「受付中」を二行表示します。",
      code: 'function desk() { return "受付中"; }\nfunction prepare() { return desk(); }', answer: 'function desk() { return "受付中"; }\nfunction prepare() { return desk; }',
      calls: "const read = prepare();\nconsole.log(read());\nconsole.log(read());", callErrorHint: "read() を呼ぶには、prepare が関数 desk を返す必要があります。return の行の丸かっこを見直しましょう。",
      review: 1, hint: "return desk; とすると受け取る側が desk を呼べます。", build: { code: 'function desk() { return "受付中"; }\nfunction prepare() { return ①; }', slots: [["後で呼べる手順", "desk()", "desk"]] },
      expected: () => ["受付中","受付中"], hints: ["受け取った手順を呼ぶと「受付中」と返るようにしましょう。"] },
  },
  {
    id: "js-kept-name", topic: "外側の値を読む", title: "関数を作ったときの値を後から読む",
    goal: "makeDesk に渡した名前を、そこから返された関数の中で読み取る。",
    slides: [
      { title: "red() が「赤い受付」を返す理由", body: "makeDesk は受け取った name を使う関数を作って返します。red を後から呼ぶと、その関数を作ったときの「赤い受付」が返ります。外側の値を使い続けられるこの仕組みをクロージャと呼びます。", code: 'function makeDesk(name) {\n  return function () { return name; };\n}\nconst red = makeDesk("赤い受付");\nconsole.log(red());' },
      { title: "red() と blue() を呼び分ける", body: "makeDesk に「赤」を渡して red を、「青」を渡して blue を作ります。二つのボタンを好きな順に押して、red() はいつも「赤」、blue() はいつも「青」を返すことを確かめましょう。", code: 'function makeDesk(name) {\n  return function () { return name; };\n}\nconst red = makeDesk("赤");\nconst blue = makeDesk("青");', actions: [{ label: "red() を呼ぶ", code: "console.log(red());" }, { label: "blue() を呼ぶ", code: "console.log(blue());" }] },
    ],
    quiz: { prompt: 'const blue = makeDesk("青"); の後で blue() を呼ぶと、先ほどの見本では何が返る？', options: ["最後に画面に出た色", "赤", "青", "0"], correct: 2,
      reasons: ["画面の履歴を読み出す処理はありません。","「赤」は red を作るときに渡した値です。","blue の関数を作ったときの名前を読みます。","この例では文字を返しています。"] },
    exercise: { field: "javascript", task: "makeDesk が返す関数の中で name を読んでください。確認用コードが late()、day()、late() の順に呼ぶと、「夕方」「朝」「夕方」と表示されます。",
      code: 'function makeDesk(name) {\n  return function () { return "朝"; };\n}', answer: 'function makeDesk(name) {\n  return function () { return name; };\n}',
      calls: 'const day = makeDesk("朝");\nconst late = makeDesk("夕方");\nconsole.log(late());\nconsole.log(day());\nconsole.log(late());', review: 0, hint: "内側の関数から、外で受け取った name を使います。",
      build: { code: "function makeDesk(name) {\n  return function () { return ①; };\n}", slots: [["makeDesk が受け取った名前", '"朝"', "name"]] }, expected: () => ["夕方","朝","夕方"], hints: ["固定の文字を返すと、day() と late() が同じ値になります。受け取った name を返しましょう。"] },
  },
  {
    id: "js-counter", topic: "値を保持する関数", title: "呼ぶたびに得点を増やす",
    goal: "数える手順を一度作り、繰り返し呼んで前の得点に足す。",
    slides: [
      { title: "visit() を呼ぶたびに1を足す", body: "makeCounter(0, 1) は、0点から始めて1点ずつ増やす関数を返します。「visit() を呼ぶ」を二度押しましょう。一回目は1、二回目は前回の1に足して2が出ます。", code: counterFactory + "\nconst visit = makeCounter(0, 1);", actions: [visitorTap] },
      { title: "開始点が変わっても前回の続き", body: "開始点を選び、「visit() を呼ぶ」を二度押しましょう。開始点が5なら、一回目は6、二回目は7になります。", code: counterFactory + "\nconst visit = makeCounter(initialScore, 1);", actions: [visitorTap], variableStart: true },
    ],
    quiz: { prompt: "2点から始まり、visit() を呼ぶたびに1点増えます。二回目に返る点は？", options: ["2", "3", "1", "4"], correct: 3, reasons: ["ここから数え始めます。","一回目の結果です。","一回で増える分です。","最初に3、次にその3から4になります。"] },
    exercise: { field: "javascript", variableStart: true, task: "内側の関数で、今の score に step を足して score を更新し、その値を返してください。確認用コードが visit() を三回呼ぶと、開始点から1点ずつ増えます。", code: counterFactory.replace("score = score + step;", "score = step;"), answer: counterFactory, calls: threeVisits, review: 0,
      hint: "右側で今の score に step を足してから、左の score に戻します。", build: { code: counterFactory.replace("score = score + step;", "score = ① + ②;"), slots: [["前回から持っている値", "0", "score"], ["一回で増える点", "step", "start"]] },
      expected: start => [start+1,start+2,start+3], hints: ["初回は開始点に1を足した値です。決まった数だけを返さず、持っている score を使いましょう。","初回は合っています。二回目はその値からもう1点増やしましょう。","二回目もできました。三回目にも同じ状態を引き継ぎます。"],
      further: [["初期化を直す練習", "js-reset-counter"], ["二つのカウンターを使う", "js-two-counters"]] },
  },
  {
    id: "js-reset-counter", topic: "変数の初期化", title: "得点が毎回同じになる原因を直す",
    goal: "初期値を置く場所を選び、一回目だけ合うカウンターを直す。",
    slides: [
      { title: "二回目も1が返る理由", body: "「visit() を呼ぶ」を二度押すと、どちらも1が出ます。visit() の中に let score = start; があるため、呼ぶたびに score が0に戻ります。", code: resettingFactory + "\nconst visit = makeCounter(0, 1);", actions: [visitorTap] },
      { title: "初期値を置く行だけ外へ動かす", body: "let score = start; を返す関数の外に置くと、makeCounter を呼んだときだけ score が初期値になります。visit() はその値を増やして返すので、二度押すと1、2の順に表示されます。", code: counterFactory + "\nconst visit = makeCounter(0, 1);", actions: [visitorTap] },
    ],
    quiz: { prompt: "makeCounter を呼んだときだけ score を初期化するには、どこに書く？", options: ["makeCounter の中で、内側の関数を返す前", "内側の関数を呼ぶたび", "点を返した後", "表示の行の外側ならどこでも"], correct: 0, reasons: ["makeCounter を呼ぶと、この行を通ってから関数が返ります。","visit() を呼ぶたびに初期値に戻ります。","return でその関数の実行は終わります。","どの呼び出しで実行されるかが大切です。"] },
    exercise: { field: "javascript", variableStart: true, task: "visit() の二回目にも一回目と同じ点が出ています。let score = start; の位置を変え、呼ぶたびに前の得点から2点ずつ増えるようにしてください。",
      code: resettingFactory, answer: counterFactory, calls: threeVisits.replace("initialScore, 1","initialScore, 2"), review: 1,
      hint: "let score = start; は、return function の手前に一度だけ置きます。",
      build: { code: "function makeCounter(start, step) {\n  ①\n  return function () {\n    ②\n    return score;\n  };\n}", slots: [["makeCounter を呼ぶときの行", "let score = start;", "score += step;"], ["visit() を呼ぶたびに実行する行", "score += step;", "let score = start;"]] },
      expected: start => [start+2,start+4,start+6], hints: ["一回目は開始点から2増やします。","一回目は正解です。二回目が同じ点に戻っています。初期化する行を外の関数へ移しましょう。","次は三回目も前の値から2点加えましょう。"] },
  },
  {
    id: "js-two-counters", topic: "独立したカウンター", title: "二つのカウンターで別々に数える",
    goal: "開始点と増える点が異なる関数を二つ作り、それぞれの得点を更新する。",
    slides: [
      { title: "red() と blue() を交互に呼ぶ", body: "makeCounter を二度呼んで red と blue を作ります。red() は選んだ開始点から2点ずつ、blue() は0から3点ずつ増やします。開始点が2なら、red()、blue()、red() の順に呼ぶと4、3、6が出ます。", code: counterFactory + "\n" + twoDesks, variableStart: true, actions: deskTaps },
      { title: "blue = red とすると同じ関数を呼ぶ", body: "const blue = red; と書くと、どちらも同じ関数を指します。red() は2、その次の blue() は同じ score に2を足して4を返します。別々に数えるには makeCounter をもう一度呼びます。", code: counterFactory + "\nconst red = makeCounter(0, 2);\nconst blue = red;\nconsole.log(red());\nconsole.log(blue());" },
    ],
    quiz: { prompt: "red() は0から2ずつ、blue() は0から3ずつ数えます。red()、blue()、red() の順で返る数は？", options: ["2、5、7", "2、3、4", "2、3、2", "3、2、4"], correct: 1, reasons: ["blue() は0から始めるので、二番目の値は3です。","最後の red() は前回の2に2を足します。","二回目の red() にも前の点が残ります。","最初の red() は2を返します。"] },
    exercise: { field: "javascript", variableStart: true, task: "red() は開始点から2点ずつ増やします。blue も makeCounter で作り、0から3点ずつ増やしてください。確認用コードは red() と blue() を交互に二回ずつ呼びます。",
      code: counterFactory + "\nconst red = makeCounter(initialScore, 2);\nconst blue = red;", answer: counterFactory + "\n" + twoDesks, calls: deskCalls.slice(twoDesks.length + 1), review: 1,
      hint: "blue を作るときの引数は、開始点の0と一回に増やす点の3です。",
      build: { code: counterFactory + "\n" + twoDesks.replace("makeCounter(0, 3)", "makeCounter(①, ②)"), excerpt: twoDesks.replace("makeCounter(0, 3)", "makeCounter(①, ②)"), slots: [["blue の開始点", "0", "initialScore"], ["blue が一回に増やす点", "2", "3"]] },
      expected: start => [start+2,3,start+4,6], hints: ["red() は開始点から2点増やします。","最初の red() は正解です。blue にも makeCounter を使い、最初の blue() が3を返すようにしましょう。","blue() の得点は合っています。二度目の red() は前回の red() の値から数えます。","二度目の blue() は前回の3に3を足して6を返します。"] },
  },
];
