from groq import Groq
import os, json, re

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def call_llm(prompt, json_mode=False):
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a helpful assistant"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    text = completion.choices[0].message.content.strip()

    if not json_mode:
        return text

    # 🛡️ Extract JSON safely from messy LLM output
    match = re.search(r'\{.*\}', text, re.S)
    if not match:
        raise ValueError("LLM did not return JSON")

    return json.loads(match.group())
