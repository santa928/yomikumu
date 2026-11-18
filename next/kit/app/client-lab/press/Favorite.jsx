"use client";
import { useState } from "react";

export default function Favorite({ title }) {
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(0);
  function toggle() {
    setSaved(value => !value);
    setCount(1);
  }
  return <>
    <button type="button" aria-pressed={saved} onClick={toggle}>{title}をお気に入り</button>
    <p role="status">押した回数 {count}</p>
  </>;
}
