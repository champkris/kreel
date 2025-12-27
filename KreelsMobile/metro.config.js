const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Video formats
  'mp4',
  'mov',
  'avi',
  'mkv',
  'webm',
  // Audio formats
  'mp3',
  'wav',
  'aac',
  'flac'
);

module.exports = config;