"use strict";

let activeCodeRun;

function stopCodeRun() {
  activeCodeRun?.stop();
  activeCodeRun = null;
}

async function executeCode(code, start, binding, pauseExample = false) {
  stopCodeRun();
  const task = runScoreCode(code, start, binding, pauseExample);
  activeCodeRun = task;
  const result = await task.result;
  if (activeCodeRun === task) activeCodeRun = null;
  return result;
}

function startSelector(ex) {
  const label = node("label", (ex.inputLabel || "開始点") + " ");
  const select = node("select");
  for (const value of ex.inputs || [2, 5]) select.append(node("option", String(value)));
  label.append(select);
  return { label, select };
}

function showCodeOutput(host, result, sign) {
  host.replaceChildren();
  if (sign) {
    const title = node("h2", result.title || "開館中");
    title.style.color = "navy";
    const example = node("figure", undefined, "code-result");
    example.append(node("figcaption", "展示の看板"), title);
    host.append(example);
  }
  if (result.output.length || !sign) {
    const example = node("figure", undefined, "code-result");
    example.append(node("figcaption", "コンソール"));
    const kinds = { number: "数", string: "文字", boolean: "真偽", undefined: "未定義", array: "配列", object: "オブジェクト", null: "null" };
    const lines = result.output.map(row => row.map(v => v.text + "（" + (kinds[v.type] || v.type) + "）").join("　"));
    example.append(node("pre", lines.length ? lines.join("\n") : "出力はありません。"));
    host.append(example);
  }
}

function executionMessage(result) {
  let hint = "";
  if (result.error.includes("ReferenceError")) hint = "名前のつづりと、その名前を用意した行を確かめましょう。 ";
  if (result.error.includes("SyntaxError")) hint = "引用符、かっこ、記号の並びを見直しましょう。 ";
  return (result.line ? result.line + "行目で止まりました。 " : "") + hint + result.error;
}

function scoreProblem(ex, result, start) {
  if (ex.returnsValue && result.output.some(row => row.some(v => v.type === "undefined")))
    return "呼び出した場所で数を受け取れていません。関数の中で、計算した数を return で返しましょう。";
  if (ex.judge) return ex.judge(result, start);
  const expected = ex.expected(start);
  for (const [index, value] of expected.entries()) {
    const row = result.output[index];
    const type = Array.isArray(value) ? "array" : typeof value;
    const text = type === "array" ? JSON.stringify(value) : String(value);
    if (row?.length !== 1 || row[0].type !== type || row[0].text !== text)
      return ex.hints[index] || ex.hints.at(-1);
  }
  if (result.output.length !== expected.length) return ex.extraHint || "必要な値は出ました。指定された行数だけを表示しましょう。";
  if (ex.binding?.constant && (!result.binding.constant || result.binding.value !== start))
    return "表示はできました。開始点を受け取る ticket には const で名前を付けましょう。";
  if (ex.binding?.offset !== undefined && (result.binding.constant || result.binding.value !== start + ex.binding.offset))
    return "二行の表示はできました。score 自体にも、増やした後の数を残しましょう。";
  if (ex.arrowName && !result.binding.arrow) return "二倍の数を返せました。今回は double を n => 式 の形に書き換えてみましょう。";
  return "";
}

async function checkScoreCode(ex, code, start, host, current) {
  const inputs = ex.variableStart ? [...new Set([start, ...(ex.inputs || [2, 5])])] : [start];
  for (const [index, input] of inputs.entries()) {
    const program = ex.calls ? code + "\n;\n" + ex.calls : code;
    const result = await executeCode(program, input, ex.binding?.name || ex.arrowName);
    if (!current()) return "";
    if (!result.ok) {
      if (ex.calls && result.line > code.split("\n").length)
        return "確認用の呼び出しで止まりました。" + (ex.callErrorHint || "用意する関数の名前と、その関数が返す値を確かめましょう。") + " " + result.error;
      if (ex.scopeHint && result.error.includes("ReferenceError")) return executionMessage(result) + " " + ex.scopeHint;
      return executionMessage(result);
    }
    if (index === 0) showCodeOutput(host, result, ex.sign);
    const problem = scoreProblem(ex, result, input);
    if (problem) return (index ? (ex.inputLabel || "開始点") + "を" + input + "に変えた場合も確かめましょう。 " : "") + problem;
  }
  return "";
}

function scoreSlide(slide) {
  if (slide.actions) {
    counterSlide(slide);
    return;
  }
  const output = node("div");
  const feedback = statusMessage();
  const actions = node("div", undefined, "code-actions");
  const { label, select } = startSelector(slide);
  let revision = 0;
  if (slide.markup) content.append(fields("<h2>開館中</h2>", "h2 { color: navy; }"));
  const source = node("div", undefined, "sources");
  source.append(node("strong", "JavaScript"), node("pre", slide.code));
  const run = button("見本を実行", async () => {
    const at = ++revision;
    if (slide.pauseExample) {
      showCodeOutput(output, { title: "開館中", output: [] }, true);
      stop.disabled = false;
      feedback.textContent = "看板が変わるのを待っています。ここで停止も試せます。";
    }
    const result = await executeCode(slide.code, Number(select.value), undefined, slide.pauseExample);
    if (revision !== at || !output.isConnected) return;
    stop.disabled = true;
    if (result.ok) {
      showCodeOutput(output, result, slide.sign);
      feedback.textContent = "実行しました。";
    } else feedback.textContent = executionMessage(result);
  });
  const stop = button("見本を停止", () => {
    revision++;
    stopCodeRun();
    stop.disabled = true;
    feedback.textContent = "看板を変える前に停止しました。もう一度実行できます。";
    run.focus();
  });
  stop.disabled = true;
  if (slide.variableStart) actions.append(label);
  actions.append(run);
  if (slide.pauseExample) actions.append(stop);
  if (slide.sign) showCodeOutput(output, { title: "開館中", output: [] }, true);
  content.append(source, actions, output, feedback);
  if (!slide.sign) run.click();
}

function counterSlide(slide) {
  const history = [];
  const output = node("div");
  const calls = node("pre");
  const feedback = statusMessage();
  const controls = node("div", undefined, "code-actions");
  const { label, select } = startSelector(slide);
  let revision = 0;
  async function show() {
    const at = ++revision;
    calls.textContent = history.join("\n") || "まだ呼んでいません。";
    const result = await executeCode([slide.code, ...history].join("\n"), Number(select.value));
    if (at !== revision || !output.isConnected) return;
    if (!result.ok) {
      feedback.textContent = executionMessage(result);
      return;
    }
    showCodeOutput(output, result, false);
    feedback.textContent = history.length ? history.length + "回の呼び出しを実行しました。" : "受付を用意するコードを実行しました。";
  }
  if (slide.variableStart) {
    controls.append(label);
    select.addEventListener("change", show);
  }
  for (const action of slide.actions) {
    controls.append(button(action.label, () => {
      if (history.length >= 12) {
        feedback.textContent = "12回分を表示しました。「最初から試す」で別の順番を試せます。";
        return;
      }
      history.push(action.code);
      show();
    }));
  }
  controls.append(button("最初から試す", () => {
    history.length = 0;
    show();
  }));
  content.append(details("受付を用意するJavaScript", node("pre", slide.code)), controls,
    node("strong", "追加した呼び出し"), calls, output, feedback);
  show();
}

function scoreWorkshop(lesson) {
  const { id, exercise: ex } = lesson;
  const saved = readProgress().units[id] || {};
  let code = saved.js ?? ex.code;
  let revision = 0;
  heading(lesson.title, "自分で書いて確かめる", ex.task);
  const message = statusMessage();
  message.textContent = saved.note || "";
  const output = node("div");
  const { label, select } = startSelector(ex);
  const actions = node("div", undefined, "code-actions");
  function resetResult() {
    revision++;
    stopCodeRun();
    run.disabled = false;
    stop.disabled = true;
    message.textContent = "";
    output.replaceChildren();
  }
  const run = button("コードを実行して確かめる", async () => {
    const at = ++revision;
    run.disabled = true;
    stop.disabled = false;
    message.textContent = "実行しています。";
    output.replaceChildren();
    const current = () => at === revision && output.isConnected;
    const problem = await checkScoreCode(ex, code, Number(select.value), output, current);
    if (!current()) return;
    const returnFocus = document.activeElement === stop;
    run.disabled = false;
    stop.disabled = true;
    if (returnFocus) run.focus();
    const note = problem || "できました。条件を満たしています。";
    message.textContent = note;
    updateUnit(id, { note, ...(!problem ? { writeDone: true } : {}) });
  });
  const stop = button("実行を止める", () => {
    resetResult();
    message.textContent = "停止しました。書いたコードから続けられます。";
    updateUnit(id, { note: message.textContent });
    run.focus();
  });
  stop.disabled = true;
  select.addEventListener("change", () => {
    resetResult();
    updateUnit(id, { note: "" });
  });
  content.append(editor("JavaScript", code, value => {
    code = value;
    resetResult();
    updateUnit(id, { js: code, note: "" });
  }));
  if (ex.calls) content.append(details("続けて実行する確認用コード", node("pre", ex.calls)));
  if (ex.variableStart) actions.append(label);
  actions.append(run, stop);
  content.append(actions, message, output, details("ヒント", node("p", ex.hint)),
    details("書き方の一例", node("pre", ex.answer)), reviewLink(lesson), nextLessonLink(id),
    link("タップでコードを組む", unitRoute(id, "build"), "review"));
}
