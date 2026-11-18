"use strict";

const inkCss = ".author { color: navy; }";
const captionText = '<p class="author">青木ミナ</p>\n<p>紙の小さな展示です。</p>';
const wallNote = '<div class="wall">\n  <p class="credit">撮影　青木ミナ</p>\n</div>\n<p>会場の案内</p>';
const creditSize = { selector: ".credit", label: "撮影者の文字" };

const typeLessons = [
  {
    id: "linked-css", title: "別のファイルから作者名の色を読み込む", topic: "CSS",
    goal: "HTMLに一行足して、別ファイルに書いたCSSを読み込む。",
    slides: [
      {
        title: "色を決めるファイルを用意する",
        body: "作者名だけ紺色にしたいので、ink.css という別のファイルに下の一行を保存しました。まだHTMLにはその場所を伝えていないので、見本の作者名は元の色です。",
        html: captionText, sheetCode: true,
      },
      {
        title: "HTMLにファイルの場所を知らせる",
        body: "link の rel=\"stylesheet\" は見た目のルールを読むという意味。href に同じフォルダーのファイル名を書きます。作品の本文はそのままで、作者名だけが下のCSSで指定した紺色になりました。link は画面に文字を出さないタグです。",
        html: '<link rel="stylesheet" href="ink.css">\n' + captionText, sheetCode: true,
      },
    ],
    quiz: {
      prompt: "ink.css を別のファイルに保存しただけでは文字色が変わりません。HTMLに何を伝えますか？",
      options: ["作者名の読み方", "読み込むCSSの場所と種類", "画像の代替文", "リンクに出す文字"], correct: 1,
      reasons: ["作者名の読みはCSSの読み込みに関係しません。", "rel と href を書いた link からCSSが読み込まれます。", "画像の代替文は img の alt です。", "画面に出すリンクは a です。ここでは見た目のルールを読みます。"],
    },
    exercise: {
      field: "html", css: "", html: '<link rel="stylesheet" href="paper.css">\n' + captionText,
      task: "作者名だけを紺色にしましょう。用意した ink.css を読むように、ファイルの場所を直してください。",
      hint: "rel はすでに指定されています。href の紙の名前を ink.css に変更します。",
      answer: '<link href="ink.css" rel="stylesheet">\n' + captionText,
      build: { code: '<link rel="①" href="②">\n' + captionText, slots: [["ファイルの役割", "stylesheet", "author"], ["読むファイル", "paper.css", "ink.css"]] }, review: 1,
    },
  },
  {
    id: "rule-order", title: "同じ指定を入れ替えて色を確かめる", topic: "CSS",
    goal: "同じ文字に同じ強さで指定したとき、どの色が表示されるかを予測する。",
    slides: [
      {
        title: "同じ作者名に二つの色を書いたら？",
        body: "二つの行はどちらも .author の color を指定しています。この例では同じ強さなので後に書いた色が使われます。先に navy、後に green と書いた見本は緑です。",
        html: captionText, css: ".author { color: navy; }\n.author { color: green; }",
      },
      {
        title: "行の順番だけを変える",
        body: "下の二つの表示で、作者名と紹介文を見比べましょう。入れ替えたのはCSSの二行だけです。後ろに来た値が変わり、二つ目の作者名は紺色になります。",
        html: captionText, before: ".author { color: navy; }\n.author { color: green; }", css: ".author { color: green; }\n.author { color: navy; }",
      },
    ],
    quiz: {
      prompt: "同じ .author の色を上から順に green、navy、green と書くと、作者名は何色ですか？",
      options: ["紺色", "緑と紺のまだら", "緑", "元の色"], correct: 2,
      reasons: ["navy の下にも同じ対象への指定があります。", "この例では一つの色が使われます。", "同じ強さの指定のうち、一番後ろの green が使われます。", "作者名は .author に一致します。"],
    },
    exercise: {
      field: "css", html: captionText, css: ".author { color: green; }\n.author { color: navy; }",
      task: "二つのルールを残し、置く順番を変えて作者名を緑色にしてください。紹介文の色はそのままです。",
      hint: "緑の指定の後ろに紺色の指定があると、紺色になります。緑の行を最後に移します。",
      answer: ".author { color: navy; }\n.author { color: green; }",
      build: { code: ".author { color: ①; }\n.author { color: ②; }", slots: [["先に読む色", "green", "navy"], ["後に読む色", "green", "navy"]] }, review: 1,
    },
  },
  {
    id: "specific-rule", title: "段落と作者名が重なったときの色を読む", topic: "CSS",
    goal: "段落すべてへの指定と、作者名への指定が重なる箇所を見つける。",
    slides: [
      {
        title: "どの段落に二つのルールが当たる？",
        body: "p は二つの段落の両方、.author は作者名だけに当たります。この例ではクラスを指定する .author のほうが、タグ名だけの p より優先されます。作者名は紺色、紹介文は緑です。",
        html: captionText, css: ".author { color: navy; }\np { color: green; }",
      },
      {
        title: "具体性で選ばれる色を比べる",
        body: "対象の指定の仕方による優先の度合いを「詳細度」と呼びます。二行の順番を逆にしても、ここでは作者名には .author が勝ちます。さっきの同じ .author 同士のときと比べましょう。",
        html: captionText, before: "p { color: green; }\n.author { color: navy; }", css: ".author { color: navy; }\np { color: green; }",
      },
    ],
    quiz: {
      prompt: ".author を紺色、次の行で p を緑にしました。クラスを持たない紹介文は何色ですか？",
      options: ["緑", "紺色", "白", "見えなくなる"], correct: 0,
      reasons: ["紹介文には p のルールだけが当たります。", ".author に当たるのは作者名です。", "白を指定したルールはありません。", "指定しているのは表示の有無ではなく色です。"],
    },
    exercise: {
      field: "css", html: captionText, css: "p { color: green; }",
      task: "紹介文の緑を残し、作者名だけを紺色（navy）にしてください。",
      hint: "HTMLで作者名だけに付いている名前は author。クラスを選ぶときは前に点を書きます。",
      answer: ".author { color: navy; }\np { color: green; }",
      build: { code: "① { color: ②; }\np { color: green; }", slots: [["紺色にする対象", "p", ".author"], ["作者名の色", "green", "navy"]] }, review: 0,
    },
  },
  {
    id: "inherited-size", title: "囲みの文字サイズを中に受け渡す", topic: "CSS",
    goal: "外側の文字サイズだけを変え、中の撮影者の文字が何pxになるか実測する。",
    slides: [
      {
        title: "外側の文字サイズが中にも届く",
        body: "wall という名前の囲みの中に撮影者の段落があります。段落に自分の文字サイズがないと、外側の値を引き継ぎます。これを継承と呼びます。二つ目は外側だけを20pxにした例です。表示の下の実測値を見てください。",
        html: wallNote, before: ".wall { font-size: 16px; }", css: ".wall { font-size: 20px; }", measure: creditSize,
      },
      {
        title: "中に値があるときはどうなる？",
        body: "今度は撮影者の段落に 14px と指定しました。外側は20pxでも、中の文字は自分に指定された14pxです。会場の案内は囲みの外なので、そのままです。",
        html: wallNote, css: ".wall { font-size: 20px; }\n.credit { font-size: 14px; }", measure: creditSize,
      },
    ],
    quiz: {
      prompt: "撮影者の段落自身にはサイズ指定がありません。外側を18pxから22pxにすると撮影者は何pxになりますか？",
      options: ["18px", "40px", "16px", "22px"], correct: 3,
      reasons: ["前の値は外側で変更されました。", "親の値を足す計算ではありません。", "外側から受け取れる文字サイズがあります。", "自分の指定がないので、外側の22pxを受け取ります。"],
    },
    exercise: {
      field: "css", html: wallNote, css: ".wall { font-size: 18px; }", measure: creditSize,
      task: "まず、囲みを22pxにすると撮影者が何pxになるか予想してください。それから外側の .wall だけを22pxに変え、表示の実測値と比べましょう。会場の案内の大きさは保ちます。",
      hint: "中の .credit にルールを書き足さず、今ある .wall の数値を変えます。",
      answer: ".wall { font-size: 22px; }",
      build: { code: "① { font-size: ②; }", slots: [["変更する囲み", ".credit", ".wall"], ["外側のサイズ", "18px", "22px"]] }, review: 0,
    },
  },
  {
    id: "root-size", title: "remが何pxになるか確かめる", topic: "CSS",
    goal: "ページ全体の基準とすぐ外側の囲みを区別し、remから表示サイズを求める。",
    slides: [
      {
        title: "ページの基準一つ分を1remと呼ぶ",
        body: "html はページ全体を囲む一番外側の要素です。ここではその文字サイズを16pxにしました。1rem はこの基準一つ分。1.5rem なら 16 × 1.5 で24pxです。",
        html: wallNote, css: "html { font-size: 16px; }\n.credit { font-size: 1.5rem; }", measure: creditSize,
      },
      {
        title: "すぐ外側のサイズとは別に考える",
        body: "囲みの .wall だけを20pxから28pxへ変えました。撮影者に指定した1.5remの基準は、どちらも html の16pxです。両方の実測値を見て、さっきの継承と比べましょう。",
        html: wallNote, before: "html { font-size: 16px; }\n.wall { font-size: 20px; }\n.credit { font-size: 1.5rem; }", css: "html { font-size: 16px; }\n.wall { font-size: 28px; }\n.credit { font-size: 1.5rem; }", measure: creditSize,
      },
    ],
    quiz: {
      prompt: "html の文字サイズが20pxで、撮影者が1.5remなら、何pxで表示されますか？",
      options: ["20px", "30px", "15px", "21.5px"], correct: 1,
      reasons: ["20pxは1remの値です。", "20 × 1.5 で30pxになります。", "1.5remの基準はこのページの20pxです。", "remの数は足すのでなく、基準のサイズに掛けます。"],
    },
    exercise: {
      field: "css", html: wallNote, css: "html { font-size: 20px; }\n.credit { font-size: 1rem; }", measure: creditSize,
      task: "ページの基準を20pxに保ち、撮影者を基準の1.5倍にしてください。基準が変わっても同じ割合になるよう rem で書き、実測値を確かめましょう。",
      hint: "20pxの1.5倍は30px。固定の30pxを直接書かずに、撮影者の font-size を 1.5rem にします。",
      answer: "html { font-size: 20px; }\n.credit { font-size: 1.5rem; }",
      build: { code: "html { font-size: 20px; }\n.credit { font-size: ①; }", slots: [["ページの基準の1.5倍", "30px", "1rem", "1.5rem"]] }, review: 0,
    },
  },
];
