// Arquivo: apps/backend/schema/Channels.js
cube(`Channels`, {
  sql: `SELECT * FROM channels`,

  measures: {
    count: { type: `count` },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    name: {
      sql: `name`, //
      type: `string`,
      title: `Nome do Canal`,
    },
    type: {
      sql: `type`, //
      type: `string`,
      title: `Tipo (Presencial/Delivery)`,
    },
  },
});
