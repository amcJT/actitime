from __future__ import annotations

import os
import tomllib
from dataclasses import dataclass
from pathlib import Path


class ConfigError(ValueError):
    """Raised when required configuration is missing or invalid."""


@dataclass(frozen=True)
class ActitimeConfig:
    base_url: str
    username: str
    password: str
    timeout: float = 30.0

    @property
    def api_base_url(self) -> str:
        base = self.base_url.rstrip("/")
        if base.endswith("/api/v1"):
            return base
        if base.endswith("/api/v1/swagger"):
            return base[: -len("/swagger")]
        return f"{base}/api/v1"


def load_config(config_path: str | Path | None = None) -> ActitimeConfig:
    path = Path(config_path) if config_path else _default_config_path()
    file_values = _read_toml_config(path) if path and path.exists() else {}

    base_url = os.getenv("ACTITIME_BASE_URL") or file_values.get("base_url")
    username = os.getenv("ACTITIME_USERNAME") or file_values.get("username")
    password = os.getenv("ACTITIME_PASSWORD") or file_values.get("password")
    timeout = _read_timeout(os.getenv("ACTITIME_TIMEOUT"), file_values.get("timeout"))

    missing = [
        name
        for name, value in (
            ("ACTITIME_BASE_URL", base_url),
            ("ACTITIME_USERNAME", username),
            ("ACTITIME_PASSWORD", password),
        )
        if not value
    ]
    if missing:
        missing_text = ", ".join(missing)
        location = f" or {path}" if path else ""
        raise ConfigError(
            f"Missing configuration: {missing_text}. "
            f"Set the variables in the environment{location}."
        )

    return ActitimeConfig(
        base_url=str(base_url).rstrip("/"),
        username=str(username),
        password=str(password),
        timeout=timeout,
    )


def _default_config_path() -> Path | None:
    candidate = Path.cwd() / "actitime.toml"
    return candidate if candidate.exists() else None


def _read_toml_config(path: Path) -> dict[str, object]:
    with path.open("rb") as handle:
        payload = tomllib.load(handle)

    section = payload.get("actitime")
    if section is None:
        raise ConfigError(f"Configuration file {path} is missing the [actitime] section.")
    if not isinstance(section, dict):
        raise ConfigError(f"Configuration file {path} has an invalid [actitime] section.")
    return section


def _read_timeout(env_value: str | None, file_value: object) -> float:
    raw = env_value if env_value is not None else file_value
    if raw in (None, ""):
        return 30.0

    try:
        timeout = float(raw)
    except (TypeError, ValueError) as exc:
        raise ConfigError("ACTITIME_TIMEOUT must be a number.") from exc

    if timeout <= 0:
        raise ConfigError("ACTITIME_TIMEOUT must be greater than 0.")
    return timeout
