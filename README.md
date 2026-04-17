# 🛡️ SAFFRON AI — Agentic Scam Honeypot Simulator

SAFFRON AI is an AI-powered honeypot system that simulates a real user, engages scammers in multi-turn conversations, extracts scam intelligence, and visualizes attack patterns in real time.

---

## 🌐 Live Demo

https://saffron-ai.vercel.app

---

## 🚀 Overview

SAFFRON AI receives scam messages through an API and responds like a real user.
During the interaction, it extracts useful intelligence such as UPI IDs, bank accounts, phone numbers, and phishing links.

Instead of only detecting scams, the system actively engages scammers and gathers actionable data.

---

## 🧠 System Flow

```txt
Scammer Message
      ↓
Frontend Simulator (React)
      ↓
FastAPI Backend
      ↓
Honeypot Agent (LLM)
      ↓
Intelligence Extraction
      ↓
Risk & Attack Flow Analysis
      ↓
Final Structured Output
```

---

## ⚙️ Tech Stack

* **Frontend:** React (Vite, TypeScript)
* **Backend:** FastAPI (Python)
* **LLM:** API-based (Groq)
* **Deployment:** Vercel (frontend), Render (backend)
* **Data Extraction:** Regex + heuristic parsing

---

## 🔥 Features

* Multi-turn scam conversation simulation
* Human-like AI responses
* Real-time intelligence extraction
* Risk scoring and confidence estimation
* Attack flow reconstruction
* Session-based conversation tracking

---

## 📊 Extracted Intelligence

* UPI IDs
* Bank account numbers
* Phone numbers
* Phishing links
* Suspicious keywords

---

## 🧪 Example Output

```json
{
  "upiIds": ["jobs.verify@fakebank"],
  "bankAccounts": ["1234567890123456"],
  "scamType": "Job Scam",
  "confidence": 0.99,
  "risk": "₹50,000 - ₹2,00,000"
}
```

---

## 🧱 Project Structure

```txt
frontend/
  ├── components/
  ├── App.tsx
  ├── api.ts

backend/
  └── app/
      ├── api/
      ├── core/
      ├── services/
      ├── models/
```

---

## 🧪 Run Locally

### Backend

```bash
cd backend
export GROQ_API_KEY="your_key"
export HONEYPOT_API_KEY="test-secret"

uvicorn app.api.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## ⚠️ Environment Variables

```env
VITE_API_URL=your_backend_url
VITE_API_KEY=your_api_key
VITE_SESSION_ID=your_session_id
```

---

## ⚙️ How It Works

1. A scam message is received
2. The AI agent responds like a normal user
3. The scammer reveals information
4. The system extracts and stores intelligence
5. Risk and scam type are calculated
6. Final structured output is generated

---

## 🧩 Key Technical Challenge

Handling multi-turn conversations with consistent session state while keeping the UI responsive.

Solved using:

* sessionId-based state management
* separation of UI state and execution control
* controlled async flow instead of uncontrolled polling

---

## 🚀 Future Improvements

* Replace polling with WebSockets
* Add persistent database for intelligence
* Improve extraction using structured LLM outputs
* Add multiple agent personas

---

## 🏁 Summary

SAFFRON AI demonstrates an active approach to fraud detection by engaging scammers and extracting real intelligence instead of only classifying messages.

---

## 👨‍💻 Author
Built for HCL × GUVI Hackathon
