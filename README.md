# Smart WhatsApp AI Chatbot for Food Pre-Booking System

This repository contains the backend and frontend for the Food Pre-Booking System.

## Architecture

- **Backend:** FastAPI, MongoDB Atlas, Motor, Pydantic, JWT Authentication
- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Context API, Axios

## Backend (FastAPI)

Located in the `app/` folder.

1. **Install dependencies:**
   ```bash
   pip install fastapi uvicorn motor pydantic pydantic-settings python-dotenv passlib[bcrypt] pyjwt python-multipart
   ```
2. **Run Server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   (Runs on http://localhost:8000)
3. **Seed Database (Admin & Sample Data):**
   Run the seed script or call the seed API:
   ```
   POST http://localhost:8000/seed/sample-data
   ```
   *This creates an admin user (registration_number: admin, password: admin123) and some food stalls/menus.*

## Frontend (React + Vite)

Located in the `frontend/` folder.

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Run Development Server:**
   ```bash
   npm run dev
   ```
   (Runs on http://localhost:3000)

## Day 3 Completion
- Added complete React UI architecture.
- Modularized Context APIs for Auth & Cart.
- Styled components with TailwindCSS.
- Connected Frontend Axios config to FastAPI endpoints.

## Day 4 Completion
- **WhatsApp Meta Cloud API Integration**: Completely automated rule-based chatbot for food ordering.
- **Webhooks**: Handles incoming text and interactive messages securely with token verification.
- **State Machine Engine**: Robust backend state management via MongoDB `whatsapp_state` to process multi-step conversations seamlessly.
- **Admin Notifications**: Broadcasts status updates directly to student WhatsApp numbers.
