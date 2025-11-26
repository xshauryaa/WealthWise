/**
 * ML Service for RAG Integration
 * Connects frontend with the ML backend API
 */

import BudgetService from './budgetService';

// Create a singleton instance
const budgetService = new BudgetService();

const ML_API_BASE_URL = 'http://localhost:8000/api/v1';

class MLService {
  constructor() {
    this.baseURL = ML_API_BASE_URL;
  }

  /**
   * Send a chat message to the RAG system
   * @param {string} userId - User identifier
   * @param {string} message - User message
   * @returns {Promise<string>} AI response
   */
  async sendChatMessage(userId, message) {
    try {
      console.log('🤖 Sending message to RAG system:', { userId, message });
      
      // Get relevant budget context for the user's question
      const budgetContext = budgetService.getBudgetContext(message);
      const spendingInsights = budgetService.getSpendingInsights();
      
      console.log('📊 Including budget context:', budgetContext.substring(0, 100) + '...');
      
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          message: message.trim(),
          budget_context: budgetContext,
          spending_insights: spendingInsights
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ RAG Response received from trained system:', data.response.substring(0, 100) + '...');
      
      return data.response;
    } catch (error) {
      console.error('❌ ML Service Error:', error);
      
      // Enhanced fallback with budget context
      return await this.getFallbackResponseWithBudget(message);
    }
  }

  /**
   * Enhanced fallback response with budget context
   * @param {string} message - User message
   * @returns {string} Fallback response with budget data
   */
  async getFallbackResponseWithBudget(message) {
    try {
      const overview = budgetService.getBudgetOverview();
      const message_lower = message.toLowerCase();
      
      // Provide contextual fallbacks with actual budget data
      if (message_lower.includes('budget') || message_lower.includes('spending')) {
        return `Looking at your current budget, you've spent $${overview.totalSpent.toFixed(2)} out of your $${overview.totalBudget.toFixed(2)} monthly budget (${overview.budgetUtilization.toFixed(1)}% used). ${overview.totalRemaining > 0 ? `You have $${overview.totalRemaining.toFixed(2)} remaining this month! 💰` : 'You might want to review your spending this month. 📊'}`;
      }
      
      if (message_lower.includes('food') || message_lower.includes('dining')) {
        const foodAnalysis = budgetService.getCategoryAnalysis('Food');
        if (foodAnalysis) {
          return `Your Food & Dining spending: $${foodAnalysis.spent.toFixed(2)} out of $${foodAnalysis.budget.toFixed(2)} budget (${foodAnalysis.utilizationRate.toFixed(1)}% used). ${foodAnalysis.remaining > 0 ? `You have $${foodAnalysis.remaining.toFixed(2)} left for food this month! 🍽️` : 'You\'ve reached your food budget limit. Consider home cooking to save money! 🏠'}`;
        }
      }
      
      if (message_lower.includes('save') || message_lower.includes('left')) {
        const insights = budgetService.getSpendingInsights();
        if (insights.achievements.length > 0) {
          const topSaving = insights.achievements[0];
          return `Great news! You're saving money in ${topSaving.category} - only ${topSaving.message}. Keep it up! 🌟`;
        }
      }
      
      // Default budget-aware fallback
      return `I'm reconnecting to provide detailed analysis, but I can see you're ${overview.budgetUtilization > 80 ? 'close to your budget limits' : 'doing well with your budget'} this month. How can I help optimize your finances? 💡`;
      
    } catch (error) {
      // If budget service fails, use original fallback
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Original fallback response when ML service is unavailable
   * @param {string} message - User message
   * @returns {string} Fallback response
   */
  getFallbackResponse(message) {
    const message_lower = message.toLowerCase();
    
    // Provide contextual fallbacks based on the message
    if (message_lower.includes('hello') || message_lower.includes('hi')) {
      return "Hello! 👋 I'm Penny, your AI financial advisor. I'm currently reconnecting to my knowledge base, but I'm here to help with your financial questions!";
    }
    
    if (message_lower.includes('budget') || message_lower.includes('spend')) {
      return "Great question about budgeting! While I reconnect to your transaction data, here's a quick tip: Try the 50/30/20 rule - 50% needs, 30% wants, 20% savings. 💰";
    }
    
    if (message_lower.includes('save') || message_lower.includes('emergency')) {
      return "Smart thinking about saving! Start with an emergency fund of $1,000, then build to 3-6 months of expenses. Every dollar counts! 🎯";
    }
    
    const fallbackResponses = [
      "I'm reconnecting to my financial knowledge base! While I get back online, consider reviewing your recent transactions for any spending patterns. �",
      "Just a moment while I access your financial data! In the meantime, remember that small daily savings can add up to big results. ✨",
      "I'm working to restore my connection to your transaction history. Quick tip: Automate your savings to make building wealth effortless! �"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  /**
   * Health check for ML service
   * @returns {Promise<boolean>} Service availability
   */
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return data.status === 'healthy';
      }
      return false;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('⏱️ Health check timed out (3s)');
      } else {
        console.warn('🔍 ML Service health check failed:', error.message);
      }
      return false;
    }
  }

  /**
   * Get categorization for a transaction
   * @param {string} description - Transaction description
   * @param {number} amount - Transaction amount
   * @returns {Promise<string>} Transaction category
   */
  async categorizeTransaction(description, amount) {
    try {
      const response = await fetch(`${this.baseURL}/categorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          amount
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.category;
    } catch (error) {
      console.error('❌ Categorization Error:', error);
      return 'Uncategorized';
    }
  }

  /**
   * Detect anomalies in transactions
   * @param {Array} transactions - Array of transaction objects
   * @returns {Promise<Array>} Anomalies detected
   */
  async detectAnomalies(transactions) {
    try {
      const response = await fetch(`${this.baseURL}/anomalies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.anomalies || [];
    } catch (error) {
      console.error('❌ Anomaly Detection Error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const mlService = new MLService();
export default MLService;
