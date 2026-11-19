"use strict";

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

const responsiveExerciseGraders = {
  "device-width"(docs) {
    const [doc] = docs;
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
    return "";
  },

  "responsive"(docs) {
    // exerciseにwidthsがないため、プレビュー生成側の既定値[360, 720]を受け取る。
    const [phone360pxDoc, desktop720pxDoc] = docs;
    if (!vertical(rowsOfCards(phone360pxDoc)))
      return "狭い画面では1列にしましょう。2列の指定を書く場所を確認してください。";
    if (!horizontal(rowsOfCards(desktop720pxDoc)))
      return "狭い画面はできました。広い画面で2列になるところを確かめましょう。";
    return "";
  },

  "content-break"(docs) {
    const [before480pxDoc, at480pxDoc] = docs;
    if (!vertical(rowsOfCards(before480pxDoc, ".prints > article")))
      return "479pxではまだ一列です。二列にする条件の幅を確かめましょう。";
    if (!balancedPair(at480pxDoc)) return "479pxはできました。ちょうど480pxで等幅の二列になるようにしましょう。";
    return "";
  },

  "reading-width"(docs) {
    const [narrow320pxDoc, wide720pxDoc] = docs;
    if (!centeredReadingArea(narrow320pxDoc)) return "狭い画面で縮めるように、固定の幅を外して本文の幅の上限を決めましょう。";
    if (!centeredReadingArea(wide720pxDoc)) return "狭い画面はできました。広い画面で幅を560pxで止め、左右の余りを等しくしましょう。";
    return "";
  },

  "photo-fit"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const images = [...doc.images];
    if (!images.every(img => img.naturalWidth > 0 && Math.abs(img.getBoundingClientRect().width - 96) <= 1 &&
        Math.abs(img.getBoundingClientRect().height - 96) <= 1)) return "二つの画像の額は幅も高さも96pxに保ちましょう。";
    if (style(images[0]).objectFit !== "contain") return "左の版画は、絵の端まで見えるように contain で収めましょう。";
    if (style(images[1]).objectFit !== "cover") return "左はできました。右は月の形を保って額を埋める cover にしましょう。";
    return "";
  },

  "four-widths"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    // widths: [320, 479, 480, 720]。前半は一列、480px以降は等幅の二列。
    const singleColumnDocs = docs.slice(0, 2);
    const twoColumnDocs = docs.slice(2);
    if (!singleColumnDocs.every(d => vertical(rowsOfCards(d, ".prints > article"))))
      return "320pxと479pxでは、港と月を縦に読めるようにしましょう。";
    if (!twoColumnDocs.every(balancedPair))
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
    return "";
  },
};
