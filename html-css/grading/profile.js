"use strict";

function profileEntryProblem(doc) {
  const header = doc.querySelector("header");
  if (!namedElement(header, "h1", "栞を刷る小野") || !namedElement(header, "p", "古い紙に版画を刷っています。"))
    return "ページ先頭の header に、原稿の作者名を h1 で、一行紹介を p で置きましょう。";
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

const profileExerciseGraders = {
  "reader-outline"(docs) {
    const [doc] = docs;
    const headings = [...doc.querySelectorAll("h2")].map(el => el.textContent.trim());
    const sequence = ["自己紹介", "得意なこと", "作品", "連絡先"];
    const missing = sequence.findIndex((heading, i) => headings[i] !== heading);
    if (missing >= 0) return (missing + 1) + "番目に「" + sequence[missing] + "」の見出しを置きましょう。";
    return "";
  },

  "profile-entry"(docs) {
    const [doc] = docs;
    return profileEntryProblem(doc);
  },

  "profile-stories"(docs) {
    const [doc] = docs;
    return profileBodyProblem(doc);
  },

  "profile-visit"(docs) {
    const [doc] = docs;
    const [phone360pxDoc, desktop720pxDoc] = docs;
    const previous = profileEntryProblem(doc) || profileBodyProblem(doc);
    if (previous) return previous;
    const contact = namedElement(doc, "footer h2", "連絡先")?.closest("footer");
    if (!namedElement(contact, "p", "土曜の午後、図書室の受付で声をかけてください。"))
      return "連絡先に、いつ、どこを訪ねるかが分かる原稿の一文を入れましょう。";
    if (!vertical(rowsOfCards(phone360pxDoc, "section article"))) return "連絡先はできました。狭い幅では二つの作品を縦に並べましょう。";
    if (!horizontal(rowsOfCards(desktop720pxDoc, "section article"))) return "スマホ幅はできました。720pxの見本では二作品を横に並べましょう。";
    if (docs.some(d => d.documentElement.scrollWidth > d.documentElement.clientWidth + 1))
      return "作品は並びました。横にずらさずに本文まで読める幅にしましょう。";
    return "";
  },
};
