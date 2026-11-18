"use client";
import { useState } from "react";

export default function ReadState({ run }) {
  const [note, setNote] = useState("開始前");
  const [busy, setBusy] = useState(false);
  async function read(id) {
    setBusy(true);
    setNote("開始前");
    try {
      const query = new URLSearchParams({ run, id });
      const res = await fetch("/data-lab/origin?" + query, { cache: "no-store" });
      if (res.status === 404) setNote("本が見つかりません");
      else if (!res.ok) setNote("一時的な失敗");
      else setNote((await res.json()).title);
    } catch { setNote("一時的な失敗"); }
    finally { setBusy(false); }
  }
  return <>
    <button disabled={busy} onClick={() => read("tide")}>本を読む</button>
    <button disabled={busy} onClick={() => read("missing")}>ない本を読む</button>
    <p role="status">{note}</p>
  </>;
}
