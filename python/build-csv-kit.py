"""CSV実習の開始用ファイルから、同じ内容なら同じZIPを生成する。"""

from io import BytesIO
from pathlib import Path
from zipfile import ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parent
# 解答やPCで生成されたファイルを、受講者の開始セットに混ぜない。
STARTER_FILES = (
    "README.md",
    "reading.csv",
    "reading_with_comma.csv",
    "reading_empty.csv",
    "reading_invalid.csv",
    "reading_summary.py",
    "test_reading_summary.py",
)


def build_archive():
    """配布先OSや元ファイルの更新時刻によらず同じバイト列を返す。"""
    archive = BytesIO()
    with ZipFile(archive, "w") as bundle:
        for name in STARTER_FILES:
            entry = ZipInfo(name)
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            bundle.writestr(entry, (ROOT / "csv-kit" / name).read_bytes())
    return archive.getvalue()


if __name__ == "__main__":
    (ROOT / "reading-csv.zip").write_bytes(build_archive())
