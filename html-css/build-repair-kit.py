"""PC実習で使う開始ファイルを同じ並び・更新時刻で配布する。"""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

source = Path(__file__).with_name("repair-kit")
with ZipFile(source.with_name("repair-site.zip"), "w") as archive:
    for name in ("README.md", "index.html", "styles/exhibit.css", "assets/port.png", "form.js"):
        entry = ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
        entry.external_attr = 0o644 << 16
        archive.writestr(entry, (source / name).read_bytes(), compress_type=ZIP_DEFLATED)
