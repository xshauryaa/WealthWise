/**
 * Test script to demonstrate ML service integration
 * This shows how the frontend communicates with the ML backend
 */

import { mlService } from './mlService';

export const testMLIntegration = async () => {
  console.log('🧪 Testing ML Service Integration...');
  
  // Test 1: Health Check
  console.log('\n1️⃣ Testing Health Check...');
  const isHealthy = await mlService.checkHealth();
  console.log(`   Health Status: ${isHealthy ? '✅ Connected' : '❌ Disconnected'}`);
  
  // Test 2: Chat Message (RAG)
  if (isHealthy) {
    console.log('\n2️⃣ Testing RAG Chat...');
    try {
      const response = await mlService.sendChatMessage('test_user', 'How can I save more money?');
      console.log(`   RAG Response: ${response.substring(0, 100)}...`);
    } catch (error) {
      console.log(`   RAG Error: ${error.message}`);
    }
    
    // Test 3: Transaction Categorization
    console.log('\n3️⃣ Testing Transaction Categorization...');
    try {
      const category = await mlService.categorizeTransaction('Starbucks Coffee - $5.50');
      console.log(`   Category: ${category}`);
    } catch (error) {
      console.log(`   Categorization Error: ${error.message}`);
    }
    
    // Test 4: Anomaly Detection
    console.log('\n4️⃣ Testing Anomaly Detection...');
    try {
      const transactions = [
        { amount: 5.50, description: 'Coffee', category: 'Food' },
        { amount: 12.99, description: 'Lunch', category: 'Food' },
        { amount: 1500.00, description: 'Luxury Watch', category: 'Shopping' }
      ];
      const anomalies = await mlService.detectAnomalies(transactions);
      console.log(`   Found ${anomalies.length} anomalies`);
    } catch (error) {
      console.log(`   Anomaly Detection Error: ${error.message}`);
    }
  } else {
    console.log('\n⚠️  ML Service offline - using fallback responses');
    console.log('   To test full integration:');
    console.log('   1. Start the ML backend: cd ML && uvicorn api.main:app --reload');
    console.log('   2. Ensure dependencies are installed');
    console.log('   3. Check .env file has GEMINI_API_KEY');
  }
  
  console.log('\n🎯 Integration test complete!');
};

// Demo data for testing
export const demoQuestions = [
  "How can I create a budget?",
  "What's the best investment strategy for beginners?",
  "How much should I save for an emergency fund?",
  "What are the benefits of microinvesting?",
  "How can I reduce my monthly expenses?",
];

export const demoTransactions = [
  { amount: 5.50, description: 'Starbucks Coffee', category: 'Food' },
  { amount: 85.00, description: 'Grocery Store', category: 'Food' },
  { amount: 1200.00, description: 'Rent Payment', category: 'Housing' },
  { amount: 45.99, description: 'Gas Station', category: 'Transportation' },
  { amount: 2500.00, description: 'Designer Handbag', category: 'Shopping' }, // Potential anomaly
];
