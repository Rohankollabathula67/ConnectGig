const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for resolving .mjs modules (used by lucide-react-native esm build)
config.resolver.sourceExts.push('mjs');

module.exports = config;
