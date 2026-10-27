from fastapi import APIRouter, HTTPException, Request
from database import get_connection
from models import ReviewDecisionRequest
from services.audit_service import append_audit_log
from datetime import datetime

router = APIRouter(prefix="/api/review", tags=["Review Cases"])

@router.get("/cases")
def get_review_cases(status: str = "ALL"):
    conn = get_connection()
    cursor = conn.cursor()
    if status != "ALL":
        cursor.execute("SELECT * FROM review_cases WHERE status = ? ORDER BY createdAt DESC", (status.upper(),))
    else:
        cursor.execute("SELECT * FROM review_cases ORDER BY createdAt DESC")
    cases = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "success": True,
        "total": len(cases),
        "openCount": sum(1 for c in cases if c["status"] == "OPEN"),
        "data": cases
    }

@router.post("/cases/{case_id}/decide")
def decide_review_case(case_id: str, req: ReviewDecisionRequest, request: Request):
    if not req.note or len(req.note.strip()) < 5:
        raise HTTPException(status_code=400, detail="Mandatory administrative rationale note (minimum 5 characters) must be provided.")

    decision = req.decision.upper()
    if decision not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Decision must be 'APPROVED' or 'REJECTED'.")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM review_cases WHERE id = ?", (case_id,))
    case = cursor.fetchone()

    if not case:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Review case #{case_id} not found.")

    decided_at = datetime.utcnow().isoformat() + "Z"
    cursor.execute("""
    UPDATE review_cases
    SET status = ?, decidedBy = ?, decisionNote = ?, decidedAt = ?
    WHERE id = ?
    """, (decision, req.actorEmail, req.note.strip(), decided_at, case_id))

    # If case was cross-institution duplicate and approved, update student status to verified; if rejected, update to rejected
    if case["caseType"] == "CROSS_INSTITUTION_DUPLICATE" and case["apaarId"].isdigit():
        new_stud_status = "verified" if decision == "APPROVED" else "rejected"
        cursor.execute("UPDATE students SET status = ? WHERE apaarId = ?", (new_stud_status, case["apaarId"]))

    conn.commit()
    conn.close()

    ip = request.client.host if request.client else "127.0.0.1"
    append_audit_log(
        actor=req.actorEmail,
        role="AICTE_REGULATION_OFFICER",
        action=f"REVIEW_CASE_{decision}",
        apaar_id=case["apaarId"],
        student_name=case["studentName"],
        details=f"Review case {case_id} resolved as {decision}. Note: {req.note}",
        ip_address=ip
    )

    return {
        "success": True,
        "message": f"Review case #{case_id} successfully marked as {decision}.",
        "caseId": case_id,
        "status": decision
    }
