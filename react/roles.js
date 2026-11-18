"use strict";
const reducerApp = `export function reducer(total, action) {
  if (action.type === "add") return total + 1;
  return total;
}
function App() {
  const [total, send] = useReducer(reducer, 0);
  return <button onClick={() => send({type:"add"})}>{total}件</button>;
}`;
const memoApp = `export function reducer(notes, action) {
  if (action.type === "add") return [...notes, action.text];
  if (action.type === "undo") return notes.slice(0, -1);
  return notes;
}
function App() {
  const [notes, send] = useReducer(reducer, []);
  return <section>
    <button onClick={() => send({type:"add",text:"展示" + (notes.length + 1)})}>メモを追加</button>
    <button onClick={() => send({type:"undo"})}>取消</button>
    <ul>{notes.map((n,i) => <li key={i}>{n}</li>)}</ul>
  </section>;
}`;
const contextApp = `const Display = createContext("通常");
function Caption() {
  const setting = useContext(Display);
  return <p>{setting}</p>;
}
function Room() { return <article><Caption /></article>; }
function App() {
  return <section>
    <Room />
    <Display.Provider value="拡大"><Room /></Display.Provider>
  </section>;
}`;
const focusApp = `function App() {
  const entry = useRef(null);
  function resume() { entry.current.focus(); }
  return <section>
    <label>作品メモ <input ref={entry} /></label>
    <button onClick={resume}>入力に戻る</button>
  </section>;
}`;
const roleFinal = `const RoomName = createContext("一般");
function Sign() { return <p>{useContext(RoomName)}</p>; }
function Corridor() { return <article><Sign /></article>; }
function App() {
  const input = useRef(null);
  return <section>
    <Corridor />
    <RoomName.Provider value="静音"><Corridor /></RoomName.Provider>
    <label>見学メモ <input ref={input} /></label>
    <button onClick={() => input.current.focus()}>メモへ戻る</button>
  </section>;
}`;
const reactRoles = {
 id:"state-tools",title:"状態の更新・設定の共有・入力への復帰を選ぶ",focusTests:true,
 intro:"展示メモの追加と取消は状態の規則にまとめます。展示室の表示設定と、入力へ戻るボタンは別の小さな画面で試します。",
 demo:{code:memoApp,tip:"メモを二度追加し、取消を一度押して、どの行が残るか確かめてください。"},
 steps:[
  {
   title:"更新規則をreducerに取り出す",
   explain:"reducerは前の状態と行いたい操作から次の状態を返す関数です。useReducerがその関数を使い、sendで渡した操作を処理します。同じ入力なら同じ結果を返すように書きます。exportは実習で規則だけを試すためにも使います。",
   example:reducerApp.replace("total + 1","total + 2"),
   question:"前の状態が2でaddを送った時、一つ増やす規則の戻り値はどれですか。",options:["0","2","3","操作名"],correct:2,feedback:"前の2に1を足した3を新しい状態として返します。",
   task:"addなら一つ増やし、ほかの操作では元の数を返すreducerに変えます。",
   build:reactBuild(reducerApp,["total + 1","total + 2"],['type:"add"','type:"undo"']),
   tests:[[()=>{const rule=training.read("App").reducer;return rule(2,{type:"add"})===3 && rule(2,{type:"add"})===3 && rule(2,{type:"other"})===2;},"exportしたreducerで、addなら+1、そのほかは同じ数を返します。"],[t=>{training.click("button");return t.q("button").textContent==="1件";},"ボタンから同じ規則を使い、画面を1件にします。"]],
  },
  {
   title:"actionで追加と取消を選ぶ",
   explain:"actionは、どの操作をしたかを表すデータです。addではtextを末尾に加え、undoではslice(0, -1)で最後の一件を除いた配列を返します。渡された元の配列は変更しません。",
   example:memoApp.replace("notes.slice(0, -1)","notes.slice(1)"),
   question:"A・Bの順に追加した後、一度取消すると何が残りますか。",options:["両方","Aだけ","Bだけ","空"],correct:1,feedback:"直前に足したBが消え、前のAだけ残ります。",
   task:"undoで先頭を消す見本を、最後の一件を取り消す規則に直してください。空の一覧の取消も試せます。",
   build:reactBuild(memoApp,["notes.slice(0, -1)","notes.slice(1)"],["[...notes, action.text]","[action.text]"]),
   tests:[[()=>{const r=training.read("App").reducer;const input=Object.freeze(["風","森"]);const a=r(input,{type:"undo"}),b=r(input,{type:"undo"});return a.join()==="風" && b.join()==="風" && input.length===2 && r([],{type:"undo"}).length===0 && r(input,{type:"add",text:"雨"}).join()==="風,森,雨";},"元の配列を保ち、addとundoが同じ入力で同じ結果を返すようにします。"],[t=>{training.click("button");training.click("button");training.click("button:nth-of-type(2)");return t.all("li").map(n=>n.textContent).join()==="展示1";},"実ボタンでも二回追加、一回取消で一件目を残します。"]],
  },
  {
   title:"contextの内側だけで表示設定を共有する",
   explain:"離れたCaptionまで同じ設定を渡すため、createContextで受け渡し先を作ります。Providerの内側でuseContextを呼ぶと指定値、外側では初期値を読みます。途中のRoomは設定を渡し直さずに済みます。",
   example:contextApp.replace('value="拡大"','value="通常"'),
   question:"Providerの内側だけを拡大にした時、外側の札に出るのはどれですか。",options:["拡大","空白","通常","例外"],correct:2,feedback:"外側にはそのProviderの値が届かないので、createContextの初期値を読みます。",
   task:"内側の展示室だけを「拡大」にし、外側は「通常」のまま表示します。",
   build:reactBuild(contextApp,['value="拡大"','value="通常"'],["useContext(Display)",'"拡大"']),
   tests:[[t=>t.q("#root p")?.textContent==="通常","Providerの外側では初期値の通常を表示します。"],[t=>t.all("#root p").map(n=>n.textContent).join("/")==="通常/拡大","内側にある同じ部品には拡大設定を届けます。"]],
  },
  {
   title:"refで実際の入力欄に戻る",
   explain:"useRefで要素を指す入れ物を作り、inputのrefに渡します。描画後はcurrentに実際の欄が入るため、focus()を呼べます。フォーカスを移すだけなら表示用のstateを増やさずに済みます。",
   example:focusApp.replace("entry.current.focus();","entry.current.select(); entry.current.blur();"),
   question:"ボタンから入力欄へカーソルを戻すために使うのはどれですか。",options:["配列のlength","新しいメモの文字","reducerに入力欄を保存","ref.current.focus()"],correct:3,feedback:"refから実際の欄を読み、そこへフォーカスを動かします。",
   task:"resumeの中で入力欄へフォーカスを移し、入力中の文字を保ってください。",
   build:reactBuild(focusApp,["entry.current.focus()","entry.current.blur()"],["ref={entry}","name=\"entry\""]),
   tests:[[t=>{training.input("input","続き");training.click("button");return document.activeElement===t.q("input");},"ボタンを押したらrefが指す入力欄へフォーカスします。"],[t=>t.q("input").value==="続き","直前の入力をそのまま残します。"]],
  },
  {
   title:"見学室の表示とメモへの復帰を作る",
   explain:"見学者へ見せる設定はcontextで共有し、入力の場所へ戻る操作はrefで行います。見本は一つの札へ通常の表示設定を渡す小例です。",
   example:contextApp,
   question:"二つの札で共有する設定と、一度だけ実行する操作の組み合わせはどれですか。",options:["設定はcontext、入力先はref","設定も入力先も配列に保存","両方を毎回初期化","設定はfocus、入力先は作品数"],correct:0,feedback:"部品に届く設定と、実際の入力欄に対する命令を分けます。",
   task:"同じ札の部品を二か所に使い、外側のpには「一般」、Providerの内側は「静音」を表示します。見学メモ用の入力欄と「メモへ戻る」ボタンを作り、押すと書きかけの欄へフォーカスを戻してください。",
   starter:"",build:reactBuild(roleFinal,['value="静音"','value="一般"'],["input.current.focus()","input.current.blur()"]),
   tests:[[t=>t.all("#root p").map(n=>n.textContent).join("/")==="一般/静音","同じ札を二か所で使い、外側と内側の設定を表示します。"],[t=>{training.input("input","書きかけ");training.click("button");return t.q("button").textContent==="メモへ戻る" && document.activeElement===t.q("input") && t.q("input").value==="書きかけ";},"ボタンから入力欄に実際に戻し、文字を保ちます。"]],
  },
 ],
};
