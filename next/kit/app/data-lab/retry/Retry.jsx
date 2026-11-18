"use client";
import { useState } from "react";

export default function Retry({ run }) {
  const [note, setNote] = useState("開始前");
  const [phase, setPhase] = useState("ready");
  async function read() {
    setPhase("waiting");
    setNote("読込中");
    try {
      const query = new URLSearchParams({ run, id: "tide" });
      const response = await fetch("/data-lab/origin?" + query, { cache: "no-store" });
      if (!response.ok) throw Error("取得できません");
      setNote((await response.json()).title);
      setPhase("ready");
    } catch {
      setNote("一時的な失敗");
      setPhase("failed");
    }
  }
  return <>
    <label>読書メモ <input /></label>
    <button disabled={phase === "waiting"} onClick={read}>本を読む</button>
    {phase === "failed" && <button onClick={() => setNote("再試行")}>再試行</button>}
    <p role="status">{note}</p>
  </>;
}
