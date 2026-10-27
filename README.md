# AICTE APAAR National Integrity & Student Data Management Platform

> **Smart India Hackathon 2026** — Problem Statement **26263**  
> AICTE: APAAR ID-based student data management and verification platform.

---

## 1. Overview & Architecture Foundation

The **Unified APAAR Integrity Platform** combines the best compatible features from all five source repositories into a cohesive, high-performance digital service:

- **Primary Frontend Foundation**: Built directly on **Repository 2** (`shindesiddhant-415/SIH-2026-PSS26263`). Preserves the official AICTE bilingual header, Indian national tricolor accent bar, institutional branding (`#0F2C61` navy, `#D97706` saffron), and navigation structure.
- **Card-Reduction Modernization**: Refactored away excessive floating cards, rounded boxes, and repetitive grids into clean, aligned **Metric Ribbons**, structured tables, and chronological process timelines.
- **Natural Government Typography**: Adopts **Noto Sans** and **Inter** with natural letterforms, standard font weights, and comfortable line spacing.
- **Unified Backend Engine**: High-performance FastAPI server with a persistent SQLite database, Machine Learning Isolation Forest anomaly scoring (Repo 1), privacy-preserving Blind Match fuzzy deduplication (Repo 1), multi-channel CSV ingestion (Repo 5), and a SHA-256 tamper-evident hash-chained audit ledger.

---

## 2. Integrated Feature Portfolio

### From Repository 2 (Primary Frontend Foundation)
- Official AICTE bilingual header with emblem circle, Ministry of Education tagline, and active National Gateway status.
- Student Portal verification interface with Aadhaar e-KYC, ABC depository, and official verifiable pass certificate.
- College Admin portal with institutional sign-in, Google authentication simulation, and student registry.
- AICTE Super Admin dashboard with Pan-India state-wise verification comparative bar chart and master college compliance table.
- AICTE Sahayak virtual helpdesk widget.

### From Repository 1 (Advanced Integrity & Cryptography)
- **Seat Ledger Quota Pools**: Demarcation of approved intake into `Regular Sanctioned`, `TFW Supernumerary (5%)`, `NRI Quota`, and `FN/OCI/PIO` pools with automatic overrun detection.
- **AICTE Regulatory Exception Review Queue**: Administrative queue for intake overruns, cross-institution duplicate admissions, and student disputes with mandatory rationale notes.
- **Machine Learning Isolation Forest Anomaly Engine**: Scikit-Learn Isolation Forest scoring combined with rule signals yielding a 0–100 institutional Integrity Score.
- **Cryptographic SHA-256 Hash-Chained Audit Ledger**: Every state mutation is cryptographically linked (`current_hash = SHA256(prev_hash + ...)`); provides a live 1-click chain re-verification tool to prove zero tampering.
- **Privacy-Preserving Blind Match**: Cross-institution fuzzy duplicate detection using HMAC-SHA256 Bloom filter representations and Dice similarity coefficients without sharing raw PII.

### From Repository 4 & 5 (Validation & Ingestion)
- Multi-channel CSV batch validation engine with loose column header mapping.
- Template download (`AICTE_APAAR_Bulk_Enrolment_Template.csv`) and sample CSV payload ingestion.
- Pre-validation checks for 12-digit numeric APAAR format, provisional opt-out IDs (`PROV-COL001-xxx`), and sanctioned intake boundaries.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Angular 21, TypeScript, Vanilla CSS Design System, Google Fonts (Noto Sans & Inter) |
| **Backend API** | Python 3, FastAPI, Pydantic, Uvicorn |
| **Persistence** | SQLite with ACID transactions, relational foreign keys, auto-seeding |
| **Anomaly Engine** | Scikit-Learn (`IsolationForest`), NumPy, Pandas |
| **Cryptography** | SHA-256 hash-chaining, HMAC-SHA256, Bloom filters |
| **Testing** | Pytest, FastAPI TestClient, Angular CLI Build Engine |

---

## 4. Quick Start & Execution Instructions

### Prerequisites
- Node.js (v18+) & npm
- Python (3.10+)

### 1. Start the Backend API Server
```bash
cd apaar-unified-platform/backend
# (Optional) python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8085 --reload
```
- API Base URL: `http://127.0.0.1:8085`
- Interactive Swagger API Documentation: `http://127.0.0.1:8085/docs`
- Health Check: `http://127.0.0.1:8085/api/health`

### 2. Start the Frontend Application
```bash
cd apaar-unified-platform/frontend
npm install
npx ng serve --host 127.0.0.1 --port 4200
```
- Open browser at: `http://127.0.0.1:4200`

---

## 5. Verification Test Presets

| Preset APAAR ID | Status | Test Case Description |
|---|---|---|
| `123456789012` | **VERIFIED** | Aarav Sharma (B.Tech CSE, DIET). Normal valid record with 42 ABC credits. |
| `100000000013` | **PENDING** | Priya Patel (B.Tech IT). Pending biometric sync from DigiLocker. |
| `100000000005` | **DUPLICATE** | Mohammad Farhan Akhtar. Concurrent active admission at Delhi Inst and UP Council. |
| `100000000012` | **DUPLICATE** | Ananya Banerjee. Dual admission logged across Delhi and Bangalore portals. |
| `APAAR12345678` | **LEGACY** | Rohan Mehta. Legacy format verified record. |
| `PROV-COL001-001`| **PROVISIONAL**| Arjun Prasad. Student opted out of APAAR; assigned statutory provisional ID. |

---

## 6. Testing & Quality Verification

Run the automated backend test suite:
```bash
cd apaar-unified-platform/backend
python -m pytest test_platform.py -v
```
All 9 test cases validate:
1. Health and root status
2. Known student lookup and DigiLocker metadata
3. Non-existent student handling (404)
4. Interactive verification / rejection status updates with audit log appending
5. College stats and intake variance calculation
6. Seat ledger quota pool distributions
7. Cryptographic SHA-256 audit chain verification
8. Isolation Forest anomaly scoring
9. Compliance report CSV export

Build the frontend bundle for production:
```bash
cd apaar-unified-platform/frontend
npx ng build
```
Production build bundles to `dist/frontend` with zero compilation errors.
