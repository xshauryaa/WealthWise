import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

export function PortfolioCard({ portfolio }) {
  const isPositive = portfolio.totalGains >= 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio Value</Text>
        <View style={[styles.gainsBadge, isPositive ? styles.positiveGains : styles.negativeGains]}>
          {isPositive ? (
            <TrendingUp size={16} color={colors.success} />
          ) : (
            <TrendingDown size={16} color={colors.error} />
          )}
          <Text style={[styles.gainsText, isPositive ? styles.positiveText : styles.negativeText]}>
            {isPositive ? '+' : ''}{portfolio.gainPercentage.toFixed(2)}%
          </Text>
        </View>
      </View>
      
      <Text style={styles.totalValue}>
        ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </Text>
      
      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Total Invested</Text>
          <Text style={styles.breakdownValue}>
            ${portfolio.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Total Gains</Text>
          <Text style={[styles.breakdownValue, isPositive ? styles.positiveText : styles.negativeText]}>
            {isPositive ? '+' : ''}${Math.abs(portfolio.totalGains).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
      
      <View style={styles.investmentTypes}>
        <View style={styles.typeItem}>
          <Text style={styles.typeLabel}>Round-ups</Text>
          <Text style={styles.typeValue}>
            ${portfolio.roundUpInvestments.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        
        <View style={styles.typeItem}>
          <Text style={styles.typeLabel}>Manual</Text>
          <Text style={styles.typeValue}>
            ${portfolio.manualInvestments.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_500Medium',
  },
  gainsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  positiveGains: {
    backgroundColor: colors.success + '20',
  },
  negativeGains: {
    backgroundColor: colors.error + '20',
  },
  gainsText: {
    fontSize: 14,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.error,
  },
  totalValue: {
    fontSize: 36,
    color: colors.dark,
    fontFamily: 'AlbertSans_700Bold',
    marginBottom: 16,
  },
  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey.light,
    marginBottom: 16,
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 18,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  investmentTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeItem: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 12,
    color: colors.grey.medium2,
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 4,
  },
  typeValue: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_500Medium',
  },
});
