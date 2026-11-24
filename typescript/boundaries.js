"use strict";

const lookupHtml = '<h3 id="title">夜の庭</h3><label>探す要素 <select id="key"><option value="title">見出し（id は title）</option><option value="gone">存在しない id（gone）</option></select></label><button id="look">要素を探す</button><p id="note" role="status">開始前</p>';
const lookupSetup = 'document.getElementById("look").onclick = () => { document.getElementById("note").textContent = caption(document.getElementById("key").value); };';
const eventHtml = '<label>回答 <input id="answer"></label><button id="other">質問ボタン</button><p id="note" role="status">入力前</p>';
const eventSetup = 'function routeEvent(e) {document.getElementById("note").textContent = readEvent(e);} document.getElementById("answer").addEventListener("input",routeEvent); document.getElementById("other").addEventListener("click",routeEvent);';
const localHtml = '<label>読み込む問題データ <select id="file"><option value="good">正しいJSON</option><option value="shape">配点が文字のJSON</option><option value="fail">取得失敗</option></select></label><label>回答 <input id="answer"></label><button id="load">問題を読む</button><p id="note" role="status">開始前</p>';
const localSetup = `const files = {good:'{"text":"夜の庭","points":3}',shape:'{"text":"夜の庭","points":"三"}'};
function loadPaper() {
  const kind = document.getElementById("file").value;
  return new Promise((resolve,reject) => setTimeout(() => {
    if(kind==="fail") reject(new Error("読めません"));
    else resolve(JSON.parse(files[kind]));
  },15));
}
function say(text) { document.getElementById("note").textContent=text; }
document.getElementById("load").onclick=() => { say("読込中"); openPaper(); };`;
const apiTypes = 'declare function loadPaper():Promise<unknown>;\ndeclare function say(text:string):void;';
const validPaper = 'function valid(value:unknown):value is {text:string;points:number} {\n  return typeof value==="object" && value!==null && "text" in value && typeof value.text==="string" && "points" in value && typeof value.points==="number";\n}';
const goodLoad = apiTypes+'\n'+validPaper+'\nasync function openPaper() {\n  try {\n    const value = await loadPaper();\n    say(valid(value) ? value.text : "原稿を確認");\n  } catch { say("もう一度"); }\n}';
const asyncTests = [
  [async t=>{t.q("#file").value="good";t.click("#load");await t.wait(55);return t.q("#note").textContent==="夜の庭";},"正しいJSONの text に入った題名を表示します。"],
  [async t=>{t.q("#file").value="shape";t.click("#load");await t.wait(55);return t.q("#note").textContent==="原稿を確認";},"届いたJSONの配点が文字なら「原稿を確認」と知らせます。"],
  [async t=>{t.type("#answer","庭");t.q("#file").value="fail";t.click("#load");await t.wait(55);return t.q("#note").textContent==="もう一度" && t.q("#answer").value==="庭";},"取得失敗時は回答の下書きを保ち、「もう一度」と案内します。"],
  [async t=>{t.q("#file").value="good";t.click("#load");await t.wait(55);return t.q("#note").textContent==="夜の庭" && t.q("#answer").value==="庭";},"失敗のあとも同じボタンから読み直せるようにします。"]
];
tsChapters.push({
  title:"見つからない要素や、型が不明なデータを扱う",
  intro:"要素が見つからない場合や、外から届いた値の型が分からない場合に備えます。見本では回答欄に好きな文字を入れ、問題データを選んで「問題を読む」を押します。正しいデータが届く場合、配点が文字列になっている場合、データが届かない場合を比べましょう。",
  demo:["問題の読込を試す"], code:()=>goodLoad, dom:{html:localHtml,setup:localSetup,tests:[]}
});
tsLessons.push({
  id:"absent",chapter:3,title:"IDで要素を探し、見つからない場合に備える",
  why:"getElementById は、指定した id の要素がなければ null を返します。見つかったことを確認してから textContent で本文を読みます。見本の「探す要素」で二つの id を試せます。",
  before:'function caption(id:string):string {\n  const el=document.getElementById(id);\n  return el.textContent ?? "";\n}',after:'function caption(id:string):string {\n  const el=document.getElementById(id);\n  if(el===null) return "取り外しました";\n  return el.textContent ?? "";\n}',change:"見つからないときの案内を足す",
  question:["指定した id の要素が画面にないとき、getElementById が返す値は？",["null","空の要素","空文字","undefined"],0,"要素がなければ null です。文字を読む前に分けます。"],
  prompt:"caption(id) は要素があれば本文を返し、なければ「札がありません」と返します。title、gone、title の順に選び、見出しが再び表示されるか確かめてください。",
  template:'function caption(id:string):string {\n  const el=document.getElementById(id);\n  if (§) return §;\n  return el.textContent ?? "";\n}',slots:[["先に確認","el === null","el !== null"],["要素がない場合",'"札がありません"','""']],
  starter:'function caption(id:string):string {\n  const el=document.getElementById(id);\n  return el.textContent ?? "";\n}',contract:"const __lookup:(id:string)=>string=caption;",contractHint:"文字のidを受け文字を返す caption を用意します。",
  dom:{html:lookupHtml,setup:lookupSetup,tests:[
    [t=>{t.click("#look");return t.q("#note").textContent==="夜の庭";},"id が title の見出しから本文を読みます。"],
    [t=>{t.q("#key").value="gone";t.click("#look");return t.q("#note").textContent==="札がありません";},"指定した id が見つからなければ「札がありません」を返します。"],
    [t=>{t.q("#key").value="title";t.click("#look");return t.q("#note").textContent==="夜の庭";},"見出しを選び直したら、もう一度その本文を表示します。"]]}
},{
  id:"event-target",chapter:3,title:"イベントが入力欄から来たときだけ値を読む",
  why:"イベントの target は操作元です。ボタンと入力欄では持っている情報が違います。target instanceof HTMLInputElement で入力欄かどうかを確かめてから value を読みます。",
  before:'function readEvent(e:Event):string {\n  return e.target.value;\n}',after:'function readEvent(e:Event):string {\n  if(e.target instanceof HTMLInputElement) return e.target.value;\n  return "ボタン";\n}',change:"操作元が入力欄かを確かめる",
  question:["回答欄の .value を読む前に使う確認は？",["target が文字列か","target がボタンか","target が HTMLInputElement か","target が数値か"],2,"e.target が入力欄なら e.target.value で入力内容を読めます。"],
  prompt:"readEvent(e) は入力欄ならその文字を返し、未入力なら「未入力」、質問ボタンの操作なら「回答欄以外」を返します。",
  template:'function readEvent(e:Event):string {\n  if(!(e.target instanceof §)) return "回答欄以外";\n  return e.target.value § "未入力";\n}',slots:[["入力欄の種類","HTMLInputElement","HTMLButtonElement"],["空文字で切り替える","||","??"]],
  starter:'function readEvent(e:Event):string {\n  return "未入力";\n}',contract:"const __evt:(e:Event)=>string=readEvent;",contractHint:"Event を受ける readEvent を用意します。",
  dom:{html:eventHtml,setup:eventSetup,tests:[
    [t=>{t.type("#answer","森");return t.q("#note").textContent==="森";},"入力欄から今の回答を読みます。"],
    [t=>{t.type("#answer","");return t.q("#note").textContent==="未入力";},"空の入力欄だけは「未入力」にします。"],
    [t=>{t.click("#other");return t.q("#note").textContent==="回答欄以外";},"ボタンから届いたときは「回答欄以外」にします。"]]}
},{
  id:"unknown",chapter:3,title:"型が不明な値から、確認して文字を取り出す",
  why:"外から受け取った値の型が分からないときは unknown とします。たとえば { text: 3 } も届くので、いきなり text を文字列として使いません。値が null ではないオブジェクトか、in で text があるか、typeof で text が文字列か。この順で確かめてから返します。",
  before:'function titleOf(v:unknown):string {return v.text;}\nconsole.log(titleOf({text:"星"}));',
  after:'function titleOf(v:unknown):string {\n  if(typeof v==="object" && v!==null && "text" in v && typeof v.text==="string") return v.text;\n  return "形を確認";\n}\nconsole.log(titleOf({text:"星"}));',change:"読む前に形の確認を置く",
  question:["unknown が null の可能性もある。項目を探す前にすることは？",["すぐに value.text を読む","まず text の長さを調べる","value の型を string と決める","object かつ null 以外と確かめる"],3,"null を除いてから in で項目を調べます。"],
  prompt:'titleOf(value) は text が文字ならその題名を返します。null、points しかないオブジェクト、text が数値の場合は「原稿が違います」と伝えてください。',
  template:'function titleOf(value:unknown):string {\n  if(typeof value === "object" && value !== § && "text" in value && typeof value.text === §) return value.text;\n  return "原稿が違います";\n}',slots:[["除くもの","null","0"],["text の型",'"string"','"number"']],
  starter:'function titleOf(value:unknown):string {\n  return "原稿が違います";\n}',contract:"const __title:(v:unknown)=>string=titleOf;",contractHint:"unknown を受け取り、文字を返す titleOf を作ります。",
  probes:[trial('titleOf({text:"雨"})',"雨","文字の text を取り出します。"),trial('titleOf(null)',"原稿が違います","null にある項目を読まないようにします。"),trial('titleOf({points:2})',"原稿が違います","text がない場合の戻り値を確認しましょう。"),trial('titleOf({text:3})',"原稿が違います","text が数値なら「原稿が違います」と返します。")]
},{
  id:"async-paper",chapter:3,title:"データの型の不一致と、読み込み失敗を区別する",
  why:"loadPaper は教材の問題データを非同期で読み込みます。戻り値の Promise<unknown> は、取得後に値の型を確かめる必要があることを表します。await で取得を待ち、valid で text と points を確認します。戻り値に value is … と書くと、valid が true の場合にその型を使えます。取得が失敗したら catch で処理し、say でメッセージを表示します。",
  before:goodLoad.replace('say(valid(value) ? value.text : "原稿を確認");','say("届きました");'),
  after:goodLoad,change:"読み込んだ値を確認して表示を変える",
  question:["JSONは届いたが points が文字。この教材で出す案内は？",["もう一度","原稿を確認","読込中","夜の庭"],1,"取得の成否と、届いた中身の形は別々に判定します。"],
  prompt:"教材の loadPaper と valid を使います。openPaper() で、読み込めて項目の型も合っていれば題名、項目の型が違うときは「原稿を確認」、取得失敗は「もう一度」と表示します。回答欄を残して読込をやり直せるようにします。",
  template:goodLoad.replace("await loadPaper()","§").replace('valid(value) ? value.text : "原稿を確認"','§').replace('say("もう一度")','say(§)'),
  slots:[["値が届くのを待つ","await loadPaper()","loadPaper()"],["届いた値を調べる",'valid(value) ? value.text : "原稿を確認"','"原稿を確認"'],["取得失敗",'"もう一度"','"原稿を確認"']],
  starter:goodLoad.replace('say(valid(value) ? value.text : "原稿を確認");','say("届きました");'),
  contract:"const __open:()=>Promise<void>=openPaper;",contractHint:"非同期で読み込む openPaper を用意します。",
  dom:{html:localHtml,setup:localSetup,tests:asyncTests}
});
