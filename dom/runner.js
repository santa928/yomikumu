"use strict";

// 学習者のコードとページは、教材と異なる不透明なオリジンで実行する。
const chosenStyle = ".chosen { background: #fff0a8; font-weight: bold; border-left: 4px solid #966800; padding-left: .35rem; }";
function domFrame(title, html, source, tests = [], setup = "") {
  const iframe = document.createElement("iframe");
  iframe.title = title;
  iframe.setAttribute("sandbox", "allow-scripts allow-forms");
  iframe.referrerPolicy = "no-referrer";
  const jsValue = value => JSON.stringify(value).replace(/</g, "\\u003c");
  const compiledTests = tests.map(([assertion, hint]) =>
    `[${assertion.toString()}, ${jsValue(hint)}]`).join(",\n");
  function runPage(code, tests, fixture) {
    const send = result => parent.postMessage({ domWorkshop: true, ...result }, "*");
    let problem = "";
    function report(message) {
      problem = message;
      const note = document.createElement("p");
      note.setAttribute("role", "alert");
      note.textContent = message;
      document.body.append(note);
      send({ error: message });
    }
    addEventListener("error", event => {
      report(event.message || "コードを読み取れません。");
    });
    addEventListener("unhandledrejection", event => {
      report(String(event.reason));
    });
    function execute(text) {
      const script = document.createElement("script");
      script.textContent = text;
      document.body.append(script);
    }
    execute(fixture);
    execute(code);
    const q = selector => document.querySelector(selector);
    const api = {
      q, all: selector => Array.from(document.querySelectorAll(selector)),
      click: selector => q(selector).click(),
      type(selector, value) {
        q(selector).value = value;
        q(selector).dispatchEvent(new Event("input", { bubbles: true }));
      },
      wait: ms => new Promise(resolve => setTimeout(resolve, ms)),
    };
    (async () => {
      for (const [i, [evaluate, hint]] of tests.entries()) {
        if (problem) return;
        let correct = false;
        try { correct = await evaluate(api); } catch { /* 未完成のDOMも次の一手に変える。 */ }
        if (problem) return;
        if (!correct) { send({ done: i, hint }); return; }
      }
      if (!problem) send({ done: tests.length });
    })();
  }
  iframe.srcdoc = `<!doctype html><html lang="ja"><meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'">
    <style>body{color:#223f33;font:1rem/1.6 system-ui,sans-serif;margin:12px;overflow-wrap:anywhere}
    h2,h3,p,ul{margin:0 0 .45rem}button,input,select{font:inherit;max-width:100%}
    button{padding:.3rem .55rem}button:focus-visible,input:focus-visible{outline:.2rem solid #a65312}
    ${chosenStyle}
    [hidden]{display:none!important}</style><body>${html}<script>(${runPage.toString()})(${jsValue(source)}, [${compiledTests}], ${jsValue(setup)})<\/script></body></html>`;
  return iframe;
}
