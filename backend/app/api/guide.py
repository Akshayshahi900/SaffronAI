# POST /api/message
#   → load session
#   → session.add()
#   → if not scam → detect
#   → if scam:
#        agent_reply(session)
#        extract_intel(session)
#        if session.finished → send GUVI callback
#   → return reply
