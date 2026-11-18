"use client";
import { useState } from "react";
export default function Scenario({ run, describe }) {
  const [note,setNote]=useState("開始前");
  const [busy,setBusy]=useState(false);
  async function read(id) {
    setBusy(true);
    setNote("読込中");
    try {
      const q=new URLSearchParams({run,id});
      const response=await fetch("/data-lab/origin?"+q,{cache:"no-store"});
      setNote(await describe(response));
    } catch {setNote("通信できません");}
    finally {setBusy(false);}
  }
  return <>
    <button disabled={busy} onClick={()=>read("tide")}>本を読む</button>
    <button disabled={busy} onClick={()=>read("missing")}>ない本を読む</button>
    <p role="status">{note}</p>
  </>;
}
