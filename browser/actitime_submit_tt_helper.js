/* Paste this file into the browser console on /user/submit_tt.do.
 * It fills an existing row and saves it using the page's native workflow.
 */
(function (global) {
    "use strict";

    function normalizeText(value) {
        return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    }

    function normalizeNeedle(value) {
        return normalizeText(value).toLowerCase();
    }

    function pad2(value) {
        return value < 10 ? "0" + value : String(value);
    }

    function isIntegerNumber(value) {
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    }

    function ensureSubmitPage() {
        var form = null;
        if (document.forms) {
            form = document.forms.SubmitTTForm;
            if (!form && typeof document.forms.namedItem === "function") {
                form = document.forms.namedItem("SubmitTTForm");
            }
        }
        if (!form && document.SubmitTTForm) {
            form = document.SubmitTTForm;
        }
        if (!form) {
            throw new Error("SubmitTTForm was not found. Open /user/submit_tt.do first.");
        }
        return form;
    }

    function parseCompactDate(compact) {
        var value = normalizeText(compact);
        if (!/^\d{8}$/.test(value)) {
            throw new Error("Unsupported compact date: " + value);
        }
        return new Date(
            Number(value.slice(0, 4)),
            Number(value.slice(4, 6)) - 1,
            Number(value.slice(6, 8))
        );
    }

    function parseDateInput(value) {
        if (value instanceof Date) {
            return new Date(value.getFullYear(), value.getMonth(), value.getDate());
        }

        var raw = normalizeText(value);
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            return new Date(
                Number(raw.slice(0, 4)),
                Number(raw.slice(5, 7)) - 1,
                Number(raw.slice(8, 10))
            );
        }

        if (/^\d{8}$/.test(raw)) {
            return parseCompactDate(raw);
        }

        throw new Error("Unsupported date format: " + raw + ". Use YYYY-MM-DD or YYYYMMDD.");
    }

    function formatDate(date) {
        var month = pad2(date.getMonth() + 1);
        var day = pad2(date.getDate());
        return date.getFullYear() + "-" + month + "-" + day;
    }

    function getWeekStart(date) {
        var result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var dayOfWeek = result.getDay();
        var mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        result.setDate(result.getDate() + mondayOffset);
        return result;
    }

    function getPageDate() {
        var form = ensureSubmitPage();
        return parseCompactDate(form.elements.dateStr.value);
    }

    function getDayIndex(options) {
        if (options && isIntegerNumber(options.dayIndex)) {
            if (options.dayIndex < 0 || options.dayIndex > 6) {
                throw new Error("dayIndex must be between 0 and 6.");
            }
            return options.dayIndex;
        }

        var pageDate = getPageDate();
        var weekStart = getWeekStart(pageDate);
        var targetDate = options && options.date ? parseDateInput(options.date) : pageDate;
        var diffMs = targetDate.getTime() - weekStart.getTime();
        var diffDays = Math.round(diffMs / 86400000);

        if (diffDays < 0 || diffDays > 6) {
            throw new Error(
                "Date " + formatDate(targetDate) + " is outside the visible week " +
                formatDate(weekStart) + " .. " +
                formatDate(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6)) + "."
            );
        }

        return diffDays;
    }

    function textMatches(expected, actual) {
        if (expected == null || normalizeText(expected) === "") {
            return true;
        }

        if (expected instanceof RegExp) {
            return expected.test(actual);
        }

        return normalizeNeedle(actual).indexOf(normalizeNeedle(expected)) >= 0;
    }

    function getCellText(prefix, taskId) {
        var cell = document.getElementById(prefix + taskId);
        return normalizeText(cell ? cell.textContent : "");
    }

    function listRows(filters) {
        var rows = document.querySelectorAll('tr[id^="taskRow"]');
        var result = [];
        var i;

        for (i = 0; i < rows.length; i += 1) {
            var row = rows[i];
            var taskId = Number(row.id.replace("taskRow", ""));
            var item = {
                taskId: taskId,
                customer: getCellText("customerNameCell", taskId),
                project: getCellText("projectNameCell", taskId),
                task: getCellText("taskNameCell", taskId),
                row: row
            };

            if (
                textMatches(filters && filters.customer, item.customer) &&
                textMatches(filters && filters.project, item.project) &&
                textMatches(filters && filters.task, item.task)
            ) {
                result.push(item);
            }
        }

        return result;
    }

    function getRowByTaskId(taskId) {
        var matches = listRows({});
        var i;
        for (i = 0; i < matches.length; i += 1) {
            if (matches[i].taskId === Number(taskId)) {
                return matches[i];
            }
        }
        throw new Error("Task row " + taskId + " is not visible on the page.");
    }

    function resolveRow(options) {
        if (options && options.taskId != null) {
            return getRowByTaskId(options.taskId);
        }

        var matches = listRows(options || {});
        if (!matches.length) {
            throw new Error("No visible task matched the supplied filters.");
        }
        if (matches.length > 1) {
            throw new Error(
                "Filters matched multiple rows: " +
                matches.map(function (item) {
                    return item.taskId + " [" + item.customer + " / " + item.project + " / " + item.task + "]";
                }).join("; ")
            );
        }
        return matches[0];
    }

    function formatMinutes(totalMinutes) {
        var sign = totalMinutes < 0 ? "-" : "";
        var absMinutes = Math.abs(totalMinutes);
        var hours = Math.floor(absMinutes / 60);
        var minutes = absMinutes % 60;
        return sign + hours + ":" + pad2(minutes);
    }

    function normalizeTimeValue(value) {
        if (typeof value === "number" && isFinite(value)) {
            return formatMinutes(Math.round(value * 60));
        }

        var raw = normalizeText(value);
        if (/^-?\d+(?:[.,]\d+)?$/.test(raw)) {
            return formatMinutes(Math.round(Number(raw.replace(",", ".")) * 60));
        }

        return raw;
    }

    function parseMinutesFromFieldValue(value) {
        var raw = normalizeText(value);
        if (!raw) {
            return 0;
        }

        if (global.UserTime && typeof global.UserTime.parseTime === "function") {
            try {
                var parsed = global.UserTime.parseTime(raw);
                if (typeof parsed === "number" && isFinite(parsed)) {
                    return parsed;
                }
            } catch (error) {
                // Fall back to local parsing below.
            }
        }

        if (/^-?\d+:\d{2}$/.test(raw)) {
            var sign = raw.charAt(0) === "-" ? -1 : 1;
            var normalized = sign < 0 ? raw.slice(1) : raw;
            var parts = normalized.split(":");
            return sign * (Number(parts[0]) * 60 + Number(parts[1]));
        }

        if (/^-?\d+(?:[.,]\d+)?$/.test(raw)) {
            return Math.round(Number(raw.replace(",", ".")) * 60);
        }

        return null;
    }

    function getWeekDates() {
        var weekStart = getWeekStart(getPageDate());
        var dates = [];
        var dayIndex;

        for (dayIndex = 0; dayIndex < 7; dayIndex += 1) {
            dates.push(formatDate(new Date(
                weekStart.getFullYear(),
                weekStart.getMonth(),
                weekStart.getDate() + dayIndex
            )));
        }

        return dates;
    }

    function getFieldValue(form, name) {
        var field = form.elements[name];
        return field ? field.value : "";
    }

    function exportRowDay(taskId, dayIndex, dateValue, form) {
        var spentName = "timeTrack[" + taskId + "].spentStr[" + dayIndex + "]";
        var commentName = "timeTrack[" + taskId + "].comment[" + dayIndex + "]";
        var rawValue = getFieldValue(form, spentName);
        var minutes = parseMinutesFromFieldValue(rawValue);
        return {
            dayIndex: dayIndex,
            date: dateValue,
            value: rawValue,
            minutes: minutes,
            hours: minutes == null ? "" : minutes / 60,
            comment: getFieldValue(form, commentName)
        };
    }

    function exportTaskCatalog(filters) {
        return listRows(filters || {}).map(function (item) {
            return {
                taskId: item.taskId,
                customer: item.customer,
                project: item.project,
                task: item.task
            };
        });
    }

    function exportCurrentWeek(filters) {
        var form = ensureSubmitPage();
        var weekDates = getWeekDates();
        var rows = listRows(filters || {}).map(function (item) {
            var days = [];
            var dayIndex;

            for (dayIndex = 0; dayIndex < 7; dayIndex += 1) {
                days.push(exportRowDay(item.taskId, dayIndex, weekDates[dayIndex], form));
            }

            return {
                taskId: item.taskId,
                customer: item.customer,
                project: item.project,
                task: item.task,
                markedToDelete: getFieldValue(form, "timeTrack[" + item.taskId + "].markedToDelete") === "1",
                markedToComplete: getFieldValue(form, "timeTrack[" + item.taskId + "].markedToComplete") === "1",
                days: days
            };
        });

        return {
            source: "actitime-submit-tt-page",
            exportedAt: new Date().toISOString(),
            pageDate: formatDate(getPageDate()),
            weekStart: formatDate(getWeekStart(getPageDate())),
            weekDates: weekDates,
            rows: rows
        };
    }

    function toJson(data) {
        return JSON.stringify(data, null, 2);
    }

    function downloadJson(data, filename) {
        var blob = new Blob([toJson(data)], { type: "application/json;charset=utf-8" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename || ("actitime-export-" + formatDate(getPageDate()) + ".json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function () {
            URL.revokeObjectURL(link.href);
        }, 0);
        return link.download;
    }

    function setComment(taskId, dayIndex, comment) {
        if (comment == null) {
            return;
        }

        var form = ensureSubmitPage();
        var name = "timeTrack[" + taskId + "].comment[" + dayIndex + "]";
        var field = form.elements[name];

        if (!field) {
            throw new Error("Comment field not found: " + name);
        }

        field.value = String(comment);
        if (global.SubmitTTChanges && typeof global.SubmitTTChanges.registerChange === "function") {
            global.SubmitTTChanges.registerChange(name);
        }
        if (typeof global.handleChange === "function") {
            global.handleChange(true);
        }
    }

    function setTime(options) {
        var form = ensureSubmitPage();
        var row = resolveRow(options || {});
        var dayIndex = getDayIndex(options || {});
        var name = "timeTrack[" + row.taskId + "].spentStr[" + dayIndex + "]";
        var field = form.elements[name];

        if (!field) {
            throw new Error("Time field not found: " + name);
        }

        var previousValue = field.value;
        var nextValue = normalizeTimeValue(
            options && options.time != null ? options.time :
            options && options.hours != null ? options.hours :
            options && options.value != null ? options.value :
            ""
        );

        if (typeof global.focusSpent === "function") {
            global.focusSpent(field);
        }

        field.value = nextValue;

        if (typeof global.checkSpent === "function" && global.checkSpent(dayIndex, field) === false) {
            throw new Error("actiTIME rejected the entered time value: " + nextValue);
        }

        setComment(row.taskId, dayIndex, options && options.comment);

        return {
            taskId: row.taskId,
            customer: row.customer,
            project: row.project,
            task: row.task,
            dayIndex: dayIndex,
            previousValue: previousValue,
            currentValue: field.value,
            fieldName: name
        };
    }

    function save() {
        var saveButton = document.getElementById("SubmitTTButton");
        if (saveButton && typeof saveButton.click === "function") {
            saveButton.click();
            return true;
        }

        if (typeof global.SubmitTimeTrack === "function") {
            return global.SubmitTimeTrack(null, true, 1440, "24:00");
        }

        throw new Error("Save button was not found.");
    }

    function fillAndSave(options) {
        var result = setTime(options || {});
        var shouldSave = !options || options.save !== false;
        result.pageDate = formatDate(getPageDate());
        result.saved = false;

        if (shouldSave) {
            save();
            result.saved = true;
        }

        return result;
    }

    function ensureArray(value) {
        if (!Array.isArray(value)) {
            throw new Error("Expected an array of worklog entries.");
        }
        return value;
    }

    function splitEntriesByWeek(entries) {
        var result = {};

        ensureArray(entries).forEach(function (entry) {
            var entryDate = entry && entry.date ? parseDateInput(entry.date) : getPageDate();
            var weekStart = formatDate(getWeekStart(entryDate));
            if (!result[weekStart]) {
                result[weekStart] = [];
            }
            result[weekStart].push(entry);
        });

        return result;
    }

    function fillEntries(entries, options) {
        var normalizedEntries = ensureArray(entries);
        var currentWeekStart = formatDate(getWeekStart(getPageDate()));
        var applied = [];
        var failed = [];
        var settings = options || {};
        var stopOnError = settings.stopOnError !== false;
        var allowPartialSave = settings.allowPartialSave === true;
        var saved = false;

        normalizedEntries.forEach(function (entry) {
            if (failed.length && stopOnError) {
                return;
            }

            try {
                var entryDate = entry && entry.date ? parseDateInput(entry.date) : getPageDate();
                var entryWeekStart = formatDate(getWeekStart(entryDate));
                if (entryWeekStart !== currentWeekStart) {
                    throw new Error(
                        "Entry date " + formatDate(entryDate) +
                        " is outside the visible week " + currentWeekStart + "."
                    );
                }

                applied.push(setTime(entry || {}));
            } catch (error) {
                failed.push({
                    entry: entry,
                    error: error && error.message ? error.message : String(error)
                });
            }
        });

        if (
            settings.save !== false &&
            applied.length > 0 &&
            (failed.length === 0 || allowPartialSave)
        ) {
            save();
            saved = true;
        }

        return {
            pageDate: formatDate(getPageDate()),
            weekStart: currentWeekStart,
            applied: applied,
            failed: failed,
            saved: saved
        };
    }

    var api = {
        listRows: listRows,
        exportTaskCatalog: exportTaskCatalog,
        exportCurrentWeek: exportCurrentWeek,
        toJson: toJson,
        downloadJson: downloadJson,
        getPageDate: function () {
            return formatDate(getPageDate());
        },
        getWeekStart: function () {
            return formatDate(getWeekStart(getPageDate()));
        },
        splitEntriesByWeek: splitEntriesByWeek,
        setTime: setTime,
        fillEntries: fillEntries,
        save: save,
        fillAndSave: fillAndSave
    };

    global.actitimeSubmitHelper = api;
    return api;
}(window));
