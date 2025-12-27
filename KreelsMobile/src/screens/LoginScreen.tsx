import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { testBackendConnection, testAuthEndpoints } from '../utils/testConnection';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Button, Input } from '../components/common';

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { login, isLoading, error, clearError } = useAuthStore();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    clearError();
    try {
      await login(formData.email, formData.password);
    } catch (error: any) {
      console.error('Login error in component:', error);
      Alert.alert('Login Failed', error.message || 'Something went wrong. Please try again.');
    }
  };

  const updateFormData = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async () => {
    Alert.alert('Testing Connection', 'Checking backend connectivity...');
    try {
      const connectionResult = await testBackendConnection();
      const endpointResults = await testAuthEndpoints();

      const message = `Connection: ${connectionResult.success ? '✅' : '❌'}
URL: ${connectionResult.url}
Platform: ${connectionResult.platform || 'unknown'}
Health: ${endpointResults.health ? '✅' : '❌'}
Register: ${endpointResults.register ? '✅' : '❌'}
Login: ${endpointResults.login ? '✅' : '❌'}

${connectionResult.error ? `Error: ${connectionResult.error}` : 'All systems operational!'}`;

      Alert.alert('Connection Test Results', message);
    } catch (error) {
      Alert.alert('Test Failed', 'Unable to test connection');
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} login will be available soon!`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', colors.background]}
          style={styles.gradient}
          locations={[0, 0.3, 0.5]}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Login</Text>
            </View>

            {/* Dev Info */}
            {__DEV__ && (
              <View style={styles.devInfo}>
                <Text style={styles.devInfoText}>Demo: demo@kreels.com / demo123</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Your Email"
                value={formData.email}
                onChangeText={updateFormData('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={
                  <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                }
              />

              <Input
                label="Password"
                placeholder="Password"
                value={formData.password}
                onChangeText={updateFormData('password')}
                showPasswordToggle
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                }
              />

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title={isLoading ? 'Signing In...' : 'Login'}
                onPress={handleLogin}
                disabled={isLoading}
                loading={isLoading}
                fullWidth
                style={styles.loginButton}
              />
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or Join With</Text>
              <View style={styles.divider} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('Google')}
              >
                <Ionicons name="logo-google" size={24} color={colors.google} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('Apple')}
              >
                <Ionicons name="logo-apple" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Debug Button */}
            {__DEV__ && (
              <TouchableOpacity
                style={styles.debugButton}
                onPress={handleTestConnection}
              >
                <Text style={styles.debugButtonText}>Test Backend Connection</Text>
              </TouchableOpacity>
            )}

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceLight,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  devInfo: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  devInfoText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    marginHorizontal: spacing.base,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  debugButton: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  debugButtonText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
  },
  signUpLink: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});
