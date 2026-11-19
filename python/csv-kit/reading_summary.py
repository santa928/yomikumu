import csv
import sys


def total_minutes(path):
    total = 0
    with open(path, encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            # 練習用の処理です。各行の読書時間を調べてから足しましょう。
            total += 1
    return total


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("CSVのファイル名を1つ指定してください")
    try:
        print(total_minutes(sys.argv[1]))
    except ValueError as error:
        raise SystemExit(str(error))
