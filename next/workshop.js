"use strict";

const screen = document.querySelector("main");
const storeKey = "yomikumu/next/v1";
let state = { version: 1, last: "", units: {} };
try {
  const saved = JSON.parse(localStorage.getItem(storeKey));
  if (saved?.version === 1 && saved.units && typeof saved.units === "object") state = saved;
} catch { /* 端末に保存できない場合も、開いている間は学べる。 */ }

function save() {
  try { localStorage.setItem(storeKey, JSON.stringify(state)); }
  catch { document.getElementById("storage-note").textContent = "この端末に保存できません。コードはPC用のZIPにも保存できます。"; }
}
function el(tag, text, cls) {
  const item = document.createElement(tag);
  if (text !== undefined) item.textContent = text;
  if (cls) item.className = cls;
  return item;
}
function jump(label, address, cls) {
  const item = el("a", label, cls);
  item.href = "#" + address;
  return item;
}
function command(label, action) {
  const item = el("button", label);
  item.type = "button";
  item.onclick = action;
  return item;
}
function note() {
  const item = el("p");
  item.setAttribute("role", "status");
  return item;
}
function reveal(label, ...items) {
  const group = el("details");
  group.append(el("summary", label), ...items);
  return group;
}
function title(kicker, name, body) {
  const heading = el("h1", name);
  heading.tabIndex = -1;
  screen.append(el("p", kicker, "kind"), heading, el("p", body));
  document.title = name + "｜よみくむ";
}
function remember(route) {
  state.last = route;
  save();
  window.YomikumuPaths?.remember("next", route);
}

let kitReady;
async function loadKit() {
  if (!kitReady) {
    kitReady = Promise.all(["vendor/fflate.js", "kit-data.js"].map(src => new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => { script.remove(); reject(Error("教材のファイルを開けません。もう一度保存してください。")); };
      document.head.append(script);
    }))).catch(error => { kitReady = null; throw error; });
  }
  await kitReady;
}
async function downloadKit() {
  await loadKit();
  const original = Uint8Array.from(atob(window.nextStarter), value => value.charCodeAt(0));
  const files = fflate.unzipSync(original);
  for (const lesson of nextLessons) {
    const code = state.units[lesson.id]?.code;
    if (typeof code === "string") files[lesson.file] = fflate.strToU8(code);
  }
  const data = fflate.zipSync(files, { level: 6 });
  const url = URL.createObjectURL(new Blob([data], { type: "application/zip" }));
  const anchor = el("a");
  anchor.href = url; anchor.download = "yomikumu-reading-room.zip"; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}
function pcSetup(lesson, message) {
  const instructions = el("ol");
  const steps = [
    ["ZIPをPCに保存して展開します。compose.yaml と同じ場所でターミナルを開きます。"],
    ...(lesson.pcCreate ? [["展開先に " + lesson.file + " がなければ、[id] フォルダーとその中の page.jsx を作り、記述欄のコードをコピーします。"]] : []),
    ["Dockerが起動しているPCで次を実行します。初回は依存の取得に通信を使います。", "docker compose up --build -d web"],
    [lesson.pcPath
      ? "ブラウザで http://localhost:3090" + lesson.pcPath + " を開きます。ソースの変更は自動で反映されます。"
      : "ブラウザで http://localhost:3090 を開き、図書室の一覧か「実習の入口」から、この章の見本を開きます。ソースの変更は自動で反映されます。"],
    ["手元のサーバーの実際の応答を採点するには次を実行します。", "docker compose run --build --rm check " + lesson.id],
    ["終えたらサーバーを停止します。", "docker compose stop web"],
  ];
  for (const [body, code] of steps) {
    const row = el("li", body);
    if (code) row.append(el("pre", code));
    instructions.append(row);
  }
  const recover = reveal("ページが開かないとき", el("p", "Dockerを起動し、展開したフォルダーで docker compose ps を実行します。web が動作中なら、下のログで起動の完了とエラー行を確かめて再読み込みします。"), el("pre", "docker compose logs --tail 30 web"),
    el("p", "3090番をすでに使っていると表示されたら、compose.yaml の 3090 を 3091 に変え、もう一度起動して localhost:3091 を開きます。"));
  return reveal("PCで起動して採点する手順", command("今のコードをZIPで保存", async () => {
    try { await downloadKit(); message.textContent = "教材と自分の下書きをZIPに保存しました。"; }
    catch (e) { message.textContent = e.message; }
  }), instructions, recover);
}

function catalog() {
  title("Web制作の選択コース", "Next.jsの目次", "本の紹介サイトを題材に、URLとページをつなぎ、サーバーでデータを読み取ったり、入力を受け付けたりします。スマホでは表示例を読んでコードを組み立てます。PC では Docker で Next.js を起動して自分のコードを試せます。");
  if (state.last) screen.append(jump("前回の続きへ", state.last, "next"));
  const chapters = el("ol", undefined, "catalog");
  for (const chapter of nextChapters) {
    const row = el("li");
    const heading = el("h2");
    heading.append(jump(chapter.title, chapter.id));
    row.append(heading, el("p", chapter.goal), lessonList(chapter));
    chapters.append(row);
  }
  screen.append(chapters);
}
function lessonList(chapter) {
  const list = el("ol", undefined, "chapter-lessons");
  for (const item of nextLessons.filter(lesson => lesson.chapter === chapter.id)) {
    const row = el("li");
    const record = state.units[item.id] || {};
    row.append(jump(item.title, item.id + "/slide/1"));
    const marks = [record.quizDone && "表示予測", record.tapDone && "組み立て", record.writeDone && "PCで実行"].filter(Boolean);
    if (marks.length) row.append(el("small", marks.join(" ・ ")));
    list.append(row);
  }
  return list;
}
function chapterPage(chapter) {
  title("章の目次", chapter.title, chapter.goal);
  const sample = el("div", undefined, "code-result");
  const output = el("pre");
  output.setAttribute("aria-live", "polite");
  const actions = el("div", undefined, "parts");
  for (const [label, value] of chapter.examples) {
    const option = command(label, () => {
      for (const item of actions.children) item.setAttribute("aria-pressed", String(item === option));
      output.textContent = value;
    });
    actions.append(option);
  }
  actions.firstElementChild.click();
  sample.append(el("h2", "完成例を見比べる"), el("p", "URL や操作を選ぶと、そのときの表示例を確認できます。PCでは手元のサーバーで同じ操作を試せます。"), actions, output);
  screen.append(el("h2", "この章の課題"), lessonList(chapter), sample);
}
function slide(lesson, index, from) {
  const [heading, body, source, result] = lesson.slides[index];
  title(lesson.title + "　" + (index + 1) + " / " + lesson.slides.length, heading, body);
  screen.append(el("pre", source), el("p", result));
  if (index > 0) screen.append(jump("前のスライドへ", lesson.id + "/slide/" + index + (from ? "/" + from : ""), "review"));
  if (from === "write" || from === "tap") screen.append(jump("解きかけの課題へ戻る", lesson.id + "/" + from, "return"));
  screen.append(index + 1 < lesson.slides.length
    ? jump("次のスライドへ", lesson.id + "/slide/" + (index + 2) + (from ? "/" + from : ""), "next")
    : jump("四択で確かめる", lesson.id + "/quiz", "next"));
}
function choose(legend, options, selected, change) {
  const box = el("fieldset");
  box.append(el("legend", legend));
  options.forEach((option, index) => {
    const label = el("label");
    const input = el("input");
    input.type = "radio"; input.name = legend; input.checked = selected === index;
    input.addEventListener("change", () => change(index));
    label.append(input, document.createTextNode(option)); box.append(label);
  });
  return box;
}
function quiz(lesson, rec) {
  const [question, options, correct, reason] = lesson.quiz;
  title(lesson.title, "表示を予測する", question);
  const feedback = note();
  screen.append(choose("答えを一つ選ぶ", options, rec.choice, index => { rec.choice = index; save(); feedback.textContent = ""; }),
    command("答えを確かめる", () => {
      if (rec.choice === undefined) { feedback.textContent = "答えを一つ選んでください。"; return; }
      const ok = rec.choice === correct;
      if (ok) rec.quizDone = true;
      feedback.textContent = (ok ? "正解です。 " : "もう一度。 ") + reason;
      save();
    }), feedback, jump("コードを練習する", lesson.id + (matchMedia("(max-width: 720px)").matches ? "/tap" : "/write"), "next"));
}
function build(lesson, rec) {
  title(lesson.title, "タップで組み立てる", lesson.task);
  const [template, slots] = lesson.build;
  const pieces = rec.pieces ||= slots.map(() => null);
  const source = el("pre");
  const feedback = note();
  function refresh() { source.textContent = template.replace(/[①②]/g, mark => pieces[mark === "①" ? 0 : 1] ?? mark); }
  refresh(); screen.append(source);
  slots.forEach(([label, ...options], i) => {
    screen.append(choose(label, options, options.indexOf(pieces[i]), index => { pieces[i] = options[index]; save(); feedback.textContent = ""; refresh(); }));
  });
  screen.append(command("組み立てを確かめる", () => {
    const gap = lesson.right.findIndex((value, index) => pieces[index] !== value);
    if (gap < 0) { rec.tapDone = true; save(); feedback.textContent = "できました。 " + lesson.quiz[3]; }
    else feedback.textContent = (gap ? "最初の指定は合っています。 " : "") + slots[gap][0] + "の欄を見直しましょう。 " + lesson.hint;
  }), feedback, jump("見本を読み直す", lesson.id + "/slide/1/tap", "review"), jump("PCでコードを書く", lesson.id + "/write", "next"));
}
function write(lesson, rec) {
  title(lesson.title, "自分のコードをPCで確かめる", lesson.task);
  const label = el("label", lesson.file, "code-field");
  const area = el("textarea");
  area.value = rec.code ?? lesson.source; area.spellcheck = false; label.append(area);
  const feedback = note();
  const result = note();
  area.oninput = () => { rec.code = area.value; save(); feedback.textContent = ""; };
  const setup = pcSetup(lesson, feedback);
  setup.open = true;
  const upload = el("label", "手元の採点結果を読み込む ");
  const file = el("input"); file.type = "file"; file.accept = ".json,application/json"; upload.append(file);
  file.onchange = async () => {
    const selected = file.files[0];
    if (!selected) return;
    try {
      const report = JSON.parse(await selected.text());
      if (report.version !== 1 || report.course !== "yomikumu-next" || report.step !== lesson.id ||
          !Array.isArray(report.results) || !report.results.length || !report.results.every(row => typeof row.label === "string" && typeof row.passed === "boolean")) throw Error();
      const normal = source => source.replace(/\r\n/g, "\n").replace(/\n$/, "");
      if (normal(report.source) !== normal(area.value)) { result.textContent = "手元で採点したコードと記述欄が違います。採点したファイルの内容を記述欄に貼り、もう一度この結果を選んでください。"; return; }
      for (const id of lesson.companionIds || []) {
        const other = nextLessons.find(item => item.id === id);
        const saved = report.companionSources?.[other.file];
        if (typeof saved !== "string" || normal(saved) !== normal(state.units[id]?.code ?? other.source)) {
          result.textContent = other.file + " の下書きも採点した内容とそろえ、同じZIPで再採点してください。";
          return;
        }
      }
      const issue = report.results.find(row => !row.passed);
      if (!issue && report.passed === true) { rec.writeDone = true; save(); result.textContent = "できました。手元のサーバーで動作を確認しました。"; }
      else result.textContent = (report.results[0].passed ? "途中までできました。 " : "") + "次に確かめること　" + (issue?.label || lesson.hint);
    } catch { result.textContent = "この課題の reports/" + lesson.id + ".json を選んでください。"; }
    finally { file.value = ""; }
  };
  screen.append(label, setup, feedback, upload, result, reveal("ヒント", el("p", lesson.hint)), reveal("書き方の一例", el("pre", lesson.answer)),
    jump("見本を読み直す", lesson.id + "/slide/1/write", "review"), jump("タップで組む", lesson.id + "/tap", "review"));
}
function render() {
  screen.replaceChildren();
  const [id, view, n, from] = location.hash.slice(1).split("/");
  const chapter = nextChapters.find(item => item.id === id);
  const lesson = nextLessons.find(item => item.id === id);
  if (chapter) { remember(id); chapterPage(chapter); return; }
  if (!lesson) { catalog(); return; }
  const modes = ["quiz", "tap", "write"];
  const part = modes.includes(view) ? view : "slide";
  const requested = Number(n);
  const index = Number.isInteger(requested) && requested >= 1 && requested <= lesson.slides.length ? requested - 1 : 0;
  remember(lesson.id + "/" + part + (part === "slide" ? "/" + (index + 1) + (["tap","write"].includes(from) ? "/" + from : "") : ""));
  const rec = state.units[id] ||= {};
  if (part === "slide") slide(lesson, index, from);
  if (part === "quiz") quiz(lesson, rec);
  if (part === "tap") build(lesson, rec);
  if (part === "write") write(lesson, rec);
  const nav = el("div", undefined, "parts");
  nav.setAttribute("role", "navigation");
  nav.setAttribute("aria-label", "この課題の移動");
  nav.append(jump("この章の目次", lesson.chapter), jump("見本", id + "/slide/1"), jump("四択", id + "/quiz"), jump("タップで組む", id + "/tap"), jump("PC記述", id + "/write"));
  const next = nextLessons[nextLessons.indexOf(lesson) + 1];
  if (next) nav.append(jump("次へ　" + next.title, next.id + "/slide/1"));
  screen.append(nav);
}
document.getElementById("skip").onclick = event => { event.preventDefault(); screen.focus(); };
window.addEventListener("hashchange", () => { render(); screen.querySelector("h1").focus(); });
render();
