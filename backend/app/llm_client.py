from groq import Groq
import os
import json

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def call_llm(prompt, json_mode=False):
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a helpful assistant"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )

    text = completion.choices[0].message.content

    if json_mode:
        return json.loads(text)

    return text.strip()
