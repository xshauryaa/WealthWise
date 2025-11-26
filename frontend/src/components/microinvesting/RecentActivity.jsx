import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors } from '../../styles/colors';
import { ArrowUpCircle, ArrowDownCircle, RotateCcw } from 'lucide-react-native';

const ACTIVITY_ICONS = {
  round_up: RotateCcw,
  manual: ArrowUpCircle,
  dividend: ArrowDownCircle,
};

const ACTIVITY_COLORS = {
  round_up: colors.primary,
  manual: colors.success,
  dividend: colors.warning,
};

export function RecentActivity({ activities }) {
  const renderActivity = ({ item }) => {
    const IconComponent = ACTIVITY_ICONS[item.type] || ArrowUpCircle;
    const iconColor = ACTIVITY_COLORS[item.type] || colors.grey.dark;
    const date = new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    
    return (
      <View style={styles.activityItem}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <IconComponent size={20} color={iconColor} />
        </View>
        
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityDescription} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={styles.activityAmount}>
              +${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          
          <View style={styles.activityFooter}>
            <Text style={styles.activityAsset}>{item.asset}</Text>
            <Text style={styles.activityDate}>{date}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Activity</Text>
      
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
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
    marginBottom: 16,
  },
  list: {
    maxHeight: 200,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey.ultraLight,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityDescription: {
    flex: 1,
    fontSize: 16,
    color: colors.dark,
    fontFamily: 'AlbertSans_500Medium',
    marginRight: 8,
  },
  activityAmount: {
    fontSize: 16,
    color: colors.success,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityAsset: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: 'AlbertSans_500Medium',
  },
  activityDate: {
    fontSize: 12,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
  },
});
