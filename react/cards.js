"use strict";
const simpleApp = text => 'function App() {\n  return ' + text + ';\n}';
const cardFunction = `function WorkCard({ title, children }) {
  return <article><h2>{title}</h2><p>{children}</p></article>;
}`;
const firstPair = cardFunction + `
function App() {
  return <section>
    <WorkCard title="朝の砂浜">海辺の写真</WorkCard>
    <WorkCard title="坂の灯り">夜の版画</WorkCard>
  </section>;
}`;
const finalPair = joinReactFiles({
  "WorkCard.jsx":"export default "+cardFunction,
  "App.jsx":`import WorkCard from "./WorkCard";
function App() {
  return <section>
    <WorkCard title="水面の月">鉛筆の習作</WorkCard>
    <WorkCard title="冬の庭">小さな水彩</WorkCard>
  </section>;
}`,
});
const reactCards = {
  id:"components",title:"作品を表示する部品を二か所で使う",
  intro:"似た作品カードを一つずつ書く代わりに、一枚分の部品を作り、それぞれの作品名と紹介を渡します。",
  demo:{tip:"「次の作品へ」を押すと、同じ形のカードに別の作品名と紹介が入ります。",
    code:cardFunction+`
function App() {
  const [next, setNext] = useState(false);
  return <section>
    <WorkCard title={next ? "坂の灯り" : "朝の砂浜"}>{next ? "夜の版画" : "海辺の写真"}</WorkCard>
    <button onClick={() => setNext(!next)}>次の作品へ</button>
  </section>;
}`},
  steps:[
    {
      title:"同じ表示をHTMLとJSXで比べる",
      referenceHtml:'<h2>森の入口</h2>',
      explain:"見本のコードで return が返すのは、部品が画面に表示する見出しです。JavaScriptの中でタグの形で書ける記法がJSXです。続くHTML単独の表示とReactの表示を見比べてください。",
      example:simpleApp("<h2>森の入口</h2>"),
      question:"JSXの<h2>森の入口</h2>をReactで表示した結果はどれですか。",options:["タグが文字で表示される","森の入口という見出し","何も出ない","空のボタン"],correct:1,feedback:"JSXからブラウザのh2要素が作られるので、HTMLで書いた時と同じ見出しになります。",
      task:"見本の作品名だけを書き換え、同じh2に「雨の小道」を表示します。",
      build:[simpleApp("<《1》>《2》</《1》>"),["h2","p"],["雨の小道","森の入口"]],
      tests:[[t=>t.q("#root h2")?.textContent==="雨の小道","h2の開始タグと終了タグの間に新しい作品名を入れます。"]],
    },
    {
      title:"一枚の部品を関数で作る",
      explain:"React では、画面に置く部品をコンポーネントと呼びます。WorkCard はカード一枚分の表示を返す関数です。App は <WorkCard /> と書いてその部品を使います。自作の部品名は大文字で始め、article や p などの HTML 要素と区別します。",
      example:`function WorkCard() {
  return <article><p>紙の星</p></article>;
}
function App() { return <WorkCard />; }`,
      question:"自作したWorkCardをAppの中で使う書き方はどれですか。",options:["WorkCardという文字","<workcard />","<WorkCard />","<article>WorkCard</article>"],correct:2,feedback:"大文字で始まる部品名をタグの形で書くと、Reactがその関数から表示を作ります。",
      task:"WorkCardの紹介をpからh2へ変え、「紙の星」という見出しを持つ一枚のarticleを表示します。",
      build:['function WorkCard() { return <article><《1》>紙の星</《1》></article>; }\nfunction App() { return <《2》 />; }',["h2","p"],["WorkCard","article"]],
      tests:[[t=>t.all("#root article").length===1 && training.elements.length>0,"Appから自作したカード部品を一枚表示します。"],[t=>t.q("#root article h2")?.textContent==="紙の星","カードの中で作品名をh2にします。"]],
    },
    {
      title:"propsで一つの作品名を渡す",
      explain:"props は、親が部品に渡した値をまとめたものです。<WorkCard title=\"月面\" />から来た文字はprops.titleで読めます。JSXの中でJavaScriptの値を表示する場所を{ }で囲みます。",
      example:`function WorkCard(props) {
  return <h2>props.title</h2>;
}
function App() { return <WorkCard title="月面" />; }`,
      question:"titleで渡した「月面」をh2に表示する書き方はどれですか。",options:["props.titleという文字","{props.title}","{title=}","<props />"],correct:1,feedback:"波括弧の中にprops.titleを書くと、渡された値を読み取れます。",
      task:"見本のh2の中を変えて、渡した作品名「月面」を表示してください。",
      build:['function WorkCard(《1》) { return <h2>{《2》}</h2>; }\nfunction App() { return <WorkCard title="月面" />; }',["props","other"],["props.title","props.name"]],
      tests:[[t=>t.q("#root h2")?.textContent==="月面","タグの本文でprops.titleの値を読んでください。"],[t=>{const card=training.elements.find(e=>e.props?.title==="月面");if(!card)return false;training.mount(card.type,{title:"水鏡"});return t.q("#root h2")?.textContent==="水鏡";},"親から渡すtitleを変えた時も、同じ部品に新しい名前が出るようにします。"]],
    },
    {
      title:"一つの部品に二つの名前を渡す",
      explain:"部品を二度書くと、それぞれ別のpropsを受け取ります。sectionの中に並べれば、同じ形で異なる作品名を見せられます。",
      example:`function WorkCard({ title }) { return <article><h2>{title}</h2></article>; }
function App() {
  return <section>
    <WorkCard title="朝の砂浜" />
    <WorkCard title="朝の砂浜" />
  </section>;
}`,
      question:"二枚目のtitleだけを変えた時、画面のどこが変わりますか。",options:["両方の名前","一枚目だけ","すべて消える","二枚目だけ"],correct:3,feedback:"二枚の部品へ別々の値を渡すので、変更した呼び出しの表示だけが変わります。",
      task:"二枚目だけ「坂の灯り」へ変え、一枚目の作品名はそのままにします。",
      build:['function WorkCard({title}) { return <article><h2>{title}</h2></article>; }\nfunction App() { return <section><WorkCard title="《1》"/><WorkCard title="《2》"/></section>; }',["朝の砂浜","坂の灯り"],["坂の灯り","朝の砂浜"]],
      tests:[[t=>t.q("#root article h2")?.textContent==="朝の砂浜","一枚目を朝の砂浜のままにします。"],[t=>t.all("#root article h2").map(n=>n.textContent).join("/")==="朝の砂浜/坂の灯り","二枚目には別のtitleを渡します。"],[()=>{const a=training.elements.find(e=>e.props?.title==="朝の砂浜");return !!a && training.elements.some(e=>e.type===a.type && e.props?.title==="坂の灯り");},"二つの作品名を同じ種類の部品に渡してください。"]],
    },
    {
      title:"childrenでカードの中身を差し替える",
      explain:"部品の開始タグと終了タグで挟んだ内容はchildrenです。titleを見出し、childrenを紹介に使うと、親から両方を差し替えられます。{ title, children }はpropsからその二つを取り出す書き方です。",
      example:firstPair.replace("{children}</p>","説明</p>"),
      question:"<WorkCard title=\"森\">木版画</WorkCard>のchildrenは何ですか。",options:["森","WorkCard","木版画","title"],correct:2,feedback:"開始タグと終了タグで挟まれた木版画がchildrenです。",
      task:"部品が固定の「説明」の代わりにchildrenを表示し、二枚の紹介が「海辺の写真」「夜の版画」になるようにします。",
      build:[firstPair.replace("<h2>{title}</h2><p>{children}</p>","<h2>{《1》}</h2><p>{《2》}</p>"),["title","children"],["children","title"]],
      tests:[[t=>t.all("#root article h2").map(n=>n.textContent).join("/")==="朝の砂浜/坂の灯り","二枚のtitleは見出しに残します。"],[t=>t.all("#root article p").map(n=>n.textContent).join("/")==="海辺の写真/夜の版画","挟んだ内容を二枚の紹介へ表示します。"]],
    },
    {
      title:"別ファイルの部品で二枚の作品カードを表示する",
      explain:"export defaultでファイルの代表部品を渡し、別ファイルのimportで受け取れます。見本はNotice.jsxの部品をApp.jsxから呼びます。実習では新しくWorkCard.jsxとApp.jsxを書きます。",
      example:joinReactFiles({"Notice.jsx":'export default function Notice({ text }) { return <p>{text}</p>; }',"App.jsx":'import Notice from "./Notice";\nfunction App() { return <Notice text="次の展示" />; }'}),
      question:"同じ部品で二枚の作品カードを表示するとき、それぞれの作品名はどこに書きますか。",options:["部品内に二つ固定","親から各カードのtitleへ","ファイル名にだけ書く","カードを呼ばない"],correct:1,feedback:"親の App から、作品名を title、紹介文を children として一枚ずつ渡します。",
      task:"WorkCard.jsxに、titleをh2、childrenをpにするarticle部品を作り、defaultで渡します。App.jsxから二枚を使い、順に「水面の月／鉛筆の習作」「冬の庭／小さな水彩」を表示してください。部品名・親の包み方は自由です。",
      files:["WorkCard.jsx","App.jsx"],starter:joinReactFiles({"WorkCard.jsx":"","App.jsx":""}),
      build:[finalPair.replace("<h2>{title}</h2><p>{children}</p>","<h2>{《1》}</h2><p>{《2》}</p>").replace('title="冬の庭"','title="《3》"'),["title","children"],["children","title"],["冬の庭","水面の月"]],
      tests:[
        [t=>t.all("#root article h2").map(n=>n.textContent).join("/")==="水面の月/冬の庭","親から二つの作品名を渡し、順にカードの見出しへ表示します。"],
        [t=>t.all("#root article p").map(n=>n.textContent).join("/")==="鉛筆の習作/小さな水彩","二組の紹介をそれぞれのカードへ渡します。"],
        [()=>training.uses.WorkCard?.length>=2,"親からWorkCard.jsxの部品を二か所で使います。"],
        [t=>{training.mount(training.read("WorkCard").default,{title:"風景",children:"別原稿"});return t.q("#root article h2")?.textContent==="風景" && t.q("#root article p")?.textContent==="別原稿";},"別の作品を渡しても表示できるよう、作品名と紹介文を props から読みます。"],
      ],
    },
  ],
};
