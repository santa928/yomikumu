"use strict";
const {verifyDom} = require("./dom-check.cjs");
const assert = require("node:assert/strict");

verifyDom("book-memos", [
  [null, source => source.replace("（{book.id}）", '（{book["id"]}）')],
  [null, source => source.replace("key={book.id}", 'key={String(book.id)}')],
], async frame => {
  await frame.getByRole("textbox", {name:"A17のメモ"}).fill("返却は金曜");
  await frame.getByRole("button", {name:"順番を逆にする"}).click();
  assert.equal(await frame.getByRole("textbox", {name:"A17のメモ"}).inputValue(), "返却は金曜");
  await frame.getByRole("button", {name:"B24を外す"}).click();
  assert.equal(await frame.getByRole("textbox").count(), 1);
}, "react").catch(error => { console.error(error); process.exitCode = 1; });
