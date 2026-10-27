from fastapi import APIRouter, HTTPException
from database import get_connection

router = APIRouter(prefix="/api/seat-ledger", tags=["Seat Ledger"])

@router.get("")
def get_seat_ledger(collegeId: str = "COL001"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM seat_ledger WHERE collegeId = ? ORDER BY course, quotaType", (collegeId,))
    pools = [dict(r) for r in cursor.fetchall()]
    conn.close()

    total_approved = sum(p["approvedSeats"] for p in pools)
    total_allocated = sum(p["allocatedSeats"] for p in pools)
    total_overrun = sum(p["overrunCount"] for p in pools)

    return {
        "success": True,
        "collegeId": collegeId,
        "summary": {
            "totalApproved": total_approved,
            "totalAllocated": total_allocated,
            "totalOverrun": total_overrun,
            "regularSeats": sum(p["approvedSeats"] for p in pools if p["quotaType"] == "regular"),
            "tfwSupernumerary": sum(p["approvedSeats"] for p in pools if p["quotaType"] == "tfw"),
            "nriSeats": sum(p["approvedSeats"] for p in pools if p["quotaType"] == "nri"),
            "fnOciSeats": sum(p["approvedSeats"] for p in pools if p["quotaType"] == "fn_oci_pio"),
        },
        "pools": pools
    }
