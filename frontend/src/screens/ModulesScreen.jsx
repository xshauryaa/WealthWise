import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { Header } from '../components/Header';
import { colors } from '../styles/colors';
import { FONTS } from '../config/fonts';

const { width, height } = Dimensions.get('window');

// Module data with corresponding images
const modulesData = [
  {
    id: 1,
    title: 'INTRO TO PERSONAL FINANCE',
    image: require('../../assets/module-images/IntroToPersonalFin.png'),
  },
  {
    id: 2,
    title: 'CREDIT 101',
    image: require('../../assets/module-images/Credit101.png'),
  },
  {
    id: 3,
    title: 'BUDGETING ESSENTIALS',
    image: require('../../assets/module-images/BudgetingEssentials.png'),
  },
  {
    id: 4,
    title: 'MICROINVESTING',
    image: require('../../assets/module-images/Microinvesting.png'),
  },
  {
    id: 5,
    title: 'BEHAVIORAL FINANCE',
    image: require('../../assets/module-images/BhvFinance.png'),
  },
  {
    id: 6,
    title: 'LOANS & DEBT',
    image: require('../../assets/module-images/Debt&Loan.png'),
  },
  {
    id: 7,
    title: 'INSURANCE & RISK MANAGEMENT',
    image: require('../../assets/module-images/Insurance&Risk.png'),
  },
  {
    id: 8,
    title: 'ASSETS VS. LIABILITIES',
    image: require('../../assets/module-images/AssetsVsLiabilities.png'),
  },
  {
    id: 9,
    title: 'TAX LITERACY',
    image: require('../../assets/module-images/TaxEssentials.png'),
  },
  {
    id: 10,
    title: 'RETIREMENT PLANNING',
    image: require('../../assets/module-images/RetirementPlanning.png'),
  },
];

export function ModulesScreen({ navigation }) {
  const handleModulePress = (module) => {
    // Navigate to module track screen
    navigation.navigate('ModuleTrack', { 
      moduleId: module.id,
      moduleTitle: module.title 
    });
  };

  const renderModule = (module, index) => (
    <TouchableOpacity
      key={module.id}
      style={styles.moduleCard}
      activeOpacity={0.8}
      onPress={() => handleModulePress(module)}
    >
      <View style={styles.moduleImageContainer}>
        <Image 
          source={module.image} 
          style={styles.moduleImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.moduleTitleContainer}>
        <Text style={styles.moduleTitle}>{module.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header 
        title="MODULES" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Modules Grid */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modulesGrid}>
          {modulesData.map((module, index) => renderModule(module, index))}
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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 40,
  },
  moduleCard: {
    width: (width - 60) / 2,
    backgroundColor: colors.light,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  moduleImageContainer: {
    height: 160,
    backgroundColor: colors.secondary,
    paddingTop: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  moduleImage: {
    width: '100%',
    height: '100%',
  },
  moduleTitleContainer: {
    padding: 16,
    backgroundColor: colors.light,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 20,
    fontFamily: FONTS.crushed,
    color: colors.darkGray,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '700',
  },
});