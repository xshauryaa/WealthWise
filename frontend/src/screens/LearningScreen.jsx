import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  FlatList
} from 'react-native';
import { colors } from '../styles/colors';
import { FONTS } from '../config/fonts';
import { Header } from '../components/Header';
import { Star, Flame, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Mock friends data for leaderboard
const friendsData = [
  { id: '1', name: 'Sarah Chen', stars: 847, streak: 23, rank: 1 },
  { id: '2', name: 'Alex Rodriguez', stars: 756, streak: 19, rank: 2 },
  { id: '3', name: 'Emma Wilson', stars: 692, streak: 31, rank: 3 },
  { id: '4', name: 'You', stars: 543, streak: 14, rank: 4, isCurrentUser: true },
  { id: '5', name: 'Michael Brown', stars: 489, streak: 11, rank: 5 },
  { id: '6', name: 'Jessica Kim', stars: 421, streak: 8, rank: 6 },
  { id: '7', name: 'David Martinez', stars: 367, streak: 15, rank: 7 },
  { id: '8', name: 'Priya Patel', stars: 324, streak: 6, rank: 8 },
  { id: '9', name: 'James Wilson', stars: 298, streak: 22, rank: 9 },
  { id: '10', name: 'Sophie Taylor', stars: 276, streak: 9, rank: 10 },
  { id: '11', name: 'Carlos Mendez', stars: 245, streak: 12, rank: 11 },
  { id: '12', name: 'Maya Singh', stars: 189, streak: 4, rank: 12 },
];

export function LearningScreen({ navigation }) {
  
  const navigateToFriendProfile = (friend) => {
    if (!friend.isCurrentUser) {
      // Navigate to friend's profile screen
      navigation.navigate('FriendProfile', { 
        friendId: friend.id,
        friendData: friend 
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title="WealthWise." />
      <View style={{ gap: 12, flex: 1, }}>
        {/* Main Content */}
        <View style={styles.content}>
            {/* Stats Section */}
            <View style={styles.statsContainer}>
            {/* Lessons Completed */}
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>543</Text>
                <Star 
                size={40} 
                color={colors.tertiary}
                fill={colors.tertiary}
                />
            </View>

            {/* Streak */}
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>14</Text>
                <Flame 
                size={40} 
                color="#FF7700"
                fill="#FF7700"
                />
            </View>
            </View>

            {/* View Lessons Button */}
            <TouchableOpacity 
                style={styles.viewLessonsButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Modules')}
            >
            <Text style={styles.viewLessonsText}>View Lessons</Text>
            <ChevronRight color="#FFFFFF" size={24} />
            </TouchableOpacity>
        </View>

        {/* Leaderboard Section */}
        <View style={styles.leaderboardSection}>
            <Text style={styles.leaderboardTitle}>LEADERBOARD</Text>
            
            {/* Friends List */}
            <FlatList
            data={friendsData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity 
                style={[
                    styles.friendItem, 
                    item.isCurrentUser && styles.currentUserItem
                ]}
                activeOpacity={0.7}
                onPress={() => navigateToFriendProfile(item)}
                disabled={item.isCurrentUser}
                >
                <View style={styles.friendRank}>
                    <Text style={[
                    styles.rankText,
                    item.isCurrentUser && styles.currentUserText
                    ]}>
                    {item.rank}
                    </Text>
                </View>
                
                <View style={styles.friendInfo}>
                    <Text style={[
                    styles.friendName,
                    item.isCurrentUser && styles.currentUserText
                    ]}>
                    {item.name}
                    </Text>
                    
                    <View style={styles.friendStats}>
                    <View style={styles.statRow}>
                        <Star 
                        size={24} 
                        color={colors.tertiary}
                        fill={colors.tertiary}
                        />
                        <Text style={[
                        styles.statValue,
                        item.isCurrentUser && styles.currentUserText
                        ]}>
                        {item.stars}
                        </Text>
                    </View>
                    
                    <View style={styles.statRow}>
                        <Flame 
                        size={24} 
                        color="#FF7700"
                        fill="#FF7700"
                        />
                        <Text style={[
                        styles.statValue,
                        item.isCurrentUser && styles.currentUserText
                        ]}>
                        {item.streak}
                        </Text>
                    </View>
                    </View>
                </View>
                </TouchableOpacity>
            )}
            style={styles.friendsList}
            showsVerticalScrollIndicator={false}
            />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 32,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statNumber: {
    fontSize: 48,
    fontFamily: FONTS.crushed,
    color: colors.primary,
  },
  viewLessonsButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: width > 400 ? 12 : 8,
    paddingVertical: width > 400 ? 12 : 8,
    paddingHorizontal: width > 400 ? 12 : 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: width > 400 ? 8 : 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  viewLessonsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light,
    fontFamily: 'AlbertSans_500Medium',
  },
  leaderboardSection: {
    flex: 1,
    backgroundColor: colors.secondary,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  leaderboardTitle: {
    fontSize: 32,
    fontFamily: FONTS.crushed,
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  friendsList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginVertical: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserItem: {
    backgroundColor: 'rgba(100, 200, 150, 0.35)',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  friendRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rankText: {
    fontSize: 18,
    fontFamily: FONTS.crushed,
    color: colors.light,
    fontWeight: '700',
  },
  currentUserText: {
    color: colors.primary,
    fontWeight: '700',
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendName: {
    fontSize: 18,
    fontFamily: 'AlbertSans_600SemiBold',
    color: colors.light,
    flex: 1,
    fontWeight: '600',
  },
  friendStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontFamily: FONTS.crushed,
    color: colors.light,
    fontWeight: '600',
  },
});