"use strict";

{
  const counts = { "counts.py": "def as_count(text):\n    return int(text)" };
  const one = "from counts import as_count\nprint(as_count(input()))";
  const recover = 'from counts import as_count\ntry:\n    print(as_count(input()))\nexcept ValueError:\n    print("数字を入力")';
  const total = 'from counts import as_count\ntry:\n    first = as_count(input())\n    print(first)\n    second = as_count(input())\n    print(first + second)\nexcept ValueError:\n    print("数字を入力")';
  const cases = [
    check("一件目と0件", "2\n2\n", { input: "2\n0" }),
    check("二件の合計", "3\n7\n", { input: "3\n4", hint: "一件目が読めました。二行目も受け取り、最後に二つの数を足します。" }),
    check("一件目を読んだ後の誤入力", "3\n数字を入力\n", { input: "3\n紙", hint: "一件目の表示を残し、二件目の ValueError を呼出元で受けます。" }),
    check("初めから誤入力", "数字を入力\n", { input: "紙\n4" }),
  ];
  pythonChapters.push({
    id: "58", title: "別ファイルの関数で2行の返却数を集計する",
    goal: "入力した2行の返却数を整数に変え、1行目の件数と2行の合計を表示します。整数に変えられないときは「数字を入力」と表示します。",
    demo: { prompt: "二行目を「紙」に変え、その後に数字へ直すとどうなるか試しましょう。", code: total, input: "2\n5", files: counts },
    lessons: [
      {
        title: "関数を別のファイルに書く", text: "counts.py には、数に1を足す関数 add_one が書いてあります。main.py から add_one(3) を呼ぶと、4が返り、画面にも4と表示されます。",
        files: { "counts.py": "def add_one(n):\n    return n + 1" }, code: "from counts import add_one\nprint(add_one(3))", output: "4",
        quiz: ["計算そのものを変更するときに開くファイルは？", ["main.py", "counts.py", "両方の名前を変える", "入力欄"], 1, "関数の中身がある counts.py を直します。"],
        guide: exercise("counts.py の add_two を直し、受け取った枚数に2を足して返しましょう。", "def add_two(n):\n    return n + 1", "def add_two(n):\n    return n + 2", [check("一枚を受ける", "3\n", { input: "1" }), check("五枚を受ける", "7\n", { input: "5" })], "counts.py の return で足す数を2にします。", { targetFile: "counts.py", main: "from counts import add_two\nprint(add_two(int(input())))" }),
        write: exercise("別ファイル counts.py に、入力の文字を数に直して返す as_count(text) を書きましょう。", "", counts["counts.py"], [check("2を数として加算", "3\n", { input: "2" }), check("10を数として加算", "11\n", { input: "10" })], "as_count は int(text) を呼び、結果を return で返します。", { targetFile: "counts.py", main: "from counts import as_count\nprint(as_count(input()) + 1)" }),
      },
      {
        title: "関数を読み込んで呼ぶ", text: "from counts import as_count は、counts.py の as_count をこのファイルで使うための一行です。.py を外した名前を書きます。読み込んだ後は普通の関数と同じように呼べます。",
        files: counts, code: one, input: "5", output: "5",
        quiz: ["モジュール counts.py の関数を読み込む一行は？", ["from counts.py import as_count", "import as_count from counts", "from counts import as_count", "print(counts)"], 2, "from の後はファイル名から .py を外した counts です。"],
        guide: exercise("読み込むファイル名を正しく直して、入力した数をそのまま表示しましょう。", "from tickets import as_count\nprint(as_count(input()))", one, [check("二枚", "2\n", { input: "2" }), check("先頭の0を含む数字", "4\n", { input: "04" })], "今あるファイルは counts.py です。from counts と書きます。", { files: counts }),
        write: exercise("別ファイルの as_count を読み込み、一行の入力を数にして、2枚足した結果を表示しましょう。", "", "from counts import as_count\nprint(as_count(input()) + 2)", [check("数の加算", "6\n", { input: "4", observe: "as_count('09')", value: 9 }), check("入力が0", "2\n", { input: "0" })], "import した関数に入力を渡し、返った数に2を足します。", { files: counts }),
      },
      {
        title: "変換できない行を観察する", text: "int は「3」を整数にできますが、「紙」は整数にできません。このとき ValueError という例外が発生し、その行で通常の流れが止まります。エラーの場合も、そこまでの表示は残ります。",
        files: counts, code: 'from counts import as_count\nprint("読取")\nprint(as_count(input()))', input: "紙", output: "読取", error: "ValueError",
        quiz: ["「紙」を変換しようとすると、何が起きますか。", ["0に変わる", "紙が消える", "必ず次の行に進む", "ValueErrorで通常の流れが止まる"], 3, "数字にできない理由を示す例外が出ます。"],
        guide: exercise("固定の「2」の代わりに入力を変換し、正しい値と ValueError の両方を観察しましょう。", 'from counts import as_count\nprint(as_count("2"))', one, [check("数字なら表示", "2\n", { input: "2" }), check("数字以外なら停止", "", { input: "豆", error: "ValueError" })], "関数に渡す文字を input() で受け取りましょう。", { files: counts }),
        write: exercise("最初に「開始」を表示してから入力を数に直して表示しましょう。数字以外のときは「開始」まで残れば成功です。", "", 'from counts import as_count\nprint("開始")\nprint(as_count(input()))', [check("数字を読む", "開始\n4\n", { input: "4" }), check("途中で止まる", "開始\n", { input: "羽", error: "ValueError" })], "開始を先に表示し、次の行で変換を試します。", { files: counts }),
      },
      {
        title: "変換に失敗したときの表示を決める", text: "「2」を入力すると try の中で整数に変換でき、2が表示されます。「紙」の場合は as_count が ValueError を起こし、main.py の except ValueError: の下にある「数字を入力」が表示されます。",
        files: counts, code: recover, input: "紙", output: "数字を入力",
        quiz: ["入力が「2」、次の実行で「紙」。通る順番は？", ["両方とも except", "成功して表示、次は except の案内", "最初だけ except", "両方ともエラーのまま"], 1, "「2」は try の表示へ進み、「紙」は呼出元の except に届きます。"],
        guide: exercise("エラーを受けた時の案内だけを「もう一度」に変えましょう。", recover, recover.replace("数字を入力", "もう一度"), [check("数字ならそのまま", "4\n", { input: "4" }), check("誤入力なら案内", "もう一度\n", { input: "紙" })], "except の中に置いた print の文字だけを変えます。", { files: counts }),
        write: exercise("入力を数にして1足した結果を表示し、数字以外なら「数を確認」と知らせましょう。", "", 'from counts import as_count\ntry:\n    print(as_count(input()) + 1)\nexcept ValueError:\n    print("数を確認")', [check("正常な枚数", "7\n", { input: "6" }), check("不正な枚数", "数を確認\n", { input: "空" })], "try に変換と足し算を置き、except ValueError で短い案内を表示します。", { files: counts }),
      },
      {
        title: "二件の途中経過と合計を出す", text: "一件目を数にできたら先に表示します。二件目が正しいときにだけ合計へ進みます。二件目で失敗しても、一件目が読めたことと、直すべき入力が分かります。",
        files: counts, code: total, input: "3\n4", output: "3\n7",
        quiz: ["3、紙 の二行なら、順に何が見えますか。", ["3、数字を入力", "3、0", "数字を入力だけ", "3、紙"], 0, "二件目で例外になる前に、一件目の3は表示済みです。"],
        guide: exercise("二件目だけを出す見本の最後の計算を、一件目と二件目の合計に変えましょう。", total.replace("first + second", "second"), total, cases, "二件を受け取った後の print に first + second を渡します。", { files: counts }),
        write: exercise("入館人数を2行で受け取り、counts.py の as_count で整数に変えましょう。1行目の人数を先に表示し、2行目も読めたら合計を表示します。整数に変えられないときは「数字を入力」と表示してください。", "", total, cases, "まず一件目を受けて表示できるか確かめ、次に二件目の加算と案内をつなぎます。", { files: counts, editFiles: true }),
      },
    ],
  });
}
