"use strict";

{
  const lists = (empty, one, many) => [
    check("記録なし", empty, { before: "loans = []" }),
    check("一件だけ", one, { before: "loans = [4]" }),
    check("三件", many, { before: "loans = [2, 3, 1]" }),
  ];
  const pairs = (outputs, observe, values) => [
    check("最初の記録", outputs[0], { before: "cards = [2, 4]", observe, value: values[0] }),
    check("別の日の記録", outputs[1], { before: "cards = [6, 1, 5]", observe, value: values[1] }),
  ];
  pythonChapters.push({
    id: "56", title: "貸出記録をまとめて読む",
    goal: "貸出件数のリストを合計し、名前を指定して作品別の件数を読み出します。",
    demo: {
      prompt: "「月」か「雲」を入力し、全体の貸出件数とその作品の件数を比べましょう。",
      code: 'loans = [2, 4]\ntotal = 0\nfor count in loans:\n    total = total + count\nworks = {"月": 2, "雲": 4}\nprint(total)\nprint(works[input()])', input: "月",
    },
    lessons: [
      {
        title: "並んだ記録の先頭を読む", text: "リストは記録を順番にまとめます。角かっこに値を並べ、位置で取り出します。位置（添字）は0から始まり、cards[0] は先頭、cards[1] は2番目です。",
        code: "cards = [2, 4]\nprint(cards[0])", output: "2",
        quiz: ["[5, 8] の先頭を読む書き方は？", ["cards[1]", "cards[5]", "cards[0]", "cards[8]"], 2, "先頭の位置は、入っている数とは別に0と決まります。"],
        guide: exercise("先頭の代わりに2番目の貸出件数を表示しましょう。", "print(cards[0])", "print(cards[1])", pairs(["4\n", "1\n"], null, []), "2番目の位置は 1 です。"),
        write: exercise("貸出件数の4と7をこの順にリスト cards に入れ、先頭の値を表示しましょう。", "", "cards = [4, 7]\nprint(cards[0])", [check("リストの中身と先頭の値", "4\n", { observe: "cards", value: [4, 7] })], "角かっこで2件をまとめたら、位置0を表示します。"),
      },
      {
        title: "一件だけ書き換える", text: "cards[0] = 8 と書くと、リストの先頭が8に変わります。2番目の値は4のままです。",
        code: "cards = [2, 4]\ncards[0] = 8\nprint(cards)", output: "[8, 4]",
        quiz: ["cards[1] = 8 なら完成するリストは？", ["[8, 4]", "[2, 8]", "[8]", "[2, 4, 8]"], 1, "位置1にあった4だけが8に変わります。"],
        guide: exercise("先頭を8の代わりに9に直し、全体を表示しましょう。", "cards[0] = 8\nprint(cards)", "cards[0] = 9\nprint(cards)", pairs(["[9, 4]\n", "[9, 1, 5]\n"], "cards", [[9, 4], [9, 1, 5]]), "先頭の位置は変えず、代入の右側を9にします。"),
        write: exercise("cards の2番目の件数に1を足し、更新したリストを表示しましょう。", "", "cards[1] = cards[1] + 1\nprint(cards)", pairs(["[2, 5]\n", "[6, 2, 5]\n"], "cards", [[2, 5], [6, 2, 5]]), "位置1の元の値に1を足し、同じ位置に戻します。"),
      },
      {
        title: "貸出件数を順に足して合計する", text: "まず合計を0にします。for で、一件ずつ今の合計に足していきます。空のリストなら一度も足さず、合計は0のままです。",
        code: "loans = [2, 3, 1]\ntotal = 0\nfor count in loans:\n    total = total + count\nprint(total)", output: "6",
        quiz: ["loans が [] なら、最後の表示は？", ["1", "エラー", "何も出ない", "0"], 3, "表示する行は for の外にあり、最初の0を出します。"],
        guide: exercise("最初から1件加算される見本を直し、貸出件数だけを合計しましょう。", "total = 1\nfor count in loans:\n    total = total + count\nprint(total)", "total = 0\nfor count in loans:\n    total = total + count\nprint(total)", lists("0\n", "4\n", "6\n"), "最初の total は0です。そこにリストの件数を順に足します。"),
        write: exercise("前日から持ち越した3件に、今日の loans をすべて足し、最後の合計だけを表示しましょう。", "", "total = 3\nfor count in loans:\n    total = total + count\nprint(total)", lists("3\n", "7\n", "9\n"), "持ち越しを一度だけ入れ、最後の print を for の外に置きます。"),
      },
      {
        title: "二つの変数で同じリストを使う", text: "desk = cards と書くと、二つの変数が同じリストを指します。desk[0] を7に変えると、cards[0] を表示したときも7になります。",
        code: "cards = [2, 4]\ndesk = cards\ndesk[0] = 7\nprint(cards[0])", output: "7",
        quiz: ["desk[1] = 9 とした後の cards[1] は？", ["4", "2", "9", "7"], 2, "名前が二つあっても、見ているリストは一つです。"],
        guide: exercise("desk から先頭を5に直し、cards の先頭でも5になったことを表示しましょう。", "desk = cards\ndesk[0] = 7\nprint(cards[0])", "desk = cards\ndesk[0] = 5\nprint(cards[0])", pairs(["5\n", "5\n"], "desk is cards", [true, true]), "desk = cards の次の行で、desk[0] に5を入れます。"),
        write: exercise("同じ記録に shelf という別名を付け、shelf の2番目を8にして、cards 全体を表示しましょう。", "", "shelf = cards\nshelf[1] = 8\nprint(cards)", pairs(["[2, 8]\n", "[6, 8, 5]\n"], "shelf is cards", [true, true]), "shelf = cards としてから、位置1だけを直します。"),
      },
      {
        title: "元の貸出記録を残す", text: "試しに件数を変えるなら、別のリストを用意します。cards[:] は、ここで使う数のリスト全体を新しいリストに写します。コピーを直しても元の値は変わりません。",
        code: "cards = [2, 4]\ntrial = cards[:]\ntrial[0] = 7\nprint(cards[0])\nprint(trial[0])", output: "2\n7",
        quiz: ["元を残して件数を試せる一行は？", ["trial = cards", "trial = cards[0]", "cards = trial", "trial = cards[:]"], 3, "[:] はこのリストの中身を新しいリストに写します。"],
        guide: exercise("trial の先頭だけを7に変えましょう。元の cards の先頭、コピーの trial の先頭の順に表示します。", "trial = cards\ntrial[0] = 7\nprint(cards[0])\nprint(trial[0])", "trial = cards[:]\ntrial[0] = 7\nprint(cards[0])\nprint(trial[0])", pairs(["2\n7\n", "6\n7\n"], "trial is cards", [false, false]), "trial を作る行で cards[:] を使い、別のリストにします。"),
        write: exercise("cards を trial に写し、コピーの2番目だけを0にして、元の全体とコピー全体の順に表示しましょう。", "", "trial = cards[:]\ntrial[1] = 0\nprint(cards)\nprint(trial)", pairs(["[2, 4]\n[2, 0]\n", "[6, 1, 5]\n[6, 0, 5]\n"], "trial is cards", [false, false]), "元のリストを表示したときに2番目が残るよう、別のリストを用意します。"),
      },
      {
        title: "作品名をキーに読む・書く", text: '順番を覚えずに作品名で引きたいときは、辞書を使います。{名前: 件数} の名前がキーです。works["月"] = 4 で、その作品の値だけを直せます。',
        code: 'works = {"月": 2, "雲": 5}\nworks["月"] = 4\nprint(works["月"])', output: "4",
        quiz: ["辞書 works から「雲」の件数を取り出すとき、使うのはどれですか。", ["先頭の位置0", '文字のキー "雲"', "貸出件数5", "右から2番目"], 1, "辞書は、並び順に関係なくキーで値を取り出します。"],
        guide: exercise("月を4件にしたあと、見本の表示先を「雲」に変えましょう。", 'works["月"] = 4\nprint(works["月"])', 'works["月"] = 4\nprint(works["雲"])', [check("雲の記録", "5\n", { before: 'works = {"雲": 5, "月": 2}', observe: 'works["月"]', value: 4 })], "表示する行のキーを「雲」に変えます。"),
        write: exercise("用意された辞書 works から、入力した作品名の件数だけを表示しましょう。", "", "title = input()\nprint(works[title])", [check("雲を引く", "3\n", { input: "雲", before: 'works = {"月": 6, "雲": 3}' }), check("月を引く", "6\n", { input: "月", before: 'works = {"雲": 3, "月": 6}' })], "作品名を受け取り、その値を角かっこに入れます。"),
      },
    ],
  });
}
