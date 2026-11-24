"use strict";

// The directory cards and the standalone contents pages describe the same courses.
// Keep the concept, a concrete outcome, and the required experience in one place.
window.CourseGuide = (() => {
  const courses = {
    html: {
      name: "HTML / CSS", question: "HTML / CSSとは？", role: "ページの内容と見た目",
      definition: "HTMLはページの内容と構造、CSSはその見た目を書きます。たとえば `<h1>朝の港</h1>` は「朝の港は見出し」と伝えるHTMLです。同じ文字を青くしたり大きくしたりする指定はCSSに書きます。",
      example: "2つの作品を紹介するページを作ります。スマホでは縦、広い画面では横に並べて、完成したページをファイルに保存できます。",
      prerequisite: "コードを書くのが初めてでも大丈夫です。", firstLabel: "見出しの作品名を変える",
    },
    javascript: {
      name: "JavaScript", question: "JavaScriptとは？", role: "操作に応じて動かす",
      definition: "HTMLでボタンを置き、CSSで見た目を整えます。「押されたら答えを判定し、得点を増やす」といった処理を書くのがプログラミング言語のJavaScriptです。",
      example: "答えを選ぶと正解かどうかを判定し、正解のときだけ得点を増やすクイズを作ります。",
      prerequisite: "HTMLの見出しに表示される文字が分かれば始められます。", firstLabel: "「開館中」の表示を切り替える",
    },
    dom: {
      name: "JavaScriptの画面操作", question: "DOMとは？", role: "JavaScriptの画面操作",
      definition: "DOMは、ブラウザがHTMLから作る「いま開いているページ」の構造です。JavaScriptは書き換える側、DOMはその相手です。DOMの見出しを変えても、元のHTMLファイルは変わりません。",
      example: "クイズに答えると得点をその場で更新し、間違えた問題だけをもう一度選べる画面を作ります。",
      prerequisite: "JavaScriptで条件分岐、配列、関数を使ったことがある人向けです。", firstLabel: "見出しを探して文字を変える",
    },
    typescript: {
      name: "TypeScript", question: "TypeScriptとは？", role: "実行前に間違いを見つける",
      definition: "TypeScriptは、JavaScriptに値の種類（型）を記す書き方と、型を検査する仕組みを加えた言語です。本来は数の得点に文字を入れた、といった間違いを実行前に見つけられます。",
      example: "得点に数の `2` ではなく文字の `\"2\"` を入れた行を探して直します。型の指定は実行用のJavaScriptには残らないため、外から届くデータを実行中に確かめる練習もします。",
      prerequisite: "JavaScriptで変数、関数、配列を使ったことがある人向けです。", firstLabel: "得点の「文字」と「数」を比べる",
    },
    react: {
      name: "React", question: "Reactとは？", role: "画面の部品を組み合わせる",
      definition: "Reactは、JavaScriptで画面の部品を作るライブラリです。得点が増えたとき、素のJavaScriptで表示欄を探して書き換える代わりに、Reactでは得点から何を表示するかを書き、実際の表示更新を任せます。",
      example: "作品名と紹介文を渡すと作品カードを表示する部品を作ります。別の作品名を渡しても、同じレイアウトで表示できます。",
      prerequisite: "JavaScriptで関数に値を渡したり、配列を使ったりしたことがある人向けです。", firstLabel: "同じ見出しをHTMLとReactで比べる",
    },
    next: {
      name: "Next.js", question: "Next.jsとは？", role: "ページをつないでサイトにする",
      definition: "Reactは画面の部品を作る道具です。Next.jsはその部品に加え、ページとURLを結び付ける仕組みも備えています。Reactだけで書く場合も、別の道具や自分のコードでURLを扱えます。",
      example: "まず `app/notice/page.jsx` に置いた部品を `/notice` で開きます。最後は本ごとに専用のURLを持つ読書サイトを作ります。",
      prerequisite: "Reactで画面の部品を作れる人向けです。見本はスマホでも読めます。自分のPCでサイトを起動する実習にはDockerを使います。", firstLabel: "URLを開くと何が届くかを見る",
    },
    tailwind: {
      name: "Tailwind CSS", question: "Tailwind CSSとは？", role: "よく使うCSSを組み合わせる",
      definition: "このカードを素のCSSで整えるなら、クラス名とルールを自分で用意します。Tailwind CSSでは、HTMLの `class` に `p-4` など用意された名前を組み合わせ、Tailwindが対応するCSSを生成します。ブラウザが使うのは、どちらもCSSです。",
      example: "余白や背景色のクラスを組み合わせて、本の紹介カードのデザインをそろえます。",
      prerequisite: "HTMLを少し書けて、CSSで文字の色や余白を変えたことがある人向けです。", firstLabel: "内側の余白を広げる",
    },
    python: {
      name: "Python基礎", question: "Pythonとは？", role: "Python基礎",
      definition: "Pythonは、コンピューターに計算や作業の手順を伝えるプログラミング言語です。文字を表示する1行から始めて、人が繰り返している作業を任せられます。",
      example: "「ゆき、はる、ゆき」という記録から「ゆきは2回、はるは1回」と、名前ごとの回数を数えるプログラムを作ります。",
      prerequisite: "プログラミング経験も、Pythonのインストールも必要ありません。", firstLabel: "1行のコードで文字を表示する",
    },
    "python-practice": {
      name: "Python実践", question: "Pythonで記録を集計するには？", role: "Python実践",
      definition: "基礎で書いた条件分岐や繰り返しを、実際のデータを扱う手順に組み合わせます。題材は読書記録。同じPythonで、必要な行を選び、合計を出し、入力を変えても正しく動くか確かめます。",
      example: "本の題名と読書時間をカンマで区切ったファイル（CSV）を読み、「条件に合う本を何分読んだか」を計算します。",
      prerequisite: "Pythonのリストと関数を使ったことがある人向けです。最初の3課題はオブジェクト指向コースと共通です。", firstLabel: "本1冊ぶんの記録を作る",
    },
    "python-oop": {
      name: "Python OOP", question: "オブジェクト指向（OOP）とは？", role: "Python OOP",
      definition: "本ごとのデータと「何ページ読み進めるか」などの操作をひとまとめにする考え方が、オブジェクト指向です。Pythonでは、何を記録し、どんな操作ができるかを「クラス」に書き、同じ決まりから本ごとに別の記録を作ります。",
      example: "本ごとに読んだページ数を持たせます。1冊目を3ページ読み進めても、2冊目の記録は変わらないようにします。",
      prerequisite: "Pythonで変数や関数を使える人向けです。最初の3課題は実践コースと共通です。", firstLabel: "本1冊ぶんの記録を作る",
    },
  };
  // Inline code is explicitly marked in authored copy; never parse it as HTML.
  function richText(text) {
    const fragment = document.createDocumentFragment();
    text.split("`").forEach((part, i) => {
      if (i % 2 === 0) fragment.append(part);
      else {
        const code = document.createElement("code");
        code.textContent = part;
        fragment.append(code);
      }
    });
    return fragment;
  }
  const cssRule = ".card { padding: 1rem; }";
  // Relevant declarations from readingStyles(["p-4"]) (tailwind/compiler.js).
  // Move the default spacing variable to the shadow host since this preview is isolated.
  const generatedRule = ":host { --spacing: 0.25rem; } .p-4 { padding: calc(var(--spacing) * 4); }";
  const sampleText = "本の紹介";

  function textElement(tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    return element;
  }

  function spacingExample(kind, title, className, rule) {
    const figure = document.createElement("figure");
    figure.dataset.tailwindExample = kind;
    figure.append(textElement("figcaption", title));
    const html = textElement("pre", `<div class="${className}">本の紹介</div>`);
    html.dataset.language = "html";
    const details = kind === "css"
      ? textElement("pre", cssRule)
      : textElement("p", "Tailwindが生成したCSSを読み込む");
    if (kind === "css") details.dataset.language = "css";
    const result = document.createElement("div");
    result.className = "spacing-output";
    const shadow = result.attachShadow({ mode: "open" });
    const preview = textElement("div", sampleText);
    preview.className = className;
    preview.dataset.tailwindPreview = kind;
    const decoration = "div { display: inline-block; background: #fffef7; border: 1px dashed #79937b; font-size: .85rem; }";
    shadow.append(textElement("style", decoration + rule), preview);
    figure.append(html, details, result);
    return figure;
  }

  function tailwindComparison() {
    const comparison = document.createElement("section");
    comparison.className = "tailwind-comparison";
    // A single comparison is mounted in each applicable view.
    const label = textElement("h3", "同じ余白を、2通りで書く");
    label.id = "tailwind-comparison-title";
    comparison.setAttribute("aria-labelledby", label.id);
    const examples = document.createElement("div");
    examples.className = "spacing-comparison-examples";
    examples.append(spacingExample("css", "素のCSS：ルールを書く", "card", cssRule),
      spacingExample("tailwind", "Tailwind：クラスを選ぶ", "p-4", generatedRule));
    const result = document.createElement("p");
    result.append(richText("この例では両方とも上下左右の余白が `1rem` です。対応するCSSがなければ、HTMLに `p-4` と書くだけでは余白は変わりません。"));
    const tradeoff = document.createElement("p");
    tradeoff.append(richText("`p-4 bg-white` と並べれば、余白と白い背景のルールを自分で書かずに済みます。HTMLのクラス名は長くなりがちです。細かい調整には、手書きのCSSも使えます。"));
    comparison.append(label, examples, result, tradeoff);
    return comparison;
  }

  function tailwindComparisonDetails() {
    const extra = document.createElement("details");
    extra.className = "tailwind-comparison-details";
    extra.append(textElement("summary", "素のCSSとTailwindを比べる"), tailwindComparison());
    return extra;
  }

  return { get: id => courses[id], richText, tailwindComparison, tailwindComparisonDetails };
})();
