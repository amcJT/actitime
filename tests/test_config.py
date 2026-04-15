from __future__ import annotations

import os
import unittest
from pathlib import Path
from unittest import mock

from actitime_tool.config import ConfigError, load_config


class LoadConfigTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_file = Path.cwd() / "tests" / "_tmp_actitime.toml"

    def tearDown(self) -> None:
        if self.temp_file.exists():
            self.temp_file.unlink()

    def test_loads_from_environment(self) -> None:
        env = {
            "ACTITIME_BASE_URL": "https://example.actitime.com",
            "ACTITIME_USERNAME": "alice",
            "ACTITIME_PASSWORD": "secret",
        }
        with mock.patch.dict(os.environ, env, clear=True):
            config = load_config()

        self.assertEqual(config.base_url, "https://example.actitime.com")
        self.assertEqual(config.username, "alice")
        self.assertEqual(config.password, "secret")
        self.assertEqual(config.api_base_url, "https://example.actitime.com/api/v1")

    def test_loads_missing_values_from_toml(self) -> None:
        self.temp_file.write_text(
            "[actitime]\nbase_url='https://example.actitime.com'\nusername='alice'\npassword='secret'\n",
            encoding="utf-8",
        )
        with mock.patch.dict(os.environ, {}, clear=True):
            config = load_config(self.temp_file)

        self.assertEqual(config.username, "alice")

    def test_raises_for_missing_values(self) -> None:
        with mock.patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(ConfigError):
                load_config()

    def test_env_overrides_timeout(self) -> None:
        self.temp_file.write_text(
            "[actitime]\nbase_url='https://example.actitime.com'\nusername='alice'\npassword='secret'\ntimeout=15\n",
            encoding="utf-8",
        )
        env = {"ACTITIME_TIMEOUT": "42"}
        with mock.patch.dict(os.environ, env, clear=True):
            config = load_config(self.temp_file)

        self.assertEqual(config.timeout, 42.0)
