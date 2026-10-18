const fs = require('fs');

module.exports = ({ config }) => {
  const hasAndroidGoogleServices = fs.existsSync('./google-services.json');
  const hasIosGoogleServices = fs.existsSync('./GoogleService-Info.plist');

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyPlaceholderKey',
        },
      },
      ...(hasAndroidGoogleServices ? { googleServicesFile: './google-services.json' } : {}),
    },
    ios: {
      ...config.ios,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyPlaceholderKey',
        },
      },
      ...(hasIosGoogleServices ? { googleServicesFile: './GoogleService-Info.plist' } : {}),
    },
  };
};
