"use client";
import Scenario from "../Scenario";

async function describe(response) {
  if (!response.ok) return "開始前";
  return (await response.json()).title;
}
export default function Reading({ run }) {
  return <Scenario run={run} describe={describe} />;
}
