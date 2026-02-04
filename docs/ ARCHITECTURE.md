# Project Architecture

## Overview

The Secure Apportionment System is a Python-based tool designed to process parliamentary vote data securely and allocate seats fairly using the Huntington-Hill method (method of equal proportions). The system prioritizes:

- **Confidentiality**: Vote totals are encrypted at rest and in transit.
- **Correctness**: The apportionment algorithm is mathematically verified to avoid paradoxes (e.g., Alabama paradox) and matches official methods.
- **Simplicity & Transparency**: The code is modular, well-tested, and intended for educational/demonstration purposes.

The architecture follows a linear pipeline with clear separation of concerns:

1. **Input Handling** – Read vote data (typically from CSV).
2. **Encryption Layer** – Encrypt vote totals for confidentiality.
3. **Secure Storage/Transmission** – Encrypted data can be stored or sent securely.
4. **Decryption Layer** – Decrypt only when needed for tallying (assumes trusted authority).
5. **Apportionment Engine** – Compute seat allocation using Huntington-Hill.
6. **Output** – Return seat allocations (JSON, console, or file).

## High-Level Flow Diagram

graph TD
    subgraph Input
        A["Vote Data Source\n(CSV file with party votes)"] --> B["Load & Validate Data\n(src/io.py)"]
    end

    subgraph Encryption
        B --> C["Generate Key & IV\n(src/encryption.py)"]
        C --> D["Encrypt Vote Totals\nAES-256-CBC + PKCS7"]
        D --> E["Serialized Encrypted Payload\n(Base64 or file)"]
    end

    subgraph "Secure Handling"
        E --> F["Store / Transmit Encrypted Data\n(File, DB, Network)"]
    end

    subgraph "Decryption & Processing"
        F --> G["Decrypt Payload\n(Requires secret key)"]
        G --> H["Reconstruct Vote Totals\n(Plaintext dictionary)"]
    end

    subgraph Apportionment
        H --> I["Apply Huntington-Hill Method\n(src/apportionment.py)\nIterative priority calculation"]
        I --> J["Avoid paradoxes via\nmathematical guarantees + tests"]
    end

    subgraph Output
        J --> K["Seat Allocation Results\n(JSON, console, or CSV)"]
        K --> L["Optional: Verification Report\n(Re-run on known data)"]
    end

    style A fill:#e1f5fe
    style K fill:#e8f5e8
    style F fill:#fff3e0

##    Fix Mermaid diagram syntax for GitHub rendering


