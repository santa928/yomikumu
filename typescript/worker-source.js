"use strict";

// コンパイラの入力は仮想ファイルだけ。学習者のコードはこのWorkerでは実行しない。
const parsedLibraries = new Map();
const opts = {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
  moduleDetection: ts.ModuleDetectionKind.Legacy, strict: true, noLib: true, types: [], skipLibCheck: true
};
function inspectProgram({ source, contract = "", rules = [] }) {
  const files = { "answer.ts": source, "exercise-check.ts": contract };
  let emitted = "";
  function getSourceFile(name) {
    if (Object.hasOwn(files, name)) return ts.createSourceFile(name, files[name], opts.target, true);
    if (!Object.hasOwn(libraries, name)) return undefined;
    if (!parsedLibraries.has(name)) parsedLibraries.set(name, ts.createSourceFile(name, libraries[name], opts.target, true));
    return parsedLibraries.get(name);
  }
  const host = {
    getSourceFile, getDefaultLibFileName: () => "lib.es2022.full.d.ts",
    writeFile: (name, out) => { if (name === "answer.js") emitted = out; },
    getCurrentDirectory: () => "", getDirectories: () => [],
    fileExists: name => Object.hasOwn(files, name) || Object.hasOwn(libraries, name),
    readFile: name => files[name] ?? libraries[name],
    getCanonicalFileName: name => name, useCaseSensitiveFileNames: () => true, getNewLine: () => "\n"
  };
  const program = ts.createProgram([...Object.keys(files), ...Object.keys(libraries)], opts, host);
  const answer = program.getSourceFile("answer.ts");
  const gate = program.getSourceFile("exercise-check.ts");
  const describe = diagnostic => {
    const loc = diagnostic.file?.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    return { line: (loc?.line ?? 0) + 1, col: (loc?.character ?? 0) + 1,
      code: diagnostic.code, text: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n") };
  };
  const errors = [...program.getSyntacticDiagnostics(answer), ...program.getSemanticDiagnostics(answer)].slice(0, 8).map(describe);
  const checker = program.getTypeChecker();
  const bindings = {};
  let force = false;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      bindings[node.name.text] = { type: checker.typeToString(checker.getTypeAtLocation(node.name)), annotated: !!node.type };
    }
    if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isNonNullExpression(node) || node.kind === ts.SyntaxKind.AnyKeyword) force = true;
    ts.forEachChild(node, visit);
  }
  visit(answer);
  let missing = "";
  for (const rule of rules) {
    if (rule.kind === "annotated" && !bindings[rule.name]?.annotated) missing ||= rule.hint;
    if (rule.kind === "safe" && (force || /@ts-(?:ignore|nocheck|expect-error)/.test(source))) missing ||= rule.hint;
  }
  const contractErrors = program.getSemanticDiagnostics(gate);
  if (!errors.length) program.emit(answer);
  return { errors, bindings, missing, contractOk: contractErrors.length === 0, js: emitted };
}
self.onmessage = event => {
  try {
    if (event.data.mode === "tsx") {
      const compiled = ts.transpileModule(event.data.source, {
        fileName: "answer.tsx", reportDiagnostics: true,
        compilerOptions: { target: ts.ScriptTarget.ES2022,
          module: event.data.commonJS ? ts.ModuleKind.CommonJS : ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React }
      });
      const diagnostics = compiled.diagnostics.map(d => {
        const position = d.file?.getLineAndCharacterOfPosition(d.start ?? 0);
        return { line: (position?.line ?? 0) + 1, col: (position?.character ?? 0) + 1,
          code: d.code, text: ts.flattenDiagnosticMessageText(d.messageText, "\n") };
      });
      self.postMessage({ id: event.data.id, result: { code: compiled.outputText, diagnostics } });
    } else self.postMessage({ id: event.data.id, result: inspectProgram(event.data) });
  }
  catch { self.postMessage({ id: event.data.id, error: "型検査を完了できませんでした。入力を直して、もう一度試してください。" }); }
};
