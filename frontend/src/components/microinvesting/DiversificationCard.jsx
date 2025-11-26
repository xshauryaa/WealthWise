import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/colors';
import { Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react-native';

export function DiversificationCard({ portfolio, onViewRecommendations }) {
  const { diversificationScore, diversificationAnalysis } = portfolio;
  
  const getScoreColor = (score) => {
    if (score >= 8) return colors.success;
    if (score >= 6) return colors.warning;
    return colors.error;
  };

  const getScoreIcon = (score) => {
    if (score >= 8) return CheckCircle;
    if (score >= 6) return AlertCircle;
    return AlertCircle;
  };

  const ScoreIcon = getScoreIcon(diversificationScore);
  const scoreColor = getScoreColor(diversificationScore);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={[styles.iconContainer, { backgroundColor: scoreColor + '20' }]}>
            <Target size={20} color={scoreColor} />
          </View>
          <View>
            <Text style={styles.title}>Portfolio Diversification</Text>
            <Text style={styles.subtitle}>Risk management through balance</Text>
          </View>
        </View>
      </View>

      <View style={styles.scoreSection}>
        <View style={styles.scoreDisplay}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {diversificationScore.toFixed(1)}
          </Text>
          <Text style={styles.scoreOutOf}>/10</Text>
          <View style={[styles.gradeBadge, { backgroundColor: scoreColor + '20' }]}>
            <ScoreIcon size={16} color={scoreColor} />
            <Text style={[styles.gradeText, { color: scoreColor }]}>
              Grade {diversificationAnalysis.grade}
            </Text>
          </View>
        </View>

        {/* Score Bar */}
        <View style={styles.scoreBar}>
          <View 
            style={[
              styles.scoreProgress, 
              { 
                width: `${(diversificationScore / 10) * 100}%`,
                backgroundColor: scoreColor
              }
            ]} 
          />
        </View>
      </View>

      {/* Analysis Summary */}
      <View style={styles.analysisSection}>
        <View style={styles.analysisItem}>
          <Text style={styles.analysisTitle}>✅ Strengths</Text>
          {diversificationAnalysis.strengths.slice(0, 2).map((strength, index) => (
            <Text key={index} style={styles.analysisPoint}>• {strength}</Text>
          ))}
        </View>

        <View style={styles.analysisItem}>
          <Text style={styles.analysisTitle}>⚠️ Areas for Improvement</Text>
          {diversificationAnalysis.weaknesses.slice(0, 2).map((weakness, index) => (
            <Text key={index} style={styles.analysisPoint}>• {weakness}</Text>
          ))}
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity style={styles.actionButton} onPress={onViewRecommendations}>
        <TrendingUp size={18} color={colors.primary} />
        <Text style={styles.actionButtonText}>View ETF Recommendations</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  scoreNumber: {
    fontSize: 48,
    fontFamily: 'AlbertSans_800ExtraBold',
  },
  scoreOutOf: {
    fontSize: 24,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_500Medium',
    marginTop: 8,
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginLeft: 8,
  },
  gradeText: {
    fontSize: 14,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  scoreBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.grey.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 3,
  },
  analysisSection: {
    marginBottom: 16,
  },
  analysisItem: {
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 14,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 6,
  },
  analysisPoint: {
    fontSize: 13,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 2,
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: 'AlbertSans_600SemiBold',
  },
});
