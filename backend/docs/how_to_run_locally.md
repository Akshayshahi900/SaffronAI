# 🧪 1️⃣ Run Your API Locally (Baseline)

From `backend/`:

```bash
export GROQ_API_KEY="your_groq_key"
export HONEYPOT_API_KEY="test-secret"

uvicorn app.main:app --reload --port 8000
```

Check health:

```bash
curl http://127.0.0.1:8000/
```

Expected:

```json
{"status":"ok","service":"honeypot-api"}
```

# 2️⃣ Mimic GUVI `/api/message` Test Call (MOST IMPORTANT)

GUVI usually sends **JSON with sessionId + message**, sometimes nested.

### ✅ Basic GUVI-style request

```bash
curl -X POST http://127.0.0.1:8000/api/message \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-secret" \
  -d '{
    "sessionId": "guvi-test-001",
    "message": "URGENT: Your SBI account is blocked. Share OTP immediately."
  }'
```

Expected:

```json
{
  "status": "success",
  "reply": "..."
}
```

---

# 🔁 3️⃣ Multi-Turn Scam Simulation (REALISTIC)

Run these **one by one**, same `sessionId`.

### Step 1

```bash
curl -X POST http://127.0.0.1:8000/api/message \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-secret" \
  -d '{
    "sessionId": "guvi-test-002",
    "message": "Your SBI account is compromised."
  }'
```

### Step 2

```bash
curl -X POST http://127.0.0.1:8000/api/message \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-secret" \
  -d '{
    "sessionId": "guvi-test-002",
    "message": "Send OTP or transfer ₹1 to scammer.fraud@fakebank"
  }'
```

At this point:

* `session.finished = True`
* Callback should trigger

---

# 📡 4️⃣ Mimic GUVI Callback Receiver (CRITICAL)

GUVI expects **your server → their server** callback.

To test locally, **mock GUVI**:

### Start a fake GUVI server
from app directory on different terminal
```bash
python mock_guvi_client.py
```

### Temporarily change `guvi_client.py`

```python
GUVI_URL = "http://127.0.0.1:9000"
```

Now when callback fires, you’ll see POSTs in terminal.

---

# 🌍 5️⃣ Test Multilingual (Hindi / Hinglish)

```bash
curl -X POST http://127.0.0.1:8000/api/message \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-secret" \
  -d '{
    "sessionId": "guvi-hindi-001",
    "message": "Aapka bank account block hone wala hai, turant OTP bhejiye"
  }'
```

If:

* Agent replies normally
* Regex extracts nothing but LLM fills intel

✅ Multilingual support works.

---

# 🧠 6️⃣ Verify Callback Logic Manually

Add **temporary log** (ONLY FOR LOCAL):

```python
if session.finished:
    print("CALLBACK TRIGGERED FOR", session.id)
```

This confirms:

* Not early
* Not late
* Exactly once

---

# 🚨 Common Mistakes (Avoid These)

❌ Changing sessionId every request
❌ Forgetting `x-api-key`
❌ Testing only one message
❌ Depending on frontend UI

**curl is truth. UI lies.**

---

# 🏁 Final Mental Model (Remember This)

* curl = judge simulator
* sessionId = conversation memory
* callback = evidence delivery
* UI = optional

If curl works → **you are safe**

---

If you want next:

* I can give you **one shell script** that runs a full scam flow
* Or a **pre-pitch checklist** (“run these 3 curls and stop”)

Just tell me.
