#!/usr/bin/env bash
set -euo pipefail

# Dev helper to start/stop the Ceva Bun API (FastAPI) and Web (Vite) locally.
# Usage:
#   bash scripts/dev.sh start [--port 8001]
#   bash scripts/dev.sh stop
#   bash scripts/dev.sh status
#   bash scripts/dev.sh logs

here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/.." && pwd)"
api_dir="$root/apps/api"
web_dir="$root/apps/web"
state_dir="$root/.dev"
uvicorn_pid="$state_dir/uvicorn.pid"
vite_pid="$state_dir/vite.pid"
uvicorn_log="$state_dir/uvicorn.log"
vite_log="$state_dir/vite.log"

mkdir -p "$state_dir"

API_PORT="8001"
CMD="${1:-help}"
shift || true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      API_PORT="$2"; shift 2;;
    --port=*)
      API_PORT="${1#*=}"; shift;;
    *)
      echo "Unknown argument: $1"; exit 1;;
  esac
done

ensure_envs() {
  # API env
  if [[ ! -f "$api_dir/.env" && -f "$api_dir/.env.example" ]]; then
    cp "$api_dir/.env.example" "$api_dir/.env"
  fi
  # Ensure APP_PORT in API .env matches desired port
  if [[ -f "$api_dir/.env" ]]; then
    if grep -q '^APP_PORT=' "$api_dir/.env"; then
      sed -i '' -E "s#^APP_PORT=.*#APP_PORT=$API_PORT#" "$api_dir/.env" 2>/dev/null || \
      sed -E -i "s#^APP_PORT=.*#APP_PORT=$API_PORT#" "$api_dir/.env" || true
    else
      echo "APP_PORT=$API_PORT" >> "$api_dir/.env"
    fi
  fi

  # Web env
  if [[ ! -f "$web_dir/.env" && -f "$web_dir/.env.example" ]]; then
    cp "$web_dir/.env.example" "$web_dir/.env"
  fi
  if [[ -f "$web_dir/.env" ]]; then
    if grep -q '^VITE_API_BASE_URL=' "$web_dir/.env"; then
      sed -i '' -E "s#^VITE_API_BASE_URL=.*#VITE_API_BASE_URL=http://localhost:$API_PORT#" "$web_dir/.env" 2>/dev/null || \
      sed -E -i "s#^VITE_API_BASE_URL=.*#VITE_API_BASE_URL=http://localhost:$API_PORT#" "$web_dir/.env" || true
    else
      echo "VITE_API_BASE_URL=http://localhost:$API_PORT" >> "$web_dir/.env"
    fi
  fi
}

install_api_deps() {
  # Create venv and install deps
  if [[ ! -d "$api_dir/.venv" ]]; then
    python3 -m venv "$api_dir/.venv"
  fi
  # shellcheck disable=SC1091
  source "$api_dir/.venv/bin/activate"
  pip install --upgrade pip >/dev/null
  pip install -r "$api_dir/requirements.txt"
}

install_web_deps() {
  if command -v pnpm >/dev/null 2>&1; then
    (cd "$web_dir" && pnpm install)
  else
    (cd "$web_dir" && npm install)
  fi
}

start() {
  ensure_envs
  install_api_deps
  install_web_deps

  # Start API
  if [[ -f "$uvicorn_pid" ]] && kill -0 "$(cat "$uvicorn_pid")" 2>/dev/null; then
    echo "API already running (pid $(cat "$uvicorn_pid"))."
  else
    nohup "$api_dir/.venv/bin/python" -m uvicorn apps.api.main:app --reload --host 0.0.0.0 --port "$API_PORT" >"$uvicorn_log" 2>&1 & echo $! >"$uvicorn_pid"
    sleep 1
  fi

  # Start Web
  if [[ -f "$vite_pid" ]] && kill -0 "$(cat "$vite_pid")" 2>/dev/null; then
    echo "Web already running (pid $(cat "$vite_pid"))."
  else
    if command -v pnpm >/dev/null 2>&1; then
      nohup bash -lc "cd '$web_dir' && pnpm dev --host" >"$vite_log" 2>&1 & echo $! >"$vite_pid"
    else
      nohup bash -lc "cd '$web_dir' && npm run dev -- --host" >"$vite_log" 2>&1 & echo $! >"$vite_pid"
    fi
    sleep 1
  fi

  echo "API: http://localhost:$API_PORT"
  echo "Web: http://localhost:5173"
  echo "Logs: $uvicorn_log and $vite_log"
}

stop() {
  for f in "$vite_pid" "$uvicorn_pid"; do
    if [[ -f "$f" ]]; then
      pid="$(cat "$f" || true)"
      if [[ -n "${pid}" ]] && kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null || true
      fi
      rm -f "$f"
    fi
  done
  echo "Stopped API and Web (if running)."
}

status() {
  if [[ -f "$uvicorn_pid" ]] && kill -0 "$(cat "$uvicorn_pid")" 2>/dev/null; then
    echo "API running (pid $(cat "$uvicorn_pid"))"
  else
    echo "API not running"
  fi
  if [[ -f "$vite_pid" ]] && kill -0 "$(cat "$vite_pid")" 2>/dev/null; then
    echo "Web running (pid $(cat "$vite_pid"))"
  else
    echo "Web not running"
  fi
}

logs() {
  echo "=== API ($uvicorn_log) ==="
  tail -n 50 -F "$uvicorn_log" &
  api_tail=$!
  echo "=== Web ($vite_log) ==="
  tail -n 50 -F "$vite_log" &
  web_tail=$!
  trap 'kill $api_tail $web_tail 2>/dev/null || true' INT TERM EXIT
  wait
}

case "$CMD" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  logs) logs ;;
  *)
    cat <<USAGE
Usage: bash scripts/dev.sh <command> [--port 8001]
Commands:
  start   Set up envs, install deps, and run API+Web
  stop    Stop both processes
  status  Show running status
  logs    Tail both logs
USAGE
    ;;
esac

