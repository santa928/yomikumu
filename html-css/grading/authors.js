"use strict";

/** 色の見た目だけでなく変数との結び付きを確認し、ルートのインライン指定を必ず復元する。 */
function inkProblem(doc, names, outside) {
  const color = (element) => doc.defaultView.getComputedStyle(element).color;
  if (!names.every((name) => color(name) === "rgb(0, 128, 128)"))
    return "二人の名前を青緑色にするため、--ink を teal にして名前の色に使いましょう。";
  const previous = doc.documentElement.style.cssText;
  try {
    doc.documentElement.style.setProperty("--ink", "maroon", "important");
    if (!names.every((name) => color(name) === "rgb(128, 0, 0)"))
      return "今は二人とも青緑色です。--ink 一か所の変更が両方に届くように var(--ink) を使いましょう。";
    if (color(outside) !== "rgb(0, 0, 0)")
      return "作者名はできました。カードの外の案内文には色の指定がかからないようにしましょう。";
  } finally {
    doc.documentElement.style.cssText = previous;
  }
  return "";
}

function hasPickedLine(element) {
  const style = element.ownerDocument.defaultView.getComputedStyle(element);
  return style.borderLeftStyle === "solid" && style.borderLeftWidth === "4px" &&
    style.borderLeftColor !== "rgba(0, 0, 0, 0)";
}

const authorsExerciseGraders = {
  "bio-lines"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const bio = style(doc.querySelector(".bio"));
    if (bio.fontSize !== "16px") return "紹介文の文字は16pxのままにしてみましょう。";
    if (bio.lineHeight !== "24px") return "文字の大きさは合っています。次は一行分の高さを24pxにしましょう。";
    return "";
  },

  "name-colors"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const badge = style(doc.querySelector(".badge"));
    if (badge.backgroundColor !== "rgb(0, 0, 128)") return "案内係の名札に紺色の背景を付けましょう。";
    if (badge.color !== "rgb(255, 255, 255)") return "背景は紺色です。名札の文字を白にしましょう。";
    const outside = style(doc.querySelector("p:not(.badge)"));
    if (outside.color !== "rgb(0, 0, 0)" || outside.backgroundColor !== "rgba(0, 0, 0, 0)")
      return "名札は読めます。色の組が下の説明文に広がらないよう .badge だけを選びましょう。";
    return "";
  },

  "picked-mark"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    if (!hasPickedLine(doc.querySelector(".picked"))) return "選択中の名札の左に、見える4pxの実線を付けましょう。";
    if (style(doc.querySelector(".badge:not(.picked)")).borderLeftWidth !== "0px")
      return "選択中の線はできました。もう一人から線を外し、区別できるようにしましょう。";
    return "";
  },

  "shared-ink"(docs) {
    const [doc] = docs;
    return inkProblem(doc, [...doc.querySelectorAll(".name")], doc.querySelector("p"));
  },

  "author-pair"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const first = namedElement(doc, "article h2", "島サト");
    const second = namedElement(doc, "article h2", "浜ナオ");
    const card = second?.closest("article");
    const other = first?.closest("article");
    if (!other || !namedElement(other, "p", "豆本を作ります。"))
      return "島サトの名前と「豆本を作ります。」を同じ article に入れましょう。";
    if (!card || card === other || !namedElement(card, "p", "石を描きます。"))
      return "島サトのカードはできました。別の article に浜ナオの名前と紹介文を入れましょう。";
    if (!card.textContent.includes("選択中") || other.textContent.includes("選択中") ||
        !hasPickedLine(card) || style(other).borderLeftWidth !== "0px")
      return "二人の紹介はできました。浜ナオだけに「選択中」の文字と左4pxの実線を付けましょう。";
    const outside = namedElement(doc, "p", "受付は入口です。");
    if (!outside || outside.closest("article")) return "受付案内の段落を、二人のカードの外に残しましょう。";
    return inkProblem(doc, [first, second], outside);
  },
};
