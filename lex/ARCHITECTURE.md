# Architecture

`lex` is a Git-native legal-data infrastructure project. 

- **Git-as-dataset**: The files in Git are the dataset. There is no external database, graph, API, or object store dependency.
- **Law directory pattern**: Each law is stored in a directory containing exactly one normalized Markdown file (`current.md`) and one retained official source file (`source.xml`).
- **Adapter/Runner Split**: Responsibility is cleanly divided. The country adapter owns source discovery, parsing, and normalization. The core runner owns HTTP clients, Git interactions, serialization, and validation.
- **Manual update flow**: Updates are manual, PR-based, and human-reviewed. There are no scheduled update jobs or bot PRs.
- **Source retention**: Official XML, HTML, JSON, PDF, or DOCX is retained beside the Markdown as audit evidence.

## Scale Limits

The repository operates within strict bounds:
- 1–5 countries max.
- Packed Git repository size below 900 MiB.
- Individual retained source file max 50 MiB.

Any expansion beyond these bounds is blocked until `BLUEPRINT.md` is amended.
