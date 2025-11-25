import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Header } from '../components/Header';
import { colors } from '../styles/colors';
import { FONTS } from '../config/fonts';

export function MicroinvestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Microinvesting" />
      
      <View style={styles.content}>
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonTitle}>COMING SOON</Text>
          <Text style={styles.comingSoonSubtitle}>
            We're working hard to bring you an amazing microinvesting experience. 
            Stay tuned for updates!
          </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  comingSoonContainer: {
    alignItems: 'center',
    gap: 20,
  },
  comingSoonTitle: {
    fontSize: 48,
    fontFamily: FONTS.crushed,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  comingSoonSubtitle: {
    fontSize: 18,
    fontFamily: 'AlbertSans_400Regular',
    color: colors.darkGray,
    textAlign: 'center',
    lineHeight: 26,
  },
});