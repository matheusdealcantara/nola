// Arquivo: apps/backend/schema/Sales.js

cube(`Sales`, {
  sql: `SELECT * FROM sales`,

  // Juntando com outras tabelas
  joins: {
    Channels: {
      sql: `${CUBE}.channel_id = ${Channels}.id`,
      relationship: `belongsTo`,
    },
    Stores: {
      sql: `${CUBE}.store_id = ${Stores}.id`,
      relationship: `belongsTo`,
    },
    Customers: {
      sql: `${CUBE}.customer_id = ${Customers}.id`,
      relationship: `belongsTo`,
    },

    // Tabelas "filhas"
    ProductSales: {
      sql: `${CUBE}.id = ${ProductSales}.sale_id`,
      relationship: `hasMany`,
    },
    Payments: {
      sql: `${CUBE}.id = ${Payments}.sale_id`,
      relationship: `hasMany`,
    },
    DeliverySales: {
      sql: `${CUBE}.id = ${DeliverySales}.sale_id`,
      relationship: `hasMany`,
    },
    DeliveryAddresses: {
      sql: `${CUBE}.id = ${DeliveryAddresses}.sale_id`,
      relationship: `hasMany`,
    },
  },

  // Métricas (O que queremos medir)
  measures: {
    count: {
      type: `count`,
      title: `Total de Vendas`,
    },
    totalRevenue: {
      sql: `total_amount`,
      type: `sum`,
      format: `currency`,
      title: `Receita Total`,
    },
    totalItemsValue: {
      sql: `total_amount_items`,
      type: `sum`,
      format: `currency`,
      title: `Valor em Itens`,
    },
    totalDiscounts: {
      sql: `total_discount`,
      type: `sum`,
      format: `currency`,
      title: `Total Descontos`,
    },
    totalDeliveryFee: {
      sql: `delivery_fee`,
      type: `sum`,
      format: `currency`,
      title: `Total Taxa Entrega`,
    },
    avgTicket: {
      sql: `total_amount`,
      type: `avg`,
      format: `currency`,
      title: `Ticket Médio`,
    },
    avgProductionTime: {
      sql: `production_seconds`,
      type: `avg`,
      title: `Tempo Médio de Preparo (seg)`,
    },
    avgDeliveryTime: {
      sql: `delivery_seconds`,
      type: `avg`,
      title: `Tempo Médio de Entrega (seg)`,
    },

    // Contagem de vendas canceladas
    cancelledCount: {
      type: `count`,
      title: `Vendas Canceladas`,
      filters: [{ sql: `${CUBE}.sale_status_desc = 'CANCELLED'` }],
    },
    // Taxa de cancelamento
    cancellationRate: {
      sql: `100.0 * ${cancelledCount} / ${count}`,
      type: `number`,
      format: `percent`,
      title: `Taxa de Cancelamento`,
    },
  },

  // Dimensões (Como queremos fatiar os dados)
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    status: {
      sql: `sale_status_desc`,
      type: `string`,
      title: `Status`,
    },
    createdAt: {
      sql: `created_at`,
      type: `time`,
      title: `Data da Venda`,
    },
    discountReason: {
      sql: `discount_reason`,
      type: `string`,
      title: `Motivo Desconto`,
    },
    peopleQuantity: {
      sql: `people_quantity`,
      type: `number`,
      title: `Pessoas na Mesa`,
    },
  },
});
