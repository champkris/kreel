import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const { height: screenHeight } = Dimensions.get('window');

interface Reaction {
  id: string;
  emoji: string;
  x: number;
}

interface FloatingReactionsProps {
  reactions: Reaction[];
  onReactionComplete: (id: string) => void;
}

// Single floating reaction component
function FloatingReaction({
  reaction,
  onComplete,
}: {
  reaction: Reaction;
  onComplete: (id: string) => void;
}) {
  const animValue = useRef(new Animated.Value(0)).current;
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main float up animation
    Animated.parallel([
      Animated.timing(animValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
      // Wobble side to side
      Animated.loop(
        Animated.sequence([
          Animated.timing(wobble, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(wobble, {
            toValue: -1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 4 }
      ),
    ]).start(() => {
      onComplete(reaction.id);
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.floatingReaction,
        {
          left: reaction.x,
          opacity: animValue.interpolate({
            inputRange: [0, 0.2, 0.8, 1],
            outputRange: [0, 1, 1, 0],
          }),
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -screenHeight * 0.5],
              }),
            },
            {
              translateX: wobble.interpolate({
                inputRange: [-1, 1],
                outputRange: [-15, 15],
              }),
            },
            {
              scale: animValue.interpolate({
                inputRange: [0, 0.2, 0.5, 1],
                outputRange: [0.5, 1.2, 1, 0.8],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
    </Animated.View>
  );
}

// Reaction buttons bar
export const REACTION_EMOJIS = ['❤️', '🔥', '👏', '😍', '🎉', '💯'];

interface ReactionBarProps {
  onReaction: (emoji: string) => void;
}

export function ReactionBar({ onReaction }: ReactionBarProps) {
  return (
    <View style={styles.reactionBar}>
      {REACTION_EMOJIS.map((emoji, index) => (
        <TouchableOpacity
          key={index}
          style={styles.reactionButton}
          onPress={() => onReaction(emoji)}
        >
          <Text style={styles.reactionButtonEmoji}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Main container for floating reactions
export default function FloatingReactions({
  reactions,
  onReactionComplete,
}: FloatingReactionsProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      {reactions.map((reaction) => (
        <FloatingReaction
          key={reaction.id}
          reaction={reaction}
          onComplete={onReactionComplete}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 200,
    width: 100,
    height: screenHeight * 0.5,
    zIndex: 50,
  },
  floatingReaction: {
    position: 'absolute',
    bottom: 0,
  },
  reactionEmoji: {
    fontSize: 36,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  reactionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionButtonEmoji: {
    fontSize: 24,
  },
});
