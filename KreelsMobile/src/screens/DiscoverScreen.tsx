import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Video } from '../types';
import { mockVideos, formatViews, getEpisodeInfo } from '../data/seedData';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface VideoItemProps {
  video: Video;
  isActive: boolean;
}

const VideoItem: React.FC<VideoItemProps> = ({ video, isActive }) => {
  const episodeInfo = getEpisodeInfo(video.id);
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <View style={styles.videoContainer}>
      {/* Video background */}
      <Image
        source={{ 
          uri: video.thumbnailUrl || 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800&h=600&fit=crop' 
        }}
        style={styles.videoBackground}
        resizeMode="cover"
      />
      
      {/* Dark overlay */}
      <View style={styles.videoOverlay} />
      
      {/* Swipe indicator */}
      <View style={styles.swipeContainer}>
        <View style={styles.swipeIcon}>
          <Text style={styles.swipeIconText}>👆</Text>
        </View>
        <Text style={styles.swipeText}>Swipe to switch</Text>
      </View>
      
      {/* Right side action buttons - According to requirements */}
      <View style={styles.rightSideActions}>
        <TouchableOpacity style={styles.sideActionButton}>
          <View style={styles.bookmarkIconContainer}>
            <Text style={styles.bookmarkIcon}>🔖</Text>
          </View>
          <Text style={styles.sideActionText}>795K</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sideActionButton}>
          <View style={styles.episodeIconContainer}>
            <Text style={styles.episodeIcon}>▤</Text>
          </View>
          <Text style={styles.sideActionText}>Episodes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sideActionButton}>
          <View style={styles.shareIconContainer}>
            <Text style={styles.shareIcon}>↗</Text>
          </View>
          <Text style={styles.sideActionText}>Share</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom video info */}
      <View style={styles.bottomVideoInfo}>
        <Text style={styles.videoTitle}>{video.title}</Text>
        <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
          <Text 
            style={styles.videoDescription} 
            numberOfLines={showFullDescription ? undefined : 2}
          >
            {video.description}
            {!showFullDescription && '... '}
            <Text style={styles.moreText}>→</Text>
          </Text>
        </TouchableOpacity>
        <Text style={styles.episodeInfo}>
          EP.{episodeInfo.current} / EP.{episodeInfo.total}
        </Text>
      </View>
      
      {/* Episode bar - According to requirements */}
      <View style={styles.episodeBar}>
        <View style={styles.episodeBarContent}>
          <Text style={styles.episodeBarIcon}>▤</Text>
          <Text style={styles.episodeBarText}>EP.{episodeInfo.current} / EP.{episodeInfo.total}</Text>
        </View>
        <Text style={styles.episodeBarArrow}>→</Text>
      </View>
    </View>
  );
};

export default function DiscoverScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setVideos(mockVideos);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderVideoItem = ({ item, index }: { item: Video; index: number }) => (
    <VideoItem
      video={item}
      isActive={index === currentIndex}
    />
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  videoContainer: {
    height: screenHeight,
    width: screenWidth,
    position: 'relative',
  },
  videoBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  swipeContainer: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  swipeIconText: {
    fontSize: 24,
  },
  swipeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  // Right side actions - matches VideoPlayer design
  rightSideActions: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    alignItems: 'center',
    gap: 30,
  },
  sideActionButton: {
    alignItems: 'center',
  },
  bookmarkIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  bookmarkIcon: {
    fontSize: 28,
    color: '#fff',
  },
  episodeIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  episodeIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  shareIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  shareIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  sideActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Bottom video info
  bottomVideoInfo: {
    position: 'absolute',
    bottom: 250,
    left: 20,
    right: 80,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoDescription: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  episodeInfo: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  moreText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Episode bar
  episodeBar: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
  },
  episodeBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  episodeBarIcon: {
    fontSize: 16,
    color: '#fff',
  },
  episodeBarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  episodeBarArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});