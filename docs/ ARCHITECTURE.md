# Architecture

**Secure Apportionment System · v0.3.0**

> Huntington-Hill seat allocation with AES-256-CBC encryption.  
> Three entry points share a common pipeline. Modular, testable, CI-ready.

---

## Entry Points

Three distinct ways to run the system — all converge on the same core pipeline.

```mermaid
graph LR
    CLI["🖥️  main.py<br/><small>CLI · argparse</small>"]
    WEB["🌐  app.py<br/><small>Flask · port 5000</small>"]
    GUI["🪟  launcher.py<br/><small>Tkinter GUI · .exe</small>"]

    PIPE[["⚙️  Shared Pipeline"]]

    CLI --> PIPE
    WEB --> PIPE
    GUI --> PIPE

    style CLI  fill:#1A3052,stroke:#4F9EFF,color:#E8ECF4
    style WEB  fill:#1A1040,stroke:#7B61FF,color:#E8ECF4
    style GUI  fill:#3A2E0A,stroke:#F5C842,color:#E8ECF4
    style PIPE fill:#0F3024,stroke:#3ECF8E,color:#E8ECF4
```

---

## Shared Pipeline

All entry points execute these six steps in order.

```mermaid
flowchart TD
    A["📂  read_shares_from_csv()<br/><small>src/apportionment.py · csv.reader</small>"]
    B["✅  validate_csv_data()<br/><small>src/validators.py · votes ≥ 0, total > 0</small>"]
    C["🔐  encrypt_data(bytes, key)<br/><small>src/AES-256.py · AES-256-CBC + PKCS7<br/>key: os.urandom(32) · IV: os.urandom(16)</small>"]
    D["🔓  decrypt_data() — in-memory<br/><small>key never persisted to disk</small>"]
    E["📊  huntington_hill(votes, n)<br/><small>src/apportionment.py · heapq priority queue<br/>geometric mean denominator</small>"]
    F["📤  Output<br/><small>JSON response (web) · console + .enc file (CLI)</small>"]

    A --> B --> C --> D --> E --> F

    style A fill:#1A3052,stroke:#4F9EFF,color:#E8ECF4
    style B fill:#1A3052,stroke:#4F9EFF,color:#E8ECF4
    style C fill:#3A2E0A,stroke:#F5C842,color:#E8ECF4
    style D fill:#3A2E0A,stroke:#F5C842,color:#E8ECF4
    style E fill:#0F3024,stroke:#3ECF8E,color:#E8ECF4
    style F fill:#0F3024,stroke:#3ECF8E,color:#E8ECF4
```

---

## Module Map

```mermaid
graph TD
    subgraph SRC ["src/"]
        APT["apportionment.py<br/><small>huntington_hill()<br/>read_shares_from_csv()</small>"]
        APP["app.py<br/><small>Flask · GET/ · POST /upload<br/>GET /api/info</small>"]
        MAIN["main.py<br/><small>CLI entry · argparse<br/>inline encrypt/decrypt</small>"]
        AES["AES-256.py<br/><small>encrypt_data()<br/>decrypt_data()</small>"]
        VAL["validators.py<br/><small>validate_csv_data()<br/>validate_seats_allocation()</small>"]
        LOG["logging_setup.py<br/><small>file handler + console<br/>logs/app_YYYYMMDD.log</small>"]
    end

    subgraph BACK ["backend/"]
        CFG["config.py<br/><small>Dev / Prod / Test<br/>reads ENCRYPTION_KEY env</small>"]
    end

    subgraph TMPL ["templates/ + static/"]
        HTML["base.html · index.html"]
        STATIC["css/style.css · js/main.js"]
        PAGES["public/index.html<br/><small>GitHub Pages SPA</small>"]
    end

    subgraph TST ["tests/"]
        T1["test.py<br/><small>round-trip · wrong key · key length</small>"]
        T2["test_validators.py<br/><small>CSV validation edge cases</small>"]
    end

    APP --> APT
    APP --> VAL
    APP --> LOG
    MAIN --> APT
    MAIN --> AES
    CFG --> APP

    style APT  fill:#0F3024,stroke:#3ECF8E,color:#E8ECF4
    style APP  fill:#1A1040,stroke:#7B61FF,color:#E8ECF4
    style MAIN fill:#1A3052,stroke:#4F9EFF,color:#E8ECF4
    style AES  fill:#3A2E0A,stroke:#F5C842,color:#E8ECF4
    style VAL  fill:#1A3052,stroke:#4F9EFF,color:#E8ECF4
    style LOG  fill:#111520,stroke:#4A5568,color:#8892AA
    style CFG  fill:#111520,stroke:#4A5568,color:#8892AA
    style T1   fill:#111520,stroke:#4A5568,color:#8892AA
    style T2   fill:#111520,stroke:#4A5568,color:#8892AA
```

---

## Web Layer (app.py)

```mermaid
sequenceDiagram
    participant Browser
    participant Flask as app.py (Flask)
    participant Val as validators.py
    participant Alg as apportionment.py
    participant Log as logging_setup.py

    Browser->>Flask: POST /upload (CSV file + seats)
    Flask->>Log: logger.info("Processing file...")
    Flask->>Flask: parse CSV inline
    Flask->>Val: validate_csv_data(vote_data)
    Val-->>Flask: (True, "Data is valid")
    Flask->>Alg: huntington_hill(vote_data, total_seats)
    Alg-->>Flask: { Party: seats, ... }
    Flask->>Log: logger.info("Allocation successful")
    Flask-->>Browser: { success, results, votes }
```

---

## Security Model

```mermaid
flowchart LR
    subgraph KEY ["Key Management"]
        GEN["os.urandom(32)<br/><small>generate key</small>"]
        MEM["In-memory only<br/><small>never written to disk</small>"]
        GEN --> MEM
    end

    subgraph ENC ["Encryption — src/AES-256.py"]
        IV["os.urandom(16)<br/><small>fresh IV per message</small>"]
        CBC["AES-256-CBC<br/><small>encrypt</small>"]
        PAD["PKCS7 padding<br/><small>128-bit block</small>"]
        OUT2["IV + ciphertext<br/><small>prepended output</small>"]
        IV --> CBC --> PAD --> OUT2
    end

    subgraph DEC ["Decryption"]
        SPLIT["split first 16 bytes<br/><small>recover IV</small>"]
        UNPAD["remove PKCS7 padding<br/><small>ValueError on wrong key</small>"]
        PLAIN["plaintext bytes"]
        SPLIT --> UNPAD --> PLAIN
    end

    MEM --> CBC
    OUT2 --> SPLIT

    style GEN   fill:#1A3052,stroke:#4F9EFF,color:#E8ECF4
    style MEM   fill:#0F3024,stroke:#3ECF8E,color:#E8ECF4
    style CBC   fill:#3A2E0A,stroke:#F5C842,color:#E8ECF4
    style UNPAD fill:#3A2E0A,stroke:#F5C842,color:#E8ECF4
    style PLAIN fill:#0F3024,stroke:#3ECF8E,color:#E8ECF4
```

> ⚠️ **Known risk:** `main.py` CLI demo writes `key.bin` to disk.  
> In production: set `ENCRYPTION_KEY` as an environment variable and use `backend/config.py`.

---

## File Tree

```
Secure-Apportionment-System/
│
├── src/
│   ├── apportionment.py       ← core algorithm + CSV loader
│   ├── app.py                 ← Flask web entry point
│   ├── main.py                ← CLI entry point
│   ├── AES-256.py             ← encryption module
│   ├── validators.py          ← input validation
│   ├── logging_setup.py       ← logging config
│   └── __init__.py
│
├── backend/
│   ├── config.py              ← env-based config (Dev/Prod/Test)
│   ├── requirements.txt
│   └── pytest.ini
│
├── templates/
│   ├── base.html
│   └── index.html             ← Jinja2 web UI
│
├── static/
│   ├── css/style.css
│   └── js/main.js
│
├── public/
│   └── index.html             ← GitHub Pages SPA
│
├── tests/
│   ├── test.py                ← crypto round-trip tests
│   ├── test_validators.py     ← validation edge cases
│   └── __init__.py
│
├── docs/
│   ├── ARCHITECTURE.md        ← this file
│   ├── CHANGELOG.md
│   ├── ENCRYPTION.md
│   ├── THREAT_MODEL.md
│   ├── CONTRIBUTING.md
│   └── ssdlc.md
│
├── .github/workflows/
│   ├── tests.yml              ← CI on push
│   └── docker-publish.yml     ← container build
│
├── launcher.py                ← Tkinter GUI entry point
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── installer.iss              ← Inno Setup config
├── run.bat                    ← Windows launcher
└── sample_*.csv               ← 11 election scenario datasets
```

---

## Known Gaps

| # | Issue | Location | Fix |
|---|---|---|---|
| 1 | `validate_seats_allocation()` never called | `src/app.py` /upload route | Call after parsing `total_seats` |
| 2 | Duplicate crypto logic | `src/main.py` vs `src/AES-256.py` | `main.py` should import from `AES-256.py` |
| 3 | Version mismatch | `docs/CHANGELOG.md` shows `1.0.0` | Reconcile with README `v0.x` |
| 4 | CSV output not implemented | `src/main.py` | Implement or remove from docs |

---

*Rendered with [Mermaid](https://mermaid.js.org). View on GitHub for live diagrams.*
