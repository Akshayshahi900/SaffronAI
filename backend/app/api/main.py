import os
import logging
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import HTMLResponse

from app.core.session_manager import get_session
from app.core.agent import agent_reply
from app.core.intelligence import IntelligenceExtractor
from app.services.guvi_client import send_final_result

# Load .env file if present (no-op in production if env vars are already set)
load_dotenv(override=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev (later restrict this)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
extractor = IntelligenceExtractor()


def get_api_key() -> str:
    key = os.getenv("HONEYPOT_API_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Server misconfiguration: API key not set")
    return key


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

    if session.finished and not getattr(session, "callbackSent", False):
     send_final_result(session)
     session.callbackSent = True


    return {"status": "success", "reply": reply}


@app.head("/")
@app.get("/", response_class=HTMLResponse, status_code=200)
async def root_page():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Honeypot API</title>
        <style>
            body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                background: #0f172a;
                color: #e5e7eb;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
            }
            .card {
                background: #020617;
                border: 1px solid #1e293b;
                padding: 24px 32px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            }
            .status {
                color: #22c55e;
                font-size: 1.2rem;
                margin-top: 8px;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>🛡 Honeypot API</h1>
            <div class="status">Status: OK</div>
        </div>
    </body>
    </html>
    """

