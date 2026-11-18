"use strict";
const reactPage = '<div id="root"></div>';
const reactCompileCache = new Map();
function splitReactFiles(source) {
  const files = {};
  const marks = [...source.matchAll(/^\/\/ @file ([a-zA-Z0-9_-]+\.tsx?)\r?$|^\/\/ @file ([a-zA-Z0-9_-]+\.jsx?)\r?$/gm)];
  if (!marks.length) return { "App.jsx": source };
  for (const [i, mark] of marks.entries()) {
    files[mark[1] || mark[2]] = source.slice(mark.index + mark[0].length + 1, marks[i + 1]?.index ?? source.length).trimEnd();
  }
  return files;
}
function joinReactFiles(files) {
  return Object.entries(files).map(([name, source]) => "// @file " + name + "\n" + source).join("\n");
}
// 各iframeに専用のReact rootを作る。初回描画と検証用の操作はcommit終了後に観察する。
const reactHarness = `
const { useState, useEffect, useReducer, useContext, useRef, createContext } = React;
const trainingRoot = ReactDOM.createRoot(document.getElementById("root"), {
  onUncaughtError(error) { setTimeout(() => { throw error; }); }
});
const training = {
  uses: Object.create(null),
  elements: [],
  providers: [],
  mount(component, props = {}) {
    ReactDOM.flushSync(() => trainingRoot.render(React.createElement(component, props)));
  },
  click(selector) {
    ReactDOM.flushSync(() => document.querySelector(selector).click());
  },
  input(selector, value) {
    const input = document.querySelector(selector);
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    ReactDOM.flushSync(() => {
      setter.call(input, value);
      input.dispatchEvent(new Event("input", {bubbles:true}));
    });
  },
};
const originalCreateElement = React.createElement;
React.createElement = (type, props, ...children) => {
  if (type?.$$typeof === Symbol.for("react.context") && !training.providers.includes(type)) training.providers.push(type);
  if (typeof type === "function" && type !== training.app && training.elements.length < 200)
    training.elements.push({type, props});
  return originalCreateElement(type, props, ...children);
};`;

function compiledReact(source, typed) {
  const key = (typed ? "tsx:" : "jsx:") + source;
  if (reactCompileCache.has(key)) return reactCompileCache.get(key);
  const compiling = (async () => {
    if (source.length > 64000) throw Error("入力は64000文字までです。");
    const files = splitReactFiles(source);
    if (typed) {
      if (Object.hasOwn(files, "App.jsx")) {
        files["App.tsx"] = files["App.jsx"];
        delete files["App.jsx"];
      }
      const { diagnostics } = await inspectTSXFiles(files, await loadReactDeclarations());
      if (diagnostics.length) {
        const d = diagnostics[0];
        throw Error(d.file + " " + d.line + "行目 TS" + d.code + " " + d.text);
      }
    }
    const entries = await Promise.all(Object.entries(files).map(async ([name, text]) => {
      const {code, diagnostics} = await window.transpileTSX(text, true);
      if (diagnostics.length) {
        const first = diagnostics[0];
        throw Error(name + " " + first.line + "行目 " + first.text);
      }
      const key = name.replace(/\.[jt]sx?$/, "");
      const body = limitDomLoops(code) +
        (key === "App" ? "\n;if (!exports.default && typeof App !== 'undefined') exports.default = App;" : "");
      return JSON.stringify(key) + ": function(exports, require) {\n" + body + "\n}";
    }));
    return `const modules = { ${entries.join(",\n")} };
const loadedModules = new Map();
function readModule(path) {
  if (path === "react") return React;
  const name = path.replace(/^\\.\\//, "").replace(/\\.[jt]sx?$/, "");
  if (loadedModules.has(name)) return loadedModules.get(name);
  if (!Object.hasOwn(modules, name)) throw Error("教材内に " + path + " がありません。");
  const exports = {};
  loadedModules.set(name, exports);
  modules[name](exports, readModule);
  if (name !== "App" && typeof exports.default === "function") {
    const original = exports.default;
    exports.default = props => {
      const uses = training.uses[name] ||= [];
      if (uses.length < 200) uses.push(props);
      return React.createElement(original, props);
    };
  }
  return exports;
}
training.read = readModule;
training.app = readModule("App").default;
if (!training.app) throw Error("App部品を用意してください。");
training.mount(training.app);`;
  })();
  if (reactCompileCache.size > 24) reactCompileCache.delete(reactCompileCache.keys().next().value);
  reactCompileCache.set(key, compiling);
  compiling.catch(() => reactCompileCache.delete(key));
  return compiling;
}

function reactFrame(title, html, source, tests = [], setup = "") {
  const frame = document.createElement("iframe");
  frame.title = title;
  frame.setAttribute("sandbox", "allow-scripts allow-forms");
  frame.referrerPolicy = "no-referrer";
  const typed = setup?.typed === true;
  compiledReact(source, typed).then(compiled => {
    frame.srcdoc = domFrame(title, html || reactPage, compiled, tests,
      reactRuntimeSource + "\n" + reactHarness + "\n" + (typed ? "" : setup)).srcdoc;
  }).catch(error => {
    frame.srcdoc = domFrame(title, reactPage, "throw Error(" + JSON.stringify(error.message) + ");", tests).srcdoc;
  });
  return frame;
}
