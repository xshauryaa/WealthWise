/**
 * Microinvesting Service
 * Handles API communication for microinvesting features
 */

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Adjust based on your backend URL

class MicroinvestingService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/microinvesting`;
  }

  /**
   * Get user's investment portfolio summary
   */
  async getPortfolio() {
    try {
      const response = await fetch(`${this.baseURL}/portfolio`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers when Clerk is integrated
        },
      });

      if (!response.ok) {
        throw new Error(`Portfolio fetch failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      // Return mock data for development
      return this.getMockPortfolio();
    }
  }

  /**
   * Get investment history
   */
  async getInvestments(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${this.baseURL}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Investments fetch failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching investments:', error);
      return this.getMockInvestments();
    }
  }

  /**
   * Create a new investment
   */
  async createInvestment(investmentData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(investmentData),
      });

      if (!response.ok) {
        throw new Error(`Investment creation failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating investment:', error);
      throw error;
    }
  }

  /**
   * Update round-up settings
   */
  async updateRoundUpSettings(settings) {
    try {
      const response = await fetch(`${this.baseURL}/round-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Round-up settings update failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating round-up settings:', error);
      throw error;
    }
  }

  /**
   * Get portfolio diversification analysis
   */
  async getDiversificationAnalysis() {
    try {
      const response = await fetch(`${this.baseURL}/diversification`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Diversification analysis failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching diversification analysis:', error);
      // Return mock data for development
      const portfolio = this.getMockPortfolio();
      return portfolio.diversificationAnalysis;
    }
  }

  /**
   * Get ETF recommendations based on current portfolio
   */
  async getETFRecommendations() {
    try {
      const response = await fetch(`${this.baseURL}/recommendations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`ETF recommendations failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching ETF recommendations:', error);
      // Return mock data for development
      const portfolio = this.getMockPortfolio();
      return portfolio.recommendedETFs;
    }
  }

  /**
   * Mock portfolio data for development
   */
  getMockPortfolio() {
    return {
      totalValue: 1247.83,
      totalInvested: 1150.00,
      totalGains: 97.83,
      gainPercentage: 8.51,
      roundUpInvestments: 234.50,
      manualInvestments: 915.50,
      
      // Diversification Analysis
      diversificationScore: 7.2, // Out of 10
      diversificationAnalysis: {
        score: 7.2,
        grade: 'B+',
        strengths: ['Good geographic diversification', 'Balanced asset allocation'],
        weaknesses: ['Overweight in US markets', 'Limited sector diversification'],
        recommendations: [
          'Consider adding emerging markets exposure',
          'Increase international bond allocation',
          'Add sector-specific ETFs for better balance'
        ]
      },

      // ETF Recommendations
      recommendedETFs: [
        {
          symbol: 'VXUS',
          name: 'Vanguard Total International Stock ETF',
          reason: 'Improve geographic diversification',
          expenseRatio: 0.08,
          priority: 'High',
          currentAllocation: 25.0,
          recommendedAllocation: 35.0,
          score: 9.1,
          category: 'International Equity',
          description: 'Provides broad exposure to non-US developed and emerging markets'
        },
        {
          symbol: 'VWO',
          name: 'Vanguard Emerging Markets ETF',
          reason: 'Add emerging market exposure',
          expenseRatio: 0.10,
          priority: 'Medium',
          currentAllocation: 0.0,
          recommendedAllocation: 10.0,
          score: 8.5,
          category: 'Emerging Markets',
          description: 'Exposure to high-growth emerging market economies'
        },
        {
          symbol: 'VGIT',
          name: 'Vanguard Intermediate-Term Treasury ETF',
          reason: 'Enhance bond diversification',
          expenseRatio: 0.04,
          priority: 'Low',
          currentAllocation: 0.0,
          recommendedAllocation: 5.0,
          score: 7.8,
          category: 'Government Bonds',
          description: 'Stable income and portfolio stability through government bonds'
        }
      ],

      assets: [
        {
          type: 'etf',
          symbol: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          value: 623.92,
          shares: 2.75,
          allocation: 50.0,
          gainLoss: 48.92,
          gainPercentage: 8.51,
          expenseRatio: 0.03,
          diversificationContribution: 8.5,
          riskLevel: 'Medium-High'
        },
        {
          type: 'etf',
          symbol: 'VXUS',
          name: 'Vanguard Total International Stock ETF',
          value: 311.96,
          shares: 5.42,
          allocation: 25.0,
          gainLoss: 24.46,
          gainPercentage: 8.51,
          expenseRatio: 0.08,
          diversificationContribution: 9.2,
          riskLevel: 'Medium-High'
        },
        {
          type: 'crypto',
          symbol: 'BTC',
          name: 'Bitcoin',
          value: 187.47,
          shares: 0.0021,
          allocation: 15.0,
          gainLoss: 15.22,
          gainPercentage: 8.83,
          expenseRatio: 0.0,
          diversificationContribution: 6.1,
          riskLevel: 'Very High'
        },
        {
          type: 'bonds',
          symbol: 'BND',
          name: 'Vanguard Total Bond Market ETF',
          value: 124.48,
          shares: 1.52,
          allocation: 10.0,
          gainLoss: 9.23,
          gainPercentage: 8.01,
          expenseRatio: 0.03,
          diversificationContribution: 7.8,
          riskLevel: 'Low'
        }
      ],
      recentActivity: [
        {
          id: 'inv_001',
          type: 'round_up',
          amount: 2.47,
          asset: 'VTI',
          date: '2025-11-24',
          description: 'Round-up from coffee purchase'
        },
        {
          id: 'inv_002', 
          type: 'manual',
          amount: 50.00,
          asset: 'VXUS',
          date: '2025-11-23',
          description: 'Weekly investment'
        },
        {
          id: 'inv_003',
          type: 'round_up',
          amount: 1.23,
          asset: 'BTC',
          date: '2025-11-23',
          description: 'Round-up from grocery shopping'
        }
      ],
      roundUpSettings: {
        isEnabled: true,
        roundUpMultiple: 1,
        minimumAmount: 0.50,
        maximumAmount: 5.00,
        defaultAsset: 'VTI'
      }
    };
  }

  /**
   * Mock investments data for development
   */
  getMockInvestments() {
    return {
      investments: [
        {
          id: 'inv_001',
          amount: 2.47,
          assetType: 'etf',
          symbol: 'VTI',
          quantity: 0.011,
          date: '2025-11-24T10:30:00Z',
          type: 'round_up',
          status: 'completed',
          notes: 'Auto-invested from round-up'
        },
        {
          id: 'inv_002',
          amount: 50.00,
          assetType: 'etf', 
          symbol: 'VXUS',
          quantity: 0.87,
          date: '2025-11-23T09:00:00Z',
          type: 'manual',
          status: 'completed',
          notes: 'Weekly investment'
        },
        {
          id: 'inv_003',
          amount: 1.23,
          assetType: 'crypto',
          symbol: 'BTC',
          quantity: 0.000014,
          date: '2025-11-23T14:22:00Z',
          type: 'round_up', 
          status: 'completed',
          notes: 'Auto-invested from round-up'
        },
        {
          id: 'inv_004',
          amount: 25.00,
          assetType: 'stocks',
          symbol: 'AAPL',
          quantity: 0.11,
          date: '2025-11-22T11:15:00Z',
          type: 'manual',
          status: 'completed',
          notes: 'Tech stock investment'
        }
      ],
      pagination: {
        total: 47,
        page: 1,
        limit: 20,
        hasMore: true
      }
    };
  }
}

export const microinvestingService = new MicroinvestingService();
export default MicroinvestingService;
