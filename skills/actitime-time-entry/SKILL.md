---
name: actitime-time-entry
description: Use the local actitime-tool repository to inspect actiTIME assignments and submit time-track entries. Trigger this skill when an agent needs to map a natural-language worklog to specific actiTIME projects or tasks, review existing entries for a day, ask for confirmation, and then write or adjust time for a chosen task.
---

# ACTITIME Time Entry

Use the local CLI from the repository root:

```powershell
python -m actitime_tool ...
```

## Workflow

1. Validate credentials with `python -m actitime_tool whoami --format json`.
2. Collect context:
   `python -m actitime_tool list-projects --format json`
   `python -m actitime_tool list-tasks --format json`
   `python -m actitime_tool get-day --format json --date YYYY-MM-DD`
3. If the user describes work in natural language, search likely tasks:
   `python -m actitime_tool list-tasks --format json --search "projekt x"`
4. Propose the allocation before changing data.
5. After explicit confirmation, run `set-time` or `adjust-time`.
6. Re-read the day with `get-day` and report the final state.

## Guardrails

- Do not write to actiTIME before explicit user confirmation.
- Prefer `--dry-run` while building the proposal.
- Use task ids in mutating commands.
- Remember that `set-time` replaces the total for that task on that day.
- Use `adjust-time` only when a delta is the correct intent.

## Suggested confirmation style

Use language like:

`Przypisuje 7h do tasku 123 (X - kodzenie) i 1h do tasku 456 (Y - testowanie). Cos poprawic czy wysylamy?`

## Core commands

```powershell
python -m actitime_tool whoami --format json
python -m actitime_tool list-projects --format json
python -m actitime_tool list-tasks --format json --search "projekt x"
python -m actitime_tool get-day --format json --date 2026-04-15
python -m actitime_tool set-time --format json --dry-run --date 2026-04-15 --task-id 123 --hours 7
python -m actitime_tool set-time --format json --date 2026-04-15 --task-id 123 --hours 7
python -m actitime_tool adjust-time --format json --date 2026-04-15 --task-id 456 --delta-hours 1
```
