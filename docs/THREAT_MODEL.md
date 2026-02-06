

# Threat Model

## Scope

This system provides **secure processing and fair apportionment** of parliamentary vote totals (not individual ballots). It is designed for scenarios where vote counts per party/district are sensitive but must eventually be tallied by a trusted authority.

The primary security goal is **confidentiality** of vote totals during storage or transmission, combined with **guaranteed mathematical correctness** of seat allocation.

## Trust Assumptions

The system operates under the following explicit assumptions:

1. **Trusted Decryption Authority**:
   - The entity holding the decryption key is fully trusted.
   - Decryption only occurs in a secure environment controlled by this authority.
   - If the key is compromised, confidentiality is lost.

2. **Secure Key Management**:
   - Keys are generated securely (using `os.urandom` or equivalent).
   - Keys are distributed and stored via secure channels (out of scope of this tool).

3. **Input Authenticity**:
   - Vote data input (CSV) is assumed to come from a trusted source (e.g., official election tabulation).
   - No authentication of input origin is performed.

4. **Execution Environment**:
   - The code runs on a trusted machine (no malware injecting false votes post-decryption).

## Adversary Model

### Capabilities
- Passive eavesdropper on network/storage.
- Active attacker who can read/modify encrypted data in transit or at rest.
- Insider with access to encrypted data but **not** the decryption key.

### Goals
- Learn vote totals before official release.
- Alter vote totals to change seat allocation.
- Cause denial of service or crashes.

## Protections Provided

| Threat                          | Protection                                                                 | Residual Risk                          |
|---------------------------------|----------------------------------------------------------------------------|----------------------------------------|
| Eavesdropping on vote data      | AES-256-CBC encryption (IND-CPA secure with random IV)                     | None if key remains secret             |
| Tampering with encrypted data   | Detected on decryption (invalid padding/auth failure raises exception)     | Attacker can cause DoS via corruption  |
| Incorrect seat allocation       | Unit/integration tests + mathematical properties of Huntington-Hill       | Implementation bugs (mitigated by CI)  |
| Side-channel attacks            | None (constant-time not enforced; Python implementation)                  | Timing/leakage possible in theory       |
| Key compromise                  | None (key management out of scope)                                        | Full confidentiality loss              |

## What This System Does **Not** Protect Against

- **End-to-End Verifiability**: No cryptographic proofs that the published seat allocation matches the encrypted inputs without trusting the decrypter.
- **Individual Voter Privacy**: This system processes aggregate vote totals only — it is not a full voting system.
- **Malicious Decrypter**: A corrupt tally authority could decrypt, alter votes, re-encrypt, and publish false results.
- **Supply-Chain Attacks**: Compromised dependencies or host machine.

## Future Mitigations (Optional Extensions)

- Add digital signatures on encrypted payloads for integrity/authenticity.
- Publish cryptographic commitments to encrypted ballots for public verification.
- Integrate homomorphic encryption (e.g., Paillier) for encrypted tallying.
- Use zero-knowledge proofs to prove correct apportionment without revealing votes.

This threat model is intentionally transparent: the system provides strong confidentiality under standard cryptographic assumptions, but relies on a trusted authority for final tallying — matching real-world centralized election systems.
