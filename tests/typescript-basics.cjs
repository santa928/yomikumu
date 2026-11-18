"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const {pathToFileURL} = require("node:url");
const {chromium} = require("playwright");
const url = process.env.TS_URL || pathToFileURL(path.join(__dirname,"../typescript/index.html")).href;
(async()=>{
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({viewport:{width:1000,height:800}});
    const problems = [];
    page.on("pageerror",e=>problems.push(e.message));
    await page.goto(url);
    assert.equal(await page.evaluate(()=>typeof window.quizCompilerGzip),"undefined");
    await page.getByRole("button",{name:"正解3点を表示"}).click();
    await page.getByText("正解 3点（string）",{exact:true}).waitFor();
    const jsx = await page.evaluate(async()=>[await transpileTSX('const el = <p>空</p>;'), await transpileTSX('const el = <p>空;')]);
    assert.match(jsx[0].code,/React\.createElement/);
    assert.deepEqual(jsx[0].diagnostics,[]);
    assert.equal(jsx[1].diagnostics[0].line,1);
    const commonJS = await page.evaluate(() => transpileTSX('import {name} from "./name"; export const el = <p>{name}</p>;', true));
    assert.match(commonJS.code,/require\("\.\/name"\)/);
    assert.deepEqual(commonJS.diagnostics,[]);
    const project = await page.evaluate(async()=>{
      const declarations = {"node_modules/@types/react/index.d.ts":'export namespace JSX { interface IntrinsicElements { p:{children?:unknown} } } export function createElement(...args:unknown[]):unknown;'};
      const files = {"App.tsx":'import * as React from "react"; import {add} from "./math";\nconst label=<p>{add(3)}</p>;', "math.ts":"export function add(n:number){return n+1}"};
      return [await inspectTSXFiles(files,declarations), await inspectTSXFiles({...files,"App.tsx":files["App.tsx"].replace("add(3)",'add("3")')},declarations)];
    });
    assert.deepEqual(project[0].diagnostics,[]);
    assert.ok(project[1].diagnostics.some(d=>d.file==="App.tsx" && d.line===2 && d.code===2345));
    const sets = {
      infer: [["let points = 0; points = 4;", true],["let points = 2+2;",true],['let points = 0; points = "4";',false]],
      annotate: [["let score:number = 3;",true],["const score: number = 1+2;",true],["const score = 3;",false]],
      "check-run": [["const total:number = 4+2;",true],["const total = 2+4;",true],["const total:number = 4-2;",false]],
      shape: [
        ['interface Question {text:string; points:number}\nconst questions:Question[]=[{text:"池",points:1},{text:"星",points:3}];',true],
        ['type Question={points:number,text:string}; const questions:Question[]=[{points:1,text:"池"},{points:3,text:"星"}];',true],
        ['type Question={points:number,text:string}; const questions:Question[]=[{points:1,text:"池"}];',false]]
    };
    for(const [id,examples] of Object.entries(sets)) {
      await page.goto(url+"#"+id+"/write");
      for(const [source,pass] of examples) {
        await page.getByRole("textbox").fill(source);
        await page.getByRole("button",{name:"実行して確かめる"}).click();
        await page.waitForFunction(()=>document.getElementById("halt-type").disabled);
        const grade = await page.locator("[data-grade]").textContent();
        assert.equal(grade.startsWith("できました。"),pass,id+" "+source+" "+grade);
      }
    }
    await page.goto(url+"#infer/write");
    const editor = page.getByRole("textbox");
    await editor.fill('let points = 0;\npoints = "4";');
    await page.getByRole("button",{name:"型を検査"}).click();
    const diag = page.getByRole("button",{name:/2行 .*TS2322/});
    await diag.click();
    assert.equal(await editor.evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),'points = "4";');
    await page.getByRole("link",{name:"この課題の見本を読み返す"}).click();
    await page.getByRole("link",{name:"自分で書く"}).click();
    await page.reload();
    assert.equal(await editor.inputValue(),'let points = 0;\npoints = "4";');
    await page.goto(url+"#shape/write");
    await editor.fill(sets.shape[2][0]);
    await page.getByRole("button",{name:"実行して確かめる"}).click();
    await page.getByText(/1項目は合っています。次に「星」/).waitFor();
    const phone = await browser.newPage({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
    await phone.goto(url);
    await phone.getByRole("link",{name:"得点の変数に型注釈を書く"}).tap();
    await phone.getByRole("button",{name:"score に数の注釈を付ける"}).tap();
    await phone.getByRole("link",{name:"表示を予測する"}).tap();
    await phone.getByText("1",{exact:true}).tap();
    await phone.getByRole("button",{name:"予測を確認"}).tap();
    await phone.getByText(/^正解です。/).waitFor();
    await phone.getByRole("link",{name:"コードの練習へ"}).tap();
    await phone.getByText("number",{exact:true}).tap();
    await phone.getByText("3",{exact:true}).tap();
    await phone.getByRole("button",{name:"実行して確かめる"}).tap();
    await phone.getByText(/^できました。/).waitFor();
    const state = await phone.evaluate(()=>JSON.parse(localStorage.getItem("yomikumu/typescript/v1")));
    assert.ok(state.units.annotate.quizDone && state.units.annotate.tapDone && !state.units.annotate.writeDone);
    assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    if(process.env.TS_SCREENSHOT) await phone.screenshot({path:process.env.TS_SCREENSHOT});
    assert.deepEqual(problems,[]);
    console.log("型付きクイズ4課題の正答・誤答・別解、診断行選択、型と実行別判定、TSX、保存、375pxタップを確認");
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
