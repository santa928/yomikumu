"use client";
import Scenario from "../Scenario";

async function describe(response) {
  if (!response.ok) return "一時的な失敗";
  return (await response.json()).title;
}
export default function Reading({ run }) {
  return <Scenario run={run} describe={describe} />;
}
