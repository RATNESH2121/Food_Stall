from app.services.ai_service import generate_completion
from app.services.prompt_templates import RECOMMENDATION_PROMPT
from app.database import menu_collection
import logging

logger = logging.getLogger(__name__)

async def generate_recommendations(query: str) -> str:
    """
    Fetches available menu items and uses AI to recommend based on the query.
    """
    try:
        # Fetch active menu items (limit to 50 to fit context window easily)
        cursor = menu_collection.find({"is_available": True}).limit(50)
        items = await cursor.to_list(length=50)
        
        if not items:
            return "Sorry, there are no items available to recommend right now."
            
        menu_context = "Available Menu Items:\n"
        for item in items:
            menu_context += f"- {item['item_name']} (₹{item['price']})\n"
            
        prompt = f"User Query: {query}\n\n{menu_context}"
        
        recommendation = await generate_completion(
            prompt=prompt,
            system_instruction=RECOMMENDATION_PROMPT
        )
        return recommendation
        
    except Exception as e:
        logger.error(f"Recommendation generation failed: {e}")
        return "Sorry, I couldn't generate recommendations right now. Please view the menu directly!"
