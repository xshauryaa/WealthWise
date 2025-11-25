import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Header } from '../components/Header';
import { colors } from '../styles/colors';
import { FONTS } from '../config/fonts';
import { Star, Flame, Award } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Mock friend achievements and activities
const achievements = [
  { id: '1', title: 'Budget Master', description: 'Completed 50 budget lessons', earned: true },
  { id: '2', title: 'Streak Legend', description: '30-day learning streak', earned: true },
  { id: '3', title: 'Investment Pro', description: 'Completed investment course', earned: false },
  { id: '4', title: 'Social Learner', description: 'Helped 10 friends', earned: true },
];

const recentActivity = [
  { id: '1', action: 'Completed lesson', title: 'Understanding Compound Interest', time: '2 hours ago' },
  { id: '2', action: 'Earned achievement', title: 'Budget Master', time: '1 day ago' },
  { id: '3', action: 'Started course', title: 'Advanced Investment Strategies', time: '3 days ago' },
  { id: '4', action: 'Joined challenge', title: '30-Day Savings Challenge', time: '1 week ago' },
];

export function FriendProfileScreen({ route, navigation }) {
  const { friendData } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back navigation */}
      <Header 
        title={friendData.name} 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {friendData.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <Text style={styles.friendName}>{friendData.name}</Text>
            <Text style={styles.rankText}>Rank #{friendData.rank}</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Star size={32} color={colors.tertiary} fill={colors.tertiary} />
              <Text style={styles.statNumber}>{friendData.stars}</Text>
              <Text style={styles.statLabel}>Stars</Text>
            </View>
            
            <View style={styles.statCard}>
              <Flame size={32} color="#FF7700" fill="#FF7700" />
              <Text style={styles.statNumber}>{friendData.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.messageButton} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Send Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.challengeButton} activeOpacity={0.8}>
            <Text style={styles.challengeButtonText}>Challenge</Text>
          </TouchableOpacity>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard,
                  !achievement.earned && styles.achievementCardDisabled
                ]}
              >
                <View style={[
                  styles.achievementIcon,
                  !achievement.earned && styles.achievementIconDisabled
                ]}>
                  <Award 
                    size={24} 
                    color={achievement.earned ? colors.tertiary : colors.gray}
                    fill={achievement.earned ? colors.tertiary : 'transparent'} 
                  />
                </View>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && styles.achievementTitleDisabled
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.earned && styles.achievementDescriptionDisabled
                ]}>
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
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
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: FONTS.crushed,
    color: colors.primary,
    fontWeight: '700',
  },
  friendName: {
    fontSize: 24,
    fontFamily: FONTS.crushed,
    color: colors.light,
    marginBottom: 4,
  },
  rankText: {
    fontSize: 16,
    fontFamily: 'AlbertSans_600SemiBold',
    color: colors.light,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 40,
  },
  statCard: {
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 32,
    fontFamily: FONTS.crushed,
    color: colors.light,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'AlbertSans_600SemiBold',
    color: colors.light,
    opacity: 0.8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  messageButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  challengeButton: {
    flex: 1,
    backgroundColor: colors.light,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans_600SemiBold',
    color: colors.light,
    fontWeight: '600',
  },
  challengeButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans_600SemiBold',
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginTop: 32,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.crushed,
    color: colors.primary,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementCardDisabled: {
    backgroundColor: colors.lightGray,
    borderColor: colors.gray,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementIconDisabled: {
    backgroundColor: colors.lightGray,
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'AlbertSans_600SemiBold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementTitleDisabled: {
    color: colors.gray,
  },
  achievementDescription: {
    fontSize: 12,
    fontFamily: 'AlbertSans_400Regular',
    color: colors.darkGray,
    textAlign: 'center',
  },
  achievementDescriptionDisabled: {
    color: colors.gray,
  },
  activityItem: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityContent: {
    gap: 4,
  },
  activityAction: {
    fontSize: 14,
    fontFamily: 'AlbertSans_600SemiBold',
    color: colors.primary,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: 'AlbertSans_500Medium',
    color: colors.darkGray,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'AlbertSans_400Regular',
    color: colors.gray,
  },
});
