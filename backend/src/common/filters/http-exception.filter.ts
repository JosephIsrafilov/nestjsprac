import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let detail = 'Something went wrong';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        detail = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse) {
        const message =
          'message' in exceptionResponse
            ? exceptionResponse.message
            : undefined;

        if (Array.isArray(message)) {
          detail = message.join(', ');
        } else if (typeof message === 'string') {
          detail = message;
        }
      }
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    response.status(statusCode).json({ detail });
  }
}
