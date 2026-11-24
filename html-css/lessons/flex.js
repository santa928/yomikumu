"use strict";

const deskRow = '<div class="bar">\n  <span>入口</span>\n  <span>展示室</span>\n</div>';
const barFrame = ".bar { width: 180px; border: 1px solid; }\n.bar span { padding: 2px; border: 1px solid; }";
const flexBar = barFrame + "\n.bar { display: flex; }";
const cardRow = '<div class="row">\n  <article>空</article>\n  <article>夜の小道</article>\n  <article>窓辺</article>\n</div>';
const rowFrame = ".row { display: flex; width: 200px; border: 1px solid; }\n.row article { border: 1px solid; box-sizing: border-box; }";
const wrappedRow = rowFrame + "\n.row { gap: 8px; flex-wrap: wrap; }\n.row article { flex-basis: 84px; }";
const guideLinks = '<nav class="guide">\n  <a href="#works" aria-current="location">作品へ</a>\n  <a href="#desk">受付へ</a>\n</nav>';
const guideTargets = '<h2 id="works">作品</h2>\n<h2 id="desk">受付</h2>';
const fullGuide = guideLinks + '\n<h2 id="works">作品</h2>\n' + cardRow + '\n<h2 id="desk">受付</h2>';
const guideCss = '.guide { display: flex; gap: 12px; }\n.guide a[aria-current="location"] { font-weight: bold; }';

const flexLessons = [
  {
    id: "flex-parent", title: "二つの要素を縦に並べる", topic: "Flexbox",
    goal: "「入口」と「展示室」を囲む要素にCSSを指定して、二つの表示を縦に並べる。",
    slides: [
      {
        title: "横並びの「入口」と「展示室」を縦に並べる",
        body: "見本の「縦に積む」を押してください。Flexboxは、親要素の中で子要素を横や縦に並べる仕組みです。この例では .bar が親で、「入口」と「展示室」の span が子です。.bar の並べる向きを変えると、二つの表示が縦に並びます。",
        html: deskRow, css: flexBar, tryCss: { label: "縦に積む", css: flexBar + "\n.bar { flex-direction: column; }" },
      },
      {
        title: "親と子で変わる場所が違う",
        body: "下の例では span に display: flex を指定しています。これで変わるのは各 span の内側の配置です。二つの span の並びを変えるには、両方を囲む .bar に指定します。",
        html: deskRow, css: barFrame + "\n.bar span { display: flex; }",
      },
      {
        title: "並んでいく向きを決める",
        body: "flex-direction は並べる向きです。横書きのこの例では row が横、column が縦。並んでいく向きを主軸と呼びます。column に変えると主軸も縦になります。",
        html: deskRow, css: flexBar + "\n.bar { flex-direction: column; }",
      },
    ],
    quiz: {
      prompt: "二つの span を縦に並べるには、どの要素に display: flex と flex-direction: column を指定しますか？",
      options: ["一つ目の span", "二つの span を囲む .bar", "二枚目の文字だけ", "札の文字色"], correct: 1,
      reasons: ["一枚目の中身しか並べられません。", ".bar に指定すると、二つの span の並びが変わります。", "二枚目だけでは一枚目との並びを変えられません。", "文字の色は並びを決めません。"],
    },
    exercise: {
      field: "css", html: deskRow, css: barFrame,
      task: "親要素の .bar にFlexboxを指定し、「入口」の下に「展示室」を表示してください。",
      hint: ".bar に display: flex を付け、同じ場所で flex-direction を column にします。",
      answer: flexBar + "\n.bar { flex-direction: column; }",
      build: { code: barFrame + "\n① { display: flex; flex-direction: ②; }", slots: [["二枚を囲む親", ".bar", ".bar span"], ["並ぶ向き", "row", "column"]] }, review: 2,
    },
  },
  {
    id: "along-axis", title: "横並びの要素を左右の端に寄せる", topic: "Flexbox",
    goal: "「入口」と「展示室」を横並びの両端に置く。",
    slides: [
      {
        title: "左右の端に案内を置く",
        body: "親要素に justify-content: space-between を指定すると、「入口」は左端、「展示室」は右端に移ります。二つの間には、横幅の余った分だけ空きができます。",
        html: deskRow, before: flexBar, css: flexBar + "\n.bar { justify-content: space-between; }",
      },
      {
        title: "縦並びでは上端と下端に分かれる",
        body: "同じ space-between でも、column では主軸は上から下です。ここでは親要素の高さが100pxあるので、一枚目は上端、二枚目は下端に置かれます。",
        html: deskRow, css: flexBar + "\n.bar { height: 100px; flex-direction: column; justify-content: space-between; }",
      },
    ],
    quiz: {
      prompt: "高さに余裕がある親要素に flex-direction: column を指定しました。justify-content: space-between は二枚をどこに置きますか？",
      options: ["左端と右端", "両方とも中央", "上端と下端", "同じ場所に重ねる"], correct: 2,
      reasons: ["これは横に並べた場合です。", "中央寄せは center です。", "主軸の向きが縦なので、上下へ分かれます。", "間の余白を作って離します。"],
    },
    exercise: {
      field: "css", html: deskRow, css: flexBar,
      task: "横並びのまま、入口を180pxの枠の左端、展示室を右端に置いてください。名前の長さが変わっても両端に沿うようにします。",
      hint: "横に並ぶ親に justify-content を付け、余りを二枚の間に配ります。",
      answer: flexBar + "\n.bar { justify-content: space-between; }",
      build: { code: flexBar + "\n.bar { ①: ②; }", slots: [["主軸の余りを配る指定", "align-items", "justify-content"], ["両端に置く値", "center", "space-between"]] }, review: 0,
    },
  },
  {
    id: "across-axis", title: "高さが違う二つの要素を上下の中央にそろえる", topic: "Flexbox",
    goal: "「入口」と「展示室」の文字の大きさが違っても、二つの枠の中心が同じ高さに来るようにする。",
    slides: [
      {
        title: "横並びのまま上下の中央にそろえる",
        body: "横に並べた列で上下をそろえる向きは、主軸と直角です。この向きを交差軸と呼びます。align-items: center を親に付けると、文字サイズの違う札が同じ高さの中心でそろいます。",
        html: deskRow, before: flexBar + "\n.bar { height: 80px; align-items: flex-start; }\n.bar span:first-child { font-size: 24px; }",
        css: flexBar + "\n.bar { height: 80px; align-items: center; }\n.bar span:first-child { font-size: 24px; }",
      },
      {
        title: "縦に並べると中央は左右に移る",
        body: "column では主軸が縦、交差軸が横です。縦に積んで align-items: center を使うと、二枚の札が左右の中央に集まります。",
        html: deskRow, css: flexBar + "\n.bar { flex-direction: column; align-items: center; }",
      },
    ],
    quiz: {
      prompt: "縦並びの親要素で、札を左右の中央にそろえる指定は？",
      options: ["align-items: center", "justify-content: space-between", "color: navy", "gap: 0"], correct: 0,
      reasons: ["縦に並べると交差軸は横です。", "この場合は上下の端へ配ります。", "色の指定です。", "間隔と、横のどこにそろえるかは別です。"],
    },
    exercise: {
      field: "css", html: deskRow, css: flexBar + "\n.bar { height: 80px; align-items: flex-start; }",
      task: "高さ80pxの .bar の中で、横に並ぶ二枚の札を上下の中央にそろえてください。各項目は元の高さを保ち、上下に余りを残します。",
      hint: "align-items を親に書きます。flex-start の代わりに中央を表す値を使います。",
      answer: flexBar + "\n.bar { height: 80px; align-items: center; }",
      build: { code: flexBar + "\n.bar { height: 80px; ①: ②; }", slots: [["上下をそろえる指定", "justify-content", "align-items"], ["中央の値", "center", "flex-start"]] }, review: 0,
    },
  },
  {
    id: "wrap-works", title: "横に収まらない要素を次の行に折り返す", topic: "Flexbox",
    goal: "間隔と一枚の基準幅を決め、入りきらない作品を自動で折り返す。",
    slides: [
      {
        title: "隣り合う作品の間を空ける",
        body: "gap は親の内側で、隣り合う作品の間にだけ余白を作ります。ここでは8pxずつです。親の外側に余白を足さずに、三作品を見分けやすくできます。",
        html: cardRow, css: rowFrame + "\n.row { gap: 8px; }",
      },
      {
        title: "折り返してよいと伝える",
        body: "親要素の幅が狭くなると、すべての作品が一行に収まらなくなります。親の flex-wrap を wrap にすると、入らない作品を次の行に送れます。見本で指定した .row の幅は90pxです。",
        html: cardRow, css: rowFrame + "\n.row { width: 90px; gap: 8px; flex-wrap: wrap; }",
      },
      {
        title: "一枚に使いたい幅を決める",
        body: "flex-basis は、並べるときに各作品の幅を決めるときの基準です。これは子の article に指定します。200pxの枠では、84pxの作品二枚と間8pxが収まり、三枚目は次の行になります。",
        html: cardRow, css: wrappedRow,
      },
    ],
    quiz: {
      prompt: "一枚ずつの基準幅を84pxにしたい。flex-basis を書く相手は？",
      options: ["作品を全部囲む .row", "ページ全体", "リンク先の見出し", "各作品の article"], correct: 3,
      reasons: ["親が決めるのは並べ方と間隔です。", "作品だけの必要幅を決めます。", "リンク先は作品の列に影響しません。", "flex-basis は並べられる子に付けます。"],
    },
    exercise: {
      field: "css", html: cardRow, css: rowFrame,
      task: "幅200pxの枠で各作品の基準を84px、間を上下左右8pxにします。先頭二枚を一行に置き、三枚目から折り返してください。",
      hint: "親に gap と flex-wrap を、子の .row article に flex-basis を指定します。",
      answer: wrappedRow,
      build: { code: rowFrame + "\n.row { gap: 8px; flex-wrap: ①; }\n.row article { ②: 84px; }", slots: [["入りきらない場合", "nowrap", "wrap"], ["一枚の基準幅", "flex-basis", "gap"]] }, review: 2,
    },
  },
  {
    id: "flex-guide", title: "Flexboxでリンクを並べ、カードを折り返す", topic: "HTML と CSS",
    goal: "現在地のリンクを見分けられる案内と、作品を追加しても収まる列を作る。",
    slides: [
      {
        title: "現在地を属性で選ぶ",
        body: "nav は案内リンクをまとめる囲みです。今いる場所のリンクに aria-current=\"location\" と書くと、読み上げにも現在地を伝えられます。CSSでは [属性名=値] と書くと、その属性と値を持つ要素を選べます。見本では現在地のリンクだけが太字です。",
        html: guideLinks + "\n" + guideTargets, css: guideCss,
      },
      {
        title: "案内と作品の並べ方を分ける",
        body: "案内は一行に並べ、作品の列には折り返しを許します。二組を別々の親で囲むと、作品を増やしても案内の並びは変わりません。「受付へ」を押し、同じページの受付まで移動できるか確かめましょう。",
        html: fullGuide, css: guideCss + "\n" + wrappedRow, previewHeight: 175,
      },
    ],
    quiz: {
      prompt: "作品が増えて二行になっても、上の案内を横一列に保つには？",
      options: ["作品を削る", "案内と作品を別々の親で囲み、作品の親だけ折り返す", "すべて同じ親の中に並べる", "リンクの文字色だけ変える"], correct: 1,
      reasons: ["作品数を変えずに並べられます。", "それぞれの親が、自分の子の並びを決めます。", "案内と作品を独立して並べにくくなります。", "色は折り返しを決めません。"],
    },
    exercise: {
      field: "both", html: fullGuide.replace("  <article>窓辺</article>\n", ""),
      css: guideCss + "\n" + rowFrame,
      task: "HTMLで三作品目の「窓辺」を加えます。案内は一行のまま、200pxの作品列を基準幅84px・間隔8pxで折り返し、三枚目を次の行に置きましょう。「作品へ」だけが現在地の太字です。",
      hint: "二枚ある article の下に三枚目を加えます。.row と .row article に別々の指定を書くと案内には影響しません。",
      answer: fullGuide, answerCss: guideCss + "\n" + wrappedRow,
      build: { task: "案内の現在地を伝え、空と夜の小道に続く三枚目の作品を組みましょう。折り返すCSSは準備してあります。", code: fullGuide.replace("aria-current=", "①=").replace("<article>窓辺", "<article>②"), slots: [["現在地を伝える属性", "id", "aria-current"], ["次の行に加える作品", "窓辺", "空"]] }, review: 1,
    },
  },
];
