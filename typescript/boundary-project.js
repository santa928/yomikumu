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
  id:"linked-desk",chapter:3,title:"回答欄と届いた原稿をつなぐ",
  why:"別の受付では、未入力の人にすぐ書き始めてもらいます。入力欄、入力の有無、原稿を読めたか、原稿の形の順に確かめたら、文字と点数の両方を採点に使えます。",
  before:linkedDesk.replace('"正解 "+book.points+"点"','"正解"'),after:linkedDesk,change:"原稿から読んだ配点を正解札に付ける",
  question:["空の回答欄で受付ボタンを押したとき、一番先に出す案内は？",["取得失敗","正解3点","原稿を確認","回答を入力"],3,"この受付では原稿を取りに行く前に入力欄を確認します。"],
  prompt:"読書会の受付を仕上げます。欄がない場合は「回答欄がありません」、空なら「回答を入力」。届いた題名と回答が一致したら「正解 3点」の形で原稿の点を表示し、違えば「考え直す」。形違いは「原稿を確認」、取得失敗は「もう一度」と知らせ、同じ欄で再挑戦できます。",
  template:linkedDesk.replace("field instanceof HTMLInputElement","§").replace("!valid(book)","§").replace("field.value===book.text","§"),
  slots:[["欄の確認","field instanceof HTMLInputElement","field instanceof HTMLButtonElement"],["形が違うとき","!valid(book)","valid(book)"],["回答と題名を照合","field.value===book.text","field.value!==book.text"]],
  starter:linkedDesk.replace('if(field.value==="") {say("回答を入力");return;}','// 空の回答を先に確かめる').replace('say(field.value===book.text ? "正解 "+book.points+"点" : "考え直す");','say("受け付けました");'),
  contract:"const __desk:()=>Promise<void>=openPaper;",contractHint:"openPaper で入力欄と非同期の原稿を扱います。",
  dom:{html:localHtml,setup:localSetup,tests:[
    [async t=>{t.click("#load");await t.wait(55);return t.q("#note").textContent==="回答を入力";},"空の回答欄には書き始める案内を返します。"],
    [async t=>{t.type("#answer","森");t.click("#load");await t.wait(55);return t.q("#note").textContent==="考え直す";},"原稿と異なる回答は再挑戦へ案内します。"],
    [async t=>{t.type("#answer","夜の庭");t.click("#load");await t.wait(55);return t.q("#note").textContent==="正解 3点";},"題名が一致したら、原稿の配点を含む正解札にします。"],
    [async t=>{t.q("#file").value="shape";t.click("#load");await t.wait(55);return t.q("#note").textContent==="原稿を確認";},"形が正しくないJSONは採点せずに知らせます。"],
    [async t=>{t.q("#file").value="fail";t.click("#load");await t.wait(55);return t.q("#note").textContent==="もう一度" && t.q("#answer").value==="夜の庭";},"取得失敗は再試行の案内にし、回答を保ちます。"],
    [async t=>{t.q("#file").value="good";t.click("#load");await t.wait(55);return t.q("#note").textContent==="正解 3点";},"読み直して正解へ戻れるようにします。"],
    [async t=>{t.q("#answer").remove();t.click("#load");await t.wait(55);return t.q("#note").textContent==="回答欄がありません";},"入力欄のない画面でも説明を表示します。"]
  ]}
});
