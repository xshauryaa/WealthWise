import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Header } from '../components/Header';
import { colors } from '../styles/colors';
import { FONTS } from '../config/fonts';
import { ChevronRight, ChevronLeft, Star } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Content Slide Component
const ContentSlide = ({ slide, slideKey }) => {
  return (
    <View style={styles.slideContainer}>
      <ScrollView 
        style={styles.contentScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.contentText}>
          {slide.content}
        </Text>
      </ScrollView>
    </View>
  );
};

// Question Slide Component
const QuestionSlide = ({ slide, slideKey, onAnswerSelect, selectedAnswer, showResult }) => {
  return (
    <View style={styles.slideContainer}>
      <ScrollView 
        style={styles.contentScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.questionContainer}
      >
        <Text style={styles.questionText}>
          {slide.question}
        </Text>
        
        <View style={styles.optionsContainer}>
          {slide.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === option && styles.selectedOption,
                showResult && option === slide.correctAnswer && styles.correctOption,
                showResult && selectedAnswer === option && option !== slide.correctAnswer && styles.incorrectOption,
              ]}
              onPress={() => !showResult && onAnswerSelect(option)}
              disabled={showResult}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.radioButton,
                  selectedAnswer === option && styles.radioButtonSelected,
                  showResult && option === slide.correctAnswer && styles.radioButtonCorrect,
                  showResult && selectedAnswer === option && option !== slide.correctAnswer && styles.radioButtonIncorrect,
                ]}>
                  {selectedAnswer === option && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={[
                  styles.optionText,
                  selectedAnswer === option && styles.selectedOptionText,
                  showResult && option === slide.correctAnswer && styles.correctOptionText,
                ]}>
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {showResult && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>
              {selectedAnswer === slide.correctAnswer ? '🎉 Correct!' : '❌ Not quite right'}
            </Text>
            <Text style={styles.explanationText}>
              {slide.explanation}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Completion Slide Component
const CompletionSlide = ({ starsEarned }) => {
  const getStarsMessage = (stars) => {
    switch(stars) {
      case 3:
        return { 
          emoji: "🌟", 
          title: "Outstanding!", 
          message: "Perfect score! You've mastered this lesson completely." 
        };
      case 2:
        return { 
          emoji: "⭐", 
          title: "Great Job!", 
          message: "You did really well! Just a few more correct answers for a perfect score." 
        };
      case 1:
        return { 
          emoji: "✨", 
          title: "Good Start!", 
          message: "You're on the right track. Review the material and try again!" 
        };
      default:
        return { 
          emoji: "📚", 
          title: "Keep Learning!", 
          message: "Don't worry, learning takes practice. Review the lesson and you'll improve!" 
        };
    }
  };

  const starsMessage = getStarsMessage(starsEarned);

  return (
    <View style={styles.slideContainer}>
      <View style={styles.completionContainer}>
        <Text style={styles.completionEmoji}>{starsMessage.emoji}</Text>
        
        <Text style={styles.completionTitle}>{starsMessage.title}</Text>
        
        <Text style={styles.completionSubtitle}>You earned</Text>
        
        <View style={styles.completionStarsContainer}>
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              size={48}
              color={colors.tertiary}
              fill={star <= starsEarned ? colors.tertiary : 'transparent'}
              strokeWidth={2}
            />
          ))}
        </View>
        
        <Text style={styles.completionMessage}>{starsMessage.message}</Text>
      </View>
    </View>
  );
};

export function LessonScreen({ navigation, route }) {
  const { lessonId, moduleData } = route.params || {};
  
  // Find the specific lesson data
  const lessonData = Object.values(moduleData).find(lesson => lesson.lessonId === lessonId);
  
  if (!lessonData) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title="Lesson Not Found"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  // Extract slides from lesson data
  const slides = Object.keys(lessonData)
    .filter(key => key.startsWith('slide'))
    .sort((a, b) => parseInt(a.replace('slide', '')) - parseInt(b.replace('slide', '')))
    .map(key => ({ ...lessonData[key], slideKey: key }));

  // Add completion slide at the end
  const allSlides = [...slides, { 
    slideKey: 'completion', 
    type: 'completion',
    title: 'Lesson Complete!' 
  }];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [questionResults, setQuestionResults] = useState({});
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const currentSlide = allSlides[currentSlideIndex];
  const isQuestion = currentSlide?.question !== undefined;
  const isCompletion = currentSlide?.type === 'completion';
  const isLastSlide = currentSlideIndex === allSlides.length - 1;
  const hasSelectedAnswer = questionAnswers[currentSlide?.slideKey];
  const showQuestionResult = questionResults[currentSlide?.slideKey];

  // Calculate stars earned based on correct answers
  const calculateStarsEarned = () => {
    const questionSlides = slides.filter(slide => slide.question !== undefined);
    const totalQuestions = questionSlides.length;
    
    if (totalQuestions === 0) return 3; // If no questions, give 3 stars
    
    const correctAnswers = questionSlides.reduce((count, slide) => {
      const userAnswer = questionAnswers[slide.slideKey];
      const isCorrect = userAnswer === slide.correctAnswer;
      return count + (isCorrect ? 1 : 0);
    }, 0);
    
    const percentage = correctAnswers / totalQuestions;
    
    // Star calculation: 90%+ = 3 stars, 70%+ = 2 stars, 50%+ = 1 star, below 50% = 0 stars
    if (percentage >= 0.9) return 3;
    if (percentage >= 0.7) return 2;
    if (percentage >= 0.5) return 1;
    return 0;
  };

  const animateToSlide = (direction) => {
    Animated.timing(slideAnimation, {
      toValue: direction === 'next' ? -width : width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnimation.setValue(direction === 'next' ? width : -width);
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (isQuestion && hasSelectedAnswer && !showQuestionResult) {
      // Show question result first
      setQuestionResults(prev => ({
        ...prev,
        [currentSlide.slideKey]: true
      }));
      return;
    }

    if (currentSlideIndex < allSlides.length - 1) {
      animateToSlide('next');
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      // Lesson completed
      navigation.goBack();
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      animateToSlide('previous');
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleAnswerSelect = (answer) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [currentSlide.slideKey]: answer
    }));
  };

  const getNextButtonText = () => {
    if (isQuestion && hasSelectedAnswer && !showQuestionResult) {
      return 'Check Answer';
    }
    if (isLastSlide) {
      return 'Complete Lesson';
    }
    return 'Next';
  };

  const canProceed = () => {
    if (isQuestion) {
      return hasSelectedAnswer;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header 
        title={lessonData.title}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentSlideIndex + 1) / allSlides.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentSlideIndex + 1} of {allSlides.length}
        </Text>
      </View>

      {/* Slide Content */}
      <View style={styles.slideWrapper}>
        <Animated.View 
          style={[
            styles.animatedSlide,
            { transform: [{ translateX: slideAnimation }] }
          ]}
        >
          {isCompletion ? (
            <CompletionSlide starsEarned={calculateStarsEarned()} />
          ) : isQuestion ? (
            <QuestionSlide
              slide={currentSlide}
              slideKey={currentSlide.slideKey}
              onAnswerSelect={handleAnswerSelect}
              selectedAnswer={questionAnswers[currentSlide.slideKey]}
              showResult={showQuestionResult}
            />
          ) : (
            <ContentSlide
              slide={currentSlide}
              slideKey={currentSlide.slideKey}
            />
          )}
        </Animated.View>
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.previousButton, currentSlideIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentSlideIndex === 0}
        >
          <ChevronLeft size={24} color={currentSlideIndex === 0 ? '#A0A0A0' : colors.primary} />
          <Text style={[styles.navButtonText, currentSlideIndex === 0 && styles.disabledButtonText]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, !canProceed() && styles.disabledButton]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={[styles.navButtonText, styles.nextButtonText, !canProceed() && styles.disabledButtonText]}>
            {getNextButtonText()}
          </Text>
          <ChevronRight size={24} color={!canProceed() ? '#A0A0A0' : colors.light} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'AlbertSans_500Medium',
    color: colors.darkGray,
    fontWeight: '500',
  },
  slideWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  animatedSlide: {
    flex: 1,
    width: width,
  },
  slideContainer: {
    flex: 1,
    padding: 20,
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  contentText: {
    fontSize: 18,
    fontFamily: 'AlbertSans_400Regular',
    color: colors.darkGray,
    lineHeight: 28,
    textAlign: 'left',
  },
  questionContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  questionText: {
    fontSize: 20,
    fontFamily: 'AlbertSans_600SemiBold',
    color: colors.darkGray,
    lineHeight: 30,
    marginBottom: 30,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.light,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: '#F0F8F5',
  },
  correctOption: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  incorrectOption: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light,
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonCorrect: {
    borderColor: '#22C55E',
  },
  radioButtonIncorrect: {
    borderColor: '#EF4444',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'AlbertSans_400Regular',
    color: colors.darkGray,
    lineHeight: 24,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '500',
  },
  correctOptionText: {
    color: '#22C55E',
    fontWeight: '500',
  },
  explanationContainer: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  explanationTitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans_600SemiBold',
    color: colors.darkGray,
    marginBottom: 10,
    fontWeight: '600',
  },
  explanationText: {
    fontSize: 16,
    fontFamily: 'AlbertSans_400Regular',
    color: colors.darkGray,
    lineHeight: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: colors.light,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  previousButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  navButtonText: {
    fontSize: 16,
    fontFamily: 'AlbertSans_500Medium',
    fontWeight: '500',
  },
  nextButtonText: {
    color: colors.light,
  },
  disabledButtonText: {
    color: '#A0A0A0',
  },
  // Completion slide styles
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  completionEmoji: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  completionTitle: {
    fontSize: 32,
    fontFamily: 'AlbertSans_700Bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '700',
  },
  completionSubtitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans_400Regular',
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  completionStarsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
    alignItems: 'center',
  },
  completionMessage: {
    fontSize: 16,
    fontFamily: 'AlbertSans_400Regular',
    color: colors.darkGray,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});