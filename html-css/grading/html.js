"use strict";

function museumAnchorIn(parent) {
  return [...parent.querySelectorAll("a")].some((a) =>
    a.href === museumLinks[1] && a.textContent.trim() === "国立科学博物館");
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

const htmlExerciseGraders = {
  "first-edit"(docs) {
    const [doc] = docs;
    if (doc.querySelector("h1")?.textContent.trim() !== "雨の港")
      return "HTML欄の <h1> と </h1> の間に「雨の港」を入れてみましょう。";
    return "";
  },

  "structure"(docs) {
    const [doc] = docs;
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
    return "";
  },

  "word-language"(docs) {
    const [doc] = docs;
    const name = [...doc.querySelectorAll("p")].find((p) => p.textContent.trim() === "Blue Harbor");
    if (!name) return "作品名の段落には「Blue Harbor」をそのまま残しましょう。";
    if (!/^en(?:-|$)/i.test(name.closest("[lang]")?.lang || ""))
      return '作品名はできました。英語の段落に lang="en" を付けましょう。';
    return "";
  },

  "page-names"(docs) {
    const [doc] = docs;
    if (doc.title !== "夜の作品集")
      return "タブに表示したい「夜の作品集」を、title の開始タグと終了タグの間に書きましょう。";
    if (doc.querySelector("h1")?.textContent.trim() !== "星の切符")
      return "タブの名前はできました。本文の h1 の内側を「星の切符」にしましょう。";
    return "";
  },

  "link"(docs) {
    const [doc] = docs;
    const link = [...doc.querySelectorAll("a")].find(
      (a) => a.textContent.trim() === "作者ノートへ",
    );
    if (!link) return "「作者ノートへ」をリンクにするタグで囲みましょう。";
    const target = doc.getElementById(link.hash.slice(1));
    if (target?.textContent.trim() !== "作者ノート")
      return "リンクの文字はできました。href を行き先の id に結び付けましょう。";
    return "";
  },

  "heading-levels"(docs) {
    const [doc] = docs;
    const heading = namedElement(doc, "h1", "小さな版画展");
    if (!heading) return "展示全体の名前「小さな版画展」を h1 にしましょう。";
    const chapter = namedElement(doc, "h2", "体験会");
    if (!comesAfter(chapter, heading)) return "展示名の下に、章の見出し「体験会」を h2 で置きましょう。";
    if (!comesAfter(namedElement(doc, "h3", "午前の部"), chapter))
      return "章はできました。その後に、章の中の「午前の部」を一段下の見出しにしましょう。";
    return "";
  },

  "material-list"(docs) {
    const [doc] = docs;
    if (!namedElement(doc, "p", "受付で使います。"))
      return "「受付で使います。」は説明の文です。一つの段落にしましょう。";
    const lists = [...doc.querySelectorAll("ul")].map(listItems);
    const withTicket = lists.filter((items) => items.includes("入場券"));
    if (!withTicket.length) return "順番が自由な持ち物を ul で囲み、中の一つの li に「入場券」を置きましょう。";
    if (!withTicket.some((items) => items.includes("手帳")))
      return "入場券はできました。同じ ul の中で、手帳を別の li にしましょう。";
    return "";
  },

  "making-steps"(docs) {
    const [doc] = docs;
    const ordered = [...doc.querySelectorAll("ol")].map(listItems);
    if (!ordered.some((items) => items.includes("切る")))
      return "まず外側を ol にして、最初の作業「切る」を li で囲みましょう。";
    if (!ordered.some((items) => {
      const cut = items.indexOf("切る");
      const punch = items.indexOf("穴をあける", cut + 1);
      return cut >= 0 && punch > cut && items.indexOf("結ぶ", punch + 1) > punch;
    })) return "番号付きのリストはできました。同じ ol の中で「切る」「穴をあける」「結ぶ」を一行ずつ、この順に並べましょう。";
    return "";
  },

  "page-regions"(docs) {
    const [doc] = docs;
    const head = namedElement(doc, "header h1", "窓辺の作品展")?.closest("header");
    if (!head) return "まず展示名を h1 にして、ページの先頭に置く header で囲みましょう。";
    const heading = namedElement(doc, "main h2", "展示内容");
    const main = heading?.closest("main");
    if (!comesAfter(main, head) || doc.querySelectorAll("main").length !== 1)
      return "展示名と header はできました。header を閉じ、その後に一つの main を置き、「展示内容」の小見出しを入れましょう。";
    if (!comesAfter(namedElement(main, "p", "木版画を二枚展示します。"), heading))
      return "本文の見出しはできました。同じ main の中で、見出しの下に説明の段落を置きましょう。";
    const foot = namedElement(doc, "footer p", "問い合わせは図書室へ。")?.closest("footer");
    if (!comesAfter(foot, main)) return "本文はできました。main を閉じ、その後の footer に問い合わせの段落を置きましょう。";
    return "";
  },

  "work-section"(docs) {
    const [doc] = docs;
    const topic = namedElement(doc, "section h2", "木の作品");
    if (!topic) return "まず「木の作品」の見出しを含む章を section で囲みましょう。";
    const section = topic.closest("section");
    const title = namedElement(section, "article h3", "小さな舟");
    const work = title?.closest("article");
    if (!comesAfter(work, topic) || !comesAfter(namedElement(work, "p", "枝を削りました。"), title))
      return "章はできました。章の見出しの後で、作品名と紹介文を同じ article に入れましょう。";
    return "";
  },

  "word-emphasis"(docs) {
    const [doc] = docs;
    const caution = namedElement(doc, "p", "足元にご注意ください。");
    if (!namedElement(caution, "strong", "足元にご注意"))
      return "最初の文を一段落に保ち、その中の「足元にご注意」だけを strong で囲みましょう。";
    const next = namedElement(doc, "p", "原画は今日だけです。");
    if (!comesAfter(next, caution) || !namedElement(next, "em", "今日"))
      return "大切な注意はできました。次の段落の中で、ほかの日と区別したい「今日」だけを em で囲みましょう。";
    return "";
  },

  "museum-link"(docs) {
    const [doc] = docs;
    if (!museumAnchorIn(doc))
      return "リンクの文字は「国立科学博物館」にして、href の中を公式サイトのURLにしましょう。";
    return "";
  },

  "sign-image"(docs) {
    const [doc] = docs;
    return signProblem(doc);
  },

  "field-name"(docs) {
    const [doc] = docs;
    if (!memoInputIn(doc))
      return "「見学メモ」を囲む label の for と、入力する欄の id を同じ名前にしましょう。";
    return "";
  },

  "clear-form"(docs) {
    const [doc] = docs;
    return memoResetProblem(doc);
  },

  "contact-card"(docs) {
    const [doc] = docs;
    const card = namedElement(doc, "article h2", "森の展示窓口")?.closest("article");
    if (!card) return "まず「森の展示窓口」の見出しを article に入れましょう。";
    const sign = signProblem(card);
    if (sign) return sign;
    if (!museumAnchorIn(card))
      return "受付の案内はできました。カードの中に国立科学博物館の公式サイトへのリンクを入れましょう。";
    return memoResetProblem(card);
  },
};
