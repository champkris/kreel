import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import VideoCard from '../components/video/VideoCard';
import { mockVideos } from '../data/seedData';
import { Video } from '../types';

export default function InboxScreen() {
  // For demo purposes, show some liked/bookmarked videos
  const myListVideos = mockVideos.filter(video => video.isLiked).slice(0, 6);

  const handleVideoPress = (video: Video) => {
    console.log('Open video:', video.title);
    // TODO: Navigate to video player
  };

  const renderSection = (title: string, videos: Video[]) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all ›</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.videoScroll}
      >
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onPress={handleVideoPress}
            width={120}
            showTitle={true}
            showStats={false}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My List</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Recently Liked */}
        {renderSection('Recently Liked', myListVideos)}
        
        {/* Watch Later */}
        {renderSection('Watch Later', mockVideos.slice(0, 4))}
        
        {/* Downloaded */}
        {renderSection('Downloaded', mockVideos.slice(2, 5))}
        
        {/* Continue Watching */}
        {renderSection('Continue Watching', mockVideos.slice(1, 6))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    color: '#666',
    fontSize: 14,
  },
  videoScroll: {
    paddingLeft: 20,
    gap: 12,
  },
});