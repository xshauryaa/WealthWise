# WealthWise ML Service

Standalone Microservice for Financial Intelligence.

## Setup

1. **Environment**:
   \`\`\`bash
   cd ml
   pip install -e .[dev]
   # OR
   conda env create -f environment.yml
   conda activate wealthwise-ml
   \`\`\`

2. **Configuration**:
   \`cp .env.example .env\`
   Add your Gemini API Key.

3. **Run Server**:
   \`uvicorn ml.api.main:app --reload\`

## Architecture
- **Categorizer**: Hybrid (Keyword + Gemini Flash)
- **Anomaly**: Statistical (Z-Score) + Velocity
- **RAG**: ChromaDB + Gemini Flash
