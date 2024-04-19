import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TypeORMError } from 'typeorm';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  private logger = new Logger(ErrorsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        this.logger.warn('Intercepting error');

        return throwError(() => {
          if (error instanceof HttpException) {
            return error;
          }

          let message = error.message || 'Internal server error';
          let status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;

          if (error instanceof TypeORMError) {
            switch (error.name) {
              case 'EntityNotFoundError':
                message = 'Resource not found';
                status = HttpStatus.NOT_FOUND;
                break;

              case 'QueryFailedError':
                message = 'Query failed';
                status = HttpStatus.BAD_REQUEST;
                break;

              default:
                message = 'Query failed';
                status = HttpStatus.INTERNAL_SERVER_ERROR;
                break;
            }
          }

          return new HttpException(
            {
              message,
              status, // TO also send the status as part of resopnse body
              stack: error.stack,
            },
            status
          );
        });
      })
    );
  }
}
