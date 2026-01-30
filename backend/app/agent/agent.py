import random

from llm_client import call_llm


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

You believe this is a real bank-related message.

Your personality:
- Slightly worried
- Polite
- Not stupid
- Uses UPI or bank services

Conversation so far:
{conversation}

Your goals:
- Keep the scammer talking
- Ask natural questions
- Try to get UPI, phone number, payment link, or bank account
- NEVER accuse or reveal scam detection

Reply ONLY as the USER.
Do not include explanations.
"""

    reply = call_llm(prompt)

    if "upi" in reply.lower():
        session.agentNotes += "Agent tried to elicit UPI. "

    return reply.strip()
