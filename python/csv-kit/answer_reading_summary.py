import csv
import sys


def total_minutes(path):
    total = 0
    with open(path, encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            try:
                minutes = int(row["minutes"] or "")
                if minutes < 0:
                    raise ValueError()
            except ValueError:
                raise ValueError(f"{reader.line_num}行目の分を確認してください")
            total += minutes
    return total


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("CSVのファイル名を1つ指定してください")
    try:
        print(total_minutes(sys.argv[1]))
    except ValueError as error:
        raise SystemExit(str(error))
