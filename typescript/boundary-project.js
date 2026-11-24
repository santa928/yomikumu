"use strict";
const linkedDesk = apiTypes+'\n'+validPaper+`
async function openPaper() {
  const field=document.getElementById("answer");
  if(!(field instanceof HTMLInputElement)) {say("回答欄がありません");return;}
  if(field.value==="") {say("回答を入力");return;}
  try {
    const book=await loadPaper();
    if(!valid(book)) {say("原稿を確認");return;}
    say(field.value===book.text ? "正解 "+book.points+"点" : "考え直す");
  } catch {say("もう一度");}
}`;
tsLessons.push({
  id:"linked-desk",chapter:3,title:"練習：読み込んだデータを確認して回答を採点する",
  why:"回答欄があるか、回答が入力されているかを先に調べます。その後で問題データを読み込み、text が文字列、points が数値なら採点します。",
  before:linkedDesk.replace('"正解 "+book.points+"点"','"正解"'),after:linkedDesk,change:"正解時に問題の配点も表示する",
  question:["空の回答欄で「問題を読む」を押したとき、一番先に出す案内は？",["取得失敗","正解3点","原稿を確認","回答を入力"],3,"この関数では loadPaper を呼ぶ前に回答欄を確認します。"],
  prompt:"openPaper で回答を採点します。欄がない場合は「回答欄がありません」、空なら「回答を入力」。届いた題名と回答が一致したら「正解 3点」のように points の値を表示し、違えば「考え直す」。問題データの項目や型が違う場合は「原稿を確認」、取得失敗は「もう一度」と知らせ、同じ欄で再挑戦できます。",
  template:linkedDesk.replace("field instanceof HTMLInputElement","§").replace("!valid(book)","§").replace("field.value===book.text","§"),
  slots:[["欄の確認","field instanceof HTMLInputElement","field instanceof HTMLButtonElement"],["形が違うとき","!valid(book)","valid(book)"],["回答と題名を照合","field.value===book.text","field.value!==book.text"]],
  starter:linkedDesk.replace('if(field.value==="") {say("回答を入力");return;}','// 空の回答を先に確かめる').replace('say(field.value===book.text ? "正解 "+book.points+"点" : "考え直す");','say("受け付けました");'),
  contract:"const __desk:()=>Promise<void>=openPaper;",contractHint:"openPaper で回答を読み、loadPaper で問題データを取得します。",
  dom:{html:localHtml,setup:localSetup,tests:[
    [async t=>{t.click("#load");await t.wait(55);return t.q("#note").textContent==="回答を入力";},"空の回答欄には書き始める案内を返します。"],
    [async t=>{t.type("#answer","森");t.click("#load");await t.wait(55);return t.q("#note").textContent==="考え直す";},"回答が text と違うときは「考え直す」と表示します。"],
    [async t=>{t.type("#answer","夜の庭");t.click("#load");await t.wait(55);return t.q("#note").textContent==="正解 3点";},"回答が text と一致したら、正解と配点を表示します。"],
    [async t=>{t.q("#file").value="shape";t.click("#load");await t.wait(55);return t.q("#note").textContent==="原稿を確認";},"形が正しくないJSONは採点せずに知らせます。"],
    [async t=>{t.q("#file").value="fail";t.click("#load");await t.wait(55);return t.q("#note").textContent==="もう一度" && t.q("#answer").value==="夜の庭";},"取得失敗は再試行の案内にし、回答を保ちます。"],
    [async t=>{t.q("#file").value="good";t.click("#load");await t.wait(55);return t.q("#note").textContent==="正解 3点";},"読み直して正解へ戻れるようにします。"],
    [async t=>{t.q("#answer").remove();t.click("#load");await t.wait(55);return t.q("#note").textContent==="回答欄がありません";},"入力欄のない画面でも説明を表示します。"]
  ]}
});
