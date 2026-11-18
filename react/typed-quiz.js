"use strict";
const reactImport = 'import * as React from "react";\n';
const promptModel = `type Question = { prompt: string; answer: string };
const item: Question = { prompt: "海を照らす建物は？", answer: "灯台" };`;
const typedPrompt = reactImport + promptModel + `
function Prompt({ question }: { question: Question }) {
  return <h2>{question.prompt}</h2>;
}
function App() { return <Prompt question={item} />; }`;
const pureCheck = `export function grade(expected: string, received: string): boolean {
  return received.trim() === expected;
}`;
const gradeExample = reactImport + pureCheck + `
function App() {
  return <p>{grade("灯台", " 灯台 ") ? "正解" : "再回答"}</p>;
}`;
const integrated = reactImport + promptModel + "\n" + pureCheck + `
function Prompt({question}:{question:Question}) { return <h2>{question.prompt}</h2>; }
function App() {
  const [draft,setDraft] = React.useState("");
  const [result,setResult] = React.useState<"未回答" | "再回答" | "正解">("未回答");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(grade(item.answer,draft) ? "正解" : "再回答");
  }
  return <section><Prompt question={item}/>
    <form onSubmit={submit}><label>回答 <input value={draft} onChange={e=>setDraft(e.target.value)}/></label>
    <button disabled={result === "正解"}>採点</button></form>
    <p role="status">{result}</p>
    <button onClick={()=>{setDraft("");setResult("未回答");}}>リセット</button>
  </section>;
}`;
const lantern = reactImport + `type Entry = { question:string; accepted:string[] };
const quiz:Entry = {question:"夜空の衛星は？",accepted:["月","つき"]};
function App() {
  const [draft, setDraft] = React.useState("");
  const [stage, setStage] = React.useState<"未回答"|"もう一度"|"正解">("未回答");
  function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStage(quiz.accepted.includes(draft.trim()) ? "正解" : "もう一度");
  }
  const reset = () => {setDraft("");setStage("未回答");};
  return <section><h2>{quiz.question}</h2><form onSubmit={submit}>
    <label>回答 <input value={draft} onChange={e=>setDraft(e.target.value)} /></label>
    <button disabled={stage==="正解"}>採点</button></form>
    <p role="status">{stage}</p><button onClick={reset}>リセット</button></section>;
}`;
const retryCheck=[
 [t=>t.q("#root h2")?.textContent==="海を照らす建物は？" && t.q('[role="status"]').textContent==="未回答","最初は問題と未回答を表示します。"],
 [t=>{training.input("input","船");training.click("form button");return t.q('[role="status"]').textContent==="再回答" && !t.q("form button").disabled;},"誤答の後は再回答を案内し、もう一度採点できる状態にします。"],
 [t=>{training.input("input"," 灯台 ");training.click("form button");return t.q('[role="status"]').textContent==="正解" && t.q("form button").disabled;},"修正した回答を再採点し、正解なら採点を止めます。"],
 [t=>{training.click("#root section > button");return t.q("input").value==="" && t.q('[role="status"]').textContent==="未回答" && !t.q("form button").disabled;},"リセットで欄と判定を元に戻します。"],
];
const reactTypedQuiz = {
 id:"retry-quiz",title:"型付きクイズで、誤答の後に再回答する",setup:{typed:true},
 intro:"型で問題原稿と結果の値を決め、表示する部品と採点規則をつなぎます。誤答から修正し、正答の後も最初から試せます。",
 demo:{code:integrated,tip:"「船」を送ってから「灯台」に直し、採点をやり直してください。正解した後はリセットで最初に戻ります。"},
 steps:[
  {
   language:"App.tsx",title:"型付きの問題を部品へ渡す",
   explain:"TSXなら、JSXに渡す材料の型も書けます。Questionは問題文と正答を持つ原稿です。受け取る値を{ question: Question }と決めると、存在しない名前は表示する前に型検査で見つかります。上部のimportはReactをこのファイルから使うための宣言です。",
   example:typedPrompt.replace("question.prompt}</h2>","question.answer}</h2>"),
   question:"出題する見出しで読む値はどれですか。",options:["question.answer","Questionという文字","question.prompt","正誤の状態"],correct:2,feedback:"問題文を入れたpromptを読み、正答は採点するときに使います。",
   task:"型付きの問題をPrompt部品へ渡し、正答でなく「海を照らす建物は？」という問題文をh2に表示してください。",
   build:reactBuild(typedPrompt,["{question.prompt}","{question.answer}"],["question={item}","question={{prompt:\"別の問題\",answer:\"船\"}}"]),
   tests:[[t=>t.q("#root h2")?.textContent==="海を照らす建物は？","渡された問題のpromptを見出しにします。"],[t=>{const p=training.elements.find(n=>n.props?.question);if(!p)return false;training.mount(p.type,{question:{prompt:"夜の光は？",answer:"月"}});return t.q("#root h2").textContent==="夜の光は？";},"別の問題を渡しても、その問題の文章が表示されるようにします。"]],
  },
  {
   language:"App.tsx",title:"採点規則を純粋な関数にする",
   explain:"gradeは正答と入力という二つの文字列を受けて、合うかどうかをbooleanで返します。状態や画面を書き換えず、同じ二つの値から同じ判定が出る関数を純粋な関数と呼びます。",
   example:gradeExample.replace("received.trim() === expected","received === expected"),
   question:"gradeが返す型に合う値はどれですか。",options:["文字列の正解","trueかfalse","表示用のp","入力欄"],correct:1,feedback:"booleanは、はい・いいえに当たるtrueとfalseです。",
   task:"回答の両端の空白を除いてから正答と一致するかを返すgradeにしてください。異なる回答はfalseにします。",
   build:reactBuild(gradeExample,["received.trim()","received"],["=== expected","!== expected"]),
   tests:[[()=>{const g=training.read("App").grade;return g("灯台"," 灯台 ")===true && g("月","つき")===false && g("灯台"," 灯台 ")===true;},"同じ入力で同じ真偽を返し、空白だけを無視して二つの文字を比べます。"],[t=>t.q("#root p").textContent==="正解","採点結果を画面にも反映します。"]],
  },
  {
   language:"App.tsx",title:"親で入力・正誤・再回答をつなぐ",
   explain:"親に今の回答と判定を置き、採点時に関数を呼びます。状態を文字列三つの型に限ると、別の表記をうっかり代入した時も型検査で気づけます。正解するまでは採点を続けます。",
   example:integrated.replace('disabled={result === "正解"}','disabled={result !== "未回答"}'),
   question:"誤答のすぐ後に残す操作はどれですか。",options:["終了しか押せない","正解にして進む","すべて消す","回答を書き直して採点"],correct:3,feedback:"誤答は再回答を表示し、修正して再度採点できるようにします。",
   task:"誤答の後にも回答を修正して採点できるよう、ボタンを止める条件を変えます。正解とリセットも確かめましょう。",
   build:reactBuild(integrated,['disabled={result === "正解"}','disabled={result !== "未回答"}'],['setResult("未回答");','setResult("再回答");']),tests:retryCheck,
  },
  {
   language:"App.tsx",title:"別の許容回答から天体クイズを設計する",
   explain:"二つの言い方を正解にするには、問題と正答の配列を一組にしてincludesで判定できます。見本の短い部品は「月」と「つき」の二つを表示します。",
   example:reactImport+'function App() {\n  const accepted: string[] = ["月", "つき"];\n  return <p>{accepted.join("・")}</p>;\n}',
   question:"「星」で誤答したあとに「つき」と送り直した結果はどれですか。",options:["誤答のまま","正解","未回答に戻る","送れない"],correct:1,feedback:"修正した回答を正答の配列で調べ直し、つきも正解として扱います。",
   task:"型付きで問題「夜空の衛星は？」をh2に表示し、フォームの回答を採点します。「月」「つき」は前後の空白を除いて正解、それ以外なら「もう一度」。role=statusで「未回答」から結果へ移り、誤答は再回答可、正解で採点を停止。リセットで欄と判定を初期化してください。部品の分け方とstateを置く場所は自由です。",
   starter:reactImport,build:reactBuild(lantern,["quiz.accepted.includes(draft.trim())",'draft === "月"'],['disabled={stage==="正解"}','disabled={stage==="もう一度"}']),
   tests:[
    [t=>t.q("#root h2")?.textContent==="夜空の衛星は？" && t.q('[role="status"]').textContent==="未回答","問題を表示し、未回答から始めます。"],
    [t=>{training.input("input","星");training.click("form button");return t.q('[role="status"]').textContent==="もう一度" && !t.q("form button").disabled;},"誤答を知らせ、書き直して再送信できる状態を保ちます。"],
    [t=>{training.input("input"," つき ");training.click("form button");return t.q('[role="status"]').textContent==="正解" && t.q("form button").disabled;},"二番目の許容回答も空白を除いて正解にします。"],
    [t=>{const reset=t.all("#root button").find(b=>b.textContent==="リセット");ReactDOM.flushSync(()=>reset.click());return t.q("input").value==="" && t.q('[role="status"]').textContent==="未回答" && !t.q("form button").disabled;},"リセットで初期表示と回答可能な状態に戻します。"],
    [t=>{training.input("input","月");training.click("form button");return t.q('[role="status"]').textContent==="正解";},"新しい挑戦で「月」も正答として受け付けます。"],
   ],
  },
 ],
};
