cube(`product_sales`, {
  sql_table: `public.product_sales`,

  data_source: `default`,

  joins: {
    products: {
      sql: `${CUBE}.product_id = ${products.id}`,
      relationship: `many_to_one`,
    },

    sales: {
      sql: `${CUBE}.sale_id = ${sales.id}`,
      relationship: `many_to_one`,
    },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primary_key: true,
    },

    observations: {
      sql: `observations`,
      type: `string`,
    },

    created_at: {
      sql: `${sales.created_at}`,
      type: `time`,
    },
  },

  measures: {
    count: {
      type: `count`,
    },

    base_price: {
      sql: `base_price`,
      type: `sum`,
    },

    quantity: {
      sql: `quantity`,
      type: `sum`,
    },

    total_price: {
      sql: `total_price`,
      type: `sum`,
    },

    total_revenue: {
      sql: `total_price`,
      type: `sum`,
      format: `currency`,
    },

    total_quantity: {
      sql: `quantity`,
      type: `sum`,
    },
  },

  pre_aggregations: {
    // Pre-aggregation definitions go here.
    // Learn more in the documentation: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },
});
