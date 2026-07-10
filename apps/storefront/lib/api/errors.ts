export class ApiError extends Error {
  constructor(public status: number, message: string, public cause?: string) {
    super(message);
    this.name = 'ApiError';
  }
}
