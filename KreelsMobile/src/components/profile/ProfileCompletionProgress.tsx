import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useProfileCompletionStore } from '../../store/profileCompletionStore';

interface ProfileCompletionProgressProps {
  size?: number;
  strokeWidth?: number;
  onPress?: () => void;
  showLabel?: boolean;
  compact?: boolean;
}

export const ProfileCompletionProgress: React.FC<ProfileCompletionProgressProps> = ({
  size = 60,
  strokeWidth = 4,
  onPress,
  showLabel = true,
  compact = false,
}) => {
  const { percentage, isComplete, isLoading } = useProfileCompletionStore();

  // Don't render if profile is complete
  if (isComplete) {
    return null;
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on completion
  const getProgressColor = () => {
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 50) return '#FF9800'; // Orange
    return '#FF5252'; // Red
  };

  const content = (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={[styles.progressContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#333"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getProgressColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentageText, { fontSize: size * 0.25 }]}>
            {percentage}%
          </Text>
        </View>
      </View>
      {showLabel && !compact && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>Profile</Text>
          <View style={styles.tapHint}>
            <Text style={styles.tapHintText}>Tap to complete</Text>
            <Ionicons name="chevron-forward" size={12} color="#888" />
          </View>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 8,
  },
  compactContainer: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  labelContainer: {
    marginLeft: 12,
  },
  labelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  tapHintText: {
    color: '#888',
    fontSize: 11,
  },
});

export default ProfileCompletionProgress;
