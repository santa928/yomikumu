"use strict";
const answerForm = `<form id="entry"><label>作品名 <input id="answer"></label>
<button>登録</button></form>
<p id="notice" role="status">入力できます</p><ul id="answers"></ul>`;
const formReader = `const form = document.querySelector("#entry");
const answer = document.querySelector("#answer");
const notice = document.querySelector("#notice");`;
const registerAnswer = formReader + `
form.addEventListener("submit", event => {
  event.preventDefault();
  const value = answer.value.trim();
  if (value === "") {
    notice.textContent = "作品名を入力してください";
    return;
  }
  const row = document.createElement("li");
  row.textContent = value;
  document.querySelector("#answers").append(row);
  notice.textContent = "登録しました";
  answer.value = "";
});`;
const eventsUnit = {
  id: "events", title: "クリックと入力から回答を登録する",
  intro: "作品名を入力し、送信ボタンか Enter キーで回答一覧に追加します。どちらの操作もフォームの submit イベントで処理できます。",
  demo: { html: answerForm, code: registerAnswer, tip: "空白のまま送った後に名前を書き直し、Enterで登録してください。続けて別の作品もボタンから登録できます。" },
  steps: [
    {
      title: "クリック一回につき一回反応する",
      html: '<button id="vote">投票</button><p id="count">0</p>',
      explain: "イベントとはクリックや入力などの出来事です。addEventListenerで、どの出来事を待ち、その時どんな処理をするかを登録します。見本は押すたびに2票入ります。",
      example: `let votes = 0;
document.querySelector("#vote").addEventListener("click", () => {
  votes += 2;
  document.querySelector("#count").textContent = votes;
});`,
      question: "投票ボタンを押したときだけ動かすには、どれを待ちますか。",
      options: ["click", "input", "submit", "load"], correct: 0, feedback: "clickはボタンを操作した時に起きます。",
      task: "一回につき1票入り、二回目には合計2票になるように変えます。",
      tests: [
        [t => { t.click("#vote"); return t.q("#count").textContent === "1"; }, "一回目には1票だけ増やします。"],
        [t => { t.click("#vote"); return t.q("#count").textContent === "2"; }, "次のクリックでも前の票に1を加えます。"],
      ],
    },
    {
      title: "入力のたびに現在の文字を読む",
      html: answerForm,
      explain: "inputは欄の内容を編集するたびに起きます。文字を読む場所はinput要素のvalueです。見本に作品名を入れると、現在の長さが表示されます。",
      example: formReader + `
answer.addEventListener("input", () => {
  notice.textContent = answer.value.length;
});`,
      question: "「雨」を「雨音」に直した直後、answer.valueは何ですか。",
      options: ["雨", "2", "雨音", "空文字"], correct: 2, feedback: "valueで読み取るのは文字数ではなく、いま欄に入っている文字です。",
      task: "文字数の代わりに、現在の入力内容そのものをnoticeに表示します。",
      tests: [
        [t => { t.type("#answer", "雨"); return t.q("#notice").textContent === "雨"; }, "inputのたびに欄のvalueを表示します。"],
        [t => { t.type("#answer", "光"); return t.q("#notice").textContent === "光"; }, "書き換え後の値で表示を更新します。"],
      ],
    },
    {
      title: "フォームで送信をまとめて受ける",
      html: answerForm,
      explain: "submitは回答欄とボタンを包むformで起きます。ボタンのクリックとEnterのどちらでも送信されます。この実習枠では別ページへの送信を制限しています。",
      example: formReader + `
form.addEventListener("submit", () => {
  notice.textContent = "受け付けました";
});`,
      question: "ボタンとEnterの両方で同じ処理をするなら、どこで何を待ちますか。",
      options: ["入力欄でclick", "フォームでsubmit", "ボタンでinput", "フォームでload"], correct: 1, feedback: "どちらの操作もformのsubmitになります。",
      task: "「受け付けました」の代わりに、送信された現在の作品名を表示します。",
      tests: [
        [t => { t.type("#answer", "灯台"); return t.q("#notice").textContent !== "灯台"; }, "入力の瞬間ではなく、送信を待ちます。"],
        [t => { t.q("form").dispatchEvent(new Event("submit", { bubbles:true, cancelable:true })); return t.q("#notice").textContent === "灯台"; }, "フォームでsubmitを待ち、answer.valueを表示します。"],
      ],
    },
    {
      title: "ページ移動を抑えて回答を残す",
      html: answerForm,
      explain: "ブラウザにはフォーム送信でページを移動する既定の動作があります。受け取ったeventのpreventDefault()を呼ぶと、今のページで処理を続けられます。",
      example: formReader + `
form.addEventListener("submit", event => {
  // event.preventDefault(); でページ移動を止める
  notice.textContent = answer.value;
});`,
      question: "名前を表示した後も同じページで操作するための一手はどれですか。",
      options: ["フォームを消す", "入力を空にする", "submitの既定の動作を止める", "文字を数える"], correct: 2, feedback: "preventDefault()でブラウザに任せるページ移動を止めます。",
      task: "コメント部分を実行する一行に変え、送信時のページ移動を抑えてください。",
      tests: [
        [t => { t.type("#answer","小舟"); const e = new Event("submit", { cancelable:true }); t.q("form").dispatchEvent(e); return e.defaultPrevented; }, "渡されたeventでpreventDefault()を呼びます。"],
        [t => t.q("#notice").textContent === "小舟", "移動を止めた後も回答を表示します。"],
      ],
    },
    {
      title: "空白だけの回答を見分ける",
      html: answerForm,
      explain: "trim()は文字列の両端から空白を取り除いた新しい文字列を返します。空文字なら理由を伝えてreturnすると、登録処理に進みません。",
      example: formReader + `
form.onsubmit = event => {
  event.preventDefault();
  const value = answer.value;
  if (value === "") {
    notice.textContent = "作品名を入力してください";
    return;
  }
  notice.textContent = value;
};`,
      question: "「　 」の両端から空白を取り除くと、何が残りますか。",
      options: ["空文字", "空白一つ", "0", "元の空白すべて"], correct: 0, feedback: "空白だけならtrim()の結果は空文字になります。",
      task: "valueを作る一行を変え、空白だけなら入力を促し、両端に空白の付いた作品名なら作品名だけを表示します。",
      tests: [
        [t => { t.type("#answer","　 "); t.q("form").requestSubmit(); return t.q("#notice").textContent.includes("入力"); }, "空白だけの場合に入力する理由を表示します。"],
        [t => { t.type("#answer"," 月夜 "); t.q("form").requestSubmit(); return t.q("#notice").textContent === "月夜"; }, "直して送った時は両端の空白を取り除いた作品名を表示します。"],
      ],
    },
    {
      title: "作品名を一度だけ一覧へ登録する",
      html: answerForm,
      explain: "送信を一か所で受けたら、値を検査してから新しい行を追加します。見本は「受付済」を加えます。送信後にvalueへ空文字を代入すると次の回答を書けます。",
      example: 'const row = document.createElement("li");\nrow.textContent = "受付済";\ndocument.querySelector("#answers").append(row);',
      question: "作品名を一度だけ登録するには、どこで一覧に追加しますか。",
      options: ["ボタンとフォームの両方", "入力のたび", "フォーム送信の一か所", "ページを開いた直後"], correct: 2, feedback: "クリックやEnterが共通して通るsubmitで一度だけ追加します。",
      task: "空欄や空白ならnoticeに「入力してください」と案内します。有効なら両端の空白を除いて一覧へ一行だけ追加し、入力欄を空にします。Enterでもボタンでも同じように登録してください。",
      starter: formReader + '\n',
      tests: [
        [t => { t.type("#answer","　 "); t.click("form button"); return !t.q("#answers li") && /入力.{0,8}ください/.test(t.q("#notice").textContent); }, "空白だけのときは追加せず、入力してくださいと案内します。"],
        [t => { t.type("#answer"," 灯台 "); const e = new Event("submit",{bubbles:true,cancelable:true}); t.q("form").dispatchEvent(e); return e.defaultPrevented && t.all("#answers li").length === 1 && t.q("#answers li").textContent === "灯台"; }, "直して送信すると、移動を抑え、作品名だけを一行登録します。"],
        [t => t.q("#answer").value === "", "登録したら欄を空にし、次の作品を書けるようにします。"],
        [t => { t.type("#answer","森"); t.click("form button"); return t.all("#answers li").map(n=>n.textContent).join("/") === "灯台/森"; }, "送信ボタンを押したときも、入力した作品名を一行だけ追加します。"],
      ],
    },
  ],
};
