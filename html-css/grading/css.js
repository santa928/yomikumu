"use strict";

/** 継承・相対単位の応答を調べるため親の文字サイズだけを一時変更し、必ず復元する。 */
function sizeAfter(element, parent, value) {
  const original = parent.style.cssText;
  try {
    parent.style.setProperty("font-size", value, "important");
    return element.ownerDocument.defaultView.getComputedStyle(element).fontSize;
  } finally {
    parent.style.cssText = original;
  }
}

const cssExerciseGraders = {
  "class"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const title = style(doc.querySelector(".title"));
    if (title.color !== "rgb(0, 0, 128)") return "まず、作品名の文字だけを navy にしてください。";
    if (title.fontSize !== "24px")
      return "作品名の色は合っています。同じ作品名の大きさも24pxにしましょう。";
    const paragraph = style(doc.querySelector("p:not(.title)"));
    if (
      paragraph.color !== style(doc.body).color ||
      paragraph.fontSize !== "16px" ||
      paragraph.color === title.color
    )
      return "作品名はできました。下の紹介文まで変わっていないか確認しましょう。";
    return "";
  },

  "linked-css"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const author = namedElement(doc, ".author", "青木ミナ");
    if (!doc.querySelector('link[rel~="stylesheet"]')?.sheet)
      return "別のCSSを読む link に rel=\"stylesheet\" を付け、href に ink.css を指定しましょう。";
    if (!author || style(author).color !== "rgb(0, 0, 128)")
      return "ファイルは読めました。作者名に author というクラスを残しましょう。";
    const other = namedElement(doc, "p", "紙の小さな展示です。");
    if (!other || style(other).color !== style(doc.body).color)
      return "作者名はできました。紹介文は元の色で残しましょう。";
    return "";
  },

  "rule-order"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const rules = [...doc.querySelector("style").sheet.cssRules]
      .filter((rule) => rule.selectorText === ".author" && rule.style.color);
    if (rules.length !== 2 || !["navy", "rgb(0, 0, 128)"].includes(rules[0].style.color) ||
        !["green", "rgb(0, 128, 0)"].includes(rules[1].style.color))
      return "同じ .author の色を決める二行を残し、紺色を先に、緑色を後に置きましょう。";
    if (style(doc.querySelector(".author")).color !== "rgb(0, 128, 0)" ||
        style(doc.querySelector("p:not(.author)")).color !== style(doc.body).color)
      return "順番はできました。作者名だけが緑になるように、ほかの指定も確かめましょう。";
    return "";
  },

  "specific-rule"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    if (style(doc.querySelector(".author")).color !== "rgb(0, 0, 128)")
      return "作者名の段落だけを選び、色を紺色にしましょう。";
    if (style(doc.querySelector("p:not(.author)")).color !== "rgb(0, 128, 0)")
      return "作者名はできました。紹介文には p の緑色の指定を残しましょう。";
    return "";
  },

  "inherited-size"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const wall = doc.querySelector(".wall");
    const credit = doc.querySelector(".credit");
    if (style(wall).fontSize !== "22px") return "まず、撮影者を囲む .wall の文字サイズを22pxにしましょう。";
    if (style(credit).fontSize !== "22px" || sizeAfter(credit, wall, "26px") !== "26px")
      return "囲みはできました。撮影者の文字サイズが、外側の値をそのまま引き継ぐようにしましょう。";
    const outside = doc.querySelector("body > p");
    if (style(outside).fontSize !== sizeAfter(outside, outside, "medium"))
      return "撮影者はできました。囲みの外にある会場の案内は元のサイズを保ちましょう。";
    return "";
  },

  "root-size"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const root = doc.documentElement;
    const credit = doc.querySelector(".credit");
    if (style(root).fontSize !== "20px") return "ページの基準となる html の文字サイズを20pxにしましょう。";
    if (style(credit).fontSize !== "30px") return "基準はできました。撮影者の文字を20pxの1.5倍にしましょう。";
    if (sizeAfter(credit, root, "24px") !== "36px" || sizeAfter(credit, credit.parentElement, "28px") !== "30px")
      return "今の表示は30pxです。ページの基準を変えたときも1.5倍を保てるように rem で指定しましょう。";
    return "";
  },
};
