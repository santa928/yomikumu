"use strict";
const quizHtml = `<h2 id="question">開始前</h2><button id="left">左の答え</button>
<button id="right">右の答え</button><button id="next" disabled>次へ</button>
<p id="score">0点</p><p id="message" role="status"></p><button id="again" hidden>再挑戦</button>`;
const quizData = `const items = [
  { text: "夜の海を照らすのは？", choices: ["灯台", "小舟"], correct: 0 },
  { text: "風を受けて進むのは？", choices: ["桟橋", "帆船"], correct: 1 }
];`;
const colorData = `const items = [
  { text: "赤と黄を混ぜると？", choices: ["紫", "橙"], correct: 1 },
  { text: "青と黄を混ぜると？", choices: ["緑", "橙"], correct: 0 }
];`;
const quizRefs = `const q = id => document.getElementById(id);
const buttons = [q("left"), q("right")];`;
const quizBody = `let index = 0;
let score = 0;
let answered = false;
function draw() {
  const item = items[index];
  q("question").textContent = item.text;
  buttons.forEach((button, i) => {
    button.textContent = item.choices[i];
    button.disabled = false;
  });
  answered = false;
  q("next").disabled = true;
  q("again").hidden = true;
  q("message").textContent = "";
  q("score").textContent = score + "点";
}
buttons.forEach((button, choice) => {
  button.onclick = () => {
    if (answered) return;
    answered = true;
    const hit = choice === items[index].correct;
    if (hit) score += 1;
    q("message").textContent = hit ? "正解" : "不正解";
    q("score").textContent = score + "点";
    buttons.forEach(b => { b.disabled = true; });
    q("next").disabled = false;
  };
});
q("next").onclick = () => {
  if (!answered) return;
  index += 1;
  if (index < items.length) {
    draw();
  } else {
    q("question").textContent = "結果";
    q("message").textContent = "クイズ終了";
    q("next").disabled = true;
    q("again").hidden = false;
  }
};
q("again").onclick = () => {
  index = 0;
  score = 0;
  draw();
};
draw();`;
const seaQuiz = quizData+"\n"+quizRefs+"\n"+quizBody;
const paintQuiz = colorData+"\n"+quizRefs+"\n"+quizBody.replace('score += 1;', 'score += 2;');
const firstQuestion = quizData+"\n"+quizRefs+`
const item = items[0];
q("question").textContent = item.text;
q("left").textContent = item.choices[0];
q("right").textContent = item.choices[1];`;
const nextQuestion = quizData+"\n"+quizRefs+`
let index = 0;
function draw() {
  q("question").textContent = items[index].text;
  buttons.forEach((b, i) => { b.textContent = items[index].choices[i]; });
  q("next").disabled = true;
}
buttons.forEach(b => { b.onclick = () => { q("next").disabled = false; }; });
q("next").onclick = () => { if (index === 0) { index += 1; draw(); } };
draw();`;
const scoreOnce = firstQuestion+`
let answered = false;
let score = 0;
buttons.forEach((button, choice) => {
  button.onclick = () => {
    if (answered) return;
    answered = true;
    if (choice === item.correct) score += 1;
    q("score").textContent = score + "点";
  };
});`;
const seaFinished = [
  [t=>{t.click("#left");t.click("#left");return t.q("#score").textContent==="1点";},"最初の正解を連打しても1点にします。"],
  [t=>{t.click("#next");return t.q("#question").textContent==="風を受けて進むのは？";},"次へで二問目を表示します。"],
  [t=>{t.click("#left");t.click("#next");return t.q("#question").textContent==="結果" && t.q("#score").textContent==="1点";},"二問目に間違えても得点は変えず、二問の後に結果へ進みます。"],
];
const quizDomUnit = {
  id:"quiz-project",title:"得点と再挑戦のあるクイズを仕上げる",
  intro:"問題・回答・次へ・結果をつなぎます。海のクイズを作った後、配色の原稿を読み、得点規則の違うクイズを組み立てます。",
  demo:{html:quizHtml,code:seaQuiz,tip:"一問目で「灯台」を二度押してから次へ進みます。二問目で「桟橋」を選び、結果を見て再挑戦してください。"},
  steps:[
    {
      title:"原稿から最初の問題を出す",html:quizHtml,
      explain:"一問の文章・選択肢・正答の番号を一組のデータにします。items[0]が一問目、item.choices[0]が左の答えです。見本は二問目を読みます。",
      example:firstQuestion.replace("items[0]","items[1]"),
      question:"最初の問題と左右の選択肢を同じ一件から表示するには、何を先に決めますか。",options:["最終得点","押した回数","items[0]","結果画面の色"],correct:2,feedback:"今表示する一件を決め、そのtextとchoicesを同じ一件から取り出します。",
      task:"読む一件を変え、一問目と二つの選択肢を原稿どおりに表示してください。",
      build:[firstQuestion.replace("items[0]","items[《1》]").replace('q("right").textContent = item.choices[1]','q("right").textContent = item.choices[《2》]'),["0","1"],["1","0"]],
      tests:[[t=>t.q("#question").textContent==="夜の海を照らすのは？","一問目の文章を見出しに表示します。"],[t=>t.q("#left").textContent==="灯台" && t.q("#right").textContent==="小舟","同じ一問目から左右の選択肢を表示します。"]],
    },
    {
      title:"一回答を受けて次へ進める",html:quizHtml,
      explain:"「次へ」を最初は使えなくし、左右どちらかを押した後に使えるようにします。次に進んだら新しい問題の回答を待ちます。",
      example:nextQuestion.replace('index += 1;', 'index += 0;'),
      question:"まだ回答していない時に使えるのはどれですか。",options:["再挑戦","次へだけ","結果だけ","左右の回答"],correct:3,feedback:"左右から選んでから次へ進むと、未回答で問題を飛ばさずに済みます。",
      task:"次への処理で一つ先へ進むように変え、二問目でも回答前は次へを止めます。",
      build:[nextQuestion.replace('index += 1;', 'index += 《1》;').replace('q("next").disabled = true;', 'q("next").disabled = 《2》;'),["1","0"],["true","false"]],
      tests:[[t=>t.q("#next").disabled,"回答前は次へを無効にします。"],[t=>{t.click("#right");return !t.q("#next").disabled;},"どちらかを選んだら次へ進めます。"],[t=>{t.click("#next");return t.q("#question").textContent==="風を受けて進むのは？" && t.q("#next").disabled;},"二問目を表示して、再び回答を待ちます。"]],
    },
    {
      title:"正答した一回だけ得点を加える",html:quizHtml,
      explain:"answeredはこの問題に回答したかを覚えます。二度目のクリックは先頭のreturnで止めます。choiceが正答の番号と等しい時だけ加点します。",
      example:scoreOnce.replace("answered = true;", "answered = false;"),
      question:"「灯台」を素早く二回押しても1点にするには何を覚えますか。",options:["選択肢の文字数","この問題に回答したか","次の問題名","ボタンの幅"],correct:1,feedback:"一回目を受けた時に回答済みにして、次の押下で同じ得点が入るのを防ぎます。",
      task:"一回目を受けた印を付け、正答を二度押しても1点にします。",
      build:[scoreOnce.replace("answered = true;", "answered = 《1》;").replace("choice === item.correct","choice 《2》 item.correct"),["true","false"],["===","!=="]],
      tests:[[t=>{t.click("#left");return t.q("#score").textContent==="1点";},"最初の正答には1点を加えます。"],[t=>{t.click("#left");t.click("#right");return t.q("#score").textContent==="1点";},"どのボタンを続けて押しても、回答済みなら得点を変えません。"]],
    },
    {
      title:"最後の問題の後に結果を表示する",html:quizHtml,
      explain:"indexが配列の長さに達したら次の問題はありません。最後の「次へ」で結果へ切り替えます。下の見本は一問早く切り替わるので、問題順を確かめてください。",
      example:seaQuiz.replace('index < items.length','index < items.length - 1'),
      question:"二問だけのクイズで、結果に切り替える時はいつですか。",options:["最初の回答前","一問目を出す前","二問を答えて次へ進んだ時","一問目の直後"],correct:2,feedback:"二問目の回答までは問題画面を保ち、次へで結果にします。",
      task:"indexと問題数の比較を直し、一問目・二問目・結果の順にしてください。",
      build:[seaQuiz.replace('index < items.length','index < 《1》').replace('q("question").textContent = "結果"','q("question").textContent = 《2》'),["items.length","items.length - 1"],['"結果"','"開始前"']],
      tests:seaFinished,
    },
    {
      title:"再挑戦で問題番号と得点を初期化する",html:quizHtml,
      explain:"次の挑戦には、問題番号、得点、回答済みかどうかを引き継ぎません。番号と得点を戻してdrawを呼ぶと、操作できる最初の問題が描かれます。",
      example:seaQuiz.replace('  score = 0;\n  draw();','  // 前回の得点が残る\n  draw();'),
      question:"前回1点の後、再挑戦の最初に表示するものはどれですか。",options:["結果と1点","一問目と0点","二問目と0点","一問目と1点"],correct:1,feedback:"新しい挑戦は一問目から0点で始め、再び回答を受け付けます。",
      task:"再挑戦時に前回の得点を消す一行を足し、二回目も最初から採点してください。",
      build:[seaQuiz.replace('  score = 0;\n  draw();','  score = 《1》;\n  《2》;'),["0","score"],["draw()","q(\"again\").focus()"]],
      tests:[...seaFinished,[t=>{t.click("#again");return t.q("#question").textContent==="夜の海を照らすのは？" && t.q("#score").textContent==="0点" && !t.q("#left").disabled && t.q("#next").disabled;},"再挑戦で一問目と0点に戻し、最初の回答を受け付けます。"],[t=>{t.click("#right");return t.q("#score").textContent==="0点" && !t.q("#next").disabled;},"新しい挑戦で誤答を選ぶと0点のまま次へ進めます。"]],
    },
    {
      title:"絵の具クイズを原稿と得点規則から作る",html:quizHtml,
      explain:"問題順と表示を変えるには原稿を、得点を変えるには採点規則を決めます。見本は海のクイズの最初の一問です。今度は絵の具の原稿から、動きを一つにつないでください。",
      example:firstQuestion,
      question:"新しいルールは正答2点です。正答を連打し、二問目に誤答した最終得点はどれですか。",options:["0点","1点","2点","4点"],correct:2,feedback:"二度押しても一問の正答は2点。誤答には加点しません。",
      task:"原稿は一問目「赤と黄を混ぜると？」（左「紫」・右「橙」、正答は橙）、二問目「青と黄を混ぜると？」（左「緑」・右「橙」、正答は緑）です。正答は2点、誤答は0点で、一問の回答は一度だけ受けます。回答後の「次へ」で問題か「結果」に進み、再挑戦で一問目・0点へ戻します。点数は「2点」の形式で表示します。",
      starter:"",build:[paintQuiz.replace('if (answered) return;','if (《1》) return;').replace('score += 2;', 'score += 《2》;').replace('  score = 0;\n  draw();','  score = 《3》;\n  draw();'),["answered","!answered"],["2","1"],["0","score"]],
      tests:[
        [t=>t.q("#question").textContent==="赤と黄を混ぜると？" && t.q("#left").textContent==="紫" && t.q("#right").textContent==="橙" && t.q("#score").textContent==="0点" && t.q("#next").disabled,"一問目の原稿・左右の答え・0点を表示し、回答を待ちます。"],
        [t=>{t.click("#right");t.click("#right");t.click("#left");return t.q("#score").textContent==="2点" && !t.q("#next").disabled;},"正答を二度押し、別の回答を押しても2点のまま次へ進めます。"],
        [t=>{t.click("#next");return t.q("#question").textContent==="青と黄を混ぜると？" && t.q("#left").textContent==="緑" && t.q("#right").textContent==="橙" && t.q("#next").disabled;},"二問目の原稿を表示し、新しく回答を待ちます。"],
        [t=>{t.click("#right");t.click("#next");return t.q("#question").textContent==="結果" && t.q("#score").textContent==="2点" && !t.q("#again").hidden;},"二問目の誤答で加点せず、最終得点と再挑戦を表示します。"],
        [t=>{t.click("#again");return t.q("#question").textContent==="赤と黄を混ぜると？" && t.q("#score").textContent==="0点" && t.q("#next").disabled;},"再挑戦で一問目・0点・未回答へ戻します。"],
        [t=>{t.click("#right");t.click("#next");t.click("#left");t.click("#next");return t.q("#score").textContent==="4点" && t.q("#question").textContent==="結果";},"次の挑戦で両方正解なら4点になります。"],
      ],
    },
  ],
};
