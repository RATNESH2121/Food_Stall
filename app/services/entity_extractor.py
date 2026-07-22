from app.services.ai_service import generate_json_structured
from app.services.prompt_templates import ENTITY_EXTRACTION_PROMPT
import logging

logger = logging.getLogger(__name__)

async def extract_order_entities(text: str) -> dict:
    """
    Extracts structured entities from an order string.
    Returns:
    {
        "items": [{"item_name": "Burger", "quantity": 2}],
        "pickup_date": "Tomorrow",
        "pickup_time": "1 PM",
        "stall_name": "Food Court A"
    }
    """
    try:
        entities = await generate_json_structured(
            prompt=text,
            system_instruction=ENTITY_EXTRACTION_PROMPT
        )
        
        # Enforce defaults if AI missed something
        if not isinstance(entities, dict):
            entities = {}
        if "items" not in entities or not isinstance(entities["items"], list):
            entities["items"] = []
            
        return entities
    except Exception as e:
        logger.error(f"Entity extraction failed: {e}")
        raise
