"use strict";
const {verifyDom}=require("./dom-check.cjs");
const assert=require("node:assert/strict");
verifyDom("reading-project",[
 [null,s=>s.replace("function Book({book})","function Book(props)").replace("{book.title}</li>","{props.book.title}</li>")],
 [null,s=>s.replace('[...books,{id:books.length+1,title:"砂の道"}]','books.concat({id:books.length+1,title:"砂の道"})')],
 [null,s=>s.replace('initial.filter(b => mode === "all" || (mode === "borrowed" ? b.borrowed : !b.read))','mode==="all" ? initial : initial.filter(b => mode==="unread" ? !b.read : b.borrowed)')],
 [null,s=>s.replace("setValue(v=>v+1)","setValue(value+1)")],
 [null,s=>s.replace("setLimit(Number(draft))","setLimit(+draft)")],
 [null,s=>s.replace("return stop;","return () => stop();").replace("next => setValue(next)","setValue")],
 [null,s=>s.replace('useEffect(() => station.subscribe("north",setValue), []);','useEffect(()=>{const cancel=station.subscribe("north",x=>setValue(x));return ()=>cancel()},[]);')],
 [null,s=>s.replace("setBooks([...books,{id:books.length+1,title,borrowed:false,read:false}]);","setBooks(prev=>prev.concat({id:prev.length+1,title,borrowed:false,read:false}));").replace('function Book({book})','function Book({book: current})').replace('{book.title}</li>','{current.title}</li>')],
],async frame=>{
 await frame.getByRole("button",{name:"未読の本"}).click();
 assert.equal(await frame.locator("li").count(),0);
 await frame.getByRole("textbox").fill("星の図");await frame.getByRole("textbox").press("Enter");
 assert.equal(await frame.locator("li").textContent(),"星の図");
 await frame.getByRole("button",{name:"解除"}).click();
 assert.equal(await frame.locator("li").count(),3);
 await frame.getByRole("button",{name:"リセット"}).click();
 assert.equal(await frame.locator("li").count(),2);
},"react").catch(e=>{console.error(e);process.exitCode=1;});
