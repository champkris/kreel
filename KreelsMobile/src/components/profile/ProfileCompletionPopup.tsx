import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import {
  useProfileCompletionStore,
  PROFILE_FIELD_LABELS,
  PROFILE_FIELD_ICONS,
} from '../../store/profileCompletionStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileCompletionPopupProps {
  visible: boolean;
  onClose: () => void;
  onCompleteProfile: () => void;
}

export const ProfileCompletionPopup: React.FC<ProfileCompletionPopupProps> = ({
  visible,
  onClose,
  onCompleteProfile,
}) => {
  const { percentage, missingFields, markReminderShown } = useProfileCompletionStore();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleRemindLater = async () => {
    await markReminderShown();
    onClose();
  };

  const handleCompleteProfile = () => {
    onClose();
    onCompleteProfile();
  };

  // Progress circle dimensions
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getProgressColor = () => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 50) return '#FF9800';
    return '#FF5252';
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleRemindLater}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleRemindLater}
        />
        <Animated.View
          style={[
            styles.popup,
            { transform: [{ translateY }] },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleRemindLater}
          >
            <Ionicons name="close" size={24} color="#888" />
          </TouchableOpacity>

          {/* Progress circle */}
          <View style={styles.progressSection}>
            <View style={[styles.progressContainer, { width: size, height: size }]}>
              <Svg width={size} height={size}>
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#333"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
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
                <Text style={styles.percentageText}>{percentage}%</Text>
                <Text style={styles.completeText}>Complete</Text>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Fill in the missing details to unlock all features and help others find you!
          </Text>

          {/* Missing fields */}
          <ScrollView style={styles.fieldsContainer} showsVerticalScrollIndicator={false}>
            {missingFields.map((field) => (
              <View key={field} style={styles.fieldItem}>
                <View style={styles.fieldIcon}>
                  <Ionicons
                    name={PROFILE_FIELD_ICONS[field] as any || 'ellipse-outline'}
                    size={20}
                    color="#FF5252"
                  />
                </View>
                <Text style={styles.fieldText}>
                  {PROFILE_FIELD_LABELS[field] || field}
                </Text>
                <Ionicons name="add-circle-outline" size={20} color="#888" />
              </View>
            ))}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteProfile}
            >
              <Text style={styles.completeButtonText}>Complete Profile</Text>
              <Ionicons name="arrow-forward" size={18} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.remindButton}
              onPress={handleRemindLater}
            >
              <Text style={styles.remindButtonText}>Remind Me Later</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  popup: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  progressSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  completeText: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  fieldsContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldText: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  buttonsContainer: {
    gap: 10,
  },
  completeButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  completeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  remindButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  remindButtonText: {
    color: '#888',
    fontSize: 14,
  },
});

export default ProfileCompletionPopup;
