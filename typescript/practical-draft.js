"use strict";

// コース単独の保存と、全コースをまとめた引き継ぎで同じファイルだけを扱う。
const practicalFilesTS = ["types.ts", "input.ts", "score.ts", "display.ts"];

function validPracticalDraftTS(files) {
  return files && typeof files === "object" && !Array.isArray(files) &&
    Object.keys(files).length === practicalFilesTS.length &&
    practicalFilesTS.every(name => Object.hasOwn(files, name) && typeof files[name] === "string");
}
