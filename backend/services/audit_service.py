import hashlib
from datetime import datetime
from database import get_connection

def compute_hash(prev_hash: str, timestamp: str, actor: str, action: str, apaar_id: str, details: str) -> str:
    payload = f"{prev_hash}|{timestamp}|{actor}|{action}|{apaar_id}|{details}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()

def append_audit_log(actor: str, role: str, action: str, apaar_id: str, student_name: str, details: str, ip_address: str = "127.0.0.1") -> dict:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT eventIndex, currentHash FROM audit_ledger ORDER BY eventIndex DESC LIMIT 1")
    last_row = cursor.fetchone()

    if last_row:
        next_idx = last_row["eventIndex"] + 1
        prev_hash = last_row["currentHash"]
    else:
        next_idx = 1
        prev_hash = "0000000000000000000000000000000000000000000000000000000000000000"

    timestamp = datetime.utcnow().isoformat() + "Z"
    curr_hash = compute_hash(prev_hash, timestamp, actor, action, apaar_id, details)

    cursor.execute("""
    INSERT INTO audit_ledger (eventIndex, timestamp, actor, role, action, apaarId, studentName, details, ipAddress, prevHash, currentHash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (next_idx, timestamp, actor, role, action, apaar_id, student_name, details, ip_address, prev_hash, curr_hash))

    conn.commit()
    conn.close()

    return {
        "eventIndex": next_idx,
        "timestamp": timestamp,
        "actor": actor,
        "role": role,
        "action": action,
        "apaarId": apaar_id,
        "studentName": student_name,
        "details": details,
        "ipAddress": ip_address,
        "prevHash": prev_hash,
        "currentHash": curr_hash
    }

def verify_audit_chain() -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_ledger ORDER BY eventIndex ASC")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return {"valid": True, "totalBlocks": 0, "message": "Ledger is empty"}

    expected_prev = "0000000000000000000000000000000000000000000000000000000000000000"

    for i, row in enumerate(rows):
        if i == 0 and row["action"] == "GENESIS_LEDGER_INIT":
            expected_prev = row["prevHash"]

        # 1. Check chain linkage
        if row["prevHash"] != expected_prev:
            return {
                "valid": False,
                "brokenIndex": row["eventIndex"],
                "reason": f"Hash chain linkage broken at block #{row['eventIndex']}. Expected prevHash {expected_prev}, found {row['prevHash']}"
            }

        # 2. Recompute block content hash
        recomputed = compute_hash(row["prevHash"], row["timestamp"], row["actor"], row["action"], row["apaarId"], row["details"])
        if recomputed != row["currentHash"]:
            return {
                "valid": False,
                "brokenIndex": row["eventIndex"],
                "reason": f"Content tampering detected at block #{row['eventIndex']}. Recomputed hash {recomputed} does not match recorded hash {row['currentHash']}"
            }

        expected_prev = row["currentHash"]

    return {
        "valid": True,
        "totalBlocks": len(rows),
        "headHash": rows[-1]["currentHash"],
        "message": "Cryptographic SHA-256 hash-chain verified. Ledger is intact and tamper-free."
    }
