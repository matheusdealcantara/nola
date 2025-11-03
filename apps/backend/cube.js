// @ts-nocheck
require('dotenv').config();

const CubejsServer = require('@cubejs-backend/server');

const server = new CubejsServer({
  contextToAppId: () => 'CUBEJS_APP',
  scheduledRefreshTimer: 30,

  // Disable Cube SQL completely - this prevents the timezone parser errors and port conflicts
  sqlPort: undefined,
  pgSqlPort: undefined,

  // Disable Cube Store completely - query PostgreSQL directly
  devServer: false, // Disable Cube Store in dev mode

  orchestratorOptions: {
    queryCacheOptions: {
      refreshKeyRenewalThreshold: 120,
      queueOptions: {
        executionTimeout: 600, // 10 minutes in seconds
      },
    },
    // Skip pre-aggregations completely
    preAggregationsOptions: {
      externalRefresh: false,
    },
  },

  // Override driver factory to skip timezone queries but keep connection working
  driverFactory: () => {
    const PostgresDriver = require('@cubejs-backend/postgres-driver');

    // Extend PostgresDriver to override prepareConnection
    class NoTimezonePostgresDriver extends PostgresDriver {
      // Override prepareConnection to skip SET TIME ZONE but do other setup
      async prepareConnection(conn, options = {}) {
        // Call parent's prepareConnection but catch timezone errors
        try {
          // Don't call parent - it tries to set timezone
          // Instead, just ensure connection is ready
          if (conn && typeof conn.query === 'function') {
            // Test connection with simple query instead of timezone setting
            await conn.query('SELECT 1');
          }
          return conn;
        } catch (error) {
          // If timezone setting fails, ignore it and continue
          console.log('Skipping timezone setup:', error.message);
          return conn;
        }
      }
    }

    return new NoTimezonePostgresDriver({
      host: process.env.CUBEJS_DB_HOST,
      database: process.env.CUBEJS_DB_NAME,
      port: parseInt(process.env.CUBEJS_DB_PORT, 10),
      user: process.env.CUBEJS_DB_USER,
      password: process.env.CUBEJS_DB_PASS,
    });
  },

  // External driver for pre-aggregations (uses same timezone fix)
  externalDriverFactory: () => {
    const PostgresDriver = require('@cubejs-backend/postgres-driver');

    class NoTimezonePostgresDriver extends PostgresDriver {
      async prepareConnection(conn, options = {}) {
        try {
          if (conn && typeof conn.query === 'function') {
            await conn.query('SELECT 1');
          }
          return conn;
        } catch (error) {
          console.log(
            'External driver - skipping timezone setup:',
            error.message,
          );
          return conn;
        }
      }
    }

    return new NoTimezonePostgresDriver({
      host: process.env.CUBEJS_EXT_DB_HOST || process.env.CUBEJS_DB_HOST,
      database: process.env.CUBEJS_EXT_DB_NAME || process.env.CUBEJS_DB_NAME,
      port: parseInt(
        process.env.CUBEJS_EXT_DB_PORT || process.env.CUBEJS_DB_PORT,
        10,
      ),
      user: process.env.CUBEJS_EXT_DB_USER || process.env.CUBEJS_DB_USER,
      password: process.env.CUBEJS_EXT_DB_PASS || process.env.CUBEJS_DB_PASS,
    });
  },
});

server
  .listen()
  .then(({ version, port }) => {
    console.log(`🚀 Cube.js server (${version}) is listening on ${port}`);
  })
  .catch((err) => {
    console.error('Fatal error during server start: ', err);
  });
