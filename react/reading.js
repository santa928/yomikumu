"use strict";
const bookRow = `function Book({book}) {
  return <li>{book.title}</li>;
}`;
const bookSeed = `const initial = [
  {id:1, title:"波の地図", borrowed:true, read:true},
  {id:2, title:"森の便り", borrowed:false, read:true}
];`;
const oneBook = bookRow+'\nfunction App() { return <ul><Book book={{title:"野の手紙"}}/></ul>; }';
const twoBooks = bookSeed+"\n"+bookRow+`
function App() {
  const [books,setBooks] = useState(initial);
  return <section><button onClick={() => setBooks([...books,{id:books.length+1,title:"砂の道"}])}>一冊追加</button>
    <ul>{books.map(b => <Book key={b.id} book={b}/>)}</ul></section>;
}`;
const filterBooks = bookSeed+"\n"+bookRow+`
function App() {
  const [mode,setMode] = useState("all");
  const visible = initial.filter(b => mode === "all" || (mode === "borrowed" ? b.borrowed : !b.read));
  return <section><button onClick={()=>setMode("borrowed")}>借りた本</button>
    <button onClick={()=>setMode("unread")}>未読の本</button>
    <button onClick={()=>setMode("all")}>解除</button>
    <ul>{visible.map(b=><Book key={b.id} book={b}/>)}</ul><p>{visible.length}冊</p></section>;
}`;
const pureTemperature = `function Temperature({celsius}) { return <p>{celsius}℃</p>; }
function App() {
  const [value,setValue] = useState(18);
  return <section><Temperature celsius={value}/>
    <button onClick={()=>setValue(v=>v+1)}>1度上げる</button></section>;
}`;
const thresholdForm = `function App() {
  const [draft,setDraft] = useState("");
  const [limit,setLimit] = useState(20);
  function save(e) {
    e.preventDefault();
    if (!draft.trim() || !Number.isFinite(Number(draft))) return;
    setLimit(Number(draft));
  }
  return <section><form onSubmit={save}><label>上限 <input value={draft} onChange={e=>setDraft(e.target.value)} /></label>
    <button>設定</button></form><p>{limit}℃</p></section>;
}`;
const composedMeter = `function useNorth() {
  const [value,setValue] = useState(station.read("north"));
  useEffect(() => station.subscribe("north",setValue), []);
  return value;
}
function App() {
  const temperature = useNorth();
  const [draft,setDraft] = useState("");
  const [limit,setLimit] = useState(20);
  function save(e) {
    e.preventDefault();
    if (draft.trim() && Number.isFinite(Number(draft))) setLimit(Number(draft));
  }
  return <section><form onSubmit={save}><label>上限 <input value={draft} onChange={e=>setDraft(e.target.value)}/></label>
    <button>設定</button></form>
    <p>{temperature}℃／上限{limit}℃</p>
    <strong>{temperature > limit ? "超過" : "範囲内"}</strong></section>;
}`;
const library = bookSeed+"\n"+bookRow+`
function App() {
  const [books,setBooks] = useState(initial);
  const [mode,setMode] = useState("all");
  const [draft,setDraft] = useState("");
  const visible = books.filter(b=>mode==="all" || (mode==="borrowed" ? b.borrowed : !b.read));
  function add(e) {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setBooks([...books,{id:books.length+1,title,borrowed:false,read:false}]);
    setDraft("");
  }
  function reset() { setBooks(initial);setMode("all");setDraft(""); }
  return <section><form onSubmit={add}><label>書名 <input value={draft} onChange={e=>setDraft(e.target.value)}/></label><button>追加</button></form>
    <button onClick={()=>setMode("borrowed")}>借りた本</button>
    <button onClick={()=>setMode("unread")}>未読の本</button>
    <button onClick={()=>setMode("all")}>解除</button><button onClick={reset}>リセット</button>
    <ul>{visible.map(b=><Book key={b.id} book={b}/>)}</ul><p>{visible.length}冊</p></section>;
}`;
// ボタンの文字を使うので、学習者は部品の数や親要素を自分で決められる。
const readingSetup = sensorFixture + `
function readingClick(label) {
  const b = [...document.querySelectorAll("#root button")].find(b => b.textContent === label);
  ReactDOM.flushSync(()=>b.click());
}`;
const bookFilterChecks=[
 [t=>t.all("#root li").map(n=>n.textContent).join("/")==="波の地図/森の便り" && t.q("#root p").textContent==="2冊","初回は二冊を元の順に表示します。"],
 [t=>{readingClick("借りた本");return t.all("#root li").map(n=>n.textContent).join()==="波の地図" && t.q("#root p").textContent==="1冊";},"借りた本には波の地図だけを表示します。"],
 [t=>{readingClick("未読の本");return !t.q("#root li") && t.q("#root p").textContent==="0冊";},"未読がない場合は空の一覧と0冊を表示します。"],
 [t=>{readingClick("解除");return t.all("#root li").length===2 && t.q("#root p").textContent==="2冊";},"解除で元の二冊へ戻します。"],
];
const reactReading = {
 id:"reading-project",title:"表示部品・フォーム・通知の受け取りを組み合わせる",
 intro:"本を一冊ずつ表示する部品から始め、借りた本と未読の本を探す読書リストへ進みます。途中で温度計を使い、親が持つ値を子に表示する方法も試します。最後は、本の追加・絞り込み・リセットができる一覧を作ります。",
 setup:readingSetup,demo:{code:library,tip:"「未読の本」で0冊を確かめ、新しい書名を追加してください。「借りた本」「解除」「リセット」で一覧と件数を見比べます。"},
 steps:[
  {
   title:"一冊の本を表示する部品を書く",
   explain:"一冊分のデータをbookとして受け取り、そのtitleをliに出します。親のulの中に部品を置けば、ブラウザにも一覧の行が一つできます。",
   example:oneBook.replace("{book.title}</li>","一冊目</li>"),
   question:"Book に別の本を渡したとき、その本の書名を表示するには、どこから値を読みますか。",options:["最初の文字を固定","propsのbook.title","画面の幅","配列の長さ"],correct:1,feedback:"部品へ渡された一冊から名前を読みます。",
   task:"Book が受け取った本の title を li に表示してください。別の本を渡すと、その本の書名に変わります。",
   build:reactBuild(oneBook,["{book.title}</li>","一冊目</li>"],['title:"野の手紙"','title:"砂の道"']),
   tests:[[t=>t.q("#root li")?.textContent==="野の手紙","一冊目の名前を表示します。"],[t=>{const book=training.elements.find(e=>e.props?.book);if(!book)return false;training.mount(book.type,{book:{title:"別の旅"}});return t.q("#root li").textContent==="別の旅";},"本を渡し替えてもtitleから名前を読める部品を作ります。"]],
  },
  {
   title:"配列から本を1冊ずつ取り出し、同じ部品で表示する",
   explain:"親に配列を置き、mapが各本をBookに一冊ずつ渡します。idをkeyにすると、名前が同じ本も区別できます。見本のボタンは一冊だけに置き換えてしまいます。",
   example:twoBooks.replace('[...books,{id:books.length+1,title:"砂の道"}]','[{id:books.length+1,title:"砂の道"}]'),
   question:"一冊の部品と一覧全体の役割として合うのはどれですか。",options:["Bookが毎回全冊を初期化","両方が別の配列を保存","親が配列、Bookが一行","親は件数だけを保存"],correct:2,feedback:"親が配列を更新し、各Bookは渡された一冊を描きます。",
   task:"一度追加した時、元の二冊を残して「砂の道」を末尾に表示します。",
   build:reactBuild(twoBooks,['[...books,{id:books.length+1,title:"砂の道"}]','[{id:books.length+1,title:"砂の道"}]'],["book={b}","book={books[0]}"]),
   tests:[[t=>t.all("li").length===2,"初めの二冊を表示します。"],[t=>{training.click("button");return t.all("li").map(n=>n.textContent).join("/")==="波の地図/森の便り/砂の道";},"親で配列を更新し、三冊を一件ずつ部品へ渡します。"]],
  },
  {
   title:"選んだ条件で一覧を絞り、表示中の件数を数える",
   explain:"借りた本の条件はborrowed、未読の条件は!readです。件数には元の蔵書数ではなく、実際に表示する配列のlengthを使います。",
   example:filterBooks.replace("visible.length","initial.length"),
   question:"二冊とも既読で「未読の本」を選んだ時の表示はどれですか。",options:["二行・2冊","空の一覧・0冊","二行・0冊","一行・1冊"],correct:1,feedback:"条件に合う本がないとき、表示する行も表示件数も0です。",
   task:"初期データとBookを使い、借りた本・未読の本・解除のボタン、ulの一覧、pの「○冊」を自分で書いてください。二冊とも既読で、波の地図だけが借りた本です。",
   starter:bookSeed+"\n"+bookRow+"\n",build:reactBuild(filterBooks,["visible.length","initial.length"],["!b.read","b.read"]),tests:bookFilterChecks,
  },
  {
   title:"親で変わった数値を子の部品で表示する",
   explain:"親の App は気温を value に保存します。Temperature が受け取った数値に「℃」を付けると、ボタンで値を変えたときも最新の気温を表示できます。",
   example:pureTemperature.replace("celsius={value}","celsius={18}"),
   question:"「1度上げる」を押して19℃にした後、Temperature に渡す値はどれですか。",options:["最初の18","部屋名","更新後のvalue","ボタンのid"],correct:2,feedback:"親の最新値を表示部品へ渡します。",
   task:"親の value を Temperature に渡してください。最初は18℃で、「1度上げる」を押すたびに19℃、20℃と表示が変わります。",
   build:reactBuild(pureTemperature,["celsius={value}","celsius={18}"],["v=>v+1","v=>v-1"]),
   tests:[[t=>t.q("#root p").textContent==="18℃","p に現在の温度を表示します。"],[t=>{training.click("#root button");training.click("#root button");return t.q("#root p").textContent==="20℃";},"二度押した後は、親の最新値を渡して20℃と表示します。"]],
  },
  {
   title:"入力中の値と送信済みの値を分けて保存する",
   explain:"入力中の下書きと送信済みの上限は別の値です。送信するときにNumberで文字を数に変えて上限へ保存します。空欄を送ったときは前の値を使い続けます。",
   example:thresholdForm,
   question:"上限20の時に18と入力しただけなら、保存済みの上限はどれですか。",options:["18","0","空文字","20"],correct:3,feedback:"入力中と送信済みを分けたので、送信するまでは20です。",
   task:"最初の上限は16℃です。入力だけでは変えず、有効な数を送った時だけpの表示を更新してください。空欄なら前の上限を保ちます。入力と送信の処理は自分で書きます。",
   starter:'function App() {\n  const [limit,setLimit] = useState(16);\n  // 回答欄・送信・表示を組み立てます\n}',
   build:reactBuild(thresholdForm.replace("useState(20)","useState(16)"),["useState(16)","useState(20)"],["if (!draft.trim() || !Number.isFinite(Number(draft))) return;","// 空欄も保存"]),
   tests:[[t=>t.q("#root p")?.textContent==="16℃","最初は16℃と表示します。"],[t=>{training.input("input","21");return t.q("#root p").textContent==="16℃";},"入力中の値と確定値を別々に保ちます。"],[t=>{training.click("form button");training.input("input"," ");training.click("form button");training.input("input","文字");training.click("form button");return t.q("#root p").textContent==="21℃";},"送信した値を保存し、空白や数でない入力では上書きしません。"]],
  },
  {
   title:"温度通知を受け取り、部品を閉じたら停止する",html:monitorPage,
   explain:"フォームと切り離して外部同期だけを試します。今回は南室の現在値を読み、通知ごとに更新し、取り外しでは解除関数を実行できるようにします。",
   example:northMeter,
   question:"温度表示を取り外した後の南室の購読数はどれですか。",options:["1","2","0","温度と同じ数"],correct:2,feedback:"表示のための購読を解除すると0件になります。",
   task:"南室southの現在値をpに「24℃」として表示し、南室の通知に追従させます。useEffect内で購読し、取り外されたら解除してください。",
   starter:"",build:reactBuild(northMeter.replaceAll('"north"','"south"'),['subscribe("south"','subscribe("north"'],["return stop;","// 解除しない"]),
   tests:[[async t=>{await t.wait(20);return station.count("south")===1 && t.q("#root p")?.textContent==="24℃";},"南室の読み取りと一件の購読から始めます。"],[async t=>{training.click("#south-send");if(t.q("#root p").textContent!=="25℃")return false;training.mount(()=>null);await t.wait(20);return station.count("south")===0;},"通知を画面に反映し、取り外しで解除します。"]],
  },
  {
   title:"外から届く温度と、フォームで設定した上限を比べる",html:monitorPage,
   explain:"上限温度はフォーム送信で変わり、観測温度は外部から届きます。二つを分けて持ち、描画時に比較すれば、通知が来ても入力途中の文字を保てます。",
   example:thresholdForm,
   question:"上限の下書き中に外から通知が届いたら、何を残しますか。",options:["下書きを空にする","入力中の文字と確定済み上限","外の温度を捨てる","両方を初期化"],correct:1,feedback:"通知では観測温度だけを変え、確定済み上限と下書きは引き継ぎます。",
   task:"北室の現在値は18、上限の初期値は20です。pに「18℃／上限20℃」、strongに「範囲内」（超えたら「超過」）と表示します。フォームで上限を変更でき、届いた通知で下書きを失わない画面を作りましょう。取り外されたら購読を解除します。",
   starter:"",build:reactBuild(composedMeter,["temperature > limit","temperature < limit"],['station.subscribe("north",setValue)','station.subscribe("south",setValue)']),
   tests:[[async t=>{await t.wait(20);return t.q("#root p")?.textContent==="18℃／上限20℃" && t.q("#root strong").textContent==="範囲内";},"現在値と確定済み上限を表示します。"],[t=>{training.input("input","17");training.click("#north-send");return t.q("input").value==="17" && t.q("#root p").textContent==="19℃／上限20℃";},"通知で現在値だけを変え、下書きを保存します。"],[async t=>{training.click("form button");if(t.q("#root strong").textContent!=="超過" || t.q("#root p").textContent!=="19℃／上限17℃")return false;training.mount(()=>null);await t.wait(20);return station.count("north")===0;},"送信後は確定した上限で判定し、取り外しで購読を解除します。"]],
  },
  {
   title:"追加・解除・リセットのある読書リストを制作する",
   explain:"見本では、Book が親から受け取った一冊を表示しています。練習では一覧と選んだ条件を親に保存し、表示する本を一冊ずつ子に渡します。完成後は、読書リストと温度表示で何を親に置いたかを書き残せます。",
   example:oneBook,
   question:"未読の本を表示しながら一冊追加した時、表示する冊数を計算するのはどの部分ですか。",options:["一冊を表示する Book","フォームのラベル","表示用の一覧を作る親","ボタン"],correct:2,feedback:"親が今の条件に合う一覧を求め、その長さを表示します。",
   task:"最初に「波の地図」（借りた本・既読）と「森の便り」（自分の本・既読）の二冊を表示してください。「借りた本」「未読の本」「解除」で絞り込み、ulの行とpの冊数をそろえます。フォームから書名を追加したら自分の未読本にし、空白だけは登録しません。「リセット」で初期の二冊と全件表示・空の入力欄へ戻してください。親と一冊分の部品は自分で書きます。",
   reflection:"一冊を描く部品と、条件や件数を扱う部品に分けた理由を自分の言葉で残す",
   starter:"",build:reactBuild(library,["visible.length","books.length"],["borrowed:false,read:false","borrowed:true,read:true"],["setBooks(initial);setMode","setBooks([]);setMode"]),
   tests:[...bookFilterChecks,[t=>{readingClick("未読の本");training.input("input"," ");training.click("form button");return !t.q("#root li");},"空白だけの書名は追加しません。"],[t=>{training.input("input"," 星図 ");training.click("form button");return t.all("#root li").map(n=>n.textContent).join()==="星図" && t.q("#root p").textContent==="1冊" && t.q("input").value==="";},"追加した本を未読として表示し、入力を空にします。"],[t=>{readingClick("解除");if(t.all("#root li").length!==3)return false;readingClick("借りた本");training.input("input","途中");readingClick("リセット");return t.all("#root li").map(n=>n.textContent).join("/")==="波の地図/森の便り" && t.q("#root p").textContent==="2冊" && t.q("input").value==="";},"解除で全3冊へ、リセットで最初の二冊と冊数・空の入力欄に戻します。"]],
  },
 ],
};
