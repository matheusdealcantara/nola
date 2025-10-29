// Arquivo: apps/backend/schema/DeliverySales.js

cube(`DeliverySales`, {
  sql: `SELECT * FROM delivery_sales`,

  joins: {
    Sales: {
      sql: `${CUBE}.sale_id = ${Sales}.id`,
      relationship: `belongsTo`,
    },
  },

  measures: {
    count: {
      type: `count`,
      title: `Total de Entregas`,
    },
    totalDeliveryFee: {
      sql: `delivery_fee`,
      type: `sum`,
      format: `currency`,
      title: `Taxa de Entrega (Total)`,
    },
    totalCourierFee: {
      sql: `courier_fee`,
      type: `sum`,
      format: `currency`,
      title: `Custo Entregador (Total)`,
    },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    courierName: {
      sql: `courier_name`,
      type: `string`,
      title: `Nome Entregador`,
    },
    courierType: {
      sql: `courier_type`,
      type: `string`,
      title: `Tipo de Entregador`,
    },
    deliveryType: {
      sql: `delivery_type`,
      type: `string`,
      title: `Tipo de Entrega`,
    },
    status: {
      sql: `status`,
      type: `string`,
      title: `Status Entrega`,
    },
  },
});
