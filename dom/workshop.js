"use strict";
const workshop = window.courseWorkshop || {
  id: "dom", heading: "ブラウザで動かすJavaScript", language: "JavaScript",
  units: [elementsUnit, eventsUnit, stateUnit, loadingUnit, keyboardDomUnit, quizDomUnit],
  frame: domFrame, prepare: limitDomLoops,
};
const domUnits = workshop.units;
const domMain = document.querySelector("main");
const domStateKey = "yomikumu/" + workshop.id + "/v1";
let domState = { last: "", tasks: {} };
try {
  const parsed = JSON.parse(localStorage.getItem(domStateKey));
  if (parsed && parsed.tasks && typeof parsed.tasks === "object") domState = parsed;
} catch { /* このページを開いている間の保存は続ける。 */ }
function saveDom() {
  try { localStorage.setItem(domStateKey, JSON.stringify(domState)); }
  catch { document.querySelector("#storage-note").textContent = "この端末に保存できません。ページを閉じる前に入力を控えてください。"; }
}
function node(tag, text) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  return element;
}
function route(label, hash) {
  const link = node("a", label);
  link.href = "#" + hash;
  return link;
}
function button(label, action) {
  const b = node("button", label);
  b.type = "button";
  b.addEventListener("click", action);
  return b;
}
function section(title) {
  const area = node("section");
  area.append(node("h2", title));
  return area;
}
const nav = document.querySelector("#units");
for (const u of domUnits) nav.append(route(u.title, u.id));
if (matchMedia("(min-width: 721px)").matches) nav.parentElement.open = true;
let stopRun = () => {};
function renderDom() {
  stopRun();
  const [id, part, position] = location.hash.slice(1).split("/");
  const unit = domUnits.find(u => u.id === id);
  domMain.replaceChildren();
  for (const a of nav.children) {
    if (unit && a.hash === "#" + id) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  if (!unit) {
    domMain.append(node("h1", workshop.heading));
    const list = node("ol");
    list.className = "catalog";
    for (const u of domUnits) {
      const li = node("li");
      li.append(route(u.title, u.id), node("p", u.intro));
      list.append(li);
    }
    domMain.append(list);
    return;
  }
  const index = Number(part) - 1;
  const step = unit.steps[index];
  const key = step ? id + "/" + (index + 1) : id;
  domState.last = key;
  window.YomikumuPaths?.remember(workshop.id, key);
  saveDom();
  document.title = (step?.title || unit.title) + "｜よみくむ";
  const chapter = node("p", step ? unit.title : workshop.heading);
  chapter.className = "kind";
  domMain.append(chapter, node("h1", step?.title || unit.title));
  if (!step) {
    domMain.append(node("p", unit.intro));
    const demo = section("完成例を試す");
    demo.append(node("p", unit.demo.tip), workshop.frame("操作できる完成例", unit.demo.html, unit.demo.code, [], unit.setup));
    const list = node("ol");
    list.className = "catalog";
    for (const [i, s] of unit.steps.entries()) {
      const li = node("li");
      const progress = domState.tasks[id + "/" + (i + 1)] || {};
      li.append(route(s.title, id + "/" + (i + 1)));
      if (progress.tap || progress.built || progress.passed) li.append(node("small", [progress.tap && "予測正解", progress.built && "組み立て達成", progress.passed && "コード達成"].filter(Boolean).join("・")));
      list.append(li);
    }
    domMain.append(demo, node("h2", "小課題"), list);
    return;
  }
  const state = domState.tasks[key] ||= {};
  const model = section("見本を読む");
  model.id = "example";
  model.tabIndex = -1;
  model.append(node("p", step.explain), node("pre", step.example));
  if (step.referenceHtml) {
    model.append(node("pre", step.referenceHtml), domFrame("HTMLでの表示", step.referenceHtml, ""));
  }
  const sample = workshop.frame("見本の実行結果", step.exampleHtml || step.html, step.example, [], unit.setup);
  model.append(sample);
  if (id === "elements" && index > 0) {
    const css = node("details");
    css.append(node("summary", "見本で使う目印のCSS"), node("pre", chosenStyle));
    model.append(css);
  }
  if (step.compare) {
    const stage = node("div");
    model.append(button(step.compare.label, () => {
      stage.replaceChildren(node("pre", step.compare.code), workshop.frame("変更後の実行結果", step.html, step.compare.code, [], unit.setup));
    }), stage);
  }
  const phone = section("タップで確かめる");
  const group = node("fieldset");
  group.append(node("legend", step.question));
  for (const [i, label] of step.options.entries()) {
    const radio = node("input");
    radio.type = "radio";
    radio.name = "prediction";
    radio.checked = state.choice === i;
    radio.addEventListener("change", () => { state.choice = i; state.tap = false; saveDom(); reply.textContent = ""; });
    const wrapper = node("label");
    wrapper.append(radio, label);
    group.append(wrapper);
  }
  const reply = node("p", state.tap ? "正解です。" : "");
  reply.setAttribute("role", "status");
  phone.append(group, button("予測を確かめる", () => {
    state.tap = state.choice === step.correct;
    reply.textContent = state.choice === undefined ? "答えを一つ選んでください。" :
      (state.tap ? "正解です。 " : "もう一度。 ") + step.feedback;
    saveDom();
  }), reply);
  const exercise = section("自分で試す");
  const modeLabel = node("label", "練習方法　");
  const mode = node("select");
  for (const [value, text] of [["build", "タップでコードを組み立てる"], ["write", "コードを記述する"]]) {
    const option = node("option", text);
    option.value = value;
    mode.append(option);
  }
  modeLabel.append(mode);
  const write = node("div");
  const build = node("div");
  const builtStatus = node("p", state.built ? "前回の組み立てで達成しました。" : "");
  builtStatus.setAttribute("role", "status");
  const builtPreview = node("div");
  const [template, ...slots] = step.build || domBuilders[id][index];
  const assembled = node("pre");
  const pieces = Array.isArray(state.pieces) ? state.pieces : [];
  const assemble = () => template.replace(/《(\d+)》/g, (mark, n) => pieces[n - 1] || mark);
  assembled.textContent = assemble();
  build.append(node("p", "《番号》に入れるコードを選んでください。"), assembled);
  for (const [j, choices] of slots.entries()) {
    const group = node("fieldset");
    group.append(node("legend", "《" + (j + 1) + "》に入れるコード"));
    const order = (index + j) % 2 === 0 ? [...choices].reverse() : choices;
    for (const choice of order) {
      const radio = node("input");
      radio.name = "piece-" + j;
      radio.type = "radio";
      radio.checked = pieces[j] === choice;
      radio.onchange = () => {
        stopRun();
        pieces[j] = choice;
        state.pieces = pieces;
        state.built = false;
        assembled.textContent = assemble();
        builtStatus.textContent = "";
        saveDom();
      };
      const label = node("label");
      label.append(radio, node("code", choice));
      group.append(label);
    }
    build.append(group);
  }
  const fields = node("div");
  const editors = [];
  const initial = typeof state.code === "string" ? state.code : step.starter ?? step.example;
  const files = step.files ? workshop.splitFiles(initial) : { [step.language || workshop.language]: initial };
  const readEditors = () => step.files ?
    workshop.joinFiles(Object.fromEntries(editors.map(({ name, input }) => [name, input.value]))) : editors[0].input.value;
  const status = node("p", state.passed ? "前回のコードで達成しました。" : "");
  status.setAttribute("role", "status");
  for (const name of step.files || Object.keys(files)) {
    const label = node("label", name);
    label.className = "code-field";
    const input = node("textarea");
    input.value = files[name] ?? "";
    input.spellcheck = false;
    input.dataset.sourceEditor = "";
    input.oninput = () => {
      stopRun();
      state.code = readEditors();
      state.file = name;
      state.passed = false;
      status.textContent = "";
      saveDom();
    };
    editors.push({ name, input });
    label.append(input);
    fields.append(label);
  }
  const editor = (editors.find(item => item.name === state.file) || editors[0]).input;
  const preview = node("div");
  const markup = node("details");
  markup.append(node("summary", "実習ページのHTML"), node("pre", step.html));
  markup.hidden = !step.html;
  const review = route("見本を読み直す", key + "/read");
  review.className = "review";
  const back = route("書きかけの課題へ戻る", key + "/practice");
  back.className = "review";
  model.append(back);
  function run(source, kind) {
    const isBuild = kind === "build";
    const result = isBuild ? builtStatus : status;
    const output = isBuild ? builtPreview : preview;
    const progressField = isBuild ? "built" : "passed";
    stopRun();
    output.replaceChildren();
    let code;
    try { code = workshop.prepare(source); }
    catch (error) { result.textContent = "コードの実行で止まりました。 " + error.message; return; }
    result.textContent = "実行しています。";
    const frame = workshop.frame("自分の実行結果", step.html, code, [], unit.setup);
    const test = workshop.frame("操作の確認", step.html, code, step.tests, unit.setup);
    const beforeTest = document.activeElement;
    if (unit.focusTests) {
      test.className = "dom-focus-check";
      test.tabIndex = -1;
      test.setAttribute("aria-hidden", "true");
    } else test.hidden = true;
    function receive(event) {
      if (event.source !== test.contentWindow || !event.data?.domWorkshop) return;
      const { error, done, hint } = event.data;
      state[progressField] = !error && done === step.tests.length;
      result.textContent = error ? "コードの実行で止まりました。 " + error :
        state[progressField] ? "できました。すべての動作を確認しました。" : done + " / " + step.tests.length + " 項目を確認。 " + hint;
      saveDom();
      stopRun();
    }
    addEventListener("message", receive);
    const timer = setTimeout(() => {
      result.textContent = "確認が時間内に終わりませんでした。繰り返しや待ち時間を見直してください。";
      stopRun();
    }, workshop.timeout || 6000);
    stopRun = () => { removeEventListener("message", receive); clearTimeout(timer); if (document.activeElement === test) beforeTest?.focus({preventScroll:true}); test.remove(); stopRun = () => {}; };
    output.append(frame, test);
  }
  build.append(button("組んだコードを確かめる", () => {
    if (!slots.every((choices, j) => choices.includes(pieces[j]))) {
      builtStatus.textContent = "各欄のコードを一つずつ選んでください。";
      return;
    }
    run(assemble(), "build");
  }), builtStatus, builtPreview);
  write.append(fields, button("実行して確かめる", () => run(readEditors(), "write")), status, preview);
  mode.value = state.mode || (matchMedia("(max-width: 720px)").matches ? "build" : "write");
  function showMode() {
    build.hidden = mode.value !== "build";
    write.hidden = mode.value !== "write";
  }
  mode.onchange = () => { state.mode = mode.value; saveDom(); showMode(); };
  showMode();
  exercise.append(node("p", step.task), markup, modeLabel, build, write, review);
  const links = node("div");
  links.className = "parts";
  links.append(route("単元の目次へ", id));
  if (index + 1 < unit.steps.length) links.append(route("次へ　" + unit.steps[index + 1].title, id + "/" + (index + 2)));
  else {
    const following = domUnits[domUnits.indexOf(unit) + 1];
    if (following) links.append(route("次の単元へ　" + following.title, following.id));
  }
  if (step.reflection) {
    const noteLabel = node("label", step.reflection);
    noteLabel.className = "code-field";
    const note = node("textarea");
    note.value = typeof state.note === "string" ? state.note : "";
    note.oninput = () => { state.note = note.value; saveDom(); };
    noteLabel.append(note);
    exercise.append(noteLabel);
  }
  domMain.append(model, phone, exercise, links);
  if (position === "read") model.focus();
  if (position === "practice") (mode.value === "write" ? editor : build.querySelector("input")).focus();
}
document.querySelector("#skip").onclick = event => { event.preventDefault(); domMain.focus(); };
window.addEventListener("hashchange", () => { domMain.focus(); renderDom(); });
renderDom();
