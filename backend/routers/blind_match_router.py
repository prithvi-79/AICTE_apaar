from fastapi import APIRouter
from services.blind_match_service import scan_blind_match_duplicates

router = APIRouter(prefix="/api/blind-match", tags=["Blind Match"])

@router.get("/conflicts")
def get_blind_match_conflicts():
    conflicts = scan_blind_match_duplicates()
    return {
        "success": True,
        "totalConflicts": len(conflicts),
        "protocol": "HMAC-SHA256 Encoded Dice Similarity Matching",
        "data": conflicts
    }
