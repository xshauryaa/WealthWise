import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { colors } from '../styles/colors';
import { ChevronRight } from 'lucide-react-native';
import { padding } from '../styles/spacing';

const { width } = Dimensions.get('window');

const LessonShortcut = ({ onGoToNextLesson }) => {
  return (
    <View style={styles.container}>
      {/* Main illustration area */}
      <View style={styles.illustrationContainer}>
        {/* Module illustration */}
        <Image 
          source={require('../../assets/module-images/IntroToPersonalFin.png')} 
          style={styles.moduleImage}
          resizeMode="contain"
        />
      </View>

      {/* Action button */}
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={onGoToNextLesson}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>Go to Next Lesson</Text>
        <ChevronRight color="#000000" size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (width - 2 * padding.SCREEN_PADDING),
    backgroundColor: colors.primary || '#2E8B57',
    borderRadius: width > 400 ? 12 : 10,
    padding: width > 400 ? 12 : 10,
    marginHorizontal: 0,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
  },
  illustrationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: width > 400 ? 10 : 8,
    paddingVertical: width > 400 ? 12 : 10,
    marginBottom: width > 400 ? 6 : 4,
  },
  moduleImage: {
    width: width > 400 ? 140 : 120,
    height: width > 400 ? 140 : 120,
    borderRadius: 8,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: width > 400 ? 8 : 6,
    paddingVertical: width > 400 ? 6 : 4,
    paddingHorizontal: width > 400 ? 8 : 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: width > 400 ? 6 : 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButtonText: {
    fontSize: width > 400 ? 13 : 11,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'AlbertSans_500Medium',
  },
});

export default LessonShortcut;
