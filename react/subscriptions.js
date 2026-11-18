"use strict";
const monitorPage = '<div id="root"></div><p>温度計から通知を送る</p><button id="north-send">北室を1上げる</button> <button id="south-send">南室を1上げる</button><p id="active"></p>';
const sensorFixture = `const station = (() => {
  const values = {north:18, south:24};
  const listeners = {north:new Set(), south:new Set()};
  function report() {
    const note = document.querySelector("#active");
    if (note) note.textContent = "購読中　北室 " + listeners.north.size + "件 ／ 南室 " + listeners.south.size + "件";
  }
  function emit(room) {
    values[room] += 1;
    for (const notify of listeners[room]) notify(values[room]);
  }
  for (const room of ["north","south"]) {
    document.getElementById(room+"-send")?.addEventListener("click", () => emit(room));
  }
  report();
  return {
    read:room=>values[room], count:room=>listeners[room].size, emit,
    subscribe(room, notify) {
      listeners[room].add(notify);
      report();
      return () => { listeners[room].delete(notify); report(); };
    }
  };
})();`;
const computedValue = `function App() {
  const [word, setWord] = useState("");
  const size = word.length;
  return <section><label>展示名 <input value={word} onChange={e => setWord(e.target.value)}/></label>
    <p>{size}文字</p></section>;
}`;
const northMeter = `function App() {
  const [value, setValue] = useState(station.read("north"));
  useEffect(() => {
    const stop = station.subscribe("north", next => setValue(next));
    return stop;
  }, []);
  return <p>{value}℃</p>;
}`;
const roomMeter = `function Meter({room}) {
  const [value, setValue] = useState(station.read(room));
  useEffect(() => {
    setValue(station.read(room));
    const stop = station.subscribe(room, setValue);
    return stop;
  }, [room]);
  return <p>{value}℃</p>;
}
function App() {
  const [room, setRoom] = useState("north");
  const [open, setOpen] = useState(true);
  return <section>
    <button id="switch" onClick={() => setRoom(room === "north" ? "south" : "north")}>部屋を切替</button>
    <button id="toggle" onClick={() => setOpen(!open)}>{open ? "閉じる" : "開く"}</button>
    {open && <Meter room={room}/>}
  </section>;
}`;
const twoMeters = `function useTemperature(room) {
  const [value, setValue] = useState(station.read(room));
  useEffect(() => {
    setValue(station.read(room));
    const stop = station.subscribe(room, setValue);
    return stop;
  }, [room]);
  return value;
}
function North() { return <p>{useTemperature("north")}℃</p>; }
function South() { return <p>{useTemperature("south")}℃</p>; }
function App() { return <section><North/><South/></section>; }`;
const desks = `function useSignal(room) {
  const [value, setValue] = useState(station.read(room));
  useEffect(() => {
    setValue(station.read(room));
    return station.subscribe(room, setValue);
  }, [room]);
  return value;
}
function Notice({room}) { return <p>{useSignal(room)}件</p>; }
function App() {
  const [open, setOpen] = useState(true);
  return <section><button id="toggle" onClick={() => setOpen(!open)}>{open ? "閉じる" : "開く"}</button>
    <Notice room="north"/>{open && <Notice room="south"/>}</section>;
}`;
const meterChecks=[
 [async t=>{await t.wait(30);return station.count("north")===1 && t.q("#root p").textContent==="18℃";},"初回は北室を一件だけ購読し、現在の温度を表示します。"],
 [async t=>{training.click("#switch");await t.wait(30);return station.count("north")===0 && station.count("south")===1 && t.q("#root p").textContent==="24℃";},"切替時に旧購読を解除してから、新しい部屋の現在値を読みます。"],
 [t=>{training.click("#north-send");training.click("#south-send");return t.q("#root p").textContent==="25℃";},"旧通知では変えず、現在の部屋の通知だけを表示します。"],
 [async t=>{training.click("#toggle");await t.wait(30);return station.count("south")===0 && !t.q("#root p");},"取り外した時も解除します。"],
 [async t=>{training.click("#toggle");await t.wait(30);return station.count("south")===1 && t.q("#root p").textContent==="25℃";},"開き直しても購読は一件だけです。"],
];
const reactSubscriptions = {
 id:"effects",title:"温度の通知を受け取り、閉じたら購読を解除する",
 intro:"温度計から値が届くたびに表示を更新します。別の部屋へ切り替えたり、表示を閉じたりした時は、古い温度計からの通知を止めます。",
 setup:sensorFixture,
 demo:{html:monitorPage,code:roomMeter,tip:"北室を1上げてから部屋を切り替え、両方の温度計を操作してください。閉じる・開くを試し、購読中の件数も見比べます。"},
 steps:[
  {
   title:"入力から計算できる表示を見分ける",
   explain:"表示する文字数は入力した文字から毎回計算できます。別に保存したり、外へ問い合わせたりせず、描画するときにlengthを読みます。この後で、部品の外から届く通知との違いを試します。",
   example:computedValue.replace("const size = word.length;","const size = 0;"),
   question:"作品名が変わると必ず決まる値はどれですか。",options:["次の温度","まだ届かない通知","欄にある文字列の長さ","購読者の総数"],correct:2,feedback:"入力の文字列があれば、その時の長さは描画中に求められます。",
   task:"入力から文字数を計算し、「波」で1文字、「波音」で2文字と表示します。",
   build:reactBuild(computedValue,["word.length","0"],["{size}文字","{word}文字"]),
   tests:[[t=>{training.input("input","波");return t.q("#root p").textContent==="1文字";},"入力のlengthで表示を作ります。"],[t=>{training.input("input","波音");return t.q("#root p").textContent==="2文字";},"入力を変えると今の文字数を表示します。"]],
  },
  {
   title:"一つの外部イベントと表示を同期する",html:monitorPage,
   explain:"stationは教材内の温度計です。readで現在値を読み、subscribeに部屋と関数を渡すと新しい値を受け取れます。useEffectは表示後に購読を始めます。空の[]はこの部品が取り付けられた時の購読です。戻り値のstopは解除に使えます。",
   example:northMeter.replace("next => setValue(next)","next => setValue(18)"),
   question:"北室から19が届いたとき、何をstateに入れますか。",options:["前の18","受け取った19","購読者数","部屋名"],correct:1,feedback:"届いた値にstateを更新すると、温度表示も変わります。",
   task:"固定の18ではなく、届いた北室の温度で表示を更新します。南室の通知には反応させません。",
   build:reactBuild(northMeter,["next => setValue(next)","next => setValue(18)"],['subscribe("north"','subscribe("south"']),
   tests:[[async t=>{await t.wait(30);return station.count("north")===1 && t.q("#root p").textContent==="18℃";},"北室の現在値を読み、一件だけ購読します。"],[t=>{training.click("#north-send");training.click("#south-send");return t.q("#root p").textContent==="19℃";},"受け取った北室の温度を使います。"]],
  },
  {
   title:"切替と取り外しで前の購読を解除する",html:monitorPage,
   explain:"[room]と書くと、部屋が変わった時に前のeffectの後片付けをしてから新しく購読します。return stopで解除関数をReactへ渡します。同じ後片付けは部品を取り外した時にも呼ばれます。",
   example:roomMeter.replace("return stop;","// 解除関数をまだ返していない"),
   question:"開く→閉じる→同じ部屋を再度開く順で、購読件数はどうなりますか。",options:["1→1→2","0→1→0","1→0→1","2→1→2"],correct:2,feedback:"閉じたら0件、開いたら一件になります。閉じる前の購読は残しません。",
   task:"effectの最後でstopを返し、切替と閉じる操作で古い購読が解除されるようにします。",
   build:reactBuild(roomMeter,["return stop;","// 解除しない"],["}, [room]);","}, []);"]),tests:meterChecks,
  },
  {
   title:"同じ購読処理を自作のHookで共用する",html:monitorPage,
   explain:"useで始まる関数にstateとeffectをまとめると、同じ処理を複数の部品で呼べます。これをカスタムHookと呼びます。それぞれの呼び出しが別々のstateと購読を持ちます。",
   example:twoMeters.replace('useTemperature("south")','useTemperature("north")'),
   question:"北室に通知が届いた時、南室の札には何が起きますか。",options:["北の値に置き換わる","消える","両方1ずつ増える","南の現在値を保つ"],correct:3,feedback:"南の札は南専用の購読とstateを持っているため、北室の通知では変わりません。",
   task:"北・南の札が、それぞれ正しい部屋の温度を受け取るようにします。",
   build:reactBuild(twoMeters,['useTemperature("south")','useTemperature("north")'],["return stop;","return () => {};"]),
   tests:[[async t=>{await t.wait(30);return station.count("north")===1 && station.count("south")===1;},"各部屋で一件ずつ購読します。"],[t=>{training.click("#north-send");return t.all("#root p").map(n=>n.textContent).join("/")==="19℃/24℃";},"北室の更新は北側だけに反映します。"],[t=>{training.click("#south-send");return t.all("#root p").map(n=>n.textContent).join("/")==="19℃/25℃";},"南室の更新も独立して表示します。"],[async t=>{training.mount(()=>null);await t.wait(20);return station.count("north")===0 && station.count("south")===0;},"両方の部品を取り外した時は、それぞれの購読を解除します。"]],
  },
  {
   title:"二つの受付件数を監視する",html:monitorPage.replaceAll("温度計","受付").replaceAll("室","窓口"),
   explain:"今度は同じ入力元を受付件数として扱います。読み取り元と解除方法が同じなら、購読の判断を自分のHookにまとめられます。",
   example:northMeter,
   question:"南窓口だけを閉じた時、残す購読はどれですか。",options:["両方","北だけ","南だけ","どちらも閉じる"],correct:1,feedback:"表示を続ける北窓口の購読は保ち、南の部品を取り外したときに南だけ解除します。",
   task:"北（north）・南（south）の現在値を、それぞれのpに「18件」の形で表示します。idがtoggleのボタンで南の札だけを開閉し、閉じている間の通知も、再表示で最新件数に追いつくようにしてください。自作のHookから購読解除を返しましょう。",
   starter:"",build:reactBuild(desks,["return station.subscribe(room, setValue);","station.subscribe(room, setValue);"],["{open && <Notice","{!open && <Notice"]),
   tests:[[async t=>{await t.wait(30);return station.count("north")===1 && station.count("south")===1 && t.all("#root p").map(n=>n.textContent).join("/")==="18件/24件";},"二つの窓口の初期値を表示し、それぞれ一件ずつ購読します。"],[async t=>{training.click("#toggle");await t.wait(20);return station.count("north")===1 && station.count("south")===0 && t.all("#root p").length===1;},"南だけを閉じ、南の購読を解除します。"],[async t=>{training.click("#south-send");training.click("#north-send");training.click("#toggle");await t.wait(20);return t.all("#root p").map(n=>n.textContent).join("/")==="19件/25件" && station.count("south")===1;},"再表示で南の現在値を取り直し、北も含め二重購読を避けます。"]],
  },
 ],
};
