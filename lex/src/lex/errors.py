import enum
from pathlib import Path


class ErrorCode(enum.Enum):
    LEX_NOT_FOUND = "LEX_NOT_FOUND"
    LEX_LANGUAGE_NOT_FOUND = "LEX_LANGUAGE_NOT_FOUND"
    LEX_PROVISION_NOT_FOUND = "LEX_PROVISION_NOT_FOUND"
    LEX_SOURCE_NOT_FOUND = "LEX_SOURCE_NOT_FOUND"
    LEX_HASH_MISMATCH = "LEX_HASH_MISMATCH"
    LEX_INVALID_DATA = "LEX_INVALID_DATA"
    LEX_AMBIGUOUS_MATCH = "LEX_AMBIGUOUS_MATCH"
    LEX_INVALID_ID = "LEX_INVALID_ID"
    LEX_INVALID_RIGHTS = "LEX_INVALID_RIGHTS"
    LEX_NETWORK_ERROR = "LEX_NETWORK_ERROR"
    LEX_SOURCE_CHANGED = "LEX_SOURCE_CHANGED"
    LEX_UNEXPECTED_DELETION = "LEX_UNEXPECTED_DELETION"


class LexError(Exception):
    """Exception raised for errors in the Lex dataset."""

    def __init__(self, code: ErrorCode, path: Path | str, message: str) -> None:
        super().__init__(f"{code.value} {path}: {message}")
        self.code = code
        self.path = str(path)
        self.message = message
