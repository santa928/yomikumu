"use strict";

{
  const file = { "memo.py": [
    "events = []", "class Memo:", "    def __init__(self, text):", "        self.text = text", '        events.append("開く")',
    "    def read(self):", '        events.append("読む")', "        return int(self.text)",
    "    def close(self):", '        events.append("閉じる")', "    def __enter__(self):", "        return self",
    "    def __exit__(self, kind, value, trace):", "        self.close()", "        return False",
  ].join("\n") };
  const start = "from memo import Memo, events\n";
  const checkLog = (label, want, input, events, extra = {}) =>
    check(label, want, { input, observe: "list(events)", value: events, ...extra });
  const three = ["開く", "読む", "閉じる"];
  const normal = [checkLog("4件の記録", "4\n", "4", three), checkLog("0件の記録", "0\n", "0", three)];
  const managed = start + "with Memo(input()) as note:\n    print(note.read())";
  const caught = start + 'try:\n    with Memo(input()) as note:\n        print(note.read())\nexcept ValueError:\n    print("読めません")\nprint(events)';
  const display = "['開く', '読む', '閉じる']\n";
  const manager = "class Session:\n    def __enter__(self):\n        return self\n    def __exit__(self, kind, value, trace):\n        events.append('閉じる')\n        return False";
  const use = "try:\n    with Session() as current:\n        events.append('読む')\n        number = int(input())\n        print(number)\nexcept ValueError:\n    print('読めません')\nprint(events)";
  pythonChapters.push({
    id: "61", title: "with でエラーが出ても後片付けする",
    goal: "開いたファイルなどは、読み取りの途中で失敗しても閉じる必要があります。ここではファイルの代わりに教材の読書メモを使い、成功してもエラーが出ても1回だけ閉じることを確かめます。実行すると、開いてから閉じるまでの操作が順に表示されます。",
    demo: { prompt: "「5」と「紙」で試し、最後に出る作業記録の順番を比べましょう。", code: caught, input: "5", files: file },
    lessons: [
      {
        title: "データを開き、読み、使い終えたら閉じる", text: "教材の Memo は、この画面のメモリにある一件を扱います。Memo(文字) で開き、note.read() で数を読み、note.close() で閉じます。events は実際に行った操作の記録です。",
        files: file, code: start + 'note = Memo("4")\nprint(note.read())\nnote.close()\nprint(events)', output: "4\n['開く', '読む', '閉じる']",
        quiz: ["読んだ後に使わなくなったメモの操作は？", ["read を二度", "close を一度", "新しく開く", "events を消す"], 1, "使い終わった一件を close で閉じます。"],
        guide: exercise("閉じる行を一行足し、読んだ数を表示してからメモを閉じましょう。", start + "note = Memo(input())\nprint(note.read())", start + "note = Memo(input())\nprint(note.read())\nnote.close()", normal, "最後に note.close() を一度呼びます。", { files: file }),
        write: exercise("一件を開き、読んだ数に2を足して表示し、閉じましょう。", "", start + "note = Memo(input())\nprint(note.read() + 2)\nnote.close()", [checkLog("件数に2を足す", "7\n", "5", three), checkLog("入力が0", "2\n", "0", three)], "読むのは一度です。表示したら同じメモを閉じます。", { files: file }),
      },
      {
        title: "with で使う範囲を囲む", text: "with Memo(...) as note: の中に「メモを読んでいる間の処理」を書きます。抜けるときは、Memo に用意された終了処理がメモを閉じるので、手で close を書く必要はありません。with の外でも note という名前は残ります。Memo は後片付けの順番を示す見本で、実際のファイルなら閉じたあとに読むには開き直します。",
        files: file, code: managed + "\nprint(events)", input: "3", output: "3\n['開く', '読む', '閉じる']",
        quiz: ["with から出た直後に記録される作業は？", ["開く", "読む", "閉じる", "もう一度読む"], 2, "with の処理が終わると、Memo の close が1回呼ばれます。"],
        guide: exercise("with が閉じたあとで二度目の close を呼ぶ見本を直しましょう。", managed + "\nnote.close()", managed, normal, "with の外の close を取り除くと、閉じた回数が一度になります。", { files: file }),
        write: exercise("with でメモを開き、読んだ数の2倍を表示しましょう。最後は自動で一度閉じます。", "", start + "with Memo(input()) as note:\n    print(note.read() * 2)", [checkLog("3件を倍に", "6\n", "3", three), checkLog("5件を倍に", "10\n", "5", three)], "with の内側で読み、表示します。外に close を足す必要はありません。", { files: file }),
      },
      {
        title: "エラーが出ても with の終了処理が動くか確かめる", text: "入力が「紙」なら、note.read() で ValueError が発生します。メモを閉じる処理が先に実行され、次に except の行で「読めません」と表示されます。",
        files: file, code: caught, input: "紙", output: "読めません\n['開く', '読む', '閉じる']",
        quiz: ["読めないときの順番は？", ["読む→閉じる→外の案内", "読む→外の案内だけ", "閉じる→読む", "閉じるを二度"], 0, "except の処理が始まる前に、with がメモを閉じます。"],
        guide: exercise("不正な入力の案内を「数字を確認」に変えます。正常時は件数、最後にどちらも作業記録を表示しましょう。", caught, caught.replace("読めません", "数字を確認"), [checkLog("正しい入力", "3\n" + display, "3", three), checkLog("読めない入力", "数字を確認\n" + display, "紙", three)], "外の except の中の案内だけを変えます。", { files: file }),
        write: exercise("with でメモを開き、入力を整数に変換できたらその数を表示しましょう。変換できないときは、メモを閉じたあとで ValueError が呼び出し元に伝わるようにします。", "", managed, [checkLog("正常終了", "7\n", "7", three), check("例外が伝わる", "", { input: "紙", error: "ValueError", afterError: "list(events)", value: three })], "with の中で読みます。この課題では ValueError を自分で受け取らず、呼出元に伝えます。", { files: file }),
      },
      {
        title: "with の開始時と終了時の処理を書く", text: "class Session に、with の開始時と終了時の処理をまとめます。開始時に __enter__ が返した値が as の後の current に入ります。self は今回作った Session 自身です。終了時には __exit__ が呼ばれます。ここで「閉じる」を記録して False を返すと、発生した例外が外へ伝わります。",
        code: "events = []\n" + manager + "\n" + use, input: "紙", output: "読めません\n['読む', '閉じる']",
        quiz: ["__exit__ が例外を外へ伝える返し方は？", ["return True", "return 100", "return False", "return '成功'"], 2, "True を返すと例外を処理済みにします。ここでは False で伝えます。"],
        guide: exercise("session.py の __exit__ を直し、ValueError が main.py に伝わるようにしましょう。「紙」を入力すると「読めません」と操作の記録が表示されます。", manager.replace("return False", "return True"), manager, [check("整数で終了", "4\n['読む', '閉じる']\n", { input: "4" }), check("例外で終了", "読めません\n['読む', '閉じる']\n", { input: "紙" })], "__exit__ で False を返すと、外側の except が例外を受け取れます。", { targetFile: "session.py", main: "from session import Session\nfrom session import events\n" + use, filePrefix: "events = []\n" }),
        write: exercise("Session の __enter__ で「開く」、__exit__ で「閉じる」を events に1回ずつ追加しましょう。__enter__ は自分自身を返します。処理中に起きた例外は呼び出し元に伝えてください。", "", manager.replace("return self", "events.append('開く')\n        return self"), [check("正常の順序", "6\n['開く', '読む', '閉じる']\n", { input: "6", observe: "isinstance(current, Session)", value: true }), check("失敗後の順序", "読めません\n['開く', '読む', '閉じる']\n", { input: "字" })], "__enter__ は記録したあとに self を返します。__exit__ は記録したあとに False を返します。", { targetFile: "session.py", main: "from session import Session\nfrom session import events\n" + use, filePrefix: "events = []\n" }),
      },
    ],
  });
}
