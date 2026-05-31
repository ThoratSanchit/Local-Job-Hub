export const createJobSchema = {
  body: {
    type: 'object',
    required: ['title', 'description', 'category', 'price'],
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string', minLength: 1 },
      category: { type: 'string', minLength: 1 },
      price: { type: 'number', exclusiveMinimum: 0 },
      min_price: { type: ['number', 'null'] },
      max_price: { type: ['number', 'null'] },
      payment_type: { type: ['string', 'null'] },
      work_duration: { type: ['string', 'null'] },
      start_date: { type: ['string', 'null'] },
      preferred_time: { type: ['string', 'null'] },
      preferred_time_from: { type: ['string', 'null'] },
      preferred_time_to: { type: ['string', 'null'] },
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
      city: { type: ['string', 'null'], minLength: 1 },
      area: { type: ['string', 'null'], minLength: 1 },
      pincode: { type: ['string', 'null'], minLength: 1 },
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
      min_price: { type: ['number', 'null'] },
      max_price: { type: ['number', 'null'] },
      payment_type: { type: ['string', 'null'] },
      work_duration: { type: ['string', 'null'] },
      start_date: { type: ['string', 'null'] },
      preferred_time: { type: ['string', 'null'] },
      preferred_time_from: { type: ['string', 'null'] },
      preferred_time_to: { type: ['string', 'null'] },
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
      city: { type: ['string', 'null'], minLength: 1 },
      area: { type: ['string', 'null'], minLength: 1 },
      pincode: { type: ['string', 'null'], minLength: 1 },
    },
    additionalProperties: false,
  },
};

export const getJobsSchema = {
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      cursor: { type: 'string', minLength: 1 },
      search: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
};

export const filterJobSchema = {
  body: {
    type: 'object',
    properties: {
      category: { type: 'string' },
      city: { type: 'string' },
      area: { type: 'string' },
      pincode: { type: 'string' },
      minSalary: { type: 'number' },
      maxSalary: { type: 'number' },
      workDuration: { type: 'string' },
      isUrgent: { type: 'boolean' },
      isNew: { type: 'boolean' },
      distance: { type: 'number' },
      latitude: { type: 'number' },
      longitude: { type: 'number' },
    },
    additionalProperties: false,
  },
};
