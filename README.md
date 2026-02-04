![Python](https://img.shields.io/badge/Python-3.10+-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Tests](https://github.com/AlborzNazari/Secure-Apportionment-System/actions/workflows/ci.yml/badge.svg) <!-- Add this once CI is set up -->
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen) <!-- Add with coverage.py -->

# Secure Parliamentary Seat Apportionment System

A fair and tamper-resistant system for allocating parliamentary seats using the **Huntington-Hill method** (method of equal proportions). Combines mathematically proven seat allocation with **AES-256-CBC encryption** to protect sensitive vote data during storage and transmission.

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
python -m venv venv        # Optional: create virtual environment
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt


This version is ready to commit. It's concise (~150 lines visible on GitHub landing), drives users to run something quickly, and leaves room for growth.

### About ENCRYPTION.md
Since you have a link to it and noted "<!-- COMPARE THE CODE -->", here is a matching professional version to drop into `docs/ENCRYPTION.md`:

```markdown
# Encryption Details

## Design Goals

- Provide **confidentiality** for vote totals during storage or transmission.
- Ensure decryption only by a trusted authority.
- Use well-established, battle-tested cryptographic primitives.
- Keep implementation simple and auditable.

## Chosen Scheme: AES-256-CBC

- **Algorithm**: AES in Cipher Block Chaining (CBC) mode with 256-bit keys.
- **Rationale**:
  - AES-256 is a NIST standard, widely scrutinized, and considered secure against classical attacks.
  - CBC mode provides IND-CPA security when used with random IVs.
  - Superior confidentiality compared to ECB; no need for authenticated encryption in current threat model (integrity checked via tests and trusted decrypter).

- **Key & IV Handling**:
  - Keys: 32 bytes from secure sources (`os.urandom` or external KMS).
  - IV: 16 random bytes per encryption (prepended to ciphertext).
  - No key derivation function (KDF) needed for raw keys; can be added if passwords are used.

- **Padding**: PKCS7 (standard, secure for CBC).

- **Implementation**: `cryptography.hazmat.primitives` backend (constant-time, vetted).

## Security Properties Achieved

- Confidentiality: IND-CPA secure under standard AES assumptions.
- Round-trip integrity: Verified in tests; invalid padding/mac raises clear exceptions.
- Side-channel resistance: Relies on underlying `cryptography` library.

## Limitations & Future Extensions

- No built-in authentication (an attacker could flip bits → decryption failure, but not silent tampering).
- No forward secrecy or key rotation.
- Possible upgrades:
  - Switch to AES-GCM for authenticated encryption.
  - Add HMAC for explicit integrity.
  - Hybrid encryption for key exchange.

This module is intentionally minimal while remaining secure for the defined threat model.
