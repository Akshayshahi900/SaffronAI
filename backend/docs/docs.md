```md
# 🧠 SAFFRON AI — Vision & System Overview

### Autonomous Cyber-Intelligence Platform for Financial Fraud Detection

---

## 🚨 Problem

India loses **₹1000+ crore every month** to:

- Fake bank calls
- KYC scams
- OTP fraud
- Lottery & refund scams

Traditional systems only **classify scams** after the victim has already lost money.
They do not **trap**, **trace**, or **extract evidence** from scammers.

---

## 💡 Our Solution

**SAFFRON AI** is an **autonomous AI honeypot** that pretends to be a real Indian banking user, psychologically manipulates scammers, forces them to reveal their financial infrastructure, and sends actionable cyber-intelligence to GUVI.

SAFFRON does not just detect scams — it **hunts scammers**.

---

## 🧠 What SAFFRON Does

When a scam message is received, SAFFRON:

1. Acts as a **real Indian victim** (PhonePe user, shop owner, pensioner, job seeker)
2. **Engages the scammer**
3. Forces them to send:
   - UPI IDs
   - QR codes
   - Phone numbers
   - Bank accounts
   - Phishing links
4. Extracts and verifies all leaked data
5. Reconstructs the scam **attack flow**
6. Estimates **financial risk to the victim**
7. Sends structured intelligence to **GUVI**

---

## 🧬 System Architecture
```

Scammer → SAFFRON API → Victim Agent → Scam Extraction → Risk Engine → GUVI

```

### Components

| Module | Purpose |
|------|--------|
| `agent.py` | AI that behaves like a real Indian bank customer |
| `intelligence.py` | Extracts UPI, phone, links, language, scam type |
| `risk_engine` | Estimates financial loss |
| `attack_flow` | Reconstructs scam kill-chain |
| `main.py` | Secure FastAPI endpoint |
| `guvi_client.py` | Sends intelligence to GUVI |

---

## 🧪 Example

### Incoming scam message
```

"Hello sir, your SBI account is blocked. Click this link to verify KYC."

```

### SAFFRON replies
```

"Sir I use PhonePe. Please send me the UPI or QR code to fix this fast."

```

Scammer sends:
```

sbi.verify@upi
[http://sbi-kyc.in](http://sbi-kyc.in)

````

### SAFFRON extracts

```json
{
  "upiIds": ["sbi.verify@upi"],
  "phishingLinks": ["http://sbi-kyc.in"],
  "scamType": "KYC Scam",
  "attackFlow": [
    "Bank Impersonation",
    "Fear Creation",
    "KYC Pressure",
    "Payment Redirection"
  ],
  "riskScore": 0.92,
  "potentialLossINR": "₹50,000 – ₹2,00,000"
}
````

This intelligence is automatically sent to GUVI.

---

## 🧠 Why SAFFRON Is Different

| Traditional Systems | SAFFRON                         |
| ------------------- | ------------------------------- |
| Detect scams        | **Trap scammers**               |
| Passive analysis    | **Active deception**            |
| No evidence         | **Forensic-grade intelligence** |
| No risk estimation  | **Financial damage scoring**    |
| Offline             | **Live deployed honeypot**      |

---

## 🔐 Security

SAFFRON runs as a secure HTTPS API protected by:

- API key authentication
- Token-limited LLM access
- Controlled deployment on Render

---

## 🚀 Deployment

SAFFRON is deployed as a public API on Render.

```
POST /api/message
Headers:
  x-api-key: <HONEYPOT_API_KEY>

Body:
{
  "sessionId": "abc123",
  "message": "Your SBI account is blocked..."
}
```

---

## 🏆 Why This Wins

SAFFRON is not a chatbot.
It is a **cybercrime honeypot**.

It:

- Engages real scammers
- Extracts their financial infrastructure
- Reconstructs their attack strategy
- Estimates victim financial damage
- Generates law-enforcement-grade evidence

This is exactly what banks, police, and cybercrime units need.

---

## 👨‍💻 Team

Built for the **HCL × GUVI Hackathon**
By a team focused on **real-world cybercrime prevention**.

---

```
