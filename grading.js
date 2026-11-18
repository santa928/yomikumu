"use strict";

function rowsOfCards(doc, selector = ".shelf > article") {
  const cards = [...doc.querySelectorAll(selector)].slice(0, 2);
  return cards.map((card) => card.getBoundingClientRect());
}

function horizontal([first, second]) {
  if (!first || !second) return false;
  return (
    first.width > 0 &&
    second.width > 0 &&
    Math.abs(first.top - second.top) < 2 &&
    (first.right <= second.left + 1 || second.right <= first.left + 1)
  );
}

function vertical([first, second]) {
  return (
    first &&
    second &&
    first.height > 0 &&
    second.height > 0 &&
    (first.bottom <= second.top + 1 || second.bottom <= first.top + 1)
  );
}

function exerciseResult(id, docs) {
  const doc = docs[0];
  const style = (node) => doc.defaultView.getComputedStyle(node);
  switch (id) {
    case "structure": {
      const title = doc.querySelector("h1");
      if (title?.textContent.trim() !== "夜の図書室")
        return "まず「夜の図書室」をページの見出しにしましょう。";
      const matches = [...doc.querySelectorAll("p")].some(
        (p) =>
          p.textContent.trim() === "閉館前の十枚。" &&
          title.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING &&
          !title.contains(p),
      );
      if (!matches) return "ページ名はできました。見出しの外、その下に紹介文の段落を置きましょう。";
      break;
    }
    case "link": {
      const link = [...doc.querySelectorAll("a")].find(
        (a) => a.textContent.trim() === "作者ノートへ",
      );
      if (!link) return "「作者ノートへ」をリンクにするタグで囲みましょう。";
      const target = doc.getElementById(link.hash.slice(1));
      if (target?.textContent.trim() !== "作者ノート")
        return "リンクの文字はできました。href を行き先の id に結び付けましょう。";
      break;
    }
    case "class": {
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
      break;
    }
    case "card": {
      const cardStyle = style(doc.querySelector("article"));
      for (const edge of ["top", "right", "bottom", "left"]) {
        if (
          cardStyle.getPropertyValue("border-" + edge + "-style") !== "solid" ||
          cardStyle.getPropertyValue("border-" + edge + "-width") !== "2px"
        )
          return "作品全体を囲む四方の枠に、太さ2pxと実線を指定しましょう。";
      }
      break;
    }
    case "padding": {
      const s = style(doc.querySelector(".label"));
      const y = s.paddingTop === "8px" && s.paddingBottom === "8px";
      const x = s.paddingLeft === "16px" && s.paddingRight === "16px";
      if (y && !x) return "上下の8pxは合っています。次は左右を16pxにしましょう。";
      if (x && !y) return "左右の16pxは合っています。次は上下を8pxにしましょう。";
      if (!x || !y) return "枠の内側に、先に上下8px、次に左右16pxのすき間を指定しましょう。";
      break;
    }
    case "layout": {
      const cards = rowsOfCards(doc);
      if (!horizontal(cards)) return "まず、2枚が同じ行に並ぶように棚の配置を直しましょう。";
      const gap = Math.max(cards[1].left - cards[0].right, cards[0].left - cards[1].right);
      if (Math.abs(gap - 12) > 1) return "横並びはできました。カード同士の間を12px空けましょう。";
      break;
    }
    case "responsive":
      if (!vertical(rowsOfCards(doc)))
        return "狭い画面では1列にしましょう。2列の指定を書く場所を確認してください。";
      if (!horizontal(rowsOfCards(docs[1])))
        return "狭い画面はできました。広い画面で2列になるところを確かめましょう。";
      break;
  }
  return "";
}

function checkProject(docs) {
  const doc = docs[0];
  if (!doc.querySelector("h1")?.textContent.trim()) return "ページの名前を h1 で付けましょう。";
  const cards = [...doc.querySelectorAll("article")];
  if (cards.length < 2)
    return "ページ名はできました。二つの作品をそれぞれ article で囲みましょう。";
  for (const [i, card] of cards.entries()) {
    if (
      !card.querySelector("h2")?.textContent.trim() ||
      !card.querySelector("p")?.textContent.trim()
    )
      return i + 1 + "件目の作品には、作品名の h2 と紹介文の p の両方を用意しましょう。";
    const link = [...card.querySelectorAll("a[href]")].some((a) => {
      const target = doc.getElementById(a.hash.slice(1));
      return (
        a.textContent.trim() && target && !target.closest("article") && target.textContent.trim()
      );
    });
    if (!link)
      return i + 1 + "件目の作品から、このページの作者メモへ移動できるリンクを付けましょう。";
  }
  if (!vertical(rowsOfCards(doc, "article")))
    return "内容はそろいました。幅360pxで最初の2作品を縦に並べましょう。";
  if (!horizontal(rowsOfCards(docs[1], "article")))
    return "スマホ幅はできました。幅720pxで最初の2作品が横に並ぶようにしましょう。";
  if (docs.some((d) => d.documentElement.scrollWidth > d.defaultView.innerWidth + 1))
    return "配置はできました。横スクロールが起きないように、カードの幅を調整しましょう。";
  return "";
}
