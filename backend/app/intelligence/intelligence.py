import re
from llm_client import call_llm

def extract_intel(session):
    text = " ".join([m["text"] for m in session.history])

    # Regex extraction
    session.intel["upiIds"] += re.findall(r"\b[\w.-]+@upi\b", text)
    session.intel["phoneNumbers"] += re.findall(r"\+91\d{10}", text)
    session.intel["phishingLinks"] += re.findall(r"https?://\S+", text)
    session.intel["bankAccounts"] += re.findall(r"\b\d{9,18}\b", text)

    # LLM extraction for fuzzy data
    prompt = f"""
Extract scam intelligence from this conversation.
Return JSON:
{{
 "upiIds": [],
 "phoneNumbers": [],
 "phishingLinks": [],
 "bankAccounts": [],
 "suspiciousKeywords": []
}}

Conversation:
{text}
"""

    intel = call_llm(prompt, json_mode=True)

    for k in session.intel:
        session.intel[k] += intel.get(k, [])
