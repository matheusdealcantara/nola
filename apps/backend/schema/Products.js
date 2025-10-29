// Arquivo: apps/backend/schema/Products.js

cube(`Products`, {
  sql: `SELECT * FROM products`,

  joins: {
    Categories: {
      sql: `${CUBE}.category_id = ${Categories}.id`,
      relationship: `belongsTo`,
    },
  },

  measures: {
    count: {
      type: `count`,
      title: `Total de Produtos`,
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
      title: `Nome do Produto`,
    },
  },
});
