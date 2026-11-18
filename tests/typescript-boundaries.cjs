"use strict";
const {verifyChapter} = require("./typescript-states.cjs");
verifyChapter(3,{
  absent:s=>s.replace("el === null","!el"),
  "event-target":s=>s.replace('e.target.value || "未入力"','e.target.value === "" ? "未入力" : e.target.value'),
  unknown:s=>s.replace('"text" in value && typeof value.text === "string"','"text" in value && typeof value.text === "string" && value.text.length >= 0'),
  "async-paper":s=>s.replace('say(valid(value) ? value.text : "原稿を確認");','if(valid(value)) say(value.text); else say("原稿を確認");'),
  "linked-desk":s=>s.replace('field.value===book.text','book.text===field.value')
},{
  absent:s=>s.replace('"札がありません"','"札"'),
  "event-target":s=>s.replace('e.target.value || "未入力"','e.target.value ?? "未入力"'),
  unknown:s=>s.replace('"原稿が違います"','"未入力"'),
  "async-paper":s=>s.replace('say("もう一度")','say("原稿を確認")'),
  "linked-desk":s=>s.replace('field.value===book.text','field.value!==book.text')
},"linked-desk").catch(e=>{console.error(e);process.exitCode=1;});
