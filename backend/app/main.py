import os
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import HTMLResponse
from app.session_manager import get_session
from app.agent.agent import agent_reply
from app.intelligence.intelligence import IntelligenceExtractor
from app.guvi_client import send_final_result

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
    # print("GUVI REQUEST BODY: " ,body)

    # GUVI-safe parsing
    session_id = body.get("sessionId", "default")
    text = (
    body.get("message") or
    body.get("text") or
    body.get("msg") or
    body.get("data", {}).get("message") or
    body.get("data", {}).get("text") or
    ""
    )

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

