"use strict";

const main = document.getElementById("main");
const keyTS = "yomikumu/typescript/v1";
const viewLabels = { slide: "見本", quiz: "表示予測", tap: "タップで組む", write: "自分で書く" };
const escTS = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
let stateTS = { version: 1, last: "", units: {} };
let execution;
let requestTS = 0;
function validateTS(data) {
  if (!data || data.version !== 1 || typeof data.last !== "string" || !data.units || typeof data.units !== "object" || Array.isArray(data.units)) return false;
  const [unit, view] = data.last.split("/");
  if (data.last && (!tsLessons.some(s => s.id === unit) || !Object.hasOwn(viewLabels, view) || data.last !== unit + "/" + view)) return false;
  return Object.entries(data.units).every(([id, state]) => {
    const lesson = tsLessons.find(s => s.id === id);
    return lesson && state && typeof state === "object" && Object.entries(state).every(([k,v]) => {
      if (k === "write") return typeof v === "string";
      if (k === "tap") return Array.isArray(v) && v.length === lesson.slots.length && v.every((value,i) => value === null || lesson.slots[i].slice(1).includes(value));
      if (k === "choice") return Number.isInteger(v) && v >= 0 && v <= 3;
      return ["quizDone","tapDone","writeDone"].includes(k) && typeof v === "boolean";
    });
  });
}
const storageTS = () => { document.getElementById("storage-note").textContent = "端末への保存ができません。目次から進捗ファイルを保存できます。"; };
try {
  const text = localStorage.getItem(keyTS);
  if (text) { const data = JSON.parse(text); if (validateTS(data)) stateTS = data; else storageTS(); }
} catch { storageTS(); }
function persistTS() { try { localStorage.setItem(keyTS, JSON.stringify(stateTS)); } catch { storageTS(); } }

function buildTS(lesson, picks) {
  let i = 0;
  return lesson.template.replace(/§/g, () => picks[i++] ?? "/* ここを選ぶ */");
}
function canonicalTS(value) {
  if (Array.isArray(value)) return value.map(canonicalTS);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(k => [k,canonicalTS(value[k])]));
  return value;
}
function matchTS(item, want) {
  if (!item) return false;
  if (want === undefined) return item.type === "undefined";
  const type = Array.isArray(want) ? "array" : want === null ? "null" : typeof want;
  if (item.type !== type) return false;
  if (["object", "array"].includes(type)) {
    try { return JSON.stringify(canonicalTS(JSON.parse(item.text))) === JSON.stringify(canonicalTS(want)); } catch { return false; }
  }
  return item.text === String(want);
}
function panelTS() {
  return '<div class="ts-result"><h2>型検査</h2><p data-type role="status">未検査</p><div class="ts-lines"></div><h2>実行結果</h2><pre data-run role="status">未実行</pre><div data-dom></div><p data-grade role="status"></p></div>';
}
async function performTS(lesson, source, section, { execute = true, practice = false, onPass } = {}) {
  const current = ++requestTS;
  execution?.stop();
  const typeNote = section.querySelector("[data-type]");
  const output = section.querySelector("[data-run]");
  const feedback = section.querySelector("[data-grade]");
  const lines = section.querySelector(".ts-lines");
  typeNote.textContent = "型検査中…"; lines.replaceChildren(); feedback.textContent = "";
  output.textContent = "未実行";
  section.querySelector("[data-dom]").replaceChildren();
  try {
    const checked = await inspectTS(source, practice ? lesson.contract || "" : "", practice ? [tsSafe, ...(lesson.rules || [])] : []);
    if (current !== requestTS || !section.isConnected) return;
    if (checked.errors.length) {
      typeNote.textContent = "型エラーがあります。最初の一か所から確認しましょう。";
      for (const diagnostic of checked.errors) {
        const editor = main.querySelector("textarea");
        const item = document.createElement(editor ? "button" : "p");
        item.textContent = diagnostic.line + "行 " + diagnostic.col + "列 · TS" + diagnostic.code + " " + diagnostic.text;
        if (editor) item.onclick = () => {
          const rows = editor.value.split("\n");
          const start = rows.slice(0, diagnostic.line - 1).reduce((n, row) => n + row.length + 1, 0);
          editor.focus(); editor.setSelectionRange(start, start + (rows[diagnostic.line - 1]?.length || 0));
        };
        lines.append(item);
      }
      return;
    }
    typeNote.textContent = "型検査を通りました。";
    if (!execute) return;
    if (practice && (!checked.contractOk || checked.missing)) {
      feedback.textContent = checked.missing || lesson.contractHint;
      return;
    }
    if (lesson.dom) {
      await loadDomTools();
      if (current !== requestTS || !section.isConnected) return;
      execution = typedDomRun(lesson, checked.js, section.querySelector("[data-dom]"), practice);
      const dom = await execution.result;
      if (current !== requestTS || !section.isConnected) return;
      if (dom.error) { output.textContent = "実行時 · " + dom.error; return; }
      output.textContent = "下の画面を操作できます。";
      if (practice) {
        if (dom.done !== lesson.dom.tests.length) feedback.textContent = (dom.done ? dom.done+"項目は合っています。" : "")+dom.hint;
        else { onPass?.(); feedback.textContent = "できました。型と実行結果を確認しました。"; }
      }
      return;
    }
    const probes = practice ? lesson.probes || [] : [];
    const inspections = probes.map(q => "console.log(" + q.expr + ");");
    execution = runScoreCode(checked.js + "\n" + inspections.join("\n"));
    const result = await execution.result;
    if (current !== requestTS || !section.isConnected) return;
    if (!result.ok) { output.textContent = "実行時 · " + result.error; return; }
    output.textContent = result.output.map(row => row.map(v => v.text + "（" + v.type + "）").join(" ")).join("\n") || "表示を出さずに終了しました。";
    if (practice) {
      const observed = result.output.slice(-probes.length);
      const passed = probes.map((q,i) => matchTS(observed[i]?.[0], q.want));
      const missing = passed.indexOf(false);
      if (missing >= 0) {
        const count = passed.filter(Boolean).length;
        feedback.textContent = (count ? count + "項目は合っています。" : "") + probes[missing].hint;
      } else { onPass?.(); feedback.textContent = "できました。型と実行結果を確認しました。"; }
    }
  } catch (e) { if (current === requestTS) typeNote.textContent = "検査を完了できませんでした。" + e.message; }
}
function tsCatalogue() {
  const prev = tsLessons.find(s => s.id === stateTS.last.split("/")[0]);
  main.innerHTML = `<p class="kind">Web制作 · JavaScriptの次へ</p><h1>クイズから始めるTypeScript</h1>
    <p>クイズの得点や回答に型を付けます。数値と文字列を取り違えたとき、型検査でどの行にエラーが出るかを確かめましょう。</p>
    ${prev ? `<a class="next" href="#${stateTS.last}">前回の続きへ · ${prev.title}</a>` : ""}
    ${tsChapters.map((ch,i) => `<section><h2>${ch.title}</h2><p>${ch.intro}</p><div class="ts-tools">
    ${ch.demo.map((text,n) => `<button type="button" data-ch="${i}" data-n="${n}">${text}</button>`).join("")}</div><div data-show></div>
    <ol class="catalog">${tsLessons.filter(u=>u.chapter===i).map(u=>{
      const st = stateTS.units[u.id] || {};
      const done = ["quiz","tap","write"].filter(v => st[v+"Done"]).map(v => viewLabels[v]);
      return `<li><a href="#${u.id}/slide">${u.title}</a> <small>${done.join("、")}</small></li>`;
    }).join("")}</ol></section>`).join("")}
    <details><summary>進捗と下書きの引き継ぎ</summary><button id="save-ts" type="button">進捗を保存</button>
    <label>現在の進捗を置き換えるファイル <input type="file" id="load-ts" accept=".json"></label><p role="status" id="transfer-ts"></p></details>`;
  for (const button of main.querySelectorAll("[data-ch]")) button.onclick = () => {
    const chapter = tsChapters[Number(button.dataset.ch)];
    const source = chapter.code(Number(button.dataset.n));
    const box = button.closest("section").querySelector("[data-show]");
    box.innerHTML = "<pre>" + escTS(source) + "</pre>" + panelTS();
    performTS(chapter, source, box);
  };
  document.getElementById("save-ts").onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(stateTS)], {type:"application/json"}));
    Object.assign(document.createElement("a"), { href:url, download:"quiz-types-progress.json" }).click();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  };
  document.getElementById("load-ts").onchange = async e => {
    try {
      if (!e.target.files[0]) return;
      const data = JSON.parse(await e.target.files[0].text());
      if (!validateTS(data)) throw Error();
      stateTS = data; persistTS(); tsCatalogue(); main.querySelector("details").open = true;
      document.getElementById("transfer-ts").textContent = "進捗を読み込みました。";
    } catch { document.getElementById("transfer-ts").textContent = "このコースの進捗ファイルを選んでください。"; }
  };
}
function tsSlide(lesson) {
  main.insertAdjacentHTML("beforeend", `<p>${lesson.why}</p><pre id="example-ts"></pre>
    <div class="ts-tools"><button type="button" id="before-ts">元の見本を試す</button><button type="button" id="after-ts">${lesson.change}</button></div>
    ${panelTS()}<a class="next" href="#${lesson.id}/quiz">表示を予測する</a>`);
  const show = source => {
    document.getElementById("example-ts").textContent = source;
    performTS(lesson,source,main);
  };
  document.getElementById("before-ts").onclick = () => show(lesson.before);
  document.getElementById("after-ts").onclick = () => show(lesson.after);
  show(lesson.before);
}
function tsQuiz(lesson, record) {
  const [text, options, answer, explanation] = lesson.question;
  main.insertAdjacentHTML("beforeend", `<form><fieldset><legend>${text}</legend>${options.map((option,i) =>
    `<label><input type="radio" name="prediction" value="${i}" ${record.choice === i ? "checked" : ""}>${escTS(option)}</label>`).join("")}</fieldset>
    <button>予測を確認</button></form><p role="status" id="feedback-ts"></p><a class="review" href="#${lesson.id}/slide">見本を読み返す</a>
    <a class="next" href="#${lesson.id}/${matchMedia("(max-width:720px)").matches ? "tap" : "write"}">コードの練習へ</a>`);
  main.querySelector("form").onchange = e => { record.choice = Number(e.target.value); persistTS(); };
  main.querySelector("form").onsubmit = e => {
    e.preventDefault();
    const ok = record.choice === answer;
    if (ok) { record.quizDone = true; persistTS(); }
    document.getElementById("feedback-ts").textContent = record.choice === undefined ? "一つ選びましょう。" : (ok ? "正解です。" : "もう一度見本と比べましょう。") + explanation;
  };
}
function tsPractice(lesson, view, record) {
  const write = view === "write";
  const picks = record.tap ||= lesson.slots.map(() => null);
  const next = tsLessons[tsLessons.indexOf(lesson)+1];
  main.insertAdjacentHTML("beforeend", `<p>${escTS(lesson.prompt)}</p>
    ${write ? `<label>自分のTypeScript<textarea spellcheck="false" autocapitalize="off">${escTS(record.write ?? lesson.starter)}</textarea></label>` :
      `${lesson.slots.map(([label,...options],i) => `<fieldset><legend>${escTS(label)}</legend>${options.map((option,n) =>
        `<label><input type="radio" name="slot-${i}" data-slot="${i}" value="${n}" ${picks[i] === option ? "checked" : ""}><code>${escTS(option.trim() || "空白")}</code></label>`).join("")}</fieldset>`).join("")}<pre id="assembled"></pre>`}
    <div class="ts-tools"><button type="button" id="check-type">型を検査</button><button type="button" id="run-type">実行して確かめる</button>
    <button type="button" id="halt-type" disabled>停止する</button></div>
    ${panelTS()}<a class="review" href="#${lesson.id}/slide">この課題の見本を読み返す</a>
    <a class="next" href="#${next ? next.id+"/slide" : "contents"}">${next ? "次へ · "+next.title : "コースの目次へ"}</a>`);
  const code = () => write ? main.querySelector("textarea").value : buildTS(lesson, picks);
  if (write) main.querySelector("textarea").oninput = e => { record.write = e.target.value; persistTS(); };
  else {
    document.getElementById("assembled").textContent = code();
    for (const opt of main.querySelectorAll("[data-slot]")) opt.onchange = () => {
      const i = Number(opt.dataset.slot);
      picks[i] = lesson.slots[i][1+Number(opt.value)]; persistTS();
      document.getElementById("assembled").textContent = code();
    };
  }
  const halt = document.getElementById("halt-type");
  const run = async execute => {
    if (!write && picks.some(v=>v===null)) { main.querySelector("[data-grade]").textContent = "各欄からコードを一つずつ選びます。"; return; }
    halt.disabled = false;
    await performTS(lesson,code(),main,{execute,practice:true,onPass:() => { record[view+"Done"] = true; persistTS(); }});
    halt.disabled = true;
  };
  document.getElementById("check-type").onclick = () => run(false);
  document.getElementById("run-type").onclick = () => run(true);
  halt.onclick = () => { ++requestTS; execution?.stop(); halt.disabled=true; main.querySelector("[data-run]").textContent="停止しました。下書きから再開できます。"; };
}
function routeTS() {
  ++requestTS; execution?.stop(); execution=undefined;
  const [id,name] = location.hash.slice(1).split("/");
  const u = tsLessons.find(s=>s.id===id);
  if (!u) { tsCatalogue(); return; }
  const view = Object.hasOwn(viewLabels,name) ? name : "slide";
  const rec = stateTS.units[id] ||= {};
  stateTS.last = id + "/" + view; persistTS();
  window.YomikumuPaths?.remember("typescript",stateTS.last);
  main.innerHTML = `<p class="kind">${tsChapters[u.chapter].title}</p><h1>${u.title}</h1><div class="ts-tools">
   ${Object.entries(viewLabels).map(([v,l]) => `<a href="#${id}/${v}" ${v===view ? 'aria-current="page"' : ""}>${l}</a>`).join("")}</div>`;
  if (view === "slide") tsSlide(u);
  else if (view === "quiz") tsQuiz(u,rec);
  else tsPractice(u,view,rec);
}
window.addEventListener("hashchange", () => { routeTS(); main.focus(); });
document.querySelector(".skip").onclick = e => { e.preventDefault(); main.focus(); };
routeTS();
