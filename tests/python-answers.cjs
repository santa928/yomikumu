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
