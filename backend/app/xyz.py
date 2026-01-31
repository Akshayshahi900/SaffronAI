import os, json, re
from fastapi import FastAPI, Header, HTTPException, Depends
from pydantic import BaseModel
from groq import Groq
from typing import List

# 1. Setup
app = FastAPI()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
API_KEY_SECRET = "HACKATHON_REWARD_2024" # This is your x-api-key

# 2. Data Models
class ScammerInput(BaseModel):
    message: str

class Intelligence(BaseModel):
    bank_accounts: List[str]
    upi_ids: List[str]
    phishing_links: List[str]

class FinalResponse(BaseModel):
    persona_reply: str
    extracted_intelligence: Intelligence

# 3. Robust Extraction Logic (Fix for Issue #27)
def extract_intel(text):
    prompt = f"Extract all bank accounts, UPI IDs, and links from: {text}. Return ONLY JSON."
    completion = client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1
    )
    raw_content = completion.choices[0].message.content
    match = re.search(r'(\{.*\}|\[.*\])', raw_content, re.S)
    if match:
        try:
            data = json.loads(match.group(0))
            return {
                "bank_accounts": data.get("bank_accounts", []),
                "upi_ids": data.get("upi_ids", []),
                "phishing_links": data.get("phishing_links", [])
            }
        except: pass
    return {"bank_accounts": [], "upi_ids": [], "phishing_links": []}

# 4. THE ENDPOINT THE TESTER WILL CALL
@app.post("/test-honeypot")
async def handle_test(data: ScammerInput, x_api_key: str = Header(None)):
    # Validate Security Header
    if x_api_key != API_KEY_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Get the AI Persona response
    persona_reply = "Oh dear, I'm not sure how to do that. Can you explain the bank process again?"
    
    # Extract Data
    intelligence = extract_intel(data.message)

    return {
        "persona_reply": persona_reply,
        "extracted_intelligence": intelligence
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)