import os
from fastapi import FastAPI, Header, HTTPException, Request

from app.session_manager import get_session
from app.agent.agent import agent_reply
from app.intelligence.intelligence import IntelligenceExtractor
from app.guvi_client import send_final_result

API_KEY = os.getenv("HONEYPOT_API_KEY")

app = FastAPI()
extractor = IntelligenceExtractor()

@app.post("/api/message")
async def process(request: Request, x_api_key: str = Header(...)):

    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")

    body = await request.json()

    # GUVI-safe parsing
    session_id = body.get("sessionId", "default")
    text = body.get("message") or body.get("text") or ""

    session = get_session(session_id)

    # Treat incoming as scammer message
    session.history.append({
        "sender": "scammer",
        "text": text
    })

    reply = agent_reply(session)

    session.history.append({
        "sender": "user",
        "text": reply
    })

    extractor.extract_intel(session)

    if session.finished:
        send_final_result(session)

    return {
        "status": "success",
        "reply": reply
    }
