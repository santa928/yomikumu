"use strict";

pythonChapters.push({
  id: "54", title: "文字を表示し、入力した数で計算する",
  goal: "イベントの受付を例に、1行目に入力した名前を表示し、2行目に入力したチケットの枚数に1を足します。",
  demo: { code: 'name = input()\ncount = int(input())\nprint(name)\nprint(count + 1)', input: "つばき\n2", prompt: "1行目に名前、2行目にチケットの枚数を書いて実行してみましょう。「つばき」と「2」なら「つばき」と「3」が表示されます。" },
  lessons: [
    {
      title: "文字を表示する", text: 'この教材では、Pythonのコードをブラウザの中で実行できます。print は、丸かっこに入れた値を表示する、Pythonに用意された関数（名前の付いた処理）です。print("入口") では、引用符の内側の「入口」だけが表示されます。引用符は文字列の範囲を示す目印です。',
      code: 'print("入口")', output: "入口",
      quiz: ["何と表示されますか。", ["入口", '"入口"', "print", "何も出ない"], 0, "print が受け取る文字は、引用符の内側の「入口」です。"],
      guide: exercise("見本の「入口」を「受付」に書き換えて、一行表示しましょう。", 'print("入口")', 'print("受付")', [check("「受付」を表示", "受付\n")], "引用符の間を「受付」にします。"),
      write: exercise("「閉館」と1行だけ表示するコードを書きましょう。", "", 'print("閉館")', [check("閉館の表示", "閉館\n")], "表示したい文字を引用符で囲み、print の丸かっこに入れます。"),
    },
    {
      title: "値に名前を付ける", text: 'work = "雲" と書くと、work という名前で「雲」を使えます。この名前を変数といいます。print(work) は変数の値を表示するので、結果は「雲」です。',
      code: 'work = "雲"\nprint(work)', output: "雲",
      quiz: ["print(work) が読むのはどれですか。", ["文字 work", "work が指す値", "等号", "行番号"], 1, "引用符のない work は、先ほど付けた名前です。"],
      guide: exercise("work の中身を「舟」に変え、work を表示しましょう。", 'work = "雲"\nprint(work)', 'work = "舟"\nprint(work)', [check("work の値と表示", "舟\n", { observe: "work", value: "舟" })], "work = の右側に新しい作品名を置きます。"),
      write: exercise("room という名前に「西室」を入れ、room の値を一行表示しましょう。", "", 'room = "西室"\nprint(room)', [check("room の値と表示", "西室\n", { observe: "room", value: "西室" })], "まず room に文字を入れます。次の行でその名前を print に渡します。"),
    },
    {
      title: "数を足す、文字をつなぐ", text: '同じ + でも、文字列（文字の並び）と数では結果が変わります。"2" + "2" は文字をつないで「22」に、2 + 2 は足し算で4になります。',
      code: 'print("2" + "2")\nprint(2 + 2)', output: "22\n4",
      quiz: ['"2" + "2" の表示、次に 2 + 2 の表示を並べると？', ["4、4", "4、22", "22、4", "22、22"], 2, "文字なら続けて並び、数なら足した数になります。"],
      guide: exercise("2枚に足す枚数を3枚に変え、合計を表示しましょう。", "print(2 + 2)", "print(2 + 3)", [check("合計5枚", "5\n")], "数字には引用符を付けず、+ の右を 3 にします。"),
      write: exercise("stock には今の枚数が入っています。4枚足した合計を表示しましょう。", "", "print(stock + 4)", [check("stock が2", "6\n", { before: "stock = 2" }), check("stock が0", "4\n", { before: "stock = 0" })], "print の丸かっこの中で、stock に4を足します。"),
    },
    {
      title: "入力した文字を受け取る", text: "print は値を表示し、input は使う人から値を受け取ります。この教材で入力欄に「ゆき」と書くと、input() がその1行を文字列として受け取り、guest という名前で使えるようになります。次の行の print(guest) が「ゆき」を表示します。",
      code: "guest = input()\nprint(guest)", input: "ゆき", output: "ゆき",
      quiz: ["「なつ」と入力すると何が見えますか。", ["guest", "ゆき", "input", "なつ"], 3, "受け取る値が「なつ」に変わるので、表示も変わります。"],
      guide: exercise("決まった「ゆき」の代わりに入力した名前を受け取り、その名前を表示しましょう。", 'guest = "ゆき"\nprint(guest)', "guest = input()\nprint(guest)", [check("入力が「ゆき」", "ゆき\n", { input: "ゆき" }), check("入力が「なつ」", "なつ\n", { input: "なつ" })], "名前を固定した行の右側を input() に変えます。"),
      write: exercise("作品名を一行受け取り、「展示」と作品名をそれぞれ一行ずつ表示しましょう。", "", 'work = input()\nprint("展示")\nprint(work)', [check("波の展示", "展示\n波\n", { input: "波" }), check("月の展示", "展示\n月\n", { input: "月" })], "作品名には入力の値を使います。「展示」の次の行に作品名を出しましょう。"),
    },
    {
      title: "入力した数字を整数に変える", text: "入力欄に 2 と書いても、input() が受け取るのは文字列の「2」です。int(input()) は、先に内側の input() で読み、その結果を int(...) で整数の 2 に変えます。数になれば 1 を足せます。「二」は整数に変換できないため、ValueError というエラーになります。",
      code: "count = int(input())\nprint(count + 1)", input: "2", output: "3",
      quiz: ["入力が「2」のとき、1枚足して3を出す式は？", ['input() + "1"', "int(input()) + 1", '"2" + "1"', "input() + 1"], 1, "int で整数にしてから数の 1 を足せます。"],
      guide: exercise("入力した人数に2人を足して表示しましょう。", "count = int(input())\nprint(count + 1)", "count = int(input())\nprint(count + 2)", [check("1人と同行者", "3\n", { input: "1" }), check("4人と同行者", "6\n", { input: "4" })], "数字に直した後で 2 を足しましょう。"),
      write: exercise("名前、持っている券の枚数の順に二行受け取り、名前と、券を3枚足した合計を別々の行に表示しましょう。", "", "name = input()\ncount = int(input())\nprint(name)\nprint(count + 3)", [check("あおの券", "あお\n5\n", { input: "あお\n2" }), check("りんの券", "りん\n13\n", { input: "りん\n10" })], "まず input() で名前を読み、次の int(input()) で券の枚数を読みます。表示するときは、名前を先に、枚数に 3 を足した合計を次の行に出します。"),
    },
  ],
});
