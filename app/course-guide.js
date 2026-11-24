"use strict";

// The directory cards and the standalone contents pages describe the same courses.
// Keep the concept, a concrete outcome, and the required experience in one place.
window.CourseGuide = (() => {
  const courses = {
    html: {
      name: "HTML / CSS", question: "HTML / CSSとは？", role: "ページの内容と見た目",
      definition: "HTMLは、文章や画像に「これは見出し」「これは写真」と役割を付ける言葉です。CSSは、その見出しの色や写真の並び方を決める言葉です。",
      example: "2つの作品を紹介するページを作ります。スマホでは縦、広い画面では横に並べて、完成したページをファイルに保存できます。",
      prerequisite: "コードを書くのが初めてでも大丈夫です。", firstLabel: "見出しの作品名を変える",
    },
    javascript: {
      name: "JavaScript", question: "JavaScriptとは？", role: "操作に応じて動かす",
      definition: "JavaScriptは、コンピューターに「いつ、何をするか」を伝えるプログラミング言語です。Webページでは、ボタンを押した人に合わせて表示を変えられます。",
      example: "答えを選ぶと正解かどうかを判定し、正解のときだけ得点を増やすクイズを作ります。",
      prerequisite: "HTMLの見出しに表示される文字が分かれば始められます。", firstLabel: "「開館中」の表示を切り替える",
    },
    dom: {
      name: "JavaScriptの画面操作", question: "DOMとは？", role: "JavaScriptの画面操作",
      definition: "DOMは、ブラウザがHTMLを読み取って作るページの構造です。JavaScriptでその中の見出しやボタンを探すと、ページを開いたまま一部だけ書き換えられます。",
      example: "クイズに答えると得点をその場で更新し、間違えた問題だけをもう一度選べる画面を作ります。",
      prerequisite: "JavaScriptで条件分岐、配列、関数を使ったことがある人向けです。", firstLabel: "見出しを探して文字を変える",
    },
    typescript: {
      name: "TypeScript", question: "TypeScriptとは？", role: "実行前に間違いを見つける",
      definition: "TypeScriptは、JavaScriptに「数」「文字」など、値の種類を確かめる仕組みを加えた言語です。種類が合わない箇所を、動かす前に見つけられます。",
      example: "得点に数の `2` ではなく文字の `\"2\"` を入れると、どの行が間違っているかを確かめられます。クイズのコードを直して試します。",
      prerequisite: "JavaScriptで変数、関数、配列を使ったことがある人向けです。", firstLabel: "得点の「文字」と「数」を比べる",
    },
    react: {
      name: "React", question: "Reactとは？", role: "画面の部品を組み合わせる",
      definition: "Reactは、画面を小さな部品に分けて作るためのJavaScriptのライブラリです。一度作った部品に違うデータを渡せば、同じ形の画面を何度も使えます。",
      example: "作品名と紹介文を渡すと作品カードを表示する部品を作ります。別の作品名を渡しても、同じレイアウトで表示できます。",
      prerequisite: "JavaScriptで関数に値を渡したり、配列を使ったりしたことがある人向けです。", firstLabel: "同じ見出しをHTMLとReactで比べる",
    },
    next: {
      name: "Next.js", question: "Next.jsとは？", role: "ページをつないでサイトにする",
      definition: "Next.jsは、Reactで作った画面をWebサイトとして届けるための仕組みです。URLごとにページを用意したり、サーバーからデータを読み取って表示したりできます。",
      example: "本の一覧から1冊を選ぶと、その本専用のURLで詳細ページが開くサイトを作ります。",
      prerequisite: "Reactで画面の部品を作れる人向けです。見本はスマホでも読めます。自分のPCでサイトを起動する実習にはDockerを使います。", firstLabel: "URLを開くと何が届くかを見る",
    },
    tailwind: {
      name: "Tailwind CSS", question: "Tailwind CSSとは？", role: "短い名前でデザインする",
      definition: "Tailwind CSSは、余白や色を指定するためのCSSの道具集です。HTMLの `class` に、使いたいスタイルを表す短い名前を組み合わせます。",
      example: "HTMLに `class=\"p-4\"` と書くと、カードの内側に余白ができます。こうして余白や色をそろえた本の紹介カードを並べます。",
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
      definition: "複数の記録を1件ずつ読み、条件に合うものを選んで数えたり足したりします。ファイルに保存した記録にも、同じ手順を繰り返し使えます。",
      example: "本の題名と読書時間をカンマで区切ったファイル（CSV）を読み、「条件に合う本を何分読んだか」を計算します。",
      prerequisite: "Pythonのリストと関数を使ったことがある人向けです。最初の3課題はオブジェクト指向コースと共通です。", firstLabel: "本1冊ぶんの記録を作る",
    },
    "python-oop": {
      name: "Python OOP", question: "オブジェクト指向（OOP）とは？", role: "Python OOP",
      definition: "オブジェクト指向は、データと、そのデータを扱う操作をひとまとめにする考え方です。Pythonでは、何を記録し、どんな操作ができるかを「クラス」に書きます。",
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
  return { get: id => courses[id], richText };
})();
