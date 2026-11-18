"use strict";
const domUnits = [elementsUnit];
const domMain = document.querySelector("main");
const domStateKey = "yomikumu/dom/v1";
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
  const [id, part] = location.hash.slice(1).split("/");
  const unit = domUnits.find(u => u.id === id);
  domMain.replaceChildren();
  for (const a of nav.children) {
    if (unit && a.hash === "#" + id) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  if (!unit) {
    domMain.append(node("h1", "ブラウザで動かすJavaScript"));
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
  window.YomikumuPaths?.remember("dom", key);
  saveDom();
  document.title = (step?.title || unit.title) + "｜よみくむ";
  const chapter = node("p", step ? unit.title : "ブラウザでの実習");
  chapter.className = "kind";
  domMain.append(chapter, node("h1", step?.title || unit.title));
  if (!step) {
    domMain.append(node("p", unit.intro));
    const demo = section("完成例を試す");
    demo.append(node("p", unit.demo.tip), domFrame("操作できる完成例", unit.demo.html, unit.demo.code, [], unit.setup));
    const list = node("ol");
    list.className = "catalog";
    for (const [i, s] of unit.steps.entries()) {
      const li = node("li");
      const progress = domState.tasks[id + "/" + (i + 1)] || {};
      li.append(route(s.title, id + "/" + (i + 1)));
      if (progress.tap || progress.passed) li.append(node("small", [progress.tap && "タップ正解", progress.passed && "コード達成"].filter(Boolean).join("・")));
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
  const sample = domFrame("見本の実行結果", step.exampleHtml || step.html, step.example, [], unit.setup);
  model.append(sample);
  if (step.compare) {
    const stage = node("div");
    model.append(button(step.compare.label, () => {
      stage.replaceChildren(node("pre", step.compare.code), domFrame("変更後の実行結果", step.html, step.compare.code, [], unit.setup));
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
  const write = section("コードで試す");
  const label = node("label", "JavaScript");
  label.className = "code-field";
  const editor = node("textarea");
  editor.value = typeof state.code === "string" ? state.code : step.starter ?? step.example;
  editor.spellcheck = false;
  const status = node("p", state.passed ? "前回のコードで達成しました。" : "");
  status.setAttribute("role", "status");
  editor.addEventListener("input", () => {
    stopRun();
    state.code = editor.value;
    state.passed = false;
    status.textContent = "";
    saveDom();
  });
  label.append(editor);
  const preview = node("div");
  const markup = node("details");
  markup.append(node("summary", "実習ページのHTML"), node("pre", step.html));
  const review = button("見本を読み直す", () => {
    back.hidden = false;
    model.focus();
    model.scrollIntoView();
  });
  const back = button("書きかけのコードへ戻る", () => editor.focus());
  back.hidden = true;
  model.append(back);
  function run() {
    stopRun();
    preview.replaceChildren();
    status.textContent = "実行しています。";
    const frame = domFrame("自分の実行結果", step.html, editor.value, [], unit.setup);
    const test = domFrame("操作の確認", step.html, editor.value, step.tests, unit.setup);
    test.hidden = true;
    function receive(event) {
      if (event.source !== test.contentWindow || !event.data?.domWorkshop) return;
      const { error, done, hint } = event.data;
      state.passed = !error && done === step.tests.length;
      status.textContent = error ? "コードの実行で止まりました。 " + error :
        state.passed ? "できました。すべての動作を確認しました。" : done + " / " + step.tests.length + " 項目を確認。 " + hint;
      saveDom();
      stopRun();
    }
    addEventListener("message", receive);
    const timer = setTimeout(() => {
      status.textContent = "確認が時間内に終わりませんでした。繰り返しや待ち時間を見直してください。";
      stopRun();
    }, 6000);
    stopRun = () => { removeEventListener("message", receive); clearTimeout(timer); test.remove(); stopRun = () => {}; };
    preview.append(frame, test);
  }
  write.append(node("p", step.task), markup, label, button("実行して確かめる", run), status, review, preview);
  const links = node("div");
  links.className = "parts";
  links.append(route("単元の目次へ", id));
  if (index + 1 < unit.steps.length) links.append(route("次へ　" + unit.steps[index + 1].title, id + "/" + (index + 2)));
  else {
    const following = domUnits[domUnits.indexOf(unit) + 1];
    if (following) links.append(route("次の単元へ　" + following.title, following.id));
  }
  domMain.append(model, phone, write, links);
}
document.querySelector("#skip").onclick = event => { event.preventDefault(); domMain.focus(); };
window.addEventListener("hashchange", () => { renderDom(); domMain.focus(); });
renderDom();
