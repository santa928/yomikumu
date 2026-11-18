"use strict";

const $ = id => document.getElementById(id);
const courseNames = { python: "Python基礎", "python-practice": "Python実践", "python-oop": "Python OOP" };
let storageKey, courseId, state;
function family(id) {
  if (Number(id) >= 63) return "python-oop";
  if (Number(id) >= 59) return "python-practice";
  return "python";
}
function openCourse(id) {
  if (courseId === id) return;
  courseId = id;
  storageKey = "yomikumu-" + id + "-v1";
  state = { route: "", drafts: {}, completed: {}, quizzes: {} };
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (stored && typeof stored === "object") {
      if (typeof stored.route === "string") state.route = stored.route;
      for (const key of ["drafts", "completed", "quizzes"]) {
        if (stored[key] && typeof stored[key] === "object" && !Array.isArray(stored[key])) state[key] = stored[key];
      }
    }
  } catch { $("storage").textContent = "この環境では保存した学習を読み込めませんでした。"; }
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); }
  catch { $("storage").textContent = "この環境では保存できません。必要なコードをコピーして保管してください。"; }
}
function element(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}
function link(text, path) {
  const node = element("a", text);
  node.href = "#" + path;
  return node;
}
function button(text, action) {
  const node = element("button", text);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}
function splitInput(text) { return text === "" ? [] : text.replace(/\r\n?/g, "\n").split("\n"); }
let chapter, lesson, number, view, task, route, draft, mode, execution, reviewReturn, generation = 0;
function showToc() {
  const toc = $("contents");
  toc.replaceChildren();
  for (const unit of pythonChapters.filter(item => family(item.id) === courseId)) {
    toc.append(link(unit.title, unit.id + "/demo"));
    const list = document.createElement("ol");
    for (const [i, step] of unit.lessons.entries()) {
      const item = document.createElement("li");
      const path = unit.id + "/" + (i + 1);
      const done = ["code", "tap"].some(method => state.completed[path + "/write/" + method] === true);
      item.append(link(step.title + (done ? "（練習済み）" : ""), path + "/slide"));
      list.append(item);
    }
    toc.append(list);
  }
}
function stop() {
  generation++;
  execution?.stop();
  execution = null;
  $("waiting").hidden = true;
  $("stop").disabled = true;
  $("grade").disabled = $("run").disabled = false;
}
function routeToCourse() {
  const rawRoute = location.hash.slice(1);
  const found = pythonChapters.find(unit => unit.id === rawRoute.split("/")[0]);
  openCourse(found ? family(found.id) : "python");
  const requested = rawRoute || state.route || "54/demo";
  const parts = requested.split("/");
  chapter = pythonChapters.find(item => item.id === parts[0]) || pythonChapters[0];
  number = Number(parts[1]);
  lesson = chapter.lessons[number - 1];
  view = lesson && ["slide", "guide", "write"].includes(parts[2]) ? parts[2] : "demo";
  route = view === "demo" ? chapter.id + "/demo" : [chapter.id, number, view].join("/");
  if (location.hash.slice(1) !== route) history.replaceState(null, "", "#" + route);
  state.route = route;
  window.YomikumuPaths?.remember(courseId, route);
  save();
  stop();
  $("contents").parentElement.open = $("hint").open = false;
  $("status").textContent = $("output").textContent = "";
  $("checks").replaceChildren();
  const demo = view === "demo", slide = view === "slide";
  task = demo ? chapter.demo : lesson[view];
  draft = state.drafts[route] ||= {};
  mode = draft.mode || (matchMedia("(max-width: 640px)").matches ? "tap" : "code");
  $("course-name").textContent = courseNames[courseId];
  $("course-toc").textContent = courseNames[courseId] + "の目次";
  $("position").textContent = chapter.title + (demo ? "　完成例" : "　" + number + " / " + chapter.lessons.length);
  $("title").textContent = demo ? chapter.title : lesson.title;
  document.title = $("title").textContent + " | " + courseNames[courseId] + " | よみくむ";
  $("description").textContent = demo ? chapter.goal + " " + task.prompt : slide ? lesson.text : task.prompt;
  $("example").hidden = !slide;
  $("exercise").hidden = slide;
  $("console").hidden = slide;
  $("method").hidden = $("grade").hidden = $("hint").hidden = demo;
  if (slide) showSlide();
  else showExercise(demo);
  showSteps();
  showToc();
}
function showSlide() {
  $("example-code").textContent = lesson.code;
  renderFiles($("example-files"), lesson.files, false);
  $("sample-input").textContent = lesson.input === undefined ? "" : "この例の入力　" + lesson.input.split("\n").join(" → ");
  $("example-output").textContent = [lesson.output, lesson.error].filter(Boolean).join("\n") || "（表示なし）";
  const [question, choices, correct, reason] = lesson.quiz;
  $("quiz").querySelector("legend").textContent = question;
  function answer(index) {
    state.quizzes[route] = index;
    save();
    $("quiz-result").textContent = (index === correct ? "正解です。 " : "もう一度選べます。 ") + reason;
    for (const [i, node] of [...$("quiz").querySelectorAll("button")].entries()) node.setAttribute("aria-pressed", String(index === i));
  }
  $("quiz").querySelector("div").replaceChildren(...choices.map((text, i) => button(text, () => answer(i))));
  $("quiz-result").textContent = "";
  if (Number.isInteger(state.quizzes[route])) answer(state.quizzes[route]);
}
function renderFiles(place, files = {}, editable) {
  place.replaceChildren();
  for (const [name, content] of Object.entries(files)) {
    if (!editable) {
      const details = document.createElement("details");
      details.open = content.split("\n").length <= 10;
      details.append(element("summary", name + " のコード"), element("pre", content));
      place.append(details);
      continue;
    }
    const label = element("label", name + " のコード");
    const area = document.createElement("textarea");
    area.rows = 4;
    area.spellcheck = false;
    area.value = draft.files?.[name] ?? content;
    label.append(area);
    area.addEventListener("input", () => { (draft.files ||= {})[name] = area.value; save(); });
    place.append(label);
  }
}
function showExercise(demo) {
  $("task-heading").textContent = demo ? "完成例を動かす" : view === "guide" ? "見本を一か所変える" : "自分で解く";
  $("input-note").textContent = chapter.engine === "cpython" ? "この章は端末内のCPythonで実行します。入力は実行前に一行ずつ用意してください。最初の実行時にこの章用の実行ファイルを読み込みます。" : "足りない行は実行中に入力できます。空の行を渡すときは、入力待ちで何も書かずに「一行を渡す」を押します。";
  $("input").value = draft.input ?? (demo ? task.input : task.cases[0].input) ?? "";
  $("source").labels[0].textContent = (task.targetFile || "main.py") + " のコード";
  const companion = task.targetFile ? { "main.py": task.main } : task.files;
  renderFiles($("task-files"), companion, !demo && mode === "code" && task.editFiles);
  const supplied = !demo && task.cases[0].before;
  $("provided").hidden = !supplied;
  $("provided").textContent = supplied ? "練習実行の前に用意されるコード\n" + supplied : "";
  $("source").readOnly = demo || mode === "tap";
  $("builder").hidden = demo || mode !== "tap";
  $("keyboard").setAttribute("aria-pressed", String(mode === "code"));
  $("tap").setAttribute("aria-pressed", String(mode === "tap"));
  if (demo) { $("source").value = task.code; return; }
  $("hint").querySelector("p").textContent = task.hint;
  $("source").value = mode === "code" ? draft.code ?? task.starter : (draft.tap || []).join("\n");
  $("undo-line").disabled = !draft.tap?.length;
  if (mode === "tap") {
    const wrong = task.distractors || [lesson.code.split("\n")[0], 'print("受付")'];
    const lines = [...new Set([...task.solution.split("\n"), ...wrong].filter(Boolean))].sort();
    $("pieces").replaceChildren(...lines.map(line => button(line, () => {
      (draft.tap ||= []).push(line);
      save(); showExercise(false);
      [...$("pieces").children].find(node => node.textContent === line)?.focus();
    })));
  }
}
function showSteps() {
  const nav = $("steps");
  nav.replaceChildren();
  const path = chapter.id + "/" + number + "/";
  let next;
  if (view === "demo") next = link("最初のスライドを読む", chapter.id + "/1/slide");
  else if (view === "slide") {
    const back = reviewReturn || history.state?.reviewReturn;
    if (back === path + "guide" || back === path + "write") {
      history.replaceState({ reviewReturn: back }, "", location.href);
      nav.append(link("書き途中の課題に戻る", back));
    }
    next = link("見本を変えてみる", path + "guide");
  }
  else {
    reviewReturn = null;
    const review = link("関連スライドを読み直す", path + "slide");
    review.onclick = () => { reviewReturn = route; };
    nav.append(review);
    if (view === "guide") next = link("自分で解く課題へ", path + "write");
    else if (number < chapter.lessons.length) next = link("次のスライドへ", chapter.id + "/" + (number + 1) + "/slide");
    else {
      const nextChapter = pythonChapters[pythonChapters.indexOf(chapter) + 1];
      if (nextChapter && family(nextChapter.id) === courseId) next = link("次の章「" + nextChapter.title + "」へ", nextChapter.id + "/demo");
      else { next = element("a", "学習パス一覧へ戻る"); next.href = "../index.html#paths"; }
    }
  }
  next.className = "next";
  nav.append(next);
  if (view !== "demo") nav.append(link("完成例を試す", chapter.id + "/demo"));
}
function switchMode(next) {
  stop(); mode = draft.mode = next;
  $("status").textContent = ""; $("checks").replaceChildren(); $("output").textContent = "";
  save(); showExercise(false);
}
$("keyboard").onclick = () => switchMode("code");
$("tap").onclick = () => switchMode("tap");
$("undo-line").onclick = () => { draft.tap.pop(); save(); showExercise(false); };
$("source").oninput = () => { draft.code = $("source").value; save(); };
$("input").oninput = () => { draft.input = $("input").value; save(); };
$("skip").onclick = event => { event.preventDefault(); $("content").focus(); };
$("stop").onclick = () => { stop(); $("status").textContent = "停止しました。書いたコードから再実行できます。"; $("run").focus(); };
$("waiting").onsubmit = event => {
  event.preventDefault();
  execution?.send($("line").value);
  $("line").value = ""; $("waiting").hidden = true; $("stop").focus();
};
async function execute(grade) {
  stop();
  const token = generation;
  const edit = $("source").value;
  let source = task.targetFile ? task.main : edit;
  if (grade && task.after) source += "\n" + task.after;
  const demo = view === "demo";
  const files = { ...task.files, ...(!demo && mode === "code" ? draft.files : {}), ...(!demo && mode === "tap" ? task.tapFiles : {}) };
  if (task.targetFile) files[task.targetFile] = (task.filePrefix || "") + edit;
  const cases = grade ? task.cases : [{ before: !demo && task.cases[0].before, input: $("input").value }];
  $("checks").replaceChildren();
  $("output").textContent = "";
  $("stop").disabled = false;
  $("grade").disabled = $("run").disabled = true;
  let matches = 0;
  for (const test of cases) {
    $("status").textContent = grade ? "採点中　" + test.label : "実行中…";
    execution = runPython({ engine: chapter.engine, source, files, before: test.before || "", observe: test.observe, afterError: test.afterError, lines: splitInput(test.input ?? ""), interactive: !grade }, output => {
      $("output").textContent = output;
      $("status").textContent = "入力を待っています。";
      $("waiting").hidden = false; $("line").value = ""; $("line").focus();
    });
    const result = await execution.result;
    if (token !== generation) return;
    $("output").textContent = result.output || "（表示なし）";
    if (!grade) {
      $("status").textContent = result.error ? "エラー　" + result.error + "　コードや入力を直して再実行できます。" : "実行できました。";
      break;
    }
    if (!passed(result, test)) {
      $("checks").append(element("p", test.label + "　" + (result.error || "期待する表示　" + (test.want || "（表示なし）"))));
      if (!result.error && test.observe) {
        $("checks").append(element("p", "確認した値　" + JSON.stringify(result.value) + "　期待する値　" + JSON.stringify(test.value)));
      }
      const partial = result.output && test.want.startsWith(result.output);
      $("status").textContent = (matches || partial ? "途中までできました。 " : "もう一度試せます。 ") + (test.hint || task.hint);
      break;
    }
    matches++;
    $("checks").append(element("p", "✓ " + test.label + (test.observe ? "　確認した値 " + JSON.stringify(result.value) : "")));
  }
  if (grade && matches === cases.length) {
    state.completed[route + "/" + mode] = true;
    save(); showToc();
    $("status").textContent = "できました。すべての条件で確認できました。";
  }
  $("waiting").hidden = true;
  $("stop").disabled = true; $("grade").disabled = $("run").disabled = false;
  execution = null;
}
$("run").onclick = () => execute(false);
$("grade").onclick = () => execute(true);
addEventListener("hashchange", () => { routeToCourse(); $("title").focus(); });
routeToCourse();
