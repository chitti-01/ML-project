import sys
sys.path.append('e:/Ml Project/backend')
from app.services.chatbot_service import ask_sales_chatbot, initialize_knowledge_base, get_gemini_embedding, vector_store, generate_gemini_response
import urllib.error

initialize_knowledge_base()

query_emb = get_gemini_embedding("What are the sales for wireless earbuds?")
context_docs = vector_store.search(query_emb, top_k=3)
print("Context Docs:", context_docs)

context_text = "\n".join([f"- {doc}" for doc in context_docs])
prompt = f"Context from Knowledge Base:\n{context_text}\n\nUser Message: What are the sales for wireless earbuds?"
print("Sending Prompt:\n", prompt)

try:
    generate_gemini_response(prompt)
    print("Success")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode('utf-8'))
