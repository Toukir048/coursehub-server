export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);

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