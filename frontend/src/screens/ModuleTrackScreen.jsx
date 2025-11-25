import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { Header } from '../components/Header';
import { colors } from '../styles/colors';
import { FONTS } from '../config/fonts';
import { Star } from 'lucide-react-native';
import { ipf } from '../learning-modules/IntroToPersonalFinance';

const { width, height } = Dimensions.get('window');

// Function to get module data based on module ID
const getModuleData = (moduleId) => {
  switch(moduleId) {
    case 1:
      return ipf;
    default:
      return ipf; // Default to intro for now
  }
};

// Function to convert module data to lessons array
const convertModuleToLessons = (moduleData) => {
  const lessons = [];
  
  // Extract lessons from the module object
  Object.keys(moduleData).forEach((key, index) => {
    if (key.startsWith('lesson')) {
      const lesson = moduleData[key];
      lessons.push({
        id: lesson.lessonId,
        title: lesson.title,
        completed: index < 2, // First 2 lessons completed for demo
        stars: index < 2 ? 3 : 0, // 3 stars for completed lessons
        locked: index > 2, // Lock lessons after the 3rd one
        current: index === 2, // 3rd lesson is current
      });
    }
  });
  
  return lessons;
};

export function ModuleTrackScreen({ navigation, route }) {
  const { moduleId, moduleTitle } = route.params || {};
  
  // Get the actual module data
  const moduleData = getModuleData(moduleId);
  const lessonsData = convertModuleToLessons(moduleData);

  const handleLessonPress = (lesson) => {
    if (!lesson.locked) {
      console.log('Opening lesson:', lesson.title);
      navigation.navigate('LessonScreen', { 
        lessonId: lesson.id, 
        moduleData: moduleData,
        lessonTitle: lesson.title
      });
    }
  };

  const renderLesson = (lesson, index) => {
    const isLastLesson = index === lessonsData.length - 1;
    
    return (
      <View key={lesson.id} style={styles.lessonContainer}>
        {/* Left side - Node and line */}
        <View style={styles.leftSide}>
          {/* Connecting line (top) */}
          {index > 0 && <View style={styles.connectingLineTop} />}
          
          {/* Lesson Node */}
          <TouchableOpacity
            style={[
              styles.lessonNode,
              lesson.completed && styles.completedNode,
              lesson.locked && styles.lockedNode,
              lesson.current && styles.currentNode,
            ]}
            activeOpacity={lesson.locked ? 1 : 0.7}
            onPress={() => handleLessonPress(lesson)}
            disabled={lesson.locked}
          >
            {lesson.completed && (
              <Text style={styles.checkMark}>✓</Text>
            )}
            {lesson.current && !lesson.completed && (
              <View style={styles.playIcon}>
                <Text style={styles.playIconText}>▶</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* Connecting line (bottom) */}
          {!isLastLesson && <View style={styles.connectingLineBottom} />}
        </View>
        
        {/* Right side - Lesson content */}
        <View style={styles.rightSide}>
          <View style={[
            styles.lessonCard,
            lesson.locked && styles.lockedCard,
            lesson.current && styles.currentCard,
          ]}>
            <Text style={[
              styles.lessonTitle,
              lesson.locked && styles.lockedText,
              lesson.current && styles.currentText,
            ]}>
              {lesson.title}
            </Text>
            
            {/* Stars */}
            <View style={styles.starsContainer}>
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  size={24}
                  color={colors.tertiary}
                  fill={star <= lesson.stars ? colors.tertiary : 'transparent'}
                  strokeWidth={2}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header 
        title="Learning"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Lesson Track */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.trackContainer}
      >
        {lessonsData.map((lesson, index) => renderLesson(lesson, index))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollContainer: {
    flex: 1,
  },
  trackContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  lessonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25, // Consistent spacing between lessons
  },
  leftSide: {
    width: 80,
    alignItems: 'center',
    position: 'relative',
  },
  connectingLineTop: {
    width: 4,
    height: 45, // Consistent line height
    backgroundColor: colors.secondary,
    marginBottom: 0,
  },
  connectingLineBottom: {
    width: 4,
    height: 45, // Consistent line height
    backgroundColor: colors.secondary,
    marginTop: 0,
  },
  lessonNode: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  completedNode: {
    backgroundColor: colors.primary,
  },
  currentNode: {
    backgroundColor: colors.primary,
    borderColor: colors.tertiary,
    borderWidth: 6,
  },
  lockedNode: {
    backgroundColor: '#A8A8A8',
    opacity: 0.6,
  },
  checkMark: {
    color: colors.light,
    fontSize: 24,
    fontWeight: 'bold',
  },
  playIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconText: {
    color: colors.light,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 3, // Slight offset to center the triangle
  },
  rightSide: {
    flex: 1,
    marginLeft: 15,
    marginTop: 0, // Aligned with node
  },
  lessonCard: {
    backgroundColor: colors.light,
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.secondary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 80, // Ensures consistent card height
  },
  currentCard: {
    borderColor: colors.primary,
    borderWidth: 3,
    backgroundColor: '#F0F8F5',
  },
  lockedCard: {
    opacity: 0.6,
    borderColor: '#D0D0D0',
  },
  lessonTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans_500Medium',
    color: colors.darkGray,
    marginBottom: 12,
    fontWeight: '500',
    lineHeight: 22,
  },
  currentText: {
    color: colors.primary,
  },
  lockedText: {
    color: '#A0A0A0',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 10, // Increased spacing for larger stars
    alignItems: 'center',
    marginTop: 4,
  },
});