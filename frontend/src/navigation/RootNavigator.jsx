import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { LearningScreen } from '../screens/LearningScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { FriendProfileScreen } from '../screens/FriendProfileScreen';
import { ModulesScreen } from '../screens/ModulesScreen';
import { ModuleTrackScreen } from '../screens/ModuleTrackScreen';
import { MicroinvestScreen } from '../screens/MicroinvestScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import NavigationBar from '../components/NavigationBar.jsx';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
    );
}

// Learning Stack Navigator
function LearningStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Learning" component={LearningScreen} />
            <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
            <Stack.Screen name="Modules" component={ModulesScreen} />
            <Stack.Screen name="ModuleTrack" component={ModuleTrackScreen} />
            <Stack.Screen name="LessonScreen" component={LessonScreen} />
        </Stack.Navigator>
    );
}
// App Tab Navigator
function AppTabNavigator() {
    return (
        <Tab.Navigator  
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <NavigationBar {...props} />}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Budget" component={BudgetScreen} />
            <Tab.Screen name="LearningStack" component={LearningStack} />
            <Tab.Screen name="Microinvest" component={MicroinvestScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// Main Stack Navigator
function MainStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AppTabs" component={AppTabNavigator} />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
}

// Root Switch Navigator
function RootNavigator() {
    // You can add authentication logic here to determine which stack to show
    const isAuthenticated = true; // Replace with actual auth state
    const hasCompletedOnboarding = true; // Replace with actual onboarding state

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!hasCompletedOnboarding ? (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : !isAuthenticated ? (
                    <Stack.Screen name="Auth" component={AuthStack} />
                ) : (
                    <Stack.Screen name="Main" component={MainStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default RootNavigator;