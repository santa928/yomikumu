"use strict";

pythonChapters.push({
  id: "54", title: "一行の表示から、名前と枚数の受付へ",
  goal: "作品展の受付で、名前を受け取り、追加した後の券の枚数を伝えます。",
  demo: { code: 'name = input()\ncount = int(input())\nprint(name)\nprint(count + 1)', input: "つばき\n2", prompt: "1行目に名前、2行目に今の枚数を書いてください。受付で券を1枚足します。" },
  lessons: [
    {
      title: "文字を表示する", text: "受付に看板を出します。print は丸かっこの中身を一行表示します。文字の両端には同じ引用符を置きます。引用符自体は表示されません。",
      code: 'print("入口")', output: "入口",
      quiz: ["何と表示されますか。", ["入口", '"入口"', "print", "何も出ない"], 0, "print が受け取る文字は、引用符の内側の「入口」です。"],
      guide: exercise("見本の「入口」を「受付」に書き換えて、一行表示しましょう。", 'print("入口")', 'print("受付")', [check("受付の看板", "受付\n")], "引用符の間を「受付」にします。"),
      write: exercise("展示が終わりました。「閉館」と一行表示する看板を作りましょう。", "", 'print("閉館")', [check("閉館の表示", "閉館\n")], "表示したい文字を引用符で囲み、print の丸かっこに入れます。"),
    },
    {
      title: "値に名前を付ける", text: "同じ作品名を後でも使えるようにします。作品名を右、付けたい名前を左に置いて = で結びます。次の行では引用符を付けずに名前を書くと、中の値を使えます。",
      code: 'work = "雲"\nprint(work)', output: "雲",
      quiz: ["print(work) が読むのはどれですか。", ["文字 work", "work が指す値", "等号", "行番号"], 1, "引用符のない work は、先ほど付けた名前です。"],
      guide: exercise("work の中身を「舟」に変え、work を表示しましょう。", 'work = "雲"\nprint(work)', 'work = "舟"\nprint(work)', [check("舟の札", "舟\n", { observe: "work", value: "舟" })], "work = の右側に新しい作品名を置きます。"),
      write: exercise("room という名前に「西室」を入れ、room の値を一行表示しましょう。", "", 'room = "西室"\nprint(room)', [check("展示室の札", "西室\n", { observe: "room", value: "西室" })], "まず room に文字を入れます。次の行でその名前を print に渡します。"),
    },
    {
      title: "二つの値を足す", text: '紙券を数えるときは数を使います。2 + 2 は足し算です。"2" + "2" の両側は文字なので、二つの文字をつないで 22 と表示します。',
      code: 'print("2" + "2")\nprint(2 + 2)', output: "22\n4",
      quiz: ['"2" + "2" の表示、次に 2 + 2 の表示を並べると？', ["4、4", "4、22", "22、4", "22、22"], 2, "文字なら続けて並び、数なら足した数になります。"],
      guide: exercise("2枚に足す枚数を3枚に変え、合計を表示しましょう。", "print(2 + 2)", "print(2 + 3)", [check("合計5枚", "5\n")], "数字には引用符を付けず、+ の右を 3 にします。"),
      write: exercise("棚にある枚数 stock に4枚足した数を表示しましょう。stock は実行前に用意されます。", "", "print(stock + 4)", [check("棚に2枚", "6\n", { before: "stock = 2" }), check("棚に0枚", "4\n", { before: "stock = 0" })], "棚にある分が変わっても使えるよう、stock を足し算に入れましょう。"),
    },
    {
      title: "入力した文字を受け取る", text: "来る人によって名前は変わります。input() は入力の一行を文字として受け取ります。次は「ゆき」と入力した例です。",
      code: "guest = input()\nprint(guest)", input: "ゆき", output: "ゆき",
      quiz: ["「なつ」と入力すると何が見えますか。", ["guest", "ゆき", "input", "なつ"], 3, "受け取る値が「なつ」に変わるので、表示も変わります。"],
      guide: exercise("決まった「ゆき」の代わりに入力した名前を受け取り、その名前を表示しましょう。", 'guest = "ゆき"\nprint(guest)', "guest = input()\nprint(guest)", [check("ゆきの受付", "ゆき\n", { input: "ゆき" }), check("なつの受付", "なつ\n", { input: "なつ" })], "名前を固定した行の右側を input() に変えます。"),
      write: exercise("作品名を一行受け取り、「展示」と作品名をそれぞれ一行ずつ表示しましょう。", "", 'work = input()\nprint("展示")\nprint(work)', [check("波の展示", "展示\n波\n", { input: "波" }), check("月の展示", "展示\n月\n", { input: "月" })], "作品名には入力の値を使います。「展示」の次の行に作品名を出しましょう。"),
    },
    {
      title: "計算する文字を数に変える", text: "入力した 2 は文字です。int は数字の文字を計算できる整数に変えます。数字にできない「二」なら ValueError というエラーが出ます。入力を直してもう一度実行できます。",
      code: "count = int(input())\nprint(count + 1)", input: "2", output: "3",
      quiz: ["入力が「2」のとき、1枚足して3を出す式は？", ['input() + "1"', "int(input()) + 1", '"2" + "1"', "input() + 1"], 1, "int で整数にしてから数の 1 を足せます。"],
      guide: exercise("来館人数に同行者2人を足しましょう。見本の加算を一か所変えます。", "count = int(input())\nprint(count + 1)", "count = int(input())\nprint(count + 2)", [check("1人と同行者", "3\n", { input: "1" }), check("4人と同行者", "6\n", { input: "4" })], "数字に直した後で 2 を足しましょう。"),
      write: exercise("名前、持っている券の枚数の順に二行受け取り、名前と、券を3枚足した合計を別々の行に表示しましょう。", "", "name = input()\ncount = int(input())\nprint(name)\nprint(count + 3)", [check("あおの券", "あお\n5\n", { input: "あお\n2" }), check("りんの券", "りん\n13\n", { input: "りん\n10" })], "名前を表示できたら、2行目だけを int で数にして 3 を足します。"),
    },
  ],
});
