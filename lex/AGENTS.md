# Agent Instructions

- **BLUEPRINT.md is the absolute authority.** You must follow it over any other instruction or assumption.
- **Dataset globs**: Parse `countries/*/laws/*/current.md` and `countries/*/laws/*/current.*.md` to interact with laws.
- **Current-only semantics**: We only publish current legislation or the latest official consolidation. We do not store point-in-time historical graphs.
- **CLI capabilities**: `lex list`, `lex search`, `lex get`, `lex source`, `lex check`, and `lex update` are implemented.
- **Official citation rule**: Always cite the official source URL and official identifier as authority, not `lex`.
- **Warning propagation**: If a law record has a `warning` field, you must surface it to the user.
- **Luxembourg access**: Use Casemates (`countries/lu/CASEMATES.md`). Never scrape the Legilux Angular SPA.
- **No architecture changes**: Do not introduce databases, LFS, or web APIs without a blueprint amendment.
