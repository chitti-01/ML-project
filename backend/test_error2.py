import sys
import json
import urllib.request
import urllib.error
sys.path.append('e:/Ml Project/backend')
from app.services.chatbot_service import get_gemini_embedding, vector_store, API_KEY

vector_store.documents = ['Wireless Earbuds are our top-selling product this month with $40k in revenue.']
context_text = "- Wireless Earbuds are our top-selling product this month with $40k in revenue."
question = "What are the sales for wireless earbuds?"

prompt = f"""
You are an expert sales AI assistant for a warehouse analytics platform.
Your scope includes ONLY: sales, revenue, orders, products, customers, conversions, deals, leads, sales forecasts, discounts, and sales analytics.

STRICT RULE: If the user asks a question about topics outside this scope (e.g., coding, health, politics, math, general trivia), you MUST reply EXACTLY with this phrase and nothing else:
"I can't answer this question it was out of my scope. Is there any thing related to sales that i can help you with"

Important Exceptions & Guidelines:
1. GREETINGS: You MAY reply to simple greetings (e.g., "hi", "hello") naturally and ask how you can help them with sales. Do NOT use the fallback phrase for greetings.
2. MISSING CONTEXT: If the user asks a valid sales-related question (e.g., "what is the top growth category?") but the answer is not in the context, do NOT use the fallback phrase. Instead, politely explain that you don't have that specific data in your current knowledge base.
3. Use the following retrieved knowledge base context to answer. Be concise, professional, and friendly.

Context from Knowledge Base:
{context_text}

User Message: {question}

Response:
"""

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"
payload = {
    "contents": [{"parts": [{"text": prompt}]}]
}
data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print("Success:", result)
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
