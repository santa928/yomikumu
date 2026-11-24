"use strict";
const loadHtml = `<label>読込条件 <select id="mode"><option value="slow">遅い成功</option><option value="once">最初の一回だけ失敗</option></select></label>
<button id="load">問題を読む</button><p id="notice" role="status">開始前</p>
<p>読込回数 <span id="calls">0</span></p><ul id="questions"></ul>
<label>回答の下書き <input id="draft" value="月夜"></label>
<h3>登録済みの回答</h3><ul id="answers"><li>青空</li></ul>`;
const sampleLoader = `let sampleFailed = false;
let sampleCalls = 0;
function loadQuestions() {
  const fail = document.querySelector("#mode").value === "once" && !sampleFailed;
  if (fail) sampleFailed = true;
  document.querySelector("#calls").textContent = ++sampleCalls;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject(new Error("サンプルの読込に失敗"));
      else resolve(["白い帆", "月の輪"]);
    }, 350);
  });
}`;
const loadBindings = `const button = document.querySelector("#load");
const notice = document.querySelector("#notice");`;
const safeLoad = loadBindings + `
button.onclick = async () => {
  if (button.disabled) return;
  button.disabled = true;
  notice.textContent = "読込中";
  try {
    const names = await loadQuestions();
    const list = document.querySelector("#questions");
    list.replaceChildren();
    names.forEach(name => {
      const row = document.createElement("li");
      row.textContent = name;
      list.append(row);
    });
    notice.textContent = "読込完了";
  } catch {
    notice.textContent = "もう一度試してください";
  } finally {
    button.disabled = false;
  }
};`;
const failedThenSuccess = [
  [async t=>{t.q("#mode").value="once";t.click("#load");await t.wait(430);return t.q("#notice").textContent.includes("もう一度") && !t.q("#load").disabled;},"一回だけ失敗する条件で、再試行を案内してボタンを使えるようにします。"],
  [async t=>{t.click("#load");await t.wait(430);return t.q("#notice").textContent==="白い帆" && !t.q("#load").disabled;},"二度目の成功時に届いた先頭の問題名を表示します。"],
];
const loadingUnit = {
  id:"loading",title:"読み込みを待ち、失敗したらやり直せるようにする",
  intro:"データは、ボタンを押してから少し遅れて届くことがあります。クイズの問題を読み込む見本で、待っている間・成功・失敗の表示を比べます。「最初の一回だけ失敗」を選ぶと、同じボタンでもう一度試せます。",
  setup:sampleLoader,
  demo:{html:loadHtml,code:safeLoad,tip:"「最初の一回だけ失敗」を選び、下書きを変えてから「問題を読む」を二度試します。下書きと登録済みの回答が残ることも確かめてください。"},
  steps:[
    {
      title:"データが届いたら処理する（then）",html:loadHtml,
      explain:"loadQuestions()は教材に用意した関数です。少し待つと問題名の配列が届きます。loadQuestions() がすぐに返す Promise は、まだ届いていない結果を後で受け取るためのものです。読み込みに成功すると、then に渡した関数へ問題名の配列が届きます。見本は「遅い成功」で試しましょう。",
      example:loadBindings+'\nbutton.onclick = () => {\n  loadQuestions().then(names => {\n    notice.textContent = names.length;\n  });\n};',
      question:"thenの中のnamesに入るものはどれですか。",options:["待ち時間","読込ボタン","届いた問題名の配列","空の画面"],correct:2,feedback:"サンプルの読込が成功したときに、問題名の配列が渡されます。",
      task:"「読込条件」で「遅い成功」を選んで試します。読み込みが終わったら、件数の代わりに問題一覧の先頭にある「白い帆」を表示してください。",
      build:[loadBindings+'\nbutton.onclick = () => {\n  loadQuestions().then(names => {\n    《1》.textContent = 《2》;\n  });\n};',["notice","button"],["names[0]","names.length"]],
      tests:[[async t=>{t.click("#load");await t.wait(430);return t.q("#notice").textContent==="白い帆";},"thenの中で受け取った配列の先頭をnoticeに表示します。"]],
    },
    {
      title:"データが届くまで待ってから使う（await）",html:loadHtml,
      explain:"asyncと付けた関数の中でawaitを使うと、その関数の続きは結果が届いてから進みます。待っている間も回答欄を操作できます。見本は先頭の問題名を表示します。",
      example:loadBindings+'\nbutton.onclick = async () => {\n  const names = await loadQuestions();\n  notice.textContent = names[0];\n};',
      question:"awaitの次の行で使えるnamesはどれですか。",options:["タイマーの番号","届いた配列","ボタン","未入力の欄"],correct:1,feedback:"成功して待ち終わった後では、約束を表すPromiseから配列を受け取れます。",
      task:"表示する位置を一か所変えて、二番目の問題名「月の輪」を表示します。",
      build:[loadBindings+'\nbutton.onclick = async () => {\n  const names = 《1》 loadQuestions();\n  notice.textContent = names[《2》];\n};',["await","/* 待たない */"],["1","0"]],
      tests:[[async t=>{t.click("#load");await t.wait(430);return t.q("#notice").textContent==="月の輪";},"読込を待ってから、添字1の問題名を表示します。"]],
    },
    {
      title:"失敗を受け取り、もう一度読めるようにする",html:loadHtml,
      explain:"失敗するとawaitの続きへ進めません。tryの中で読み、catchの中で失敗時の案内を出します。「最初の一回だけ失敗」で、もう一度押すと次は成功します。",
      example:loadBindings+`
button.onclick = async () => {
  try {
    const names = await loadQuestions();
    notice.textContent = names[0];
  } catch {
    notice.textContent = "終了";
  }
};`,
      question:"一度失敗した後、やり直せることが伝わる表示はどれですか。",options:["読込完了","処理中のまま","何も表示しない","もう一度試してください"],correct:3,feedback:"失敗時に次の操作を示し、ボタンからもう一度試せるようにします。",
      task:"失敗時に「もう一度試してください」と案内し、次に押したら最初の問題名を表示してください。",
      build:[loadBindings+'\nbutton.onclick = async () => {\n  try { const names = await loadQuestions(); notice.textContent = 《1》; }\n  catch { notice.textContent = 《2》; }\n};',["names[0]","names.length"],['"もう一度試してください"','"完了"']],
      tests:failedThenSuccess,
    },
    {
      title:"読み込み中は連打を防ぎ、完了後にボタンを戻す",html:loadHtml,
      explain:"disabledをtrueにするとボタンを続けて押せません。finallyに書いた処理は成功しても失敗しても通るので、必ずボタンを戻せます。",
      example:loadBindings+`
button.onclick = async () => {
  button.disabled = false;
  notice.textContent = "読込中";
  try {
    const names = await loadQuestions();
    notice.textContent = names[0];
  } catch {
    notice.textContent = "もう一度試してください";
  } finally {
    button.disabled = false;
  }
};`,
      question:"開始から成功までに見える順番はどれですか。",options:["成功→開始前→読込中","開始前→読込中→結果","読込中→結果→開始前","結果→読込中→結果"],correct:1,feedback:"開始後すぐ待機を伝え、問題が届いたら結果を見せます。",
      task:"読込前の一行を直し、待機中の連打は一回にまとめます。成功しても失敗しても、ボタンを戻します。",
      build:[loadBindings+'\nbutton.onclick = async () => {\n  button.disabled = 《1》;\n  notice.textContent = "読込中";\n  try { const names = await loadQuestions(); notice.textContent = names[0]; }\n  catch { notice.textContent = "もう一度試してください"; }\n  finally { button.disabled = 《2》; }\n};',["true","false"],["false","true"]],
      tests:[
        [t=>{t.click("#load");t.click("#load");return t.q("#load").disabled && t.q("#notice").textContent==="読込中" && t.q("#calls").textContent==="1";},"ボタンを止めてから待ち、連打しても読込を一度だけ開始します。"],
        [async t=>{await t.wait(430);return !t.q("#load").disabled && t.q("#notice").textContent==="白い帆";},"成功時に結果を出し、再び押せる状態にします。"],
        ...failedThenSuccess,
      ],
    },
    {
      title:"練習：入力した内容を残してデータを読み直す",html:loadHtml,
      explain:"問題を入れる一覧だけを描き直せば、別の回答一覧や入力途中の値は残ります。見本は固定の一件を問題の一覧へ描きます。",
      example:'const list = document.querySelector("#questions");\nlist.replaceChildren();\nconst row = document.createElement("li");\nrow.textContent = "帆の色";\nlist.append(row);',
      question:"失敗後も残したいものはどれですか。",options:["disabledの状態","待機表示だけ","回答と書きかけの文字","二重に追加した行"],correct:2,feedback:"再試行に必要なのは問題の読込なので、登録済みの回答と下書きはそのまま使います。",
      task:"読込中は「読込中」と表示して連打を止めます。失敗は「もう一度」で案内し、成功なら届いた名前を#questionsの行にします。毎回終了時にボタンを戻し、下書きと登録済み回答を保ち、読込済みの問題を重ねないでください。",
      starter:loadBindings+'\n',
      build:[safeLoad.replace('button.disabled = true;', 'button.disabled = 《1》;').replace('list.replaceChildren();','《2》').replace('button.disabled = false;', 'button.disabled = 《3》;'),["true","false"],["list.replaceChildren();","// 古い行を残す"],["false","true"]],
      tests:[
        [t=>{t.type("#draft","書きかけの森");t.q("#mode").value="once";t.click("#load");t.click("#load");return t.q("#load").disabled && t.q("#notice").textContent==="読込中" && t.q("#calls").textContent==="1";},"開始直後に読込中と表示し、連打しても一回だけ読み込みます。"],
        [async t=>{await t.wait(430);return !t.q("#load").disabled && /もう一度/.test(t.q("#notice").textContent) && t.q("#draft").value==="書きかけの森" && t.q("#answers").textContent==="青空";},"失敗を知らせて再試行を許可し、入力中と登録済みの回答を残します。"],
        [async t=>{t.click("#load");await t.wait(430);return t.all("#questions li").map(n=>n.textContent).join("/")==="白い帆/月の輪" && !t.q("#load").disabled;},"成功したら届いた問題を各行に表示し、ボタンを戻します。"],
        [async t=>{t.click("#load");await t.wait(430);return t.all("#questions li").length===2 && t.q("#draft").value==="書きかけの森" && t.q("#answers").textContent==="青空";},"続けて読んでも行を重ねず、回答と下書きを保ちます。"],
      ],
    },
  ],
};
