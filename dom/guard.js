"use strict";
// Acorn 8.16.0 (Node.js同梱版、dom/vendor/ACORN-LICENSE)で実際の文を特定する。
function limitDomLoops(code) {
  if (code.length > 64000) throw Error("入力は64000文字までです。");
  const tree = acorn.parse(code, { ecmaVersion: "latest", locations: true });
  const edits = [];
  const guard = "__yomikumu" + crypto.getRandomValues(new Uint32Array(2)).join("");
  const loops = new Set(["WhileStatement", "DoWhileStatement", "ForStatement", "ForInStatement", "ForOfStatement"]);
  const pending = [tree];
  while (pending.length) {
    const current = pending.pop();
    if (!current || typeof current.type !== "string") continue;
    if (loops.has(current.type)) {
      const body = current.body;
      const tick = guard + "(" + current.loc.start.line + ");";
      if (body.type === "BlockStatement") edits.push([body.start + 1, tick]);
      else edits.push([body.start, "{" + tick], [body.end, "}"]);
    }
    for (const value of Object.values(current)) {
      if (Array.isArray(value)) for (const child of value) pending.push(child);
      else if (value?.type) pending.push(value);
    }
  }
  if (!edits.length) return code;
  // 元の文字位置を保つため後ろから挿入する。同位置に並ぶ閉じ括弧は同じ文字。
  const pieces = [];
  let end = code.length;
  for (const [position, text] of edits.sort((a, b) => b[0] - a[0])) {
    pieces.push(code.slice(position, end), text);
    end = position;
  }
  pieces.push(code.slice(0, end));
  // 元コードのディレクティブや宣言のスコープを変えず、最初の実行文の直前に置く。
  const first = tree.body.find(statement => !statement.directive).start;
  const body = pieces.reverse().join("");
  const declaration = `\nconst ${guard} = (() => {
    let count = 0;
    return line => {
      if (++count > 20000) throw Error(line + "行目の繰り返しを中断しました。終了条件を見直してください。");
    };
  })();\n`;
  return body.slice(0, first) + declaration + body.slice(first);
}
