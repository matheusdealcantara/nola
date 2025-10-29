// Arquivo: apps/backend/schema/Categories.js

cube(`Categories`, {
  sql: `SELECT * FROM categories`,

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
      title: `Nome Categoria`,
    },
    type: {
      sql: `type`,
      type: `string`,
      title: `Tipo (Produto/Item)`, // 'P' ou 'I'
    },
  },
});
