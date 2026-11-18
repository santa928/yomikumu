"use strict";
const { verifyDom } = require("./dom-check.cjs");
const assert = require("node:assert/strict");
const append = 'const r = document.createElement("li"); r.textContent="灯台"; document.querySelector("#quiz").append(r);';
verifyDom("elements", [
  ['document.querySelector("#heading").textContent = "光の問題"', 'document.getElementById("heading").innerText = "光の問題"'],
  ['document.querySelector("#rain").classList.add("chosen"); document.querySelector("#dawn").classList.remove("chosen");', 'for (const row of document.querySelectorAll("li")) row.classList.toggle("chosen", row.id === "rain");'],
  ['const r=document.createElement("li"); r.textContent="星図"; document.querySelector("#quiz").append(r);', 'document.getElementById("quiz").insertAdjacentHTML("beforeend", "<li>星図</li>")'],
  ['document.querySelectorAll("#quiz li").forEach(row=>row.classList.add("chosen"))', 'for(const row of document.getElementById("quiz").children) row.className="chosen"'],
  [append + 'r.classList.add("chosen");', 'document.getElementById("quiz").insertAdjacentHTML("beforeend", "<li class=chosen>灯台</li>")', append],
], async frame => {
  await frame.getByRole("button", { name: "問題を追加" }).click();
  await frame.getByRole("button", { name: "追加問題 2" }).click();
  assert.equal(await frame.locator("#quiz li.chosen").textContent(), "追加問題 2");
}).catch(e => {console.error(e); process.exitCode=1;});
