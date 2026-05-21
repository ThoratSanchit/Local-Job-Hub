export const createJobSchema = {
  body: {
    type: 'object',
    required: ['title', 'description', 'category', 'price'],
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string', minLength: 1 },
      category: { type: 'string', minLength: 1 },
      price: { type: 'number', exclusiveMinimum: 0 },
      payment_type: { type: ['string', 'null'] },
      work_duration: { type: ['string', 'null'] },
      start_date: { type: ['string', 'null'] },
      preferred_time: { type: ['string', 'null'] },
      full_address: { type: ['string', 'null'] },
      latitude: { type: ['number', 'null'] },
      longitude: { type: ['number', 'null'] },
      workers_required: { type: 'integer', minimum: 1 },
      urgent: { type: 'boolean' },
      expires_at: { type: 'string', format: 'date-time' },
      need_workers_immediately: { type: 'boolean' },
      requirements: {
        anyOf: [
          {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
          { type: 'null' },
        ],
      },
      city: { type: 'string', minLength: 1 },
      area: { type: 'string', minLength: 1 },
    },
  },
};

export const updateJobSchema = {
  body: {
    type: 'object',
    minProperties: 1,
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string', minLength: 1 },
      category: { type: 'string', minLength: 1 },
      price: { type: 'number', exclusiveMinimum: 0 },
      payment_type: { type: ['string', 'null'] },
      work_duration: { type: ['string', 'null'] },
      start_date: { type: ['string', 'null'] },
      preferred_time: { type: ['string', 'null'] },
      full_address: { type: ['string', 'null'] },
      latitude: { type: ['number', 'null'] },
      longitude: { type: ['number', 'null'] },
      workers_required: { type: 'integer', minimum: 1 },
      urgent: { type: 'boolean' },
      expires_at: {
        anyOf: [
          { type: 'string', format: 'date-time' },
          { type: 'null' },
        ],
      },
      need_workers_immediately: { type: 'boolean' },
      requirements: {
        anyOf: [
          {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
          { type: 'null' },
        ],
      },
      city: { type: 'string', minLength: 1 },
      area: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
};

export const searchJobSchema = {
  body: {
    type: 'object',
    properties: {
      keyword: { type: 'string' },
      category: { type: 'string' },
      city: { type: 'string' },
      area: { type: 'string' },
    },
    additionalProperties: false,
  },
};
