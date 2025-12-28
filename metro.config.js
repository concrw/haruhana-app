const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force CommonJS resolution for better web compatibility
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs'];

module.exports = config;
