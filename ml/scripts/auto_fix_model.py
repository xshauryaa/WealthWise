import google.generativeai as genai
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(ENV_PATH)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ Error: GEMINI_API_KEY not found")
    exit(1)

genai.configure(api_key=api_key)

print("🔍 Finding valid Gemini model...")
try:
    valid_models = [m.name for m in genai.list_models() if "generateContent" in m.supported_generation_methods]
except Exception as e:
    print(f"❌ API Error: {e}")
    exit(1)

# Priority: Specific Flash -> Any Flash -> First Available
chosen = next((m for m in valid_models if "flash" in m and "1.5" in m), 
         next((m for m in valid_models if "flash" in m), 
         valid_models[0] if valid_models else None))

if not chosen:
    print("❌ No valid models found.")
    exit(1)

clean_name = chosen.replace("models/", "")
print(f"✅ Selected Model: {clean_name}")

# Update .env
lines = []
if ENV_PATH.exists():
    with open(ENV_PATH, "r") as f:
        lines = f.readlines()

with open(ENV_PATH, "w") as f:
    found = False
    for line in lines:
        if line.startswith("GEMINI_MODEL="):
            f.write(f"GEMINI_MODEL={clean_name}\n")
            found = True
        else:
            f.write(line)
    if not found:
        f.write(f"\nGEMINI_MODEL={clean_name}\n")
print("💾 Configuration updated.")
