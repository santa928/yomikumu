"use strict";

const dynamicStatusClass = [
  "function statusClass(state) {",
  '  const tone = state === "available" ? "emerald" : "rose";',
  '  return `text-${tone}-700`;',
  "}",
].join("\n");

const mappedStatusClass = `function statusClass(state) {
  const colors = {
    available: "text-emerald-700",
    borrowed: "text-rose-700",
  };
  return colors[state];
}`;

const statusScript = dynamicStatusClass + `

const statusText = { available: "利用可", borrowed: "貸出中" };

for (const book of document.querySelectorAll("[data-book-state]")) {
  const label = book.querySelector("[data-status]");
  const button = book.querySelector("button");
  let state = book.dataset.bookState;
  function render() {
    label.textContent = statusText[state];
    label.className = statusClass(state);
    button.textContent = state === "available" ? "貸出中にする" : "利用可にする";
  }
  button.addEventListener("click", () => {
    state = state === "available" ? "borrowed" : "available";
    render();
  });
  render();
}
`;

const statusNames = ["利用可｜夜の庭", "貸出中｜星の小径"];
const statusButtonClasses = "focus-visible:outline-2 focus-visible:outline-offset-2";
const statusBookColors = { card: "text-emerald-700", other: "text-rose-700" };

readingUnits.push({
  id: "status-colors", chapter: 1, title: "生成されない状態の色を直す",
  why: "Tailwind CLIは、指定したファイルの文字列からクラス名を探します。見本の最初のコードは、JavaScriptが実行されたあとに text-emerald-700 を作ります。画面の要素にはその名前が入りますが、生成時のファイルに完成した名前がないため、CSSの色は出ません。利用可と貸出中に対応する完成した名前を、表にして書いてみます。",
  base: { shelf: "flex flex-col gap-4 sm:flex-row", action: statusButtonClasses },
  example: {
    part: "card", before: statusBookColors.card, after: statusBookColors.card, base: statusBookColors,
    source: [dynamicStatusClass, mappedStatusClass],
  },
  result: "クラス名は変更前と同じです。完成した名前からCSSが生成され、利用可と貸出中の文字色が分かれました。",
  prompt: "利用可には text-emerald-700、貸出中には text-rose-700 を対応させます。PCでは続けて、ZIP内の status.js を修正してTailwind CLIでCSSを生成します。",
  fields: [
    { part: "card", label: "利用可", solution: statusBookColors.card, options: ["text-rose-700", statusBookColors.card, "bg-emerald-700"] },
    { part: "other", label: "貸出中", solution: statusBookColors.other, options: [statusBookColors.other, "text-emerald-700", "bg-rose-700"] },
  ],
  checks: [
    { part: "card", properties: ["color"], hint: "利用可の文字色を text-emerald-700 で生成します。" },
    { part: "other", properties: ["color"], hint: "貸出中の文字色を text-rose-700 で生成します。" },
    { part: "shelf", width: 639, properties: ["display", "flexDirection"], hint: "639pxでは縦に並ぶように、既存の flex-col を残しましょう。" },
    { part: "shelf", width: 640, properties: ["display", "flexDirection"], hint: "640pxでは横に並ぶように、既存の sm:flex-row を残しましょう。" },
    { part: "action", state: "focus-visible", properties: ["outlineStyle", "outlineWidth", "outlineOffset"], hint: "Tabで移動したときの輪郭を出すため、既存の focus-visible: の指定を残しましょう。" },
  ],
  widths: true, local: "status", titles: statusNames,
  quiz: [
    "要素には text-emerald-700 が付いています。完成したCSSにこの色を含めるには、どこを直しますか。",
    ["完成したクラス名を状態ごとに書く", "クラス名をさらに細かく連結する", "同じCSSファイルを二度読む", "画面の幅だけを大きくする"],
    0, "CLIが読み取るファイルに、text-emerald-700 と text-rose-700 を文字列で書きます。",
  ],
});
