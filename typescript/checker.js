"use strict";
let typeWorkerReady;
let activeTypeWorker;
let requestNo = 0;
const pendingTypeChecks = new Map();
const compilerDataUrl = new URL("compiler-data.js", document.currentScript.src).href;

function clearTypeWorker(reason) {
  activeTypeWorker?.terminate();
  activeTypeWorker = undefined;
  typeWorkerReady = undefined;
  for (const job of pendingTypeChecks.values()) { clearTimeout(job.timer); job.reject(Error(reason)); }
  pendingTypeChecks.clear();
}
function makeTypeWorker() {
  if (typeWorkerReady) return typeWorkerReady;
  typeWorkerReady = (async () => {
    if (!window.quizCompilerGzip) await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = compilerDataUrl;
      script.onload = resolve;
      script.onerror = () => reject(Error("型検査用のファイルを読み込めませんでした。"));
      document.head.append(script);
    });
    const compressed = Uint8Array.from(atob(window.quizCompilerGzip), c => c.charCodeAt(0));
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
    const url = URL.createObjectURL(new Blob([await new Response(stream).arrayBuffer()], { type: "text/javascript" }));
    let worker;
    try { worker = new Worker(url); } finally { URL.revokeObjectURL(url); }
    activeTypeWorker = worker;
    worker.onmessage = event => {
      const job = pendingTypeChecks.get(event.data.id);
      if (!job) return;
      clearTimeout(job.timer);
      pendingTypeChecks.delete(event.data.id);
      if (event.data.error) job.reject(Error(event.data.error));
      else job.resolve(event.data.result);
    };
    worker.onerror = () => clearTypeWorker("型検査を始められませんでした。読み込み直して再試行できます。");
    return worker;
  })().catch(error => { typeWorkerReady = undefined; throw error; });
  return typeWorkerReady;
}
async function askTypeWorker(payload) {
  const worker = await makeTypeWorker();
  const id = ++requestNo;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => clearTypeWorker("型検査に時間がかかったため停止しました。下書きから再開できます。"), 15000);
    pendingTypeChecks.set(id, { resolve, reject, timer });
    worker.postMessage({ id, ...payload });
  });
}
function inspectTS(source, contract, rules) {
  return askTypeWorker({ source, contract, rules });
}
function transpileTSX(source, commonJS = false) {
  return askTypeWorker({ source, mode: "tsx", commonJS });
}
function inspectTSXFiles(files, declarations = {}) {
  return askTypeWorker({ mode: "tsx-files", files, declarations });
}
