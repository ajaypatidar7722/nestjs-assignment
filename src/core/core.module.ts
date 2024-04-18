import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { configurationLoader } from './app-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurationLoader],
    }),
    TypeOrmModule.forRootAsync({
      name: 'petStore',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('db.pg.host'),
        port: configService.get('db.pg.port'),
        username: configService.get('db.pg.username'),
        password: configService.get('db.pg.password'),
        database: configService.get('db.pg.database'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class CoreModule {}
