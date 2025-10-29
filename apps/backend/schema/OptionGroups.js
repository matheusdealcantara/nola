// Arquivo: apps/backend/schema/OptionGroups.js

cube(`OptionGroups`, {
  sql: `SELECT * FROM option_groups`,

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
      title: `Grupo de Opção`,
    },
  },
});
