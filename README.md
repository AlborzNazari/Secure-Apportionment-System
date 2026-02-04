![Python](https://img.shields.io/badge/Python-3.10+-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
<!-- Add these once set up -->
<!-- ![Tests](https://github.com/AlborzNazari/Secure-Apportionment-System/actions/workflows/ci.yml/badge.svg) -->
<!-- ![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen) -->

# Secure Parliamentary Seat Apportionment System

A fair and tamper-resistant system for allocating parliamentary seats using the **Huntington-Hill method** (method of equal proportions). It combines mathematically proven seat allocation with **AES-256-CBC encryption** to protect sensitive vote data during storage and transmission.

Suitable for large-scale elections (200,000+ ballots) and educational demonstrations of algorithmic fairness, social choice theory, and applied cryptography.

## Key Features

- **Huntington-Hill Apportionment**
  - Geometric mean priority calculation.
  - Proven avoidance of paradoxes (e.g., Alabama paradox).
  - Satisfies house monotonicity and minimizes relative inequality.
  - Supports emergency one-third quorum thresholds.

- **AES-256-CBC Encryption**
  - 32-byte keys, random IVs, PKCS7 padding.
  - Brute-force resistant; secure round-trip verified in tests.
  - Enables confidential handling until trusted decryption.

- **Practical & Testable**
  - CSV input for real-world vote datasets.
  - Comprehensive pytest suite (encryption integrity, edge cases, mathematical correctness).
  - Pure Python, cross-platform (Windows/Linux).

## Quick Start

```bash
git clone https://github.com/AlborzNazari/Secure-Apportionment-System.git
cd Secure-Apportionment-System
python -m venv venv                  # Optional: create virtual environment
source venv/bin/activate             # On Windows: venv\Scripts\activate
pip install -r requirements.txt




pip install -r requirements.txt      # ← This installs cryptography + pytest
pytest                               # Now tests run perfectly


