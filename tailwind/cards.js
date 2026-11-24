"use strict";

const readingChapters = [{
  id: "style",
  title: "短いクラス名で余白・色・ボタンの見た目を変える",
  intro: "HTMLの class を変えて、カードの余白や文字の大きさを調整します。完成例では、押せる「しおりをはさむ」ボタンと、本が貸し出されていて押せないボタンの違いも確かめられます。",
  sample: "card.html"
}];
const partLabels = { card: "読書カード", shelf: "2枚のカードの親要素", action: "両方のボタン", other: "二冊目のカード" };
const readingUnits = [];

// 見本の一か所を操作した後、異なる原稿や寸法で同じ判断を試す。
function cardUnit(id, title, why, part, before, after, result, prompt, solution, properties, hint, options, quiz) {
  readingUnits.push({
    id, title, why, result, prompt, quiz, chapter: 0,
    example: { part, before, after },
    fields: [{ part, solution, options }],
    checks: [{ part, properties, hint }]
  });
}

cardUnit("padding", "カードの内側の余白を変える（padding）",
  "カードの端と文字の間を空けるには、内側の余白（padding）を指定します。手書きのCSSなら padding の値を変えます。TailwindならHTMLのクラス名を変え、対応するCSSのルールを使います。この教材の見本にある p-2 は 0.5rem、p-4 は 1rem です。",
  "card", "p-2", "p-4", "カードの端と文字の間の余白が広がります。",
  "「夜の庭」のカードの内側に、上下左右とも 0.5rem の余白を付けてください。1rem はこの見本では16pxです。", "p-2",
  ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"], "カードの四辺の内側を 0.5rem にしましょう。",
  ["p-4", "gap-2", "p-2", "m-2"],
  ["p-2 を p-4 にするとどこが広がる？", ["カードの端と文字の間", "二冊の間だけ", "文字の太さ", "一覧全体の幅"], 0, "padding はカードの内側の余白を指定します。"]);

cardUnit("width", "カードの幅を決める",
  "一行が長すぎるときはカードに幅を付けます。w は幅を表す width の略です。この教材の w-48 は 12rem、w-64 は 16rem です。",
  "card", "w-48", "w-64", "カードの幅が広がり、文章が折り返す位置が変わります。",
  "短い書名を載せるカードを幅 12rem にします。", "w-48", ["width"], "カードの幅を 12rem にします。",
  ["w-64", "p-4", "w-48", "text-lg"],
  ["w-64 を書く場所は？", ["本文の文字列", "外側の一覧", "幅を決めたいカードの class", "ボタンの文字"], 2, "幅を変える要素の class に書きます。"]);

cardUnit("type", "書名と文章の文字を大きくする",
  "小さな紹介文を読みやすくしたいときは文字サイズを変えます。text-base は基本の 1rem、text-lg は一段大きい 1.125rem です。カードに書くと中の文にも引き継がれます。",
  "card", "text-base", "text-lg", "書名と紹介文の文字が一緒に大きくなります。",
  "新刊メモの書名と本文を 1.125rem にします。", "text-lg", ["fontSize"], "カードの文字を 1.125rem にしましょう。",
  ["w-48", "text-lg", "p-2", "text-base"],
  ["text-lg が直接変えるのは？", ["背景の色", "本の種類", "カードの幅", "文字の大きさ"], 3, "text-lg は文字サイズを決める名前です。"]);

cardUnit("paper", "背景の色を選ぶ",
  "カードの背景色を指定するクラスは bg- で始まります。bg-white は白、bg-amber-100 は淡いこはく色です。色名の後ろの数字は同じ色の濃さを表します。",
  "card", "bg-white", "bg-amber-100", "カードの背景が淡いこはく色に変わります。文字色は同じです。",
  "特集の新刊カードの背景を Tailwind の amber-100 にしてください。", "bg-amber-100", ["backgroundColor"], "カードの背景に amber-100 を付けます。",
  ["text-lg", "bg-white", "bg-amber-100", "w-48"],
  ["bg-amber-100 にすると色が変わる場所は？", ["本文の文字", "カードの背景", "カードの外側の余白", "書名だけ"], 1, "bg- で始まるこのクラスは背景色を変えます。"]);

cardUnit("layout", "親の要素に flex を付けてカードを横に並べる",
  "カードを横一列にしたいときは、二冊を包む親要素に flex を付けます。親の中の二冊が左から並びます。",
  "shelf", "", "flex", "二冊目が一冊目の右に移ります。",
  "2枚のカードを横一列に並べてください。両方を囲む要素の class を編集します。", "flex", ["display", "flexDirection"], "親要素の class に flex を加えます。",
  ["p-2", "gap-2", "flex", "block"],
  ["横一列に置く flex はどこへ書く？", ["一冊目の書名", "二冊目のボタン", "2枚のカードの親要素", "本文だけ"], 2, "横に並べたいカードを囲む要素に付けます。"]);

cardUnit("gap", "カードの間だけを空ける",
  "カードの間隔は、2枚を並べる親要素の gap で調整できます。gap-2 は 0.5rem、gap-4 は 1rem の隙間です。複数のクラスは半角スペースで区切ります。",
  "shelf", "flex gap-2", "flex gap-4", "カードの内側の余白は同じまま、カードとカードの間隔が広がります。",
  "夜の選書を横に並べ、二冊の間を 0.5rem にしてください。", "flex gap-2", ["display", "columnGap"], "2枚を囲む要素で、カードの間隔を 0.5rem にします。",
  ["gap-4", "p-2", "flex", "gap-2"],
  ["カードの内側の余白は同じまま、カード同士の間隔が広がりました。変えた指定は？", ["文字サイズ", "gap", "背景色", "padding"], 1, "隣り合う子の間隔が gap です。"]);

readingUnits.at(-1).checks = [
  { part: "shelf", properties: ["display", "flexDirection"], hint: "二冊を横一列に並べます。" },
  { part: "shelf", properties: ["columnGap"], hint: "二冊の間だけを 0.5rem 空けます。" }
];

cardUnit("hover", "ポインタが乗ったときだけ線を引く",
  "押せる場所をマウスで探す人には、乗せた間だけ文字の下に線を出せます。underline は下線。先頭に hover: を足すと、ポインタが乗った間に限定できます。タッチ端末では下の状態見本でも違いを見られます。",
  "action", "underline", "hover:underline", "普段は線が消え、ボタンにポインタを乗せると現れます。",
  "夜の庭のボタンは、普段は線なし、ポインタが乗ったときだけ下線にします。", "hover:underline", ["textDecorationLine"], "下線をポインタが乗った間だけにします。",
  ["underline", "hover:underline", "p-2", "focus-visible:underline"],
  ["hover:underline の下線が出るときは？", ["貸出中だけ", "常に", "ページを開く前", "ポインタを乗せた間"], 3, "hover: がポインタを乗せている状態を指定します。"]);
readingUnits.at(-1).checks[0].state = "hover";

cardUnit("focus", "Tabで選んだ場所に枠を出す",
  "キーボードで次のボタンに移るには Tab を押します。focus-visible: は、Tab での移動など、ブラウザが今の操作位置を目印で示す必要があると判断したときに使う条件です。outline-2 は外側の輪郭を 2px にします。",
  "action", "focus-visible:outline-1", "focus-visible:outline-2", "Tabでボタンに進むと、文字の下でなくボタンの周囲に 2px の輪郭が見えます。",
  "夜の庭の操作場所に、Tab で選んだ場所が分かるように 2px の輪郭を付けます。", "focus-visible:outline-2", ["outlineWidth", "outlineStyle"], "キーボードで選んだ状態の輪郭を 2px にします。",
  ["outline-2", "hover:underline", "focus-visible:outline-1", "focus-visible:outline-2"],
  ["Tabで移動中の人に、今の操作場所を伝えるのは？", ["hover:", "gap-2", "focus-visible:", "bg-white"], 2, "focus-visible: でキーボード操作時の目印を付けます。"]);
readingUnits.at(-1).checks[0].state = "focus-visible";

cardUnit("disabled", "押せないボタンだけ見た目を変える",
  "例では、誰かが借りている本のボタンを押せないようにします。押せなくするのは HTML の disabled 属性です。disabled:opacity-50 はそのボタンだけを半透明にする指定です。見た目と一緒に「貸出中」という文字でも伝えます。",
  "action", "disabled:opacity-100", "disabled:opacity-50", "二冊目の貸出中ボタンだけが薄くなり、Tabでも選ばれません。",
  "夜の選書で貸出中のボタンだけを半透明にします。押せる方はそのままにしましょう。", "disabled:opacity-50", ["opacity"], "貸出中の状態だけを半透明にします。",
  ["opacity-50", "disabled:opacity-100", "disabled:opacity-50", "hover:underline"],
  ["押せない状態そのものを作るのは？", ["HTML の disabled 属性", "半透明の色", "gap", "文字の下線"], 0, "disabled 属性が操作を止め、disabled: から始まるクラスが見た目を決めます。"]);
readingUnits.at(-1).checks[0].state = "disabled";

readingUnits.push({
  id: "night-card", chapter: 0, title: "見本と同じカードをTailwind CSSで作る",
  why: "見本のカードはCSSで幅、余白、文字サイズ、背景色を指定しています。同じ見た目になるようにTailwind CSSのクラスを選びます。",
  example: { part: "card", before: "w-48 p-2 text-lg", after: "w-48 p-2 text-lg bg-amber-100" },
  result: "最後にカードの背景だけが淡いこはく色になります。",
  prompt: "見本と同じ読書カードを作ります。幅 12rem、内側 0.5rem、文字 1.125rem、背景 amber-100 の四つをカードに付けてください。",
  plain: true,
  fields: [{ part: "card", solution: "w-48 p-2 text-lg bg-amber-100", options: ["p-4", "w-48", "text-lg", "bg-white", "p-2", "bg-amber-100", "gap-2"] }],
  checks: [
    { part: "card", properties: ["width"], hint: "カードの幅を 12rem にします。" },
    { part: "card", properties: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"], hint: "四辺の内側を 0.5rem にします。" },
    { part: "card", properties: ["fontSize"], hint: "書名と本文の文字を 1.125rem にします。" },
    { part: "card", properties: ["backgroundColor"], hint: "カードの背景に amber-100 を使います。" }
  ],
  quiz: ["内側だけを変えたい。選ぶ組み合わせは？", ["親要素に gap-2", "カードに p-2", "カードに text-lg", "親要素に flex"], 1, "p-2 をカードに付けると、その内側に余白ができます。"]
});
