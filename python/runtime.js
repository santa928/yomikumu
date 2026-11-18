"use strict";

// この関数は保存領域を持たないオリジンのWorkerで動く。
function pythonWorker() {
  let nextInput;
  self.onmessage = async ({ data }) => {
    if (data.kind === "line") {
      nextInput?.(data.line);
      return;
    }
    const { source, lines, before = "", observe, afterError, files = {}, interactive } = data;
    let output = "";
    try {
      Sk.configure({
        __future__: Sk.python3,
        output(text) {
          if (output.length + text.length > 12000) throw new Error("表示が長くなりました。繰り返しを確認しましょう。");
          output += text;
        },
        inputfunTakesPrompt: true,
        inputfun(prompt) {
          if (prompt) output += prompt;
          if (lines.length) return lines.shift();
          if (!interactive) throw new Sk.builtin.EOFError("用意した入力を使い切りました");
          postMessage({ kind: "wait", output });
          return new Promise(resolve => { nextInput = resolve; });
        },
        read(path) {
          if (path === "src/builtin/sys.js") return Sk.builtinFiles.files[path];
          if (path.startsWith("./") && Object.hasOwn(files, path.slice(2))) return files[path.slice(2)];
          throw new Error("教材内にないファイルです");
        },
      });
      let program = before ? before + "\n" + source : source;
      if (afterError) {
        const body = program.split("\n").map(line => "    " + line).join("\n");
        program = "try:\n" + body + "\nexcept Exception as course_failure:\n    course_problem = type(course_failure).__name__\n    course_observation = (" + afterError + ")\n";
      }
      if (observe) program += "\ncourse_observation = (" + observe + ")\n";
      const module = await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("main", false, program, true));
      const value = module.$d.course_observation ? Sk.ffi.remapToJs(module.$d.course_observation) : undefined;
      const error = module.$d.course_problem ? Sk.ffi.remapToJs(module.$d.course_problem) : undefined;
      postMessage({ kind: "end", output, value, error });
    } catch (error) {
      postMessage({ kind: "end", output, error: String(error).slice(0, 500) });
    }
  };
}

function pythonFrame() {
  addEventListener("message", event => {
    if (event.source !== parent || !event.ports[0]) return;
    const channel = event.ports[0];
    const { workerSource, options } = event.data;
    const url = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const worker = new Worker(url);
    worker.onmessage = ({ data }) => channel.postMessage(data);
    worker.onerror = () => channel.postMessage({ kind: "end", output: "", error: "Pythonの実行を始められませんでした。" });
    channel.onmessage = ({ data }) => {
      if (data.kind === "stop") {
        worker.terminate();
        URL.revokeObjectURL(url);
        channel.close();
      } else worker.postMessage(data);
    };
    worker.postMessage(options);
  }, { once: true });
}

function runPython(options, onWait = () => {}) {
  const frame = document.createElement("iframe");
  frame.hidden = true;
  frame.title = "Python実行用";
  frame.sandbox = "allow-scripts";
  const channel = new MessageChannel();
  let timer;
  let resolve;
  let finished = false;
  const result = new Promise(done => { resolve = done; });
  function finish(value) {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    channel.port1.postMessage({ kind: "stop" });
    channel.port1.close();
    frame.remove();
    resolve(value);
  }
  function watch() {
    timer = setTimeout(() => finish({ output: "", error: "実行時間が長いため停止しました。繰り返しを確認しましょう。" }), 5000);
  }
  channel.port1.onmessage = ({ data }) => {
    if (!data || typeof data.output !== "string" || data.output.length > 13000) return;
    if (data.kind === "wait") {
      clearTimeout(timer);
      onWait(data.output);
    } else if (data.kind === "end") finish(data);
  };
  frame.addEventListener("load", () => {
    if (finished) return;
    const workerSource = pythonRuntimeSource + "\n(" + pythonWorker.toString() + ")();";
    frame.contentWindow.postMessage({ workerSource, options }, "*", [channel.port2]);
  }, { once: true });
  frame.srcdoc = '<meta http-equiv="Content-Security-Policy" content="default-src &apos;none&apos;; script-src &apos;unsafe-inline&apos; &apos;unsafe-eval&apos;; worker-src blob:; connect-src &apos;none&apos;">' +
    "<script>(" + pythonFrame.toString() + ")()<" + "/script>";
  document.body.append(frame);
  watch();
  return {
    result,
    send(line) { clearTimeout(timer); watch(); channel.port1.postMessage({ kind: "line", line }); },
    stop() { finish({ output: "", stopped: true }); },
  };
}
