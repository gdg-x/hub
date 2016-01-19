module.exports = {
  status: 'dev',
  name: 'GDG[x] Hub',
  mongoose: {
    uri: process.env.MONGO_URL || 'mongodb://localhost/gdgx-hub-dev'
  },
  paging: {
    size: 40
  },
  newrelic: {
    key: process.env.NEWRELIC
  },
  app: {
    api: {
      enabled: process.env.API_ENABLED,
      apiV1PreFix: '/api/v1',
      apiV2PreFix: '/api/2',
      port: process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000,
      hostname: process.env.OPENSHIFT_NODEJS_IP
    },
    cron: {
      enabled: process.env.CRON_ENABLED
    }
  },
  mail: {
    sender: 'GDG[x] Hub - Dev <hub@gdgx.io>',
    transport: 'Direct'
  },
  session: {
    secret: 'e457jhe57hg45zth4htxdxKU&$FVrekrrj',
    name: 'hub-session-id'
  },
  keys: {
    google: {
      analytics: {
        trackingId: process.env.GA_ID
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
