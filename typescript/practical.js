"use strict";



async function compilePracticalTS(files) {
  const modules = await Promise.all(Object.entries(files).map(async ([name, source]) => {
    const { code, diagnostics } = await transpileTSX(source, true);
    if (diagnostics.length) throw Error(name + " · " + diagnostics[0].text);
    return [name.replace(/\.ts$/, ".js"), code];
  }));
  // 変換したモジュールは、既存の隔離された実行環境にだけ渡す。
  return `
const knownModules = new Map([
${modules.map(([name, code]) => `  [${JSON.stringify("./" + name)}, (exports, require) => {\n${code}\n}]`).join(",\n")}
]);
const loadedModules = new Map();
function require(name) {
  const module = knownModules.get(name);
  if (!module) throw new Error("演習のファイルを読み込めません · " + name);
  if (!loadedModules.has(name)) {
    const exports = {};
    loadedModules.set(name, exports);
    module(exports, require);
  }
  return loadedModules.get(name);
}
for (const { label, actual } of require("./check.js").runChecks()) console.log(label, actual);
`;
}

function renderPracticalTS() {
  main.innerHTML = `<p class="kind">TypeScript · 実践</p>
    <h1>複数ファイルで採点を改修する</h1>
    <p>観察クイズの採点を直します。問題に書いてある配点を使い、正解・不正解・入力データの不備を区別できるようにします。</p>
    <section aria-labelledby="practical-slides">
      <h2 id="practical-slides">見本と短い練習</h2>
      <p>スマートフォンでは、見本から四択に進み、候補をタップしてコードを組めます。</p>
      <ol class="catalog">
        <li><a href="#shared-result/slide">採点結果の型を共有する</a></li>
        <li><a href="#points-input/slide">届いた配点を読めるか確かめる</a></li>
        <li><a href="#round-class/slide">問題と採点のクラスを作る</a></li>
      </ol>
    </section>
    <section class="ts-practical" aria-labelledby="practical-editor-heading">
      <h2 id="practical-editor-heading">PC実習 · 4つのファイルをつなぐ</h2>
      <ol class="studio-steps">
        <li><strong><code>types.ts</code> の <code>Result</code> を変える</strong>
          <p>まず「型を検査」で元のコードを確かめます。次に <code>Result</code> の <code>points</code> を <code>score</code> に改名し、<code>status</code> を <code>"correct" | "incorrect" | "invalid"</code> にします。<code>Question.points</code> は問題の配点に使います。</p></li>
        <li><strong>診断が出たファイルを開く</strong>
          <p>もう一度「型を検査」を押します。ファイル名・行・列が表示されます。診断を選び、<code>score.ts</code> が返す得点の項目と、<code>display.ts</code> が読む項目をそろえます。表示は <code>correct 4点</code> の形です。</p></li>
        <li><strong>クラスの <code>answer</code> を仕上げる</strong>
          <p><code>score.ts</code> の <code>QuizRound</code> では、<code>constructor</code> が問題を <code>this.question</code> に保存します。<code>answer(text)</code> を直し、一致なら <code>correct</code> と問題の配点を、不一致なら <code>incorrect</code> と0点を返します。</p></li>
        <li><strong><code>input.ts</code> で届いた値を実行時に確認する</strong>
          <p><code>questionFrom</code> は <code>unknown</code> を受け取ります。<code>null</code> 以外のオブジェクトで、<code>answer</code> が文字列、<code>points</code> が0以上の整数のときだけ問題を返します。ほかは <code>null</code> を返し、<code>score.ts</code> から <code>invalid</code> と0点を返します。</p></li>
      </ol>
      <details>
        <summary>書き方のヒント</summary>
        <ul>
          <li>型を共有するファイルは <code>export type</code>、使う側は <code>import type</code> と書きます。このプロジェクトでは <code>./types.js</code> と書くと、型検査では <code>types.ts</code> が見つかります。</li>
          <li><code>typeof raw !== "object" || raw === null</code> のときは先に戻ります。次に <code>"answer" in raw</code> で項目を探します。<code>points</code> も存在を確かめてから、<code>typeof</code>、<code>Number.isInteger</code>、0との比較を行います。</li>
          <li>型検査はコードが守る約束を調べます。「実行して確かめる」で、不正なJSONを渡しても <code>invalid 0点</code> が返るか見ます。</li>
        </ul>
      </details>
      <div class="ts-tools">
        <label for="practical-file">編集するファイル</label>
        <select id="practical-file">${practicalFilesTS.map(name => `<option>${name}</option>`).join("")}</select>
      </div>
      <label for="practical-code">TypeScript コード</label>
      <textarea id="practical-code" aria-describedby="practical-current" spellcheck="false" autocapitalize="off"></textarea>
      <p id="practical-current"></p>
      <div class="ts-tools">
        <button type="button" id="practical-check">型を検査</button>
        <button type="button" id="practical-run">実行して確かめる</button>
        <button type="button" id="practical-stop" disabled>停止する</button>
      </div>
      <div class="ts-result">
        <h2>型検査</h2>
        <p>ブラウザでは、<code>tsc</code> と同じ TypeScript 6.0.3 コンパイラを使います。</p>
        <p data-practical-type role="status">未検査</p>
        <div class="ts-lines" data-practical-diagnostics></div>
        <h2>実行結果</h2>
        <pre data-practical-run>未実行</pre>
        <p data-practical-grade role="status"></p>
      </div>
      <h2>手元に保存して引き継ぐ</h2>
      <p>現在の4つのファイルと検証用のファイルをZIPに保存します。展開して README の手順で <code>npm run typecheck</code> と <code>npm run verify</code> を実行できます。引き継ぐ相手には、ZIPと最後の検証結果を渡します。</p>
      <button type="button" id="practical-download">現在のプロジェクトをZIPで保存</button>
      <p id="practical-download-note" role="status"></p>
    </section>
    <a class="review" href="#contents">型付きクイズの目次へ</a>`;

  const sources = { ...practicalStarterTS, ...stateTS.practical };
  const file = main.querySelector("#practical-file");
  const editor = main.querySelector("#practical-code");
  const currentFile = main.querySelector("#practical-current");
  const type = main.querySelector("[data-practical-type]");
  const output = main.querySelector("[data-practical-run]");
  const grade = main.querySelector("[data-practical-grade]");
  const diagnostics = main.querySelector("[data-practical-diagnostics]");
  const check = main.querySelector("#practical-check");
  const run = main.querySelector("#practical-run");
  const stop = main.querySelector("#practical-stop");

  function openFile(name) {
    file.value = name;
    editor.value = sources[name];
    currentFile.textContent = "編集中のファイル " + name;
  }
  openFile(file.value);
  file.onchange = () => openFile(file.value);

  function setBusy(busy) {
    check.disabled = busy;
    run.disabled = busy;
    stop.disabled = !busy;
  }
  function clearRun(message, result = "未実行") {
    ++requestTS;
    execution?.stop();
    execution = undefined;
    setBusy(false);
    type.textContent = message;
    output.textContent = result;
    grade.textContent = "";
    diagnostics.replaceChildren();
  }
  editor.oninput = () => {
    sources[file.value] = editor.value;
    stateTS.practical = sources;
    persistTS();
    clearRun("編集内容を型検査できます。");
  };

  function showDiagnostic(diagnostic) {
    const editable = Object.hasOwn(sources, diagnostic.file);
    const item = document.createElement(editable ? "button" : "p");
    item.textContent = `${diagnostic.file}:${diagnostic.line}:${diagnostic.col} · TS${diagnostic.code} ${diagnostic.text}`;
    if (editable) {
      item.type = "button";
      item.onclick = () => {
        openFile(diagnostic.file);
        const rows = editor.value.split("\n");
        const start = rows.slice(0, diagnostic.line - 1).reduce((sum, row) => sum + row.length + 1, 0);
        const end = start + (rows[diagnostic.line - 1]?.length || 0);
        editor.focus();
        editor.setSelectionRange(Math.min(start + diagnostic.col - 1, end), end);
      };
    }
    diagnostics.append(item);
  }

  async function verify(execute) {
    clearRun("型検査中…");
    const current = requestTS;
    const files = { ...sources, "check.ts": practicalCheckCodeTS };
    let typed = false;
    setBusy(true);
    try {
      const checked = await inspectTSXFiles(files);
      if (current !== requestTS) return;
      if (checked.diagnostics.length) {
        type.textContent = "型エラーがあります。診断を選ぶと該当するファイルを編集できます。";
        checked.diagnostics.forEach(showDiagnostic);
        return;
      }
      typed = true;
      type.textContent = "型検査を通りました。";
      if (!execute) return;

      output.textContent = "実行中…";
      const code = await compilePracticalTS(files);
      if (current !== requestTS) return;
      execution = runScoreCode(code);
      const result = await execution.result;
      if (current !== requestTS) return;
      if (!result.ok) {
        output.textContent = "実行時 · " + result.error;
        grade.textContent = "実行エラーがあります。";
        return;
      }
      const observed = result.output.slice(-practicalChecksTS.length);
      output.textContent = observed.map(row => row.map(value => value.text).join(" · ")).join("\n");
      const mismatch = practicalChecksTS.findIndex(([label, , , want], index) =>
        !matchTS(observed[index]?.[0], label) || !matchTS(observed[index]?.[1], want));
      if (mismatch < 0) grade.textContent = "すべての確認を通りました。";
      else {
        const [label, , , want] = practicalChecksTS[mismatch];
        grade.textContent = "結果を見比べましょう。「" + label + "」では " + want + " を表示します。";
      }
    } catch (error) {
      if (current === requestTS) {
        const message = "検査を完了できませんでした。" + error.message;
        if (typed) {
          output.textContent = "未実行";
          grade.textContent = message;
        } else type.textContent = message;
      }
    } finally {
      if (current === requestTS) setBusy(false);
    }
  }

  check.onclick = () => verify(false);
  run.onclick = () => verify(true);
  stop.onclick = () => clearRun("編集内容を型検査できます。", "停止しました。下書きから再開できます。");
  main.querySelector("#practical-download").onclick = () => {
    const note = main.querySelector("#practical-download-note");
    try {
      const blob = new Blob([makePracticalArchiveTS(sources)], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), { href: url, download: "yomikumu-score-practice.zip" }).click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      note.textContent = "ZIPを用意しました。";
    } catch {
      note.textContent = "ZIPを作れませんでした。ページを開き直すと下書きから再開できます。";
    }
  };
}
