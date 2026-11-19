import unittest

from reading_summary import total_minutes


class ReadingSummaryTests(unittest.TestCase):
    def test_normal_reading(self):
        self.assertEqual(total_minutes("reading.csv"), 35)

    def test_header_only(self):
        self.assertEqual(total_minutes("reading_empty.csv"), 0)

    def test_invalid_minutes(self):
        with self.assertRaisesRegex(ValueError, "^3行目の分を確認してください$"):
            total_minutes("reading_invalid.csv")

    # ここに、題名にカンマがある場合のテストを足します。
