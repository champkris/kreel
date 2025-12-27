import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Button, Input } from '../components/common';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: ''
  });

  const { register, isLoading, error, clearError } = useAuthStore();
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.username || !formData.displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    clearError();
    try {
      await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        displayName: formData.displayName
      });
    } catch (error: any) {
      console.error('Registration error in component:', error);
      Alert.alert('Registration Failed', error.message || 'Something went wrong. Please try again.');
    }
  };

  const updateFormData = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialSignUp = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} sign up will be available soon!`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', colors.background]}
          style={styles.gradient}
          locations={[0, 0.2, 0.4]}
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
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join KREELS and start your journey</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Display Name"
                placeholder="Your Name"
                value={formData.displayName}
                onChangeText={updateFormData('displayName')}
                leftIcon={
                  <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                }
              />

              <Input
                label="Username"
                placeholder="@username"
                value={formData.username}
                onChangeText={updateFormData('username')}
                autoCapitalize="none"
                leftIcon={
                  <Ionicons name="at-outline" size={20} color={colors.textMuted} />
                }
              />

              <Input
                label="Email"
                placeholder="your@email.com"
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
                placeholder="Min. 6 characters"
                value={formData.password}
                onChangeText={updateFormData('password')}
                showPasswordToggle
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                }
              />

              <Input
                label="Confirm Password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChangeText={updateFormData('confirmPassword')}
                showPasswordToggle
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                }
              />

              <Button
                title={isLoading ? 'Creating Account...' : 'Sign Up'}
                onPress={handleRegister}
                disabled={isLoading}
                loading={isLoading}
                fullWidth
                style={styles.signUpButton}
              />
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or Sign Up With</Text>
              <View style={styles.divider} />
            </View>

            {/* Social Sign Up */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignUp('Google')}
              >
                <Ionicons name="logo-google" size={24} color={colors.google} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignUp('Apple')}
              >
                <Ionicons name="logo-apple" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                <Text style={styles.loginLink}>Sign in</Text>
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
    paddingBottom: spacing['2xl'],
  },
  backButton: {
    marginTop: spacing.base,
    marginBottom: spacing.base,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
  },
  form: {
    marginBottom: spacing.xl,
  },
  signUpButton: {
    marginTop: spacing.md,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
  },
  loginLink: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});
