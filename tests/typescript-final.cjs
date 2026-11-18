"use strict";
const {verifyChapter} = require("./typescript-states.cjs");
verifyChapter(4,{
  "typed-pack":s=>s.replace('type Puzzle = { title:string; answer:string; points:number };','interface Puzzle { points:number; answer:string; title:string }'),
  "typed-round":s=>s.replace('correct ? q.points : 0','!correct ? 0 : q.points'),
  "typed-boundary":s=>s.replace('data.length > 0','data.length !== 0'),
  "quiz-edition":s=>s.replace('text === q.answer','q.answer === text').replace('if(at===books.length)','if(at>=books.length)')
},{
  "typed-pack":s=>s.replace("points:4","points:1"),
  "typed-round":s=>s.replace('correct ? q.points : 0','q.points'),
  "typed-boundary":s=>s.replace('data.every(isPuzzle)','isPuzzle(data[0])'),
  "quiz-edition":s=>s.replace('!raw.every(isPuzzle)','!isPuzzle(raw[0])')
},"quiz-edition").catch(e=>{console.error(e);process.exitCode=1;});
