"use client";
import { useEffect, useState } from "react";

export default function Interactive({ children }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  return <fieldset disabled={!ready} style={{border:0,padding:0,margin:0}}>
    {!ready && <p>操作の準備中です。</p>}
    {children}
  </fieldset>;
}
