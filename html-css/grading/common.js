"use strict";

function rowsOfCards(doc, selector = ".shelf > article") {
  const cards = [...doc.querySelectorAll(selector)].slice(0, 2);
  return cards.map((card) => card.getBoundingClientRect());
}

/** 二枚の可視領域が同じ行で重ならないか、端数の誤差を許容して判定する。 */
function horizontal([first, second]) {
  if (!first || !second) return false;
  return (
    first.width > 0 &&
    second.width > 0 &&
    Math.abs(first.top - second.top) < 2 &&
    (first.right <= second.left + 1 || second.right <= first.left + 1)
  );
}

/** 二枚の可視領域が上下に重ならないか判定する。記述順ではなく表示位置を見る。 */
function vertical([first, second]) {
  return (
    first &&
    second &&
    first.height > 0 &&
    second.height > 0 &&
    (first.bottom <= second.top + 1 || second.bottom <= first.top + 1)
  );
}

function namedElement(parent, selector, text) {
  if (!parent) return null;
  return [...parent.querySelectorAll(selector)].find((node) => node.textContent.trim() === text);
}

function comesAfter(node, previous) {
  return Boolean(node && previous && !previous.contains(node) &&
    (previous.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING));
}

function listItems(list) {
  return [...list.children].filter((child) => child.localName === "li")
    .map((child) => child.textContent.trim());
}

/** 受付矢印の画像と代替テキストを、HTML課題とキーボード課題で同じ順に確認する。 */
function signProblem(parent) {
  const signs = [...parent.querySelectorAll("img")].filter((img) => img.src === contactArrow);
  if (!signs.length) return "受付の矢印を表示するため、img の src に arrow.png を指定しましょう。";
  if (!signs.some((img) => img.alt.trim().replace(/[。！]$/, "") === "受付は右です"))
    return "矢印は表示できました。alt に、画像の代わりに読める「受付は右です」を書きましょう。";
  return "";
}
