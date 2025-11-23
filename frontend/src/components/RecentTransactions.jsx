import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../styles/colors';
import budgetData from '../mockups/budget.json';
import Right from '../../assets/Right.svg';
import { padding } from '../styles/spacing';

const { width } = Dimensions.get('window');

const RecentTransactions = ({ onViewHistory }) => {
  // Get the latest 2 transactions from mockup data
  const recentTransactions = budgetData.transactions.slice(0, 2);

  const formatAmount = (amount) => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today - date;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent</Text>
      
      {recentTransactions.map((transaction, index) => (
        <View key={transaction.id}>
          <View style={styles.transactionRow}>
            <View style={styles.transactionInfo}>
              <Text style={styles.merchantName}>{transaction.merchant}</Text>
              <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
            </View>
            <Text style={styles.amount}>
              {transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}
            </Text>
          </View>
          {index < recentTransactions.length - 1 && <View style={styles.separator} />}
        </View>
      ))}

      <TouchableOpacity 
        style={styles.viewHistoryButton}
        onPress={onViewHistory}
        activeOpacity={0.8}
      >
        <Text style={styles.viewHistoryText}>View History</Text>
        <Right color="#000000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (width - 2 * padding.SCREEN_PADDING)/2 - 4,
    height: 200,
    backgroundColor: colors.primary || '#2E8B57',
    borderRadius: width > 400 ? 12 : 10,
    padding: width > 400 ? 12 : 10,
    marginHorizontal: 0,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'space-between',
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: width > 400 ? 18 : 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: width > 400 ? 2 : 1,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: width > 400 ? 4 : 3,
  },
  transactionInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: width > 400 ? 14 : 11,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: 'AlbertSans_500Medium',
  },
  transactionDate: {
    fontSize: width > 400 ? 11 : 9,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'AlbertSans_400Regular',
  },
  amount: {
    fontSize: width > 400 ? 14 : 11,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'AlbertSans_400Regular',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 0,
  },
  viewHistoryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: width > 400 ? 8 : 6,
    paddingVertical: width > 400 ? 6 : 4,
    paddingHorizontal: width > 400 ? 8 : 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: width > 400 ? 6 : 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  viewHistoryText: {
    fontSize: width > 400 ? 13 : 11,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'AlbertSans_500Medium',
  },
  arrowContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: width > 400 ? 32 : 28,
    height: width > 400 ? 32 : 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: width > 400 ? 18 : 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 2,
  },
});

export default RecentTransactions;