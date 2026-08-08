from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date, datetime
from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
    from lex.http import HttpClient


@dataclass(frozen=True)
class LawRef:
    id: str
    language: str
    source_url: str
    official_id: str | None = None
    eli_uri: str | None = None


@dataclass(frozen=True)
class SourceDocument:
    content: bytes
    extension: str
    final_url: str
    media_type: str
    retrieved_at: datetime
    title: str
    document_type: str
    status: str
    official_id: str | None = None
    eli_uri: str | None = None
    published_at: date | None = None
    consolidated_at: date | None = None
    source_modified_at: str | None = None
    warning: str | None = None


@dataclass(frozen=True)
class NormalizedLaw:
    title: str
    document_type: str
    body: str


class CountryAdapter(Protocol):
    country_code: str

    def discover(self, client: HttpClient) -> Sequence[LawRef]: ...

    def fetch(self, ref: LawRef, client: HttpClient) -> SourceDocument: ...

    def normalize(self, ref: LawRef, source: SourceDocument) -> NormalizedLaw: ...
