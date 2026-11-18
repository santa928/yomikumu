"use strict";
const assert = require("node:assert/strict");
const {chromium} = require("playwright");
const path = require("node:path");
const {pathToFileURL} = require("node:url");
const url = pathToFileURL(path.join(__dirname, "../typescript/index.html")).href;

async function verifyChapter(chapter, alternatives, failures, retryId) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
    await page.goto(url);
    const lessons = await page.evaluate(ch => tsLessons.filter(l=>l.chapter===ch).map(l=>({
      id:l.id, title:l.title, question:l.question, slots:l.slots, source:buildTS(l,l.slots.map(s=>s[1]))
    })),chapter);
    assert.equal(lessons.length,Object.keys(alternatives).length);
    for (const item of lessons) {
      await page.goto(url+"#"+item.id+"/write");
      const editor = page.getByRole("textbox");
      const run = async(source) => {
        await editor.fill(source);
        await page.getByRole("button",{name:"実行して確かめる"}).click();
        await page.waitForFunction(()=>document.getElementById("halt-type").disabled);
        return page.locator("[data-grade]").textContent();
      };
      const ok = await run(item.source);
      assert.ok(ok.startsWith("できました。"),item.id+" 代表正答 "+ok);
      const alt = await run(alternatives[item.id](item.source));
      assert.ok(alt.startsWith("できました。"),item.id+" 別解 "+alt);
      const wrong = failures[item.id](item.source);
      assert.ok(!(await run(wrong)).startsWith("できました。"),item.id+" 誤答");
      if (item.id === retryId) {
        await page.getByRole("link",{name:"この課題の見本を読み返す"}).tap();
        await page.getByRole("link",{name:"自分で書く"}).tap();
        assert.equal(await editor.inputValue(),wrong);
      }
    }
    const phone = await browser.newPage({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
    await phone.goto(url);
    const current = lessons[0];
    await phone.getByRole("link",{name:current.title,exact:true}).tap();
    await phone.getByRole("link",{name:"表示を予測する"}).tap();
    await phone.getByRole("radio").nth((current.question[2]+1)%4).tap();
    await phone.getByRole("button",{name:"予測を確認"}).tap();
    await phone.getByText(/^もう一度見本と比べましょう。/).waitFor();
    await phone.getByRole("radio").nth(current.question[2]).tap();
    await phone.getByRole("button",{name:"予測を確認"}).tap();
    await phone.getByText(/^正解です。/).waitFor();
    await phone.getByRole("link",{name:"コードの練習へ"}).tap();
    for (let i = 0; i < current.slots.length; i++) await phone.locator('[data-slot="'+i+'"]').first().tap();
    await phone.getByRole("button",{name:"実行して確かめる"}).tap();
    await phone.waitForFunction(()=>document.getElementById("halt-type").disabled);
    assert.match(await phone.locator(".ts-result").innerText(), /できました。/);
    assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    console.log("TypeScript "+lessons.length+"課題の正答・別解・誤答、下書き再開と375pxの四択・組立を確認");
  } finally { await browser.close(); }
}
module.exports = {verifyChapter};
if(require.main===module) verifyChapter(1,{
  union:s=>s.replace('"waiting" | "scored"','"scored" | "waiting"'),
  narrow:s=>s.replace('if (a.kind === "waiting") return "受付中";\n  return a.points + "点";','return a.kind === "scored" ? a.points + "点" : "受付中";'),
  optional:s=>s.replace('card.hint ?? "自分で考える"','card.hint === undefined ? "自分で考える" : card.hint'),
  "result-sign":s=>s.replace('card.hint ?? "考え中"','typeof card.hint === "string" ? card.hint : "考え中"')
},{
  union:s=>s.replace('"waiting" | "scored"','string'),
  narrow:s=>s.replace('a.points + "点"','"0点"'),
  optional:s=>s.replace("??","||"),
  "result-sign":s=>s.replace('"得点 " + a.points','"得点 0"')
},"result-sign").catch(e=>{console.error(e);process.exitCode=1;});
