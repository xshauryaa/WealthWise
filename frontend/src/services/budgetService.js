/**
 * Budget Service for RAG Integration
 * Provides budget data to the ML service for personalized financial advice
 */

import budgetData from '../mockups/budget.json';

class BudgetService {
  constructor() {
    this.budgetData = budgetData;
  }

  /**
   * Load budget data (already available via import)
   * @returns {Object} Budget data
   */
  async loadBudgetData() {
    // Data is already loaded via import, just return it
    return this.budgetData;
  }

  /**
   * Get current user's budget overview
   * @returns {Object} Budget summary with key metrics
   */
  getBudgetOverview() {
    const categories = this.budgetData.budgetCategories;
    const transactions = this.budgetData.transactions;
    
    // Calculate totals
    const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetLimit, 0);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    
    // Find categories over/under budget
    const overBudget = categories.filter(cat => cat.spent > cat.budgetLimit);
    const underBudget = categories.filter(cat => cat.spent < cat.budgetLimit * 0.8); // Under 80% usage
    const nearLimit = categories.filter(cat => 
      cat.spent >= cat.budgetLimit * 0.8 && cat.spent <= cat.budgetLimit
    );

    // Recent transactions (last 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentTransactions = transactions.filter(txn => 
      new Date(txn.date) >= weekAgo && txn.type === 'expense'
    );

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      budgetUtilization: (totalSpent / totalBudget) * 100,
      overBudgetCategories: overBudget.map(cat => ({
        name: cat.name,
        budget: cat.budgetLimit,
        spent: cat.spent,
        overage: cat.spent - cat.budgetLimit
      })),
      underUtilizedCategories: underBudget.map(cat => ({
        name: cat.name,
        budget: cat.budgetLimit,
        spent: cat.spent,
        remaining: cat.budgetLimit - cat.spent,
        utilizationRate: (cat.spent / cat.budgetLimit) * 100
      })),
      nearLimitCategories: nearLimit.map(cat => ({
        name: cat.name,
        budget: cat.budgetLimit,
        spent: cat.spent,
        remaining: cat.budgetLimit - cat.spent,
        utilizationRate: (cat.spent / cat.budgetLimit) * 100
      })),
      recentTransactions: recentTransactions.slice(-5).map(txn => ({
        date: txn.date,
        category: txn.category,
        description: txn.description,
        amount: txn.amount,
        merchant: txn.merchant
      }))
    };
  }

  /**
   * Get specific category analysis
   * @param {string} categoryName - Name of the category to analyze
   * @returns {Object} Detailed category information
   */
  getCategoryAnalysis(categoryName) {
    const category = this.budgetData.budgetCategories.find(
      cat => cat.name.toLowerCase().includes(categoryName.toLowerCase())
    );
    
    if (!category) {
      return null;
    }

    const categoryTransactions = this.budgetData.transactions.filter(
      txn => txn.category === category.name && txn.type === 'expense'
    );

    // Calculate spending patterns
    const dailyAverage = categoryTransactions.length > 0 ? 
      category.spent / 30 : 0; // Assuming monthly data
    
    const averageTransactionSize = categoryTransactions.length > 0 ?
      category.spent / categoryTransactions.length : 0;

    const largestTransaction = categoryTransactions.reduce((max, txn) => 
      txn.amount > max.amount ? txn : max, { amount: 0 });

    return {
      category: category.name,
      budget: category.budgetLimit,
      spent: category.spent,
      remaining: category.budgetLimit - category.spent,
      utilizationRate: (category.spent / category.budgetLimit) * 100,
      dailyAverage,
      averageTransactionSize,
      transactionCount: categoryTransactions.length,
      largestTransaction: largestTransaction.amount > 0 ? {
        amount: largestTransaction.amount,
        description: largestTransaction.description,
        merchant: largestTransaction.merchant,
        date: largestTransaction.date
      } : null,
      recentTransactions: categoryTransactions.slice(-3)
    };
  }

  /**
   * Get budget context for RAG system
   * @param {string} userQuery - The user's question to provide relevant context
   * @returns {string} Formatted budget context for AI analysis
   */
  getBudgetContext(userQuery) {
    const overview = this.getBudgetOverview();
    const queryLower = userQuery.toLowerCase();
    
    let context = `CURRENT BUDGET STATUS:
• Total Monthly Budget: $${overview.totalBudget.toFixed(2)}
• Total Spent: $${overview.totalSpent.toFixed(2)}
• Remaining: $${overview.totalRemaining.toFixed(2)}
• Budget Utilization: ${overview.budgetUtilization.toFixed(1)}%

`;

    // Add specific context based on user query
    if (queryLower.includes('budget') || queryLower.includes('over') || queryLower.includes('limit')) {
      if (overview.overBudgetCategories.length > 0) {
        context += `OVER-BUDGET CATEGORIES:\n`;
        overview.overBudgetCategories.forEach(cat => {
          context += `• ${cat.name}: $${cat.spent.toFixed(2)} spent (budget: $${cat.budget.toFixed(2)}, over by: $${cat.overage.toFixed(2)})\n`;
        });
        context += '\n';
      }

      if (overview.nearLimitCategories.length > 0) {
        context += `NEAR BUDGET LIMIT:\n`;
        overview.nearLimitCategories.forEach(cat => {
          context += `• ${cat.name}: $${cat.spent.toFixed(2)} spent (${cat.utilizationRate.toFixed(1)}% of budget, $${cat.remaining.toFixed(2)} remaining)\n`;
        });
        context += '\n';
      }
    }

    // Add category-specific context
    const categoryKeywords = {
      'food': ['food', 'eat', 'dining', 'restaurant', 'grocery'],
      'housing': ['rent', 'housing', 'home', 'apartment'],
      'transportation': ['transport', 'gas', 'car', 'uber', 'transit'],
      'shopping': ['shop', 'buy', 'purchase', 'amazon'],
      'entertainment': ['movie', 'entertainment', 'fun', 'netflix'],
      'healthcare': ['health', 'doctor', 'medical'],
      'utilities': ['utility', 'electric', 'water', 'internet']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        const analysis = this.getCategoryAnalysis(category);
        if (analysis) {
          context += `SPECIFIC CATEGORY - ${analysis.category.toUpperCase()}:
• Budget: $${analysis.budget.toFixed(2)}
• Spent: $${analysis.spent.toFixed(2)} (${analysis.utilizationRate.toFixed(1)}%)
• Remaining: $${analysis.remaining.toFixed(2)}
• Daily Average: $${analysis.dailyAverage.toFixed(2)}
• Transaction Count: ${analysis.transactionCount}
`;
          if (analysis.largestTransaction) {
            context += `• Largest Purchase: $${analysis.largestTransaction.amount.toFixed(2)} at ${analysis.largestTransaction.merchant}\n`;
          }
          context += '\n';
        }
        break; // Only add context for the first matching category
      }
    }

    // Add recent spending if query is about recent activity
    if (queryLower.includes('recent') || queryLower.includes('last') || queryLower.includes('this week')) {
      context += `RECENT TRANSACTIONS (Last 5):\n`;
      overview.recentTransactions.forEach(txn => {
        context += `• ${txn.date}: $${txn.amount.toFixed(2)} at ${txn.merchant} (${txn.category})\n`;
      });
      context += '\n';
    }

    return context;
  }

  /**
   * Get spending insights for proactive advice
   * @returns {Object} Key insights about spending patterns
   */
  getSpendingInsights() {
    const overview = this.getBudgetOverview();
    
    const insights = {
      alerts: [],
      recommendations: [],
      achievements: []
    };

    // Alerts for over-budget categories
    overview.overBudgetCategories.forEach(cat => {
      insights.alerts.push({
        type: 'over_budget',
        category: cat.name,
        message: `You're $${cat.overage.toFixed(2)} over budget in ${cat.name}`,
        severity: 'high'
      });
    });

    // Recommendations for optimization
    overview.nearLimitCategories.forEach(cat => {
      insights.recommendations.push({
        type: 'budget_warning',
        category: cat.name,
        message: `${cat.name} is at ${cat.utilizationRate.toFixed(1)}% of budget with $${cat.remaining.toFixed(2)} remaining`,
        action: 'Consider reducing spending in this category'
      });
    });

    // Achievements for under-budget categories
    overview.underUtilizedCategories.forEach(cat => {
      if (cat.utilizationRate < 50) {
        insights.achievements.push({
          type: 'under_budget',
          category: cat.name,
          message: `Great job! You're only using ${cat.utilizationRate.toFixed(1)}% of your ${cat.name} budget`,
          savings: cat.remaining
        });
      }
    });

    return insights;
  }
}

// Export singleton instance
export const budgetService = new BudgetService();
export default BudgetService;
