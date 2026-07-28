"""Generate the progress badge (shields.io endpoint JSON).

One Lerndoku entry per month is expected since `[extra].lerndoku_start`
in zola.toml. Counted are the months of the `date` values of all entries
under content/dokus/*/index.md.
"""

import argparse
import datetime
import json
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def parse_frontmatter(text: str) -> dict:
    parts = text.split("+++", 2)
    if len(parts) < 3:
        return {}
    return tomllib.loads(parts[1])


def entry_months(dokus_dir: Path) -> set[tuple[int, int]]:
    months = set()
    for entry in sorted(dokus_dir.glob("*/index.md")):
        meta = parse_frontmatter(entry.read_text(encoding="utf-8"))
        if meta.get("draft"):
            continue
        date = meta.get("date")
        if isinstance(date, datetime.datetime):
            date = date.date()
        if isinstance(date, datetime.date):
            months.add((date.year, date.month))
    return months


def compute(
    months: set[tuple[int, int]],
    start: tuple[int, int],
    today: datetime.date,
) -> dict:
    now = (today.year, today.month)
    expected = max(0, (now[0] - start[0]) * 12 + (now[1] - start[1]) + 1)
    done = len({m for m in months if start <= m <= now})
    behind = expected - done
    if behind <= 0:
        color = "brightgreen"
    elif behind == 1:
        color = "yellow"
    else:
        color = "red"
    return {
        "schemaVersion": 1,
        "label": "Lerndoku",
        "message": f"{done}/{expected}",
        "color": color,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    config = tomllib.loads((ROOT / "zola.toml").read_text(encoding="utf-8"))
    raw_start = config["extra"]["lerndoku_start"]
    year, month = raw_start.split("-")
    start = (int(year), int(month))

    today = datetime.datetime.now(datetime.timezone.utc).date()
    badge = compute(entry_months(ROOT / "content" / "dokus"), start, today)
    Path(args.out).write_text(json.dumps(badge) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
