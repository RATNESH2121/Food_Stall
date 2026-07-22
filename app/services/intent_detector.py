from app.services.ai_service import generate_completion
from app.services.prompt_templates import INTENT_DETECTION_PROMPT
import logging

logger = logging.getLogger(__name__)

async def detect_intent(text: str) -> str:
    """
    Detects the user's intent using Gemini.
    """
    try:
        intent = await generate_completion(
            prompt=text,
            system_instruction=INTENT_DETECTION_PROMPT
        )
        
        # Clean up common variations returned by AI
        intent = intent.strip('\'" \n')
        
        valid_intents = [
            "Greeting", "Browse Menu", "Browse Food Stalls",
            "Place Order", "Track Order", "Cancel Order",
            "Help", "General Question"
        ]
        
        if intent in valid_intents:
            return intent
            
        logger.warning(f"AI returned unrecognized intent: {intent}. Defaulting to 'General Question'.")
        return "General Question"
        
    except Exception as e:
        logger.error(f"Intent detection failed: {e}")
        raise
