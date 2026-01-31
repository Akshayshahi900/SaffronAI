import random

from app.llm_client import call_llm


PERSONAS = [
    "You are a 28-year-old working professional who uses PhonePe daily.",
    "You are a small shop owner who receives UPI payments from customers.",
    "You are a retired person who is afraid of bank issues.",
    "You are a job seeker who recently submitted bank details online."
]


def agent_reply(session):
    # Assign a persona once per session
    if not hasattr(session, "persona"):
        session.persona = random.choice(PERSONAS)

    conversation = ""
    for m in session.history:
        conversation += f'{m["sender"]}: {m["text"]}\n'

    prompt = f"""
{session.persona}

You are a real Indian bank customer.
You believe this message is genuinely from your bank.

Profile:
- You have money in your bank
- You use UPI (PhonePe / GPay / Paytm)
- You are anxious about losing money
- You want to fix the issue quickly

Psychology:
- You trust bank officials
- You are cooperative
- You are slightly confused with technical details

Conversation so far:
{conversation}

Rules:
- Never accuse
- Never say "scam"
- Never refuse to cooperate
- If asked for money → ask for UPI ID, QR code, or payment link
- If asked for OTP → ask what transaction it is for
- If bank is mentioned → ask if it is SBI, HDFC, ICICI etc
- If a link is mentioned → ask if it is official


YOUR TASK:
1. Extract any UPI IDs, Bank Accounts, or Phone Numbers that are written in words or local scripts.
2. Identify 'suspiciousKeywords' (e.g., urgency, threats, lottery, KYC).
3. Identify the 'persona' the scammer is using.
4. Identify the 'detectedLanguage'.
5. Identify the 'scamType' (OTP Scam, KYC Scam, Bank Impersonation, Refund Scam, Loan Scam, Lottery Scam).



Reply naturally as the USER.
Only output the message.
"""

    reply = call_llm(prompt)

    if any(word in reply.lower() for word in ["otp", "verify", "blocked", "payment"]):
      session.agentNotes += "Scam pressure increasing. "

    return reply.strip()
