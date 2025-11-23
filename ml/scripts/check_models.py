import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load the key directly to avoid path issues
load_dotenv("ml/.env")
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Error: Could not find GEMINI_API_KEY in ml/.env")
    exit(1)

genai.configure(api_key=api_key)

print(f"🔍 Checking available models for your key...")
print("------------------------------------------------")

try:
    found = False
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ AVAILABLE: {m.name}")
            found = True
    
    if not found:
        print("❌ No text generation models found for this key.")
        print("   Possible cause: API Key has no permissions or billing issue.")

except Exception as e:
    print(f"❌ Connection Failed: {e}")

print("------------------------------------------------")
