export const submitReviewSchema = {
  body: {
    type: 'object',
    required: ['worker_id', 'rating'],
    properties: {
      worker_id: { type: 'string', format: 'uuid' },
      rating: { type: 'integer', minimum: 1, maximum: 5 },
      comment: { type: 'string', maxLength: 1000 },
    },
    additionalProperties: false,
  },
};

export const submitBulkReviewSchema = {
  body: {
    type: 'array',
    minItems: 1,
    items: {
      type: 'object',
      required: ['worker_id', 'rating'],
      properties: {
        worker_id: { type: 'string', format: 'uuid' },
        rating: { type: 'integer', minimum: 1, maximum: 5 },
        comment: { type: 'string', maxLength: 1000 },
      },
      additionalProperties: false,
    },
  },
};
