export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    type ErrorConstructorWithStackTrace = ErrorConstructor & {
      captureStackTrace?: (
        targetObject: object,
        constructorOption?: Function,
      ) => void;
    };

    const errorConstructor =
      Error as ErrorConstructorWithStackTrace;

    errorConstructor.captureStackTrace?.(
      this,
      this.constructor,
    );
  }
}