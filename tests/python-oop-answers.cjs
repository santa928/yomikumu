"use strict";

// 各行で、正答から一か所置き換えた「見本変更の別解」「自力課題の誤答」「自力課題の別解」を試す。
module.exports = {
  63: [
    [["first = Book(9)", "first = Book(pages=9)"], ["print(entry.pages)", "print(entry)"], ["entry = Book(12)", "entry = Book(pages=12)"]],
    [["second = Book(4)", "second = Book(first.pages)"], ["b = Book(5)", "b = a"], ["b.pages = 7", "b.pages += 2"]],
    [["self.pages += amount", "self.pages = amount + self.pages"], ["self.pages = 0", "pages = 0"], ["self.pages = 0", "self.pages -= self.pages"]],
    [["return cls(0)", "return cls(pages=0)"], ["return cls(int(text))", "return Book(int(text))"], ["return cls(int(text))", "pages = int(text)\n        return cls(pages)"]],
    [["return pages * 3", "return 3 * pages"], ["    @staticmethod\n", ""], ["return int(text)", "number = int(text)\n        return number"]],
    [["Book.multiply(4, 2)", "Book.multiply(4, Book.rate)"], ["Book.multiply(n, 5)", "Book.multiply(n, Book.rate)"], ["Book.multiply(n, 5)", "b.multiply(n, 5)"]],
  ],
};

module.exports[64] = [
  [["p = Fare(5)", "p = Fare(rate=5)"], ["self.rate * days", "self.rate + days"], ["self.rate * days", "days * self.rate"]],
  [["super().price(days) - 2", "Fare.price(self, days) - 2"], ["super().price(days) + 3", "self.rate + 3"], ["super().price(days) + 3", "3 + Fare.price(self, days)"]],
  [["Fare(5)", "Fare(rate=5)"], ["return self.policy.price(days)", "return 4 * days"], ["return self.policy.price(days)", "charge = self.policy.price\n        return charge(days)"]],
  [["t.policy = Flat()", "replacement = Flat()\nt.policy = replacement"], ["self.dest.append(value)", "self.dest = [value]"], ["self.dest.append(value)", "self.dest.extend([value])"]],
];

module.exports[65] = [
  [["return self._pages", "return int(self._pages)"], ["return self._pages * 2", "return self._pages"], ["return self._pages * 2", "return 2 * self.pages"]],
  [["if value < 0:", "if not value >= 0:"], ["value > 10", "value >= 10"], ["value < 0 or value > 10", "not 0 <= value <= 10"]],
  [["print(book.pages)", "stored = book.pages\nprint(stored)"], ["print(book.pages)", "print(-1)"], ["book.pages = 8", "new_value = 8\nbook.pages = new_value"]],
  [["return len(self.titles)", "return sum(1 for title in self.titles)"], ["return len(self.marks)", "return '3'"], ["return len(self.marks)", "return sum(1 for mark in self.marks)"]],
  [["'記録' + str(len(self))", "'記録{}'.format(len(self))"], ["'件数=' + str(len(self))", "len(self)"], ["'件数=' + str(len(self))", "'件数={}'.format(len(self))"]],
  [["Log(self.marks[:])", "Log(list(self.marks))"], ["Log(self.marks[:])", "Log(self.marks)"], ["Log(self.marks[:])", "Log(list(self.marks))"]],
];

module.exports[66] = [
  [["work = plus", "work, = (plus,)"], ["return fn(value)", "return plus(value)"], ["return fn(value)", "answer = fn(value)\n    return answer"]],
  [["x + amount", "amount + x"], ["value * rate", "value + rate"], ["value * rate", "rate * value"]],
  [["return fn(*args, **kwargs)", "result = fn(*args, **kwargs)\n        return result"], ["return fn(*args, **kwargs)", "return fn(*args)"], ["return fn(*args, **kwargs)", "result = fn(*args, **kwargs)\n        return result"]],
  [["@logged\ndef plus(x):\n    return x + 1", "def plus(x):\n    return 1 + x\nplus = logged(plus)"], ["@logged\ndef minus", "def minus"], ["return n * 2", "return n + n"]],
  [["@wraps(fn)", "@wraps(wrapped=fn)"], ["    @wraps(fn)\n", ""], ["return fn(*args, **kwargs)", "result = fn(*args, **kwargs)\n        return result"]],
];

module.exports[67] = [
  [["mark('赤')", "mark(label='赤')"], ["night = mark('夜')", "night = morning"], ["night = mark('夜')", "night = mark(label='夜')"]],
  [["tracked = plan(pages)", "job = pages\ntracked = plan(job)"], ["b = night(title)", "b = a"], ["b = night(title)", "target = title\nb = night(target)"]],
  [["print(tracked(5))", "value = tracked(5)\nprint(value)"], ["tracked('海')", "mark('朝')(title)('海')"], ["print(tracked('月'))\nprint(tracked('海'))", "for name in ['月', '海']:\n    print(tracked(name))"]],
  [["b = red(pages)", "b = red(fn=pages)"], ["    history = []\n    def decorate(fn):", "    def decorate(fn):\n        history = []"], ["return fn(*args, **kwargs)", "result = fn(*args, **kwargs)\n            return result"]],
  [["except ValueError:", "except ValueError as error:"], ["                raise\n", "                return 0\n"], ["history.append(label + '成功')", "history.extend([label + '成功'])"]],
];
