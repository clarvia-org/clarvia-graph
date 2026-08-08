# Clarvia Lex email service — local quality checks (Phase 1).
# No deployment target runs as part of `make check`.
# On Windows without GNU make, run the equivalent commands documented in README.

PYTHON ?= python
PIP := $(PYTHON) -m pip

PROJECT_ID ?= fleet-garage-502110-g6
REGION ?= europe-west1
AR_REPOSITORY ?= lex-services
SERVICE_NAME ?= lex-email-service
IMAGE_TAG ?= $(shell date -u +%Y%m%d-%H%M%S)
IMAGE_URI := $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(AR_REPOSITORY)/$(SERVICE_NAME):$(IMAGE_TAG)

.PHONY: setup format format-check lint typecheck test check docker-build

setup:
	$(PIP) install --upgrade pip
	$(PIP) install -e ".[dev]"

format:
	$(PYTHON) -m ruff format app tests
	$(PYTHON) -m ruff check --fix app tests

format-check:
	$(PYTHON) -m ruff format --check app tests

lint:
	$(PYTHON) -m ruff check app tests

typecheck:
	$(PYTHON) -m mypy

test:
	$(PYTHON) -m pytest --cov=app --cov-report=term-missing --cov-fail-under=90

# `check` never deploys and never builds a container.
check: format-check lint typecheck test

docker-build:
	@if [ "$(IMAGE_TAG)" = "latest" ]; then \
		echo "Refusing to build with IMAGE_TAG=latest. Use an immutable tag."; \
		exit 1; \
	fi
	docker buildx build --platform=linux/amd64 --tag "$(IMAGE_URI)" --load .
