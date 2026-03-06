PY?=python3
PIP?=pip3

.PHONY: help api web dev clean start stop status logs

help:
	@echo "Targets:"
	@echo "  api       - run FastAPI dev server"
	@echo "  web       - run Vite dev server"
	@echo "  dev       - run both (requires two terminals)"
	@echo "  clean     - remove build artifacts"
	@echo "  start     - use scripts/dev.sh to start both"
	@echo "  stop      - stop both"
	@echo "  status    - show status"
	@echo "  logs      - tail both logs"

api:
	cd apps/api && $(PY) -m uvicorn apps.api.main:app --reload --port $${APP_PORT:-8000}

web:
	cd apps/web && pnpm dev --host

dev:
	@echo "Run 'make api' and 'make web' in separate shells."

clean:
	rm -rf apps/web/dist .pytest_cache **/__pycache__

start:
	bash scripts/dev.sh start --port $${PORT:-8001}

stop:
	bash scripts/dev.sh stop

status:
	bash scripts/dev.sh status

logs:
	bash scripts/dev.sh logs
