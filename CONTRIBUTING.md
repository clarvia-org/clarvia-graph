# Contributing to Clarvia Graph

Thank you for your interest in contributing to Clarvia! This project builds open, source-backed administrative workflow infrastructure. Every contribution helps families navigating cross-border situations.

## How to contribute

### What you can do without deep graph knowledge

- **Discover sources** — Find official government pages for administrative procedures
- **Check links** — Verify that source URLs are still accessible
- **Report staleness** — Flag when official guidance has changed
- **Add authority metadata** — Name, jurisdiction, function, official website
- **Suggest scenario tests** — Describe a real-world situation and expected outcomes
- **Draft translations** — Help translate checklist text into EN/FR/DE
- **Fix typos** — In documentation, labels, or descriptions

### What requires review before merging

- Source assertions (legal claims extracted from official sources)
- Consequence and task template records
- Condition expressions
- Deadline values
- Cross-border composition rules

### What you cannot do as an external contributor

- Approve source assertions (`review_status: approved`)
- Set `authoring_status: approved`
- Merge PRs to main
- Resolve contradictions
- Publish gold-layer overlays

## Contribution workflow

1. **Fork** the repository
2. **Create a branch** with a descriptive name (e.g., `add-source-belgium-death-declaration`)
3. **Make your changes** following the templates in `.github/ISSUE_TEMPLATE/`
4. **Open a Pull Request** with a clear description
5. **Wait for review** — a maintainer will review your PR

## Status rules for contributed records

All contributed source assertions must start with:

```yaml
review_status: draft
confidence: unassessed
```

All contributed graph records (consequences, task templates, etc.) must start with:

```yaml
authoring_status: draft
```

CI will reject PRs that set `review_status: approved` or `authoring_status: approved` from external contributors.

## Quality checks

Before opening a pull request, run:

- **Tests** — `pnpm test`
- **Linting** — `pnpm lint`
- **Type checking** — `pnpm typecheck`
- **Graph validation** — `pnpm validate`

Pull requests are expected to pass the same CI checks that run on the main branch and releases.

## Contributor agreement

We use the [Developer Certificate of Origin (DCO)](https://developercertificate.org/). By submitting a PR, you certify that you have the right to submit the work under the project's licenses.

Sign off your commits with `git commit -s`.

## Licenses

- **Code:** EUPL-1.2
- **Data:** CC-BY-4.0
- **Schemas & vocabularies:** CC0 or Apache-2.0

## Code of conduct

We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Be respectful, constructive, and kind.

## Questions?

Open a [Discussion](https://github.com/clarvia-org/clarvia-graph/discussions) or reach out through an issue.
