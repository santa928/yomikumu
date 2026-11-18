"use strict";

let moduleLexerReady;

function moduleSources(files, editing) {
  const section = node("div");
  for (const [name, source] of Object.entries(files)) {
    if (name !== editing) section.append(details(name + " を読む", node("pre", source)));
  }
  return section;
}

function localModuleFile(ex, area, message) {
  const group = node("div");
  const input = node("input");
  input.type = "file";
  input.accept = ".js,.mjs,text/javascript";
  const label = node("label", "手元の問題集をコード欄に取り込む ");
  label.append(input);
  let previous;
  let revision = 0;
  function replace(value) {
    area.value = value;
    area.dispatchEvent(new Event("input", { bubbles: true }));
  }
  const undo = button("取り込み前の下書きに戻す", () => {
    replace(previous);
    undo.hidden = true;
    message.textContent = "取り込み前のコードに戻しました。";
    area.focus();
  });
  undo.hidden = true;
  area.addEventListener("input", () => { revision++; undo.hidden = true; });
  input.addEventListener("change", async () => {
    const file = input.files[0];
    const at = ++revision;
    input.value = "";
    if (!file) return;
    if (file.size > 65536) {
      message.textContent = "この練習では64 KiBまでの問題集を選んでください。";
      return;
    }
    try {
      const source = await file.text();
      if (at !== revision || !area.isConnected) return;
      previous = area.value;
      replace(source);
      undo.hidden = false;
      message.textContent = "問題集を取り込みました。内容を確かめてから実行できます。";
      area.focus();
    } catch {
      if (at === revision) message.textContent = "ファイルを読めませんでした。もう一度選んでください。";
    }
  });
  group.append(button("問題集の見本を保存", () => downloadFile(ex.filename, ex.code, "text/javascript")), label, undo);
  return group;
}

// ファイルを開く形式でも利用できるよう、教材に同梱した実装を必要な章でだけ読む。
function loadModuleLexer() {
  if (!moduleLexerReady) {
    moduleLexerReady = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL("vendor/module-lexer.js", document.baseURI).href;
      script.onload = () => YomikumuModuleLexer.init().then(() => resolve(YomikumuModuleLexer), reject);
      script.onerror = () => {
        moduleLexerReady = null;
        script.remove();
        reject(Error("教材のファイル読み込み機能を開けませんでした。もう一度実行してください。"));
      };
      document.head.append(script);
    });
  }
  return moduleLexerReady;
}

async function prepareModuleFiles(files) {
  const lexer = await loadModuleLexer();
  const sorted = [];
  const visited = new Set();
  const visiting = new Set();
  function visit(name) {
    if (visited.has(name)) return;
    if (visiting.has(name)) throw Error(name + " が読み込み元に戻ります。この練習では問題集から採点、最後に表示の順で読み込みます。");
    visiting.add(name);
    const source = files[name];
    let imports;
    try { [imports] = lexer.parse(source, name); }
    catch (error) {
      const line = source.slice(0, error.idx || 0).split("\n").length;
      throw Error(name + " の" + line + "行目付近でファイルを読めません。引用符やかっこを確かめましょう。");
    }
    const paths = [];
    for (const item of imports) {
      const line = source.slice(0, item.ss).split("\n").length;
      if (item.d === -2) continue;
      if (item.d !== -1) throw Error(name + " の" + line + "行目では、読み込むファイルを import ... from で指定しましょう。");
      const file = item.n?.startsWith("./") ? item.n.slice(2) : "";
      if (!file || !Object.hasOwn(files, file))
        throw Error(name + " の" + line + "行目の読み込み先「" + (item.n || "") + "」が見つかりません。用意したファイル名と ./ を確かめましょう。");
      visit(file);
      paths.push({ start: item.s, end: item.e, file });
    }
    visiting.delete(name);
    visited.add(name);
    sorted.push({ name, source, paths });
  }
  visit("main.js");
  return sorted;
}
