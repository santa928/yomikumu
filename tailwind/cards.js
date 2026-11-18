"use strict";

const readingChapters = [{
  title: "読書カードを短いクラス名で装飾する",
  intro: "CSSで文字や余白を指定した経験があれば始められます。川辺の本にしおりをはさみ、貸出中の本と比べましょう。",
  sample: "card.html"
}];
const partLabels = { card: "読書カード", shelf: "二冊を包む棚", action: "両方のボタン", other: "二冊目のカード" };
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

cardUnit("padding", "CSSの余白を短い名前で書く",
  "文字が紙の端に付いたときは padding を置きます。Tailwind では HTML の class に、その一つの指定を表す名前（ユーティリティ）を書けます。p-2 は四辺の内側を 0.5rem、p-4 は 1rem 空けます。",
  "card", "p-2", "p-4", "紙の色はそのまま、紙の縁から文字までが広がります。",
  "別の本「夜の庭」の紙の内側を四辺とも 0.5rem にしてください。1rem はこの見本では16pxです。", "p-2",
  ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"], "カードの四辺の内側を 0.5rem にしましょう。",
  ["p-4", "gap-2", "p-2", "m-2"],
  ["p-2 を p-4 にするとどこが広がる？", ["紙の縁と文字の間", "二冊の間だけ", "文字の太さ", "棚の横幅"], 0, "padding は色の付いた紙の内側を空けます。"]);

cardUnit("width", "カードの幅を決める",
  "一行が長すぎるときはカードに幅を付けます。w は width の印です。この教材の w-48 は 12rem、w-64 は 16rem です。",
  "card", "w-48", "w-64", "紙の右端が伸び、文章が折り返す位置が変わります。",
  "短い書名を載せるカードを幅 12rem にします。", "w-48", ["width"], "文字や余白ではなくカード自体の幅を 12rem にします。",
  ["w-64", "p-4", "w-48", "text-lg"],
  ["w-64 を書く場所は？", ["本文の文字列", "棚の外側", "幅を決めたいカードの class", "ボタンの題名"], 2, "幅を変える要素の class に書きます。"]);

cardUnit("type", "書名と文章の文字を大きくする",
  "小さな紹介文を読みやすくしたいときは文字サイズを変えます。text-base は基本の 1rem、text-lg は一段大きい 1.125rem です。カードに書くと中の文にも引き継がれます。",
  "card", "text-base", "text-lg", "書名と紹介文の文字が一緒に大きくなります。",
  "新刊メモの書名と本文を 1.125rem にします。", "text-lg", ["fontSize"], "カードの文字を 1.125rem にしましょう。",
  ["w-48", "text-lg", "p-2", "text-base"],
  ["text-lg が直接変えるのは？", ["背景の色", "本の種類", "紙の幅", "文字の大きさ"], 3, "text-lg は文字サイズを決める名前です。"]);

cardUnit("paper", "背景の色を選ぶ",
  "紙に色を敷くときは bg（background）を使います。bg-white は白、bg-amber-100 は淡いこはく色です。色名の後ろの数字は同じ色の濃さを表します。",
  "card", "bg-white", "bg-amber-100", "紙が淡いこはく色に変わります。文字色は同じです。",
  "特集の新刊カードの背景を Tailwind の amber-100 にしてください。", "bg-amber-100", ["backgroundColor"], "カードの背景に amber-100 を付けます。",
  ["text-lg", "bg-white", "bg-amber-100", "w-48"],
  ["bg-amber-100 にすると色が変わる場所は？", ["本文の文字", "紙の背景", "紙の外の余白", "書名だけ"], 1, "bg は要素の背景をぬります。"]);

cardUnit("layout", "二冊を横に並べる",
  "カードを横一列にしたいときは、二冊を包む親要素に flex を付けます。親の中の二冊が左から並びます。",
  "shelf", "", "flex", "二冊目が一冊目の右に移ります。",
  "今月の二冊を横一列に置いてください。棚の class を編集します。", "flex", ["display", "flexDirection"], "棚を flex の横一列にします。",
  ["p-2", "gap-2", "flex", "block"],
  ["横一列に置く flex はどこへ書く？", ["一冊目の書名", "二冊目のボタン", "二冊を包む棚", "本文だけ"], 2, "並ぶ子どもたちをまとめている親に付けます。"]);

cardUnit("gap", "カードの間だけを空ける",
  "紙の内側を保って二冊を離すには、並べる親に gap を付けます。gap-2 は 0.5rem、gap-4 は 1rem の隙間です。複数のクラスは半角スペースで区切ります。",
  "shelf", "flex gap-2", "flex gap-4", "紙の中の文字は動かず、二冊の間が広がります。",
  "夜の選書を横に並べ、二冊の間を 0.5rem にしてください。", "flex gap-2", ["display", "columnGap"], "横並びの棚で、カード間だけを 0.5rem 空けます。",
  ["gap-4", "p-2", "flex", "gap-2"],
  ["紙の内側は同じまま二冊が離れた。変えたのは？", ["文字サイズ", "gap", "背景色", "padding"], 1, "隣り合う子の間隔が gap です。"]);

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
  "キーボードで次のボタンに移るには Tab を押します。focus-visible: はキーボードで選んだ場所に目印を出すための条件です。outline-2 は外側の輪郭を 2px にします。",
  "action", "focus-visible:outline-1", "focus-visible:outline-2", "Tabでボタンに進むと、文字の下でなくボタンの周囲に 2px の輪郭が見えます。",
  "夜の庭の操作場所に、キーボードで選んだときだけ 2px の輪郭を付けます。", "focus-visible:outline-2", ["outlineWidth", "outlineStyle"], "キーボードで選んだ状態の輪郭を 2px にします。",
  ["outline-2", "hover:underline", "focus-visible:outline-1", "focus-visible:outline-2"],
  ["Tabで移動中の人に、今の操作場所を伝えるのは？", ["hover:", "gap-2", "focus-visible:", "bg-white"], 2, "focus-visible: でキーボード操作時の目印を付けます。"]);
readingUnits.at(-1).checks[0].state = "focus-visible";

cardUnit("disabled", "貸出中のボタンを見分ける",
  "貸出中は HTML の disabled 属性で押せなくします。disabled:opacity-50 はそのボタンだけを半透明にする指定です。見た目と一緒に「貸出中」という文字でも伝えます。",
  "action", "disabled:opacity-100", "disabled:opacity-50", "二冊目の貸出中ボタンだけが薄くなり、Tabでも選ばれません。",
  "夜の選書で貸出中のボタンだけを半透明にします。押せる方はそのままにしましょう。", "disabled:opacity-50", ["opacity"], "貸出中の状態だけを半透明にします。",
  ["opacity-50", "disabled:opacity-100", "disabled:opacity-50", "hover:underline"],
  ["押せない状態そのものを作るのは？", ["HTML の disabled 属性", "半透明の色", "gap", "文字の下線"], 0, "disabled 属性が操作を止め、disabled: から始まるクラスが見た目を決めます。"]);
readingUnits.at(-1).checks[0].state = "disabled";

readingUnits.push({
  id: "night-card", chapter: 0, title: "別の原稿を同じ見た目に移す",
  why: "お手本は普通のCSSで仕上げた夜の選書です。内側・幅・文字・背景を一つずつ読み取り、同じ寸法と色に移します。",
  example: { part: "card", before: "w-48 p-2 text-lg", after: "w-48 p-2 text-lg bg-amber-100" },
  result: "最後に紙の背景だけが淡いこはく色になります。",
  prompt: "素のCSSの見本と同じ読書カードにします。幅 12rem、内側 0.5rem、文字 1.125rem、背景 amber-100 の四つをカードに付けてください。",
  plain: true,
  fields: [{ part: "card", solution: "w-48 p-2 text-lg bg-amber-100", options: ["p-4", "w-48", "text-lg", "bg-white", "p-2", "bg-amber-100", "gap-2"] }],
  checks: [
    { part: "card", properties: ["width"], hint: "カードの幅を 12rem にします。" },
    { part: "card", properties: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"], hint: "四辺の内側を 0.5rem にします。" },
    { part: "card", properties: ["fontSize"], hint: "書名と本文の文字を 1.125rem にします。" },
    { part: "card", properties: ["backgroundColor"], hint: "紙の背景に amber-100 を使います。" }
  ],
  quiz: ["内側だけを変えたい。選ぶ組み合わせは？", ["棚に gap-2", "カードに p-2", "カードに text-lg", "棚に flex"], 1, "紙の背景と文字の間を空ける p を、紙にあたるカードに付けます。"]
});
