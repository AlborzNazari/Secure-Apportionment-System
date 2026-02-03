![Python](https://img.shields.io/badge/Python-3.10+-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

# Secure Parliamentary Seat Apportionment System

A fair and tamper-resistant system for allocating parliamentary seats using the **Huntington-Hill method** (also known as the method of equal proportions). It combines mathematically sound apportionment with **AES-256-CBC encryption** to protect vote data, suitable for large-scale elections (e.g., 200,000+ ballots).

Ideal for educational demonstrations of social choice theory, algorithmic fairness, and cryptographic security.

## Key Features

- **Huntington-Hill Apportionment**
  - Uses geometric mean priority for seat allocation.
  - Avoids paradoxes (e.g., Alabama paradox).
  - Satisfies house monotonicity, neutrality, and reduces relative inequality.
  - Supports emergency one-third quorum thresholds.
  - Compares favorably with Jefferson, Hamilton, and Webster methods.

- **AES-256-CBC Security**
  - Encrypts vote shares/ballots with 32-byte keys and random IVs.
  - PKCS7 padding and brute-force-resistant design.
  - Enables secure storage/transmission; decrypt only for trusted computation.

- **Practical Tools**
  - CSV input for large vote datasets.
  - Secure key generation (`os.urandom`).
  - Output as dictionaries for easy integration.
  - Comprehensive pytest suite (round-trip encryption, edge cases, paradoxes).

## Installation

```bash
git clone https://github.com/AlborzNazari/Secure-Apportionment-System.git
cd Secure-Apportionment-System
pip install -r requirements.txt   # Includes cryptography and any others


This version is focused, scannable, and professional. It integrates the encryption naturally without duplicating content. If you want to keep more technical depth on the crypto module, add a separate `docs/ENCRYPTION.md` and link to it.

Let me know if you'd like further tweaks!
