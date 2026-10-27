from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class StudentModel(BaseModel):
    id: Optional[int] = None
    apaarId: str
    name: str
    dob: str
    gender: str
    mobile: str
    aadhaarLast4: str
    collegeId: str
    collegeName: str
    course: str
    academicYear: int
    abcCredits: int
    tenthPercent: float
    twelfthPercent: float
    status: str = "pending"  # verified, pending, duplicate, rejected
    category: str = "General"  # General, OBC, SC, ST, EWS
    enrollmentNo: str = ""
    admissionDate: str = ""
    digilockerVerified: bool = True
    state: str = "Delhi"
    duplicateCollegeName: Optional[str] = None
    duplicateCollegeId: Optional[str] = None
    flagReason: Optional[str] = None
    guardianName: Optional[str] = None
    isProvisional: bool = False

class CollegeModel(BaseModel):
    id: str
    name: str
    code: str
    state: str
    city: str
    approvedIntake: int
    actualEnrolment: int
    verifiedCount: int
    pendingCount: int
    duplicateCount: int
    supernumeraryQuota: int = 0
    nriCount: int = 0
    fnCount: int = 0
    integrityScore: float = 100.0
    status: str = "Approved"

class AuditLogEntry(BaseModel):
    id: Optional[int] = None
    eventIndex: int
    timestamp: str
    actor: str
    role: str
    action: str
    apaarId: str
    studentName: str
    details: str
    ipAddress: str
    prevHash: str
    currentHash: str

class StatusUpdateRequest(BaseModel):
    status: str
    actorEmail: Optional[str] = "college@aicte.ac.in"
    role: Optional[str] = "COLLEGE_ADMIN"
    reason: Optional[str] = "Administrative decision"

class ReviewDecisionRequest(BaseModel):
    decision: str  # APPROVED, REJECTED
    actorEmail: str
    note: str

class BulkUploadPreviewRequest(BaseModel):
    csvData: str

class RegistrationRequest(BaseModel):
    pid: str
    name: str
    email: str
    password: str
    state: str
    approvedIntake: int
