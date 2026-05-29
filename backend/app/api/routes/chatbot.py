from fastapi import APIRouter
from pydantic import BaseModel
from app.services.chatbot_service import ask_sales_chatbot

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    reply = ask_sales_chatbot(request.message)
    return ChatResponse(reply=reply)
