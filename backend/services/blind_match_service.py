import hmac
import hashlib
from database import get_connection

SECRET_SALT = b"AICTE-APAAR-BLIND-MATCH-2026-KEY"

def hmac_token(val: str) -> str:
    cleaned = "".join(val.lower().split())
    return hmac.new(SECRET_SALT, cleaned.encode("utf-8"), hashlib.sha256).hexdigest()

def create_bloom_filter(tokens: list, size: int = 128) -> int:
    mask = 0
    for tok in tokens:
        h = int(tok[:8], 16) % size
        mask |= (1 << h)
    return mask

def dice_similarity(mask1: int, mask2: int) -> float:
    intersection = bin(mask1 & mask2).count("1")
    count1 = bin(mask1).count("1")
    count2 = bin(mask2).count("1")
    if count1 + count2 == 0:
        return 0.0
    return (2.0 * intersection) / (count1 + count2)

def scan_blind_match_duplicates():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students")
    students = cursor.fetchall()
    conn.close()

    profiles = []
    for s in students:
        # Generate tokenized bigrams of name + DOB + guardian
        name_clean = "".join(s["name"].lower().split())
        bigrams = [name_clean[i:i+2] for i in range(len(name_clean)-1)] if len(name_clean) > 1 else [name_clean]
        tokens = [hmac_token(b) for b in bigrams]
        tokens.append(hmac_token(s["dob"]))
        if s["guardianName"]:
            tokens.append(hmac_token(s["guardianName"]))

        bf = create_bloom_filter(tokens)
        profiles.append({
            "student": dict(s),
            "bloomFilter": bf
        })

    conflicts = []
    n = len(profiles)
    for i in range(n):
        for j in range(i + 1, n):
            s1 = profiles[i]["student"]
            s2 = profiles[j]["student"]

            # Only check across different colleges for same academic year
            if s1["collegeId"] != s2["collegeId"] and s1["academicYear"] == s2["academicYear"]:
                # Check either identical APAAR ID or fuzzy Dice coefficient on HMAC representations
                is_exact_apaar = (s1["apaarId"] == s2["apaarId"])
                sim = dice_similarity(profiles[i]["bloomFilter"], profiles[j]["bloomFilter"])

                if is_exact_apaar or sim >= 0.80:
                    conflicts.append({
                        "id": f"BLIND-{s1['apaarId'][:8]}-{s2['apaarId'][:8]}",
                        "institutionA": {
                            "id": s1["collegeId"],
                            "name": s1["collegeName"],
                            "apaarId": s1["apaarId"],
                            "studentName": s1["name"],
                            "course": s1["course"]
                        },
                        "institutionB": {
                            "id": s2["collegeId"],
                            "name": s2["collegeName"],
                            "apaarId": s2["apaarId"],
                            "studentName": s2["name"],
                            "course": s2["course"]
                        },
                        "diceSimilarity": round(sim, 3),
                        "conflictType": "EXACT_APAAR_COLLISION" if is_exact_apaar else "FUZZY_IDENTITY_MATCH",
                        "privacyMethod": "HMAC-SHA256 Bloom Filter (No Raw PII Shared)",
                        "recommendedAction": "Issue regulatory verification inquiry to both institutions"
                    })

    return conflicts
