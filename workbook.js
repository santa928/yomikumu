"use strict";

const content = document.getElementById("content");
const nav = document.getElementById("course-nav");
let revisit = null;
let pendingPreview;
let currentRoute = "";
const narrowScreen = window.matchMedia("(max-width: 720px)");

function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}

function link(text, route, className) {
  const a = node("a", text, className);
  a.href = "#" + route;
  return a;
}

function button(text, action) {
  const el = node("button", text);
  el.type = "button";
  el.addEventListener("click", action);
  return el;
}

function heading(kicker, title, intro) {
  const h = node("h1", title);
  h.tabIndex = -1;
  content.append(node("p", kicker, "kind"), h, node("p", intro));
  document.title = title + "｜よみくむ";
}

function details(label, child) {
  const el = node("details");
  el.append(node("summary", label), child);
  return el;
}

function fields(html, css, cssLabel = "CSS") {
  const box = node("div", undefined, "sources");
  for (const [label, code] of [
    ["HTML", html],
    [cssLabel, css],
  ]) {
    if (code) box.append(node("strong", label), node("pre", code));
  }
  return box;
}

function unitRoute(id, part = 1) {
  return id + "/" + part;
}

function navFor(active) {
  const group = node("details", undefined, "chapter-menu");
  group.open = window.matchMedia("(min-width: 721px)").matches;
  group.append(node("summary", "すべての単元"));
  nav.replaceChildren(link("コース目次", "home", "nav-home"), group);
  for (const [id, title] of [...lessons.map((l) => [l.id, l.title]), ["studio", "卒業制作"]]) {
    const a = link(title, id === "studio" ? id : unitRoute(id));
    if (id === active) a.setAttribute("aria-current", "page");
    group.append(a);
  }
}

function statusMessage() {
  const p = node("p");
  p.setAttribute("role", "status");
  return p;
}

function transfer() {
  const controls = node("div", undefined, "transfer");
  const status = statusMessage();
  const exportButton = button("進捗を書き出す", () => {
    downloadFile(
      "yomikumu-progress.json",
      JSON.stringify(readProgress(), null, 2),
      "application/json",
    );
    status.textContent = "進捗と下書きをファイルに書き出しました。";
  });
  const label = node("label", "別の端末の進捗を読み込む");
  const input = node("input");
  input.type = "file";
  input.accept = ".json,application/json";
  label.append(input);
  const confirm = node("div");
  input.addEventListener("change", async () => {
    confirm.replaceChildren();
    status.textContent = "";
    const file = input.files[0];
    if (!file) return;
    try {
      const incoming = validatedProgress(JSON.parse(await file.text()));
      const count = Object.keys(incoming.units).length;
      status.textContent =
        count +
        "件の記録があります。読み込むと、この端末の同じ単元はファイルの記録に置き換わります。";
      confirm.append(
        button("この記録を読み込む", () => {
          const local = readProgress();
          writeProgress({
            ...local,
            last: incoming.last || local.last,
            units: { ...local.units, ...incoming.units },
          });
          render();
          const result = document.getElementById("transfer-status");
          result.closest("details").open = true;
          result.tabIndex = -1;
          result.textContent = "読み込みました。目次に進捗を反映しました。";
          result.focus();
        }),
      );
    } catch {
      status.textContent =
        "読み込めませんでした。よみくむから書き出した進捗ファイルを選んでください。";
    }
  });
  status.id = "transfer-status";
  controls.append(exportButton, label, status, confirm);
  return details("進捗と下書きの引き継ぎ", controls);
}

function home() {
  heading(
    "HTML / CSS 入門",
    "好きな作品を紹介するページを作ろう",
    "作品名をひとつ書くところから始めます。最後は自分の作品を並べ、完成したページを持ち出せます。",
  );
  const state = readProgress();
  const resume = state.last && state.last !== "home";
  content.append(
    link(
      resume ? "前回の続きへ →" : "最初のスライドへ →",
      resume ? state.last : unitRoute(lessons[0].id),
      "next",
    ),
  );
  const list = node("ol", undefined, "catalog");
  for (const lesson of lessons) {
    const item = node("li");
    const record = state.units[lesson.id] || {};
    item.append(link(lesson.title, unitRoute(lesson.id)), node("p", lesson.goal));
    if (record.quizDone || record.buildDone || record.writeDone) {
      item.append(
        node(
          "small",
          [record.quizDone && "四択をクリア", record.buildDone && "組み立てをクリア", record.writeDone && "記述をクリア"]
            .filter(Boolean)
            .join(" ・ "),
        ),
      );
    }
    list.append(item);
  }
  const last = node("li");
  last.append(
    link("卒業制作　わたしの作品展", "studio"),
    node("p", "2作品を紹介するページを自力で作り、HTMLとして書き出します。"),
  );
  if (state.units.studio?.writeDone) last.append(node("small", "卒業制作をクリア"));
  list.append(last);
  content.append(list, transfer());
}

function sectionTabs(lesson, part) {
  const links = node("div", undefined, "parts");
  links.setAttribute("aria-label", "この単元の教材");
  for (const [id, label] of [
    ...lesson.slides.map((slide, index) => [String(index + 1), slide.title]),
    ["quiz", "四択"],
    ["write", "コード練習"],
  ]) {
    const a = link(label, unitRoute(lesson.id, id));
    if (id === part) a.setAttribute("aria-current", "step");
    links.append(a);
  }
  content.append(links);
}

function slidePage(lesson, position) {
  const slide = lesson.slides[position];
  heading(
    lesson.topic + "　スライド " + (position + 1) + " / " + lesson.slides.length,
    slide.title,
    slide.body,
  );
  const examples = node("div", undefined, "slide-examples");
  content.append(examples);
  if (slide.before) makePreview(examples, slide.html, slide.before, "変更前", undefined, undefined, false, slide.measure);
  for (const width of slide.widths || [undefined]) {
    const ready = makePreview(
      examples,
      slide.html,
      slide.css || "",
      width ? "幅" + width + "px" : slide.before ? "変更後" : "ブラウザでの表示",
      width,
      slide.previewHeight,
      slide.showTitle,
      slide.measure,
    );
    if (slide.nextWork) {
      ready.then((doc) => {
        if (!examples.isConnected) return;
        const name = doc.querySelector("h1");
        const first = name.textContent;
        const toggle = button("次の作品を表示", () => {
          const next = name.textContent === first;
          name.textContent = next ? slide.nextWork : first;
          toggle.textContent = next ? "最初の作品に戻す" : "次の作品を表示";
        });
        examples.append(toggle);
      });
    }
  }
  if (slide.before) content.append(details("変更前のコード", fields(slide.html, slide.before)));
  let source = slide.sheetCode ? fields(slide.html, inkCss, "ink.css") : fields(slide.html, slide.css);
  if (slide.tryCss) {
    let changed = false;
    const toggle = button(slide.tryCss.label, () => {
      changed = !changed;
      const css = changed ? slide.tryCss.css : slide.css;
      const nextSource = fields(slide.html, css);
      source.replaceWith(nextSource);
      source = nextSource;
      examples.replaceChildren();
      makePreview(examples, slide.html, css, "ブラウザでの表示");
      toggle.textContent = changed ? "元の指定に戻す" : slide.tryCss.label;
    });
    content.append(toggle);
  }
  content.append(slide.previewHeight ? details("見本のHTMLを読む", source) : source);
  if (revisit && revisit.lesson === lesson.id)
    content.append(link("解きかけの問題へ戻る →", revisit.route, "return"));
  if (revisit?.lesson === "studio") content.append(link("卒業制作に戻る →", revisit.route, "return"));
  const next = position + 1 < lesson.slides.length ? position + 2 : "quiz";
  content.append(
    link(
      next === "quiz" ? "四択で確かめる →" : "次のスライドへ →",
      unitRoute(lesson.id, next),
      "next",
    ),
  );
}

function reviewLink(lesson) {
  const origin = currentRoute.split("/")[1];
  return link(
    "この問題のスライドを見直す",
    unitRoute(lesson.id, lesson.exercise.review + 1) + "/" + origin,
    "review",
  );
}

function quizPage(lesson) {
  const q = lesson.quiz;
  const state = readProgress().units[lesson.id] || {};
  heading(lesson.title, "コードを読んで選ぶ", "一つ選んで、理由を確かめましょう。");
  const form = node("form");
  const fs = node("fieldset");
  fs.append(node("legend", q.prompt));
  const message = statusMessage();
  q.options.forEach((option, index) => {
    const label = node("label");
    const input = node("input");
    input.type = "radio";
    input.name = "choice";
    input.value = index;
    input.required = true;
    input.checked = state.choice === index;
    input.addEventListener("change", () => {
      updateUnit(lesson.id, { choice: index, quizChecked: false });
      message.textContent = "";
    });
    label.append(input, option);
    fs.append(label);
  });
  function feedback(index) {
    return (index === q.correct ? "正解です。 " : "") + q.reasons[index];
  }
  if (state.quizChecked && Number.isInteger(state.choice))
    message.textContent = feedback(state.choice);
  form.append(fs, node("button", "答えを確かめる"));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const index = Number(new FormData(form).get("choice"));
    updateUnit(lesson.id, {
      choice: index,
      quizChecked: true,
      ...(index === q.correct ? { quizDone: true } : {}),
    });
    message.textContent = feedback(index);
  });
  content.append(
    form,
    message,
    reviewLink(lesson),
    link(narrowScreen.matches ? "タップでコードを組む →" : "自分で書く →",
      unitRoute(lesson.id, narrowScreen.matches ? "build" : "type"), "next"),
  );
}

function editor(label, value, onInput) {
  const area = node("textarea");
  area.value = value;
  area.spellcheck = false;
  area.autocapitalize = "off";
  area.addEventListener("input", () => onInput(area.value));
  const wrapper = node("label", label, "code-field");
  wrapper.append(area);
  return wrapper;
}

function nextLessonLink(id) {
  const next = lessons[lessons.findIndex((l) => l.id === id) + 1];
  return next
    ? link("次へ　" + next.title + " →", unitRoute(next.id), "next")
    : link("卒業制作へ →", "studio", "next");
}

const projectExample = {
  html: '<h1>小さな道具の展示室</h1>\n<main class="shelf">\n  <article>\n    <h2>風の定規</h2>\n    <p>葉の動きを記録した道具。</p>\n    <a href="#notes">作者メモ</a>\n  </article>\n  <article>\n    <h2>朝の活字</h2>\n    <p>木にひと文字ずつ彫りました。</p>\n    <a href="#notes">作者メモ</a>\n  </article>\n</main>\n<h2 id="notes">作者メモ</h2>\n<p>散歩で見つけた形から作りました。</p>',
  css: "body { color: #284537; }\narticle { border: 1px solid; padding: 12px; }\n.shelf { display: grid; gap: 12px; }\n@media (min-width: 600px) {\n  .shelf { grid-template-columns: 1fr 1fr; }\n}",
};

function practicePreview(host, id, exercise, html, css) {
  host.replaceChildren();
  const cssText = exercise.field === "declaration"
    ? ".label { display:inline-block; border:1px solid; " + css + " }"
    : css;
  const widths = id === "studio" || id === "responsive" ? [360, 720] : [undefined];
  return Promise.all(widths.map((width) =>
    makePreview(host, html, cssText, width ? width + "pxで表示" : "あなたの表示結果", width, undefined, exercise.showTitle, exercise.measure),
  ));
}

function buildPage(lesson) {
  const { id, exercise: ex } = lesson;
  const { code, slots } = ex.build;
  const record = readProgress().units[id] || {};
  const pieces = record.pieces ? [...record.pieces] : slots.map(() => "");
  const marks = ["①", "②"];
  const snippet = node("pre");
  const feedback = statusMessage();
  const preview = node("div", undefined, "slide-examples");
  const form = node("form", undefined, "build-form");
  let revision = 0;
  function assembled() {
    return code.replace(/[①②]/g, (mark) => pieces[marks.indexOf(mark)] || mark);
  }
  heading(lesson.title, "タップでコードを組む", ex.task);
  const blanks = marks.slice(0, slots.length).join("と");
  content.append(node("p", blanks + "に入れるコードを選んでください。選び直すと、その部分が入れ替わります。"), snippet);
  snippet.textContent = assembled();
  slots.forEach(([label, ...options], i) => {
    const group = node("fieldset");
    group.append(node("legend", marks[i] + " " + label));
    for (const option of options) {
      const wrapper = node("label");
      const input = node("input");
      input.type = "radio";
      input.name = "piece-" + i;
      input.required = true;
      input.checked = pieces[i] === option;
      input.addEventListener("change", () => {
        pieces[i] = option;
        snippet.textContent = assembled();
        updateUnit(id, { pieces: [...pieces], buildChecked: false });
        revision++;
        feedback.textContent = "";
        preview.replaceChildren();
      });
      wrapper.append(input, node("code", option));
      group.append(wrapper);
    }
    form.append(group);
  });
  form.append(node("button", "組んだコードを確かめる"));
  async function check() {
    const at = ++revision;
    const result = assembled();
    const docs = await practicePreview(preview, id, ex,
      ex.field === "html" ? result : ex.html, ex.field === "html" ? ex.css : result);
    if (at !== revision || !preview.isConnected) return;
    const problem = exerciseResult(id, docs);
    feedback.textContent = problem || "できました。組んだコードの表示を見てみましょう。";
    updateUnit(id, { buildChecked: true, ...(!problem ? { buildDone: true } : {}) });
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    check();
  });
  content.append(form, feedback, preview, reviewLink(lesson), nextLessonLink(id),
    link("キーボードで書く", unitRoute(id, "type"), "review"));
  if (record.buildChecked && pieces.every(Boolean)) check();
}

function workshop(lesson) {
  const project = !lesson;
  const id = project ? "studio" : lesson.id;
  const ex = project ? { html: "", css: "", field: "both" } : lesson.exercise;
  const record = readProgress().units[id] || {};
  let html = ex.field === "css" || ex.field === "declaration" ? ex.html : (record.html ?? ex.html);
  let css = ex.field === "html" ? ex.css : (record.css ?? ex.css);
  const message = statusMessage();
  message.textContent = record.note || "";
  const preview = node("div", undefined, "slide-examples");
  let manuscriptButton;
  let revision = 0;
  function refresh() {
    return practicePreview(preview, id, ex, html, css);
  }
  function change(key, value) {
    if (key === "html") html = value;
    else css = value;
    if (manuscriptButton) manuscriptButton.hidden = html.length > 0;
    updateUnit(id, { [key]: value, note: "" });
    message.textContent = "";
    revision++;
    clearTimeout(pendingPreview);
    pendingPreview = setTimeout(refresh, 180);
  }
  heading(
    project ? "卒業制作" : lesson.title,
    project ? "わたしの作品展" : "自分で書いて確かめる",
    project
      ? "友人に見せたい作品を二つ選んで、小さな展示ページを作りましょう。題材に迷ったら、下の原稿の作品でも進められます。"
      : ex.task,
  );
  if (project) {
    const manuscript = details("原稿を読む「夜の机の小さな作品展」", node("pre", studioManuscript));
    const steps = node("ol", undefined, "studio-steps");
    for (const step of studioSteps) {
      const item = node("li");
      const help = details("ヒント", node("p", step.hint));
      help.append(link(step.reviewLabel, step.review + "/studio", "review"));
      item.append(node("h2", step.task), node("p", step.brief), help);
      steps.append(item);
    }
    const example = node("div");
    content.append(manuscript, steps, details("別の題材の完成例", example));
    makePreview(example, projectExample.html, projectExample.css, "小さな道具の展示室");
    if (narrowScreen.matches && currentRoute !== "studio/edit" && !record.html && !record.css) {
      content.append(node("p", "卒業制作ではHTMLとCSSを入力します。PCで続けるときは、目次から進捗を書き出せます。"),
        link("この端末で制作を始める", "studio/edit", "next"), link("コース目次へ", "home", "review"));
      return;
    }
    manuscriptButton = button("この原稿をHTML欄に入れる", () => {
      if (html.length > 0) return;
      const area = content.querySelector("textarea");
      area.value = studioManuscript;
      change("html", area.value);
      area.focus();
      area.setSelectionRange(0, 0);
    });
    manuscriptButton.hidden = html.length > 0;
    manuscript.append(manuscriptButton);
  }
  if (!project && ex.field !== "html")
    content.append(details("用意されているHTML", fields(html, "")));
  if (project || ex.field === "html")
    content.append(editor("HTML", html, (val) => change("html", val)));
  if (project || ex.field !== "html")
    content.append(
      editor(ex.field === "declaration" ? "CSSの宣言" : "CSS", css, (val) => change("css", val)),
    );
  content.append(preview);
  refresh();
  content.append(
    button(project ? "作品を確認する" : "コードを確かめる", async () => {
      clearTimeout(pendingPreview);
      const at = ++revision;
      const docs = await refresh();
      if (revision !== at || !preview.isConnected) return;
      const problem = project ? checkProject(docs) : exerciseResult(id, docs);
      const note =
        problem ||
        (project
          ? "完成です。二つの幅で作品を紹介できました。HTMLを書き出せます。"
          : "できました。条件を満たしています。");
      message.textContent = note;
      updateUnit(id, { note, ...(!problem ? { writeDone: true } : {}) });
    }),
    message,
  );
  if (project) {
    content.append(
      details("別題材のコード例", fields(projectExample.html, projectExample.css)),
      button("作品をHTMLで書き出す", () => {
        downloadFile(
          "watashi-no-sakuhinten.html",
          pageSource(html, css, "わたしの作品展"),
          "text/html",
        );
      }),
      link("コース目次へ", "home", "review"),
    );
  } else {
    content.append(
      details("ヒント", node("p", ex.hint)),
      details("書き方の一例", node("pre", ex.answer)),
      reviewLink(lesson),
      nextLessonLink(id),
      link("タップでコードを組む", unitRoute(id, "build"), "review"),
    );
  }
}

function render() {
  clearTimeout(pendingPreview);
  content.replaceChildren();
  const [id, raw = "1", origin] = location.hash.slice(1).split("/");
  revisit = null;
  if (origin === "studio") revisit = { lesson: "studio", route: "studio/edit" };
  else if (["quiz", "write", "type", "build"].includes(origin))
    revisit = { lesson: id, route: unitRoute(id, origin) };
  const lesson = lessons.find((item) => item.id === id);
  navFor(id);
  if (lesson) {
    const valid =
      raw === "quiz" ||
      ["write", "type", "build"].includes(raw) ||
      (Number.isInteger(Number(raw)) && Number(raw) >= 1 && Number(raw) <= lesson.slides.length);
    const part = valid ? raw : "1";
    currentRoute = unitRoute(id, part);
    if (part === "build" || (part === "write" && narrowScreen.matches)) buildPage(lesson);
    else if (part === "type" || part === "write") workshop(lesson);
    else if (part === "quiz") quizPage(lesson);
    else slidePage(lesson, Number(part) - 1);
    sectionTabs(lesson, ["type", "build"].includes(part) ? "write" : part);
  } else if (id === "studio") {
    currentRoute = raw === "edit" ? "studio/edit" : "studio";
    workshop(null);
  } else {
    currentRoute = "home";
    home();
  }
  if (currentRoute !== "home") {
    const state = readProgress();
    state.last = revisit ? currentRoute + "/" + origin : currentRoute;
    writeProgress(state);
  }
}

document.getElementById("skip").addEventListener("click", (e) => {
  e.preventDefault();
  content.focus();
});
window.addEventListener("hashchange", () => {
  render();
  content.querySelector("h1").focus();
});
adoptPaddingDraft();
if (location.pathname.endsWith("/padding.html")) {
  const aliases = { inside: "1", axes: "2", read: "quiz", write: "write" };
  const hash = location.hash.slice(1);
  if (!hash || Object.hasOwn(aliases, hash)) {
    let oldPage = "";
    try {
      oldPage = JSON.parse(localStorage.getItem("yomikumu/padding/v1"))?.page;
    } catch {}
    const part = aliases[hash] || aliases[oldPage] || "1";
    history.replaceState(null, "", "#padding/" + part);
  }
}
render();
