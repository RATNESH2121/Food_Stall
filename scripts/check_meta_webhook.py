import argparse
import asyncio
import os

import httpx
from dotenv import load_dotenv


GRAPH_VERSION = "v20.0"


async def graph_get(client: httpx.AsyncClient, path: str, token: str):
    response = await client.get(
        f"https://graph.facebook.com/{GRAPH_VERSION}/{path}",
        headers={"Authorization": f"Bearer {token}"},
    )
    return response.status_code, response.json()


async def graph_post(client: httpx.AsyncClient, path: str, token: str):
    response = await client.post(
        f"https://graph.facebook.com/{GRAPH_VERSION}/{path}",
        headers={"Authorization": f"Bearer {token}"},
    )
    try:
        data = response.json()
    except ValueError:
        data = {"raw": response.text}
    return response.status_code, data


async def main():
    parser = argparse.ArgumentParser(description="Check Meta WhatsApp webhook wiring.")
    parser.add_argument("--webhook-url", default="https://food-stall.onrender.com/webhook")
    parser.add_argument("--waba-id", default=os.getenv("WHATSAPP_WABA_ID"))
    parser.add_argument("--subscribe", action="store_true")
    args = parser.parse_args()

    load_dotenv()
    token = os.getenv("WHATSAPP_TOKEN")
    phone_id = os.getenv("WHATSAPP_PHONE_ID")
    verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN", "my_secret_verify_token")

    if not token:
        raise SystemExit("WHATSAPP_TOKEN is missing in .env")
    if not phone_id:
        raise SystemExit("WHATSAPP_PHONE_ID is missing in .env")

    async with httpx.AsyncClient(timeout=45) as client:
        print("1) Render root")
        response = await client.get(args.webhook_url.rsplit("/webhook", 1)[0])
        print(response.status_code, response.text[:200])

        print("\n2) Render webhook verification")
        response = await client.get(
            args.webhook_url,
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": verify_token,
                "hub.challenge": "codex_check",
            },
        )
        print(response.status_code, response.text[:200])

        print("\n3) Render webhook POST")
        payload = {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "id": args.waba_id or "test_waba_id",
                    "changes": [
                        {
                            "field": "messages",
                            "value": {
                                "messaging_product": "whatsapp",
                                "metadata": {
                                    "display_phone_number": "test",
                                    "phone_number_id": phone_id,
                                },
                                "messages": [
                                    {
                                        "from": "0000000000",
                                        "id": "wamid.codex_check",
                                        "timestamp": "1700000000",
                                        "type": "text",
                                        "text": {"body": "hi"},
                                    }
                                ],
                            },
                        }
                    ],
                }
            ],
        }
        response = await client.post(args.webhook_url, json=payload)
        print(response.status_code, response.text[:200])

        print("\n4) Meta phone-number ID")
        status, data = await graph_get(
            client,
            f"{phone_id}?fields=id,display_phone_number,verified_name,quality_rating",
            token,
        )
        print(status, data)

        if not args.waba_id:
            print("\n5) WABA subscription skipped")
            print("Pass --waba-id YOUR_WABA_ID to check / subscribe the actual WABA.")
            return

        print("\n5) WABA subscribed apps before")
        status, data = await graph_get(client, f"{args.waba_id}/subscribed_apps", token)
        print(status, data)

        if args.subscribe:
            print("\n6) Subscribing app to WABA")
            status, data = await graph_post(client, f"{args.waba_id}/subscribed_apps", token)
            print(status, data)

            print("\n7) WABA subscribed apps after")
            status, data = await graph_get(client, f"{args.waba_id}/subscribed_apps", token)
            print(status, data)


if __name__ == "__main__":
    asyncio.run(main())
