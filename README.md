![Python](https://img.shields.io/badge/Python-3.10+-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)This repository presents a secure system for parliamentary seat apportionment using the Huntington-Hill method, a fair approach rooted in social choice theory. It combines heuristic fairness criteria (like monotonicity and neutrality) with AES-256 encryption to prevent ballot tampering, making it ideal for large-scale voting systems (e.g., 200,000 ballots). The project demonstrates algorithmic equity and cryptographic security for educational and portfolio purposes.Project Showcase  <!-- اگر GIF یا تصویری داری، جایگزین کن؛ اگر نه، یک اسکرین‌شات از کد یا خروجی اضافه کن -->FeaturesHuntington-Hill Apportionment MethodAllocates seats based on vote shares using geometric mean for priority.
Avoids paradoxes (e.g., Alabama paradox in Hamilton's method).
Satisfies fairness criteria: monotonicity, neutrality, and relative inequality reduction.
Example: For 27 seats and one-third population share, fair allocation (~9 seats) without bias.
Supports CSV input for large datasets.

AES-256 Encryption for SecurityEncrypts vote data with 32-byte keys and random IVs.
Uses CBC mode with PKCS7 padding for brute-force resistance.
Integrates with apportionment: Encrypt ballots, store securely, decrypt for trusted computation.
Handles large voter bases (100,000–200,000) to prevent cheating.

Heuristics DemonstrationCompares with other methods (Jefferson, Hamilton, Webster) to highlight superiority in social choice.
Tests edge cases: Vote share changes, seat increases, no paradoxes.
Addresses Arrow's impossibility theorem trade-offs in apportionment.

Additional ToolsReads vote shares from CSV files.
Generates secure keys with os.urandom.
Outputs results as dictionaries for easy integration.

Emergency Threshold HandlingSupports one-third quorum for sessions (e.g., national security), maintaining fairness.

InstallationTo run this system locally:bash

# Clone the repository
git clone https://github.com/AlborzNazari/Secure-Apportionment-System.git
cd Secure-Apportionment-System

# Install Python dependencies
pip install -r requirements.txt

# Install system dependencies (Ubuntu/Debian, if needed for crypto or CSV)
sudo apt update && sudo apt install python3-pip

