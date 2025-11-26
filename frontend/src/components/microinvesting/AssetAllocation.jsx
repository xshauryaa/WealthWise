import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../styles/colors';

const ASSET_COLORS = {
  stocks: '#FF6B6B',
  etf: '#4ECDC4', 
  crypto: '#45B7D1',
  bonds: '#96CEB4'
};

const ASSET_ICONS = {
  stocks: '📈',
  etf: '📊',
  crypto: '₿',
  bonds: '🏛️'
};

export function AssetAllocation({ assets }) {
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asset Allocation</Text>
      
      {/* Pie Chart Visual */}
      <View style={styles.chartContainer}>
        <View style={styles.pieChart}>
          {assets.map((asset, index) => {
            const percentage = (asset.value / totalValue) * 100;
            const circumference = 2 * Math.PI * 45; // radius = 45
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const rotation = assets.slice(0, index).reduce((acc, prev) => 
              acc + ((prev.value / totalValue) * 360), -90);
            
            return (
              <View 
                key={asset.symbol}
                style={[
                  styles.pieSlice,
                  {
                    backgroundColor: ASSET_COLORS[asset.type],
                    transform: [{ rotate: `${rotation}deg` }],
                    height: `${percentage}%`,
                  }
                ]}
              />
            );
          })}
        </View>
        
        <View style={styles.centerLabel}>
          <Text style={styles.centerValue}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </Text>
          <Text style={styles.centerText}>Total</Text>
        </View>
      </View>
      
      {/* Legend */}
      <ScrollView style={styles.legend} showsVerticalScrollIndicator={false}>
        {assets.map((asset) => {
          const percentage = (asset.value / totalValue) * 100;
          const isPositive = asset.gainLoss >= 0;
          
          return (
            <View key={asset.symbol} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View style={[styles.colorDot, { backgroundColor: ASSET_COLORS[asset.type] }]} />
                <View style={styles.assetInfo}>
                  <View style={styles.assetHeader}>
                    <Text style={styles.assetIcon}>{ASSET_ICONS[asset.type]}</Text>
                    <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                    <Text style={styles.assetPercentage}>{percentage.toFixed(1)}%</Text>
                  </View>
                  <Text style={styles.assetName} numberOfLines={1}>
                    {asset.name}
                  </Text>
                </View>
              </View>
              
              <View style={styles.legendRight}>
                <Text style={styles.assetValue}>
                  ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={[styles.assetGain, isPositive ? styles.positiveGain : styles.negativeGain]}>
                  {isPositive ? '+' : ''}${Math.abs(asset.gainLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
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
  title: {
    fontSize: 18,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    backgroundColor: colors.grey.light,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  pieSlice: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    backgroundColor: colors.light,
    borderRadius: 40,
    top: 20,
  },
  centerValue: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_700Bold',
  },
  centerText: {
    fontSize: 12,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
  },
  legend: {
    maxHeight: 200,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey.ultraLight,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  assetIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  assetSymbol: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginRight: 8,
  },
  assetPercentage: {
    fontSize: 12,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_500Medium',
  },
  assetName: {
    fontSize: 12,
    color: colors.grey.medium2,
    fontFamily: 'AlbertSans_400Regular',
  },
  legendRight: {
    alignItems: 'flex-end',
  },
  assetValue: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 2,
  },
  assetGain: {
    fontSize: 12,
    fontFamily: 'AlbertSans_500Medium',
  },
  positiveGain: {
    color: colors.success,
  },
  negativeGain: {
    color: colors.error,
  },
});
