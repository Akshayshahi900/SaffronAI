# 🛡 SAFFRON AI – Agentic Scam Honeypot API

SAFFRON AI is an **agentic scam honeypot backend** built for the **HCL × GUVI AI Buildathon**.

It simulates a real Indian bank user, engages scammers in multi-turn conversations, extracts actionable scam intelligence, and reports structured results to the GUVI evaluation system.

---

## 🚀 What This System Does

- Receives scam messages via REST API
- Detects scam intent (OTP, KYC, UPI, impersonation)
- Engages scammers using a human-like AI agent
- Extracts intelligence:
  - UPI IDs
  - Bank accounts
  - Phone numbers
  - Phishing links
- Automatically triggers GUVI callback when sufficient intel is gathered

This is **not a chatbot** — it is an **active fraud intelligence trap**.

---

## 🧪 How GUVI Evaluates This

GUVI evaluates SAFFRON AI by sending **scam messages as API calls**.

Each API request represents **one message** in an ongoing conversation.

Conversation state is maintained using a **sessionId**.

### Incoming Request (from GUVI)

POST /api/message
Headers:
x-api-key: <HONEYPOT_API_KEY>

Body:
{
"sessionId": "guvi-session-001",
"message": "URGENT: Your SBI account is blocked. Share OTP immediately."
}

### SAFFRON AI Response

```json
{
  "status": "success",
  "reply": "Sir I use PhonePe. Please resend the UPI ID or QR code."
}
````

SAFFRON continues engaging the scammer **across multiple turns** using the same `sessionId`.

---

## 📡 Mandatory GUVI Callback (Critical)

When SAFFRON determines that enough scam intelligence has been collected, it **automatically sends a callback** to GUVI:

POST <https://hackathon.guvi.in/api/updateHoneyPotFinalResult>

Example payload:

```json
{
  "sessionId": "guvi-session-001",
  "scamDetected": true,
  "totalMessagesExchanged": 14,
  "extractedIntelligence": {
    "upiIds": ["scammer.fraud@fakebank"],
    "bankAccounts": ["1234567890123456"],
    "phoneNumbers": ["+91-9876543210"],
    "phishingLinks": []
  },
  "scamType": "Bank Impersonation",
  "confidenceLevel": 0.92,
  "agentNotes": "High urgency, OTP pressure, UPI redirection detected"
}
```

⚠️ **If this callback is not sent, the submission is not evaluated.**

---

## 🧠 High-Level Flow

GUVI → /api/message
     → Session Manager
     → Honeypot AI Agent
     → Intelligence Extractor
     → Risk & Confidence Engine
     → Final Callback → GUVI

---

## 🏗 Project Structure

backend/
└── app/
    ├── api/            # FastAPI routes
    ├── core/           # Agent, intelligence, session logic
    ├── services/       # LLM client, GUVI callback
    ├── models/         # Session data models
    └── docs/           # Detailed documentation

---

## 📚 Documentation

More detailed documentation is available in the `docs/` folder:

- `docs/docs.md` – Vision, problem statement, and system overview
- `docs/specs.md` – Technical architecture and design
- `docs/how_to_run_locally.md` – Local testing & curl commands

---

## 🏁 Summary

SAFFRON AI is a **production-style agentic honeypot** that:

- Actively traps scammers
- Extracts forensic-grade scam intelligence
- Reconstructs attack patterns
- Reports structured evidence to GUVI automatically

Built to demonstrate **real-world cybercrime intelligence**, not just classification.
