import re
import json
from app.llm_client import call_llm

class IntelligenceExtractor:
    def __init__(self):
        # Regex patterns for high-accuracy extraction of standard Indian formats
        self.patterns = {
            "upiIds": r'[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}',
            "bankAccounts": r'(?:account|a\/c|acc|bank)\D{0,10}(\d{10,16})',
            "phishingLinks": r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[/\w\.-]*',
            "phoneNumbers": r'\b(?:\+91|91)?[6-9]\d{9}\b'
        }

    def _regex_step(self, text):
      extracted = {}
      for key, pattern in self.patterns.items():
        matches = re.findall(pattern, text, re.IGNORECASE)

        # If regex has capture groups, flatten
        if matches and isinstance(matches[0], tuple):
            matches = [m[0] for m in matches]

        extracted[key] = list(set(matches))
      return extracted

    def extract_intel(self, session):
        """
        Main function for Teammate A.
        Updates session.intel by analyzing history with Regex + LLM.
        Supports: English, Hindi, Tamil, Telugu, and Malayalam.
        """

        # 1. Prepare conversation context
        # We analyze the entire history to find data leaked across multiple messages
        full_chat_context = "\n".join([f"{m['sender']}: {m['text']}" for m in session.history])

        # 2. Fast Extraction: Regex
        regex_data = self._regex_step(full_chat_context)

        # 3. Intelligent Extraction: LLM
        # This part handles translation and finding 'fuzzy' data in the 5 languages
        prompt = f"""
        You are a Cyber-Forensics Expert. Analyze this honeypot chat history.
        The text may contain English, Hindi, Tamil, Telugu, or Malayalam.

        CHAT HISTORY:
        {full_chat_context}

        DATA ALREADY FOUND (REGEX):
        {json.dumps(regex_data)}

        YOUR TASK:
        1. Extract any UPI IDs, Bank Accounts, or Phone Numbers that are written in words or local scripts.
        2. Identify 'suspiciousKeywords' (e.g., urgency, threats, lottery, KYC).
        3. Identify the 'persona' the scammer is using.
        4. Identify the 'detectedLanguage'.

        Return ONLY a JSON object:
        {{
          "upiIds": [],
          "phoneNumbers": [],
          "phishingLinks": [],
          "bankAccounts": [],
          "suspiciousKeywords": [],
          "detectedLanguage": "string",
          "persona": "string"
        }}
        """

        try:
            # Call the shared LLM client provided by Teammate B
            llm_result = call_llm(prompt, json_mode=True)

            # 4. Merge Results (Combine Regex + LLM and remove duplicates)
            session.intel = {
                "upiIds": list(set(regex_data['upiIds'] + llm_result.get('upiIds', []))),
                "phoneNumbers": list(set(regex_data['phoneNumbers'] + llm_result.get('phoneNumbers', []))),
                "phishingLinks": list(set(regex_data['phishingLinks'] + llm_result.get('phishingLinks', []))),
                "bankAccounts": list(set(regex_data['bankAccounts'] + llm_result.get('bankAccounts', []))),
                "suspiciousKeywords": list(set(llm_result.get('suspiciousKeywords', []))),
                "language": llm_result.get('detectedLanguage', 'Multilingual'),
                "persona": llm_result.get('persona', 'Scammer')
            }
            session.intel["confidence"] = min(
              0.95,0.4 + 0.15 * (
              len(session.intel["upiIds"]) +
              len(session.intel["phoneNumbers"]) +
              len(session.intel["phishingLinks"])
              ))
            if ( len(session.intel["upiIds"]) > 0 or
                  len(session.intel["phishingLinks"]) > 0 or
                  len(session.intel["phoneNumbers"]) > 0
                  ):
                      session.finished = True


            # Update agentNotes so Teammate B has context for the GUVI callback
            session.agentNotes = f"Language: {session.intel['language']} | Persona: {session.intel['persona']}"

        except Exception as e:
            # Fallback to Regex data if LLM call fails
            print(f"Extraction Error: {e}")
            session.intel = regex_data
            session.intel['language'] = "Detection Failed"
            session.intel['persona'] = "Unknown"
