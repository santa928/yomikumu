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
    id: "61", title: "途中で失敗してもメモを閉じる",
    goal: "メモリ内の読書メモを開きます。読めた日も、数字にできない日も、開いたものを一度閉じて次の作業へ渡します。",
    demo: { prompt: "「5」と「紙」で試し、最後に出る作業記録の順番を比べましょう。", code: caught, input: "5", files: file },
    lessons: [
      {
        title: "開く・読む・閉じる", text: "教材の Memo は、この画面のメモリにある一件を扱います。Memo(文字) で開き、note.read() で数を読み、note.close() で閉じます。events は実際に行った操作の記録です。",
        files: file, code: start + 'note = Memo("4")\nprint(note.read())\nnote.close()\nprint(events)', output: "4\n['開く', '読む', '閉じる']",
        quiz: ["読んだ後に使わなくなったメモの操作は？", ["read を二度", "close を一度", "新しく開く", "events を消す"], 1, "使い終わった一件を close で閉じます。"],
        guide: exercise("閉じる行を一行足し、読んだ数を表示してからメモを閉じましょう。", start + "note = Memo(input())\nprint(note.read())", start + "note = Memo(input())\nprint(note.read())\nnote.close()", normal, "最後に note.close() を一度呼びます。", { files: file }),
        write: exercise("一件を開き、読んだ数に2を足して表示し、閉じましょう。", "", start + "note = Memo(input())\nprint(note.read() + 2)\nnote.close()", [checkLog("件数に2を足す", "7\n", "5", three), checkLog("空の棚", "2\n", "0", three)], "読むのは一度です。表示したら同じメモを閉じます。", { files: file }),
      },
      {
        title: "with で使う範囲を囲む", text: "with Memo(...) as note: と書くと、字下げした行の間だけ使い、抜けるときにメモの終了処理が動きます。手で close を重ねる必要はありません。",
        files: file, code: managed + "\nprint(events)", input: "3", output: "3\n['開く', '読む', '閉じる']",
        quiz: ["with から出た直後に記録される作業は？", ["開く", "読む", "閉じる", "もう一度読む"], 2, "この Memo は with の出口で close を一度実行します。"],
        guide: exercise("with が閉じたあとで二度目の close を呼ぶ見本を直しましょう。", managed + "\nnote.close()", managed, normal, "with の外の close を取り除くと、閉じた回数が一度になります。", { files: file }),
        write: exercise("with でメモを開き、読んだ数の2倍を表示しましょう。最後は自動で一度閉じます。", "", start + "with Memo(input()) as note:\n    print(note.read() * 2)", [checkLog("3件を倍に", "6\n", "3", three), checkLog("5件を倍に", "10\n", "5", three)], "with の内側で読み、表示します。外に close を足す必要はありません。", { files: file }),
      },
      {
        title: "読めなかった日の出口も追う", text: "読み取りで ValueError が出ても、with の出口は動きます。except を with の外に置くと、閉じた後で、読めなかったことを呼出元が案内できます。",
        files: file, code: caught, input: "紙", output: "読めません\n['開く', '読む', '閉じる']",
        quiz: ["読めないときの順番は？", ["読む→閉じる→外の案内", "読む→外の案内だけ", "閉じる→読む", "閉じるを二度"], 0, "例外が外へ伝わる途中でも with の出口が先に動きます。"],
        guide: exercise("不正な入力の案内を「数字を確認」に変えます。正常時は件数、最後にどちらも作業記録を表示しましょう。", caught, caught.replace("読めません", "数字を確認"), [checkLog("正しい入力", "3\n" + display, "3", three), checkLog("読めない入力", "数字を確認\n" + display, "紙", three)], "外の except の中の案内だけを変えます。", { files: file }),
        write: exercise("呼出元へ失敗を伝える練習です。正常な数を表示し、数字以外なら with で閉じた後に ValueError をそのまま伝えましょう。例外のときも出口の記録を調べます。", "", managed, [checkLog("正常終了", "7\n", "7", three), check("例外が伝わる", "", { input: "紙", error: "ValueError", afterError: "list(events)", value: three })], "with の中で読みます。この課題では ValueError を自分で受け取らず、呼出元に伝えます。", { files: file }),
      },
      {
        title: "入口と出口を小さく作る", text: "class は、道具が持つ操作をまとめる書き方です。self は今使う道具自身。with は入口の __enter__ を呼び、その返り値を as の名前に入れます。出口の __exit__ で後片付けし False を返すと、起きた例外は外へ伝わります。残り三つの引数は例外の情報です。",
        code: "events = []\n" + manager + "\n" + use, input: "紙", output: "読めません\n['読む', '閉じる']",
        quiz: ["__exit__ が例外を外へ伝える返し方は？", ["return True", "return 100", "return False", "return '成功'"], 2, "True を返すと例外を処理済みにします。ここでは False で伝えます。"],
        guide: exercise("失敗が外に届くよう Session の出口を直します。main.py が正常・例外の両方で使い、実際の記録を表示します。", manager.replace("return False", "return True"), manager, [check("正常の出口", "4\n['読む', '閉じる']\n", { input: "4" }), check("例外の出口", "読めません\n['読む', '閉じる']\n", { input: "紙" })], "出口で False を返して、例外を外へ伝えます。", { targetFile: "session.py", main: "from session import Session\nfrom session import events\n" + use, filePrefix: "events = []\n" }),
        write: exercise("Session の入口に「開く」、出口に「閉じる」を一度ずつ記録する道具を書きます。入口は自分自身を返し、失敗は呼出元へ伝えましょう。events は用意されています。", "", manager.replace("return self", "events.append('開く')\n        return self"), [check("正常の順序", "6\n['開く', '読む', '閉じる']\n", { input: "6", observe: "isinstance(current, Session)", value: true }), check("失敗後の順序", "読めません\n['開く', '読む', '閉じる']\n", { input: "字" })], "入口で記録して self を返し、出口で一度記録して False を返します。", { targetFile: "session.py", main: "from session import Session\nfrom session import events\n" + use, filePrefix: "events = []\n" }),
      },
    ],
  });
}
