import json
import os
from llm.groq_client import GroqClient


def extract_json_object(text):
    text = text.strip()
    if not text:
        return None

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        decoder = json.JSONDecoder()
        idx = 0
        while idx < len(text):
            if text[idx] in " \t\r\n":
                idx += 1
                continue
            try:
                obj, end = decoder.raw_decode(text[idx:])
                return obj
            except json.JSONDecodeError:
                idx += 1
        return None


def generate_interview_questions(resume_text):
    """
    Generates interview questions based on the resume and the provided resume text.
    """
    client = GroqClient()

    system_prompt = """
    You are an expert technical interviewer. You generate high-quality, resume-specific interview questions.

    RULES:
    - ALWAYS return only a valid JSON object and nothing else.
    - Do not include markdown, code fences, or explanatory text.
    - Questions MUST be based STRICTLY on the provided resume.
    - If a technology is mentioned, ask questions about its concepts and application.
    - If projects/experience are mentioned, ask about implementation details, challenges, and results.
    - For metrics/claims, ask for baseline (before), measurement (how it was calculated), and proof (evidence).
    - Organize questions into 5 sessions:
      1. projects (Project-specific deep dives)
      2. experience (Past roles/responsibilities)
      3. technical (Skills/tech stack verification)
      4. verification (Deep-dive into claims/numbers)
      5. behavioral (Personality/soft skills in context of their history)
    - Each session must contain 3 difficulties: easy, medium, hard.
    """

    user_prompt = f"""
    USER RESUME TEXT:
    {resume_text}

    GENERATE QUESTIONS NOW. Return ONLY a valid JSON object with this exact structure. Each question must be a plain STRING, not an object. Example:
    {{
      "session_1_projects": {{"easy": ["What was the main objective of this project?", "Describe the technology stack"], "medium": ["..."], "hard": ["..."]}},
      "session_2_experience": {{"easy": [], "medium": [], "hard": []}},
      "session_3_technical": {{"easy": [], "medium": [], "hard": []}},
      "session_4_verification": {{"easy": [], "medium": [], "hard": []}},
      "session_5_behavioral": {{"easy": [], "medium": [], "hard": []}}
    }}
    """

    response = client.generate(user_prompt, system_prompt)
    if response:
        try:
            parsed = extract_json_object(response)
            if parsed is not None:
                return parsed
            return {"error": f"Failed to parse JSON response from LLM: response was not valid JSON. Raw response: {response[:500]}"}
        except Exception as e:
            return {"error": f"Failed to parse JSON response from LLM: {e}. Raw response: {response[:500]}"}
    return {"error": "LLM generation failed"}
