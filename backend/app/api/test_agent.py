from types import Session
from agent import agent_reply
from intelligence import extract_intel

s = Session("test1")

s.add("scammer", "Your bank account will be blocked. Verify now.")
print(agent_reply(s))

s.add("scammer", "Send your UPI ID to avoid suspension.")
print(agent_reply(s))

extract_intel(s)
print(s.intel)
