"use strict";
// 授業用の完成コードから、指定した二択を一か所ずつ取り出す。
function reactBuild(code, ...choices) {
  let template = code;
  for (const [index, [answer]] of choices.entries()) {
    if (!template.includes(answer)) throw Error("組み立て欄が見つかりません: " + answer);
    template = template.replace(answer, "《" + (index + 1) + "》");
  }
  return [template, ...choices];
}
