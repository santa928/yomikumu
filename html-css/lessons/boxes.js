"use strict";

const shelfLabels = '<div class="tags">\n  <span class="tag">原画</span>\n  <span class="tag">版画</span>\n</div>';
const labelStyles = ".tags { display: flex; }\n.tag { border: 2px solid; padding: 4px; }";
const ticketMarkup = '<div class="ticket">朝の入場券</div>';
const ticketStyles = ".ticket { width: 120px; padding: 8px; border: 2px solid; }";
const hoursMarkup = '<div class="desk">\n  <a href="#hours">受付時間へ</a>\n</div>\n<h2 id="hours">受付時間</h2>\n<p>午前九時からです。</p>';
const deskStyles = ".desk { width: 160px; border: 1px solid; }";
const longWork = '<article class="piece">\n  <h2>RiverAndMoonlightPaperCollection</h2>\n  <a href="#memo">作品メモへ</a>\n</article>\n<p id="memo">川辺で集めた紙の作品です。</p>';

const boxLessons = [
  {
    id: "outer-space", title: "札の外側を空ける", topic: "CSS",
    goal: "枠の内側にある文字との距離と、隣の札までの距離を別々に変える。",
    slides: [
      {
        title: "二つの枠の間だけを広げる",
        body: "「札の外を広げる」を押して、二つの枠を見比べてください。margin-right は枠の右の外側にあける余白です。最初の札の中の文字は動かず、次の札が右へ離れます。",
        html: shelfLabels, css: labelStyles,
        tryCss: { label: "札の外を広げる", css: labelStyles + "\n.tag { margin-right: 12px; }" },
      },
      {
        title: "文字から順に四つの場所をたどる",
        body: "中央に「原画」という内容、その周りに padding、線の border、その外に margin があります。下の二つ目は padding だけを広げた例。文字から枠までが広がっても、隣の枠までの余白は同じです。",
        html: shelfLabels, before: labelStyles + "\n.tag { margin-right: 12px; }",
        css: labelStyles + "\n.tag { margin-right: 12px; padding: 10px; }",
      },
    ],
    quiz: {
      prompt: "文字と枠の距離はちょうどよく、隣の札だけが近すぎます。どこを広げますか？",
      options: ["padding", "文字サイズ", "margin", "枠線の太さ"], correct: 2,
      reasons: ["padding は枠の内側です。", "文字を大きくすると中身の形が変わります。", "枠と枠の間にあける余白が margin です。", "線を太くしても外側の空きにはなりません。"],
    },
    exercise: {
      field: "css", html: shelfLabels, css: labelStyles,
      task: "札の文字と枠の間を四方6pxにし、二つの札の枠と枠の間を12pxにしてください。2pxの枠は残します。",
      hint: "内側の四方は padding。一方の札の右側に margin-right を付けると次の札との間が空きます。",
      answer: labelStyles + "\n.tag { padding: 6px; margin-right: 12px; }",
      build: { code: labelStyles + "\n.tag { ①: 6px; ②: 12px; }", slots: [["枠の内側", "padding", "margin"], ["右の枠との間", "padding-right", "margin-right"]] }, review: 1,
    },
  },
  {
    id: "border-width", title: "枠まで含めて札の幅を決める", topic: "CSS",
    goal: "同じ幅を指定したとき、内側の余白と枠をどこに数えるかを選ぶ。",
    slides: [
      {
        title: "120pxと書いても外側は140px",
        body: "この札では width: 120px が文字を置く中身の幅です。そこに内側の余白 (padding) が左右に8pxずつ、枠 (border) が左右に2pxずつ加わります。枠の端から端までは 120＋16＋4 で140pxです。",
        html: ticketMarkup, css: ticketStyles, measure: { selector: ".ticket", label: "札", width: true },
      },
      {
        title: "同じ120pxに枠まで収める",
        body: "box-sizing は width に何を含めるかを決めます。border-box なら120pxの中に内側の余白 (padding) と枠 (border) も入ります。余白と枠の太さは同じなので、中身の幅が100pxに縮みます。枠の外の余白 (margin) は含めません。",
        html: ticketMarkup, before: ticketStyles, css: ticketStyles + "\n.ticket { box-sizing: border-box; }", measure: { selector: ".ticket", label: "札", width: true },
      },
    ],
    quiz: {
      prompt: "width が120pxの札で、padding と枠を幅の内側に数えるには？",
      options: ["margin を増やす", "box-sizing: border-box", "文字を太くする", "線だけを消す"], correct: 1,
      reasons: ["margin は幅のさらに外側にあります。", "指定した幅の内側に padding と border を含めます。", "文字の太さは幅の数え方を変えません。", "枠を残したまま収めることができます。"],
    },
    exercise: {
      field: "css", html: ticketMarkup, css: ticketStyles, measure: { selector: ".ticket", label: "札", width: true },
      task: "札の外側までの幅を100pxにしてください。左右の余白8pxと枠2pxを残し、余白と枠を含めて100pxと数える指定にします。",
      hint: ".ticket の width を100pxに変え、box-sizing で枠までを数えるようにしましょう。",
      answer: ".ticket { width: 100px; padding: 8px; border: 2px solid; box-sizing: border-box; }",
      build: { code: ".ticket { width: ①; padding: 8px; border: 2px solid; box-sizing: ②; }", slots: [["希望する全幅", "100px", "120px"], ["幅の数え方", "content-box", "border-box"]] }, review: 1,
    },
  },
  {
    id: "link-area", title: "文字の右側も押せるリンクを作る", topic: "CSS",
    goal: "リンクの表示方法を変え、短い文字の横にある空きも押せるようにする。",
    slides: [
      {
        title: "文字の横を押してみよう",
        body: "枠の中の右端を押してみましょう。最初のリンクは文字の分だけが押せる範囲です。こうして行の一部として並ぶ表示を inline と呼びます。文字そのものを押すと「受付時間」へ移ります。",
        html: hoursMarkup, css: deskStyles, previewHeight: 78,
      },
      {
        title: "一行の幅いっぱいをリンクにする",
        body: "このリンクに display: block を指定すると、押せる範囲が親要素の幅いっぱいに広がります。今度は同じ枠の右端を押してみましょう。文字から離れた場所でも受付時間に移れます。",
        html: hoursMarkup, css: deskStyles + "\n.desk a { display: block; }", previewHeight: 78,
      },
    ],
    quiz: {
      prompt: "160px幅の枠の右端を押してもリンク先に移れるようにしたい。どこを block にしますか？",
      options: ["行き先の h2", "枠の親だけ", "リンクの文字色", "リンクの a"], correct: 3,
      reasons: ["行き先を変えても押せる場所は広がりません。", "外枠だけを広げても、リンクは文字の幅のままです。", "色は場所の広さを決めません。", "リンク自身が枠の幅まで広がり、その範囲を押せます。"],
    },
    exercise: {
      field: "css", html: hoursMarkup, css: deskStyles,
      task: "枠の横幅160pxを保ち、右端を押しても受付時間に移れるようにしてください。リンクの上下にも各6pxの押せる余白を付けます。",
      hint: ".desk a で枠の中のリンクを選びます。横に広げてからリンクの内側に padding を足します。",
      answer: deskStyles + "\n.desk a { display: block; padding: 6px 0; }",
      build: { code: deskStyles + "\n.desk a { display: ①; ②: 6px 0; }", slots: [["一行分を使う表示", "inline", "block"], ["リンクの内側", "padding", "margin"]] }, review: 1,
    },
  },
  {
    id: "narrow-card", title: "長い作品名を狭い画面に収める", topic: "CSS",
    goal: "長い英字の作品名を最後まで読み、横スクロールせずに下のリンクを押せるようにする。",
    slides: [
      {
        title: "小さな枠を押し広げているのは何？",
        body: "見本は幅240pxの小さな画面です。空白のない長い英字は、普通の文章のように途中で折り返せず、枠を越えることがあります。作品名の終わりまで目でたどってみましょう。",
        html: longWork, css: ".piece { padding: 8px; border: 1px solid; }", widths: [240],
      },
      {
        title: "入りきらないときだけ途中で折る",
        body: "overflow-wrap: anywhere は、一語が収まらないときに途中でも折り返せる指定です。作品名を消さずに最後まで表示し、下のリンクを押してメモにも進めます。",
        html: longWork, css: ".piece { padding: 8px; border: 1px solid; overflow-wrap: anywhere; }\n.piece a { display: block; }", widths: [240],
      },
    ],
    quiz: {
      prompt: "長い作品名の最後まで読めて、横に動かさずに済む方法はどれですか？",
      options: ["途中でも折り返せるようにする", "最後の文字を隠す", "カードを画面より広げる", "作品名を消す"], correct: 0,
      reasons: ["文字を残したまま、次の行に続けて表示できます。", "隠れた部分が読めなくなります。", "横に動かさないと端まで見えません。", "作品の名前が伝わりません。"],
    },
    exercise: {
      field: "css", html: longWork, widths: [240],
      css: ".piece { width: 100%; padding: 8px; border: 1px solid; }",
      task: "幅240pxの見本で、カードの左右に8pxの内側余白と1pxの枠を保ち、長い作品名を最後まで読めるようにしてください。リンクはカードの中身の右端からも押せるようにします。",
      hint: "まず width: 100% に枠と余白を含めます。次に作品名を折り返し、最後にリンク自身を行いっぱいに広げましょう。",
      answer: ".piece { width: 100%; padding: 8px; border: 1px solid; box-sizing: border-box; overflow-wrap: anywhere; }\n.piece a { display: block; }",
      build: { code: ".piece { width: 100%; padding: 8px; border: 1px solid; box-sizing: ①; overflow-wrap: ②; }\n.piece a { display: block; }", slots: [["枠まで含める数え方", "content-box", "border-box"], ["長い言葉の折り返し", "normal", "anywhere"]] }, review: 1,
    },
  },
];
