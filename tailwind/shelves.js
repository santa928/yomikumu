"use strict";

readingChapters.push({
  title: "幅で並びを変え、共通の色で読書棚を作る",
  intro: "二冊の紹介を開き、細い棚と広い棚で位置を比べましょう。最後に自分の二冊をパソコンでビルドして開きます。",
  sample: "shelf/index.html", widths: true
});
partLabels.theme = "テーマ";
partLabels.first = "一冊目のカード";
const river = "@theme { --color-river: #215348; }";
const plum = "@theme { --color-river: #613e57; }";
const dusk = "@theme { --color-dusk: #613e57; }";
const shelfSteps = [
  {
    id: "column", title: "狭い棚で二冊を上から読む",
    why: "幅が小さいとき、横並びでは紹介文の折り返しが増えます。flex は並べる仕組み。flex-col を足すと並ぶ方向が縦になります。",
    example: { part: "shelf", before: "flex", after: "flex flex-col" },
    result: "二冊目が一冊目の下に来ます。上から順に読めます。",
    prompt: "小さな棚では flex を使って二冊を縦一列にし、カード間を 0.5rem 空けてください。",
    fields: [{ part: "shelf", solution: "flex flex-col gap-2", options: ["gap-4", "flex", "flex-row", "gap-2", "flex-col"] }],
    checks: [
      { part: "shelf", properties: ["display", "flexDirection"], hint: "二冊を包む親を flex の縦並びにします。" },
      { part: "shelf", properties: ["rowGap"], hint: "二冊の間を 0.5rem 空けましょう。" }
    ],
    quiz: ["flex の棚に flex-col を足すと、二冊目はどこへ？", ["一冊目の上", "一冊目の下", "画面の右外", "同じ位置"], 1, "col は column、上から下に並ぶ方向です。"]
  },
  {
    id: "wide", title: "広いときだけ棚を横並びにする",
    why: "狭い棚の縦並びを残し、入る幅になったら横にします。flex-row は横並び。sm: は幅が 40rem（この設定で640px）以上の場合だけ後ろの指定を効かせる印です。",
    example: { part: "shelf", before: "flex flex-col", after: "flex flex-col sm:flex-row", width: 680 },
    result: "広い見本の二冊は横に移ります。「狭い幅」を押すと元の縦並びを確認できます。",
    prompt: "この棚は通常は縦一列にし、640pxに達したところから横一列に切り替えてください。",
    fields: [{ part: "shelf", solution: "flex flex-col sm:flex-row", options: ["sm:flex-col", "flex-col", "flex", "sm:flex-row", "flex-row"] }],
    checks: [
      { part: "shelf", width: 639, properties: ["display", "flexDirection"], hint: "639pxでは縦一列になるように、基本の向きを決めます。" },
      { part: "shelf", width: 640, properties: ["display", "flexDirection"], hint: "640pxになったら横一列になる条件を足します。" }
    ], widths: true,
    quiz: ["sm:flex-row を付けた棚を幅639pxで開くと？", ["条件付きの横並びになる", "すべて消える", "sm: の指定前の向きで並ぶ", "文字が大きくなる"], 2, "sm: が効き始めるのは、この設定では640pxからです。"]
  },
  {
    id: "name-color", title: "文庫の色に名前を付ける",
    why: "何枚もの紙に同じ色を使うときは、色を一か所で名付けます。@theme の中の --color-river は river という色の定義です。text-river で、その色を文字に呼び出せます。# で始まる六桁は色の番号です。",
    base: { card: "text-river", other: "text-river" },
    example: { part: "theme", before: river, after: plum },
    result: "定義一か所の変更で、同じ text-river を使った二冊とも緑からすもも色に変わります。",
    prompt: "すでに二冊とも text-river を使っています。river の文字色を #613e57 に定義してください。",
    fields: [{ part: "theme", solution: plum, options: [river, "@theme { --color-paper: #613e57; }", plum] }],
    checks: [{ part: "card", properties: ["color"], sharedColor: true, hint: "text-river が読む --color-river に #613e57 を付けます。" }],
    quiz: ["--color-river の色を文字に使う名前は？", ["river-text", "text-river", "bg-river", "p-river"], 1, "text- にテーマの色名を続けると文字に効きます。"]
  },
  {
    id: "reuse", title: "二冊に同じ名前の色を使う",
    why: "特集の色が変わったときに全冊へ届くよう、同じ名前を使い回します。ここでは --color-dusk に #613e57 を定義済みです。二冊目にも一冊目と同じ文字色のクラスを加えます。",
    base: { theme: dusk },
    example: { part: "other", before: "", after: "text-dusk", base: { card: "text-dusk" } },
    result: "二冊目にも同じすもも色が付き、次回はテーマ一か所で両方を変えられます。",
    prompt: "夜の選書の一冊目と二冊目に、定義済みの dusk を文字色として使ってください。",
    fields: [
      { part: "card", solution: "text-dusk", options: ["bg-dusk", "text-dusk", "text-black"] },
      { part: "other", solution: "text-dusk", options: ["text-black", "bg-dusk", "text-dusk"] }
    ],
    checks: [
      { part: "card", properties: ["color"], sharedColor: true, hint: "一冊目の文字に dusk を使います。" },
      { part: "other", properties: ["color"], sharedColor: true, hint: "二冊目の文字にも同じ dusk を使います。" }
    ],
    quiz: ["二冊の色を次回一か所から変えるには？", ["書名を同じにする", "ボタンを消す", "二冊に別々の色番号を直書き", "二冊とも同じテーマ色を使う"], 3, "共通の名前を使うと、その定義を変えたときに両方へ届きます。"]
  },
  {
    id: "local-shelf", title: "自分の読書棚をビルドして開く",
    why: "ブラウザに渡すのは完成したCSSです。CLI はコマンドで道具を動かす方法。ここではビルド（HTMLから必要なCSSを生成）を npm run build という名前でまとめています。最後に手元の index.html を開くと、ブラウザが隣の shelf.css を読みます。",
    example: { part: "shelf", before: "flex flex-col gap-4", after: "flex flex-col gap-4 sm:flex-row", width: 680, base: { card: "text-dusk", other: "text-dusk", theme: dusk } },
    result: "仕上がった棚が、640px以上で横に並びます。二冊の文字色は同じです。",
    prompt: "夕暮れ文庫の二冊を、640px未満は縦、640px以上は横にして、間を 1rem 空けます。#613e57 に名前を付けて両方の文字色に使ってください。PCでは続けてファイルを持ち帰り、手元で生成します。",
    fields: [
      { part: "shelf", solution: "flex flex-col gap-4 sm:flex-row", options: ["flex", "flex-col", "sm:flex-col", "gap-4", "sm:flex-row", "gap-2"] },
      { part: "theme", solution: dusk, options: ["@theme { --color-river: #215348; }", dusk] },
      { part: "card", solution: "text-dusk", options: ["text-dusk", "bg-dusk", "text-black"] },
      { part: "other", solution: "text-dusk", options: ["text-black", "text-dusk", "bg-dusk"] }
    ],
    checks: [
      { part: "shelf", width: 639, properties: ["display", "flexDirection"], hint: "狭い幅で二冊を縦に並べます。" },
      { part: "shelf", width: 640, properties: ["display", "flexDirection"], hint: "640pxから横並びにします。" },
      { part: "shelf", properties: ["rowGap", "columnGap"], hint: "カードの間隔を 1rem にします。" },
      { part: "card", properties: ["color"], sharedColor: true, hint: "一冊目の文字に #613e57 を名付けたテーマ色を使います。" },
      { part: "other", properties: ["color"], sharedColor: true, hint: "二冊目の文字に同じテーマ色を使います。" }
    ], widths: true, local: true,
    quiz: ["手元で index.html を開く前に CLI が生成するものは？", ["新しい読者名", "画像の原本", "使ったクラスを含む shelf.css", "会員アカウント"], 2, "HTML のクラスを読んで、必要な表示ルールを一つのCSSファイルに書き出します。"]
  }
];
readingUnits.push(...shelfSteps.map(unit => ({ ...unit, chapter: 1 })));
