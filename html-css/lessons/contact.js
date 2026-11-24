"use strict";

const museumLinks = ["https://www.tnm.jp/", "https://www.kahaku.go.jp/"];
// 書き出したHTMLを単体で開いても、教材の arrow.png を表示できるようにする。
const contactArrow = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAAA4CAIAAACqiesdAAAA1klEQVR42u3c7QnCQAwG4E7iSM7guv4X3KILCOIM0lxyJA+8C/SBo9d89Hi+XxKYA8ES0Nv9IRcDFChQoDIb9Ps5gQaD7mPaB3QT1m6g5aYNQWtNe4IWsnYGLTFtDppv2h802XQEaCbrINAc01mgCabjQFezDgVdZzoXdJHpaNAVppGgVx6sNkD3NQUabAo0mBVosClQoI68l5JrE9CWF3ufnoojiiPKdwrMWiBANem0kQ06ADWKY1jMOKOBW6BGwi0tWKsBavHLaqIABQpU/gUVf8XZND/YV+aGSXrZlwAAAABJRU5ErkJggg==";
const museumAnchor = '<a href="https://www.kahaku.go.jp/">国立科学博物館</a>';
const rightSign = '<img src="arrow.png" alt="受付は右です">';
const visitorField = '<label for="note">見学メモ</label>\n<input id="note">';
const resetNote = '<button type="reset">メモを消す</button>';

const contactLessons = [
  {
    id: "museum-link", title: "同じページへのリンクと外部リンクを使い分ける", topic: "HTML",
    goal: "同じページの見出しへ行くリンクと、別のサイトを開くリンクを使い分ける。",
    slides: [
      {
        title: "同じページ内と別サイトへのリンクを試す",
        body: "「受付へ」を押すと下の見出しへ移ります。「東京国立博物館」を押すと、実際の公式サイトが別のタブで開きます。教材のタブに戻って、二つの href を見比べましょう。",
        html: '<a href="#desk">受付へ</a>\n<p><a href="https://www.tnm.jp/">東京国立博物館</a></p>\n<h2>展示室</h2>\n<p>作品は二階です。</p>\n<h2 id="desk">受付</h2>',
        previewHeight: 115,
      },
      {
        title: "リンクの表示文字と移動先を分ける",
        body: "href の引用符の中に、行き先の住所（URL）を書きます。別のサイトには https:// から始まる住所を使えます。タグの間には、押す人が行き先を想像できる名前を書きます。",
        html: '<a href="https://www.tnm.jp/">東京国立博物館の案内</a>',
      },
    ],
    quiz: {
      prompt: "押すと別のサイトを開き、画面には「博物館の案内」と表示したい。どこにURLを書きますか？",
      options: ["開始タグの href の値", "開始タグと終了タグの間", "終了タグの中", "見出しの id の値"], correct: 0,
      reasons: ["href がリンクの行き先です。", "そこには押す人に見える文字を書きます。", "終了タグはリンクの終わりです。", "id はこのページ内の場所に付けた名前です。"],
    },
    exercise: {
      field: "html", css: "", html: '<a href="#desk">国立科学博物館</a>',
      task: "リンクの名前「国立科学博物館」を残して、行き先を https://www.kahaku.go.jp/ に変えてください。",
      hint: "href の引用符の中を、#desk から公式サイトのURLに入れ替えます。",
      answer: museumAnchor,
      build: { code: '<a ①="②">国立科学博物館</a>', slots: [["行き先を書く属性", "href", "id"], ["公式サイトの住所", "#desk", "https://www.kahaku.go.jp/"]] },
      review: 1,
    },
  },
  {
    id: "sign-image", title: "画像を表示し、代わりに読める説明を付ける", topic: "HTML",
    goal: "受付の矢印を表示し、絵が見えないときにも行き先を伝える。",
    slides: [
      {
        title: "画像のファイルを指定する",
        body: "この教材には、右を指す矢印を描いた arrow.png という画像があります。img は画像を一枚置くタグです。src にファイルの場所を書くと、その絵が表示されます。img には終了タグがありません。",
        html: rightSign,
      },
      {
        title: "画像が届かなかったら何が伝わる？",
        body: "今度は src を存在しない画像名に変えました。矢印が見えなくても、alt の「受付は右です」を読めば進めます。alt は画像の代わりになる文で、読み上げソフトでも使われます。",
        html: '<img src="missing.png" alt="受付は右です">',
      },
    ],
    quiz: {
      prompt: "受付への右矢印が表示されません。代わりに読んで行き先が分かる文はどれですか？",
      options: ["arrow.png", "画像", "受付は右です", "青と白です"], correct: 2,
      reasons: ["ファイル名だけでは次に進む方向が分かりません。", "画像の内容を言葉にしましょう。", "向かう場所と方向の両方が分かります。", "色は分かりますが、道案内には方向が必要です。"],
    },
    exercise: {
      field: "html", css: "", html: '<img src="missing.png" alt="">',
      task: "矢印の画像 arrow.png を表示し、代わりの文に「受付は右です」と書いてください。",
      hint: "src に画像の名前、alt に絵が伝える案内を書きます。二つとも img の開始タグの中です。",
      answer: rightSign,
      build: { code: '<img src="①" alt="②">', slots: [["表示する画像", "arrow.png", "missing.png"], ["絵の代わりの案内", "矢印の画像", "受付は右です"]] },
      review: 1,
    },
  },
  {
    id: "field-name", title: "ラベルを押して入力欄に移れるようにする", topic: "HTML",
    goal: "入力欄とその名前を結び、文字を押しても入力を始められるようにする。",
    slides: [
      {
        title: "「感想」を押して文字を入れる",
        body: "下の見本で「感想」という文字を押し、「また見たい」と入力してみましょう。押したのは文字でも、入力欄にカーソルが移ります。ここで入力した内容は送信されません。",
        html: '<label for="thought">感想</label>\n<input id="thought">',
      },
      {
        title: "入力欄に名前を付けて結ぶ",
        body: "input は一行の入力欄、label は画面に見える「何を書く欄か」の案内です。input の id でその欄を名付けます。label の for に同じ名前を書くと、二つが結び付きます。for には # を付けません。",
        html: '<label for="visit">訪れたい日</label>\n<input id="visit">',
      },
    ],
    quiz: {
      prompt: '入力欄に id="visit" と書きました。「訪れたい日」を押してその欄に移るには？',
      options: ['label に href="#visit"', 'label に for="visit"', 'input に for="#visit"', '文字だけを太くする'], correct: 1,
      reasons: ["href はリンクの行き先に使います。", "for と入力欄の id の名前がそろいます。", "for はラベル側に書きます。", "見た目を変えても入力欄とは結び付きません。"],
    },
    exercise: {
      field: "html", css: "", html: '<label>見学メモ</label>\n<input id="note">',
      task: "「見学メモ」の文字を押すと、横の入力欄にカーソルが移るようにしてください。",
      hint: "入力欄はすでに note と名付けてあります。label の for から同じ名前を指定します。",
      answer: visitorField,
      build: { code: '<label ①="②">見学メモ</label>\n<input id="note">', slots: [["欄と結ぶ属性", "id", "for"], ["結ぶ相手の名前", "#note", "note"]] },
      review: 1,
    },
  },
  {
    id: "clear-form", title: "ボタンでフォームを最初の状態に戻す", topic: "HTML",
    goal: "何をするボタンかを決め、ひとまとまりの入力だけを最初の状態に戻す。",
    slides: [
      {
        title: "入力と操作を一組にする",
        body: "form は入力欄と、それを操作するボタンの囲みです。この見本の「ひと休み」は type=\"button\"。押しただけでは送信も消去もしません。文字を入れてから押して確かめましょう。",
        html: '<form>\n  <label for="idea">感想</label>\n  <input id="idea">\n  <button type="button">ひと休み</button>\n</form>',
      },
      {
        title: "書いた内容を元に戻す",
        body: "「書き直す」は type=\"reset\"。文字を入れてから押すと、この form の中の欄が最初の空欄に戻ります。送信するボタンの種類は submit です。この練習では入力を送信しません。",
        html: '<form>\n  <label for="idea">感想</label>\n  <input id="idea">\n  <button type="reset">書き直す</button>\n</form>',
      },
    ],
    quiz: {
      prompt: "書きかけのメモを最初の空欄に戻すボタンにするには？",
      options: ["type を省く", 'type="button"', 'type="submit"', 'type="reset"'], correct: 3,
      reasons: ["form 内では通常、種類を省くと送信ボタンになります。", "この種類では押しただけで入力は変わりません。", "submit はフォームを送るための種類です。", "reset は同じ form 内の欄を初期値に戻します。"],
    },
    exercise: {
      field: "html", css: "", html: '<form>\n  ' + visitorField + '\n  <button type="button">メモを消す</button>\n</form>',
      task: "「見学メモ」に書いた内容が「メモを消す」で空欄に戻るようにしてください。結果の中の欄に文字を入れて試せます。",
      hint: "ボタンを入力欄と同じ form に置いたまま、type の値を変えましょう。",
      answer: '<form>\n  ' + visitorField + '\n  ' + resetNote + '\n</form>',
      build: { code: '<form>\n  ' + visitorField + '\n  <button type="①">メモを消す</button>\n</form>', slots: [["ボタンの種類", "button", "submit", "reset"]] },
      review: 1,
    },
  },
  {
    id: "contact-card", title: "画像・リンク・入力欄のある案内を作る", topic: "HTML",
    goal: "一枚の案内で受付の方向を伝え、公式サイトを開いたり自分用のメモを試したりできるようにする。",
    slides: [
      {
        title: "見学前に使うカードを試す",
        body: "見本の矢印は受付の方向を示しています。「東京国立博物館」を押すと公式サイトが別のタブで開きます。教材に戻ったら「感想」を押して文字を入力し、「書き直す」で消してみましょう。",
        html: '<article>\n  <h2>紙の展示室</h2>\n  ' + rightSign + '\n  <p><a href="https://www.tnm.jp/">東京国立博物館</a></p>\n  <form><label for="idea">感想</label><input id="idea">\n    <button type="reset">書き直す</button></form>\n</article>',
      },
    ],
    quiz: {
      prompt: "カードは表示されました。読む人が実際に使えるかを確かめる操作はどれですか？",
      options: ["タグの数だけを数える", "文字を全部太くする", "案内のリンクを開き、欄の名前を押して入力し、消去する", "画像名だけを読む"], correct: 2,
      reasons: ["数が合ってもリンクや欄との結び付きが正しいとは限りません。", "表示の強さでは操作の結果を確かめられません。", "読む人と同じ順で、行き先・入力先・消去を確認できます。", "絵が見えない場合の案内と実際の操作も確かめましょう。"],
    },
    exercise: {
      field: "html", css: "", html: "<article>\n  <h2>森の展示窓口</h2>\n</article>",
      task: "「森の展示窓口」の article に案内を作ります。arrow.png に「受付は右です」と添え、参考先「国立科学博物館」を https://www.kahaku.go.jp/ に結びます。「見学メモ」と入力欄、「メモを消す」ボタンも加えましょう。一つ作るたびに確かめられます。",
      hint: "最初に img を置きます。次はリンク、その次に form の中でラベルと欄を結び、同じ form にリセットボタンを入れます。",
      answer: '<article>\n  <h2>森の展示窓口</h2>\n  ' + rightSign + '\n  <p>' + museumAnchor + '</p>\n  <form>\n    ' + visitorField + '\n    ' + resetNote + '\n  </form>\n</article>',
      build: { code: '<article>\n  <h2>森の展示窓口</h2>\n  <img src="arrow.png" alt="①">\n  <p>' + museumAnchor + '</p>\n  <form>\n    <label for="memo">見学メモ</label>\n    <input id="②">\n    ' + resetNote + '\n  </form>\n</article>', slots: [["画像の代わりに伝えること", "受付は右です", "arrow.png"], ["ラベルの行き先", "note", "memo"]] },
      review: 0,
    },
  },
];
