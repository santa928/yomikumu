"use strict";
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { pathToFileURL } = require("node:url");
const path = require("node:path");

async function verifyDom(id, answers, demo, course = "dom") {
  const browser = await chromium.launch();
  try {
    const pc = await browser.newPage();
    const phone = await browser.newPage({ viewport: { width: 375, height: 780 }, hasTouch: true });
    const base = process.env.DOM_URL || pathToFileURL(path.resolve(__dirname, "../" + course + "/index.html")).href;
    await pc.goto(base + "#" + id);
    await demo(pc.frameLocator('iframe[title="操作できる完成例"]'));
    for (const [i, [primary, alternative, typical, typicalFeedback]] of answers.entries()) {
      const route = base + "#" + id + "/" + (i + 1);
      await Promise.all([pc.goto(route), phone.goto(route)]);
      const editor = pc.locator("main textarea").first();
      await editor.waitFor();
      const feedback = pc.locator("main section").last().getByRole("status").filter({ visible: true });
      const run = pc.getByRole("button", { name: "実行して確かめる" });
      const multi = await pc.locator("main textarea").count() > 1;
      async function fillCode(source) {
        if (!multi) return editor.fill(source);
        const files = await pc.evaluate(text => splitReactFiles(text), source);
        for (const [name, content] of Object.entries(files))
          await pc.getByRole("textbox", { name, exact:true }).fill(content);
      }
      if (typical !== undefined) await fillCode(typical);
      await run.click();
      await feedback.filter({ hasText: typicalFeedback || /項目を確認|実行で止まりました/ }).waitFor();
      const model = await pc.evaluate(([id, index]) => {
        const step = domUnits.find(u=>u.id===id).steps[index];
        const [template, ...slots] = step.build || domBuilders[id][index];
        return template.replace(/《(\d+)》/g, (_, n) => slots[n-1][0]);
      }, [id, i]);
      const other = typeof alternative === "function" ? alternative(model) : alternative;
      assert.notEqual(other, primary ?? model);
      for (const answer of [primary ?? model, other]) {
        await fillCode(answer);
        await run.click();
        await feedback.filter({ hasText: "できました" }).waitFor();
      }
      await pc.getByRole("link", { name: "見本を読み直す" }).click();
      await pc.getByRole("link", { name: "書きかけの課題へ戻る" }).click();
      await pc.waitForFunction(() => document.activeElement.tagName === "TEXTAREA");
      await pc.reload();
      if (multi) {
        const files = await pc.evaluate(text => splitReactFiles(text), other);
        for (const [name, content] of Object.entries(files))
          assert.equal(await pc.getByRole("textbox",{name,exact:true}).inputValue(), content);
      } else assert.equal(await editor.inputValue(), other);
      const correct = await phone.evaluate(([id, i]) => domUnits.find(u => u.id === id).steps[i].correct, [id, i]);
      const options = phone.locator('input[name="prediction"]');
      assert.equal(await options.count(), 4);
      const section = phone.locator("section").filter({ has: options.first() });
      for (const [choice, match] of [[(correct + 1) % await options.count(), "もう一度"], [correct, "正解です"]]) {
        await options.nth(choice).tap();
        await section.getByRole("button").tap();
        await section.getByRole("status").filter({ hasText: match }).waitFor();
      }
      assert.equal(await phone.getByRole("combobox").inputValue(), "build");
      assert.equal(await phone.locator("main textarea:visible").count(), 0);
      const fields = phone.getByRole("group").filter({ has: phone.locator('input[name^="piece-"]') });
      const slots = await phone.evaluate(([id, i]) => (domUnits.find(u=>u.id===id).steps[i].build || domBuilders[id][i]).slice(1), [id, i]);
      const buildResult = phone.locator("section").last().getByRole("status").filter({visible:true});
      for (const wrong of [true, false]) {
        for (const [j, choices] of slots.entries())
          await fields.nth(j).getByRole("radio", { name: choices[wrong && j === 0 ? 1 : 0], exact: true }).tap();
        await phone.getByRole("button", { name: "組んだコードを確かめる" }).tap();
        await buildResult.filter({hasText: wrong ? /項目を確認|実行で止まりました/ : "できました"}).waitFor();
      }
      assert.equal(await phone.evaluate(key => domState.tasks[key].passed, id+"/"+(i+1)), undefined);
      assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    assert.equal(answers.length, await pc.evaluate(id => domUnits.find(u => u.id === id).steps.length, id));
    if (process.env.DOM_CAPTURE) await phone.screenshot({ path: process.env.DOM_CAPTURE });
    console.log(id + " " + answers.length + "課題の正答・別解・誤答、タップと下書き復帰を確認");
  } finally { await browser.close(); }
}
module.exports = { verifyDom };
