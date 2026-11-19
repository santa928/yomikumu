"use strict";

const routeLinks = '<nav><a href="#artist">作者へ</a>　<a href="#works">作品へ</a></nav>';
const routeHeadings = '<h2 id="artist">作者</h2>\n<p>青い紙を刷る人です。</p>\n<h2 id="works">作品</h2>\n<p>港と月の版画です。</p>';
const routePage = routeLinks + "\n" + routeHeadings;
const focusStyle = "a:focus { outline: 3px solid navy; outline-offset: 2px; }";
const nameControls = '<a href="#hours">受付時間を読む</a>\n<p><label for="note">訪問メモ</label><input id="note"></p>\n<img src="arrow.png" alt="受付は右です">\n<h2 id="hours">受付時間</h2>';
const statusPair = '<p class="open">午前の部　受付中</p>\n<p>午後の部　受付終了</p>';
const statusStyle = ".open { color: white; background: navy; }";
const motionPage = '<a class="cue" href="#memo">制作メモへ</a>\n<h2 id="memo">制作メモ</h2>\n<p>二色のインクを使いました。</p>';
const motionBase = ".cue { display: inline-block; }\n.cue:focus { transform: translateX(8px); }";
const quietRule = "@media (prefers-reduced-motion: reduce) {\n  .cue:focus { transform: none; }\n}";
const auditPage = '<nav><a class="cue" href="#works">作品を見る</a>　<a href="#hours">受付時間を読む</a></nav>\n<h2 id="works">作品</h2>\n<img src="arrow.png" alt="受付は右です">\n<h2 id="hours">受付時間</h2>\n<p class="open">午前の部　受付中</p>\n<label for="note">訪問メモ</label><input id="note">';
const auditCss = [focusStyle, statusStyle, motionBase, quietRule].join("\n");

const keyboardLessons = [
  {
    id: "tab-route", title: "Tabで案内の順番をたどる", topic: "操作しやすいHTML",
    goal: "キーボードでリンクの順番を試し、読みたい順にHTMLを並べる。",
    slides: [
      {
        title: "今、どのリンクを操作できる？",
        body: "「次の操作先を試す」を押すと、作者のリンクに枠が付きます。もう一度押すと作品へ。キーボードなら作者のリンクから Tab で次へ、Shift と Tab を一緒に押すと前へ戻れます。この操作先をフォーカスと呼びます。",
        html: routePage, css: focusStyle, focusWalk: true,
      },
      {
        title: "読む順にHTMLを置く",
        body: "href を持つリンクは Tab でたどれます。この見本ではHTMLにある順に、作者へ、作品へと進みます。Enter で今のリンクを開きます。見える並びとHTMLの順をそろえると、次の移動先が予想できます。",
        html: routePage, css: focusStyle, focusWalk: true,
      },
    ],
    quiz: {
      prompt: "二つ目のリンクにいます。一つ前のリンクに戻るキーは？",
      options: ["Enter", "Tab だけ", "Shift と Tab", "文字の R"], correct: 2,
      reasons: ["今のリンクを開きます。", "Tab だけなら次の操作先へ進みます。", "一つ前にフォーカスが戻ります。", "R はリンクの前に戻るキーではありません。"],
    },
    exercise: {
      field: "html", html: '<nav><a href="#works">作品へ</a>　<a href="#artist">作者へ</a></nav>\n' + routeHeadings, css: focusStyle,
      task: "Tab を押すと「作者へ」、次に「作品へ」と進む案内に直してください。各リンクの行き先は同じ名前の見出しに保ちます。",
      hint: "リンクの文字だけを入れ替えず、a の開始タグから終了タグまでを一組ずつ動かします。",
      answer: routePage,
      build: { code: '<nav><a href="①">作者へ</a>　<a href="②">作品へ</a></nav>\n' + routeHeadings, slots: [["最初の行き先", "#works", "#artist"], ["次の行き先", "#works", "#artist"]] }, review: 1,
    },
  },
  {
    id: "visible-focus", title: "今選んでいるリンクに枠を付ける", topic: "操作しやすいCSS",
    goal: "フォーカスを動かすと現在地にだけ付いてくる線を作る。",
    slides: [
      {
        title: "線を消すと現在地が見えなくなる",
        body: "この変更前の見本では、操作先の線を消してあります。「次の操作先を試す」で移動先の名前は変わっても、どこにいるか目で探しにくくなります。次のスライドで直しましょう。",
        html: routePage, css: "a:focus { outline: none; }", focusWalk: true,
      },
      {
        title: "フォーカスがある間だけ線を描く",
        body: ":focus は今操作先になっている要素を選びます。outline は外側に描く線で、隣の文字を押しのけません。outline-offset: 2px で文字から少し離しました。見本で移動し、線がついてくるか見てください。",
        html: routePage, css: focusStyle, focusWalk: true,
      },
    ],
    quiz: {
      prompt: "二つのリンクのうち、今操作する一つにだけ線を描く指定は？",
      options: ["a:focus", "nav", "body", "h2"], correct: 0,
      reasons: ["フォーカスが移ると指定が当たるリンクも移ります。", "案内全体に付きます。", "ページ全体に当たります。", "移動先の見出しを選ぶ指定です。"],
    },
    exercise: {
      field: "css", html: routePage, css: "a:focus { outline: none; }",
      task: "フォーカスのあるリンクだけに3pxの紺色の実線を描き、文字から2px離してください。結果をキーボードでたどり、線が移ることも試せます。",
      hint: "a:focus の outline を 3px solid navy にして、同じ中に outline-offset を足します。",
      answer: focusStyle,
      build: { code: "a① { outline: 3px solid navy; ②: 2px; }", slots: [["今の操作先を選ぶ印", ":hover", ":focus"], ["外側の線を離す指定", "padding", "outline-offset"]] }, review: 1,
    },
  },
  {
    id: "control-names", title: "リンク・入力欄・画像に用途が伝わる名前を付ける", topic: "操作しやすいHTML",
    goal: "リンクだけ読んでも行き先が分かり、欄の名前や絵の案内も読めるようにする。",
    slides: [
      {
        title: "「こちら」を、行き先を表す言葉に",
        body: "リンクだけを順に読む人には、「こちら」だけでは何が開くか分かりません。リンクの文字を「受付時間を読む」に変えると、押す前に行き先を判断できます。",
        html: '<a href="#hours">受付時間を読む</a>\n<h2 id="hours">受付時間</h2>',
      },
      {
        title: "欄の名前を押して試す",
        body: "メモを入れる欄のそばに、ずっと読める label を置きます。label の for と入力欄の id をそろえると、「訪問メモ」を押して実際にその欄に移れます。欄に何か書いた後も名前は残ります。",
        html: '<label for="note">訪問メモ</label>\n<input id="note">',
      },
      {
        title: "絵を見られないときの案内",
        body: "矢印の役目は次に進む方向を伝えることです。「矢印の画像」より「受付は右です」と読めるほうが行動できます。img の alt にその案内を書きます。",
        html: '<img src="arrow.png" alt="受付は右です">',
      },
    ],
    quiz: {
      prompt: "前後の文章を読まなくても受付の時刻が分かるページへ進めるリンク名は？",
      options: ["こちら", "開く", "クリック", "受付時間を読む"], correct: 3,
      reasons: ["「こちら」だけでは行き先を区別できません。", "何を開くかが分かりません。", "手段だけが書かれています。", "何を知るために開くかが先に伝わります。"],
    },
    exercise: {
      field: "html", html: '<a href="#hours">こちら</a>\n<p><label>訪問メモ</label><input id="note"></p>\n<img src="arrow.png" alt="画像">\n<h2 id="hours">受付時間</h2>', css: "",
      task: "「こちら」を「受付時間を読む」に変え、訪問メモのラベルと欄を結び、矢印には「受付は右です」という代替文を付けてください。",
      hint: "まずリンクの文字、次に for と id、最後に img の alt を確かめます。",
      answer: nameControls,
      build: { code: '<a href="#hours">①</a>\n<p><label for="note">訪問メモ</label><input id="note"></p>\n<img src="arrow.png" alt="②">\n<h2 id="hours">受付時間</h2>', slots: [["意味が伝わるリンク名", "こちら", "受付時間を読む"], ["矢印の案内", "画像", "受付は右です"]] }, review: 0,
    },
  },
  {
    id: "ticket-state", title: "受付の状態を色と言葉で知らせる", topic: "操作しやすい表示",
    goal: "色を区別しなくても申し込める回が分かる表示を作る。",
    slides: [
      {
        title: "色を外しても申し込める回が分かる？",
        body: "午前には「受付中」、午後には「受付終了」と書きました。「文字だけで読む」を押して色を外しましょう。色のない表示でも、申し込めるのが午前だと分かります。",
        html: statusPair, css: statusStyle,
        tryCss: { label: "文字だけで読む", css: ".open { color: black; background: white; }" },
      },
      {
        title: "背景と文字の明るさも確かめる",
        body: "この例の濃い背景には白い文字を組み合わせます。文字を紺色にしたまま背景を紺にすると、状態を書いていても読めません。下の二つで同じ言葉がどのくらい読み取りやすいか見比べましょう。",
        html: statusPair, before: ".open { color: navy; background: navy; }", css: statusStyle,
      },
    ],
    quiz: {
      prompt: "色が付かない画面でも午前の受付状態を伝えるには？",
      options: ["緑を明るくする", "「受付中」と書く", "色を二色に増やす", "背景を透明にする"], correct: 1,
      reasons: ["色の違いに頼ることになります。", "状態を言葉で読めます。", "色が見えないと違いが分かりません。", "状態の意味が追加されません。"],
    },
    exercise: {
      field: "both", html: '<p class="open">午前の部</p>\n<p>午後の部　受付終了</p>', css: ".open { color: navy; background: navy; }",
      task: "午前の部に「受付中」を足し、紺色の背景で白い文字にしてください。午後の「受付終了」は残しましょう。",
      hint: "HTMLに見える言葉を足し、CSSでは .open の color を white にします。",
      answer: statusPair, answerCss: statusStyle,
      build: { task: "色を外しても午前と午後の状態を区別できる言葉を並べましょう。", code: '<p class="open">午前の部　①</p>\n<p>午後の部　②</p>', slots: [["午前の状態", "受付終了", "受付中"], ["午後の状態", "受付終了", "受付中"]] }, review: 1,
    },
  },
  {
    id: "quiet-cue", title: "動きを減らす設定でも現在地を伝える", topic: "操作しやすいCSS",
    goal: "操作先が動く見本を試し、動きを減らしたい人には線だけで伝える。",
    slides: [
      {
        title: "操作先の位置を少しずらす",
        body: "translateX は横へずらす指定です。この見本では、操作先に来たリンクだけを8px右へ動かします。動きを減らす設定のときは位置を保ちます。「操作先を試す」を押すと線が付きます。端末の設定は下に表示されます。",
        html: motionPage, css: focusStyle + "\n" + motionBase + "\n" + quietRule, motionDemo: true,
      },
      {
        title: "動きを減らした見本で確かめる",
        body: "@media (prefers-reduced-motion: reduce) は、動きを減らしたいという端末の設定に応じる条件です。中で transform を none に戻すと、位置は変わらず枠は残ります。二つの設定を見本に適用して試せます。",
        html: motionPage, css: focusStyle + "\n" + motionBase + "\n" + quietRule, motionDemo: true,
      },
    ],
    quiz: {
      prompt: "動きを減らす設定の人にも、今いるリンクを伝えるには？",
      options: ["リンクを消す", "設定を無視する", "位置の変化を止め、枠を残す", "枠も文字も消す"], correct: 2,
      reasons: ["操作ができなくなります。", "利用者の希望に沿えません。", "移動を控えつつ、操作先は見えます。", "現在地が分からなくなります。"],
    },
    exercise: {
      field: "css", html: motionPage, css: focusStyle + "\n" + motionBase,
      task: "通常の設定ではフォーカス時の8pxの移動を保ち、動きを減らす設定では移動だけを止めてください。どちらでも紺色の枠は残しましょう。",
      hint: "今の指定の後に prefers-reduced-motion: reduce の条件を書き、中で .cue:focus の transform を none にします。",
      answer: focusStyle + "\n" + motionBase + "\n" + quietRule,
      build: { code: focusStyle + "\n" + motionBase + "\n@media (prefers-reduced-motion: ①) { .cue:focus { transform: ②; } }", slots: [["動きを減らす条件", "reduce", "no-preference"], ["位置の変更を止める値", "none", "translateX(8px)"]] }, review: 1,
    },
  },
  {
    id: "keyboard-exhibit", title: "展示ページをキーボードで点検する", topic: "HTML と CSS",
    goal: "一つずつ直し、作品・受付・メモ欄をキーボードで順に使える展示を作る。",
    slides: [
      {
        title: "作品を見て、受付を読み、メモを書く",
        body: "「次の操作先を試す」かキーボードの Tab で、作品を見る、受付時間を読む、訪問メモの順にたどります。現在地を示す枠と、受付中の言葉を確かめましょう。動きを減らす設定でも作品リンクの枠は残ります。",
        html: auditPage, css: auditCss, focusWalk: true,
      },
    ],
    quiz: {
      prompt: "リンク名を直したあと、読む人が実際に使えるか確かめる操作は？",
      options: ["Tabで順に選び、リンクをEnterで開いてから欄を使う", "CSSの行数を数える", "見出しを全部同じ文字にする", "線を消して終える"], correct: 0,
      reasons: ["順番・名前・操作後の結果が一緒に分かります。", "実際の操作順は確かめられません。", "見出しを区別できなくなります。", "現在地を見つけにくくなります。"],
    },
    exercise: {
      field: "both", html: auditPage.replace("受付時間を読む", "こちら").replace('for="note"', 'for="memo"').replace("午前の部　受付中", "午前の部"),
      css: [focusStyle, statusStyle, motionBase].join("\n"),
      task: "展示の「こちら」を「受付時間を読む」に直し、訪問メモのラベルと欄を結びます。午前に「受付中」を足し、動きを減らす設定では作品リンクをずらさず枠を残します。結果の中をTabとEnterでたどってください。",
      hint: "最初に案内の順とリンクの言葉、次にラベルと受付の言葉を確かめましょう。最後はCSSのメディア条件で動きを選びます。",
      answer: auditPage, answerCss: auditCss,
      build: { task: "作品の次の行き先が読めて、色を外しても受付中だと分かる案内を組みましょう。", code: auditPage.replace("受付時間を読む", "①").replace("午前の部　受付中", "午前の部　②"), slots: [["二番目のリンク名", "こちら", "受付時間を読む"], ["午前の状態", "受付中", "受付終了"]] }, review: 0,
    },
  },
];
