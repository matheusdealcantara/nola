// Arquivo: apps/backend/schema/Payments.js

cube(`Payments`, {
  sql: `SELECT * FROM payments`,

  joins: {
    Sales: {
      sql: `${CUBE}.sale_id = ${Sales}.id`,
      relationship: `belongsTo`,
    },
    PaymentTypes: {
      sql: `${CUBE}.payment_type_id = ${PaymentTypes}.id`,
      relationship: `belongsTo`,
    },
  },

  measures: {
    count: {
      type: `count`,
      title: `Total de Transações`,
    },
    value: {
      sql: `value`,
      type: `sum`,
      format: `currency`,
      title: `Valor Transacionado`,
    },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    isOnline: {
      sql: `is_online`,
      type: `boolean`,
      title: `Pagamento Online`,
    },
  },
});
