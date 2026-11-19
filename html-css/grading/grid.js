"use strict";

function gridMatches(grid, columns) {
  if (!grid || grid.children.length < columns + 1) return false;
  const style = grid.ownerDocument.defaultView.getComputedStyle(grid);
  if (!["grid", "inline-grid"].includes(style.display) || style.columnGap !== "8px" || style.rowGap !== "8px") return false;
  const cards = [...grid.children].map(card => card.getBoundingClientRect());
  const width = (grid.clientWidth - (columns - 1) * 8) / columns;
  return cards.every((card, i) => {
    const column = i % columns;
    const rowStart = cards[i - column];
    return Math.abs(card.width - width) <= 1 && Math.abs(card.top - rowStart.top) <= 1 &&
      Math.abs(card.left - cards[0].left - column * (width + 8)) <= 1 &&
      (i < columns || card.top > cards[i - columns].top);
  });
}

/**
 * widths: [236, 360]の順で、狭い一覧の二列と広い一覧の三列を確認する。
 * 列幅100pxの境界も同じDOMで調べ、採点後はインライン指定を必ず元へ戻す。
 */
function autoGridProblem(docs) {
  const [narrow236pxDoc, wide360pxDoc] = docs;
  if (!gridMatches(narrow236pxDoc.querySelector(".gallery"), 2))
    return "狭い幅で、間を8pxずつ空け、等幅の作品二枚が一行に入るようにしましょう。";
  if (!gridMatches(wide360pxDoc.querySelector(".gallery"), 3))
    return "狭い幅での配置は合っています。広い幅では三枚並ぶように、幅に応じて列数を変えましょう。";
  const grid = narrow236pxDoc.querySelector(".gallery");
  const previous = grid.style.cssText;
  try {
    grid.style.setProperty("width", "207px", "important");
    if (!gridMatches(grid, 1)) return "二つの画面幅はできました。100pxの二列と間8pxが入らない幅では一列にしましょう。";
    grid.style.setProperty("width", "208px", "important");
    if (!gridMatches(grid, 2)) return "一列の最小幅を100pxにし、幅208pxで二列に戻るようにしましょう。";
  } finally {
    grid.style.cssText = previous;
  }
  return docs.some((doc) => doc.documentElement.scrollWidth > doc.documentElement.clientWidth + 1)
    ? "列数はできました。作品を横にスクロールせずに読めるようにしましょう。" : "";
}

const gridExerciseGraders = {
  "layout"(docs) {
    const [doc] = docs;
    const cards = rowsOfCards(doc);
    if (!horizontal(cards)) return "まず、2枚が同じ行に並ぶようにカードを囲む親要素の配置を直しましょう。";
    const gap = Math.max(cards[1].left - cards[0].right, cards[0].left - cards[1].right);
    if (Math.abs(gap - 12) > 1) return "横並びはできました。カード同士の間を12px空けましょう。";
    return "";
  },

  "equal-tracks"(docs) {
    const [doc] = docs;
    if (!gridMatches(doc.querySelector(".gallery"), 3))
      return "親要素 .gallery に等幅の三列と間8pxを指定し、四枚目を二行目の先頭に置きましょう。";
    return "";
  },

  "fitting-tracks"(docs) {
    return autoGridProblem(docs);
  },

  "grid-lines"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const grid = doc.querySelector(".gallery");
    const [wide, left, right] = [...grid.children].map(card => card.getBoundingClientRect());
    if (style(grid).display !== "grid" || Math.abs(wide.width - grid.clientWidth) > 1)
      return "おすすめの一枚目に、一覧の左端の線から右端の線までを指定しましょう。";
    if (!horizontal([left, right]) || !vertical([wide, left]) || Math.abs(left.width - right.width) > 1)
      return "一枚目は広がりました。次の二枚はその下で同じ幅に並べましょう。";
    return "";
  },

  "grid-catalog"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const cards = [...doc.querySelectorAll(".gallery > article")];
    if (!["雨の栞", "青い本", "丸い窓", "星の紙"].every(name => cards.some(card => namedElement(card, "h3", name))))
      return ".gallery の中に四枚の article を置き、四枚目の見出しを「星の紙」にしましょう。";
    const layout = autoGridProblem(docs);
    if (layout) return layout;
    if (!doc.getElementById("notes") || !doc.getElementById("desk"))
      return "作品の配置は合っています。リンク先の作品メモと受付の見出しを残しましょう。";
    for (const card of cards) {
      const actions = card.querySelector(".actions");
      const note = namedElement(actions, "a", "メモ");
      const desk = namedElement(actions, "a", "受付");
      if (!note || !desk || note.hash !== "#notes" || desk.hash !== "#desk")
        return "一覧の列数は合っています。各作品の中に、メモと受付への二つのリンクをまとめましょう。";
      const links = [note, desk].map(a => a.getBoundingClientRect());
      if (!["flex", "inline-flex"].includes(style(actions).display) || !horizontal(links) || Math.abs(links[1].left - links[0].right - 6) > 1)
        return "作品の配置は合っています。内側の .actions にFlexboxを使い、二つのリンクを横に6px離しましょう。";
    }
    return "";
  },
};
