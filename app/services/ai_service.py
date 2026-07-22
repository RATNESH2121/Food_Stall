import google.generativeai as genai
from app.config import settings
import json
import logging

logger = logging.getLogger(__name__)

# Initialize Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is missing. AI features will fallback.")

def get_model(model_name="gemini-2.5-flash"):
    return genai.GenerativeModel(model_name)

async def generate_completion(prompt: str, system_instruction: str = None) -> str:
    """Generates standard text completion."""
    try:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY missing")
            
        model = genai.GenerativeModel("gemini-2.5-flash", system_instruction=system_instruction)
        response = await model.generate_content_async(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini generate_completion error: {str(e)}")
        raise

async def generate_json_structured(prompt: str, system_instruction: str = None) -> dict:
    """Generates structured JSON."""
    try:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY missing")
            
        model = genai.GenerativeModel(
            "gemini-2.5-flash", 
            system_instruction=system_instruction,
            generation_config={"response_mime_type": "application/json"}
        )
        response = await model.generate_content_async(prompt)
        text = response.text.strip()
        
        # Clean markdown code blocks if the model ignored instructions
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        logger.error(f"Gemini generate_json_structured error: {str(e)}")
        raise
