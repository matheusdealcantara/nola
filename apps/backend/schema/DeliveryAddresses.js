// Arquivo: apps/backend/schema/DeliveryAddresses.js

cube(`DeliveryAddresses`, {
  sql: `SELECT * FROM delivery_addresses`,

  joins: {
    Sales: {
      sql: `${CUBE}.sale_id = ${Sales}.id`,
      relationship: `belongsTo`,
    },
  },

  measures: {
    count: {
      type: `count`,
      title: `Total de Endereços`,
    },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    neighborhood: {
      sql: `neighborhood`,
      type: `string`,
      title: `Bairro`,
    },
    city: {
      sql: `city`,
      type: `string`,
      title: `Cidade`,
    },
    state: {
      sql: `state`,
      type: `string`,
      title: `Estado`,
    },
    postalCode: {
      sql: `postal_code`,
      type: `string`,
      title: `CEP`,
    },

    // Dimensão especial para mapas
    location: {
      sql: `ARRAY[${CUBE}.longitude, ${CUBE}.latitude]`,
      type: `geo`,
      title: `Localização`,
    },
  },
});
