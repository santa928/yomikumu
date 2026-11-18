"use strict";
// 《1》《2》の穴に選んだコードを埋め、記述課題と同じ実ページで実行する。
const domBuilders = {
  elements: [
    ['const title = document.querySelector(《1》);\nif (title) title.textContent = 《2》;', ['"#heading"', '"#books"'], ['"光の問題"', '"雨の問題"']],
    ['document.querySelector("#dawn").classList.《1》("chosen");\ndocument.querySelector("#rain").classList.《2》("chosen");', ["remove", "add"], ["add", "remove"]],
    ['const row = document.createElement(《1》);\nrow.textContent = "星図";\ndocument.querySelector(《2》).append(row);', ['"li"', '"p"'], ['"#quiz"', '"#books"']],
    ['const list = document.querySelector(《1》);\nlist.querySelectorAll("li").forEach(row => row.classList.《2》("chosen"));', ['"#quiz"', '"#books"'], ["add", "remove"]],
    ['const row = document.createElement("li");\nrow.textContent = 《1》;\ndocument.querySelector(《2》).append(row);\nrow.classList.《3》("chosen");', ['"灯台"', '"星図"'], ['"#quiz"', '"#books"'], ["add", "remove"]],
  ],
  events: [
    ['let votes = 0;\ndocument.querySelector("#vote").addEventListener(《1》, () => {\n  votes += 《2》;\n  document.querySelector("#count").textContent = votes;\n});', ['"click"', '"input"'], ["1","2"]],
    [formReader + '\nanswer.addEventListener(《1》, () => {\n  notice.textContent = 《2》;\n});', ['"input"', '"submit"'], ["answer.value","answer.value.length"]],
    [formReader + '\nform.addEventListener(《1》, () => {\n  notice.textContent = 《2》;\n});', ['"submit"', '"input"'], ["answer.value","form.id"]],
    [formReader + '\nform.onsubmit = event => {\n  event.《1》();\n  notice.textContent = 《2》;\n};', ["preventDefault","stopPropagation"], ["answer.value","answer.id"]],
    [formReader + '\nform.onsubmit = event => {\n  event.preventDefault();\n  const value = 《1》;\n  notice.textContent = value === "" ? 《2》 : value;\n};', ["answer.value.trim()", "answer.value"], ['"作品名を入力してください"','"登録しました"']],
    [registerAnswer.replace('"submit"', '《1》').replace('answer.value.trim()', '《2》').replace('document.querySelector("#answers").append(row);','《3》'), ['"submit"', '"click"'], ["answer.value.trim()", "answer.value"], ['document.querySelector("#answers").append(row);','row.remove();']],
  ],
};
