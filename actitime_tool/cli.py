from __future__ import annotations

import argparse
import sys
from datetime import date
from typing import Any

from .client import ActitimeApiError, ActitimeClient
from .config import ConfigError, load_config
from .formatting import decimal_hours_to_minutes, minutes_to_hours, render_output, render_table


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="actitime",
        description="CLI for actiTIME projects, tasks, and time-track updates.",
    )
    parser.add_argument("--config", help="Path to actitime.toml configuration file.")
    parser.add_argument("--format", choices=("table", "json"), default="table")

    subparsers = parser.add_subparsers(dest="command", required=True)

    whoami = subparsers.add_parser("whoami", help="Show properties of the authorized user.")
    whoami.set_defaults(handler=cmd_whoami)

    list_projects = subparsers.add_parser(
        "list-projects",
        help="List currently assigned projects, derived from accessible tasks.",
    )
    list_projects.add_argument("--status", choices=("open", "completed", "all"), default="open")
    list_projects.add_argument("--search", help="Match words in project or task names.")
    list_projects.add_argument("--limit", type=int, default=1000)
    list_projects.set_defaults(handler=cmd_list_projects)

    list_tasks = subparsers.add_parser("list-tasks", help="List accessible tasks.")
    list_tasks.add_argument("--status", choices=("open", "completed", "all"), default="open")
    list_tasks.add_argument("--search", help="Match words in task names.")
    list_tasks.add_argument("--project-id", action="append", dest="project_ids", type=int)
    list_tasks.add_argument("--limit", type=int, default=1000)
    list_tasks.set_defaults(handler=cmd_list_tasks)

    get_day = subparsers.add_parser("get-day", help="Show time-track records for a single day.")
    get_day.add_argument("--date", default=today_iso())
    get_day.add_argument("--user", default="me", help="User id, username, or 'me'.")
    get_day.set_defaults(handler=cmd_get_day)

    set_time = subparsers.add_parser(
        "set-time",
        help="Replace tracked time for a specific day and task.",
    )
    set_time.add_argument("--date", default=today_iso())
    set_time.add_argument("--user", default="me", help="User id, username, or 'me'.")
    set_time.add_argument("--task-id", required=True, type=int)
    amount = set_time.add_mutually_exclusive_group(required=True)
    amount.add_argument("--hours", type=decimal_hours_to_minutes, help="Decimal hours, e.g. 7.5")
    amount.add_argument("--minutes", type=int, help="Minutes, e.g. 450")
    set_time.add_argument("--comment", help="Optional time-track comment.")
    set_time.add_argument("--dry-run", action="store_true", help="Show payload without sending it.")
    set_time.set_defaults(handler=cmd_set_time)

    adjust_time = subparsers.add_parser(
        "adjust-time",
        help="Increase or decrease tracked time for a specific day and task.",
    )
    adjust_time.add_argument("--date", default=today_iso())
    adjust_time.add_argument("--user", default="me", help="User id, username, or 'me'.")
    adjust_time.add_argument("--task-id", required=True, type=int)
    delta = adjust_time.add_mutually_exclusive_group(required=True)
    delta.add_argument("--delta-hours", type=decimal_hours_to_minutes, help="Signed decimal hours.")
    delta.add_argument("--delta-minutes", type=int, help="Signed minute delta.")
    adjust_time.add_argument("--dry-run", action="store_true", help="Show payload without sending it.")
    adjust_time.set_defaults(handler=cmd_adjust_time)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        config = load_config(args.config)
        client = ActitimeClient(config)
        result = args.handler(args, client)
    except (ConfigError, ValueError) as exc:
        print(f"Configuration error: {exc}", file=sys.stderr)
        return 2
    except ActitimeApiError as exc:
        print(f"actiTIME error: {exc}", file=sys.stderr)
        return 1

    if result is not None:
        print(result)
    return 0


def cmd_whoami(args: argparse.Namespace, client: ActitimeClient) -> str:
    me = client.get_me()
    if args.format == "json":
        return render_output(me, output_format="json")

    row = {
        "id": me.get("id"),
        "username": me.get("username"),
        "fullName": me.get("fullName"),
        "active": me.get("active"),
        "canSubmitTimetrack": (me.get("allowedActions") or {}).get("canSubmitTimetrack"),
        "email": me.get("email"),
    }
    return render_table(
        [row],
        [
            ("id", "id"),
            ("username", "username"),
            ("fullName", "full_name"),
            ("active", "active"),
            ("canSubmitTimetrack", "can_submit"),
            ("email", "email"),
        ],
    )


def cmd_list_projects(args: argparse.Namespace, client: ActitimeClient) -> str:
    projects = client.list_projects(status=args.status, search=args.search, limit=args.limit)
    if args.format == "json":
        return render_output(projects, output_format="json")

    rows = [
        {
            "projectId": project.get("projectId"),
            "customerName": project.get("customerName"),
            "projectName": project.get("projectName"),
            "taskCount": project.get("taskCount"),
        }
        for project in projects
    ]
    return render_table(
        rows,
        [
            ("projectId", "project_id"),
            ("customerName", "customer"),
            ("projectName", "project"),
            ("taskCount", "open_tasks"),
        ],
    )


def cmd_list_tasks(args: argparse.Namespace, client: ActitimeClient) -> str:
    tasks = client.list_tasks(
        status=args.status,
        project_ids=args.project_ids,
        search=args.search,
        limit=args.limit,
    )
    if args.format == "json":
        return render_output(tasks, output_format="json")

    rows = [
        {
            "id": task.get("id"),
            "customerName": task.get("customerName"),
            "projectName": task.get("projectName"),
            "name": task.get("name"),
            "status": task.get("status"),
            "typeOfWorkName": task.get("typeOfWorkName"),
            "workflowStatusName": task.get("workflowStatusName"),
        }
        for task in tasks
    ]
    return render_table(
        rows,
        [
            ("id", "task_id"),
            ("customerName", "customer"),
            ("projectName", "project"),
            ("name", "task"),
            ("status", "status"),
            ("typeOfWorkName", "type_of_work"),
            ("workflowStatusName", "workflow_status"),
        ],
    )


def cmd_get_day(args: argparse.Namespace, client: ActitimeClient) -> str:
    rows = client.get_day_entries(date=normalize_date(args.date), user=args.user)
    if args.format == "json":
        return render_output(rows, output_format="json")

    table_rows = [
        {
            "date": row.get("date"),
            "taskId": row.get("taskId"),
            "customerName": row.get("customerName"),
            "projectName": row.get("projectName"),
            "taskName": row.get("taskName"),
            "minutes": row.get("minutes"),
            "hours": minutes_to_hours(row.get("minutes")),
            "comment": row.get("comment"),
        }
        for row in rows
    ]
    table = render_table(
        table_rows,
        [
            ("date", "date"),
            ("taskId", "task_id"),
            ("customerName", "customer"),
            ("projectName", "project"),
            ("taskName", "task"),
            ("minutes", "minutes"),
            ("hours", "hours"),
            ("comment", "comment"),
        ],
    )
    total = sum(int(row.get("minutes") or 0) for row in rows)
    return f"{table}\n\nTotal: {total} min ({minutes_to_hours(total)} h)"


def cmd_set_time(args: argparse.Namespace, client: ActitimeClient) -> str:
    minutes = resolved_minutes(args, "hours", "minutes")
    payload = {
        "date": normalize_date(args.date),
        "user": args.user,
        "taskId": args.task_id,
        "minutes": minutes,
        "hours": minutes_to_hours(minutes),
        "comment": args.comment,
    }
    if args.dry_run:
        return render_output(payload, output_format=args.format) if args.format == "json" else _table_for_single_row(payload)

    updated = client.set_time(
        date=payload["date"],
        task_id=args.task_id,
        minutes=minutes,
        user=args.user,
        comment=args.comment,
    )
    response = {
        "date": payload["date"],
        "user": args.user,
        "taskId": updated.get("taskId", args.task_id),
        "minutes": updated.get("time", minutes),
        "hours": minutes_to_hours(updated.get("time", minutes)),
        "comment": updated.get("comment"),
    }
    return render_output(response, output_format="json") if args.format == "json" else _table_for_single_row(response)


def cmd_adjust_time(args: argparse.Namespace, client: ActitimeClient) -> str:
    delta_minutes = resolved_minutes(args, "delta_hours", "delta_minutes")
    payload = {
        "date": normalize_date(args.date),
        "user": args.user,
        "taskId": args.task_id,
        "deltaMinutes": delta_minutes,
        "deltaHours": minutes_to_hours(delta_minutes),
    }
    if args.dry_run:
        return render_output(payload, output_format=args.format) if args.format == "json" else _table_for_single_row(payload)

    updated = client.adjust_time(
        date=payload["date"],
        task_id=args.task_id,
        delta_minutes=delta_minutes,
        user=args.user,
    )
    response = {
        "date": payload["date"],
        "user": args.user,
        "taskId": updated.get("taskId", args.task_id),
        "minutes": updated.get("time"),
        "hours": minutes_to_hours(updated.get("time")),
        "comment": updated.get("comment"),
    }
    return render_output(response, output_format="json") if args.format == "json" else _table_for_single_row(response)


def resolved_minutes(args: argparse.Namespace, hours_attr: str, minutes_attr: str) -> int:
    hours_value = getattr(args, hours_attr)
    minutes_value = getattr(args, minutes_attr)
    minutes = hours_value if hours_value is not None else minutes_value
    if minutes is None:
        raise ValueError("Time value is required.")
    return int(minutes)


def normalize_date(raw: str) -> str:
    if raw == "today":
        return today_iso()
    return date.fromisoformat(raw).isoformat()


def today_iso() -> str:
    return date.today().isoformat()


def _table_for_single_row(row: dict[str, Any]) -> str:
    columns = [(key, key) for key in row]
    return render_table([row], columns)
