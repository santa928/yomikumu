"use strict";

const profileManuscript = "図書室で冊子を手に取った人に、誰が作ったか、その人に何を頼めるかを紹介します。最後に、実物を見られる場所と時間に案内してください。";
const profileHead = '<header>\n  <h1>栞を刷る小野</h1>\n  <p>古い紙に版画を刷っています。</p>\n  <a href="#prints">作品を見る</a>\n</header>';
const profileOutline = "<h2>自己紹介</h2>\n<h2>得意なこと</h2>\n<h2>作品</h2>\n<h2>連絡先</h2>";
const profileAbout = '<section><h2>自己紹介</h2>\n<p>図書室で冊子を作っています。</p></section>';
const profileSkills = '<section><h2>得意なこと</h2>\n<ul><li>二色刷り</li><li>手製本</li></ul></section>';
const profileWorks = '<section><h2 id="prints">作品</h2>\n<div class="prints">\n  <article><h3>窓の栞</h3><p>朝の光を青で刷りました。</p></article>\n  <article><h3>水辺の本</h3><p>池の形を一冊に綴じました。</p></article>\n</div></section>';
const profileFooter = '<footer><h2>連絡先</h2>\n<p>土曜の午後、図書室の受付で声をかけてください。</p></footer>';
const profileBody = [profileAbout, profileSkills, profileWorks].join("\n");
const guidedPage = [profileHead, "<main>", profileBody, "</main>", profileFooter].join("\n");
const guidedStyle = 'body { color: #173d39; margin: 16px; }\narticle { border: 1px solid; padding: 8px; }\n.prints { display: grid; gap: 8px; }\na:focus { outline: 3px solid navy; outline-offset: 2px; }';
const guidedWide = '@media (min-width: 600px) {\n  .prints { grid-template-columns: 1fr 1fr; }\n}';

const profileProjectLessons = [
  {
    id: "reader-outline", title: "読者の知りたい順に見出しを並べる", topic: "プロフィール制作",
    goal: "依頼文を読み、読者が順番に答えを探せる目次を組む。",
    slides: [
      {
        title: "このページを開くのは誰？",
        body: profileManuscript + " 完成見本の「作品を見る」を押し、栞を見つけてみましょう。",
        html: guidedPage, css: guidedStyle + "\n" + guidedWide, previewHeight: 280,
      },
      {
        title: "自己紹介ページの見出しを決める",
        body: "「誰？」に自己紹介、「何を頼める？」に得意なこと、「実物は？」に作品と連絡先が答えます。文章を書く前に、同じ深さの四つの見出しを読む順に並べます。",
        html: profileOutline,
      },
    ],
    quiz: { prompt: "「二色刷りを頼める？」と知りたい人が最初に探す見出しは？",
      options: ["自己紹介", "得意なこと", "作品", "連絡先"], correct: 1,
      reasons: ["ここでは誰が作っているかを紹介します。", "頼める仕事の種類をここで確かめられます。", "ここでは完成した品を見ます。", "訪ねる場所や時間を読むところです。"] },
    exercise: {
      field: "html", html: "<h2>連絡先</h2>\n<h2>得意なこと</h2>\n<h2>作品</h2>\n<h2>自己紹介</h2>", css: "",
      task: "依頼は「誰が作ったか、何が得意か、作品の例、訪ね方の順に知りたい」です。四つの h2 をこの順に並べてください。",
      hint: "最初と最後の見出しを、開始タグと終了タグごと入れ替えてみましょう。", answer: profileOutline, review: 1,
      build: { code: "<h2>①</h2>\n<h2>得意なこと</h2>\n<h2>作品</h2>\n<h2>②</h2>", slots: [["最初に知りたいこと", "連絡先", "自己紹介"], ["読み終えた人の次の行動", "連絡先", "作品"]] },
    },
  },
  {
    id: "profile-entry", title: "ページの先頭から作品へ移動できるようにする", topic: "プロフィール制作",
    goal: "作者名と短い紹介文を読み、先頭のリンクから作品へ移動できるページを作る。",
    slides: [
      { title: "作者名と紹介文をページの先頭に置く", body: "header に作者名と短い紹介文を置きます。h1 を読めば名前、続く p を読めばどんな作品を作る人か分かります。", html: '<header><h1>栞を刷る小野</h1>\n<p>古い紙に版画を刷っています。</p></header>' },
      { title: "作品を先に見たい人へ", body: "ページ先頭の「作品を見る」を押すと作品の見出しに移ります。リンクの href と見出しの id の組を確かめましょう。", html: profileHead + "\n" + profileWorks, previewHeight: 186 },
    ],
    quiz: { prompt: "作者名を知った読者が作品まで一回で移るために必要なものは？",
      options: ["作者名をもう一つ", "太字の作品名だけ", "作品の見出しを指すリンク", "大きな余白"], correct: 2,
      reasons: ["同じ名前が増えても別の場所へ移れません。", "名前だけでは押して移れません。", "読みたい作品の位置へ直接移れます。", "余白では移動先を指定できません。"] },
    exercise: {
      field: "html", html: profileHead.replace("栞を刷る小野", "作者名").replace("#prints", "#top") + "\n" + profileWorks, css: "",
      task: "原稿の作者名は「栞を刷る小野」です。ページ先頭の見出しをその作者名に直し、「作品を見る」を押したら作品の見出しへ移るようにしてください。",
      hint: "見出しの id を探し、# に続けて同じ名前を href に書きます。", answer: profileHead + "\n" + profileWorks, review: 1,
      build: { code: profileHead.replace("栞を刷る小野", "①").replace("#prints", "②") + "\n" + profileWorks,
        excerpt: profileHead.replace("栞を刷る小野", "①").replace("#prints", "②") + '\n<h2 id="prints">作品</h2>',
        slots: [["ページの作者", "作品を見る", "栞を刷る小野"], ["作品への行き先", "#top", "#prints"]] },
    },
  },
  {
    id: "profile-stories", title: "原稿を自己紹介・得意なこと・作品に分ける", topic: "プロフィール制作",
    goal: "作者の話、頼める仕事、作品の説明をそれぞれ見つけられる本文にする。",
    slides: [
      { title: "文章と箇条書きを使い分ける", body: "「どんな人？」には一文で答えます。「頼める仕事は？」には二色刷りと手製本を一項目ずつ並べます。読みたい見出しのすぐ下に答えがあります。", html: profileAbout + "\n" + profileSkills },
      { title: "一つの作品に一つの説明を付ける", body: "窓の栞は朝の光、水辺の本は池の形を写した作品です。作品名とその説明を同じ article に入れると、並べ方を変えても対応が保たれます。", html: profileWorks },
    ],
    quiz: { prompt: "二作品を並べ替えても「池の形を一冊に綴じました。」が水辺の本の説明だと分かる置き方は？",
      options: ["二作品の前に置く", "連絡先に置く", "二作品の間に置く", "水辺の本と同じ article に置く"], correct: 3,
      reasons: ["作品と紹介文が離れます。", "作品の説明を探す人が見つけにくくなります。", "どちらの説明か迷います。", "作品を動かしても、名前と説明が一緒に残ります。"] },
    exercise: {
      field: "html", html: profileBody.replace("<li>手製本</li>", "").replace("池の形を一冊に綴じました。", ""), css: "",
      task: "原稿の残りは、得意な仕事「手製本」と、水辺の本の説明「池の形を一冊に綴じました。」です。それぞれ読者が探す場所に足してください。",
      hint: "得意な仕事は ul の中の li に、水辺の本の説明はその作品の article の p に置きます。", answer: profileBody, review: 1,
      build: { code: profileBody.replace("手製本", "①").replace("池の形を一冊に綴じました。", "②"),
        excerpt: "<ul><li>二色刷り</li><li>①</li></ul>\n\n<article>\n  <h3>水辺の本</h3>\n  <p>②</p>\n</article>",
        slots: [["頼める仕事", "手製本", "水辺の本"], ["水辺の本の説明", "朝の光を青で刷りました。", "池の形を一冊に綴じました。"]] },
    },
  },
  {
    id: "profile-visit", title: "日時と場所を書き、完成したページを保存する", topic: "プロフィール制作",
    goal: "作品へのリンクと連絡先を載せたプロフィールを作り、スマホとPCで読みやすく整える。",
    slides: [
      { title: "読み終えた人が実際に訪ねられる案内", body: "「受付へ」だけでは、いつ、どこへ行くか迷います。最後の footer に「土曜の午後、図書室の受付で声をかけてください。」と書くと、次の行動が決まります。", html: profileFooter },
      { title: "同じ二作品を異なる幅で確かめる", body: "狭いときは一作品ずつ下へ読み、幅600pxから二作品を横に並べます。ページ先頭のリンクをTabで選んだときは紺色の枠が見えます。練習画面で完成したHTMLを書き出し、ブラウザで開けます。", html: guidedPage, css: guidedStyle + "\n" + guidedWide, widths: [360, 720], previewHeight: 310 },
    ],
    quiz: { prompt: "読者がスマホで作品を読んで、実物を見に行ける状態は？",
      options: ["指で横にずらさず内容と訪問日時・場所を読める", "時刻だけを色で示す", "作品名を省く", "大画面のときだけ案内を出す"], correct: 0,
      reasons: ["内容を順に読んで次の行動を決められます。", "どこを訪ねるか伝わりません。", "どの作品を見たか判断しにくくなります。", "スマホの読者が訪ね方を探せません。"] },
    exercise: {
      field: "both", widths: [360, 720], html: guidedPage.replace("土曜の午後、図書室の受付で声をかけてください。", "受付へ。"), css: guidedStyle,
      task: "依頼の訪問案内は「土曜の午後、図書室の受付で声をかけてください。」です。連絡先に加え、幅360pxでは作品を縦に、720pxでは横に並べます。ページ先頭の「作品を見る」リンクも押してみましょう。",
      hint: "footer の文章を直したら、広い幅だけ .prints に二列の指定を足します。完成ページはこの練習のボタンから書き出せます。", answer: guidedPage, answerCss: guidedStyle + "\n" + guidedWide, review: 1, exportProfile: true,
      build: { task: "原稿には「土曜の午後、図書室の受付で声をかけてください。」とあります。訪ねる日時と場所を順に組んでください。",
        code: guidedPage.replace("土曜の午後", "①").replace("図書室の受付", "②"),
        excerpt: profileFooter.replace("土曜の午後", "①").replace("図書室の受付", "②"),
        slots: [["いつ", "土曜の午後", "日曜の朝"], ["どこへ", "駅の窓口", "図書室の受付"]] },
    },
  },
];
