# Kreels Mobile App

React Native mobile application for the Kreels video platform.

## 🚀 Features

- **Authentication**: Login and registration
- **Video Feed**: TikTok-like vertical video scrolling
- **Navigation**: Bottom tab navigation with 5 main sections
- **Real-time**: Socket.io integration for live features
- **State Management**: Zustand for simple state management
- **API Integration**: Axios with request/response interceptors

## 📱 Tech Stack

- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **React Navigation 6** for navigation
- **Zustand** for state management
- **React Query** for data fetching and caching
- **Axios** for HTTP requests
- **Socket.io** for real-time features

## 🛠️ Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio & Android SDK (for Android development)

## 📦 Installation

### 1. Install Dependencies
```bash
cd KreelsMobile
npm install
```

### 2. Configure API URL
Update the API base URL in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://your-api-url:3001/api';
```

For local development:
- iOS Simulator: `http://localhost:3001/api`
- Android Emulator: `http://10.0.2.2:3001/api`
- Physical Device: `http://YOUR_COMPUTER_IP:3001/api`

### 3. Start Development Server
```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web (for testing)
npm run web
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── navigation/         # Navigation configuration
├── screens/           # Screen components
├── services/          # API services and configurations
├── store/            # State management (Zustand)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
API_BASE_URL=http://localhost:3001/api
SOCKET_URL=http://localhost:3001
```

### Navigation Structure
- **Splash**: Loading screen with authentication check
- **Auth Stack**: Login and Register screens
- **Main Tabs**:
  - Home: Video feed
  - Discover: Trending content
  - Camera: Video recording
  - Inbox: Messages and notifications
  - Profile: User profile and settings

## 🎨 Styling

- **Dark Theme**: Black background with accent colors
- **Brand Colors**:
  - Primary: `#FF3B5C` (Kreels red)
  - Background: `#000000`
  - Text: `#FFFFFF`, `#999999`
  - Cards: `#1a1a1a`

## 🔗 API Integration

The app connects to the Kreels backend API for:
- User authentication
- Video management
- Social features
- Real-time updates

Make sure the backend API is running on `http://localhost:3001` before testing the mobile app.

## 🚧 Next Steps

### Immediate Features to Add:
1. **Video Player**: Integrate react-native-video for video playback
2. **Camera Integration**: Add video recording with expo-camera
3. **Image/Video Picker**: File upload functionality
4. **Social Features**: Like, comment, share functionality
5. **Real-time Chat**: Socket.io integration for live features

### Advanced Features:
1. **Push Notifications**: Expo notifications
2. **Offline Support**: React Query offline capabilities
3. **Video Caching**: Optimize video loading and caching
4. **Performance**: Lazy loading and optimization
5. **Testing**: Unit and integration tests

## 🐛 Common Issues

### Metro Bundler Issues
```bash
# Clear cache and restart
npx expo start --clear
```

### iOS Simulator Issues
```bash
# Reset iOS Simulator
xcrun simctl erase all
```

### Android Emulator Issues
```bash
# Clean and rebuild
cd android && ./gradlew clean
```

## 📚 Learning Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Happy Coding! 🎬📱**