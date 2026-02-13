# 🛡️ SaffronAI – Agentic Scam Honeypot

SaffronAI is an **AI-powered conversational honeypot** designed to **engage scammers in real time**, extract actionable intelligence, and report threats reliably — **without alerting the attacker**.

Built for the **HCL × GUVI Hackathon**, the system prioritizes **reliability and real-world robustness over perfect classification**.


## 🚀 What SaffronAI Does

SaffronAI pretends to be a **real Indian banking user**, interacts naturally with scammers, and extracts key forensic indicators such as:

- UPI IDs
- Bank account numbers
- Phone numbers
- Phishing links
- Scam intent and social-engineering patterns

Once sufficient intelligence is collected, it **automatically reports the scam session** to the GUVI backend.

---

## 🧠 Core Capabilities

### 1️⃣ Real-Time Scam Engagement

- Acts like a genuine Indian user (UPI, PhonePe, GPay, Paytm)
- Uses realistic personas (working professional, shop owner, retired user)
- Never accuses or alerts the scammer
- Keeps the scammer engaged naturally

Supports:

- OTP scams
- KYC scams
- Bank impersonation
- UPI/payment redirection
- Refund & lottery scams

---

### 2️⃣ Context-Aware Prompt Steering

Responses dynamically adapt based on scammer behavior:

- OTP mentioned → asks what transaction it’s for
- UPI mentioned → asks for QR or UPI ID
- Phone number shared → asks for official verification
- Increased urgency → increases confusion and verification

This increases:

- Engagement duration
- Intelligence yield
- Realism of the conversation

---

### 3️⃣ Hybrid Intelligence Extraction (Regex + LLM)

**Deterministic (Regex):**

- UPI IDs
- Phone numbers (+91 supported)
- Bank account numbers
- URLs / phishing links

**Semantic (LLM):**

- Scam intent
- Scam type (OTP, KYC, Bank Impersonation, etc.)
- Urgency and threat signals
- Language detection
- Persona inference

This hybrid approach avoids single-point failures.

---

### 4️⃣ Multilingual Scam Support

- Works with **English, Hindi, and Hinglish**
- Semantic understanding handled by LLM
- Numeric artifacts extracted reliably via regex

Example:
₹1 ट्रांसफर करें scammer@upi
→ UPI ID extracted successfully.

### 5️⃣ Scam Flow Reconstruction

Automatically reconstructs the attacker’s flow:

- Bank impersonation
- Fear creation (account blocked)
- KYC pressure
- Payment redirection
- Direct contact escalation

Useful for SOC teams and incident analysis.

### 6️⃣ Risk & Impact Estimation

Each session includes:

- Scam confidence score
- Risk score
- Estimated potential financial loss (₹ range)

Helps prioritize high-risk incidents.

### 7️⃣ Reliable Callback System

- Sends extracted intelligence to GUVI automatically
- Triggered as soon as **sufficient evidence** is available
- Prevents duplicate callbacks
- Safe against mid-conversation crashes

Designed for **reliability, not overfitting**.


## 🧩 Design Philosophy

> **Reliability over perfection**

- No rigid rule-based scam detection
- Assumes malicious intent by default
- Extracts intelligence as soon as it becomes actionable
- Fails gracefully without breaking the conversation



## 🚫 Intentional Limitations

To avoid overclaiming:

- No audio/image analysis
- No written-amount-to-number conversion
- No blocking or warning scammers
- No dependency on language-specific rules

These are conscious design decisions.

## 🏗️ Architecture Overview

backend/
├── app/
│   ├── agent/           # Conversational honeypot logic
│   ├── intelligence/    # Intelligence extraction & scoring
│   ├── session_manager/ # Session handling
│   ├── llm_client.py    # Groq LLM integration
│   ├── guvi_client.py   # Callback sender
│   └── main.py          # FastAPI entrypoint

## 🌐 Deployment

- Hosted on **Render**
- Public HTTPS API
- Secured using `x-api-key` header
- Environment variables managed via `.env` (local) or platform secrets (production)


## 🏁 One-Line Summary

> **SaffronAI is an AI-driven conversational honeypot that safely engages scammers, adapts in real time, extracts actionable intelligence across languages, and reports threats reliably without alerting the attacker.**

## 📌 Hackathon Context

Built for: **HCL × GUVI Hackathon**
Problem Domain: **Fraud Detection & User Safety**
