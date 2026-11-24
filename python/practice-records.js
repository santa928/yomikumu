"use strict";

{
  const record = "from dataclasses import dataclass\n@dataclass\nclass Record:\n    minutes: int";
  const valid = "def valid(n):\n    return isinstance(n, int) and n >= 0";
  const archive = { "archive.py": [
    record, valid, "class Notes:", "    def __init__(self, nums):", "        self.items = [Record(n) for n in nums]",
    "        self.closed = 0", "    def __enter__(self):", "        return self.items", "    def __exit__(self, kind, value, trace):",
    "        self.closed += 1", "        return False",
  ].join("\n") };
  function totals(threshold, expected) {
    return [[], [0, 15, 30, 60], [-1], [threshold]].map((list, i) => check(
      ["空の集計", "境界を含む複数件", "不正値でも閉じる", "境界ちょうど"][i], expected[i] + "\n",
      { before: "from archive import Notes, valid\nnotes = Notes(" + JSON.stringify(list) + ")", observe: "notes.closed", value: 1 },
    ));
  }
  function aggregate(limit) {
    return "total = 0\ntry:\n    with notes as rows:\n        for row in rows:\n            if not valid(row.minutes):\n                raise ValueError('記録を確認')\n            if row.minutes >= " + limit + ":\n                total += row.minutes\n    print(total)\nexcept ValueError:\n    print('記録を確認')";
  }
  const yesNo = (expr, value, label) => check(label, "", { observe: expr, value });
  pythonChapters.push({
    id: "62", engine: "cpython", title: "記録の値が正しいか確かめ、合計する",
    goal: "読書時間を1件分のデータにまとめ、入力が0以上の整数かをプログラムで確かめます。条件に合う時間を合計してから、空の入力や不正な値でも想定どおりに動くかをテストします。",
    demo: { prompt: "入力した時間と60分の記録のうち、30分以上のものを合計します。15、30、-1を順に試しましょう。最後の1は記録を閉じた回数です。", input: "30", files: archive,
      code: "from archive import Notes, valid\nnotes = Notes([int(input()), 60])\n" + aggregate(30) + "\nprint(notes.closed)" },
    lessons: [
      {
        title: "型注釈は何を知らせる？", text: "minutes: int は「minutes は整数として使う」という型注釈です。人や型を検査する道具の手掛かりになります。Pythonが実行中に文字列を自動で拒んだり、整数に変えたりするわけではありません。見本でも、数の12のあとに文字列の「十二」を代入でき、そのまま表示されます。",
        code: 'minutes: int = 12\nprint(minutes)\nminutes = "十二"\nprint(minutes)', output: "12\n十二",
        quiz: ["minutes: int に「十二」を代入すると、注釈だけでどうなる？", ["自動で12になる", "必ず拒否される", "文字も代入できる", "変数が消える"], 2, "型を伝える注釈と、実行時のチェックは別です。"],
        guide: exercise("読書時間の値を15にし、int の注釈と表示は残しましょう。", "minutes: int = 12\nprint(minutes)", "minutes: int = 15\nprint(minutes)", [check("値と注釈", "15\n", { observe: "__annotations__.get('minutes') is int", value: true })], "コロンの右の型は int のまま、値だけ15にします。"),
        write: exercise("冊数 count に整数の注釈を付け、0を入れて表示しましょう。", "", "count: int = 0\nprint(count)", [check("冊数0と型注釈", "0\n", { observe: "__annotations__.get('count') is int", value: true })], "count: int = 0 と書くと、初期値と型の両方が読めます。"),
      },
      {
        title: "dataclass で記録の項目をまとめる", text: "Record(15) で15分の読書記録を作り、entry.minutes で15を取り出します。Book の例では __init__ を手書きしました。class Record の上に @dataclass を付けると、型注釈のある項目から __init__ が作られます。型注釈はあっても、値が正しいかの検査は別に書きます。",
        code: record + "\nentry = Record(15)\nprint(entry.minutes)", output: "15",
        quiz: ["entry = Record(20) のあと、読書時間の20を取り出す式は？", ["Record.minutes(20)", "entry.minutes", "entry[20]", "dataclass(20)"], 1, "entry に一件が入っていれば、ドットの後に項目名を書いて取り出せます。"],
        guide: exercise("Record を作る引数を20に変え、entry の minutes を表示しましょう。", record + "\nentry = Record(15)\nprint(entry.minutes)", record + "\nentry = Record(20)\nprint(entry.minutes)", [check("読書20分", "20\n", { observe: "[entry.minutes, Record(0).minutes]", value: [20, 0] })], "作成する Record(…) の中身を変更します。"),
        write: exercise("pages という整数項目を一つ持つ dataclass の BookLog を作りましょう。採点が0ページと18ページの記録を作ります。", "", "from dataclasses import dataclass\n@dataclass\nclass BookLog:\n    pages: int", [yesNo("[BookLog(0).pages, BookLog(18).pages, hasattr(BookLog, '__dataclass_fields__')]", [0, 18, true], "二つの記録を作成")], "class の前に @dataclass、内側に pages: int を置きます。"),
      },
      {
        title: "入力が0以上の整数か実行中に調べる", text: "isinstance(n, int) は n が整数として扱えるかを調べます。and は二つの条件が両方 True のときだけ True。0分を許し、負の分と数字の文字を拒む検証を作ります。ここでは入力は整数または文字です。",
        code: valid + '\nprint(valid(0))\nprint(valid(-1))\nprint(valid("2"))', output: "True\nFalse\nFalse",
        quiz: ["0以上の整数を許す検査で、境界を確かめる入力は？", ["5と6だけ", "0と−1", "空リストだけ", "2と3だけ"], 1, "0を許し、すぐ隣の−1を拒むことを個別に見ます。"],
        guide: exercise("0分を除いてしまう見本を直し、0以上の整数だけを許す valid を作りましょう。", valid.replace(">= 0", "> 0"), valid, [yesNo("valid(3)", true, "正の数"), yesNo("valid(0)", true, "0分を含む"), yesNo("[valid(-1), valid('2')]", [false, false], "不正な値")], "種類を調べる条件を残し、0に等しい場合を許します。"),
        write: exercise("valid_page(n) は1以上の整数ページだけを許します。0ページと数字の文字は False を返してください。", "", "def valid_page(n):\n    return isinstance(n, int) and n >= 1", [yesNo("valid_page(1)", true, "最初のページ"), yesNo("[valid_page(0), valid_page('1')]", [false, false], "範囲外と種類違い")], "まず整数かを確かめ、1以上のときだけ True にします。"),
      },
      {
        title: "期待する結果を小さなテストにする", text: "assert 条件 は、条件が True ならそのまま進み、False なら AssertionError で止まります。たとえば valid を書き換えて0分を誤って除いたとき、このテストで気付けます。== は二つの値が等しいかを調べます。",
        code: valid + '\nassert valid(0) == True\nprint("確認できた")', output: "確認できた",
        quiz: ["assert valid(0) == True が止まるのは？", ["valid(0) が True", "valid(0) が False", "0を書くと必ず", "毎回"], 1, "期待は True なので、False に変わった場合に失敗します。"],
        guide: exercise("境界の0分を許すか調べるテストに直しましょう。正しい実装なら通り、0分を拒む実装なら AssertionError で止まるのが成功です。", "assert valid(1) == True", "assert valid(0) == True", [check("正しい検証", "", { before: valid }), check("0を除く誤りを検出", "", { before: valid.replace(">= 0", "> 0"), error: "AssertionError" })], "assert に渡す例を、境界の0分にします。"),
        write: exercise("負の読書時間を拒むことを assert で検査してください。負の値を許す誤実装で止まるテストにします。", "", "assert valid(-1) == False", [check("正しい検証", "", { before: valid }), check("負の値を許す誤りを検出", "", { before: "def valid(n):\n    return isinstance(n, int)", error: "AssertionError" })], "期待する False を、負の具体例で確かめます。"),
      },
      {
        title: "記録を一つずつ検査し、with で後片付けする", text: "with notes as rows: で読書記録のリストを受け取り、1件ずつ時間を調べます。不正な値なら raise ValueError(...) で例外を起こします。最後に表示する notes.closed は終了処理の回数です。正常なときも例外が起きたときも1になります。",
        files: archive, code: "from archive import Notes, valid\nnotes = Notes([0, 15])\n" + aggregate(0) + "\nprint(notes.closed)", output: "15\n1",
        quiz: ["不正な記録で raise した場合、with の後片付けは？", ["行われない", "二度行う", "with を抜けるときに一度行う", "次の実行まで待つ"], 2, "with を抜ける途中で Notes の終了処理が動きます。"],
        guide: exercise("合計の初期値を直し、0分以上の記録をすべて合計しましょう。数字以外・負の入力には「記録を確認」と表示します。", aggregate(0).replace("total = 0", "total = 1"), aggregate(0), totals(0, ["0", "105", "記録を確認", "0"]), "一件も読まないときの結果から、合計の初期値を決めます。", { files: archive }),
        write: exercise("Notes を with で開き、件数を数えましょう。正しい記録の個数を表示し、不正が一つでもあれば「記録を確認」と表示します。", "", aggregate(0).replace("total += row.minutes", "total += 1"), totals(0, ["0", "4", "記録を確認", "1"]), "記録を検証後、分の値の代わりに1ずつ足します。", { files: archive }),
      },
      {
        title: "別の条件で読書時間を集計する", text: "同じ記録でも調べたいことは変わります。すべての時間を検査し、条件に合う分だけ足します。空、境界ぴったり、不正値を別々のテスト入力にすると、直す場所を見つけやすくなります。",
        files: archive, code: "from archive import Notes, valid\nnotes = Notes([15, 30, 60])\n" + aggregate(30), output: "90",
        quiz: ["30分以上を合計するテストで、30分一件なら期待値は？", ["0", "1", "30", "60"], 2, "境界ちょうどの記録も合計に含みます。"],
        guide: exercise("30分ぴったりが漏れる集計を直しましょう。全件を検査し、30分以上だけの合計を表示します。", aggregate(30).replace(">= 30", "> 30"), aggregate(30), totals(30, ["0", "90", "記録を確認", "30"]), "選ぶ境界を >= 30 にします。", { files: archive }),
        write: exercise("全件の読書時間を検査し、60分以上の記録の合計を表示しましょう。記録が空なら0、不正な値が一つでもあれば「記録を確認」と表示します。どの場合も Notes を1回閉じてください。", "", aggregate(60), totals(60, ["0", "60", "記録を確認", "60"]), "空の合計、60分ぴったり、不正な値の三つの経路を順に確かめます。", { files: archive }),
      },
    ],
  });
}
