import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '../styles/typography';

export function BudgetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget Tracker</Text>
      <Text style={styles.description}>
        Manage your finances with smart budgeting tools
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    ...typography.h1,
    color: '#333',
    marginBottom: 10,
  },
  description: {
    ...typography.body,
    color: '#666',
    textAlign: 'center',
  },
});