"use strict";
const {verifyDom} = require("./dom-check.cjs");
const assert = require("node:assert/strict");
const refs='const get=id=>document.getElementById(id), t=get("trigger"), h=get("hint"), c=get("close"), a=get("answer");';
const open='t.addEventListener("click",()=>{h.hidden=false;c.focus()});';
const change='function view(show){h.hidden=!show;t.setAttribute("aria-expanded",show);(show?c:a).focus()}';
const full=refs+change+'t.addEventListener("click",()=>view(h.hidden));c.onclick=()=>view(false);document.onkeydown=e=>{if(e.key==="Escape"&&!h.hidden)view(false)}';
verifyDom("keyboard",[
 [null,refs+'t.addEventListener("click",()=>h.removeAttribute("hidden"));'],
 [null,refs+open+'document.onkeydown=e=>{if(e.key==="Escape")h.hidden=true}'],
 [null,refs+open],
 [null,refs+open+'c.addEventListener("click",()=>{h.hidden=true;a.focus()})'],
 [null,full],
 [null,full],
],async frame=>{
 const trigger=frame.getByRole("button",{name:"ヒント"});
 await trigger.focus();
 await trigger.press("Enter");
 assert.equal(await frame.getByRole("button",{name:"閉じる"}).evaluate(n=>n===document.activeElement),true);
 await frame.getByRole("button",{name:"閉じる"}).press("Escape");
 const input=frame.getByRole("textbox");
 assert.equal(await input.evaluate(n=>n===document.activeElement),true);
 await input.press("Shift+Tab");await trigger.press("Enter");
 await frame.getByRole("button",{name:"閉じる"}).press("Enter");
 assert.equal(await input.evaluate(n=>n===document.activeElement),true);
 assert.equal(await trigger.getAttribute("aria-expanded"),"false");
}).catch(e=>{console.error(e);process.exitCode=1;});
