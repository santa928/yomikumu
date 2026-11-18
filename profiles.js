"use strict";

const authorBio = '<p class="bio">丘の上で見つけた草花を、\n一枚ずつ紙に写しています。<br>次は春の草を集めます。</p>';
const authorNames = '<h2 class="name">三浦ハナ</h2>\n<h2 class="name">谷ユウ</h2>\n<p>展示のご案内</p>';
const selectedNames = '<p class="badge">三浦ハナ</p>\n<p class="badge picked">谷ユウ（選択中）</p>';
const authorTheme = ':root { --ink: navy; }\n.profile h2 { color: var(--ink); }\n.picked { border-left: 4px solid var(--ink); }';
const authorPair = '<article class="profile">\n  <h2>島サト</h2><p>豆本を作ります。</p>\n</article>\n<article class="profile picked">\n  <h2>浜ナオ</h2><p>選択中</p><p>石を描きます。</p>\n</article>\n<p>受付は入口です。</p>';
const pairTheme = authorTheme.replace("navy", "teal");

const profileLessons = [
  {
    id: "bio-lines", title: "紹介文の行と行を少し離す", topic: "CSS",
    goal: "文字の大きさ・書体・行間を一つずつ変えて違いを見分ける。",
    slides: [
      {
        title: "行と行の間を広げてみよう",
        body: "行をたどって紹介文を読み、「行を少し離す」を押してみましょう。文字の大きさは同じまま、次の行との間が広がります。line-height: 1.6 は、一行分の高さを文字サイズの1.6倍にする指定です。",
        html: authorBio, css: ".bio { font-size: 16px; line-height: 1; }",
        tryCss: { label: "行を少し離す", css: ".bio { font-size: 16px; line-height: 1.6; }" },
      },
      {
        title: "書体だけを変える",
        body: "font-family は文字の形を選ぶ指定です。serif は明朝体など、sans-serif はゴシック体などの仲間です。どちらも16px。実際に使われる書体は端末によって変わります。",
        html: authorBio, before: ".bio { font-family: serif; font-size: 16px; }", css: ".bio { font-family: sans-serif; font-size: 16px; }",
      },
      {
        title: "文字だけを大きくする",
        body: "一行の高さを28pxにそろえて、文字だけ16pxから20pxに変えました。今度は文字そのものが大きくなります。同じ場所に表示できる文字数も見比べましょう。",
        html: authorBio, before: ".bio { font-size: 16px; line-height: 28px; }", css: ".bio { font-size: 20px; line-height: 28px; }",
      },
    ],
    quiz: {
      prompt: "文字の形も大きさも気に入っています。行同士が近いとき、まず変えるものは？",
      options: ["font-family", "line-height", "文字の色", "border"], correct: 1,
      reasons: ["書体を選ぶ指定です。", "一行分の高さが変わり、次の行をたどりやすくできます。", "色を変えても行の間は変わりません。", "border は枠線です。"],
    },
    exercise: {
      field: "css", html: authorBio, css: ".bio { font-size: 16px; line-height: 1; }",
      task: "16pxの紹介文を保ち、一行分の高さを24pxにしてください。文字サイズの1.5倍です。",
      hint: ".bio の line-height を1.5にします。今回は文字サイズを変えません。",
      answer: ".bio { font-size: 16px; line-height: 1.5; }",
      build: { code: ".bio { font-size: 16px; ①: ②; }", slots: [["行に割り当てる高さ", "line-height", "font-family"], ["16pxの1.5倍", "1", "1.5"]] }, review: 0,
    },
  },
  {
    id: "name-colors", title: "文字とその背景を一組で選ぶ", topic: "CSS",
    goal: "同じ文字色でも、背景によって読み取りやすさが変わることを確かめる。",
    slides: [
      {
        title: "白い文字の後ろを暗くする",
        body: "背景に近い色の文字は輪郭を見分けにくくなります。二つの名札はどちらも白い文字です。background-color で背景だけを明るい灰色から紺色に変えました。どちらに何と書いてありますか？",
        html: '<p class="badge">木版画の体験会</p>', before: ".badge { color: white; background-color: silver; }", css: ".badge { color: white; background-color: navy; }",
      },
      {
        title: "カードの外の説明は元の色に保つ",
        body: "すべての p に指定すると、下の説明文にも紺色の背景が付きます。ここでは名札にだけ付けたクラス .badge を選びます。背景を決めたら、一緒に使う文字の色も指定しましょう。",
        html: '<p class="badge">受付担当</p>\n<p>入口でお待ちしています。</p>', css: ".badge { color: white; background-color: navy; }",
      },
    ],
    quiz: {
      prompt: "紺色の名札の背景が決まりました。白い文字と紺色の文字なら、より読み取りやすいのは？",
      options: ["紺色の文字", "両方同じ", "白い文字", "文字を透明にする"], correct: 2,
      reasons: ["同じ紺色では文字が背景に溶け込みます。", "文字と背景の明るさの差が異なります。", "白と紺では明るさの差があり、輪郭を見分けやすくなります。", "透明にすると名前を読めません。"],
    },
    exercise: {
      field: "css", html: '<p class="badge">案内係</p>\n<p>ご質問はこちらへ。</p>', css: ".badge { color: navy; background-color: navy; }",
      task: "案内係の名札を紺色の背景と白い文字にしてください。下の説明文はそのまま残しましょう。",
      hint: "背景はすでに navy です。.badge の color を white にします。",
      answer: ".badge { color: white; background-color: navy; }",
      build: { code: ".badge { color: ①; background-color: ②; }", slots: [["文字の色", "white", "navy"], ["背景の色", "navy", "white"]] }, review: 1,
    },
  },
  {
    id: "picked-mark", title: "選択中の名札に線を足す", topic: "CSS",
    goal: "色の違いが分かりにくくても、選択中の人を文字と線で見つけられるようにする。",
    slides: [
      {
        title: "「選択中」の言葉を残す",
        body: "二人の名札から、今選ばれているのは誰でしょう。「選択中」と書いてあれば、色が分かりづらい場所でも判断できます。読み上げでも名前と一緒に状態を聞けます。",
        html: selectedNames,
      },
      {
        title: "片方だけに縦の線を付ける",
        body: "半角スペースで区切ると、同じ要素に二つのクラスを付けられます。badge は両方の名札、picked は選択中の名札だけの名前です。border-left で左側に太さ4pxの実線を足しました。",
        html: selectedNames, css: ".badge { padding: 4px; }\n.picked { border-left: 4px solid navy; }",
      },
    ],
    quiz: {
      prompt: "選択状態を、色の違いに頼らず見つけられる組み合わせは？",
      options: ["赤と緑だけ", "少し明るい青と青だけ", "どちらにも同じ線だけ", "「選択中」の文字と選んだ札だけの線"], correct: 3,
      reasons: ["色の判別が難しいときに区別できません。", "明るさが近く、違いに気づかないことがあります。", "両方の見た目が同じになります。", "文字を読む方法と線の形を見る方法で状態が分かります。"],
    },
    exercise: {
      field: "css", html: selectedNames, css: ".badge { padding: 4px; }",
      task: "「選択中」の名札だけに、左側4pxの実線を付けてください。色は自由です。",
      hint: "両方を選ぶ .badge は残し、その下に .picked の border-left を追加します。",
      answer: ".badge { padding: 4px; }\n.picked { border-left: 4px solid; }",
      build: { code: ".badge { padding: 4px; }\n① { ②: 4px solid; }", slots: [["線を付ける相手", ".badge", ".picked"], ["左だけの線", "color", "border-left"]] }, review: 1,
    },
  },
  {
    id: "shared-ink", title: "二人の名前に同じ色を渡す", topic: "CSS",
    goal: "色を一か所に書き、そこを変えるだけで複数の名前に反映する。",
    slides: [
      {
        title: "何度も使う色に名前を付ける",
        body: "作者が増えても一か所で色を変更できるようにします。:root はこのページの一番外側を選びます。その中で --ink という名前に navy を入れました。先頭にハイフンを二つ付けるのが、こうしたCSSの変数の書き方です。",
        html: authorNames, css: ":root { --ink: navy; }",
      },
      {
        title: "名前から色を取り出す",
        body: "var(--ink) は「--ink に入っている値をここで使う」という意味です。「共通色を変える」を押してみてください。変えたのは :root の一か所。両方の作者名に届き、下の説明文は元のままです。",
        html: authorNames, css: ":root { --ink: navy; }\n.name { color: var(--ink); }",
        tryCss: { label: "共通色を変える", css: ":root { --ink: teal; }\n.name { color: var(--ink); }" },
      },
    ],
    quiz: {
      prompt: "二人とも color: var(--ink) で色を読んでいます。両方を一度に変えるには？",
      options: [":root の --ink の値を変える", "一人目の文字を消す", "各見出しに直接別の色を書く", "紹介文を太くする"], correct: 0,
      reasons: ["二人が同じ名前から値を受け取っています。", "色の設定は変わりません。", "別々に直す手間が残ります。", "作者名の色には届きません。"],
    },
    exercise: {
      field: "css", html: authorNames, css: ":root { --ink: teal; }\n.name { color: navy; }",
      task: "二人の名前に --ink の青緑色（teal）を渡してください。あとで --ink を変えても両方に届き、展示の案内文は元の色を保つようにします。",
      hint: "固定の navy を、--ink にある値を読む var(--ink) に変えます。",
      answer: ":root { --ink: teal; }\n.name { color: var(--ink); }",
      build: { code: ":root { --ink: teal; }\n① { color: ②; }", slots: [["共通の色を使う相手", "p", ".name"], ["変数から値を読む", "teal", "var(--ink)"]] }, review: 1,
    },
  },
  {
    id: "author-pair", title: "別の二人を同じカードで紹介する", topic: "HTML と CSS",
    goal: "二人の紹介カードを作り、片方の目印を残したまま、共通の色を一度に変える。",
    slides: [
      {
        title: "カードの共通点と一人だけの違い",
        body: "二人とも profile のカードなので名前に同じ色が付きます。二人目には picked も付け、左の線と「選択中」の文字を残しました。「線と名前の色を変える」を押すと、目印の形を保ったまま両方のカードに変更が届きます。",
        html: authorPair, css: authorTheme, tryCss: { label: "線と名前の色を変える", css: pairTheme },
      },
    ],
    quiz: {
      prompt: "三人目を追加し、今選ばれている浜ナオだけに目印を残します。三人目に付けるクラスは？",
      options: ["picked だけ", "profile picked", "profile だけ", "全員に picked"], correct: 2,
      reasons: ["共通のカード用クラスがありません。", "三人目にも選択中の線が付いてしまいます。", "共通の見た目だけを受け取り、選択中の目印は浜ナオに残ります。", "誰を選んだか区別できません。"],
    },
    exercise: {
      field: "both",
      html: '<article class="profile">\n  <h2>島サト</h2><p>豆本を作ります。</p>\n</article>\n<p>受付は入口です。</p>', css: authorTheme,
      task: "島サトに続けて、浜ナオを「石を描きます。」と紹介する二枚目のカードを作ります。浜ナオだけに「選択中」と左の実線を付け、CSSの --ink を teal に変えて二人の名前を青緑色にしてください。カード外の受付案内はそのままです。",
      hint: "最初の article を見本にもう一つ書き、二人目には profile と picked を付けます。色は :root の --ink 一か所で変更します。",
      answer: authorPair, answerCss: pairTheme,
      build: { task: "二枚とも共通のカードにし、浜ナオだけに選択中の線を付けましょう。共通色は青緑色に準備してあります。", code: authorPair.replace('class="profile"', 'class="①"').replace('class="profile picked"', 'class="②"'), slots: [["島サトのカード", "profile", "picked"], ["選択中の浜ナオのカード", "profile", "profile picked"]] }, review: 0,
    },
  },
];
