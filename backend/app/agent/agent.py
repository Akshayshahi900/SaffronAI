from llm_client import call_llm

def agent_reply(session):
    conversation = ""
    for m in session.history:
        conversation += f'{m["sender"]}: {m["text"]}\n'

    prompt = f"""
You are a real Indian bank user.
You think this is a real bank message.

Your personality:
- Slightly worried
- Uses UPI
- Polite
- Not stupid

Conversation:
{conversation}

Goals:
- Keep the scammer talking
- Ask natural questions
- Try to get UPI, phone number, payment link, or account number
- NEVER accuse or reveal scam detection

Reply as the USER.
Only return the message.
"""

    reply = call_llm(prompt)

    if "upi" in reply.lower():
        session.agentNotes += "Agent tried to elicit UPI. "

    return reply
