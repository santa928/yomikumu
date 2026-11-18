"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const { checkJsLessons } = require("./js-lessons.cjs");

async function verifyTransforms(browser, base) {
  const pc = await browser.newPage({ viewport: { width: 1100, height: 820 } });
  const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  try {
    const sum = "function sum(cards) { let total=0; for(const c of cards) total+=c.points; return total; }";
    const pick = 'const byKind = (list, kind) => list.filter(c => kind === "すべて" || c.kind === kind);';
    const copy = "const changePoints = (list, title, points) => list.map(c => c.title === title ? {...c,points} : c);";
    await checkJsLessons(pc, phone, base, [
      ["js-map-names", "題名だけ", "const names = list => list.map(({title}) => title);", ["map","title"]],
      ["js-filter-kind", "木が選ばれた", "const selectKind = (list,k) => list.filter(({kind}) => k === kind);", ["filter","kind"]],
      ["js-points-total", "三問の2", sum, ["reduce","0"]],
      ["js-copy-card", "元の舟", copy, ["...card","points"]],
      ["js-revise-set", "風景二問", pick+"\n"+sum, ["cards","0"]],
    ]);
    await phone.goto(base+"#js-revise-set/1");
    const selector = phone.getByLabel("表示する種類");
    const output = phone.locator(".code-result pre");
    for (const [kind,names,total] of [["風景",["川","森"],7],["道具",["灯"],2],["布",[],0],["すべて",["川","灯","森"],9]]) {
      await selector.selectOption(kind);
      const expected = JSON.stringify(names)+"（配列）\n"+total+"（数）";
      await output.filter({hasText:expected}).waitFor();
      assert.equal(await output.textContent(),expected);
    }
    if (process.env.SCREENSHOT_DIR) await phone.screenshot({ path:path.join(process.env.SCREENSHOT_DIR,"transforms-phone.png") });
    await pc.goto(base+"#js-revise-set/2");
    await pc.getByLabel("比べる種類").selectOption("すべて");
    await pc.locator(".code-result pre").filter({hasText:"9（数）\n13（数）"}).waitFor();
    if (process.env.SCREENSHOT_DIR) await pc.screenshot({ path:path.join(process.env.SCREENSHOT_DIR,"transforms-pc.png") });
    await pc.goto(base+"#js-copy-card/write");
    const input = pc.getByRole("textbox",{name:"JavaScript"});
    const wrong = "const changePoints = (list, title, points) => list.map(c => {if(c.title === title) c.points = points; return c;});";
    await input.fill(wrong);
    await pc.getByRole("button",{name:"コードを実行して確かめる"}).click();
    await pc.locator("main [role=status]").filter({hasText:"元の舟は5点"}).waitFor();
    await pc.getByRole("link",{name:"この問題のスライドを見直す"}).click();
    await pc.getByRole("link",{name:/解きかけの問題へ戻る/}).click();
    assert.equal(await input.inputValue(),wrong);
    console.log("一覧の変換・絞り込み・集計・コピーと別原稿。空の合計、全件への復帰、元と新版の点、別解と下書きを確認");
  } finally { await pc.close(); await phone.close(); }
}

module.exports = { verifyTransforms };
if (require.main === module) {
  (async () => {
    const browser = await chromium.launch();
    try { await verifyTransforms(browser, process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname,"../index.html")).href); }
    finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode=1; });
}
