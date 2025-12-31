import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ViewAllScreen, { ViewAllType } from '../screens/ViewAllScreen';
import ChannelScreen, { ChannelParams } from '../screens/ChannelScreen';
import ClubDetailScreen, { ClubDetailParams } from '../screens/ClubDetailScreen';
import VideoDetailScreen from '../screens/VideoDetailScreen';
import SeriesDetailScreen from '../screens/SeriesDetailScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import ChallengeDetailScreen from '../screens/ChallengeDetailScreen';
import DailyRewardsScreen from '../screens/DailyRewardsScreen';

// New screens
import {
  OnboardingScreen,
  WelcomeScreen,
  RoleSelectionScreen,
  GenreSelectionScreen,
} from '../screens/onboarding';

import {
  IdentityVerificationScreen,
  AddressVerificationScreen,
  PaymentInfoScreen,
} from '../screens/auth';

import {
  ExploreScreen,
  LivesScreen,
  ClubsScreen,
} from '../screens/main';

import { CreatorDashboardScreen } from '../screens/creator';

import {
  SettingsScreen,
  PersonalInfoScreen,
  AccountSettingsScreen,
  WalletScreen,
  LanguageScreen,
  PreferencesScreen,
  PrivacySecurityScreen,
  HelpScreen,
  CouponsRewardsScreen,
  ManageSubscriptionScreen,
  TopUpScreen,
} from '../screens/settings';

import LiveStreamViewScreen from '../screens/main/LiveStreamViewScreen';

import { useAuthStore } from '../store/authStore';

// Type definitions
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Auth: undefined;
  RoleSelection: undefined;
  GenreSelection: undefined;
  CreatorVerification: undefined;
  CreatorDashboard: undefined;
  Main: undefined;
  // Settings screens
  Settings: undefined;
  PersonalInfo: undefined;
  AccountSettings: undefined;
  Wallet: undefined;
  TopUp: undefined;
  Language: undefined;
  Preferences: undefined;
  PrivacySecurity: undefined;
  Help: undefined;
  CouponsRewards: undefined;
  ManageSubscription: undefined;
  ManageDevice: undefined;
  UpgradePro: undefined;
  ChangePassword: undefined;
  // Live screens
  LiveStreamView: {
    id: string;
    title: string;
    creator: string;
    viewers: string;
    image: string;
  };
  // View All screen
  ViewAll: {
    type: ViewAllType;
    title: string;
  };
  // Channel screen
  Channel: {
    id: string;
    name: string;
    avatar?: string;
  };
  // Club detail screen
  ClubDetail: {
    id: string;
    name: string;
    members: string;
    image?: string;
  };
  // Video detail screen
  VideoDetail: {
    id: string;
    title?: string;
    thumbnail?: string;
  };
  // Series detail screen
  SeriesDetail: {
    id: string;
    title?: string;
    thumbnail?: string;
  };
  // Challenges screens
  Challenges: undefined;
  ChallengeDetail: {
    challengeId: string;
  };
  // Daily Rewards
  DailyRewards: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type CreatorVerificationParamList = {
  Identity: undefined;
  Address: undefined;
  Payment: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Live: undefined;
  Club: undefined;
  Profile: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const CreatorStack = createStackNavigator<CreatorVerificationParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Creator Verification Navigator
function CreatorVerificationNavigator() {
  const navigation = require('@react-navigation/native').useNavigation();

  return (
    <CreatorStack.Navigator screenOptions={{ headerShown: false }}>
      <CreatorStack.Screen name="Identity">
        {() => (
          <IdentityVerificationScreen
            currentStep={1}
            totalSteps={4}
            onContinue={() => navigation.navigate('Address')}
            onBack={() => navigation.goBack()}
          />
        )}
      </CreatorStack.Screen>
      <CreatorStack.Screen name="Address">
        {() => (
          <AddressVerificationScreen
            currentStep={2}
            totalSteps={4}
            onContinue={() => navigation.navigate('Payment')}
            onBack={() => navigation.goBack()}
          />
        )}
      </CreatorStack.Screen>
      <CreatorStack.Screen name="Payment">
        {() => (
          <PaymentInfoScreen
            currentStep={3}
            totalSteps={4}
            onComplete={() => navigation.navigate('Main' as never)}
            onBack={() => navigation.goBack()}
          />
        )}
      </CreatorStack.Screen>
    </CreatorStack.Navigator>
  );
}

// Custom Tab Bar Icon
function TabBarIcon({
  name,
  focused,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}) {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons name={name} size={focused ? 26 : 24} color={color} />
      {focused && <View style={styles.tabIndicator} />}
    </View>
  );
}

// Main Tab Navigator
function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Explore':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Live':
              iconName = focused ? 'radio' : 'radio-outline';
              break;
            case 'Club':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <TabBarIcon name={iconName} focused={focused} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
          height: spacing.tabBarHeight,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: '500',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarLabel: 'Explore' }}
      />
      <MainTab.Screen
        name="Live"
        component={LivesScreen}
        options={{ tabBarLabel: 'Live' }}
      />
      <MainTab.Screen
        name="Club"
        component={ClubsScreen}
        options={{ tabBarLabel: 'Club' }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </MainTab.Navigator>
  );
}

// Onboarding Flow Component
function OnboardingFlow() {
  const [step, setStep] = useState<'slides' | 'welcome' | 'role' | 'genre'>('slides');
  const [selectedRole, setSelectedRole] = useState<'individual' | 'professional'>('individual');
  const navigation = require('@react-navigation/native').useNavigation();

  const handleOnboardingComplete = async () => {
    setStep('welcome');
  };

  const handleLogin = () => {
    navigation.navigate('Auth');
  };

  const handleSignUp = () => {
    setStep('role');
  };

  const handleContinueAsGuest = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.navigate('Main');
  };

  const handleRoleSelected = (role: 'individual' | 'professional') => {
    setSelectedRole(role);
    setStep('genre');
  };

  const handleGenreSubmit = async (genres: string[]) => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    await AsyncStorage.setItem('selectedGenres', JSON.stringify(genres));

    if (selectedRole === 'professional') {
      navigation.navigate('Auth');
    } else {
      navigation.navigate('Auth');
    }
  };

  switch (step) {
    case 'slides':
      return (
        <OnboardingScreen
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      );
    case 'welcome':
      return (
        <WelcomeScreen
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onContinueAsGuest={handleContinueAsGuest}
        />
      );
    case 'role':
      return (
        <RoleSelectionScreen
          onContinue={handleRoleSelected}
          onBack={() => setStep('welcome')}
        />
      );
    case 'genre':
      return (
        <GenreSelectionScreen
          onSubmit={handleGenreSubmit}
          onSkip={() => handleGenreSubmit([])}
          onBack={() => setStep('role')}
        />
      );
    default:
      return null;
  }
}

// Main App Navigator
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(seen === 'true');
    } catch {
      setHasSeenOnboarding(false);
    }
  };

  // Show splash while checking status
  if (isLoading || hasSeenOnboarding === null) {
    return (
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Splash" component={SplashScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          <>
            <RootStack.Screen name="Onboarding" component={OnboardingFlow} />
            <RootStack.Screen name="Auth" component={AuthNavigator} />
            <RootStack.Screen name="Main" component={MainNavigator} />
          </>
        ) : isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <>
            <RootStack.Screen name="Auth" component={AuthNavigator} />
            <RootStack.Screen name="Main" component={MainNavigator} />
          </>
        )}
        <RootStack.Screen
          name="CreatorVerification"
          component={CreatorVerificationNavigator}
        />
        <RootStack.Screen
          name="CreatorDashboard"
          component={CreatorDashboardScreen}
        />
        {/* Settings Screens */}
        <RootStack.Screen name="Settings" component={SettingsScreen} />
        <RootStack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <RootStack.Screen name="AccountSettings" component={AccountSettingsScreen} />
        <RootStack.Screen name="Wallet" component={WalletScreen} />
        <RootStack.Screen name="Language" component={LanguageScreen} />
        <RootStack.Screen name="Preferences" component={PreferencesScreen} />
        <RootStack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
        <RootStack.Screen name="Help" component={HelpScreen} />
        <RootStack.Screen name="CouponsRewards" component={CouponsRewardsScreen} />
        <RootStack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
        <RootStack.Screen name="TopUp" component={TopUpScreen} />
        <RootStack.Screen name="LiveStreamView" component={LiveStreamViewScreen} />
        <RootStack.Screen name="ViewAll" component={ViewAllScreen} />
        <RootStack.Screen name="Channel" component={ChannelScreen} />
        <RootStack.Screen name="ClubDetail" component={ClubDetailScreen} />
        <RootStack.Screen name="VideoDetail" component={VideoDetailScreen} />
        <RootStack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
        <RootStack.Screen name="Challenges" component={ChallengesScreen} />
        <RootStack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
        <RootStack.Screen name="DailyRewards" component={DailyRewardsScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
  },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
});
