# Translations

> Part of the [Clarvia Graph Foundation Specification](FOUNDATION.md).

This document explains how multilingual content works in the Clarvia consequence graph — what gets translated, what doesn't, and how to contribute translations.

---

## Supported Locales

The graph currently supports these locales (defined in `vocab/locales.yml`):

| Code | Language |
|---|---|
| `en` | English |
| `fr` | French |
| `de` | German |
| `nl` | Dutch |
| `lb` | Luxembourgish |
| `pt` | Portuguese |

---

## What Gets Translated

### User-facing record fields

These fields appear in the checklist UI and need translations:

- **Consequence** — `title`, `description`
- **Task template** — `title`, `description`
- **Deadline** — `title`
- **Condition** — `title`, `description`
- **Authority** — `name`, `name_en`, `name_de`
- **Checklist group labels** — already multilingual in `vocab/checklist_groups.yml`
- **Vocab labels** — already multilingual in all vocab files

### Controlled vocabularies (already translated inline)

Vocab files already carry multilingual labels directly. Example from `vocab/jurisdictions.yml`:

```yaml
- id: LU
  label: Luxembourg
  label_fr: Luxembourg
  label_de: Luxemburg
```

And `vocab/checklist_groups.yml`:

```yaml
- id: immediate_formalities
  label: Immediate formalities
  label_fr: Formalités immédiates
  label_de: Sofortige Formalitäten
  sort_order: 1
```

### Authority records (already translated inline)

Authority records carry multilingual names directly:

```yaml
id: authority.lu.bureau_etat_civil
name: "Bureau de l'état civil"
name_en: "Civil Registry Office"
name_de: "Standesamt"
```

---

## What Does NOT Get Translated

### Source assertion `claim_text`

The `claim_text` stays in the source's original language. This is the canonical legal/administrative statement extracted from the government source. Translations of `claim_text` are non-canonical overlays, not replacements.

```yaml
# This stays in French — the source is a French government page
claim_text: >
  En cas de décès, une déclaration doit être faite dans les 24 heures
  à l'officier de l'état civil du lieu du décès.
```

### Anchor text (`anchor.text_quote`)

The anchor must match the captured HTML exactly. It is never translated — it's a content-addressed reference to the source.

---

## Translation Overlay Files

Translations are stored as **overlay files** in the `translations/` directory, mirroring the graph structure:

```
translations/
  en/
    graph/consequences/bereavement/lu/declare_death.yml
  fr/
    graph/consequences/bereavement/lu/declare_death.yml
  de/
    graph/consequences/bereavement/lu/declare_death.yml
```

### Overlay format

```yaml
record_id: consequence.lu.bereavement.death_registration.declare_death
locale: fr
fields:
  title: "Déclarer le décès à l'officier de l'état civil"
  description: >
    En cas de décès survenu au Luxembourg, le décès doit être déclaré
    au bureau de l'état civil de la commune où le décès a eu lieu.
translation_status: reviewed
translated_by: translator.fr.001
```

### Translation status lifecycle

```
draft → ai_draft → reviewed → approved
```

| Status | Meaning |
|---|---|
| `draft` | Human-written first draft |
| `ai_draft` | AI-generated translation, not yet reviewed |
| `reviewed` | Checked by a bilingual reviewer |
| `approved` | Final, suitable for production |

---

## Locale-Specific Exports

The web export pipeline generates locale-specific bundles:

```
build/exports/web/runtime/en/bereavement-lu-de-fr.json
build/exports/web/runtime/fr/bereavement-lu-de-fr.json
build/exports/web/runtime/de/bereavement-lu-de-fr.json
```

### Fallback order

When a translation is missing, the system falls back:

```
fr: [fr, en, source_language]
de: [de, en, source_language]
en: [en, source_language]
```

If an important translation is missing, the UI shows:

> *"Some source excerpts are shown in their original language."*

---

## Contributing Translations

### What you can translate

- Consequence titles and descriptions
- Task template titles and descriptions
- Deadline titles
- Condition titles and descriptions
- Vocab labels (add `label_<locale>` to vocab entries)

### How to contribute

1. Create a translation overlay file in the appropriate `translations/<locale>/` directory
2. Set `translation_status: draft` (or `ai_draft` if AI-generated)
3. Open a PR

### Rules

- **Never modify `claim_text`** in source assertions — that stays in the source language
- **Never modify `anchor.text_quote`** — that must match the HTML exactly
- AI-generated translations should use `translation_status: ai_draft`
- A human must verify legal/administrative wording before `reviewed` or `approved`
- **Review language rule:** No high-risk assertion may be approved by a reviewer who cannot read the source language, unless a qualified translation review is attached

---

## CI Gates

```yaml
translation_gate:        # Missing high-priority UI translations fail web export
                         # for supported locales
review_language_gate:    # High-risk assertions require reviewer competence
                         # in the source language, or a reviewed translation
```

---

## Current Status

The `translations/` directory currently contains only `.gitkeep` placeholder files:

```
translations/
  en/   (.gitkeep)
  fr/   (.gitkeep)
  de/   (.gitkeep)
```

Translation overlay files will be added as the graph grows beyond the initial alpha jurisdictions. For alpha, the primary content language is the source language (French for LU/FR sources, German for DE sources), with English `title_en` / `name_en` fields providing basic English coverage directly in the record files.
