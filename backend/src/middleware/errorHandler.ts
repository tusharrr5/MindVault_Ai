import { Request, Response, NextFunction } from 'express';

// Standardized error format ensuring we don't leak stack traces to the client
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${err.message}`, err.stack); // Log internally

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;

  res.status(statusCode).json({
    error: true,
    code: err.code || 'UNKNOWN_ERROR',
    message,
  });
};
