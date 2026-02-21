```md
# 🛡️ Agentic Honeypot for Scam Detection & Intelligence

An AI-powered honeypot system that detects scam messages, autonomously engages scammers using a human-like AI agent, extracts scam intelligence, and reports it to the GUVI evaluation system.

Built for the **GUVI Agentic Honey-Pot Challenge**.

---

## 🚀 What We Are Building

We are deploying a **public REST API** that:

1. Receives suspected scam messages
2. Detects scam intent
3. Activates an autonomous AI agent
4. Engages scammers in multi-turn conversations
5. Extracts scam intelligence (UPI, links, phone numbers, etc.)
6. Sends the final results to GUVI’s callback API

This is not a chatbot — it is a **fraud intelligence trap**.

---

## 🧠 High-Level Architecture
```

Incoming Message (GUVI)
↓
Scam Detection Engine
↓
(if scam)
Honeypot AI Agent (human-like)
↓
Intelligence Extractor
↓
Session Store
↓
Final Callback → GUVI API

```

Each API call represents **one message** in a conversation.
We maintain memory using **sessionId**.

---

## 🗂️ Project Structure

```

/app
├── main.py # FastAPI server (Teammate B)
├── session_manager.py # Session storage (Teammate B)
├── guvi_client.py # Final callback to GUVI (Teammate B)
├── llm_client.py # Shared LLM access
├── agent.py # Honeypot AI (You)
├── intelligence.py # Data extraction (You + Teammate A)

````

---

## 🧩 Core Data Object

All modules operate on a shared **Session** object.

```python
class Session:
    id: str
    history: list   # [{sender, text, timestamp}]
    scamDetected: bool
    intel: dict
    finished: bool
    agentNotes: str
````

The API layer stores and passes this object to all modules.

---

## 🤖 Honeypot AI (agent.py)

**Owner:** You

You implement:

```python
def agent_reply(session) -> str
```

The agent:

- Acts like a real Indian bank user
- Is worried but believable
- Tries to extract:
  - UPI IDs
  - Phone numbers
  - Links
  - Bank accounts

- Never accuses or reveals detection

The agent only sees:

```python
session.history
```

It returns the **next user reply** to send to the scammer.

---

## 🧪 Intelligence Extraction (intelligence.py)

**Owners:** You + Teammate A

You implement:

```python
def extract_intel(session)
```

It scans all messages and updates:

```python
session.intel = {
  "upiIds": [],
  "phoneNumbers": [],
  "phishingLinks": [],
  "bankAccounts": [],
  "suspiciousKeywords": []
}
```

Uses:

- Regex for exact patterns
- LLM for fuzzy or hidden data

This runs **after every message**.

---

## 🔗 LLM Access (llm_client.py)

All AI calls go through:

```python
def call_llm(prompt, json=False):
    ...
```

We use **API-based LLMs** (OpenAI, Gemini, Groq, Claude, etc.)
Local LLMs are **not used** due to reliability and deployment issues.

---

## 🌐 API Layer (main.py)

**Owner:** Teammate B

Endpoint:

```
POST /api/message
Header: x-api-key
```

Flow:

1. Load session
2. Append incoming message
3. Run scam detection
4. If scam → call agent
5. Add agent reply
6. Run intelligence extraction
7. If enough data → call GUVI callback
8. Return agent reply

---

## 📡 GUVI Final Callback (Mandatory)

When a scam session finishes, we POST:

```json
{
  "sessionId": "...",
  "scamDetected": true,
  "totalMessagesExchanged": 18,
  "extractedIntelligence": { ... },
  "agentNotes": "Used urgency and UPI redirection"
}
```

To:

```
https://hackathon.guvi.in/api/updateHoneyPotFinalResult
```

⚠️ If this is not sent → **No evaluation score**

---

## 🏆 How We Win

We win by:

- Making the agent feel human
- Keeping scammers engaged
- Extracting real, usable scam data
- Returning clean, structured intelligence

This is a **real-world grade AI honeypot**, not a chatbot.

---

```
::contentReference[oaicite:0]{index=0}
```
