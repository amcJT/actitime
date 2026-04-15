from __future__ import annotations

import unittest

from actitime_tool.cli import normalize_date, resolved_minutes
from actitime_tool.formatting import decimal_hours_to_minutes, minutes_to_hours


class HelpersTests(unittest.TestCase):
    def test_decimal_hours_to_minutes(self) -> None:
        self.assertEqual(decimal_hours_to_minutes("7.5"), 450)
        self.assertEqual(decimal_hours_to_minutes("-0.5"), -30)

    def test_minutes_to_hours(self) -> None:
        self.assertEqual(minutes_to_hours(90), "1.50")

    def test_normalize_date(self) -> None:
        self.assertEqual(normalize_date("2026-04-15"), "2026-04-15")

    def test_resolved_minutes_prefers_hours(self) -> None:
        class Args:
            hours = 120
            minutes = None

        self.assertEqual(resolved_minutes(Args(), "hours", "minutes"), 120)
