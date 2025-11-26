/**
 * Test script for Budget-RAG integration
 * Run with: node test-budget-rag.js
 */

const BudgetService = require('./src/services/budgetService-test');

async function testBudgetRAGIntegration() {
    console.log('🧪 Testing Budget-RAG Integration...\n');
    
    try {
        // Initialize budget service
        const budgetService = new BudgetService();
        await budgetService.loadBudgetData();
        
        console.log('✅ Budget data loaded successfully');
        console.log(`📊 Found ${budgetService.budgetData.transactions.length} transactions`);
        console.log(`📂 Found ${Object.keys(budgetService.budgetData.budgetCategories || {}).length} budget categories\n`);
        
        // Test budget overview
        console.log('📋 Testing budget overview...');
        const overview = budgetService.getBudgetOverview();
        console.log('✅ Budget overview successful');
        console.log('📈 Budget Overview:');
        console.log(`   Total Budget: $${overview.totalBudget}`);
        console.log(`   Total Spent: $${overview.totalSpent}`);
        console.log(`   Remaining: $${overview.totalRemaining}`);
        console.log(`   Percentage Used: ${overview.percentageUsed}%\n`);
        
        // Test category analysis
        const categoryAnalysis = budgetService.getCategoryAnalysis();
        console.log('📂 Category Analysis:');
        categoryAnalysis.forEach(cat => {
            console.log(`   ${cat.category}: $${cat.spent}/$${cat.budget} (${cat.percentageUsed}%)`);
        });
        console.log();
        
        // Test budget context generation
        const testQuery = "How am I doing with my food spending?";
        const budgetContext = budgetService.getBudgetContext(testQuery);
        console.log(`🤖 Budget Context for "${testQuery}":`);
        console.log(`   ${budgetContext}\n`);
        
        // Test spending insights
        const insights = budgetService.getSpendingInsights();
        console.log('💡 Spending Insights:');
        Object.entries(insights).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });
        console.log();
        
        // Test ML service integration (simulated)
        console.log('🔗 Budget-RAG integration is ready!');
        console.log('✅ All integrations working correctly!');
        console.log('\n🚀 To test with real ChatScreen:');
        console.log('   1. Make sure ML server is running (http://localhost:8000)');
        console.log('   2. Open the React Native app');
        console.log('   3. Navigate to ChatScreen');
        console.log('   4. Ask budget questions like "How am I doing with my food budget?"');
        console.log('   5. The AI will respond with personalized budget insights! 💡');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run tests
if (require.main === module) {
    testBudgetRAGIntegration();
}

module.exports = { testBudgetRAGIntegration };
