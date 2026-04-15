export class ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  accessToken?: string;

  constructor(
    statusCode: number = 500,
    message: string = 'Success',
    data?: T,
    accessToken?: string
  ) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.accessToken = accessToken;
  }
}

export class ApiError extends Error {
  success: boolean;
  statusCode: number;
  details?: [];
  errors?: { field: string; message: string }[];
  isOperational: boolean;

  constructor(
    statusCode: number = 500,
    message: string = 'Something went wrong',
    details?: any,
    errors?: { field: string; message: string }[]
  ) {
    super(message);
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
