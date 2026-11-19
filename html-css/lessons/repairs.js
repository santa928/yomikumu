"use strict";

const missingPrint = '<img src="port.png" alt="港に浮かぶ舟">';
const movedPrint = missingPrint.replace('src="port.png"', 'src="assets/port.png"');
const exhibitTitles = '<h2>次の展示</h2>\n<h2 class="current">開催中の展示</h2>';
const competingColors = "h2 { color: navy; }\n.current { color: gray; }";
const emailLabel = '<label for="address">連絡先</label>';
const emailForm = (attributes) =>
  "<form>\n  " + emailLabel + '\n  <input id="address" ' + attributes + ">\n</form>";

const repairLessons = [
  {
    id: "repair-image",
    title: "移動した画像の場所を直す",
    topic: "既存ページを直す",
    goal: "表示できない画像の名前を調べ、今あるフォルダーを指定する。",
    slides: [
      {
        title: "画像を移すと、前の場所には何が残る？",
        body: "index.html の隣にあった port.png を assets フォルダーへ移しました。HTMLにはまだ前の場所が書かれているため、港の写真の代わりに説明が表示されます。下の実習ページでも同じ状態から調べられます。",
        html: missingPrint,
        repairKit: true,
      },
      {
        title: "ブラウザが探した場所を確かめる",
        body: "実習ページで写真を右クリックし「検証」を選びます。Network（ネットワーク）を開いて再読み込みすると、port.png の行に404が出ます。これはその場所にファイルがないという応答です。assets/port.png は「今のHTMLの隣の assets フォルダーにある port.png」を表します。",
        html: movedPrint,
        repairKit: true,
      },
    ],
    quiz: {
      prompt: "index.html の隣に assets フォルダーがあり、その中に port.png があります。画像への道順は？",
      options: ["port.png", "assets/port.png", "port.png/assets", "assets.png"],
      correct: 1,
      reasons: [
        "HTMLの隣を探しに行きます。",
        "フォルダー名、次にファイル名の順です。",
        "ファイル名から先に書くと目的の場所に届きません。",
        "これはファイル名一つです。",
      ],
    },
    exercise: {
      field: "html",
      html: missingPrint,
      css: "",
      task: "港の写真は assets/port.png にあります。画像を表示し、読み込めないときの説明「港に浮かぶ舟」を残してください。",
      answer: movedPrint,
      hint: "画像の場所を指定する属性は src です。",
      build: {
        code: '<img src="①" alt="港に浮かぶ舟">',
        slots: [["画像の場所", "port.png", "assets/port.png"]],
      },
      review: 1,
    },
  },
  {
    id: "repair-color",
    title: "どの指定が文字色を決めたか確かめる",
    topic: "既存ページを直す",
    goal: "二つの見出しのうち、開催中の展示だけを緑にする。",
    slides: [
      {
        title: "同じ見出しに二つの色が書かれている",
        body: "h2 は両方の見出しを選びます。「開催中の展示」には .current も当てはまります。この例では、クラス名で指定した色がタグ名で指定した色より優先されるため、その見出しは灰色になります。",
        html: exhibitTitles,
        css: competingColors,
      },
      {
        title: "取り消し線のない指定を編集する",
        body: "実習ページの「開催中の展示」を右クリックして「検証」を選びます。Styles（スタイル）を見ると、h2 の color には取り消し線が付き、.current の color が効いています。そこで gray を green に変えると、一つの見出しだけ緑になります。検証画面の編集は再読み込みで戻るので、手元ではCSSファイルにも同じ修正を保存します。",
        html: exhibitTitles,
        css: competingColors.replace("gray", "green"),
        repairKit: true,
      },
    ],
    quiz: {
      prompt: "他の見出しを紺色のまま残して開催中だけを緑にするなら？",
      options: [
        "すべてのh2を緑にする",
        "本文にgreenと書く",
        "効いている.currentの色を変える",
        "画像名を変える",
      ],
      correct: 2,
      reasons: [
        "他の見出しも変わります。",
        "表示する文字が変わります。",
        "開催中の見出しだけを選ぶ規則です。",
        "画像の名前は文字色に影響しません。",
      ],
    },
    exercise: {
      field: "css",
      html: exhibitTitles,
      css: competingColors,
      task: "「開催中の展示」だけ green に変え、「次の展示」は navy に保ちましょう。",
      answer: competingColors.replace("gray", "green"),
      hint: "クラスに指定された色を確認しましょう。",
      build: {
        code: "h2 { color: navy; }\n① { color: green; }",
        slots: [["緑にする対象", "h2", ".current"]],
      },
      review: 1,
    },
  },
  {
    id: "form-entry",
    title: "入力した値に送信する項目名を付ける",
    topic: "フォームを直す",
    goal: "入力した値を email という名前で受け取れるようにする。",
    slides: [
      {
        tryForm: true,
        title: "欄に書けても、送る値に含まれないことがある",
        body: "下の見本に架空の値 a@example.com を入れ、「この入力で送る内容を見る」を押しましょう。初めは送る項目がありません。label は入力欄を見つけるための名前で、送るデータの項目名は name 属性で指定します。この実習では内容を画面だけに表示します。",
        html: emailForm('type="text"'),
        repairKit: true,
      },
      {
        tryForm: true,
        title: "一つの値を項目名と組にする",
        body: 'name="email" があれば、a@example.com と書いた欄は「email = a@example.com」という組になります。id は引き続きラベルと入力欄を結びます。',
        html: emailForm('type="text" name="email"'),
      },
    ],
    quiz: {
      prompt: "送る内容に email という項目を作る属性は？",
      options: ["id", "for", "name", "class"],
      correct: 2,
      reasons: [
        "idはその要素を指す名前です。",
        "forはラベルの行き先です。",
        "nameで送信項目を名付けます。",
        "classは要素をまとめるための名前です。",
      ],
    },
    exercise: {
      field: "html",
      html: emailForm('type="text"'),
      css: "",
      task: "ラベル「連絡先」から入力欄を選べるまま、入力した値が email という項目に入るようにしてください。",
      hint: "input に name を加えます。",
      answer: emailForm('type="text" name="email"'),
      build: { code: emailForm('type="text" ①="email"'), slots: [["送信する項目名の属性", "name", "class"]] },
      review: 1,
    },
  },
  {
    id: "form-email",
    title: "空欄とアドレスの形式違いを見分ける",
    topic: "フォームを直す",
    goal: "連絡先が空のときと形式が合わないときに送信を止める。",
    slides: [
      {
        tryForm: true,
        title: "空欄のまま進めないようにする",
        body: "required を付けた欄は、入力がないとブラウザが送信を止めます。文字が一つでもあれば、空欄という条件は解消されます。",
        html: emailForm('name="email" type="text" required'),
      },
      {
        tryForm: true,
        title: "アドレスとして読める形かを調べる",
        body: 'type="email" を付けると hello のように @ がない入力をブラウザが検出します。下の見本で空欄、hello、a@example.com の順に試し、どれで「送る内容」が表示されるかを記録しましょう。',
        html: emailForm('name="email" type="email" required'),
        repairKit: true,
      },
    ],
    quiz: {
      prompt: 'type="email" と required の両方があるとき、次へ進める入力は？',
      options: ["空欄", "hello", "@", "a@example.com"],
      correct: 3,
      reasons: [
        "requiredが空欄を検出します。",
        "@の前後が必要です。",
        "名前と宛先がありません。",
        "形式を満たし、文字も入力されています。",
      ],
    },
    exercise: {
      field: "html",
      html: emailForm('name="email" type="text"'),
      css: "",
      task: "空欄と hello のときは進めず、a@example.com は email 項目で受け取れるように変更してください。",
      hint: "空欄と形式を別々の属性で確認します。",
      answer: emailForm('name="email" type="email" required'),
      build: {
        code: emailForm('name="email" type="①" ②'),
        slots: [
          ["値の形式", "text", "email"],
          ["空欄なら止める属性", "required", "readonly"],
        ],
      },
      review: 1,
    },
  },
];
