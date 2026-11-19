"use strict";

/**
 * 卒業制作は幅360px・720pxの順で受け取り、内容、導線、配置の順に採点する。
 * 最初の問題を返し、完成していれば空文字を返す。
 */
function checkProject(docs) {
  const [phone360pxDoc, desktop720pxDoc] = docs;
  if (!phone360pxDoc.querySelector("h1")?.textContent.trim()) return "ページの名前を h1 で付けましょう。";
  const cards = [...phone360pxDoc.querySelectorAll("article")];
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
      .map(a => phone360pxDoc.getElementById(a.hash.slice(1)))
      .filter(target => target && !target.closest("article") && target.textContent.trim()));
    if (!targets.size)
      return i + 1 + "件目の作品から、このページの作者メモへ移動できるリンクを付けましょう。";
    sharedNotes = sharedNotes ? new Set([...sharedNotes].filter(target => targets.has(target))) : targets;
    if (!sharedNotes.size) return (i + 1) + "件目からも、一つ目の作品と同じ制作メモへ進めるようにしましょう。";
  }
  if (!vertical(rowsOfCards(phone360pxDoc, "article")))
    return "内容はそろいました。幅360pxで最初の2作品を縦に並べましょう。";
  if (!horizontal(rowsOfCards(desktop720pxDoc, "article")))
    return "スマホ幅はできました。幅720pxで最初の2作品が横に並ぶようにしましょう。";
  if (docs.some((d) => d.documentElement.scrollWidth > d.defaultView.innerWidth + 1))
    return "配置はできました。横スクロールが起きないように、カードの幅を調整しましょう。";
  return "";
}
