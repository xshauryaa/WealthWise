#!/usr/bin/env python3
"""
WealthWise ML Server Setup Script
Helps configure environment variables and check dependencies
"""

import os
import sys
from pathlib import Path

def setup_environment():
    """Setup environment variables for WealthWise ML Server"""
    print("🚀 WealthWise ML Server Setup\n")
    
    # Check if .env file exists
    env_path = Path(".env")
    env_example_path = Path(".env.example")
    
    if env_path.exists():
        print("✅ .env file already exists")
        choice = input("Do you want to update it? (y/N): ").lower().strip()
        if choice != 'y':
            print("Setup cancelled.")
            return
    
    # Get API key from user
    print("📝 Let's configure your environment variables:\n")
    
    api_key = input("Enter your Gemini API Key (get one from https://aistudio.google.com/app/apikey): ").strip()
    if not api_key:
        print("❌ API Key is required for AI responses")
        sys.exit(1)
    
    # Get optional paths
    chroma_path = input(f"ChromaDB path (default: ./data/chroma_db): ").strip() or "./data/chroma_db"
    data_path = input(f"Training data path (default: ./data/synthetic/transactions.csv): ").strip() or "./data/synthetic/transactions.csv"
    
    # Get server config
    host = input(f"Server host (default: 127.0.0.1): ").strip() or "127.0.0.1"
    port = input(f"Server port (default: 8000): ").strip() or "8000"
    
    # Write .env file
    env_content = f"""# WealthWise ML Server Environment Variables
GEMINI_API_KEY={api_key}
CHROMA_DB_PATH={chroma_path}
DATA_PATH={data_path}
ML_SERVER_HOST={host}
ML_SERVER_PORT={port}
"""
    
    with open(".env", "w") as f:
        f.write(env_content)
    
    print(f"\n✅ Environment configured successfully!")
    print(f"📄 .env file created with your settings")
    
    # Create directories if they don't exist
    os.makedirs(os.path.dirname(chroma_path), exist_ok=True)
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    
    print(f"\n📁 Created directories:")
    print(f"   • {os.path.dirname(chroma_path)}")
    print(f"   • {os.path.dirname(data_path)}")
    
    print(f"\n🚀 You can now start the server with:")
    print(f"   python rag_ml_server.py")
    
    print(f"\n💡 Tips:")
    print(f"   • Keep your .env file secure (it's in .gitignore)")
    print(f"   • The server will work even without training data")
    print(f"   • Add transaction data to {data_path} for better AI responses")

def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        "fastapi", "uvicorn", "pandas", "google-generativeai", 
        "chromadb", "python-dotenv"
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   • {package}")
        print(f"\nInstall them with: pip install {' '.join(missing_packages)}")
        return False
    
    print("✅ All required packages are installed")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "check":
        check_dependencies()
    else:
        if not check_dependencies():
            sys.exit(1)
        setup_environment()
