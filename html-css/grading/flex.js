"use strict";

function workRowProblem(doc) {
  const row = doc.querySelector(".row");
  const cards = row && [...row.children].filter((el) => el.localName === "article");
  if (!cards || cards.length < 3) return "同じ列の中に作品の article を三枚並べましょう。";
  const rowStyle = doc.defaultView.getComputedStyle(row);
  if (!["flex", "inline-flex"].includes(rowStyle.display) || Math.abs(row.clientWidth - 200) > 1)
    return "作品を囲む .row を幅200pxのFlexboxにしましょう。";
  if (rowStyle.flexWrap !== "wrap")
    return "親を選べました。入りきらない作品を次の行に送れるようにしましょう。";
  const [first, second, third] = cards.map((card) => card.getBoundingClientRect());
  if (Math.abs(first.width - 84) > 1 || Math.abs(second.width - 84) > 1 || !horizontal([first, second]) || !vertical([first, third]))
    return "折り返しはできました。作品の基準幅を84pxにして、最初の二枚を同じ行に置きましょう。";
  if (Math.abs(second.left - first.right - 8) > 1 || Math.abs(third.top - first.bottom - 8) > 1)
    return "二枚ずつ並びました。作品の横と次の行の両方に8pxのすき間を作りましょう。";
  return "";
}

const flexExerciseGraders = {
  "flex-parent"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const bar = doc.querySelector(".bar");
    if (!["flex", "inline-flex"].includes(style(bar).display))
      return "二枚を囲んでいる .bar に display: flex を付けましょう。";
    if (style(bar).flexDirection !== "column" || !vertical([...bar.children].map(el => el.getBoundingClientRect())))
      return "親は選べました。入口が上、展示室が下になるように並ぶ向きを縦にしましょう。";
    return "";
  },

  "along-axis"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const bar = doc.querySelector(".bar");
    const [first, last] = [...bar.children].map(el => el.getBoundingClientRect());
    const bounds = bar.getBoundingClientRect();
    if (!["flex", "inline-flex"].includes(style(bar).display) || !horizontal([first, last]) || Math.abs(bar.clientWidth - 180) > 1)
      return "幅180pxの親の中で、二枚を横一列に並べましょう。";
    if (Math.abs(first.left - bounds.left - bar.clientLeft) > 1 ||
        Math.abs(last.right - bounds.left - bar.clientLeft - bar.clientWidth) > 1)
      return "横並びはできました。余りを二枚の間に配り、両端にそろえましょう。";
    return "";
  },

  "across-axis"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const bar = doc.querySelector(".bar");
    const bounds = bar.getBoundingClientRect();
    const items = [...bar.children].map(el => el.getBoundingClientRect());
    if (!["flex", "inline-flex"].includes(style(bar).display) || bar.clientHeight !== 80 || !horizontal(items))
      return "高さ80pxの親をFlexboxにし、二枚を横に並べましょう。";
    if (items.some(item => item.height >= bar.clientHeight ||
        Math.abs(item.top + item.height / 2 - bounds.top - bounds.height / 2) > 1))
      return "横並びはできました。親に align-items を指定して、二枚の中心を上下の中央にそろえましょう。";
    return "";
  },

  "wrap-works"(docs) {
    const [doc] = docs;
    return workRowProblem(doc);
  },

  "flex-guide"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const nav = doc.querySelector("nav");
    const current = namedElement(nav, "a", "作品へ");
    const desk = namedElement(nav, "a", "受付へ");
    if (!current || !desk || current.hash !== "#works" || desk.hash !== "#desk" ||
        !doc.getElementById("works") || !doc.getElementById("desk"))
      return "案内の二つのリンクを作品と受付の見出しに結びましょう。";
    if (!["flex", "inline-flex"].includes(style(nav).display) ||
        !horizontal([current.getBoundingClientRect(), desk.getBoundingClientRect()]))
      return "案内リンクを囲む nav を横一列にしましょう。";
    if (current.getAttribute("aria-current") !== "location" || desk.hasAttribute("aria-current") ||
        Number(style(current).fontWeight) < 600 || Number(style(desk).fontWeight) >= 600)
      return "案内は横に並びました。「作品へ」だけが現在地と伝わり、太字になるようにしましょう。";
    if (!["空", "夜の小道", "窓辺"].every(name => namedElement(doc, ".row > article", name)))
      return "案内はできました。空と夜の小道に続けて、三枚目の「窓辺」を作品列に加えましょう。";
    return workRowProblem(doc);
  },
};
