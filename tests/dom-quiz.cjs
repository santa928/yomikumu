"use strict";
const {verifyDom}=require("./dom-check.cjs");
const assert=require("node:assert/strict");
function alternate(data,points) {
  return `const deck=${JSON.stringify(data)}, get=id=>document.getElementById(id);
let number=0, total=0, locked=false;
function paint(){
 const [text,left,right]=deck[number];
 get("question").textContent=text;get("left").textContent=left;get("right").textContent=right;
 get("score").textContent=total+"点";get("next").disabled=true;get("again").hidden=true;locked=false;
}
for(const id of ["left","right"]) get(id).addEventListener("click",()=>{
 if(locked)return;locked=true;total+=id===deck[number][3]?${points}:0;
 get("score").textContent=total+"点";get("next").disabled=false;
});
get("next").addEventListener("click",()=>{
 if(!locked)return;
 if(++number<deck.length)paint();else{get("question").textContent="結果";get("next").disabled=true;get("again").hidden=false;}
});
get("again").addEventListener("click",()=>{number=0;total=0;paint()});paint();`;
}
const sea=alternate([["夜の海を照らすのは？","灯台","小舟","left"],["風を受けて進むのは？","桟橋","帆船","right"]],1);
const colors=alternate([["赤と黄を混ぜると？","紫","橙","right"],["青と黄を混ぜると？","緑","橙","left"]],2);
verifyDom("quiz-project",[[null,sea],[null,sea],[null,sea],[null,sea],[null,sea],[null,colors]],async frame=>{
 await frame.getByRole("button",{name:"灯台"}).click();
 assert.equal(await frame.locator("#left").isDisabled(),true);
 await frame.getByRole("button",{name:"次へ"}).click();
 await frame.getByRole("button",{name:"桟橋"}).click();
 await frame.getByRole("button",{name:"次へ"}).click();
 assert.equal(await frame.locator("#score").textContent(),"1点");
 await frame.getByRole("button",{name:"再挑戦"}).click();
 assert.equal(await frame.locator("#score").textContent(),"0点");
}).catch(e=>{console.error(e);process.exitCode=1;});
