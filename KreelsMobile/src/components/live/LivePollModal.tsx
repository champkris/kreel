import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  endsAt: number; // timestamp
  hasVoted: boolean;
  votedOptionId?: string;
}

interface LivePollModalProps {
  poll: Poll | null;
  visible: boolean;
  onVote: (pollId: string, optionId: string) => void;
  onClose: () => void;
}

export default function LivePollModal({
  poll,
  visible,
  onVote,
  onClose,
}: LivePollModalProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const progressAnims = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    if (poll) {
      // Initialize progress animations for each option
      while (progressAnims.length < poll.options.length) {
        progressAnims.push(new Animated.Value(0));
      }

      // Animate progress bars
      poll.options.forEach((option, index) => {
        Animated.timing(progressAnims[index], {
          toValue: option.percentage,
          duration: 500,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [poll]);

  useEffect(() => {
    if (!poll || !visible) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, poll.endsAt - Date.now());
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [poll, visible]);

  if (!poll) return null;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVote = (optionId: string) => {
    if (poll.hasVoted || timeLeft <= 0) return;
    onVote(poll.id, optionId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            <LinearGradient
              colors={[colors.surface, colors.background]}
              style={styles.gradient}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.pollBadge}>
                  <Ionicons name="stats-chart" size={16} color={colors.primary} />
                  <Text style={styles.pollBadgeText}>LIVE POLL</Text>
                </View>
                <View style={styles.timerBadge}>
                  <Ionicons name="time-outline" size={14} color={colors.textPrimary} />
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Question */}
              <Text style={styles.question}>{poll.question}</Text>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {poll.options.map((option, index) => {
                  const isVoted = poll.votedOptionId === option.id;
                  const showResults = poll.hasVoted || timeLeft <= 0;

                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionButton,
                        isVoted && styles.optionButtonVoted,
                        showResults && styles.optionButtonResults,
                      ]}
                      onPress={() => handleVote(option.id)}
                      disabled={poll.hasVoted || timeLeft <= 0}
                    >
                      {showResults && (
                        <Animated.View
                          style={[
                            styles.optionProgress,
                            isVoted && styles.optionProgressVoted,
                            {
                              width: progressAnims[index]?.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                              }) || '0%',
                            },
                          ]}
                        />
                      )}
                      <View style={styles.optionContent}>
                        <View style={styles.optionLeft}>
                          {isVoted && (
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color={colors.primary}
                              style={styles.votedIcon}
                            />
                          )}
                          <Text
                            style={[
                              styles.optionText,
                              isVoted && styles.optionTextVoted,
                            ]}
                          >
                            {option.text}
                          </Text>
                        </View>
                        {showResults && (
                          <View style={styles.optionRight}>
                            <Text
                              style={[
                                styles.optionPercentage,
                                isVoted && styles.optionPercentageVoted,
                              ]}
                            >
                              {option.percentage}%
                            </Text>
                            <Text style={styles.optionVotes}>
                              {option.votes} votes
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Total Votes */}
              <View style={styles.footer}>
                <Text style={styles.totalVotes}>
                  {poll.totalVotes.toLocaleString()} total votes
                </Text>
                {poll.hasVoted && (
                  <View style={styles.votedBadge}>
                    <Ionicons name="checkmark" size={12} color={colors.success} />
                    <Text style={styles.votedText}>You voted</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    width: screenWidth,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.lg,
    paddingBottom: spacing.xl + 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pollBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.full,
    gap: spacing.xs,
  },
  pollBadgeText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.full,
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  timerText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  closeButton: {
    marginLeft: 'auto',
    padding: spacing.xs,
  },
  question: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  optionButtonVoted: {
    borderColor: colors.primary,
  },
  optionButtonResults: {
    borderColor: colors.border,
  },
  optionProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.primary + '15',
  },
  optionProgressVoted: {
    backgroundColor: colors.primary + '30',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  votedIcon: {
    marginRight: spacing.sm,
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  optionTextVoted: {
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  optionRight: {
    alignItems: 'flex-end',
  },
  optionPercentage: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  optionPercentageVoted: {
    color: colors.primary,
  },
  optionVotes: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalVotes: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  votedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  votedText: {
    color: colors.success,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
