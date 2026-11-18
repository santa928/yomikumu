"use strict";

let cpythonLoading;
function cpythonAssets() {
  if (!cpythonLoading) {
    cpythonLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "vendor/pyodide/runtime.js";
      script.onload = () => resolve(globalThis.yomikumuCPythonAssets);
      script.onerror = () => {
        cpythonLoading = null;
        script.remove();
        reject(new Error("CPythonを読み込めません。配布ファイルを確かめて再実行してください。"));
      };
      document.head.append(script);
    });
  }
  return cpythonLoading;
}

// 隔離Workerの中で配布物を展開する。ネットワークへは接続しない。
function cpythonWorker() {
  self.onmessage = async ({ data }) => {
    const { assets, ...options } = data;
    try {
      const files = new Map();
      await Promise.all(Object.entries(assets).map(async ([name, text]) => {
        const bytes = Uint8Array.from(atob(text), ch => ch.charCodeAt(0));
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
        files.set(name, await new Response(stream).arrayBuffer());
      }));
      const decoder = new TextDecoder();
      self.fetch = async url => {
        const filename = new URL(url).pathname.slice(1);
        if (!files.has(filename)) throw new Error("この教材にないパッケージです。");
        const type = filename.endsWith(".wasm") ? "application/wasm" : "application/octet-stream";
        return new Response(files.get(filename), { headers: { "Content-Type": type } });
      };
      (0, eval)(decoder.decode(files.get("pyodide.js")));
      (0, eval)(decoder.decode(files.get("pyodide.asm.js")));
      const py = await loadPyodide({ indexURL: "https://python.invalid/", jsglobals: {} });
      files.clear();
      for (const [name, source] of Object.entries(options.files || {})) {
        if (/^[a-z][a-z_0-9]*\.py$/.test(name)) py.FS.writeFile(name, source);
      }
      py.globals.set("course_request", JSON.stringify(options));
      const json = py.runPython(`
import io, json, sys, traceback
request = json.loads(course_request)
namespace = {"__name__": "__main__"}
class Output(io.StringIO):
    def write(self, text):
        if self.tell() + len(text) > 12000:
            raise RuntimeError("表示が長くなりました。繰り返しを確認しましょう。")
        return super().write(text)
output = Output()
original_out, original_in = sys.stdout, sys.stdin
lines = request.get("lines", [])
sys.stdin = io.StringIO("".join(line + "\\n" for line in lines))
sys.stdout = output
value, error = None, None
try:
    exec(compile(request.get("before", ""), "準備", "exec"), namespace)
    exec(compile(request["source"], "main.py", "exec"), namespace)
    if request.get("observe"):
        value = eval(request["observe"], namespace)
except BaseException as exc:
    error = type(exc).__name__ + ": " + str(exc)
    if request.get("afterError"):
        value = eval(request["afterError"], namespace)
finally:
    sys.stdout, sys.stdin = original_out, original_in
json.dumps({"output": output.getvalue(), "value": value, "error": error}, ensure_ascii=False)
`);
      self.postMessage({ kind: "end", ...JSON.parse(json) });
    } catch (error) {
      self.postMessage({ kind: "end", output: "", error: String(error).slice(0, 500) });
    }
  };
}
