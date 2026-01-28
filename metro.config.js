const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configurer le resolver pour supporter l'alias @/
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname),
  },
};

module.exports = config;