import re
import json
from app.llm_client import call_llm

class IntelligenceExtractor:
    def __init__(self):
        self.patterns = {
            "upiIds": r'[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}',
            "bankAccounts": r'(?:account|a\/c|acc|bank)\D{0,10}(\d{10,16})',
            "phishingLinks": r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[/\w\.-]*',
            "phoneNumbers": r'\b(?:\+91[-\s]?|91[-\s]?)?[6-9]\d{9}\b'
        }

    def _regex_step(self, text):
        extracted = {}
        for key, pattern in self.patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches and isinstance(matches[0], tuple):
                matches = [m[0] for m in matches]
            extracted[key] = list(set(matches))
        return extracted

    def extract_intel(self, session):

        # 🔥 Token-safe context (last 6 messages)
        recent = session.history[-6:]
        full_chat_context = "\n".join([f"{m['sender']}: {m['text']}" for m in recent])

        regex_data = self._regex_step(full_chat_context)

        prompt = f"""
You are a Cyber-Forensics Expert.

CHAT HISTORY:
{full_chat_context}

DATA ALREADY FOUND (REGEX):
{json.dumps(regex_data)}

YOUR TASK:
1. Extract any UPI IDs, Bank Accounts, or Phone Numbers written in words or local scripts.
2. Identify suspiciousKeywords (urgency, threats, lottery, KYC, etc).
3. Identify persona.
4. Identify detectedLanguage.
5. Identify scamType (OTP Scam, KYC Scam, Bank Impersonation, Refund Scam, Loan Scam, Lottery Scam).

Return ONLY a JSON object:
{{
  "upiIds": [],
  "phoneNumbers": [],
  "phishingLinks": [],
  "bankAccounts": [],
  "suspiciousKeywords": [],
  "detectedLanguage": "string",
  "persona": "string",
  "scamType": "string"
}}
"""

        try:
            llm_result = call_llm(prompt, json_mode=True)

            session.intel = {
                "upiIds": list(set(regex_data['upiIds'] + llm_result.get('upiIds', []))),
                "phoneNumbers": list(set(regex_data['phoneNumbers'] + llm_result.get('phoneNumbers', []))),
                "phishingLinks": list(set(regex_data['phishingLinks'] + llm_result.get('phishingLinks', []))),
                "bankAccounts": list(set(regex_data['bankAccounts'] + llm_result.get('bankAccounts', []))),
                "suspiciousKeywords": list(set(llm_result.get('suspiciousKeywords', []))),
                "language": llm_result.get('detectedLanguage', 'Multilingual'),
                "persona": llm_result.get('persona', 'Scammer'),
                "scamType": llm_result.get('scamType', 'Unknown')
            }

            signals = (
                len(session.intel["upiIds"]) * 2 +
                len(session.intel["phoneNumbers"]) * 2 +
                len(session.intel["phishingLinks"]) * 3 +
                len(session.intel["suspiciousKeywords"])
            )

            session.intel["confidence"] = min(0.99, 0.3 + 0.08 * signals)

            infer_attack_flow(session)
            calculate_risk(session)


            #session.finished =true
            intel_count = (
              len(session.intel.get("upiIds", [])) +
              len(session.intel.get("phishingLinks", [])) +
              len(session.intel.get("phoneNumbers", [])) +
              len(session.intel.get("bankAccounts", []))
           )

          #   if intel_count >= 1 and len(session.history) >= 6:
          #     session.finished = True
            if intel_count >= 1:
              session.finished = True


            session.agentNotes = f"Language: {session.intel['language']} | Role: Honeypot Victim"

        except Exception as e:
            print(f"Extraction Error: {e}")
            session.intel = regex_data
            session.intel["language"] = "Detection Failed"
            session.intel["persona"] = "Unknown"
            session.intel["confidence"] = 0.3


# 🔥 Kill-chain reconstruction
def infer_attack_flow(session):
    flow = []
    keywords = " ".join(session.intel["suspiciousKeywords"]).lower()

    if "bank" in keywords or "account" in keywords:
        flow.append("Bank Impersonation")

    if "blocked" in keywords or "suspend" in keywords:
        flow.append("Fear Creation")

    if "kyc" in keywords or "verify" in keywords:
        flow.append("KYC Pressure")

    if session.intel["phoneNumbers"]:
        flow.append("Direct Contact")

    if session.intel["phishingLinks"]:
        flow.append("Phishing Link Delivery")

    if session.intel["upiIds"] or session.intel["bankAccounts"]:
        flow.append("Payment Redirection")

    if not flow:
        flow.append("Social Engineering")

    session.intel["attackFlow"] = flow


# 🔥 Financial damage estimation
def calculate_risk(session):
    scam = session.intel["scamType"]
    base = session.intel["confidence"]

    scam_multiplier = {
        "OTP Scam": 1.3,
        "KYC Scam": 1.4,
        "Bank Impersonation": 1.5,
        "Refund Scam": 1.2,
        "Loan Scam": 1.1,
        "Lottery Scam": 1.2
    }.get(scam, 1.0)

    urgency = 1 + (len(session.intel["suspiciousKeywords"]) * 0.05)

    risk = min(1.0, base * scam_multiplier * urgency)
    session.intel["riskScore"] = round(risk, 2)

    if risk > 0.85:
        session.intel["potentialLossINR"] = "₹50,000 - ₹2,00,000"
    elif risk > 0.7:
        session.intel["potentialLossINR"] = "₹20,000 - ₹1,00,000"
    elif risk > 0.5:
        session.intel["potentialLossINR"] = "₹5,000 - ₹50,000"
    else:
        session.intel["potentialLossINR"] = "Low"
