import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usersAPI } from '../services/api';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function CreateChannelScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [channelName, setChannelName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '✨' },
    { id: 'comedy', label: 'Comedy', icon: '😂' },
  ];

  const pickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const pickBanner = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setBanner(result.assets[0].uri);
    }
  };

  const validateUsername = (text: string) => {
    // Only allow lowercase letters, numbers, and underscores
    const cleaned = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
  };

  const handleCreate = async () => {
    if (!channelName.trim()) {
      Alert.alert('Error', 'Please enter a channel name.');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username.');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters.');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category for your channel.');
      return;
    }

    setLoading(true);
    try {
      const response = await usersAPI.updateProfile({
        displayName: channelName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        avatar: avatar || undefined,
        banner: banner || undefined,
        category,
        isCreator: true,
      });

      if (response.success) {
        Alert.alert(
          'Channel Created!',
          'Your channel is now live. Start uploading videos to grow your audience!',
          [
            {
              text: 'Go to My Channel',
              onPress: () => {
                navigation.goBack();
                // Navigate to the user's channel
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to create channel. Please try again.');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      Alert.alert('Error', 'Failed to create channel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Channel</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner Upload */}
        <TouchableOpacity style={styles.bannerUpload} onPress={pickBanner}>
          {banner ? (
            <Image source={{ uri: banner }} style={styles.bannerImage} />
          ) : (
            <LinearGradient
              colors={[colors.surface, colors.surfaceLight]}
              style={styles.bannerPlaceholder}
            >
              <Ionicons name="image-outline" size={32} color={colors.textMuted} />
              <Text style={styles.bannerPlaceholderText}>Add Channel Banner</Text>
              <Text style={styles.bannerHint}>Recommended: 1920x1080</Text>
            </LinearGradient>
          )}
          {/* Avatar overlay on banner */}
          <TouchableOpacity style={styles.avatarOverlay} onPress={pickAvatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={24} color={colors.textMuted} />
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Ionicons name="pencil" size={12} color={colors.background} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Channel Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Channel Name *</Text>
          <TextInput
            style={styles.input}
            value={channelName}
            onChangeText={setChannelName}
            placeholder="Your channel name"
            placeholderTextColor={colors.textMuted}
            maxLength={50}
          />
          <Text style={styles.hint}>This is how your channel will appear to viewers</Text>
        </View>

        {/* Username */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username *</Text>
          <View style={styles.usernameInput}>
            <Text style={styles.usernamePrefix}>@</Text>
            <TextInput
              style={styles.usernameField}
              value={username}
              onChangeText={validateUsername}
              placeholder="username"
              placeholderTextColor={colors.textMuted}
              maxLength={30}
              autoCapitalize="none"
            />
          </View>
          <Text style={styles.hint}>Only lowercase letters, numbers, and underscores</Text>
        </View>

        {/* Bio */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Channel Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell viewers about your channel..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            maxLength={300}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{bio.length}/300</Text>
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Channel Category *</Text>
          <Text style={styles.hint}>Select the main category for your content</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  category === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat.id && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Creating a channel allows you to upload videos, go live, and build your audience on Kreels.
          </Text>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Ionicons name="rocket" size={20} color={colors.background} />
              <Text style={styles.createButtonText}>Launch My Channel</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  bannerUpload: {
    height: 160,
    position: 'relative',
    marginBottom: 50,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerPlaceholderText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    marginTop: spacing.sm,
  },
  bannerHint: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: -40,
    left: spacing.screenPadding,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.background,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  inputGroup: {
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.md,
  },
  hint: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  characterCount: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  usernameInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  usernamePrefix: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
    marginRight: spacing.xs,
  },
  usernameField: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
  categoryLabelActive: {
    color: colors.background,
    fontWeight: typography.fontWeight.medium,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.screenPadding,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 50,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  bottomSpacing: {
    height: spacing['3xl'],
  },
});
