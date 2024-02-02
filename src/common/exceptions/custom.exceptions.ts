import {
  HttpException,
  HttpStatus,
  HttpExceptionOptions,
} from '@nestjs/common';

export class TooManyRequestsException extends HttpException {
  constructor(
    messageOrObject: string | Record<string, any>,
    descriptionOrOptions?: string | HttpExceptionOptions,
  ) {
    const status =
      typeof descriptionOrOptions === 'number'
        ? descriptionOrOptions
        : HttpStatus.TOO_MANY_REQUESTS;

    super(
      typeof messageOrObject === 'string'
        ? { message: messageOrObject }
        : (messageOrObject as Record<string, any>),
      status,
    );
  }
}
