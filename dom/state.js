"use strict";
const tallyHtml = '<button id="plus">回答を一件追加</button><p id="count">0</p>';
const answersHtml = '<h2>回答一覧</h2><ul id="rows"></ul><p id="count"></p>';
const filterHtml = '<label>検索 <input id="filter"></label><button id="clear">絞り込みを解除</button>' + answersHtml;
const initialAnswers = 'const answers = ["雨音", "月影", "雨雲"];';
const drawList = `function draw(items) {
  const list = document.querySelector("#rows");
  list.replaceChildren();
  items.forEach(text => {
    const row = document.createElement("li");
    row.textContent = text;
    list.append(row);
  });
  document.querySelector("#count").textContent = items.length + "件";
}`;
const searchCode = initialAnswers + "\n" + drawList + `
const field = document.querySelector("#filter");
function render() {
  const visible = answers.filter(name => name.includes(field.value));
  draw(visible);
}
field.oninput = render;
document.querySelector("#clear").onclick = () => {
  field.value = "";
  render();
};
render();`;
const testsForSearch = [
  [t => t.all("#rows li").map(n=>n.textContent).join("/") === "雨音/月影/雨雲" && t.q("#count").textContent === "3件", "初回は元の順に3件と件数を表示します。"],
  [t => { t.type("#filter","雨"); return t.all("#rows li").map(n=>n.textContent).join("/") === "雨音/雨雲" && t.q("#count").textContent === "2件"; }, "入力に一致する行から一覧と件数を両方作ります。"],
  [t => { t.type("#filter","石"); return !t.q("#rows li") && t.q("#count").textContent === "0件"; }, "0件の時は前の行を消し、件数も0件にします。"],
  [t => { t.click("#clear"); return t.q("#filter").value === "" && t.all("#rows li").map(n=>n.textContent).join("/") === "雨音/月影/雨雲" && t.q("#count").textContent === "3件"; }, "検索語を空にし、保存した元の3件から描き直します。"],
];
const stateUnit = {
  id:"state", title:"回答を覚えて、一覧を描き直す",
  intro:"一度表示した後もデータを覚えておくと、次のクリックや検索に使えます。回答を絞り込み、元の一覧へ戻してみましょう。",
  demo:{html:filterHtml,code:searchCode,tip:"「雨」と入力して2件、続いて「石」で0件にします。「絞り込みを解除」で全3件に戻ることを確認してください。"},
  steps:[
    {
      title:"二回のクリックの間で値を覚える", html:tallyHtml,
      explain:"クリックの中で毎回let total = 0を実行すると、一回前の値が消えます。ボタンを二度押して表示を見てください。外側で一度だけ用意した変数なら、次の操作でも値を使えます。",
      example:`document.querySelector("#plus").onclick = () => {
  let total = 0;
  total += 1;
  document.querySelector("#count").textContent = total;
};`,
      question:"見本のまま二回押すと、最後の表示は何になりますか。",options:["0","1","2","3"],correct:1,feedback:"押すたびに最初の0から1に増やすため、二回目も1です。",
      task:"totalを作る行を移し、押すたびに1、2と増えるようにしてください。",
      build:['《1》\ndocument.querySelector("#plus").onclick = () => {\n  《2》\n  total += 1;\n  document.querySelector("#count").textContent = total;\n};',["let total = 0;","// 外側では用意しない"],["// 前回の値を使う","let total = 0;"]],
      tests:[
        [t=>{t.click("#plus");return t.q("#count").textContent==="1";},"一回目は0から1に増えます。"],
        [t=>{t.click("#plus");return t.q("#count").textContent==="2";},"初期化をクリックの外へ移し、前回の値から増やします。"],
      ],
    },
    {
      title:"初期状態を最初に表示する",html:tallyHtml,
      explain:"画面の材料にする値を状態と呼びます。関数renderに表示を書くと、最初も操作後も同じ方法で描けます。見本は最初に3件を表示します。",
      example:`let total = 3;
function render() {
  document.querySelector("#count").textContent = total + "件";
}
render();`,
      question:"開いた直後から5件と表示したいとき、最初に何をしますか。",options:["クリックまで待つ","一覧を消す","状態を5にしてrenderを呼ぶ","表示だけを0件にする"],correct:2,feedback:"状態を決め、その値を使う描画関数を一度呼びます。",
      task:"初期状態を5に変え、何も押さなくても5件と表示してください。",
      build:['let total = 《1》;\nfunction render() { document.querySelector("#count").textContent = total + "件"; }\n《2》',["5","3"],["render();","// ボタンを待つ"]],
      tests:[[t=>t.q("#count").textContent==="5件","初期状態を5とし、操作前に5件と表示します。"]],
    },
    {
      title:"更新してから描き直す",html:tallyHtml,
      explain:"renderは呼んだ時点の値を読みます。見本では先に描くため、表示が一回遅れます。ボタンを二度押して確かめてください。",
      example:`let total = 2;
function render() { document.querySelector("#count").textContent = total + "件"; }
render();
document.querySelector("#plus").onclick = () => {
  render();
  total += 1;
};`,
      question:"押した直後に新しい件数を表示する順番はどれですか。",options:["描画→更新","更新→描画","更新→初期化","初期化→描画"],correct:1,feedback:"先に状態を変え、その状態から表示を作ります。",
      task:"二行の順番を入れ替えて、2件から3件、4件へと表示してください。",
      build:['let total = 2;\nfunction render() { document.querySelector("#count").textContent = total + "件"; }\nrender();\ndocument.querySelector("#plus").onclick = () => {\n  《1》\n  《2》\n};',["total += 1;","render();"],["render();","total += 1;"]],
      tests:[[t=>t.q("#count").textContent==="2件","最初に2件を表示します。"],[t=>{t.click("#plus");return t.q("#count").textContent==="3件";},"増やした後に描き直します。"],[t=>{t.click("#plus");return t.q("#count").textContent==="4件";},"二回目も同じ順序で更新します。"]],
    },
    {
      title:"配列から行と件数を作る",html:answersHtml,
      explain:"replaceChildren()は古い行を取り除きます。下のdrawは渡された配列の順に行を作り、同じ配列のlengthで件数を出します。",
      example:'const answers = ["波", "雲"];\n' + drawList + '\ndraw(answers);',
      question:"配列を3件に変えたとき、表示件数にも同じ変化を反映するにはどれを読みますか。",options:["最初の文字数","見出しの長さ","固定した2","表示に使う配列のlength"],correct:3,feedback:"行と件数を同じ配列から読み取れば、一緒に変化します。",
      task:"配列に「月」を一件加え、「波」「雲」「月」の3行と3件を表示してください。",
      build:['const answers = ["波", "雲", 《1》];\n'+drawList+'\ndraw(《2》);',['"月"','"雨"'],["answers","[]"]],
      tests:[[t=>t.all("#rows li").map(n=>n.textContent).join("/")==="波/雲/月","配列に月を追加し、元の順に3行を描きます。"],[t=>t.q("#count").textContent==="3件","一覧に使った配列の件数も表示します。"]],
    },
    {
      title:"元の一覧と絞り込み結果を分ける",html:filterHtml,
      explain:"filterは条件に合う項目を新しい配列に集めます。includesは文字が含まれるかを調べます。全件を保存したanswersから毎回探せば、前の絞り込みを解除できます。",
      example:searchCode.replace('name.includes(field.value)','name === field.value'),
      question:"「雨」の後に「月」を探すとき、どの配列から探しますか。",options:["前回の2件","毎回元の3件","空の配列","件数だけ"],correct:1,feedback:"毎回元の回答から探せば、先ほど画面から消えていた月影も見つかります。",
      task:"完全に同じ文字だけを探す条件を、入力を含む名前に変更します。空の文字はすべての名前に含まれます。",
      build:[searchCode.replace('answers.filter(name => name.includes(field.value))','《1》.filter(name => 《2》)'),["answers","[]"],["name.includes(field.value)","name === field.value"]],
      tests:testsForSearch,
    },
    {
      title:"星の観測記録を絞り込み、全件へ戻す",html:filterHtml,
      explain:"検索語・元の配列・表示に使う配列を分けて考えます。見本は二つの観測地から「丘」を含む地名の一覧を作ります。",
      example:'const places = ["青の丘", "北の森"];\n'+drawList+'\ndraw(places.filter(place => place.includes("丘")));',
      question:"検索が0件で、そのあと解除したときの一覧はどうなりますか。",options:["ずっと0件","最後に消えた一件","元の全件","検索語一文字"],correct:2,feedback:"元の配列を保っていれば、解除で全件を表示できます。",
      task:"観測地「青の丘」「北の森」「丘の上」をこの順に表示してください。入力を含む地名とその件数（例：2件）を毎回表示し、解除で検索欄を空にして全3件へ戻します。見本のdraw関数を使えます。",
      starter:drawList+'\n',build:[searchCode.replace(initialAnswers,'const answers = ["青の丘","北の森","丘の上"];').replace('name.includes(field.value)','《1》').replace('field.value = "";','《2》'),["name.includes(field.value)","name === field.value"],['field.value = "";','field.value = "丘";']],
      tests:[
        [t=>t.all("#rows li").map(n=>n.textContent).join("/")==="青の丘/北の森/丘の上" && t.q("#count").textContent==="3件","元の順に全3件を表示します。"],
        [t=>{t.type("#filter","丘");return t.all("#rows li").map(n=>n.textContent).join("/")==="青の丘/丘の上" && t.q("#count").textContent==="2件";},"丘を含む2件と件数を表示します。"],
        [t=>{t.type("#filter","森");return t.q("#rows").textContent==="北の森" && t.q("#count").textContent==="1件";},"直前の結果ではなく元の3件から森を探します。"],
        [t=>{t.type("#filter","星");return !t.q("#rows li") && t.q("#count").textContent==="0件";},"該当なしなら行を空にして0件にします。"],
        [t=>{t.click("#clear");return t.q("#filter").value==="" && t.all("#rows li").map(n=>n.textContent).join("/")==="青の丘/北の森/丘の上" && t.q("#count").textContent==="3件";},"解除したら空欄と元の全件に戻します。"],
      ],
    },
  ],
};
