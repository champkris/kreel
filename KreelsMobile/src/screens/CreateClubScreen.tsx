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
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { clubsAPI } from '../services/api';

export default function CreateClubScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload a club image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a club name.');
      return;
    }

    if (name.trim().length < 3) {
      Alert.alert('Error', 'Club name must be at least 3 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await clubsAPI.createClub({
        name: name.trim(),
        description: description.trim(),
        avatar: image || undefined,
        isPrivate,
      });

      if (response.success) {
        Alert.alert('Success', 'Your club has been created!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to create club. Please try again.');
      }
    } catch (error) {
      console.error('Error creating club:', error);
      Alert.alert('Error', 'Failed to create club. Please try again.');
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
        <Text style={styles.headerTitle}>Create Club</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Club Image */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.clubImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={40} color={colors.textMuted} />
                <Text style={styles.imagePlaceholderText}>Add Club Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {image && (
            <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
              <Text style={styles.changeImageText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Club Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Club Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter club name"
            placeholderTextColor={colors.textMuted}
            maxLength={50}
          />
          <Text style={styles.characterCount}>{name.length}/50</Text>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="What's your club about?"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{description.length}/500</Text>
        </View>

        {/* Privacy Setting */}
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Private Club</Text>
            <Text style={styles.settingDescription}>
              Only approved members can see posts and join
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, isPrivate && styles.toggleActive]}
            onPress={() => setIsPrivate(!isPrivate)}
          >
            <View style={[styles.toggleKnob, isPrivate && styles.toggleKnobActive]} />
          </TouchableOpacity>
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
            <Text style={styles.createButtonText}>Create Club</Text>
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
    paddingHorizontal: spacing.screenPadding,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  imageUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  clubImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  changeImageButton: {
    marginTop: spacing.md,
  },
  changeImageText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  inputGroup: {
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
    height: 120,
    paddingTop: spacing.md,
  },
  characterCount: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
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
