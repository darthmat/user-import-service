import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import {
  EntityNotFoundError,
  InternalError,
  UnavailableServiceError,
  ValidationError,
} from './errors';

@Catch()
export class CustomErrorHandlerFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    if (exception instanceof HttpException) {
      void response.status(exception.getStatus()).send(exception.getResponse());
      return;
    }

    if (exception instanceof EntityNotFoundError) {
      void response
        .status(HttpStatus.NOT_FOUND)
        .send({ message: exception.message });
      return;
    }

    if (exception instanceof UnavailableServiceError) {
      void response
        .status(HttpStatus.SERVICE_UNAVAILABLE)
        .send({ message: exception.message });
      return;
    }

    if (exception instanceof InternalError) {
      void response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ message: exception.message });
      return;
    }

    if (exception instanceof ValidationError) {
      void response
        .status(HttpStatus.BAD_REQUEST)
        .send({ message: exception.message });
      return;
    }

    void response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      message: 'An unexpected error occurred.',
    });
  }
}
