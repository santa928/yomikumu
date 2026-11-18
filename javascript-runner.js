"use strict";

// この関数だけを、不透明なオリジンのiframeの中で起動する。
function startScoreSandbox() {
  window.addEventListener("message", event => {
    if (event.source !== parent || !event.ports[0]) return;
    const channel = event.ports[0];
    const { code, initialScore } = event.data;
    const prelude = [
      '"use strict";',
      'const initialScore = ' + JSON.stringify(initialScore) + ';',
      'const output = [];',
      'let title = "";',
      'const showTitle = value => { title = String(value).slice(0, 240); };',
      'console.log = (...values) => {',
      '  if (output.length >= 40) throw new Error("表示は40回までです。繰り返す回数を確認してください。");',
      '  output.push(values.slice(0, 8).map(value => ({ type: typeof value, text: String(value).slice(0, 500) })));',
      '};',
      '{',
    ];
    const end = '\n}\nself.postMessage({title, output});';
    const blob = new Blob([prelude.join("\n"), "\n", code, end], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    let worker;
    channel.onmessage = event => {
      if (event.data?.cancel) finish(event.data.cancel);
    };
    function finish(result) {
      worker?.terminate();
      URL.revokeObjectURL(url);
      channel.postMessage(result);
      channel.close();
    }
    try {
      worker = new Worker(url);
      worker.onmessage = event => {
        const data = event.data;
        if (typeof data?.title === "string" && Array.isArray(data.output)) finish({ ok: true, title: data.title, output: data.output });
      };
      worker.onerror = error => {
        error.preventDefault();
        const line = error.lineno ? Math.max(1, Math.min(code.split("\n").length, error.lineno - prelude.length)) : null;
        finish({ ok: false, error: error.message, line });
      };
    } catch {
      finish({ ok: false, error: "このブラウザでは実行を始められませんでした。" });
    }
  }, { once: true });
}

// タイマーも停止ボタンも、学習者のコードが動くスレッドの外から実行を終了する。
function runScoreCode(code, initialScore = 0) {
  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-scripts");
  frame.hidden = true;
  frame.title = "JavaScript実行用";
  const channel = new MessageChannel();
  let timer;
  let started = false;
  let finished = false;
  let complete;
  const result = new Promise(resolve => { complete = resolve; });
  function finish(value) {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    channel.port1.close();
    frame.remove();
    complete(value);
  }
  function cancel(result) {
    if (!started || finished) return finish(result);
    channel.port1.postMessage({ cancel: result });
    clearTimeout(timer);
    timer = setTimeout(() => finish(result), 300);
  }
  channel.port1.onmessage = event => finish(event.data);
  frame.addEventListener("load", () => {
    if (!frame.isConnected) return;
    frame.contentWindow.postMessage({ code, initialScore }, "*", [channel.port2]);
    started = true;
  }, { once: true });
  frame.srcdoc = '<meta http-equiv="Content-Security-Policy" content="default-src &apos;none&apos;; script-src &apos;unsafe-inline&apos;; worker-src blob:; connect-src &apos;none&apos;">' +
    "<script>(" + startScoreSandbox.toString() + ")()<" + "/script>";
  timer = setTimeout(() => cancel({ ok: false, error: "時間がかかったので停止しました。コードを直して、もう一度試せます。" }), 3000);
  document.body.append(frame);
  return { result, stop: () => cancel({ ok: false, stopped: true, error: "停止しました。書いたコードから続けられます。" }) };
}
