import os
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from app.session_manager import get_session
from app.agent.agent import agent_reply
from app.intelligence.intelligence import IntelligenceExtractor
from app.guvi_client import send_final_result

API_KEY = os.getenv("HONEYPOT_API_KEY")
app = FastAPI()
extractor = IntelligenceExtractor()

class Message(BaseModel):
    sender: str
    text: str
    timestamp: str

class RequestBody(BaseModel):
    sessionId: str
    message: Message
    conversationHistory: list = []
    metadata: dict = {}

@app.post("/api/message")
def process(req: RequestBody, x_api_key: str = Header(...)):
  if x_api_key != API_KEY:
    raise HTTPException(status_code=403, detail="Invalid API key")

    session = get_session(req.sessionId)

    # Add new message
    session.history = req.conversationHistory
    session.history.append({
        "sender": req.message.sender,
        "text": req.message.text
    })

    # Honeypot always activates if scam (simplified)
    reply = agent_reply(session)

    # Add agent reply
    session.history.append({"sender": "user", "text": reply})

    # Extract intelligence
    extractor.extract_intel(session)

    # If enough data → send to GUVI
    if session.finished:
        send_final_result(session)

    return {
        "status": "success",
        "reply": reply
    }
