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
const studioManuscript = `夜の机の小さな作品展

月の切手
青い紙に、雲からのぞく月を刷りました。
制作メモを読む

紙のランプ
細く折った紙を重ねると、明かりが縞に見えます。
制作メモを読む

制作メモ
どちらも、机に残っていた紙の切れ端から作りました。`;

const studioSteps = [
  {
    task: "まず1作品を紹介する",
    brief: "展示の名前を一番上の見出しにします。その下に作品名と短い紹介文を書き、一つの作品として囲んでください。ここで一度「作品を確認する」を押せます。",
    hint: "展示の名前に h1、作品名に h2、紹介文に p を使います。作品名と紹介文を一組の article で囲みます。",
    review: "card/1",
    reviewLabel: "作品をひとまとまりにする例",
  },
  {
    task: "2作品から同じ制作メモへ案内する",
    brief: "もう一つ作品を紹介し、二つの作品の下に制作メモを置きます。どちらの作品からも、リンクを押すとそのメモへ移動できるようにしてください。",
    hint: "メモの見出しに id で名前を付けます。二つの article にそれぞれリンクを置き、href に # と同じ名前を書きます。",
    review: "link/4",
    reviewLabel: "リンクと移動先を結ぶ例",
  },
  {
    task: "読む人の画面に合わせて並べる",
    brief: "幅360pxでは2作品を縦に、720pxでは横に並べます。どちらも、左右にスクロールせず最後まで読めるか確かめてください。",
    hint: "二つの作品を一緒に囲みます。まず縦に並べ、広い画面でだけ、囲みの中が2列になるようにCSSを書きます。",
    review: "responsive/2",
    reviewLabel: "画面幅で並びを変える例",
  },
];
const notesHeading = '<h2 id="notes">作品メモ</h2>';
const notesLink = '<a href="#notes">メモを読む</a>';

const lessons = [
  {
    id: "first-edit",
    title: "作品名を一行だけ書き換える",
    topic: "はじめてのHTML",
    goal: "コードの中の作品名を変え、画面で同じ文字を見つける。",
    slides: [
      {
        title: "作品名を切り替えてみよう",
        body: "「次の作品を表示」を押してみましょう。最初に出る作品名はHTMLに、文字の色はCSSに書いてあります。ボタンを押すと名前が変わるのは、JavaScriptが文字を書き換えるからです。まず自分で変えるのはHTMLの文字です。",
        html: "<h1>朝の港</h1>",
        css: "h1 { color: navy; }",
        nextWork: "夕方の港",
      },
      {
        title: "囲みを残して文字だけ変える",
        body: "見本では <h1> と </h1> の間に「夕方の港」と書いたので、その名前が画面に出ます。コード練習では「HTML」と書かれた欄の作品名を書き換えます。下書きはこのブラウザに自動で保存され、下の見本に結果が出ます。",
        html: "<h1>夕方の港</h1>",
      },
    ],
    quiz: {
      prompt: "<h1>朝の港</h1> の「朝」だけを「夜」に変えたら、画面に何が出ますか？",
      options: ["朝の港", "夜の港", "h1", "朝と夜の二つの作品名"],
      correct: 1,
      reasons: ["囲みの内側を書き換えると、見える文字も変わります。", "囲みはそのままで、中の文字が「夜の港」に変わります。", "h1 は文字の役割をブラウザに伝える印です。", "一つの見出しの中の文字を入れ替えました。"],
    },
    exercise: {
      field: "html",
      task: "作品名を「雨の港」に変えてください。HTML欄の <h1> と </h1> は残し、その間を書き換えます。",
      html: "<h1>朝の港</h1>",
      css: "",
      hint: "「朝の港」の部分を選んで「雨の港」に置き換えると、下の表示が変わります。",
      answer: "<h1>雨の港</h1>",
      build: { code: "<h1>①</h1>", slots: [["見出しの中の文字", "朝の港", "雨の港", "夕方の港"]] },
      review: 1,
    },
  },
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
      {
        title: "まとまりの内側を一段下げる",
        body: "div は中身をまとめる囲みです。外側を親、その中の見出しや段落を子と呼びます。行の頭を少し空けると、どこまでが内側かコードを読むときに分かります。見出しは作品名の直後で閉じます。",
        html: "<div>\n  <h1>雨の日の栞</h1>\n  <p>窓辺で読んだ一冊。</p>\n</div>",
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
      build: {
        code: "<①>夜の図書室</①>\n<②>閉館前の十枚。</②>",
        slots: [["作品名を囲むタグ", "p", "h1"], ["紹介文を囲むタグ", "p", "h1"]],
      },
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
        title: "読みたい場所へひと押しで移動する",
        body: "作品が増えると、一番下のメモを探すのに何度もスクロールします。見本の「メモを読む」を押してみてください。作品を通り越して、同じページのメモまで移動できます。",
        html: [
          notesLink,
          "<h2>雨の日の栞</h2>",
          "<p>雨粒の形に切った紙の栞です。</p>",
          "<h2>川辺の地図</h2>",
          "<p>散歩道で見つけた橋を描きました。</p>",
          notesHeading,
          "<p>二つの作品は、一枚の紙から作りました。</p>",
        ].join("\n"),
        previewHeight: 124,
      },
      {
        title: "タグに情報を足す",
        body: 'h2 はページの中の小見出しです。画面に出る文字は「作品メモ」。開始タグの h2 の後ろには、空白を置いて情報を書き足せます。この情報を「属性」と呼び、属性名="値" の形で書きます。例では属性名が id、値が notes です。',
        html: notesHeading,
      },
      {
        title: "移動先の見出しに名前を付ける",
        body: 'id="notes" は、この見出しをリンクの行き先として指定するための名前です。名前は自分で決められ、画面には表示されません。同じページの中で notes と名付ける場所は一つだけです。',
        html: notesHeading,
      },
      {
        title: "リンクに行き先を書く",
        body: '押せる文字を a で囲みます。a の href 属性は行き先です。「#」に続けて名前を書くと、その名前を持つ場所へ移動します。押す側は #notes、着く側は notes。二つの値を見比べてください。',
        html: notesLink + "\n" + notesHeading,
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
        "このページの中の行き先を指定するときは、名前の前に # を置きます。",
      ],
    },
    exercise: {
      field: "html",
      task: '「作者ノートへ」を押すと、同じページの「作者ノート」へ移動できるリンクを作りましょう。行き先の見出しには id="artist" と名前を付けてあります。',
      html: '作者ノートへ\n<h2 id="artist">作者ノート</h2>',
      css: "",
      hint: "リンクの文字を a で囲み、href の値に # と行き先の名前を続けます。",
      answer: '<a href="#artist">作者ノートへ</a>\n<h2 id="artist">作者ノート</h2>',
      build: {
        code: '<a ①="②">作者ノートへ</a>\n<h2 id="artist">作者ノート</h2>',
        slots: [["リンクに付ける属性", "id", "href"], ["その属性の値", "artist", "#artist", "#notes"]],
      },
      review: 3,
    },
  },
  {
    id: "word-language",
    title: "英語で読む作品名を知らせる",
    topic: "HTML",
    goal: "日本語のページで、英語の作品名を読み上げるための手がかりを付ける。",
    slides: [
      {
        title: "英語で読む部分を知らせる",
        body: '読み上げるときに英語の発音を選べるよう、英語の作品名の開始タグに lang="en" と足します。lang は言葉の種類を伝える属性です。日本語の文章には ja を使います。画面には元の文字がそのまま出ます。',
        html: '<p lang="en">Paper Moon</p>',
      },
    ],
    quiz: {
      prompt: '英語の作品名に lang="en" を付けると、何が伝わりますか？',
      options: ["文字の色", "リンクの行き先", "作品名の言語", "日本語訳"],
      correct: 2,
      reasons: ["文字の色はCSSで指定します。", "行き先はリンクの href で指定します。", "ブラウザや読み上げソフトが、この部分は英語だと判断できます。", "lang を付けても作品名は翻訳されません。"],
    },
    exercise: {
      field: "html",
      task: "「Blue Harbor」の段落に、英語で書かれていると分かる属性を足してください。作品名のつづりはそのまま使います。",
      html: "<p>Blue Harbor</p>",
      css: "",
      hint: '段落の開始タグの p の後ろに半角スペースを空け、lang="en" を入れます。',
      answer: '<p lang="en">Blue Harbor</p>',
      build: {
        code: '<p ①="②">Blue Harbor</p>',
        slots: [["言語を伝える属性", "id", "lang"], ["英語を示す値", "en", "ja"]],
      },
      review: 0,
    },
  },
  {
    id: "page-names",
    title: "ページのタイトルと見出しを分ける",
    topic: "HTML",
    goal: "タブを探すための名前と、本文に出す作品名をそれぞれ指定する。",
    slides: [
      {
        title: "タブで探せる名前を付ける",
        body: "何枚もページを開くときは、タブの名前が手がかりになります。title で囲んだ文字がその名前です。見本の上にはブラウザがこの文書から読み取ったタイトルを表示しています。",
        html: "<title>紙の作品展</title>\n<p>紙で作った作品を紹介します。</p>",
        showTitle: true,
      },
      {
        title: "本文に出す名前を決める",
        body: "作品展を同じタブで読んでいても、本文では個々の作品名を大きく見せたいことがあります。上のタイトルは title、本文の見出しは h1 で別々に決められます。",
        html: "<title>紙の作品展</title>\n<h1>月の封筒</h1>",
        showTitle: true,
      },
    ],
    quiz: {
      prompt: "タブには「小さな展示室」、本文の見出しには「星の切符」と出したい。title に入れるのは？",
      options: ["星の切符", "h1", "小さな展示室", "ja"],
      correct: 2,
      reasons: ["「星の切符」は本文に見せる作品名なので h1 に入れます。", "h1 は本文の見出しを囲むタグです。", "タブで展示室を見つけるための名前を title に入れます。", "ja は日本語を示す値です。"],
    },
    exercise: {
      field: "html",
      task: "タブのタイトルを「夜の作品集」、本文の見出しを「星の切符」にしてください。二つの名前は別々に表示されます。",
      html: "<title>昼の作品集</title>\n<h1>太陽の切符</h1>",
      css: "",
      showTitle: true,
      hint: "見本の上に出る名前を title の内側に、本文に大きく出る名前を h1 の内側に書きます。",
      answer: "<title>夜の作品集</title>\n<h1>星の切符</h1>",
      build: {
        code: "<title>①</title>\n<h1>②</h1>",
        slots: [["タブの名前", "星の切符", "夜の作品集"], ["本文の見出し", "星の切符", "夜の作品集"]],
      },
      review: 1,
    },
  },
  ...exhibitionLessons,
  ...contactLessons,
  {
    id: "class",
    title: "指定した文字に色を付ける",
    topic: "CSS",
    goal: "CSSを、変えたい箇所だけに適用する。",
    slides: [
      {
        title: "色を指定する",
        body: "CSSは見た目を指定する言葉です。波かっこの前の p が対象、color が変えるもの、navy がその値です。「緑の指定を試す」を押すと、色の値と実際の文字が一緒に変わります。",
        html: "<p>雨の日の栞</p>",
        css: "p { color: navy; }",
        tryCss: { label: "緑の指定を試す", css: "p { color: green; }" },
      },
      {
        title: "変えたい箇所に名前を付ける",
        body: 'class も開始タグに書く属性です。同じ名前を複数の要素に付け、まとめて装飾できます。ここでは作品名の段落にだけ class="title" を付けました。CSSで .title と書くと、その段落だけが紺色になります。',
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
      build: {
        code: "① {\n  color: navy;\n  ②: 24px;\n}",
        slots: [["色と大きさを変える対象", "p", ".title"], ["文字の大きさを決める指定", "font-size", "color"]],
      },
      review: 2,
    },
  },
  ...typeLessons,
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
      build: {
        code: "① {\n  ②: 2px solid navy;\n}",
        slots: [["枠を付ける対象", ".card", "h2", "p"], ["枠を描く指定", "color", "border"]],
      },
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
      build: {
        code: "padding: ① ②;",
        slots: [["最初の値", "16px", "8px", "0"], ["二つ目の値", "0", "16px", "8px"]],
      },
      review: 1,
    },
  },
  ...boxLessons,
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
      build: {
        code: frameCard + "\n.shelf {\n  display: grid;\n  grid-template-columns: ①;\n  ②: 12px;\n}",
        slots: [["列の幅", "1fr", "1fr 1fr"], ["カードの間隔を決める指定", "gap", "padding"]],
      },
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
      build: {
        code: frameCard + "\n" + stack + "\n@media (①: 600px) {\n  .shelf { grid-template-columns: ②; }\n}",
        slots: [["幅の条件", "max-width", "min-width"], ["条件に合うときの列の幅", "1fr 1fr", "1fr"]],
      },
      answer: frameCard + "\n" + stack + "\n" + wideGrid,
      review: 1,
    },
  },
];
