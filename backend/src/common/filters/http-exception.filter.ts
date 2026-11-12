import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // If response headers were already sent by raw target handlers, do not attempt to send again
    if (response.headersSent) {
      return;
    }

    const isHttpException =
      exception instanceof HttpException ||
      typeof (exception as any)?.getStatus === 'function';

    const status = isHttpException
      ? (exception as any).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';
    let errorDetails: unknown = undefined;

    if (isHttpException) {
      const res =
        typeof (exception as any).getResponse === 'function'
          ? (exception as any).getResponse()
          : (exception as any).message;
      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || (exception as any).message;
        errorDetails = resObj.error;
      } else {
        message = res;
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception at ${request.url}: ${exception.message}`,
        exception.stack,
      );
      // Don't leak raw unhandled error messages in production
      message =
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(errorDetails ? { error: errorDetails } : {}),
    });
  }
}
