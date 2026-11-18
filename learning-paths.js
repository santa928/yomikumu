"use strict";

const pathCourses = {
  html: {
    title: "HTML / CSS", catalog: "#home", start: "#first-edit/1",
    project: "自分の作品を二つ並べた紹介ページ。完成したらHTMLファイルとして持ち出せます。",
    first: "見出しにある「朝の港」を自分の作品名に書き換えます。",
    question: "見本に「朝の港」と表示されています。自分の作品名に変えたいのはどちら？",
    choices: ["見出しの文字", "写真の横幅"], correct: 0,
    feedback: ["そうです。最初のスライドでは文字を一か所だけ変えます。", "横幅を変えると写真の大きさが変わります。作品の名前は文字で書きます。"],
  },
  javascript: {
    title: "JavaScript", catalog: "#javascript", start: "#js-sign/1",
    project: "展示クイズの採点係。問題を読み、答えに合わせて点を加えます。",
    first: "ボタンを押した後に展示の看板に出る文字を変えます。",
    question: "見出しに <h2>開館中</h2> と書きました。画面で読める文字は？",
    choices: ["h2", "開館中"], correct: 1,
    feedback: ["h2 は見出しを示す印です。二つの印の間を読んでみましょう。", "そうです。その文字をJavaScriptで切り替えます。"],
    review: ["見出しを試す", "#first-edit/1"],
  },
  python: {
    title: "Python基礎", page: "python/index.html", catalog: "python/index.html#54/demo", start: "python/index.html#54/1/slide",
    project: "作品展の受付係。名前と券の枚数を受け取り、券を足した結果を二行で表示します。",
    first: "最初の一行で、看板に出る「入口」の文字を変えます。",
    question: "受付で名前を一人ずつ受け取ります。毎回変わるのはどちら？",
    choices: ["来た人の名前", "名前を受け取る手順"], correct: 0,
    feedback: ["そうです。同じ手順に違う名前を渡して結果を試せます。", "手順は何度も使えます。変わるのは、そのとき来た人の名前です。"],
  },
  tailwind: {
    title: "Tailwind CSS", page: "tailwind/index.html", catalog: "tailwind/index.html", start: "tailwind/index.html#padding/slide",
    project: "余白と文字をそろえた読書カード。しおりを押せる本と貸出中の本を見分けます。",
    first: "CSSの余白を指定した経験があれば選べます。最初は class の p-2 を変え、紙の端と文字の間を広げます。",
    question: "カードの文字と紙の端の間を空けるCSSの指定はどちら？",
    choices: ["padding", "margin"], correct: 0,
    feedback: ["そうです。同じ余白をTailwindで付けて、二つの結果を見比べます。", "margin は紙の外側を空けます。内側を変える例を試してみましょう。"],
    review: ["CSSの余白を試す", "#padding/1"],
  },
  dom: {
    title: "JavaScriptの画面操作", page: "dom/index.html", catalog: "dom/index.html", start: "dom/index.html#elements",
    project: "作品クイズに得点と再挑戦を付けます。ヒントを閉じるとキーボードで回答の続きへ戻れます。",
    first: "一覧と関数を試したら、見出しを一つ探して、その文字だけを書き換えます。",
    question: "二つの一覧に同じ li があります。作品クイズの行だけを探すとき、先に選ぶのは？",
    choices: ["ページ全体", "作品クイズの一覧"], correct: 1,
    feedback: ["ページ全体には参考作品の行もあります。", "そうです。探す場所を決めると、ほかの一覧を保てます。"],
    review: ["問題の一覧を試す", "#js-file-audit/1"],
  },
};

function pathLink(label, href, className) {
  const anchor = node("a", label, className);
  anchor.href = href;
  return anchor;
}

function savedPath() {
  const saved = YomikumuPaths.read();
  const legacy = readProgress().last;
  if (!legacy) return saved;
  const fallbackCourse = javascriptLessons.some(unit => unit.id === legacy.split("/")[0]) ? "javascript" : "html";
  return { last: saved.last || fallbackCourse, positions: { [fallbackCourse]: legacy, ...saved.positions } };
}

function pathHref(course, route) {
  const item = pathCourses[course];
  return item && route ? (item.page || "") + "#" + route : "";
}

function readiness(course, entry) {
  const form = node("form");
  const field = node("fieldset");
  field.append(node("legend", entry.question));
  entry.choices.forEach((choice, index) => {
    const choiceLabel = node("label");
    const input = node("input");
    input.type = "radio";
    input.name = "ready-" + course;
    input.value = String(index);
    choiceLabel.append(input, document.createTextNode(choice));
    field.append(choiceLabel);
  });
  const check = node("button", "答えを確かめる");
  check.type = "submit";
  const message = statusMessage();
  form.addEventListener("submit", event => {
    event.preventDefault();
    const answer = form.querySelector("input:checked");
    message.textContent = answer ? entry.feedback[Number(answer.value)] : "答えを一つ選んでください。";
  });
  form.append(field, check, message);
  if (entry.review) form.append(pathLink(entry.review[0], entry.review[1], "review"));
  return details("始める前に一問試す", form);
}

function courseEntry(course, positions) {
  const entry = pathCourses[course];
  const section = node("section", undefined, "path-course");
  section.append(node("h2", entry.title), node("p", entry.project), node("p", entry.first), readiness(course, entry));
  const dest = pathHref(course, positions[course]);
  section.append(pathLink(dest ? entry.title + "の続きを開く" : "最初の一課題を開く", dest || entry.start, "next"));
  section.append(pathLink(entry.title + "の単元を選ぶ", entry.catalog, "review"));
  return section;
}

function pathCard(title, body, route, asset) {
  const card = node("a", undefined, "path-card");
  card.href = "#paths/" + route;
  if (asset) {
    const img = node("img");
    img.src = asset;
    img.alt = "";
    card.append(img);
  } else card.append(node("code", 'print("入口")', "path-sample"));
  card.append(node("strong", title), node("span", body));
  return card;
}

function learningPaths(part) {
  const saved = savedPath();
  const web = part === "web";
  const python = part === "python";
  document.querySelector(".mast span").textContent = "学習パス";
  nav.classList.add("path-nav");
  nav.replaceChildren(link("学習パス", "paths", "nav-home"), link("Web制作", "paths/web"), link("Python", "paths/python"));
  nav.children[web ? 1 : python ? 2 : 0].setAttribute("aria-current", "page");
  if (web) {
    heading("Web制作", "自分の作品をページにしよう", "最初はHTMLで作品名を書きます。スマホではスライドを読んでタップで組み、PCではコードを書いて結果を見られます。");
    for (const course of ["html", "javascript", "dom", "tailwind"]) {
      if (pathCourses[course]) content.append(courseEntry(course, saved.positions));
    }
    content.append(details("この先で作るもの", node("p", "JavaScriptの次はTypeScriptで問題の型を決め、Reactでクイズ画面を作り、Next.jsで複数ページのサイトにします。Tailwind CSSはCSSの余白と色を試した後に選べます。")));
  } else if (python) {
    heading("Python", "読書の記録を集計しよう", "Web制作の経験は必要ありません。最初はPythonで一行の文字を表示し、次に入力した名前で表示を変えます。");
    content.append(courseEntry("python", saved.positions));
    content.append(details("基礎の後に選べること", node("p", "Python実践では記録を一件ずつ加工します。Python OOPでは本ごとに別々の状態を持つ貸出の仕組みを作ります。")));
  } else {
    heading("学習パス", "作りたいものから始めよう", "一枚のスライドでコードと結果を見比べます。スマホでは選んで組み立て、PCでは自分で書いて試せます。");
    const href = pathHref(saved.last, saved.positions[saved.last]);
    if (href) content.append(pathLink("前回の続きへ　" + pathCourses[saved.last].title, href, "next"));
    const cards = node("div", undefined, "path-cards");
    cards.append(pathCard("Webで作品を紹介する", "作品名を書き換えて、自分の作品展を作る。", "web", "harbor.png"),
      pathCard("Pythonで記録を集計する", "名前と枚数を受け取る受付係から始める。", "python"));
    content.append(cards);
  }
  content.append(transfer());
}
