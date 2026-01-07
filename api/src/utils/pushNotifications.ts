import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

const expo = new Expo();

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  badge?: number;
  sound?: 'default' | null;
}

export async function sendPushNotification(
  pushTokens: string[],
  payload: PushPayload
): Promise<void> {
  const messages: ExpoPushMessage[] = [];

  for (const token of pushTokens) {
    // Check if token is valid Expo push token
    if (!Expo.isExpoPushToken(token)) {
      console.error(`Invalid Expo push token: ${token}`);
      continue;
    }

    messages.push({
      to: token,
      sound: payload.sound ?? 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data,
      badge: payload.badge
    });
  }

  if (messages.length === 0) return;

  // Chunk the messages for batch sending
  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      const ticketChunk: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);

      // Log any errors
      for (let i = 0; i < ticketChunk.length; i++) {
        const ticket = ticketChunk[i];
        if (ticket.status === 'error') {
          console.error(`Push notification error:`, ticket.message);
          if (ticket.details?.error) {
            console.error(`Error details:`, ticket.details.error);
          }
        }
      }
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }
}

// Helper to validate push tokens
export function isValidExpoPushToken(token: string): boolean {
  return Expo.isExpoPushToken(token);
}
