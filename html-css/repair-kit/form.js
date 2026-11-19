"use strict";

const form = document.querySelector("form");
const result = document.querySelector("output");
// 送信先は用意せず、ブラウザが送信対象として集めた項目をその場で表示する。
form.addEventListener("submit", event => {
  event.preventDefault();
  const fields = Array.from(new FormData(form), ([name, value]) => name + " = " + value);
  result.textContent = fields.length ? fields.join("、") : "送る項目がありません。";
});
form.addEventListener("input", () => { result.textContent = ""; });
