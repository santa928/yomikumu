"use client";
import { useState } from "react";

export default function Lab() {
  const [run,setRun]=useState("desk");
  const [edition,setEdition]=useState(1);
  const [time,setTime]=useState("09:00");
  const [delay,setDelay]=useState(0);
  const [condition,setCondition]=useState("ok");
  const [notes,setNotes]=useState([]);
  const [busy,setBusy]=useState(false);
  async function publish() {
    setBusy(true);
    try {
      const res=await fetch("/data-lab/origin?run="+encodeURIComponent(run),{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({edition,title:"潮だまり通信",publishedAt:time,delay,state:condition})});
      setNotes(rows=>[res.ok ? "原稿を第"+edition+"版・"+time+"に設定しました。" : "設定値を確認してください。",...rows]);
    } catch {setNotes(rows=>["通信できません。もう一度設定してください。",...rows]);}
    finally {setBusy(false);}
  }
  async function read(mode,id="tide") {
    setBusy(true);
    try {
      const response=await fetch("/data-lab/show?run="+encodeURIComponent(run)+"&id="+id+"&mode="+mode);
      const value=await response.json();
      const result=response.ok ? value.title+"　第"+value.edition+"版　"+value.publishedAt : response.status+"　"+value.message;
      setNotes(rows=>[mode+"　"+result,...rows]);
    } catch {setNotes(rows=>["通信できません。操作をやり直してください。",...rows]);}
    finally {setBusy(false);}
  }
  return <>
    <p>原稿を設定し、毎回取得・保持・期限付きで同じ本を読みます。版と時刻を変えた後に、もう一度同じボタンを押してください。</p>
    <p>実験名 <code className="experiment-name">{run}</code>。同じ実験名で、下の演習にも設定が届きます。</p>
    <button type="button" disabled={busy} onClick={()=>{setRun("desk-"+crypto.randomUUID());setNotes([]);}}>新しい実験を始める</button>
    <div className="lab-fields"><label>版 <input type="number" min="1" value={edition} onChange={e=>setEdition(Number(e.target.value))}/></label>
    <label>原稿時刻 <input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label>
    <label>応答まで <select value={delay} onChange={e=>setDelay(Number(e.target.value))}><option value="0">すぐ</option><option value="900">0.9秒待つ</option></select></label>
    <label>原稿の状態 <select value={condition} onChange={e=>setCondition(e.target.value)}><option value="ok">正常</option><option value="fail">一時失敗</option></select></label></div>
    <button type="button" disabled={busy} onClick={publish}>原稿を設定</button>
    <div className="lab-actions">{[["毎回取得","fresh"],["保持","keep"],["2秒の期限","limit"]].map(([name,mode])=>
      <button key={mode} type="button" disabled={busy} onClick={()=>read(mode)}>{name}で読む</button>)}
      <button type="button" disabled={busy} onClick={()=>read("fresh","missing")}>ない本を開く</button></div>
    <p role="status">{busy ? "応答待ち" : "操作できます"}</p>
    <ol aria-label="届いた応答">{notes.map((note,i)=><li key={i}>{note}</li>)}</ol>
    <nav className="lab-actions" aria-label="設定を使う演習">{[["二度取得","double"],["保持","policy?mode=keep"],["毎回取得","policy?mode=fresh"],["期限","lifetime"],["応答待ち","wait"],["一時失敗","fail"],["対象なし","missing"],["再試行","retry"]].map(([name,path])=>
      <a key={path} href={"/data-lab/"+path+(path.includes("?")?"&":"?")+"run="+encodeURIComponent(run)}>{name}</a>)}</nav>
  </>;
}
