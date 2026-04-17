import os
import logging
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import HTMLResponse

from app.core.session_manager import get_session, SESSIONS
from app.core.agent import agent_reply
from app.core.intelligence import IntelligenceExtractor
from app.services.guvi_client import send_final_result

load_dotenv(override=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
extractor = IntelligenceExtractor()

# ── In-memory callback store ─────────────────────────────────────────────────
# Stores the final callback payload per sessionId so the frontend can poll it
CALLBACK_STORE: dict = {}


def get_api_key() -> str:
    key = os.getenv("HONEYPOT_API_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Server misconfiguration: API key not set")
    return key


# ── POST /api/message ────────────────────────────────────────────────────────
@app.post("/api/message")
async def process(request: Request, x_api_key: str = Header(...)):
    if x_api_key.strip() != get_api_key().strip():
        raise HTTPException(status_code=403, detail="Invalid API key")

    body = await request.json()
    session_id = body.get("sessionId", "default")
    raw_message = body.get("message")

    if isinstance(raw_message, dict):
        text = raw_message.get("text", "")
    elif isinstance(raw_message, str):
        text = raw_message
    else:
        text = (
            body.get("text")
            or body.get("msg")
            or body.get("data", {}).get("message")
            or body.get("data", {}).get("text")
            or ""
        )

    text = str(text).strip()
    if not text:
        return {"status": "error", "reason": "No message provided"}

    session = get_session(session_id)
    session.history.append({"sender": "scammer", "text": text})

    try:
        reply = agent_reply(session)
    except Exception as e:
        logger.error(f"agent_reply failed for session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Agent error")

    session.history.append({"sender": "user", "text": reply})

    try:
        extractor.extract_intel(session)
    except Exception as e:
        logger.warning(f"Intel extraction failed for session {session_id}: {e}")

    # ── Trigger callback when session finishes ───────────────────────────────
    callback_payload = None
    if session.finished and not getattr(session, "callbackSent", False):
        callback_payload = build_callback_payload(session)
        CALLBACK_STORE[session_id] = callback_payload   # save for frontend polling
        send_final_result(session)                       # still send to GUVI
        session.callbackSent = True

    # ── Return intel inline so frontend updates immediately ──────────────────
    return {
        "status": "success",
        "reply": reply,
        "intel": session.intel,
        "finished": session.finished,
        "callbackPayload": callback_payload,
    }


# ── GET /api/session/{session_id}/intel ─────────────────────────────────────
# Returns current live intel for any session — frontend polls this
@app.get("/api/session/{session_id}/intel")
async def get_intel(session_id: str, x_api_key: str = Header(...)):
    if x_api_key.strip() != get_api_key().strip():
        raise HTTPException(status_code=403, detail="Invalid API key")

    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "sessionId": session_id,
        "intel": session.intel,
        "finished": session.finished,
        "totalMessages": len(session.history),
    }


# ── GET /api/session/{session_id}/callback ───────────────────────────────────
# Returns the stored callback payload once session is finished
@app.get("/api/session/{session_id}/callback")
async def get_callback(session_id: str, x_api_key: str = Header(...)):
    if x_api_key.strip() != get_api_key().strip():
        raise HTTPException(status_code=403, detail="Invalid API key")

    payload = CALLBACK_STORE.get(session_id)
    if payload:
        return {"found": True, "payload": payload}

    # Session exists but callback not fired yet
    session = SESSIONS.get(session_id)
    if session:
        return {
            "found": False,
            "finished": session.finished,
            "totalMessages": len(session.history),
        }

    return {"found": False, "finished": False, "totalMessages": 0}


# ── Helper: build callback payload ──────────────────────────────────────────
def build_callback_payload(session) -> dict:
    return {
        "sessionId": session.id,
        "scamDetected": session.intel.get("confidence", 0) >= 0.6,
        "totalMessagesExchanged": len(session.history),
        "engagementDurationSeconds": max(60, len(session.history) * 20),
        "extractedIntelligence": {
            "bankAccounts": session.intel.get("bankAccounts", []),
            "upiIds": session.intel.get("upiIds", []),
            "phishingLinks": session.intel.get("phishingLinks", []),
            "phoneNumbers": session.intel.get("phoneNumbers", []),
            "emailAddresses": [],
            "caseIds": [],
        },
        "scamType": session.intel.get("scamType"),
        "confidenceLevel": session.intel.get("confidence"),
        "agentNotes": (
            session.agentNotes
            + f" AttackFlow={session.intel.get('attackFlow')}, "
            + f"Risk={session.intel.get('riskScore')}"
        ),
    }


# ── Health check ─────────────────────────────────────────────────────────────
@app.head("/")
@app.get("/", response_class=HTMLResponse, status_code=200)
async def root_page():
    return """
    <!DOCTYPE html><html lang="en">
    <head><meta charset="UTF-8"><title>Honeypot API</title>
    <style>
      body { font-family: system-ui; background:#0f172a; color:#e5e7eb;
             display:flex; align-items:center; justify-content:center;
             height:100vh; margin:0; }
      .card { background:#020617; border:1px solid #1e293b; padding:24px 32px;
              border-radius:12px; text-align:center; }
      .status { color:#22c55e; font-size:1.2rem; margin-top:8px; }
    </style></head>
    <body><div class="card"><h1>🛡 Honeypot API</h1>
    <div class="status">Status: OK</div></div></body></html>
    """
