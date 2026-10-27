from fastapi import APIRouter, HTTPException, Query, Request
from typing import Optional, List
from database import get_connection
from models import StudentModel, BulkUploadPreviewRequest, RegistrationRequest
from services.audit_service import append_audit_log
import csv
import io

router = APIRouter(prefix="/api/college", tags=["College"])

@router.get("/stats")
def get_college_stats(collegeId: str = "COL001"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM colleges WHERE id = ?", (collegeId,))
    row = cursor.fetchone()

    if not row:
        # Default fallback if unknown
        cursor.execute("SELECT * FROM colleges WHERE id = 'COL001'")
        row = cursor.fetchone()

    college = dict(row)
    actual = college["actualEnrolment"]
    approved = college["approvedIntake"]

    conn.close()

    return {
        "success": True,
        "college": college,
        "intakeVariance": actual - approved,
        "overIntakeFlag": actual > approved
    }

@router.get("/students")
def get_students(
    collegeId: Optional[str] = None,
    q: Optional[str] = None,
    course: Optional[str] = None,
    year: Optional[int] = None,
    status: Optional[str] = None,
    category: Optional[str] = None
):
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM students WHERE 1=1"
    params = []

    if collegeId:
        query += " AND collegeId = ?"
        params.append(collegeId)

    if q and q.strip():
        search_term = f"%{q.strip()}%"
        query += " AND (name LIKE ? OR apaarId LIKE ? OR enrollmentNo LIKE ?)"
        params.extend([search_term, search_term, search_term])

    if course and course != "all":
        query += " AND course LIKE ?"
        params.append(f"%{course}%")

    if year:
        query += " AND academicYear = ?"
        params.append(year)

    if status and status != "all":
        query += " AND status = ?"
        params.append(status.lower())

    if category and category != "all":
        query += " AND category = ?"
        params.append(category)

    query += " ORDER BY id DESC"

    cursor.execute(query, params)
    students = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "success": True,
        "total": len(students),
        "data": students
    }

@router.post("/bulk-upload")
def bulk_upload_students(incoming: List[dict], request: Request):
    if not incoming:
        raise HTTPException(status_code=400, detail="Uploaded student list cannot be empty.")

    conn = get_connection()
    cursor = conn.cursor()

    added = 0
    duplicates = 0
    invalid_format = 0
    over_intake_count = 0

    college_id = incoming[0].get("collegeId", "COL001")
    cursor.execute("SELECT * FROM colleges WHERE id = ?", (college_id,))
    college = cursor.fetchone()
    current_enrolment = college["actualEnrolment"] if college else 1200
    approved_intake = college["approvedIntake"] if college else 1200

    for s in incoming:
        apaar = str(s.get("apaarId", "")).strip()
        name = str(s.get("name", "Student")).strip()

        # Validation Rule 1: APAAR Format (12-digit numeric or PROV opt-out)
        if not apaar or (not apaar.startswith("PROV-") and not (apaar.isdigit() and len(apaar) == 12) and not apaar.startswith("APAAR")):
            invalid_format += 1
            continue

        # Validation Rule 2: Duplicate check across entire national registry
        cursor.execute("SELECT * FROM students WHERE UPPER(apaarId) = UPPER(?)", (apaar,))
        existing = cursor.fetchone()

        if existing:
            duplicates += 1
            # If already enrolled elsewhere, flag conflict
            if existing["collegeId"] != college_id:
                cursor.execute("""
                UPDATE students SET status = 'duplicate', flagReason = ?, duplicateCollegeId = ?, duplicateCollegeName = ?
                WHERE apaarId = ?
                """, (f"Cross-institution duplicate with {college['name'] if college else 'admitted college'}", college_id, college["name"] if college else "College", apaar))
            continue

        # Check intake overrun
        if current_enrolment + added >= approved_intake:
            over_intake_count += 1
            status = "pending"
            flag = f"Intake capacity overrun (+{current_enrolment + added + 1 - approved_intake} seats over approved limit)"
        else:
            status = s.get("status", "verified")
            flag = None

        cursor.execute("""
        INSERT INTO students (
            apaarId, name, dob, gender, mobile, aadhaarLast4, collegeId, collegeName,
            course, academicYear, abcCredits, tenthPercent, twelfthPercent, status,
            category, enrollmentNo, admissionDate, digilockerVerified, state, flagReason,
            guardianName, isProvisional
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            apaar,
            name,
            s.get("dob", "2005-01-01"),
            s.get("gender", "Male"),
            s.get("mobile", "9876543210"),
            s.get("aadhaarLast4", "0000"),
            college_id,
            s.get("collegeName", college["name"] if college else "AICTE Approved Institution"),
            s.get("course", "B.Tech Computer Science & Engineering"),
            int(s.get("academicYear", 2026)),
            int(s.get("abcCredits", 30)),
            float(s.get("tenthPercent", 85.0)),
            float(s.get("twelfthPercent", 85.0)),
            status,
            s.get("category", "General"),
            s.get("enrollmentNo", f"2026-ADM-{added+100}"),
            s.get("admissionDate", "2026-08-01"),
            1 if not apaar.startswith("PROV-") else 0,
            s.get("state", "Delhi"),
            flag,
            s.get("guardianName", "Guardian"),
            1 if apaar.startswith("PROV-") else 0
        ))
        added += 1

    # Update college totals
    new_actual = current_enrolment + added
    cursor.execute("""
    UPDATE colleges 
    SET 
        actualEnrolment = ?,
        verifiedCount = (SELECT COUNT(*) FROM students WHERE collegeId = ? AND status = 'verified'),
        pendingCount = (SELECT COUNT(*) FROM students WHERE collegeId = ? AND status = 'pending'),
        duplicateCount = (SELECT COUNT(*) FROM students WHERE collegeId = ? AND status = 'duplicate')
    WHERE id = ?
    """, (new_actual, college_id, college_id, college_id, college_id))

    # If over intake, open a review case
    if new_actual > approved_intake and over_intake_count > 0:
        case_id = f"REV-{college_id}-{added}"
        cursor.execute("""
        INSERT OR IGNORE INTO review_cases (id, caseType, institutionId, institutionName, apaarId, studentName, details, severity, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', datetime('now'))
        """, (case_id, "OVER_INTAKE", college_id, college["name"] if college else "College", "BATCH-OVERRUN", f"Batch of {added} records", f"Total enrolment ({new_actual}) exceeded approved intake ({approved_intake}) by +{new_actual - approved_intake} seats", "HIGH"))

    conn.commit()
    conn.close()

    # Log to audit ledger
    ip = request.client.host if request.client else "127.0.0.1"
    append_audit_log(
        actor="college@aicte.ac.in",
        role="COLLEGE_ADMIN",
        action="BATCH_UPLOAD_COMMITTED",
        apaar_id=f"BATCH-{len(incoming)}",
        student_name=f"{added} Students Enrolled",
        details=f"Batch processed: {added} committed, {duplicates} duplicates intercepted, {invalid_format} invalid rejected, {over_intake_count} over-intake flagged.",
        ip_address=ip
    )

    return {
        "success": True,
        "message": f"Batch validated! {len(incoming)} processed: {added} committed, {duplicates} duplicates flagged, {invalid_format} invalid rejected.",
        "addedCount": added,
        "duplicateCount": duplicates,
        "invalidCount": invalid_format,
        "overIntakeCount": over_intake_count
    }

@router.post("/preview")
def preview_csv_upload(req: BulkUploadPreviewRequest):
    csv_text = req.csvData.strip()
    if not csv_text:
        raise HTTPException(status_code=400, detail="CSV text cannot be empty.")

    reader = csv.reader(io.StringIO(csv_text))
    rows = list(reader)

    if not rows:
        raise HTTPException(status_code=400, detail="No rows found in uploaded file.")

    headers = [h.strip() for h in rows[0]]
    preview_data = []

    for r in rows[1:6]:  # Show first 5 rows
        if r:
            row_dict = {}
            for i, val in enumerate(r):
                col_name = headers[i] if i < len(headers) else f"col_{i}"
                row_dict[col_name] = val.strip()
            preview_data.append(row_dict)

    return {
        "success": True,
        "totalRows": len(rows) - 1,
        "headers": headers,
        "preview": preview_data,
        "detectedMappings": {
            "apaarId": next((h for h in headers if "apaar" in h.lower()), "apaarId"),
            "name": next((h for h in headers if "name" in h.lower()), "name"),
            "course": next((h for h in headers if "course" in h.lower() or "branch" in h.lower()), "course"),
            "dob": next((h for h in headers if "dob" in h.lower() or "birth" in h.lower()), "dob"),
        }
    }

@router.get("/template")
def download_csv_template():
    template_headers = [
        "apaarId", "name", "dob", "gender", "mobile", "aadhaarLast4",
        "course", "academicYear", "abcCredits", "tenthPercent", "twelfthPercent", "category"
    ]
    sample_row = [
        "100000000021", "Manish Kumar", "2005-03-12", "Male", "9812345670", "1234",
        "B.Tech Computer Science & Engineering", "2026", "36", "91.5", "89.0", "General"
    ]
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(template_headers)
    writer.writerow(sample_row)

    return {
        "success": True,
        "templateCsv": output.getvalue(),
        "filename": "AICTE_APAAR_Bulk_Enrolment_Template.csv"
    }

@router.post("/register")
def register_institution(req: RegistrationRequest):
    conn = get_connection()
    cursor = conn.cursor()
    college_id = f"COL-{req.pid.replace('-', '')[:6]}"

    cursor.execute("""
    INSERT OR REPLACE INTO colleges (
        id, name, code, state, city, approvedIntake, actualEnrolment, verifiedCount,
        pendingCount, duplicateCount, supernumeraryQuota, nriCount, fnCount, integrityScore, status
    ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 100.0, 'Approved')
    """, (
        college_id,
        req.name,
        f"AICTE-REG-{req.pid}",
        req.state.split(",")[0].strip(),
        req.state.split(",")[-1].strip() if "," in req.state else req.state,
        req.approvedIntake
    ))

    conn.commit()
    conn.close()

    append_audit_log(
        actor=req.email,
        role="INSTITUTION_REGISTRAR",
        action="INSTITUTION_REGISTERED",
        apaar_id=college_id,
        student_name=req.name,
        details=f"New institutional node provisioned with sanctioned intake {req.approvedIntake}",
        ip_address="127.0.0.1"
    )

    return {
        "success": True,
        "message": f"Institutional registration completed. Reference PID #{req.pid} ratified.",
        "collegeId": college_id
    }
