"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");

const python = path.resolve(__dirname, "../python");
const kit = path.join(python, "csv-kit");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "yomikumu-csv-"));

function run(directory, args, input) {
  const result = spawnSync("python3", ["-B", ...args], { cwd: directory, input, encoding: "utf8" });
  if (result.error) throw result.error;
  return result;
}

const runner = `
import contextlib
import io
import json
import sys

request = json.load(sys.stdin)
namespace = {"__name__": "__main__"}
output = io.StringIO()
sys.stdin = io.StringIO(request["input"] + "\\n")
value, error = None, None
try:
    with contextlib.redirect_stdout(output):
        exec(request["before"], namespace)
        exec(request["source"], namespace)
        if request["observe"]:
            value = eval(request["observe"], namespace)
except Exception as exc:
    error = type(exc).__name__ + ": " + str(exc)
print(json.dumps({"output": output.getvalue(), "value": value, "error": error}))
`;

function attempt(source, files = {}, test = {}) {
  const directory = fs.mkdtempSync(path.join(root, "case-"));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(directory, name), content);
  }
  const data = JSON.stringify({
    source, before: test.before || "", input: test.input || "", observe: test.observe || "",
  });
  const result = run(directory, ["-c", runner], data);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

try {
  const context = vm.createContext({});
  const chunk = name => fs.readFileSync(path.join(python, name), "utf8");
  vm.runInContext(chunk("model.js"), context);
  const chapterPath = path.join(python, "csv-practice.js");
  if (fs.existsSync(chapterPath)) vm.runInContext(chunk("csv-practice.js"), context);
  const chapter = vm.runInContext('pythonChapters.find(chapter => chapter.id === "csv")', context);
  assert.ok(chapter, "CSV章を登録する");
  assert.equal(chapter.engine, "cpython");

  const examples = [
    ["reading.csv", "35\n"],
    ["reading_with_comma.csv", "20\n"],
    ["reading_empty.csv", "0\n"],
    ["reading_invalid.csv", "3行目の分を確認してください\n"],
  ];
  for (const [name, expected] of examples) {
    const csv = fs.readFileSync(path.join(kit, name), "utf8");
    assert.equal(chapter.demo.files[name], csv, "ブラウザとPCで同じ記録を使う");
    const outcome = attempt(chapter.demo.code, chapter.demo.files, { input: name });
    assert.equal(outcome.error, null, name);
    assert.equal(outcome.output, expected, name);
  }

  assert.equal(chapter.lessons.length, 7);
  for (const lesson of chapter.lessons) {
    assert.equal(lesson.quiz[1].length, 4);
    const result = attempt(lesson.code, lesson.files, lesson);
    assert.equal(result.error, null, lesson.title);
    assert.equal(result.output, lesson.output + "\n", lesson.title);
    for (const task of [lesson.guide, lesson.write]) {
      if (task === lesson.write) assert.equal(task.starter, "");
      if (task === lesson.write && task.solution.split("\n").length >= 4) {
        assert.ok(task.tapFocus?.length, lesson.title + "の行選択で練習箇所を絞る");
        for (const line of task.tapFocus) {
          assert.ok(task.solution.includes(line), lesson.title + "の選択行が見つかる");
        }
      }
      for (const test of task.cases) {
        const outcome = attempt(task.solution, task.files, test);
        const message = lesson.title + " / " + test.label;
        assert.equal(outcome.output, test.want, message);
        if (test.error) assert.ok(outcome.error?.startsWith(test.error), message + " / " + outcome.error);
        else assert.equal(outcome.error, null, message);
        if (test.observe && !test.error) assert.deepEqual(outcome.value, JSON.parse(JSON.stringify(test.value)), message);
      }
    }
  }

  const directory = fs.mkdtempSync(path.join(root, "kit-"));
  const unpack = run(directory, ["-c", `
from pathlib import Path
from zipfile import ZipFile
import sys

source = Path(sys.argv[1])
with ZipFile(source.parent / "reading-csv.zip") as archive:
    expected = ["README.md", "reading_summary.py", "test_reading_summary.py", *sys.argv[2:]]
    assert sorted(archive.namelist()) == sorted(expected), archive.namelist()
    for name in expected:
        assert archive.read(name) == (source / name).read_bytes(), name
    archive.extractall()
`, kit, ...examples.map(([name]) => name)]);
  assert.equal(unpack.status, 0, unpack.stderr);
  const program = path.join(directory, "reading_summary.py");
  const red = run(directory, ["-m", "unittest", "-v"]);
  assert.equal(red.status, 1, red.stderr);
  assert.match(red.stderr, /AssertionError: 2 != 35/, "練習の初期コードでは件数を足したため失敗する");

  fs.copyFileSync(path.join(kit, "answer_reading_summary.py"), program);
  fs.writeFileSync(path.join(directory, "test_added.py"), `import unittest
from reading_summary import total_minutes

class MoreChecks(unittest.TestCase):
    def test_title_with_comma(self):
        self.assertEqual(total_minutes("reading_with_comma.csv"), 20)
`);
  const green = run(directory, ["-m", "unittest", "-v"]);
  assert.equal(green.status, 0, green.stderr);
  assert.match(green.stderr, /Ran 4 tests/);
  assert.match(green.stderr, /test_title_with_comma.*ok/);

  for (const [name, expected] of examples) {
    const result = run(directory, ["reading_summary.py", name]);
    if (name === "reading_invalid.csv") {
      assert.equal(result.status, 1);
      assert.equal(result.stderr, expected);
      assert.equal(result.stdout, "");
    } else {
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout, expected);
    }
  }
  console.log("CSV教材の例・模範解答・PC演習の失敗と成功を確認");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
