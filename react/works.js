"use strict";
const voteApp = `function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(n => n + 1)}>{count}票</button>;
}`;
const twiceApp = `function App() {
  const [count, setCount] = useState(0);
  function vote() {
    setCount(n => n + 1);
    setCount(n => n + 1);
  }
  return <button onClick={vote}>{count}票</button>;
}`;
const addListApp = `function App() {
  const [works, setWorks] = useState(["水玉"]);
  function add() { setWorks([...works, "作品" + (works.length + 1)]); }
  return <section><button onClick={add}>作品を追加</button>
    <ul>{works.map(name => <li key={name}>{name}</li>)}</ul>
  </section>;
}`;
const controlledApp = `function App() {
  const [draft, setDraft] = useState("");
  return <section><label>作品名 <input value={draft} onChange={e => setDraft(e.target.value)} /></label>
    <p>{draft}</p></section>;
}`;
const entryBody = `function App() {
  const [works, setWorks] = useState([]);
  const [draft, setDraft] = useState("");
  function submit(event) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setWorks([...works, title]);
    setDraft("");
  }
  return <section>
    <form onSubmit={submit}><label>作品名 <input value={draft} onChange={e => setDraft(e.target.value)} /></label><button>登録</button></form>
    <ul>{works.map((title, i) => <li key={i}>{title}</li>)}</ul>
  </section>;
}`;
const liveShelf = `function WorkForm({onAdd}) {
  const [draft, setDraft] = useState("");
  function submit(event) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    onAdd(title);
    setDraft("");
  }
  return <form onSubmit={submit}><label>作品名 <input value={draft} onChange={e => setDraft(e.target.value)} /></label><button>登録</button></form>;
}
function WorkList({works, mark}) {
  return <ul>{works.map(work => <li key={work.id}>
    <span>{work.title}</span>{" "}
    <button onClick={() => mark(work.id)}>{work.pick ? "注目済み" : "注目"}</button>
  </li>)}</ul>;
}
function Total({count}) { return <p>{count}件</p>; }
function App() {
  const [works, setWorks] = useState([{id:1, title:"木の舟", pick:false}]);
  function add(title) {
    setWorks(list => [...list, {id:list.length + 1, title, pick:false}]);
  }
  function mark(id) {
    setWorks(list => list.map(w => w.id === id ? {...w, pick:!w.pick} : w));
  }
  return <section><WorkForm onAdd={add} />
    <WorkList works={works} mark={mark} /><Total count={works.length} /></section>;
}`;
const siblingApp = `function Names({works}) {
  return <ul>{works.map(w => <li key={w}>{w}</li>)}</ul>;
}
function Count({total}) { return <p>{total}件</p>; }
function App() {
  const [works, setWorks] = useState(["浜"]);
  return <section><button onClick={() => setWorks([...works, "作品" + (works.length + 1)])}>追加</button>
    <Names works={works}/><Count total={works.length}/></section>;
}`;
const workFormChecks = [
 [t=>{training.input("input","　 ");training.click("form button");return !t.q("#root li");},"空白だけの作品名を登録しないようにします。"],
 [t=>{training.input("input"," 灯り ");training.click("form button");return t.q("#root li")?.textContent==="灯り" && t.q("input").value==="";},"有効な名前を一件だけ登録し、欄を空にします。"],
 [t=>{training.input("input","川");training.click("form button");return t.all("#root li").map(n=>n.textContent).join("/")==="灯り/川";},"続けて送っても前の作品を残します。"],
];
const reactWorks = {
 id:"work-list",title:"操作を記憶し、一覧と件数を更新する（state）",
 intro:"作品名を入力して登録すると、一覧に一行増え、件数も増える画面を作ります。",
 demo:{code:liveShelf,tip:"作品を二つ登録した後、三つ目を書きかけのまま、先頭の「注目」を切り替えてみましょう。入力欄と件数を確かめてください。"},
 steps:[
  {
   title:"ボタンを押すたびに票数を増やす（useState）",
   explain:"React の部品が次の表示にも引き継ぐ値を state と呼びます。useState(0) は、現在の値と、その値を更新する関数を返します。onClickに関数を渡すと、押すたびにReactが新しい票数を描きます。この教材ではuseStateをすぐ使えます。",
   example:voteApp.replace("n + 1","n + 2"),
   question:"現在値を使って一票増やす指定はどれですか。",options:["countを表示するだけ","setCount(n => n + 1)","useStateを押すたびに呼ぶ","戻り値を捨てる"],correct:1,feedback:"更新関数に前の値から次の値を作る関数を渡します。",
   task:"一回で2票の見本を、押すたびに一票ずつ増えるよう変えます。",
   build:reactBuild(voteApp,["n + 1","n + 2"],["{count}票","{0}票"]),
   tests:[[t=>t.q("button").textContent==="0票","最初は0票です。"],[t=>{training.click("button");return t.q("button").textContent==="1票";},"クリックで1票にします。"],[t=>{training.click("button");return t.q("button").textContent==="2票";},"二度目も前の値から更新します。"]],
  },
  {
   title:"1回のクリックで直前の値に1ずつ2回足す",
   explain:"押す前の count が 0 なら、そのクリックを処理している間は count を読んでも 0 です。setCount(count + 1) を二度呼ぶと、どちらも「1にする」という指定です。setCount(n => n + 1) なら「直前の更新結果に1を足す」を二度予約するので、0 → 1 → 2 になります。",
   example:twiceApp.replaceAll("setCount(n => n + 1);","setCount(count + 1);"),
   question:"0票から更新関数で1ずつ二度足すと、画面には何票と出ますか。",options:["0票","1票","2票","4票"],correct:2,feedback:"二つ目の更新は一つ目が作った1を受け取り、2になります。",
   task:"一回のクリックで票数を1ずつ二度増やしてください。最初のクリックで2票、次のクリックで4票と表示されます。",
   build:reactBuild(twiceApp,["setCount(n => n + 1);\n    setCount(n => n + 1);","setCount(count + 1);\n    setCount(count + 1);"],["onClick={vote}","onClick={() => {}}"]),
   tests:[[t=>{training.click("button");return t.q("button").textContent==="2票";},"一回の操作で合計2票にします。"],[t=>{training.click("button");return t.q("button").textContent==="4票";},"次の操作でも前回から2票増やします。"]],
  },
  {
   title:"元の配列を残して一覧に行を追加する",
   explain:"mapで一件ずつliを作ります。keyはReactが前回と今回の同じ行を対応づける目印です。この見本では作品名が重複しないので、名前を目印に使えます。同名の行を扱う場合は、各データに付いた管理番号などを使います。[...works, 新しい値]は元の配列を残して新しい配列を作ります。",
   example:addListApp.replace('[...works, "作品" + (works.length + 1)]','["作品" + (works.length + 1)]'),
   question:"元の水玉を残したまま新しい作品を追加する値はどれですか。",options:['["作品2"]',"works.length",'[...works, "作品2"]',"空の配列"],correct:2,feedback:"元の作品を展開した後に一件を付け足します。",
   task:"元の一覧をコピーして新しい作品を末尾に追加してください。ボタンを二度押すと、「水玉」「作品2」「作品3」の三行になります。",
   build:reactBuild(addListApp,['[...works, "作品" + (works.length + 1)]','["作品" + (works.length + 1)]'],["{name}</li>","作品</li>"]),
   tests:[[t=>t.q("li")?.textContent==="水玉","初めの一件を表示します。"],[t=>{const first=t.q("li");training.click("button");training.click("button");return t.q("li")===first && t.all("li").map(n=>n.textContent).join("/")==="水玉/作品2/作品3";},"元の行を保ち、コピーした配列の末尾に新しい行を加えます。"]],
  },
  {
   title:"入力した文字を別の場所にもすぐ表示する",
   explain:"valueにstateを渡し、onChangeで欄の現在値を受け取ります。入力中の値を状態として持てば、同じ文字を別の場所にもすぐ表示できます。",
   example:controlledApp.replace("<p>{draft}</p>","<p>下書き</p>"),
   question:"編集中の文字を別のpにも表示したいとき、どの値を使いますか。",options:["最初の空文字","送信ボタン名","欄の幅","draft"],correct:3,feedback:"入力を受け取ったstateを、欄のvalueとpの両方に使います。",
   task:"入力した作品名を、その場で下のpにも表示してください。",
   build:reactBuild(controlledApp,["<p>{draft}</p>","<p>下書き</p>"],["e.target.value","e.target.name"]),
   tests:[[t=>{training.input("input","灯");return t.q("input").value==="灯" && t.q("p").textContent==="灯";},"入力と同じ値をpへ表示します。"],[t=>{training.input("input","灯臺");return t.q("p").textContent==="灯臺";},"書き直した文字も反映します。"]],
  },
  {
   title:"フォーム送信で一覧に加える",
   explain:"onSubmitでページ移動を止め、trimで空白を除いてから一覧へ渡します。登録できた時だけsetDraftで欄を空にします。今回の一覧は末尾に加えるだけなので添字をkeyにできます。",
   example:entryBody.replace("const title = draft.trim();","const title = draft;"),
   question:"空白だけを送った時にすることはどれですか。",options:["空の行を追加","追加せず入力に戻る","全行を消す","件数を増やす"],correct:1,feedback:"trimした文字が空なら、一覧を更新する前にreturnします。",
   task:"名前の両端の空白を除き、空白だけなら追加しないようにします。登録後は欄を空にしてください。",
   build:reactBuild(entryBody,["draft.trim()","draft"],['setDraft("");','setDraft(title);']),tests:workFormChecks,
  },
  {
   title:"一覧と件数の元になるデータを親の部品に置く",
   explain:"NamesとCountは兄弟の部品です。親に一つだけ一覧を持ち、片方には配列、もう片方にはその長さを渡します。件数を別のstateにしなくても、同じ更新でそろいます。",
   example:siblingApp.replace("total={works.length}","total={1}"),
   question:"一覧と件数の元になるstateは、どこに置きますか。",options:["それぞれの兄弟に一つずつ","どちらの外にも置かない","共通の親App","HTMLのタイトル"],correct:2,feedback:"共通の親から同じ配列に基づく値を渡せば、二つの表示が一緒に更新されます。",
   task:"Countに固定の1の代わりに、いまの配列の長さを渡してください。",
   build:reactBuild(siblingApp,["total={works.length}","total={1}"],["works={works}","works={[]}"]),
   tests:[[t=>t.q("p").textContent==="1件" && t.all("li").length===1,"最初の一覧と件数を合わせます。"],[t=>{training.click("button");training.click("button");return t.q("p").textContent==="3件" && t.all("li").length===3;},"二度追加した後も、同じ配列に基づく3行と3件にします。"]],
  },
  {
   title:"フォーム・一覧・件数をつなぎ、注目表示も切り替える",
   explain:"一覧に保存するのはid・作品名・注目の有無です。mapで対象のidに合う一件だけを{...元の作品, pick: 新しい値}に置き換えると、ほかの行はそのままです。下の例は二件の状態を文字で表示します。",
   example:simpleApp('<ul>{[{id:1,pick:false},{id:2,pick:true}].map(w => <li key={w.id}>{w.pick ? "注目済み" : "注目"}</li>)}</ul>'),
   question:"注目を切り替える時に残したい値の組み合わせはどれですか。",options:["件数だけ、入力を消す","入力稿とほかの作品","すべて初期化","選択した行だけに減らす"],correct:1,feedback:"変える一件を選び、入力中のstateとほかの行を保ちます。",
   task:"入力フォーム・一覧・件数をそれぞれ部品にし、親からつなぎます。最初の作品は「木の舟」。空白だけは登録せず、登録後は欄を空にします。各liに作品名と「注目」ボタンを置き、押した行だけ「注目済み」に切り替えてください。件数をpに「1件」の形で出し、注目を変えても書きかけの入力を保ちます。",
   starter:"",build:reactBuild(liveShelf,["count={works.length}","count={0}"],["pick:!w.pick","pick:w.pick"],["draft.trim()","draft"]),
   tests:[
    [t=>t.q("#root li")?.textContent.includes("木の舟") && t.q("#root p")?.textContent==="1件","初めの作品と1件を表示します。"],
    [t=>{training.input("input"," ");training.click("form button");return t.all("li").length===1;},"空白だけの入力で行を増やさないようにします。"],
    [t=>{for(const name of [" 波 ","月"]){training.input("input",name);training.click("form button");}return t.all("li").length===3 && t.q("p").textContent==="3件" && t.q("input").value==="" && t.all("li")[1].textContent.includes("波");},"続けて追加しても三件と三行がそろい、入力欄が空になります。"],
    [t=>{training.input("input","書きかけ");training.click("li:nth-child(2) button");return t.q("li:nth-child(2) button").textContent==="注目済み" && t.q("li button").textContent==="注目" && t.q("input").value==="書きかけ" && t.q("p").textContent==="3件";},"対象一行だけを更新し、入力中の文字と件数を保ちます。"],
    [()=>new Set(training.elements.map(e=>e.type)).size>=3,"入力フォーム・一覧・件数を親から呼ぶ部品に分けます。"],
   ],
  },
 ],
};
