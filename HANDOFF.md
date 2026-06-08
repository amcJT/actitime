# Handoff

Ten dokument jest dla kolejnego modelu albo agenta, ktory ma przejac prace nad repo bez zgadywania kontekstu.

## Cel repo

Repo sluzy do automatyzacji pracy z actiTIME w dwoch trybach:

- `API mode`: gdy instancja actiTIME wystawia REST API pod `/api/v1`.
- `browser mode`: gdy API nie jest dostepne i trzeba operowac na stronie `.../user/submit_tt.do`.

Obecny stan repo obsluguje oba tryby na poziomie podstawowym.

## Najwazniejsze pliki

- [README.md](/C:/Users/jtobijasiewicz/source/repos/actitime/README.md)
  Opis uzycia dla czlowieka.
- [actitime_tool/cli.py](/C:/Users/jtobijasiewicz/source/repos/actitime/actitime_tool/cli.py)
  Glowne CLI do pracy przez REST API.
- [actitime_tool/client.py](/C:/Users/jtobijasiewicz/source/repos/actitime/actitime_tool/client.py)
  Klient HTTP do REST API actiTIME.
- [actitime_tool/config.py](/C:/Users/jtobijasiewicz/source/repos/actitime/actitime_tool/config.py)
  Ladowanie konfiguracji i normalizacja `ACTITIME_BASE_URL`.
- [browser/actitime_submit_tt_helper.js](/C:/Users/jtobijasiewicz/source/repos/actitime/browser/actitime_submit_tt_helper.js)
  Helper JS uruchamiany w konsoli przegladarki na stronie `submit_tt.do`.
- [browser/worklog.normalized.example.json](/C:/Users/jtobijasiewicz/source/repos/actitime/browser/worklog.normalized.example.json)
  Przykladowy format posredni dla wsadowego wpisywania czasu.
- [skills/actitime-time-entry/SKILL.md](/C:/Users/jtobijasiewicz/source/repos/actitime/skills/actitime-time-entry/SKILL.md)
  Repozytoryjny workflow dla agenta pracujacego z actiTIME.
- [actiTIME - Enter Time-Track.htm](/C:/Users/jtobijasiewicz/source/repos/actitime/actiTIME%20-%20Enter%20Time-Track.htm)
  Zapisany snapshot strony Enter Time-Track.
- [actiTIME - Enter Time-Track_files](/C:/Users/jtobijasiewicz/source/repos/actitime/actiTIME%20-%20Enter%20Time-Track_files)
  Zasoby strony oraz dwa pliki `.har` uzyte do reverse engineering zapisu przez formularz.

## Co dziala

### API mode

CLI obsluguje:

- `whoami`
- `list-projects`
- `list-tasks`
- `get-day`
- `set-time`
- `adjust-time`

Przydatne szczegoly:

- `config.py` normalizuje adresy typu `http://host/login.do` do poprawnej bazy API.
- `client.py` daje lepszy komunikat przy `404` zwroconym jako HTML zamiast JSON.

### Browser mode

Helper JS obsluguje:

- wyszukiwanie widocznych wierszy po `taskId`, `project`, `task`, `customer`,
- ustawianie czasu dla pojedynczego dnia,
- wsadowe wpisywanie czasu dla calego widocznego tygodnia,
- eksport samej listy taskow,
- eksport pelnego kontekstu widocznego tygodnia,
- pobranie eksportu jako JSON.

Najwazniejsze publiczne entry pointy helpera:

- `actitimeSubmitHelper.exportTaskCatalog()`
- `actitimeSubmitHelper.exportCurrentWeek()`
- `actitimeSubmitHelper.fillAndSave(...)`
- `actitimeSubmitHelper.fillEntries(...)`
- `actitimeSubmitHelper.downloadJson(...)`

## Co jeszcze nie jest zrobione

Najwazniejsza luka:

- brak parsera `OpenClaw JSON -> normalized worklog JSON`.

To jest cel kolejnego etapu. Do jego realizacji potrzebna jest co najmniej jedna realna probka JSON z OpenClaw.

## Jak kontynuowac prace

Najbardziej sensowna kolejnosc:

1. Dostac jedna lub kilka probek JSON z OpenClaw.
2. Dodac lokalny parser do Python CLI, ktory:
   - czyta JSON z OpenClaw,
   - mapuje rekordy na format posredni,
   - opcjonalnie dopasowuje `project/task -> taskId` na podstawie eksportu ze strony.
3. Dodac tryb eksportu/importu plikowego, zeby uniknac recznego wklejania do konsoli.
4. Opcjonalnie zastapic reczne wklejanie userscriptem lub rozszerzeniem przegladarki.

## Szybki check dla kolejnego modelu

Po otwarciu repo warto wykonac:

```powershell
python -m unittest discover -s tests -v
python -m actitime_tool whoami --format json
```

Jesli API nie dziala:

1. Otworzyc `.../user/submit_tt.do`.
2. Wkleic `browser/actitime_submit_tt_helper.js` do konsoli.
3. Sprawdzic:

```js
actitimeSubmitHelper.exportTaskCatalog()
actitimeSubmitHelper.exportCurrentWeek()
```

## Uwaga praktyczna

Snapshot strony i pliki `.har` sa celowo trzymane w repo, bo sa materialem referencyjnym do browser mode. Nie sa to pliki pomocnicze do usuniecia bez zastanowienia.
