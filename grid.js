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
    id: "equal-tracks", title: "同じ幅の列を必要な数だけ作る", topic: "Grid",
    goal: "棚の列を親に指定し、余った幅を等分して作品を並べる。",
    slides: [
      {
        title: "棚を二列から三列に変えてみよう",
        body: "「三列で並べる」を押すと四枚目の作品が次の段に移ります。Grid は行と列を持つ棚を作る仕組みです。列を増やしたのは外側の .gallery。作品四枚のHTMLは同じです。",
        html: gridWorks, css: gridBase + "\n.gallery { grid-template-columns: 1fr 1fr; }",
        tryCss: { label: "三列で並べる", css: gridBase + "\n.gallery { grid-template-columns: 1fr 1fr 1fr; }" },
      },
      {
        title: "残った幅を同じ割合に分ける",
        body: "fr は棚の空きを分ける割合です。間の gap を引いた残りに対して、1fr と 1fr なら一つ分ずつ、1fr と 2fr なら一つ分と二つ分。下の二つ目では右の列が広くなります。",
        html: gridWorks, before: gridBase + "\n.gallery { grid-template-columns: 1fr 1fr; }", css: gridBase + "\n.gallery { grid-template-columns: 1fr 2fr; }",
      },
      {
        title: "同じ列を repeat でくり返す",
        body: "repeat(3, 1fr) は「1frの列を3回」です。1fr 1fr 1fr と同じ棚になります。枚数を増やすたびに一枚ずつ幅を指定しなくても、順に次の場所へ入ります。",
        html: gridWorks, css: gridBase + "\n.gallery { grid-template-columns: repeat(3, 1fr); }",
      },
    ],
    quiz: {
      prompt: "等幅の列を三つ作って四枚の作品を入れると、四枚目はどこに入りますか？",
      options: ["一行目のさらに右", "二行目の一列目", "一枚目の上", "棚の外"], correct: 1,
      reasons: ["一行目には三列あります。", "三つの場所が埋まり、次の行の最初に入ります。", "自動で割り当てられる場所は順に進みます。", "次の行を作って棚の中に収めます。"],
    },
    exercise: {
      field: "css", html: gridWorks, css: gridBase,
      task: "四枚の作品を等幅の三列に並べます。四枚目だけを次の行の一列目にし、間隔8pxを保ちましょう。",
      hint: "棚の grid-template-columns で 1fr を三回くり返します。",
      answer: gridBase + "\n.gallery { grid-template-columns: repeat(3, 1fr); }",
      build: { code: gridBase + "\n.gallery { grid-template-columns: repeat(①, ②); }", slots: [["列の数", "2", "3"], ["等分する幅", "1fr", "8px"]] }, review: 2,
    },
  },
  {
    id: "fitting-tracks", title: "入る枚数に合わせて棚の列数を変える", topic: "Grid",
    goal: "一列に必要な最小幅を決め、狭い棚と広い棚で入る枚数を確かめる。",
    slides: [
      {
        title: "一列の最小と最大を決める",
        body: "minmax(100px, 1fr) は一列の幅の範囲です。100pxより狭くせず、余った広さは分け合います。下の例では列数をまず二つに固定し、各列にこの範囲を与えます。",
        html: gridWorks, css: gridBase + "\n.gallery { grid-template-columns: repeat(2, minmax(100px, 1fr)); }", widths: [236],
      },
      {
        title: "列の本数をブラウザに選んでもらう",
        body: "repeat の回数を auto-fit にすると、最小幅の列とその間隔が何本入るかをブラウザが調べます。下の見本は同じコードです。幅236pxでは二列、360pxでは三列になります。",
        html: gridWorks, css: gridAuto, widths: [236, 360],
      },
    ],
    quiz: {
      prompt: "最低100pxの列、間8pxで、棚の内側が220pxです。三枚目はどこに入りますか？",
      options: ["一行目の三列目", "表示されない", "二行目の一列目", "一枚目の上"], correct: 2,
      reasons: ["三列なら間を含めて最低316px必要です。", "入らない分は次の行に回せます。", "二列分は208pxで入ります。三枚目は次の行へ移ります。", "順に空いた場所に入ります。"],
    },
    exercise: {
      field: "css", html: gridWorks, css: gridBase + "\n.gallery { grid-template-columns: 1fr 1fr; }", widths: [236, 360],
      task: "一列の最小幅を100px、間を8pxにして、幅236pxの見本では二列、360pxでは三列にしてください。空いている幅は均等に使います。",
      hint: "repeat の本数を auto-fit にして、その中で minmax(100px, 1fr) を指定します。",
      answer: gridAuto,
      build: { code: gridBase + "\n.gallery { grid-template-columns: repeat(①, minmax(②, 1fr)); }", slots: [["棚に入る本数を選ぶ", "2", "auto-fit"], ["一列の最小幅", "100px", "200px"]] }, review: 1,
    },
  },
  {
    id: "grid-lines", title: "おすすめの作品に二列分を使う", topic: "Grid",
    goal: "列の境界の番号を読み、指定した一枚だけを横に広げる。",
    slides: [
      {
        title: "二つの列には境界の線が三本ある",
        body: "左から順に、棚の左端が1、列の境目が2、右端が3です。grid-column: 1 / 2 は「線1から線2まで」の一列ぶん。置き場所の指定は、動かしたい作品に書きます。",
        html: gridWorks.replace("<article>", '<article class="pick">'), css: gridBase + "\n.gallery { grid-template-columns: 1fr 1fr; }\n.pick { grid-column: 1 / 2; }",
      },
      {
        title: "右端まで使って一枚を見せる",
        body: "終わりを線3に変えると、一枚目が二列をまたぎます。親の二列はそのままなので、ほかの作品は次の行に二枚並びます。",
        html: gridWorks.replace("<article>", '<article class="pick">'), css: gridBase + "\n.gallery { grid-template-columns: 1fr 1fr; }\n.pick { grid-column: 1 / 3; }",
      },
    ],
    quiz: {
      prompt: "二列の棚で、一列目から二列目の終わりまで使う指定は？",
      options: ["1 / 2", "2 / 3", "2 / 2", "1 / 3"], correct: 3,
      reasons: ["中央の境界で止まります。", "右の一列だけです。", "同じ境界を二列分の両端にはできません。", "左端の線1から右端の線3までを使います。"],
    },
    exercise: {
      field: "css", html: gridWorks.replace("<article>", '<article class="pick">'), css: gridBase + "\n.gallery { grid-template-columns: repeat(2, 1fr); }",
      task: "一枚目の「雨の栞」だけを棚の左端から右端まで広げ、その下に青い本と丸い窓を並べましょう。",
      hint: "棚全体ではなく .pick に grid-column を付け、始まりの線と終わりの線を書きます。",
      answer: gridBase + "\n.gallery { grid-template-columns: repeat(2, 1fr); }\n.pick { grid-column: 1 / 3; }",
      build: { code: gridBase + "\n.gallery { grid-template-columns: repeat(2, 1fr); }\n① { grid-column: 1 / ②; }", slots: [["二列を使う作品", ".gallery", ".pick"], ["右端の境界番号", "2", "3"]] }, review: 1,
    },
  },
  {
    id: "grid-catalog", title: "作品棚の中に二つのリンクを並べる", topic: "HTML と CSS",
    goal: "棚の列とカード内の案内を別々に整え、作品を一枚追加する。",
    slides: [
      {
        title: "棚と作品の中では並べる相手が違う",
        body: "外側の .gallery に Grid を使うと、並ぶ相手は作品カードです。カードの内側の .actions に Flexbox を使うと、その中の「メモ」「受付」が並びます。作品のリンクを押して、どちらの場所へ移るか試しましょう。",
        html: threeCatalog, css: gridAuto + "\n" + gridActionStyles, widths: [236],
      },
    ],
    quiz: {
      prompt: "棚の列数はそのままで、カードの中の二つのリンクの間だけを広げたい。変える相手は？",
      options: [".actions の gap", ".gallery の gap", "全見出しの色", "一枚の作品名"], correct: 0,
      reasons: ["二つのリンクを囲む箱の間隔が変わります。", "こちらは作品同士の間隔です。", "色は間隔に影響しません。", "作品名はリンクを並べる箱ではありません。"],
    },
    exercise: {
      field: "both", html: threeCatalog, css: ".gallery { display: grid; gap: 8px; grid-template-columns: repeat(2, 1fr); }\n" + gridActionStyles, widths: [236, 360],
      task: "四枚目に「星の紙」を加え、ほかの作品と同じメモ・受付リンクを入れます。各カード内は横並びのまま、棚を最小100px・間8pxの自動列にし、二つの幅で折り返しを確かめてください。",
      hint: "article 一組を見本に作品を増やします。列を決めるのは .gallery、リンクの間6pxを決めるのは .actions です。",
      answer: gridCatalog, answerCss: gridAuto + "\n" + gridActionStyles,
      build: { task: "作品とリンクを囲む相手を選び、四枚目の作品名を完成させましょう。棚とリンクを並べるCSSは準備してあります。", code: gridCatalog.replace('class="gallery"', 'class="①"').replace("星の紙", "②"), slots: [["作品全体を囲む棚の名前", "gallery", "actions"], ["四枚目の作品", "青い本", "星の紙"]] }, review: 0,
    },
  },
];
