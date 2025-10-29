// @ts-nocheck
const CubejsServer = require('@cubejs-backend/server');

const server = new CubejsServer();

server
  .listen()
  .then(({ version, port }) => {
    console.log(`🚀 Cube.js server (${version}) is listening on ${port}`);
  })
  .catch((err) => {
    console.error('Fatal error during server start: ', err);
  });
