![Python](https://img.shields.io/badge/Python-3.10+-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
<!-- Add these once set up -->
<!-- ![Tests](https://github.com/AlborzNazari/Secure-Apportionment-System/actions/workflows/ci.yml/badge.svg) -->
<!-- ![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen) -->

<img width="1024" height="1536" alt="Theorem 1 1 The Building Block Theorem  Every positive integer can be written as a product of zero or more primes  (1)" src="https://github.com/user-attachments/assets/2d6ba598-4777-4ed1-8d73-4105cc224875" />

# Secure Parliamentary Seat Apportionment System

A fair and tamper-resistant system for allocating parliamentary seats using the **Huntington-Hill method** (method of equal proportions). It combines mathematically proven seat allocation with **AES-256-CBC encryption** to protect sensitive vote data during storage and transmission.

Suitable for large-scale elections (200,000+ ballots) and educational demonstrations of algorithmic fairness, social choice theory, and applied cryptography.

## Overview

Voting systems and decision-making theory need to be based on fair criteria. Arrow’s impossibility theorem demonstrates that no voting system can be completely fair if it has more than two candidates. We went over very classic methods: Major Method, Plurality, Plurality run-off, Instant run-off (IRV), sequential run-off, and pairwise comparison. They all can cause Pareto paradox versus Pareto efficiency or be relevant to other irrelevant alternatives and can alter the result. For example, one candidate’s resignation may cause another candidate to directly win, or if all voters prefer A over B, the latter should not get outdone by any chance. These laws create fairness criteria in real cases of parliaments or presidential candidacy. We see probabilistic strategic voting, pinpointing the weakness of each old-fashioned method to prevent unwanted outcomes. On topics like social choice theory, direct study of psychology as well as statistical contemplation is essential to understand how individual or collective choice can affect the result. 

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

## Community

- [Code of Conduct](./docs/CODE_OF_CONDUCT.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)

## Quick Start

```bash
git clone https://github.com/AlborzNazari/Secure-Apportionment-System.git
cd Secure-Apportionment-System
python -m venv venv                  # Optional: create virtual environment
source venv/bin/activate             # On Windows: venv\Scripts\activate
pip install -r requirements.txt




pip install -r requirements.txt      # ← This installs cryptography + pytest
pytest                               # Now tests run perfectly


