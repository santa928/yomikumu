"use strict";
const {verifyDom}=require("./dom-check.cjs");
const assert=require("node:assert/strict");
verifyDom("effects",[
 [null,s=>s.replace("const size = word.length;","const size = word.split(\"\").length;")],
 [null,s=>s.replace('const stop = station.subscribe("north", next => setValue(next));\n    return stop;', 'return station.subscribe("north",setValue);')],
 [null,s=>s.replace("return stop;","return () => stop();")],
 [null,s=>s.replace("const stop = station.subscribe(room, setValue);\n    return stop;","return station.subscribe(room, value => setValue(value));")],
 [null,s=>s.replace("return station.subscribe(room, setValue);","const detach = station.subscribe(room, value => setValue(value)); return () => detach();")],
],async frame=>{
 await frame.getByRole("button",{name:"北室を1上げる"}).click();
 assert.equal(await frame.locator("#root p").textContent(),"19℃");
 await frame.getByRole("button",{name:"部屋を切替"}).click();
 await frame.getByRole("button",{name:"北室を1上げる"}).click();
 assert.equal(await frame.locator("#root p").textContent(),"24℃");
 await frame.getByRole("button",{name:"閉じる"}).click();
 assert.match(await frame.locator("#active").textContent(),/北室 0件 ／ 南室 0件/);
 await frame.getByRole("button",{name:"開く"}).click();
 assert.match(await frame.locator("#active").textContent(),/北室 0件 ／ 南室 1件/);
},"react").catch(e=>{console.error(e);process.exitCode=1;});
