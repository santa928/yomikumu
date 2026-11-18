"use strict";
const {verifyDom} = require("./dom-check.cjs");
const assert = require("node:assert/strict");
const vars='const n=document.querySelector("#notice"), b=document.querySelector("#load");';
const full=vars+`b.addEventListener("click",()=>{
 b.disabled=true;n.textContent="読込中";
 loadQuestions().then(items=>{
   const list=document.querySelector("#questions");list.textContent="";
   for (const text of items){const row=document.createElement("li");row.textContent=text;list.appendChild(row)}
   n.textContent="読込完了";
 },()=>n.textContent="もう一度").finally(()=>b.disabled=false)
});`;
verifyDom("loading",[
 [null,vars+'b.onclick=async()=>n.textContent=(await loadQuestions()).at(0)'],
 [null,vars+'b.onclick=()=>loadQuestions().then(items=>n.textContent=items.at(1))'],
 [null,vars+'b.onclick=()=>loadQuestions().then(items=>n.textContent=items[0],()=>n.textContent="もう一度")'],
 [null,vars+'b.onclick=()=>{b.disabled=true;n.textContent="読込中";loadQuestions().then(items=>n.textContent=items[0]).catch(()=>n.textContent="もう一度").finally(()=>b.disabled=false)}'],
 [null,full],
],async frame=>{
 await frame.getByRole("combobox").selectOption("once");
 await frame.getByRole("textbox").fill("途中");
 const button=frame.getByRole("button");
 await button.click();
 assert.equal(await button.isDisabled(),true);
 await frame.getByText("もう一度試してください").waitFor();
 await button.click();await frame.getByText("読込完了").waitFor();
 assert.equal(await frame.getByRole("textbox").inputValue(),"途中");
 assert.equal(await frame.locator("#questions li").count(),2);
}).catch(e=>{console.error(e);process.exitCode=1;});
