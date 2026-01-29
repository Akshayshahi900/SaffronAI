import os
import requests
import json

OPENAI_KEY = os.getenv("OPENAI_KEY")

def call_llm(prompt, json_mode=False):
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant"},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        },
        timeout=20
    )

    text = response.json()["choices"][0]["message"]["content"]

    if json_mode:
        return json.loads(text)

    return text.strip()
