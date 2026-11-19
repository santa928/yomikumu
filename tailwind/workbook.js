"use strict";

const main = document.getElementById("main");
const storageKey = "yomikumu/tailwind/v1";
let progress = { version: 1, last: "", units: {} };
const views = ["slide", "quiz", "tap", "write"];
const viewNames = ["見本", "表示予測", "タップで組む", "自分で書く"];
const addr = (unit, view) => unit.id + "/" + view;

function validProgress(input) {
  if (!input || input.version !== 1 || typeof input.units !== "object" || !input.units || Array.isArray(input.units)) return false;
  if (typeof input.last !== "string" || (input.last && !readingUnits.some(u => views.some(v => addr(u, v) === input.last)))) return false;
  return Object.entries(input.units).every(([id, state]) => {
    const unit = readingUnits.find(item => item.id === id);
    if (!unit || !state || typeof state !== "object") return false;
    return Object.entries(state).every(([key, value]) => {
      if (["quizDone", "tapDone", "writeDone", "localDone"].includes(key)) return typeof value === "boolean";
      if (key === "choice") return Number.isInteger(value) && value >= 0 && value <= 3;
      if (!["tap", "write"].includes(key) || !value || typeof value !== "object") return false;
      return Object.entries(value).every(([part, text]) => unit.fields.some(f => f.part === part) && typeof text === "string");
    });
  });
}

function storageWarning() {
  document.getElementById("storage-note").textContent = "この端末に自動保存できません。目次の「進捗を保存」からファイルに残せます。";
}
try {
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    const saved = JSON.parse(raw);
    if (validProgress(saved)) progress = saved;
    else storageWarning();
  }
} catch { storageWarning(); }

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(progress)); }
  catch { storageWarning(); }
}
function saveFile(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function catalogue() {
  const previous = readingUnits.find(unit => progress.last.split("/")[0] === unit.id);
  main.innerHTML = `<p class="kind">Web制作の選択コース</p><h1>読書カードと Tailwind CSS</h1>
    <p>HTML の中に短い名前を書いて、読書カードの見た目を作ります。CSS の文字と余白を試したあとに選べます。JavaScript へは全コース目次から直接進めます。</p>
    ${previous ? `<a class="next" href="#${progress.last}">前回の続きへ · ${previous.title}</a>` : ""}
    ${readingChapters.map((chapter, i) => `<section><h2>${chapter.title}</h2><p>${chapter.intro}</p>
      <div class="sample-window"><iframe class="reading-frame" src="${chapter.sample}" title="${chapter.title}の完成例"></iframe></div>
      ${chapter.widths ? widthTools() : ""}
      <a class="review" href="${chapter.sample}">完成例を広い画面で操作する</a>
      <ol class="catalog">${readingUnits.filter(unit => unit.chapter === i).map(unit => {
        const state = progress.units[unit.id] || {};
        const done = views.slice(1).map((v,n) => state[v+"Done"] && viewNames[n+1]).filter(Boolean);
        if (state.localDone) done.push("手元のCSS");
        return `<li><a href="#${addr(unit, "slide")}">${unit.title}</a>${done.length ? `<small>　確認済み · ${done.join("、")}</small>` : ""}</li>`;
      }).join("")}</ol></section>`).join("")}
    <details><summary>進捗と下書きの引き継ぎ</summary><p>記述したクラス名と途中の選択をファイルに保存できます。読み込むとこのコースの進捗を置き換えます。</p>
    <button id="export" type="button">進捗を保存</button><label>進捗を読み込む <input id="import" type="file" accept=".json,application/json"></label>
    <p role="status" id="transfer"></p></details>`;
  main.querySelectorAll("[data-widths]").forEach(tools => {
    const frame = tools.previousElementSibling.querySelector("iframe");
    bindWidths(tools, 300, width => { frame.style.maxWidth = "none"; frame.style.width = width + "px"; });
  });
  document.getElementById("export").onclick = () => saveFile("reading-progress.json", JSON.stringify(progress), "application/json");
  document.getElementById("import").onchange = async e => {
    try {
      if (!e.target.files[0]) return;
      const data = JSON.parse(await e.target.files[0].text());
      if (!validProgress(data)) throw Error();
      progress = data;
      save();
      catalogue();
      document.querySelector("main details").open = true;
      document.getElementById("transfer").textContent = "読み込みました。";
    } catch { document.getElementById("transfer").textContent = "このコースの進捗ファイルを選んでください。"; }
  };
}

function tabs(unit, view) {
  return `<div class="tabs" aria-label="練習方法">${views.map((v, i) =>
    `<a ${v === view ? 'aria-current="page"' : ""} href="#${addr(unit, v)}">${viewNames[i]}</a>`).join("")}</div>`;
}

function windowHtml() {
  return '<div class="sample-window" tabindex="0" aria-label="読書カードの表示。大きい幅は横にスクロールできます"></div>';
}

function widthTools() {
  return '<div class="tools" data-widths><button type="button" data-width="300">狭い幅（300px）</button><button type="button" data-width="680">広い幅（680px）</button></div>';
}

function bindWidths(group, initial, change) {
  function select(width) {
    for (const button of group.querySelectorAll("button")) button.setAttribute("aria-pressed", String(Number(button.dataset.width) === width));
    change(width);
  }
  group.onclick = e => { if (e.target.dataset.width) select(Number(e.target.dataset.width)); };
  select(initial);
}

async function showSample(unit, values, name, settings, container, width) {
  const frame = frameElement(width || unit.width || 300, name);
  container.replaceChildren(frame);
  const base = unit.fields.some(field => field.part === "other") ? { other: "" } : {};
  await renderSample(frame, { ...base, ...unit.base, ...values }, settings);
}

function slide(unit) {
  const ex = unit.example;
  const state = unit.checks.find(check => check.state)?.state;
  main.insertAdjacentHTML("beforeend", `<p>${unit.why}</p><p><strong>${ex.source ? "status.js" : partLabels[ex.part]}</strong>の変更する箇所</p>
    <pre class="reading-code" id="snippet"></pre>${windowHtml()}${unit.widths ? widthTools() : ""}
    <div class="tools"><button id="switch" type="button" aria-pressed="false">${ex.after ? "見本を一か所変える" : "指定を外して比べる"}</button>
    ${state && state !== "disabled" ? '<button type="button" id="state" aria-pressed="false">状態見本に切り替える</button>' : ""}</div>
    <p id="result" role="status"></p><a class="next" href="#${addr(unit, "quiz")}">表示を予測する</a>`);
  let changed = false;
  let width = ex.width;
  let statePreview = false;
  const draw = () => {
    const value = changed ? ex.after : ex.before;
    document.getElementById("snippet").textContent = ex.source ? ex.source[Number(changed)] :
      ex.part === "theme" ? value : `class="${value}"`;
    document.getElementById("switch").setAttribute("aria-pressed", String(changed));
    const settings = { state: statePreview ? state : "", titles: unit.titles,
      omitClassParts: ex.source && !changed ? ["card", "other"] : [] };
    showSample(unit, { ...ex.base, [ex.part]: value }, "見本の読書カード", settings, main.querySelector(".sample-window"), width);
    document.getElementById("result").textContent = changed ? unit.result : "変更前の見本です。";
  };
  document.getElementById("switch").onclick = () => { changed = !changed; draw(); };
  if (document.getElementById("state")) document.getElementById("state").onclick = e => {
    statePreview = !statePreview;
    e.target.setAttribute("aria-pressed", String(statePreview));
    draw();
  };
  if (unit.widths) bindWidths(main.querySelector("[data-widths]"), width || 300, value => { width = value; draw(); });
  else draw();
}

function quizView(unit, state) {
  const [question, choices, correct, reason] = unit.quiz;
  main.insertAdjacentHTML("beforeend", `<form><fieldset><legend class="prompt">${question}</legend>
    ${choices.map((choice, i) => `<label><input type="radio" name="prediction" value="${i}" ${i === state.choice ? "checked" : ""}>${choice}</label>`).join("")}
    </fieldset><button>予測を確かめる</button></form><p id="feedback" role="status"></p>
    <a class="review" href="#${addr(unit, "slide")}">見本を読み返す</a>
    <a class="next" href="#${addr(unit, matchMedia("(max-width: 720px)").matches ? "tap" : "write")}">コードの練習へ</a>`);
  main.querySelector("form").onchange = e => { state.choice = Number(e.target.value); save(); };
  main.querySelector("form").onsubmit = e => {
    e.preventDefault();
    const correctChoice = state.choice === correct;
    if (correctChoice) state.quizDone = true;
    document.getElementById("feedback").textContent = state.choice === undefined ? "予測を一つ選んでください。" :
      (correctChoice ? "正解です。" : "もう一度比べましょう。") + reason;
    save();
  };
}

function practice(unit, mode, state) {
  const draft = state[mode] ||= {};
  const next = readingUnits[readingUnits.indexOf(unit) + 1];
  main.insertAdjacentHTML("beforeend", `<p class="prompt">${unit.prompt}</p>
    ${unit.plain ? `<details open><summary>素のCSSで作った見本</summary><pre>${plainCard}</pre><div id="plain">${windowHtml()}</div></details>` : ""}
    <form>${unit.fields.map(field => mode === "write" ?
    `<label class="code-field">${field.label || partLabels[field.part]}の${field.part === "theme" ? "CSS" : " class"}<textarea data-field="${field.part}" spellcheck="false" autocapitalize="off">${escapeText(draft[field.part] || "")}</textarea></label>` :
    `<fieldset data-field="${field.part}"><legend>${field.label || partLabels[field.part]}の指定を選ぶ</legend><div class="tokens">
      ${field.options.map(option => `<button type="button" data-token="${escapeText(option)}">${escapeText(option)}</button>`).join("")}
      </div><output class="reading-code"></output></fieldset>`).join("")}<button type="submit">表示と答えを確かめる</button></form>
    <p id="feedback" role="status"></p>${windowHtml()}${unit.widths ? widthTools() : ""}
    <a class="review" href="#${addr(unit, "slide")}">この課題の見本を読み返す</a>
    ${unit.local === "status" ? statusLocalInstructions(mode) : unit.local ? localInstructions(mode) : ""}
    <a class="next" href="#${next ? addr(next, "slide") : "contents"}">${next ? "次へ · "+next.title : "コース目次に戻る"}</a>`);
  const windowBox = main.querySelector(":scope > .sample-window");
  if (unit.plain) showSample(unit, {}, "素のCSSの読書カード", { plain: true, titles: nightBookNames }, main.querySelector("#plain .sample-window"));
  for (const field of unit.fields) {
    const control = main.querySelector(`[data-field="${field.part}"]`);
    if (mode === "write") control.oninput = () => { draft[field.part] = control.value; save(); };
    else {
      const sync = () => {
        const selected = field.part === "theme" ? [draft[field.part]] : classTokens(draft[field.part]);
        control.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(selected.includes(button.dataset.token))));
        control.querySelector("output").textContent = draft[field.part] || "未選択";
      };
      control.onclick = e => {
        if (!e.target.dataset.token) return;
        const value = e.target.dataset.token;
        if (field.part === "theme") draft[field.part] = draft[field.part] === value ? "" : value;
        else {
          const tokens = classTokens(draft[field.part]);
          draft[field.part] = (tokens.includes(value) ? tokens.filter(t => t !== value) : [...tokens, value]).join(" ");
        }
        sync();
        save();
      };
      sync();
    }
  }
  const validTheme = () => !unit.fields.some(f => f.part === "theme") || !draft.theme ||
    /^\s*@theme\s*\{\s*--color-[\w-]+\s*:\s*(?:#[\da-f]{3,8}|[a-z]+|(?:rgb|hsl|oklch)\([\d\s.,%/-]+\))\s*;?\s*\}\s*$/i.test(draft.theme);
  let width = 300;
  const display = () => showSample(unit, validTheme() ? draft : { ...draft, theme: "" }, "入力した読書カード", { titles: unit.titles || nightBookNames }, windowBox, width);
  if (unit.widths) bindWidths(main.querySelector("[data-widths]"), width, value => { width = value; display(); });
  else display();
  if (unit.local === "status") bindStatusLocal(unit, state);
  else if (unit.local) bindLocal(unit, draft, state, validTheme);
  const form = main.querySelector("form");
  form.onsubmit = async e => {
    e.preventDefault();
    const feedback = document.getElementById("feedback");
    if (!validTheme()) { feedback.textContent = "色の定義を一つ、見本の @theme { --color-名前: 色; } の形で書きます。"; return; }
    const submit = form.querySelector("[type=submit]");
    submit.disabled = true;
    try {
      await display();
      const results = await evaluateReading(unit, { ...draft });
      const missing = results.find(item => !item.ok);
      const count = results.filter(item => item.ok).length;
      if (!missing) { state[mode+"Done"] = true; save(); }
      feedback.textContent = missing ? `${count ? count+"項目は合っています。" : ""}${missing.check.hint}` :
        "できました。書いた指定で、読書カードが要望どおりに表示されています。";
    } catch {
      feedback.textContent = "表示を作れませんでした。見本の書き方を確認して、もう一度試してください。";
    } finally { submit.disabled = false; }
  };
}

function navigate() {
  const [id, name] = location.hash.slice(1).split("/");
  const unit = readingUnits.find(item => item.id === id);
  if (!unit) { catalogue(); return; }
  const view = views.includes(name) ? name : "slide";
  const state = progress.units[id] ||= {};
  progress.last = addr(unit, view);
  save();
  window.YomikumuPaths?.remember("tailwind", progress.last);
  main.innerHTML = `<p class="kind">${readingChapters[unit.chapter].title}</p><h1>${unit.title}</h1>${tabs(unit, view)}`;
  if (view === "slide") slide(unit);
  else if (view === "quiz") quizView(unit, state);
  else practice(unit, view, state);
}
window.addEventListener("hashchange", () => { navigate(); main.focus(); });
document.querySelector(".skip").onclick = event => { event.preventDefault(); main.focus(); };
navigate();
