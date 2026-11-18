"use strict";
let domToolsLoaded;
function loadDomTools() {
  if (!domToolsLoaded) domToolsLoaded = (async () => {
    for (const file of ["vendor/acorn.js","guard.js","runner.js"]) await new Promise((resolve,reject) => {
      const script = document.createElement("script");
      script.src = "../dom/" + file;
      script.onload = resolve;
      script.onerror = () => reject(Error("画面用の実行環境を開けませんでした。"));
      document.head.append(script);
    });
  })().catch(e => { domToolsLoaded=undefined; throw e; });
  return domToolsLoaded;
}
function typedDomRun(lesson, code, box, grading) {
  const tests = grading ? lesson.dom.tests : [];
  const guarded = limitDomLoops(code);
  const visible = domFrame("自分で操作するクイズ画面",lesson.dom.html,guarded,[],lesson.dom.setup);
  visible.className = "ts-preview";
  const tested = tests.length ? domFrame("型付きクイズの動作確認",lesson.dom.html,guarded,tests,lesson.dom.setup) : visible;
  let finish;
  const result = new Promise(resolve => {
    const done = data => {
      clearTimeout(timer);
      window.removeEventListener("message",receive);
      if(tested!==visible) tested.remove();
      resolve(data);
    };
    const receive = e => {
      if(e.source !== tested.contentWindow || !e.data?.domWorkshop) return;
      if(typeof e.data.error === "string") done({ error:e.data.error });
      else if(Number.isInteger(e.data.done) && e.data.done >= 0 && e.data.done <= tests.length)
        done({ done:e.data.done, hint:String(e.data.hint || "") });
    };
    const timer = setTimeout(()=>done({error:"時間がかかったため停止しました。入力を直して再試行できます。"}),7000);
    finish = () => { visible.remove(); done({error:"停止しました。"}); };
    window.addEventListener("message",receive);
    box.replaceChildren(visible);
    if(tested!==visible) { tested.hidden=true; box.append(tested); }
  });
  return {result,stop:()=>finish()};
}
