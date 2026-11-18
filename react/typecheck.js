"use strict";
const reactDeclarationsUrl = new URL("vendor/react-types.js", document.currentScript.src).href;
let pendingReactDeclarations;
function loadReactDeclarations() {
  if (!pendingReactDeclarations) pendingReactDeclarations = (async () => {
    if (!window.reactTypeBundle) await new Promise((resolve, reject) => {
      const tag = document.createElement("script");
      tag.src = reactDeclarationsUrl;
      tag.onload = resolve;
      tag.onerror = () => reject(Error("Reactの型宣言を読み込めませんでした。"));
      document.head.append(tag);
    });
    const bytes = Uint8Array.from(atob(window.reactTypeBundle),c=>c.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return JSON.parse(await new Response(stream).text());
  })().catch(error=>{pendingReactDeclarations=undefined;throw error;});
  return pendingReactDeclarations;
}
