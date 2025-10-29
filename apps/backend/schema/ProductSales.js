// Arquivo: apps/backend/schema/ProductSales.js

cube(`ProductSales`, {
  sql: `SELECT * FROM product_sales`,

  joins: {
    Sales: {
      sql: `${CUBE}.sale_id = ${Sales}.id`,
      relationship: `belongsTo`,
    },
    Products: {
      sql: `${CUBE}.product_id = ${Products}.id`,
      relationship: `belongsTo`,
    },
    // Junção para "filhos" (customizações)
    ItemProductSales: {
      sql: `${CUBE}.id = ${ItemProductSales}.product_sale_id`,
      relationship: `hasMany`,
    },
  },

  measures: {
    count: {
      type: `count`,
      title: `Linhas de Produto Vendidas`,
    },
    quantity: {
      sql: `quantity`,
      type: `sum`,
      title: `Unidades Vendidas`,
    },
    totalPrice: {
      sql: `total_price`,
      type: `sum`,
      format: `currency`,
      title: `Receita (Prod. c/ Itens)`,
    },
    basePrice: {
      sql: `base_price`,
      type: `sum`,
      format: `currency`,
      title: `Receita (Prod. Base)`,
    },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    observations: {
      sql: `observations`,
      type: `string`,
      title: `Observações`,
    },
  },
});
