import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv("ml/.env")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print(f"🔍 Checking available EMBEDDING models...")
print("------------------------------------------------")

try:
    for m in genai.list_models():
        if 'embedContent' in m.supported_generation_methods:
            print(f"✅ AVAILABLE: {m.name}")
            
except Exception as e:
    print(f"❌ Connection Failed: {e}")

print("------------------------------------------------")
