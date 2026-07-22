from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.routes import student, stall, menu, order, admin, seed, webhook
from app.utils.response import error_response
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart WhatsApp AI Chatbot for Food Pre-Booking System",
    description="Backend API Foundation (Day 1)",
    version="1.0.0"
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for production deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers for standardizing error format
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content=error_response(f"An unexpected error occurred: {str(exc)}")
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    error_msgs = []
    for err in errors:
        loc = ".".join([str(l) for l in err.get("loc", [])])
        msg = err.get("msg", "")
        error_msgs.append(f"{loc}: {msg}")
    
    return JSONResponse(
        status_code=400,
        content=error_response("Validation error", {"details": error_msgs})
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(exc.detail)
    )

# Include Routers
app.include_router(student.router)
app.include_router(stall.router)
app.include_router(menu.router)
app.include_router(order.router)
app.include_router(admin.router)
app.include_router(seed.router)
app.include_router(webhook.router)

@app.get("/", tags=["Health"])
async def root():
    return {"message": "Welcome to Smart WhatsApp AI Chatbot Backend API"}
