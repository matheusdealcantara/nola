// @ts-nocheck
require('dotenv').config();

const CubejsServer = require('@cubejs-backend/server');
const { PostgresDriver } = require('@cubejs-backend/postgres-driver');

const server = new CubejsServer({
  // Disable Cube SQL API to free up port 15432 for the SSH tunnel
  sqlPort: false,
  pgSqlPort: false,
  apiSecret: process.env.CUBEJS_API_SECRET,

  // Configure Cube.js to connect to your PostgreSQL database via the SSH tunnel
  driverFactory: (options) =>
    new PostgresDriver({
      ...options,
      host: process.env.CUBEJS_DB_HOST,
      database: process.env.CUBEJS_DB_NAME,
      port: parseInt(process.env.CUBEJS_DB_PORT, 10),
      user: process.env.CUBEJS_DB_USER,
      password: process.env.CUBEJS_DB_PASS,
    }),
});

server
  .listen()
  .then(({ version, port }) => {
    console.log(`🚀 Cube.js server (${version}) is listening on ${port}`);
  })
  .catch((err) => {
    console.error('Fatal error during server start: ', err);
  });
