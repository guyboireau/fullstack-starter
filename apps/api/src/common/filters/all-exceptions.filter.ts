import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<{ method: string; url: string }>();

    let statusCode: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exceptionResponse;
      } else {
        const responseObj = exceptionResponse as Record<string, unknown>;
        const msg = responseObj.message;
        message = Array.isArray(msg) ? msg.join(', ') : typeof msg === 'string' ? msg : exception.message;
        const err = responseObj.error;
        error = typeof err === 'string' ? err : exception.name;
      }

      this.logger.warn(`[${request.method}] ${request.url} ${statusCode} - ${message}`);
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';

      const stack = exception instanceof Error ? exception.stack : undefined;
      const errorMessage = exception instanceof Error ? exception.message : 'Unknown error';
      this.logger.error(`[${request.method}] ${request.url} ${statusCode} - ${errorMessage}`, stack);
    }

    const responseBody = {
      statusCode,
      message,
      error,
    };

    const response = ctx.getResponse();
    httpAdapter.reply(response, responseBody, statusCode);
  }
}