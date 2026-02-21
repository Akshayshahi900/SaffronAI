import random
from app.services.llm_client import call_llm


PERSONAS = [
    "You are a 28-year-old working professional who uses PhonePe daily.",
    "You are a small shop owner who receives UPI payments from customers.",
    "You are a retired person who is afraid of bank issues.",
    "You are a job seeker who recently submitted bank details online."
]


def agent_reply(session):
    turn = len(session.history)

    # 🔁 Intent ladder (turn-based, review-safe)
    if turn <= 2:
        intent = "confused"
    elif turn <= 4:
        intent = "verify_identity"
    elif turn <= 6:
        intent = "delay_and_probe"
    else:
        intent = "extract_and_exhaust"

    # 🧍 Assign honeypot persona ONCE (not part of intelligence)
    if not hasattr(session, "persona"):
        session.persona = random.choice(PERSONAS)

    persona = session.persona

    # 🔥 Token-safe conversation window
    recent_history = session.history[-6:]
    conversation = ""
    for m in recent_history:
        sender = m.get("sender", "unknown")
        text = m.get("text", "")
        conversation += f"{sender}: {text}\n"

    # 🕵️ Last scammer message (safe)
    last_scammer_msg = ""
    if session.history:
        last_scammer_msg = str(session.history[-1].get("text", "")).lower()

    instructions = []

    if "upi pin" in last_scammer_msg:
        instructions.append(
            "You are confused about UPI PIN and ask whether it is ATM PIN or something else."
        )

    if "otp" in last_scammer_msg:
        instructions.append(
            "You say you are opening PhonePe and ask what transaction the OTP is for."
        )

    if "transfer" in last_scammer_msg:
        instructions.append(
            "Ask for the transaction ID and exact timestamp of the transfer."
        )

    if "call" in last_scammer_msg or "+91" in last_scammer_msg:
        instructions.append(
            "Ask if there is another official bank number or email confirmation."
        )

    # 🔥 Forced extraction ONLY in final intent
    if intent == "extract_and_exhaust":
        instructions.append(
            "Say the OTP expired and ask them to resend it and confirm the UPI ID again."
        )

    dynamic_instruction = "\n".join(instructions)

    prompt = f"""
{persona}

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

Intent for this reply: {intent}

Behavior per intent:
- confused: Ask what exactly happened and when
- verify_identity: Ask for employee ID, branch, or official contact
- delay_and_probe: Say app is loading, ask to repeat UPI ID or phone number
- extract_and_exhaust: Ask for resend OTP, case ID, escalation email

Rules:
- Never accuse
- Never say "scam"
- Never refuse to cooperate
- If asked for money → ask for UPI ID, QR code, or payment link
- If asked for OTP → ask what transaction it is for
- If bank is mentioned → ask which bank (SBI, HDFC, ICICI, etc.)
- If a link is mentioned → ask if it is official
- At least one reply must ask for:
  - official phone number
  - case ID or ticket number
  - bank branch or department
- If UPI is mentioned → ask to repeat it slowly
- If OTP is mentioned → ask resend due to expiry

Additional behavior instruction:
{dynamic_instruction}

Reply naturally as the USER.
Only output the message.
"""

    reply = call_llm(prompt)

    # 🧠 Light pressure annotation (non-invasive)
    if any(word in reply.lower() for word in ["otp", "verify", "blocked", "payment"]):
        session.agentNotes += "Scam pressure increasing. "

    return reply.strip()
