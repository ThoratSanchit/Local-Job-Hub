class CustomError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'CustomError';
  }
}

export default CustomError;
