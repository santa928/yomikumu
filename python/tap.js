"use strict";

// 長い自力課題では、その段で初めて扱う操作をスマホの空欄にする。
const pythonTapFocus = {
  "54/5": ["int(input())", "count + 3"],
  "56/3": ["total = 3", "total = total + count"], "57/1": ["def pay", "pay()"],
  "57/2": ["count * 80", "bill(3)"], "63/5": ["@staticmethod", "return int(text)"],
  "55/3": ["if seats", "else:"], "56/5": ["trial = ", "trial[1]"],
  "57/3": ["return ", "amount = "], "57/5": ["return ", "print(member"],
  "58/4": ["as_count(input())", "except ValueError"], "58/5": ["first = ", "second = ", "first + second"],
  "59/1": ["for m in", ".append("],
  "60/3": ["list(r)", "next(iter(rows)"], "60/5": ["yield ", "b = supply", "next(b"],
  "61/1": [".read()", ".close()"], "61/3": ["with ", "note.read()"],
  "61/4": ["events.append('開く')", "events.append('閉じる')", "return False"],
  "62/2": ["@dataclass", "pages: int"], "62/5": ["with notes", "not valid", "total += 1"],
  "62/6": ["not valid", "minutes >= 60", "total += "],
  "63/2": ["a = ", "b = ", "b.pages = "], "63/3": ["def reset", "self.pages = 0"],
  "63/4": ["@classmethod", "def from_text", "return cls"], "63/6": ["b.mine", "Book.quote", "Book.multiply"],
  "64/1": ["self.rate =", "return "], "64/3": ["self.policy =", "return self.policy"],
  "64/4": ["self.dest =", "self.dest.append"],
  "65/1": ["@property", "def points", "return self._pages * 2"],
  "65/2": ["@pages.setter", "value < 0 or", "self._pages = value"],
  "65/3": ["book.pages = -1", "except ValueError", "book.pages = 8"],
  "65/4": ["def __len__", "return len("], "65/5": ["def __str__", "return '件数='"],
  "65/6": ["def fork", "self.marks[:]"],
  "66/2": ["def apply", "return value", "return apply"],
  "66/3": ["*args, **kwargs", "calls.append", "return fn("], "66/4": ["@logged", "def minus"],
  "66/5": ["@wraps", "calls.append", "return fn("],
  "67/1": ["morning =", "night ="], "67/3": ["tracked =", "tracked('海')"],
  "67/4": ["history = []", "history.append", "wrapper.history ="],
  "67/5": ["@wraps", "raise", "history.append(label + '成功')"],
};
function tapTemplate(task, view, stepId, saved) {
  const lines = task.solution.split("\n");
  if (lines.length < 4) return null;
  const initial = task.starter.split("\n");
  let slots = [];
  if (view === "guide") {
    slots = lines.map((line, i) => initial.includes(line) ? -1 : i).filter(i => i >= 0);
  } else {
    for (const target of task.tapFocus || pythonTapFocus[stepId] || []) {
      const index = lines.findIndex((line, i) => !slots.includes(i) && line.includes(target));
      if (index >= 0) slots.push(index);
    }
  }
  if (!slots.length && view === "guide") slots.push(lines.length - 1);
  if (!slots.length) return null;
  slots = slots.slice(0, 3).sort((a, b) => a - b);
  // 旧形式で途中まで一行ずつ組んだ下書きは、そのまま最後まで組める。
  if (saved && (saved.length !== lines.length || lines.some((line, i) => !slots.includes(i) && saved[i] !== line))) return null;
  const placeholders = slots.map((i, n) => lines[i].match(/^\s*/)[0] + "# 空欄 " + (n + 1));
  const program = saved ? [...saved] : lines.map((line, i) => slots.includes(i) ? placeholders[slots.indexOf(i)] : line);
  const pending = slots.findIndex((i, n) => program[i] === placeholders[n]);
  const count = pending < 0 ? slots.length : pending;
  const index = slots[count];
  const candidates = [];
  if (index !== undefined) {
    const options = [lines[index], initial[index], ...(task.distractors || []), lines[index - 1], lines[index + 1], ...initial, ...lines];
    for (const line of options) {
      if (line && !candidates.includes(line)) candidates.push(line);
      if (candidates.length === 4) break;
    }
    candidates.sort();
  }
  return { program, slots, placeholders, count, index, candidates };
}
