"use strict";

const pathCourses = {
  html: {
    title: "HTML / CSS", catalog: "#home", start: "#first-edit/1",
    project: "作品を二つ並べた紹介ページを作ります。完成したページはHTMLファイルに保存できます。",
    first: "見出しにある「朝の港」を自分の作品名に書き換えます。",
    question: "見本に「朝の港」と表示されています。自分の作品名に変えたいのはどちら？",
    choices: ["見出しの文字", "写真の横幅"], correct: 0,
    feedback: ["そうです。最初のスライドでは文字を一か所だけ変えます。", "横幅を変えると写真の大きさが変わります。作品の名前は文字で書きます。"],
  },
  javascript: {
    title: "JavaScript", catalog: "#javascript", start: "#js-sign/1",
    project: "クイズの答えを判定し、正解すると得点が増えるプログラムを作ります。",
    first: "最初はボタンを押して、見出しが「開館中」から「本日は閉館」に変わる様子を見ます。",
    question: "見出しに <h2>開館中</h2> と書きました。画面で読める文字は？",
    choices: ["h2", "開館中"], correct: 1,
    feedback: ["<h2> と </h2> は見出しの始まりと終わりです。その間に書かれた文字を読んでみましょう。", "そうです。その文字をJavaScriptで切り替えます。"],
    review: ["見出しを試す", "#first-edit/1"],
  },
  python: {
    title: "Python基礎", page: "python/index.html", catalog: "python/index.html#54/demo", start: "python/index.html#54/1/slide",
    project: "入力した名前を表示したり、入力した数に1を足したりしながら、Pythonの書き方を学びます。",
    first: "最初の練習では、1行のコードを書き換えて、表示を「入口」から「受付」に変えます。",
    question: "入力した名前をそのまま表示するプログラムに「ゆき」と入力しました。表示されるのは？",
    choices: ["ゆき", "名前"], correct: 0,
    feedback: ["そうです。「ゆき」と表示されます。「はる」と入力すれば、表示も「はる」に変わります。", "表示されるのは入力した文字です。今回は「ゆき」と入力しました。"],
  },
  tailwind: {
    title: "Tailwind CSS", page: "tailwind/index.html", catalog: "tailwind/index.html", start: "tailwind/index.html#padding/slide",
    project: "本の紹介カードを並べ、余白や文字の大きさをそろえます。貸出中の本はボタンを押せないことが見た目でも分かるようにします。",
    first: "CSSで余白を指定した経験があれば始められます。最初はカードの class を変え、端と文字の間を広げます。",
    question: "カードの内側に余白をつけるCSSの指定はどちら？",
    choices: ["padding", "margin"], correct: 0,
    feedback: ["そうです。同じ余白をTailwindで付けて、二つの結果を見比べます。", "margin はカードの外側の余白を指定します。文字とカードの端を離すには padding を使います。"],
    review: ["CSSの余白を試す", "#padding/1"],
  },
  typescript: {
    title: "TypeScript", page: "typescript/index.html", catalog: "typescript/index.html", start: "typescript/index.html#infer/slide",
    project: "クイズの得点に数値を使うと決めておくと、文字を代入した行にエラーが表示されます。その行を直してから実行します。",
    first: "JavaScriptの変数を使ったことがあれば、まず得点に代入する値を、文字列から数値に変えてみましょう。",
    question: "1点に2点を足したいとき、最初に用意する値はどちら？",
    choices: ["数の1", "文字の「1」"], correct: 0,
    feedback: ["そうです。型を決めておくと文字との取り違えを実行前に発見できます。", "文字は題名に使えます。得点は数として足します。"],
    review: ["JavaScriptで数と文字を比べる", "#js-console/1"],
  },
  "python-oop": {
    title: "Python OOP", page: "python/index.html", catalog: "python/index.html#63/demo", start: "python/index.html#63/1/slide",
    project: "本ごとに読んだページ数を記録します。最後は、関数を呼ぶたびに成功か失敗かを記録する処理を作ります。",
    first: "最初は Book(4) で1冊分の記録を作り、ページ数の 4 を表示します。",
    question: "別々の二冊を読むとき、本ごとに覚えておきたいのはどちら？",
    choices: ["読んだページ数", "ページ数を表示する手順"], correct: 0,
    feedback: ["そうです。一冊ごとに別の値を持たせる方法を試します。", "表示の手順は共通です。今どこまで読んだかは本ごとに違います。"],
    review: ["Pythonで関数を作る", "python/index.html#57/1/slide"],
  },
  "python-practice": {
    title: "Python実践", page: "python/index.html", catalog: "python/index.html#59/demo", start: "python/index.html#59/1/slide",
    project: "読書時間の記録を1件ずつ調べ、60分以上の分だけを合計するプログラムを作ります。",
    first: "リストの値を順に取り出せたら、まずは30分を0.5時間に、60分を1時間に変換してみましょう。",
    question: "30分と60分をどちらも時間に変えると、記録は何件になりますか。",
    choices: ["1件", "2件"], correct: 1,
    feedback: ["集計して一つにするのは別の操作です。今回は一件ずつ単位を変えます。", "二つとも残ります。最初の練習でそれぞれを変換してみましょう。"],
    review: ["Pythonのリストを読み直す", "python/index.html#56/1/slide"],
  },
  react: {
    title: "React", page: "react/index.html", catalog: "react/index.html", start: "react/index.html#components",
    project: "作品名と紹介文を変えるだけで、同じレイアウトのカードを何枚も表示できるようにします。",
    first: "関数を呼んで値を渡せるようになったら、最初のカードの作品名を一か所だけ変えます。",
    question: "二つの作品に同じ形のカードを使うとき、作品ごとに渡すものは？",
    choices: ["表示する作品名と紹介文", "ページの枠線を引く手順のコピー"], correct: 0,
    feedback: ["そうです。一つの部品に違う原稿を渡して確かめましょう。", "同じ構造は部品にまとめられます。それぞれの原稿を分けて渡しましょう。"],
    review: ["関数に値を渡す練習", "#javascript"],
  },
  next: {
    title: "Next.js", page: "next/index.html", catalog: "next/index.html", start: "next/index.html#routes",
    project: "本の一覧から1冊を選ぶと、その本の詳細ページが開くサイトを作ります。PCではDockerでサーバーを起動して試せます。",
    first: "Reactで画面を作ったことがあれば、まず /notice を開いたときの見出しを変えてみましょう。スマホでは見本を読んでコードを組み立てられます。",
    question: "二冊の本のうち特定の一冊を友達に案内するとき、どちらを送ると直接開ける？",
    choices: ["その本のURL", "カードの背景色"], correct: 0,
    feedback: ["そうです。そのURLを開くと、本の一覧を経由せずに詳細を読めます。", "背景色は見た目の指定です。本の詳細を開くには、そのページのURLを使います。"],
    review: ["Reactの作品カードを試す", "react/index.html#components"],
  },
  dom: {
    title: "JavaScriptの画面操作", page: "dom/index.html", catalog: "dom/index.html", start: "dom/index.html#elements",
    project: "クイズに回答すると得点が変わり、間違えた問題にもう一度答えられる画面を作ります。",
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
    for (const course of ["html", "javascript", "dom", "typescript", "react", "next", "tailwind"]) {
      if (pathCourses[course]) content.append(courseEntry(course, saved.positions));
    }
    content.append(details("この先で作るもの", node("p", "JavaScriptの次はTypeScriptで問題の型を決め、Reactでクイズ画面を作り、Next.jsで複数ページのサイトにします。Tailwind CSSはCSSの余白と色を試した後に選べます。")));
  } else if (python) {
    heading("Python", "Pythonで文字を表示してみよう", "初めてコードを書く人は「Python基礎」から始められます。リストや関数を使える人は「Python実践」や「Python OOP」も選べます。");
    content.append(courseEntry("python", saved.positions));
    content.append(courseEntry("python-practice", saved.positions));
    content.append(courseEntry("python-oop", saved.positions));
    content.append(details("基礎の後に選べること", node("p", "読書時間の集計を練習したければ「実践」、複数の本の情報と操作をクラスにまとめたければ「OOP」へ進めます。")));
  } else {
    heading("学習パス", "作りたいものから始めよう", "一枚のスライドでコードと結果を見比べます。スマホでは選んで組み立て、PCでは自分で書いて試せます。");
    const href = pathHref(saved.last, saved.positions[saved.last]);
    if (href) content.append(pathLink("前回の続きへ　" + pathCourses[saved.last].title, href, "next"));
    const cards = node("div", undefined, "path-cards");
    cards.append(pathCard("Webで作品を紹介する", "見出しの文字を書き換えるところから、作品紹介ページを作ります。", "web", "harbor.png"),
      pathCard("Pythonで記録を集計する", "最初の1行で文字を表示し、入力した数を使って計算します。", "python"));
    content.append(cards);
  }
  content.append(transfer());
}
