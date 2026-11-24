"use strict";

const gridWorks = '<div class="gallery">\n  <article>雨の栞</article>\n  <article>青い本</article>\n  <article>丸い窓</article>\n  <article>星の紙</article>\n</div>';
const gridBase = ".gallery { display: grid; gap: 8px; }\n.gallery article { border: 1px solid; padding: 2px; }";
const gridAuto = gridBase + "\n.gallery { grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); }";
const gridActionStyles = ".actions { display: flex; gap: 6px; }";
const gridCatalog = '<div class="gallery">\n' +
  '  <article><h3>雨の栞</h3><div class="actions"><a href="#notes">メモ</a><a href="#desk">受付</a></div></article>\n' +
  '  <article><h3>青い本</h3><div class="actions"><a href="#notes">メモ</a><a href="#desk">受付</a></div></article>\n' +
  '  <article><h3>丸い窓</h3><div class="actions"><a href="#notes">メモ</a><a href="#desk">受付</a></div></article>\n' +
  '  <article><h3>星の紙</h3><div class="actions"><a href="#notes">メモ</a><a href="#desk">受付</a></div></article>\n' +
  '</div>\n<h2 id="notes">作品メモ</h2>\n<p>展示のために作りました。</p>\n<h2 id="desk">受付</h2>';
const threeCatalog = gridCatalog.split("\n").filter(line => !line.includes("<h3>星の紙</h3>")).join("\n");

const gridLessons = [
  {
    id: "equal-tracks", title: "CSS Gridで同じ幅の列を作る", topic: "Grid",
    goal: "作品を囲む要素に列数を指定し、余った幅を等分して作品を並べる。",
    slides: [
      {
        title: "作品の一覧を二列から三列に変える",
        body: "「三列で並べる」を押すと四枚目の作品が次の段に移ります。CSS Gridを使うと、要素を行と列に並べられます。ここでは四つの作品を囲む .gallery の列数を変えました。",
        html: gridWorks, css: gridBase + "\n.gallery { grid-template-columns: 1fr 1fr; }",
        tryCss: { label: "三列で並べる", css: gridBase + "\n.gallery { grid-template-columns: 1fr 1fr 1fr; }" },
      },
      {
        title: "残った幅を同じ割合に分ける",
        body: "fr は、列と列の間隔などを引いた残りの幅を分ける単位です。1fr 1fr なら2列は同じ幅に、1fr 2fr なら右の列は左の2倍の幅になります。下の二つ目では右の列が広くなります。",
        html: gridWorks, before: gridBase + "\n.gallery { grid-template-columns: 1fr 1fr; }", css: gridBase + "\n.gallery { grid-template-columns: 1fr 2fr; }",
      },
      {
        title: "同じ列を repeat でくり返す",
        body: "repeat(3, 1fr) は「1frの列を3回」です。1fr 1fr 1fr と同じ幅の3列ができます。枚数を増やすたびに一枚ずつ幅を指定しなくても、順に次の場所へ入ります。",
        html: gridWorks, css: gridBase + "\n.gallery { grid-template-columns: repeat(3, 1fr); }",
      },
    ],
    quiz: {
      prompt: "等幅の列を三つ作って四枚の作品を入れると、四枚目はどこに入りますか？",
      options: ["一行目のさらに右", "二行目の一列目", "一枚目の上", "一覧の外"], correct: 1,
      reasons: ["一行目には三列あります。", "三つの場所が埋まり、次の行の最初に入ります。", "自動で割り当てられる場所は順に進みます。", "三列が埋まると、次の作品は新しい行に入ります。"],
    },
    exercise: {
      field: "css", html: gridWorks, css: gridBase,
      task: "四枚の作品を等幅の三列に並べます。四枚目だけを次の行の一列目にし、間隔8pxを保ちましょう。",
      hint: ".gallery の grid-template-columns で 1fr を三回くり返します。",
      answer: gridBase + "\n.gallery { grid-template-columns: repeat(3, 1fr); }",
      build: { code: gridBase + "\n.gallery { grid-template-columns: repeat(①, ②); }", slots: [["列の数", "2", "3"], ["等分する幅", "1fr", "8px"]] }, review: 2,
    },
  },
  {
    id: "fitting-tracks", title: "表示幅に合わせて作品の列数を変える", topic: "Grid",
    goal: "一列に必要な最小幅を決め、幅を変えると一行に何枚入るかを確かめる。",
    slides: [
      {
        title: "一列の最小と最大を決める",
        body: "minmax(100px, 1fr) は一列の幅の範囲です。100pxより狭くせず、余った広さは分け合います。下の例では列数をまず二つに固定し、各列にこの範囲を与えます。",
        html: gridWorks, css: gridBase + "\n.gallery { grid-template-columns: repeat(2, minmax(100px, 1fr)); }", widths: [236],
      },
      {
        title: "表示幅に合わせて列数を自動で変える",
        body: "repeat の回数を auto-fit にすると、最小幅の列とその間隔が何本入るかをブラウザが調べます。下の見本は同じコードです。幅236pxでは二列、360pxでは三列になります。",
        html: gridWorks, css: gridAuto, widths: [236, 360],
      },
    ],
    quiz: {
      prompt: "最低100pxの列、間8pxで、一覧の内側の幅が220pxです。三枚目はどこに入りますか？",
      options: ["一行目の三列目", "表示されない", "二行目の一列目", "一枚目の上"], correct: 2,
      reasons: ["三列なら間を含めて最低316px必要です。", "入らない分は次の行に回せます。", "二列分は208pxで入ります。三枚目は次の行へ移ります。", "順に空いた場所に入ります。"],
    },
    exercise: {
      field: "css", html: gridWorks, css: gridBase + "\n.gallery { grid-template-columns: 1fr 1fr; }", widths: [236, 360],
      task: "一列の最小幅を100px、間を8pxにして、幅236pxの見本では二列、360pxでは三列にしてください。空いている幅は均等に使います。",
      hint: "repeat の本数を auto-fit にして、その中で minmax(100px, 1fr) を指定します。",
      answer: gridAuto,
      build: { code: gridBase + "\n.gallery { grid-template-columns: repeat(①, minmax(②, 1fr)); }", slots: [["表示幅に合わせた列数", "2", "auto-fit"], ["一列の最小幅", "100px", "200px"]] }, review: 1,
    },
  },
  {
    id: "grid-lines", title: "CSS Gridで一つの要素を二列分に広げる", topic: "Grid",
    goal: "列の境界の番号を読み、指定した一枚だけを横に広げる。",
    slides: [
      {
        title: "二つの列には境界の線が三本ある",
        body: "左から順に、一覧の左端が1、列の境目が2、右端が3です。grid-column: 1 / 2 は「線1から線2まで」の一列ぶん。置き場所の指定は、動かしたい作品に書きます。",
        html: gridWorks.replace("<article>", '<article class="pick">'), css: gridBase + "\n.gallery { grid-template-columns: 1fr 1fr; }\n.pick { grid-column: 1 / 2; }",
      },
      {
        title: "右端まで使って一枚を見せる",
        body: "終わりを線3に変えると、一枚目が二列をまたぎます。親の二列はそのままなので、ほかの作品は次の行に二枚並びます。",
        html: gridWorks.replace("<article>", '<article class="pick">'), css: gridBase + "\n.gallery { grid-template-columns: 1fr 1fr; }\n.pick { grid-column: 1 / 3; }",
      },
    ],
    quiz: {
      prompt: "二列の一覧で、一列目から二列目の終わりまで使う指定は？",
      options: ["1 / 2", "2 / 3", "2 / 2", "1 / 3"], correct: 3,
      reasons: ["中央の境界で止まります。", "右の一列だけです。", "同じ境界を二列分の両端にはできません。", "左端の線1から右端の線3までを使います。"],
    },
    exercise: {
      field: "css", html: gridWorks.replace("<article>", '<article class="pick">'), css: gridBase + "\n.gallery { grid-template-columns: repeat(2, 1fr); }",
      task: "一枚目の「雨の栞」だけを一覧の左端から右端まで広げ、その下に青い本と丸い窓を並べましょう。",
      hint: "広げたい作品の .pick に grid-column を指定し、開始と終了の線の番号を書きます。",
      answer: gridBase + "\n.gallery { grid-template-columns: repeat(2, 1fr); }\n.pick { grid-column: 1 / 3; }",
      build: { code: gridBase + "\n.gallery { grid-template-columns: repeat(2, 1fr); }\n① { grid-column: 1 / ②; }", slots: [["二列を使う作品", ".gallery", ".pick"], ["右端の境界番号", "2", "3"]] }, review: 1,
    },
  },
  {
    id: "grid-catalog", title: "カードの列と、カード内のリンクの並びを別々に整える", topic: "HTML と CSS",
    goal: "作品一覧の列と各カードのリンクを別々に整え、作品を一枚追加する。",
    slides: [
      {
        title: "作品の並びとリンクの並びを別々に指定する",
        body: "外側の .gallery に Grid を指定すると、作品カードが列に並びます。カードの内側の .actions に Flexbox を使うと、その中の「メモ」「受付」が並びます。作品のリンクを押して、どちらの場所へ移るか試しましょう。",
        html: threeCatalog, css: gridAuto + "\n" + gridActionStyles, widths: [236],
      },
    ],
    quiz: {
      prompt: "作品一覧の列数を保ちつつ、カードの中の二つのリンクの間だけを広げたい。どの要素の指定を変えますか？",
      options: [".actions の gap", ".gallery の gap", "全見出しの色", "一枚の作品名"], correct: 0,
      reasons: ["二つのリンクを囲む要素の間隔が変わります。", "こちらは作品同士の間隔です。", "色は間隔に影響しません。", "作品名はリンクの親要素ではありません。"],
    },
    exercise: {
      field: "both", html: threeCatalog, css: ".gallery { display: grid; gap: 8px; grid-template-columns: repeat(2, 1fr); }\n" + gridActionStyles, widths: [236, 360],
      task: "四枚目に「星の紙」を加え、ほかの作品と同じメモ・受付リンクを入れます。各カード内は横並びのまま、一覧では1列の最小幅を100px、列の間隔を8pxとし、二つの幅で折り返しを確かめてください。",
      hint: "article 一組を見本に作品を増やします。列を決めるのは .gallery、リンクの間6pxを決めるのは .actions です。",
      answer: gridCatalog, answerCss: gridAuto + "\n" + gridActionStyles,
      build: { task: "作品を囲む要素のクラスを選び、四枚目の作品名を完成させましょう。カードとリンクを並べるCSSは準備してあります。", code: gridCatalog.replace('class="gallery"', 'class="①"').replace("星の紙", "②"), slots: [["作品一覧のクラス名", "gallery", "actions"], ["四枚目の作品", "青い本", "星の紙"]] }, review: 0,
    },
  },
];
