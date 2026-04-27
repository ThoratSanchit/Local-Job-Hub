export const createJobSchema = {
  body: {
    type: 'object',
    required: ['title', 'description', 'category', 'price'],
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string', minLength: 1 },
      category: { type: 'string', minLength: 1 },
      price: { type: 'number', exclusiveMinimum: 0 },
      workers_required: { type: 'integer', minimum: 1 },
      urgent: { type: 'boolean' },
      expires_at: { type: 'string', format: 'date-time' },
    },
  },
};
