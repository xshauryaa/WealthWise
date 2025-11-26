import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Header } from '../components/Header';
import { colors } from '../styles/colors';
import { Plus, TrendingUp } from 'lucide-react-native';

// Import microinvesting components
import { PortfolioCard } from '../components/microinvesting/PortfolioCard';
import { AssetAllocation } from '../components/microinvesting/AssetAllocation';
import { RecentActivity } from '../components/microinvesting/RecentActivity';
import { RoundUpCard } from '../components/microinvesting/RoundUpCard';
import { DiversificationCard } from '../components/microinvesting/DiversificationCard';
import { ETFRecommendations } from '../components/microinvesting/ETFRecommendations';

// Import service
import { microinvestingService } from '../services/microinvestingService';

export function MicroinvestScreen() {
  const [portfolio, setPortfolio] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showETFRecommendations, setShowETFRecommendations] = useState(false);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const [portfolioData, investmentsData] = await Promise.all([
        microinvestingService.getPortfolio(),
        microinvestingService.getInvestments({ limit: 10 })
      ]);
      
      setPortfolio(portfolioData);
      setInvestments(investmentsData.investments || []);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      Alert.alert('Error', 'Failed to load portfolio data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPortfolioData();
    setRefreshing(false);
  };

  const handleUpdateRoundUpSettings = async (settings) => {
    try {
      await microinvestingService.updateRoundUpSettings(settings);
      // Update local portfolio data
      setPortfolio(prev => ({
        ...prev,
        roundUpSettings: settings
      }));
    } catch (error) {
      console.error('Error updating round-up settings:', error);
      Alert.alert('Error', 'Failed to update settings. Please try again.');
      throw error;
    }
  };

  const handleQuickInvest = () => {
    Alert.alert(
      'Quick Investment',
      'Quick investment feature coming soon! You\'ll be able to manually invest any amount into your preferred assets.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const handleViewRecommendations = () => {
    setShowETFRecommendations(!showETFRecommendations);
  };

  const handleInvestInETF = (etf) => {
    Alert.alert(
      `Invest in ${etf.symbol}`,
      `You're about to invest in ${etf.name}. This will help improve your portfolio diversification by ${etf.reason.toLowerCase()}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'default', onPress: () => {
          Alert.alert('Investment Placed', `Investment in ${etf.symbol} has been initiated!`);
        }}
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Microinvesting" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your portfolio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!portfolio) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Microinvesting" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load portfolio data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPortfolioData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Microinvesting" />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Portfolio Overview */}
        <PortfolioCard portfolio={portfolio} />

        {/* Diversification Analysis */}
        <DiversificationCard 
          portfolio={portfolio}
          onViewRecommendations={handleViewRecommendations}
        />
        
        {/* ETF Recommendations */}
        {showETFRecommendations && (
          <ETFRecommendations
            recommendations={portfolio.recommendedETFs}
            onInvestInETF={handleInvestInETF}
          />
        )}
        
        {/* Round-up Settings */}
        <RoundUpCard 
          settings={portfolio.roundUpSettings}
          onUpdateSettings={handleUpdateRoundUpSettings}
        />
        
        {/* Asset Allocation */}
        {/* <AssetAllocation assets={portfolio.assets} /> */}
        
        {/* Recent Activity */}
        {/* <RecentActivity activities={portfolio.recentActivity} /> */}
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleQuickInvest}>
            <Plus size={20} color={colors.light} />
            <Text style={styles.actionButtonText}>Quick Invest</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => Alert.alert('Feature Coming Soon', 'Investment history and detailed analytics coming soon!')}
          >
            <TrendingUp size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>View History</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_500Medium',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    fontSize: 16,
    color: colors.light,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: colors.light,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    color: colors.light,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  bottomSpacing: {
    height: 32,
  },
});