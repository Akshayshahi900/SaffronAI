import os
from fastapi import FastAPI, Header, HTTPException, Request
from dotenv import load_dotenv
from app.session_manager import get_session
from app.agent.agent import agent_reply
from app.intelligence.intelligence import IntelligenceExtractor
from app.guvi_client import send_final_result
load_dotenv()
API_KEY = os.getenv("HONEYPOT_API_KEY")

app = FastAPI()
extractor = IntelligenceExtractor()

@app.post("/api/message")
async def process(request: Request, x_api_key: str = Header(...)):

    API_KEY = os.environ.get("HONEYPOT_API_KEY")

    if not API_KEY:
        raise HTTPException(status_code=500, detail="API key not loaded")

    if x_api_key.strip() != API_KEY.strip():
        raise HTTPException(status_code=403, detail="Invalid API key")

    body = await request.json()
    print("GUVI REQUEST BODY: " ,body)

    # GUVI-safe parsing
    session_id = body.get("sessionId", "default")
    raw_message = body.get("message")

    if isinstance(raw_message, dict):
        text = raw_message.get("text", "")
    elif isinstance(raw_message, str):
        text = raw_message
    else:
        text = (
            body.get("text") or
            body.get("msg") or
            body.get("data", {}).get("message") or
            body.get("data", {}).get("text") or
            ""
        )

    # Normalize to string ALWAYS
    text = str(text)


    if not text:
      return {
        "status": "error",
        "reason": "No message provided"
    }


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


@app.get("/")
async def health_check():
    return {
        "status": "ok",
        "service": "honeypot-api"
    }
