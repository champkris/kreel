import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button } from '../../components/common';

interface Props {
  onLogin: () => void;
  onSignUp: () => void;
  onContinueAsGuest: () => void;
}

export default function WelcomeScreen({ onLogin, onSignUp, onContinueAsGuest }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
          style={styles.gradient}
          locations={[0, 0.3, 0.6]}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title section */}
        <View style={styles.titleSection}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.brandText}>KREELS</Text>
          <Text style={styles.description}>
            Discover stories, join communities, and{'\n'}support your favorite creators
          </Text>
        </View>

        {/* Actions section */}
        <View style={styles.actionsSection}>
          <Button
            title="Login"
            onPress={onLogin}
            variant="outline"
            fullWidth
            style={styles.loginButton}
          />

          <Button
            title="Sign Up"
            onPress={onSignUp}
            variant="primary"
            fullWidth
            style={styles.signUpButton}
          />

          <TouchableOpacity onPress={onContinueAsGuest} style={styles.guestButton}>
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 60,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  welcomeText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.normal,
    marginBottom: spacing.xs,
  },
  brandText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 4,
    marginBottom: spacing.base,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionsSection: {
    width: '100%',
  },
  loginButton: {
    marginBottom: spacing.md,
    borderColor: colors.textSecondary,
  },
  signUpButton: {
    marginBottom: spacing.lg,
  },
  guestButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  guestText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    textDecorationLine: 'underline',
  },
});
