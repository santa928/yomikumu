"use strict";
const {verifyDom}=require("./dom-check.cjs");
const assert=require("node:assert/strict");
const alternate='import * as React from "react";\ntype Result = "未回答"|"もう一度"|"正解";\nfunction Title(){return <h2>夜空の衛星は？</h2>}\nfunction Check(){const [text,change]=React.useState(""); const [r,set]=React.useState<Result>("未回答");return <><form onSubmit={e=>{e.preventDefault();set(["月","つき"].some(s=>text.trim()===s)?"正解":"もう一度")}}><input aria-label="回答" value={text} onChange={e=>change(e.target.value)}/><button disabled={r==="正解"}>採点</button></form><p role="status">{r}</p><button onClick={()=>{set("未回答");change("")}}>リセット</button></>}\nexport default function App(){return <main><Title/><Check/></main>}';
verifyDom("retry-quiz",[
 [null,s=>s.replace('function Prompt({ question }: { question: Question })','function Prompt(props: {question:Question})').replace('{question.prompt}','{props.question.prompt}')],
 [null,s=>s.replace("return received.trim() === expected;","const clean = received.trim(); return expected === clean;")],
 [null,s=>s.replace('grade(item.answer,draft) ? "正解" : "再回答"','(!grade(item.answer,draft)) ? "再回答" : "正解"')],
 [null,alternate,'import * as React from "react";const title:number="夜空の衛星は？";function App(){return <h2>{title}</h2>}', /TS2322/],
],async frame=>{
 await frame.getByRole("textbox").fill("船");await frame.getByRole("textbox").press("Enter");
 assert.equal(await frame.getByRole("status").textContent(),"再回答");
 await frame.getByRole("textbox").fill("灯台");await frame.getByRole("button",{name:"採点"}).click();
 assert.equal(await frame.getByRole("status").textContent(),"正解");
 await frame.getByRole("button",{name:"リセット"}).click();
 assert.equal(await frame.getByRole("textbox").inputValue(),"");
},"react").catch(e=>{console.error(e);process.exitCode=1;});
