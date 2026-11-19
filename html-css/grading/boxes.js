"use strict";

function edgeWidth(style, leftOrRight) {
  return parseFloat(style["padding" + leftOrRight]) + parseFloat(style["border" + leftOrRight + "Width"]);
}

function fillsLinkRow(parent) {
  const bounds = parent.getBoundingClientRect();
  const style = parent.ownerDocument.defaultView.getComputedStyle(parent);
  const anchor = parent.querySelector("a").getBoundingClientRect();
  const left = bounds.left + edgeWidth(style, "Left");
  const right = bounds.right - edgeWidth(style, "Right");
  return Math.abs(anchor.left - left) <= 1 && Math.abs(anchor.right - right) <= 1 && anchor.height > 0;
}

const boxesExerciseGraders = {
  "card"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const cardStyle = style(doc.querySelector("article"));
    for (const edge of ["top", "right", "bottom", "left"]) {
      if (
        cardStyle.getPropertyValue("border-" + edge + "-style") !== "solid" ||
        cardStyle.getPropertyValue("border-" + edge + "-width") !== "2px"
      )
        return "作品全体を囲む四方の枠に、太さ2pxと実線を指定しましょう。";
    }
    return "";
  },

  "padding"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const s = style(doc.querySelector(".label"));
    const y = s.paddingTop === "8px" && s.paddingBottom === "8px";
    const x = s.paddingLeft === "16px" && s.paddingRight === "16px";
    if (y && !x) return "上下の8pxは合っています。次は左右を16pxにしましょう。";
    if (x && !y) return "左右の16pxは合っています。次は上下を8pxにしましょう。";
    if (!x || !y) return "枠の内側に、先に上下8px、次に左右16pxのすき間を指定しましょう。";
    return "";
  },

  "outer-space"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const tags = [...doc.querySelectorAll(".tag")];
    if (!tags.every((tag) => ["Top", "Right", "Bottom", "Left"].every((side) =>
      style(tag)["padding" + side] === "6px" && style(tag)["border" + side + "Width"] === "2px")))
      return "文字から枠までの四方を6pxにして、2pxの枠を残しましょう。";
    const [first, second] = tags.map((tag) => tag.getBoundingClientRect());
    if (Math.abs(second.top - first.top) > 1 || Math.abs(second.left - first.right - 12) > 1)
      return "札の内側はできました。横に並んだ枠と枠の間を12px空けましょう。";
    return "";
  },

  "border-width"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const ticket = doc.querySelector(".ticket");
    const s = style(ticket);
    if (s.boxSizing !== "border-box" || Math.abs(ticket.getBoundingClientRect().width - 100) > 1)
      return "全幅100pxの中に枠と余白を含めるよう、width と box-sizing を組み合わせましょう。";
    if (!["Left", "Right"].every((side) => s["padding" + side] === "8px" && s["border" + side + "Width"] === "2px"))
      return "幅はできました。左右の余白を8px、枠を2pxに戻しましょう。";
    return "";
  },

  "link-area"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const desk = doc.querySelector(".desk");
    if (Math.abs(desk.clientWidth - 160) > 1 || !fillsLinkRow(desk))
      return "160pxの枠を保ち、その内側の右端までリンク自身が広がるようにしましょう。";
    const s = style(desk.querySelector("a"));
    if (s.paddingTop !== "6px" || s.paddingBottom !== "6px")
      return "横の押せる範囲はできました。リンクの内側を上下6pxずつ広げましょう。";
    return "";
  },

  "narrow-card"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const card = doc.querySelector(".piece");
    const s = style(card);
    if (card.getBoundingClientRect().right > doc.documentElement.clientWidth ||
        !["Left", "Right"].every((side) => s["padding" + side] === "8px" && s["border" + side + "Width"] === "1px"))
      return "左右の余白8pxと枠1pxを保ちながら、カードの右端まで画面に収めましょう。";
    const title = card.querySelector("h2");
    const range = doc.createRange();
    range.selectNodeContents(title);
    const lines = [...range.getClientRects()];
    const boundary = card.getBoundingClientRect().right - edgeWidth(s, "Right");
    if (!lines.length || !lines.every((line) => line.width > 0 && line.height > 0 && line.right <= boundary + 1) ||
        doc.documentElement.scrollWidth > doc.documentElement.clientWidth)
      return "カードの枠は収まりました。長い作品名を途中で折り返し、最後の文字まで収めましょう。";
    if (!fillsLinkRow(card)) return "作品名は収まりました。リンクの横の空きも押せるようにしましょう。";
    return "";
  },
};
