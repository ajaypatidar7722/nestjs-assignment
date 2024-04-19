import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TypeORMError } from 'typeorm';

interface ErrorResponse {
  message: string;
  status: number;
  stack?: string;
}

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  private logger = new Logger(ErrorsInterceptor.name);

  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        this.logger.warn('Intercepting error');

        return throwError(() => {
          if (error instanceof HttpException) {
            return error;
          }

          const response: ErrorResponse = {
            message: error.message || 'Internal server error',
            status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          };

          if (this.configService.get('app.env') !== 'production') {
            response.stack = error.stack;
          }

          if (error instanceof TypeORMError) {
            switch (error.name) {
              case 'EntityNotFoundError':
                response.message = 'Resource not found';
                response.status = HttpStatus.NOT_FOUND;
                break;

              case 'QueryFailedError':
              case 'UpdateValuesMissingError':
                response.message = 'Query failed';
                response.status = HttpStatus.BAD_REQUEST;
                break;

              default:
                response.message = 'Query failed';
                response.status = HttpStatus.INTERNAL_SERVER_ERROR;
                break;
            }
          }

          this.logger.error(error);
          return new HttpException(response, response.status);
        });
      })
    );
  }
}
