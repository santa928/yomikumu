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

function museumAnchorIn(parent) {
  return [...parent.querySelectorAll("a")].some((a) =>
    a.href === museumLinks[1] && a.textContent.trim() === "国立科学博物館");
}

function signProblem(parent) {
  const signs = [...parent.querySelectorAll("img")].filter((img) => img.src === contactArrow);
  if (!signs.length) return "受付の矢印を表示するため、img の src に arrow.png を指定しましょう。";
  if (!signs.some((img) => img.alt.trim().replace(/[。！]$/, "") === "受付は右です"))
    return "矢印は表示できました。alt に、画像の代わりに読める「受付は右です」を書きましょう。";
  return "";
}

function memoInputIn(parent) {
  const label = namedElement(parent, "label", "見学メモ");
  const input = label?.control;
  return input && parent.contains(input) && input.localName === "input" && input.type === "text" ? input : null;
}

function memoResetProblem(parent) {
  const input = memoInputIn(parent);
  if (!input) return "「見学メモ」というラベルをテキスト入力欄と結び、文字を押して入力できるようにしましょう。";
  if (!input.form || !parent.contains(input.form))
    return "欄とラベルは結べました。入力欄とボタンを同じ form で囲みましょう。";
  if (input.defaultValue !== "") return "リセットしたとき空欄に戻るように、入力欄の初期値を空にしましょう。";
  const reset = [...input.form.querySelectorAll("button")].some((b) =>
    b.type === "reset" && b.textContent.trim() === "メモを消す");
  return reset ? "" : "入力欄はできました。『メモを消す』というボタンを同じ form に置き、type を reset にしましょう。";
}

function sizeAfter(element, parent, value) {
  const original = parent.style.cssText;
  try {
    parent.style.setProperty("font-size", value, "important");
    return element.ownerDocument.defaultView.getComputedStyle(element).fontSize;
  } finally {
    parent.style.cssText = original;
  }
}

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

function autoGridProblem(docs) {
  if (!gridMatches(docs[0].querySelector(".gallery"), 2))
    return "狭い棚で、間を8pxずつ空け、等幅の作品二枚が一行に入るようにしましょう。";
  if (!gridMatches(docs[1].querySelector(".gallery"), 3))
    return "狭い棚はできました。広い棚に三枚入るよう、列数を入る本数に合わせましょう。";
  const grid = docs[0].querySelector(".gallery");
  const previous = grid.style.cssText;
  try {
    grid.style.setProperty("width", "207px", "important");
    if (!gridMatches(grid, 1)) return "二つの画面幅はできました。100pxの二列と間8pxが入らない棚では一列にしましょう。";
    grid.style.setProperty("width", "208px", "important");
    if (!gridMatches(grid, 2)) return "一列の最小幅を100pxにし、幅208pxで二列に戻るようにしましょう。";
  } finally {
    grid.style.cssText = previous;
  }
  return docs.some((doc) => doc.documentElement.scrollWidth > doc.documentElement.clientWidth + 1)
    ? "列数はできました。作品を横にスクロールせずに読めるようにしましょう。" : "";
}

function centeredReadingArea(doc) {
  const page = doc.querySelector(".page");
  const rect = page.getBoundingClientRect();
  const available = doc.body.clientWidth;
  const expected = Math.min(560, available);
  return Math.abs(rect.width - expected) <= 1 &&
    Math.abs(rect.left - (doc.documentElement.clientWidth - expected) / 2) <= 1;
}

function balancedPair(doc) {
  const rects = rowsOfCards(doc, ".prints > article");
  return horizontal(rects) && Math.abs(rects[0].width - rects[1].width) <= 1;
}

function tabSequence(scope) {
  return [...scope.querySelectorAll("a[href], input, button, [tabindex]")].filter(el =>
    el.tabIndex >= 0 && !el.disabled && el.getClientRects().length && el.ownerDocument.defaultView.getComputedStyle(el).visibility === "visible")
    .sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity));
}

function linkRoute(scope, expected) {
  const links = tabSequence(scope);
  return expected.every(([text, hash], i) => {
    const link = links[i];
    return link?.localName === "a" && link.textContent.trim() === text && link.hash === hash &&
      (!link.hasAttribute("aria-label") || link.getAttribute("aria-label") === text) &&
      scope.getElementById(hash.slice(1));
  });
}

function visitMemoProblem(doc) {
  const label = namedElement(doc, "label", "訪問メモ");
  const field = label?.control;
  return !field || field.localName !== "input" || field.type !== "text" || field.disabled || field.readOnly ||
    (field.hasAttribute("aria-label") && field.getAttribute("aria-label") !== "訪問メモ")
    ? "受付リンクはできました。「訪問メモ」のラベルを押すと入力できるように欄と結びましょう。" : "";
}

function withFocusedSample(el, read) {
  const doc = el.ownerDocument;
  const previous = document.activeElement;
  const inner = doc.activeElement;
  try {
    el.focus({ preventScroll: true, focusVisible: true });
    return read();
  } finally {
    el.blur();
    if (previous === doc.defaultView.frameElement && inner !== doc.body) inner.focus({ preventScroll: true });
    else previous?.focus({ preventScroll: true });
  }
}

function hasNavyOutline(el) {
  const style = el.ownerDocument.defaultView.getComputedStyle(el);
  return style.outlineStyle === "solid" && style.outlineWidth === "3px" &&
    style.outlineOffset === "2px" && style.outlineColor === "rgb(0, 0, 128)";
}

function quietCueProblem(doc) {
  const cue = doc.querySelector("a.cue");
  if (!cue) return "作品へ進むリンクに cue のクラスを残しましょう。";
  return withFocusedSample(cue, () => {
    for (const reduce of [true, false]) {
      const restore = previewMotionSetting(doc, reduce);
      try {
        const transform = doc.defaultView.getComputedStyle(cue).transform;
        const matrix = transform === "none" ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(transform);
        if (reduce && !matrix.isIdentity) return "動きを減らす設定のときは、操作先の位置を動かさずに保ちましょう。";
        if (!reduce && (Math.abs(matrix.m41 - 8) > 0.1 || Math.abs(matrix.m42) > 0.1))
          return "減らす設定はできました。通常の設定では作品リンクが右へ8px移る例を残しましょう。";
        if (!hasNavyOutline(cue)) return "位置はできました。どちらの設定でも操作先の紺色の枠を残しましょう。";
      } finally { restore(); }
    }
    return "";
  });
}

function profileEntryProblem(doc) {
  const header = doc.querySelector("header");
  if (!namedElement(header, "h1", "栞を刷る小野") || !namedElement(header, "p", "古い紙に版画を刷っています。"))
    return "入口の header に、原稿の作者名を h1 で、一行紹介を p で置きましょう。";
  const link = namedElement(header, "a", "作品を見る");
  const target = link?.hash && doc.getElementById(link.hash.slice(1));
  if (!target || target.localName !== "h2" || target.textContent.trim() !== "作品")
    return "作者は分かりました。「作品を見る」から、作品の見出しへ進めるようにしましょう。";
  return "";
}

function profileBodyProblem(doc) {
  const sectionFor = label => namedElement(doc, "section h2", label)?.closest("section");
  if (!namedElement(sectionFor("自己紹介"), "p", "図書室で冊子を作っています。"))
    return "自己紹介の章に、図書室で冊子を作っていることを書きましょう。";
  const skills = sectionFor("得意なこと")?.querySelector("ul");
  if (!skills || !["二色刷り", "手製本"].every(skill => listItems(skills).includes(skill)))
    return "得意なことの一覧に、二色刷りと手製本を一項目ずつ入れましょう。";
  const works = sectionFor("作品");
  for (const [title, caption] of [["窓の栞", "朝の光を青で刷りました。"], ["水辺の本", "池の形を一冊に綴じました。"]]) {
    const card = namedElement(works, "article h3", title)?.closest("article");
    if (!namedElement(card, "p", caption)) return title + "の作品名と原稿の説明を、同じ article に入れましょう。";
  }
  return "";
}

function exerciseResult(id, docs) {
  const doc = docs[0];
  const style = (node) => doc.defaultView.getComputedStyle(node);
  switch (id) {
    case "first-edit":
      if (doc.querySelector("h1")?.textContent.trim() !== "雨の港")
        return "HTML欄の <h1> と </h1> の間に「雨の港」を入れてみましょう。";
      break;
    case "structure": {
      const title = doc.querySelector("h1");
      if (title?.querySelector("p"))
        return "紹介文まで見出しの内側に入っています。作品名の直後で </h1> を閉じてみましょう。";
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
    case "word-language": {
      const name = [...doc.querySelectorAll("p")].find((p) => p.textContent.trim() === "Blue Harbor");
      if (!name) return "作品名の段落には「Blue Harbor」をそのまま残しましょう。";
      if (!/^en(?:-|$)/i.test(name.closest("[lang]")?.lang || ""))
        return '作品名はできました。英語の段落に lang="en" を付けましょう。';
      break;
    }
    case "page-names":
      if (doc.title !== "夜の作品集")
        return "タブに表示したい「夜の作品集」を、title の開始タグと終了タグの間に書きましょう。";
      if (doc.querySelector("h1")?.textContent.trim() !== "星の切符")
        return "タブの名前はできました。本文の h1 の内側を「星の切符」にしましょう。";
      break;
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
    case "heading-levels": {
      const heading = namedElement(doc, "h1", "小さな版画展");
      if (!heading) return "展示全体の名前「小さな版画展」を h1 にしましょう。";
      const chapter = namedElement(doc, "h2", "体験会");
      if (!comesAfter(chapter, heading)) return "展示名の下に、章の見出し「体験会」を h2 で置きましょう。";
      if (!comesAfter(namedElement(doc, "h3", "午前の部"), chapter))
        return "章はできました。その後に、章の中の「午前の部」を一段下の見出しにしましょう。";
      break;
    }
    case "material-list": {
      if (!namedElement(doc, "p", "受付で使います。"))
        return "「受付で使います。」は説明の文です。一つの段落にしましょう。";
      const lists = [...doc.querySelectorAll("ul")].map(listItems);
      const withTicket = lists.filter((items) => items.includes("入場券"));
      if (!withTicket.length) return "順番が自由な持ち物を ul で囲み、中の一つの li に「入場券」を置きましょう。";
      if (!withTicket.some((items) => items.includes("手帳")))
        return "入場券はできました。同じ ul の中で、手帳を別の li にしましょう。";
      break;
    }
    case "making-steps": {
      const ordered = [...doc.querySelectorAll("ol")].map(listItems);
      if (!ordered.some((items) => items.includes("切る")))
        return "まず外側を ol にして、最初の作業「切る」を li で囲みましょう。";
      if (!ordered.some((items) => {
        const cut = items.indexOf("切る");
        const punch = items.indexOf("穴をあける", cut + 1);
        return cut >= 0 && punch > cut && items.indexOf("結ぶ", punch + 1) > punch;
      })) return "番号付きのリストはできました。同じ ol の中で「切る」「穴をあける」「結ぶ」を一行ずつ、この順に並べましょう。";
      break;
    }
    case "page-regions": {
      const head = namedElement(doc, "header h1", "窓辺の作品展")?.closest("header");
      if (!head) return "まず展示名を h1 にして、ページの入口となる header で囲みましょう。";
      const heading = namedElement(doc, "main h2", "展示内容");
      const main = heading?.closest("main");
      if (!comesAfter(main, head) || doc.querySelectorAll("main").length !== 1)
        return "入口はできました。header を閉じ、その後に一つの main を置き、「展示内容」の小見出しを入れましょう。";
      if (!comesAfter(namedElement(main, "p", "木版画を二枚展示します。"), heading))
        return "本文の見出しはできました。同じ main の中で、見出しの下に説明の段落を置きましょう。";
      const foot = namedElement(doc, "footer p", "問い合わせは図書室へ。")?.closest("footer");
      if (!comesAfter(foot, main)) return "本文はできました。main を閉じ、その後の footer に問い合わせの段落を置きましょう。";
      break;
    }
    case "work-section": {
      const topic = namedElement(doc, "section h2", "木の作品");
      if (!topic) return "まず「木の作品」の見出しを含む章を section で囲みましょう。";
      const section = topic.closest("section");
      const title = namedElement(section, "article h3", "小さな舟");
      const work = title?.closest("article");
      if (!comesAfter(work, topic) || !comesAfter(namedElement(work, "p", "枝を削りました。"), title))
        return "章はできました。章の見出しの後で、作品名と紹介文を同じ article に入れましょう。";
      break;
    }
    case "word-emphasis": {
      const caution = namedElement(doc, "p", "足元にご注意ください。");
      if (!namedElement(caution, "strong", "足元にご注意"))
        return "最初の文を一段落に保ち、その中の「足元にご注意」だけを strong で囲みましょう。";
      const next = namedElement(doc, "p", "原画は今日だけです。");
      if (!comesAfter(next, caution) || !namedElement(next, "em", "今日"))
        return "大切な注意はできました。次の段落の中で、ほかの日と区別したい「今日」だけを em で囲みましょう。";
      break;
    }
    case "museum-link":
      if (!museumAnchorIn(doc))
        return "リンクの文字は「国立科学博物館」にして、href の中を公式サイトのURLにしましょう。";
      break;
    case "sign-image":
      return signProblem(doc);
    case "field-name":
      if (!memoInputIn(doc))
        return "「見学メモ」を囲む label の for と、入力する欄の id を同じ名前にしましょう。";
      break;
    case "clear-form":
      return memoResetProblem(doc);
    case "contact-card": {
      const card = namedElement(doc, "article h2", "森の展示窓口")?.closest("article");
      if (!card) return "まず「森の展示窓口」の見出しを article に入れましょう。";
      const sign = signProblem(card);
      if (sign) return sign;
      if (!museumAnchorIn(card))
        return "受付の案内はできました。カードの中に国立科学博物館の公式サイトへのリンクを入れましょう。";
      return memoResetProblem(card);
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
    case "linked-css": {
      const author = namedElement(doc, ".author", "青木ミナ");
      if (!doc.querySelector('link[rel~="stylesheet"]')?.sheet)
        return "別のCSSを読む link に rel=\"stylesheet\" を付け、href に ink.css を指定しましょう。";
      if (!author || style(author).color !== "rgb(0, 0, 128)")
        return "ファイルは読めました。作者名に author というクラスを残しましょう。";
      const other = namedElement(doc, "p", "紙の小さな展示です。");
      if (!other || style(other).color !== style(doc.body).color)
        return "作者名はできました。紹介文は元の色で残しましょう。";
      break;
    }
    case "rule-order": {
      const rules = [...doc.querySelector("style").sheet.cssRules]
        .filter((rule) => rule.selectorText === ".author" && rule.style.color);
      if (rules.length !== 2 || !["navy", "rgb(0, 0, 128)"].includes(rules[0].style.color) ||
          !["green", "rgb(0, 128, 0)"].includes(rules[1].style.color))
        return "同じ .author の色を決める二行を残し、紺色を先に、緑色を後に置きましょう。";
      if (style(doc.querySelector(".author")).color !== "rgb(0, 128, 0)" ||
          style(doc.querySelector("p:not(.author)")).color !== style(doc.body).color)
        return "順番はできました。作者名だけが緑になるように、ほかの指定も確かめましょう。";
      break;
    }
    case "specific-rule":
      if (style(doc.querySelector(".author")).color !== "rgb(0, 0, 128)")
        return "作者名の段落だけを選び、色を紺色にしましょう。";
      if (style(doc.querySelector("p:not(.author)")).color !== "rgb(0, 128, 0)")
        return "作者名はできました。紹介文には p の緑色の指定を残しましょう。";
      break;
    case "inherited-size": {
      const wall = doc.querySelector(".wall");
      const credit = doc.querySelector(".credit");
      if (style(wall).fontSize !== "22px") return "まず、撮影者を囲む .wall の文字サイズを22pxにしましょう。";
      if (style(credit).fontSize !== "22px" || sizeAfter(credit, wall, "26px") !== "26px")
        return "囲みはできました。撮影者の文字サイズが、外側の値をそのまま引き継ぐようにしましょう。";
      const outside = doc.querySelector("body > p");
      if (style(outside).fontSize !== sizeAfter(outside, outside, "medium"))
        return "撮影者はできました。囲みの外にある会場の案内は元のサイズを保ちましょう。";
      break;
    }
    case "root-size": {
      const root = doc.documentElement;
      const credit = doc.querySelector(".credit");
      if (style(root).fontSize !== "20px") return "ページの基準となる html の文字サイズを20pxにしましょう。";
      if (style(credit).fontSize !== "30px") return "基準はできました。撮影者の文字を20pxの1.5倍にしましょう。";
      if (sizeAfter(credit, root, "24px") !== "36px" || sizeAfter(credit, credit.parentElement, "28px") !== "30px")
        return "今の表示は30pxです。ページの基準を変えたときも1.5倍を保てるように rem で指定しましょう。";
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
    case "outer-space": {
      const tags = [...doc.querySelectorAll(".tag")];
      if (!tags.every((tag) => ["Top", "Right", "Bottom", "Left"].every((side) =>
        style(tag)["padding" + side] === "6px" && style(tag)["border" + side + "Width"] === "2px")))
        return "文字から枠までの四方を6pxにして、2pxの枠を残しましょう。";
      const [first, second] = tags.map((tag) => tag.getBoundingClientRect());
      if (Math.abs(second.top - first.top) > 1 || Math.abs(second.left - first.right - 12) > 1)
        return "札の内側はできました。横に並んだ枠と枠の間を12px空けましょう。";
      break;
    }
    case "border-width": {
      const ticket = doc.querySelector(".ticket");
      const s = style(ticket);
      if (s.boxSizing !== "border-box" || Math.abs(ticket.getBoundingClientRect().width - 100) > 1)
        return "全幅100pxの中に枠と余白を含めるよう、width と box-sizing を組み合わせましょう。";
      if (!["Left", "Right"].every((side) => s["padding" + side] === "8px" && s["border" + side + "Width"] === "2px"))
        return "幅はできました。左右の余白を8px、枠を2pxに戻しましょう。";
      break;
    }
    case "link-area": {
      const desk = doc.querySelector(".desk");
      if (Math.abs(desk.clientWidth - 160) > 1 || !fillsLinkRow(desk))
        return "160pxの枠を保ち、その内側の右端までリンク自身が広がるようにしましょう。";
      const s = style(desk.querySelector("a"));
      if (s.paddingTop !== "6px" || s.paddingBottom !== "6px")
        return "横の押せる範囲はできました。リンクの内側を上下6pxずつ広げましょう。";
      break;
    }
    case "narrow-card": {
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
      break;
    }
    case "bio-lines": {
      const bio = style(doc.querySelector(".bio"));
      if (bio.fontSize !== "16px") return "紹介文の文字は16pxのままにしてみましょう。";
      if (bio.lineHeight !== "24px") return "文字の大きさは合っています。次は一行分の高さを24pxにしましょう。";
      break;
    }
    case "name-colors": {
      const badge = style(doc.querySelector(".badge"));
      if (badge.backgroundColor !== "rgb(0, 0, 128)") return "案内係の名札に紺色の背景を付けましょう。";
      if (badge.color !== "rgb(255, 255, 255)") return "背景は紺色です。名札の文字を白にしましょう。";
      const outside = style(doc.querySelector("p:not(.badge)"));
      if (outside.color !== "rgb(0, 0, 0)" || outside.backgroundColor !== "rgba(0, 0, 0, 0)")
        return "名札は読めます。色の組が下の説明文に広がらないよう .badge だけを選びましょう。";
      break;
    }
    case "picked-mark":
      if (!hasPickedLine(doc.querySelector(".picked"))) return "選択中の名札の左に、見える4pxの実線を付けましょう。";
      if (style(doc.querySelector(".badge:not(.picked)")).borderLeftWidth !== "0px")
        return "選択中の線はできました。もう一人から線を外し、区別できるようにしましょう。";
      break;
    case "shared-ink":
      return inkProblem(doc, [...doc.querySelectorAll(".name")], doc.querySelector("p"));
    case "author-pair": {
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
    }
    case "flex-parent": {
      const bar = doc.querySelector(".bar");
      if (!["flex", "inline-flex"].includes(style(bar).display))
        return "二枚を囲んでいる .bar に display: flex を付けましょう。";
      if (style(bar).flexDirection !== "column" || !vertical([...bar.children].map(el => el.getBoundingClientRect())))
        return "親は選べました。入口が上、展示室が下になるように並ぶ向きを縦にしましょう。";
      break;
    }
    case "along-axis": {
      const bar = doc.querySelector(".bar");
      const [first, last] = [...bar.children].map(el => el.getBoundingClientRect());
      const bounds = bar.getBoundingClientRect();
      if (!["flex", "inline-flex"].includes(style(bar).display) || !horizontal([first, last]) || Math.abs(bar.clientWidth - 180) > 1)
        return "幅180pxの親の中で、二枚を横一列に並べましょう。";
      if (Math.abs(first.left - bounds.left - bar.clientLeft) > 1 ||
          Math.abs(last.right - bounds.left - bar.clientLeft - bar.clientWidth) > 1)
        return "横並びはできました。余りを二枚の間に配り、両端にそろえましょう。";
      break;
    }
    case "across-axis": {
      const bar = doc.querySelector(".bar");
      const bounds = bar.getBoundingClientRect();
      const items = [...bar.children].map(el => el.getBoundingClientRect());
      if (!["flex", "inline-flex"].includes(style(bar).display) || bar.clientHeight !== 80 || !horizontal(items))
        return "高さ80pxの親をFlexboxにし、二枚を横に並べましょう。";
      if (items.some(item => item.height >= bar.clientHeight ||
          Math.abs(item.top + item.height / 2 - bounds.top - bounds.height / 2) > 1))
        return "横並びはできました。親の交差軸で二枚の中心を箱の高さの中央にそろえましょう。";
      break;
    }
    case "wrap-works":
      return workRowProblem(doc);
    case "flex-guide": {
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
    }
    case "layout": {
      const cards = rowsOfCards(doc);
      if (!horizontal(cards)) return "まず、2枚が同じ行に並ぶように棚の配置を直しましょう。";
      const gap = Math.max(cards[1].left - cards[0].right, cards[0].left - cards[1].right);
      if (Math.abs(gap - 12) > 1) return "横並びはできました。カード同士の間を12px空けましょう。";
      break;
    }
    case "equal-tracks":
      if (!gridMatches(doc.querySelector(".gallery"), 3))
        return "棚に等幅の三列と間8pxを指定し、四枚目を二行目の先頭に置きましょう。";
      break;
    case "fitting-tracks":
      return autoGridProblem(docs);
    case "grid-lines": {
      const grid = doc.querySelector(".gallery");
      const [wide, left, right] = [...grid.children].map(card => card.getBoundingClientRect());
      if (style(grid).display !== "grid" || Math.abs(wide.width - grid.clientWidth) > 1)
        return "おすすめの一枚目に、棚の左端の線から右端の線までを使わせましょう。";
      if (!horizontal([left, right]) || !vertical([wide, left]) || Math.abs(left.width - right.width) > 1)
        return "一枚目は広がりました。次の二枚はその下で同じ幅に並べましょう。";
      break;
    }
    case "grid-catalog": {
      const cards = [...doc.querySelectorAll(".gallery > article")];
      if (!["雨の栞", "青い本", "丸い窓", "星の紙"].every(name => cards.some(card => namedElement(card, "h3", name))))
        return "棚の中に四枚の article を置き、四枚目の見出しを「星の紙」にしましょう。";
      const layout = autoGridProblem(docs);
      if (layout) return layout;
      if (!doc.getElementById("notes") || !doc.getElementById("desk"))
        return "棚はできました。リンク先の作品メモと受付の見出しを残しましょう。";
      for (const card of cards) {
        const actions = card.querySelector(".actions");
        const note = namedElement(actions, "a", "メモ");
        const desk = namedElement(actions, "a", "受付");
        if (!note || !desk || note.hash !== "#notes" || desk.hash !== "#desk")
          return "棚の列はできました。各作品の中に、メモと受付への二つのリンクをまとめましょう。";
        const links = [note, desk].map(a => a.getBoundingClientRect());
        if (!["flex", "inline-flex"].includes(style(actions).display) || !horizontal(links) || Math.abs(links[1].left - links[0].right - 6) > 1)
          return "外側の棚はできました。内側の .actions にFlexboxを使い、二つのリンクを横に6px離しましょう。";
      }
      break;
    }
    case "device-width": {
      const content = doc.querySelector('meta[name="viewport" i]')?.content || "";
      const settings = new Map(content.toLowerCase().split(/[,;]/).map(part => part.trim().split(/\s*=\s*/)));
      if (settings.get("width") !== "device-width")
        return "head にある viewport の width を device-width にして、端末の幅を使いましょう。";
      if (Number(settings.get("initial-scale")) !== 1)
        return "幅はできました。initial-scale を1にして、最初の倍率を指定しましょう。";
      if (["no", "0"].includes(settings.get("user-scalable")) ||
          (settings.has("maximum-scale") && Number(settings.get("maximum-scale")) <= 1))
        return "最初の倍率はできました。指で拡大できるように、拡大を禁止する指定を外しましょう。";
      if (!namedElement(doc, "h2", "窓辺の作品展") || !namedElement(doc, "p", "入口の窓に、小さな版画を並べました。"))
        return "幅の設定はできました。展示名と説明の段落もページに残しましょう。";
      break;
    }
    case "content-break":
      if (!vertical(rowsOfCards(docs[0], ".prints > article")))
        return "479pxではまだ一列です。二列にする条件の幅を確かめましょう。";
      if (!balancedPair(docs[1])) return "479pxはできました。ちょうど480pxで等幅の二列になるようにしましょう。";
      break;
    case "reading-width":
      if (!centeredReadingArea(docs[0])) return "狭い画面で縮めるように、固定の幅を外して本文の幅の上限を決めましょう。";
      if (!centeredReadingArea(docs[1])) return "狭い画面はできました。広い画面で幅を560pxで止め、左右の余りを等しくしましょう。";
      break;
    case "photo-fit": {
      const images = [...doc.images];
      if (!images.every(img => img.naturalWidth > 0 && Math.abs(img.getBoundingClientRect().width - 96) <= 1 &&
          Math.abs(img.getBoundingClientRect().height - 96) <= 1)) return "二つの画像の額は幅も高さも96pxに保ちましょう。";
      if (style(images[0]).objectFit !== "contain") return "左の版画は、絵の端まで見えるように contain で収めましょう。";
      if (style(images[1]).objectFit !== "cover") return "左はできました。右は月の形を保って額を埋める cover にしましょう。";
      break;
    }
    case "four-widths": {
      if (!docs.slice(0, 2).every(d => vertical(rowsOfCards(d, ".prints > article"))))
        return "320pxと479pxでは、港と月を縦に読めるようにしましょう。";
      if (!docs.slice(2).every(balancedPair))
        return "狭い幅はできました。480pxと720pxでは港と月を等幅の二列にしましょう。";
      if (!docs.every(centeredReadingArea))
        return "境目はできました。本文は最大560pxにし、広い画面では中央に置きましょう。";
      for (const d of docs) {
        if (d.documentElement.scrollWidth > d.documentElement.clientWidth + 1)
          return "配置はできました。本文や画像が画面の右端からはみ出していないか確かめましょう。";
        for (const article of d.querySelectorAll(".prints article")) {
          const p = article.querySelector("p");
          if (p.clientHeight === 0 || p.scrollWidth > p.clientWidth + 1 || p.scrollHeight > p.clientHeight + 1)
            return "配置はできました。長い説明文が隠れず、最後の文字まで収まるようにしましょう。";
          const img = article.querySelector("img");
          const rect = img.getBoundingClientRect();
          if (!img.naturalWidth || style(img).objectFit !== "contain" || Math.abs(rect.height - 100) > 1 ||
              Math.abs(rect.width - article.clientWidth) > 1)
            return "本文はできました。二枚とも幅いっぱい・高さ100pxの額で、比率を保って絵全体を見せましょう。";
        }
      }
      break;
    }
    case "tab-route":
      if (!linkRoute(doc, [["作者へ", "#artist"], ["作品へ", "#works"]]))
        return "Tabで最初に「作者へ」、次に「作品へ」と進むように、行き先を保ってリンクごと並べましょう。";
      break;
    case "visible-focus": {
      const links = [...doc.querySelectorAll("nav a")];
      for (const a of links) {
        const other = links.find(link => link !== a);
        const result = withFocusedSample(a, () => {
          if (!hasNavyOutline(a)) return "操作先のリンクに、3pxの紺色の実線を2px離して付けましょう。";
          return hasNavyOutline(other) ? "線はできました。フォーカスのないリンクには同じ線を付けず、現在地を区別しましょう。" : "";
        });
        if (result) return result;
      }
      break;
    }
    case "control-names":
      if (!linkRoute(doc, [["受付時間を読む", "#hours"]])) return "まず、「こちら」の文字を「受付時間を読む」にして受付時間へ結びましょう。";
      return visitMemoProblem(doc) || signProblem(doc);
    case "ticket-state": {
      const open = doc.querySelector(".open");
      if (!open?.textContent.includes("受付中") || !open.textContent.includes("午前") || !namedElement(doc, "p", "午後の部　受付終了"))
        return "午前の部には「受付中」、午後の部には「受付終了」と文字で残しましょう。";
      if (style(open).color !== "rgb(255, 255, 255)" || style(open).backgroundColor !== "rgb(0, 0, 128)")
        return "状態は文字で読めます。受付中の背景を紺、文字を白にして読みやすくしましょう。";
      break;
    }
    case "quiet-cue":
      return quietCueProblem(doc);
    case "keyboard-exhibit": {
      if (!linkRoute(doc, [["作品を見る", "#works"], ["受付時間を読む", "#hours"]]))
        return "まず、作品を見る、受付時間を読む、の順に行き先が分かるリンクを置きましょう。";
      const inputProblem = visitMemoProblem(doc);
      if (inputProblem) return inputProblem;
      if (tabSequence(doc)[2] !== namedElement(doc, "label", "訪問メモ").control)
        return "ラベルは結べました。二つのリンクの後にメモ欄を置き、Tabで順に移れるようにしましょう。";
      const imageProblem = signProblem(doc);
      if (imageProblem) return imageProblem;
      const state = doc.querySelector(".open");
      if (!state?.textContent.includes("受付中") || style(state).color !== "rgb(255, 255, 255)" || style(state).backgroundColor !== "rgb(0, 0, 128)")
        return "欄は使えます。午前の状態を「受付中」と文字で書き、白い文字と紺色の背景を保ちましょう。";
      const secondLink = tabSequence(doc)[1];
      if (!withFocusedSample(secondLink, () => hasNavyOutline(secondLink)))
        return "受付時間のリンクにも、操作先に来たとき紺色の枠を付けましょう。";
      return quietCueProblem(doc);
    }
    case "responsive":
      if (!vertical(rowsOfCards(doc)))
        return "狭い画面では1列にしましょう。2列の指定を書く場所を確認してください。";
      if (!horizontal(rowsOfCards(docs[1])))
        return "狭い画面はできました。広い画面で2列になるところを確かめましょう。";
      break;
    case "reader-outline": {
      const headings = [...doc.querySelectorAll("h2")].map(el => el.textContent.trim());
      const sequence = ["自己紹介", "得意なこと", "作品", "連絡先"];
      const missing = sequence.findIndex((heading, i) => headings[i] !== heading);
      if (missing >= 0) return (missing + 1) + "番目に「" + sequence[missing] + "」の見出しを置きましょう。";
      break;
    }
    case "profile-entry":
      return profileEntryProblem(doc);
    case "profile-stories":
      return profileBodyProblem(doc);
    case "profile-visit": {
      const previous = profileEntryProblem(doc) || profileBodyProblem(doc);
      if (previous) return previous;
      const contact = namedElement(doc, "footer h2", "連絡先")?.closest("footer");
      if (!namedElement(contact, "p", "土曜の午後、図書室の受付で声をかけてください。"))
        return "連絡先に、いつ、どこを訪ねるかが分かる原稿の一文を入れましょう。";
      if (!vertical(rowsOfCards(doc, "section article"))) return "連絡先はできました。狭い幅では二つの作品を縦に並べましょう。";
      if (!horizontal(rowsOfCards(docs[1], "section article"))) return "スマホ幅はできました。720pxの見本では二作品を横に並べましょう。";
      if (docs.some(d => d.documentElement.scrollWidth > d.documentElement.clientWidth + 1))
        return "作品は並びました。横にずらさずに本文まで読める幅にしましょう。";
      break;
    }
  }
  return "";
}

function checkProject(docs) {
  const doc = docs[0];
  if (!doc.querySelector("h1")?.textContent.trim()) return "ページの名前を h1 で付けましょう。";
  const cards = [...doc.querySelectorAll("article")];
  if (cards.length === 0)
    return "ページ名はできました。まず1作品目の作品名と紹介文を article で囲みましょう。";
  for (const [i, card] of cards.entries()) {
    if (
      !card.querySelector("h2")?.textContent.trim() ||
      !card.querySelector("p")?.textContent.trim()
    )
      return i + 1 + "件目の作品には、作品名の h2 と紹介文の p の両方を用意しましょう。";
  }
  if (cards.length === 1)
    return "1作品目の紹介ができました。次は2作品目を加え、両方の作品から制作メモへ案内しましょう。";
  let sharedNotes;
  for (const [i, card] of cards.entries()) {
    const targets = new Set([...card.querySelectorAll("a[href]")]
      .filter(a => a.textContent.trim() && a.hash)
      .map(a => doc.getElementById(a.hash.slice(1)))
      .filter(target => target && !target.closest("article") && target.textContent.trim()));
    if (!targets.size)
      return i + 1 + "件目の作品から、このページの作者メモへ移動できるリンクを付けましょう。";
    sharedNotes = sharedNotes ? new Set([...sharedNotes].filter(target => targets.has(target))) : targets;
    if (!sharedNotes.size) return (i + 1) + "件目からも、一つ目の作品と同じ制作メモへ進めるようにしましょう。";
  }
  if (!vertical(rowsOfCards(doc, "article")))
    return "内容はそろいました。幅360pxで最初の2作品を縦に並べましょう。";
  if (!horizontal(rowsOfCards(docs[1], "article")))
    return "スマホ幅はできました。幅720pxで最初の2作品が横に並ぶようにしましょう。";
  if (docs.some((d) => d.documentElement.scrollWidth > d.defaultView.innerWidth + 1))
    return "配置はできました。横スクロールが起きないように、カードの幅を調整しましょう。";
  return "";
}
