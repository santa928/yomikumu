"use strict";

// 各行は、見本変更の別解、自力課題の典型誤答、自力課題の別解。
module.exports = {
  54: [
    ["print('受付')", "print('開館')", "print('閉館')"],
    ["work = '舟'\nprint(work)", "room = '西室'\nprint('room')", "room = '西室'\nsign = room\nprint(sign)"],
    ["count = 3 + 2\nprint(count)", 'print("4" + "2")', "after = 4 + stock\nprint(after)"],
    ["print(input())", "print(input())\nprint('展示')", "print('展示')\nprint(input())"],
    ["print(2 + int(input()))", "name = input()\nprint(name)\nprint(input() + '3')", "print(input())\nprint(3 + int(input()))"],
  ],
  55: [
    ["print(10 <= seats)", "print(seats <= 10)", "print(10 > seats)"],
    ["if 10 <= seats:\n    print('団体受付')", "if seats < 10:\n    print('残りわずか')\n    print('開場')", "if 10 > seats:\n    print('残りわずか')\nprint('開場')"],
    ["if seats < 10:\n    print('個人')\nelse:\n    print('団体')", "if seats >= 10:\n    print('大会場')\nelse:\n    print('小会場')", "if seats <= 10:\n    print('小会場')\nelse:\n    print('大会場')"],
    ["print(1 + position)", "print(20)", "ticket = position + 20\nprint(ticket)"],
    ["for i in range(1, count + 1):\n    print(i)", "for i in range(10, count):\n    print(i)", "for i in range(10, 10 + count):\n    print(i)"],
  ],
};

module.exports[56] = [
  ["second = cards[1]\nprint(second)", "cards = [4, 7]\nprint(cards[1])", "cards = list((4, 7))\nprint(cards[0])"],
  ["cards[0] = 3 * 3\nprint(cards)", "cards[0] += 1\nprint(cards)", "cards[1] += 1\nprint(cards)"],
  ["print(sum(loans))", "total = 0\nfor n in loans:\n    total += n\nprint(total)", "print(3 + sum(loans))"],
  ["desk = cards\ncards[0] = 5\nprint(desk[0])", "shelf = cards[:]\nshelf[1] = 8\nprint(cards)", "shelf = cards\nshelf[1] = 4 + 4\nprint(shelf)"],
  ["trial = list(cards)\ntrial[0] = 7\nprint(cards[0])\nprint(trial[0])", "trial = cards\ntrial[1] = 0\nprint(cards)\nprint(trial)", "trial = list(cards)\ntrial[1] = 0\nprint(cards)\nprint(trial)"],
  ["works['月'] = 4\nkey = '雲'\nprint(works[key])", "print(works['月'])", "print(works[input()])"],
];

module.exports[57] = [
  ["def greet():\n    print('受付')\ngreet()", "def pay():\n    print('精算')\npay()", "def pay():\n    print('精算')\nfor i in range(2):\n    pay()"],
  ["def show_price(n):\n    print(50 * n)\nfor i in [2,4]:\n    show_price(i)", "def bill(count):\n    print(80)\nbill(1)\nbill(3)", "def bill(n):\n    print(80 * n)\nfor i in [1,3]:\n    bill(i)"],
  ["def price(n):\n    total = 100 * n\n    return total", "def total(n):\n    print(n * 60)\namount = total(3)\nprint(amount + 5)", "def total(n):\n    return 60 * n\namount = total(3)\nprint(5 + amount)"],
  ["def minus(n):\n    result = n - 1\n    return result", "def sale(amount):\n    print(amount - 3)", "def sale(n):\n    n -= 3\n    return n"],
  ["amount = 100\ndef discount(n):\n    return n - 5\nprint(discount(40))\nprint(amount)", "amount = 200\ndef member(amount):\n    return amount - 20\namount = member(amount)\nprint(amount)\nprint(amount)", "def member(price):\n    return price - 20\namount = 200\nreduced = member(amount)\nprint(reduced)\nprint(amount)"],
];

module.exports[58] = [
  ["def add_two(amount):\n    return 2 + amount", "def as_count(text):\n    return text", "def as_count(line):\n    number = int(line)\n    return number"],
  ["from counts import as_count\nline = input()\nprint(as_count(line))", "from counts import as_count\nprint(input() + '2')", "from counts import as_count\nadded = 2 + as_count(input())\nprint(added)"],
  ["from counts import as_count\nnumber = as_count(input())\nprint(number)", "from counts import as_count\nprint(as_count(input()))\nprint('開始')", "from counts import as_count\nprint('開始')\nnumber = as_count(input())\nprint(number)"],
  ["import counts\ntry:\n    print(counts.as_count(input()))\nexcept ValueError:\n    print('もう一度')", "from counts import as_count\nprint(as_count(input()) + 1)", "import counts\ntry:\n    print(1 + counts.as_count(input()))\nexcept ValueError:\n    print('数を確認')"],
  ["import counts\ntry:\n    a = counts.as_count(input())\n    print(a)\n    print(a + counts.as_count(input()))\nexcept ValueError:\n    print('数字を入力')", "from counts import as_count\na = as_count(input())\nprint(a)\nprint(a + as_count(input()))", "from counts import as_count\ntry:\n    first = as_count(input())\n    print(first)\n    print(as_count(input()) + first)\nexcept ValueError:\n    print('数字を入力')"],
];

module.exports[59] = [
  ["print([m / 60 for m in minutes])", "print([m for m in minutes])", "print([m + 5 for m in minutes])"],
  ["print([60 * m for m in minutes])", "print([m + 2 for m in minutes])", "x = []\nfor m in minutes:\n    x.append(m + m)\nprint(x)"],
  ["x = []\nfor m in minutes:\n    if m >= 30:\n        x.append(m)\nprint(x)", "print([m for m in minutes if m <= 30])", "print(list(filter(lambda t: t < 30, minutes)))"],
  ["print([x / 60 for x in minutes if x > 59])", "print([m + 10 for m in minutes if m >= 30])", "x = []\nfor m in minutes:\n    if m > 30:\n        x.append(10 + m)\nprint(x)"],
];

module.exports[60] = [
  ["r = iter(rows)\nprint(list(r))", "reader = rows", "reader = (item for item in rows)"],
  ["reader = iter([2, 5])\nfor num in reader:\n    print(num)", "print(next(iter(rows)))", "reader = iter(rows)\nfirst = next(reader)\nsecond = next(reader)\nprint(second)"],
  ['r = iter([5])\nprint(next(r))\nprint(next(r, "終"))', "r = iter(rows)\nlist(r)\nprint(next(r, 0))\nprint(next(r, 0))", "r = iter(rows)\nfor n in r:\n    pass\nprint(next(r, 0))\nfresh = iter(rows)\nprint(next(fresh, 0))"],
  ["def supply():\n    for n in [2, 7]:\n        yield n", "def supply(rows):\n    return rows", "def supply(rows):\n    return (n for n in rows)"],
  ["a, b = supply(), supply()\nprint(next(a))\nprint(next(b))", "def supply(rows):\n    return iter(rows)\na = supply(rows)\nb = a\nprint(next(a, 0))\nprint(next(a, 0))\nprint(next(b, 0))", "def supply(rows):\n    return iter(rows)\na, b = supply(rows), supply(rows)\nfor reader in [a, a, b]:\n    print(next(reader, 0))"],
];
