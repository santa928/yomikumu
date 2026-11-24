"use strict";

{
  const files = {
    "reading.csv": "title,minutes\n図書室の地図,15\n夜の観察,20\n",
    "reading_with_comma.csv": 'title,minutes\n月のしおり,8\n"山,海の図鑑",12\n',
    "reading_empty.csv": "title,minutes\n",
    "reading_invalid.csv": "title,minutes\n図書室の地図,15\n夜の観察,未記入\n",
  };
  const reordered = "minutes,title\n9,夕暮れの地図\n6,木陰の本棚\n";
  const numberFiles = {
    ...files,
    "reading_reordered.csv": reordered,
    "reading_zero_minutes.csv": "title,minutes\n夕暮れの地図,0\n",
    "reading_negative.csv": "title,minutes\n夕暮れの地図,-1\n",
    "reading_blank_minutes.csv": "title,minutes\n夕暮れの地図,\n",
  };
  const bookCases = (normal, quoted, reversed) => [
    check("通常の記録", normal + "\n", { input: "reading.csv" }),
    check("題名にカンマがある記録", quoted + "\n", { input: "reading_with_comma.csv" }),
    check("列順が逆の記録", reversed + "\n", { input: "reading_reordered.csv" }),
  ];
  const headerCases = (normal, reversed) => [
    check("title が先の見出し", normal + "\n", { input: "reading.csv" }),
    check("minutes が先の見出し", reversed + "\n", { input: "reading_reordered.csv" }),
  ];
  const headerFiles = { "reading.csv": files["reading.csv"], "reading_reordered.csv": reordered };
  const readingFiles = { ...headerFiles, "reading_with_comma.csv": files["reading_with_comma.csv"] };
  const validFiles = { ...readingFiles, "reading_empty.csv": files["reading_empty.csv"] };

  const readLine = (body, path = "input()") => `with open(${path}, encoding="utf-8") as file:
${body}`;

  const read = (body, path = "input()") => `import csv
with open(${path}, encoding="utf-8", newline="") as file:
    reader = csv.DictReader(file)
${body}`;

  const summary = `import csv

def total_minutes(path):
    total = 0
    with open(path, encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            total += int(row["minutes"])
    return total`;

  const checkedSummary = summary.replace('            total += int(row["minutes"])', `            try:
                minutes = int(row["minutes"] or "")
                if minutes < 0:
                    raise ValueError()
            except ValueError:
                raise ValueError(f"{reader.line_num}行目の分を確認してください")
            total += minutes`);

  const totalCases = [
    check("15分と20分を合計", "", { observe: 'total_minutes("reading.csv")', value: 35 }),
    check("題名にカンマがあっても分を合計", "", { observe: 'total_minutes("reading_with_comma.csv")', value: 20 }),
    check("見出しだけなら0", "", { observe: 'total_minutes("reading_empty.csv")', value: 0 }),
    check("分が先頭列でも合計", "", { observe: 'total_minutes("reading_reordered.csv")', value: 15 }),
  ];
  const zeroCase = check("0分は正しい記録", "", {
    observe: 'total_minutes("reading_zero_minutes.csv")', value: 0,
  });
  const errorCases = [
    check("文字があった3行目を知らせる", "", {
      observe: 'total_minutes("reading_invalid.csv")', error: "ValueError: 3行目の分を確認してください",
    }),
    check("負の分があった2行目を知らせる", "", {
      observe: 'total_minutes("reading_negative.csv")', error: "ValueError: 2行目の分を確認してください",
    }),
    check("分が空欄の2行目を知らせる", "", {
      observe: 'total_minutes("reading_blank_minutes.csv")', error: "ValueError: 2行目の分を確認してください",
    }),
  ];
  const importSummary = "from reading_summary import total_minutes";

  pythonChapters.push({
    id: "csv",
    engine: "cpython",
    title: "表のファイル（CSV）を読み、数値を集計する",
    goal: "CSVは表の項目をカンマで区切って保存するファイルです。本の題名と読んだ時間（分）が入ったCSVを読み、分を合計します。分の値が不正なら行番号を知らせます。",
    demo: {
      prompt: "実行すると15分と20分が合計されます。入力欄のファイル名を reading_with_comma.csv、reading_empty.csv、reading_invalid.csv に変え、同じコードで何が表示されるか比べましょう。すべてのCSVは教材に用意してあります。",
      input: "reading.csv",
      files,
      code: checkedSummary + `

path = input()
try:
    print(total_minutes(path))
except ValueError as error:
    print(error)`,
    },
    lessons: [
      {
        title: "CSVファイルを開いて先頭の行を読む",
        text: "CSVは、カンマで項目を区切って表を保存できる文字のファイルです。この例では、1行目が列の名前で、その次の行から読書記録が入っています。with open で読み、encoding に「utf-8」を指定すると、日本語の題名を読めます。file.readline() は改行までの1行を取り出します。print に end=\"\" を指定すると、読んだ行をそのまま表示できます。",
        files: { "reading.csv": files["reading.csv"] },
        code: readLine('    print(file.readline(), end="")', '"reading.csv"'),
        output: "title,minutes",
        quiz: ["配布の reading.csv を開いて、初めて readline() を呼ぶと何が読めますか？",
          ["全部の記録", "最初の読書時間", "先頭の title,minutes の行", "最後の題名"], 2, "最初に読むのは、列の見出しが書かれた1行目です。"],
        guide: exercise(
          "入力欄のファイル名からCSVを開く見本です。ファイル全部が出る表示を直して、先頭行だけを表示しましょう。",
          readLine('    print(file.read(), end="")'),
          readLine('    print(file.readline(), end="")'),
          headerCases("title,minutes", "minutes,title"),
          "file.read() を file.readline() にすると、読む範囲が先頭行だけになります。",
          { files: headerFiles },
        ),
        write: exercise(
          "入力欄のファイル名を input() で読み、ファイルをUTF-8として開きましょう。先頭行を読み進めてから、2行目だけを表示します。print の end に空文字を指定してください。",
          "",
          readLine('    file.readline()\n    print(file.readline(), end="")'),
          headerCases("図書室の地図,15", "9,夕暮れの地図"),
          "file.readline() を2回使い、2回目の結果だけを print に渡します。",
          { files: headerFiles, distractors: ['    print(file.read(), end="")'] },
        ),
      },
      {
        title: "CSVの1行目を列名として読む",
        text: "先ほどは「title,minutes」を文字の1行として読みました。csv.DictReader は先頭行を「title」「minutes」のように列名に分け、fieldnames に一覧で入れます。CSVを扱うときは open の newline に空文字を指定し、改行の扱いを csv に任せます。",
        files: { "reading.csv": files["reading.csv"] },
        code: read("    print(reader.fieldnames)", '"reading.csv"'),
        output: "['title', 'minutes']",
        quiz: ["見出しが title,minutes のCSVでは、reader.fieldnames[1] は何ですか？",
          ["title", "minutes", "最初の題名", "最初の読書時間"], 1, "fieldnames は列名の一覧です。[1] は2番目の列名を表します。"],
        guide: exercise(
          "入力欄のCSVを開く見本です。表示を直して、最初の列名だけを表示しましょう。",
          read("    print(reader.fieldnames)"),
          read("    print(reader.fieldnames[0])"),
          headerCases("title", "minutes"),
          "列名の一覧の最初を取り出すには、fieldnames の後ろに [0] を付けます。",
          { files: headerFiles },
        ),
        write: exercise(
          "入力欄にあるファイル名を input() で受け取り、with open で UTF-8 のCSVを開きます。csv.DictReader で読み、2番目の列名だけを表示しましょう。",
          "",
          read("    print(reader.fieldnames[1])"),
          headerCases("minutes", "title"),
          "1番目は [0]、2番目は [1] です。ファイルを開いた with の内側で表示します。",
          {
            files: headerFiles,
            tapFocus: ['with open(', "csv.DictReader", "reader.fieldnames["],
            distractors: [
              'with open(input(), encoding="ascii", newline="") as file:',
              "    reader = csv.reader(file)",
              "    print(reader.fieldnames[0])",
            ],
          },
        ),
      },
      {
        title: "列名で1件の値を取り出す",
        text: "next(reader) が返す1件は、列名から値を取り出せる辞書です。row[\"title\"] は題名です。CSVで引用符に囲まれた「山,海の図鑑」は、途中にカンマがあってもひとつの題名として読み取れます。",
        files: { "reading_with_comma.csv": files["reading_with_comma.csv"] },
        code: read(`    next(reader)
    row = next(reader)
    print(row["title"])`, '"reading_with_comma.csv"'),
        output: "山,海の図鑑",
        quiz: ['row["title"] が取り出すものは？',
          ["見出し全体", "二つの記録", "今読んだ1件の題名", "CSVのファイル名"], 2, "row は1件の辞書です。角かっこに列名を書くと、その列の値を取り出せます。"],
        guide: exercise(
          "入力欄のCSVから最初の1件を読みます。辞書全体の表示を、その記録の題名だけの表示に変えましょう。",
          read("    row = next(reader)\n    print(row)"),
          read('    row = next(reader)\n    print(row["title"])'),
          bookCases("図書室の地図", "月のしおり", "夕暮れの地図"),
          'print に row["title"] を渡します。',
          { files: readingFiles },
        ),
        write: exercise(
          "入力欄のCSVには2件あります。input() でファイル名を受け取り、2件目の題名だけを表示しましょう。",
          "",
          read(`    next(reader)
    row = next(reader)
    print(row["title"])`),
          bookCases("夜の観察", "山,海の図鑑", "木陰の本棚"),
          "1回目の next は読み進めるだけです。2回目が返す辞書から title の値を取り出します。",
          {
            files: readingFiles,
            tapFocus: ["next(reader)", "row = next(reader)", 'row["title"]'],
            distractors: [
              "    next(file)",
              "    row = reader",
              '    print(row["minutes"])',
            ],
          },
        ),
      },
      {
        title: "読書時間を文字から整数に変える",
        text: "DictReader で読んだ値は文字です。15を読み取っても、文字のまま2倍すると「1515」になります。int に渡して整数に変えると、掛け算や足し算ができます。",
        files: { "reading.csv": files["reading.csv"] },
        code: read(`    row = next(reader)
    print(row["minutes"] * 2)
    print(int(row["minutes"]) * 2)`, '"reading.csv"'),
        output: "1515\n30",
        quiz: ["CSVの文字から読書時間を足せるようにするには？",
          ["先に int で整数に変える", "先に2倍して文字を繰り返す", "title のまま足す", "列名を消す"], 0, "int に分の文字を渡せば、整数の足し算ができます。"],
        guide: exercise(
          "最初の1件の分を2倍する見本を直しましょう。入力欄のCSVから読み、数字として計算した結果を表示します。",
          read(`    row = next(reader)
    minutes = row["minutes"]
    print(minutes * 2)`),
          read(`    row = next(reader)
    minutes = int(row["minutes"])
    print(minutes * 2)`),
          bookCases("30", "16", "18"),
          'minutes に入れる前に、int(row["minutes"]) で変換します。',
          { files: readingFiles },
        ),
        write: exercise(
          "入力欄のCSVから最初の1件を読み、読書時間に5分を足して表示しましょう。",
          "",
          read(`    row = next(reader)
    minutes = int(row["minutes"])
    print(minutes + 5)`),
          bookCases("20", "13", "14"),
          "文字を整数にしてから5を足します。",
          {
            files: readingFiles,
            tapFocus: ['int(row["minutes"])', "print(minutes + 5)"],
            distractors: [
              '    minutes = row["minutes"]',
              '    minutes = int(row["title"])',
              "    print(minutes * 5)",
            ],
          },
        ),
      },
      {
        title: "すべての行の読書時間を合計する",
        text: "for row in reader: と書くと、1件ずつ読み終わるまで処理できます。合計を0から始め、毎回、整数にした分を足しましょう。見出しだけのファイルでは繰り返しが一度も行われず、合計は0のままです。",
        files: { "reading.csv": files["reading.csv"] },
        code: summary + '\n\nprint(total_minutes("reading.csv"))',
        output: "35",
        quiz: ["見出しだけのCSVで、この合計が0になる理由は？",
          ["見出しに0がある", "読み始めにエラーが出る", "見出しを1件と数える", "足す記録がなく最初の0が残る"], 3, "見出しは列名に使われ、for に渡される記録がありません。"],
        guide: exercise(
          "1件につき1を足す関数を直しましょう。total_minutes(path) は全件の分を足し、合計を返します。見出しだけなら0です。",
          summary.replace('total += int(row["minutes"])', "total += 1"),
          summary,
          totalCases,
          "件数の1を足す行を、minutes の値を整数にして足す行に変えます。",
          { files: validFiles },
        ),
        write: exercise(
          "total_minutes(path) を作りましょう。path のCSVを開き、全件の読書時間を整数にして足し、合計を return で返します。見出しだけなら0を返します。ここでは分はすべて正しい整数です。",
          "",
          summary,
          totalCases,
          "total を0にしてからファイルを開き、for の中で足します。return は for の後に置きます。",
          {
            files: validFiles,
            tapFocus: ["total = 0", "for row in reader", 'total += int(row["minutes"])'],
            distractors: [
              "    total = 1",
              "        for row in file:",
              "            total += 1",
            ],
          },
        ),
      },
      {
        title: "読書時間が不正な行の番号を知らせる",
        text: "int で分を整数にできないと ValueError が起きます。空欄も変換できないので、空の文字として int に渡します。負の分は、自分で ValueError を起こして同じ案内に進めます。reader.line_num は、ファイルからここまで読んだ行の数です。この例では1件の記録が1行なので、見出しを数に含めて、2件目の誤りを3行目と知らせます。",
        files: { "reading_invalid.csv": files["reading_invalid.csv"] },
        code: checkedSummary + `

try:
    print(total_minutes("reading_invalid.csv"))
except ValueError as error:
    print(error)`,
        output: "3行目の分を確認してください",
        quiz: ["見出し1行のあとに記録が2件あり、最初の記録の分が空欄です。何行目を知らせますか？",
          ["0行目", "1行目", "2行目", "3行目"], 2, "見出しが1行目なので、最初の記録は2行目です。"],
        guide: exercise(
          "どの誤りでも2行目と知らせる見本を直しましょう。正しいCSVは合計を返し、分が不正なら実際の行番号を入れた ValueError を起こします。",
          checkedSummary.replace('f"{reader.line_num}行目', '"2行目'),
          checkedSummary,
          [totalCases[0], zeroCase, ...errorCases],
          "固定の2を reader.line_num で置き換えます。f\"{式}行目…\" と書くと、式の値が文に入ります。",
          { files: numberFiles },
        ),
        write: exercise(
          "total_minutes(path) を作りましょう。0以上の整数の分をすべて合計して返します。分が空欄、負の数、整数にできない文字なら、合計の代わりに「○行目の分を確認してください」を入れた ValueError を起こしてください。○には読み取った行番号を入れます。",
          "",
          checkedSummary,
          [...totalCases, zeroCase, ...errorCases],
          "int と負の分の検査を try に置き、except ValueError で reader.line_num を入れた案内を作ります。",
          {
            files: numberFiles,
            tapFocus: ['int(row["minutes"]', "if minutes < 0:", 'raise ValueError(f"'],
            distractors: [
              '                minutes = int(row["title"])',
              "                if minutes <= 0:",
              '                raise ValueError("2行目の分を確認してください")',
            ],
          },
        ),
      },
      {
        title: "別のCSVで、合計を確かめるテストを書く",
        text: "まずファイルを見て期待する合計を自分で求めます。テストでは assert の後ろに「関数の結果 == 期待する合計」と書きます。合っていれば次に進み、違うと AssertionError で止まります。関数とテストを別のファイルに置くと、関数を直したあとも同じテストで確かめられます。",
        files: { ...validFiles, "reading_summary.py": checkedSummary + "\n" },
        code: importSummary + '\n\nassert total_minutes("reading.csv") == 35\nprint("合計を確認できた")',
        output: "合計を確認できた",
        quiz: ["題名にカンマがある別のCSVを試すとき、期待値に使うものは？",
          ["プログラムが今回返した数", "CSVの分を先に手で足した数", "いつも0", "題名の数"], 1, "プログラムを実行する前にCSVから期待値を決めます。結果が違えばテストで分かります。"],
        guide: exercise(
          "total_minutes は用意されています。テストに書いた期待値を直し、見出しだけのCSVの合計が0かを確かめましょう。",
          'assert total_minutes("reading_empty.csv") == 1',
          'assert total_minutes("reading_empty.csv") == 0',
          [
            check("合計0を返す関数で通る", "", { before: importSummary }),
            check("誤って合計1を返す関数を見つける", "", {
              before: "def total_minutes(path):\n    return 1", error: "AssertionError",
            }),
          ],
          "足す記録が一件もないので、期待する合計は0です。",
          { files: { "reading_empty.csv": files["reading_empty.csv"], "reading_summary.py": checkedSummary + "\n" } },
        ),
        write: exercise(
          "total_minutes は用意されています。reading_with_comma.csv の中を見て分を手で足し、assert で関数の結果と比べるテストを1行書きましょう。テストが期待通りなら、結果を表示する必要はありません。",
          "",
          'assert total_minutes("reading_with_comma.csv") == 20',
          [
            check("正しい集計を受け入れる", "", { before: importSummary }),
            check("カンマのある記録を飛ばした集計を見つける", "", {
              before: summary.replace('            total += int(row["minutes"])', '            if "," not in row["title"]:\n                total += int(row["minutes"])'),
              error: "AssertionError",
            }),
            check("分が1多い集計を見つける", "", {
              before: summary.replace("return total", "return total + 1"), error: "AssertionError",
            }),
          ],
          "8分と12分を足した期待値を、== の右に書きます。",
          { files: { "reading_with_comma.csv": files["reading_with_comma.csv"], "reading_summary.py": checkedSummary + "\n" } },
        ),
      },
    ],
  });
}
