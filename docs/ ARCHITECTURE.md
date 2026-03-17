# Project Architecture

## Overview

The Secure Apportionment System is a Python tool that processes parliamentary vote data
securely and allocates seats fairly using the Huntington-Hill method (method of equal
proportions). The system has **three distinct entry points** sharing a common pipeline.

**Priorities:**
- **Confidentiality** — vote totals encrypted at rest and in transit (AES-256-CBC)
- **Correctness** — Huntington-Hill is provably Alabama-paradox-free; verified by tests
- **Transparency** — modular, well-tested, educational/demonstration grade

---

## Entry Points

| File | Type | Description |
|---|---|---|
| `src/main.py` | CLI | argparse-driven · direct pipeline execution |
| `src/app.py` | Web | Flask web server · file upload API · port 5000 |
| `launcher.py` | GUI | Tkinter desktop wrapper · calls compiled `.exe` |

---

## Shared Pipeline

All three entry points execute this core flow:

```
1. Load CSV         read_shares_from_csv()      src/apportionment.py
                    or inline parse in          src/app.py /upload route

2. Validate         validate_csv_data()         src/validators.py
                    checks votes ≥ 0, non-empty, total > 0

3. Encrypt          encrypt_data(bytes, key)    src/AES-256.py
                    AES-256-CBC, PKCS7 padding
                    key: os.urandom(32), IV: os.urandom(16) prepended to ciphertext

4. Decrypt          decrypt_data(enc, key)      src/AES-256.py
                    in-memory ONLY — key is never persisted to disk in production

5. Apportion        huntington_hill(votes, n)   src/apportionment.py
                    iterative priority queue (heapq), geometric mean denominator

6. Output           JSON response               src/app.py (web)
                    console + .enc file         src/main.py (CLI)
```

---

## Module Map

```
src/
  apportionment.py     huntington_hill()         — Huntington-Hill seat allocation
                       read_shares_from_csv()    — CSV loader (csv.reader, scalable)

  app.py               Flask application         — web entry point
                       GET  /                    — renders templates/index.html
                       POST /upload              — CSV → validate → allocate → JSON
                       GET  /api/info            — system metadata

  main.py              CLI entry point           — argparse, runs full pipeline
                       inline encrypt/decrypt    — NOTE: duplicates src/AES-256.py logic

  AES-256.py           encrypt_data(bytes, key)  — AES-256-CBC + PKCS7
                       decrypt_data(enc, key)    — IV extracted from first 16 bytes
                       NOTE: not imported by main.py (duplicate logic exists there)

  validators.py        validate_csv_data()       — checks vote dict integrity
                       validate_seats_allocation() — defined but NOT called in app.py (TODO)

  logging_setup.py     logger                    — rotating file handler + console
                       logs/app_YYYYMMDD_HHMMSS.log

backend/
  config.py            Config / DevelopmentConfig / ProductionConfig / TestingConfig
                       reads ENCRYPTION_KEY from .env via python-dotenv

templates/
  base.html            Jinja2 base layout
  index.html           Main web UI (extends base.html)

static/
  css/style.css        Frontend styles
  js/main.js           Frontend logic

public/
  index.html           GitHub Pages SPA frontend
```

---

## Web Layer (app.py)

```
GET  /           → renders templates/index.html (Jinja2)
POST /upload     → multipart CSV upload
                   → validate_csv_data()
                   → huntington_hill()
                   → returns { success, results, votes }
GET  /api/info   → { name, version, method, encryption }
```

Flask config: `MAX_CONTENT_LENGTH = 10MB`, `template_folder = ../templates`,
`static_folder = ../static`.

---

## Security Model

**Encryption**
- Algorithm: AES-256-CBC
- IV: `os.urandom(16)` generated fresh per message, prepended to ciphertext
- Padding: PKCS7 (128-bit block)
- Wrong-key detection: padding validation raises `ValueError` on decryption failure

**Key management**
- Keys generated with `os.urandom(32)`
- `main.py` CLI demo writes `key.bin` to disk — **this is a known risk** documented
  in `THREAT_MODEL.md`. Set `ENCRYPTION_KEY` as an environment variable in production.

**What this system does NOT protect against** — see `docs/THREAT_MODEL.md` for full scope.

---

## Tests & CI

```
tests/
  test.py              round-trip encrypt/decrypt, wrong key raises ValueError,
                       invalid key length raises ValueError
  test_validators.py   validate_csv_data() edge cases

backend/pytest.ini     test runner configuration

.github/workflows/
  tests.yml            CI on push — runs pytest
  docker-publish.yml   container build and publish
```

---

## Known Gaps (TODOs)

| Issue | Location | Notes |
|---|---|---|
| `validate_seats_allocation()` never called | `src/app.py` /upload route | Should be called after parsing |
| Duplicate crypto logic | `src/main.py` vs `src/AES-256.py` | main.py should import from AES-256.py |
| Version mismatch | `docs/CHANGELOG.md` shows `1.0.0` | README shows `v0.x` — reconcile |
| CSV output not implemented | `src/main.py` | Listed in original doc, only `.enc` written |

---

## File Tree (full)

```
Secure-Apportionment-System/
├── src/
│   ├── apportionment.py       core algorithm + CSV loader
│   ├── app.py                 Flask web entry point
│   ├── main.py                CLI entry point
│   ├── AES-256.py             encryption module
│   ├── validators.py          input validation
│   ├── logging_setup.py       logging config
│   └── __init__.py
├── backend/
│   ├── config.py              env-based config profiles
│   ├── requirements.txt       fastapi, uvicorn, flask, cryptography, pytest
│   └── pytest.ini
├── templates/
│   ├── base.html
│   └── index.html
├── static/
│   ├── css/style.css
│   └── js/main.js
├── public/
│   └── index.html             GitHub Pages frontend
├── tests/
│   ├── test.py
│   ├── test_validators.py
│   └── __init__.py
├── docs/
│   ├── ARCHITECTURE.md        ← this file
│   ├── CHANGELOG.md
│   ├── ENCRYPTION.md
│   ├── THREAT_MODEL.md
│   ├── CONTRIBUTING.md
│   ├── CODE_OF_CONDUCT.md
│   └── ssdlc.md
├── .github/
│   └── workflows/
│       ├── tests.yml
│       └── docker-publish.yml
├── launcher.py                Tkinter GUI entry point
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── installer.iss              Inno Setup config
├── run.bat                    Windows launcher script
└── sample_*.csv               11 election scenario datasets
```
