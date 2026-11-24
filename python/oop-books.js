"use strict";

{
  const book = "class Book:\n    def __init__(self, pages):\n        self.pages = pages";
  const turn = book + "\n    def read(self, amount):\n        self.pages += amount";
  const make = book + "\n    @classmethod\n    def blank(cls):\n        return cls(0)";
  const staticFee = "class Book:\n    @staticmethod\n    def cost(pages):\n        return pages * 2";
  const three = "class Book:\n    rate = 2\n    def __init__(self, pages):\n        self.pages = pages\n    def mine(self):\n        return self.pages * self.rate\n    @classmethod\n    def quote(cls, pages):\n        return pages * cls.rate\n    @staticmethod\n    def multiply(pages, rate):\n        return pages * rate";
  const inspect = (name, expr, value, before) => check(name, "", { observe: expr, value, before });
  const independent = [inspect("二冊の状態", "[first.pages, second.pages, first is second]", [8, 4, false])];
  const demo = three + "\npages = int(input())\nb = Book(pages)\nprint(b.mine())\nprint(Book.quote(pages))\nprint(Book.multiply(pages, 2))";
  pythonChapters.push({
    id: "63", title: "クラスで本ごとのデータと操作をまとめる",
    goal: "本ごとに読んだページ数を記録します。ページ数と単価をどこから受け取るかで、印刷代を計算するメソッドの書き方が変わります。",
    demo: { code: demo, input: "6", prompt: "6ページ、1ページ2円なら、三つの計算結果はいずれも12です。入力欄のページ数を変えてみましょう。" },
    lessons: [
      {
        title: "Book クラスで1冊分の記録を作る", text: "1冊だけなら、読んだページ数を変数ひとつに入れておけます。複数の本を扱うときは、同じ記録の形をクラス Book に書いておくと、1冊ずつ別の記録を作れます。Book(4) はその1冊分（インスタンス）を作り、__init__ が受け取った 4 を self.pages に保存します。first.pages で first のページ数を読みます。",
        code: book + "\nfirst = Book(4)\nprint(first.pages)", output: "4",
        quiz: ["Book(4) の結果を入れた first は？", ["クラスの定義そのもの", "4ページの一冊", "全冊のリスト", "ページ番号だけ"], 1, "Book はクラス、first はそこから作った一冊です。"],
        guide: exercise("初期値を4から9に変え、first のページを表示しましょう。", book + "\nfirst = Book(4)\nprint(first.pages)", book + "\nfirst = Book(9)\nprint(first.pages)", [check("一冊の状態", "9\n", { observe: "isinstance(first, Book)", value: true })], "一冊を作る Book(…) に渡す値を変えます。"),
        write: exercise("準備済みの Book を使い、12ページの一冊を entry に作り、そのページ数を表示しましょう。", "", "entry = Book(12)\nprint(entry.pages)", [check("12ページの本", "12\n", { before: book, observe: "isinstance(entry, Book)", value: true })], "Book(12) の結果に entry と名前を付けます。"),
      },
      {
        title: "別々の本のページ数を記録する", text: "b = a と書いても記録はコピーされず、同じ1冊を二つの名前で参照します。見本では Book(4) を2回呼ぶので、最初のページ数が同じでも別々の記録です。a.pages を変えても b.pages は4のままです。a is b はページ数の一致ではなく、同じ記録かどうかを調べます。",
        code: book + "\na = Book(4)\nb = Book(4)\na.pages = 8\nprint(a.pages)\nprint(b.pages)\nprint(a is b)", output: "8\n4\nFalse",
        quiz: ["b = a に変えたあと a.pages = 8 とすると b.pages は？", ["4", "8", "0", "不明"], 1, "別名が同じ一冊を指すので、b からも8が見えます。"],
        guide: exercise("二冊目を独立して作り、first だけを8ページにしましょう。最初は両方4ページです。", "first = Book(4)\nsecond = first\nfirst.pages = 8", "first = Book(4)\nsecond = Book(4)\nfirst.pages = 8", independent.map(test => ({ ...test, before: book })), "second に Book(4) をもう一度呼んだ結果を入れます。"),
        write: exercise("Book を使い、最初は2ページと5ページの二冊を a、b に作ります。b だけを7ページに直し、二冊のページを順に表示しましょう。", "", "a = Book(2)\nb = Book(5)\nb.pages = 7\nprint(a.pages)\nprint(b.pages)", [check("一冊だけ更新", "2\n7\n", { before: book, observe: "a is b", value: false })], "一冊ずつ作り、b の属性だけを書き換えます。"),
      },
      {
        title: "self で呼ばれた本だけ更新する", text: "前の例は a.pages を直接書き換えました。毎回「今のページ数に足す」と書く代わりに、その手順をクラスの関数（メソッド）にまとめます。a.read(3) では、ドットの左の a が self に、かっこの中の 3 が amount に渡ります。self.pages += amount は a のページ数だけを3増やします。",
        code: turn + "\na = Book(2)\nb = Book(5)\na.read(3)\nprint(a.pages)\nprint(b.pages)", output: "5\n5",
        quiz: ["b.read(3) を呼ぶと self は？", ["3", "Book クラス", "b の一冊", "すべての本"], 2, "ドットの左にいる b が self に渡ります。"],
        guide: exercise("read を呼ぶたびに、読んだページ数を self.pages に足しましょう。4ページの記録に2ページ、1ページと足すと、7ページになります。", turn.replace("+=", "="), turn, [inspect("更新と独立", "(a.read(2), a.read(1), a.pages, b.pages)", [null, null, 7, 5], ""),], "self.pages に amount を加えます。", { after: "a = Book(4)\nb = Book(5)" }),
        write: exercise("Book を作るときに、引数 pages で読んだページ数を受け取りましょう。reset() を呼ぶと、その本のページ数だけが0に戻るようにします。", "", book + "\n    def reset(self):\n        self.pages = 0", [inspect("更新した本ともう1冊のページ数", "[a.reset(), a.pages, b.pages]", [null, 0, 8])], "reset の中で self.pages だけを0にします。", { after: "a = Book(3)\nb = Book(8)" }),
      },
      {
        title: "クラスメソッドで新しい記録を作る", text: "@classmethod の最初の引数 cls に来るのは、呼んだクラスです。cls(0) は、その種類の0ページの一冊を作ります。呼ぶ側は Book.blank() と書き、cls を自分で渡しません。",
        code: make + "\nentry = Book.blank()\nprint(entry.pages)", output: "0",
        quiz: ["Book.blank() の cls に入るのは？", ["作った一冊", "数の0", "Book クラス", "文字のBook"], 2, "ドットの左にあるクラスが暗黙に渡ります。"],
        guide: exercise("いつも1ページで作る blank を、呼ばれたクラスの0ページの一冊を返すよう直しましょう。", make.replace("cls(0)", "cls(1)"), make, [inspect("基本と別種類", "[Book.blank().pages, isinstance(Extra.blank(), Extra)]", [0, true])], "return cls(0) なら呼んだ種類で作れます。", { after: "class Extra(Book):\n    pass" }),
        write: exercise("Book に from_text(cls, text) を作りましょう。数字の文字を整数にして、そのページ数の一冊を呼ばれたクラスで作って返します。", "", book + "\n    @classmethod\n    def from_text(cls, text):\n        return cls(int(text))", [inspect("二つの種類で生成", "[Book.from_text('07').pages, isinstance(Extra.from_text('3'), Extra)]", [7, true])], "文字列を int で整数にし、その数を cls に渡します。", { after: "class Extra(Book):\n    pass" }),
      },
      {
        title: "静的メソッドで渡された値だけを使う", text: "@staticmethod を付けると、self や cls は自動では渡されません。この例では、呼ぶ側が渡したページ数だけを使います。ここではページ数に2を掛けて印刷代に変換します。",
        code: staticFee + "\nprint(Book.cost(3))\nprint(Book().cost(3))", output: "6\n6",
        quiz: ["Book.cost(3) が受け取るものは？", ["self と3", "cls と3", "3だけ", "本の全ページ"], 2, "staticmethod は引数を自動で付け足しません。"],
        guide: exercise("単価を2円から3円に変え、Book.cost で計算できるようにしましょう。", staticFee, staticFee.replace("* 2", "* 3"), [inspect("クラス・一冊からの呼び出し", "[Book.cost(4), Book().cost(2)]", [12, 6])], "渡されたページに3を掛けます。"),
        write: exercise("Book に、文字のページ数を整数へ変換する staticmethod number(text) を作ります。Book とその一冊のどちらから呼んでも働かせましょう。", "", "class Book:\n    @staticmethod\n    def number(text):\n        return int(text)", [inspect("同じ変換", "[Book.number('04'), Book().number('12')]", [4, 12])], "number の引数は text だけです。上に @staticmethod を付けます。"),
      },
      {
        title: "三つのメソッドが使う値を比べる", text: "b.mine() は b に記録したページ数を使います。Book.quote(4) はページ数を引数で受け取り、単価はクラスから読みます。Book.multiply(4, 2) はページ数と単価の両方を引数で受け取ります。この例ではどの方法でも印刷代は8円です。",
        code: three + "\nb = Book(4)\nprint(b.mine())\nprint(Book.quote(4))\nprint(Book.multiply(4, 2))", output: "8\n8\n8",
        quiz: ["一冊もクラスの単価も使わず、両方を明示するのは？", ["b.mine()", "Book.quote(4)", "Book.multiply(4, 2)", "Book(4)"], 2, "multiply はページと単価の二つを受け取ります。"],
        guide: exercise("同じ4ページを使って、mine、quote、multiply の順で同じ結果を表示しましょう。", "b = Book(4)\nprint(b.mine())\nprint(Book.quote(4))\nprint(Book.multiply(4, 1))", "b = Book(4)\nprint(b.mine())\nprint(Book.quote(4))\nprint(Book.multiply(4, 2))", [check("三つの計算結果", "8\n8\n8\n", { before: three })], "multiply にはクラスの標準単価2も明示して渡します。"),
        write: exercise("Book の単価を3に変えます。入力したページ数で一冊を作り、その本の計算、クラスの見積り、明示した特別単価5での計算を順に表示してください。", "", "Book.rate = 3\nn = int(input())\nb = Book(n)\nprint(b.mine())\nprint(Book.quote(n))\nprint(Book.multiply(n, 5))", [check("2ページ", "6\n6\n10\n", { before: three, input: "2" }), check("4ページ", "12\n12\n20\n", { before: three, input: "4" })], "三つ目だけは特別単価5を明示し、一冊とクラスの計算では rate を使います。"),
      },
    ],
  });
}
