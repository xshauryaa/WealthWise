import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../styles/colors';
import { TrendingUp, Star, DollarSign, Shield } from 'lucide-react-native';

const PRIORITY_COLORS = {
  'High': colors.error,
  'Medium': colors.warning,
  'Low': colors.success,
};

export function ETFRecommendations({ recommendations, onInvestInETF }) {
  const renderRecommendation = (etf) => {
    const priorityColor = PRIORITY_COLORS[etf.priority] || colors.grey.dark;
    
    return (
      <View key={etf.symbol} style={styles.etfCard}>
        <View style={styles.etfHeader}>
          <View style={styles.etfTitleSection}>
            <View style={styles.etfSymbolBadge}>
              <Text style={styles.etfSymbol}>{etf.symbol}</Text>
            </View>
            <View style={styles.etfInfo}>
              <Text style={styles.etfName} numberOfLines={1}>
                {etf.name}
              </Text>
              <Text style={styles.etfCategory}>{etf.category}</Text>
            </View>
          </View>
          
          <View style={styles.etfScoreSection}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {etf.priority}
              </Text>
            </View>
            <View style={styles.scoreContainer}>
              <Star size={14} color={colors.warning} />
              <Text style={styles.scoreText}>{etf.score}/10</Text>
            </View>
          </View>
        </View>

        <Text style={styles.etfDescription}>{etf.description}</Text>

        <View style={styles.etfMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Expense Ratio</Text>
            <Text style={styles.metricValue}>{etf.expenseRatio}%</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Current</Text>
            <Text style={styles.metricValue}>{etf.currentAllocation.toFixed(1)}%</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Recommended</Text>
            <Text style={[styles.metricValue, styles.recommendedValue]}>
              {etf.recommendedAllocation.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.etfReason}>
          <Text style={styles.reasonTitle}>Why this ETF?</Text>
          <Text style={styles.reasonText}>{etf.reason}</Text>
        </View>

        <TouchableOpacity 
          style={styles.investButton}
          onPress={() => onInvestInETF(etf)}
        >
          <DollarSign size={18} color={colors.light} />
          <Text style={styles.investButtonText}>Invest in {etf.symbol}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TrendingUp size={24} color={colors.primary} />
        <Text style={styles.title}>Recommended ETFs</Text>
      </View>
      
      <Text style={styles.subtitle}>
        Based on your current portfolio, here are the best ETFs to improve your diversification:
      </Text>

      <ScrollView style={styles.recommendationsList} showsVerticalScrollIndicator={false}>
        {recommendations.map(renderRecommendation)}
      </ScrollView>

      <View style={styles.disclaimer}>
        <Shield size={16} color={colors.grey.dark} />
        <Text style={styles.disclaimerText}>
          Recommendations based on portfolio analysis. Past performance doesn't guarantee future results.
        </Text>
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
    marginTop: 16,
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
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  title: {
    fontSize: 20,
    color: colors.dark,
    fontFamily: 'AlbertSans_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 20,
    lineHeight: 20,
  },
  recommendationsList: {
    maxHeight: 400,
  },
  etfCard: {
    backgroundColor: colors.grey.ultraLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.grey.light,
  },
  etfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  etfTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  etfSymbolBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  etfSymbol: {
    fontSize: 14,
    color: colors.light,
    fontFamily: 'AlbertSans_700Bold',
  },
  etfInfo: {
    flex: 1,
  },
  etfName: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 2,
  },
  etfCategory: {
    fontSize: 12,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
  },
  etfScoreSection: {
    alignItems: 'flex-end',
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 12,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_500Medium',
  },
  etfDescription: {
    fontSize: 13,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 12,
    lineHeight: 18,
  },
  etfMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.grey.light,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: colors.grey.medium2,
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  recommendedValue: {
    color: colors.success,
  },
  etfReason: {
    marginBottom: 12,
  },
  reasonTitle: {
    fontSize: 13,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    lineHeight: 16,
  },
  investButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  investButtonText: {
    fontSize: 14,
    color: colors.light,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.grey.ultraLight,
    borderRadius: 8,
    gap: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    lineHeight: 14,
    flex: 1,
  },
});
