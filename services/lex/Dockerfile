# Clarvia Lex email service — Phase 1 production image.
# Build context MUST be the service directory (this directory). No parent paths.
FROM python:3.12-slim@sha256:229a2c5bfa27522db7815ea81f9bed70af17ccb9de9fc7ad142b1877b5830d36 AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8080

WORKDIR /app

# Install only the production package and its pinned dependencies.
# Copy just what the build backend needs first for better layer caching.
COPY pyproject.toml README.md ./
COPY app ./app
RUN pip install --no-cache-dir .

# Approved private runtime material (prompt). Credentials, .env, user data,
# evaluation records and logs are excluded by .dockerignore and never enter
# the build context.
COPY runtime-private/prompts ./runtime-private/prompts

# Run as an unprivileged user.
RUN useradd --create-home --uid 10001 lex \
    && chown -R lex:lex /app
USER lex

ENV LEX_PROMPT_PATH=/app/runtime-private/prompts/lex-v1.txt \
    LEX_RESEARCH_PROMPT_PATH=/app/runtime-private/prompts/lex-research-v1.txt \
    LEX_WRITER_PROMPT_PATH=/app/runtime-private/prompts/lex-writer-v1.txt \
    LEX_GENERATION_PIPELINE=two_pass \
    GCP_REGION=europe-west1 \
    OPENAI_MODEL=gpt-5.6-luna \
    PROCESSING_MODE=disabled

EXPOSE 8080

# Container-native health probe without requiring curl in the slim image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import os,urllib.request,sys; \
url='http://127.0.0.1:'+os.environ.get('PORT','8080')+'/healthz'; \
sys.exit(0) if urllib.request.urlopen(url, timeout=4).status==200 else sys.exit(1)"

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
