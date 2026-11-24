"use strict";

const pathCourses = {
  html: {
    catalog: "#home", start: "#first-edit/1",
    question: "見本に「朝の港」と表示されています。自分の作品名に変えたいのはどちら？",
    choices: ["見出しの文字", "写真の横幅"], correct: 0,
    feedback: ["そうです。最初のスライドでは文字を一か所だけ変えます。", "横幅を変えると写真の大きさが変わります。作品の名前は文字で書きます。"],
  },
  javascript: {
    catalog: "#javascript", start: "#js-sign/1",
    question: "見出しに <h2>開館中</h2> と書きました。画面で読める文字は？",
    choices: ["h2", "開館中"], correct: 1,
    feedback: ["<h2> と </h2> は見出しの始まりと終わりです。その間に書かれた文字を読んでみましょう。", "そうです。その文字をJavaScriptで切り替えます。"],
    review: ["見出しを試す", "#first-edit/1"],
  },
  python: {
    page: "python/index.html", catalog: "python/index.html#54/demo/toc", start: "python/index.html#54/1/slide",
    question: "入力した名前をそのまま表示するプログラムに「ゆき」と入力しました。表示されるのは？",
    choices: ["ゆき", "名前"], correct: 0,
    feedback: ["そうです。「ゆき」と表示されます。「はる」と入力すれば、表示も「はる」に変わります。", "表示されるのは入力した文字です。今回は「ゆき」と入力しました。"],
  },
  tailwind: {
    page: "tailwind/index.html", catalog: "tailwind/index.html", start: "tailwind/index.html#padding/slide",
    question: 'Tailwindで生成したCSSも、自分で用意したCSSもありません。HTMLに class="p-4" と書くだけで余白は増える？',
    choices: ["増えない", "増える"], correct: 0,
    feedback: ["そうです。p-4 に対応するCSSのルールがあって初めて、内側の余白が変わります。", "HTMLのクラス名には、それだけで余白を付ける力はありません。対応するCSSを読み込む必要があります。"],
    review: ["CSSの余白を試す", "#padding/1"],
  },
  typescript: {
    page: "typescript/index.html", catalog: "typescript/index.html", start: "typescript/index.html#infer/slide",
    question: "1点に2点を足したいとき、最初に用意する値はどちら？",
    choices: ["数の1", "文字の「1」"], correct: 0,
    feedback: ["そうです。型を決めておくと文字との取り違えを実行前に発見できます。", "文字は題名に使えます。得点は数として足します。"],
    review: ["JavaScriptで数と文字を比べる", "#js-console/1"],
  },
  "python-oop": {
    page: "python/index.html", catalog: "python/index.html#63/demo/toc", start: "python/index.html#63/1/slide",
    question: "別々の二冊を読むとき、本ごとに覚えておきたいのはどちら？",
    choices: ["読んだページ数", "ページ数を表示する手順"], correct: 0,
    feedback: ["そうです。一冊ごとに別の値を持たせる方法を試します。", "表示の手順は共通です。今どこまで読んだかは本ごとに違います。"],
    review: ["Pythonで関数を作る", "python/index.html#57/1/slide"],
    afterIntro: ["クラスを学習済みなら OOP の続きへ", "python/index.html#63/4/slide"],
  },
  "python-practice": {
    page: "python/index.html", catalog: "python/index.html#59/demo/toc", start: "python/index.html#63/1/slide/practice",
    question: "読書記録が2件あります。「30分」を「0.5時間」に、「60分」を「1時間」に書き換えました。書き換えた後、記録は何件ありますか。",
    choices: ["1件", "2件"], correct: 1,
    feedback: ["集計して一つにするのは別の操作です。今回は一件ずつ単位を変えます。", "二つとも残ります。共通のクラス入門のあとで、こうした変換をまとめて行う練習に進みます。"],
    review: ["Pythonのリストを読み直す", "python/index.html#56/1/slide"],
    afterIntro: ["クラスを学習済みなら実践へ", "python/index.html#59/1/slide"],
  },
  react: {
    page: "react/index.html", catalog: "react/index.html", start: "react/index.html#components/1",
    question: "二つの作品に同じ形のカードを使うとき、作品ごとに渡すものは？",
    choices: ["表示する作品名と紹介文", "ページの枠線を引く手順のコピー"], correct: 0,
    feedback: ["そうです。一つの部品に違う原稿を渡して確かめましょう。", "同じ構造は部品にまとめられます。それぞれの原稿を分けて渡しましょう。"],
    review: ["関数に値を渡す練習", "#javascript"],
  },
  next: {
    page: "next/index.html", catalog: "next/index.html", start: "next/index.html#request/slide/1",
    question: "二冊の本のうち特定の一冊を友達に案内するとき、どちらを送ると直接開ける？",
    choices: ["その本のURL", "カードの背景色"], correct: 0,
    feedback: ["そうです。そのURLを開くと、本の一覧を経由せずに詳細を読めます。", "背景色は見た目の指定です。本の詳細を開くには、そのページのURLを使います。"],
    review: ["Reactの作品カードを試す", "react/index.html#components"],
  },
  dom: {
    page: "dom/index.html", catalog: "dom/index.html", start: "dom/index.html#elements/1",
    question: "「作品クイズ」と「参考作品」の一覧には、どちらにも項目（li）があります。クイズの項目だけを探したいとき、探す範囲はどちら？",
    choices: ["ページ全体", "作品クイズの一覧"], correct: 1,
    feedback: ["ページ全体には参考作品の行もあります。", "そうです。「作品クイズ」の中だけで探せば、「参考作品」の項目は選ばれません。"],
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

const pathFamilies = {
  web: { name: "Web制作", courses: ["html", "javascript", "dom", "typescript", "react", "next", "tailwind"] },
  python: { name: "Python", courses: ["python", "python-practice", "python-oop"] },
};

function courseEntry(course, positions) {
  const entry = pathCourses[course];
  const guide = CourseGuide.get(course);
  const section = node("section", undefined, "path-course");
  section.dataset.course = course;
  const title = node("h2", guide.question);
  title.id = "about-" + course;
  title.tabIndex = -1;
  section.setAttribute("aria-labelledby", title.id);
  const definition = node("p", undefined, "course-definition");
  definition.append(CourseGuide.richText(guide.definition));
  section.append(node("p", guide.role, "course-role"), title, definition);

  const example = node("div", undefined, "course-example");
  const outcome = node("p");
  outcome.append(CourseGuide.richText(guide.example));
  if (course === "tailwind") example.append(CourseGuide.tailwindComparison());
  const outcomeHeading = node("h3", "このコースでできること");
  example.append(outcomeHeading, outcome);

  const prerequisite = node("p", undefined, "course-prerequisite");
  prerequisite.append(node("strong", "始める目安"), document.createTextNode(guide.prerequisite));
  const actions = node("div", undefined, "course-actions");
  const dest = pathHref(course, positions[course]);
  const introDone = entry.afterIntro && YomikumuPaths.completedPythonClassIntro();
  const start = introDone ? entry.afterIntro[1] : entry.start;
  const startLabel = dest ? guide.name + "の続きを開く" : introDone ? entry.afterIntro[0] : "最初の課題：" + guide.firstLabel;
  actions.append(pathLink(startLabel, dest || start, "next"), pathLink(guide.name + "の目次", entry.catalog, "course-contents-link"));
  section.append(example, prerequisite, actions);
  const support = node("div", undefined, "course-support");
  support.append(readiness(course, entry));
  if (entry.afterIntro) {
    const resumingIntro = /^63\/[1-3]\//.test(positions[course] || "");
    const alternative = introDone && !resumingIntro
      ? pathLink("クラス入門を読み直す", entry.start, "review") : pathLink(...entry.afterIntro, "review");
    const group = node("div");
    group.append(node("p", "クラスで1冊分の記録を作る3課題は、Python実践とPython OOPで共通です。すでに学んだ人は同じ課題を繰り返す必要はありません。"), alternative);
    support.append(details("共通のクラス入門について", group));
  }
  section.append(support);
  return section;
}

function pathCard(title, body, route, sample, output) {
  const card = pathLink("", "#paths/" + route, "family-card family-" + route);
  const preview = node("span", undefined, "family-preview");
  preview.setAttribute("aria-hidden", "true");
  preview.append(node("code", sample), node("span", output));
  const family = pathFamilies[route];
  card.append(node("span", family.name + "　/　" + family.courses.length + "コース", "family-count"),
    node("strong", title), node("span", body, "family-description"), preview);
  return card;
}

function courseDirectory(familyId) {
  const family = pathFamilies[familyId];
  const list = node("ul", undefined, "course-index");
  for (const id of family.courses) {
    const item = node("li");
    item.append(pathLink(CourseGuide.get(id).name, "#paths/" + familyId + "/" + id));
    list.append(item);
  }
  return list;
}

function pathTools() {
  const box = node("footer", undefined, "path-tools");
  box.setAttribute("aria-label", "全コース共通の学習記録");
  box.append(node("h2", "学習記録の管理"), node("p", "別の端末で続きを学ぶときは、全コースの進捗と下書きをファイルで移せます。"), transfer());
  return box;
}

function learningPaths(part) {
  const saved = savedPath();
  const family = Object.hasOwn(pathFamilies, part) ? pathFamilies[part] : null;
  document.querySelector(".mast span").textContent = "学習パス";
  nav.classList.add("path-nav");
  nav.replaceChildren(link("全コース目次", "paths", "nav-home"), link("Web制作", "paths/web"), link("Python", "paths/python"));
  nav.children[part === "web" ? 1 : part === "python" ? 2 : 0].setAttribute("aria-current", "page");
  if (family) {
    const web = part === "web";
    heading("分野別ガイド　/　" + family.courses.length + "コース", family.name + "のコース一覧", web
      ? "初めてWebページを作るなら、まずはHTML / CSSへ。残りの6コースはすべて順に受ける必要はありません。動きを付けたいならJavaScript、見た目を整えたいならCSSを学んだ後にTailwind CSSを選べます。"
      : "初めてならPython基礎から。リストや関数が使える人は、ファイルの記録を集計する「実践」と、データと操作をひとまとめにする「OOP」から目的に合う方を選べます。");
    const jump = details("コース名から探す（" + family.courses.length + "）", courseDirectory(part));
    jump.className = "path-jump";
    content.append(jump);
    for (const id of family.courses) content.append(courseEntry(id, saved.positions));
  } else {
    heading("はじめてのプログラミング　/　10コース", "全コース目次",
      "Webページを作るか、データを扱うか。やってみたい方を選んでください。どちらも最初の課題は、ブラウザだけで試せます。");
    const href = pathHref(saved.last, saved.positions[saved.last]);
    if (href) content.append(pathLink("前回の続きへ　" + CourseGuide.get(saved.last).name, href, "next"));
    const cards = node("div", undefined, "family-cards");
    cards.append(pathCard("Webで作品を紹介する", "文字や写真を置き、押すと反応するページへ。", "web", "<h1>朝の港</h1>", "朝の港"),
      pathCard("Pythonで記録を集計する", "文字を表示する1行から、名前や数字の集計へ。", "python", 'print("入口")', "入口"));
    const index = node("section", undefined, "all-courses-index");
    index.append(node("h2", "コース名から探す"), node("p", "名前を選ぶと、そのコースで学ぶことと始め方を読めます。"));
    for (const [id, group] of Object.entries(pathFamilies)) index.append(node("h3", group.name), courseDirectory(id));
    content.append(cards, index);
  }
  content.append(pathTools());
}

// A return link from a long course contents list should reopen that exact card,
// including on reload, keyboard activation and browser Back, not the page hero.
function focusPathCard() {
  const [, family, id] = location.hash.split("/");
  if (!location.hash.startsWith("#paths/") || !Object.hasOwn(pathFamilies, family) || !pathFamilies[family].courses.includes(id)) return false;
  const title = document.getElementById("about-" + id);
  if (!title) return false;
  const section = title.closest(".path-course");
  const context = section.querySelector(".course-role");
  // A direct link may land several screens below the directory heading.
  context.prepend(pathLink(pathFamilies[family].name + "のコース一覧", "#paths/" + family), "　/　");
  title.focus({ preventScroll: true });
  section.scrollIntoView({ block: "start" });
  return true;
}
