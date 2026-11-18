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
