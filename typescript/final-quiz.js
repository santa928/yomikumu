"use strict";

const puzzleType='type Puzzle = { title:string; answer:string; points:number };';
const roundType='type Round = {kind:"ready"} | {kind:"answered"; correct:boolean; points:number} | {kind:"end"; total:number};';
const isBook=`function isPuzzle(raw:unknown):raw is Puzzle {
  return typeof raw==="object" && raw!==null
    && "title" in raw && typeof raw.title==="string"
    && "answer" in raw && typeof raw.answer==="string"
    && "points" in raw && typeof raw.points==="number";
}`;
const scoreEntry=`function judgeAnswer(q:Puzzle, text:string):Round {
  const correct = text === q.answer;
  return {kind:"answered", correct, points:correct ? q.points : 0};
}`;
const quizHtml='<label>問題集 <select id="pack"><option value="night">夜空の号</option><option value="weather">天気の号</option><option value="bad">形が違う号</option><option value="fail">取得失敗</option></select></label><button id="start">問題集を開く</button><h2 id="title">クイズ受付</h2><p id="status" role="status">開始前</p><label>回答 <input id="entry"></label><button id="play">回答する</button><button id="next">次へ</button><button id="retry">最初から再挑戦</button><p>合計 <output id="score">0</output> 点</p>';
const quizSetup=`const editions = {
  night:[{title:"夜に光るものは？",answer:"星",points:3},{title:"夜明けに昇るものは？",answer:"太陽",points:2}],
  weather:[{title:"空から落ちる水は？",answer:"雨",points:4},{title:"空にかかる七色は？",answer:"虹",points:6}],
  bad:[{title:"先頭は正常",answer:"光",points:1},{title:"型が違う",answer:"星",points:"3"}]
};
async function requestEdition(){
  const name=document.getElementById("pack").value;
  if(name==="fail") throw new Error("取得失敗");
  return JSON.parse(JSON.stringify(editions[name]));
}
function drawQuiz(title,status,points,stage){
  document.getElementById("title").textContent=title;
  document.getElementById("status").textContent=status;
  document.getElementById("score").textContent=String(points);
  document.getElementById("play").disabled=stage!=="ready";
  document.getElementById("next").disabled=stage!=="answered";
}
document.getElementById("start").onclick=()=>startGame();
document.getElementById("retry").onclick=()=>startGame();
document.getElementById("play").onclick=()=>answerGame(document.getElementById("entry").value);
document.getElementById("next").onclick=()=>nextGame();
drawQuiz("クイズ受付","問題集を選びましょう",0,"end");`;
const quizApi='declare function requestEdition():Promise<unknown>;\ndeclare function drawQuiz(title:string,status:string,points:number,kind:Round["kind"]):void;';
const finishQuiz=[puzzleType,roundType,quizApi,isBook,scoreEntry,`
let books:Puzzle[]=[];
let at=0;
let total=0;
let round:Round={kind:"end",total:0};
async function startGame() {
  at=0; total=0; books=[]; round={kind:"end",total:0};
  drawQuiz("クイズ受付","読込中",0,round.kind);
  try {
    const raw=await requestEdition();
    if(!Array.isArray(raw) || !raw.length || !raw.every(isPuzzle)) {
      drawQuiz("クイズ受付","原稿を確認",0,round.kind); return;
    }
    books=raw;
    round={kind:"ready"};
    drawQuiz(books[at].title,"回答前",total,round.kind);
  } catch { drawQuiz("クイズ受付","もう一度",0,round.kind); }
}
function answerGame(text:string) {
  if(round.kind!=="ready") return;
  if(!text.trim()) { drawQuiz(books[at].title,"回答を入力",total,round.kind); return; }
  round=judgeAnswer(books[at],text.trim());
  if(round.kind!=="answered") return;
  total+=round.points;
  drawQuiz(books[at].title,round.correct ? "正解" : "不正解",total,round.kind);
}
function nextGame() {
  if(round.kind!=="answered") return;
  at++;
  if(at===books.length) {
    round={kind:"end",total};
    drawQuiz("最後の札","終了",round.total,round.kind);
  } else {
    round={kind:"ready"};
    drawQuiz(books[at].title,"回答前",total,round.kind);
  }
}`].join("\n");
const finishChecks=[
  [async t=>{t.q("#pack").value="weather";t.click("#start");await t.wait(15);return t.q("#title").textContent==="空から落ちる水は？" && t.q("#status").textContent==="回答前" && t.q("#score").textContent==="0";},"別の問題集を選んだら、その最初の題名と0点から始めます。"],
  [t=>{t.type("#entry","");t.click("#play");return t.q("#status").textContent==="回答を入力"&&!t.q("#play").disabled;},"空の回答はその場に戻し、点を動かしません。"],
  [t=>{t.type("#entry"," 雨 ");t.click("#play");t.click("#play");return t.q("#status").textContent==="正解" && t.q("#score").textContent==="4" && t.q("#play").disabled && !t.q("#next").disabled;},"前後の空白を除いて正誤を決め、正解時にその問題の点を一度だけ加えます。"],
  [t=>{t.click("#next");t.type("#entry","星");t.click("#play");return t.q("#title").textContent==="空にかかる七色は？" && t.q("#status").textContent==="不正解" && t.q("#score").textContent==="4";},"二問目の題名を開き、不正解のときは合計を保ちます。"],
  [t=>{t.click("#next");return t.q("#status").textContent==="終了" && t.q("#score").textContent==="4" && t.q("#next").disabled && t.q("#play").disabled;},"最後の回答の次は終了と合計を表示します。"],
  [async t=>{t.click("#retry");await t.wait(15);t.type("#entry","雨");t.click("#play");t.click("#next");t.type("#entry","虹");t.click("#play");return t.q("#score").textContent==="10";},"再挑戦は先頭・0点から。同じ号の二問とも正解なら4点と6点を足します。"],
  [async t=>{t.q("#pack").value="bad";t.click("#start");await t.wait(15);return t.q("#status").textContent==="原稿を確認" && t.q("#play").disabled;},"不正な配点の原稿を採点せず、修正を案内します。"],
  [async t=>{t.q("#pack").value="fail";t.click("#start");await t.wait(15);return t.q("#status").textContent==="もう一度" && t.q("#play").disabled;},"取得失敗は形の違いと別の案内にします。"],
  [async t=>{t.q("#pack").value="night";t.click("#retry");await t.wait(15);t.type("#entry","星");t.click("#play");return t.q("#score").textContent==="3" && t.q("#status").textContent==="正解";},"失敗の後も別の号を選び直し、その号の配点で採点できます。"]
];
tsChapters.push({
  title:"型付きの問題・回答・結果でクイズを仕上げる",
  intro:"完成例で問題集を開き、正解と不正解を一回ずつ試しましょう。別の号に変えると、問題文と配点も変わります。",
  demo:["完成したクイズを操作する"], code:()=>finishQuiz,dom:{html:quizHtml,setup:quizSetup,tests:[]}
});
tsLessons.push({
  id:"typed-pack",chapter:4,title:"原稿の一問に型を付ける",
  why:"採点には問題文に加えて、答えと配点が必要です。既存のJavaScriptの一問を Puzzle 型で受け、三つの項目の組み合わせを確認します。",
  before:puzzleType+'\nconst first:Puzzle={title:"夜空",answer:"星",points:3};\nconsole.log(first.points);',
  after:puzzleType+'\nconst first:Puzzle={title:"夜空",answer:"星",points:5};\nconsole.log(first.points);',change:"配点だけを5に変える",
  question:["同じ型で別の問題を作るとき数で渡す項目は？",["title","answer","points","どれも文字"],2,"採点で加える points を数として渡します。"],
  prompt:'Puzzle は title・answer が文字、points が数です。first に「森の道」、答え「苔」、配点4の一問を書きます。',
  template:puzzleType+'\nconst first:Puzzle={title:§,answer:§,points:§};',slots:[["題名",'"森の道"','"星空"'],["答え",'"苔"','4'],["配点","4",'"4"']],
  starter:puzzleType+'\nconst first:Puzzle={title:"森の道",answer:"苔",points:"4"};',
  contract:'const __p:Puzzle=first; const __v:{title:string;answer:string;points:number}=first;',contractHint:"first に Puzzle の三項目をそろえます。",
  probes:[trial("first.title","森の道","頼まれた題名にします。"),trial("first.answer","苔","正解にする文字を合わせます。"),trial("first.points",4,"配点を数の4にします。")]
},{
  id:"typed-round",chapter:4,title:"回答の前後で使える情報を変える",
  why:"回答前に正誤や得点を読まないよう、三つの状態を分けます。ready は回答前、answered は正誤とその点、end は全問の合計です。正答文字と照合して answered の札を返します。",
  before:puzzleType+'\n'+roundType+'\n'+scoreEntry+'\nconsole.log(judgeAnswer({title:"星",answer:"北",points:2},"南"));',
  after:puzzleType+'\n'+roundType+'\n'+scoreEntry+'\nconsole.log(judgeAnswer({title:"星",answer:"北",points:2},"北"));',change:"回答だけを正答に変える",
  question:["kind が ready のとき、まだ存在しない情報は？",["kind の名前","回答済みの正誤と配点","状態そのもの","今が回答前という印"],1,"正誤と配点は answered の枝で読めます。"],
  prompt:"judgeAnswer(q,text) は回答済みの札を返し、一致なら正解と q の配点、不一致なら不正解と0点を入れてください。",
  template:puzzleType+'\n'+roundType+'\n'+scoreEntry.replace("text === q.answer","§").replace("correct ? q.points : 0","§"),
  slots:[["正誤の条件","text === q.answer","text !== q.answer"],["加える点","correct ? q.points : 0","q.points"]],
  starter:puzzleType+'\n'+roundType+'\n'+scoreEntry.replace("correct ? q.points : 0","q.points"),
  contract:"const __judge:(q:Puzzle,a:string)=>Round=judgeAnswer;",contractHint:"問題と回答から Round の札を返す関数にします。",
  probes:[trial('judgeAnswer({title:"森",answer:"苔",points:4},"苔")',{kind:"answered",correct:true,points:4},"正解の文字に、その問題の配点を付けた札を返します。"),trial('judgeAnswer({title:"森",answer:"苔",points:4},"花")',{kind:"answered",correct:false,points:0},"不正解には0点を付けます。")]
},{
  id:"typed-boundary",chapter:4,title:"読み込んだ問題集を開始前に確かめる",
  why:"一問だけ正しくても、次の一問が壊れていると途中で止まります。Array.isArray で配列を確かめ、every(isPuzzle) で全件を調べます。長さが0なら開始する問題がありません。",
  before:puzzleType+'\n'+isBook+'\nconst data:unknown=[{title:"星",answer:"北",points:2}];\nconsole.log(Array.isArray(data) && data.every(isPuzzle));',
  after:puzzleType+'\n'+isBook+'\nconst data:unknown=[{title:"星",answer:"北",points:"二"}];\nconsole.log(Array.isArray(data) && data.every(isPuzzle));',change:"届いた一問の配点を文字に変える",
  question:["先頭だけ正常で二件目の答えが欠けた一覧は？",["二件とも正解にする","欠けた項目を文字に強制","いつも開始する","全件の確認で見つけて開始を止める"],3,"every はすべての問題が同じ条件を満たすかを調べます。"],
  prompt:"canStart(data) は全件が Puzzle の空でない一覧のときだけ true にします。空・配列以外・二問目に不正な項目がある場合は false です。",
  template:puzzleType+'\n'+isBook+'\nfunction canStart(data:unknown): boolean {\n  return § && data.length > 0 && §;\n}',
  slots:[["まず種類を確認","Array.isArray(data)",'typeof data === "string"'],["全件を確認","data.every(isPuzzle)","isPuzzle(data[0])"]],
  starter:puzzleType+'\n'+isBook+'\nfunction canStart(data:unknown):boolean {return Array.isArray(data);}',
  contract:"const __start:(data:unknown)=>boolean=canStart;",contractHint:"どんな入力も受け、真偽を返す canStart にします。",
  probes:[trial('canStart([{title:"森",answer:"苔",points:4}])',true,"正常な一件で開始できます。"),trial('canStart([])',false,"空の問題集を開始しないようにします。"),trial('canStart(null)',false,"配列以外は false です。"),trial('canStart([{title:"森",answer:"苔",points:4},{title:"庭",points:2}])',false,"二問目も含めて全件の形を確認します。")]
},{
  id:"quiz-edition",chapter:4,title:"天気の号で型付きクイズを仕上げる",
  why:"二冊目は「天気の号」です。問題ごとの配点を読み、前後の空白を取り除いた回答を比較します。trim() は文字の両端の空白を除いた新しい文字を返します。画面に表示する drawQuiz と読込の requestEdition は教材が用意しています。",
  before:finishQuiz.replace("judgeAnswer(books[at],text.trim())","judgeAnswer(books[at],text)"),after:finishQuiz,change:"照合前に回答両端の空白を除く",
  question:["終了の札で読むべき点数は？",["次の問題の配点","未回答欄の値","end の total","必ず0点"],2,"終了では全問の合計を持つ total が使えます。"],
  prompt:"JS版のクイズを型付きの二つの号で仕上げます。正解は各問の配点、不正解は0点、空白だけは回答前に戻します。回答両端の空白を除き、一問一回答で採点。最後の合計を表示し、最初から再挑戦すれば0点から。不正な原稿と取得失敗を区別します。",
  template:finishQuiz.replace("correct ? q.points : 0","§").replace("!raw.every(isPuzzle)","§").replace("judgeAnswer(books[at],text.trim())","§"),
  slots:[["正誤と配点","correct ? q.points : 0","q.points"],["不正な原稿を止める","!raw.every(isPuzzle)","raw.every(isPuzzle)"],["前後の空白を除いて採点","judgeAnswer(books[at],text.trim())","judgeAnswer(books[at],text)"]],
  starter:finishQuiz.replace("correct ? q.points : 0","0").replace("!raw.every(isPuzzle)","!isPuzzle(raw[0])").replace("judgeAnswer(books[at],text.trim())","judgeAnswer(books[at],text)"),
  contract:"const __load:()=>Promise<void>=startGame; const __play:(s:string)=>void=answerGame; const __next:()=>void=nextGame;",
  contractHint:"開始・回答・次へ進む三つの操作を型付きの関数としてつなぎます。",
  dom:{html:quizHtml,setup:quizSetup,tests:finishChecks}
});
