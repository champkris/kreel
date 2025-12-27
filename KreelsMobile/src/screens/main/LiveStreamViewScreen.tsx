import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import LiveGiftingModal from '../../components/live/LiveGiftingModal';
import { Gift, formatCoins } from '../../data/giftData';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LiveStreamParams {
  id: string;
  title: string;
  creator: string;
  viewers: string;
  image: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  type: 'chat' | 'gift' | 'system';
  gift?: {
    icon: string;
    name: string;
    quantity: number;
  };
}

interface GiftAnimation {
  id: string;
  gift: Gift;
  quantity: number;
  sender: string;
}

export default function LiveStreamViewScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<RouteProp<{ params: LiveStreamParams }, 'params'>>();
  const { title, creator, viewers, image } = route.params || {
    id: '1',
    title: 'Live Stream',
    creator: 'Creator',
    viewers: '1.2K',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
  };

  const [showGiftModal, setShowGiftModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [userCoins, setUserCoins] = useState(540);
  const [giftAnimations, setGiftAnimations] = useState<GiftAnimation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', username: 'StarFan', message: 'Amazing stream!', type: 'chat' },
    { id: '2', username: 'DiamondLover', message: 'Welcome everyone!', type: 'chat' },
    { id: '3', username: 'System', message: 'GiftKing joined the stream', type: 'system' },
    { id: '4', username: 'RocketMan', message: 'Love this!', type: 'chat' },
  ]);

  const chatListRef = useRef<FlatList>(null);
  const giftAnim = useRef(new Animated.Value(0)).current;

  const handleSendGift = (gift: Gift, quantity: number) => {
    const cost = gift.price * quantity;
    if (cost > userCoins) return;

    setUserCoins(prev => prev - cost);

    // Add gift animation
    const animId = Date.now().toString();
    setGiftAnimations(prev => [
      ...prev,
      { id: animId, gift, quantity, sender: 'You' },
    ]);

    // Add gift message to chat
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: `sent ${quantity}x ${gift.name}`,
      type: 'gift',
      gift: {
        icon: gift.icon,
        name: gift.name,
        quantity,
      },
    };
    setMessages(prev => [...prev, newMessage]);

    // Trigger animation
    Animated.sequence([
      Animated.timing(giftAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(giftAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setGiftAnimations(prev => prev.filter(a => a.id !== animId));
    });

    setShowGiftModal(false);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: chatMessage.trim(),
      type: 'chat',
    };
    setMessages(prev => [...prev, newMessage]);
    setChatMessage('');
  };

  const handleTopUp = () => {
    setShowGiftModal(false);
    navigation.navigate('TopUp' as never);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.message}</Text>
        </View>
      );
    }

    if (item.type === 'gift') {
      return (
        <View style={styles.giftMessage}>
          <Text style={styles.giftUsername}>{item.username}</Text>
          <Text style={styles.giftText}> {item.message}</Text>
          {item.gift && (
            <View style={styles.giftBadge}>
              <Text style={styles.giftEmoji}>{item.gift.icon}</Text>
              <Text style={styles.giftQuantity}>x{item.gift.quantity}</Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.chatMessage}>
        <Text style={styles.chatUsername}>{item.username}:</Text>
        <Text style={styles.chatText}> {item.message}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Video Background */}
      <ImageBackground
        source={{ uri: image }}
        style={styles.videoBackground}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.creatorInfo}>
              <View style={styles.creatorAvatar}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
              <View>
                <Text style={styles.creatorName}>{creator}</Text>
                <Text style={styles.streamTitle}>{title}</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <View style={styles.viewerBadge}>
                <Ionicons name="eye" size={14} color={colors.textPrimary} />
                <Text style={styles.viewerText}>{viewers}</Text>
              </View>
            </View>
          </View>

          {/* Gift Animation Overlay */}
          {giftAnimations.map(anim => (
            <Animated.View
              key={anim.id}
              style={[
                styles.giftAnimationContainer,
                {
                  opacity: giftAnim,
                  transform: [
                    {
                      translateY: giftAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                    {
                      scale: giftAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.5, 1.2, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(212, 168, 75, 0.9)', 'rgba(139, 105, 20, 0.9)']}
                style={styles.giftAnimationCard}
              >
                <Text style={styles.giftAnimationEmoji}>{anim.gift.icon}</Text>
                <View style={styles.giftAnimationInfo}>
                  <Text style={styles.giftAnimationSender}>{anim.sender}</Text>
                  <Text style={styles.giftAnimationName}>
                    sent {anim.quantity}x {anim.gift.name}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          ))}

          {/* Main Content Area */}
          <View style={styles.contentArea}>
            {/* Chat Messages */}
            <View style={styles.chatContainer}>
              <FlatList
                ref={chatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => chatListRef.current?.scrollToEnd()}
                style={styles.chatList}
              />
            </View>
          </View>

          {/* Bottom Controls */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.bottomControls}
          >
            <View style={styles.inputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Say something..."
                placeholderTextColor={colors.textMuted}
                value={chatMessage}
                onChangeText={setChatMessage}
                onSubmitEditing={handleSendMessage}
              />

              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                disabled={!chatMessage.trim()}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={chatMessage.trim() ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
              {/* Coin Balance */}
              <TouchableOpacity style={styles.coinBalance} onPress={handleTopUp}>
                <Text style={styles.coinBalanceEmoji}>🪙</Text>
                <Text style={styles.coinBalanceText}>{formatCoins(userCoins)}</Text>
                <Ionicons name="add-circle" size={16} color={colors.primary} />
              </TouchableOpacity>

              {/* Gift Button */}
              <TouchableOpacity
                style={styles.giftButton}
                onPress={() => setShowGiftModal(true)}
              >
                <LinearGradient
                  colors={[colors.primaryLight, colors.primary]}
                  style={styles.giftButtonGradient}
                >
                  <Ionicons name="gift" size={24} color={colors.background} />
                  <Text style={styles.giftButtonText}>Gift</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Like Button */}
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="heart-outline" size={24} color={colors.textPrimary} />
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-social-outline" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>

      {/* Gift Modal */}
      <LiveGiftingModal
        visible={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        onSendGift={handleSendGift}
        userCoins={userCoins}
        creatorName={creator}
        onTopUp={handleTopUp}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  videoBackground: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  creatorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  creatorName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  streamTitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.live,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.sm,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textPrimary,
  },
  liveText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.sm,
    gap: 4,
  },
  viewerText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatContainer: {
    maxHeight: screenHeight * 0.35,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  chatList: {
    flex: 1,
  },
  chatMessage: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  chatUsername: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  chatText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  systemMessageText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },
  giftMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 168, 75, 0.3)',
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: colors.primary + '50',
  },
  giftUsername: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  giftText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
  giftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.xs,
    gap: 2,
  },
  giftEmoji: {
    fontSize: 18,
  },
  giftQuantity: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  giftAnimationContainer: {
    position: 'absolute',
    top: 120,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    zIndex: 100,
  },
  giftAnimationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: spacing.borderRadius.xl,
    gap: spacing.md,
  },
  giftAnimationEmoji: {
    fontSize: 48,
  },
  giftAnimationInfo: {
    flex: 1,
  },
  giftAnimationSender: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  giftAnimationName: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    opacity: 0.9,
  },
  bottomControls: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: spacing.borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary + '50',
  },
  coinBalanceEmoji: {
    fontSize: 16,
  },
  coinBalanceText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  giftButton: {
    borderRadius: spacing.buttonBorderRadius,
    overflow: 'hidden',
  },
  giftButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  giftButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
});
