"use strict";

{
  const returnChecks = (call, values, amounts = [2, 7]) => amounts.map((n, i) =>
    check(n + "枚で呼ぶ", "", { observe: call + "(" + n + ")", value: values[i] }));
  pythonChapters.push({
    id: "57", title: "料金の計算を関数にする",
    goal: "一度書いた計算に別の枚数を渡し、返った金額を次の計算に使います。",
    demo: {
      prompt: "券の枚数を一行入力しましょう。1枚100円で計算し、会員特典の20円を引いて表示します。",
      code: "def price(count):\n    return count * 100\ncount = int(input())\nprint(price(count) - 20)", input: "3",
    },
    lessons: [
      {
        title: "処理に名前を付け、呼び出す", text: "最後の greet() を実行すると「開館」と表示されます。def greet(): は greet という関数の定義です。下の字下げした行が、関数を呼ぶたびに実行されます。",
        code: 'def greet():\n    print("開館")\ngreet()', output: "開館",
        quiz: ["最後の greet() を取り去ると？", ["開館が二度出る", "開館が一度出る", "何も表示されない", "必ずエラー"], 2, "def はやることを用意します。動かすには呼び出しが必要です。"],
        guide: exercise("greet の案内を「開館」から「受付」に変えて、一度呼びましょう。", 'def greet():\n    print("開館")\ngreet()', 'def greet():\n    print("受付")\ngreet()', [check("受付の呼び出し", "受付\n", { observe: "callable(greet)", value: true })], "字下げした表示の文字を変え、最後の呼び出しを残します。"),
        write: exercise("「精算」と表示する関数 pay を作り、二度呼んで二行表示しましょう。", "", 'def pay():\n    print("精算")\npay()\npay()', [check("pay を2回呼ぶ", "精算\n精算\n", { observe: "callable(pay)", value: true })], "定義の外で pay() を二度呼びます。"),
      },
      {
        title: "呼ぶたびに別の値を渡す", text: "関数の丸かっこに受け取る値の名前を書きます。これを引数といいます。呼ぶ側で数を渡すと、一つの関数を違う枚数に使えます。* は掛け算です。",
        code: "def show_price(count):\n    print(count * 100)\nshow_price(2)\nshow_price(4)", output: "200\n400",
        quiz: ["show_price(3) の表示は？", ["100", "200", "300", "count"], 2, "今は count が3なので、3 × 100 を表示します。"],
        guide: exercise("単価を50円に変え、show_price に2枚と4枚を渡すと各金額が出るようにしましょう。", "def show_price(count):\n    print(count * 100)\nshow_price(2)\nshow_price(4)", "def show_price(count):\n    print(count * 50)\nshow_price(2)\nshow_price(4)", [check("2枚と4枚、その後に1枚", "100\n200\n50\n", { observe: "show_price(1)", value: null })], "関数の中で、受け取った count に単価50を掛けます。"),
        write: exercise("券の枚数 count を受け取り、1枚80円で計算した合計金額を表示する関数 bill を作りましょう。1枚、3枚の順に呼んでください。採点では5枚でも試します。", "", "def bill(count):\n    print(count * 80)\nbill(1)\nbill(3)", [check("1枚と3枚、その後に5枚", "80\n240\n400\n", { observe: "bill(5)", value: null })], "呼ぶときに変わる枚数を、関数の中の掛け算に使います。"),
      },
      {
        title: "計算した値を受け取る", text: "金額を次の計算に使うには、関数の中で return を書きます。呼び出した位置が返された値に置き換わり、外の名前に入れられます。関数の中で表示する必要はありません。",
        code: "def price(count):\n    return count * 100\namount = price(2)\nprint(amount + 10)", output: "210",
        quiz: ["price(3) の返り値を amount に入れる行は？", ["price = amount(3)", "amount = price(3)", "print(amount)", "def amount(3):"], 1, "右で関数を呼び、戻ってきた値に左の名前を付けます。"],
        guide: exercise("表示だけする price に、1枚100円の金額を返させましょう。この課題では定義だけを書き、採点が2枚・7枚で呼びます。", "def price(count):\n    print(count * 100)", "def price(count):\n    return count * 100", returnChecks("price", [200, 700]), "金額が見えていても、次の計算には return count * 100 で渡します。"),
        write: exercise("1枚60円の代金を返す total を作り、total(3) の返り値を amount に入れ、その値に5円を足して表示しましょう。", "", "def total(count):\n    return count * 60\namount = total(3)\nprint(amount + 5)", [check("3枚と手数料", "185\n", { observe: "[amount, total(7)]", value: [180, 420] })], "関数で金額を return し、外の amount が受け取ってから5を足します。"),
      },
      {
        title: "画面に出る値と返る値を比べる", text: "show(3) は4を表示し、give(3) は4を返します。show には return がないので、返り値は None です。print(show(3)) では、関数の中で4が表示され、その次に外側の print が None を表示します。",
        code: "def show(n):\n    print(n + 1)\ndef give(n):\n    return n + 1\nprint(show(3))\nprint(give(3))", output: "4\nNone\n4",
        quiz: ["show(3) が中で出す値、呼んだ側に返す値は順に？", ["4、4", "None、4", "4、None", "None、None"], 2, "中の print で4が見えます。関数に return はないので返り値は None です。"],
        guide: exercise("割引後の金額を表示するだけの minus に、金額から1を引いた値を返させましょう。定義だけを書きます。", "def minus(amount):\n    print(amount - 1)", "def minus(amount):\n    return amount - 1", returnChecks("minus", [1, 6]), "print の行を return amount - 1 にすると、呼び出した側で計算結果を使えます。"),
        write: exercise("金額 amount から3円引いた値を返す関数 sale を書きましょう。この課題では関数の定義だけを書きます。", "", "def sale(amount):\n    return amount - 3", returnChecks("sale", [9, 14], [12, 17]), "呼んだ側が使えるように、割引後の値を return します。"),
      },
      {
        title: "関数の内側と外側の名前", text: "引数の名前は呼び出すたびに、その関数の中で使われます。外に同じ名前があっても別の値です。外に計算結果を渡したいときは return を使います。",
        code: "amount = 100\ndef discount(amount):\n    amount = amount - 10\n    return amount\nprint(discount(40))\nprint(amount)", output: "30\n100",
        quiz: ["discount(40) のあと、外の amount は？", ["30", "40", "90", "100"], 3, "関数の中だけで使う amount を変更しても、外の100は変わりません。"],
        guide: exercise("外の100を保ち、関数の中だけで5円引きにしましょう。discount(40) の結果と、外の amount を表示します。", "amount = 100\ndef discount(amount):\n    return amount - 10\nprint(discount(40))\nprint(amount)", "amount = 100\ndef discount(amount):\n    return amount - 5\nprint(discount(40))\nprint(amount)", [check("内35と外100", "35\n100\n", { observe: "discount(20)", value: 15 })], "関数の中の引く金額だけを5にします。"),
        write: exercise("amount は定価200円です。関数 member(amount) は受け取った額から20円を引いて返します。会員価格、元の定価の順に表示しましょう。", "", "amount = 200\ndef member(amount):\n    return amount - 20\nprint(member(amount))\nprint(amount)", [check("会員価格と定価", "180\n200\n", { observe: "[amount, member(80)]", value: [200, 60] })], "元の amount を上書きせず、member が返した値を先に表示します。"),
      },
    ],
  });
}
