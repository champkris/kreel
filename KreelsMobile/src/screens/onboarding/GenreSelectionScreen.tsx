import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button, Chip } from '../../components/common';

const genres = [
  'Action',
  'Drama',
  'Comedy',
  'Horror',
  'Adventure',
  'Thriller',
  'Romance',
  'Science',
  'Music',
  'Documentary',
  'Crime',
  'Fantasy',
  'Fiction',
  'Animation',
  'K-Drama',
  'Sports',
];

interface Props {
  onSubmit: (genres: string[]) => void;
  onSkip: () => void;
  onBack?: () => void;
}

export default function GenreSelectionScreen({ onSubmit, onSkip, onBack }: Props) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      }
      return [...prev, genre];
    });
  };

  const handleSubmit = () => {
    onSubmit(selectedGenres);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      )}

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Genre</Text>
            <Text style={styles.subtitle}>
              Select your favorite genres to personalize your experience.
            </Text>
          </View>

          <View style={styles.genresContainer}>
            {genres.map((genre) => (
              <Chip
                key={genre}
                label={genre}
                selected={selectedGenres.includes(genre)}
                onPress={() => toggleGenre(genre)}
                size="medium"
                variant="outline"
                style={styles.genreChip}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Skip"
          onPress={onSkip}
          variant="secondary"
          style={styles.skipButton}
        />
        <Button
          title="Send"
          onPress={handleSubmit}
          variant="primary"
          disabled={selectedGenres.length === 0}
          style={styles.submitButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: spacing.base,
    marginLeft: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing['2xl'],
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSize.base,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  genreChip: {
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  skipButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
