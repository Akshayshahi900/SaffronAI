#callback here

import requests

GUVI_URL = "https://hackathon.guvi.in/api/updateHoneyPotFinalResult"

def send_final_result(session):
    payload = {
        "sessionId": session.id,
        "scamDetected": True,
        "totalMessagesExchanged": len(session.history),
        "extractedIntelligence": {
            "bankAccounts": session.intel.get("bankAccounts", []),
            "upiIds": session.intel.get("upiIds", []),
            "phishingLinks": session.intel.get("phishingLinks", []),
            "phoneNumbers": session.intel.get("phoneNumbers", []),
            "suspiciousKeywords": session.intel.get("suspiciousKeywords", [])
        },
        "agentNotes": session.agentNotes
    }

    try:
        requests.post(GUVI_URL, json=payload, timeout=5)
        print("GUVI callback sent")
    except Exception as e:
        print("GUVI callback failed:", e)
