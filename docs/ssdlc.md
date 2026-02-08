| Phase              | Objectives                                                                 | Activities Performed in This Project                                                                 | Artifacts / Evidence                                                                 |
|--------------------|----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| Planning           | Define security goals, assess organizational posture, identify regulations | Evaluated project scope (educational proof-of-concept for election seat apportionment). Identified key risks: handling of vote data requires strong confidentiality and integrity. Selected AES-256-CBC as core protection mechanism. | Project README (security rationale) THREAT_MODEL.md SECURITY.md                 |
| Requirements       | Gather functional and security requirements                                | Defined requirements: - Confidential storage of vote counts - Accurate Huntington-Hill apportionment - No hardcoded secrets - Reproducible and testable encryption | README usage examples Explicit limitations in SECURITY.md                         |
| Design             | Architecture review, threat modeling                                       | Conducted simplified STRIDE threat modeling. Designed data flow to minimize exposure (in-memory decryption, random IVs). Chose high-level cryptographic primitives from the audited cryptography library. | THREAT_MODEL.md (data flow, threats, mitigations) Code comments on crypto choices |
| Development        | Secure coding, static analysis                                             | Implemented secure-by-default patterns: - Random IV generation - PKCS7 padding - In-memory key handling Used pinned, minimal dependencies. Followed Python best practices. | Source code in /src requirements.txt (pinned versions) Code comments         |
| Testing            | Dynamic/security testing, verification                                     | Comprehensive pytest suite covering: - Encryption/decryption round-trips - Edge cases in apportionment - Mathematical correctness Planned expansion: property-based testing (Hypothesis), input validation. | /tests directory Coverage reports (future: badge in README)                    |
| Deployment         | Secure release, configuration management                                   | GitHub Actions for automated builds and publishing. Security scanning integrated (Bandit, Safety). Reproducible environment via requirements.txt. | .github/workflows (security scans) GitHub Releases CHANGELOG.md              |
| Maintenance        | Monitoring, incident response, updates                                     | Enabled Dependabot for dependency monitoring. Defined vulnerability reporting process. Maintain changelog with security-specific entries. Ongoing threat model reviews. | SECURITY.md (reporting) CHANGELOG.md Dependabot config THREAT_MODEL.md (update commitment) |





Secure Software Development Lifecycle (SSDLC) for Secure Apportionment SystemThis document outlines the Secure Software Development Lifecycle (SSDLC) followed in the development of the Secure Apportionment System. The project integrates security practices throughout the traditional SDLC phases to ensure confidentiality, integrity, and availability of sensitive vote data processed by the system.The SSDLC approach is based on industry standards, including:Microsoft Security Development Lifecycle (SDL)
OWASP Software Assurance Maturity Model (SAMM)
NIST Secure Software Development Framework (SSDF)

Security is "shifted left" — embedded from the earliest phases and verified continuously.SSDLC Phases and Project ApplicationPhase
Objectives
Activities Performed in This Project
Artifacts / Evidence
Planning
Define security goals, assess organizational posture, identify regulations
Evaluated project scope (educational proof-of-concept for election seat apportionment).
Identified key risks: handling of vote data requires strong confidentiality and integrity.
Selected AES-256-CBC as core protection mechanism.
Project README (security rationale)
THREAT_MODEL.md
SECURITY.md
Requirements
Gather functional and security requirements
Defined requirements:
- Confidential storage of vote counts
- Accurate Huntington-Hill apportionment
- No hardcoded secrets
- Reproducible and testable encryption
README usage examples
Explicit limitations in SECURITY.md
Design
Architecture review, threat modeling
Conducted simplified STRIDE threat modeling.
Designed data flow to minimize exposure (in-memory decryption, random IVs).
Chose high-level cryptographic primitives from the audited cryptography library.
THREAT_MODEL.md (data flow, threats, mitigations)
Code comments on crypto choices
Development
Secure coding, static analysis
Implemented secure-by-default patterns:
- Random IV generation
- PKCS7 padding
- In-memory key handling
Used pinned, minimal dependencies.
Followed Python best practices.
Source code in /src
requirements.txt (pinned versions)
Code comments
Testing
Dynamic/security testing, verification
Comprehensive pytest suite covering:
- Encryption/decryption round-trips
- Edge cases in apportionment
- Mathematical correctness
Planned expansion: property-based testing (Hypothesis), input validation.
/tests directory
Coverage reports (future: badge in README)
Deployment
Secure release, configuration management
GitHub Actions for automated builds and publishing.
Security scanning integrated (Bandit, Safety).
Reproducible environment via requirements.txt.
.github/workflows (security scans)
GitHub Releases
CHANGELOG.md
Maintenance
Monitoring, incident response, updates
Enabled Dependabot for dependency monitoring.
Defined vulnerability reporting process.
Maintain changelog with security-specific entries.
Ongoing threat model reviews.
SECURITY.md (reporting)
CHANGELOG.md
Dependabot config
THREAT_MODEL.md (update commitment)

Key Security Practices ImplementedSecure-by-Design: Cryptography is core to the architecture, not an add-on.
Minimal Attack Surface: CLI tool with no network exposure, single-user focus.
Automation: CI/CD pipeline includes static analysis (Bandit) and dependency scanning (Safety).
Transparency: All security decisions are documented and verifiable.
Supply Chain Security: Pinned dependencies, automated vulnerability alerts via Dependabot.

Ongoing CommitmentsRegular review of threat model as features evolve.
Prompt application of security patches to dependencies.
Expansion of test coverage to include fuzzing and stricter input validation.
Community feedback via documented vulnerability reporting process.

This SSDLC implementation ensures the project serves as a robust, educational example of secure development practices for sensitive data processing applications.

