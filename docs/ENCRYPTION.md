# AES-256-CBC Encryption Module

This document provides detailed documentation for the AES-256-CBC encryption utility used in the **Secure Parliamentary Seat Apportionment System**. The module protects the confidentiality of sensitive vote data (e.g., vote shares or ballot counts) during storage or transmission, ensuring decryption only occurs in a trusted environment for seat apportionment.

The implementation uses the battle-tested [`cryptography`](https://cryptography.io) library's hazmat primitives for maximum security and control.

## Overview

- **Algorithm**: AES-256 (256-bit key)
- **Mode**: CBC (Cipher Block Chaining) with a random 16-byte IV per encryption
- **Padding**: PKCS7 (128-bit block size)
- **Output Format**: IV (16 bytes) prepended to ciphertext
- **Integrity Check**: Padding validation provides basic tamper detection (incorrect key or modified data raises `ValueError`)

This design delivers strong confidentiality suitable for the project's threat model: protecting vote data at rest or in transit from unauthorized parties.

## Key Features

- Random per-message IV (prevents replay and pattern attacks)
- Strict 32-byte key validation
- Secure, constant-time operations via the `cryptography` library
- Simple, bytes-based API ideal for JSON-encoded data
- Fully tested (round-trip, wrong key, invalid key length, large payloads)

## API Reference

The functions are typically defined in `crypto.py`

```python
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import os
