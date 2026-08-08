# Contributing to lex

## Environment Setup

We use `uv` for environment, lockfile, commands, and builds.

```bash
uv sync --frozen
```

## Workflow

1. Open an issue to discuss your proposed change or new country.
2. Draft a pull request.
3. Pass all automated checks.
4. Obtain human review.
5. Squash and merge.

## Quality Commands

Before submitting a PR, ensure all checks pass:

```bash
uv run ruff format --check .
uv run ruff check .
uv run mypy src tests
uv run pytest
```

## Data Review Checklist

- Official source identity
- Title and official ID
- Status and warning
- Article order and numbering
- Representative paragraphs
- Annexes, tables, and legally meaningful notes
- Source URL
- Rights and attribution
- Selected source format

## Source-Rights Checklist

- Ensure the source explicitly identifies the text as official.
- Verify the publisher's redistribution rights and open data license.
- Document rights in the country's `source.yml` and `README.md`.

## PR Attestations

Your pull request must include the exact 5 checkboxes from the PR template:

- [ ] I am entitled to submit the code and project-authored content in this PR.
- [ ] Every legislative source in this PR is official.
- [ ] I verified and documented redistribution and attribution terms.
- [ ] I compared normalized output with the retained official source.
- [ ] This PR follows BLUEPRINT.md and introduces no unauthorized field or architecture.

## CLA / DCO

No CLA or DCO is required. Contributions are accepted under Apache-2.0 for project-authored material through the license's inbound-contribution terms. 
Source-specific legislative material remains under its recorded source terms.

`BLUEPRINT.md` governs all architectural choices.
