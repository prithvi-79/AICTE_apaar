import numpy as np
from sklearn.ensemble import IsolationForest
from database import get_connection

def calculate_institution_scores():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM colleges")
    colleges = cursor.fetchall()

    if not colleges:
        conn.close()
        return []

    features = []
    college_list = []

    for c in colleges:
        actual = c["actualEnrolment"]
        approved = c["approvedIntake"]
        dups = c["duplicateCount"]
        pending = c["pendingCount"]
        verified = c["verifiedCount"]

        overrun_ratio = max(0.0, (actual - approved) / approved if approved > 0 else 0.0)
        dup_ratio = (dups / actual) if actual > 0 else 0.0
        pending_ratio = (pending / actual) if actual > 0 else 0.0
        verified_ratio = (verified / actual) if actual > 0 else 0.0

        features.append([overrun_ratio, dup_ratio, pending_ratio, verified_ratio])
        college_list.append(dict(c))

    X = np.array(features)

    # Train Isolation Forest model on multi-dimensional ingestion metrics
    iso = IsolationForest(n_estimators=50, contamination=0.2, random_state=42)
    iso.fit(X)
    anomaly_scores = iso.decision_function(X)  # Higher is normal, lower is anomalous

    results = []
    for i, c in enumerate(college_list):
        actual = c["actualEnrolment"]
        approved = c["approvedIntake"]
        dups = c["duplicateCount"]
        
        # Base penalty score
        score = 100.0
        signals = []

        if actual > approved:
            overrun = actual - approved
            penalty = min(25.0, (overrun / approved) * 150.0)
            score -= penalty
            signals.append(f"Sanctioned intake exceeded by +{overrun} seats (+{(overrun/approved*100):.1f}%)")

        if dups > 0:
            dup_pen = min(30.0, (dups / actual) * 300.0)
            score -= dup_pen
            signals.append(f"{dups} cross-institution duplicate enrolment conflicts flagged")

        if c["pendingCount"] > (actual * 0.15):
            score -= 8.0
            signals.append(f"Elevated pending verification backlog ({c['pendingCount']} records)")

        # Isolation forest normalization adjustment (-0.5 to 0.5 mapped to -10 to +5)
        raw_iso = float(anomaly_scores[i])
        if raw_iso < 0:
            score -= abs(raw_iso) * 15.0
            signals.append("Machine Learning Isolation Forest flagged multidimensional admission anomaly")

        final_score = max(10.0, min(100.0, round(score, 1)))
        status = "Under Audit" if final_score < 90.0 or actual > approved else "Approved"

        # Update database with fresh score
        cursor.execute("UPDATE colleges SET integrityScore = ?, status = ? WHERE id = ?", (final_score, status, c["id"]))

        results.append({
            "collegeId": c["id"],
            "collegeName": c["name"],
            "code": c["code"],
            "state": c["state"],
            "approvedIntake": approved,
            "actualEnrolment": actual,
            "intakeVariance": actual - approved,
            "duplicateCount": dups,
            "integrityScore": final_score,
            "status": status,
            "signals": signals if signals else ["All verification metrics conform to AICTE 2026-27 APH standards"]
        })

    conn.commit()
    conn.close()

    # Sort descending by risk / ascending by score
    results.sort(key=lambda x: x["integrityScore"])
    return results
