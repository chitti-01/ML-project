import urllib.request
import urllib.error
import json
import ssl
import os

API_KEY = os.environ.get("GROQ_API_KEY", "")

KNOWLEDGE_BASE = [
    "Our warehouse handles electronics, apparel, and home goods. Conversions are up 15%.",
    "We offer a 20% discount on Winter Hoodies to clear surplus stock.",
    "Wireless Earbuds are our top-selling product this month with $40k in revenue.",
    "Bangalore Central Hub is operating at 94% processing efficiency.",
    "We have a reorder threshold of 50 units for fast-moving items like Protein Powder."
]

def initialize_knowledge_base():
    # No longer needed for Groq since we inject the whole knowledge base statically.
    print("Knowledge base ready (Static injection).")

def generate_groq_response(prompt: str) -> str:
    if not API_KEY:
        return "API Key missing."

    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {API_KEY}',
        'User-Agent': 'Mozilla/5.0'
    })
    
    try:
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=context) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['choices'][0]['message']['content'].strip()
    except Exception as e:
        print(f"Generation error: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        return "Sorry, I encountered an error connecting to the AI model."

def ask_sales_chatbot(question: str) -> str:
    context_text = "\n".join([f"- {doc}" for doc in KNOWLEDGE_BASE])

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
    return generate_groq_response(prompt)
