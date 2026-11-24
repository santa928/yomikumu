"use strict";

{
  const rowCase = (label, rows, want, options = {}) =>
    check(label, want, { before: "rows = " + JSON.stringify(rows), ...options });
  const countCase = (label, counts, want) =>
    check(label, want, { before: "counts = " + JSON.stringify(counts) });
  const branchCases = (labels, counts) => counts.map((count, i) =>
    check(count + "件のとき", labels[i] + "\n", { before: "count = " + count }));
  const branches = `if count == 0:
    print("空")
elif count <= 2:
    print("少人数")
else:
    print("グループ")`;
  const stopOn = `while True:
    name = input()
    if name == "終了":
        break
    print(name)`;
  const keepNames = `for name in rows:
    if name == "":
        continue
    print(name)`;
  const numberNames = `for line_number, name in enumerate(rows, start=1):
    if name == "":
        continue
    print(line_number, name)`;
  const uniqueNames = `seen = set()
for name in rows:
    if name in seen:
        continue
    seen.add(name)
    print(name)`;
  const countNames = `counts = {}
for name in rows:
    counts[name] = counts.get(name, 0) + 1`;
  const rankNames = `for name in sorted(counts, key=counts.get, reverse=True):
    print(name, counts[name])`;
  const report = `counts = {}
for row in rows:
    name = row.strip()
    if name == "":
        continue
    counts[name] = counts.get(name, 0) + 1
${rankNames}`;

  pythonChapters.push({
    id: "names",
    title: "空白を除き、同じ名前が出る回数を数える",
    goal: "イベントの受付で入力した名前から、同じ名前が何回出てきたかを数えます。名前の前後の空白は除き、名前がない行は飛ばして、回数が多い順に表示します。",
    demo: {
      prompt: "入力欄には、1行につき1回分の受付が入っています。まず実行して、凪と光がそれぞれ何回出てくるか見てみましょう。次に「終了」の前に光を2行足すと、表示の順番はどうなりますか。",
      code: `counts = {}
while True:
    name = input().strip()
    if name == "終了":
        break
    if name == "":
        continue
    counts[name] = counts.get(name, 0) + 1
${rankNames}`,
      input: " 凪 \n光\n\n凪\n終了",
    },
    lessons: [
      {
        title: "elif で三つの場合に分ける",
        text: "if の条件に合わなかったとき、elif で次の条件を調べます。どの条件にも合わなければ else に進みます。上から調べて、最初に当てはまった場所だけを実行します。",
        code: "count = 1\n" + branches,
        output: "少人数",
        quiz: ["count が 0 のときに出るのは？", ["空", "少人数", "グループ", "空と少人数の両方"], 0, "最初の if で 0 件という条件に合い、その場所だけを実行します。"],
        guide: exercise(
          "見本では1件までが「少人数」です。2件までを「少人数」に変え、0件と3件以上の表示も確認しましょう。",
          branches.replace("<= 2", "<= 1"), branches, branchCases(["空", "少人数", "グループ"], [0, 2, 3]),
          "2件を含めるには、elif の比較を <= 2 にします。",
          { distractors: ["elif count < 2:", "elif count == 0:"] },
        ),
        write: exercise(
          "用意された count が0なら「受付なし」、1なら「個人」、2以上なら「グループ」と1行だけ表示しましょう。",
          "", `if count == 0:
    print("受付なし")
elif count == 1:
    print("個人")
else:
    print("グループ")`,
          branchCases(["受付なし", "個人", "グループ", "グループ"], [0, 1, 2, 5]),
          "if で0を確かめ、elif で1、else で残りを扱います。",
          { tapFocus: ['print("受付なし")', "elif count", 'print("グループ")'], distractors: ["elif count <= 2:", "elif count >= 2:", '    print("個人")'] },
        ),
      },
      {
        title: "strip で名前の前後の空白を取る",
        text: "文字列の後ろに .strip() を付けると、前後の空白を取った新しい文字列が返ります。名前の途中にある空白は残ります。角かっこを付けて表示すると、空白が取れたか見分けられます。",
        code: `raw = "  凪  "
name = raw.strip()
print("[" + name + "]")`, output: "[凪]",
        quiz: ['"  山 川  ".strip() の結果は？', ['"山川"', '"山 川"', '"  山 川"', '"山 川  "'], 1, "文字列の両端を整えるので、山と川の間の空白は残ります。"],
        guide: exercise(
          "受け取った名前の前後を整え、名前を角かっこで囲んで表示しましょう。",
          'name = input()\nprint("[" + name + "]")', 'name = input().strip()\nprint("[" + name + "]")',
          [check("両端に空白", "[凪]\n", { input: "  凪 " }), check("空白だけの入力", "[]\n", { input: "   " })],
          "input() が返す文字列に .strip() を付けます。",
          { distractors: ["name = input().strip", 'print("[" + input() + "]")'] },
        ),
        write: exercise(
          "一行で受け取った名前の前後の空白を取り、「担当:光」のように表示しましょう。「担当:」に続けて名前を表示します。",
          "", 'name = input().strip()\nprint("担当:" + name)',
          [check("前後に空白", "担当:光\n", { input: " 光  " }), check("名前の途中に空白", "担当:山 川\n", { input: "  山 川\t" })],
          "名前を受け取ってすぐ前後を整えます。「担当:」と整えた名前を + でつなぎましょう。",
          { distractors: ["name = input()", 'print("担当:", name)'] },
        ),
      },
      {
        title: "while と break で入力の終わりを決める",
        text: "何件入力するか決まっていないとき、while True で受け取りを繰り返せます。終わりの合図を読んだら break で繰り返しを抜けます。読む行を表示する前に合図を確かめます。",
        code: stopOn,
        input: "凪\n光\n終了",
        output: "凪\n光",
        quiz: ["最初から「終了」を入力すると、見本はどうなりますか。", ["「終了」を表示して終わる", "入力をもう一度待つ", "何も表示せずに終わる", "「終了」を繰り返し表示する"], 2, "表示に進む前に break が実行され、繰り返しが終わります。"],
        guide: exercise(
          "見本の終わりの合図を「おしまい」に変えましょう。合図の行で繰り返しを抜けます。",
          stopOn, stopOn.replace('"終了"', '"おしまい"'),
          [check("名前の後に合図", "陽\n海\n", { input: "陽\n海\nおしまい" }), check("すぐに合図", "", { input: "おしまい\n陽" })],
          "if で比べる文字列を「おしまい」に置き換えます。",
          { distractors: ['    if name != "おしまい":', '    if name == "終了":'] },
        ),
        write: exercise(
          "名前を一行ずつ受け取り、その都度表示しましょう。「終わり」を読んだらその行の表示をせず、最後に「受付完了」と1回だけ表示します。",
          "", stopOn.replace('"終了"', '"終わり"') + '\nprint("受付完了")',
          [check("名前2件の受付", "灯\n花\n受付完了\n", { input: "灯\n花\n終わり\n受付外" }), check("受付0件", "受付完了\n", { input: "終わり" })],
          "合図で break します。「受付完了」の print は while より外に置きます。",
          { tapFocus: ["while True", 'if name == "終わり"', "break"], distractors: ['    if name != "終わり":', '    print("受付完了")'] },
        ),
      },
      {
        title: "continue で空の行を飛ばす",
        text: "リストの確認中に continue が実行されると、今の行で残っている処理を飛ばし、次の行へ進みます。空の文字列は \"\" と書けます。",
        code: 'rows = ["陽", "", "海"]\n' + keepNames, output: "陽\n海",
        quiz: ["真ん中の行が空のとき、continue の次に調べるのは？", ["真ん中の行をもう一度", "リストの最初の行", "繰り返しを終える", "真ん中の次の行"], 3, "continue は今の行を飛ばし、次の行の調査から繰り返しを続けます。"],
        guide: exercise(
          "見本は空の名前を読むと繰り返しを終えます。空の名前を一行ずつ飛ばし、その後の名前も表示しましょう。",
          keepNames.replace("continue", "break"), keepNames,
          [rowCase("空の後にも名前", ["灯", "", "花"], "灯\n花\n"), rowCase("先頭が空", ["", "空"], "空\n")],
          "break の行を continue に直すと、次の行を読みにいけます。",
          { distractors: ["        break", '        print("")'] },
        ),
        write: exercise(
          "用意された rows の中身を順に見て、空の文字列を飛ばしましょう。名前がある行は「受付:花」のように「受付:」を付けて表示します。",
          "", keepNames.replace("print(name)", 'print("受付:" + name)'),
          [rowCase("前後に空の行", ["", "森", "", "光", ""], "受付:森\n受付:光\n"), rowCase("名前がない", ["", ""], "")],
          "空か確かめて、その行に印を付ける前に continue で次へ進みます。",
          { tapFocus: ['if name == ""', "continue"], distractors: ['    if name != "":', "        break"] },
        ),
      },
      {
        title: "enumerate で元の行番号を付ける",
        text: "enumerate(rows, start=1) で、リストの行を一つずつ読みながら1からの番号も受け取れます。for の後ろに「番号に使う名前, 1行分に使う名前」と書きます。空の行を飛ばしても、番号は元の名前の一覧の位置を表します。",
        code: 'rows = ["陽", "", "海"]\n' + numberNames, output: "1 陽\n3 海",
        quiz: ["1行目に「陽」、2行目に空文字列、3行目に「海」があります。「海」の出力は？", ["0 海", "1 海", "2 海", "3 海"], 3, "表示した件数ではなく、元の名前の一覧の3行目という番号を使います。"],
        guide: exercise(
          "行番号が0から始まっている見本を、1から始まるように直しましょう。",
          numberNames.replace("start=1", "start=0"), numberNames,
          [rowCase("名前の間に空の行がある一覧", ["空", "", "森"], "1 空\n3 森\n")],
          "enumerate の start に、最初の行番号を指定します。",
          { distractors: ["for line_number, name in enumerate(rows):", "for line_number, name in enumerate(rows, start=2):"] },
        ),
        write: exercise(
          "用意された rows を使い、名前が空の行を飛ばして「4 梢」のように番号と名前を表示しましょう。番号は元の名前の一覧の先頭を1行目として数えます。",
          "", numberNames,
          [rowCase("先頭と途中に空の行", ["", "光", "", "梢"], "2 光\n4 梢\n"), rowCase("空の行がない", ["澪", "灯"], "1 澪\n2 灯\n")],
          "enumerate で番号と名前を受け取ります。print(番号, 名前) は二つの値の間に空白を入れます。",
          { tapFocus: ["enumerate(", "print(line_number"], distractors: ["for line_number, name in enumerate(rows):", "    print(name, line_number)"] },
        ),
      },
      {
        title: "集合（set）で同じ名前の重複を避ける",
        text: "初めて来た人だけを呼びたいとき、set() で名前を覚える場所を用意します。set は同じ値を一つだけ持つ「集合」です。name in seen で受付済みか調べ、初めての名前は seen.add(name) で覚えます。",
        code: 'rows = ["凪", "光", "凪"]\n' + uniqueNames, output: "凪\n光",
        quiz: ["seen に「凪」が入っています。次の行が「凪」なら、見本ではどうなりますか。", ["「凪」を表示する", "「凪」を集合から消す", "「凪」の行を飛ばす", "名簿全体を読み終える"], 2, "name in seen が成り立ち、continue で今の行を飛ばします。"],
        guide: exercise(
          "見本は名前を表示するたびに、覚えた名前を消しています。受付済みの名前を集合に残して、最初に出たときだけ表示しましょう。",
          uniqueNames.replace("seen.add(name)", "seen = set()"), uniqueNames,
          [rowCase("離れた場所に同じ名前", ["森", "空", "森"], "森\n空\n"), rowCase("同じ名前が続く", ["海", "海"], "海\n")],
          "受付済みの名前を追加するときは、見本の最初に用意した集合に .add(name) します。",
          { distractors: ["    seen = set()", "    seen.add(rows)"] },
        ),
        write: exercise(
          "用意された rows から、名前を最初に見つけた順に1回ずつ「呼出:凪」の形で表示しましょう。空の名前は入っていません。",
          "", uniqueNames.replace("print(name)", 'print("呼出:" + name)'),
          [rowCase("間を空けて出てくる名前", ["灯", "花", "灯", "空", "花"], "呼出:灯\n呼出:花\n呼出:空\n"), rowCase("同じ名前が繰り返される", ["森", "森", "森"], "呼出:森\n")],
          "まだ集合に入っていない名前を、その場で覚えて表示しましょう。",
          { tapFocus: ["seen = set()", "if name in", "seen.add"], distractors: ["seen = {}", "    if name not in seen:", "    seen = set()"] },
        ),
      },
      {
        title: "辞書で名前が出てきた回数を数える",
        text: "名前をキーにして、辞書 counts に件数を入れます。counts.get(name, 0) は、name があればその件数を返し、初めての名前なら0を返します。そこに1を足して counts[name] に書き戻すと、初回は1件になります。",
        code: 'rows = ["凪", "光", "凪"]\n' + countNames + '\nprint(counts["凪"])\nprint(counts["光"])',
        output: "2\n1",
        quiz: ["空の辞書で、最初に「凪」を数えると何件として記録されますか。", ["0件", "1件", "2件", "初めての名前でエラーになる"], 1, "get が0を返すので、0 + 1 の1件を書き込みます。"],
        guide: exercise(
          "見本は初めての名前を2件として数えます。初回は1件になるよう直しましょう。",
          countNames.replace("get(name, 0)", "get(name, 1)") + '\nprint(counts["森"])',
          countNames + '\nprint(counts["森"])',
          [
            rowCase("森が1回", ["森", "空"], "1\n", { observe: 'counts["空"]', value: 1 }),
            rowCase("森が2回", ["森", "空", "森"], "2\n", { observe: 'counts["空"]', value: 1 }),
          ],
          "まだ記録がない名前を読んだとき、その行を数える前の件数は0です。",
          { distractors: ["    counts[name] = 1", "    counts[name] = counts[name] + 1"] },
        ),
        write: exercise(
          "rows の名前ごとの件数を辞書 counts に記録しましょう。その後、入力で受け取った名前の件数を表示します。一覧に出てこない名前なら0を表示します。",
          "", countNames + '\nname = input()\nprint(counts.get(name, 0))',
          [
            rowCase("登録済みの名前", ["梢", "花", "梢"], "2\n", { input: "梢", observe: '[counts["梢"], counts["花"]]', value: [2, 1] }),
            rowCase("登録のない名前", ["海", "灯", "灯"], "0\n", { input: "花", observe: '[counts["海"], counts["灯"]]', value: [1, 2] }),
          ],
          "数えるときも結果を表示するときも、見つからなければ0を返す get が使えます。",
          { tapFocus: ["counts[name] =", "print(counts.get("], distractors: ["    counts[name] = 1", "    counts[name] = counts[name] + 1", "print(counts[name])"] },
        ),
      },
      {
        title: "sorted で件数が多い名前から並べる",
        text: "sorted(counts) は、辞書のキーである名前を並べたリストを返します。件数を基準にするには key=counts.get と書きます。sorted が各名前を counts.get に渡して件数を確かめるので、ここでは括弧を付けずに渡します。reverse=True で多い順にします。同じ件数の名前は辞書に入った順です。",
        code: 'counts = {"凪": 1, "光": 3, "海": 2}\n' + rankNames, output: "光 3\n海 2\n凪 1",
        quiz: ["見本から reverse=True を外すと、最初に表示される名前は？", ["凪", "光", "海", "名前しか表示できなくなる"], 0, "件数の小さい順になり、1件の凪が最初になります。"],
        guide: exercise(
          "件数の少ない順になっている見本を、多い名前から表示するよう直しましょう。",
          rankNames.replace(", reverse=True", ""), rankNames,
          [countCase("名前と件数で順番が異なる", { 森: 1, 空: 4, 梢: 2 }, "空 4\n梢 2\n森 1\n")],
          "sorted の指定に reverse=True を足すと、件数の大きい方から並びます。",
          { distractors: ["for name in sorted(counts, reverse=True):", "for name in sorted(counts, key=counts.get, reverse=False):"] },
        ),
        write: exercise(
          "用意された辞書 counts を使い、件数の多い名前から「空 4」のように名前と件数を表示しましょう。同じ件数なら、辞書に並んでいる順で表示します。",
          "", rankNames,
          [countCase("件数に差がある", { 灯: 2, 森: 1, 花: 4 }, "花 4\n灯 2\n森 1\n"), countCase("同じ件数を含む", { 森: 2, 海: 2, 空: 3 }, "空 3\n森 2\n海 2\n")],
          "sorted に、件数を取り出す key=counts.get と、多い順にする reverse=True を渡しましょう。",
          { distractors: ["for name in sorted(counts, reverse=True):", "for name in sorted(counts, key=counts.get):", "    print(name)"] },
        ),
      },
      {
        title: "名前を整え、数えて、回数の多い順に表示する",
        text: "まず各行の名前を整え、空の名前なら次の行に進みます。名前を数え終えてから、件数の多い順に表示します。2回受付した人は2件として数えます。",
        code: 'rows = [" 雨 ", "星", "", "星", " "]\n' + report, output: "星 2\n雨 1",
        quiz: ["空白だけの行も混ざっているとき、処理の順番は？", ["名前を整える → 空の行を飛ばす → 数える → 件数順に表示", "空の行を飛ばす → 数える → 名前を整える → 件数順に表示", "件数順に表示 → 名前を整える → 数える → 空の行を飛ばす", "名前を整える → 件数順に表示 → 空の行を飛ばす → 数える"], 0, "先に前後の空白を取ると、空白だけの行も空の文字列として飛ばせます。表示は数え終えてから行います。"],
        guide: exercise(
          "見本は前後の空白が付いた名前をそのまま使っています。空白を整え、空の行を飛ばしてから件数を出しましょう。",
          report.replace("name = row.strip()", "name = row"), report,
          [rowCase("空白違いを同じ名前にまとめる", [" 月", "", "風", "風 ", "  "], "風 2\n月 1\n")],
          "row の前後を .strip() で整えると、空白だけの行も飛ばせます。",
          { distractors: ["    name = row", "    name = row.strip"] },
        ),
        write: exercise(
          "受付で入力した名前の一覧 rows を使い、名前の前後の空白を取り、空の行を飛ばしましょう。残った名前ごとに受付件数を数え、件数の多い順に「森 3」のように名前と件数を表示します。同じ件数なら名簿の中で先に出た名前から表示します。",
          "", report,
          [
            rowCase("空の行と前後の空白が混ざる一覧", [" 空 ", "森", " ", "森", "", " 空", "森"], "森 3\n空 2\n"),
            rowCase("名前と回数が変わる一覧", [" 梢", "花", "梢 ", "", "灯", "灯"], "梢 2\n灯 2\n花 1\n"),
            rowCase("名前のない行だけの一覧", ["", " "], ""),
          ],
          "各行を整える、空なら次へ進む、辞書で数える、数え終わってから件数順に表示する、の順です。",
          { tapFocus: ["row.strip()", "counts[name] =", "for name in sorted"], distractors: ["    name = row", "    counts[name] = 1", "for name in sorted(counts):"] },
        ),
      },
    ],
  });
}
