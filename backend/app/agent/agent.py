import random

from app.llm_client import call_llm


PERSONAS = [
    "You are a 28-year-old working professional who uses PhonePe daily.",
    "You are a small shop owner who receives UPI payments from customers.",
    "You are a retired person who is afraid of bank issues.",
    "You are a job seeker who recently submitted bank details online."
]

def agent_reply(session):
    # Assign persona ONCE and store it in session.intel
    if not session.intel["persona"]:
        session.intel["persona"] = random.choice(PERSONAS)

    persona = session.intel["persona"]

    # Only last 6 messages to save tokens
    recent_history = session.history[-6:]

    conversation = ""
    for m in recent_history:
      sender = m.get("sender", "unknown")
      text = m.get("text", "")
      conversation += f"{sender}: {str(text)}\n"




    # Safe extraction of last scammer message
    last_scammer_msg = ""

    if session.history:
        raw_text = session.history[-1].get("text", "")
        last_scammer_msg = str(raw_text).lower()


    dynamic_instruction = ""

    instructions = []

    if "upi pin" in last_scammer_msg:
        instructions.append("You are confused about UPI PIN. Ask whether it is ATM PIN or something else.")

    if "otp" in last_scammer_msg:
        instructions.append("You say you are opening PhonePe and ask them to resend UPI ID or QR code.")

    if "transfer" in last_scammer_msg:
        instructions.append("Ask for transaction ID and exact timestamp of the transfer.")

    if "call" in last_scammer_msg or "+91" in last_scammer_msg:
        instructions.append("Ask if there is another official SBI number or email confirmation.")

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

Rules:
- Never accuse
- Never say "scam"
- Never refuse to cooperate
- If asked for money → ask for UPI ID, QR code, or payment link
- If asked for OTP → ask what transaction it is for
- If bank is mentioned → ask if it is SBI, HDFC, ICICI etc
- If a link is mentioned → ask if it is official

Additional behavior instruction:
{dynamic_instruction}

Reply naturally as the USER.
Only output the message.
"""

    reply = call_llm(prompt)

    if any(word in reply.lower() for word in ["otp", "verify", "blocked", "payment"]):
        session.agentNotes += "Scam pressure increasing. "

    return reply.strip()
