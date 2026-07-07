# Governance for workflow-web

This repository contains the public web layer for Clarvia.

Clarvia is maintained by CLARVIA ASBL, a Luxembourg non-profit association.

Clarvia provides administrative guidance based on official sources.

It does not provide individualized legal advice.

---

## Purpose

The purpose of `workflow-web` is to publish source-backed workflow data in accessible public formats.

The repository should support:

- static public pages,
- workflow checklist rendering,
- visible source citations,
- visible verification status,
- correction pathways,
- accessibility,
- and generated API views where appropriate.

---

## Source of truth

`workflow-web` is not the source of truth for workflow facts.

Workflow facts should be maintained in:

[`clarvia-org/clarvia-graph`](https://github.com/clarvia-org/clarvia-graph)

This repository should consume workflow data from generated exports, local development fixtures, or build-time data imports.

Manual duplication of legal, tax, inheritance, deadline, or administrative facts should be avoided.

---

## Publication standard

Public pages should clearly display:

- administrative-guidance disclaimer,
- source citations where applicable,
- last verified dates where available,
- workflow status,
- and correction paths.

Pages should avoid implying that alpha or draft workflows are complete, legally reviewed, or official.

---

## Out of scope

This repository should not implement:

- user accounts,
- personal case intake,
- case-management dashboards,
- legal-advice chatbots,
- government integrations,
- payment flows,
- storage of sensitive personal information,
- or unpublished reviewer workflows.

---

## Review

Changes to public workflow presentation should be reviewed for:

- clarity,
- accessibility,
- source visibility,
- disclaimer placement,
- and consistency with clarvia-graph status fields.

High-impact wording changes may require maintainer review.
