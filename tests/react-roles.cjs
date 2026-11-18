"use strict";
const {verifyDom}=require("./dom-check.cjs");
const assert=require("node:assert/strict");
verifyDom("state-tools",[
 [null,s=>s.replace('if (action.type === "add") return total + 1;\n  return total;', 'return action.type === "add" ? total + 1 : total;')],
 [null,s=>s.replace("[...notes, action.text]","notes.concat(action.text)").replace("notes.slice(0, -1)","notes.filter((_,i)=>i<notes.length-1)")],
 [null,s=>s.replace('<Display.Provider value="拡大"><Room /></Display.Provider>','<Display value="拡大"><Room /></Display>')],
 [null,s=>s.replace("entry.current.focus();","entry.current?.focus({preventScroll:true});")],
 [null,s=>s.replace('useContext(RoomName)','React.use(RoomName)').replace('input.current.focus()','input.current?.focus()')],
],async frame=>{
 await frame.getByRole("button",{name:"メモを追加"}).click();
 await frame.getByRole("button",{name:"メモを追加"}).click();
 await frame.getByRole("button",{name:"取消"}).click();
 assert.deepEqual(await frame.locator("li").allTextContents(),["展示1"]);
},"react").catch(e=>{console.error(e);process.exitCode=1;});
