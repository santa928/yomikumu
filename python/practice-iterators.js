"use strict";

{
  const rows = (a, b, c) => [[], [7], [2, 4, 8]].map((data, i) =>
    check(["空の記録", "一件の記録", "三件の記録"][i], [a, b, c][i], { before: "rows = " + JSON.stringify(data) }));
  pythonChapters.push({
    id: "60", title: "読書記録を一件ずつ渡す",
    goal: "二人が同じ読書記録を別々の位置から読めるようにします。",
    demo: { prompt: "1行目に最初の件数を入力すると、最初の読者が二度読み、別の読者が最初から読みます。", input: "3",
      code: "def supply(first):\n    yield first\n    yield first + 2\nfirst = int(input())\na = supply(first)\nb = supply(first)\nprint(next(a))\nprint(next(a))\nprint(next(b))" },
    lessons: [
      {
        title: "一覧に読み手を用意する", text: "リストは一覧そのものです。iter(一覧) が返すイテレーターは、次にどこを読むかを覚えています。ここでは list(読み手) で、そこから読める値をまとめて確かめます。",
        code: "rows = [2, 5]\nreader = iter(rows)\nprint(list(reader))", output: "[2, 5]",
        quiz: ["読んだ位置を覚えて進むものは？", ["元の一覧", "iter が作った読み手", "表示した数", "角かっこ"], 1, "iter(rows) が返す読み手に進んだ位置が残ります。"],
        guide: exercise("読み手を作る元を空の一覧から rows に変え、読める全件を表示しましょう。", "reader = iter([])\nprint(list(reader))", "reader = iter(rows)\nprint(list(reader))", rows("[]\n", "[7]\n", "[2, 4, 8]\n"), "iter の丸かっこに用意された一覧を渡します。"),
        write: exercise("rows から reader を作ってください。自分からはまだ読み進めません。採点は読み手であることと、読める値を調べます。", "", "reader = iter(rows)", [check("未読の二件", "", { before: "rows = [4, 6]", observe: "[iter(reader) is reader, list(reader)]", value: [true, [4, 6]] }), check("空の読み手", "", { before: "rows = []", observe: "list(reader)", value: [] })], "reader をリストの別名にせず、iter(rows) の結果を受け取ります。"),
      },
      {
        title: "next は一件だけ進める", text: "next(reader) は、現在の一件を受け取って次の場所に進みます。同じ読み手を二回呼ぶと同じ値を繰り返すのではなく、次の記録へ移ります。",
        code: "reader = iter([2, 5])\nprint(next(reader))\nprint(next(reader))", output: "2\n5",
        quiz: ["[2, 5, 8] で next を二回呼ぶと順に？", ["2、2", "5、8", "2、5", "8、5"], 2, "次の位置を覚えているので、先頭の次は5です。"],
        guide: exercise("二度目も同じ reader から読み、2、5の二行を表示しましょう。", "reader = iter([2, 5])\nprint(next(reader))\nprint(next(iter([2, 5])))", "reader = iter([2, 5])\nprint(next(reader))\nprint(next(reader))", [check("続けて二回", "2\n5\n")], "二行目の next に、新しく作った読み手でなく元の reader を渡します。"),
        write: exercise("rows の先頭を一件だけ読み飛ばし、二件目を表示しましょう。ここでは rows に二件以上あります。", "", "r = iter(rows)\nnext(r)\nprint(next(r))", [check("初日の二件", "5\n", { before: "rows = [2, 5]" }), check("別日の二件", "9\n", { before: "rows = [4, 9, 8]" })], "一回目は next の結果を表示せず、二回目だけを print します。"),
      },
      {
        title: "最後・空・作り直し", text: "読み終わった後に next(reader, 0) を呼ぶと、次の値の代わりに指定した0を返せます。もう一度先頭から読むには、元のリストから新しい iter を作ります。",
        code: "rows = [5]\nr = iter(rows)\nprint(next(r, 0))\nprint(next(r, 0))\nprint(next(iter(rows), 0))", output: "5\n0\n5",
        quiz: ["空のリストで next(iter([]), 8) を呼ぶと？", ["0", "8", "空文字", "一覧"], 1, "読む値がないので、代わりに指定した8が返ります。"],
        guide: exercise("読み終わった時の印を0から「終」に変え、一件、最後の印を順に表示しましょう。", 'r = iter([5])\nprint(next(r))\nprint(next(r, 0))', 'r = iter([5])\nprint(next(r))\nprint(next(r, "終"))', [check("最後の印", "5\n終\n")], "二つ目の next の第2引数に文字の「終」を渡します。"),
        write: exercise("rows を一度最後まで読み、その読者から次に取れる値（なければ0）、新しい読者の先頭（なければ0）を表示しましょう。", "", "r = iter(rows)\nlist(r)\nprint(next(r, 0))\nprint(next(iter(rows), 0))", rows("0\n0\n", "0\n7\n", "0\n2\n"), "読み終わった r と新しい iter(rows) を使い分けます。"),
      },
      {
        title: "yield で一件ずつ渡す", text: "yield を書いた関数を呼ぶと、読み手（ジェネレーター）ができます。next されるたびに次の yield の値を一件渡して待ちます。return のように初回で関数を終わらせません。",
        code: "def supply():\n    yield 2\n    yield 5\nr = supply()\nprint(next(r))\nprint(next(r))", output: "2\n5",
        quiz: ["最初の yield 2 の次に再開するのはいつ？", ["定義した直後", "関数名を書くだけ", "次の next のとき", "最初からやり直す"], 2, "値を渡した位置で止まり、次の要求でその続きに進みます。"],
        guide: exercise("ジェネレーター supply が2の次に7を渡すよう、二つ目の値を直しましょう。", "def supply():\n    yield 2\n    yield 5", "def supply():\n    yield 2\n    yield 7", [check("順に読む", "", { observe: "list(supply())", value: [2, 7] })], "二つ目の yield を直します。"),
        write: exercise("supply(rows) を作り、受け取った記録を1件ずつ yield しましょう。空なら渡す値はありません。", "", "def supply(rows):\n    for row in rows:\n        yield row", [check("空", "", { observe: "list(supply([]))", value: [] }), check("順番", "", { observe: "list(supply([6, 9]))", value: [6, 9] }), check("一件だけ読む", "", { observe: "next(supply([3]))", value: 3 })], "for の中で return すると最初で終わります。yield で渡しましょう。"),
      },
      {
        title: "二人の読者の位置を比べる", text: "a = supply()、b = supply() の二回で、独立した読み手ができます。b = a なら同じ位置を共有します。一方だけを二度進めて違いを観察します。",
        code: "def supply():\n    yield 3\n    yield 7\na = supply()\nb = supply()\nprint(next(a))\nprint(next(a))\nprint(next(b))", output: "3\n7\n3",
        quiz: ["a を二度進めた直後、新しく作った b の先頭は？", ["3", "7", "空", "a の次の値"], 0, "呼び直した関数の読み手は、まだ一件も渡していません。"],
        guide: exercise("b を独立した読み手に直し、a の先頭、b の先頭の順に表示しましょう。supply は実行前に用意されます。", "a = supply()\nb = a\nprint(next(a))\nprint(next(b))", "a = supply()\nb = supply()\nprint(next(a))\nprint(next(b))", [check("独立した始点", "3\n3\n", { before: "def supply():\n    yield 3\n    yield 7" })], "新しい読み手は supply() をもう一度呼んで作ります。"),
        write: exercise("supply(rows) を定義し、二人の読み手を作って、一人目の1件目・2件目、二人目の1件目を表示しましょう。ない値は0を使います。", "", "def supply(rows):\n    for row in rows:\n        yield row\na = supply(rows)\nb = supply(rows)\nprint(next(a, 0))\nprint(next(a, 0))\nprint(next(b, 0))", rows("0\n0\n0\n", "7\n0\n7\n", "2\n4\n2\n"), "二人それぞれに supply(rows) を呼び、同じ読み手を使い回す場所を確かめます。"),
      },
    ],
  });
}
