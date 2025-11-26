import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { colors } from '../../styles/colors';
import { Settings, TrendingUp } from 'lucide-react-native';

export function RoundUpCard({ settings, onUpdateSettings }) {
  const [isEnabled, setIsEnabled] = useState(settings.isEnabled);
  const [showSettings, setShowSettings] = useState(false);

  const handleToggle = async (value) => {
    setIsEnabled(value);
    try {
      await onUpdateSettings({ ...settings, isEnabled: value });
    } catch (error) {
      // Revert on error
      setIsEnabled(!value);
      console.error('Failed to update round-up settings:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, isEnabled ? styles.activeIcon : styles.inactiveIcon]}>
            <TrendingUp size={20} color={isEnabled ? colors.primary : colors.grey.dark} />
          </View>
          <View>
            <Text style={styles.title}>Round-up Investing</Text>
            <Text style={styles.subtitle}>
              {isEnabled ? 'Automatically investing spare change' : 'Round-up is off'}
            </Text>
          </View>
        </View>
        
        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.grey.medium, true: colors.primary + '40' }}
          thumbColor={isEnabled ? colors.primary : colors.grey.medium2}
        />
      </View>

      {isEnabled && (
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ${settings.minimumAmount.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Min Amount</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ${settings.maximumAmount.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Max Amount</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{settings.defaultAsset}</Text>
            <Text style={styles.statLabel}>Default Asset</Text>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setShowSettings(!showSettings)}
      >
        <Settings size={16} color={colors.grey.dark} />
        <Text style={styles.settingsText}>Settings</Text>
      </TouchableOpacity>
      
      {showSettings && isEnabled && (
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsTitle}>Round-up Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Round-up multiple</Text>
            <Text style={styles.settingValue}>x{settings.roundUpMultiple}</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Investment range</Text>
            <Text style={styles.settingValue}>
              ${settings.minimumAmount.toFixed(2)} - ${settings.maximumAmount.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default investment</Text>
            <Text style={styles.settingValue}>{settings.defaultAsset}</Text>
          </View>
          
          <Text style={styles.settingsDescription}>
            Round-ups will automatically invest your spare change from purchases. 
            For example, a $4.30 coffee becomes a $5.00 charge with $0.70 invested.
          </Text>
        </View>
      )}
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeIcon: {
    backgroundColor: colors.primary + '20',
  },
  inactiveIcon: {
    backgroundColor: colors.grey.light,
  },
  title: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 8,
    backgroundColor: colors.grey.ultraLight,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_700Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.grey.medium,
    marginHorizontal: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  settingsText: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_500Medium',
  },
  settingsPanel: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.grey.ultraLight,
    borderRadius: 12,
  },
  settingsTitle: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
  },
  settingValue: {
    fontSize: 14,
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  settingsDescription: {
    fontSize: 12,
    color: colors.grey.medium2,
    fontFamily: 'AlbertSans_400Regular',
    marginTop: 12,
    lineHeight: 16,
  },
});
