"use strict";
const {verifyDom}=require("./dom-check.cjs");
const assert=require("node:assert/strict");
verifyDom("work-list",[
 [null,s=>s.replace("setCount(n => n + 1)","setCount(count + 1)")],
 [null,s=>s.replace("setCount(n => n + 1);\n    setCount(n => n + 1);","for (let i=0; i<2; i++) setCount(previous => previous+1);")],
 [null,s=>s.replace('[...works, "作品" + (works.length + 1)]','works.concat("作品" + (works.length + 1))')],
 [null,s=>s.replace('onChange={e => setDraft(e.target.value)}','onInput={({currentTarget}) => setDraft(currentTarget.value)}')],
 [null,s=>s.replace("setWorks([...works, title]);","setWorks(previous => previous.concat(title));")],
 [null,s=>s.replace('total={works.length}', 'total={Array.from(works).length}')],
 [null,s=>s.replace('setWorks(list => [...list, {id:list.length + 1, title, pick:false}]);','setWorks(list => list.concat({id:Date.now() + Math.random(),title,pick:false}));').replace('{...w, pick:!w.pick}','Object.assign({},w,{pick:!w.pick})')],
],async frame=>{
 for(const value of ["雨音","灯"]){await frame.getByRole("textbox").fill(value);await frame.getByRole("textbox").press("Enter");}
 await frame.getByRole("textbox").fill("途中");
 await frame.locator("li button").first().click();
 assert.equal(await frame.locator("li").count(),3);
 assert.equal(await frame.getByRole("textbox").inputValue(),"途中");
 assert.equal(await frame.getByText("3件").count(),1);
},"react").catch(e=>{console.error(e);process.exitCode=1;});
