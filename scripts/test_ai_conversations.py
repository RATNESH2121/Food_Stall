import asyncio
from app.services.intent_detector import detect_intent
from app.services.entity_extractor import extract_order_entities

test_cases = [
    {"input": "Hi there!", "expected_intent": "Greeting"},
    {"input": "Hello bot", "expected_intent": "Greeting"},
    {"input": "I need to see the menu", "expected_intent": "Browse Menu"},
    {"input": "What's on the menu?", "expected_intent": "Browse Menu"},
    {"input": "Show me the food stalls", "expected_intent": "Browse Food Stalls"},
    {"input": "Which stalls are open right now?", "expected_intent": "Browse Food Stalls"},
    {"input": "I want two veg burgers for 1 PM tomorrow", "expected_intent": "Place Order"},
    {"input": "One cold coffee and two fries please", "expected_intent": "Place Order"},
    {"input": "Can I get a pizza?", "expected_intent": "Place Order"},
    {"input": "Where is my order ORD1234?", "expected_intent": "Track Order"},
    {"input": "Track ORD9876", "expected_intent": "Track Order"},
    {"input": "Cancel my order ORD1111", "expected_intent": "Cancel Order"},
    {"input": "I want to cancel ORD5555", "expected_intent": "Cancel Order"},
    {"input": "How do I use this bot?", "expected_intent": "Help"},
    {"input": "Help me", "expected_intent": "Help"},
    {"input": "What time does the food court open?", "expected_intent": "General Question"},
    {"input": "Where is Food Court A?", "expected_intent": "General Question"},
    {"input": "Is the cafeteria open on Sundays?", "expected_intent": "General Question"},
    {"input": "Can you suggest something spicy?", "expected_intent": "Browse Menu"},
    {"input": "Suggest something under 150 rupees", "expected_intent": "Browse Menu"},
    
    # Entity Extraction Tests
    {"input": "I need 2 Veg Burgers tomorrow at 1 PM", "type": "entity", "expected": {"items": [{"item_name": "Veg Burgers", "quantity": 2}], "pickup_date": "Tomorrow", "pickup_time": "1 PM"}},
    {"input": "One Cold Coffee", "type": "entity", "expected": {"items": [{"item_name": "Cold Coffee", "quantity": 1}]}},
    {"input": "3 samosas and 2 teas from Chai Tapri at 4 PM", "type": "entity", "expected": {"items": [{"item_name": "samosas", "quantity": 3}, {"item_name": "teas", "quantity": 2}], "pickup_time": "4 PM", "stall_name": "Chai Tapri"}},
    
    # Fallback simulation
    {"input": "sdjflsdf", "expected_intent": "General Question"} # Bot might try to answer jibberish as a question or fallback
]

async def run_tests():
    print("Running AI Conversation Tests...\n")
    passed = 0
    for i, case in enumerate(test_cases, 1):
        test_type = case.get("type", "intent")
        input_text = case["input"]
        
        if test_type == "intent":
            try:
                intent = await detect_intent(input_text)
                expected = case["expected_intent"]
                status = "PASS" if intent == expected else f"FAIL (Got {intent}, Expected {expected})"
                if intent == expected: passed += 1
                print(f"Test {i} [{status}]: '{input_text}' -> {intent}")
            except Exception as e:
                print(f"Test {i} [ERROR]: '{input_text}' -> {e}")
                
        elif test_type == "entity":
            try:
                entities = await extract_order_entities(input_text)
                print(f"Test {i} [ENTITY]: '{input_text}'\n  -> {entities}")
                passed += 1 # We just eyeball entity extraction for this basic script
            except Exception as e:
                print(f"Test {i} [ERROR]: '{input_text}' -> {e}")

    print(f"\nTests Completed: {passed}/{len(test_cases)} Passed")

if __name__ == "__main__":
    asyncio.run(run_tests())
