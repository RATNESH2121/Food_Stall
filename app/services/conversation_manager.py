from app.database import whatsapp_state_collection, stall_collection, menu_collection, order_collection
from app.services.whatsapp_service import send_whatsapp_message, send_whatsapp_interactive_buttons
from app.services.order_service import place_order
from app.schemas.order import OrderCreate, OrderItem
from app.services.intent_detector import detect_intent
from app.services.entity_extractor import extract_order_entities
from app.services.recommendation_engine import generate_recommendations
from app.services.conversation_memory import add_message, get_context, clear_memory
from app.services.ai_service import generate_completion
from app.services.prompt_templates import FAQ_PROMPT
from datetime import datetime, timedelta
from bson import ObjectId
import logging
import re

logger = logging.getLogger(__name__)

# States (Legacy)
STATE_IDLE = "IDLE"
STATE_AWAIT_STALL_MENU = "AWAIT_STALL_MENU"
STATE_AWAIT_STALL_ORDER = "AWAIT_STALL_ORDER"
STATE_AWAIT_ITEM = "AWAIT_ITEM"
STATE_AWAIT_QTY = "AWAIT_QTY"
STATE_AWAIT_TIME = "AWAIT_TIME"
STATE_AWAIT_CONFIRM = "AWAIT_CONFIRM"

async def get_state(phone_number: str):
    record = await whatsapp_state_collection.find_one({"phone_number": phone_number})
    if record:
        return record
    return {"phone_number": phone_number, "state": STATE_IDLE, "data": {}}

async def update_state(phone_number: str, state: str, data: dict = None):
    update_fields = {"state": state}
    if data is not None:
        update_fields["data"] = data
    await whatsapp_state_collection.update_one(
        {"phone_number": phone_number},
        {"$set": update_fields},
        upsert=True
    )

async def clear_state(phone_number: str):
    await update_state(phone_number, STATE_IDLE, {})
    await clear_memory(phone_number)

async def handle_conversation(student: dict, text: str):
    """
    Orchestrates the conversation, trying AI first, then falling back to rules.
    """
    phone = student["phone_number"]
    text = text.strip()
    
    # Store user message in memory
    await add_message(phone, "user", text)
    
    # Always allow a hard reset
    if text.lower() in ["hi", "hello", "menu", "start", "reset", "0"]:
        await clear_state(phone)
        await clear_memory(phone)
        response = """*Welcome to SmartFood AI Assistant* 🍔\n\nI can help you:\n- Browse Stalls & Menus\n- Order Food (e.g., 'I want 2 burgers for 1 PM')\n- Track/Cancel Orders\n- Answer FAQs\n\nHow can I help you today?"""
        await send_whatsapp_message(phone, response)
        await add_message(phone, "model", response)
        return

    # Check if we are mid-way in a legacy state (e.g., awaiting confirmation)
    # If so, just use legacy handler so we don't break flows in progress
    state_record = await get_state(phone)
    if state_record.get("state", STATE_IDLE) != STATE_IDLE:
        return await handle_rule_based_conversation(student, text)

    # 1. Intent Detection
    try:
        intent = await detect_intent(text)
        logger.info(f"AI Detected Intent: {intent}")
    except Exception as e:
        logger.error(f"AI Intent Detection failed: {e}. Falling back to rules.")
        return await handle_rule_based_conversation(student, text)

    # 2. Process based on Intent
    response = ""
    try:
        if intent == "Greeting":
            response = "Hello! I am your SmartFood AI assistant. I can help you order food, browse menus, or answer questions. What are you craving today?"

        elif intent == "Browse Menu":
            context = await get_context(phone)
            response = await generate_recommendations(f"Context:\n{context}\n\nQuery:\n{text}")

        elif intent == "Browse Food Stalls":
            stalls = await stall_collection.find({"is_open": True}).to_list(100)
            if stalls:
                response = "*Open Stalls:*\n" + "\n".join([f"- {s['stall_name']}" for s in stalls])
            else:
                response = "Currently, no food stalls are open."

        elif intent == "Place Order":
            entities = await extract_order_entities(text)
            response = await process_ai_order(student, entities)

        elif intent == "Track Order":
            # Extract ORD string using simple regex
            match = re.search(r'ORD\d+', text.upper())
            if match:
                order_id = match.group(0)
                order = await order_collection.find_one({"order_id": order_id, "student_id": student["id"]})
                if order:
                    response = f"📦 *Order {order_id}*\nStatus: {order['status']}\nPickup Time: {order['pickup_time']}\nTotal: ₹{order['total_amount']}"
                else:
                    response = f"Order {order_id} not found."
            else:
                response = "Please provide your Order ID. For example: 'Track ORD1001'"

        elif intent == "Cancel Order":
            match = re.search(r'ORD\d+', text.upper())
            if match:
                order_id = match.group(0)
                order = await order_collection.find_one({"order_id": order_id, "student_id": student["id"]})
                if not order:
                    response = f"Order {order_id} not found."
                elif order["status"] in ["Booked", "Preparing"]:
                    await order_collection.update_one({"_id": order["_id"]}, {"$set": {"status": "Cancelled"}})
                    response = f"Order {order_id} has been cancelled successfully ✅"
                else:
                    response = f"Cannot cancel order {order_id} as it is currently '{order['status']}'."
            else:
                response = "Please provide the Order ID you wish to cancel. For example: 'Cancel ORD1001'"

        elif intent in ["Help", "General Question"]:
            context = await get_context(phone)
            prompt = f"Context:\n{context}\n\nUser Question:\n{text}"
            response = await generate_completion(prompt, system_instruction=FAQ_PROMPT)

        else:
            # Fallback
            return await handle_rule_based_conversation(student, text)
            
        # Send response and save to memory
        if response:
            await send_whatsapp_message(phone, response)
            await add_message(phone, "model", response)

    except Exception as e:
        logger.error(f"Error handling intent {intent}: {e}")
        return await handle_rule_based_conversation(student, text)


async def process_ai_order(student: dict, entities: dict) -> str:
    """
    Processes an order using AI-extracted entities.
    """
    items_extracted = entities.get("items", [])
    if not items_extracted:
        return "I couldn't quite catch what you want to order. Could you list the items?"
        
    stall_name = entities.get("stall_name")
    pickup_time = entities.get("pickup_time")
    
    # Needs a time to place an order
    if not pickup_time:
        item_strings = [f"{i['quantity']}x {i['item_name']}" for i in items_extracted]
        return f"Got it! You want to order {', '.join(item_strings)}. What time would you like to pick it up?"

    # Find the stall if mentioned, else try to infer from first item
    stall = None
    if stall_name:
        stall = await stall_collection.find_one({"stall_name": {"$regex": stall_name, "$options": "i"}})
        
    order_items = []
    total_prep_time = 0
    total_amount = 0
    resolved_stall_id = str(stall["_id"]) if stall else None
    
    for item in items_extracted:
        # Search for item in DB
        query = {"item_name": {"$regex": item["item_name"], "$options": "i"}, "is_available": True}
        if resolved_stall_id:
            query["stall_id"] = resolved_stall_id
            
        menu_item = await menu_collection.find_one(query)
        if not menu_item:
            return f"Sorry, I couldn't find '{item['item_name']}' on the menu right now."
            
        if not resolved_stall_id:
            resolved_stall_id = menu_item["stall_id"]
            
        qty = max(1, item.get("quantity", 1))
        order_items.append(OrderItem(
            menu_item_id=str(menu_item["_id"]),
            item_name=menu_item["item_name"],
            quantity=qty,
            price=menu_item["price"]
        ))
        total_prep_time = max(total_prep_time, menu_item.get("prep_time_minutes", 5))
        total_amount += (menu_item["price"] * qty)
        
    # Wait Time Estimation & Smart Slot
    # Simple heuristic: calculate current pending orders for this stall
    pending_orders = await order_collection.count_documents({
        "stall_id": resolved_stall_id,
        "status": {"$in": ["Booked", "Preparing"]}
    })
    
    estimated_wait = total_prep_time + (pending_orders * 2) # Assume 2 mins extra per pending order
    
    # Very simple string parsing for time (for demonstration)
    # If the user requested time is within the wait time, suggest a later slot
    # In a real app, you'd parse `pickup_time` into datetime, but we'll return a smart suggestion string:
    response = f"✅ I've prepared your order for {len(order_items)} item(s) from our stall.\n\n"
    response += f"Estimated prep time is {estimated_wait} minutes.\n"
    response += f"Total Amount: ₹{total_amount}\n\n"
    
    # We will invoke the legacy 'Confirm' state so they can click Yes/No
    phone = student["phone_number"]
    data = {
        "stall_id": resolved_stall_id,
        "item": {  # Hack: legacy state machine expects single item or list, we'll serialize
            "menu_item_id": order_items[0].menu_item_id, # Simplified for legacy
            "item_name": "Multiple Items" if len(order_items) > 1 else order_items[0].item_name,
            "quantity": 1, # Not entirely accurate for display but works for total
            "price": total_amount
        },
        "pickup_time": pickup_time,
        "order_items_full": [i.model_dump() for i in order_items] # Full list for custom confirm
    }
    await update_state(phone, STATE_AWAIT_CONFIRM, data)
    
    buttons = [
        {"id": "confirm_yes", "title": "Yes"},
        {"id": "confirm_no", "title": "No"}
    ]
    await send_whatsapp_interactive_buttons(phone, response + f"Pickup Time: {pickup_time}\n\nConfirm Order?", buttons)
    return "" # Handled via buttons

async def handle_rule_based_conversation(student: dict, text: str):
    """
    Legacy rule-based state machine fallback.
    """
    phone = student["phone_number"]
    text = text.strip()
    lower_text = text.lower()
    
    state_record = await get_state(phone)
    state = state_record.get("state", STATE_IDLE)
    data = state_record.get("data", {})

    if state == STATE_IDLE:
        if text == "1":
            await show_stalls(phone)
            await send_whatsapp_message(phone, "Type '2' to view a menu or '3' to order.")
        elif text == "2":
            await send_whatsapp_message(phone, "Please reply with the Stall Number (e.g. 1) or Name to view its menu.")
            await update_state(phone, STATE_AWAIT_STALL_MENU, data)
        elif text == "3":
            await send_whatsapp_message(phone, "Please reply with the Stall Number (e.g. 1) or Name to order from.")
            await update_state(phone, STATE_AWAIT_STALL_ORDER, data)
        elif text == "4":
            await send_whatsapp_message(phone, "Reply with 'Track ORDXXXX' to track your order.")
        elif text == "5":
            await send_whatsapp_message(phone, "Help: You can type 'Hi' to start over, 'Cancel ORDXXXX' to cancel, or 'Track ORDXXXX' to track.")
        else:
            await send_main_menu(phone)

    elif state == STATE_AWAIT_STALL_MENU:
        stall = await find_stall(text)
        if not stall:
            await send_whatsapp_message(phone, "Stall not found. Please try again or type 'Hi' to restart.")
            return
        await show_menu(phone, stall)
        await clear_state(phone)

    elif state == STATE_AWAIT_STALL_ORDER:
        stall = await find_stall(text)
        if not stall:
            await send_whatsapp_message(phone, "Stall not found. Please try again.")
            return
        await show_menu(phone, stall)
        data["stall_id"] = str(stall["_id"])
        await update_state(phone, STATE_AWAIT_ITEM, data)
        await send_whatsapp_message(phone, "What would you like to order? Reply with the exact item name or ID.")

    elif state == STATE_AWAIT_ITEM:
        stall_id = data.get("stall_id")
        menu_item = await menu_collection.find_one({
            "stall_id": stall_id, 
            "item_name": {"$regex": text, "$options": "i"}
        })
        if not menu_item:
            await send_whatsapp_message(phone, "Item not found in this stall's menu.")
            return
        if not menu_item.get("is_available", True):
            await send_whatsapp_message(phone, "Sorry, this item is currently unavailable.")
            return
            
        data["item"] = {
            "menu_item_id": str(menu_item["_id"]),
            "item_name": menu_item["item_name"],
            "price": menu_item["price"]
        }
        await update_state(phone, STATE_AWAIT_QTY, data)
        await send_whatsapp_message(phone, f"How many {menu_item['item_name']} would you like? (Enter a number)")

    elif state == STATE_AWAIT_QTY:
        if not text.isdigit():
            await send_whatsapp_message(phone, "Please enter a valid number for quantity.")
            return
        qty = int(text)
        if qty <= 0:
            await send_whatsapp_message(phone, "Quantity must be greater than 0.")
            return
            
        data["item"]["quantity"] = qty
        await update_state(phone, STATE_AWAIT_TIME, data)
        await send_whatsapp_message(phone, "When would you like to pick it up? (e.g., 1:00 PM)")

    elif state == STATE_AWAIT_TIME:
        data["pickup_time"] = text
        item = data["item"]
        total = item["price"] * item["quantity"]
        data["total"] = total
        
        # Format for compatibility with AI order flow
        data["order_items_full"] = [item] 
        await update_state(phone, STATE_AWAIT_CONFIRM, data)
        
        msg = f"Order Summary:\n{item['quantity']}x {item['item_name']}\nTotal: ₹{total}\nPickup: {text}\n\nConfirm?"
        buttons = [
            {"id": "confirm_yes", "title": "Yes"},
            {"id": "confirm_no", "title": "No"}
        ]
        await send_whatsapp_interactive_buttons(phone, msg, buttons)

    elif state == STATE_AWAIT_CONFIRM:
        if lower_text == "yes" or lower_text == "confirm_yes":
            try:
                # Use order_items_full which supports both AI and rule-based
                items = [OrderItem(**i) for i in data.get("order_items_full", [data["item"]])]
                order_data = OrderCreate(
                    stall_id=data["stall_id"],
                    items=items,
                    pickup_date=datetime.now().strftime("%Y-%m-%d"),
                    pickup_time=data["pickup_time"]
                )
                order = await place_order(student["id"], order_data)
                await send_whatsapp_message(phone, f"✅ Order Confirmed!\nYour Order ID is *{order['order_id']}*.\nTotal: ₹{order['total_amount']}\nWe will notify you when it's ready.")
            except Exception as e:
                await send_whatsapp_message(phone, f"Failed to place order: {str(e)}")
        else:
            await send_whatsapp_message(phone, "Order cancelled. Type 'Hi' to start again.")
            
        await clear_state(phone)

# Legacy Helpers
async def send_main_menu(phone: str):
    msg = """*Welcome to LPU Food Assistant* 🍔\n\nChoose an option by replying with the number:\n1️⃣ View Food Stalls\n2️⃣ View Menu\n3️⃣ Place Order\n4️⃣ Track Order\n5️⃣ Help"""
    await send_whatsapp_message(phone, msg)

async def show_stalls(phone: str):
    cursor = stall_collection.find({"is_open": True})
    stalls = await cursor.to_list(length=100)
    if not stalls:
        await send_whatsapp_message(phone, "No food stalls are currently open.")
        return
    msg = "*Open Food Stalls:*\n"
    for idx, s in enumerate(stalls, 1):
        msg += f"{idx}. {s['stall_name']}\n"
    await send_whatsapp_message(phone, msg)

async def find_stall(query: str):
    stall = await stall_collection.find_one({"stall_name": {"$regex": f"^{query}$", "$options": "i"}})
    if stall: return stall
    if query.isdigit():
        cursor = stall_collection.find({"is_open": True})
        stalls = await cursor.to_list(length=100)
        idx = int(query) - 1
        if 0 <= idx < len(stalls):
            return stalls[idx]
    return None

async def show_menu(phone: str, stall: dict):
    cursor = menu_collection.find({"stall_id": str(stall["_id"]), "is_available": True})
    items = await cursor.to_list(length=100)
    if not items:
        await send_whatsapp_message(phone, f"{stall['stall_name']} has no menu items right now.")
        return
    msg = f"*{stall['stall_name']} Menu:*\n"
    for item in items:
        msg += f"- {item['item_name']} (₹{item['price']})\n"
    await send_whatsapp_message(phone, msg)
