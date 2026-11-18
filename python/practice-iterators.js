"use strict";

{
  const rows = (a, b, c) => [[], [7], [2, 4, 8]].map((data, i) =>
    check(["空の記録", "一件の記録", "三件の記録"][i], [a, b, c][i], { before: "rows = " + JSON.stringify(data) }));
  pythonChapters.push({
    id: "60", title: "読書記録を一件ずつ渡す",
    goal: "読書記録のリストから値を一つずつ取り出します。同じリストから二つのイテレーターを作ると、それぞれ別の位置まで読み進められます。",
    demo: { prompt: "完成例では、入力した数と、それに2を足した数を順に取り出せます。3を入力すると、a からは3と5、まだ何も取り出していない b からは3が表示されます。", input: "3",
      code: "def supply(first):\n    yield first\n    yield first + 2\nfirst = int(input())\na = supply(first)\nb = supply(first)\nprint(next(a))\nprint(next(a))\nprint(next(b))" },
    lessons: [
      {
        title: "リストからイテレーターを作る", text: "iter(rows) は、リスト rows の値を順に取り出せるイテレーターを作ります。次に取り出す位置はイテレーターに記録されます。list(reader) は、残っている値をすべて取り出してリストにします。",
        code: "rows = [2, 5]\nreader = iter(rows)\nprint(list(reader))", output: "[2, 5]",
        quiz: ["読んだ位置を覚えて進むものは？", ["元の一覧", "iter が作ったイテレーター", "表示した数", "角かっこ"], 1, "iter(rows) で作ったイテレーターに、次の値を取り出す位置が記録されます。"],
        guide: exercise("iter に空のリストの代わりに rows を渡し、その中の値をすべて表示しましょう。", "reader = iter([])\nprint(list(reader))", "reader = iter(rows)\nprint(list(reader))", rows("[]\n", "[7]\n", "[2, 4, 8]\n"), "iter の丸かっこに用意された一覧を渡します。"),
        write: exercise("rows のイテレーターを作り、reader に代入しましょう。採点で先頭から値を取り出すので、ここでは代入だけを書きます。", "", "reader = iter(rows)", [check("未読の二件", "", { before: "rows = [4, 6]", observe: "[iter(reader) is reader, list(reader)]", value: [true, [4, 6]] }), check("空のリストを使用", "", { before: "rows = []", observe: "list(reader)", value: [] })], "reader をリストの別名にせず、iter(rows) の結果を受け取ります。"),
      },
      {
        title: "next で値を一つ取り出す", text: "next(reader) を呼ぶたびに、reader から値が一つ返ります。[2, 5] から作った reader では、最初に2、次に5が返ります。",
        code: "reader = iter([2, 5])\nprint(next(reader))\nprint(next(reader))", output: "2\n5",
        quiz: ["[2, 5, 8] で next を二回呼ぶと順に？", ["2、2", "5、8", "2、5", "8、5"], 2, "次の位置を覚えているので、先頭の次は5です。"],
        guide: exercise("二度目も同じ reader から読み、2、5の二行を表示しましょう。", "reader = iter([2, 5])\nprint(next(reader))\nprint(next(iter([2, 5])))", "reader = iter([2, 5])\nprint(next(reader))\nprint(next(reader))", [check("続けて二回", "2\n5\n")], "2回目の next にも、最初と同じ reader を渡します。"),
        write: exercise("rows の先頭を一件だけ読み飛ばし、二件目を表示しましょう。ここでは rows に二件以上あります。", "", "r = iter(rows)\nnext(r)\nprint(next(r))", [check("初日の二件", "5\n", { before: "rows = [2, 5]" }), check("別日の二件", "9\n", { before: "rows = [4, 9, 8]" })], "一回目は next の結果を表示せず、二回目だけを print します。"),
      },
      {
        title: "次の値がないときに返す値を決める", text: "読み終わった後に next(reader, 0) を呼ぶと、次の値の代わりに指定した0を返せます。もう一度先頭から読むには、元のリストを使って iter(rows) をもう一度呼びます。",
        code: "rows = [5]\nr = iter(rows)\nprint(next(r, 0))\nprint(next(r, 0))\nprint(next(iter(rows), 0))", output: "5\n0\n5",
        quiz: ["空のリストで next(iter([]), 8) を呼ぶと？", ["0", "8", "空文字", "一覧"], 1, "読む値がないので、代わりに指定した8が返ります。"],
        guide: exercise("読み終わった時の印を0から「終」に変え、一件、最後の印を順に表示しましょう。", 'r = iter([5])\nprint(next(r))\nprint(next(r, 0))', 'r = iter([5])\nprint(next(r))\nprint(next(r, "終"))', [check("最後の印", "5\n終\n")], "二つ目の next の第2引数に文字の「終」を渡します。"),
        write: exercise("rows のイテレーターからすべての値を取り出しましょう。その後、同じイテレーターで next を呼んだ結果と、新しく作ったイテレーターで next を呼んだ結果を順に表示します。値がないときは0を表示してください。", "", "r = iter(rows)\nlist(r)\nprint(next(r, 0))\nprint(next(iter(rows), 0))", rows("0\n0\n", "0\n7\n", "0\n2\n"), "読み終わった r と新しい iter(rows) を使い分けます。"),
      },
      {
        title: "yield で一件ずつ渡す", text: "yield を含む関数を呼ぶと、ジェネレーターというイテレーターができます。この例で最初に next(r) を呼ぶと、yield 2 で2を返して一時停止します。次の next(r) は続きから実行し、5を返します。",
        code: "def supply():\n    yield 2\n    yield 5\nr = supply()\nprint(next(r))\nprint(next(r))", output: "2\n5",
        quiz: ["最初の yield 2 の次に再開するのはいつ？", ["定義した直後", "関数名を書くだけ", "次の next のとき", "最初からやり直す"], 2, "値を渡した位置で止まり、次の要求でその続きに進みます。"],
        guide: exercise("ジェネレーター supply が2の次に7を渡すよう、二つ目の値を直しましょう。", "def supply():\n    yield 2\n    yield 5", "def supply():\n    yield 2\n    yield 7", [check("順に読む", "", { observe: "list(supply())", value: [2, 7] })], "二つ目の yield を直します。"),
        write: exercise("supply(rows) を作り、受け取った記録を1件ずつ yield しましょう。空なら渡す値はありません。", "", "def supply(rows):\n    for row in rows:\n        yield row", [check("空", "", { observe: "list(supply([]))", value: [] }), check("順番", "", { observe: "list(supply([6, 9]))", value: [6, 9] }), check("一件だけ読む", "", { observe: "next(supply([3]))", value: 3 })], "for の中で return すると最初で終わります。yield で渡しましょう。"),
      },
      {
        title: "二つのジェネレーターから値を取り出す", text: "supply() を2回呼ぶと、a と b に別々のジェネレーターができます。a から3と7を取り出したあとも、b の最初の値は3です。b = a と書くと、両方が同じジェネレーターを指します。",
        code: "def supply():\n    yield 3\n    yield 7\na = supply()\nb = supply()\nprint(next(a))\nprint(next(a))\nprint(next(b))", output: "3\n7\n3",
        quiz: ["a から2件取り出したあと、b から初めて取り出す値は？", ["3", "7", "空", "a の次の値"], 0, "b からはまだ値を取り出していないので、最初の yield が返す3を受け取れます。"],
        guide: exercise("a と b に別々のジェネレーターを作り、それぞれの先頭の値を表示しましょう。関数 supply は用意されています。", "a = supply()\nb = a\nprint(next(a))\nprint(next(b))", "a = supply()\nb = supply()\nprint(next(a))\nprint(next(b))", [check("独立した始点", "3\n3\n", { before: "def supply():\n    yield 3\n    yield 7" })], "b にも supply() の返り値を代入します。"),
        write: exercise("rows の値を順に返す supply(rows) を定義し、ジェネレーターを二つ作りましょう。一つ目から2件、二つ目から1件取り出し、その順に表示します。次の値がなければ0を表示します。", "", "def supply(rows):\n    for row in rows:\n        yield row\na = supply(rows)\nb = supply(rows)\nprint(next(a, 0))\nprint(next(a, 0))\nprint(next(b, 0))", rows("0\n0\n0\n", "7\n0\n7\n", "2\n4\n2\n"), "supply(rows) を2回呼んで a と b に代入し、next に a、a、b の順で渡します。"),
      },
    ],
  });
}
