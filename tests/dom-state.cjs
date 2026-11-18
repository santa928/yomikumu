"use strict";
const {verifyDom} = require("./dom-check.cjs");
const assert=require("node:assert/strict");
const render = 'function draw(names){document.querySelector("#rows").replaceChildren(...names.map(name=>{const n=document.createElement("li");n.textContent=name;return n}));document.querySelector("#count").textContent=names.length+"件";}';
const search = 'const field=document.querySelector("#filter");function show(){draw(names.filter(n=>n.indexOf(field.value)!==-1))}field.addEventListener("input",show);document.querySelector("#clear").onclick=()=>{field.value="";show()};show();';
verifyDom("state",[
  [null,'const n=document.querySelector("#count");document.querySelector("#plus").onclick=()=>n.textContent=Number(n.textContent)+1;'],
  [null,'const state={total:5};document.getElementById("count").textContent=state.total+"件";'],
  [null,'let number=2;const n=document.querySelector("#count");const show=()=>n.textContent=number+"件";show();document.querySelector("#plus").onclick=()=>{number++;show()};'],
  [null,render+'draw(["波","雲","月"]);'],
  [null,render+'const names=["雨音","月影","雨雲"];'+search],
  [null,render+'const names=["青の丘","北の森","丘の上"];'+search],
],async frame=>{
  await frame.getByRole("textbox").fill("雨"); assert.equal(await frame.locator("#count").textContent(),"2件");
  await frame.getByRole("textbox").fill("石"); assert.equal(await frame.locator("li").count(),0);
  await frame.getByRole("button").click();assert.equal(await frame.locator("li").count(),3);
}).catch(e=>{console.error(e);process.exitCode=1;});
