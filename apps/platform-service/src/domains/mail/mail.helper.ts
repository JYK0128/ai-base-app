export function describeMailError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const { message } = error as { message?: unknown };

    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Unknown error';
}
