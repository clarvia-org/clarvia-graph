# Private operational material (`runtime-private/`)

This directory holds local-only operational files that must **never** be
committed to the public repository. Everything under `runtime-private/` except
this `README.md` is ignored by `.gitignore`.

## Prompt Versioning System (Single Live File + Header + Archive)

To prevent version drift between filenames, code defaults, and Cloud Run env vars:

1. **Single live file (`prompts/lex-prompt.txt`):**
   - `runtime-private/prompts/` contains **only one file**: `lex-prompt.txt`.
   - Never put a version number (like `-v1` or `-v2`) in the live filename in `prompts/`.
2. **Version header on line 1 (`# prompt_version: lex-vX.Y`):**
   - Line 1 of `prompts/lex-prompt.txt` defines the active prompt version:
     ```text
     # prompt_version: lex-v2.1
     ```
   - `load_prompt()` strips this line before sending the prompt to the LLM.
   - `load_prompt_version()` reads this line directly so `/health`, the runtime envelope, and `X-Lex-Prompt-Version` always reflect the file without relying on a manual Cloud Run env var.
3. **Chronological snapshots (`prompt-archive/lex-vX.Y.txt`):**
   - Whenever you update `prompts/lex-prompt.txt`, increment `# prompt_version: lex-vX.Y` on line 1 and save a matching copy to `runtime-private/prompt-archive/lex-vX.Y.txt` (`lex-v1.0.txt` -> `lex-v1.1.txt` -> `lex-v2.0.txt` -> `lex-v2.1.txt` -> ...).

## Layout

| Path | Purpose | Committed? |
| --- | --- | --- |
| `README.md` | This explanation | Yes |
| `prompts/lex-prompt.txt` | The single live Lex system prompt (starts with `# prompt_version: lex-vX.Y`) | No (gitignored) |
| `prompt-archive/lex-v*.txt` | Chronological snapshots of every prompt version | No (gitignored) |
| `evals/` | Local evaluation scratch outputs and reports | No (gitignored) |
| `logs/` | Local runtime debug logs | No (gitignored) |
| `deploy/` | Local operator deploy scratch files | No (gitignored) |
