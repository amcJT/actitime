# actitime-tool

Lekkie CLI w Pythonie do pracy z API actiTIME. Repo jest przygotowane pod uzycie przez agenta, ktory ma:

- sprawdzic, jakie projekty i taski sa aktualnie dostepne do raportowania,
- podejrzec wpisy czasu dla konkretnego dnia,
- nadpisac albo skorygowac czas pracy dla konkretnego taska.

Narzedzie nie uzywa zewnetrznych bibliotek. Wystarczy Python 3.11+.

## Konfiguracja

Najprosciej przez zmienne srodowiskowe:

```powershell
$env:ACTITIME_BASE_URL="https://twoja-firma.actitime.com"
$env:ACTITIME_USERNAME="login"
$env:ACTITIME_PASSWORD="haslo"
```

Albo lokalny plik `actitime.toml` na podstawie [actitime.example.toml](actitime.example.toml).

Obslugiwane sa tez:

- `ACTITIME_TIMEOUT`
- `--config C:\sciezka\actitime.toml`

## Uzycie

Uruchamianie bez instalacji:

```powershell
python -m actitime_tool whoami
python -m actitime_tool list-projects
python -m actitime_tool list-tasks --search "test"
python -m actitime_tool get-day --date 2026-04-15
python -m actitime_tool set-time --date 2026-04-15 --task-id 108 --hours 7
python -m actitime_tool adjust-time --date 2026-04-15 --task-id 108 --delta-hours -0.5
```

Wersje przyjazne agentowi:

```powershell
python -m actitime_tool list-projects --format json
python -m actitime_tool list-tasks --format json --search "projekt x"
python -m actitime_tool get-day --format json --date 2026-04-15
python -m actitime_tool set-time --format json --dry-run --date 2026-04-15 --task-id 108 --hours 7
```

## Sugerowany workflow dla agenta

1. `list-projects --format json` zeby zawezic aktywne projekty.
2. `list-tasks --format json --search "..."`
3. `get-day --format json --date YYYY-MM-DD` zeby zobaczyc istniejace wpisy.
4. Agent proponuje podzial godzin w jezyku naturalnym.
5. Po potwierdzeniu uzytkownika agent wykonuje `set-time` albo `adjust-time`.

## Zachowanie komend

- `list-projects` zwraca projekty wyliczone z aktualnie dostepnych taskow, domyslnie tylko `open`.
- `set-time` nadpisuje czas dla danego dnia i taska. `0` minut usuwa wpis.
- `adjust-time` zmienia czas o delte w minutach lub godzinach.
- `get-day` pokazuje sume minut dla wskazanego dnia.

## Testy

```powershell
python -m unittest discover -s tests -v
```

## Oficjalne dokumenty API

- https://www.actitime.com/api-documentation
- https://www.actitime.com/api-documentation/users-resource
- https://www.actitime.com/api-documentation/tasks-resource
- https://www.actitime.com/api-documentation/projects-resource
- https://www.actitime.com/api-documentation/time-track-resource
