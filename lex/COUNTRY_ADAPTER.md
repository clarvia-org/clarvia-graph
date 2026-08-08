# Country Adapter

Country adapters live at `countries/<cc>/adapter.py` and are dynamically loaded.

## Shared Protocol

Adapters must implement this protocol using shared dataclasses:

```python
from dataclasses import dataclass
from datetime import date, datetime
from typing import Protocol, Sequence

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

    def discover(self, client: "HttpClient") -> Sequence[LawRef]: ...
    def fetch(self, ref: LawRef, client: "HttpClient") -> SourceDocument: ...
    def normalize(self, ref: LawRef, source: SourceDocument) -> NormalizedLaw: ...
```

## Responsibility Split

The adapter owns source discovery, current-text selection, fetch parameters, parsing, and Markdown generation. The runner owns config, validation, HTTP, checksums, serialization, and file writing.

## Fixture Layout

```text
countries/<cc>/fixtures/
├── discovery.json
├── ordinary-source.<ext>
├── complex-source.<ext>
├── invalid-response.<ext>
├── expected-ordinary.md
└── expected-complex.md
```

## Conformance Tests
Adapters test discovery parsing, source selection, ordinary/complex normalization, invalid responses, determinism, stable IDs, and warnings without network access.

## Contribution Workflow
1. Open a `new-country` issue.
2. Identify publisher and entry point.
3. Record source rights.
4. Open draft PR with adapter, fixtures, tests, and one law.
5. Run conformance tests.
6. Review source comparison.
7. Merge.
