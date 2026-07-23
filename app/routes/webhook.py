from fastapi import APIRouter, Request, Response, HTTPException
from app.config import settings
from app.services.message_handler import process_webhook_payload
import logging
import asyncio
import json

router = APIRouter(prefix="/webhook", tags=["WhatsApp Webhook"])
logger = logging.getLogger(__name__)

@router.get("/")
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

@router.post("/")
@router.post("")
async def handle_webhook(request: Request):
    """
    Receives incoming WhatsApp messages.
    """
    body = await request.body()
    logger.info(
        "Webhook POST received: content_type=%s bytes=%s user_agent=%s",
        request.headers.get("content-type"),
        len(body),
        request.headers.get("user-agent"),
    )

    try:
        payload = json.loads(body.decode("utf-8")) if body else {}
    except json.JSONDecodeError:
        logger.warning("Webhook POST had invalid JSON. Raw body preview: %r", body[:500])
        # Meta may send non-message probes/status payloads during dashboard testing.
        # Acknowledge them so delivery health is not penalized.
        return Response(content="EVENT_RECEIVED", status_code=200)

    logger.info("Received Webhook Payload: %s", payload)

    if payload.get("object") == "whatsapp_business_account":
        # Meta expects a 200 OK immediately, so process the message in the background.
        asyncio.create_task(process_webhook_payload(payload))
    else:
        logger.info("Ignoring webhook payload for object=%s", payload.get("object"))

    return Response(content="EVENT_RECEIVED", status_code=200)


@router.get("/status/")
@router.get("/status")
async def webhook_status():
    """
    Safe diagnostics endpoint for deployment checks. Does not expose secrets.
    """
    return {
        "ok": True,
        "webhook_path": "/webhook",
        "verify_token_configured": bool(settings.WHATSAPP_VERIFY_TOKEN),
        "whatsapp_token_configured": bool(settings.WHATSAPP_TOKEN),
        "whatsapp_phone_id_configured": bool(settings.WHATSAPP_PHONE_ID),
        "gemini_api_key_configured": bool(settings.GEMINI_API_KEY),
    }
