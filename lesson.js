"use strict";

const baseRule = [
  "display: inline-block;",
  "border: 1px solid black;",
  "color: black;",
  "background: white;",
  "font: 16px/1.5 sans-serif;"
];
const readKey = "yomikumu/padding/v1";
const pages = Array.from(document.querySelectorAll("main section[id]"));
const answer = document.querySelector("#answer");
const resume = document.querySelector("#resume");
const quiz = document.querySelector("#quiz");
const quizResult = document.querySelector("#quiz-result");
const writeResult = document.querySelector("#write-result");
const choices = {
  "inner-y": "内側に注目できました。上下を決めるのは最初の6pxです。2つ目の値はどの向きでしょう？",
  "outer-x": "左右の向きは合っています。padding で動くのは、枠から文字までの距離です。",
  "inner-x": "正解です。最初の6pxで上下、次の14pxで左右の内側が空きます。",
  "outer-y": "まず、すき間ができる場所を見てみましょう。padding が広げるのは、文字と枠の間です。"
};

let saved = {};
try {
  const record = JSON.parse(localStorage.getItem(readKey));
  if (record && typeof record === "object") saved = record;
} catch {
  // この端末で読めない記録があっても教材を開ける。
}

function save() {
  try {
    localStorage.setItem(readKey, JSON.stringify(saved));
  } catch {
    document.querySelector("#storage-note").textContent =
      "このブラウザでは下書きを保存できません。この画面を開いている間は続けて練習できます。";
  }
}

function sampleRule(padding) {
  return [".label {", ...baseRule.map(rule => "  " + rule), "  padding: " + padding + ";", "}"].join("\n");
}

function makeLabel(host, text, padding) {
  const root = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = sampleRule(padding);
  const label = document.createElement("span");
  label.className = "label";
  label.textContent = text;
  root.append(style, label);
  return label;
}

for (const host of document.querySelectorAll("[data-padding]")) {
  makeLabel(host, "読書中", host.dataset.padding);
  host.nextElementSibling.textContent = "padding: " + host.dataset.padding + ";";
}
for (const block of document.querySelectorAll("[data-source]")) {
  block.textContent = '<span class="label">読書中</span>\n\n' + sampleRule(block.dataset.source);
}

const liveLabel = makeLabel(document.querySelector("#result-label"), "貸出中", "0");
const sides = ["padding-top", "padding-right", "padding-bottom", "padding-left"];
const allowedProperties = new Set(["padding", ...sides, "padding-block", "padding-inline",
  "padding-block-start", "padding-block-end", "padding-inline-start", "padding-inline-end"]);

function applyAnswer() {
  const parsed = document.createElement("span").style;
  parsed.cssText = answer.value;
  liveLabel.removeAttribute("style");
  for (const property of Array.from(parsed)) {
    if (allowedProperties.has(property)) {
      liveLabel.style.setProperty(property, parsed.getPropertyValue(property), parsed.getPropertyPriority(property));
    }
  }
}

function explainAnswer() {
  const style = getComputedStyle(liveLabel);
  const [top, right, bottom, left] = sides.map(name => parseFloat(style.getPropertyValue(name)));
  const vertical = top === 8 && bottom === 8;
  const horizontal = left === 16 && right === 16;
  if (vertical && horizontal) return "できました。上下は8px、左右は16pxです。";
  if (vertical) return "上下の8pxは合っています。次は左右を16pxにしましょう。";
  if (horizontal) return "左右の16pxは合っています。次は上下を8pxにしましょう。";
  if (top === 16 && bottom === 16 && left === 8 && right === 8) {
    return "上下と左右が逆です。値を2つ書くと、最初の値が上下に使われます。";
  }
  return "上下のすき間から整えましょう。padding の値と単位を確認して、上下を8pxにしてください。";
}

if (typeof saved.draft === "string") answer.value = saved.draft;
applyAnswer();
answer.addEventListener("input", () => {
  applyAnswer();
  writeResult.textContent = "";
  saved.draft = answer.value;
  saved.checkedDraft = false;
  save();
});
document.querySelector("#editor").addEventListener("submit", event => {
  event.preventDefault();
  writeResult.textContent = explainAnswer();
  saved.checkedDraft = true;
  save();
});
if (Object.hasOwn(choices, saved.choice)) {
  quiz.elements.side.value = saved.choice;
  if (saved.checkedChoice) quizResult.textContent = choices[saved.choice];
}
quiz.addEventListener("change", () => {
  saved.choice = quiz.elements.side.value;
  saved.checkedChoice = false;
  quizResult.textContent = "";
  save();
});
quiz.addEventListener("submit", event => {
  event.preventDefault();
  saved.choice = quiz.elements.side.value;
  saved.checkedChoice = true;
  quizResult.textContent = choices[saved.choice];
  save();
});

function showPage(moveFocus) {
  const hash = location.hash.slice(1);
  const requested = (!hash || hash === "lesson") ? saved.page : hash;
  const page = pages.find(section => section.id === requested) || pages[0];
  for (const section of pages) section.hidden = section !== page;
  for (const link of document.querySelectorAll("nav a")) {
    if (link.hash === "#" + page.id) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  const practice = page.id === "read" || page.id === "write";
  if (practice) saved.returnTo = page.id;
  resume.hidden = practice || !["read", "write"].includes(saved.returnTo);
  if (!resume.hidden) resume.href = "#" + saved.returnTo;
  if (page.id === "write" && saved.checkedDraft) writeResult.textContent = explainAnswer();
  saved.page = page.id;
  save();
  if (moveFocus) page.querySelector("h1").focus();
}

window.addEventListener("hashchange", () => showPage(true));
showPage(false);
