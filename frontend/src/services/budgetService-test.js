/**
 * Budget Service for RAG Integration (CommonJS version for testing)
 * Provides budget data to the ML service for personalized financial advice
 */

const fs = require('fs');
const path = require('path');

class BudgetService {
  constructor() {
    this.budgetData = null;
  }

  /**
   * Load budget data from file
   * @returns {Object} Loaded budget data
   */
  async loadBudgetData() {
    if (this.budgetData) {
      return this.budgetData;
    }
    
    try {
      const budgetPath = path.join(__dirname, '../mockups/budget.json');
      const rawData = fs.readFileSync(budgetPath, 'utf8');
      this.budgetData = JSON.parse(rawData);
      return this.budgetData;
    } catch (error) {
      console.error('Error loading budget data:', error);
      throw error;
    }
  }

  /**
   * Get current user's budget overview
   * @returns {Object} Budget summary with key metrics
   */
  getBudgetOverview() {
    if (!this.budgetData) {
      throw new Error('Budget data not loaded. Call loadBudgetData() first.');
    }
    
    const categories = this.budgetData.budgetCategories || this.budgetData.budget;
    const transactions = this.budgetData.transactions;

    let totalBudget = 0;
    let totalSpent = 0;

    if (Array.isArray(categories)) {
      // budgetCategories format
      categories.forEach(cat => {
        totalBudget += cat.budgetLimit || cat.budget || cat.limit || 0;
        totalSpent += cat.spent || 0;
      });
    } else {
      // budget object format
      Object.values(categories).forEach(cat => {
        totalBudget += cat.budgetLimit || cat.limit || 0;
        totalSpent += cat.spent || 0;
      });
    }

    const totalRemaining = totalBudget - totalSpent;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      budgetUtilization,
      percentageUsed: Math.round(budgetUtilization)
    };
  }

  /**
   * Get detailed analysis of each budget category
   * @returns {Array} Array of category objects with spending details
   */
  getCategoryAnalysis() {
    if (!this.budgetData) {
      throw new Error('Budget data not loaded. Call loadBudgetData() first.');
    }
    
    const categories = this.budgetData.budgetCategories || this.budgetData.budget;
    const analysis = [];

    if (Array.isArray(categories)) {
      // budgetCategories format
      categories.forEach(cat => {
        const budget = cat.budgetLimit || cat.budget || cat.limit || 0;
        const spent = cat.spent || 0;
        analysis.push({
          category: cat.name,
          budget: budget,
          spent: spent,
          remaining: budget - spent,
          percentageUsed: Math.round((spent / (budget || 1)) * 100)
        });
      });
    } else {
      // budget object format
      Object.entries(categories).forEach(([name, cat]) => {
        const budget = cat.budgetLimit || cat.limit || 0;
        const spent = cat.spent || 0;
        analysis.push({
          category: name,
          budget: budget,
          spent: spent,
          remaining: budget - spent,
          percentageUsed: Math.round((spent / (budget || 1)) * 100)
        });
      });
    }

    return analysis;
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

CATEGORY BREAKDOWN:`;

    const categoryAnalysis = this.getCategoryAnalysis();
    
    // Include relevant categories based on query
    const relevantCategories = categoryAnalysis.filter(cat => {
      return queryLower.includes(cat.category.toLowerCase()) ||
             ['food', 'grocery', 'restaurant'].some(keyword => 
               queryLower.includes(keyword) && cat.category.toLowerCase().includes('food')
             ) ||
             ['shopping', 'clothes', 'clothing'].some(keyword =>
               queryLower.includes(keyword) && cat.category.toLowerCase().includes('shopping')
             );
    });

    if (relevantCategories.length > 0) {
      relevantCategories.forEach(cat => {
        context += `\n• ${cat.category}: $${cat.spent}/$${cat.budget} (${cat.percentageUsed}% used)`;
      });
    } else {
      // Show all categories if no specific match
      categoryAnalysis.forEach(cat => {
        context += `\n• ${cat.category}: $${cat.spent}/$${cat.budget} (${cat.percentageUsed}% used)`;
      });
    }

    return context;
  }

  /**
   * Get spending insights for proactive advice
   * @returns {Object} Key insights about spending patterns
   */
  getSpendingInsights() {
    const overview = this.getBudgetOverview();
    const categoryAnalysis = this.getCategoryAnalysis();
    
    const insights = {};
    
    // Overall budget health
    if (overview.budgetUtilization > 90) {
      insights.budgetAlert = "You've used over 90% of your monthly budget";
    } else if (overview.budgetUtilization > 75) {
      insights.budgetWarning = "You're approaching 75% of your monthly budget";
    }
    
    // Category-specific insights
    const overspentCategories = categoryAnalysis.filter(cat => cat.percentageUsed > 100);
    const nearLimitCategories = categoryAnalysis.filter(cat => cat.percentageUsed > 80 && cat.percentageUsed <= 100);
    
    if (overspentCategories.length > 0) {
      insights.overspent = `Overspent in: ${overspentCategories.map(cat => cat.category).join(', ')}`;
    }
    
    if (nearLimitCategories.length > 0) {
      insights.nearLimit = `Near budget limit in: ${nearLimitCategories.map(cat => cat.category).join(', ')}`;
    }
    
    // Positive insights
    const wellManagedCategories = categoryAnalysis.filter(cat => cat.percentageUsed <= 50);
    if (wellManagedCategories.length > 0) {
      insights.wellManaged = `Good spending control in: ${wellManagedCategories.map(cat => cat.category).join(', ')}`;
    }
    
    return insights;
  }
}

module.exports = BudgetService;
