// Arquivo: apps/backend/schema/PaymentTypes.js

cube(`PaymentTypes`, {
  sql: `SELECT * FROM payment_types`,

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
    description: {
      sql: `description`,
      type: `string`,
      title: `Forma de Pagamento`,
    },
  },
});
