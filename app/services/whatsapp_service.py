import httpx
import logging
from app.config import settings

logger = logging.getLogger(__name__)

async def send_whatsapp_message(to: str, text: str):
    """
    Sends a simple text message via WhatsApp Cloud API.
    """
    if not settings.WHATSAPP_TOKEN or not settings.WHATSAPP_PHONE_ID:
        logger.warning("WhatsApp credentials missing. Skipping message send.")
        return False
        
    url = f"https://graph.facebook.com/v17.0/{settings.WHATSAPP_PHONE_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": text
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            logger.info(f"WhatsApp message sent successfully to {to}")
            return True
        except httpx.HTTPError as e:
            logger.error(f"Failed to send WhatsApp message: {e}")
            if hasattr(e, 'response') and e.response:
                logger.error(f"Response: {e.response.text}")
            return False

async def send_whatsapp_interactive_buttons(to: str, text: str, buttons: list):
    """
    Sends interactive buttons (max 3)
    buttons: [{"id": "yes", "title": "Yes"}, {"id": "no", "title": "No"}]
    """
    if not settings.WHATSAPP_TOKEN or not settings.WHATSAPP_PHONE_ID:
        logger.warning("WhatsApp credentials missing. Skipping message send.")
        return False

    if len(buttons) > 3:
        raise ValueError("WhatsApp API allows maximum 3 buttons")
        
    url = f"https://graph.facebook.com/v17.0/{settings.WHATSAPP_PHONE_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    
    formatted_buttons = [
        {
            "type": "reply",
            "reply": {
                "id": b["id"],
                "title": b["title"]
            }
        } for b in buttons
    ]
    
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {
                "text": text
            },
            "action": {
                "buttons": formatted_buttons
            }
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            logger.info(f"WhatsApp interactive message sent successfully to {to}")
            return True
        except httpx.HTTPError as e:
            logger.error(f"Failed to send WhatsApp interactive message: {e}")
            return False
