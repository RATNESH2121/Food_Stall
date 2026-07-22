from fastapi import APIRouter, Request, Response, HTTPException
from app.config import settings
from app.services.message_handler import process_webhook_payload
import logging
import asyncio

router = APIRouter(prefix="/webhook", tags=["WhatsApp Webhook"])
logger = logging.getLogger(__name__)

@router.get("")
async def verify_webhook(request: Request):
    """
    Required by Meta to verify the webhook URL.
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("Webhook verified successfully.")
        return Response(content=challenge, status_code=200)
    else:
        logger.error("Webhook verification failed.")
        raise HTTPException(status_code=403, detail="Verification token mismatch")

@router.post("")
async def handle_webhook(request: Request):
    """
    Receives incoming WhatsApp messages.
    """
    try:
        payload = await request.json()
        logger.info(f"Received Webhook Payload: {payload}")
        
        # Meta expects a 200 OK immediately, so we process the message in the background
        asyncio.create_task(process_webhook_payload(payload))
        return Response(content="OK", status_code=200)
    except Exception as e:
        logger.error(f"Error handling webhook POST: {e}")
        return Response(content="Error", status_code=500)
