# ============================================================
# Secure Apportionment System — Dockerfile
# v0.1.0 | Flask Backend | AES-256-CBC | Huntington-Hill
# ============================================================

# --- Stage 1: Builder ---
# Use a slim base to keep the final image lean.
# Python 3.10 matches the version in your GitHub Actions CI (tests.yml).
FROM python:3.10-slim AS builder

# Prevent Python from writing .pyc files and buffering stdout/stderr.
# Buffering off means logs appear immediately — critical for debugging
# a security-sensitive app where you need to see what's happening in real time.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy only requirements first.
# Docker caches each layer. If requirements.txt doesn't change,
# Docker reuses the cached pip install layer — much faster rebuilds.
COPY requirements.txt .

# Install dependencies into an isolated prefix so Stage 2 can copy
# only what it needs (no pip cache, no build tools in the final image).
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# --- Stage 2: Runtime ---
# Start fresh from the same slim base. This image will NOT contain
# pip, build tools, or any installation artifacts — only your app code
# and the installed packages. Smaller attack surface, smaller image.
FROM python:3.10-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Default to production. Override with -e FLASK_ENV=development for local dev.
    FLASK_ENV=production \
    # Tell Flask which file is the app entry point.
    FLASK_APP=src/app.py \
    # Do NOT run as debug in production — never expose the Werkzeug debugger.
    FLASK_DEBUG=0 \
    # Bind to all interfaces inside the container so docker-compose can reach it.
    FLASK_RUN_HOST=0.0.0.0 \
    FLASK_RUN_PORT=5000

WORKDIR /app

# Copy installed packages from the builder stage only — no build tools included.
COPY --from=builder /install /usr/local

# Copy your application source.
# .dockerignore (see companion file) will exclude __pycache__, .env, key.bin, etc.
COPY src/ ./src/
COPY templates/ ./templates/
COPY static/ ./static/
COPY backend/config.py ./backend/config.py

# Create the logs directory that logging_setup.py expects.
# Using a volume mount (see docker-compose.yml) means logs persist
# across container restarts — important for audit trails in a
# security-critical application.
RUN mkdir -p logs

# Create a non-root user and switch to it.
# Running as root inside a container is a well-known security risk:
# if an attacker exploits your app, they'd have root on the host too
# (in misconfigured environments). This is especially important here
# because your app handles encrypted vote data.
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup --no-create-home appuser && \
    chown -R appuser:appgroup /app

USER appuser

# Document the port the app listens on. This is metadata only —
# the actual port mapping is done in docker-compose.yml.
EXPOSE 5000

# Health check: Docker will probe this every 30s.
# If Flask is unresponsive, the container is marked "unhealthy" and
# docker-compose can restart it automatically.
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/api/info')" || exit 1

# Use the Flask CLI to run the app.
# Do NOT use app.run(debug=True) in production — that's already
# gated by FLASK_DEBUG=0 above, but the CLI is cleaner.
CMD ["flask", "run"]
