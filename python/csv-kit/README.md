# 手元のPCで読書記録を集計する

ここでは、見出しが `title,minutes` のCSVを読みます。題名はそのまま読み、読書時間は0以上の整数として合計します。分が空欄、負の数、数字以外なら、何行目を直せばよいか知らせます。

## 1. ファイルを開く

ZIPを展開して、4個のCSVと `reading_summary.py`、`test_reading_summary.py` を同じフォルダーに置きます。すべて教材用の架空の記録です。

ターミナル（macOS）または PowerShell（Windows）を開きます。`cd` の後に空白を入れ、その後ろに展開したフォルダーをドラッグしてパスを入れ、Enterキーを押します。

`python3 --version` で、手元のPython 3を確認してください。Windowsでは `python3` の代わりに `py -3` を使えます。以下のコマンドも同じように置き換えます。使うライブラリはPythonに付属しています。

## 2. 最初の失敗を確かめる

```sh
python3 reading_summary.py reading.csv
python3 -B -m unittest -v
```

最初は `2` が表示され、テストには `2 != 35` と出ます。練習用コードの `total += 1` が記録を2件数えています。CSVの1件目は15分、2件目は20分なので、期待する合計は35分です。

題名にカンマがある場合も確かめましょう。`reading_with_comma.csv` を開いて分を手で合計してから、`test_reading_summary.py` のクラスの中に `def test_title_with_comma(self):` を1つ足します。既存のテストと同じ字下げで、`self.assertEqual(..., ...)` の左に `total_minutes("reading_with_comma.csv")`、右に手で求めた合計を書きます。もう一度テストを実行すると、追加したテストも実行されます。

## 3. 分を足すように直す

`reading_summary.py` の `for row in reader:` の内側を直します。`row["minutes"]` を整数に変え、0以上のときだけ加えます。変換できない値や負の分を見つけたら、`reader.line_num` を使って、「3行目の分を確認してください」のような文を入れた `ValueError` を起こします。この演習では見出しが1行目です。題名の中にカンマがある場合も `csv.DictReader` が分の列を見つけます。

保存したら、次のコマンドで同じ処理を別のCSVに試します。

| コマンド | 期待する表示 |
| --- | --- |
| `python3 reading_summary.py reading.csv` | 35 |
| `python3 reading_summary.py reading_with_comma.csv` | 20 |
| `python3 reading_summary.py reading_empty.csv` | 0 |
| `python3 reading_summary.py reading_invalid.csv` | 3行目の分を確認してください |

最後に `python3 -B -m unittest -v` を実行し、追加したテストを含めて `Ran 4 tests` と `OK` が出ることを確かめます。失敗したら、表示されたテスト名から使われたCSVと期待値を見直し、コードを修正して再実行します。

模範解答の `answer_reading_summary.py` は教材ページで別に配布しています。自分で書いたコードと見比べながら確認できます。

## 4. 他の人が試せるように記録する

使ったCSV、実行コマンド、修正前後の結果、追加したテストを短く残します。記録例の数字は、自分の結果に置き換えてください。

- CSVと実行コマンド　`python3 reading_summary.py reading.csv`
- 修正前後の結果　2 → 35。1件につき1を足す処理を、読書時間を足す処理に修正した。
- 追加したテスト　`test_title_with_comma` が `reading_with_comma.csv` の合計20分を確認する。`python3 -B -m unittest -v` で4件が成功した。
