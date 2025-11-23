import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Dimensions,
  FlatList
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { SvgXml } from 'react-native-svg';
import { colors } from '../styles/colors';
import { Header } from '../components/Header';
import { TransactionDetailsModal } from '../components/TransactionDetailsModal';
import budgetData from '../mockups/budget.json';

// Import SVG icons
const StarOutlineSvg = require('../../assets/system-icons/Star-Outline.svg');
const WarningSvg = require('../../assets/system-icons/Warning.svg');

const { width, height } = Dimensions.get('window');

export function BudgetScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const periods = [
    { label: 'Last 30 Days', value: '30' },
    { label: 'Last 60 Days', value: '60' },
    { label: 'Last 90 Days', value: '90' }
  ];

  const filteredTransactions = useMemo(() => {
    const days = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filtered = budgetData.transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const isWithinPeriod = transactionDate >= cutoffDate;
        return isWithinPeriod; // Include both income and expense transactions
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return filtered;
  }, [selectedPeriod]);

  const expenseTransactions = useMemo(() => {
    return filteredTransactions.filter(transaction => transaction.type === 'expense');
  }, [filteredTransactions]);

  const incomeTransactions = useMemo(() => {
    return filteredTransactions.filter(transaction => transaction.type === 'income');
  }, [filteredTransactions]);

  const totalIncome = useMemo(() => {
    return incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [incomeTransactions]);

  const categoryTotals = useMemo(() => {
    const totals = {};
    expenseTransactions.forEach(transaction => {
      if (!totals[transaction.category]) {
        totals[transaction.category] = 0;
      }
      totals[transaction.category] += transaction.amount;
    });
    return totals;
  }, [expenseTransactions]);

  const chartData = useMemo(() => {
    const categories = Object.keys(categoryTotals);
    const colors = ['#4CAF50', '#2E7D32', '#8BC34A', '#689F38', '#CDDC39', '#9E9D24', '#66BB6A', '#388E3C'];
    
    return categories.map((category, index) => ({
      name: category,
      amount: categoryTotals[category],
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  }, [categoryTotals]);

  const totalSpent = useMemo(() => {
    return Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
  }, [categoryTotals]);

  const handleTransactionPress = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedTransaction(null);
  };

  const renderTransaction = ({ item }) => {
    const isIncome = item.type === 'income';
    const categoryBudget = budgetData.budgetCategories.find(
      budget => budget.name === item.category
    );
    
    return (
      <TouchableOpacity 
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <View style={styles.categoryIndicator}>
              <Text style={styles.categoryEmoji}>
                {isIncome ? '💰' : (categoryBudget?.icon || '💳')}
              </Text>
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>{item.description}</Text>
              <Text style={styles.transactionMerchant}>{item.merchant}</Text>
              <Text style={styles.transactionDate}>
                {new Date(item.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={[
              styles.amountText, 
              { color: isIncome ? '#4CAF50' : colors.dark }
            ]}>
              {isIncome ? '+' : '-'}${item.amount.toFixed(2)}
            </Text>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title="Transactions" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Filter */}
        <View style={styles.filterContainer}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.filterButton,
                selectedPeriod === period.value && styles.activeFilter
              ]}
              onPress={() => setSelectedPeriod(period.value)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterText,
                selectedPeriod === period.value && styles.activeFilterText
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pie Chart */}
        {chartData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Spending by Category</Text>
            <View style={styles.chartWrapper}>
              <PieChart
                data={chartData}
                width={width - 32}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                hasLegend={true}
                center={[10, 10]}
                absolute={false}
                avoidFalseZero={true}
              />
            </View>
          </View>
        )}

        {/* AI Insight Toast */}
        <View style={styles.insightToastContainer}>
          {totalIncome - totalSpent >= 0 ? (
            <View style={[styles.insightToast, styles.positiveToast]}>
              <View style={styles.insightIconContainer}>
                <SvgXml 
                  xml={`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.9718 2.70846C11.4382 1.93348 12.5618 1.93348 13.0282 2.70847L15.3586 6.58087C15.5262 6.85928 15.7995 7.05784 16.116 7.13116L20.5191 8.15091C21.4002 8.35499 21.7474 9.42356 21.1545 10.1066L18.1918 13.5196C17.9788 13.765 17.8744 14.0863 17.9025 14.41L18.2932 18.9127C18.3714 19.8138 17.4625 20.4742 16.6296 20.1214L12.4681 18.3583C12.1689 18.2316 11.8311 18.2316 11.5319 18.3583L7.37038 20.1214C6.53754 20.4742 5.62856 19.8138 5.70677 18.9127L6.09754 14.41C6.12563 14.0863 6.02124 13.765 5.80823 13.5196L2.8455 10.1066C2.25257 9.42356 2.59977 8.35499 3.48095 8.15091L7.88397 7.13116C8.20053 7.05784 8.47383 6.85928 8.64138 6.58087L10.9718 2.70846Z" stroke="${colors.primary}" stroke-width="1.5"/>
                  </svg>`}
                  width={24} 
                  height={24} 
                />
              </View>
              <View style={styles.insightTextContainer}>
                <Text style={[styles.insightMessage, { color: colors.primary }]}>
                  You're on track to save ${(totalIncome - totalSpent).toFixed(2)} this month
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.insightToast, styles.warningToast]}>
              <View style={styles.insightIconContainer}>
                <SvgXml 
                  xml={`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 17.9261C2 17.3187 2.15479 16.7214 2.44975 16.1904L8.63566 5.0558C9.18399 4.06881 10.1381 3.37239 11.2452 3.15096C11.7435 3.05131 12.2565 3.05131 12.7548 3.15096C13.8619 3.37239 14.816 4.06881 15.3643 5.05581L21.5502 16.1904C21.8452 16.7214 22 17.3187 22 17.9261C22 19.8999 20.3999 21.5 18.4261 21.5H5.57391C3.60009 21.5 2 19.8999 2 17.9261Z" stroke="#f44336" stroke-width="1.5"/>
                    <path d="M12 9L12 13" stroke="#f44336" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 16L12 16.5" stroke="#f44336" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>`}
                  width={24} 
                  height={24} 
                />
              </View>
              <View style={styles.insightTextContainer}>
                <Text style={[styles.insightMessage, { color: '#f44336' }]}>
                  You're on track to overspend ${Math.abs(totalIncome - totalSpent).toFixed(2)} this month
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Financial Summary Card */}
        <View style={styles.financialSummaryCard}>
          <Text style={styles.summaryPeriodText}>Last {selectedPeriod} days</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                +${totalIncome.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Spent</Text>
              <Text style={[styles.summaryValue, { color: '#f44336' }]}>
                -${totalSpent.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryLabel}>Net Balance</Text>
              <Text style={[
                styles.summaryValue,
                { color: (totalIncome - totalSpent) >= 0 ? '#4CAF50' : '#f44336' }
              ]}>
                {(totalIncome - totalSpent) >= 0 ? '+' : ''}${(totalIncome - totalSpent).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Transaction History</Text>
          <Text style={styles.historySubtitle}>
            {filteredTransactions.length} transactions • Last {selectedPeriod} days
          </Text>
        </View>

        {/* Transaction List */}
        <View style={styles.transactionsList}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <View key={transaction.id}>
                {renderTransaction({ item: transaction })}
              </View>
            ))
          ) : (
            <View style={styles.noTransactions}>
              <Text style={styles.noTransactionsText}>
                No transactions found for the selected period
              </Text>
              <Text style={styles.noTransactionsSubtext}>
                Try selecting a longer time period
              </Text>
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal 
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.light,
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: colors.grey.light,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_500Medium',
  },
  activeFilterText: {
    color: colors.light,
  },
  totalCard: {
    backgroundColor: colors.light,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  financialSummaryCard: {
    backgroundColor: colors.light,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryPeriodText: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryColumn: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'AlbertSans_700Bold',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.grey.light,
    marginHorizontal: 8,
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.light,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'AlbertSans_700Bold',
  },
  netCard: {
    backgroundColor: colors.light,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  netLabel: {
    fontSize: 16,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_500Medium',
    marginBottom: 8,
    textAlign: 'center',
  },
  netAmount: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'AlbertSans_700Bold',
    marginBottom: 4,
  },
  periodText: {
    fontSize: 12,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
  },
  chartContainer: {
    backgroundColor: colors.light,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
  },
  historyContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
  },
  transactionsList: {
    paddingHorizontal: 16,
  },
  transactionItem: {
    backgroundColor: colors.light,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIndicator: {
    width: 40,
    height: 40,
    backgroundColor: colors.grey.light,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.dark,
    fontFamily: 'AlbertSans_500Medium',
    marginBottom: 2,
  },
  transactionMerchant: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.grey.medium2,
    fontFamily: 'AlbertSans_400Regular',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 12,
    color: colors.grey.medium2,
    fontFamily: 'AlbertSans_400Regular',
  },
  bottomSpacing: {
    height: 20,
  },
  noTransactions: {
    backgroundColor: colors.light,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noTransactionsText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_500Medium',
    marginBottom: 4,
    textAlign: 'center',
  },
  noTransactionsSubtext: {
    fontSize: 14,
    color: colors.grey.medium2,
    fontFamily: 'AlbertSans_400Regular',
    textAlign: 'center',
  },
  insightToastContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  insightToast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  positiveToast: {
    backgroundColor: colors.secondary,
  },
  warningToast: {
    backgroundColor: '#ffebee',
  },
  insightIconContainer: {
    marginRight: 12,
  },
  insightTextContainer: {
    flex: 1,
  },
  insightMessage: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'AlbertSans_500Medium',
    lineHeight: 22,
  },
});