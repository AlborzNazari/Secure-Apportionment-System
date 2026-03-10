# Secure Apportionment System

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-lightgrey)
![Encryption](https://img.shields.io/badge/Encryption-AES--256--CBC-green)
![Algorithm](https://img.shields.io/badge/Algorithm-Huntington--Hill-orange)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Tests](https://github.com/AlborzNazari/Secure-Apportionment-System/actions/workflows/tests.yml/badge.svg)

A secure parliamentary seat apportionment tool that implements the **Huntington-Hill** algorithm with **AES-256-CBC** encryption. Supports both a command-line interface and a web-based interface via Flask.

---

## What It Does

This system takes a CSV file of political parties and their vote counts, then fairly distributes a given number of parliamentary seats using the Huntington-Hill method — the same method used in the U.S. House of Representatives. Results are encrypted with AES-256 before being saved to disk, ensuring data integrity and confidentiality.

---

## Project Structure

```
Secure-Apportionment-System/
├── src/
│   ├── main.py              # CLI entry point with AES-256 encryption
│   ├── app.py               # Flask web application
│   ├── apportionment.py     # Huntington-Hill algorithm
│   ├── validators.py        # Input validation
│   ├── logging_setup.py     # Secure logging
│   ├── AES-256.py           # Standalone AES-256-CBC encryption module
│   └── __init__.py
├── backend/
│   ├── config.py            # Environment-based configuration
│   ├── requirements.txt     # Backend dependencies
│   └── pytest.ini
├── templates/
│   ├── base.html
│   └── index.html
├── static/
│   ├── css/style.css
│   └── js/main.js
├── tests/
│   ├── test.py
│   └── test_validators.py
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ENCRYPTION.md
│   ├── THREAT_MODEL.md
│   └── CHANGELOG.md
├── requirements.txt         # Root dependencies
└── index.html               # Static frontend
```

---

🔗 **Visual Doc** [Secure Apportionment System](https://secure-apportionment-system.pages.dev/)


<img width="524" height="786" alt="523" src="https://github.com/user-attachments/assets/2a98c912-5a9d-43a3-bd09-161293431939" 


## Requirements

- Python 3.10 or higher
- pip

> **Windows users:** Do NOT use the Microsoft Store version of Python. Download the official installer from [python.org](https://python.org/downloads) and check **"Add Python to PATH"** during installation.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/AlborzNazari/Secure-Apportionment-System.git
cd Secure-Apportionment-System
```

### 2. Create and activate a virtual environment

**Windows (PowerShell):**
```powershell
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

Install the root dependencies:
```bash
pip install -r requirements.txt
```

Install the backend dependencies:
```bash
pip install -r backend/requirements.txt
```

> **Note:** The backend `requirements.txt` includes both `Flask` and `FastAPI`. The current application uses Flask. FastAPI and uvicorn are listed for future API development but are not required to run the app today.

---

## Preparing Your Input CSV

The system requires a CSV file with exactly two columns: `Group` and `Votes`.

**Create a sample file** by saving the following as `sample_data.csv` in the project root:

```
Group,Votes
Party_A,50000
Party_B,30000
Party_C,15000
Party_D,5000
```

> **Important — Windows PowerShell users:** Do NOT use the `echo` command to create CSV files in PowerShell. It adds invisible Unicode characters that break the CSV parser and cause empty results (`{}`). Instead, create the file using Notepad or run:

```powershell
Set-Content -Path "sample_data.csv" -Value "Group,Votes`nParty_A,50000`nParty_B,30000`nParty_C,15000`nParty_D,5000" -Encoding UTF8
```

**CSV rules:**
- First row must be the header: `Group,Votes`
- Group names must not contain commas
- Vote values must be whole positive numbers (no decimals)
- Rows with invalid values are silently skipped

---

## Running the Application

### Option 1 — Command Line (CLI)

Run from the **project root** directory (not from inside `src/` or `backend/`):

```bash
python -m src.main --seats 10 sample_data.csv
```

**Arguments:**

| Argument | Required | Description |
|---|---|---|
| `csv_file` | Yes | Path to your CSV file |
| `--seats` | Yes | Total seats to allocate |
| `--output` | No | Output filename base (default: `results.json`) |

**Example with custom output name:**
```bash
python -m src.main --seats 100 sample_data.csv --output election_results
```

**Expected output:**
```
Apportionment Results:
{'Party_A': 50, 'Party_B': 30, 'Party_C': 15, 'Party_D': 5}
Encrypted results saved to results.json.enc
Key saved to key.bin (keep secure!)
```

**Output files generated:**
- `results.json.enc` — AES-256 encrypted results
- `key.bin` — Encryption key (keep this secure; do not commit to Git)

### Option 2 — Web Interface (Flask)

Run from the **project root**:

```bash
python -m src.app
```

Then open your browser and go to: [http://127.0.0.1:5000](http://127.0.0.1:5000)

Upload your CSV file through the web form and enter the total number of seats to allocate.

---

## Running Tests

```bash
pytest tests/
```

---

## Known Issues & Bugs

**1. Empty results `{}` from CLI**

If you see `Apportionment Results: {}`, your CSV was not parsed correctly. This is almost always caused by PowerShell adding a UTF-16 BOM or extra formatting when creating the file with `echo`. Use `Set-Content` with `-Encoding UTF8` instead (see CSV section above).

**2. `ModuleNotFoundError: No module named 'src'`**

You are running the script from inside `src/` or `backend/`. Always run from the project root:
```bash
cd Secure-Apportionment-System
python -m src.main ...
```

**3. `app.py` imports `allocate_seats` which does not exist**

`src/app.py` imports `from src.apportionment import allocate_seats`, but the actual function in `apportionment.py` is named `huntington_hill`. Running `app.py` will raise an `ImportError`. Fix by updating the import in `app.py`:
```python
from src.apportionment import huntington_hill as allocate_seats
```

**4. `key.bin` and `results.json.enc` committed to Git**

These files are generated at runtime and should not be in version control. Add them to `.gitignore`:
```
key.bin
*.enc
logs/
```

**5. Default encryption key warning**

If `ENCRYPTION_KEY` is not set in your environment, the system uses a hardcoded default and prints a warning. For any real use, set the key in a `.env` file:
```
ENCRYPTION_KEY=your-random-secret-key-here
```

---

## Dependencies

### Root `requirements.txt`

| Package | Version | Purpose |
|---|---|---|
| `cryptography` | 41.0.7 | AES-256-CBC encryption |
| `Flask` | 3.0.0 | Web interface |
| `pytest` | 7.4.3 | Testing |
| `pandas` | >=2.2.3 | Data handling (available but not currently used in core logic) |

### `backend/requirements.txt`

| Package | Version | Purpose |
|---|---|---|
| `Flask` | 3.0.0 | Web interface (active) |
| `cryptography` | 41.0.7 | Encryption (active) |
| `pytest` | 7.4.3 | Testing (active) |
| `fastapi` | 0.109.0 | Future REST API (not yet used) |
| `uvicorn` | 0.27.0 | Future ASGI server for FastAPI (not yet used) |
| `pydantic` | 2.11.7 | Future data validation for FastAPI (not yet used) |

> `python-dotenv` is used in `backend/config.py` but is not listed in either `requirements.txt`. Install it manually until this is fixed:
> ```bash
> pip install python-dotenv
> ```

---

## Security Notes

- The `key.bin` file contains your AES-256 encryption key. Never commit it to a repository.
- In production, store the encryption key as an environment variable (`ENCRYPTION_KEY`), not in a file.
- Logging is configured to never record sensitive data.
- The system is intended for development and research use. A production deployment would require additional hardening (HTTPS, key management infrastructure, authentication).

---



## Community

- [Code of Conduct](./docs/CODE_OF_CONDUCT.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)
- [Security Practices](./docs/SECURITY.md)


## License

See [LICENSE](LICENSE) for details.

<img width="524" height="786" alt="524" src="https://github.com/user-attachments/assets/2bde949c-e5b6-4671-8039-8d194b2b662b" />

