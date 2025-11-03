cube(`option_groups`, {
  sql_table: `public.option_groups`,

  joins: {
    items: {
      sql: `${CUBE}.id = ${items}.option_group_id`,
      relationship: `hasMany`,
    },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primary_key: true,
    },

    name: {
      sql: `name`,
      type: `string`,
    },

    pos_uuid: {
      sql: `pos_uuid`,
      type: `string`,
    },

    deleted_at: {
      sql: `deleted_at`,
      type: `time`,
    },
  },

  measures: {
    count: {
      type: `count`,
    },
  },

  pre_aggregations: {
    // Pre-aggregation definitions go here.
    // Learn more in the documentation: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },
});
