export class InternalError extends Error {
  constructor(cause?: unknown) {
    super('An internal error occurred.', { cause });
    this.name = 'InternalError';
  }
}

export class UnavailableServiceError extends Error {
  constructor(readonly error: string) {
    super(`Service Unavailable: ${error}`);
    this.name = 'UnavailableService';
  }
}

export class EntityNotFoundError extends Error {
  constructor(message: string);
  constructor(entityName: string, entityId: number | string);
  constructor(
    readonly messageOrEntityName: string,
    readonly entityId?: number | string,
  ) {
    super(
      entityId === undefined
        ? messageOrEntityName
        : `Entity ${messageOrEntityName} with ID ${entityId} not found.`,
    );
    this.name = 'EntityNotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(readonly error: string) {
    super(`Validation failed: ${error}`);
    this.name = 'ValidationError';
  }
}

export class ConflictException extends Error {
  constructor(readonly error: string) {
    super(`Conflict: ${error}`);
    this.name = 'ConflictException';
  }
}

export class CsvParserException extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'CsvParserException';
  }
}

export class DelimiterMismatchException extends CsvParserException {
  constructor(delimiter: string) {
    super(`File content does not match the provided delimiter: '${delimiter}'`);
    this.name = 'DelimiterMismatchException';
  }
}
