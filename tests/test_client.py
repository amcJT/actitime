from __future__ import annotations

import io
import unittest
from urllib import error
from unittest import mock

from actitime_tool.client import ActitimeApiError, ActitimeClient
from actitime_tool.config import ActitimeConfig


class ActitimeClientTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = ActitimeClient(
            ActitimeConfig(
                base_url="https://example.actitime.com",
                username="alice",
                password="secret",
                timeout=5,
            )
        )

    def test_builds_query_with_lists(self) -> None:
        url = self.client._build_url(
            "/timetrack",
            params={"userIds": [1, 2], "dateFrom": "2026-04-15", "includeReferenced": ["tasks", "projects"]},
        )
        self.assertIn("userIds=1%2C2", url)
        self.assertIn("includeReferenced=tasks%2Cprojects", url)

    def test_list_projects_deduplicates_by_project(self) -> None:
        with mock.patch.object(
            self.client,
            "list_tasks",
            return_value=[
                {"id": 1, "projectId": 20, "projectName": "Beta", "customerId": 200, "customerName": "Globex"},
                {"id": 2, "projectId": 10, "projectName": "Alpha", "customerId": 100, "customerName": "ACME"},
                {"id": 3, "projectId": 10, "projectName": "Alpha", "customerId": 100, "customerName": "ACME"},
            ],
        ):
            projects = self.client.list_projects()

        self.assertEqual(len(projects), 2)
        self.assertEqual(projects[0]["projectName"], "Alpha")
        self.assertEqual(projects[0]["taskCount"], 2)
        self.assertEqual(projects[1]["projectName"], "Beta")

    def test_request_json_raises_api_error(self) -> None:
        http_error = error.HTTPError(
            url="https://example.actitime.com/api/v1/users/me",
            code=401,
            msg="Unauthorized",
            hdrs=None,
            fp=io.BytesIO(b'{"message":"bad credentials"}'),
        )
        with mock.patch("urllib.request.urlopen", side_effect=http_error):
            with self.assertRaises(ActitimeApiError) as ctx:
                self.client.request_json("GET", "/users/me")

        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("bad credentials", str(ctx.exception))

    def test_get_day_entries_flattens_response(self) -> None:
        with mock.patch.object(self.client, "resolve_user_for_query", return_value={"id": 1, "username": "alice"}):
            with mock.patch.object(
                self.client,
                "request_json",
                return_value={
                    "data": [{"userId": 1, "date": "2026-04-15", "records": [{"taskId": 90, "time": 120}]}],
                    "tasks": {"90": {"id": 90, "name": "Coding", "projectId": 10, "projectName": "Alpha", "customerId": 100, "customerName": "ACME"}},
                    "projects": {"10": {"id": 10, "name": "Alpha"}},
                    "customers": {"100": {"id": 100, "name": "ACME"}},
                },
            ):
                rows = self.client.get_day_entries(date="2026-04-15")

        self.assertEqual(rows[0]["taskName"], "Coding")
        self.assertEqual(rows[0]["minutes"], 120)
