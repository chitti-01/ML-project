import urllib.request
import json

API_KEY = "AIzaSyCTcLlSGTgdh5DvUqWTRa7ZsD8EuCQCBg0"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

try:
    with urllib.request.urlopen(url) as response:
        result = json.loads(response.read().decode('utf-8'))
        for model in result['models']:
            print(model['name'])
except Exception as e:
    print(f"Error: {e}")
