from app.database import whatsapp_state_collection, stall_collection, menu_collection, slot_collection, order_collection
from app.services.whatsapp_service import send_whatsapp_message
from app.services.order_service import place_order
from app.schemas.order import OrderCreate, OrderItem
from datetime import datetime, timezone
from bson import ObjectId
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
            "👋 Welcome back!\n\n"
            "What would you like to do?\n\n"
            "1️⃣ Order Food\n\n"
            "2️⃣ Track My Order\n\n"
            "3️⃣ Change Campus\n\n"
            "4️⃣ Help"
        )
        await send_whatsapp_message(phone, msg)
        return

    state_record = await get_state(phone)
    state = state_record.get("state", STATE_IDLE)
    data = state_record.get("data", {})

    # IDLE State
    if state == STATE_IDLE:
        if text in ["1", "1️⃣"] or "order food" in lower_text:
            await show_campus_options(phone)
        elif text in ["2", "2️⃣"] or "track" in lower_text:
            await show_track_order(phone, student)
        elif text in ["3", "3️⃣"] or "campus" in lower_text:
            await show_campus_options(phone)
        elif text in ["4", "4️⃣"] or "help" in lower_text:
            msg = (
                "ℹ️ *SmartFood Help*\n\n"
                "- Reply *1* to Order Food\n"
                "- Reply *2* to Track My Order\n"
                "- Reply *3* to Select Campus\n"
                "- Reply *Hi* anytime to start over"
            )
            await send_whatsapp_message(phone, msg)
        else:
            msg = (
                "👋 Welcome back!\n\n"
                "What would you like to do?\n\n"
                "1️⃣ Order Food\n\n"
                "2️⃣ Track My Order\n\n"
                "3️⃣ Change Campus\n\n"
                "4️⃣ Help"
            )
            await send_whatsapp_message(phone, msg)

    # CAMPUS Selection State
    elif state == STATE_AWAIT_CAMPUS:
        selected_campus = CAMPUSES.get(text)
        if not selected_campus:
            for c_name in CAMPUSES.values():
                if c_name.lower() in lower_text:
                    selected_campus = c_name
                    break

        if not selected_campus:
            await send_whatsapp_message(phone, "Please select a valid option (1-4) for Campus.")
            return

        data["campus"] = selected_campus
        
        # Query MongoDB strictly for open stalls matching selected campus
        campus_stalls = await stall_collection.find({
            "campus": {"$regex": f"^{selected_campus}$", "$options": "i"},
            "is_open": True
        }).to_list(100)

        # Fallback query if exact campus name varies (e.g., CSE Block vs Academic Block)
        if not campus_stalls:
            if selected_campus == "Academic Block":
                campus_stalls = await stall_collection.find({"campus": {"$in": ["Academic Block", "CSE Block"]}, "is_open": True}).to_list(100)
            elif selected_campus == "BH Area":
                campus_stalls = await stall_collection.find({"campus": {"$in": ["BH Area", "Boys Hostel"]}, "is_open": True}).to_list(100)
            elif selected_campus == "Girls Hostel":
                campus_stalls = await stall_collection.find({"campus": {"$in": ["Girls Hostel", "GH Area"]}, "is_open": True}).to_list(100)
            elif selected_campus == "Uni Mall":
                campus_stalls = await stall_collection.find({"campus": {"$in": ["Uni Mall", "Uni Mall Area"]}, "is_open": True}).to_list(100)

        if not campus_stalls:
            await send_whatsapp_message(phone, f"No open food stalls found in {selected_campus} right now.")
            await clear_state(phone)
            return

        stalls_summary = []
        msg = f"🏬 *Food Stalls in {selected_campus}:*\n\n"
        for idx, s in enumerate(campus_stalls, 1):
            msg += f"{idx}️⃣ {s['stall_name']}\n"
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
            msg += f"{idx}️⃣ {item['item_name']} ₹{price_val}\n"
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
        if not text.isdigit() or int(text) <= 0 or int(text) > 50:
            await send_whatsapp_message(phone, "Please enter a valid quantity (1 to 50).")
            return

        qty = int(text)
        item = data.get("selected_item", {})
        unit_price = item.get("price", 0)
        total = unit_price * qty

        data["quantity"] = qty
        data["total_amount"] = total

        msg = (
            f"🛒 *Order Summary*\n\n"
            f"Item: {item.get('name')}\n"
            f"Quantity: {qty}\n"
            f"Price: ₹{unit_price:.0f}\n"
            f"Total: ₹{total:.0f}\n"
            f"Estimated Preparation Time: 15 Minutes\n\n"
            f"Confirm Order?\n"
            f"1️⃣ Submit Order\n"
            f"2️⃣ Cancel"
        )
        await update_state(phone, STATE_AWAIT_CONFIRM, data)
        await send_whatsapp_message(phone, msg)

    # ORDER CONFIRMATION State
    elif state == STATE_AWAIT_CONFIRM:
        if text in ["1", "1️⃣"] or "yes" in lower_text or "submit" in lower_text or "confirm" in lower_text:
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

                # Set initial status to PENDING_VENDOR and store active phone number for notifications
                await order_collection.update_one(
                    {"_id": ObjectId(order["id"]) if ObjectId.is_valid(order["id"]) else order["id"]},
                    {"$set": {"status": "PENDING_VENDOR", "phone_number": phone}}
                )

                msg = (
                    "📝 *Order Request Submitted*\n\n"
                    f"Order ID: {order['order_id']}\n\n"
                    "Your request has been sent to the vendor.\n\n"
                    "Current Status:\n"
                    "🟡 Waiting for Vendor Approval\n\n"
                    "You will receive another WhatsApp message once the vendor accepts or rejects your request."
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
            await send_whatsapp_message(phone, "Please reply 1️⃣ for Submit Order or 2️⃣ for Cancel.")

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

async def show_track_order(phone: str, student: dict):
    order = await order_collection.find_one({"student_id": student["id"]}, sort=[("created_at", -1)])
    if not order:
        await send_whatsapp_message(phone, "No recent order found to track. Type '1' to order food!")
        return

    stall = await stall_collection.find_one({"_id": ObjectId(order["stall_id"])}) if ObjectId.is_valid(order["stall_id"]) else await stall_collection.find_one({"_id": order["stall_id"]})
    stall_name = stall.get("stall_name", "Food Stall") if stall else "Food Stall"

    items_summary = ", ".join([f"{i['item_name']} x{i['quantity']}" for i in order.get("items", [])])
    status_map = {
        "PENDING_VENDOR": "🟡 Waiting for Vendor Approval",
        "Booked": "🟡 Waiting for Vendor Approval",
        "ACCEPTED": "🟢 Accepted by Vendor",
        "PREPARING": "👨‍🍳 Preparing in kitchen",
        "Preparing": "👨‍🍳 Preparing in kitchen",
        "READY": "🎉 Ready for Pickup!",
        "Ready": "🎉 Ready for Pickup!",
        "COMPLETED": "✅ Completed",
        "Completed": "✅ Completed",
        "REJECTED": "❌ Rejected by Vendor",
        "Cancelled": "❌ Cancelled"
    }
    status_display = status_map.get(order.get("status"), order.get("status"))

    msg = (
        "📦 *Order Details*\n\n"
        f"Order ID: {order['order_id']}\n"
        f"Vendor: {stall_name}\n"
        f"Items: {items_summary}\n"
        f"Current Status: {status_display}\n"
        "Estimated Ready Time: 15 Minutes"
    )
    await send_whatsapp_message(phone, msg)
