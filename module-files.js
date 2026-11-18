"use strict";

let moduleLexerReady;

function moduleSources(files, editing) {
  const section = node("div");
  for (const [name, source] of Object.entries(files)) {
    if (name !== editing) section.append(details(name + " を読む", node("pre", source)));
  }
  return section;
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
