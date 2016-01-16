module.export = {
  mail: {
    'error_recipient': 'splaktar@gmail.com'
  },
  redis: {
    host: process.env.OPENSHIFT_REDIS_DB_HOST || 'redis-redis-1-vm',
    port: process.env.OPENSHIFT_REDIS_DB_PORT || '6379',
    password: process.env.OPENSHIFT_REDIS_DB_PASSWORD || ''
  }
};
