"use strict";

{
  const read = "class Log:\n    def __init__(self, pages):\n        self._pages = pages\n    @property\n    def pages(self):\n        return self._pages";
  const prop = read + "\n    @pages.setter\n    def pages(self, value):\n        if value < 0:\n            raise ValueError('負のページ')\n        self._pages = value";
  const size = "class Shelf:\n    def __init__(self, titles):\n        self.titles = titles\n    def __len__(self):\n        return len(self.titles)";
  const label = size + "\n    def __str__(self):\n        return '本棚' + str(len(self))";
  const clone = "class Log:\n    def __init__(self, marks):\n        self.marks = marks\n    def duplicate(self):\n        return Log(self.marks[:])";
  const rejected = "book = Log(6)\ntry:\n    book.pages = -2\nexcept ValueError:\n    print('見直し')\nprint(book.pages)";
  const obs = (name, expr, value, before) => check(name, "", { observe: expr, value, before });
  pythonChapters.push({
    id: "65", title: "記録帳の読み書き・長さ・コピー",
    goal: "本のページ数を安全に更新し、記録帳が通常の len や str にどう答えるかを決めます。",
    demo: { prompt: "ページ数を入力します。9と-1を比べ、誤入力の後も元の値が残ることを見てください。", input: "9",
      code: prop + "\nbook = Log(6)\ntry:\n    book.pages = int(input())\nexcept ValueError:\n    print('見直し')\nprint(book.pages)" },
    lessons: [
      {
        title: "普通の属性のように読む", text: "@property を付けたメソッドは、book.pages と書くだけで読み出せます。実際の保存値 _pages の先頭の下線は、クラスの内側で使うという慣習を示します。",
        code: read + "\nbook = Log(6)\nprint(book.pages)", output: "6",
        quiz: ["このプロパティの読み方は？", ["book.pages()", "book.pages", "pages(book())", "book[pages]"], 1, "丸かっこを付けない通常の属性の形で読みます。"],
        guide: exercise("保存したページ数をそのまま返すよう、余分な加算を直しましょう。", read.replace("return self._pages", "return self._pages + 1"), read, [obs("二冊の実際の値", "[Log(0).pages, Log(6).pages]", [0, 6])], "getter の return で保存値をそのまま返します。"),
        write: exercise("Log に、保存したページ数の2倍を返す points の読み取り専用プロパティを作りましょう。", "", read + "\n    @property\n    def points(self):\n        return self._pages * 2", [obs("異なる二冊の点", "[Log(3).points, Log(8).points]", [6, 16])], "@property の下の points で、この一冊の保存値を2倍して返します。"),
      },
      {
        title: "書き込む前に値を調べる", text: "@pages.setter があると book.pages = 値 で書き込み処理が動きます。負なら ValueError を起こして止め、使ってよい数のときだけ保存値を書き換えます。",
        code: prop + "\nbook = Log(6)\nbook.pages = 0\nprint(book.pages)", output: "0",
        quiz: ["0ページを許し、負だけを拒む条件は？", ["value <= 0", "value > 0", "value < 0", "value == 0"], 2, "0は許すので、0より小さい場合だけ拒みます。"],
        guide: exercise("0ページを拒んでしまう setter を直し、0以上を受け入れましょう。", prop.replace("value < 0", "value <= 0"), prop, [obs("正しい0への更新", "book.pages", 0)], "比較を < 0 に直します。", { after: "book = Log(4)\nbook.pages = 0" }),
        write: exercise("上限を設け、0～10ページだけを許す Log を書きましょう。範囲外の更新は ValueError です。", "", prop.replace("value < 0", "value < 0 or value > 10"), [obs("両端は有効", "[low.pages, high.pages, invalid]", [0, 10, 2])], "下限・上限を調べてから _pages を書き換えます。", { after: "low = Log(4)\nhigh = Log(4)\nlow.pages = 0\nhigh.pages = 10\ninvalid = 0\nfor n in [-1, 11]:\n    try:\n        low.pages = n\n    except ValueError:\n        invalid += 1" }),
      },
      {
        title: "失敗直後も前の値を保つ", text: "エラーを出す前に代入してしまうと、表示だけはエラーでも中身が壊れます。検査を先に置きます。失敗後にもう一度読み、さらに正しい値で更新し直しましょう。",
        code: prop + "\n" + rejected, output: "見直し\n6",
        quiz: ["6ページに −2 を入れようとして拒まれた直後に読む値は？", ["−2", "0", "6", "None"], 2, "保存前に止めたので、もとの6ページが残ります。"],
        guide: exercise("失敗直後に読み直す値を表示しましょう。誤った候補の −2 をそのまま表示する行を直します。", rejected.replace("print(book.pages)", "print(-2)"), rejected, [check("失敗直後の6", "見直し\n6\n", { before: prop, observe: "book.pages", value: 6 })], "最後に book.pages を読めば、実際に残った値が分かります。"),
        write: exercise("準備済みの Log(4) を book に作り、負の −1 の書き込みを試します。ValueError のときは残った値を表示し、その後 8 に直して表示しましょう。", "", "book = Log(4)\ntry:\n    book.pages = -1\nexcept ValueError:\n    print(book.pages)\nbook.pages = 8\nprint(book.pages)", [check("失敗と復帰", "4\n8\n", { before: prop, observe: "book.pages", value: 8 })], "例外を受けた場所で保存値を表示し、その後に有効な値を入れます。"),
      },
      {
        title: "len に件数を返す", text: "len(棚) は棚の __len__ を呼びます。返すのは0以上の整数です。表示用の文章はここでは返しません。空なら0、一冊なら1になります。",
        code: size + "\nprint(len(Shelf([])))\nprint(len(Shelf(['雲'])))", output: "0\n1",
        quiz: ["空の棚の __len__ が返すものは？", ["文字の '空'", "空リスト", "整数の0", "None"], 2, "len の役割は件数を一つの整数で伝えることです。"],
        guide: exercise("一冊多く数える Shelf を直し、入っている件数を返しましょう。", size.replace("len(self.titles)", "len(self.titles) + 1"), size, [obs("空・一冊・二冊", "[len(Shelf([])), len(Shelf(['月'])), len(Shelf(['月','舟']))]", [0, 1, 2])], "__len__ の戻り値から余分な1を取り除きます。"),
        write: exercise("marks の一覧を持つ Stamp を作ります。len(Stamp(一覧)) で実際のスタンプ件数を返すようにしましょう。", "", "class Stamp:\n    def __init__(self, marks):\n        self.marks = marks\n    def __len__(self):\n        return len(self.marks)", [obs("三枚・空", "[len(Stamp([1,2,3])), len(Stamp([]))]", [3, 0])], "一覧自体の件数を __len__ から返します。"),
      },
      {
        title: "str に読みやすい表示を返す", text: "str(棚) や print(棚) は __str__ から表示用の文字を受け取ります。数の件数は str(len(self)) で文字に変えてから、見出しとつなげます。",
        code: label + "\ns = Shelf(['雲','海'])\nprint(s)\nprint(len(s))", output: "本棚2\n2",
        quiz: ["__str__ から返す種類は？", ["整数", "本棚そのもの", "関数", "文字列"], 3, "人に見せる文字を返し、件数は __len__ が担当します。"],
        guide: exercise("本棚の見出しを「記録」に変えて、記録2などと表示しましょう。", label, label.replace("'本棚'", "'記録'"), [obs("表示と件数", "[str(Shelf(['月','舟'])), len(Shelf([]))]", ["記録2", 0])], "__str__ の文字を変え、整数の __len__ はそのままにします。"),
        write: exercise("Shelf はその件数を len で返し、str では「件数=」に続けて件数を表示します。空でも動くクラスを書きましょう。", "", label.replace("'本棚'", "'件数='"), [obs("空と一冊の表示", "[str(Shelf([])), str(Shelf(['月'])), len(Shelf(['月']))]", ["件数=0", "件数=1", 1])], "件数を文字に変えて「件数=」とつなぎます。"),
      },
      {
        title: "コピーが共有する範囲を決める", text: "別の Log を作っても、同じリストを渡したら中身は共有されます。ここでは数だけの一覧を [:] で写し、元とコピーの追記を独立させます。中にさらにリストがあれば、その内側までは写りません。",
        code: clone + "\na = Log([1])\nb = a.duplicate()\nb.marks.append(2)\nprint(a.marks)\nprint(b.marks)", output: "[1]\n[1, 2]",
        quiz: ["Log(self.marks) と書いたとき、元とコピーが共有するものは？", ["何もない", "Logの実体すべて", "中の同じリスト", "数2だけ"], 2, "外側の Log は新しくても、渡したリストは元と同じです。"],
        guide: exercise("duplicate で元のリストまで変わる見本を直し、コピーへの追記が元へ届かないようにします。", clone.replace("self.marks[:]", "self.marks"), clone, [obs("独立した二冊", "[a.marks, b.marks, a is b]", [[1], [1, 2], false])], "新しい Log に self.marks[:] を渡します。", { after: "a = Log([1])\nb = a.duplicate()\nb.marks.append(2)" }),
        write: exercise("marks が数の一覧の Log を用意します。書き足すための fork() を作り、新しい本と新しい一覧を返しましょう。元とコピーの両方に別々の値を追記して採点します。", "", clone.replace("duplicate", "fork"), [obs("両側の追記", "[a.marks, b.marks, a.marks is b.marks]", [[3, 4], [3, 9], false])], "本だけでなく、中に渡す一覧もコピーします。", { after: "a = Log([3])\nb = a.fork()\na.marks.append(4)\nb.marks.append(9)" }),
      },
    ],
  });
}
