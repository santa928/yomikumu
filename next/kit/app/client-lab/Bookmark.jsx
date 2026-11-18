"use client";
import { useState } from "react";

export default function Bookmark({ title, copies }) {
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(0);
  return <section>
    <h2>{title}</h2><p>所蔵 {copies} 冊</p>
    <button type="button" aria-pressed={saved} onClick={() => {
      setSaved(value => !value);
      setCount(value => value + 1);
    }}>{saved ? "お気に入りから外す" : "お気に入りに入れる"}</button>
    <p role="status">押した回数 {count}</p>
  </section>;
}
