import datetime
import unittest

from badge import compute, parse_frontmatter


class ComputeTest(unittest.TestCase):
    START = (2025, 8)

    def badge(self, months, today):
        return compute(months, self.START, today)

    def test_caught_up(self):
        badge = self.badge({(2025, 8), (2025, 9)}, datetime.date(2025, 9, 20))
        self.assertEqual(badge["message"], "2/2")
        self.assertEqual(badge["color"], "brightgreen")

    def test_one_behind(self):
        badge = self.badge({(2025, 8)}, datetime.date(2025, 9, 20))
        self.assertEqual(badge["message"], "1/2")
        self.assertEqual(badge["color"], "yellow")

    def test_two_behind(self):
        badge = self.badge(set(), datetime.date(2025, 9, 20))
        self.assertEqual(badge["message"], "0/2")
        self.assertEqual(badge["color"], "red")

    def test_future_entries_ignored(self):
        badge = self.badge({(2025, 8), (2026, 1)}, datetime.date(2025, 8, 20))
        self.assertEqual(badge["message"], "1/1")
        self.assertEqual(badge["color"], "brightgreen")

    def test_entries_before_start_ignored(self):
        badge = self.badge({(2025, 7), (2025, 8)}, datetime.date(2025, 8, 20))
        self.assertEqual(badge["message"], "1/1")

    def test_start_in_future(self):
        badge = self.badge(set(), datetime.date(2025, 5, 1))
        self.assertEqual(badge["message"], "0/0")
        self.assertEqual(badge["color"], "brightgreen")

    def test_multiple_entries_same_month_count_once(self):
        badge = self.badge({(2025, 8)}, datetime.date(2025, 8, 31))
        self.assertEqual(badge["message"], "1/1")

    def test_year_boundary(self):
        months = {(2025, m) for m in range(8, 13)} | {(2026, 1)}
        badge = self.badge(months, datetime.date(2026, 1, 10))
        self.assertEqual(badge["message"], "6/6")
        self.assertEqual(badge["color"], "brightgreen")


class FrontmatterTest(unittest.TestCase):
    def test_parses_toml_frontmatter(self):
        meta = parse_frontmatter(
            '+++\ntitle = "Test"\ndate = 2025-08-15\n+++\n\nInhalt\n'
        )
        self.assertEqual(meta["title"], "Test")
        self.assertEqual(meta["date"], datetime.date(2025, 8, 15))

    def test_missing_frontmatter(self):
        self.assertEqual(parse_frontmatter("Nur Text"), {})


if __name__ == "__main__":
    unittest.main()
