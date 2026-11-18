"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const { checkJsLessons } = require("./js-lessons.cjs");

async function verifyCards(browser, base) {
  const pc = await browser.newPage({ viewport: { width: 1100, height: 820 } });
  const phone = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  try {
    const deck = 'const makeDeck = () => [{answer:"青",title:"港の版画"},{answer:"木",title:"森の本"}];\nconst showCard = (cards,i) => { console.log(cards[i].title); console.log(cards[i].answer); };';
    await checkJsLessons(pc, phone, base, [
      ["js-title-list", "一つの配列", "console.log(['街灯','夜空','朝霧']);", ["街灯","夜空"]],
      ["js-list-position", "末尾も", "const edges = list => { console.log(list.at(0)); console.log(list[list.length-1]); };", ["0","-1"]],
      ["js-each-title", "繰り返して", "function readAll(names) { for(let i = 0; i < names.length; i++) console.log(names[i]); }", ["of","title"]],
      ["js-card-fields", "answer に", "const makeCard = (title, answer) => ({ answer, title });", ["name","reply"]],
      ["js-unpack-card", "題名の「月」", "function showName({title}) {console.log(title);}", ["title","title"]],
      ["js-question-deck", "答えには「木」", deck, ["木","index"]],
    ]);
    const output = pc.locator("main .code-result pre");
    await pc.goto(base + "#js-title-list/2");
    await output.filter({ hasText: "配列" }).waitFor();
    assert.equal(await output.textContent(), '月（文字）\n["月"]（配列）');
    await pc.goto(base + "#js-card-fields/1");
    await output.filter({ hasText: "オブジェクト" }).waitFor();
    assert.match(await output.textContent(), /"title":"夜空の色","answer":"紺"/);
    await pc.goto(base + "#js-question-deck/write");
    const input = pc.getByRole("textbox", { name: "JavaScript" });
    const run = pc.getByRole("button", { name: "コードを実行して確かめる" });
    const status = pc.locator("main [role=status]");
    const firstOnly = deck.replaceAll("cards[i]", "cards[0]");
    await input.fill(firstOnly);
    await run.click();
    await status.filter({ hasText: "引数が1なら" }).waitFor();
    await pc.getByRole("link", { name: "この問題のスライドを見直す" }).click();
    await pc.getByRole("link", { name: /解きかけの問題へ戻る/ }).click();
    assert.equal(await input.inputValue(), firstOnly);
    await input.fill(deck);
    await run.click();
    await status.filter({ hasText: "できました" }).waitFor();
    assert.equal(await output.textContent(), ["港の版画","青","森の本","木","森の本","木","森の本","木"].map(text => text + "（文字）").join("\n"));
    if (process.env.SCREENSHOT_DIR) {
      await pc.goto(base + "#js-card-fields/1");
      await output.waitFor();
      await pc.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "cards-pc.png") });
      await phone.goto(base + "#js-list-position/2");
      await phone.locator(".code-result pre").waitFor();
      await phone.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, "cards-phone.png") });
    }
    console.log("問題集六単元。配列と文字の違い、先頭と末尾、順読み、項目名、並べ替えと一問の原稿、別解と下書き復帰を確認");
  } finally { await pc.close(); await phone.close(); }
}
module.exports = { verifyCards };
if (require.main === module) {
  (async () => {
    const browser = await chromium.launch();
    try { await verifyCards(browser, process.env.COURSE_URL || pathToFileURL(path.resolve(__dirname, "../index.html")).href); }
    finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
