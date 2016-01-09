'use strict';

module.exports = {
  keys: {
    google: {
      analytics: {
        trackingId: 'UA-42015512-3'
      },
      simpleApiKey: process.env.GOOGLE_SIMPLE_API_KEY || '',
      oauthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
      oauthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || ''
    },
    frisbee: {
      serverClientId: process.env.SERVER_KEY_SECRET || '',
      androidClientIds: process.env.ANDROID_CLIENT_IDS || []
    }
  }
};
