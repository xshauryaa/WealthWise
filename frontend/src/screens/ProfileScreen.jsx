import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  Dimensions
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors } from '../styles/colors';
import { FONTS } from '../config/fonts';
import { Header } from '../components/Header';

const { width } = Dimensions.get('window');

export function ProfileScreen({ 
  route, 
  isOwnProfile = true, // This will be passed as prop or determined by navigation params
  userData = {
    name: "John Doe",
    username: "johndoe",
    profileImage: null, // Will use placeholder if null
    isFriend: false // Only relevant if not own profile
  }
}) {
  const [isFriend, setIsFriend] = useState(userData.isFriend);

  const handleFriendAction = () => {
    if (isOwnProfile) {
      // Navigate to friends list
      console.log('Navigate to friends list');
    } else {
      // Toggle friend status
      setIsFriend(!isFriend);
      console.log(isFriend ? 'Remove friend' : 'Add friend');
    }
  };

  const getButtonText = () => {
    if (isOwnProfile) return 'View Friends';
    return isFriend ? 'View Friends' : 'Add Friend';
  };

  const getButtonIcon = () => {
    if (isOwnProfile || isFriend) {
      // ViewFriendsIcon SVG
      return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="2.55319" cy="2.55319" r="2.55319" transform="matrix(-1 0 0 1 11.7129 3.74994)" stroke="white" stroke-width="1.125"/>
        <path d="M4.69141 12.6445C4.69141 12.0954 5.03663 11.6055 5.5538 11.4208C7.88548 10.588 10.4335 10.588 12.7652 11.4208C13.2824 11.6055 13.6276 12.0954 13.6276 12.6445V13.4842C13.6276 14.2421 12.9563 14.8244 12.206 14.7172L11.9558 14.6814C10.101 14.4165 8.21798 14.4165 6.36319 14.6814L6.11303 14.7172C5.36271 14.8244 4.69141 14.2421 4.69141 13.4842V12.6445Z" stroke="white" stroke-width="1.125"/>
        <path d="M12.9893 8.92701C14.0972 8.92701 14.9954 8.02886 14.9954 6.92093C14.9954 5.81301 14.0972 4.91486 12.9893 4.91486" stroke="white" stroke-width="1.125" stroke-linecap="round"/>
        <path d="M15.1863 13.5037L15.3829 13.5318C15.9724 13.616 16.4999 13.1586 16.4999 12.563V11.9033C16.4999 11.4718 16.2286 11.0869 15.8223 10.9418C15.4169 10.797 15.0033 10.6843 14.585 10.6036" stroke="white" stroke-width="1.125" stroke-linecap="round"/>
        <path d="M5.01072 8.92701C3.90279 8.92701 3.00464 8.02886 3.00464 6.92093C3.00464 5.81301 3.90279 4.91486 5.01072 4.91486" stroke="white" stroke-width="1.125" stroke-linecap="round"/>
        <path d="M2.81369 13.5037L2.61714 13.5318C2.0276 13.616 1.50015 13.1586 1.50015 12.563V11.9033C1.50015 11.4718 1.77139 11.0869 2.17774 10.9418C2.58308 10.797 2.99674 10.6843 3.41504 10.6036" stroke="white" stroke-width="1.125" stroke-linecap="round"/>
      </svg>`;
    } else {
      // AddFriendIcon SVG
      return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="3" cy="3" r="3" transform="matrix(-1 0 0 1 10.5 2.25)" stroke="white" stroke-width="1.125"/>
        <path d="M2.25 12.701C2.25 12.0557 2.65564 11.4801 3.26332 11.2631C6.00303 10.2846 8.99697 10.2846 11.7367 11.2631C12.3444 11.4801 12.75 12.0557 12.75 12.701V13.6876C12.75 14.5782 11.9612 15.2623 11.0796 15.1364L10.3638 15.0341C8.46424 14.7627 6.53576 14.7627 4.63622 15.0341L3.92041 15.1364C3.03878 15.2623 2.25 14.5782 2.25 13.6876V12.701Z" stroke="white" stroke-width="1.125"/>
        <path d="M12.75 8.25H15.75" stroke="white" stroke-width="1.125" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14.25 6.75L14.25 9.75" stroke="white" stroke-width="1.125" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header title="Profile" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            {userData.profileImage ? (
              <Image 
                source={{ uri: userData.profileImage }} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>
                  {userData.name.split(' ').map(name => name[0]).join('').toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* User Info */}
          <View style={styles.userInfoContainer}>
            {/* User's Name in Crushed Font */}
            <Text style={styles.userName}>{userData.name}</Text>
            
            {/* Username with @ in Albert Sans */}
            <Text style={styles.userHandle}>@{userData.username}</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleFriendAction}
            activeOpacity={0.8}
          >
            <SvgXml 
              xml={getButtonIcon()}
              width={18} 
              height={18} 
            />
            <Text style={styles.actionButtonText}>
              {getButtonText()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Profile Content */}
        <View style={styles.profileContent}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <Text style={styles.sectionDescription}>
            More profile content and settings will be added here.
          </Text>
        </View>

        {/* Bottom spacing */}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  profileImageContainer: {
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.light,
    fontFamily: 'AlbertSans_700Bold',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  userName: {
    fontSize: 28,
    fontFamily: FONTS.crushed,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  userHandle: {
    fontSize: 16,
    fontFamily: 'AlbertSans_400Regular',
    color: colors.grey.dark,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light,
    fontFamily: 'AlbertSans_600SemiBold',
    marginLeft: 8,
  },
  profileContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.dark,
    fontFamily: 'AlbertSans_600SemiBold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.grey.dark,
    fontFamily: 'AlbertSans_400Regular',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});