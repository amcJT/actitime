from __future__ import annotations

import base64
import json
from dataclasses import dataclass
from typing import Any
from urllib import error, parse, request

from .config import ActitimeConfig


class ActitimeApiError(RuntimeError):
    """Raised when actiTIME returns an error response."""

    def __init__(self, message: str, status_code: int | None = None, details: Any = None):
        super().__init__(message)
        self.status_code = status_code
        self.details = details


@dataclass
class ActitimeClient:
    config: ActitimeConfig

    def __post_init__(self) -> None:
        self._me_cache: dict[str, Any] | None = None

    def get_me(self) -> dict[str, Any]:
        if self._me_cache is None:
            self._me_cache = self.request_json("GET", "/users/me")
        return self._me_cache

    def resolve_user_for_query(self, user: str | None = None) -> dict[str, Any]:
        if user in (None, "", "me"):
            return self.get_me()

        if str(user).isdigit():
            return {"id": int(user), "username": user}

        response = self.request_json("GET", "/users", params={"username": str(user), "limit": 1})
        items = response.get("items") or []
        if not items:
            raise ActitimeApiError(f"User '{user}' was not found.")
        return items[0]

    def resolve_user_for_path(self, user: str | None = None) -> str:
        if user in (None, "", "me"):
            return str(self.get_me()["username"])
        return str(user)

    def list_tasks(
        self,
        *,
        status: str | None = "open",
        project_ids: list[int] | None = None,
        ids: list[int] | None = None,
        search: str | None = None,
        limit: int = 1000,
    ) -> list[dict[str, Any]]:
        params: dict[str, Any] = {"limit": limit, "sort": "+name"}
        if status and status != "all":
            params["status"] = status
        if project_ids:
            params["projectIds"] = project_ids
        if ids:
            params["ids"] = ids
        response = self.request_json("GET", "/tasks", params=params)
        tasks = list(response.get("items") or [])
        if not search:
            return tasks
        return [task for task in tasks if _matches_search(task, search)]

    def list_projects(
        self,
        *,
        status: str | None = "open",
        search: str | None = None,
        limit: int = 1000,
    ) -> list[dict[str, Any]]:
        tasks = self.list_tasks(status=status, limit=limit)
        project_map: dict[int, dict[str, Any]] = {}
        for task in tasks:
            if search and not _matches_search(task, search):
                continue
            project_id = task.get("projectId")
            if project_id is None:
                continue
            if project_id not in project_map:
                project_map[project_id] = {
                    "projectId": project_id,
                    "projectName": task.get("projectName"),
                    "customerId": task.get("customerId"),
                    "customerName": task.get("customerName"),
                    "taskCount": 0,
                    "taskIds": [],
                }
            project_map[project_id]["taskCount"] += 1
            project_map[project_id]["taskIds"].append(task.get("id"))

        return sorted(
            project_map.values(),
            key=lambda item: (
                (item.get("customerName") or "").lower(),
                (item.get("projectName") or "").lower(),
            ),
        )

    def get_day_entries(self, *, date: str, user: str | None = None) -> list[dict[str, Any]]:
        user_info = self.resolve_user_for_query(user)
        response = self.request_json(
            "GET",
            "/timetrack",
            params={
                "userIds": [user_info["id"]],
                "dateFrom": date,
                "dateTo": date,
                "includeReferenced": ["tasks", "projects", "customers", "comments", "users"],
            },
        )

        task_lookup = _to_lookup(response.get("tasks"))
        project_lookup = _to_lookup(response.get("projects"))
        customer_lookup = _to_lookup(response.get("customers"))

        rows: list[dict[str, Any]] = []
        for day in response.get("data") or []:
            if str(day.get("userId")) != str(user_info["id"]):
                continue
            for record in day.get("records") or []:
                task = task_lookup.get(str(record.get("taskId")), {})
                project = project_lookup.get(str(task.get("projectId")), {})
                customer = customer_lookup.get(str(task.get("customerId")), {})
                rows.append(
                    {
                        "date": day.get("date", date),
                        "userId": day.get("userId"),
                        "taskId": record.get("taskId"),
                        "taskName": task.get("name"),
                        "projectId": task.get("projectId"),
                        "projectName": task.get("projectName") or project.get("name"),
                        "customerId": task.get("customerId"),
                        "customerName": task.get("customerName") or customer.get("name"),
                        "minutes": record.get("time", 0),
                        "comment": record.get("comment"),
                        "approved": day.get("approved"),
                    }
                )

        return sorted(
            rows,
            key=lambda item: (
                (item.get("customerName") or "").lower(),
                (item.get("projectName") or "").lower(),
                (item.get("taskName") or "").lower(),
            ),
        )

    def get_time_entry(self, *, date: str, task_id: int, user: str | None = None) -> dict[str, Any] | None:
        user_ref = self.resolve_user_for_path(user)
        try:
            return self.request_json("GET", f"/timetrack/{parse.quote(user_ref)}/{date}/{task_id}")
        except ActitimeApiError as exc:
            if exc.status_code == 404:
                return None
            raise

    def set_time(
        self,
        *,
        date: str,
        task_id: int,
        minutes: int,
        user: str | None = None,
        comment: str | None = None,
        preserve_existing_comment: bool = True,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {"time": minutes}

        if comment is not None:
            payload["comment"] = comment
        elif preserve_existing_comment:
            existing = self.get_time_entry(date=date, task_id=task_id, user=user)
            if existing and existing.get("comment") is not None:
                payload["comment"] = existing["comment"]

        user_ref = self.resolve_user_for_path(user)
        return self.request_json(
            "PATCH",
            f"/timetrack/{parse.quote(user_ref)}/{date}/{task_id}",
            body=payload,
        )

    def adjust_time(
        self,
        *,
        date: str,
        task_id: int,
        delta_minutes: int,
        user: str | None = None,
    ) -> dict[str, Any]:
        user_ref = self.resolve_user_for_path(user)
        return self.request_json(
            "PATCH",
            f"/timetrack/{parse.quote(user_ref)}/{date}/{task_id}/time",
            body={"delta": delta_minutes},
        )

    def request_json(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        body: dict[str, Any] | None = None,
    ) -> Any:
        url = self._build_url(path, params=params)
        headers = {
            "Accept": "application/json; charset=UTF-8",
            "Authorization": f"Basic {self._basic_token()}",
        }

        data: bytes | None = None
        if body is not None:
            headers["Content-Type"] = "application/json; charset=UTF-8"
            data = json.dumps(body).encode("utf-8")

        req = request.Request(url=url, method=method.upper(), headers=headers, data=data)
        try:
            with request.urlopen(req, timeout=self.config.timeout) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else None
        except error.HTTPError as exc:
            details = _decode_error_payload(exc)
            message = details.get("message") if isinstance(details, dict) else None
            raise ActitimeApiError(
                message or f"actiTIME API error {exc.code}: {exc.reason}",
                status_code=exc.code,
                details=details,
            ) from exc
        except error.URLError as exc:
            raise ActitimeApiError(f"Cannot connect to actiTIME: {exc.reason}") from exc

    def _build_url(self, path: str, *, params: dict[str, Any] | None = None) -> str:
        normalized_path = path if path.startswith("/") else f"/{path}"
        url = f"{self.config.api_base_url}{normalized_path}"
        if not params:
            return url

        normalized_params: dict[str, Any] = {}
        for key, value in params.items():
            if value in (None, "", []):
                continue
            if isinstance(value, list):
                normalized_params[key] = ",".join(str(item) for item in value)
            else:
                normalized_params[key] = value
        query = parse.urlencode(normalized_params)
        return f"{url}?{query}" if query else url

    def _basic_token(self) -> str:
        raw = f"{self.config.username}:{self.config.password}".encode("utf-8")
        return base64.b64encode(raw).decode("ascii")


def _decode_error_payload(exc: error.HTTPError) -> Any:
    payload = exc.read().decode("utf-8", errors="replace")
    try:
        return json.loads(payload) if payload else None
    except json.JSONDecodeError:
        return {"message": payload} if payload else None


def _to_lookup(value: Any) -> dict[str, dict[str, Any]]:
    if isinstance(value, dict):
        return {str(key): data for key, data in value.items() if isinstance(data, dict)}
    if isinstance(value, list):
        return {
            str(item.get("id")): item
            for item in value
            if isinstance(item, dict) and item.get("id") is not None
        }
    return {}


def _matches_search(task: dict[str, Any], search: str) -> bool:
    needle = [part.lower() for part in search.split() if part.strip()]
    haystack = " ".join(
        str(task.get(key, "")).lower()
        for key in ("name", "projectName", "customerName", "typeOfWorkName", "workflowStatusName")
    )
    return all(word in haystack for word in needle)
