# ML-Frontend Integration Documentation

## Overview
This document explains how the WealthWise frontend integrates with the ML RAG (Retrieval-Augmented Generation) system.

## Architecture

### Frontend Components
- **ChatScreen.jsx**: Main chat interface with ML integration
- **MLService.js**: Service layer for ML API communication
- **Test Integration**: Demo functionality in `test-ml-integration.js`

### ML Backend
- **FastAPI Server**: Runs on `localhost:8000`
- **RAG System**: ChromaDB + Gemini Flash for intelligent responses
- **Additional Services**: Transaction categorization, anomaly detection

## Integration Flow

```
User Message → ChatScreen → MLService → ML API → RAG System → Response
```

### 1. User Interaction
```jsx
// User types message in ChatScreen
const userMessage = {
  id: `msg_${Date.now()}`,
  type: 'user',
  content: inputText.trim(),
  timestamp: new Date().toISOString()
};
```

### 2. ML Service Communication
```jsx
// MLService handles API communication
const response = await mlService.sendChatMessage(userId, messageText);
```

### 3. RAG Processing
```python
# ML backend processes with RAG
def chat(user_id: str, message: str):
    # Query ChromaDB for relevant context
    context = rag_service.get_context(message)
    
    # Generate response with Gemini Flash
    response = gemini.generate(context + message)
    return response
```

### 4. Response Display
```jsx
// Display AI response in chat
const assistantMessage = {
  id: `msg_${Date.now() + 1}`,
  type: 'assistant',
  content: aiResponse,
  timestamp: new Date().toISOString()
};
```

## Features Integrated

### ✅ Completed
1. **Health Check**: Tests ML service availability
2. **Smart Fallbacks**: Intelligent responses when ML is offline
3. **Loading States**: Shows user when AI is thinking
4. **Status Indicator**: Real-time ML service status in header
5. **Error Handling**: Graceful degradation with helpful messages

### 🔄 In Progress  
1. **RAG Chat**: Basic structure ready, needs ML backend running
2. **Transaction Categorization**: API endpoint available
3. **Anomaly Detection**: Framework in place

### 🎯 Future Enhancements
1. **User Context**: Personalized responses based on user history
2. **Voice Integration**: Speech-to-text for voice queries
3. **Rich Responses**: Charts and visualizations in chat
4. **Offline Mode**: Local AI for basic queries

## Setup Instructions

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### ML Backend Setup
```bash
cd ML
pip install -e .
cp .env.example .env
# Add GEMINI_API_KEY to .env
uvicorn api.main:app --reload --port 8000
```

## API Endpoints

### Health Check
```
GET /api/v1/health
Response: {"status": "healthy"}
```

### Chat (RAG)
```
POST /api/v1/chat
Body: {"user_id": "string", "message": "string"}  
Response: {"response": "AI generated response"}
```

### Categorization
```
POST /api/v1/categorize
Body: {"description": "transaction description"}
Response: {"category": "Food", "confidence": 0.95}
```

### Anomaly Detection
```
POST /api/v1/anomalies  
Body: {"transactions": [...]}
Response: {"anomalies": [...]}
```

## Error Handling

### ML Service Offline
When the ML backend is unavailable, the frontend:
1. Shows fallback status in header
2. Provides intelligent static responses
3. Explains the situation to users
4. Continues to function normally

### Network Issues
- Retry logic with exponential backoff
- Timeout handling (10 second limit)
- Clear error messages to users

### Invalid Responses
- Response validation
- Sanitization for security
- Default responses for edge cases

## Testing

### Manual Testing
1. Start frontend: `npm start`
2. Open Chat screen
3. Tap status indicator to see ML service status
4. Send messages to test responses

### Automated Testing
```javascript
import { testMLIntegration } from './test-ml-integration';
await testMLIntegration(); // Runs full integration test
```

## Security Considerations

### API Security
- CORS configured for frontend domain
- Input validation on all endpoints
- Rate limiting for API calls

### User Privacy
- User IDs are anonymized
- Messages are not stored permanently
- No sensitive data in logs

## Performance

### Frontend Optimizations
- Debounced typing indicators
- Message virtualization for large chats
- Lazy loading of conversation history

### Backend Optimizations
- ChromaDB indexing for fast retrieval
- Gemini Flash for quick responses
- Connection pooling for database

## Troubleshooting

### Common Issues
1. **ML Service Won't Start**: Check Python dependencies and .env file
2. **No Response**: Verify network connection and API endpoints
3. **Slow Responses**: Check Gemini API quota and ChromaDB performance

### Debug Mode
```javascript
// Enable debug logging
mlService.setDebugMode(true);
```

## Contributing

When adding new ML features:
1. Update MLService.js with new methods
2. Add error handling and fallbacks
3. Update ChatScreen if UI changes needed
4. Add tests in test-ml-integration.js
5. Document API endpoints here

---

*Last updated: December 2024*
*Version: 1.0.0*
