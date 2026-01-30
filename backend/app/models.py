from typing import List, Dict

class Message:
    def __init__(self, sender: str, text: str):
        self.sender = sender   # "scammer" | "user"
        self.text = text

class Session:
    def __init__(self, session_id: str):
        self.id = session_id
        self.history: List[Dict] = []
        self.scamDetected = False
        self.finished = False
        self.agentNotes = ""

        self.intel = {
            "upiIds": [],
            "phoneNumbers": [],
            "phishingLinks": [],
            "bankAccounts": [],
            "suspiciousKeywords": []
        }

    def add(self, sender, text):
        self.history.append({"sender": sender, "text": text})
