from typing import Any, Dict, Optional

def success_response(message: str, data: Optional[Any] = None) -> Dict[str, Any]:
    """Returns a standardized success response."""
    response = {
        "success": True,
        "message": message
    }
    if data is not None:
        response["data"] = data
    return response

def error_response(message: str, data: Optional[Any] = None) -> Dict[str, Any]:
    """Returns a standardized error response."""
    response = {
        "success": False,
        "message": message
    }
    if data is not None:
        response["data"] = data
    return response
