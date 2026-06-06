# Clarvia Conventions

> Part of the [Clarvia Graph Foundation Specification](FOUNDATION.md).

## Source snapshot content hashes

`source_snapshot.content_hash` verifies the archived source content saved by Clarvia.

For text archive files (`.html`, `.txt`), Clarvia computes `content_hash` as SHA-256 over UTF-8 bytes after normalizing line endings from CRLF (`\r\n`) to LF (`\n`).

For binary archive files, including PDFs, Clarvia computes `content_hash` as SHA-256 over the exact raw file bytes.

This means text archive hashes are stable across operating systems and Git checkout settings, but external verifiers must apply the same LF normalization before comparing hashes.

The capture pipeline should save text archives with LF line endings so the stored file bytes and canonical hash convention remain easy to reason about.
