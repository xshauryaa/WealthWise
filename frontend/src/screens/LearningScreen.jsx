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
import StarFilled from '../../assets/system-icons/Star-Filled.svg';
import Streak from '../../assets/system-icons/Streak.svg';

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

      {/* Main Content */}
      <View style={styles.content}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {/* Lessons Completed */}
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>543</Text>
            <StarFilled 
              width={96} 
              height={96} 
              fill={colors.warning}
            />
          </View>

          {/* Streak */}
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>14</Text>
            <Streak 
              width={96} 
              height={96} 
              fill={colors.error}
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
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Curved Background Section */}
      <View style={styles.curvedSection}>
        <View style={styles.curvedBackground}>
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
                      <StarFilled 
                        width={20} 
                        height={20} 
                        fill={colors.warning}
                      />
                      <Text style={[
                        styles.statValue,
                        item.isCurrentUser && styles.currentUserText
                      ]}>
                        {item.stars}
                      </Text>
                    </View>
                    
                    <View style={styles.statRow}>
                      <Streak 
                        width={18} 
                        height={20} 
                        fill={colors.error}
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
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    marginTop: 10,
    gap: 50,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  statNumber: {
    fontSize: 48,
    fontFamily: FONTS.crushed,
    color: colors.primary,
  },
  viewLessonsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: width * 0.6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  viewLessonsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light,
    fontFamily: 'AlbertSans_600SemiBold',
  },
  arrowContainer: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 16,
    color: colors.light,
    fontWeight: 'bold',
  },
  curvedSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
    overflow: 'hidden',
  },
  curvedBackground: {
    width: width * 1.5,
    height: height * 0.75,
    backgroundColor: colors.secondary,
    borderTopLeftRadius: width * 0.75,
    borderTopRightRadius: width * 0.75,
    position: 'absolute',
    bottom: -height * 0.2,
    left: -width * 0.25,
    alignItems: 'center',
    paddingTop: height * 0.08,
  },
  leaderboardTitle: {
    fontSize: 32,
    fontFamily: FONTS.crushed,
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  friendsList: {
    width: width * 0.9,
    maxHeight: height * 0.35,
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
    fontSize: 16,
    fontFamily: FONTS.crushed,
    color: colors.light,
    fontWeight: '600',
  },
});