import io
import csv
from database import get_connection

def generate_compliance_report_csv() -> bytes:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM colleges ORDER BY state, name")
    colleges = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)

    # Official AICTE National Report Headers
    writer.writerow([
        "AICTE Permanent Institute ID",
        "Institution Name",
        "State",
        "City",
        "Approved Intake (Sanctioned)",
        "Actual Enrolment (Committed)",
        "Intake Variance (+/-)",
        "Supernumerary Quota (TFW)",
        "NRI / FN Enrolments",
        "Verified APAAR Records",
        "Pending Records",
        "Duplicate Conflicts",
        "Verification Sync %",
        "Integrity Score (0-100)",
        "Regulatory Audit Status"
    ])

    for c in colleges:
        actual = c["actualEnrolment"]
        approved = c["approvedIntake"]
        var = actual - approved
        sync_pct = round((c["verifiedCount"] / actual * 100), 1) if actual > 0 else 0.0

        writer.writerow([
            c["code"],
            c["name"],
            c["state"],
            c["city"],
            approved,
            actual,
            f"+{var}" if var > 0 else str(var),
            c["supernumeraryQuota"],
            f"{c['nriCount']} NRI / {c['fnCount']} FN",
            c["verifiedCount"],
            c["pendingCount"],
            c["duplicateCount"],
            f"{sync_pct}%",
            c["integrityScore"],
            c["status"]
        ])

    return output.getvalue().encode("utf-8-sig")

def generate_student_export_csv(college_id: str = None) -> bytes:
    conn = get_connection()
    cursor = conn.cursor()
    if college_id:
        cursor.execute("SELECT * FROM students WHERE collegeId = ? ORDER BY name", (college_id,))
    else:
        cursor.execute("SELECT * FROM students ORDER BY collegeName, name")
    students = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "APAAR ID",
        "Student Full Name",
        "Date of Birth",
        "Gender",
        "Mobile Number",
        "Aadhaar (Last 4)",
        "Institution Code",
        "Institution Name",
        "Admitted Course & Branch",
        "Academic Year",
        "ABC Credits",
        "Class 10th %",
        "Class 12th %",
        "Category",
        "Admission Date",
        "Verification Status",
        "DigiLocker Synced",
        "Conflict / Anomaly Reason"
    ])

    for s in students:
        writer.writerow([
            s["apaarId"],
            s["name"],
            s["dob"],
            s["gender"],
            s["mobile"],
            s["aadhaarLast4"],
            s["collegeId"],
            s["collegeName"],
            s["course"],
            s["academicYear"],
            s["abcCredits"],
            s["tenthPercent"],
            s["twelfthPercent"],
            s["category"],
            s["admissionDate"],
            s["status"].upper(),
            "YES" if s["digilockerVerified"] else "NO",
            s["flagReason"] or "None"
        ])

    return output.getvalue().encode("utf-8-sig")
