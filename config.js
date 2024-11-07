module.exports = (function () {
  const env = process.env;
  return {
    HOSTNAME: env.HOSTNAME,
    PORT: env.PORT,
    DB: {
      default: {
        host: env.DB_DEFAULT_HOST,
        user: env.DB_DEFAULT_USER,
        password: env.DB_DEFAULT_PASSWORD,
        database: env.DB_DEFAULT_DATABASE,
        client: env.DB_DEFAULT_CLIENT
      }
    },
    API_KEYS: JSON.parse(env.API_KEYS)
  }
})();