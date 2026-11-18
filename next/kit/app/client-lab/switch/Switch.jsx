"use client";
import { useState } from "react";

export default function Switch() {
  const [saved, setSaved] = useState(false);
  return <button type="button" aria-pressed={saved} onClick={() => setSaved(true)}>
    {saved ? "栞あり" : "栞なし"}
  </button>;
}
