"use strict";

// 見本と表示用コードは各スライドの同じHTML/CSSから作る。
const book = '<p class="title">雨の日の栞</p>';
const card =
  '<article class="card">\n  <h2>雨の日の栞</h2>\n  <p>窓辺で読んだ一冊。</p>\n</article>';
const twoCards =
  '<div class="shelf">\n  <article>雨の日の栞</article>\n  <article>川辺の地図</article>\n</div>';
const frameCard = "article { border: 1px solid; padding: 8px; }";
const stack = ".shelf { display: grid; gap: 8px; }";
const wideGrid = "@media (min-width: 600px) {\n  .shelf { grid-template-columns: 1fr 1fr; }\n}";

const lessons = [
  {
    id: "structure",
    title: "作品名と紹介文を書く",
    topic: "HTML",
    goal: "作品名と紹介文を、見出しと段落に分ける。",
    slides: [
      {
        title: "文字を一つ表示する",
        body: "HTMLは、ページに何が書かれているかをブラウザに伝える言葉です。まずは文字だけ置きます。コードに書いた作品名が、そのまま表示されます。",
        html: "雨の日の栞",
      },
      {
        title: "作品名を見出しにする",
        body: "ページの名前を h1 で囲みます。左の <h1> が始まり、右の </h1> が終わりです。この印をタグと呼びます。",
        html: "<h1>雨の日の栞</h1>",
      },
      {
        title: "紹介文を段落にする",
        body: "見出しの下に、p で囲んだ文章を足しましょう。コードを改行しただけでは、二つの役割は伝わりません。",
        html: "<h1>雨の日の栞</h1>\n<p>窓辺で読んだ一冊。</p>",
      },
    ],
    quiz: {
      prompt: "ページ名の下に紹介文を一段落置くには、どれで紹介文を囲みますか？",
      options: ["h1", "p", "見出しと同じタグ", "囲まずに改行"],
      correct: 1,
      reasons: [
        "h1 はページの一番大きな見出しに使います。",
        "p は一つの段落を表します。",
        "ページ名と紹介文には、それぞれの役割があります。",
        "コードで改行しても、ブラウザには文章のまとまりが伝わりません。",
      ],
    },
    exercise: {
      field: "html",
      task: "「夜の図書室」をページ名にし、「閉館前の十枚。」をその下の段落にしてください。今ある2行の文字を囲んでみましょう。",
      html: "夜の図書室\n閉館前の十枚。",
      css: "",
      hint: "まず作品名だけを <h1> と </h1> で囲みます。次の行には段落のタグを使います。",
      answer: "<h1>夜の図書室</h1>\n<p>閉館前の十枚。</p>",
      review: 2,
    },
  },
  {
    id: "link",
    title: "作品メモへ移動する",
    topic: "HTML",
    goal: "リンクの文字と、クリックしたときの移動先を結び付ける。",
    slides: [
      {
        title: "作品メモに名前を付ける",
        body: "同じページの一部を指し示すために、id で名前を付けます。ここでは notes という目印です。目印を付けても、文字の見た目は同じです。",
        html: '<h2 id="notes">作品メモ</h2>',
      },
      {
        title: "目印をリンクで指す",
        body: "押せる文字を a で囲み、href に移動先を書きます。先頭の # は、このページの中の目印を指します。",
        html: '<a href="#notes">メモを読む</a>\n<h2 id="notes">作品メモ</h2>',
      },
    ],
    quiz: {
      prompt: '行き先が id="artist" のとき、href に何を書きますか？',
      options: ["artist.html", "作者を読む", "#artist", ".artist"],
      correct: 2,
      reasons: [
        "これは別のファイルの名前です。",
        "これはリンクに表示する言葉です。",
        "# の後ろに、行き先と同じ id を書きます。",
        "点で始まる名前は後でCSSのクラスに使います。",
      ],
    },
    exercise: {
      field: "html",
      task: "「作者ノートへ」を押すと、同じページの「作者ノート」へ移動できるリンクにしてください。行き先の目印は用意してあります。",
      html: '作者ノートへ\n<h2 id="artist">作者ノート</h2>',
      css: "",
      hint: "リンクの文字を a で囲み、href の値に # と行き先の名前を続けます。",
      answer: '<a href="#artist">作者ノートへ</a>\n<h2 id="artist">作者ノート</h2>',
      review: 1,
    },
  },
  {
    id: "class",
    title: "指定した文字に色を付ける",
    topic: "CSS",
    goal: "CSSを、変えたい箇所だけに適用する。",
    slides: [
      {
        title: "色を指定する",
        body: "CSSは見た目を指定する言葉です。波かっこの前に対象、中に変えるものと値を書きます。ここでは p の文字を紺色にします。",
        html: "<p>雨の日の栞</p>",
        css: "p { color: navy; }",
      },
      {
        title: "変えたい箇所に名前を付ける",
        body: "二つある段落のうち、作品名にだけ class で名前を付けました。CSSでは名前の前に点を付けます。同じ p でも、作品名だけが紺色になります。",
        html: book + "\n<p>窓辺で読んだ一冊。</p>",
        css: ".title { color: navy; }",
      },
      {
        title: "文字の大きさを足す",
        body: "同じ波かっこの中にもう一つ指定を置けます。font-size は文字の大きさ、px は画面上の長さの単位です。",
        html: book,
        css: ".title {\n  color: navy;\n  font-size: 24px;\n}",
      },
    ],
    quiz: {
      prompt: 'class="title" の文字だけを装飾するとき、波かっこの前に書くのは？',
      options: ["title", "#title", "p", ".title"],
      correct: 3,
      reasons: [
        "クラスの名前を使うときは先頭に印を付けます。",
        "# は id に付けた名前を指します。",
        "p を選ぶと、ほかの段落にも適用されます。",
        "点とクラス名の組み合わせで、指定した箇所だけを選べます。",
      ],
    },
    exercise: {
      field: "css",
      task: "作品名だけを紺色（navy）、24pxにします。紹介文は今の色と大きさを保ってください。",
      html: book + "\n<p>窓辺で読んだ一冊。</p>",
      css: ".title {\n  color: navy;\n}",
      hint: "すでに作品名の色は指定されています。同じ波かっこの中で文字の大きさを足しましょう。",
      answer: ".title {\n  color: navy;\n  font-size: 24px;\n}",
      review: 2,
    },
  },
  {
    id: "card",
    title: "一つの作品をカードにまとめる",
    topic: "HTML と CSS",
    goal: "見出しと紹介文をひとまとまりにし、カード全体に枠を付ける。",
    slides: [
      {
        title: "作品ごとに囲む",
        body: "ほかと切り離しても読める一つの作品紹介を article で囲みます。ページ名の下に来る作品名には、一段下の見出し h2 を使います。",
        html: card,
      },
      {
        title: "カード全体に枠を付ける",
        body: "border に太さ、線の種類、色を並べます。カード全体を選ぶと、作品名と紹介文が同じ線の内側に入ります。",
        html: card,
        css: ".card { border: 2px solid navy; }",
      },
    ],
    quiz: {
      prompt: "作品名と紹介文の両方を一本の枠に収めるには、何に枠を指定しますか？",
      options: ["作品名のh2", "両方を包むarticle", "各段落に個別に", "リンクの文字"],
      correct: 1,
      reasons: [
        "見出しだけが枠で囲まれます。",
        "外側のまとまりに指定すると、その中の要素が一つの枠に入ります。",
        "各段落がそれぞれ別の枠になります。",
        "リンクだけに枠が付きます。",
      ],
    },
    exercise: {
      field: "css",
      task: "一つの作品全体に、四方とも2pxの実線の枠を付けてください。線の色は自由です。",
      html: card,
      css: ".card {\n\n}",
      hint: "対象は .card です。border の値に、太さと solid を書いてみましょう。",
      answer: ".card { border: 2px solid navy; }",
      review: 1,
    },
  },
  {
    id: "padding",
    title: "札の内側に余白をつくる",
    topic: "CSS",
    goal: "文字と枠の間隔を上下・左右ごとに決める。",
    slides: [
      {
        title: "文字と枠を離す",
        body: "「読書中」の札の文字が枠に近すぎます。padding で内側にすき間を作ります。枠と文字はそのままで、四方が12pxずつ広がります。",
        html: '<span class="label">読書中</span>',
        before: ".label { display: inline-block; border: 1px solid; padding: 0; }",
        css: ".label { display: inline-block; border: 1px solid; padding: 12px; }",
      },
      {
        title: "上下と左右を変える",
        body: "上下は小さく保ち、横だけゆったりさせましょう。値を二つ書いたら、先に上下、次に左右です。高さを見比べてください。",
        html: '<span class="label">読書中</span>',
        before: ".label { display: inline-block; border: 1px solid; padding: 4px; }",
        css: ".label { display: inline-block; border: 1px solid; padding: 4px 12px; }",
      },
    ],
    quiz: {
      prompt: "padding: 6px 14px; の14pxはどこのすき間ですか？",
      options: ["枠の内側の上下", "枠の外側の左右", "枠の内側の左右", "枠の外側の上下"],
      correct: 2,
      reasons: [
        "内側は合っています。上下を決めるのは最初の値です。",
        "左右は合っています。padding は枠と文字の間を広げます。",
        "先に上下、次に左右。文字と枠の間が左右14pxずつ空きます。",
        "まず場所に注目しましょう。padding は枠の内側を広げます。",
      ],
    },
    exercise: {
      field: "declaration",
      task: "「貸出中」の札を、上下8px・左右16pxの内側の余白にしてください。宣言を書きます。",
      html: '<span class="label">貸出中</span>',
      css: "padding: 0;",
      hint: "上下の値を先に置き、半角スペースを空けて左右の値を書きます。",
      answer: "padding: 8px 16px;",
      review: 1,
    },
  },
  {
    id: "layout",
    title: "二つの作品を並べる",
    topic: "レイアウト",
    goal: "複数のカードを外側からまとめて配置する。",
    slides: [
      {
        title: "並べる相手を一緒に包む",
        body: "二つの作品は別々の article のまま、その外に div を置きます。shelf は「棚」という名前です。初めは作品が縦に並びます。",
        html: twoCards,
        css: frameCard,
      },
      {
        title: "棚を同じ幅の2列にする",
        body: "棚に display: grid を指定します。grid-template-columns は列の幅、1fr 1fr は空きを同じ割合で分ける2列です。gap は作品と作品の間隔です。",
        html: twoCards,
        css:
          frameCard +
          "\n.shelf {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 8px;\n}",
      },
    ],
    quiz: {
      prompt: "二つの作品の間だけを広げるとき、棚のどの指定を変えますか？",
      options: ["color", "padding", "gap", "font-size"],
      correct: 2,
      reasons: [
        "color は文字の色です。",
        "padding は棚の内側と中身の間を広げます。",
        "gap は並べた項目同士のすき間です。",
        "font-size は文字の大きさです。",
      ],
    },
    exercise: {
      field: "css",
      task: "2枚のカードを横1列に並べ、間を12px空けてください。",
      html: twoCards,
      css: frameCard + "\n.shelf {\n  display: grid;\n}",
      hint: "棚に2列ぶんの幅を書きます。カードの間隔は棚の gap で決められます。",
      answer:
        frameCard +
        "\n.shelf {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 12px;\n}",
      review: 1,
    },
  },
  {
    id: "responsive",
    title: "画面幅に合わせて並びを変える",
    topic: "レイアウト",
    goal: "狭い画面では縦に、広い画面では横に切り替える。",
    slides: [
      {
        title: "まず狭い画面で読む形を作る",
        body: "棚に列数を指定しなければ、カードは1列です。幅の小さな画面でも文字を読める形から始めましょう。",
        html: twoCards,
        css: frameCard + "\n" + stack,
      },
      {
        title: "広いときだけ2列にする",
        body: "@media の丸かっこには条件を書きます。min-width: 600px は表示領域が600px以上という意味です。同じコードを下の二つの幅で見比べてください。",
        html: twoCards,
        css: frameCard + "\n" + stack + "\n" + wideGrid,
        widths: [360, 720],
      },
    ],
    quiz: {
      prompt: "600px以上で2列になる指定は、幅599pxではどうなりますか？",
      options: ["2列になる", "カードが消える", "2枚目だけ小さくなる", "元の1列のまま"],
      correct: 3,
      reasons: [
        "599pxは600px以上の条件に届いていません。",
        "表示を消す指定はありません。",
        "条件が変えるのは棚の列数です。",
        "条件に届く手前では元の1列が使われます。",
      ],
    },
    exercise: {
      field: "css",
      task: "幅360pxでは1列、幅720pxでは2列にしてください。切り替えの目安は600pxです。",
      html: twoCards,
      css: frameCard + "\n" + stack,
      hint: "元の1列を残して、その後ろに広い画面だけのルールを足しましょう。",
      answer: frameCard + "\n" + stack + "\n" + wideGrid,
      review: 1,
    },
  },
];
