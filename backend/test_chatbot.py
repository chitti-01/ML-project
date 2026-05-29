import sys
sys.path.append('e:/Ml Project/backend')
from app.services.chatbot_service import ask_sales_chatbot, initialize_knowledge_base

initialize_knowledge_base()
print("Q: What are the sales for wireless earbuds?")
response1 = ask_sales_chatbot("What are the sales for wireless earbuds?")
print("A:", response1)

print("\nQ: How to code in python?")
response2 = ask_sales_chatbot("How to code in python?")
print("A:", response2)
