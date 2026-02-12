![Python](https://img.shields.io/badge/Python-3.10+-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Tests](https://github.com/AlborzNazari/Secure-Apportionment-System/actions/workflows/tests.yml/badge.svg)
<!-- Add these once set up -->
<!-- ![Tests](https://github.com/AlborzNazari/Secure-Apportionment-System/actions/workflows/ci.yml/badge.svg) -->
<!-- ![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen) -->

<img width="524" height="786" alt="523" src="https://github.com/user-attachments/assets/2a98c912-5a9d-43a3-bd09-161293431939" />



# 🏛️ Secure Parliamentary Seat Apportionment System

A **fair, transparent, and secure** system for allocating parliamentary seats using the mathematically proven **Huntington-Hill method** combined with **AES-256-CBC encryption**.

> **Perfect for:** Large-scale elections (200,000+ ballots), government applications, and educational demonstrations.

---

## 📖 Overview

Voting systems and decision-making theory need to be based on fair criteria. **Arrow's impossibility theorem** demonstrates that no voting system can be completely fair if it has more than two candidates. 

We evaluated classic methods: Majority Method, Plurality, Plurality run-off, Instant run-off (IRV), sequential run-off, and pairwise comparison. They all can cause:
- **Pareto paradox** vs Pareto efficiency issues
- **Independence of irrelevant alternatives** violations
- **Strategic voting problems**

These theoretical problems have real-world consequences in parliaments and presidential elections. Our system uses the **Huntington-Hill method** because it:
- ✅ Avoids the Alabama Paradox
- ✅ Satisfies house monotonicity
- ✅ Minimizes relative inequality
- ✅ Used by the U.S. House of Representatives

---

## ✨ Key Features

- **🎯 Huntington-Hill Apportionment**
  - Geometric mean priority calculation
  - Proven avoidance of paradoxes (Alabama, Population, New States)
  - Satisfies house monotonicity and minimizes relative inequality
  - Supports emergency one-third quorum thresholds

- **🔐 AES-256-CBC Encryption**
  - Military-grade encryption (256-bit keys)
  - Random IVs, PKCS7 padding
  - Brute-force resistant
  - Secure round-trip verified in tests
  - Enables confidential handling until trusted decryption

- **🖥️ User-Friendly Web Interface**
  - Drag-and-drop CSV upload
  - Real-time results dashboard
  - Visual fairness comparison
  - Vote-to-seat ratio analysis

- **✅ Comprehensive Testing**
  - Unit tests with encryption integrity checks
  - Input validation tests
  - Edge case coverage
  - Automated CI/CD pipeline
  - Pure Python, cross-platform (Windows/Linux/macOS)

## 📚 Community

- [Code of Conduct](./docs/CODE_OF_CONDUCT.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)
- [Security Practices](./docs/SECURITY.md)

<img width="524" height="786" alt="524" src="https://github.com/user-attachments/assets/2bde949c-e5b6-4671-8039-8d194b2b662b" />

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- pip (Python package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/AlborzNazari/Secure-Apportionment-System.git
cd Secure-Apportionment-System

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
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

<img width="524" height="786" alt="524" src="https://github.com/user-attachments/assets/2bde949c-e5b6-4671-8039-8d194b2b662b" />


## Quick Start

```bash
git clone https://github.com/AlborzNazari/Secure-Apportionment-System.git
cd Secure-Apportionment-System
python -m venv venv                  # Optional: create virtual environment
source venv/bin/activate             # On Windows: venv\Scripts\activate
pip install -r requirements.txt






pip install -r requirements.txt      # ← This installs cryptography + pytest
pytest                               # Now tests run perfectly


