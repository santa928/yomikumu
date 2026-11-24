"use strict";

const pictureFiles = new Map([
  ["harbor.png", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAABgCAMAAADFCguTAAAAElBMVEX8893zyI7SZ0lGfYKNsakoRlFkTKt6AAABBklEQVR42u3XQQ6DMAxE0YmL73/lbkpKgQAVE8dI89eW8hDCAKAUoZIkgQQSSCCBBOoCsrkcIFs2HmTrBoPMYkVnILNg0dNAZtGih4HMwkUCCdTMBRIoA4i4qZEMBBKo0Dy5QOCBCstDAxWShwe6/dcBOujefxl6gBhv7yQgJAMhGQjJQEgGQjIQkoGQDIQokNcuvOBrnUC+7Y9ZOshbXZ6kgpwTC+S0KCCndnzlF55Kp3d06V+QR3HapM+CmEF7Y96t1lk/oPWYd23/rBVoMecRbc+qoFeSBBJIoDDQVNsfnFqRx3XLBBJIIIFONvXYNa1NLZBAYz7Qxn6p6ZYJJFAYSKkbvQGs0F9U4V/eGwAAAABJRU5ErkJggg=="],
  ["moon.png", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAACQCAMAAADA1J4TAAAAD1BMVEX789dAUnHotm5ofoIwTlcBgB6bAAABa0lEQVR42u3X227DIBAEULK7///NkdpKDgmwV2ynmnnOcGzsAG4NuUUemwIAAIAB0DBFABZDYYrOAxqm6DygYYpyAB3ZAVCfaoA+M3k9YgCRJuQAIrsQAYgcQgAg8gg3BIhcwn2AZhl/ILjvAIC6y2CKAHwB8L2L3T/acPbvyZWninbRuUg/2d3/bHrC6frqD5CGTygAACwA9ykGeJQ6gKcpAXiZNMBqUgCbEgbYmiDAjgQAdsYLMO8REoCNSAG8HTAQWYC3AxpRALTNgLJbZYG/8i7gpbsF6JvlwGevFJjUyoBFqQJwVCKAqxEAfL93A7HL8d4w7wLC74OtlXifLb3cH1Iv5hYUtZpdEJVywYq+bBfsSKt+wY66GsE3O/KeF0DSly/DHMCPFx5eZumA3rDPjizyDhxEyfAj4JewDi9aRsDgaUSHnwImQiQDaIYYswLmhtijACNDXNGBZAAAAAAAAAAAAIoB5NI8AbIWYvje0lDaAAAAAElFTkSuQmCC"],
]);
const viewportTag = '<meta name="viewport" content="width=device-width, initial-scale=1">';
const widthPage = '<h2>窓辺の作品展</h2>\n<p>入口の窓に、小さな版画を並べました。</p>';
const longShelf = '<div class="prints">\n  <article><h3>朝の港</h3><p>朝の光が防波堤を越えて、一そうの舟を照らしています。</p></article>\n  <article><h3>月の坂</h3><p>坂道から見上げた月を、青い紙に刷りました。</p></article>\n</div>';
const fluidShelf = ".prints { display: grid; gap: 8px; }";
const switchWidth = "@media (min-width: 480px) { .prints { grid-template-columns: 1fr 1fr; } }";
const picturePair = '<img class="whole" src="moon.png" alt="坂の上に丸い月">\n<img class="crop" src="moon.png" alt="坂の上に丸い月">';
const pictureFrames = "img { width: 96px; height: 96px; background: beige; }";
const fourWidths = [320, 479, 480, 720];
const illustratedShelf = '<main class="page">\n  <h2>紙の風景展</h2>\n  <div class="prints">\n' +
  '    <article><img src="harbor.png" alt="朝の港の舟"><h3>朝の港</h3><p>朝の光が防波堤を越えて、小さな舟の白い帆を照らしています。</p></article>\n' +
  '    <article><img src="moon.png" alt="坂の上に丸い月"><h3>月の坂</h3><p>細い坂道を歩きながら見上げた月を、縦長の青い紙に刷りました。</p></article>\n' +
  '  </div>\n</main>';
const centeredPage = ".page { max-width: 560px; margin-inline: auto; }";
const framedPrints = ".prints img { width: 100%; height: 100px; object-fit: contain; background: beige; }";
const exhibitLayout = [centeredPage, fluidShelf, switchWidth, framedPrints].join("\n");

const viewportLesson = {
  id: "device-width", title: "スマホの幅でページを開く", topic: "画面幅",
  goal: "同じページをスマホで開き、端末の幅に合わせて表示する指定を試す。",
  slides: [
    {
      title: "二つのページを開いて比べよう",
      body: "下のリンクをスマホで一つずつ開いてみましょう。内容は同じです。幅の指定がないページでは、ブラウザが広い紙面を想定してから縮め、文字が小さく見えることがあります。ページには実際に使われた幅が表示されます。PCでは二つが同じ幅になることもあります。",
      html: widthPage, viewportSamples: true,
    },
    {
      title: "端末の幅を出発点にする",
      body: "viewport はブラウザがページを並べる表示領域です。head は画面には出ないページ設定を置く場所。そこにこの meta を入れます。width=device-width で端末の幅、initial-scale=1 で最初の倍率を1にします。",
      html: "<head>\n  " + viewportTag + "\n</head>\n" + widthPage,
    },
  ],
  quiz: {
    prompt: "スマホで広い紙面を縮めたように見えます。最初に端末の幅でページを組むための値は？",
    options: ["width=980", "width=device-width", "height=144", "color=navy"], correct: 1,
    reasons: ["980という固定の幅になります。", "端末の表示領域の幅を使います。", "ここで決めたいのは横幅です。", "文字の色はページの幅を決めません。"],
  },
  exercise: {
    field: "html", html: '<head>\n  <meta name="viewport" content="width=980, initial-scale=1">\n</head>\n' + widthPage,
    css: "", usesViewportInput: true,
    task: "固定の980という幅を端末の幅に変えてください。最初の倍率は1で、あとから指で拡大できる状態を保ちます。",
    hint: "viewport の content の中で、width の値だけを device-width に変えます。",
    answer: "<head>\n  " + viewportTag + "\n</head>\n" + widthPage,
    build: { code: '<head>\n  <meta name="viewport" content="width=①, initial-scale=②">\n</head>\n' + widthPage, slots: [["表示の幅", "980", "device-width"], ["最初の倍率", "1", "2"]] }, review: 1,
  },
};

const responsiveLessons = [
  {
    id: "content-break", title: "内容が収まる幅を境に一列から二列へ切り替える", topic: "画面幅",
    goal: "必要な中身の幅を足し、切り替わる直前と直後を比べる。",
    slides: [
      {
        title: "二列に必要な幅を計算する",
        body: "この作品展では説明文を読むため、一枚に228pxほしいと決めました。二枚で456px、間に8px、ページの左右に8pxずつで合計480px。それより狭いときは縦に並べます。境目は紹介する内容によって変えられます。",
        html: longShelf, css: fluidShelf, widths: [320],
      },
      {
        title: "境目の1px手前を調べる",
        body: "min-width: 480px は480pxを含みます。同じ文章でも479pxでは一列、480pxでは二列です。幅を一つだけで確認すると、ちょうど境目で一枚が押し出される間違いに気づきにくくなります。",
        html: longShelf, css: fluidShelf + "\n" + switchWidth, widths: [479, 480],
      },
    ],
    quiz: {
      prompt: "左右の余白と列の間を足して480px必要です。479pxの画面での出発点は？",
      options: ["二列に詰める", "二枚目を消す", "一列で順に読む", "全体を固定幅720pxにする"], correct: 2,
      reasons: ["必要な幅が1px不足します。", "作品数を減らす必要はありません。", "文章を並べ替えず、一列で読めます。", "横スクロールが必要になります。"],
    },
    exercise: {
      field: "css", html: longShelf, css: fluidShelf, widths: [479, 480],
      task: "今ある一列を残し、画面幅480pxから二列にしてください。479pxでは縦に並ぶか見比べましょう。",
      hint: "元の指定の後に @media を書き、画面の幅が480px以上という条件で列を二つに増やします。",
      answer: fluidShelf + "\n" + switchWidth,
      build: { code: fluidShelf + "\n@media (①: 480px) { .prints { grid-template-columns: ②; } }", slots: [["以上を表す条件", "min-width", "max-width"], ["二列の幅", "1fr 1fr", "1fr"]] }, review: 1,
    },
  },
  {
    id: "reading-width", title: "本文が広がりすぎないように幅の上限を決める", topic: "画面幅",
    goal: "狭いときは縮み、広いときは読みやすい幅で中央に置かれる本文を作る。",
    slides: [
      {
        title: "決まった幅と、幅の上限",
        body: "width: 560px では、小さい画面でも560pxを取ろうとします。max-width: 560px は上限です。これを付けた本文は、狭い場所ではその幅まで縮み、広くても560pxで止まります。",
        html: '<main class="page">' + widthPage + '</main>', css: ".page { max-width: 560px; border-bottom: 1px solid; }", widths: [320, 720],
      },
      {
        title: "左右の余白を等しくして本文を中央に置く",
        body: "margin-inline は横書きの本文の左右の外側余白です。auto にすると、幅の上限で余った場所を左右に分けます。下の広い画面では本文の下の線も中央に置かれます。",
        html: '<main class="page">' + widthPage + '</main>', css: centeredPage + "\n.page { border-bottom: 1px solid; }", widths: [320, 720],
      },
    ],
    quiz: {
      prompt: "狭い画面で縮み、広い画面で横幅が広がりすぎないようにするには？",
      options: ["max-width を決める", "min-width を常に720pxにする", "本文を消す", "高さだけ変える"], correct: 0,
      reasons: ["幅の上限を設けられます。", "狭くても720pxを要求してしまいます。", "読む内容を保つことが大切です。", "横幅の問題は解決しません。"],
    },
    exercise: {
      field: "css", html: '<main class="page">' + widthPage + '</main>', css: ".page { width: 560px; }", widths: [320, 720],
      task: "320pxの画面では本文をはみ出さずに広げ、720pxの画面では本文を560px幅にして左右中央に置いてください。",
      hint: "固定の width を上限の max-width に変えます。余った場所は左右に auto で振り分けます。",
      answer: centeredPage,
      build: { code: ".page { ①: 560px; margin-inline: ②; }", slots: [["広がりの上限", "width", "max-width"], ["左右の外側余白", "0", "auto"]] }, review: 1,
    },
  },
  {
    id: "photo-fit", title: "画像の全体を見せるか、枠いっぱいに表示するかを選ぶ", topic: "画像",
    goal: "画像の縦横比を保ち、全体を見せるか、額いっぱいに見せるかを選ぶ。",
    slides: [
      {
        title: "絵の端まで額に入れる",
        body: "縦長の版画を正方形の額に入れてみましょう。object-fit: contain は絵の縦横比を保ち、四辺をすべて収めます。両脇に見える薄い色は額の余白です。「額いっぱいにする」を押し、月の形と絵の端を見比べてください。",
        html: '<img src="moon.png" alt="坂の上に丸い月">', css: pictureFrames + "\nimg { object-fit: contain; }",
        tryCss: { label: "額いっぱいにする", css: pictureFrames + "\nimg { object-fit: cover; }" },
      },
      {
        title: "枠を埋めると、どこが切れる？",
        body: "cover は縦横比を保ちながら額を埋め、はみ出した部分を切り取ります。右の絵は上下が見切れますが、月は丸いままです。全体を紹介したい場面と、一部分を大きく見せたい場面で使い分けます。",
        html: picturePair, css: pictureFrames + "\n.whole { object-fit: contain; }\n.crop { object-fit: cover; }",
      },
    ],
    quiz: {
      prompt: "作品の四辺に押した印まで全部見せたい。額に余白ができてもよいときは？",
      options: ["cover", "fill", "作品を削る", "contain"], correct: 3,
      reasons: ["比率は保ちますが端が切れることがあります。", "額と絵の形が違うと絵が伸びます。", "四辺も見えなくなります。", "絵の全体を縦横比のまま額に入れられます。"],
    },
    exercise: {
      field: "css", html: picturePair, css: pictureFrames,
      task: "同じ縦長の版画を二通りで見せます。96px四方の額で、左は四辺を見せ、右は額いっぱいに切り抜いてください。月は両方とも丸いままにします。",
      hint: ".whole には contain、.crop には cover を使います。変える指定は object-fit です。",
      answer: pictureFrames + "\n.whole { object-fit: contain; }\n.crop { object-fit: cover; }",
      build: { code: pictureFrames + "\n.whole { object-fit: ①; }\n.crop { object-fit: ②; }", slots: [["四辺を見せる", "cover", "contain"], ["額を埋める", "contain", "cover"]] }, review: 1,
    },
  },
  {
    id: "four-widths", title: "画面幅を変えて画像と文章の表示を確かめる", topic: "HTML と CSS",
    goal: "違う形の絵と長い説明を、狭い幅・切り替え前後・広い幅で仕上げる。",
    slides: [
      {
        title: "同じ展示を四つの幅で見る",
        body: "縦長の月と横長の港を、一点ずつ説明します。320pxでは縦並び。479pxから480pxにかけて二列に切り替わり、720pxでは作品一覧の幅が560pxになります。どの絵も四辺が見え、横にスクロールせずに説明文を最後まで読めます。",
        html: illustratedShelf, css: exhibitLayout, widths: fourWidths,
      },
    ],
    quiz: {
      prompt: "広い画面だけで二列を確認しました。切り替えの間違いを見つけやすい次の確認は？",
      options: ["同じ幅のまま更新", "479pxと480pxを両方見る", "説明文を短くするだけ", "二枚目を消す"], correct: 1,
      reasons: ["幅の条件が変わりません。", "境目の直前・直後で期待どおり切り替わるか確かめられます。", "実際の長い説明でも読み切れるかを見ます。", "二列になるか確かめにくくなります。"],
    },
    exercise: {
      field: "css", html: illustratedShelf, css: fluidShelf + "\n.prints img { width: 100%; height: 100px; background: beige; }", widths: fourWidths,
      task: "紙の風景展を仕上げます。479pxまで一列、480pxから等幅の二列。本文は最大560pxで中央に置き、二つの絵は幅いっぱい・高さ100pxの額で四辺を見せます。四つの表示で横にはみ出す箇所がないか確かめましょう。",
      hint: "まず棚を切り替え、次に本文の上限と左右の余白を設定します。最後に画像の object-fit を指定します。",
      answer: exhibitLayout,
      build: { code: centeredPage + "\n" + fluidShelf + "\n@media (min-width: ①) { .prints { grid-template-columns: 1fr 1fr; } }\n.prints img { width: 100%; height: 100px; object-fit: ②; }", slots: [["二列にする境目", "480px", "479px"], ["縦長と横長の全体を見せる", "cover", "contain"]] }, review: 0,
    },
  },
];
