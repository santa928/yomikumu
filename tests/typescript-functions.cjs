"use strict";
const {verifyChapter} = require("./typescript-states.cjs");
verifyChapter(2,{
  signature:s=>s.replace("n + 3","3 + n"),
  callback:s=>s.replace("return rule(points);","const scored=rule(points); return scored;"),
  generic:s=>s.replaceAll("T","Item"),
  readonly:s=>s.replace("[...items,item]","items.concat([item])")
},{
  signature:s=>s.replace("n + 3","3"),
  callback:s=>s.replace("rule(points)","points+3"),
  generic:()=> "function carry(value:string|number):string|number { return value; }",
  readonly:s=>s.replace("[...items,item]","[item]")
},"readonly").catch(e=>{console.error(e);process.exitCode=1;});
