# Data Model

## Stable IDs

Stable IDs format: `<country>/<slug>`

Rules:
- `<country>`: lowercase ISO 3166-1 alpha-2.
- `<slug>`: lowercase ASCII, digits, and hyphens only.
- Never change because a title changes.

## Frontmatter

Every normalized file begins with YAML frontmatter in this exact field order:

```yaml
---
id: lu/code-civil
country: lu
title: "Code civil"
language: fr
document_type: code
status: official_consolidation
official_id: "<official identifier>"
eli_uri: "<official ELI URI>"
source_url: "<official URL of selected text>"
source_file: source.xml
source_sha256: "<64 lowercase hexadecimal characters>"
source_license: CC-BY-4.0
source_attribution: "Service central de législation, Luxembourg"
source_terms_url: "https://data.legilux.public.lu/home/intro"
rights_reviewed_at: 2026-07-21
published_at: "<YYYY-MM-DD>"
consolidated_at: "<YYYY-MM-DD>"
source_modified_at: "<ISO-8601 value>"
retrieved_at: "<UTC ISO-8601 timestamp ending in Z>"
warning: "<one concise material warning>"
---
```

### Status Values
`official_current` or `official_consolidation`

## Language Filenames
Default language: `current.md`, `source.<ext>`
Other languages: `current.<lang>.md`, `source.<lang>.<ext>`

## Markdown Rules
1. The first body line is `# <official title>`.
2. Official hierarchy and provision labels are retained.
3. Every addressable provision has an HTML anchor immediately before its heading.
4. One logical source paragraph is written per line.

## Provision Anchors
1. Use the official source anchor or XML identifier when present.
2. Normalize it to lowercase ASCII by replacing underscores and non-alphanumeric runs with one hyphen.
3. Strip leading and trailing hyphens.

Example:
```markdown
<a id="art-13"></a>
## Article 13

Premier alinéa du texte officiel.
```
