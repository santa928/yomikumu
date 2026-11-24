"use strict";
const quizLists = `<h2 id="heading">作品クイズ</h2>
<ul id="quiz"><li>雨音</li><li>夜明け</li></ul>
<h3>参考作品</h3><ul id="books"><li>砂浜</li></ul>`;
const elementsUnit = {
  id: "elements",
  title: "ページの要素を探して、表示を書き換える",
  intro: "ページの見出しや一覧の行をJavaScriptから探します。見つけた要素の文字を変え、新しい要素を作って追加します。練習では作品名を答えるクイズを使い、「クイズの問題」と「参考作品」の二つの一覧のうち、狙った一覧だけを編集します。",
  demo: {
    tip: "「問題を追加」で一覧を増やし、行のボタンで注目する問題を切り替えてください。参考作品はそのままです。",
    html: '<button id="add">問題を追加</button><ul id="quiz"><li><button>雨音</button></li></ul><h3>参考作品</h3><ul><li>砂浜</li></ul>',
    code: `const list = document.querySelector("#quiz");
document.querySelector("#add").onclick = () => {
  const row = document.createElement("li");
  const button = document.createElement("button");
  button.textContent = "追加問題 " + (list.children.length + 1);
  row.append(button);
  list.append(row);
};
list.onclick = event => {
  if (event.target.tagName !== "BUTTON") return;
  list.querySelectorAll("li").forEach(row => row.classList.remove("chosen"));
  event.target.parentElement.classList.add("chosen");
};`,
  },
  steps: [
    {
      title: "目印のIDで見出しを探して文字を変える",
      explain: "HTMLはページの原稿、DOMはブラウザが原稿を読み取って組み立てた、書き換えられる見取り図です。JavaScriptの document.querySelector(\"#heading\") は、その中から id が heading の要素を探します。見つかったときだけ textContent を変えるので、原稿を保存し直さなくても表示が変わります。見つからなければ null が返り、書き換えません。",
      html: quizLists,
      example: `const title = document.querySelector("#heading");
if (title) title.textContent = "雨の問題";`,
      question: "存在しない #notice を探したら、どんな値が返りますか。",
      options: ["空の見出し", "null（見つからない）", "最後の要素", "0という数"], correct: 1,
      feedback: "見つからない結果はnullです。そのままtextContentを指定すると実行が止まります。",
      task: "見本の文字を一か所変えて、見出しを「光の問題」にしてください。",
      tests: [
        [t => t.q("#heading")?.textContent === "光の問題", "見つけた見出しのtextContentへ「光の問題」を入れます。"],
        [t => t.q("#books")?.textContent.trim() === "砂浜", "見出し以外の参考作品は元のままにします。"],
      ],
    },
    {
      title: "CSSクラスを付け外しして行を強調する",
      html: '<ul id="quiz"><li id="rain">雨音</li><li id="dawn" class="chosen">夜明け</li></ul>',
      explain: "黄色と太字にするルールは、CSSの .chosen に書いてあります。JavaScriptの classList.add は要素に chosen という印を付け、remove は外します。JavaScriptで色を指定し直すのではなく、どの行にCSSのルールを効かせるかを切り替えます。",
      example: `const rain = document.querySelector("#rain");
const dawn = document.querySelector("#dawn");
dawn.classList.remove("chosen");
dawn.classList.add("chosen");`,
      question: "「雨音」だけを強調するには、「夜明け」から何を外しますか。",
      options: ["行そのもの", "文字", "chosenクラス", "一覧のid"], correct: 2, feedback: "chosen クラスを外すと、文字は残り、色と太さが元に戻ります。",
      task: "クイズの一覧に「雨音」があります。コードの最後の行でクラスを付ける先を変え、「雨音」の行だけを目立たせてください。",
      tests: [
        [t => t.q("#rain")?.classList.contains("chosen"), "雨音にchosenを付けます。"],
        [t => !t.q("#dawn").classList.contains("chosen") && t.all("li").length === 2, "夜明けの行を残してchosenだけを外します。"],
      ],
    },
    {
      title: "新しい要素を作って一覧の末尾に追加する",
      html: quizLists,
      explain: "createElement で新しい要素を作れます。見本では「星図」という li を作りますが、まだ一覧には出ていません。list.append(row) を実行すると、その li が一覧の末尾に表示されます。",
      example: `const list = document.querySelector("#quiz");
const row = document.createElement("li");
row.textContent = "星図";
// list.append(row); と書くと一覧に加わる`,
      compare: { label: "一覧につないだ結果と比べる", code: `const row = document.createElement("li");
row.textContent = "星図";
document.querySelector("#quiz").append(row);` },
      question: "見本の最後に list.append(row) を追加したら、クイズの行数はどう変わりますか。",
      options: ["2行から3行", "2行のまま", "3行から2行", "一覧が空になる"], correct: 0, feedback: "作っただけでは表示されません。appendでクイズの一覧につなぐと3行になります。",
      task: "見本で作った「星図」の行は、まだ画面に表示されません。最後のコメントを list.append(row); に置き換え、クイズの一覧の末尾に表示してください。",
      tests: [
        [t => t.q("#quiz > li:last-child")?.textContent.trim() === "星図", "新しい行を作った後、クイズの一覧につないでください。"],
        [t => t.all("#quiz > li").map(row => row.textContent).join("/") === "雨音/夜明け/星図" && t.q("#books").textContent === "砂浜", "元の2行と参考作品も残します。"],
      ],
    },
    {
      title: "一つの一覧に絞って、全行をまとめて変える",
      html: quizLists,
      explain: "querySelectorAllは合う要素をまとめて返します。documentから探すとページ全体が対象です。一覧を先に探し、その一覧からliを探せば、別の一覧に影響しません。forEachは見つかった各行で同じ処理をします。",
      example: `const list = document.querySelector("#books");
list.querySelectorAll("li").forEach(row => {
  row.classList.add("chosen");
});`,
      question: "クイズの行だけを集める書き方はどれですか。",
      options: ['document.querySelectorAll("li")', 'document.querySelectorAll("#quiz li")', 'document.querySelectorAll("#books li")', 'document.querySelector("li")'], correct: 1,
      feedback: "#quizの内側にあるliへ範囲を絞ります。",
      task: "一覧を選ぶ箇所を変えて、クイズの2行だけを目立たせてください。",
      tests: [
        [t => t.all("#quiz > li.chosen").length === 2, "クイズにある両方の行へchosenを付けます。"],
        [t => !t.q("#books .chosen"), "参考作品にも付いています。クイズ一覧から行を探してください。"],
      ],
    },
    {
      title: "練習：新しい行を一覧に追加して、その行だけ強調する",
      html: quizLists,
      explain: "文字、クラス、一覧への接続を組み合わせます。見本は参考作品の末尾に「水輪」を追加します。作成したrowは追加後も同じ行を指すので、その行だけを選べます。",
      example: `const row = document.createElement("li");
row.textContent = "水輪";
document.querySelector("#books").append(row);
row.classList.add("chosen");`,
      question: "クイズに追加した行だけに chosen クラスを付けるには、どれを使いますか。",
      options: ["すべてのli", "作って追加したrow", "参考作品の一覧", "クイズの見出し"], correct: 1, feedback: "作った行を覚えておくと、追加後も同じ要素を変更できます。",
      task: "作品クイズの末尾に「灯台」を一行追加し、その行だけに chosen クラスを付けてください。参考作品は一行のままにしてください。",
      starter: "",
      tests: [
        [t => t.all("#quiz > li").map(row => row.textContent.trim()).join("/") === "雨音/夜明け/灯台", "クイズの元の2行の後ろに「灯台」のliを1つ加えます。"],
        [t => t.q("#quiz > li:last-child").classList.contains("chosen") && t.all("#quiz > li.chosen").length === 1, "追加した行だけにchosenを付けます。"],
        [t => t.all("#books > li").length === 1 && t.q("#books > li").textContent === "砂浜" && !t.q("#books .chosen"), "参考作品の行と見た目は最初の状態に保ちます。"],
      ],
    },
  ],
};
