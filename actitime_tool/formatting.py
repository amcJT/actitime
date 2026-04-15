from __future__ import annotations

import json
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Any


def decimal_hours_to_minutes(raw: str) -> int:
    try:
        hours = Decimal(raw)
    except InvalidOperation as exc:
        raise ValueError(f"Invalid hours value: {raw}") from exc

    minutes = (hours * Decimal("60")).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    return int(minutes)


def minutes_to_hours(minutes: int | None) -> str:
    if minutes is None:
        return ""
    return f"{minutes / 60:.2f}"


def render_output(data: Any, *, output_format: str) -> str:
    if output_format == "json":
        return json.dumps(data, indent=2, ensure_ascii=False)
    raise ValueError(f"Unsupported output format: {output_format}")


def render_table(rows: list[dict[str, Any]], columns: list[tuple[str, str]]) -> str:
    if not rows:
        return "(no rows)"

    headers = [label for _, label in columns]
    prepared_rows = [
        ["" if row.get(key) is None else str(row.get(key)) for key, _ in columns]
        for row in rows
    ]
    widths = [
        max(len(headers[index]), *(len(row[index]) for row in prepared_rows))
        for index in range(len(columns))
    ]

    lines = []
    header_line = "  ".join(headers[index].ljust(widths[index]) for index in range(len(headers)))
    separator = "  ".join("-" * widths[index] for index in range(len(headers)))
    lines.append(header_line)
    lines.append(separator)

    for row in prepared_rows:
        lines.append("  ".join(row[index].ljust(widths[index]) for index in range(len(row))))
    return "\n".join(lines)
