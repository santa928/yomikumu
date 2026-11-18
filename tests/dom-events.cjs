"use strict";
const { verifyDom } = require("./dom-check.cjs");
const assert = require("node:assert/strict");
const get = 'const f=document.querySelector("form"), a=document.querySelector("#answer"), n=document.querySelector("#notice");\n';
const validate = 'const v=a.value.trim(); if(!v){ n.textContent="入力してください";return; }';
const register = validate + 'const r=document.createElement("li");r.textContent=v;document.querySelector("#answers").append(r);a.value="";';
verifyDom("events", [
  ['let v=0;document.querySelector("button").onclick=()=>document.querySelector("#count").textContent=++v;', 'const n=document.querySelector("#count");document.querySelector("button").addEventListener("click",()=>n.textContent=Number(n.textContent)+1)'],
  [get+'a.oninput=()=>n.textContent=a.value', get+'a.addEventListener("input",e=>n.innerText=e.target.value)'],
  [get+'f.onsubmit=()=>n.textContent=a.value', get+'f.addEventListener("submit",()=>n.innerText=a.value)', get+'a.oninput=()=>n.textContent=a.value'],
  [get+'f.onsubmit=e=>{e.preventDefault();n.textContent=a.value}', get+'f.addEventListener("submit",e=>{n.innerText=a.value;e.preventDefault()})'],
  [get+'f.onsubmit=e=>{e.preventDefault();'+validate+'n.textContent=v;}', get+'f.addEventListener("submit",e=>{e.preventDefault();n.textContent=a.value.trim()||"入力してください"})'],
  [get+'f.onsubmit=e=>{e.preventDefault();'+register+'}', get+'f.addEventListener("submit",e=>{e.preventDefault();'+register+'})'],
], async frame=>{
  await frame.getByRole("button").click();
  assert.match(await frame.getByRole("status").textContent(),/入力/);
  await frame.getByRole("textbox").fill(" 枝 ");
  await frame.getByRole("textbox").press("Enter");
  await frame.getByRole("textbox").fill("空");
  await frame.getByRole("button").click();
  assert.deepEqual(await frame.locator("li").allTextContents(),["枝","空"]);
}).catch(e=>{console.error(e);process.exitCode=1;});
