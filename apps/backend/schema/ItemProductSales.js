// Arquivo: apps/backend/schema/ItemProductSales.js

cube(`ItemProductSales`, {
  sql: `SELECT * FROM item_product_sales`,

  joins: {
    ProductSales: {
      sql: `${CUBE}.product_sale_id = ${ProductSales}.id`,
      relationship: `belongsTo`,
    },
    Items: {
      sql: `${CUBE}.item_id = ${Items}.id`,
      relationship: `belongsTo`,
    },
    OptionGroups: {
      sql: `${CUBE}.option_group_id = ${OptionGroups}.id`,
      relationship: `belongsTo`,
    },
  },

  measures: {
    count: {
      type: `count`,
      title: `Total de Itens Adicionados`,
    },
    quantity: {
      sql: `quantity`,
      type: `sum`,
      title: `Qtd. Itens Adicionados`,
    },
    revenueGenerated: {
      sql: `additional_price`,
      type: `sum`,
      format: `currency`,
      title: `Receita de Adicionais`,
    },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
  },
});
