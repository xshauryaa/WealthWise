import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FONTS } from '../config/fonts';

import { Header } from '../components/Header.jsx';
import RecentTransactions from '../components/RecentTransactions.jsx';
import LessonShortcut from '../components/LessonShortcut.jsx';
import ChatShortcut from '../components/ChatShortcut.jsx';
import { padding } from '../styles/spacing.js';

export const HomeScreen = ({ navigation }) => {
  const handleViewHistory = () => {
    // Navigate to budget screen or transaction history
    navigation.navigate('Budget');
  };

  const handleGoToNextLesson = () => {
    // Navigate to learning screen or specific lesson
    navigation.navigate('LearningStack');
  };

  const handleViewChat = () => {
    // Navigate to chat screen
    navigation.navigate('Chat');
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      > 
        <ChatShortcut onViewChat={handleViewChat} />
        <RecentTransactions onViewHistory={handleViewHistory} />
        <LessonShortcut onGoToNextLesson={handleGoToNextLesson} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 48,
  },
  verticalContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.crushed,
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.albertSans.regular,
    color: '#666',
    textAlign: 'center',
  },
});