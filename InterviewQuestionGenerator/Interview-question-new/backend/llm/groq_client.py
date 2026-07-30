import os
import json
import httpx
from dotenv import load_dotenv

# Load .env from backend directory (override=True to override existing env vars)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"), override=True)

class GroqClient:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.model_name = os.getenv("MODEL_NAME", "llama-3.1-8b-instant")
        self.api_url = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")

    def generate(self, prompt, system_prompt="You are a helpful interview assistant."):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        body = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.0,
            "top_p": 1,
            "max_tokens": 2048,
            "n": 1
        }

        try:
            with httpx.Client(timeout=60.0) as client:
                response = client.post(self.api_url, headers=headers, json=body)
                response.raise_for_status()
                payload = response.json()

            if "choices" not in payload or len(payload["choices"]) == 0:
                print("Groq API response missing choices:", payload)
                return None

            content = payload["choices"][0].get("message", {}).get("content")
            if content is None:
                print("Groq API response message content missing:", payload)
                return None

            return content
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print("Groq response text:", e.response.text)
            return None
