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

## Instancja bez API

Jesli lokalna instancja actiTIME nie wystawia REST API, dalej da sie uzupelniac czas przez JS uruchamiany bezposrednio na stronie `.../user/submit_tt.do`.

Gotowy helper jest w [browser/actitime_submit_tt_helper.js](browser/actitime_submit_tt_helper.js). Wklej jego zawartosc do konsoli przegladarki na stronie Enter Time-Track, a potem uruchom:

```js
actitimeSubmitHelper.fillAndSave({
  project: "950BT Sensor",
  task: "Programowanie PC",
  date: "2026-06-03",
  hours: 8
});
```

Uwagi:

- helper dziala na wierszach juz widocznych na stronie,
- zapis wykorzystuje natywny przycisk `Save Changes`,
- gdy chcesz tylko ustawic wartosc bez zapisu, dodaj `save: false`.

Zeby przeniesc aktualna liste ze strony do modelu albo lokalnego narzedzia:

```js
actitimeSubmitHelper.exportTaskCatalog()
actitimeSubmitHelper.exportCurrentWeek()
actitimeSubmitHelper.toJson(actitimeSubmitHelper.exportCurrentWeek())
actitimeSubmitHelper.downloadJson(actitimeSubmitHelper.exportCurrentWeek(), "actitime-week.json")
```

`exportTaskCatalog()` zwraca lekka liste widocznych taskow. `exportCurrentWeek()` zwraca pelny kontekst tygodnia: taski, `taskId`, dni, aktualne wartosci i komentarze.

Do masowego uzupelniania tygodnia uzyj formatu posredniego JSON, np. [browser/worklog.normalized.example.json](browser/worklog.normalized.example.json):

```js
const entries = [
  { date: "2026-06-03", project: "950BT Sensor", task: "Programowanie PC", hours: 8 },
  { date: "2026-06-04", taskId: 7799, time: "1:30", comment: "debug i poprawki" }
];

actitimeSubmitHelper.fillEntries(entries, { save: true });
```

Praktyczny pipeline dla OpenClaw:

1. Wyciagnac archiwa prac z OpenClaw do JSON.
2. Pobierac aktualna liste widocznych taskow z actiTIME przez `exportTaskCatalog()` albo `exportCurrentWeek()`.
3. Zmapowac archiwa OpenClaw do prostego formatu posredniego `date + project/task albo taskId + hours/time + comment`.
4. Uzywac eksportu z actiTIME jako slownika do dopasowania `project/task -> taskId`.
5. Grupowac po tygodniach przez `actitimeSubmitHelper.splitEntriesByWeek(entries)`.
6. Na stronie konkretnego tygodnia uruchamiac `fillEntries(...)` jednym wywolaniem.

Brakujacy element to parser OpenClaw -> ten format posredni. Do tego potrzebna jest jedna probka realnego JSON-a.

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
