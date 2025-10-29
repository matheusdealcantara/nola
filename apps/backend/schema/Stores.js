// Arquivo: apps/backend/schema/Stores.js

cube(`Stores`, {
  sql: `SELECT * FROM stores`,

  measures: {
    count: {
      type: `count`,
      title: `Número de Lojas`,
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
      title: `Nome da Loja`,
    },
    city: {
      sql: `city`,
      type: `string`,
      title: `Cidade`,
    },
    state: {
      sql: `state`,
      type: `string`,
      title: `Estado`,
    },
    isActive: {
      sql: `is_active`,
      type: `boolean`,
      title: `Ativa`,
    },
    isOwn: {
      sql: `is_own`,
      type: `boolean`,
      title: `Loja Própria`,
    },
  },
});
