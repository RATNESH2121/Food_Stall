from app.database import whatsapp_state_collection, stall_collection, menu_collection, slot_collection
from app.services.whatsapp_service import send_whatsapp_message
from app.services.order_service import place_order
from app.schemas.order import OrderCreate, OrderItem
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

# States
STATE_IDLE = "IDLE"
STATE_AWAIT_CAMPUS = "AWAIT_CAMPUS"
STATE_AWAIT_STALL = "AWAIT_STALL"
STATE_AWAIT_ITEM = "AWAIT_ITEM"
STATE_AWAIT_QTY = "AWAIT_QTY"
STATE_AWAIT_CONFIRM = "AWAIT_CONFIRM"

CAMPUSES = {
    "1": "Academic Block",
    "2": "BH Area",
    "3": "Girls Hostel",
    "4": "Uni Mall"
}

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

async def handle_conversation(student: dict, text: str):
    phone = student["phone_number"]
    text = text.strip()
    lower_text = text.lower()

    # Reset command or Greeting from registered returning user
    if lower_text in ["hi", "hello", "start", "reset", "0"]:
        await clear_state(phone)
        msg = (
            "👋 *Welcome back!*\n\n"
            "What would you like to do today?\n\n"
            "1️⃣ Order Food\n"
            "2️⃣ Change Campus\n"
            "3️⃣ Help"
        )
        await send_whatsapp_message(phone, msg)
        return

    state_record = await get_state(phone)
    state = state_record.get("state", STATE_IDLE)
    data = state_record.get("data", {})

    # IDLE State
    if state == STATE_IDLE:
        if text in ["1", "1️⃣"] or "order" in lower_text:
            await show_campus_options(phone)
        elif text in ["2", "2️⃣"] or "campus" in lower_text:
            await show_campus_options(phone)
        elif text in ["3", "3️⃣"] or "help" in lower_text:
            msg = (
                "ℹ️ *SmartFood Help*\n\n"
                "- Reply *1* to Order Food\n"
                "- Reply *2* to Select Campus\n"
                "- Reply *Hi* anytime to start over"
            )
            await send_whatsapp_message(phone, msg)
        else:
            msg = (
                "👋 *Welcome back!*\n\n"
                "What would you like to do today?\n\n"
                "1️⃣ Order Food\n"
                "2️⃣ Change Campus\n"
                "3️⃣ Help"
            )
            await send_whatsapp_message(phone, msg)

    # CAMPUS Selection State
    elif state == STATE_AWAIT_CAMPUS:
        selected_campus = CAMPUSES.get(text)
        if not selected_campus:
            # Check if user typed campus name directly
            for c_name in CAMPUSES.values():
                if c_name.lower() in lower_text:
                    selected_campus = c_name
                    break

        if not selected_campus:
            await send_whatsapp_message(phone, "Please select a valid option (1-4) for Campus.")
            return

        data["campus"] = selected_campus
        
        # Fetch open stalls from MongoDB
        stalls = await stall_collection.find({"is_open": True}).to_list(100)
        campus_stalls = [s for s in stalls if s.get("campus", selected_campus) == selected_campus]
        if not campus_stalls:
            campus_stalls = stalls # Fallback so user always sees open stalls from MongoDB

        if not campus_stalls:
            await send_whatsapp_message(phone, f"No open food stalls found in {selected_campus} right now.")
            await clear_state(phone)
            return

        stalls_summary = []
        msg = f"🏬 *Food Stalls in {selected_campus}:*\n\n"
        for idx, s in enumerate(campus_stalls, 1):
            msg += f"{idx}. {s['stall_name']}\n"
            stalls_summary.append({"id": str(s["_id"]), "name": s["stall_name"]})

        msg += "\nReply with the stall number to view menu."
        data["stalls"] = stalls_summary
        await update_state(phone, STATE_AWAIT_STALL, data)
        await send_whatsapp_message(phone, msg)

    # STALL Selection State
    elif state == STATE_AWAIT_STALL:
        stalls = data.get("stalls", [])
        selected_stall = None

        if text.isdigit():
            idx = int(text) - 1
            if 0 <= idx < len(stalls):
                selected_stall = stalls[idx]

        if not selected_stall:
            # Match by name
            for s in stalls:
                if s["name"].lower() in lower_text:
                    selected_stall = s
                    break

        if not selected_stall:
            await send_whatsapp_message(phone, "Invalid selection. Please enter a valid stall number from the list.")
            return

        data["stall_id"] = selected_stall["id"]
        data["stall_name"] = selected_stall["name"]

        # Fetch menu items
        menu_items_cursor = menu_collection.find({"stall_id": selected_stall["id"], "is_available": True})
        menu_items = await menu_items_cursor.to_list(100)

        if not menu_items:
            await send_whatsapp_message(phone, f"No menu items available at {selected_stall['name']} right now.")
            return

        menu_summary = []
        msg = f"📋 *{selected_stall['name']} Menu:*\n\n"
        for idx, item in enumerate(menu_items, 1):
            price_val = int(item['price']) if float(item['price']).is_integer() else item['price']
            msg += f"{idx}. {item['item_name']} ₹{price_val}\n"
            menu_summary.append({
                "id": str(item["_id"]),
                "name": item["item_name"],
                "price": float(item["price"])
            })

        msg += "\nReply with the item number to order."
        data["menu_items"] = menu_summary
        await update_state(phone, STATE_AWAIT_ITEM, data)
        await send_whatsapp_message(phone, msg)

    # ITEM Selection State
    elif state == STATE_AWAIT_ITEM:
        items = data.get("menu_items", [])
        selected_item = None

        if text.isdigit():
            idx = int(text) - 1
            if 0 <= idx < len(items):
                selected_item = items[idx]

        if not selected_item:
            for item in items:
                if item["name"].lower() in lower_text:
                    selected_item = item
                    break

        if not selected_item:
            await send_whatsapp_message(phone, "Invalid item selection. Please reply with an item number from the menu.")
            return

        data["selected_item"] = selected_item
        await update_state(phone, STATE_AWAIT_QTY, data)
        await send_whatsapp_message(phone, "How many would you like?")

    # QUANTITY Selection State
    elif state == STATE_AWAIT_QTY:
        if not text.isdigit() or int(text) <= 0:
            await send_whatsapp_message(phone, "Please enter a valid quantity (number greater than 0).")
            return

        qty = int(text)
        item = data.get("selected_item", {})
        total = item.get("price", 0) * qty

        data["quantity"] = qty
        data["total_amount"] = total

        msg = (
            f"🛒 *Order Summary:*\n\n"
            f"{item.get('name')} x{qty}\n\n"
            f"₹{total:.0f}\n\n"
            f"Confirm Order?\n"
            f"1️⃣ Yes\n"
            f"2️⃣ Cancel"
        )
        await update_state(phone, STATE_AWAIT_CONFIRM, data)
        await send_whatsapp_message(phone, msg)

    # ORDER CONFIRMATION State
    elif state == STATE_AWAIT_CONFIRM:
        if text in ["1", "1️⃣"] or "yes" in lower_text or "confirm" in lower_text:
            try:
                item_info = data.get("selected_item", {})
                qty = data.get("quantity", 1)
                stall_id = data.get("stall_id")
                pickup_time = "15 Minutes"

                # Ensure default pickup slot exists so place_order doesn't fail
                await slot_collection.update_one(
                    {"slot_time": pickup_time},
                    {"$setOnInsert": {"slot_time": pickup_time, "maximum_orders": 100, "booked_orders": 0, "is_available": True}},
                    upsert=True
                )

                order_item = OrderItem(
                    menu_item_id=item_info["id"],
                    item_name=item_info["name"],
                    quantity=qty,
                    price=item_info["price"]
                )

                order_data = OrderCreate(
                    stall_id=stall_id,
                    items=[order_item],
                    pickup_date=datetime.now().strftime("%Y-%m-%d"),
                    pickup_time=pickup_time
                )

                order = await place_order(student["id"], order_data)

                msg = (
                    "✅ *Order Placed Successfully*\n\n"
                    f"Order ID: {order['order_id']}\n\n"
                    f"Total: ₹{order['total_amount']:.0f}\n\n"
                    f"Status: Pending\n\n"
                    f"Estimated Preparation Time:\n"
                    f"15 Minutes\n\n"
                    "Thank you for ordering."
                )
                await send_whatsapp_message(phone, msg)
            except Exception as e:
                logger.error(f"Failed to place order via WhatsApp: {e}")
                await send_whatsapp_message(phone, f"⚠️ Unable to place order: {str(e)}")

            await clear_state(phone)

        elif text in ["2", "2️⃣"] or "cancel" in lower_text or "no" in lower_text:
            await send_whatsapp_message(phone, "Order cancelled. Type 'Hi' anytime to start again!")
            await clear_state(phone)
        else:
            await send_whatsapp_message(phone, "Please reply 1️⃣ for Yes or 2️⃣ for Cancel.")

async def show_campus_options(phone: str):
    msg = (
        "📍 *Select Campus Location:*\n\n"
        "1️⃣ Academic Block\n"
        "2️⃣ BH Area\n"
        "3️⃣ Girls Hostel\n"
        "4️⃣ Uni Mall\n\n"
        "Reply with the option number (1-4)."
    )
    await update_state(phone, STATE_AWAIT_CAMPUS, {})
    await send_whatsapp_message(phone, msg)
