// Arquivo: apps/backend/schema/Customers.js

cube(`Customers`, {
  sql: `SELECT * FROM customers`,

  measures: {
    count: {
      type: `count`,
      title: `Total de Clientes`,
    },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    name: {
      sql: `customer_name`,
      type: `string`,
      title: `Nome do Cliente`,
    },
    birthDate: {
      sql: `birth_date`,
      type: `time`,
      title: `Data Nasc.`,
    },
    gender: {
      sql: `gender`,
      type: `string`,
      title: `Gênero`,
    },
  },
});
