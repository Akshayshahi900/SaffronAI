import os, requests, json

GROQ_KEY = os.getenv("GROQ_API_KEY")

def call_llm(prompt, json_mode=False):
    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama3-70b-8192",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant"},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        },
        timeout=20
    )

    text = r.json()["choices"][0]["message"]["content"]
    if json_mode:
        return json.loads(text)
    return text.strip()
