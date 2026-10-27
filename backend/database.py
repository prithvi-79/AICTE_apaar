import sqlite3
import os
import json
from datetime import datetime
import hashlib

DB_PATH = os.path.join(os.path.dirname(__file__), "apaar_platform.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Colleges / Institutions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS colleges (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        state TEXT NOT NULL,
        city TEXT NOT NULL,
        approvedIntake INTEGER NOT NULL,
        actualEnrolment INTEGER NOT NULL,
        verifiedCount INTEGER NOT NULL,
        pendingCount INTEGER NOT NULL,
        duplicateCount INTEGER NOT NULL,
        supernumeraryQuota INTEGER NOT NULL DEFAULT 0,
        nriCount INTEGER NOT NULL DEFAULT 0,
        fnCount INTEGER NOT NULL DEFAULT 0,
        integrityScore REAL NOT NULL DEFAULT 100.0,
        status TEXT NOT NULL DEFAULT 'Approved'
    )
    """)

    # Students table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        apaarId TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        dob TEXT NOT NULL,
        gender TEXT NOT NULL,
        mobile TEXT NOT NULL,
        aadhaarLast4 TEXT NOT NULL,
        collegeId TEXT NOT NULL,
        collegeName TEXT NOT NULL,
        course TEXT NOT NULL,
        academicYear INTEGER NOT NULL,
        abcCredits INTEGER NOT NULL DEFAULT 0,
        tenthPercent REAL NOT NULL DEFAULT 0.0,
        twelfthPercent REAL NOT NULL DEFAULT 0.0,
        status TEXT NOT NULL DEFAULT 'pending',
        category TEXT NOT NULL DEFAULT 'General',
        enrollmentNo TEXT NOT NULL DEFAULT '',
        admissionDate TEXT NOT NULL DEFAULT '',
        digilockerVerified INTEGER NOT NULL DEFAULT 1,
        state TEXT NOT NULL DEFAULT 'Delhi',
        duplicateCollegeName TEXT,
        duplicateCollegeId TEXT,
        flagReason TEXT,
        guardianName TEXT,
        isProvisional INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (collegeId) REFERENCES colleges(id)
    )
    """)

    # Hash-Chained Audit Ledger table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eventIndex INTEGER NOT NULL UNIQUE,
        timestamp TEXT NOT NULL,
        actor TEXT NOT NULL,
        role TEXT NOT NULL,
        action TEXT NOT NULL,
        apaarId TEXT NOT NULL,
        studentName TEXT NOT NULL,
        details TEXT NOT NULL,
        ipAddress TEXT NOT NULL,
        prevHash TEXT NOT NULL,
        currentHash TEXT NOT NULL
    )
    """)

    # Seat Ledger Quota Pools table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS seat_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collegeId TEXT NOT NULL,
        academicYear INTEGER NOT NULL,
        course TEXT NOT NULL,
        quotaType TEXT NOT NULL, -- regular, tfw, fn_oci_pio, nri
        approvedSeats INTEGER NOT NULL,
        allocatedSeats INTEGER NOT NULL,
        overrunCount INTEGER NOT NULL DEFAULT 0
    )
    """)

    # Exception Review Cases table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS review_cases (
        id TEXT PRIMARY KEY,
        caseType TEXT NOT NULL, -- OVER_INTAKE, CROSS_INSTITUTION_DUPLICATE, BLIND_MATCH_CONFLICT, STUDENT_DISPUTE
        institutionId TEXT NOT NULL,
        institutionName TEXT NOT NULL,
        apaarId TEXT NOT NULL,
        studentName TEXT NOT NULL,
        details TEXT NOT NULL,
        severity TEXT NOT NULL, -- CRITICAL, HIGH, MEDIUM
        status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, APPROVED, REJECTED
        createdAt TEXT NOT NULL,
        decidedBy TEXT,
        decisionNote TEXT,
        decidedAt TEXT
    )
    """)

    # Submission Windows table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS submission_windows (
        academicYear TEXT PRIMARY KEY,
        status TEXT NOT NULL, -- OPEN, LOCKED
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        cutoffDate TEXT NOT NULL
    )
    """)

    # Check if colleges exist, if not seed initial demo data
    cursor.execute("SELECT COUNT(*) as count FROM colleges")
    if cursor.fetchone()["count"] == 0:
        seed_initial_data(cursor)

    conn.commit()
    conn.close()

def compute_hash(prev_hash: str, timestamp: str, actor: str, action: str, apaar_id: str, details: str) -> str:
    payload = f"{prev_hash}|{timestamp}|{actor}|{action}|{apaar_id}|{details}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()

def seed_initial_data(cursor):
    colleges_data = [
        ("COL001", "Delhi Institute of Engineering & Technology", "AICTE-DL-0012", "Delhi", "New Delhi", 1200, 1240, 980, 200, 60, 45, 24, 8, 86.4, "Under Audit"),
        ("COL002", "Pune Institute of Engineering & Technology", "AICTE-MH-0045", "Maharashtra", "Pune", 800, 790, 710, 75, 5, 40, 12, 4, 98.2, "Approved"),
        ("COL003", "Bangalore Institute of Technology", "AICTE-KA-0089", "Karnataka", "Bengaluru", 1000, 1020, 890, 110, 20, 50, 18, 6, 92.5, "Under Audit"),
        ("COL004", "Chennai National Engineering College", "AICTE-TN-0112", "Tamil Nadu", "Chennai", 900, 885, 830, 50, 5, 45, 10, 2, 99.1, "Approved"),
        ("COL005", "UP Council Institute of Technology", "AICTE-UP-0231", "Uttar Pradesh", "Lucknow", 1100, 1145, 920, 180, 45, 55, 15, 5, 84.0, "Under Audit"),
        ("COL006", "Gujarat Technological College", "AICTE-GJ-0078", "Gujarat", "Ahmedabad", 750, 740, 690, 45, 5, 35, 8, 2, 97.8, "Approved"),
        ("COL007", "Kolkata Institute of Science & Technology", "AICTE-WB-0144", "West Bengal", "Kolkata", 850, 860, 780, 70, 10, 40, 11, 3, 94.6, "Approved"),
        ("COL008", "Hyderabad Technical University College", "AICTE-TG-0320", "Telangana", "Hyderabad", 950, 950, 890, 55, 5, 45, 14, 5, 98.5, "Approved"),
    ]

    cursor.executemany("""
    INSERT INTO colleges (id, name, code, state, city, approvedIntake, actualEnrolment, verifiedCount, pendingCount, duplicateCount, supernumeraryQuota, nriCount, fnCount, integrityScore, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, colleges_data)

    students_data = [
        # Verified Presets
        ("123456789012", "Aarav Sharma", "2004-05-14", "Male", "9876543210", "4321", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Computer Science & Engineering", 2026, 42, 94.5, 92.0, "verified", "General", "2024-ADM-092", "2026-07-15", 1, "Delhi", None, None, None, "Rajesh Sharma", 0),
        ("100000000013", "Priya Patel", "2005-02-20", "Female", "9876543211", "8821", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Information Technology", 2026, 36, 89.0, 88.5, "pending", "OBC", "2024-ADM-114", "2026-07-22", 1, "Delhi", None, None, "DigiLocker Verification Awaiting Institutional Biometric Sync", "Kishore Patel", 0),
        # Duplicate Conflicts
        ("100000000005", "Mohammad Farhan Akhtar", "2004-08-11", "Male", "9876543212", "9912", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Mechanical Engineering", 2026, 28, 86.0, 84.0, "duplicate", "General", "2024-ADM-201", "2026-07-10", 1, "Delhi", "UP Council Institute of Technology", "COL005", "Concurrent seat allocated at UP Council Institute of Technology (AICTE-UP-0231)", "Farooq Akhtar", 0),
        ("100000000012", "Ananya Banerjee", "2004-11-03", "Female", "9876543213", "1209", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Computer Science & Engineering", 2026, 40, 96.0, 94.2, "duplicate", "General", "2024-ADM-045", "2026-07-08", 1, "Delhi", "Bangalore Institute of Technology", "COL003", "Simultaneous full-time admission recorded at Bangalore Institute of Technology (AICTE-KA-0089)", "Subhash Banerjee", 0),
        # Legacy Preset
        ("APAAR12345678", "Rohan Mehta", "2003-12-19", "Male", "9876543214", "7731", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Electronics & Communication", 2025, 64, 91.2, 89.0, "verified", "General", "2023-ADM-302", "2025-08-01", 1, "Delhi", None, None, None, "Vipin Mehta", 0),
        # Additional Diverse Student Records
        ("100000000001", "Neha Verma", "2005-01-12", "Female", "9811223344", "3124", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Computer Science & Engineering", 2026, 38, 92.4, 91.0, "verified", "OBC", "2024-ADM-018", "2026-07-12", 1, "Delhi", None, None, None, "Ramesh Verma", 0),
        ("100000000002", "Karan Singhania", "2004-09-25", "Male", "9822334455", "5412", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Civil Engineering", 2026, 32, 85.5, 83.2, "verified", "General", "2024-ADM-052", "2026-07-14", 1, "Delhi", None, None, None, "Alok Singhania", 0),
        ("100000000003", "Divya Nair", "2005-04-18", "Female", "9833445566", "7621", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Information Technology", 2026, 44, 95.0, 93.6, "verified", "General", "2024-ADM-079", "2026-07-15", 1, "Delhi", None, None, None, "Suresh Nair", 0),
        ("100000000004", "Vikramaditya Rao", "2004-03-30", "Male", "9844556677", "9812", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Mechanical Engineering", 2026, 30, 81.0, 79.5, "pending", "SC", "2024-ADM-140", "2026-07-28", 1, "Delhi", None, None, "Pending State Scholarship Category Verification", "Anand Rao", 0),
        ("100000000006", "Siddharth Deshmukh", "2004-07-07", "Male", "9855667788", "2345", "COL002", "Pune Institute of Engineering & Technology", "B.Tech Computer Science & Engineering", 2026, 40, 93.5, 91.8, "verified", "General", "2024-PIET-011", "2026-07-18", 1, "Maharashtra", None, None, None, "Ganesh Deshmukh", 0),
        ("100000000007", "Meera Kulkarni", "2005-06-15", "Female", "9866778899", "6789", "COL002", "Pune Institute of Engineering & Technology", "B.Tech Information Technology", 2026, 42, 94.0, 92.5, "verified", "EWS", "2024-PIET-025", "2026-07-19", 1, "Maharashtra", None, None, None, "Prashant Kulkarni", 0),
        ("100000000008", "Tanvi Joshi", "2004-10-10", "Female", "9877889900", "4567", "COL003", "Bangalore Institute of Technology", "B.Tech Computer Science & Engineering", 2026, 40, 96.5, 95.0, "verified", "General", "2024-BIT-008", "2026-07-05", 1, "Karnataka", None, None, None, "Raghavendra Joshi", 0),
        ("100000000009", "Aditya Swaminathan", "2004-12-01", "Male", "9888990011", "8901", "COL004", "Chennai National Engineering College", "B.Tech Electronics & Communication", 2026, 46, 97.2, 96.0, "verified", "General", "2024-CNEC-034", "2026-07-02", 1, "Tamil Nadu", None, None, None, "K. Swaminathan", 0),
        ("100000000010", "Zoya Khan", "2005-03-14", "Female", "9899001122", "1122", "COL005", "UP Council Institute of Technology", "B.Tech Computer Science & Engineering", 2026, 34, 88.5, 87.0, "rejected", "OBC", "2024-UP-088", "2026-07-11", 1, "Uttar Pradesh", None, None, "Intake quota overrun rejected by administrative scrutiny", "Tariq Khan", 0),
        ("PROV-COL001-001", "Arjun Prasad", "2005-08-22", "Male", "9800112233", "9012", "COL001", "Delhi Institute of Engineering & Technology", "B.Tech Civil Engineering", 2026, 12, 82.0, 80.5, "pending", "ST", "2024-ADM-310", "2026-08-02", 0, "Delhi", None, None, "APAAR Opt-Out: Provisional Identifier assigned under Section 8(b)", "Hari Prasad", 1),
    ]

    cursor.executemany("""
    INSERT INTO students (apaarId, name, dob, gender, mobile, aadhaarLast4, collegeId, collegeName, course, academicYear, abcCredits, tenthPercent, twelfthPercent, status, category, enrollmentNo, admissionDate, digilockerVerified, state, duplicateCollegeName, duplicateCollegeId, flagReason, guardianName, isProvisional)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, students_data)

    # Initial Audit Ledger with cryptographic chain
    genesis_hash = "0000000000000000000000000000000000000000000000000000000000000000"
    audit_events = [
        (1, "2026-10-26T09:15:00Z", "system", "SYSTEM", "GENESIS_LEDGER_INIT", "GENESIS-BLOCK", "National Academic Depository", "APAAR National Verification Ledger Root initialized", "10.0.0.1"),
        (2, "2026-10-26T10:04:12Z", "college@aicte.ac.in", "COLLEGE_ADMIN", "ENROLMENT_VERIFIED", "123456789012", "Aarav Sharma", "Aadhaar e-KYC and ABC credit match ratified", "192.168.1.45"),
        (3, "2026-10-26T11:22:30Z", "aicte.superadmin@gov.in", "AICTE_SUPER_ADMIN", "DUPLICATE_FLAGGED", "100000000005", "Mohammad Farhan Akhtar", "Cross-institution duplicate flagged: Delhi Inst vs UP Council", "14.139.60.2"),
        (4, "2026-10-26T12:05:18Z", "aicte.superadmin@gov.in", "AICTE_SUPER_ADMIN", "DUPLICATE_FLAGGED", "100000000012", "Ananya Banerjee", "Cross-institution duplicate flagged: Delhi Inst vs Bangalore Inst", "14.139.60.2"),
        (5, "2026-10-26T14:40:02Z", "college@aicte.ac.in", "COLLEGE_ADMIN", "STATUS_UPDATED", "100000000010", "Zoya Khan", "Admission revoked due to intake quota overrun", "192.168.1.45"),
    ]

    prev_h = genesis_hash
    for idx, ts, actor, role, act, apaar, name, det, ip in audit_events:
        curr_h = compute_hash(prev_h, ts, actor, act, apaar, det)
        cursor.execute("""
        INSERT INTO audit_ledger (eventIndex, timestamp, actor, role, action, apaarId, studentName, details, ipAddress, prevHash, currentHash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (idx, ts, actor, role, act, apaar, name, det, ip, prev_h, curr_h))
        prev_h = curr_h

    # Seat Ledger Data
    seat_ledger_data = [
        ("COL001", 2026, "Computer Science & Engineering", "regular", 300, 310, 10),
        ("COL001", 2026, "Computer Science & Engineering", "tfw", 15, 15, 0),
        ("COL001", 2026, "Computer Science & Engineering", "fn_oci_pio", 8, 8, 0),
        ("COL001", 2026, "Computer Science & Engineering", "nri", 15, 14, 0),
        ("COL001", 2026, "Information Technology", "regular", 200, 205, 5),
        ("COL001", 2026, "Mechanical Engineering", "regular", 250, 260, 10),
        ("COL001", 2026, "Civil Engineering", "regular", 200, 200, 0),
        ("COL001", 2026, "Electronics & Communication", "regular", 250, 265, 15),
    ]

    cursor.executemany("""
    INSERT INTO seat_ledger (collegeId, academicYear, course, quotaType, approvedSeats, allocatedSeats, overrunCount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, seat_ledger_data)

    # Review Cases Data
    review_cases_data = [
        ("REV-2026-001", "CROSS_INSTITUTION_DUPLICATE", "COL001", "Delhi Institute of Engineering & Technology", "100000000005", "Mohammad Farhan Akhtar", "Dual active enrollment detected at Delhi Inst of Tech and UP Council Institute of Technology", "CRITICAL", "OPEN", "2026-10-24T11:00:00Z", None, None, None),
        ("REV-2026-002", "CROSS_INSTITUTION_DUPLICATE", "COL001", "Delhi Institute of Engineering & Technology", "100000000012", "Ananya Banerjee", "Concurrent seat claimed across Delhi and Bangalore institutes without transfer certificate", "CRITICAL", "OPEN", "2026-10-25T09:30:00Z", None, None, None),
        ("REV-2026-003", "OVER_INTAKE", "COL001", "Delhi Institute of Engineering & Technology", "VAR-COL001-CSE", "B.Tech CSE Overrun", "Enrolment exceeded approved regular intake quota by 10 seats without TFW conversion clearance", "HIGH", "OPEN", "2026-10-25T14:15:00Z", None, None, None),
        ("REV-2026-004", "STUDENT_DISPUTE", "COL001", "Delhi Institute of Engineering & Technology", "100000000010", "Zoya Khan", "Student submitted grievance disputing cancellation of admission seat", "MEDIUM", "REJECTED", "2026-10-23T16:00:00Z", "aicte.superadmin@gov.in", "Intake exceeded statutory capacity limit; candidate directed to centralized waitlist pool.", "2026-10-25T10:00:00Z"),
    ]

    cursor.executemany("""
    INSERT INTO review_cases (id, caseType, institutionId, institutionName, apaarId, studentName, details, severity, status, createdAt, decidedBy, decisionNote, decidedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, review_cases_data)

    # Submission Windows Data
    windows_data = [
        ("2026-27", "OPEN", "2026-06-01", "2026-11-30", "2026-10-31"),
        ("2025-26", "LOCKED", "2025-06-01", "2025-11-30", "2025-10-31"),
    ]

    cursor.executemany("""
    INSERT INTO submission_windows (academicYear, status, startDate, endDate, cutoffDate)
    VALUES (?, ?, ?, ?, ?)
    """, windows_data)
