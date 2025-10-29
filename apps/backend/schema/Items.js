// Arquivo: apps/backend/schema/Items.js

cube(`Items`, {
  sql: `SELECT * FROM items`,

  joins: {
    Categories: {
      sql: `${CUBE}.category_id = ${Categories}.id`,
      relationship: `belongsTo`,
    },
  },

  measures: {
    count: {
      type: `count`,
    },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    name: {
      sql: `name`,
      type: `string`,
      title: `Nome do Item`,
    },
  },
});
